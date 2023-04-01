import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import axios, * as others from 'axios';

function App() {
	const [file, setFile] = useState();


	const handleFileChange = (e) => {
		console.log(e.target.files[0]);
		setFile(e.target.files[0]);
	};

	const handleFileUpload = async (event) => {

		console.log(file);
		event.preventDefault()
		const formData = new FormData();
		formData.append("myFile", file);
		try {
		  const response = await axios({
			method: "post",
			url: "http://localhost:8080/upload",
			data: formData,
			headers: { "Content-Type": "multipart/form-data" },
		  });
		} catch(error) {
		  console.log(error)
		}
	};

	const handleDownloadFile = async() =>{
		const res = await axios("http://localhost:8080/download", {params: {fileName: "Starry Night Paint Wallpaper.png"}})
		console.log(res)
	}


	return (
		<div className="App">
			{/* <header className="App-header"></header> */}
			<input
				type="file"
				id="myFile"
				name="filename"
				onChange={handleFileChange}
			/>
			<button type="submit" onClick={handleFileUpload}>Upload File</button>

			<button onClick={handleDownloadFile}> Download</button>
		</div>
	);
}

export default App;
