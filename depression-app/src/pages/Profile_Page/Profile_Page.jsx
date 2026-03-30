import { useState, useEffect } from "react";
import "./Profile_Page.css";
import { getUserData } from "../../services/Api";
import { json } from "react-router-dom";
import { getPrediction } from "../../services/Api";
import { getStoredUserEmail } from "../../utils/userSession";

const Profile_Page = () => {
  // const [data, setData] = useState();
  const [res, setRes] = useState([]);

  useEffect(() => {
    const getResult = async () => {
      try {
        const email = getStoredUserEmail();
        if (!email) {
          setRes([]);
          return;
        }
        const results = await getPrediction(email);
        console.log(results);

        if (results?.data?.message === "no testing done") {
          setRes([]);
        } else {
          setRes(results?.data);
        }
      } catch (error) {
        console.log(error);
        setRes([]);
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

  return (
    <>
      <div className="profile-page-container">
        {/* Profile Page */}
        <h2>Results</h2>
        {res?.length === 0 ? (
            <p>Nothing to show</p>
        ) : (
            <table>
                <tr>
                    <th>Testing Date</th>
                    <th>Score</th>
                    <th>Result</th>
                </tr>
                {res?.length === 0 ? (
                    <p>Nothing to show</p>
                ) : (
                    res.reverse().map((element) => (
                        <>
                            <tr>
                                <td>{element[0]}</td>
                                <td>{element[1]}</td>
                                <td>{element[1] ? findClass(element[1]) : ""}</td>
                            </tr>
                        </>
                    ))
                )}
            </table>
        )}

      </div>
    </>
  );
};

export default Profile_Page;
