import { Link } from "react-router-dom";
import WellnessPage from "../../components/wellness/WellnessPage";
import cuteBuddyGif from "../../assets/media/cute-404-buddy.gif";
import "./NotFound.css";

const NotFound = () => {
  return (
    <WellnessPage
      className="not-found-page"
      contentClassName="not-found-page__content"
      subtitle="A gentle fallback when a page cannot be found."
    >
      <section className="not-found-card wm-panel wm-panel--hero reveal-up">
        <div className="not-found-card__visual">
          <img src={cuteBuddyGif} alt="A cute animated bunny helper for the missing page" />
        </div>

        <div className="not-found-card__copy">
          <p className="wm-eyebrow">404 Not Found</p>
          <h1 className="wm-display">This page wandered away.</h1>
          <p className="wm-subcopy">
            No worries. The little wellness buddy could not find this address, but we can take you back to a safe place.
          </p>

          <div className="wm-action-row">
            <Link className="wm-link-button wm-link-button--primary" to="/">
              Back to welcome
            </Link>
            <Link className="wm-link-button wm-link-button--secondary" to="/home">
              Go to home
            </Link>
            <Link className="wm-link-button wm-link-button--secondary" to="/chat-bot">
              Open companion
            </Link>
          </div>
        </div>
      </section>
    </WellnessPage>
  );
};

export default NotFound;
