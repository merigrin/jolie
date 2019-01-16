/**
 * MassPayList.js
 *
 * @description :: This model definition represents the MassPayList database table/collection.
 */
module.exports = {

	attributes: {

		user_id: {
			type: 'number',
			description: 'Representation of the user Id!',
			required: true,
			example: 1502844074215
		},
		customer_id: {
			type: 'number',
			description: 'Representation of the customer Id!',
			required: true,
			example: 1502844074215
		},
		massPayId: {
			type: 'number',
			description: 'Representation of the Mass Pay Id!',
			required: true,
			example: 1502844074225
		},
		firstname: {
			type: 'string',
			required: true,
			description: 'Representation of the customer firstname!',
			example: 'Sam'
		},
		lastname: {
			type: 'string',
			required: true,
			description: 'Representation of the customer lastname!',
			example: 'Paul'
		},
		email: {
			type: 'string',
			maxLength: 200,
			description: 'Representation of the email address.',
			example: 'mary.sue@example.com'
		},
		fundurl: {
			type: 'string',
			required: true,
			description: 'Representation of the Fund URL.',
			example: 'https://api-sandbox.dwolla.com/mass-payments/2d03-4w32-9d59-a9b3006bcd21-b3d9c9cf'
		},
		amount: {
			type: 'string',
			required: true,
			description: 'Representation of the transaction amount.',
			example: '50.0'
		},
		correlationId: {
			type: 'string',
			description: 'Representation of the correlationId',
			required: true,
			example: 'https://api-sandbox.dwolla.com/mass-payments/2d13-4b1a-9d59-a9b3006bcd21-b3d9c9cf'
		},
		status: {
			type: 'string',
			description: 'Representation of the status',
			example: 'pending'
		},
	},
};