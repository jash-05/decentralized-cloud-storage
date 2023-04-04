import React from 'react'

const Banner = ({ text, style }) => {
    return (
        <div className='banner-heading' style={style}>{text}</div>
    )
}

export default Banner