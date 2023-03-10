import { Web3Storage } from "web3.storage";

function getAccessToken() {
	return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRmRTRDNzlFMDE4N0FGZTUwYzc4NThGMDA4Qjg1NjRBQjgyQTAyQWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzcwMTk3NDQ0MDEsIm5hbWUiOiJ0b2tlbjEifQ.fwZ32m9DWpMhZlxw810lVWj3XMRjBVr2LxYHZSxFF2g";
}

function makeStorageClient() {
	return new Web3Storage({ token: getAccessToken() });
}

async function retrieveFiles(cid) {
	const client = makeStorageClient();
	const res = await client.get(cid);
	console.log(`Got a response! [${res.status}] ${res.statusText}`);
	if (!res.ok) {
		throw new Error(
			`failed to get ${cid} - [${res.status}] ${res.statusText}`
		);
	}

	// unpack File objects from the response
	const files = await res.files();
	for (const file of files) {
		console.log(`${file.cid} -- ${file.path} -- ${file.size}`);
	}
}

async function listFiles() {
	const client = makeStorageClient();
	for await (const upload of client.list()) {
		console.log(
			`${upload.name} - cid: ${upload.cid}  - size: ${upload.dagSize}`
		);
	}
}

//retrieveFiles("bafybeiacwuuu7vw7d6mtftap2ell3n62i6wrvbgddkmhiqgy3wjohwxplu");
// listFiles()

import fs from "fs";
import request from "request";

const downloadFile = (fileURL, localPath) => {
	request
		.get(fileURL)
		.pipe(fs.createWriteStream(localPath))
		.on("finish", function () {
			console.log("Download complete");
		});
};

downloadFile(
	"https://bafybeiacwuuu7vw7d6mtftap2ell3n62i6wrvbgddkmhiqgy3wjohwxplu.ipfs.w3s.link/SSC_2.png",
	"sample-files/test_01.png"
);
