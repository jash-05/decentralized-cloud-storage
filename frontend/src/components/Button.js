import React from "react";

const Button = ({ text, onClick, style, type, icon }) => {
    return (
        <>
            <button className="button" style={style} onClick={onClick} type={type}>
                {icon}
                <label>
                    {text}
                </label>
            </button>
        </>
    );
};

export default Button;