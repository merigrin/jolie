var sTable;

jQuery(document).on('click', '.panel-heading span.clickable', function(e){
    var $this =jQuery(this);
	if(!$this.hasClass('panel-collapsed')) {
		$this.parents('.panel').find('.panel-body').slideUp();
		$this.addClass('panel-collapsed');
		$this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
	} else {
		$this.parents('.panel').find('.panel-body').slideDown();
		$this.removeClass('panel-collapsed');
		$this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
	}
})

jQuery(document)
	.ready(function($) {
					
		fetchAdminUserList(); 		// fetches user list in user page
		fetchCustomerList(); 		// fetches customer list in customer page
		fetchTransList();			// fetches transaction list in transaction page
		fetchMassPayList();			// fetches mass pay list in mass pay page
		
		$('.isnumber')
			.keypress(function(event) {
				return isNumber(event, this)
			});
		$(".tab_content")
			.hide();
		$(".tab_content:first")
			.show();
			
		/* if in tab mode */
		$("ul.tabs li")
			.click(function() {
				$(".errorlabel")
					.empty();
				$(".tab_content")
					.hide();
				var activeTab = $(this)
					.attr("rel");
				$("#" + activeTab)
					.fadeIn();
				$("ul.tabs li")
					.removeClass("active");
				$(this)
					.addClass("active");
				$(".tab_drawer_heading")
					.removeClass("d_active");
				$(".tab_drawer_heading[rel^='" + activeTab + "']")
					.addClass("d_active");
			});
			
		/* if in drawer mode */
		$(".tab_drawer_heading")
			.click(function() {
				$(".errorlabel")
					.empty();
				$(".tab_content")
					.hide();
				var d_activeTab = $(this)
					.attr("rel");
				$("#" + d_activeTab)
					.fadeIn();
				$(".tab_drawer_heading")
					.removeClass("d_active");
				$(this)
					.addClass("d_active");
				$("ul.tabs li")
					.removeClass("active");
				$("ul.tabs li[rel^='" + d_activeTab + "']")
					.addClass("active");
			});			
		
		$('ul.tabs li')
			.last()
			.addClass("tab_last");
			
		/*to make the floating label floats after the post is requested*/
		$(".logForm :input[type=email]")
			.each(function() {
				var input = $(this)
					.attr("name");						
				var inputval = $(this)
					.val();					
				if (inputval != '') {
					$(this)
						.addClass('is-filled');
				}
			});
		$("#updateuser :input[type=text]")
			.each(function() {
				var input = $(this)
					.attr("name");						
				var inputval = $(this)
					.val();					
				if (inputval != '') {
					$(this)
						.addClass('is-filled');
				}
			});
		$("#loginform, #groupForm :input[type=text]")
			.each(function() {
				var input = $(this)
					.attr("name");
				var inputval = $(this)
					.val();
				if (inputval != '') {
					$(this)
						.addClass('is-filled');
				}
			});
		$("#signupform :input[type=text]")
			.each(function() {
				var input = $(this)
					.attr("name");
				var inputval = $(this)
					.val();
				if (inputval != '') {
					$(this)
						.addClass('is-filled');
				}
			});
			
			 $("#checkAll").click(function () {
				 $('input:checkbox').not(this).prop('checked', this.checked);
			 });
	});

function customerCheckbox(){  
  var checkboxes = document.getElementsByName('customer');
  var checkboxesChecked = [];
  // loop over them all 
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i].value);
     }
  }
  document.getElementById("show").value = checkboxesChecked;

}



/**
 * @description :: handles sendmoney popup
 * @param :: id
 */
function sendmoney(id) {
	jQuery("#sendmoney")
		.show();
	jQuery("#customer_id")
		.val(id);
}


/**
 * @description :: handles edituser popup
 * @param :: id
 */
function edituser(id) {
	jQuery.ajax({
				url: 'selectuser',
				type: 'POST',
				data: {
					'id': id,
									
				},
				success: function(data) {	
					jQuery(".loaderBg")
						.hide();
				
					jQuery("#userfirstName").val(data.firstName);
					jQuery("#userLastName").val(data.lastName);
					jQuery("#userbusinessName").val(data.businessName);
					jQuery("#useremailAddress").val(data.emailAddress);
					if (data.isSuperAdmin)
						jQuery("#useraccountType").val('true');
					else
						jQuery("#useraccountType").val('false');
					jQuery("#userid").val(data.id);
					openmodel('edituser');
				},
				error: function(request, error) {
					jQuery(".loaderBg")
						.hide();
					swal('An error  occured', '', "warning");
				}
			});
	
}


/**
 * @description :: handles active  customer
 * @param :: id
 */
function Active(id) {
	jQuery(".loaderBg")
			.show();
	jQuery.ajax({
				url: 'Customerstatus',
				type: 'POST',
				data: {
					'id': id,
					'isDeleted' : false 					
				},
				success: function(data) {	
					jQuery(".loaderBg")
						.hide();
						
					sTable.api().ajax.reload( null, false )
					swal(data, '', "success");
					
				},
				error: function(request, error) {
					jQuery(".loaderBg")
						.hide();
					swal('An error  occured', '', "warning");
				}
			});
}

/**
 * @description :: handles deactive  customer
 * @param :: id
 */
function deActive(id) {
	
	var buttons = jQuery('<div style="padding:50px">')
		.append(createButton('Okay', 'SecBtn', function() {
			swal.close();
			jQuery(".loaderBg")
					.show();
			jQuery.ajax({
				url: 'Customerstatus',
				type: 'POST',
				data: {
					'id': id,
					'isDeleted' : true 					
				},
				success: function(data) {
					jQuery(".loaderBg")
						.hide();
					sTable.api().ajax.reload( null, false )
					swal(data, '', "success");
					
				},
				error: function(request, error) {
					jQuery(".loaderBg")
						.hide();
					swal('An error  occured', '', "warning");
				}
			});
		}))
		.append(createButton(' Cancel ', 'cancelBtn', function() {
			swal.close();
		}));
	swal({
		title: "Are you sure?",
		html: buttons,
		showConfirmButton: false,
		type : 'warning',
		showCancelButton: false
	});
}


/**
 * @description :: handles deactive  user
 * @param :: id
 */
function deleteuser(id) {
	
	var buttons = jQuery('<div style="padding:50px">')
		.append(createButton('Okay', 'SecBtn', function() {
			swal.close();
			jQuery(".loaderBg")
					.show();
			jQuery.ajax({
				url: 'userstatus',
				type: 'POST',
				data: {
					'id': id,
					'isDeleted' : true 					
				},
				success: function(data) {
					jQuery(".loaderBg")
						.hide();
					sTable.api().ajax.reload( null, false )
					swal(data, '', "success");
					
				},
				error: function(request, error) {
					jQuery(".loaderBg")
						.hide();
					swal('An error  occured', '', "warning");
				}
			});
		}))
		.append(createButton(' Cancel ', 'cancelBtn', function() {
			swal.close();
		}));
	swal({
		title: "Are you sure?",
		html: buttons,
		showConfirmButton: false,
		type : 'warning',
		showCancelButton: false
	});
}


/**
 * @description :: handles setting up the funding source popup- Manual, IAV.
 * @param :: id
 */
function setfunding(id) {
	var buttons = jQuery('<div style="padding:50px">')
		.append(createButton(' Manual ', 'actionBtn', function() {
			swal.close();
			jQuery("#manual")
				.show()
			jQuery("#mcustomer_id")
				.val(id);
		}))
		.append(createButton('IAV', 'SecBtn', function() {
			swal.close();
			setfundingmodal(id);
		}))
		.append(createButton(' Cancel ', 'cancelBtn', function() {
			swal.close();
		}));
	swal({
		title: "How do you want to add Funding source?",
		html: buttons,
		showConfirmButton: false,
		showCancelButton: false
	});
}

/**
 * @description :: Creates the IAV, Manual & Cancel button in the popup
 */
function createButton(text, c, cb) {
	return jQuery('<button class="' + c + '" style="padding-left:20px; padding-right:20px">' + text + '</button>')
		.on('click', cb);
}

/**
 * @description :: Fetches the IAV token from dwolla
 */
function setfundingmodal(id) {
	jQuery(".loaderBg")
		.show();
	jQuery.ajax({
		url: 'iavTokenemail?id=' + id,
		type: 'GET',
		success: function(data) {
			console.log(data);
			//loadIav(data, id);
			swal(data);
				jQuery(".loaderBg")
				.hide()
		},
		error: function(request, error) {
			swal('An error occured!');
			jQuery(".loaderBg")
				.hide();			
		}
	});
}


/**
 * @description :: Fetches the IAV token from dwolla
 */
function mass(id) {
	jQuery(".loaderBg")
		.show();
	openmodel('myModal');
	fetchMassPayListItem(id);
	jQuery(".loaderBg")
		.hide();
}


/**
 * @description :: handles to close the modal popup
 * @param :: id
 */
function closemodal(id) {
	jQuery("#" + id)
		.hide();
}

/**
 * @description :: handles to open the modal popup
 * @param :: id
 */
function openmodel(id) {
	jQuery("#" + id)
		.show();

}

/**
 * @description :: IAV integration to get the funding source URL and saves it in database
 */
function loadIav(token, id) {
	var iavToken = token;
	dwolla.configure(jQuery('#modetype')
		.html());
	dwolla.iav.start(iavToken, {
		container: 'iavContainer',
		stylesheets: [
			'https://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext',
			'https://myapp.com/iav/customStylesheet.css'
		],
		microDeposits: false,
		fallbackToMicroDeposits: true,
		backButton: true,
		subscriber: ({
			currentPage,
			error
		}) => {
			jQuery(".loaderBg")
				.hide();
			console.log('currentPage:', currentPage, 'error:', JSON.stringify(error))
		}
	}, function(err, res) {
		if (err) {
			swal('something wrong!');
		} else {			
			console.log(res);			
			var myKeyVals = '{ id : ' + id + ' , funding_id : ' + res._links["funding-source"]["href"] + ' }';
			jQuery.ajax({
				url: 'dwollaIAVintegration',
				type: 'POST',
				data: {
					'id': id,
					'funding_id': res._links["funding-source"]["href"]
				},
				success: function(data) {					
					jQuery("#fund" + id)
						.hide();
					jQuery("#send" + id)
						.show();
					jQuery("#fundurl" + id)
						.show();
					jQuery("#fundurl" + id)
						.data('fund', res._links["funding-source"]["href"]);
					var modal = document.getElementById('iavModal');
					modal.style.display = "none";
				},
				error: function(request, error) {
					alert("Request: " + JSON.stringify(request));
				}
			});
		}
		console.log('Error: ' + JSON.stringify(err) + ' -- Response: ' + JSON.stringify(res))
	});
	var modal = document.getElementById('iavModal');
	modal.style.display = "block";
}

/**
 * @description :: fetches admin user list
 */
function fetchAdminUserList() {
	if (document.getElementById('user_table')) {
		sTable = jQuery('#user_table')
			.dataTable({
				"bProcessing": true,
				"bServerSide": true,
				"bDestroy": true,
				"oLanguage": {
					"sLoadingRecords": "Please wait - loading...",
				},
				"processing": true,
				"sPaginationType": "full_numbers",
				"sAjaxSource": "/ajaxuserlist",
				"lengthMenu": [
					[10, 25, 50, 100],
					[10, 25, 50, 100]
				],
				"iDisplayLength": 100,
				"aoColumns": [{
					"mData": "loopid",
					"bSortable": false
				}, {
					"mData": "firstName"
				}, {
					"mData": "lastName"
				}, {
					"mData": "email"
				}, {
					"mData": "businessName"
				}, {
					"mData": "actiondata",
					"bSortable": false
				}]
			});
		jQuery('#user_table_filter input')
			.unbind();
		jQuery('#user_table_filter input')
			.bind('keyup', function(e) {
				if (e.keyCode == 13) {
					sTable.fnFilter(this.value);
				}
			});
		jQuery('#user_table')
			.parent()
			.addClass('table-responsive');
	}
}

/**
 * @description :: fetches customer list
 */
function fetchCustomerList() {
	if (document.getElementById('customeruser_table')) {
		sTable = jQuery('#customeruser_table')
			.dataTable({
				"bProcessing": true,
				"bServerSide": true,
				"bDestroy": true,
				"oLanguage": {
					"sLoadingRecords": "Please wait - loading...",
				},
				"processing": true,
				"sPaginationType": "full_numbers",
				"sAjaxSource": "/ajaxcustomerlist",
				"lengthMenu": [
					[10, 25, 50, 100],
					[10, 25, 50, 100]
				],
				"iDisplayLength": 100,
				"aoColumns": [{
					"mData": "loopid",
					"bSortable": false
				}, {
					"mData": "firstName"
				}, {
					"mData": "lastName"
				}, {
					"mData": "email"
				}, {
					"mData": "businessName"
				}, {
					"mData": "actiondata",
					"bSortable": false
				}]
			});
		jQuery('#customeruser_table_filter input')
			.unbind();
		jQuery('#customeruser_table_filter input')
			.bind('keyup', function(e) {
				if (e.keyCode == 13) {
					sTable.fnFilter(this.value);
				}
			});
		jQuery('#customeruser_table')
			.parent()
			.addClass('table-responsive');
	}
}

/**
 * @description :: fetches transaction list
 */
function fetchTransList() {
	if (document.getElementById('tranuser_table')) {
		var sTable = jQuery('#tranuser_table')
			.dataTable({
				"bProcessing": true,
				"bServerSide": true,
				"bDestroy": true,
				"oLanguage": {
					"sLoadingRecords": "Please wait - loading...",
				},
				"processing": true,
				"sPaginationType": "full_numbers",
				"sAjaxSource": "/ajaxtransactions",
				"lengthMenu": [
					[10, 25, 50, 100],
					[10, 25, 50, 100]
				],
				"iDisplayLength": 100,
				"aoColumns": [{
					"mData": "loopid",
					"bSortable": false
				}, {
					"mData": "createdAt"
				}, {
					"mData": "firstName"
				}, {
					"mData": "lastName"
				}, {
					"mData": "email"
				}, {
					"mData": "amount"
				}, {
					"mData": "status"
				}]
			});
		jQuery('#tranuser_table_filter input')
			.unbind();
		jQuery('#tranuser_table_filter input')
			.bind('keyup', function(e) {
				if (e.keyCode == 13) {
					sTable.fnFilter(this.value);
				}
			});
		jQuery('#tranuser_table')
			.parent()
			.addClass('table-responsive');
	}
}

/**
 * @description :: Handles add customer form submission
 */
function frmsubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#customerform');
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful!');
			console.log(data);
			jQuery('#myModal')
				.hide();
			sTable.api().ajax.reload( null, false )			
			jQuery(".loaderBg")
				.hide();
			swal(data);
		},
		error: function(data) {
			console.log('An error occurred!');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
				sTable.api().ajax.reload( null, false )
			if (data.status == 500)	
				swal('An error occurred!');
			else	
				swal(data.responseText);
		},
		
	});
}

/**
 * @description :: Handles send money form submission
 */
function frmsendsubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#sendform');
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful!');
			console.log(data);
			jQuery('#sendmoney')
				.hide();
			jQuery(".loaderBg")
				.hide();
			swal(data);
		},
		error: function(data) {
			console.log('An error occurred!');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
			if (data.responseText)
				swal(data.responseText);
			else
				swal('An error occurred!');
		},
	});
}

/**
 * @description :: Handles micro deposit submission
 */
function micro(id) {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#sendform');
	jQuery.ajax({
		type: 'post',
		url: 'microDeposits',
		data: {
			'customer_id': id
		},
		success: function(data) {
			console.log('Submission was successful!');
			console.log(data);
			jQuery('#sendmoney')
				.hide();
			jQuery(".loaderBg")
				.hide();
			
			sTable.api().ajax.reload( null, false )
			swal(data);
			
			/*if (data == 'processed') {
				jQuery("#send" + id)
					.show();
				jQuery("#fundurl" + id)
					.show();
				jQuery("#micro" + id)
					.hide();
					
			}
			if (data == 'failed') {
				jQuery("#fund" + id)
					.show();
				jQuery("#micro" + id)
					.hide();
			}*/
		},
		error: function(data) {
			console.log('An error occurred.');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
			if (data.responseText)
				swal(data.responseText);
			else
				swal('An error occurred!');
		},
	});
}



/**
 * @description :: Handles add user form submission
 */
function frmusersubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#userform');
	var valid = frm[0].checkValidity();
	if (valid){
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful.');
			console.log(data);
			jQuery('#myModal')
				.hide();
			fetchAdminUserList();
			jQuery(".loaderBg")
				.hide();
			swal(data);
		},
		error: function(data) {
			console.log('An error occurred.');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
			if (data.responseText)
				swal(data.responseText);
			else
				swal('An error occurred.');
		},
	});
	} else {
		jQuery(".loaderBg")
		.hide();	
	}
	return false;
}



/**
 * @description :: Handles add user edit form submission
 */
function frmeditsubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#edituserform');
	var valid = frm[0].checkValidity();
	if (valid){
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful.');
			console.log(data);
			closemodal('edituser');
			sTable.api().ajax.reload( null, false )
			jQuery(".loaderBg")
				.hide();
			swal(data);
		},
		error: function(data) {
			console.log('An error occurred.');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
			if (data.responseText)
				swal(data.responseText);
			else
				swal('An error occurred.');
		},
	});
	} else {
		jQuery(".loaderBg")
		.hide();	
	}
	return false;
}

/**
 * @description :: Handles manual form submission
 */
function frmfundsubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#manualForm');
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful.');
			console.log(data);
			sTable.api().ajax.reload( null, false )
			closemodal('manual');
			/*jQuery('#manual')
				.hide();
			jQuery('#fund' + jQuery("#mcustomer_id")
					.val())
				.hide();
			jQuery('#micro' + jQuery("#mcustomer_id")
					.val())
				.show();
			//jQuery("#infomessage").html(data);*/
			jQuery(".loaderBg")
				.hide();
			swal(data);
		},
		error: function(data) {
			console.log('An error occurred.');
			console.log(data);
			//jQuery("#popuperror").html('An error occurred.');
			jQuery(".loaderBg")
				.hide();
			if (data.responseText)
				swal(data.responseText);
			else
				swal('An error occurred.');
		},
	});
}

/**
 * @description :: Handles mass pay form submission
 */
function frmMassPaySubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#csvProcess');
	var actionURL = frm.attr('action');
	var csvLocalPath = (jQuery('input[name=csvLocalPath]')
		.val());
	var batchType = (jQuery('#uploadBatchType')
		.val());
	var customerObj = (jQuery('#customerObj')
		.val());
	
	jQuery.ajax({
		url: actionURL,
		type: 'POST',
		data: {
			'csvLocalPath': csvLocalPath,
			'batchType': batchType,
			'customerObj': customerObj
		},
		success: function(data) {
			console.log('Masspay was successful.');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
			
			swal(data, '', "success");
		},
		error: function(request, error) {
			//alert("Request: " + JSON.stringify(request));
			jQuery(".loaderBg")
				.hide();
			//swal("Something went wrong!", JSON.stringify(request), "error");
			console.log(request);
			if(request.status==500) {
				swal('An error occurred!');
			} else 	{
				if (request.responseText)
					swal(request.responseText);
				else
					swal('An error occurred!');
			}
		}
	});
}

/**
 * @description :: Fetches mass pay list
 */
function fetchMassPayList() {
	if (document.getElementById('massPayList_table')) {
		sTable = jQuery('#massPayList_table')
			.dataTable({
				"bProcessing": true,
				"bServerSide": true,
				"bDestroy": true,
				"oLanguage": {
					"sLoadingRecords": "Please wait - loading...",
				},
				"processing": true,
				"sPaginationType": "full_numbers",
				"sAjaxSource": "/ajaxMassPay",
				"lengthMenu": [
					[10, 25, 50, 100],
					[10, 25, 50, 100]
				],
				"iDisplayLength": 100,
				"aoColumns": [{
					"mData": "loopid",
					"bSortable": false
				}, {
					"mData": "createdAt"
				}, {
					"mData": "status"
				}, {
					"mData": "batchType"
				}, {
					"mData": "actiondata",
					"bSortable": false
				}]
			});
		jQuery('#massPayList_table_filter input')
			.unbind();
		jQuery('#massPayList_table_filter input')
			.bind('keyup', function(e) {
				if (e.keyCode == 13) {
					sTable.fnFilter(this.value);
				}
			});
		jQuery('#massPayList_table')
			.parent()
			.addClass('table-responsive');
	}
}


/**
 * @description :: Fetches mass pay list item
 */
function fetchMassPayListItem(id) {
	if (document.getElementById('massPayListitem_table')) {
		sTable = jQuery('#massPayListitem_table')
			.dataTable({
				"bProcessing": true,
				"bServerSide": true,
				"bDestroy": true,
				"oLanguage": {
					"sLoadingRecords": "Please wait - loading...",
				},
				"processing": true,
				"sPaginationType": "full_numbers",
				"sAjaxSource": "/ajaxMassPayitem?id="+id,
				"lengthMenu": [
					[10, 25, 50, 100],
					[10, 25, 50, 100]
				],
				"iDisplayLength": 100,
				"aoColumns": [{
					"mData": "customer_id",
					
				}, {
					"mData": "firstName"
				}, {
					"mData": "lastName"
				}, {
					"mData": "Amount"
				}, {
					"mData": "status",
				}]
			});
		jQuery('#massPayListitem_table_filter input')
			.unbind();
		jQuery('#massPayListitem_table_filter input')
			.bind('keyup', function(e) {
				if (e.keyCode == 13) {
					sTable.fnFilter(this.value);
				}
			});
		jQuery('#massPayListitem_table')
			.parent()
			.addClass('table-responsive');
	}
}


/**
 * @description :: Shows the funding URL
 */
function fundurl(s) {
	swal(jQuery(s)
		.data('fund'));
}

/**
 * @description :: Handles the floating label by adding 'is-filled' class
 */
jQuery(function() {
	var formAnimatedInput = jQuery('.form-animate-fields .form-control');
	formAnimatedInput.each(function() {
		var $this = jQuery(this);
		$this.on('focus', function() {
			$this.addClass('is-filled');
		});
		$this.on('blur', function() {
			if ($this.val()
				.length == 0) {
				$this.removeClass('is-filled');
			}
		});
	});
});

/**
 * @description :: Handles the Mass pay CSV submission
 */
function csvfrmsubmit() {
	//jQuery(".loaderBg").show();	
	
	return false;
	var frm = jQuery('#csvUpload');	
	var vale = jQuery('input[name=csvUpload]')
		.val();
	
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful.');
		},
		error: function(data) {
			console.log('An error occurred.');
			console.log(data);
			jQuery("#popuperror")
				.html('An error occurred.');
			jQuery(".loaderBg")
				.hide();
		},
	});
}

/**
 * @description :: Handles the Customer CSV submission
 */
function csvCustomerfrmsubmit() {
	//jQuery(".loaderBg").show();	
	
	var frm = jQuery('#csvCustomerUpload');	
	var vale = jQuery('input[name=csvCustomerUpload]')
		.val();
	
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		data: frm.serialize(),
		success: function(data) {
			console.log('Submission was successful.');
		},
		error: function(data) {
			console.log('An error occurred.');
			console.log(data);
			jQuery("#popuperror")
				.html('An error occurred.');
			jQuery(".loaderBg")
				.hide();
		},
	});
}

/**
 * @description :: Handles the entered code to be number
 */
function isNumber(evt, element) {
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (
		(charCode != 45 || $(element)
			.val()
			.indexOf('-') != -1) &&		 // “-” CHECK MINUS, AND ONLY ONE.
		(charCode != 46 || $(element)
			.val()
			.indexOf('.') != -1) && 	// “.” CHECK DOT, AND ONLY ONE.
		(charCode < 48 || charCode > 57))
		return false;
	return true;
}

/**
 * @description :: Handles the CSV sample download
 */
function csvDownload() {	
	
	
	var groupId = jQuery( "#custGroup" ).val();	
	
	jQuery(".loaderBg").show();	
	jQuery.ajax({
		type: 'POST',
		url: '/getCSVFile',
		data: {'groupId': groupId},
		success: function(data) {
			
			if(data.status==200) {
				var csvFileName = data.csvFileName;			
				var origin = window.location.origin;			
				var fullFilePath = (origin+"/uploads/"+csvFileName);			
				var url = fullFilePath;
				
				setTimeout( function(){ 
					jQuery(".loaderBg")
						.hide();
					document.getElementById('my_iframe').src = url;
				  }  , 5000 );
			} else {
				jQuery(".loaderBg")
				.hide();
				swal("Something went wrong!", "", "error");
			}
			
		},
		error: function(data) {
			jQuery(".loaderBg")
				.hide();
			console.log('An error occurred.');	
		},
	});
}

/**
 * @description :: Handles mass pay form submission
 */
function frmMassCustomerSubmit() {
	jQuery(".loaderBg")
		.show();
	var frm = jQuery('#csvCustomerProcess');
	var actionURL = frm.attr('action');
	var csvLocalPath = (jQuery('input[name=csvLocalPath]')
		.val());
	var batchType = (jQuery('#uploadBatchType')
		.val());
	
	jQuery.ajax({
		url: actionURL,
		type: 'POST',
		 dataType: "json",
		data: {
			'csvLocalPath': csvLocalPath,
			'batchType': batchType
		},
		success: function(data) {
			console.log('Masspay was successful.');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
			if (data.ccustomer == 0)
					var datamsg = data.fcustomer + "  customer(s) already existed!"
			else
					var datamsg = data.ccustomer + " new customer(s) created! <br/>" + data.fcustomer + "  customer(s) already existed!"
			
			swal(datamsg , data.errormsg, "success");
				
		},
		error: function(request, error) {
			//alert("Request: " + JSON.stringify(request));
			jQuery(".loaderBg")
				.hide();
			//swal("Something went wrong!", JSON.stringify(request), "error");
			if (request.responseText)
				swal(request.responseText);
			else
				swal('An error occurred!');
		}
	});
}