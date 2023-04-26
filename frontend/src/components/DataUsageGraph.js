import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function Graph({ graphlabel }) {
	const chartRef = useRef(null);

	useEffect(() => {
		const chartNode = chartRef.current.getContext("2d");

		//Generating an array for last 5 dates
		const today = new Date();
		const labels = [];

		for (let i = 0; i < 5; i++) {
			const date = new Date(today);
			date.setDate(date.getDate() - 1);
			const dateString = date.toISOString().slice(0, 10);
			labels.push(dateString);
		}

		const chart = new Chart(chartNode, {
			type: "line",
			data: {
				labels: labels,
				datasets: [
					{
						label: graphlabel,
						data: [10, 20, 0, 0, 15, 5],
						borderColor: "blue",
						backgroundColor: "transparent",
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					labels: [
						{
							ticks: {
								beginAtZero: true,
							},
							scaleLabel: {
								display: true,
								labelString: "storage in bytes",
							},
						},
					],

					datasets: [
						{
							scaleLabel: {
								display: true,
								labelString: "Date",
							},
						},
					],
				},
			},
		});

		return () => {
			chart.destroy();
		};
	}, []);

	return (
		<div>
			<canvas ref={chartRef} />
		</div>
	);
}

export default Graph;
