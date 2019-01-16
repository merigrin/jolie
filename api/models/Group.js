/**
 * DwollaMassPay.js
 *
 * @description :: This model definition represents the Group database table/collection.
 */
module.exports = {

  attributes: {
		customer_id: {
			type: 'json',
			description: 'Representation of the customer_id Id!',
			required: true,
			example: '1'
		},		
		groupName: {
			type: 'string',
			required: true,
			description: 'Representation of the Group Name.',
			example: 'Salary'
		},
		user_id: {
			type: 'number',
			description: 'Representation of the user Id!',
			required: true,
			example: 1502844074215
		}
	},

};

