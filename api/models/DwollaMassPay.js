/**
 * DwollaMassPay.js
 *
 * @description :: This model definition represents the DwollaMassPay database table/collection.
 */
module.exports = {

	attributes: {

		user_id: {
			type: 'number',
			description: 'Representation of the user Id!',
			required: true,
			example: 1502844074215
		},
		localPath: {
			type: 'string',
			required: true,
			description: 'Representation of the folder path!',
			example: '/home/sns-centos1/webroot/dwollaadmin/assets/uploads/4093ca45-3b3a-4477-a6fe-3df0540dda2c.csv'
		},
		status: {
			type: 'string',
			required: true,
			description: 'Representation of the Payment status.',
			example: 'Pending'
		},
		batchType: {
			type: 'string',
			required: true,
			description: 'Representation of the Batch Type.',
			example: 'Salary'
		},
		responseURL: {
			type: 'string',
			description: 'Representation of the response URL from Mass pay',
			required: true,
			example: 'https://api-sandbox.dwolla.com/mass-payments/2d03-4b1a-9d59-a9b3006bcd21-b3d9c9cf'
		}
	},
};