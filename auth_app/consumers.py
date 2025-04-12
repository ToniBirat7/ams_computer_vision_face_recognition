import json
import asyncio
import cv2
import numpy as np
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
from Face_Rec.check import take_face
from auth_app.models import Student, Course, StudentClass
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)

class VideoAttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("WebSocket connect attempt")
        logger.info("Attempting to connect to WebSocket")
        try:
            await self.accept()
            print("WebSocket connection accepted")
            logger.info("WebSocket connection accepted")
            
            # Don't initialize camera here, wait for start_stream command
            self.camera = None
            self.detected_students = set()  # Keep track of detected students
            
        except Exception as e:
            print(f"Error in connect: {str(e)}")
            logger.error(f"Error in WebSocket connection: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        if hasattr(self, 'camera') and self.camera:
            self.camera.release()

    async def process_frames(self):
        try:
            while True:
                # Read frame from camera
                ret, frame = self.camera.read()
                if not ret:
                    logger.error("Failed to grab frame")
                    break

                # Process frame with face recognition
                result = take_face(frame)

                print("result",result)

                # Encode frame to send to client
                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')

                if result and ':' in result:
                    name, similarity = result.split(':')
                    name = name.strip()
                    similarity = float(similarity.strip())

                    if name != 'Unknown':  # Threshold check
                        # Try to find the student in the database
                        try:
                            curr_courseid = self.course_id

                            student = await self.get_student(name, curr_courseid)
                            print("The course id in process frame is ", self.course_id)

                            if not student:
                                print(f"Student with {name} and course id {curr_courseid} is not found stu {student}")
                            else:
                                print("\nThe student is ", student)

                            print(f"Student ID: {student.id}, Already detected: {student.id in self.detected_students}")
                            if student and student.id not in self.detected_students:
                                self.detected_students.add(student.id)
                                # Send student detection update
                                await self.send(text_data=json.dumps({
                                    'type': 'frame_update',
                                    'frame': f'data:image/jpeg;base64,{frame_base64}',
                                    'student': {
                                        'id': student.student.id,
                                        'name': student.student.name,
                                        'similarity': similarity,
                                    }
                                }))
                            else:
                                await self.send(text_data=json.dumps({
                                    'type': 'already_detected',
                                    'frame': f'data:image/jpeg;base64,{frame_base64}',
                                    # 'recognition_result': result if result else 'No face detected'
                                }))
                        except Exception as e:
                            print(f"Error while sending frame_update: {e}")
                            logger.error(f"Error sending frame_update: {str(e)}")
                    else:
                        # Send frame and recognition results to client
                        await self.send(text_data=json.dumps({
                            'type': 'no_detected',
                            'frame': f'data:image/jpeg;base64,{frame_base64}',
                            'recognition_result': result if result else 'No face detected'
                        }))

                        # Add a small delay to control frame rate
                    await asyncio.sleep(0.1)  # 10 FPS

        except Exception as e:
            logger.error(f"Error in process_frames: {str(e)}")
        finally:
            if hasattr(self, 'camera'):
                self.camera.release()

    @database_sync_to_async
    def get_student(self, name, course_id):
        try:
            course = Course.objects.get(id=course_id)
            student = Student.objects.get(name=name)
            student_class = StudentClass.objects.filter(course=course, student=student).select_related('student').first()
            return student_class  # Returns None if not found
        except Student.DoesNotExist:
            return None
        except Course.DoesNotExist:
            return None

    async def receive(self, text_data):
        print(f"Received message: {text_data}")
        try:
            data = json.loads(text_data)
            if data.get('type') == 'start_stream':
                self.course_id = data.get('courseid')
                print("The course ID is:", self.course_id)
                # Initialize camera only when streaming starts
                if not self.camera:
                    self.camera = cv2.VideoCapture(0)
                    if not self.camera.isOpened():
                        raise Exception("Could not open camera")
                    self.detected_students.clear()  # Reset detected students
                    asyncio.create_task(self.process_frames())
            elif data.get('type') == 'stop_stream':
                if self.camera:
                    self.camera.release()
                    self.camera = None

        except Exception as e:
            print(f"Error in receive: {str(e)}")
            logger.error(f"Error processing message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))