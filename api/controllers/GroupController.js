/**
 * GroupController
 *
 * @description :: Server-side actions for handling group actions.
 */

var moment = require('moment');				// using moment for parsing, validating, manipulating, and formatting dates

module.exports = {
  groupList: groupListAction,
  ajaxgroupList: ajaxgroupListAction,
  createGroup: createGroupAction,
  addGroup: addGroupAction,
  updateGroup: updateGroupAction,
  deleteGroup: deleteGroupAction,
  editGroup: editGroupAction

};

/**
 * @description :: Calls the view file to show the mass pay list 
 * @return :: Mass pay list page view file using res variable
 */
async function addGroupAction(req, res) {
	
	var allParams = req.allParams();
	
	if ("undefined" === typeof allParams.groupName || allParams.groupName == '' || allParams.groupName == null) {		
		
		var json = {
			status: 401
		};			
		res.contentType('application/json');
		res.json(json);		
	} else	if ("undefined" === typeof allParams.customerId || allParams.customerId == '' || allParams.customerId == null) {		
		var json = {
			status: 400
		};			
		res.contentType('application/json');
		res.json(json);		
	} else {		
		
		var customerObj = Object.assign({}, allParams.customerId);	
		customerObj = JSON.stringify(customerObj);
		
		var newUserRecord = await Group.create(_.extend({
			groupName: allParams.groupName,
			customer_id: customerObj,
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
	
		//return res.view("pages/groupList");

		var json = {
			status: 200,
			message: "Group created!"
		};			
		res.contentType('application/json');
		res.json(json);
		
	}
}


/**
 * @description :: Calls the view file to show the mass pay list 
 * @return :: Mass pay list page view file using res variable
 */
async function groupListAction(req, res) {	
	return res.view("pages/groupList");
}

/**
 * @description :: fetches the masspay list for particular logged in user via ajax call
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: json variable which will capure the desired result
 */
async function ajaxgroupListAction(req, res) {

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
				'groupName': sorttype
			};
			break;
		case '2':
			var sorttypevalue = {
				'createdAt': sorttype
			};
			break;
		default:
			break;
	};

	//Search
	if (req.query.sSearch) {
		var criteria = {groupName: {
					'contains': req.query.sSearch
				},
				user_id: req.session.AdminuserId
				};

	} else {
		var criteria = {user_id: req.session.AdminuserId};
	}

	Group
		.find(criteria)
		.sort(sorttypevalue)
		.then(function(groupDetails) {					  

			//Filter user details not available	
			totalrecords = groupDetails.length;

			//Filter by limit records
			skiprecord = parseInt(req.query.iDisplayStart);
			checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
			if (checklimitrecords > totalrecords) {
				iDisplayLengthvalue = parseInt(totalrecords);
			} else {
				iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
			}

			groupDetails = groupDetails.slice(skiprecord, iDisplayLengthvalue);

			var groupData = [];

			groupDetails.forEach(function(groupinfo, loopvalue) {
				loopid = loopvalue + skiprecord + 1;

				

				if ("undefined" === typeof groupinfo.groupName || groupinfo.groupName == '' || groupinfo.groupName == null) {
					groupinfo.groupName = '--';
				}

				if ("undefined" === typeof groupinfo.createdAt || groupinfo.createdAt == '' || groupinfo.createdAt == null) {
					groupinfo.createdAt = '--';
				} else {
					groupinfo.createdAt = moment(groupinfo.createdAt).format('YYYY/MM/DD');
				}
				
				//var actiondata = '<button class="btn btn-default actionBtn" onclick="editgroup(\'' + groupinfo.id + '\');">Edit</button> &nbsp; <button class="btn btn-default actionBtn" onclick="deletegroup(\'' + groupinfo.id + '\');">Delete</button>';
				
				
				var actiondata = '<a href="/editGroup/'+groupinfo.id+'" class="btn btn-default actionBtn">Edit</a> &nbsp; <button class="btn btn-default actionBtn" onclick="deletegroup(\'' + groupinfo.id + '\');">Delete</button>';

				groupData.push({
					loopid: loopid,
					groupName: groupinfo.groupName,
					createdAt: groupinfo.createdAt,
					actiondata: actiondata
				});
			});
			
			
			var json = {
				sEcho: req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: groupData
			};
			res.contentType('application/json');
			res.json(json);

		});
}

/**
 * @description :: Calls the view file to show the mass pay list 
 * @return :: Mass pay list page view file using res variable
 */
async function createGroupAction(req, res) {	

	Customer
	.find({user_id: req.session.AdminuserId, dkey: req.session.key,	dsecret: req.session.secret, dtype: req.session.type,})
	.then(function(customerDetails) {
				   
	   /*var customerData = [];
	   
	   customerDetails.forEach(function(customerinfo, loopvalue) {
			loopid = loopvalue + skiprecord + 1;						

			customerData.push({
				email: customerinfo.email
			});
		});		*/			
					
				   
		return res.view("pages/createGroup",{customerData: customerDetails});
		
	});
}

/**
 * @description :: handles the fetch user info function
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: user info
 */
async function editGroupAction(req, res) {	


	if (req.param('id')) {
		var userRecord = await Group.findOne({
			id: req.param('id'),
			user_id:req.session.AdminuserId
		});

		// If there was no matching user, respond thru the "badCombo" exit.
		if (!userRecord) {			
			res.redirect("/groupList");
		} else {
		
		var parsedData = JSON.parse(JSON.parse(JSON.stringify(userRecord['customer_id'])));
		var parsedDatadet=[];
		
		for(k in parsedData){
			parsedDatadet.push(parsedData[k]);
		}
		var criteria = {
			user_id: req.session.AdminuserId,
			dkey: req.session.key,
			dsecret: req.session.secret,
			dtype: req.session.type,
			id  : { in: parsedDatadet }
			
		};
		
		var ncriteria = {
			user_id: req.session.AdminuserId,
			dkey: req.session.key,
			dsecret: req.session.secret,
			dtype: req.session.type,
			id  : { nin: parsedDatadet }
		};
		
		var groupcustomerDetails;
		await Customer
			.find(criteria)
			.then(function(gcustomerDetails) {
				groupcustomerDetails  = gcustomerDetails;
		});
		await Customer
			.find(ncriteria)
			.then(function(customerDetails) {
				   
	   /*var customerData = [];
	   
	   customerDetails.forEach(function(customerinfo, loopvalue) {
			loopid = loopvalue + skiprecord + 1;						

			customerData.push({
				email: customerinfo.email
			});
		});		*/			
					
				   
		return res.view("pages/editGroup",{customerData: customerDetails,groupcustomerDetails: groupcustomerDetails,groupinfo:userRecord});
	  });
			
		}
			
	} else {
		res.redirect("/groupList");
	}
}


/**
 * @description :: Calls the view file to show the mass pay list 
 * @return :: Mass pay list page view file using res variable
 */
async function updateGroupAction(req, res) {
	
	var allParams = req.allParams();
	
	if ("undefined" === typeof allParams.groupName || allParams.groupName == '' || allParams.groupName == null) {		
		
		var json = {
			status: 401
		};			
		res.contentType('application/json');
		res.json(json);		
	} else	if ("undefined" === typeof allParams.customerId || allParams.customerId == '' || allParams.customerId == null) {		
		var json = {
			status: 400
		};			
		res.contentType('application/json');
		res.json(json);		
	} else	if ("undefined" === typeof allParams.groupId || allParams.groupId == '' || allParams.groupId == null) {		
		var json = {
			status: 400
		};			
		res.contentType('application/json');
		res.json(json);		
	} else {		
		
		var customerObj = Object.assign({}, allParams.customerId);	
		customerObj = JSON.stringify(customerObj);
		
		await Group.updateOne(allParams.groupId)
			.set({
				groupName: allParams.groupName,
				customer_id: customerObj,
				user_id: req.session.AdminuserId
			});
			
		
	
		//return res.view("pages/groupList");

		var json = {
			status: 200,
			message: "Group updated!"
		};			
		res.contentType('application/json');
		res.json(json);
		
	}
}

/**
 * @description :: handles the user status function
 * @param :: req - the request parameters from the form action & res is the variable we used to return
 * @return :: success message with 200 status code or error message with 400 status code
 */
async function deleteGroupAction(req, res) {
	sails.log.info("id-----", req.param('id'));
	var userRecord1 = await Group.find({
		id: req.param('id'),
	}).limit(1);

	if (!userRecord1[0]) {
		return res.status(400).send("Group not found!");
	}
	
	await Group.destroy(req.param('id'));
				
   return res.status(200).send("Group Deleted!");
	
	
}