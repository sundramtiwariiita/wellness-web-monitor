import { useState , useContext } from "react";
import { UserContext } from "../../../context/Context";
import { getUser } from "../../../services/Api";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { saveStoredUserData } from "../../../utils/userSession";

const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  // const { userData, setUserData } = useContext(UserContext);

  const userLog = async (e) => {
    e.preventDefault();
    if(email === "admin_anupam2024@gmail.com" && password === "AnupamA@23#") {
      navigate("/admin-page")
    } else {
      const data = await getUser(email, password);
      console.log(data)
      if (data.msg === "user exists") {
        saveStoredUserData(data.data);
        navigate("/home");
      } else if(data.msg === "invalid credentials"){
        window.alert("invalid credentials");
      } else {
        window.alert(data.msg);
      }
    }
  };

  return (
    <div className="log-container">
        
        <div className="log-content">
          <div>
            <div className="log-text">Login to</div>
            <div className="wel-text">Wellness Monitor</div>
            <form>
            <div className="input-area">
            <div className="input-label">Email</div>
            <input type="email"
                  name="email"
                  placeholder="Email Address"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}/>
            <div className="input-label">Password</div>
            <input type="password"
                  name="password"
                  placeholder="Enter your password"
                  id="password"
                  onChange={(e) => setPass(e.target.value)}/>
            </div>
            <button className="log-btn" onClick={(e) => userLog(e)}>Log In</button>
            </form>
          </div>
        </div>
      </div>
  )
}

export default Login
