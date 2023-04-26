import React from "react";

import ObjectInfo from "./ObjectInfo";
import DataUsageGraph from "./DataUsageGraph";
import "../styles/Dashboard.css";

export default function Overview() {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			<div>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<ObjectInfo text={"Buckets"} count={"1"}></ObjectInfo>
					<ObjectInfo text={"Total Objects"} count={"1"}></ObjectInfo>
					<ObjectInfo text={"Total Storage"} count={"1"}></ObjectInfo>
				</div>

				<div className="datausage-graph">
					<DataUsageGraph graphlabel={"Storage"} />
				</div>
			</div>
			<div></div>
		</div>
	);
}
