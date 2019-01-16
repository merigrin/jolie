/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { controller : 'UserController',action : 'login' },
  

 
 

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/
	'/login':              {  controller : 'UserController',action : 'login' },
	'/logout':              {  controller : 'UserController',action : 'logout' },
	'/signup':              {  controller : 'UserController',action : 'signup' },
	'/password/forgot':    { controller : 'UserController',action : 'forgot' },
  	'/password/new':       { controller : 'UserController',action : 'newpassword' },
	'/users':        {  controller : 'UserController',action : 'usersList' },
	'/ajaxuserlist':        {  controller : 'UserController',action : 'ajaxuserlist' },
	'/adduser':        {  controller : 'UserController',action : 'adduser' },
	'/changepassword':        {  controller : 'UserController',action : 'changepassword' },
	'/userstatus':        {  controller : 'UserController',action : 'userstatus' },
	'/selectuser':        {  controller : 'UserController',action : 'selectuser' },
	'/updateuser':        {  controller : 'UserController',action : 'updateuser' },
	
	
	
	'/application':        {  controller : 'ApplicationController',action : 'application' },
	'/transactionslist':        {  controller : 'ApplicationController',action : 'transactionslist' },
	'/ajaxtransactions':        {  controller : 'ApplicationController',action : 'ajaxtransactions' },
	
	'/customers':        {  controller : 'CustomerController',action : 'listCustomers' },
	'/ajaxcustomerlist':        {  controller : 'CustomerController',action : 'ajaxcustomerlist' },
	'/addcustomers':        {  controller : 'CustomerController',action : 'addcustomers' },
	'/bank/new':       { controller : 'CustomerController',action : 'banknew' },
	'/masscustomer':        {  controller : 'CustomerController',action : 'uploadCustomer' },
	'/massCustomerSave':        {  controller : 'CustomerController',action : 'massCustomerSave' },
	
	
	
	'/iavToken':        {  controller : 'DwollaController',action : 'iavToken' },
	'/iavTokenemail':        {  controller : 'DwollaController',action : 'iavTokenemail' },
	'/sendmoney':        {  controller : 'DwollaController',action : 'sendmoney' },
	'/dwollaIAVintegration':        {  controller : 'DwollaController',action : 'dwollaIAVintegration' },
	'/dwollaMassPay':        {  controller : 'DwollaController',action : 'dwollaMassPay' },
	'/manualfund':        {  controller : 'CustomerController',action : 'manualfund' },
	'/microDeposits':        {  controller : 'CustomerController',action : 'microDeposits' },
	'/Customerstatus':        {  controller : 'CustomerController',action : 'Customerstatus' },
	'post /saveUploadedCustomerCSV':        {  controller : 'CustomerController',action : 'saveUploadedCustomerCSV' },
	'get /saveUploadedCustomerCSV':        {  controller : 'CustomerController',action : 'redirectCustomerUpload' },
	'/dwollaMassPayCustomer':        {  controller : 'DwollaController',action : 'dwollaMassPayCustomer' },
	
	
	
	'/masspay':        {  controller : 'MasspayController',action : 'uploadTransaction' },
	'post /saveUploadedCSV':        {  controller : 'MasspayController',action : 'saveUploadedCSV' },
	'get /saveUploadedCSV':        {  controller : 'MasspayController',action : 'redirectUpload' },
	'/massPayList':        {  controller : 'DwollaController',action : 'massPayList' },
	'/ajaxMassPay':        {  controller : 'DwollaController',action : 'ajaxMassPay' },
	'/ajaxMassPayitem':        {  controller : 'DwollaController',action : 'ajaxMassPayitem' },
	'/massitem':        {  controller : 'DwollaController',action : 'massitem' },
	'post /getCSVFile':        {  controller : 'MasspayController',action : 'getCSVFile' },
	
	'/groupList':        {  controller : 'GroupController',action : 'groupList' },
	'/ajaxgroupList':        {  controller : 'GroupController',action : 'ajaxgroupList' },
	'/createGroup':        {  controller : 'GroupController',action : 'createGroup' },
	'/addGroup':        {  controller : 'GroupController',action : 'addGroup' },
	'/updateGroup':        {  controller : 'GroupController',action : 'updateGroup' },
	'/deleteGroup':        {  controller : 'GroupController',action : 'deleteGroup' },
	'/editGroup/:id':        {  controller : 'GroupController',action : 'editGroup' },
	
	
	 
	
	
	
	

};
