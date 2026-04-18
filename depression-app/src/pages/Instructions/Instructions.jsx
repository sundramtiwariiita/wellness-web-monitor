import "./Instructions.css";
import { Link } from "react-router-dom";
import WellnessPage from "../../components/wellness/WellnessPage";

const Instructions = () => {
  const steps = [
    "Questions will appear on the next page so you can respond based on how you genuinely feel.",
    "Your recorded answers are handled confidentially within the current Wellness Monitor flow.",
    "Try to respond to each question for about 20 to 30 seconds, but you can take longer if needed.",
    "After the final question, select Get Predictions and wait while your recording is processed.",
    "If you face a login or loading issue, refresh once and try again after a short pause.",
  ];

  return (
    <WellnessPage
      className="instructions-page"
      contentClassName="instructions-page__content"
      subtitle="A few gentle reminders before recording help the experience feel smoother and more accurate."
    >
      <section className="instructions-layout">
        <div className="wm-panel wm-panel--hero reveal-up">
          <p className="wm-eyebrow">Before you begin</p>
          <h1 className="wm-heading">A calm setup helps the recording feel easier and the result feel more useful.</h1>
          <div className="instruction-list">
            {steps.map((step, index) => (
              <div key={step} className="wm-card instruction-item">
                <span className="instruction-item__number">{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="wm-panel wm-panel--hero instructions-aside reveal-up delay-1">
          <p className="wm-eyebrow">When you feel ready</p>
          <h2 className="wm-heading">Take a steady breath, then continue to the recording space.</h2>
          <p className="wm-subcopy">
            Find a reasonably quiet setting, keep your device stable, and speak naturally.
            The goal is not perfection, just an honest response in your own voice.
          </p>

          <div className="wm-pill-list">
            <span className="wm-pill">Quiet lighting</span>
            <span className="wm-pill">Stable camera</span>
            <span className="wm-pill">Natural answers</span>
          </div>

          <Link to="/record" className="wm-link-button wm-link-button--primary instructions-cta">
            Continue to recording
          </Link>
        </aside>
      </section>
    </WellnessPage>
  )
}

export default Instructions;
