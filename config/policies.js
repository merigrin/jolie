/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  '*': 'is-logged-in',
 UserController: {
	 'login': 'Unlog',
	 'signup': 'Unlog',
	 'forgot': 'Unlog',
	 'newpassword': 'Unlog',
	 'usersList' : 'is-super-admin',
	 'ajaxuserlist' : 'is-super-admin',
	 'adduser' : 'is-super-admin'
	
 },
 
  CustomerController: {
	 'banknew': true,
	 'saveUploadedCustomerCSV':   'ProofDocumentsValidation',	
 },
 
 DwollaController: {
	 'iavToken': true,
	 'dwollaIAVintegration': true	
 },
 
 
 MasspayController: {
	 'saveUploadedCSV':  'ProofDocumentsValidation',	
 },
 
 
 
 /*DwollaController: {
	 'massPayList':  'Unlog',
	 'ajaxMassPay':	 'Unlog'
 }*/
 
};
