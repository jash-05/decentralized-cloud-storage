import React, { useEffect, useRef } from "react";
// import ObjectInfo from "./ObjectInfo";
// import DataUsageGraph from "./DataUsageGraph";
// import CardLayers3d from "./CardLayers3d";
// import CountUp from 'react-countup'
// import CountUpAnim from "./CountUpAnim";
import "../styles/Dashboard.css";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CountUp } from 'use-count-up'
import { Typography } from "@mui/material";
import Graph from "./Graph";


export default function Overview({ data }) {
	const cardStyle = { borderRadius: "20px", boxShadow: "5px 5px 10px #70A1EB", justifyContent: "center", display: "flex", flexDirection: "column" }
	let storage = data?.totalStorageUsed
	return (
		<div
			style={{
				width: "100%",
				// height: "100%",
			}}
		>
			<div>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<Box
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							'& > :not(style)': {
								m: 1,
								width: 350,
								height: 200,
							},
							borderRadius: "200px",
						}}
					>
						{/* <CardLayers3d text={"Total Buckets"} target={data?.totalBuckets} />
						<CardLayers3d text={"Total Objects"} target={data?.totalNumberOfFiles} />
						<CardLayers3d text={"Total Storage"} target={data?.totalStorageUsed} /> */}
						<Paper style={cardStyle} elevation={3} >
							<Typography variant="h4" component="div" gutterBottom>
								Buckets
							</Typography>
							<div style={{ fontSize: "48px" }}>
								<CountUp style={{ fontSize: "20px" }} isCounting end={data?.totalBuckets} duration={1.2} />
							</div>
						</Paper>
						<Paper style={cardStyle} elevation={3} >
							<Typography variant="h4" component="div" gutterBottom>
								Objects
							</Typography>
							<div style={{ fontSize: "48px" }}>
								<CountUp style={{ fontSize: "20px" }} isCounting end={data?.totalNumberOfFiles} duration={1.2} />
							</div>
						</Paper>
						<Paper style={cardStyle} elevation={3} >
							<Typography variant="h4" component="div" gutterBottom>
								Storage (GB)
							</Typography>
							<div style={{ fontSize: "48px" }}>
								<CountUp style={{ fontSize: "20px" }} isCounting end={(Math.round((storage + Number.EPSILON) * 100) / 100)} duration={1.2} />
							</div>
						</Paper>
						{/* <CountUpAnim target={data?.totalBuckets} /> */}

					</Box>
					{/* <ObjectInfo text={"Buckets"} count={data?.totalBuckets}></ObjectInfo>
					<ObjectInfo text={"Total Objects"} count={data?.totalNumberOfFiles}></ObjectInfo>
					<ObjectInfo text={"Total Storage"} count={data?.totalStorageUsed}></ObjectInfo> */}

				</div>

				<div className="datausage-graph">

					<Graph />
				</div>
			</div>
			<div></div>
		</div>
	);
}
