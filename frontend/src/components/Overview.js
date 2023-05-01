import React from "react";

import ObjectInfo from "./ObjectInfo";
import DataUsageGraph from "./DataUsageGraph";
import "../styles/Dashboard.css";

export default function Overview({ data }) {

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			<div>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<ObjectInfo text={"Buckets"} count={data?.totalBuckets}></ObjectInfo>
					<ObjectInfo text={"Total Objects"} count={data?.totalNumberOfFiles}></ObjectInfo>
					<ObjectInfo text={"Total Storage"} count={data?.totalStorageUsed}></ObjectInfo>
				</div>

				<div className="datausage-graph">
					<DataUsageGraph graphlabel={"Storage"} />
				</div>
			</div>
			<div></div>
		</div>
	);
}
