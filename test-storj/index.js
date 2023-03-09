const storj = require("uplink-nodejs");
const libUplink = new storj.Uplink();
const fs = require("fs");

// const satelliteURL = "12EayRS2V1kEsWESU9QMRseFhdxYxKicsiFmxrsLZHeLUtdps3S@us1.storj.io:7777";
// const apiKey = "1dfHxfBQEwMbpqjE7hyKtTbykigSBkzgq7uCFr99K2YFDNvcSS9q4i5KA7QUBcs1rULjbU84496owoqNpA5yMrjLqMdG1cbRL5AbHrjor9r5Lm1hBGPU";
// const encryptionPassphrase = "grape grape crawl angle squirrel symbol common pair bracket citizen funny sunset";

const localFullFilePath = {
	// src : "change-me-to-source-file-name-at-local-system",
	dest: "/Applications/projects/decentralized-cloud-storage/test-storj/sample files/",
};

const config = new storj.Config();

const requestAccess = async (
	config,
	satelliteURL,
	apiKey,
	encryptionPassphrase
) => {
	try {
		const access = await libUplink.configRequestAccessWithPassphrase(
			config,
			satelliteURL,
			apiKey,
			encryptionPassphrase
		);
		return access;
	} catch (err) {
		console.log(`Error occured during function requestAccess: ${err}`);
	}
};

const openProject = async (accessObject) => {
	try {
		const project = await accessObject.openProject();
		return project;
	} catch (err) {
		console.log(`Error occured during function openProject: ${err}`);
	}
};

const listBuckets = async (listBucketsOptions, projectObject) => {
	try {
		const bucketListResult = await projectObject.listBuckets(
			listBucketsOptions
		);
		return bucketListResult;
	} catch (err) {
		console.log(`Error occured during function listBuckets: ${err}`);
	}
};

const listObjects = async (projectObject, bucketName, ListObjectsOptions) => {
	try {
		const objectList = await projectObject.listObjects(
			bucketName,
			ListObjectsOptions
		);
		return objectList;
	} catch (err) {
		console.log(`Error occured during function listObjects: ${err}`);
	}
};

const downloadFile = async (project, bucketName, objectKey) => {
	const BUFFER_SIZE = 7408;
	let downloadOptions = new storj.DownloadOptions();
	downloadOptions.offset = 0;
	downloadOptions.length = -1;
	try {
		const downloadObject = await project.downloadObject(
			bucketName,
			objectKey,
			downloadOptions
		);
		console.log("Fetching download object info");
		const objectInfo = await downloadObject.info();
		const objectSize = objectInfo.system.content_length;
		const size = {
			download: 0,
			actuallyWritten: 0,
			totalWritten: 0,
		};
		let buffer = new Buffer.alloc(BUFFER_SIZE);
		const fileHandle = await fs.openSync(
			localFullFilePath.dest + objectKey,
			"w"
		);
		let loop = true;
		while (loop) {
			if (
				objectSize - size.totalWritten > 0 &&
				objectSize - size.totalWritten < BUFFER_SIZE
			) {
				buffer = null;
				buffer = new Buffer.alloc(objectSize - size.totalWritten);
			}
			const bytesRead = await downloadObject.read(buffer, buffer.length);
			size.download = bytesRead.bytes_read;
			size.actuallyWritten = await fs.writeSync(
				fileHandle,
				buffer,
				0,
				size.downloaded,
				size.totalWritten
			);
			size.totalWritten = size.totalWritten + size.actuallyWritten;
			if (size.actuallyWritten >= objectSize) {
				loop = false;
			}
			if (size.totalWritten > 0 && objectSize > 0) {
				console.log(
					`File Downloaded: ${(
						(Number(size.totalWritten) / Number(objectSize)) *
						100
					).toFixed(4)}`
				);
			}
			if (size.totalWritten >= objectSize) {
				break;
			}
		}
		fs.closeSync(fileHandle);
		try {
			let successfulDownload = await downloadObject.close();
		} catch (err) {
			console.log(`Error while downloading object: ${err}`);
		}
	} catch (err) {
		console.log(`Error while downloading object: ${err}`);
	}
};

const run = async () => {
	const accessObject = await requestAccess(
		config,
		satelliteURL,
		apiKey,
		encryptionPassphrase
	);
	const projectObject = await openProject(accessObject);
	const listBucketsOptions = new storj.ListBucketsOptions();
	const bucketList = await listBuckets(listBucketsOptions, projectObject);
	const listObjectsOptions = new storj.ListObjectsOptions();
	console.log(JSON.stringify(bucketList));
	for (const property in bucketList["bucketList"]) {
		const bucketName = bucketList["bucketList"][property]["name"];
		console.log(`Bucket Name: ${bucketName}`);
		const objectList = await listObjects(
			projectObject,
			bucketName,
			listObjectsOptions
		);
		console.log(JSON.stringify(objectList));
	}
	// await downloadFile(projectObject, "demo-bucket", "[David_Stone_Potter]_The_Emperors_of_Rome__The_Sto(z-lib.org) 2.epub");
	await downloadFile(projectObject, "test2", " (1)279_01.pdf");
};

run();
