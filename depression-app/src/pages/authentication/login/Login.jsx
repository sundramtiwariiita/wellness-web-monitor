import { useState , useContext } from "react";
import { UserContext } from "../../../context/Context";
import { getUser } from "../../../services/Api";
import "./login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveAdminAuthSession, saveStoredUserData, saveUserAuthSession } from "../../../utils/userSession";
import WellnessPage from "../../../components/wellness/WellnessPage";
import heroVideo from "../../../assets/media/wellness-hero.mp4";

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  // const { userData, setUserData } = useContext(UserContext);

  const userLog = async (e) => {
    e.preventDefault();
    if(email === "admin_anupam2024@gmail.com" && password === "AnupamA@23#") {
      saveAdminAuthSession();
      navigate("/admin-page")
    } else {
      const data = await getUser(email, password);
      console.log(data)
      if (data.msg === "user exists") {
        const storedUser = saveStoredUserData(data.data);
        saveUserAuthSession(storedUser);
        const redirectTo = location.state?.from && location.state.from !== "/login" ? location.state.from : "/home";
        navigate(redirectTo);
      } else if(data.msg === "invalid credentials"){
        window.alert("invalid credentials");
      } else {
        window.alert(data.msg);
      }
    }
  };

  return (
    <WellnessPage
      className="login-page"
      contentClassName="login-page__content"
      videoSrc={heroVideo}
      subtitle="Return to your private wellness space and continue at a pace that feels manageable."
    >
      <section className="auth-layout">
        <div className="wm-panel wm-panel--hero auth-copy reveal-up">
          <p className="wm-eyebrow">Welcome back</p>
          <h1 className="wm-heading">Step back into a calmer space for reflection.</h1>
          <p className="wm-subcopy">
            Sign in to continue your wellness journey, revisit earlier results, or spend a few
            quiet moments with the chatbot companion.
          </p>

          <div className="wm-pill-list">
            <span className="wm-pill">Private session history</span>
            <span className="wm-pill">Gentle visual design</span>
            <span className="wm-pill">Supportive follow-up</span>
          </div>
        </div>

        <div className="wm-panel wm-panel--hero auth-form-panel reveal-up delay-1">
          <p className="wm-eyebrow">Log in</p>
          <h2 className="wm-heading">Sign in to Wellness Monitor</h2>
          <p className="wm-inline-note">
            Use the email and password you registered with to continue.
          </p>

          <form className="auth-form" onSubmit={userLog}>
            <label className="wm-form-control">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                id="email"
                className="wm-input"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="wm-form-control">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                id="password"
                className="wm-input"
                onChange={(e) => setPass(e.target.value)}
              />
            </label>

            <button type="submit" className="wm-btn wm-btn--primary auth-submit">
              Log in
            </button>
          </form>

          <p className="auth-footnote">
            New here?{" "}
            <Link to="/register">
              Create your account
            </Link>
          </p>
        </div>
      </section>
    </WellnessPage>
  )
}

export default Login
