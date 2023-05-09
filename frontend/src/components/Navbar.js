import React, { useEffect } from 'react'
import Button from './Button'
import logo from '../assets/logo.png'
import { useNavigate } from "react-router-dom";
// import { checkIfUserLoggedIn } from '../services/utils';

const Navbar = () => {
    const navigate = useNavigate();


    useEffect(() => {
        if (localStorage.getItem('renterId')) {
            navigate('/dashboard/' + localStorage.getItem('renterId'))
        }
    }, [])


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
                <Button onClick={navigateToLogin} text="Login" style={{ backgroundColor: "#FFD817" }} ></Button>
                <Button onClick={navigateToSignup} text="Register" style={{ backgroundColor: "#70A1EB" }} />
            </div>
        </div >
    )
}

export default Navbar