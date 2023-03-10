import process from "process";
import minimist from "minimist";
import { Web3Storage, getFilesFromPath } from "web3.storage";

function getAccessToken() {
	return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRmRTRDNzlFMDE4N0FGZTUwYzc4NThGMDA4Qjg1NjRBQjgyQTAyQWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzcwMTk3NDQ0MDEsIm5hbWUiOiJ0b2tlbjEifQ.fwZ32m9DWpMhZlxw810lVWj3XMRjBVr2LxYHZSxFF2g";
}

async function main() {
	const args = minimist(process.argv.slice(2));
	const token = getAccessToken();

	const storage = new Web3Storage({ token });
	const files = [];

	const path = "SSC.png";
	const pathFiles = await getFilesFromPath(path);
	files.push(...pathFiles);

	console.log(`Uploading ${files.length} files`);
	const cid = await storage.put(files);
	console.log("Content added with CID:", cid);
}

main();
