import { useState } from "react"
import { Input, VStack} from '@chakra-ui/react'
import {
    FormControl,
    FormLabel,
    Select,
    Button
} from "@chakra-ui/react";
import { addUser } from "../../../services/Api";
import { Link, useNavigate } from "react-router-dom";
import { saveStoredUserData } from "../../../utils/userSession";


const InputFieldsMobile = () => {

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
            console.log(data)
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
        <FormControl>
            <VStack spacing={3} style={{width: "90%"}}>
                <FormLabel htmlFor="name" >Name</FormLabel>
                <Input height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="name" isRequired id="name" placeholder='Name' type="text" />

                <FormLabel htmlFor="mobile-number" >Mobile Number (10 digits)</FormLabel>
                <Input height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="mobile" isRequired id="mobile-number" placeholder='Mobile Number' type="number" />

                <FormLabel htmlFor='gender'>Gender</FormLabel>
                <Select height="2rem" width="16rem" id='gender' name="gender" placeholder='Select Gender' onChange={(e) => handleChange(e)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Others</option>
                </Select>

                <FormLabel htmlFor="email">Email ID</FormLabel>
                <Input height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="email" isRequired id="email" placeholder='Email ID' />

                <FormLabel htmlFor="dob">Date of Birth</FormLabel>
                <Input height="2rem" type="date" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="dob" isRequired id='dob' placeholder='Date of Birth' />

                <FormLabel htmlFor="age">Age</FormLabel>
                <Input height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="age" isRequired id="age" placeholder='Age' />


                <FormLabel htmlFor="password">Password</FormLabel>
                <Input height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="password" isRequired id="password" placeholder='Password' type="password" />

                <FormLabel htmlFor="cpassword">Confirm Password</FormLabel>
                <Input height="2rem" width="16rem" variant='outline' onChange={(e) => handleChange(e)} name="cpassword" isRequired id="cpassword" placeholder='Confirm Password' type="password" />

                <Button
                    bg="#2AA7FF"
                    // bg="black"
                    color="white"
                    _hover={{ bg: "#162D55" }}
                    className="register-btn"
                    style={{ margin: "3rem" }}
                    height="2rem" width="16rem"
                    onClick={(e) => (saveUser(e))} 
                >
                    Create Account
                </Button>
            </VStack>
        </FormControl>
    );
};

export default InputFieldsMobile;
