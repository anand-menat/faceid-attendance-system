import face_recognition
import numpy as np
import cv2
import logging

logger = logging.getLogger(__name__)

def encode_face(image_bytes: bytes) -> list:
    """
    Takes an image in bytes, detects the face and returns its 128-dimensional embedding.
    Returns None if no face is found, multiple faces are found, or the image is invalid.
    """
    try:
        # Convert bytes to numpy array then to an opencv image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            logger.error("Failed to decode image — file may be corrupt or unsupported format.")
            return None

        # Convert to RGB (face_recognition expects RGB)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Find face locations
        face_locations = face_recognition.face_locations(rgb_img)

        if len(face_locations) != 1:
            logger.warning(f"Expected exactly 1 face, found {len(face_locations)}.")
            return None

        # Get the face encoding
        encodings = face_recognition.face_encodings(rgb_img, face_locations)

        if not encodings:
            logger.warning("face_encodings returned empty despite face_locations being present.")
            return None

        # Convert numpy array to list for JSON serialization
        return encodings[0].tolist()

    except Exception as e:
        logger.error(f"Error encoding face: {e}")
        return None

def recognize_face(image_bytes: bytes, known_encodings_dict: dict, tolerance=0.5):
    """
    Takes an image, compares it against known encodings, and returns the ID of the matched person.
    known_encodings_dict should be a dict of {student_id: encoding_list}
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            logger.error("Failed to decode frame for recognition.")
            return None

        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_img)
        if not face_locations:
            return None

        encodings = face_recognition.face_encodings(rgb_img, face_locations)
        if not encodings:
            return None

        # Use the first detected face
        unknown_encoding = encodings[0]

        student_ids = list(known_encodings_dict.keys())
        known_encodings = [np.array(enc) for enc in known_encodings_dict.values()]

        if not known_encodings:
            return None

        # Compare
        matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=tolerance)
        face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)

        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            logger.info(f"Face matched to student ID: {student_ids[best_match_index]}")
            return student_ids[best_match_index]

        return None

    except Exception as e:
        logger.error(f"Error recognizing face: {e}")
        return None
