import React from "react";
import Overview from "../../components/Overview";
import "../../styles/Dashboard.css";

const Dashboard = () => {
	return (
		<div className="dashboard-wrapper">
			<h1 className="dashboard-header">Dashboard</h1>
			<Overview />
		</div>
	);
};

export default Dashboard; 
