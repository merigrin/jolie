/**
 * TransactionsController
 *
 * @description :: Server-side actions for handling transaction requests.
 */
var csvjson = require('csvjson');								// using csvjson- converts csv data to json
var fs = require('fs');											// using fs- file system module allows you to work with the file system

module.exports = {
	uploadTransaction: uploadTransactionAction,
	saveUploadedCSV: saveUploadedCSVAction,
	redirectUpload: redirectUploadAction
};

/**
 * @description :: shows the upload csv view page
 * @return :: upload csv view file using res variable
 */
async function uploadTransactionAction(req, res) {
	return res.view("pages/transactions");
}

/**
 * @description :: saves the uploaded CSV in the uploads folder
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: CSV data in JSON format & folder path using res
 */
async function saveUploadedCSVAction(req, res) {	
	var localPath = req.localPath;

	if (localPath != '' && localPath != null && "undefined" !== typeof localPath) {

		var appPath = sails.config.appPath; 				//returns CWD upto root path
		var folderPath = sails.config.custom.filePath; 		//return folder path from root path - assets/uploads/

		var fileName = localPath.replace(appPath + folderPath, '');

		var fullPath = appPath + folderPath;
		var data = fs.readFileSync(fullPath + fileName, {
			encoding: 'utf8'
		});													//Reads the file from the given path
		var options = {
			delimiter: ',', 
			quote: '"'
		};

		var jsonData = csvjson.toArray(data, options);		//converts the CSV data to arrray
		
		return res.view("pages/transactions", {
			jsonData: jsonData,
			localPath: req.localPath
		});
	} else {
		res.redirect("/transactions");
	}
}

/**
 * @description :: redirect the page after the post file got refreshed
 * @return :: mass pay list page view file using res variable
 */
async function redirectUploadAction(req, res) {
	res.redirect("/massPayList");
}