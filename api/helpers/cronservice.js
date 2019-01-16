var dwolla = require('dwolla-v2');

module.exports = {

		friendlyName: 'Cronservice',

		description: 'Cronservice something.',

		inputs: {

			action: {
				description: 'Action',
				example: 'Transaction',
				defaultsTo: ''
			},
		},

		exits: {

			success: {
				description: 'All done.',
			},

		},

		fn: async function(inputs) {

				// fetches Pending transaction and update the status using dwolla api
				if (inputs.action == 'transaction') {
					var sorttypevalue = [{
							user_id: 'DESC'
						}]
						//fetch Pending transaction	
					var DwollatransactionList = await Transactions.find({
							status: 'pending',
						})
						.sort(sorttypevalue);

					sails.log.info(DwollatransactionList);
					var user_id = '';

					var dwollakey = '';
					var dwollasecret = '';
					var dwollatype = '';
					var dwollafunding = '';
					var client;

					await DwollatransactionList.forEach(async function(DwollatransactionInfo, loopvalue) {
						if (user_id != DwollatransactionInfo.user_id) {
							var DwollaCredentialRecord = await DwollaCredential.find({
								user_id: DwollatransactionInfo.user_id,
								status: true
							});

							dwollakey = '';
							dwollasecret = '';
							dwollatype = '';
							dwollafunding = '';
							await DwollaCredentialRecord.forEach(async function(DwollaCredentialInfo, loopvalue) {
								dwollakey = DwollaCredentialInfo.key;
								dwollasecret = DwollaCredentialInfo.secret;
								dwollatype = DwollaCredentialInfo.type;
								dwollafunding = DwollaCredentialInfo.fundedsource;
								client = await new dwolla.Client({
									id: dwollakey,
									secret: dwollasecret,
									environment: dwollatype
								});

							});

							user_id = DwollatransactionInfo.user_id;

						}

						if (dwollakey != '' && dwollasecret != '' && dwollatype != '') {
							
						
							
							var transferUrl = DwollatransactionInfo.transactionurl;
							await client.auth.client()
								.then(appToken => appToken.get(transferUrl))
								.then(async function(result) {

									await Transactions.updateOne(DwollatransactionInfo.id)
										.set({
											status: result.body.status,

										});
								})
								.catch(await
									function(err) {
										sails.log.info('error');
									});
						}

					});
				}

				// fetches Pending masspay and update the status using dwolla api
				if (inputs.action == 'masspay') {
					var sorttypevalue = [{
							user_id: 'DESC'
						}]
						//fetch Pending transaction	

					var criteria = {

						or: [{
							status: 'pending'
						}, {
							status: 'Pending'
						}, {
							status: 'processing'
						}]
					};

					var DwollaMassPayList = await DwollaMassPay.find(criteria)
						.sort(sorttypevalue);

					var user_id = '';

					var dwollakey = '';
					var dwollasecret = '';
					var dwollatype = '';
					var dwollafunding = '';
					var client;

					await DwollaMassPayList.forEach(async function(DwollaMassPayInfo, loopvalue) {
						if (user_id != DwollaMassPayInfo.user_id) {
							var DwollaCredentialRecord = await DwollaCredential.find({
								user_id: DwollaMassPayInfo.user_id,
								status: true
							});

							dwollakey = '';
							dwollasecret = '';
							dwollatype = '';
							dwollafunding = '';
							await DwollaCredentialRecord.forEach(async function(DwollaCredentialInfo, loopvalue) {
								dwollakey = DwollaCredentialInfo.key;
								dwollasecret = DwollaCredentialInfo.secret;
								dwollatype = DwollaCredentialInfo.type;
								dwollafunding = DwollaCredentialInfo.fundedsource;
								client = await new dwolla.Client({
									id: dwollakey,
									secret: dwollasecret,
									environment: dwollatype
								});

							});

							user_id = DwollaMassPayInfo.user_id;

						}

						if (dwollakey != '' && dwollasecret != '' && dwollatype != '') {
							var transferUrl = DwollaMassPayInfo.responseURL;
							await client.auth.client()
								.then(appToken => appToken.get(transferUrl))
								.then(async function(result) {
									if (result.body.status == 'complete'){
										next =	`${transferUrl}/items`;
										 do {
										
											await client.auth.client()
											.then(appToken => appToken.get(next))
											.then(async function(result) {
												if (result.body._links.next) {				 
													next = result.body._links.next.href;
												} else { 
													next = '';
												}
												
													
												var infolink = result.body._embedded.items; 
												sails.log.info(result.body._links.first.href);	
												await infolink.forEach(async function(infolinkc, loopvalue) {
														await MassPayList.updateOne( { correlationId: infolinkc.correlationId} )
														.set({
															status: infolinkc.status
				
														});
														
												})
												
												
											})
											
										 sails.log.info(next);			
										} while(next!='')
										
										
									}
									await DwollaMassPay.updateOne(DwollaMassPayInfo.id)
										.set({
											status: result.body.status,

										});
								})
								.catch(await
									function(err) {
										sails.log.info('error');
									});
						}

					});
				}

				// fetches Pending masspay and update the status using dwolla api
				if (inputs.action == 'microdeposit') {
					var sorttypevalue = [{
							user_id: 'DESC'
						}]
						//fetch Pending transaction	

					var criteria = {

						or: [{
							microDeposits: 'pending'
						}, {
							microDeposits: 'Pending'
						}]
					};

					var CustomerList = await Customer.find(criteria)
						.sort(sorttypevalue);

					var user_id = '';

					var dwollakey = '';
					var dwollasecret = '';
					var dwollatype = '';
					var dwollafunding = '';
					var client;

					await CustomerList.forEach(async function(CustomerInfo, loopvalue) {
							if (user_id != CustomerInfo.user_id) {
								var DwollaCredentialRecord = await DwollaCredential.find({
									user_id: CustomerInfo.user_id,
									status: true
								});

								dwollakey = '';
								dwollasecret = '';
								dwollatype = '';
								dwollafunding = '';
								await DwollaCredentialRecord.forEach(async function(DwollaCredentialInfo, loopvalue) {
									dwollakey = DwollaCredentialInfo.key;
									dwollasecret = DwollaCredentialInfo.secret;
									dwollatype = DwollaCredentialInfo.type;
									dwollafunding = DwollaCredentialInfo.fundedsource;
									client = await new dwolla.Client({
										id: dwollakey,
										secret: dwollasecret,
										environment: dwollatype
									});

								});

								user_id = CustomerInfo.user_id;

							}

							if (dwollakey != '' && dwollasecret != '' && dwollatype != '') {
								var fundingSourceUrl = CustomerInfo.fundurl;
								await client.auth.client()
									.then(appToken => appToken.get(`${fundingSourceUrl}/micro-deposits`))
									.then(async function(result) {
										var status1 = true;
										if (result.body.status == 'failed') {
											var status1 = false;
										}
										await Customer.updateOne(CustomerInfo.id)
											.set({
												status: status1,
												fundurl: fundingSourceUrl,
												microDeposits: result.body.status

											});

									})
									.catch(await
										function(err) {
											sails.log.info('error');
										});
							}
					});
				}
							await sails.log.info(inputs.action);
							return true;
						}

					};