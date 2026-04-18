import { useState, useEffect } from "react";
import "./Results.css";
import { getPrediction } from "../../services/Api";
import { Link } from "react-router-dom";
import { RotatingLines } from 'react-loader-spinner'
import { getStoredUserEmail } from "../../utils/userSession";
import WellnessPage from "../../components/wellness/WellnessPage";


const Results = () => {
  const [res, setRes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const getResult = async () => {
      try {
        const email = getStoredUserEmail();
        if (!email) {
          setRes([]);
          setIsLoading(false);
          return;
        }
        const results = await getPrediction(email);

        if (results?.data?.message === "no testing done") {
          setRes([]);
        } else {
          setRes(results?.data || []);
        }
      } catch (error) {
        console.log(error);
        setRes([]);
      } finally {
        setIsLoading(false);
      }
    };

    getResult();
  }, []);
  

  const findClass = (value) => {
    if (value > 0 && value < 0.25) {
      return "Happy";
    } else if (value >= 0.25 && value < 0.5) {
      return "Neutral";
    } else if (value >= 0.5 && value < 0.75) {
      return "A Bit Depressed";
    } else {
      return "Moderately Depressed";
    }
  };

  const orderedResults = [...res].reverse();
  const latestResult = orderedResults[0];
  const latestScore = Number(latestResult?.[1] || 0);
  const latestLabel = latestResult ? findClass(latestScore) : "";

  return (
    <WellnessPage
      className="results-page"
      contentClassName="results-page__content"
      subtitle="Review your latest screening result and your earlier history in one calm summary view."
    >
      <section className="wm-grid-two results-summary-grid reveal-up">
        <div className="wm-panel wm-panel--hero">
          <p className="wm-eyebrow">Latest result</p>
          <h1 className="wm-heading">
            {latestResult ? latestLabel : "Your result history will appear here once a test is completed."}
          </h1>
          <p className="wm-subcopy">
            {latestResult
              ? `Your latest recorded score is ${latestResult[1]}. Use this as a gentle signal to reflect, not as a final judgment about yourself.`
              : "Once a completed screening is saved, Wellness Monitor will show the latest score and category here."}
          </p>
        </div>

        <div className="wm-card results-guidance">
          <p className="wm-eyebrow">Next step</p>
          <h3>{latestResult && latestScore >= 0.5 ? "A supportive follow-up may help right now." : "Keep checking in with yourself gently."}</h3>
          <p>
            {latestResult && latestScore >= 0.5
              ? "If you feel low or overwhelmed, the chatbot can help you slow down, process the feeling, and think about your next step."
              : "If you are feeling steady, you can return home, review your profile history, or come back later when you want another check-in."}
          </p>
          <Link
            to={latestResult && latestScore >= 0.5 ? "/chat-bot" : "/home"}
            className="wm-link-button wm-link-button--primary"
          >
            {latestResult && latestScore >= 0.5 ? "Chat with us" : "Return home"}
          </Link>
        </div>
      </section>

      <section className="wm-panel wm-panel--soft reveal-up delay-1">
        <div className="results-history-header">
          <div>
            <p className="wm-eyebrow">Screening history</p>
            <h2 className="wm-heading">Your saved results</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="wm-empty-state">
            <RotatingLines
              visible={true}
              height="92"
              width="92"
              color="#234154"
              strokeColor="#234154"
              strokeWidth="5"
              animationDuration="0.75"
              ariaLabel="results-loading"
            />
            <p>Loading your saved screening history...</p>
          </div>
        ) : orderedResults.length === 0 ? (
          <div className="wm-empty-state">
            <h3 className="wm-heading">Nothing to show yet</h3>
            <p>Complete a screening and your results will appear here automatically.</p>
          </div>
        ) : (
          <div className="wm-table-shell">
            <table className="wm-data-table">
              <thead>
                <tr>
                  <th>Testing Date</th>
                  <th>Score</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {orderedResults.map((element, index) => (
                  <tr key={`${element[0]}-${index}`}>
                    <td>{element[0]}</td>
                    <td>{element[1]}</td>
                    <td>{element[1] ? findClass(element[1]) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </WellnessPage>
  );
};

export default Results;
