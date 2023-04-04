import React from 'react'
import Button from './Button'

const Navbar = () => {
    return (
        <div className='container navbar-wrapper'>
            <h1> FileStore</h1>
            <div className="starter-buttons">
                <Button text="Login" />
                <Button text="Try for free" style={{ backgroundColor: "#70A1EB" }} />
            </div>
        </div >
    )
}

export default Navbar