import { useState, useEffect } from "react";
import "./Results.css";
import { getPrediction } from "../../services/Api";
import { Link, useLocation } from "react-router-dom";
import { RotatingLines } from 'react-loader-spinner'
import { getStoredUserEmail } from "../../utils/userSession";


const Results = () => {
  const [res, setRes] = useState([]);
  const [isFirstRun, setIsFirstRun] = useState(true);
  // useEffect(() => {
  //   const getResult = async () => {
  //     try {

  //       const email = JSON.parse(window.localStorage.getItem("userData"))[2];
  //       const results = await getPrediction(email);
  //       console.log(results);

  //       if (results?.data?.message === "no testing done") {
  //         setRes([]);
  //       } else {
  //         setRes(results?.data);
  //         console.log(results.data[results.data.length - 1][1]);
  //       }

  //     } catch (error) {
  //       console.log(error);
  //       setRes([]);
  //     }
  //   };
  //   getResult();
  // }, []);


  useEffect(() => {
    if (isFirstRun || res.length === 0) {
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
            console.log(results.data[results.data.length - 1][1]);
          }
        } catch (error) {
          console.log(error);
          setRes([]);
        }
      };
      getResult();
    }
    setIsFirstRun(false);
    return () => {
      setIsFirstRun(false);
    };
  }, [res, isFirstRun]);
  

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
      <div className="results-container">
        <h2>Results</h2>

        {res?.length === 0 ? (
          <RotatingLines
            visible={true}
            height="96"
            width="96"
            color="white"
            strokeColor="white"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        ) : (
          <>
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

            {res[0][1] >= 0.5 ? (
              <div className="depressed-prediciton">
                <p>
                  It's completely okay to not feel your best, we're here for you
                  every step of the way. Don't hesitate to reach out and engage
                  with our chatbot for further support and guidance.
                </p>
                <Link to="/chat-bot">
                  <button className="btn">Chat with us</button>
                </Link>
              </div>
            ) : (
              <div className="not-depressed-prediciton">
                <p>
                  Your test results indicate that you're perfectly healthy. We
                  appreciate your participation in the test!!
                </p>
                <Link to="/home">
                  <button className="btn">Home</button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Results;
