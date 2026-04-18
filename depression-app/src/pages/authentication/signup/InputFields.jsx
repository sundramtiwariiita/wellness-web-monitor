import { useState } from "react"
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
        <form className="registration-form" onSubmit={saveUser}>
            <div className="registration-grid">
                <label className="wm-form-control">
                    <span>Name</span>
                    <input className="wm-input" onChange={handleChange} name="name" id="name" placeholder="Name" type="text" />
                </label>

                <label className="wm-form-control">
                    <span>Email ID</span>
                    <input className="wm-input" onChange={handleChange} name="email" id="email" placeholder="Email ID" type="email" />
                </label>

                <label className="wm-form-control">
                    <span>Mobile Number (10 digits)</span>
                    <input className="wm-input" onChange={handleChange} name="mobile" id="mobile-number" placeholder="Mobile Number" type="tel" inputMode="numeric" />
                </label>

                <label className="wm-form-control">
                    <span>Gender</span>
                    <select className="wm-select" id="gender" name="gender" defaultValue="" onChange={handleChange}>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                    </select>
                </label>

                <label className="wm-form-control">
                    <span>Date of Birth</span>
                    <input className="wm-input" type="date" onChange={handleChange} name="dob" id="dob" />
                </label>

                <label className="wm-form-control">
                    <span>Age</span>
                    <input className="wm-input" onChange={handleChange} name="age" id="age" placeholder="Age" type="text" inputMode="numeric" />
                </label>

                <label className="wm-form-control">
                    <span>Password</span>
                    <input className="wm-input" onChange={handleChange} name="password" id="password" placeholder="Password" type="password" />
                </label>

                <label className="wm-form-control">
                    <span>Confirm Password</span>
                    <input className="wm-input" onChange={handleChange} name="cpassword" id="cpassword" placeholder="Confirm Password" type="password" />
                </label>
            </div>

            <button className="wm-btn wm-btn--primary registration-submit" type="submit">
                Create Account
            </button>

            <p className="registration-footnote">
                Already have an account?{" "}
                <Link to="/login">
                    Login
                </Link>
            </p>
        </form>
    )
}

export default InputFields
