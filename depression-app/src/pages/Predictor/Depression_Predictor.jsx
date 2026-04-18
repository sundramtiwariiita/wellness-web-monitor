import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WellnessPage from "../../components/wellness/WellnessPage";
import { getPrediction } from "../../services/Api";
import "./Depression_Predictor.css";

const Depression_Predictor = () => {
  const [result, setResult] = useState("");
  const [prediction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = window.localStorage.getItem("userInfo");

    if (!data) {
      navigate("/");
    }

    const getPred = async () => {
      const data = await getPrediction();
      setResult(data);
    };

    getPred();
  }, []);

  return (
    <WellnessPage
      className="predictor-page"
      contentClassName="predictor-page__content"
      subtitle="A gentle summary view for the current prediction outcome."
    >
      <section className="predictor-card wm-panel wm-panel--hero reveal-up">
        <p className="wm-eyebrow">Prediction Result</p>
        <h1 className="wm-heading">Result of the Prediction is:</h1>

        <div className="predictor-result-box">
          {prediction ? (
            <p>No need to worry, breathe some fresh air and drink lots of water.</p>
          ) : (
            <p>Please visit any nearby clinic for consultation.</p>
          )}
        </div>

        {result ? (
          <p className="wm-inline-note predictor-note">
            The prediction request completed. This screen keeps the existing prediction flow and presents the message with improved readability.
          </p>
        ) : null}
      </section>
    </WellnessPage>
  );
};

export default Depression_Predictor;
