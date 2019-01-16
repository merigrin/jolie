var sTable;

jQuery(document)
	.ready(function($) {
		fetchGroupList();			// fetches group list in mass pay page				
	});

jQuery(document).on('click', '.panel-heading', function(e){
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

jQuery(document.body).on('click', '#selecctall', function () {
    
});



/**
 *  jQuery.SelectListActions
 *  https://github.com/esausilva/jquery.selectlistactions.js
 *
 *  (c) http://esausilva.com
 */

(function(jQuery) {
  //Moves selected item(s) from sourceList to destinationList
  jQuery.fn.moveToList = function(sourceList, destinationList) {
    var opts = jQuery(sourceList + ' option:selected');
    if (opts.length == 0) {
      swal("Nothing to move",'','error');
    }

    jQuery(destinationList).append(jQuery(opts).clone());
  };

  //Moves all items from sourceList to destinationList
  jQuery.fn.moveAllToList = function(sourceList, destinationList) {
    var opts = jQuery(sourceList + ' option');
    if (opts.length == 0) {
      swal("Nothing to move",'','error');
    }

    jQuery(destinationList).append(jQuery(opts).clone());
  };

  //Moves selected item(s) from sourceList to destinationList and deleting the
  // selected item(s) from the source list
  jQuery.fn.moveToListAndDelete = function(sourceList, destinationList) {
    var opts = jQuery(sourceList + ' option:selected');
    if (opts.length == 0) {
      swal("Nothing to move",'','error');
    }

    jQuery(opts).remove();
    jQuery(destinationList).append(jQuery(opts).clone());
  };

  //Moves all items from sourceList to destinationList and deleting
  // all items from the source list
  jQuery.fn.moveAllToListAndDelete = function(sourceList, destinationList) {
    var opts = jQuery(sourceList + ' option');
    if (opts.length == 0) {
      alert("Nothing to move");
    }

    jQuery(opts).remove();
    jQuery(destinationList).append(jQuery(opts).clone());
  };

  //Removes selected item(s) from list
  jQuery.fn.removeSelected = function(list) {
    var opts = jQuery(list + ' option:selected');
    if (opts.length == 0) {

	  swal("Nothing to remove",'','error');
    }

    jQuery(opts).remove();
  };

  //Moves selected item(s) up or down in a list
  jQuery.fn.moveUpDown = function(list, btnUp, btnDown) {
    var opts = jQuery(list + ' option:selected');
    if (opts.length == 0) {
     
	  swal("Nothing to move",'','error');
    }

    if (btnUp) {
      opts.first().prev().before(opts);
    } else if (btnDown) {
      opts.last().next().after(opts);
    }
  };
})(jQuery);


 

jQuery('#btnRight').click(function(e) {
	jQuery('select').moveToListAndDelete('#lstBox1', '#lstBox2');
	e.preventDefault();
});

jQuery('#btnAllRight').click(function(e) {
	jQuery('select').moveAllToListAndDelete('#lstBox1', '#lstBox2');
	e.preventDefault();
});

jQuery('#btnLeft').click(function(e) {
	jQuery('select').moveToListAndDelete('#lstBox2', '#lstBox1');
	e.preventDefault();
});

jQuery('#btnAllLeft').click(function(e) {
	jQuery('select').moveAllToListAndDelete('#lstBox2', '#lstBox1');
	e.preventDefault();
});




/**
 * @description :: Handles add customer form submission
 */
function groupFormsubmit() {
	jQuery(".loaderBg").show();
	var frm = jQuery('#groupForm');
	var groupName = (jQuery('#groupName')
		.val());
	
	var customerId = [];	
	var value = '';
	var id = jQuery("#lstBox2 option").each(function()
	{	
		value = jQuery(this).val();
		customerId.push(value);
		// Add $(this).val() to your list
	});
	
	document.getElementById("show").value = customerId;
	
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		//data: frm.serialize(),
		data: {'customerId': customerId, 'groupName':groupName},
		success: function(data) {
			
			if(data.status==200) {			
				jQuery(".loaderBg")
					.hide();		
					
					swal("Group created Successfully!", "", "success");
					setTimeout( function(){ 
						window.location = "/groupList";
					  }  , 3000 );
				
			} else if(data.status==401) {
				jQuery(".loaderBg")
					.hide();
				swal("Enter the group name!", "", "error");
			} else {
				jQuery(".loaderBg")
					.hide();
				swal("Choose the customer!", "", "error");
			}
				
		},
		error: function(data) {
			console.log('An error occurred!');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
				
			if (data.status == 500)	
				swal('An error occurred!');
			else	
				swal(data.responseText);
		},
		
	});
}


/**
 * @description :: Handles add customer form submission
 */
function groupFormsubmit1() {
	jQuery(".loaderBg").show();
	var frm = jQuery('#groupForm');
	var groupName = (jQuery('#groupName')
		.val());
	
	var groupId = (jQuery('#groupId')
		.val());
	
	var customerId = [];	
	var value = '';
	var id = jQuery("#lstBox2 option").each(function()
	{	
		value = jQuery(this).val();
		customerId.push(value);
		// Add $(this).val() to your list
	});
	
	document.getElementById("show").value = customerId;
	
	jQuery.ajax({
		type: frm.attr('method'),
		url: frm.attr('action'),
		//data: frm.serialize(),
		data: {'customerId': customerId, 'groupName':groupName,'groupId':groupId},
		success: function(data) {
			
			if(data.status==200) {			
				jQuery(".loaderBg")
					.hide();		
					
					swal("Group updated Successfully!", "", "success");
					setTimeout( function(){ 
						window.location = "/groupList";
					  }  , 3000 );
				
			} else if(data.status==401) {
				jQuery(".loaderBg")
					.hide();
				swal("Enter the group name!", "", "error");
			} else {
				jQuery(".loaderBg")
					.hide();
				swal("Choose the customer!", "", "error");
			}
				
		},
		error: function(data) {
			console.log('An error occurred!');
			console.log(data);
			jQuery(".loaderBg")
				.hide();
				
			if (data.status == 500)	
				swal('An error occurred!');
			else	
				swal(data.responseText);
		},
		
	});
}


/**
 * @description :: Fetches mass pay list
 */
function fetchGroupList() {
	if (document.getElementById('groupList_table')) {
		sTable = jQuery('#groupList_table')
			.dataTable({
				"bProcessing": true,
				"bServerSide": true,
				"bDestroy": true,
				"oLanguage": {
					"sLoadingRecords": "Please wait - loading...",
				},
				"processing": true,
				"sPaginationType": "full_numbers",
				"sAjaxSource": "/ajaxgroupList",
				"lengthMenu": [
					[10, 25, 50, 100],
					[10, 25, 50, 100]
				],
				"iDisplayLength": 100,
				"aoColumns": [{
					"mData": "loopid",
					"bSortable": false
				}, {
					"mData": "groupName"
				}, {
					"mData": "createdAt"
				}, {
					"mData": "actiondata",
					"bSortable": false
				}]
			});
		jQuery('#groupList_table_filter input')
			.unbind();
		jQuery('#groupList_table_filter input')
			.bind('keyup', function(e) {
				if (e.keyCode == 13) {
					sTable.fnFilter(this.value);
				}
			});
		jQuery('#groupList_table')
			.parent()
			.addClass('table-responsive');
	}
}

/**
 * @description :: handles edituser popup
 * @param :: id
 */
function editgroup(id) {
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
 * @description :: handles delete group
 * @param :: id
 */
function deletegroup(id) {
		
	var buttons = jQuery('<div style="padding:50px">')
		.append(createButton('Okay', 'SecBtn', function() {
			swal.close();
			jQuery(".loaderBg")
					.show();
			jQuery.ajax({
				url: 'deleteGroup',
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
