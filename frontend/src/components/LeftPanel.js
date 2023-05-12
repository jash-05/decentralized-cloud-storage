import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Button from './Button'
import logo from '../assets/logo.png'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InsertChartOutlinedTwoToneIcon from '@mui/icons-material/InsertChartOutlinedTwoTone';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';

const LeftPanel = ({ selectedTab, handleSelectedTab }) => {

    const navigate = useNavigate();
    const [screenSize, setScreenSize] = useState(getCurrentDimension());
    const CustomIconStyle = { height: "100%", verticalAlign: "-20%", marginRight: "5%" }
    const renterId = localStorage.getItem('renterId')
    const CustomIconButton = {
        width: "100%",
        textAlign: "left",
    }
    function getCurrentDimension() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    const handleLogout = async () => {
        localStorage.removeItem('renterId')
        navigate('/')
    }

    useEffect(() => {


        const updateDimension = () => {
            setScreenSize(getCurrentDimension())
        }
        window.addEventListener('resize', updateDimension);


        return (() => {
            window.removeEventListener('resize', updateDimension);
        })
    }, [screenSize])

    useEffect(() => {
        if (!localStorage.getItem('renterId')) {
            navigate('/')
        }
    }, [selectedTab])

    return (
        <div className='left-panel-wrapper'>
            <div>
                <img style={{ maxHeight: "80px", minHeight: "80px" }} src={logo} alt="logo" />
            </div>

            <div className='nav-buttons-wrapper'>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {/* <Link to="/">
                        <Button style={CustomIconButton} icon={<HomeOutlinedIcon sx={CustomIconStyle} />} className='nav-button' text={screenSize.width <= 1200 ? '' : 'Home'} onClick={() => handleSelectedTab(0)} />
                    </Link> */}
                    <Link to={`/dashboard/${renterId}`}>
                        <Button style={CustomIconButton} icon={<InsertChartOutlinedTwoToneIcon sx={CustomIconStyle} />} className='nav-button' text={screenSize.width <= 1215 ? '' : 'Dashboard'} onClick={() => handleSelectedTab(1)} />
                    </Link>
                    <Link to={`/buckets/renter/${renterId}`}>
                        <Button style={CustomIconButton} icon={<DeleteOutlineOutlinedIcon sx={CustomIconStyle} />} className='nav-button' text={screenSize.width <= 1200 ? '' : 'Buckets'} onClick={() => handleSelectedTab(2)} />
                    </Link>
                    <Link to={`/Profile/${renterId}`}>
                        <Button style={CustomIconButton} icon={<PersonOutlineOutlinedIcon sx={CustomIconStyle} />} className='nav-button' text={screenSize.width <= 1200 ? '' : 'Profile'} onClick={() => handleSelectedTab(3)} />
                    </Link>
                </div>
                <div>
                    <Button style={CustomIconButton} icon={<LogoutOutlinedIcon sx={CustomIconStyle} />} className='nav-button' onClick={handleLogout} text={screenSize.width <= 1200 ? '' : 'Logout'} />
                </div>
            </div>
        </div>
    )
}

export default LeftPanel