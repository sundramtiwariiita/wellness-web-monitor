import cv2
import dlib
import numpy as np
import imutils
import cv2
import logging

def func(email, logger: logging.Logger):
    try:
        # Load the video
        video_path = './video_' + email + '.mp4'
        cap = cv2.VideoCapture(video_path)


        # Initialize the face detector and landmark predictor
        detector = dlib.get_frontal_face_detector()
        predictor = dlib.shape_predictor('./shape_predictor_68_face_landmarks.dat')

        model_points = np.array([
            (0.0, 0.0, 0.0),            # Nose tip
            (0.0, -330.0, -65.0),       # Chin
            (-225.0, 170.0, -135.0),    # Left eye corner
            (225.0, 170.0, -135.0),     # Right eye corner
            (-150.0, -150.0, -125.0),   # Left mouth corner
            (150.0, -150.0, -125.0)     # Right mouth corner
        ], dtype="double")

        translation_rotation_data = []

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            # Convert the frame to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Detect faces in the grayscale frame
            faces = detector(gray)

            for face in faces:
                # Get the facial landmarks for the face region
                landmarks = predictor(gray, face)

                # Calculate the translation vector (head position)
                translation_vector = (face.left(), face.top())

                # Calculate head pose angles (yaw, pitch, roll)
                image_points = np.array([
                    (landmarks.part(30).x, landmarks.part(30).y),  # Nose tip
                    (landmarks.part(8).x, landmarks.part(8).y),    # Chin
                    (landmarks.part(36).x, landmarks.part(36).y),  # Left eye corner
                    (landmarks.part(45).x, landmarks.part(45).y),  # Right eye corner
                    (landmarks.part(48).x, landmarks.part(48).y),  # Left mouth corner
                    (landmarks.part(54).x, landmarks.part(54).y)   # Right mouth corner
                ], dtype="double")

                # Camera parameters (you may need to adjust these)
                focal_length = frame.shape[1]
                center = (frame.shape[1] / 2, frame.shape[0] / 2)
                camera_matrix = np.array([[focal_length, 0, center[0]],
                                        [0, focal_length, center[1]],
                                        [0, 0, 1]], dtype="double")

                dist_coeffs = np.zeros((4, 1))  # Assuming no lens distortion

                # Estimate head pose
                (success, rotation_vector, translation_vector) = cv2.solvePnP(
                    model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)

                # Convert rotation vector to Euler angles
                (yaw, pitch, roll) = [x[0] for x in cv2.Rodrigues(rotation_vector)[0]]

                # Append the translation, yaw, pitch, and roll to the list
                translation_rotation_data.append((translation_vector[0][0],translation_vector[1][0],translation_vector[2][0], pitch ,yaw, roll))

        # Convert translation and rotation data to a NumPy array
        translation_rotation_data = np.array(translation_rotation_data)

        # Release video capture
        cap.release()
        cv2.destroyAllWindows()

        print(translation_rotation_data.shape)
        return translation_rotation_data, 200, "translation_rotation_data generated successfully"
    except:
        logger.debug("failed to generate translation_rotation_data")
        None, 500, "failed to generate translation_rotation_data"

def get_pose_data(email, logger: logging.Logger):
    translation_rotation_data, code, msg = func(email, logger)
    return translation_rotation_data, code ,msg