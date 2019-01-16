/**
 * DwollaController
 *
 * @description :: Server-side actions for handling Dwolla processes.
 */
var dwolla = require('dwolla-v2');			// using Dwolla V2 Node client module
var csvjson = require('csvjson');			// using csvjson- converts csv data to json
var fs = require('fs');						// using fs- file system module allows you to work with the file system
var moment = require('moment');				// using moment for parsing, validating, manipulating, and formatting dates

module.exports = {
	iavToken: iavTokenAction,
	iavTokenemail: iavTokenemailAction,
	dwollaIAVintegration: dwollaIAVintegrationAction,
	sendmoney: sendmoneyAction,
	dwollaMassPay: dwollaMassPayAction,
	manualfund: manualfundAction,
	massPayList: massPayListAction,
	ajaxMassPay: ajaxMassPayAction,
	massitem: massitemAction,
	ajaxMassPayitem:ajaxMassPayitemAction,
	dwollaMassPayCustomer: dwollaMassPayCustomerAction
};




/**
 * @description :: creates the IAV token using key, secret & type
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: IAVtoken with 200 status code or error message with 400 status code
 */
async function iavTokenAction(req, res) {
	
	
	 var userRecord = await Customer.findOne({ IAVToken: req.param('id') });

	 if (!userRecord || userRecord.IAVTokenExpiresAt <= Date.now()) {
     	 return res.status(400).send("Customer not found!");
    }
	
	
	var DwollaCredentialRecord = await DwollaCredential.find({
		user_id: userRecord.user_id,
	});

	var dwollatype = '';
	var dwollakey = '';
	var dwollasec = '';
	await DwollaCredentialRecord.forEach(function(DwollaCredentialInfo, loopvalue) {
		if (DwollaCredentialInfo.type == 'sandbox') {
			sandbox = DwollaCredentialInfo;
		} else {
			live = DwollaCredentialInfo;
		}
		if (DwollaCredentialInfo.status == true) {
			dwollakey = DwollaCredentialInfo.key;
			dwollasec = DwollaCredentialInfo.secret;
			dwollatype = DwollaCredentialInfo.type;
		}
	});


	// creates a new dwolla client using valid credentials
	var client = await new dwolla.Client({
		id: dwollakey,
		secret: dwollasec,
		environment: dwollatype
	});
	
	var customerUrl = userRecord.dwollaurl;
	//IAV token API call
	await client.auth.client()
		.then(appToken => appToken.post(`${customerUrl}/iav-token`))
		.then(async function(result) {
			return res.status(200).send(result.body.token);
		})
		.catch(await
			function(err) {				
				return res.status(400).send("Error found!");
			});

}

/**
 * @description :: Sends money for each individual user
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function sendmoneyAction(req, res) {

	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});
	//Finding Customer from database
	var userRecords = await FundingSource.find({
		customer_id: req.param('customer_id'),
	}).limit(1);

	if (!userRecords[0]) {
		return res.status(400).send("Customer not found!");
	}
	var userRecord = userRecords[0];

	var paymentId = await sails.helpers.strings.random('url-friendly');
	var correlationId = await generateUUID();
	var requestBody = {
		_links: {
			source: {
				href: req.session.fundedsource
			},
			destination: {
				href: userRecord.fundingurl
			}
		},
		amount: {
			currency: 'USD',
			value: req.param('amount')
		},
		metadata: {
			paymentId: paymentId,
			note: 'Payment for Customer Manual'
		},
		clearing: {
			destination: 'next-available'
		},
		addenda: {
			source: {
				addenda: {
					values: ['USER' + req.session.AdminuserId + '_AddendaValue']
				}
			},
			destination: {
				addenda: {
					values: ['CUST' + userRecord.customer_id + '_AddendaValue']
				}
			}
		},
		correlationId: correlationId
	};
	
	//Transfers API call
	await client.auth.client()
		.then(appToken => appToken.post('transfers', requestBody))
		.then(async function(result) {			
			var newcustomertranRecord = await Transactions.create(_.extend({
					email: userRecord.email,
					firstName: userRecord.firstName,
					lastName: userRecord.lastName,
					customer_id: userRecord.customer_id,
					fundingurl: userRecord.fundingurl,
					sourceurl: req.session.fundedsource,
					transactionurl: result.headers.get('location'),
					paymentId: paymentId,
					correlationId: correlationId,
					amount: req.param('amount'),
					status: 'pending',
					user_id: req.session.AdminuserId
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
				.fetch();

			return res.status(200).send("Amount has been sent!");

		})
		.catch(await
			function(err) {
				return res.status(400).send("Error found");

			});

}

/**
 * @description :: Integration of capturing funding source details using IAV
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function dwollaIAVintegrationAction(req, res) {
	
	
	 var userRecord = await Customer.findOne({ IAVToken: req.param('user_id') });

	 if (!userRecord || userRecord.IAVTokenExpiresAt <= Date.now()) {
     	 return res.status(400).send("Customer not found!");
    }
	
	
	var DwollaCredentialRecord = await DwollaCredential.find({
		user_id: userRecord.user_id,
	});

	var dwollatype = '';
	var dwollakey = '';
	var dwollasec = '';
	await DwollaCredentialRecord.forEach(function(DwollaCredentialInfo, loopvalue) {
		if (DwollaCredentialInfo.type == 'sandbox') {
			sandbox = DwollaCredentialInfo;
		} else {
			live = DwollaCredentialInfo;
		}
		if (DwollaCredentialInfo.status == true) {
			dwollakey = DwollaCredentialInfo.key;
			dwollasec = DwollaCredentialInfo.secret;
			dwollatype = DwollaCredentialInfo.type;
		}
	});


	// creates a new dwolla client using valid credentials
	var client = await new dwolla.Client({
		id: dwollakey,
		secret: dwollasec,
		environment: dwollatype
	});
	

	
	
	var newcustomerfundRecord = await FundingSource.create(_.extend({
			email: userRecord.email,
			firstName: userRecord.firstName,
			lastName: userRecord.lastName,
			customer_id: userRecord.id,
			fundingurl: req.param('funding_id'),
			customerurl: userRecord.dwollaurl
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
		.fetch();
		
	if (newcustomerfundRecord.id) {
		await Customer.updateOne(userRecord.id)
			.set({
				status: true,
				fundurl: req.param('funding_id')
			});
	}

	return res.status(200).send("Your bank account has been linked to Dwolla!");

}

/**
 * @description :: Integration of manual process to get funding source details
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function manualfund(req, res) {

	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});
	var userRecords = await FundingSource.find({
		customer_id: req.param('customer_id'),
	}).limit(1);

	if (!userRecords[0]) {
		return res.status(400).send("Customer not found!");
	}
	var userRecord = userRecords[0];

	var paymentId = await sails.helpers.strings.random('url-friendly');
	var correlationId = await generateUUID();
	var requestBody = {
		_links: {
			source: {
				href: req.session.fundedsource
			},
			destination: {
				href: userRecord.fundingurl
			}
		},
		amount: {
			currency: 'USD',
			value: req.param('amount')
		},
		metadata: {
			paymentId: paymentId,
			note: 'Payment for Customer manual'
		},
		clearing: {
			destination: 'next-available'
		},
		addenda: {
			source: {
				addenda: {
					values: ['USER' + req.session.AdminuserId + '_AddendaValue']
				}
			},
			destination: {
				addenda: {
					values: ['CUST' + userRecord.customer_id + '_AddendaValue']
				}
			}
		},
		correlationId: correlationId
	};
	
	//Transfers API call
	await client.auth.client()
		.then(appToken => appToken.post('transfers', requestBody))
		.then(async function(result) {
			var newcustomertranRecord = await Transactions.create(_.extend({
					email: userRecord.email,
					firstName: userRecord.firstName,
					lastName: userRecord.lastName,
					customer_id: userRecord.customer_id,
					fundingurl: userRecord.fundingurl,
					sourceurl: req.session.fundedsource,
					transactionurl: result.headers.get('location'),
					paymentId: paymentId,
					correlationId: correlationId,
					amount: req.param('amount'),
					status: 'pending',
					user_id: req.session.AdminuserId
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
				.fetch();

			return res.status(200).send("Amount has been sent!");

		})
		.catch(await
			function(err) {
				return res.status(400).send("Error found");

			});

}

/**
 * @description :: generates random code of 36 characters 
 * @return :: random code uuid
 */
function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

/**
 * @description :: Performs the masspay function using uploaded csv file
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function dwollaMassPayAction(req, res) {

	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});	
	
	
	var localPath = req.body.csvLocalPath;
	var batchType = req.body.batchType;
	var customerObj = req.body.customerObj;
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

	var _links = {
		source: {
			href: fundedSource
		},
	};

	var achDetails = {
		source: {
			addenda: {
				values: ['USER' + req.session.AdminuserId + '_AddendaValue']
			}
		}
	}

	var items = [];
	var massPayItems = [];
	

	var count = 1;
	for (i = 0; i < jsonData.length; i++) {
		if(i!=0) {
			var jsonDataString = jsonData[i].toString();
			var jsonArray = jsonDataString.split(',');
			
			
	
			var correlation = await generateUUID();
	
			var item = {
				_links: {
					destination: {
						href: jsonArray[5]
					}
				},
				amount: {
					currency: 'USD',
					value: jsonArray[6]
					//value: '0.50'
				},
				metadata: {
					payment1: 'payment' + count,
					customer_id: jsonArray[1],
					firstname: jsonArray[2],
					lastname: jsonArray[3],
					fundurl: jsonArray[5],
					amount: jsonArray[6],
				},
				correlationId: correlation
			};			
			
			var massPayItem = {
				customer_id: jsonArray[1],
				firstname: jsonArray[2],
				lastname: jsonArray[3],
				email: jsonArray[4],
				fundurl: jsonArray[5],
				amount: jsonArray[6],
				correlationId: correlation
			};
			count++;
			items.push(item);
			massPayItems.push(massPayItem);		
		}

	};

	var jsonItem = {
		items: items
	};

	var metadata = {
		batch1: 'batch1'
	};

	var correlationId = correlationId;

	var requestBody = new Array();
	requestBody.push({
		_links,
		items,
		metadata,
		correlationId
	}); //concatenating all requests here
	var requestBody = requestBody[0];
	//sails.log.info("requestBody--->",JSON.stringify(requestBody, 0, 2));

	//Mass Payment API call
	await client.auth.client()
		.then(appToken => appToken.post('mass-payments', requestBody))
		.then(async function(result) {
							 
			var responseURL = result.headers.get('location');
			var newDwollaRecord = await DwollaMassPay.create(_.extend({
					user_id: req.session.AdminuserId,
					localPath: fullPath,
					status: 'pending',
					batchType: batchType,
					responseURL: responseURL
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
				.fetch();
				
				
				/*Creates a new entry into group table with batch name and cusotmer Id's*/
				var newGroupRecord = await Group.create(_.extend({
					groupName: batchType,
					user_id: req.session.AdminuserId,
					customer_id: customerObj
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
				.fetch();
				
				sails.log.info("newDwollaRecord---",newDwollaRecord.id);
				
				
				for (i = 0; i < massPayItems.length; i++) {
						
						sails.log.info("customer_id---",massPayItems[i].customer_id);
						var newMassPayListRecord = await MassPayList.create(_.extend({
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
							.fetch();
						
						
				}
				
				sails.log.info("--Success!!--");

			return res.status(200).send("Mass pay processed!");
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

					if (err.body.message) {
						return res.status(400).send(err.body.message);
					}
				}
				return res.status(400).send("An error occured!");
			});

}

/**
 * @description :: Calls the view file to show the mass pay list 
 * @return :: Mass pay list page view file using res variable
 */
async function massPayListAction(req, res) {	
	return res.view("pages/massPayList");
}

/**
 * @description :: fetches the masspay list for particular logged in user via ajax call
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: json variable which will capure the desired result
 */
async function ajaxMassPayAction(req, res) {

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
				'createdAt': sorttype
			};
			break;
		case '2':
			var sorttypevalue = {
				'status': sorttype
			};
			break;
		case '3':
			var sorttypevalue = {
				'batchType': sorttype
			};
			break;
		default:
			break;
	};

	//Search
	if (req.query.sSearch) {
		var criteria = {
			user_id: req.session.AdminuserId,
			or: [{
				status: {
					'contains': req.query.sSearch
				}
			}, {
				batchType: {
					'contains': req.query.sSearch
				}
			}]
		};

	} else {
		var criteria = {
			user_id: req.session.AdminuserId
		};
	}

	DwollaMassPay
		.find(criteria)
		.sort(sorttypevalue)
		.then(function(userDetails) {

			//Filter user details not available	
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

				if ("undefined" === typeof userinfo.status || userinfo.status == '' || userinfo.status == null) {
					userinfo.status = '--';
				}

				if ("undefined" === typeof userinfo.batchType || userinfo.batchType == '' || userinfo.batchType == null) {
					userinfo.batchType = '--';
				}

				if ("undefined" === typeof userinfo.createdAt || userinfo.createdAt == '' || userinfo.createdAt == null) {
					userinfo.createdAt = '--';
				} else {
					userinfo.createdAt = moment(userinfo.createdAt).format('YYYY/MM/DD');
				}

				var actiondata = '<button class="btn btn-default actionBtn" onclick="mass(\'' + userinfo.id + '\');">Details</button>';
				
				userData.push({
					loopid: loopid,
					status: userinfo.status,
					batchType: userinfo.batchType,
					createdAt: userinfo.createdAt,
					actiondata:actiondata
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
 * @description :: fetch the mass payment items
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: items with 200 status code or error message with 400 status code
 */
async function massitemAction(req, res) {
	
	// creates a new dwolla client using valid credentials
	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});
	var userRecord = await DwollaMassPay.findOne({
		id: req.param('id'),
	});

	if (!userRecord) {
		return res.status(400).send("Masspay item not found!");
	}

	var massPaymentUrl = userRecord.responseURL;
	//massPayment item API call
	await client.auth.client()
		.then(appToken => appToken.get(`${massPaymentUrl}/items`))
		.then(async function(result) {
				sails.log.info(result.body._embedded.items);			 
			return res.status(200).send(result.body);
		})
		.catch(await
			function(err) {		
				sails.log.info(err);
				return res.status(400).send("Error found!");
			});

}



/**
 * @description :: fetches the masspay list item for particular masspay in user via ajax call
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: json variable which will capure the desired result
 */
async function ajaxMassPayitemAction(req, res) {

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
				'customer_id': sorttype
			};
			break;
		case '1':
			var sorttypevalue = {
				'firstname': sorttype
			};
			break;
		case '2':
			var sorttypevalue = {
				'lastname': sorttype
			};
			break;
		case '3':
			var sorttypevalue = {
				'amount': sorttype
			};
			break;
		case '3':
			var sorttypevalue = {
				'status': sorttype
			};
			break;	
		default:
			break;
	};

	//Search
	if (req.query.sSearch) {
		var criteria = {
			user_id: req.session.AdminuserId,
			massPayId:req.param('id'),
			or: [{
				status: {
					'contains': req.query.sSearch
				}
			}, {
				customer_id: {
					'contains': req.query.sSearch
				}
			}, {
				firstname: {
					'contains': req.query.sSearch
				}
			}, {
				lastname: {
					'contains': req.query.sSearch
				}
			}, {
				amount: {
					'contains': req.query.sSearch
				}
			}]
		};

	} else {
		var criteria = {
			user_id: req.session.AdminuserId,
			massPayId:req.param('id')
		};
	}

	MassPayList
		.find(criteria)
		.sort(sorttypevalue)
		.then(function(userDetails) {

			//Filter user details not available	
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

				if ("undefined" === typeof userinfo.status || userinfo.status == '' || userinfo.status == null) {
					userinfo.status = '--';
				}

				if ("undefined" === typeof userinfo.firstname || userinfo.firstname == '' || userinfo.firstname == null) {
					userinfo.firstname = '--';
				}

				if ("undefined" === typeof userinfo.lastname || userinfo.lastname == '' || userinfo.lastname == null) {
					userinfo.lastname = '--';
				} 
				
				if ("undefined" === typeof userinfo.amount || userinfo.amount == '' || userinfo.amount == null) {
					userinfo.amount = '--';
				}

				if ("undefined" === typeof userinfo.customer_id || userinfo.customer_id == '' || userinfo.customer_id == null) {
					userinfo.customer_id = '--';
				} 

				var actiondata = '<button class="btn btn-default actionBtn" onclick="mass(\'' + userinfo.id + '\');">Details</button>';
				
				userData.push({
					customer_id:  userinfo.customer_id,
					status: userinfo.status,
					firstName: userinfo.firstname,
					lastName: userinfo.lastname,
					Amount: userinfo.amount
					
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
 * @description :: creates the IAV token for IAV process
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: send IAVtoken url in customer email and 200 status code or error message with 400 status code
 */
async function iavTokenemailAction(req, res) {
	
	var userRecord = await Customer.findOne({
		id: req.param('id'),
	});

	if (!userRecord) {
		return res.status(400).send("Customer not found!");
	}
	
	var token = await sails.helpers.strings.random('url-friendly');
	
		// Store the token on the user record
		// (This allows us to look up the user when the link from the email is clicked.)
		await Customer.update({ id: userRecord.id })
		.set({
		  IAVToken: token,
		  IAVTokenExpiresAt: Date.now() + sails.config.custom.passwordResetTokenTTL,
		});
	
		// Send recovery email
		await sails.helpers.sendTemplateEmail.with({
		  to: userRecord.email,
		  subject: 'Add bank account via IAV',
		  template: 'email-iav-url',
		  templateData: {
			fullName: userRecord.firstName,
			token: token,
			baseUrl:sails.config.custom.baseUrl
		  }
		});

	return res.status(200).send('IAV url sent to customer!');
	
}


/**
 * @description :: Performs the masspay function using uploaded csv file
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function dwollaMassPayCustomerAction(req, res) {

	var client = await new dwolla.Client({
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

	var jsonData = csvjson.toArray(data, options);			//converts the CSV data to arrray
	var fundedSource = req.session.fundedsource;

	

	var count = 1;
	var client = await new dwolla.Client({
		id: req.session.key,
		secret: req.session.secret,
		environment: req.session.type
	});
	
	var ccustomer = 0;
	var facustomer = 0;
	var fcustomer = 0;
	var errormsg = '';
	var customerId = [];
	for (i = 0; i < jsonData.length; i++) {
		
		if(i!=0) {
			
			var jsonDataString = jsonData[i].toString();
			var jsonArray = jsonDataString.split(',');
			
			await client.auth.client()
				.then(appToken => appToken.get('customers?search='+jsonArray[3]))
					.then(async function(csresult) {
						if (csresult.body.total == 0) {
							
							var userRecord1 = await Customer.find({
								email: jsonArray[3],
								dkey: req.session.key,
								dsecret: req.session.secret,
								dtype: req.session.type,
								user_id:req.session.AdminuserId
							}).limit(1);
							
							
							var requestBody = {
								firstName: jsonArray[1],
								lastName:  jsonArray[2],
								email: jsonArray[3],
								type: 'receive-only',
								businessName: jsonArray[4],
								ipAddress: req.ip
							};
							
							
							await client.auth.client()
							.then(appToken => appToken.post('customers', requestBody))
							.then(async function(customerresult) {	
								if (!userRecord1[0]) {					 
									var newcustomerRecord = await Customer.create(_.extend({
											email: jsonArray[3],
											firstName: jsonArray[1],
											lastName: jsonArray[2],
											businessName: jsonArray[4],
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
										ccustomer = ccustomer + 1;
										
									
							 } else {
								var newcustomerRecord =  userRecord1[0];
							 }
							 
							 customerId.push(newcustomerRecord.id);
							 	
							if 	(jsonArray[5] != '') {
							 	var requestBody = {
									routingNumber: jsonArray[5],
									accountNumber: jsonArray[6],
									bankAccountType: jsonArray[7],
									name: jsonArray[8],
								};
								var customerUrl = customerresult.headers.get('location');
								await client.auth.client()
								.then(appToken => appToken.post(`${customerUrl}/funding-sources`, requestBody))
								.then(async function(resultfunding) {
									 
									var fundingSourceUrl = resultfunding.headers.get('location');
						
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
										customer_id: newcustomerRecord.id,
									}).limit(1);
									if (!userRecord2[0]) {
										var newcustomerfundRecord = await FundingSource.create(_.extend({
												email: newcustomerRecord.email,
												firstName: newcustomerRecord.firstName,
												lastName: newcustomerRecord.lastName,
												customer_id: newcustomerRecord.id,
												fundingurl: fundingSourceUrl,
												customerurl: customerresult.headers.get('location'),
												routing:  jsonArray[5],
												account:  jsonArray[6],
												acctype:  jsonArray[7],
												bankname:  jsonArray[8],
												status: 'pending'
											}))
											.intercept('E_UNIQUE', () => {
												
											})
											.intercept('UsageError', () => {
												
											})
											.intercept('E_INVALID_NEW_RECORD', () => {
												
											})
											.fetch();
											
									} else {
										var userRecord3 = userRecord2[0];
										await FundingSource.updateOne(userRecord3.id)
											.set({
												fundingurl: fundingSourceUrl,
												customerurl: customerresult.headers.get('location'),
												routing:  jsonArray[5],
												account:  jsonArray[6],
												acctype:  jsonArray[7],
												bankname: jsonArray[8],
												status: 'pending'
											});
						
									}
						
									await Customer.updateOne(newcustomerRecord.id)
										.set({
											status: true,
											fundurl: fundingSourceUrl,
											microDeposits: 'pending',
											dwollaid: customerresult.headers.get('location'),
											dwollaurl: customerresult.headers.get('location'),
						
										});
										fcustomer = fcustomer + 1;
								await client.auth.client()
										.then(appToken => appToken.post(`${fundingSourceUrl}/micro-deposits`, requestBody))
							
									
									
								})
								.catch(await
									async function(err) {
									
										if (err.body) {
											if (err.body._embedded) {
												if (err.body._embedded.errors) {
													if (err.body._embedded.errors[0]) {
															if (err.body._embedded.errors[0].message == 'The requested resource was not found.'){
																await Customer.updateOne(newcustomerRecord.id)
																	.set({
																		status: true,
																		microDeposits: 'processed'
													
																	});
														
																
															} else {
																errormsg = errormsg + jsonArray[3] + " - " +  err.body._embedded.errors[0].message  + "<br/>";
															}
														
													}
												}
											}
						
											if (err.body.message) {
												if (err.body.message == 'The requested resource was not found.'){
													await Customer.updateOne(newcustomerRecord.id)
																	.set({
																		status: true,
																		microDeposits: 'processed'
													
																	});
																
												} else {
														errormsg = errormsg + jsonArray[3] + " - " +  err.body.message  + "<br/>";
												}

											}
										}
									});
							}
							})
							.catch(await
								function(err) {
									
					
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
									email: jsonArray[3],
									dkey: req.session.key,
									dsecret: req.session.secret,
									dtype: req.session.type,
									user_id:req.session.AdminuserId
								}).limit(1);
								
								if (!userRecord1[0]) {					 
									var newcustomerRecord = await Customer.create(_.extend({
											email: jsonArray[3],
											firstName: jsonArray[1],
											lastName: jsonArray[2],
											businessName: jsonArray[4],
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
										ccustomer = ccustomer + 1;
									
							 } else {
								var newcustomerRecord =  userRecord1[0];
							 }
							 customerId.push(newcustomerRecord.id);	
							 var userRecord2 = await FundingSource.find({
										customer_id: newcustomerRecord.id,
							}).limit(1);
							 
							if 	(jsonArray[5] != '') {
							 	var requestBody = {
									routingNumber: jsonArray[5],
									accountNumber: jsonArray[6],
									bankAccountType: jsonArray[7],
									name: jsonArray[8],
								};
							 
							if (!userRecord2[0]) {
								var customerUrl =  cdwollaurl;
								await client.auth.client()
								.then(appToken => appToken.post(`${customerUrl}/funding-sources`, requestBody))
								.then(async function(resultfunding) {
									 
									var fundingSourceUrl = resultfunding.headers.get('location');
						
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
									
									var newcustomerfundRecord = await FundingSource.create(_.extend({
												email: newcustomerRecord.email,
												firstName: newcustomerRecord.firstName,
												lastName: newcustomerRecord.lastName,
												customer_id: newcustomerRecord.id,
												fundingurl: fundingSourceUrl,
												customerurl: cdwollaurl,
												routing:  jsonArray[5],
												account:  jsonArray[6],
												acctype:  jsonArray[7],
												bankname:  jsonArray[8],
												status: 'pending'
											}))
											.intercept('E_UNIQUE', () => {
												
											})
											.intercept('UsageError', () => {
												
											})
											.intercept('E_INVALID_NEW_RECORD', () => {
												
											})
											.fetch();
								
								await Customer.updateOne(newcustomerRecord.id)
										.set({
											status: true,
											fundurl: fundingSourceUrl,
											microDeposits: 'pending',
											dwollaid: cdwollaurl,
											dwollaurl: cdwollaurl
						
										});
									fcustomer = fcustomer + 1;
								await client.auth.client()
										.then(appToken => appToken.post(`${fundingSourceUrl}/micro-deposits`, requestBody))
							
									
									
								})
								.catch(await
									async function(err) {
									
										if (err.body) {
											if (err.body._embedded) {
												if (err.body._embedded.errors) {
													if (err.body._embedded.errors[0]) {
															if (err.body._embedded.errors[0].message == 'The requested resource was not found.'){
																await Customer.updateOne(newcustomerRecord.id)
																	.set({
																		status: true,
																		microDeposits: 'processed'
													
																	});
														
																
															} else if (err.body._embedded.errors[0].message.indexOf("Bank already exists") == 0){
																var fundingSourceUrlArray = err.body._embedded.errors[0].message.split('Bank already exists: id=');
																var fundingSourceUrl = cdwollaurlPath + "funding-sources/"  + fundingSourceUrlArray[1]
																var newcustomerfundRecord = await FundingSource.create(_.extend({
																						email: newcustomerRecord.email,
																						firstName: newcustomerRecord.firstName,
																						lastName: newcustomerRecord.lastName,
																						customer_id: newcustomerRecord.id,
																						fundingurl: fundingSourceUrl,
																						customerurl: cdwollaurl,
																						routing:  jsonArray[5],
																						account:  jsonArray[6],
																						acctype:  jsonArray[7],
																						bankname:  jsonArray[8],
																						status: ''
																					}))
																					.intercept('E_UNIQUE', () => {
																						
																					})
																					.intercept('UsageError', () => {
																						
																					})
																					.intercept('E_INVALID_NEW_RECORD', () => {
																						
																					})
																					.fetch();
																		
																		await Customer.updateOne(newcustomerRecord.id)
																				.set({
																					status: true,
																					fundurl: fundingSourceUrl,
																					microDeposits: '',
																					dwollaid: cdwollaurl,
																					dwollaurl: cdwollaurl
																
																				});
																
															} else {
																errormsg = errormsg + jsonArray[3] + " - " +  err.body._embedded.errors[0].message  + "<br/>";
															}
														
													}
												}
											}
						
											if (err.body.message) {
												if (err.body.message == 'The requested resource was not found.'){
													await Customer.updateOne(newcustomerRecord.id)
																	.set({
																		status: true,
																		microDeposits: 'processed'
													
																	});
																
												} else if (err.body.message.indexOf("Bank already exists") == 0){
																var fundingSourceUrlArray = err.body.message.split('Bank already exists: id=');
																var fundingSourceUrl = cdwollaurlPath + "funding-sources/"  + fundingSourceUrlArray[1]
																var newcustomerfundRecord = await FundingSource.create(_.extend({
																						email: newcustomerRecord.email,
																						firstName: newcustomerRecord.firstName,
																						lastName: newcustomerRecord.lastName,
																						customer_id: newcustomerRecord.id,
																						fundingurl: fundingSourceUrl,
																						customerurl: cdwollaurl,
																						routing:  jsonArray[5],
																						account:  jsonArray[6],
																						acctype:  jsonArray[7],
																						bankname:  jsonArray[8],
																						status: ''
																					}))
																					.intercept('E_UNIQUE', () => {
																						
																					})
																					.intercept('UsageError', () => {
																						
																					})
																					.intercept('E_INVALID_NEW_RECORD', () => {
																						
																					})
																					.fetch();
																		
																		await Customer.updateOne(newcustomerRecord.id)
																				.set({
																					status: true,
																					fundurl: fundingSourceUrl,
																					microDeposits: '',
																					dwollaid: cdwollaurl,
																					dwollaurl: cdwollaurl
																
																				});
																
															}
												
												else {
																errormsg = errormsg + jsonArray[3] + " - " +  err.body.message  + "<br/>";
												}

											}
										}
									});
											
							} else					
							
							if (userRecord2[0].routing != jsonArray[5] || userRecord2[0].account != jsonArray[6] || userRecord2[0].acctype != jsonArray[7] || userRecord2[0].bankname != jsonArray[8]  ) {
								var customerUrl = cdwollaurl;
								await client.auth.client()
								.then(appToken => appToken.post(`${customerUrl}/funding-sources`, requestBody))
								.then(async function(resultfunding) {
									 
									var fundingSourceUrl = resultfunding.headers.get('location');
						
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
									
									
									await FundingSource.updateOne(userRecord2[0].id)
										.set({															
												email: newcustomerRecord.email,
												firstName: newcustomerRecord.firstName,
												lastName: newcustomerRecord.lastName,
												customer_id: newcustomerRecord.id,
												fundingurl: fundingSourceUrl,
												customerurl: customerUrl,
												routing:  jsonArray[5],
												account:  jsonArray[6],
												acctype:  jsonArray[7],
												bankname:  jsonArray[8],
												status: 'pending'
											});
								
								await Customer.updateOne(newcustomerRecord.id)
										.set({
											status: true,
											fundurl: fundingSourceUrl,
											microDeposits: 'pending',
											dwollaid: customerUrl,
											dwollaurl: customerUrl,
						
										});
									fcustomer = fcustomer + 1;
								await client.auth.client()
										.then(appToken => appToken.post(`${fundingSourceUrl}/micro-deposits`, requestBody))
							
									
									
								})
								.catch(await
									async function(err) {
									
										if (err.body) {
											if (err.body._embedded) {
												if (err.body._embedded.errors) {
													if (err.body._embedded.errors[0]) {
															if (err.body._embedded.errors[0].message == 'The requested resource was not found.'){
																await Customer.updateOne(newcustomerRecord.id)
																	.set({
																		status: true,
																		microDeposits: 'processed'
													
																	});
														
																
															} else if (err.body._embedded.errors[0].message.indexOf("Bank already exists") == 0){
																var fundingSourceUrlArray = err.body._embedded.errors[0].message.split('Bank already exists: id=');
																var fundingSourceUrl = cdwollaurlPath + "funding-sources/"  + fundingSourceUrlArray[1]
																await FundingSource.updateOne(userRecord2[0].id)
																		.set({															
																				email: newcustomerRecord.email,
																				firstName: newcustomerRecord.firstName,
																				lastName: newcustomerRecord.lastName,
																				customer_id: newcustomerRecord.id,
																				fundingurl: fundingSourceUrl,
																				customerurl: customerUrl,
																				routing:  jsonArray[5],
																				account:  jsonArray[6],
																				acctype:  jsonArray[7],
																				bankname:  jsonArray[8],
																				status: ''
																			});
																
																await Customer.updateOne(newcustomerRecord.id)
																		.set({
																			status: true,
																			fundurl: fundingSourceUrl,
																			microDeposits: '',
																			dwollaid: customerUrl,
																			dwollaurl: customerUrl,
														
																		});
																
															} else {
																errormsg = errormsg + jsonArray[3] + " - " +  err.body._embedded.errors[0].message  + "<br/>";
															}
														
													}
												}
											}
						
											if (err.body.message) {
												if (err.body.message == 'The requested resource was not found.'){
													await Customer.updateOne(newcustomerRecord.id)
																	.set({
																		status: true,
																		microDeposits: 'processed'
													
																	});
																
												} else if (err.body.message.indexOf("Bank already exists") == 0){
																var fundingSourceUrlArray = err.body.message.split('Bank already exists: id=');
																var fundingSourceUrl = cdwollaurlPath + "funding-sources/"  + fundingSourceUrlArray[1]
																await FundingSource.updateOne(userRecord2[0].id)
																		.set({															
																				email: newcustomerRecord.email,
																				firstName: newcustomerRecord.firstName,
																				lastName: newcustomerRecord.lastName,
																				customer_id: newcustomerRecord.id,
																				fundingurl: fundingSourceUrl,
																				customerurl: customerUrl,
																				routing:  jsonArray[5],
																				account:  jsonArray[6],
																				acctype:  jsonArray[7],
																				bankname:  jsonArray[8],
																				status: ''
																			});
																
																await Customer.updateOne(newcustomerRecord.id)
																		.set({
																			status: true,
																			fundurl: fundingSourceUrl,
																			microDeposits: '',
																			dwollaid: customerUrl,
																			dwollaurl: customerUrl,
														
																		});
																
															
												} else {
																errormsg = errormsg + jsonArray[3] + " - " +  err.body.message  + "<br/>";
												}

											}
										}
									});
											
							}
							 
						}
						}
						
					})
	
				
		}

	};

	customerObj = JSON.stringify(customerId);
	var newUserRecord = await Group.create(_.extend({
			groupName: batchType,
			customer_id: customerObj,
			user_id: req.session.AdminuserId
		}))
		.intercept('E_UNIQUE', () => {
			//return res.status(400).send("Error found");
		})
		.intercept('UsageError', () => {
			//return res.status(400).send("Error found");
		})
		.intercept('E_INVALID_NEW_RECORD', () => {
			//return res.status(400).send("Error found");
		})
		.fetch();
		
		var json = {
			ccustomer: ccustomer,
			fcustomer: (jsonData.length-1) - ccustomer,
			errormsg : errormsg
		};		
		
		return res.status(200).send(json);
	
}


async function manualfundAction(req, res) {

}