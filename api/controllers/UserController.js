/**
 * UserController
 *
 * @description :: Server-side actions for handling user requests.
 */
const countryList = require('country-list');

module.exports = {
	login: loginAction,
	signup: signupAction,
	forgot:forgotAction,
	newpassword:newpasswordAction,
	changepassword:changepasswordAction,
	homePage: homePageAction,
	logout: logoutAction,
	usersList: usersListAction,
	ajaxuserlist: ajaxuserlistAction,
	adduser: adduserAction,
	userstatus:userstatusAction,
	selectuser:selectuserAction,
	updateuser:updateuserAction
};

/**
 * @description :: handles the login action
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: application page & homepage redirection
 */
async function loginAction(req, res) {	

	if (req.param('email')) {
		var userRecord = await User.findOne({
			emailAddress: req.param('email').toLowerCase(),
		});

		// If there was no matching user, respond thru the "badCombo" exit.
		if (!userRecord) {			
			return res.view("pages/homepage", {
				errormsg: 'Invalid Username'
			});
		}

		await sails.helpers.passwords.checkPassword(req.param('password'), userRecord.password)
			.intercept((err) => {
				return res.view("pages/homepage", {
					errormsg: 'Invalid Password'
				});
			});

		if (!req.param('rememberMe')) {
			if (req.isSocket) {
				sails.log.warn(
					'Received `rememberMe: true` from a virtual request, but it was ignored\n' +
					'because a browser\'s session cookie cannot be reset over sockets.\n' +
					'Please use a traditional HTTP request instead.'
				);
			} else {
				req.session.cookie.maxAge = sails.config.custom.rememberMeCookieMaxAge;
			}
		}

		// Modify the active session instance.
		// (This will be persisted when the response is sent.)
		req.session.userId = userRecord.id;
		req.session.AdminuserId = userRecord.adminuserid;
		if (userRecord.isSuperAdmin = true && userRecord.adminuserid == 0) {
			req.session.AdminuserId = userRecord.id;
		}
		res.redirect("/application");
	} else {
		//console.log(countryList.getData());
		
		return res.view("pages/homepage", {countries: countryList.getData()});
	}
}

/**
 * @description :: handles the forgot action
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: error/sucess message with homepage redirection
 */
async function forgotAction(req, res) {	

	if (req.param('email')) {
		var userRecord = await User.findOne({
			emailAddress: req.param('email').toLowerCase(),
		});

		// If there was no matching user, respond thru the "badCombo" exit.
		if (!userRecord) {			
			return res.view("pages/homepage", {
				tab: 'forgot',			
				errormsg: 'Invalid email address'
			});
		}
		
		
		var token = await sails.helpers.strings.random('url-friendly');
	
		// Store the token on the user record
		// (This allows us to look up the user when the link from the email is clicked.)
		await User.update({ id: userRecord.id })
		.set({
		  passwordResetToken: token,
		  passwordResetTokenExpiresAt: Date.now() + sails.config.custom.passwordResetTokenTTL,
		});
	
		// Send recovery email
		await sails.helpers.sendTemplateEmail.with({
		  to: req.param('email'),
		  subject: 'Password reset instructions',
		  template: 'email-reset-password',
		  templateData: {
			fullName: userRecord.firstName,
			token: token,
			baseUrl:sails.config.custom.baseUrl
		  }
		});
		
		return res.view("pages/homepage", {
				tab: 'forgot',			
				errormsg: 'A recovery email was sent. Please check your email'
			});
				
	} 
	return res.view("pages/homepage", {
		tab: 'forgot',			
		errormsg: 'Invalid email address'
	});
	
}



/**
 * @description :: handles the newpassword action
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: error/sucess message with homepage redirection
 */
async function newpasswordAction(req, res) {	


	if (!req.param('token')) {
      return res.view("pages/resetpassword", {
				tab: 'forgot',			
				errormsg: 'The provided token is expired, invalid, or has already been used'
			});
    }//•

    // Look up the user with this reset token.
    var userRecord = await User.findOne({ passwordResetToken: req.param('token') });
    // If no such user exists, or their token is expired, display an error page explaining that the link is bad.
    if (!userRecord || userRecord.passwordResetTokenExpiresAt <= Date.now()) {
        return res.view("pages/resetpassword", {
				tab: 'forgot',			
				errormsg: 'The provided token is expired, invalid, or has already been used'
			});
    }


	if (req.param('password')) {
		// Hash the new password.
		var hashed = await sails.helpers.passwords.hashPassword(req.param('password'));
	
		// Store the user's new password and clear their reset token so it can't be used again.
		await User.updateOne({ id: userRecord.id })
		.set({
		  password: hashed,
		  passwordResetToken: '',
		  passwordResetTokenExpiresAt: 0
		});
		
		req.session.userId = userRecord.id;
		req.session.AdminuserId = userRecord.adminuserid;
		if (userRecord.isSuperAdmin = true && userRecord.adminuserid == 0) {
			req.session.AdminuserId = userRecord.id;
		}
		res.redirect("/application");
	
	} else {
		
		return res.view("pages/resetpassword", {
				tab: 'forgot'			
			
			});
  }
}



/**
 * @description :: handles the Changepassword action
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: message with changpassword redirection
 */
async function changepasswordAction(req, res) {	




	var message='';
	if (req.param('password')) {
		// Hash the new password.
		var hashed = await sails.helpers.passwords.hashPassword(req.param('password'));
	
		// Store the user's new password and clear their reset token so it can't be used again.
		await User.updateOne({ id: req.me.id })
		.set({
		  password: hashed,
		});
		message='Password Changed';
	}	
	return res.view("pages/changepassword", {
			message: message			
			
	});
  
}

/**
 * @description :: handles the signup action
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: application page & homepage redirection
 */
async function signupAction(req, res) {

	if (req.param('email')) {

		var newEmailAddress = req.param('email').toLowerCase();

		// Build up data for the new user record and save it to the database.
		// (Also use `fetch` to retrieve the new ID so that we can use it below.)

		var newUserRecord = await User.create(_.extend({
				emailAddress: newEmailAddress,
				password: await sails.helpers.passwords.hashPassword(req.param('password')),
				firstName: req.param('firstName'),
				lastName: req.param('lastName'),
				businessName: req.param('businessName'),
				title: req.param('title'),
				country: req.param('country'),
				isSuperAdmin: true,
				tosAcceptedByIp: req.ip
			}, sails.config.custom.verifyEmailAddresses ? {
				emailProofToken: await sails.helpers.strings.random('url-friendly'),
				emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,
				emailStatus: 'unconfirmed'
			} : {}))
			.intercept('E_UNIQUE', () => {
				req.session.reqParam = req.allParams();
				req.session.errormsg = 'Email address is already in use';
				res.redirect("/signup");
			})
			.intercept('UsageError', () => {
				req.session.reqParam = req.allParams();
				req.session.errormsg = 'Name, password and/or email address are invalid.';
				res.redirect("/signup");
			})
			.intercept('E_INVALID_NEW_RECORD', () => {
				req.session.reqParam = req.allParams();
				req.session.errormsg = 'Name, password and/or email address are invalid.';
				res.redirect("/signup");
			})
			.fetch();

		// If billing feaures are enabled, save a new customer entry in the Stripe API.
		// Then persist the Stripe customer id in the database.
		if (sails.config.custom.enableBillingFeatures) {
			let stripeCustomerId = await sails.helpers.stripe.saveBillingInfo.with({
				emailAddress: newEmailAddress
			}).timeout(5000).retry();
			await User.updateOne(newUserRecord.id)
				.set({
					stripeCustomerId
				});
		}

		// Store the user's new id in their session.
		req.session.userId = newUserRecord.id;
		req.session.AdminuserId = newUserRecord.id;

		if (sails.config.custom.verifyEmailAddresses) {
			// Send "confirm account" email
			await sails.helpers.sendTemplateEmail.with({
				to: newEmailAddress,
				subject: 'Please confirm your account',
				template: 'email-verify-account',
				templateData: {
					token: newUserRecord.emailProofToken
				}
			});

		} else {
			sails.log.info('Skipping new account email verification... (since `verifyEmailAddresses` is disabled)');
		}
		res.redirect("/application");
	} else {
		var errormsg = '';
		var reqParam;
		if (req.session.errormsg) {
			errormsg = req.session.errormsg;
			req.session.errormsg = '';
		}

		if (req.session.reqParam) {
			reqParam = req.session.reqParam;
			req.session.reqParam = '';			
		}
		
		return res.view("pages/homepage", {
			tab: 'signup',
			errormsg: errormsg,
			reqParam: reqParam,
			countries: countryList.getData()
		});
	}
}

/**
 * @description :: handles the homepage view
 * @return :: homepage view file using res variable
 */
async function homePageAction(req, res) {	
	return res.view("pages/homepage");
}

/**
 * @description :: handles the logout action by destroying the sessions
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: login page file using res variable
 */
async function logoutAction(req, res) {
	req.session.destroy(function(err) {
		res.redirect("/login");
	});
}

/**
 * @description :: Calls the view file to show the users list 
 * @return :: Users list page view file using res variable
 */
async function usersListAction(req, res) {
	return res.view("pages/usersList");
}

/**
 * @description :: fetches the users list for particular logged in user via ajax call
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: json variable which will capure the desired result
 */
async function ajaxuserlistAction(req, res) {
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
				'emailAddress': sorttype
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
			adminuserid: req.session.AdminuserId,
			isDeleted:{
					'!=': true
				},
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
			adminuserid: req.session.AdminuserId,
			isDeleted:{
					'!=': true
				}
		};
	}

	User
		.find(criteria)
		.sort(sorttypevalue)
		.then(function(userDetails) {

			//Filter user details not available
			userDetails = _.filter(userDetails, function(item) {
				if (item.emailAddress != '' && item.emailAddress != null) {
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

				if ("undefined" === typeof userinfo.emailAddress || userinfo.emailAddress == '' || userinfo.emailAddress == null) {
					userinfo.emailAddress = '--';
				}

				if ("undefined" === typeof userinfo.businessName || userinfo.businessName == '' || userinfo.businessName == null) {
					userinfo.businessName = '--';
				}

				var actiondata = '<button class="btn btn-default actionBtn" onclick="edituser(\'' + userinfo.id + '\');">Edit</button> &nbsp; <button class="btn btn-default actionBtn" onclick="deleteuser(\'' + userinfo.id + '\');">Delete</button>';

				userData.push({
					loopid: loopid,
					firstName: userinfo.firstName,
					lastName: userinfo.lastName,
					email: userinfo.emailAddress,
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
 * @description :: add users based on the role
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function adduserAction(req, res) {

	if (req.param('email')) {

		var newEmailAddress = req.param('email').toLowerCase();

		// Build up data for the new user record and save it to the database.
		// (Also use `fetch` to retrieve the new ID so that we can use it below.)

		var newUserRecord = await User.create(_.extend({
				emailAddress: newEmailAddress,
				password: await sails.helpers.passwords.hashPassword(req.param('password')),
				firstName: req.param('firstName'),
				lastName: req.param('lastName'),
				businessName: req.param('businessName'),
				isSuperAdmin: req.param('accountType'),
				tosAcceptedByIp: req.ip,
				adminuserid: req.session.AdminuserId
			}, sails.config.custom.verifyEmailAddresses ? {
				emailProofToken: await sails.helpers.strings.random('url-friendly'),
				emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,
				emailStatus: 'unconfirmed'
			} : {}))
			.intercept('E_UNIQUE', () => {
				return res.status(400).send("Email address is already in use");
			})
			.intercept('UsageError', () => {
				return res.status(400).send("Name, password and/or email address are invalid.");
			})
			.intercept('E_INVALID_NEW_RECORD', () => {
				return res.status(400).send("Name, password and/or email address are invalid.");
			})
			.fetch();

		// If billing feaures are enabled, save a new customer entry in the Stripe API.
		// Then persist the Stripe customer id in the database.
		if (sails.config.custom.enableBillingFeatures) {
			let stripeCustomerId = await sails.helpers.stripe.saveBillingInfo.with({
				emailAddress: newEmailAddress
			}).timeout(5000).retry();
			await User.updateOne(newUserRecord.id)
				.set({
					stripeCustomerId
				});
		}

		if (sails.config.custom.verifyEmailAddresses) {
			// Send "confirm account" email
			await sails.helpers.sendTemplateEmail.with({
				to: newEmailAddress,
				subject: 'Please confirm your account',
				template: 'email-verify-account',
				templateData: {
					token: newUserRecord.emailProofToken
				}
			});

		} else {
			sails.log.info('Skipping new account email verification... (since `verifyEmailAddresses` is disabled)');
		}
		return res.status(200).send("User Created!");
	} else {
		return res.status(400).send("Name, password and/or email address are invalid.");
	}
}

/**
 * @description :: handles the user status function
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function userstatusAction(req, res) {
	var userRecord1 = await User.find({
		id: req.param('id'),
	}).limit(1);

	if (!userRecord1[0]) {
		return res.status(400).send("User not found!");
	}
	
	await User.destroy(req.param('id'));
				
   return res.status(200).send("User Deleted!");
	
	
}


/**
 * @description :: handles the fetch user info function
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: user info
 */
async function selectuserAction(req, res) {	

	if (req.param('id')) {
		var userRecord = await User.findOne({
			id: req.param('id'),
			adminuserid:req.session.AdminuserId
		});

		// If there was no matching user, respond thru the "badCombo" exit.
		if (!userRecord) {			
			return res.status(400).send("User not found!");
		}

		  return res.status(200).send(userRecord);
	}
	
		return res.status(400).send("User not found!");
}



async function updateuserAction(req, res) {	

	if (req.param('userid')) {
		var userRecord = await User.findOne({
			id: req.param('userid'),
			adminuserid:req.session.AdminuserId
		});

		// If there was no matching user, respond thru the "badCombo" exit.
		if (!userRecord) {			
			return res.status(400).send("User not found!");
		}
		
		
		if (req.param('password')){
		
			var hashed = await sails.helpers.passwords.hashPassword(req.param('password'));
		
			// Store the user's new password and clear their reset token so it can't be used again.
			await User.updateOne({ id: userRecord.id })
			.set({
			  password: await sails.helpers.passwords.hashPassword(req.param('password')),
			  firstName: req.param('firstName'),
			  lastName: req.param('lastName'),
			  businessName: req.param('businessName'),
			  isSuperAdmin: req.param('accountType'),
			});
		} else {
			await User.updateOne({ id: userRecord.id })
			.set({
			 	
				firstName: req.param('firstName'),
				lastName: req.param('lastName'),
				businessName: req.param('businessName'),
				isSuperAdmin: req.param('accountType'),
				
			});
			
		}
		
		
		  return res.status(200).send("User details updated!");
	}
	
		return res.status(400).send("User not found!");
}