import InputFields from "./InputFields";
import "./signup.css"
import WellnessPage from "../../../components/wellness/WellnessPage";
import heroVideo from "../../../assets/media/wellness-hero.mp4";

const Signup = () => {

    return (
        <WellnessPage
            className="signup-page"
            contentClassName="signup-page__content"
            videoSrc={heroVideo}
            subtitle="Create a private account to save your screenings, return to your profile, and access support when you need it."
        >
            <section className="auth-layout signup-layout">
                <div className="wm-panel wm-panel--hero auth-copy reveal-up">
                    <p className="wm-eyebrow">Create your account</p>
                    <h1 className="wm-heading">Start with a quiet, supportive space that keeps your progress close.</h1>
                    <p className="wm-subcopy">
                        Your account gives you a consistent home for guided screening, saved result history,
                        and a calmer chatbot experience whenever you want to check in.
                    </p>

                    <div className="wm-pill-list">
                        <span className="wm-pill">Confidential results history</span>
                        <span className="wm-pill">Supportive chatbot access</span>
                        <span className="wm-pill">Gentle wellness flow</span>
                    </div>
                </div>

                <div className="wm-panel wm-panel--hero auth-form-panel reveal-up delay-1">
                    <p className="wm-eyebrow">Register</p>
                    <h2 className="wm-heading">Build your Wellness Monitor profile</h2>
                    <p className="wm-inline-note">
                        Fill in your details to create a secure account. The current registration
                        behavior and validation rules remain unchanged.
                    </p>
                    <InputFields />
                </div>
            </section>
        </WellnessPage>
    )
}

export default Signup
