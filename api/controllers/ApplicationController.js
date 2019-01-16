/**
 * ApplicationController
 *
 * @description :: Server-side actions for handling application requests
 */	
var dwolla = require('dwolla-v2');			// using Dwolla V2 Node client module
var moment = require('moment');				// using moment for parsing, validating, manipulating, and formatting dates

module.exports = {
	application: applicationAction,
	transactionslist: transactionsAction,
	ajaxtransactions: ajaxtransactionsAction
};

/**
 * @description :: creates the sandbox and live mode using given credentials
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: sandbox, live & message
 */
async function applicationAction(req, res) {

	var message = '';
	var fundedsoure = '';
	if (req.param('type') && req.param('key') && req.param('secret') && req.me.isSuperAdmin) {

		var DwollaCredentialRecord = await DwollaCredential.findOne({
			user_id: req.session.AdminuserId,
			type: req.param('type')
		});

		await DwollaCredential.update({
				user_id: req.me.id
			})
			.set({
				status: false
			});
		var client = await new dwolla.Client({
			id: req.param('key'),
			secret: req.param('secret'),
			environment: req.param('type')
		});
		
		await client.auth.client()
			.then(appToken => appToken.get('/'))
			.then(async function(result) {				
				accountUrl = result.body._links.account.href;
				//Funding sources API call
				await client.auth.client()
					.then(appToken => appToken.get(`${accountUrl}/funding-sources`))
					.then(async function(sourceRes) {
						await sourceRes.body._embedded['funding-sources'].forEach(function(DwollaInfo, loopvalue) {
							if (DwollaInfo.type == 'balance') {
								fundedsourcehref = DwollaInfo.id;
								if (req.param('type') == 'sandbox') {
									fundedsource = sails.config.custom.sandboxapi + 'funding-sources/' + fundedsourcehref;
								} else {
									fundedsource = sails.config.custom.liveapi + 'funding-sources/' + fundedsourcehref;
								}
							}
						})
					})

			})
			.catch(await
				function(err) {
					return;
				});

		if (!DwollaCredentialRecord) {

			var newUserRecord = await DwollaCredential.create(_.extend({
					user_id: req.session.AdminuserId,
					type: req.param('type'),
					key: req.param('key'),
					secret: req.param('secret'),
					fundedsource: fundedsource,
					status: true,
				}))
				.fetch();

		} else {

			await DwollaCredential.update(DwollaCredentialRecord.id)
				.set({
					key: req.param('key'),
					secret: req.param('secret'),
					fundedsource: fundedsource,
					status: true,
				});

		}

		message = 'Updated Succesfully!';
	}

	var DwollaCredentialRecord = await DwollaCredential.find({
		user_id: req.session.AdminuserId,
	});

	var sandbox = {};
	var live = {};
	await DwollaCredentialRecord.forEach(function(DwollaCredentialInfo, loopvalue) {
		if (DwollaCredentialInfo.type == 'sandbox') {
			sandbox = DwollaCredentialInfo;
		} else {
			live = DwollaCredentialInfo;
		}
		if (DwollaCredentialInfo.status == true) {
			req.session.key = DwollaCredentialInfo.key;
			req.session.secret = DwollaCredentialInfo.secret;
			req.session.type = DwollaCredentialInfo.type;
			req.session.fundedsource = DwollaCredentialInfo.fundedsource;
		}
	});

	return res.view("pages/application", {
		sandbox: sandbox,
		live: live,
		message: message
	});
}

/**
 * @description :: Calls the view file to show the transactions list 
 * @return :: Transactions list page view file using res variable
 */
async function transactionsAction(req, res) {
	return res.view("pages/transactionslist");
}

/**
 * @description :: fetches the transactions list for particular logged in user via ajax call
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: json variable which will capure the desired result
 */
async function ajaxtransactionsAction(req, res) {

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
				'firstName': sorttype
			};
			break;
		case '3':
			var sorttypevalue = {
				'lastName': sorttype
			};
			break;
		case '4':
			var sorttypevalue = {
				'email': sorttype
			};
			break;
		case '5':
			var sorttypevalue = {
				'amount': sorttype
			};
			break;
		case '6':
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
			or: [{
				firstName: {
					'contains': req.query.sSearch
				}
			}, {
				lastName: {
					'contains': req.query.sSearch
				}
			}, {
				paymentId: {
					'contains': req.query.sSearch
				}
			}, {
				correlationId: {
					'contains': req.query.sSearch
				}
			}, {
				amount: {
					'contains': req.query.sSearch
				}
			}, {
				status: {
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
			user_id: req.session.AdminuserId
		};
	}

	Transactions
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

				if ("undefined" === typeof userinfo.firstName || userinfo.firstName == '' || userinfo.firstName == null) {
					userinfo.firstName = '--';
				}

				if ("undefined" === typeof userinfo.lastName || userinfo.lastName == '' || userinfo.lastName == null) {
					userinfo.lastName = '--';
				}

				if ("undefined" === typeof userinfo.email || userinfo.email == '' || userinfo.email == null) {
					userinfo.email = '--';
				}

				if ("undefined" === typeof userinfo.paymentId || userinfo.paymentId == '' || userinfo.paymentId == null) {
					userinfo.paymentId = '--';
				}

				if ("undefined" === typeof userinfo.correlationId || userinfo.correlationId == '' || userinfo.correlationId == null) {
					userinfo.correlationId = '--';
				}

				if ("undefined" === typeof userinfo.amount || userinfo.amount == '' || userinfo.amount == null) {
					userinfo.amount = '--';
				}

				if ("undefined" === typeof userinfo.status || userinfo.status == '' || userinfo.status == null) {
					userinfo.status = '--';
				}

				if ("undefined" === typeof userinfo.createdAt || userinfo.createdAt == '' || userinfo.createdAt == null) {
					userinfo.createdAt = '--';
				} else {
					userinfo.createdAt = moment(userinfo.createdAt).format('YYYY/MM/DD');
				}

				userData.push({
					loopid: loopid,
					firstName: userinfo.firstName,
					lastName: userinfo.lastName,
					email: userinfo.email,
					paymentId: userinfo.paymentId,
					correlationId: userinfo.correlationId,
					amount: userinfo.amount,
					status: userinfo.status,
					createdAt: userinfo.createdAt
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

function getobject(o, s) {
	s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	s = s.replace(/^\./, ''); 			// strip a leading dot
	var a = s.split('.');
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
		} else {
			return;
		}
	}
	return o;
}