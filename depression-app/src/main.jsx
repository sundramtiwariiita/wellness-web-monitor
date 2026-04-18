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
import NotFound from './pages/NotFound/NotFound.jsx'
import './index.css'
import './styles/wellness-theme.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import Admin from './pages/Admin/Admin.jsx'
import Users from './pages/Users/Users.jsx'
import Testing from './pages/Testing/Testing.jsx'
import { AmbientAudioProvider } from './components/wellness/AmbientAudioProvider.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

const routes = [
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/record",
    element: <ProtectedRoute><App /></ProtectedRoute>,
  },
  {
    path: "/predictor",
    element: <ProtectedRoute><Depression_Predictor /></ProtectedRoute>
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
    element: <ProtectedRoute><Instructions /></ProtectedRoute>
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile_Page /></ProtectedRoute>
  },
  {
    path: "/chat-bot",
    element: <ProtectedRoute><Chatbot /></ProtectedRoute>
  },
  {
    path: "/home",
    element: <ProtectedRoute><Home /></ProtectedRoute>
  },
  {
    path: "/results",
    element: <ProtectedRoute><Results /></ProtectedRoute>
  },
  {
    path: "/under-construction",
    element: <Construction />
  },
  {
    path: "/admin-page",
    element: <ProtectedRoute role="admin"><Admin /></ProtectedRoute>
  },
  {
    path: "/users-page",
    element: <ProtectedRoute role="admin"><Users /></ProtectedRoute>
  },
  {
    path: "/testing-page",
    element: <ProtectedRoute role="admin"><Testing /></ProtectedRoute>
  },
  {
    path: "*",
    element: <NotFound />
  }
];

const router = createBrowserRouter(
  routes.map((route) => ({
    errorElement: <NotFound />,
    ...route,
  }))
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <AmbientAudioProvider>
      <RouterProvider router={router} />
    </AmbientAudioProvider>
  </ChakraProvider>,
)
