import json
import base64
import logging

import cv2
import numpy as np
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from services.face_recognition.check import take_face
from apps.accounts.models import StudentClass

logger = logging.getLogger(__name__)


class VideoAttendanceConsumer(AsyncWebsocketConsumer):
    """Browser-driven face-recognition attendance.

    The teacher's webcam is captured in the browser (getUserMedia) and JPEG frames
    are streamed here over the WebSocket. The server runs face recognition on each
    frame and replies with detected, enrolled students. No server-side camera is
    used, so this works on a headless deploy host.
    """

    async def connect(self):
        logger.info("WebSocket connect: %s", self.scope.get("path"))
        self.course_id = None
        self.detected_students = set()
        self._busy = False  # single in-flight recognition (backpressure)
        await self.accept()
        logger.debug("WebSocket accepted, state initialized")

    async def disconnect(self, close_code):
        logger.info("WebSocket disconnect, code=%s", close_code)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            logger.warning("WebSocket received malformed payload")
            return

        msg_type = data.get("type")

        if msg_type == "start_stream":
            self.course_id = data.get("courseid")
            self.detected_students.clear()
            logger.info("Stream started for course_id=%s", self.course_id)
            await self.send(text_data=json.dumps({"type": "stream_started"}))

        elif msg_type == "frame":
            await self._handle_frame(data.get("data"))

        elif msg_type == "stop_stream":
            self.detected_students.clear()
            logger.info("Stream stopped for course_id=%s", self.course_id)
            await self.send(text_data=json.dumps({"type": "stream_stopped"}))

    async def _handle_frame(self, payload):
        # Drop frames that arrive while a recognition is still running. Keeps the
        # CPU from backing up and bounds memory under a fast browser send rate.
        if self._busy or not payload or self.course_id is None:
            return

        self._busy = True
        try:
            result = await database_sync_to_async(self._recognize, thread_sensitive=False)(payload)
            if not result:
                return

            name, similarity = result
            student_class = await self.get_student(name, self.course_id)
            if student_class is None:
                return

            sid = student_class.student.id
            if sid in self.detected_students:
                return

            self.detected_students.add(sid)
            logger.info("Student detected: %s (similarity=%.3f)", name, similarity)
            await self.send(text_data=json.dumps({
                "type": "student_detected",
                "student": {
                    "id": sid,
                    "name": student_class.student.name,
                    "similarity": similarity,
                },
            }))
        except Exception:  # never let one bad frame kill the socket
            # A single corrupt/transient frame is dropped silently; the next frame
            # arrives ~350ms later. Logged for diagnostics, not surfaced to the user.
            logger.exception("Frame processing failed; dropping frame")
        finally:
            self._busy = False

    @staticmethod
    def _recognize(payload):
        """Decode a base64 JPEG data URL and run face recognition (runs off-loop).

        Returns (name, similarity) for a confident, known match, else None.
        """
        b64 = payload.split(",", 1)[1] if "," in payload else payload
        buf = np.frombuffer(base64.b64decode(b64), dtype=np.uint8)
        frame = cv2.imdecode(buf, cv2.IMREAD_COLOR)
        if frame is None:
            return None

        result = take_face(frame)
        if not result or ":" not in result:
            return None

        name, similarity = result.split(":", 1)
        name = name.strip()
        if name == "Unknown":
            return None
        return name, float(similarity.strip())

    @database_sync_to_async
    def get_student(self, name, course_id):
        # Match the recognised label to a student enrolled in this course, tolerant
        # of case and surrounding whitespace (labels come from training folder names).
        return (
            StudentClass.objects
            .filter(course_id=course_id, student__name__iexact=name.strip())
            .select_related("student")
            .first()
        )
