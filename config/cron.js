'use strict';

module.exports.cron = {
    getTransaction:{
	   schedule: '0 */20 * * * *',
	     onTick: async function(){
           await sails.helpers.cronservice.with({
				action: 'transaction'
		  });

       }
    },
	
	
	 getMassPay:{
	   schedule: '0 */20 * * * *',
	     onTick: async function(){
           await sails.helpers.cronservice.with({
				action: 'masspay'
		  });

       }
    },
	
	
	getMicroDeposit:{
	   schedule: '00 00 14 * * *',
	     onTick: async function(){
           await sails.helpers.cronservice.with({
				action: 'microdeposit'
		  });

       }
    },
	
};
