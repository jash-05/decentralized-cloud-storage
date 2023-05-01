import React from "react";

export default function ObjectInfo({ text, count }) {
	return (
		<div
			style={{
				backgroundColor: "white",
				overflow: "hidden",
				boxShadow: "initial",
				borderRadius: "0.5rem",
				overflow: "hidden",
				margin: "40px",
			}}
		>
			<div style={{ padding: 60 }}>
				<div style={{ marginLeft: "5", flex: "1" }}>
					<b>
						{text} : {count}
					</b>
				</div>
			</div>
		</div>
	);
}
