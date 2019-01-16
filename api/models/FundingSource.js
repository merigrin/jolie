/**
 * FundingSource.js
 *
 * @description :: This model definition represents the FundingSource database table/collection.
 */
module.exports = {

	attributes: {
		customer_id: {
			type: 'number',
			required: true,
			description: 'Representation of the customer\'s Id.',
			example: '1122'
		},

		email: {
			type: 'string',
			required: true,
			description: 'Representation of the Customer\'s Email.',
			maxLength: 200,
			example: 'mary.sue@example.com'
		},

		firstName: {
			type: 'string',
			required: true,
			description: 'Representation of the Customer\'s First name.',
			maxLength: 120,
			example: 'Mary'
		},

		lastName: {
			type: 'string',
			required: true,
			description: 'Representation of the Customer\'s Last name.',
			maxLength: 120,
			example: 'Sue'
		},

		fundingurl: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla funding url.',
			maxLength: 250,
			example: 'http://api.dowalla.customer/customer/1111-111-1111'
		},

		customerurl: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla customer url.',
			maxLength: 250,
			example: 'http://api.dowalla.customer/customer/1111-111-1111'
		},

		account: {
			type: 'string',
			description: 'Representation of the Customer\'s Account Number.',
			maxLength: 50,
			example: '123456'
		},

		routing: {
			type: 'string',
			description: 'Representation of the Customer\'s Routing Number.',
			maxLength: 50,
			example: '123456'
		},

		bankname: {
			type: 'string',
			description: 'Representation of the Customer\'s Bank Nmae.',
			maxLength: 100,
			example: 'Bank of ABC'
		},

		acctype: {
			type: 'string',
			description: 'Representation of the Customer\'s Account type.',
			maxLength: 100,
			example: 'Saving'
		},

		status: {
			type: 'string',
			description: 'Representation of the Customer\'s Account status.',
			maxLength: 100,
			example: 'Pending'
		}
	},
};