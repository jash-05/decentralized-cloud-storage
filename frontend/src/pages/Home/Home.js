import React from 'react'
import Banner from '../../components/Banner'
import '../../styles/Home.css'

const Home = () => {
    return (
        <div className='landing-page-wrapper'>
            <Banner style={{ color: "white" }} text="Decentralized Storage Made Easy" />
            <h2 style={{ color: 'white' }}>Store your files on the blockchain and access them anywhere.</h2>
        </div>
    )
}

export default Home