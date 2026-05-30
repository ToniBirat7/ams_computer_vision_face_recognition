import json
import asyncio
import cv2
import numpy as np
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
from services.face_recognition.check import take_face
from apps.accounts.models import Student, Course, StudentClass
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class VideoAttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("WebSocket connect: %s", self.scope.get("path"))
        try:
            await self.accept()
            self.camera = None
            self.detected_students = set()
            logger.debug("WebSocket accepted, state initialized")
        except Exception as e:
            logger.error("WebSocket connect error: %s", e)
            await self.close()

    async def disconnect(self, close_code):
        logger.info("WebSocket disconnect, code=%s", close_code)
        if hasattr(self, 'camera') and self.camera:
            self.camera.release()

    async def process_frames(self):
        try:
            while True:
                ret, frame = self.camera.read()
                if not ret:
                    logger.error("Camera: failed to grab frame")
                    break

                result = take_face(frame)

                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')

                if result and ':' in result:
                    name, similarity = result.split(':')
                    name = name.strip()
                    similarity = float(similarity.strip())

                    if name != 'Unknown':
                        try:
                            student = await self.get_student(name, self.course_id)
                            if student and student.student.id not in self.detected_students:
                                self.detected_students.add(student.student.id)
                                logger.info("Student detected: %s (similarity=%.3f)", name, similarity)
                                await self.send(text_data=json.dumps({
                                    'type': 'student_detected',
                                    'frame': f'data:image/jpeg;base64,{frame_base64}',
                                    'student': {
                                        'id': student.student.id,
                                        'name': student.student.name,
                                        'similarity': similarity,
                                    }
                                }))
                            else:
                                await self.send(text_data=json.dumps({
                                    'type': 'frame_update',
                                    'frame': f'data:image/jpeg;base64,{frame_base64}',
                                }))
                        except Exception as e:
                            logger.error("Error processing detection: %s", e)
                    else:
                        await self.send(text_data=json.dumps({
                            'type': 'no_detected',
                            'frame': f'data:image/jpeg;base64,{frame_base64}',
                            'recognition_result': result if result else 'No face detected'
                        }))

                await asyncio.sleep(0.1)  # 10 FPS

        except Exception as e:
            logger.error("process_frames error: %s", e)
        finally:
            if hasattr(self, 'camera') and self.camera:
                self.camera.release()

    @database_sync_to_async
    def get_student(self, name, course_id):
        try:
            course = Course.objects.get(id=course_id)
            student = Student.objects.get(name=name)
            return StudentClass.objects.filter(
                course=course, student=student
            ).select_related('student').first()
        except (Student.DoesNotExist, Course.DoesNotExist):
            return None

    async def receive(self, text_data):
        logger.debug("WebSocket receive: %s", text_data[:200])
        try:
            data = json.loads(text_data)
            if data.get('type') == 'start_stream':
                self.course_id = data.get('courseid')
                self.detected_students.clear()
                logger.info("Stream started for course_id=%s", self.course_id)

                if not self.camera:
                    self.camera = cv2.VideoCapture(0)
                    if not self.camera.isOpened():
                        raise RuntimeError("Could not open camera device")
                    asyncio.create_task(self.process_frames())
                else:
                    logger.debug("Camera already open, reusing stream")

            elif data.get('type') == 'stop_stream':
                if self.camera:
                    self.camera.release()
                    self.camera = None
                logger.info("Stream stopped for course_id=%s", getattr(self, 'course_id', None))

        except Exception as e:
            logger.error("receive error: %s", e)
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))
