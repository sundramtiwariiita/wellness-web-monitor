import "./Record.css";
import VideoRecorder from "../../components/Record_Video/VideoRecorder";
import QuestionSlider from "../../components/Question_Slider/QuestionSlider.jsx";
import WellnessPage from "../../components/wellness/WellnessPage";

const App = () => {

	return (
		<WellnessPage
			className="record-page"
			contentClassName="record-page__content"
			subtitle="Use a steady setup, answer naturally, and let the guided flow stay calm and uncluttered."
		>
			<section className="wm-panel wm-panel--hero record-hero reveal-up">
				<p className="wm-eyebrow">Guided recording</p>
				<h1 className="wm-heading">Take your time and answer each question in your own words.</h1>
				<p className="wm-subcopy">
					You can move through the prompts one at a time, record in a quiet setting, and request
					your prediction when you feel satisfied with the response you captured.
				</p>
			</section>

			<section className="record-grid">
				<div className="wm-panel wm-panel--hero record-video-panel reveal-up">
					<div className="record-panel-copy">
						<p className="wm-eyebrow">Camera space</p>
						<h2 className="wm-heading">Record your answer</h2>
					</div>
					<VideoRecorder />
				</div>

				<div className="wm-panel wm-panel--hero record-question-panel reveal-up delay-1">
					<QuestionSlider />
				</div>
			</section>
		</WellnessPage>
	);
};

export default App;
