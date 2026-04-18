import WellnessPage from "../../components/wellness/WellnessPage";
import "./Construction.css";

const Construction = () => {
  return (
    <WellnessPage
      className="construction-page"
      contentClassName="construction-page__content"
      subtitle="This area is being prepared with care."
    >
      <section className="construction-card wm-panel wm-panel--hero reveal-up">
        <p className="wm-eyebrow">Coming Soon</p>
        <h1 className="wm-display">Under construction</h1>
        <p className="wm-subcopy">
          This page is not ready yet, but the rest of Wellness Monitor remains available.
        </p>
      </section>
    </WellnessPage>
  );
};

export default Construction;
