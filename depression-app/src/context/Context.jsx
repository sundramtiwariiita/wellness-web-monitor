import { useEffect,useState } from 'react'
import { createContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { getStoredUserData, saveStoredUserData } from '../utils/userSession';

export const UserContext = createContext("");

const Context = ({ children }) => {

    const [userData, setUserData] = useState(null); 
    const navigate = useNavigate(); 

    useEffect(() => {
        const data = getStoredUserData();
        console.log(data);
        if(!data)
          navigate("/")
        else
          setUserData(data);
    },[navigate]);

    useEffect(()=>{
        if(userData)
          saveStoredUserData(userData);
     },[userData]);

  return (
    <UserContext.Provider value={{userData , setUserData}}>{children}</UserContext.Provider>
  )
}

export default Context;
