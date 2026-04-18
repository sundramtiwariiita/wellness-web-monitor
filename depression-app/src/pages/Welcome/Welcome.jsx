import './Welcome.css'
import { Link } from 'react-router-dom'
import HomeImage from "../../images/home_page_image.png"
import WellnessPage from '../../components/wellness/WellnessPage'
import heroVideo from '../../assets/media/wellness-hero.mp4'

const Welcome = () => {
  return (
    <WellnessPage
      className="welcome-page"
      contentClassName="welcome-page__content"
      videoSrc={heroVideo}
      subtitle="A warm, private place for gentle screening, guided reflection, and supportive conversations."
    >
      <section className="welcome-grid">
        <div className="wm-panel wm-panel--hero welcome-copy reveal-up">
          <p className="wm-eyebrow">Student wellness companion</p>
          <h1 className="wm-display">A softer way to check in with how you have been feeling lately.</h1>
          <p className="wm-subcopy">
            Wellness Monitor offers a calm first step for reflection through guided prompts,
            a confidential depression screening flow, and a supportive chatbot companion for
            moments when you want steady, practical encouragement.
          </p>

          <div className="wm-action-row">
            <Link to="/login" className="wm-link-button wm-link-button--primary">
              Sign in
            </Link>
            <Link to="/register" className="wm-link-button wm-link-button--secondary">
              Create account
            </Link>
          </div>

          <div className="wm-stat-row">
            <div className="wm-stat-pill">
              <strong>Private by design</strong>
              <span>Confidential sign-in, screening, and result history.</span>
            </div>
            <div className="wm-stat-pill">
              <strong>Gentle screening</strong>
              <span>Guided prompts and recorded answers at your own pace.</span>
            </div>
            <div className="wm-stat-pill">
              <strong>Support on demand</strong>
              <span>Wellness chatbot responses whenever you need a calmer space.</span>
            </div>
          </div>
        </div>

        <div className="wm-panel welcome-visual reveal-up delay-1">
          <div className="welcome-visual__media">
            <img src={HomeImage} alt="Illustration of a calm wellness support experience" />
          </div>

          <div className="welcome-visual__support">
            <div className="wm-card">
              <p className="wm-eyebrow">What to expect</p>
              <h3>Answer a few reflective questions and review your wellness journey with care.</h3>
              <p>
                The experience is designed to feel calm, readable, and emotionally supportive
                without rushing you through any step.
              </p>
            </div>

            <div className="wm-pill-row">
              <span className="wm-pill">Quiet visuals</span>
              <span className="wm-pill">Optional ambience</span>
              <span className="wm-pill">Mindful pacing</span>
            </div>
          </div>
        </div>
      </section>
    </WellnessPage>
  )
}

export default Welcome
