import React from 'react'
import Button from './Button'
import logo from '../assets/logo.png'
import { useNavigate } from "react-router-dom";

const Navbar = () => {

    const navigate = useNavigate();
    const navigateToLogin = () => {
        navigate('/login')
    }
    const navigateToSignup = () => {
        navigate('/register')
    }
    return (
        <div className='container navbar-wrapper'>
            <div style={{ display: 'flex' }}>
                <img style={{ maxHeight: "80px", minHeight: "80px" }} src={logo} alt="logo" />
                <hr style={{ marginLeft: "20px", marginRight: "20px" }} />
                <h1 style={{ color: "white" }}>FileStore</h1>
            </div>
            <div className="starter-buttons">
                <Button onClick={navigateToLogin} text="Login" style={{ backgroundColor: "orange" }} ></Button>
                <Button onClick={navigateToSignup} text="Try for free" style={{ backgroundColor: "#70A1EB" }} />
            </div>
        </div >
    )
}

export default Navbar