import React from "react";

const Button = ({ text, onClick, style, type }) => {
    return (
        <button className="button" style={style} onClick={onClick} type={type}>
            {text}
        </button>
    );
};

export default Button;