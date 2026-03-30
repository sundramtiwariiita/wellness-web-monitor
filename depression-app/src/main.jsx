import 'regenerator-runtime/runtime'
import ReactDOM from 'react-dom/client'
import App from './pages/Record/Record.jsx'
import Home from './pages/Home/Home.jsx'
import Depression_Predictor from "./pages/Predictor/Depression_Predictor.jsx"
import Signup from './pages/authentication/signup/signup.jsx'
import Login from './pages/authentication/login/Login.jsx'
import Instructions from './pages/Instructions/Instructions.jsx'
import Profile_Page from './pages/Profile_Page/Profile_Page.jsx'
import Chatbot from './pages/Chatbot/Chatbot.jsx'
import Welcome from './pages/Welcome/Welcome.jsx'
import Results from './pages/Results/Results.jsx'
import Construction from './pages/Construction/Construction.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import Admin from './pages/Admin/Admin.jsx'
import Users from './pages/Users/Users.jsx'
import Testing from './pages/Testing/Testing.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/record",
    element: <App />,
  },
  {
    path: "/predictor",
    element: <Depression_Predictor />
  },
  {
    path: "/register",
    element: <Signup />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/instructions",
    element: <Instructions />
  },
  {
    path: "/profile",
    element: <Profile_Page />
  },
  {
    path: "/chat-bot",
    element: <Chatbot />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/results",
    element: <Results />
  },
  {
    path: "/under-construction",
    element: <Construction />
  },
  {
    path: "/admin-page",
    element: <Admin />
  },
  {
    path: "/users-page",
    element: <Users />
  },
  {
    path: "/testing-page",
    element: <Testing />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <RouterProvider router={router} />
  </ChakraProvider>,
)
