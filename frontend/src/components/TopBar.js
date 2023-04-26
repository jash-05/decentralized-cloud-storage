import React from "react";
import logo from "./logo.svg"; // import the logo image

// define a functional component called NavBar
function NavBar(props) {
	// return the JSX code for the navigation bar
	return (
		<div className="nav-bar">
			{" "}
			// use a div element with a class name of nav-bar
			<img src={logo} alt="logo" className="logo" /> // use an img element
			to display the logo with a class name of logo
			<p className="nav-message">Welcome User!</p> // use a p element with
			a class name of nav-message to display the custom message
		</div>
	);
}

// export the component
export default NavBar;
