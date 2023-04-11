import React from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import logo from '../assets/logo.png'

const LeftPanel = ({ selectedTab, handleSelectedTab }) => {

    return (
        <div className='left-panel-wrapper'>
            <div>
                <img style={{ maxHeight: "80px", minHeight: "80px" }} src={logo} alt="logo" />
            </div>

            <div className='nav-buttons-wrapper'>
                <div style={{ display: "flex", flexDirection: "column" }}>

                    <Link to="/">
                        <Button className='nav-button' text='Home' onClick={() => handleSelectedTab(0)} />
                    </Link>
                    <Link to="/dashboard"><Button className='nav-button' text='Dashboard' onClick={() => handleSelectedTab(1)} />
                    </Link>
                    <Link to="/buckets"><Button className='nav-button' text='Buckets' onClick={() => handleSelectedTab(2)} />
                    </Link>
                    <Link to="/Profile"><Button className='nav-button' text='Profile' onClick={() => handleSelectedTab(3)} />
                    </Link>

                </div>
                {/* </div> */}
                <div>

                    <Button className='nav-button' text='Logout' />
                </div>
            </div>
        </div>
    )
}

export default LeftPanel