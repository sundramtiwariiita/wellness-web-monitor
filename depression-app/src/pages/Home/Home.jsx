import './Home.css'
import { Link } from 'react-router-dom'
import Depressed from "../../images/depressed.png"
import Therapy from "../../images/therapy-bot.png"


const Home = () => {
  
  return (
    <>
      <div className="home-container">
        <div className="heading">
          Wellness Monitor 
        </div>

        <div className='cards'> 
          <div className='depression-detection'> 
            <img src = {Depressed} />
            <h3>Depression Detection Test</h3>
            <Link to="/instructions">
                <h4>Take Test</h4>
            </Link>
          </div>

          <div className='chatbot-therapy'>
            <img src = {Therapy} />
            <h3>Chatbot Therapy</h3>
            <Link to="/chat-bot">
                <h4>Chat with Us</h4>
            </Link>
          </div>

          <div className='results'>
            <img src = {Therapy} />
            <h3>Profile Page</h3>
            <Link to="/profile">
                <h4>Check your past results</h4>
            </Link>
          </div>


        </div>             
        </div>
    </>
  )
}

export default Home
