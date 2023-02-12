const storj = require("uplink-nodejs");
const libUplink = new storj.Uplink();

var satelliteURL = "12EayRS2V1kEsWESU9QMRseFhdxYxKicsiFmxrsLZHeLUtdps3S@us1.storj.io:7777";
var apiKey = "1dfHxfBQEwMbpqjE7hyKtTbykigSBkzgq7uCFr99K2YFDNvcSS9q4i5KA7QUBcs1rULjbU84496owoqNpA5yMrjLqMdG1cbRL5AbHrjor9r5Lm1hBGPU";
var encryptionPassphrase = "grape grape crawl angle squirrel symbol common pair bracket citizen funny sunset";

var config = new storj.Config();

const requestAccess = async (config, satelliteURL, apiKey, encryptionPassphrase) => {
	try {
		const access = await libUplink.configRequestAccessWithPassphrase(config, satelliteURL, apiKey, encryptionPassphrase);
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
		const bucketListResult = await projectObject.listBuckets(listBucketsOptions);
		return bucketListResult;
	} catch (err) {
		console.log(`Error occured during function listBuckets: ${err}`);
	}
};

const listObjects = async (projectObject, bucketName, ListObjectsOptions) => {
	try {
		const objectList = await projectObject.listObjects(bucketName, ListObjectsOptions);
		return objectList;
	} catch (err) {
		console.log(`Error occured during function listObjects: ${err}`);
	}
};

const run = async () => {
	const accessObject = await requestAccess(config, satelliteURL, apiKey, encryptionPassphrase);
	const projectObject = await openProject(accessObject);
	const listBucketsOptions = new storj.ListBucketsOptions();
	const bucketList = await listBuckets(listBucketsOptions, projectObject);
	const listObjectsOptions = new storj.ListObjectsOptions();
	console.log(JSON.stringify(bucketList));
	for (const property in bucketList["bucketList"]) {
		const bucketName = bucketList["bucketList"][property]["name"];
		console.log(`Bucket Name: ${bucketName}`);
		const objectList = await listObjects(projectObject, bucketName, listObjectsOptions);
		console.log(JSON.stringify(objectList));
	}
};

run();
