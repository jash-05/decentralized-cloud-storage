import React, { useEffect, useState } from "react";
import Overview from "../../components/Overview";
import "../../styles/Dashboard.css";
import axios from "axios";

const Dashboard = () => {
	const [userData, setUserData] = useState({});

	const getDashboardDetails = async () => {
		const response = await axios("http://localhost:8081/renter/getProfile", { params: { renterId: localStorage.getItem('renterId') } });
		console.log(response.data.renter)
		setUserData(response.data.renter);
	}

	useEffect(() => {
		getDashboardDetails();
	}, []);
	return (

		<div className="dashboard-wrapper">
			<h1 style={{}} className="dashboard-header">Welcome {userData ? userData?.firstName : "User"}!</h1>
			<Overview data={userData} />
		</div>
	);
};

export default Dashboard;
