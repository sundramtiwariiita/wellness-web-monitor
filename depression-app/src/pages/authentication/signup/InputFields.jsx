import { useState } from "react"
import { Input, VStack, HStack } from '@chakra-ui/react'
import {
    FormControl,
    FormLabel,
    Select,
    Button
} from "@chakra-ui/react";
import { addUser } from "../../../services/Api";
import { Link, useNavigate } from "react-router-dom";
import { saveStoredUserData } from "../../../utils/userSession";


const InputFields = () => {

    const initial = {
        name: "",
        mobile: "",
        email: "",
        password: "",
        gender: "",
        dob: "",
        age: ""
    };

    const navigate = useNavigate();
    const [user, setUser] = useState(initial);
    
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
        // console.log(user);
    };

    const validateUser = () => {
        const required = ["name", "mobile", "email", "password", "gender", "dob", "age", "cpassword"];
        for (const key of required) {
            if (!user?.[key] || String(user[key]).trim() === "") {
                return `Please fill ${key} field`;
            }
        }
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(user.email).trim());
        if (!emailOk) return "Please enter a valid email address";
        const mobileStr = String(user.mobile).trim();
        if (!/^\d{10}$/.test(mobileStr)) return "Mobile number must be 10 digits";
        if (!/^\d+$/.test(String(user.age).trim())) return "Age must be a number";
        if (user.password !== user.cpassword) return "Password and Confirm Password do not match";
        return null;
    };

    const saveUser = async (e) => {
        e.preventDefault();
        const validationError = validateUser();
        if (validationError) {
            window.alert(validationError);
            return;
        }
        try {
            console.log(user);
            const data = await addUser(user);
            console.log(data);
            // if (data?.data.code === 200) {
                if (data?.code === 200) {
                console.log("successful");
                const saveToLocalStorage = {
                    name: user.name,
                    mobile: user.mobile,
                    email: user.email,
                    gender: user.gender,
                    dob: user.dob,
                    age: user.age
                };
                saveStoredUserData(saveToLocalStorage);
                alert("Account created successfully");
                navigate("/login");
            } else {
                const message = data?.message || data?.messsage || data?.error || "Fill all correct information";
                window.alert(message);
            } 
        } catch (err) {
            window.alert(err);
        }
    };

    return (
        <FormControl style={{display: "flex" , flexDirection : 'column' , alignItems : 'center'}}>
            <HStack spacing={60} style={{display : "flex"}}>
            <VStack spacing={10} width="50%" style={{display: "flex" , alignItems: "flex-start"}}>

                <FormLabel htmlFor="name" >Name</FormLabel>
                <Input background='aliceblue' color='black' height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="name" isRequired id="name" placeholder='Name' type="text" borderRadius={5} outline='none'  _placeholder={{color: 'black'}}/>

                <FormLabel htmlFor="mobile-number" >Mobile Number (10 digits)</FormLabel>
                <Input background='aliceblue' color='black' height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="mobile" isRequired id="mobile-number" placeholder='Mobile Number' type="number" _placeholder={{color: 'black'}} />

                <FormLabel htmlFor='gender'>Gender</FormLabel>
                <Select color='black' display='flex'  height="2rem" width="2rem" id='gender' name="gender" placeholder='Select Gender' onChange={(e) => handleChange(e)} bg='aliceblue' style = {{color :"black"}} _placeholder={{color: 'black'}}>
                    <option style = {{color :"black"}}>Male</option>
                    <option style = {{color :"black"}}>Female</option>
                    <option style = {{color :"black"}}>Others</option>
                </Select>

                <FormLabel htmlFor="password">Password</FormLabel>
                <Input background='aliceblue' color='black' height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="password" isRequired id="password" placeholder='Password' type="password" _placeholder={{color: 'black'}}/>

            </VStack>
            <VStack spacing={10} width="50%" style={{display: "flex" , alignItems: "start" }}>
                <FormLabel htmlFor="cpassword">Confirm Password</FormLabel>
                <Input background='aliceblue' color='black' height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="cpassword" isRequired id="cpassword" placeholder='Confirm Password' type="password" _placeholder={{color: 'black'}}/>

                <FormLabel htmlFor="email">Email ID</FormLabel>
                <Input background='aliceblue' color='black' height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="email" isRequired id="email" placeholder='Email ID' _placeholder={{color: 'black'}}/>

                <FormLabel htmlFor="dob">Date of Birth</FormLabel>
                <Input height="2rem" type="date" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="dob" isRequired id='dob' placeholder='Date of Birth' _placeholder={{color: 'black'}} style={{ backgroundColor: 'aliceblue', color: 'black' }}   />

                <FormLabel htmlFor="age">Age</FormLabel>
                <Input background='aliceblue' color='black' height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="age" isRequired id="age" placeholder='Age' _placeholder={{color: 'black'}}/>

            </VStack>
            </HStack>

            <Button
                    bg="#F3BAA6"
                    // bg="black"
                    color="black"
                    // _hover={{ bg: "#162D55" }}
                    className="register-btn"
                    style={{ margin: "3rem" }}
                    height="2rem" width="16rem"
                    onClick={(e) => (saveUser(e))} 
            >Create Account
            </Button>

            <div className="login-text">
                    Already have an account? <Link to="/login "><span style = {{color : '#F3BAA6'}}>Login</span></Link>
            </div>



        </FormControl>
    )
}

export default InputFields
