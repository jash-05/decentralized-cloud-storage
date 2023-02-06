const storj = require("uplink-nodejs");
const libUplink = new storj.Uplink();

//
var satelliteURL = "<SATELLITE URL>";
var apiKey = "<API KEY>";
var encryptionPassphrase = "<BUCKET ENCRYPTION PASSPHRASE>";

var config = new storj.Config();
libUplink
	.configRequestAccessWithPassphrase(
		config,
		satelliteURL,
		apiKey,
		encryptionPassphrase
	)
	.then((access) => {
		console.log("Access granted: " + access);
		access
			.openProject()
			.then(async (project) => {
				console.log("Project opened: " + project);
				var listBucketsOptions = new storj.ListBucketsOptions();
				var bucketName = "demo-bucket";

				// Upload file
				var objectName = "test node.js upload";
				var uploadOptions = new storj.UploadOptions();
				await project
					.uploadObject(bucketName, objectName, uploadOptions)
					.then(async (upload) => {
						console.log("Upload: " + JSON.stringify(upload));
						// creating buffer to store data.data will be stored in buffer that needs to be uploaded
						var buffer = new Buffer.alloc(BUFFER_SIZE);
						await upload
							.write(buffer, buffer.length)
							.then((writeResult) => {
								console.log(
									"Write: " + JSON.stringify(writeResult)
								);
							})
							.catch((err) => {
								console.log(
									"Error occured while write: " + err
								);
							});
					})
					.catch((err) => {
						console.log(
							"Error occured while uploading file: " + err
						);
					});
			})
			.catch((err) => {
				console.log("Error occured while opening project: " + err);
			});
	})
	.catch((err) => {
		console.log("Error occured while granting access: " + err);
	});
