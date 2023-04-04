import React from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

const LeftPanel = ({ selectedTab, handleSelectedTab }) => {

    return (
        <div className='left-panel-wrapper'>LeftPanel
            <div className='nav-buttons-wrapper'>
                <Link to="/"><Button className='nav-button' text='Home' onClick={() => handleSelectedTab(0)} />
                </Link>
                <Link to="/dashboard"><Button className='nav-button' text='Dashboard' onClick={() => handleSelectedTab(1)} />
                </Link>
                <Link to="/buckets"><Button className='nav-button' text='Buckets'
                    onClick={() => handleSelectedTab(2)} />
                </Link>
                <Link to="/Profile">
                    <Button className='nav-button' text='Profile'
                        onClick={() => handleSelectedTab(3)} />
                </Link>
            </div>
            <div>
                <Button className='nav-button' text='Logout' />
            </div>
        </div>
    )
}

export default LeftPanel