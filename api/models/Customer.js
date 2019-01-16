/**
 * Customer.js
 *
 * @description :: This model definition represents the Customer database table/collection.
 */
module.exports = {

	attributes: {

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

		email: {
			type: 'string',
			required: true,
			description: 'Representation of the Customer\'s Email.',
			maxLength: 200,
			example: 'mary.sue@example.com'
		},

		type: {
			type: 'string',
			required: true,
			description: 'Representation of the Customer\'s type.',
			maxLength: 100,
			example: 'receive-only'
		},

		businessName: {
			type: 'string',
			description: 'Representation of the Customer\'s businessName.',
			maxLength: 200,
			example: 'Jane Corp llc'
		},

		ipAddress: {
			type: 'string',
			description: 'Representation of the Customer\'s ip.',
			maxLength: 200,
			example: '99.99.99.99'
		},

		dkey: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla Key.',
			maxLength: 200,
			example: '1111111'
		},

		dsecret: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla Secret.',
			maxLength: 200,
			example: '1111111'
		},

		dtype: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla type.',
			maxLength: 50,
			example: 'sandbox'
		},

		user_id: {
			type: 'number',
			required: true,
			description: 'Representation of the Admin User Id.',
			example: '1122'
		},

		dwollaid: {
			type: 'string',
			description: 'Representation of the Dwolla Id.',
			maxLength: 150,
			example: '1111-1111-1111'
		},

		dwollaurl: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla url.',
			maxLength: 250,
			example: 'http://api.dowalla.customer/customer/1111-111-1111'
		},

		fundurl: {
			type: 'string',
			description: 'Representation of the funding source url.',
			maxLength: 250,
			example: 'http://api.dowalla.customer/customer/1111-111-2222'
		},

		status: {
			type: 'boolean',
			description: 'Representation of the funding source status',
			example: 'TRUE'
		},

		microDeposits: {
			type: 'string',
			description: 'Representation of the micro deposit status.',
			maxLength: 250,
			example: 'Pending'
		},
		
		isDeleted: {
		  type: 'boolean',
		  defaultsTo: false
		},
		
		IAVToken: {
			type: 'string',
			description: 'A unique token used to verify the user\'s identity when recovering a password.  Expires after 1 use, or after a set amount of time has elapsed.'
		},

		IAVTokenExpiresAt: {
			type: 'number',
			description: 'A JS timestamp (epoch ms) representing the moment when this user\'s `passwordResetToken` will expire (or 0 if the user currently has no such token).',
			example: 1502844074211
		}

	},
};