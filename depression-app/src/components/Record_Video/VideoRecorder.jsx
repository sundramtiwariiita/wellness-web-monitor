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
	const navigate = useNavigate();

	useEffect(() => {
		return () => {
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [stream]);

	const getCameraPermission = async () => {
		setRecordedVideo(null);
		if (!window.isSecureContext && window.location.hostname !== "localhost") {
			window.alert("Camera and microphone access only works on localhost or HTTPS. Please open the app on http://localhost:5173/record on this PC.");
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
	
			const CHUNK_SIZE = 1024 * 512;
			const totalChunks = Math.ceil(blob.size / CHUNK_SIZE);
			let start = 0;
			let chunkIndex = 0;
			let data;

			try{
				while (start < blob.size) {
					const chunk = blob.slice(start, start + CHUNK_SIZE);
					data = await convertVideo(chunk, totalChunks, chunkIndex, email);
					console.log(data);
					console.log(data?.code);
					start += CHUNK_SIZE;
					chunkIndex++;
				}
			} catch (error) {
				window.alert("There was a problem processing your recording. Please try again.");
				navigate("/instructions")
				setGetPredictions(false);
				return;
			}

			// const data2 = await assembleVideo(email);
	        
			console.log('all chunks sent')
			// const data = await uploadVideo(email);
			// console.log(data);
			setGetPredictions(false);
		
			if(data?.data?.code === 200){
				setGetPredictions(false);
				console.log(data);
				console.log("results");
				navigate("/home")
			} else if(data?.data?.code === 500 || data?.message === 'Request failed with status code 500'){
				window.alert('Please adjust your background lighting for better video quality')
				navigate("/instructions")
			} else {
				navigate("/home")
			}

		} catch (error) {
			console.error("Error while uploading recording:", error);
			setGetPredictions(false);
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
									<div className="like-modal-content" style={{ height: "60vh" }}>
										<Loader type="bubble-top" title={"Processing Video...Kindly check after 45-50 minutes"} size={100}/>
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
