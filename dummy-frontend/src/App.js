import logo from "./logo.svg";
import "./App.css";
import { axios, useState } from "react";

function App() {
	const [file, setFile] = useState();

	const handleFileChange = (e) => {
		console.log(e.target);
		setFile(e.target.files[0]);
	};

	const handleFileUpload = () => {
		console.log(file);
	};

	return (
		<div className="App">
			{/* <header className="App-header"></header> */}
			<input
				type="file"
				id="myFile"
				name="filename"
				onChange={handleFileChange}
			/>
			<button type="submit">Upload File</button>
		</div>
	);
}

export default App;
