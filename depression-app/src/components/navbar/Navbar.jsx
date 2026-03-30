import { Link } from "react-router-dom"
import "./Navbar.css"

const Navbar = () => {
  return (
    <>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/record">Record</Link>
            <Link to="/predictor">Predictor</Link>
        </nav>
    </>
  )
}

export default Navbar