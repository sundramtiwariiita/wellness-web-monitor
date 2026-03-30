import "./Instructions.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

const Instructions = () => {

  const navigate = useNavigate();

  // useEffect(() => {
  //   const data = window.localStorage.getItem("userData"); 
  //   console.log(data);
  //   if(!data) {
  //     navigate("/");
  //   }
  // }, [])

  return (
    <div className="instructions-container">
        <div className="heading">
            <h1>Instructions</h1>
        </div>
        <div className="instructions">
            <div className="list">
                 <h2>1. We would display some questions on the next page which you need to answer according to how you feel.</h2>
                 <h2>2. Your recorded answers would be confidential with us.</h2>
                 <h2>3. Please repond to every question for an average of 20-30 seconds. You can take as much time as you want.</h2>
                 <h2>4. After going through all questions, click on get predicitons, and kindly wait till you get the results.</h2>
	         <h2>5. If facing some issues during login, kindly reload or check again after some time.</h2>
            </div>
            <Link to="/record">
                <button className="btn">Continue towards Answering the Questions</button>
            </Link>
        </div>
    </div>
  )
}

export default Instructions;
