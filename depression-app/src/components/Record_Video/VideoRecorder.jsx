import { useEffect, useRef, useState } from "react";
import './VideoRecorder.css'
import Loader from "react-js-loader";
const mimeType = 'video/webm; codecs="opus,vp8"';
import { convertVideo } from "../../services/Api";
import { useNavigate } from "react-router-dom";
import { getStoredUserEmail } from "../../utils/userSession";

const VideoRecorder = () => {
	
	const [permission, setPermission] = useState(false);
	const mediaRecorder = useRef(null);
	const liveVideoFeed = useRef(null);
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [stream, setStream] = useState(null);
	const [recordedVideo, setRecordedVideo] = useState(null);
	const [videoChunks, setVideoChunks] = useState([]);
	const [displayCameraOption, setDisplayCameraOption] = useState(true);
	const [getPredictions, setGetPredictions] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadStatus, setUploadStatus] = useState("Preparing upload...");
	const navigate = useNavigate();

	useEffect(() => {
		return () => {
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [stream]);

	const getCameraPermission = async () => {
		setRecordedVideo(null);
		setUploadProgress(0);
		setUploadStatus("Preparing upload...");
		if (!window.isSecureContext && window.location.hostname !== "localhost") {
			window.alert("Camera and microphone access requires HTTPS or localhost. Open this page over HTTPS on the live site or use localhost for local testing.");
			return;
		}

		//get video and audio permissions and then stream the result media stream to the videoSrc variable
		if ("MediaRecorder" in window) {
			try {
				const videoConstraints = {
					audio: false,
					video: true,
				};
				const audioConstraints = { audio: true };

				// create audio and video streams separately
				const audioStream = await navigator.mediaDevices.getUserMedia(
					audioConstraints
				);
				const videoStream = await navigator.mediaDevices.getUserMedia(
					videoConstraints
				);

				setPermission(true);

				//combine both audio and video streams

				const combinedStream = new MediaStream([
					...videoStream.getVideoTracks(),
					...audioStream.getAudioTracks(),
				]);

				setStream(combinedStream);

				//set videostream to live feed player
				liveVideoFeed.current.srcObject = videoStream;
			} catch (err) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

	const startRecording = async () => {
		if (!stream) {
			window.alert("Please turn on the camera before starting a recording.");
			return;
		}

		setRecordingStatus("recording");

		const media = new MediaRecorder(stream, { mimeType });
		mediaRecorder.current = media;
		mediaRecorder.current.start();

		let localVideoChunks = [];
		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			localVideoChunks.push(event.data);
		};

		setVideoChunks(localVideoChunks);
	};

	const stopRecording = async () => {
		setPermission(false);
		setRecordingStatus("inactive");
		if (mediaRecorder.current) {
			mediaRecorder.current.onstop = () => {
			const videoBlob = new Blob(videoChunks, { type: mimeType });
			const videoUrl = URL.createObjectURL(videoBlob);

			setRecordedVideo(videoUrl);

			setVideoChunks([]);
			};
			mediaRecorder.current.stop();
		}
		setDisplayCameraOption(false);

		stream?.getTracks().forEach((track) => track.stop());
		setStream(null);
		if (liveVideoFeed.current) {
			liveVideoFeed.current.srcObject = null;
		}
	};

	const downloadVideo = async () => {
		try {
			const email = getStoredUserEmail();
			if (!email) {
				window.alert("Your session was not found. Please log in again before uploading a recording.");
				navigate("/login");
				return;
			}

			const videoUrl = recordedVideo;
			const response = await fetch(videoUrl);
			const blob = await response.blob();
			setGetPredictions(true);
			setUploadProgress(0);
			setUploadStatus("Uploading video...");
	
			const CHUNK_SIZE = 1024 * 512;
			const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);
			let start = 0;
			let chunkIndex = 0;
			let lastResponse;

			try{
				while (start < blob.size) {
					const chunk = blob.slice(start, start + CHUNK_SIZE);
					const chunkStart = start;
					const chunkResponse = await convertVideo(
						chunk,
						totalChunks,
						chunkIndex,
						email,
						(progressEvent) => {
							const chunkUploadFraction = progressEvent.total
								? progressEvent.loaded / progressEvent.total
								: 0;
							const uploadedBytes = chunkStart + (chunk.size * chunkUploadFraction);
							const percent = Math.min(99, Math.round((uploadedBytes / blob.size) * 100));
							setUploadProgress(percent);
							setUploadStatus("Uploading video...");
						}
					);
					lastResponse = chunkResponse;
					console.log(`Uploaded chunk ${chunkIndex + 1} of ${totalChunks}`, chunkResponse);
					start += CHUNK_SIZE;
					chunkIndex++;
				}
				setUploadProgress(100);
				setUploadStatus("Upload complete. Finalizing prediction...");
			} catch (error) {
				window.alert("There was a problem processing your recording. Please try again.");
				setGetPredictions(false);
				setUploadProgress(0);
				setUploadStatus("Preparing upload...");
				navigate("/instructions")
				return;
			}

			// const data2 = await assembleVideo(email);

			console.log('all chunks sent')
			setGetPredictions(false);
			setUploadProgress(0);
			setUploadStatus("Preparing upload...");
		
			if(lastResponse?.code === 200){
				setGetPredictions(false);
				console.log(lastResponse);
				console.log("results");
				navigate("/home")
			} else if(lastResponse?.code === 500){
				window.alert('Please adjust your background lighting for better video quality')
				navigate("/instructions")
			} else {
				navigate("/home")
			}

		} catch (error) {
			console.error("Error while uploading recording:", error);
			setGetPredictions(false);
			setUploadProgress(0);
			setUploadStatus("Preparing upload...");
			navigate("/home")
		}
	}

	return (
		<>
			<div className="video-player">
				{!recordedVideo ? (
					<video ref={liveVideoFeed} autoPlay className="live-player" style={{"width": "90%", "height": "100%"}}></video>
				) : null}
				{recordedVideo ? (
					<>
						<div className="recorded-player">
							<video className="recorded" src={recordedVideo} controls></video>
							<button onClick={downloadVideo}>
								Get Predictions
							</button>
						</div>
						{getPredictions && (
							<>
								<div className="like-modal-overlay">
									<div className="like-modal-content upload-progress-modal" style={{ height: "60vh" }}>
										<Loader type="bubble-top" title={"Uploading and processing your video"} size={100}/>
										<p className="upload-status-text">{uploadStatus}</p>
										<div className="upload-progress-track" aria-hidden="true">
											<div
												className="upload-progress-fill"
												style={{ width: `${uploadProgress}%` }}
											></div>
										</div>
										<p className="upload-progress-label">{uploadProgress}% uploaded</p>
										<p className="upload-progress-note">Please keep this page open until the upload finishes.</p>
									</div>
								</div>
							</>
						)}
						
					</>
				) : null}
			</div>
			
			{
				displayCameraOption ?
					<main>
						<div className="video-controls">
							{!permission ? (
								<button onClick={getCameraPermission} type="button">
									Turn On Camera
								</button>
							) : null}
							{permission && recordingStatus === "inactive" ? (
								<button onClick={startRecording} type="button">
									Start Recording
								</button>
							) : null}
							{recordingStatus === "recording" ? (
								<button onClick={stopRecording} type="button">
									Stop Recording
								</button>
							) : null}
						</div>
					</main>
				: null 
			}
		</>
	);
};

export default VideoRecorder;
