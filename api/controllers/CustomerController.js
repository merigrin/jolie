/**
 * CustomerController
 *
 * @description :: Server-side actions for handling customer requests.
 */
var csvjson = require('csvjson');								// using csvjson- converts csv data to json
var dwolla = require('dwolla-v2');							// using Dwolla V2 Node client module
var json2csv = require('json2csv').parse;								// using json2csv- converts json data to csv
var fs = require('fs');											// using fs- file system module allows you to work with the file system
var moment = require('moment');				// using moment for parsing, validating, manipulating, and formatting dates


module.exports = {
	listCustomers: listCustomersAction,
	ajaxcustomerlist: ajaxcustomerlistAction,
	addcustomers: addcustomersAction,
	manualfund: manualfundAction,
	microDeposits: microDepositsAction,
	Customerstatus:CustomerstatusAction,
	banknew:banknewAction,
	uploadCustomer: uploadCustomerAction,
	saveUploadedCustomerCSV: saveUploadedCustomerCSVAction,
	redirectCustomerUpload: redirectCustomerUploadAction,
	massCustomerSave: massCustomerSaveAction
};

/**
 * @description :: Calls the view file to show the customer list 
 * @return :: customer list page view file using res variable
 */
async function listCustomersAction(req, res) {
	return res.view("pages/customerList");
}

/**
 * @description :: fetches the customer list for particular logged in user via ajax call
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: json variable which will capure the desired result
 */
async function ajaxcustomerlistAction(req, res) {
	//Sorting
	var colS = "";

	if (req.query.sSortDir_0 == 'desc') {
		sorttype = -1;
	} else {
		sorttype = 1;
	}
	switch (req.query.iSortCol_0) {
		case '0':
			var sorttypevalue = {
				'id': sorttype
			};
			break;
		case '1':
			var sorttypevalue = {
				'firstName': sorttype
			};
			break;
		case '2':
			var sorttypevalue = {
				'lastName': sorttype
			};
			break;
		case '3':
			var sorttypevalue = {
				'email': sorttype
			};
			break;
		case '4':
			var sorttypevalue = {
				'businessName': sorttype
			};
			break;
		default:
			break;
	};

	//Search
	if (req.query.sSearch) {
		var criteria = {
			user_id: req.session.AdminuserId,
			dkey: req.session.key,
			dsecret: req.session.secret,
			dtype: req.session.type,
			or: [{
				firstName: {
					'contains': req.query.sSearch
				}
			}, {
				lastName: {
					'contains': req.query.sSearch
				}
			}, {
				businessName: {
					'contains': req.query.sSearch
				}
			}, {
				email: {
					'contains': req.query.sSearch
				}
			}]
		};

	} else {
		var criteria = {
			user_id: req.session.AdminuserId,
			dkey: req.session.key,
			dsecret: req.session.secret,
			dtype: req.session.type
		};
	}

	Customer
		.find(criteria)
		.sort(sorttypevalue)
		.then(function(userDetails) {

			//Filter user details not available
			userDetails = _.filter(userDetails, function(item) {
				if (item.email != '' && item.email != null) {
					return true;
				}
			});

			totalrecords = userDetails.length;
			//Filter by limit records
			skiprecord = parseInt(req.query.iDisplayStart);
			checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
			if (checklimitrecords > totalrecords) {
				iDisplayLengthvalue = parseInt(totalrecords);
			} else {
				iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
			}

			userDetails = userDetails.slice(skiprecord, iDisplayLengthvalue);

			var userData = [];

			userDetails.forEach(function(userinfo, loopvalue) {
				loopid = loopvalue + skiprecord + 1;
				//userinfo.createdAt = moment(userinfo.createdAt).format('MM-DD-YYYY hh:mm:ss');

				if ("undefined" === typeof userinfo.firstName || userinfo.firstName == '' || userinfo.firstName == null) {
					userinfo.firstName = '--';
				}

				if ("undefined" === typeof userinfo.lastName || userinfo.lastName == '' || userinfo.lastName == null) {
					userinfo.lastName = '--';
				}

				if ("undefined" === typeof userinfo.email || userinfo.email == '' || userinfo.email == null) {
					userinfo.email = '--';
				}

				if ("undefined" === typeof userinfo.businessName || userinfo.businessName == '' || userinfo.businessName == null) {
					userinfo.businessName = '--';
				}

				if ("undefined" === typeof userinfo.fundurl || userinfo.fundurl == '' || userinfo.fundurl == null) {
					userinfo.fundurl = '--';
				}

				var actiondata = '--';


				if (userinfo.isDeleted==true) {
							var actiondata = '<button class="btn btn-default actionBtn" onclick="Active(\'' + userinfo.id + '\');">Active</button>';	
				} else {
				if (userinfo.status) {
					if (userinfo.microDeposits == '' || userinfo.microDeposits == 'processed') {
						var actiondata = '<button class="btn btn-default actionBtn" onclick="sendmoney(\'' + userinfo.id + '\');">Send Money</button> ';
					} else {
						var actiondata = '<button class="btn btn-default actionBtn" onclick="sendmoney(\'' + userinfo.id + '\');"  style="display:none">Send Money</button> <button class="btn btn-default actionBtn" id="micro' + userinfo.id + '" onclick="micro(\'' + userinfo.id + '\');">Micro Deposits</button> ';

					}

				} else {
					var actiondata = '<button class="btn btn-default actionBtn" onclick="setfunding(\'' + userinfo.id + '\');" id="fund' + userinfo.id + '">Add Funding Source</button> <button class="btn btn-default actionBtn" id="send' + userinfo.id + '" onclick="sendmoney(\'' + userinfo.id + '\');" style="display:none">Send Money</button><button class="btn btn-default actionBtn" id="micro' + userinfo.id + '" onclick="micro(\'' + userinfo.id + '\');" style="display:none">Micro Deposits</button>';
				}
				
				
				
				if (userinfo.microDeposits == '' || userinfo.microDeposits == 'processed') {
					var actiondata = actiondata + '<div class="dropdown"><img src="/images/3x.png" style="width:25px" ><div class="dropdown-content"><a href="javascript:void(0)" onclick="deActive(\'' + userinfo.id + '\');">Deactive Customer</a><a href="javascript:void(0)" onclick="setfunding(\'' + userinfo.id + '\');">Change Funding Source</a></div></div>';
				} else {
					var actiondata = actiondata + '<div class="dropdown"><img src="/images/3x.png" style="width:25px" ><div class="dropdown-content"><a href="javascript:void(0)" onclick="deActive(\'' + userinfo.id + '\');">Deactive Customer</a></div></div>';	
				}
				
				}
				
				userData.push({
					loopid: loopid,
					firstName: userinfo.firstName,
					lastName: userinfo.lastName,
					email: userinfo.email,
					businessName: userinfo.businessName,
					actiondata: actiondata
				});
			});
			var json = {
				sEcho: req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: userData
			};			
			res.contentType('application/json');
			res.json(json);

		});
}

/**
 * @description :: add customer based on the role
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function addcustomersAction(req, res) {

	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});
	var customer;
	
	
	
	
	
			
			
			
			await client.auth.client()
				.then(appToken => appToken.get('customers?search='+req.param('email')))
					.then(async function(csresult) {
						if (csresult.body.total == 0) {
							
							var userRecord1 = await Customer.find({
								email: req.param('email'),
								user_id:req.session.AdminuserId,
								dkey: req.session.key,
								dsecret: req.session.secret,
								dtype: req.session.type
							}).limit(1);
							
							
							var requestBody = {
								firstName: req.param('firstName'),
								lastName: req.param('lastName'),
								email: req.param('email'),
								type: 'receive-only',
								businessName: req.param('businessName'),
								ipAddress: req.ip
							};
							
							
							await client.auth.client()
							.then(appToken => appToken.post('customers', requestBody))
							.then(async function(customerresult) {	
								if (!userRecord1[0]) {					 
									var newcustomerRecord = await Customer.create(_.extend({
											email: req.param('email'),
											firstName: req.param('firstName'),
											lastName: req.param('lastName'),
											businessName: req.param('businessName'),
											type: 'receive-only',
											dkey: req.session.key,
											dsecret: req.session.secret,
											dtype: req.session.type,
											user_id: req.session.AdminuserId,
											dwollaid: customerresult.headers.get('location'),
											dwollaurl: customerresult.headers.get('location'),
											ipAddress: req.ip
										}))
										.intercept('E_UNIQUE', () => {
											
										})
										.intercept('UsageError', () => {
											
										})
										.intercept('E_INVALID_NEW_RECORD', () => {
											
										})
										.fetch();
									
										return res.status(200).send("Customer Created!");
									
							 } else {
								var newcustomerRecord =  userRecord1[0];
									return res.status(200).send("Customer Already Exists!");
							 }
							 
							
							 	
							
							})
							.catch(await
								function(err) {
									if (err.body) {
										if (err.body._embedded) {
											if (err.body._embedded.errors) {
												if (err.body._embedded.errors[0]) {
													return res.status(400).send(err.body._embedded.errors[0].message);
												}
											}
										}
									}
									return res.status(400).send("An error occured!");
					
								});
						
							
							
						} else {
							
								var cdwollaurl='';
								var cdwollaurlPath = '';
								if (csresult.body._embedded['customers'][0]._links.self){
									var cdwollaurl = csresult.body._embedded['customers'][0]._links.self.href
									var cdwollaurlPathArray = cdwollaurl.split("customers");
									cdwollaurlPath=cdwollaurlPathArray[0];
								}
								
								
								
								var userRecord1 = await Customer.find({
									email: req.param('email'),
									user_id:req.session.AdminuserId,
									dkey: req.session.key,
									dsecret: req.session.secret,
									dtype: req.session.type
								}).limit(1);
								
								if (!userRecord1[0]) {					 
									var newcustomerRecord = await Customer.create(_.extend({
											email: req.param('email'),
											firstName: req.param('firstName'),
											lastName: req.param('lastName'),
											businessName: req.param('businessName'),
											type: 'receive-only',
											dkey: req.session.key,
											dsecret: req.session.secret,
											dtype: req.session.type,
											user_id: req.session.AdminuserId,
											dwollaid: cdwollaurl,
											dwollaurl:cdwollaurl,
											ipAddress: req.ip
										}))
										.intercept('E_UNIQUE', () => {
											
										})
										.intercept('UsageError', () => {
											
										})
										.intercept('E_INVALID_NEW_RECORD', () => {
											
										})
										.fetch();
										return res.status(200).send("Customer Created!");
									
							 } else {
								var newcustomerRecord =  userRecord1[0];
								return res.status(200).send("Customer Already Exists!");
							 }
							
							
							 
						
						}
						
					})
	
				
		
	
	
}

/**
 * @description :: fetches the status of micro deposit and updates in customer table
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function microDepositsAction(req, res) {
	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});	
	var userRecord = await Customer.findOne({
		id: req.param('customer_id'),
	});
	if (!userRecord) {
		return res.status(400).send("Customer not found!");
	}
	var fundingSourceUrl = userRecord.fundurl;
	await client.auth.client()
		.then(appToken => appToken.get(`${fundingSourceUrl}/micro-deposits`))
		.then(async function(result) {
			var status1 = true;
			if (result.body.status == 'failed') {
				var status1 = false;
			}
			await Customer.updateOne(req.param('customer_id'))
				.set({
					status: status1,
					fundurl: fundingSourceUrl,
					microDeposits: result.body.status

				});

			return res.status(200).send(result.body.status);
		})
		.catch(await
			async function(err) {				
				if (err.body) {
					if (err.body._embedded) {
						if (err.body._embedded.errors) {
							if (err.body._embedded.errors[0]) {
								
								
								if (err.body._embedded.errors[0].message == 'The requested resource was not found.'){
									
									await Customer.updateOne(req.param('customer_id'))
											.set({
												status: true,
												fundurl: fundingSourceUrl,
												microDeposits: 'processed'
							
											});
											
											return res.status(200).send('processed');
															}
								
								return res.status(400).send(err.body._embedded.errors[0].message);
							}
						}
					}

					if (err.body.message) {
						if (err.body.message == 'The requested resource was not found.'){
									
									await Customer.updateOne(req.param('customer_id'))
											.set({
												status: true,
												fundurl: fundingSourceUrl,
												microDeposits: 'processed'
							
											});
								return res.status(200).send('processed');			
						}
						return res.status(400).send(err.body.message);

					}
				}				
				return res.status(400).send("An error occured!");
			});

}

/**
 * @description :: handles the manual fund function
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function manualfundAction(req, res) {

	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});
	var customer;

	var userRecord1 = await Customer.find({
		id: req.param('customer_id'),
	}).limit(1);

	if (!userRecord1[0]) {
		return res.status(400).send("Customer not found!");
	}

	var userRecord = userRecord1[0];
	var customerUrl = userRecord.dwollaurl;
	var appToken;
	var requestBody = {
		routingNumber: req.param('routingNumber'),
		accountNumber: req.param('accountNumber'),
		bankAccountType: req.param('accountType'),
		name: req.param('bankName'),
	};
	await client.auth.client()
		.then(appToken => appToken.post(`${customerUrl}/funding-sources`, requestBody))
		.then(async function(result) {
			sails.log.info(result);				 
			var fundingSourceUrl = result.headers.get('location');

			var requestBody = {
				amount1: {
					value: '0.01',
					currency: 'USD'
				},
				amount2: {
					value: '0.01',
					currency: 'USD'
				},
			};
			
			
			var userRecord2 = await FundingSource.find({
				customer_id: req.param('customer_id'),
			}).limit(1);
			if (!userRecord2[0]) {
				var newcustomerfundRecord = await FundingSource.create(_.extend({
						email: userRecord.email,
						firstName: userRecord.firstName,
						lastName: userRecord.lastName,
						customer_id: req.param('customer_id'),
						fundingurl: fundingSourceUrl,
						customerurl: userRecord.dwollaurl,
						routing: req.param('routingNumber'),
						account: req.param('accountNumber'),
						acctype: req.param('accountType'),
						bankname: req.param('bankName'),
						status: 'pending'
					}))
					.intercept('E_UNIQUE', () => {
						return res.status(400).send("Error found!");
					})
					.intercept('UsageError', () => {
						return res.status(400).send("Error found!");
					})
					.intercept('E_INVALID_NEW_RECORD', () => {
						return res.status(400).send("Error found!");
					})
					.fetch();
			} else {
				var userRecord3 = userRecord2[0];
				await FundingSource.updateOne(userRecord3.id)
					.set({
						fundingurl: fundingSourceUrl,
						customerurl: userRecord.dwollaurl,
						routing: req.param('routingNumber'),
						account: req.param('accountNumber'),
						acctype: req.param('accountType'),
						bankname: req.param('bankName'),
						status: 'pending'
					});

			}

			await Customer.updateOne(req.param('customer_id'))
				.set({
					status: true,
					fundurl: fundingSourceUrl,
					microDeposits: 'pending'

				});
		await client.auth.client()
				.then(appToken => appToken.post(`${fundingSourceUrl}/micro-deposits`, requestBody))
	
			return res.status(200).send("Customer fund Created!");
			
		})
		.catch(await
			async function(err) {
				sails.log.info(err);
				if (err.body) {
					if (err.body._embedded) {
						if (err.body._embedded.errors) {
							if (err.body._embedded.errors[0]) {
									if (err.body._embedded.errors[0].message == 'The requested resource was not found.'){
										await Customer.updateOne(req.param('customer_id'))
											.set({
												status: true,
												microDeposits: 'processed'
							
											});
										return res.status(200).send("Customer fund Created!");	
										
									}
								return res.status(400).send(err.body._embedded.errors[0].message);
							}
						}
					}

					if (err.body.message) {
						if (err.body.message == 'The requested resource was not found.'){
							await Customer.updateOne(req.param('customer_id'))
											.set({
												status: true,
												microDeposits: 'processed'
							
											});
										return res.status(200).send("Customer fund Created!");	
						}
						return res.status(400).send(err.body.message);
					}
				}
				return res.status(400).send("An error occured!");
			});
}

/**
 * @description :: handles the Customer status function
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function CustomerstatusAction(req, res) {
	var userRecord1 = await Customer.find({
		id: req.param('id'),
	}).limit(1);

	if (!userRecord1[0]) {
		return res.status(400).send("Customer not found!");
	}
	
	await Customer.updateOne(req.param('id'))
				.set({
					isDeleted: req.param('isDeleted'),

				});
   return res.status(200).send("Customer Status updated!");
	
	
}


/**
 * @description :: Calls the view file to show the customer list 
 * @return :: customer list page view file using res variable
 */
async function banknewAction(req, res) {
	
	if (!req.param('token')) {
      return res.view("pages/banknew", {
				errormsg: 'The provided token is expired, invalid, or has already been used'
			});
    }//•

    // Look up the user with this reset token.
    var userRecord = await Customer.findOne({ IAVToken: req.param('token') });
    // If no such user exists, or their token is expired, display an error page explaining that the link is bad.
    if (!userRecord || userRecord.IAVTokenExpiresAt <= Date.now()) {
        return res.view("pages/banknew", {
					errormsg: 'The provided token is expired, invalid, or has already been used'
			});
    }
	
	var DwollaCredentialRecord = await DwollaCredential.find({
		user_id: userRecord.user_id,
	});

	var dwollatype = '';
	await DwollaCredentialRecord.forEach(function(DwollaCredentialInfo, loopvalue) {
		if (DwollaCredentialInfo.type == 'sandbox') {
			sandbox = DwollaCredentialInfo;
		} else {
			live = DwollaCredentialInfo;
		}
		if (DwollaCredentialInfo.status == true) {
			dwollatype = DwollaCredentialInfo.type;
		}
	});
	return res.view("pages/banknew", {
				errormsg: '',
				dwollatype:dwollatype
					
			});

}

/**
 * @description :: shows the upload csv view page
 * @return :: upload csv view file using res variable
 */
async function uploadCustomerAction(req, res) {
	
	var criteria = {};

    Group
        .find(criteria)
        .then(function(groupDetails) {
		
		sails.log.info("groupDetails 123--",groupDetails);
		
		return res.view("pages/massCustomersList",{groupDetails:groupDetails});
	});
}

/**
 * @description :: saves the uploaded CSV in the uploads folder
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: CSV data in JSON format & folder path using res
 */
async function saveUploadedCustomerCSVAction(req, res) {	
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
		
		sails.log.info("jsonData cust--->",jsonData);
		
		return res.view("pages/massCustomersList", {
			jsonData: jsonData,
			batchType: batchType,
			localPath: req.localPath
		});
	} else {
		sails.log.info("test");
		res.redirect("/transactions");
	}
}

/**
 * @description :: redirect the page after the post file got refreshed
 * @return :: mass pay list page view file using res variable
 */
async function redirectCustomerUploadAction(req, res) {
	res.redirect("/massPayList");
}

/**
 * @description :: Performs the masspay function using uploaded csv file
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function massCustomerSaveAction(req, res) {
	sails.log.info("called!!");
	
	var localPath = req.body.csvLocalPath;
	var batchType = req.body.batchType;
	var appPath = sails.config.appPath;
	var folderPath = sails.config.custom.filePath;
	var fileName = localPath.replace(appPath + folderPath, '');
	var fullPath = appPath + folderPath;
	
	sails.log.info("fullPath!!",fullPath);
	sails.log.info("fileName!!",fileName);

	var data = fs.readFileSync(fullPath + fileName, {
		encoding: 'utf8'
	});														//Reads the file from the given path
	var options = {
		delimiter: ',',
		quote: '"'
	};

	//var correlationId = await generateUUID();
	var jsonData = csvjson.toArray(data, options);			//converts the CSV data to arrray
	
	sails.log.info("jsonData!!",jsonData);
	
	
	for (i = 0; i < jsonData.length; i++) {
			if(i!=0) {			
				//sails.log.info("customer_id---",jsonData[i]);
				var jsonDataString = jsonData[i].toString();
			var jsonArray = jsonDataString.split(',');
			
			//sails.log.info("jsonArray[2]---",jsonArray[i]);
				
				
				/*var newMassPayListRecord = await MassPayList.create(_.extend({
						massPayId: newDwollaRecord.id,													 
						user_id: req.session.AdminuserId,
						customer_id: massPayItems[i].customer_id,
						firstname: massPayItems[i].firstname,
						lastname: massPayItems[i].lastname,
						email: massPayItems[i].email,
						fundurl: massPayItems[i].fundurl,
						amount: massPayItems[i].amount,
						status: "Pending",
						correlationId: massPayItems[i].correlationId
					}))
					.intercept('E_UNIQUE', () => {
						return res.status(400).send("Error found");
					})
					.intercept('UsageError', () => {
						return res.status(400).send("Error found");
					})
					.intercept('E_INVALID_NEW_RECORD', () => {
						return res.status(400).send("Error found");
					})
					.fetch();*/
			}
				
		}
		
		sails.log.info("--Success!!--");
	
	return false;
	
	/*var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});	
	
	
	var localPath = req.body.csvLocalPath;
	var batchType = req.body.batchType;
	var appPath = sails.config.appPath;
	var folderPath = sails.config.custom.filePath;
	var fileName = localPath.replace(appPath + folderPath, '');
	var fullPath = appPath + folderPath;

	var data = fs.readFileSync(fullPath + fileName, {
		encoding: 'utf8'
	});														//Reads the file from the given path
	var options = {
		delimiter: ',',
		quote: '"'
	};

	var correlationId = await generateUUID();
	var jsonData = csvjson.toArray(data, options);			//converts the CSV data to arrray
	var fundedSource = req.session.fundedsource;

	*/

}