import React from "react";

const Button = ({ text, onClick, style, type }) => {
    return (
        // <div className="button">
        <button className="button" style={style} onClick={onClick} type={type}>
            {text}
        </button>
        // </div>
    );
};

export default Button;