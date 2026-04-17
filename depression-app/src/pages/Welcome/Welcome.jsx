import './Welcome.css'
import { Link } from 'react-router-dom'
import HomeImage from "../../images/home_page_image.png"

const Welcome = () => {
  return (
    <>
      <div className="welcome-container">
        <div className="main">
          <div className="left">
            <div className="heading">
              Wellness Monitor 
            </div>
            <div className="text"> 
            Discover a path to emotional well-being with Wellness Monitor, a compassionate space designed to support and 
            guide you through your mental health journey. Our mission is to provide accessible tools for depression detection and 
            an innovative therapy chatbot to empower you on your quest for a balanced and fulfilling life.
            <br/>
              <span className="light"><b>Take a simple test, answer a few questions, and discover if you are living with depression or not.</b> </span>
            </div>
            <div className='buttons'>
              <Link to="/login">
                <button type="button" className="login">Login</button>
              </Link>
            </div>
            <div className='new-user'> 
                <h2>Don't have an account?</h2>
                <Link to="/register">
                <h4>Register Now</h4>
                </Link>
            </div>
           
          </div>
          <div className="right">
             <img src = {HomeImage} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Welcome