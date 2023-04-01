import React from 'react'
import Banner from '../../components/Banner'
import '../../styles/Home.css'

const Home = () => {
    return (
        <div className='landing-page-wrapper'>
            <Banner text="Decentralized Storage Made Easy" />
            <p>Store your files on the blockchain and access them anywhere.</p>
        </div>
    )
}

export default Home