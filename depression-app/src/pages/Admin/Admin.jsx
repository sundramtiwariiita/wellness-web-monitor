import "./Admin.css";
import { Link } from 'react-router-dom'
import Test from "../../images/Test.png"
import User from "../../images/User.webp"


const Admin = () => {

  return (
    <>
      <div className="admin-container">
        <div className="heading">
          Admin Page 
        </div>

        <div className='cards'> 
          <div className='users-card'> 
            <img src = {User} />
            <h3>Users</h3>
            <Link to="/users-page">
                <h4>See all existing users</h4>
            </Link>
          </div>

          <div className='testing-card'>
            <img src = {Test} />
            <h3>Testing</h3>
            <Link to="/testing-page">
                <h4>See all results</h4>
            </Link>
          </div>
        </div>      

      </div>
    </>
  )
}

export default Admin
