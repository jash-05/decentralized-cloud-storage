const storj = require("uplink-nodejs");
const libUplink = new storj.Uplink();
const fs = require("fs");

var satelliteURL = "12EayRS2V1kEsWESU9QMRseFhdxYxKicsiFmxrsLZHeLUtdps3S@us1.storj.io:7777";
var apiKey = "1dfHxfBQEwMbpqjE7hyKtTbykigSBkzgq7uCFr99K2YFDNvcSS9q4i5KA7QUBcs1rULjbU84496owoqNpA5yMrjLqMdG1cbRL5AbHrjor9r5Lm1hBGPU";
var encryptionPassphrase = "grape grape crawl angle squirrel symbol common pair bracket citizen funny sunset";
var bucketName = "test2"; 
var uploadPath = "Lab2.pdf"; //File path to be uploaded.

var config = new storj.Config();
var localFullFileName = {
    src : "/Users/surbhidogra/Desktop/TestStorJAPI/decentralized-cloud-storage/test-storj/Lab2.pdf",
	};

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

const uploadFileToStorJ = async(projectObject) =>{
	//upload a file
	console.log("Getting Upload Object....");
    var uploadOptions = new storj.UploadOptions();

    uploadOptions.expires = 0;

    //Uploading object on storj V3 network
    await projectObject.uploadObject(bucketName,uploadPath,uploadOptions).then(async (upload) => {
        console.log(localFullFileName.src, " File: UPLOADED as ", uploadPath, "!");
        var fileHandle = await fs.openSync(localFullFileName.src, "rs");
        var size = {
            file            : `${await fs.statSync(localFullFileName.src).size}`,
            toWrite         : 0,
            actuallyWritten : 0,
            totalWritten    : 0
        };
		var BUFFER_SIZE = 80000;
        var buffer = new Buffer.alloc(BUFFER_SIZE);
        var loop = true;
        var bytesRead = 0;

        while (loop) {

            size.toWrite = size.file - size.totalWritten;

            if (size.toWrite > BUFFER_SIZE) {
                size.toWrite = BUFFER_SIZE;
            } else if (size.toWrite === 0) {
                break;
            }
            bytesRead = await fs.readSync(fileHandle, buffer, 0, size.toWrite, size.totalWritten);
            await upload.write(buffer,bytesRead).then((writeResult) => {
                size.actuallyWritten = writeResult.bytes_written;
                size.totalWritten = size.totalWritten + size.actuallyWritten;
                if((size.totalWritten>0)&&(size.file>0)){
                    console.log("File Uploaded On Storj  : ",((Number(size.totalWritten)/Number(size.file))*100).toFixed(4)," %");
                }
            }).catch((err) => {
                console.log("Failed to write data on storj V3 network");
                console.log(err);
                loop = false;
            });
            if(size.totalWritten>=size.file){
                break;
            }
        }

		var customMetadataEntry1 =new storj.CustomMetadataEntry();
        customMetadataEntry1.key = "testing";
        customMetadataEntry1.key_length = customMetadataEntry1.key.length;
        customMetadataEntry1.value = "testing1";
        customMetadataEntry1.value_length = customMetadataEntry1.value.length;
        
        var customMetadataEntry2 =new storj.CustomMetadataEntry();
        customMetadataEntry2.key = "value";
        customMetadataEntry2.key_length = customMetadataEntry2.key.length;
        customMetadataEntry2.value = "value1";
        customMetadataEntry2.value_length = customMetadataEntry2.value.length;
        
        var customMetadataEntryArray = [
        customMetadataEntry1,
        customMetadataEntry2
];
        var customMetadata = new storj.CustomMetadata();
        customMetadata.count = customMetadataEntryArray.length;
        customMetadata.entries = customMetadataEntryArray;

        await upload.setCustomMetadata(customMetadata).then(() => {
            console.log("\nCustom Metadata set successfully");
        }).catch((err) => {
            console.log("Failed to set custom metadata");
            console.log(err);
        });
        //Commiting object on storj V3 network
        await upload.commit().then(() => {
            console.log("\n Object on storj V3 network successfully");
        }).catch((err) => {
            console.log("Failed to commit object on storj V3 network");
            console.log(err);
        });
        //Fetching info of uploaded object on storj V3 network
        await upload.info().then((object) => {
            console.log("\nObject Info");
            console.log("Object Name : ",object.key,"\nObject Size : ",object.system.content_length);
        }).catch((err) => {
            console.log("Failed to fetch information about object");
            console.log(err);
        });

        fs.closeSync(fileHandle);
    }).catch((err) => {
        console.log("Failed to upload object on storj V3");
        console.log(err);
});

};

const deleteFileToStorJ = async(projectObject) =>{
	await projectObject.deleteObject(bucketName,uploadPath).then((objectInfo) => {
		console.log("\nObject Deleted successfully !!");
		console.log("Object Name : ",objectInfo.key,"Object Size : ",objectInfo.system.content_length);
	}).catch((err) => {
		console.log("Failed to delete object on storj V3 network using shared access");
		console.log(err);
	});
}





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
	//const uploadObjectStorJ = await uploadFileToStorJ(projectObject);
	//const deleteObjectStorJ = await deleteFileToStorJ(projectObject);
};

run();



