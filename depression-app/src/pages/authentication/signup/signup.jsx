import { VStack } from '@chakra-ui/react'
import InputFields from "./InputFields";
import "./signup.css"
import { useMediaQuery } from "@chakra-ui/react";
import InputFieldsMobile from "./InputFieldsMobile";

const Signup = () => {

    const [isMobile] = useMediaQuery("(max-width: 850px)"); 

    return (
        <div className="sign-up-container">
            <div className = "register-fields">
                <h1 className="reg-heading">Register</h1>
                {
                    !isMobile ?  <InputFields /> : <VStack><InputFieldsMobile /></VStack>
                }
            </div>
        </div>
    )
}

export default Signup