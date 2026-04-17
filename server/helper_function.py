import os
import base64
import subprocess
import shutil
from io import BytesIO
import logging

try:
    import imageio_ffmpeg
except ImportError:
    imageio_ffmpeg = None


def resolve_ffmpeg_binary():
    candidates = [
        os.getenv("FFMPEG_BINARY"),
        shutil.which("ffmpeg"),
    ]

    if imageio_ffmpeg is not None:
        try:
            candidates.append(imageio_ffmpeg.get_ffmpeg_exe())
        except Exception:
            pass

    for candidate in candidates:
        if candidate:
            return candidate

    return "ffmpeg"

def convert_blob_to_mp4(blob, email, logger: logging.Logger):
    # try:
    #     # Decode base64 data
    #     binary_data = base64.b64decode(blob)
        
    #     # Convert binary data to a BytesIO object
    #     # blob_data = BytesIO(binary_data)
        
    #     # Save the BytesIO object to a file
    #     with open('input.webm', 'wb') as f:
    #         f.write(blob)

    #     # Perform the conversion to .mp4 using ffmpeg or another tool
    #     # Make sure you have ffmpeg installed on your system
    #     current_file_path = os.path.abspath(__file__)
    #     process = subprocess.run(['ffmpeg', '-i', 'input.webm', fileName])

    #     # Read the content of the converted .mp4 file

    #     try:
    #         with open(fileName, 'rb') as mp4_file:
    #             mp4_content = mp4_file.read()
    #     except Exception as e:
    #         print("Error reading")
        
    #     # Send the .mp4 content as a response
    #     return BytesIO(mp4_content), 200, 'Video converted to mp4'

    # except Exception as e:
    #     logger.debug(e)
    #     return None, 500, 'Error in conversion video from blob to mp4'
    
    try:
        fileName = r"video_" + email + ".mp4"
        print(fileName)

        # # Check if the output file exists, delete it if it does
        # if os.path.exists(fileName):
        #     os.remove(fileName)

        # Run ffmpeg command to convert webm to mp4
            
        ffmpeg_binary = resolve_ffmpeg_binary()
        process = subprocess.run(
            [ffmpeg_binary, '-y', '-i', blob, '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', fileName],
            capture_output=True,
            text=True,
            check=True,
        )
        logger.debug(process.stdout)
        logger.debug(process.stderr)
        try:
            with open(fileName, 'rb') as mp4_file:
                mp4_content = mp4_file.read()
        except Exception as e:
            print(e)


        return BytesIO(mp4_content), 200, 'Video converted to mp4'


    except Exception as e:
        logger.debug(e)
        return None, 500, 'Error in conversion video from blob to mp4'

 

def delete_file(file_path):
    try:
        os.remove(file_path)
        print(f"File deleted: {file_path}")
    except Exception as e:
        print(f"Error deleting file {file_path}: {str(e)}")
