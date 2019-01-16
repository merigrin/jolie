/**
 * User.js
 *
 * A user who can log in to this application.
 */
module.exports = {
	attributes: {
		emailAddress: {
			type: 'string',
			required: true,
			unique: true,
			isEmail: true,
			maxLength: 200,
			description: 'Representation of the email address.',
			example: 'mary.sue@example.com'
		},

		emailStatus: {
			type: 'string',
			isIn: ['unconfirmed', 'change-requested', 'confirmed'],
			defaultsTo: 'confirmed',
			description: 'The confirmation status of the user\'s email address.',
		},
		
		password: {
			type: 'string',
			required: true,
			description: 'Securely hashed representation of the user\'s login password.',
			protect: true,
			example: '2$28a8eabna301089103-13948134nad'
		},

		firstName: {
			type: 'string',
			required: true,
			description: 'Representation of the user\'s First name.',
			maxLength: 120,
			example: 'Mary'
		},
		
		lastName: {
			type: 'string',
			required: true,
			description: 'Representation of the user\'s Last name.',
			maxLength: 120,
			example: 'Sue'
		},
		
		businessName: {
			type: 'string',
			required: true,
			description: 'Representation of the user\'s business name.',
			maxLength: 120,
			example: 'Sue'
		},
		
		title: {
			type: 'string',
			description: 'Representation of the title.',
			maxLength: 120,
			example: 'Sue'
		},
		
		country: {
			type: 'string',
			description: 'Representation of the user\'s country name.',
			maxLength: 120,
			example: 'US'
		},
		
		emailAddress: {
			type: 'string',
			required: true,
			unique: true,
			isEmail: true,
			maxLength: 200,
			example: 'mary.sue@example.com'
		},

		isSuperAdmin: {
			type: 'boolean',
			description: 'Whether this user is a "super admin" with extra permissions, etc.'
		},

		passwordResetToken: {
			type: 'string',
			description: 'A unique token used to verify the user\'s identity when recovering a password.  Expires after 1 use, or after a set amount of time has elapsed.'
		},

		passwordResetTokenExpiresAt: {
			type: 'number',
			description: 'A JS timestamp (epoch ms) representing the moment when this user\'s `passwordResetToken` will expire (or 0 if the user currently has no such token).',
			example: 1502844074211
		},

		lastSeenAt: {
			type: 'number',
			description: 'A JS timestamp (epoch ms) representing the moment at which this user most recently interacted with the backend while logged in (or 0 if they have not interacted with the backend at all yet).',
			example: 1502844074211
		},

		adminuserid: {
			type: 'number',
			description: 'adminuserid',
			example: 1502844074211
		},
		
		isDeleted: {
		  type: 'boolean',
		  defaultsTo: false
		}
	},
};