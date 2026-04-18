import { useReducedMotion } from "framer-motion";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { useAmbientAudio } from "./AmbientAudioProvider";

const WellnessPage = ({
    children,
    className = "",
    contentClassName = "",
    videoSrc = "",
    subtitle = "A calmer digital space for reflection, support, and mindful self-checks.",
}) => {
    const reduceMotion = useReducedMotion();
    const { isPlaying, toggle } = useAmbientAudio();
    const videoEnabled = Boolean(videoSrc) && !reduceMotion;

    return (
        <div className={`wm-page ${videoEnabled ? "wm-page--with-video" : ""} ${className}`}>
            <div className="wm-page__backdrop" aria-hidden="true">
                {videoEnabled ? (
                    <video
                        className="wm-page__video"
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                    />
                ) : null}
                <div className="wm-page__wash" />
                <span className="wm-page__orb wm-page__orb--one" />
                <span className="wm-page__orb wm-page__orb--two" />
                <span className="wm-page__orb wm-page__orb--three" />
                <span className="wm-page__orb wm-page__orb--four" />
                <span className="wm-page__mesh wm-page__mesh--left" />
                <span className="wm-page__mesh wm-page__mesh--right" />
            </div>

            <div className="wm-page__frame">
                <header className="wm-page__topbar">
                    <div className="wm-brand-lockup">
                        <span className="wm-brand-pill">Wellness Monitor</span>
                        <p className="wm-brand-subtitle">{subtitle}</p>
                    </div>

                    <button
                        type="button"
                        className="wm-audio-toggle"
                        onClick={toggle}
                        aria-pressed={isPlaying}
                    >
                        {isPlaying ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
                        <span>{isPlaying ? "Mute ambience" : "Play ambience"}</span>
                    </button>
                </header>

                <main className={`wm-page__content ${contentClassName}`}>{children}</main>
            </div>
        </div>
    );
};

export default WellnessPage;
