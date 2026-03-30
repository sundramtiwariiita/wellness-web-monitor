import "./Record.css";
import VideoRecorder from "../../components/Record_Video/VideoRecorder";
import QuestionSlider from "../../components/Question_Slider/QuestionSlider.jsx";

const App = () => {

	return (
		<>
			<div className="record-container">
				<h1>Record your video here!</h1>
				<div className="video-recorder-container">
					<div className="video">
						<VideoRecorder />
					</div>
					<div className="questions">
						<QuestionSlider />
					</div>						
				</div>
			</div>
		</>
	);
};

export default App;