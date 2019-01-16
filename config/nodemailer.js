/* global module */

'use strict';
var nodemailer = require('nodemailer'),
  SENDER_EMAIL = '',
  SENDER_PASSWORD = '';
  
  
  var SENDGRID_USER = '';
  var SENDGRID_PASSWORD = '';
  
 
  //var SENDGRID_EMAIL='karthik@tekstir.com';
  var SENDGRID_EMAIL='';
module.exports.mailer = {
  hostName: getHostName(),
  sender: "dwolla <" + SENDGRID_EMAIL + ">",
   email_id : "",
  /*
   * Contact account ()
   */
  contactAccount: nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: SENDGRID_USER,
      pass: SENDGRID_PASSWORD
    }
  }),
  /*
   * Hello Account
   */
  helloAccount: nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD
    }
  }),
  
  transporter: nodemailer.createTransport({
		service: 'SendGrid',
		auth: {
			user: SENDGRID_USER,
     	    pass: SENDGRID_PASSWORD
		}
  })

};

function getHostName() {
  // console.log('Hostname:',process.env.NODE_ENV)
  // TODO: Add production config
  if(process.env.NODE_ENV === 'development') {
	return "<hostname>"; // Put your baseurl
  } else if(process.env.NODE_ENV === 'uat') {
	 return "<hostname>"; // Put your baseurl
  } else if(process.env.NODE_ENV === 'staging') {
	  
	return "<hostname>"; // Put your baseurl
  }
  else{
	return "<hostname>"; // Put your baseurl
  }
}
