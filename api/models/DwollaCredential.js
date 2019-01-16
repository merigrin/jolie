/**
 * DwollaCredential.js
 *
 * @description :: This model definition represents the Dwolla credential database table/collection.
 */
module.exports = {

	attributes: {

		user_id: {
			type: 'number',
			description: 'Representation of the user Id!',
			required: true,
			example: 1502844074212
		},
		key: {
			type: 'string',
			required: true,
			description: 'Representation of the Access Key.',
			example: '2$28a8eabna301089103-13948134nad'
		},
		secret: {
			type: 'string',
			required: true,
			description: 'Representation of the Secret Key.',
			example: '2$28a8eabna301089103-13948134nad'
		},
		type: {
			type: 'string',
			description: 'Representation of the type as Sandbox or live mode',
			required: true,
			example: 'sandbox'
		},

		fundedsource: {
			type: 'string',
			description: 'Representation of the funding source URL',
			example: 'http://api.dowalla.customer/funded/1111-111-1111'
		},
		status: {
			type: 'number',
			description: 'Representation of the credential status',
			required: true,
			example: 1
		}
	},
};