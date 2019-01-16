## Jolie

Jolie is a open source application built with node.js for testing the Dwolla <a href="http://dwolla.com">ACH API</a>.

## To Deploy Application on Heroku you need

1) Create a application in heroku. 


2) Create the addon postgres in heroku using Resource tab


3) Set the NODE_ENV to development for the app in the heroku site before you install.

	heroku config:set NODE_ENV=development

4) After install the first time, you can change NODE_ENV to production in heroku site

	heroku config:set NODE_ENV=production
	
5) Update production.js to reflect your URL structure

Then from your project file structure, open  "production.js" from "/config/env" path and paste the baseurl for allowOrigins, baseURL and internalEmailAddress sections.

onlyAllowOrigins: ["https://example.com", "http://example.com"],
baseUrl: 'https://example.com',
internalEmailAddress: 'support@example.com',

5) Update nodemailer.js with your SENDGRID application credentials

Then again open, "nodemailer.js" and enter the SENDGRID_USER, SENDGRID_PASSWORD, SENDGRID_EMAIL, email_id & <hostname> for all environment.

## License

Jolie is licensed under <a href="https://opensource.org/licenses/MIT">MIT License</a>.
