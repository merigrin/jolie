/**
 * Transactions.js
 *
 * @description :: This model definition represents the Transactions database table/collection.
 */
module.exports = {

	attributes: {
		customer_id: {
			type: 'number',
			required: true,
			description: 'Representation of the customer\'s ID.',
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

		sourceurl: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla source url.',
			maxLength: 250,
			example: 'http://api.dowalla.customer/customer/1111-111-1122'
		},

		transactionurl: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla Transaction url.',
			maxLength: 250,
			example: 'http://api.dowalla.customer/customer/1111-111-1133'
		},

		paymentId: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla paymentId.',
			maxLength: 50,
			example: 'khxbwkGWABtPb5idC123glt'
		},

		correlationId: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla correlationId.',
			maxLength: 50,
			example: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		},

		status: {
			type: 'string',
			required: true,
			description: 'Representation of the Dwolla status.',
			maxLength: 100,
			example: 'pending'
		},

		amount: {
			type: 'number',
			required: true,
			description: 'Representation of the sent amount.',
			example: '1122'
		},

		user_id: {
			type: 'number',
			required: true,
			description: 'Representation of the user id.',
			example: '1122'
		}
	},
};