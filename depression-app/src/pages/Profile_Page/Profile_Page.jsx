import { useState, useEffect } from "react";
import "./Profile_Page.css";
import { getPrediction } from "../../services/Api";
import { getStoredUserData, getStoredUserEmail } from "../../utils/userSession";
import WellnessPage from "../../components/wellness/WellnessPage";

const Profile_Page = () => {
  const [res, setRes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getStoredUserData();

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

  return (
    <WellnessPage
      className="profile-page"
      contentClassName="profile-page__content"
      subtitle="Your profile keeps your saved details and earlier screening history close at hand."
    >
      <section className="wm-grid-two profile-summary-grid reveal-up">
        <div className="wm-panel wm-panel--hero">
          <p className="wm-eyebrow">Profile snapshot</p>
          <h1 className="wm-heading">{user?.name || "Wellness Monitor profile"}</h1>
          <p className="wm-subcopy">
            {user?.email || "Sign in to view the details tied to your saved screening history."}
          </p>
        </div>

        <div className="wm-card profile-details-card">
          <p className="wm-eyebrow">Saved details</p>
          <div className="profile-detail-grid">
            <div><strong>Mobile</strong><span>{user?.mobile || "Not available"}</span></div>
            <div><strong>Gender</strong><span>{user?.gender || "Not available"}</span></div>
            <div><strong>Date of birth</strong><span>{user?.dob || "Not available"}</span></div>
            <div><strong>Age</strong><span>{user?.age || "Not available"}</span></div>
          </div>
        </div>
      </section>

      <section className="wm-panel wm-panel--soft reveal-up delay-1">
        <div className="profile-history-header">
          <div>
            <p className="wm-eyebrow">Result history</p>
            <h2 className="wm-heading">Your earlier outcomes</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="wm-empty-state">
            <p>Loading your profile history...</p>
          </div>
        ) : orderedResults.length === 0 ? (
          <div className="wm-empty-state">
            <h3 className="wm-heading">Nothing to show yet</h3>
            <p>When your screenings are saved, your result history will appear here.</p>
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

export default Profile_Page;
