import cv2
import dlib
import numpy as np
import pickle
import logging

def func(email, logger: logging.Logger):
    try:
        detector = dlib.get_frontal_face_detector()

        predictor = dlib.shape_predictor('./shape_predictor_68_face_landmarks.dat')

        cap = cv2.VideoCapture('./video_' + email + '.mp4')

        arr = []
        cnt = 0
        while cap.isOpened():
            # Read a frame from the video
            ret, frame = cap.read()
        #     if cnt == 1000:
        #         break
            if not ret:
                break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # Detect the face
            rects = detector(gray, 1)
            # Detect landmarks for each face
            for rect in rects:
                # print(cnt)
                # Get the landmark points
                shape = predictor(gray, rect)
                # Convert it to the NumPy Array
                shape_np = np.zeros((68, 2), dtype="float")
                arr_x = []
                arr_y = []
                for i in range(0, 68):
                    shape_np[i] = (shape.part(i).x, shape.part(i).y)
                    arr_x.append(shape.part(i).x)
                    arr_y.append(shape.part(i).y)
                shape = shape_np
                x_y = np.concatenate((arr_x,arr_y))
                arr.append(x_y)
        #         for i, (x, y) in enumerate(shape):
        #            # Draw the circle to mark the keypoint
        #             cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)

        #     # Display the image
        #     imS = cv2.resize(frame, (960, 540))
            cnt += 1
        #     cv2.imshow('Landmark Detection', imS)
        #     if cv2.waitKey(0) == 27:
        #         break

        cap.release()
        cv2.destroyAllWindows()

        arr = np.array(arr)
        print(arr.shape)
        
        return arr, 200, "Facial Features generated successfully"
    
    except Exception as Ex:
        logger.debug('Error in generating facial features.')
        return None, 500, "Error in generating facial features."

    

def get_facial_features(email, logger: logging.Logger):
    arr, code, message = func(email, logger)
    return arr, code, message

