/**
 * MasspayController
 *
 * @description :: Server-side actions for handling Masspay requests.
 */
var csvjson = require('csvjson');								// using csvjson- converts csv data to json
//const json2csv = require('json2csv').parse;
var json2csv = require('json2csv').parse;								// using json2csv- converts json data to csv
var fs = require('fs');											// using fs- file system module allows you to work with the file system
var moment = require('moment');				// using moment for parsing, validating, manipulating, and formatting dates

module.exports = {
	uploadTransaction: uploadTransactionAction,
	saveUploadedCSV: saveUploadedCSVAction,
	redirectUpload: redirectUploadAction,
	getCSVFile: getCSVFileAction
};

/**
 * @description :: shows the upload csv view page
 * @return :: upload csv view file using res variable
 */
async function uploadTransactionAction(req, res) {
	
	var criteria = {user_id: req.session.AdminuserId};

    Group
        .find(criteria)
        .then(function(groupDetails) {
		
		//sails.log.info("groupDetails--",groupDetails);
		
		return res.view("pages/transactions",{groupDetails:groupDetails});
	});
}

async function getCSVFileAction(req, res) {

    var appPath = sails.config.appPath; //returns CWD upto root path
    var folderPath = sails.config.custom.filePath; //return folder path from root path - assets/uploads/
    var fullPath = appPath + folderPath;
	
	if (!fs.existsSync(fullPath)){
		fs.mkdirSync(fullPath);
	}
	var groupId = req.body.groupId;
	var parsedData;
	if(groupId!=0) {
		await Group
			.find({id:groupId})
			.then(async function(groupDetails) {
					//sails.log.info("groupDetails--",groupDetails);	   
					
					sails.log.info("groupDetailsid--",groupDetails[0]['customer_id']);	 
					
					parsedData = JSON.parse(JSON.parse(JSON.stringify(groupDetails[0]['customer_id'])));
					
					sails.log.info("parsedData--",parsedData);	
					
					
			});
	}
	
	var parsedDatadet=[];
	if (groupId!=0){
		 for(k in parsedData){
			parsedDatadet.push(parsedData[k]);
		}
		var criteria = {
			user_id: req.session.AdminuserId,
			fundurl: { '!=': '' },
			dkey: req.session.key,
			dsecret: req.session.secret,
			dtype: req.session.type,
			id  : { in: parsedDatadet }
		};
	} else {
		var criteria = {
			user_id: req.session.AdminuserId,
			fundurl: { '!=': '' },
			dkey: req.session.key,
			dsecret: req.session.secret,
			dtype: req.session.type
		};
		
	}
	
    Customer
        .find(criteria)
        .then(function(userDetails) {
            var csvAccountData = [];
			
			var item1 = {
                    SNo: '',
                    user_id: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    fundurl: '',
                    amount: 0.00
                };
                

            userDetails.forEach(function(userDetails, loopvalue) {
                var item = {
                    SNo: loopvalue+1,
                    user_id: userDetails.id,
                    firstName: userDetails.firstName,
                    lastName: userDetails.lastName,
                    email: userDetails.email,
                    fundurl: userDetails.fundurl,
                    amount: 0.00
                };
                csvAccountData.push(item);
            });
		
			if (csvAccountData.length == 0) {
				csvAccountData.push(item1);	
			}
            /*writes the array in CSV file*/
            var newLine = "\r\n";
			var momentTime = moment().tz("America/New_York").format("YYYY-MM-DD-hh-mm-ss");
            var creditFilename = fullPath + "csv_" + momentTime + ".csv";

            var creditCsv = json2csv(csvAccountData) + newLine;

            fs.writeFile(creditFilename, creditCsv, function(err) {
                if (err) {
                    sails.log.error("captureResponseAction :: Error", err);
					
					var json = {
						status: 400,
						err: err
					};			
					res.contentType('application/json');
					res.json(json);
                } else {
                    sails.log.info("File created!");
                    sails.log.info("creditFilename==>", creditFilename);
					
					creditFilename = creditFilename.split("/");
					creditFilename = creditFilename[creditFilename.length-1];
					
					if (!fs.existsSync(appPath+ "/.tmp/public/uploads/")){
						fs.mkdirSync(appPath+ "/.tmp/public/uploads/");
					}
					var creditFilename2 = appPath+ "/.tmp/public/uploads/" + "csv_" + momentTime + ".csv";

            		var creditCsv = json2csv(csvAccountData) + newLine;
					
					fs.writeFile(creditFilename2, creditCsv, function(err) {
								if (err) {
									sails.log.error("captureResponseAction2 :: Error", err);
									var json = {
										status: 400,
										err: err
									};			
									res.contentType('application/json');
									res.json(json);
								} else {
									sails.log.info("creditFilename2==>", creditFilename2);
								}
																	 
					 });
					
					
					
				  	var json = {
						status: 200,
						csvFileName: creditFilename
					};			
					res.contentType('application/json');
					res.json(json);
                }
            });
			
			

        });
}

/**
 * @description :: saves the uploaded CSV in the uploads folder
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: CSV data in JSON format & folder path using res
 */
async function saveUploadedCSVAction(req, res) {	
	var localPath = req.localPath;
	
	var allParams = req.allParams();
	var batchType = req.param('batchType');

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
		
		var custIDs = [];		
		for (i = 0; i < jsonData.length; i++) {
			if(i!=0) {		
				var jsonDataString = jsonData[i].toString();
				var jsonArray = jsonDataString.split(',');	
				//sails.log.info("jsonArray[2]---",jsonArray[1]);
				custIDs.push(jsonArray[1]);					// pushes the customer Id from CSV to array
			}
		}
		
		var customerObj = Object.assign({}, custIDs);	
		customerObj = JSON.stringify(customerObj);			//Customer ID in json format
		
		
		return res.view("pages/transactions", {
			jsonData: jsonData,
			batchType: batchType,
			customerObj: customerObj,
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