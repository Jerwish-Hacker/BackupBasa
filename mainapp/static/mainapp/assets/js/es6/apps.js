// https://stackoverflow.com/a/41992719
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }
  $(function () {

    "use strict";

    // STEP FORM
    const validation = {
        email: /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,9})/,
    }
    const dashboardApp = {
        userID:null,
        userData:[],
        data:[],
        fav_data:[],
        operation_type: null,
        favourite_app: null,
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        site_admin_app_type: 'all',
        search_key: '',
        apps_type:'all',
        app_management_app_type: 'all',
        app_id: null,
        apps_order: [],
        type_of_submit: null,
        outreach_publish_status: '',
        outreach_publish_status_selected: '',
        outreachList:[],
        statusList:[],
        zipFilterList:[],
        ageFromList:[],
        ageToList:[],
        definedFields:["identifier","identifier_system","active","name_given","name_family","name_prefix","name_suffix","contact_value","contact_use","gender","birthDate","address_use","address_line","address_city","address_district","address_state","address_postalCode","address_country","photo"],
        user_count: {
            all: 0,
            org_admin: 0,
        },
        box_type_selected:'users_all',
        app_name:null,
        time_slot:1,
        quality_name:'Grievance dashboard',
        quality_reports: [],
        quality_fields: ['Report Type', 'Service Type','Event Type','Health Plan'],
        selected_field: 'Report Type',
        apps_table:false,
        app_table_box:'Total',
        user_crud_operation_type: null,
        init: function () {

            // $('body').on('click','.news-Slide-up',function(){
            //     $('body').find('.newsCaption').css(
            //         {"opacity": 1,
            //         "-webkit-transform": "translateY(85%)",
            //                 "transform": "translateY(85%)",
            //         "-webkit-transition": "","transition": "",
            //         "transition": "",
            //         "transition": ""}
            //     )
            //     if(!$(this).children('.newsCaption').hasClass('expanded')){
            //         $(this).children('.newsCaption').css({"opacity": 1,
            //         "-webkit-transform": "translateY(0px)",
            //                 "transform": "translateY(0px)",
            //         "-webkit-transition": "opacity 0.1s","transition": "opacity 0.1s,-webkit-transform 0.4s",
            //         "transition": "transform 0.4s ,opacity 0.1s",
            //         "transition": "transform 0.4s, opacity 0.1s, -webkit-transform 0.4s"})
            //         $(this).children('.newsCaption').addClass('expanded')
            //     }
            //     else{
            //         $(this).children('.newsCaption').css(
            //             {"opacity": 1,
            //             "-webkit-transform": "translateY(85%)",
            //                     "transform": "translateY(85%)",
            //             "-webkit-transition": "","transition": "",
            //             "transition": "",
            //             "transition": ""}
            //         )
            //         $(this).children('.newsCaption').removeClass('expanded')

            //     }
            // })

            $('body').on('change','#id_ingress', function(e){
                var validate = dashboardApp.FileValidate(e)
                if(validate){
                    $('#id_ingress_form .btn-primary').prop('disabled', false);
                }
                else{
                    $('#id_ingress_form .btn-primary').prop('disabled', true);
                }
                
            })
            $('body').on('submit','#id_ingress_form',function(e){
                e.preventDefault()
                $('#ingress-model .fa-spinner').removeClass('d-none')
                $('.upload_text').removeClass('d-none')
                var formData = new FormData(this);
                $.ajax({
                    type: "POST",
                    url: "/api/v1/users/bulk-upload/",
                    data: formData,
                    success: (res) => {
                        var error = $('#ingress-error-alert')
                        error.addClass('alert-danger').removeClass('alert-success')
                        error.removeClass('d-none')
                        $('.upload_text').addClass('d-none')
                        $('#ingress-model .fa-spinner').addClass('d-none')
                        if(res.status==1){
                            error.removeClass('alert-danger').addClass('alert-success')
                            error.html('Updated successfully')
                        }
                        else if(res.status==2){
                            error.html('File structure mismatch!')
                        }
                        else{
                            error.html('Something happened please try again later')
                        }
                        setTimeout(function () {
                            error.addClass('d-none')
                        }, 3000)
                    },
                    error: (err) => {
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                })
            })
            
            $('body').on('click', '.add_app_button, .edit-model', function () {
                $("#id_app_name").prop('disabled', false);
                $("#id_info_text").prop('disabled', false);
                $("#id_app_domain").prop('disabled', false);
                $("#id_app_type").prop('disabled', false);
                $("#id_app_logo").prop('disabled', false);
                $('#id_button_name_1').prop('disabled',false)
                $('#id_button_name_2').prop('disabled',false)
                $('#id_button_name_3').prop('disabled',false)
                $('#id_button_url_1').prop('disabled',false)
                $('#id_button_url_2').prop('disabled',false)
                $('#id_button_url_3').prop('disabled',false)
                dashboardApp.type_of_submit = 'add'
                $('.update_button').addClass('d-none')
                $('.app_delete').addClass('d-none')
                $('.add_button').removeClass('d-none')
                
                $('#app_image_preview').addClass('d-none')
                $('#app_image_preview').attr("src","");
            })

            $('body').on('click', '.app_delete',function () {
                $('#delete_app_text').html(`Do you want to delete '${dashboardApp.app_name}' ?`)
            })

            $('body').on('click', '#delete-app-model .btn-danger',function () {
                dashboardApp.deleteApp()
            })
            //Admin panel part

            $('body').on('click', 'a.userlist',function () {
                dashboardApp.limit = 50
                dashboardApp.page = 1
                dashboardApp.pagination = {}
                dashboardApp.userListPOST();
            })

            $('body').on('click', 'a.memberedit',function () {
                window.open('/member/patients/', '_blank');
            })

            $('body').on('click', 'a.consentedit',function () {
                window.open('/consent/management/', '_blank');
            })
            
            $('body').on('click', 'a.loganalytics',function () {
                dashboardApp.limit = 50
                dashboardApp.page = 1
                dashboardApp.pagination = {}
                dashboardApp.setDate(start, end)
            })

            $('body').on('click', 'a.app_management',function () {
                dashboardApp.limit = 50
                dashboardApp.page = 1
                dashboardApp.pagination = {}
                dashboardApp.apps_table = true
                dashboardApp.apps_type='all'
                dashboardApp.search_key=''
                dashboardApp.renderAppsTable()
            })
         
            $('body').on('click', 'span.delete_user_icon',function () {
                dashboardApp.userID = $(this).data('id')
                dashboardApp.user_crud_operation_type = 'delete'
                $('#delete_user_text').html(`Do you want to delete '${$(this).data('username')}' ?`)
            })

            $('body').on('click', '#deleteuser-model .btn-danger',function () {
                dashboardApp.addEditUser(null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null)
            })

            $('body').on('click', '.add_user_button',function () {
                dashboardApp.user_crud_operation_type = 'add'
                $('#addedituser-model .btn-primary').html(`<i class="fa fa-spinner fa-spin d-none"></i> Add`)
            })

            $('body').on('click', 'span.edit_icon',function () {
                dashboardApp.user_crud_operation_type = 'update'
                dashboardApp.userID = $(this).data('id')
                dashboardApp.renderUserModal()
                $('#addedituser-model .btn-primary').html(`<i class="fa fa-spinner fa-spin d-none"></i> Update`)
            })

            $('body').on('click', '#addedituser-model .btn-primary',function () {
                var validation = dashboardApp.validateUserModal()
                if(validation){
                    const date_of_birth = $('input[name=date_of_birth]').val()
                    const hire_date = $('input[name=hire_date]').val()
                    const positionid = $('input[name=position_id]').val()
                    const emailid = $('input[name=email]').val()
                    const reports_to_name = $('input[name=reports_to_name]').val()
                    const payroll_name = $('input[name=payroll_name]').val()
                    const position_status = $('input[name=position_status]').val()
                    const worker_category_description = $('input[name=worker_category_description]').val()
                    const job_title_description = $('input[name=job_title_description]').val()
                    const region = $('input[name=region]').val()
                    const eeo_establishment = $('input[name=eeo_establishment]').val()
                    const job_function_description = $('input[name=job_function_description]').val()
                    const home_department_description = $('input[name=home_department_description]').val()
                    const union_code = $('input[name=union_code]').val()
                    var isstaff = false
                    const emp_status = $('select[name=emp_status]').val()
                    if($('input[name="is_staff"]').prop('checked') == true){
                        isstaff = true
                    }
                    dashboardApp.addEditUser(date_of_birth,hire_date,positionid,emailid,reports_to_name,payroll_name,position_status,worker_category_description,job_title_description,region,eeo_establishment,job_function_description,home_department_description,union_code,isstaff,emp_status)
                }
            })

            $('body').on('click', '.edit_group_icon',function () {
                $('.user_available_location,.user_assigned_location,.not_existing_group,.existing_group').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                var username = $(this).data('username')
                const app_name = $('#id_edit_user_app_location_app_selector').val()
                dashboardApp.userID = $(this).data('id')
                dashboardApp.FetchUserLocation(app_name)
                $('#usergroup-model .modal-title').html('Edit user permission of '+username)
                dashboardApp.FetchUserGroup()
            })

            $('body').on('change', '#id_edit_user_app_location_app_selector',function () {
                $('.user_available_location,.user_assigned_location').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="sr-only">Loading...</span>
                </div>`);
                const app_name = $('#id_edit_user_app_location_app_selector').val()
                dashboardApp.FetchUserLocation(app_name)
            })

            $('body').on('dblclick', '.remove_group', function () {
                var group_id= $(this).data('id')
                dashboardApp.removeFromGroup(group_id)
            })

            $('body').on('dblclick', '.add_group',function () {
                var group_id= $(this).data('id')
                dashboardApp.addtoGroup(group_id)
            })

            $('body').on('dblclick', '.userlocation_removegroup',function () {
                $('.user_available_location,.user_assigned_location').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="sr-only">Loading...</span>
                </div>`);
                const id = $(this).data('id')
                const app_name = $('#id_edit_user_app_location_app_selector').val()
                dashboardApp.UserLocationEdit(id,'remove_group',app_name)
            })

            $('body').on('dblclick', '.userlocation_addgroup',function () {
                $('.user_available_location,.user_assigned_location').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="sr-only">Loading...</span>
                </div>`);
                const id = $(this).data('id')
                const app_name = $('#id_edit_user_app_location_app_selector').val()
                dashboardApp.UserLocationEdit(id,'add_group',app_name)
            })
            
            $('body').on('click', '.addlocation',function () {
                $("input[name='addlocation-location']").val('')
            })

            $('body').on('click', 'span.delete_location',function () {
                dashboardApp.userID = $(this).data('id')
                dashboardApp.type_of_submit = "delete_location"
                $('#editdeletelocation-model .modal-body').html(
                    `<div class="col-md-12">
                        <label>Do you want to delete ${$(this).data('name')} ?</label>
                    </div>`
                )
                $('#editdeletelocation-model .modal-title').html('Delete Location')
                $('#editdeletelocation-model .btn-primary').html('<i class="fa fa-spinner fa-spin d-none"></i> Delete')
            })

            $('body').on('click', '#editdeletelocation-model .btn-primary',function () {
                $('#editdeletelocation-model .btn-primary').prop('disabled',true)
                $('#editdeletelocation-model .fa-spinner').removeClass('d-none')
                dashboardApp.AddEditLocation($('input[name="editdeletelocation-location"]').val(),dashboardApp.type_of_submit)
            })

            $('body').on('click', 'span.edit_location',function () {
                dashboardApp.userID = $(this).data('id')
                dashboardApp.type_of_submit = "edit_location"
                $('#editdeletelocation-model .modal-body').html(
                    `<div class="col-md-12">
                        <input class="form-control" name="editdeletelocation-location" type="text" placeholder="Location">
                    </div>`
                )
                $('input[name="editdeletelocation-location"]').val($(this).data('name'))
                $('#editdeletelocation-model .modal-title').html('Edit Location')
                $('#editdeletelocation-model .btn-primary').html('<i class="fa fa-spinner fa-spin d-none"></i> Save')
            })

            $('body').on('click', '#addlocation_addlocation',function () {
                var alert = $('#addlocation_error_alert')
                const location = $("input[name='addlocation-location']").val()
                if(location==''){
                    alert.addClass('alert-danger').removeClass('alert-success')
                    alert.removeClass('d-none')
                    alert.html("Please enter a location")
                }
                else{
                    $('#addlocation_addlocation').prop('disabled',true)
                    $('#addlocation-model .fa-spinner').removeClass('d-none')
                    dashboardApp.AddEditLocation(location,"add_location")
                }
                setTimeout(function () {
                    alert.addClass('d-none')
                }, 3000)
            })

            $('body').on('click', '.addqualityreport',function () {
                $("input[name='add-qualityreport']").val('')
            })

            $('body').on('click', 'span.delete_quality_report',function () {
                dashboardApp.userID = $(this).data('id')
                dashboardApp.type_of_submit = "delete_quality_report"
                dashboardApp.quality_name = $('#id_quality_type').val()
                $('#editdeletequalityreport-model .modal-body').html(
                    `<div class="col-md-12">
                        <label>Do you want to delete ${$(this).data('name')} ?</label>
                    </div>`
                )
                $('#editdeletequalityreport-model .modal-title').html('Delete Service Value')
                $('#editdeletequalityreport-model .btn-primary').html('<i class="fa fa-spinner fa-spin d-none"></i> Delete')
            })

            $('body').on('click', '#editdeletequalityreport-model .btn-primary',function () {
                if(dashboardApp.type_of_submit == "edit_quality_report" && $('input[name="editdeletequalityreport-qualityservice"]').val() == ""){
                    return
                }
                $('#editdeletequalityreport-model .btn-primary').prop('disabled',true)
                $('#editdeletequalityreport-model .fa-spinner').removeClass('d-none')
                dashboardApp.AddEditQualityReportType($('input[name="editdeletequalityreport-qualityservice"]').val(),dashboardApp.type_of_submit)
            })

            $('body').on('click', 'span.edit_report_type',function () {
                dashboardApp.userID = $(this).data('id')
                dashboardApp.type_of_submit = "edit_quality_report"
                dashboardApp.quality_name = $('#id_quality_type').val()
                $('#editdeletequalityreport-model .modal-body').html(
                    `<div class="col-md-12">
                        <input class="form-control" name="editdeletequalityreport-qualityservice" type="text" placeholder="Report Type">
                    </div>`
                )
                $('input[name="editdeletequalityreport-qualityservice"]').val($(this).data('name'))
                $('#editdeletequalityreport-model .modal-title').html('Edit Service Value')
                $('#editdeletequalityreport-model .btn-primary').html('<i class="fa fa-spinner fa-spin d-none"></i> Save')
            })

            $('body').on('click', '#id_addqualityreport',function () {
                var alert = $('#addqualityreport_error_alert')
                const report = $("input[name='add-qualityreport']").val()
                if(report==''){
                    alert.addClass('alert-danger').removeClass('alert-success')
                    alert.removeClass('d-none')
                    alert.html("Please enter a report type")
                }
                else{
                    $('#addlocation_addlocation').prop('disabled',true)
                    $('#addlocation-model .fa-spinner').removeClass('d-none')
                    dashboardApp.quality_name = $('#id_quality_type').val()
                    dashboardApp.AddEditQualityReportType(report,"add_report_type")
                }
                setTimeout(function () {
                    alert.addClass('d-none')
                }, 3000)
            })

            $('body').on('change', '#id_quality_type',function () {
                $('.all_qualityreport').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                dashboardApp.quality_name = $('#id_quality_type').val()
                if(dashboardApp.quality_name == "Grievance dashboard"){
                    dashboardApp.quality_fields = ['Report Type', 'Service Type','Event Type','Health Plan']
                }
                else if(dashboardApp.quality_name == "Complaint dashboard"){
                    dashboardApp.quality_fields = ['Report Type', 'Service Type','Event Type']
                }
                else if(dashboardApp.quality_name == "Standards of behavior dashboard"){
                    dashboardApp.quality_fields = ['Ethnicity/Race']
                }
                else if(dashboardApp.quality_name == 'Appointment'){
                    dashboardApp.quality_fields = ['Appointment Type', 'Identification Document Type', 'Primary Language','Ethnicity', 'Race']
                }
                else if (dashboardApp.quality_name == "Consent management admin") {
                    dashboardApp.quality_fields = [
                      "Consent Type",
                    ];
                  }
                let optionsHtml = ''
                dashboardApp.quality_fields.forEach(function (field) {
                    optionsHtml += `<option value="${field}">${field}</option>`
                });
                $('#id_quality_fields').html(optionsHtml)
                dashboardApp.selected_field = dashboardApp.quality_fields[0]
                dashboardApp.renderQualityFields()
            })

            $('body').on('change', '#id_quality_fields',function () {
                dashboardApp.selected_field = $(this).val()
                dashboardApp.renderQualityFields()
            })

            $('body').on('change', '#id_editapplocation_app_selector',function () {
                $('.all_locations,.all_assigned_locations,.all_users,.admin_users').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                const app_name = $('#id_editapplocation_app_selector').val()
                dashboardApp.FetchAppLocation(app_name)
            })

            $('body').on('click', '.editapplocation-model',function () {
                $('.all_locations,.all_assigned_locations,.all_users,.admin_users').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                const app_name = $(this).data('appname')
                $('#id_editapplocation_app_selector').val(app_name).prop('disabled',true)
                dashboardApp.FetchAppLocation(app_name)
            })

            $('body').on('dblclick', '.addlocation_removegroup',function () {
                $('.all_locations,.all_assigned_locations').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                const id = $(this).data('id')
                const app_name = $('#id_editapplocation_app_selector').val()
                dashboardApp.AppLocationEdit(id,'remove_group',app_name)
            })

            $('body').on('dblclick', '.addlocation_addgroup',function () {
                $('.all_locations,.all_assigned_locations').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                const id = $(this).data('id')
                const app_name = $('#id_editapplocation_app_selector').val()
                dashboardApp.AppLocationEdit(id,'add_group',app_name)
            })

            $('body').on('dblclick', '.addlocation_addadmin',function () {
                $('.all_users,.admin_users').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                const id = $(this).data('id')
                const app_name = $('#id_editapplocation_app_selector').val()
                dashboardApp.AppAdminEdit(id,'add_admin',app_name)
            })

            $('body').on('dblclick', '.addlocation_removeadmin',function () {
                $('.all_users,.admin_users').html(`
                <div class="spinner-border text-primary" role="status">
                  <span class="spinner_loader sr-only">Loading...</span>
                </div>`);
                const id = $(this).data('id')
                const app_name = $('#id_editapplocation_app_selector').val()
                dashboardApp.AppAdminEdit(id,'remove_admin',app_name)
            })

            $('body').on('click', '.getapps_back_button',function () {
                dashboardApp.search_key = ''
                dashboardApp.app_management_app_type = 'all'
                dashboardApp.apps_type = 'all'
                dashboardApp.site_admin_app_type = 'all'
                dashboardApp.page = 1
                dashboardApp.limit = 50
                dashboardApp.pagination= {}
                dashboardApp.apps_table = false
                $('#id_apps_type').val('all')
                $('#id_app_management_apps_type').val('all')
                $("input[name='apps_search']").val('')
                $("input[name='app_management_apps_search']").val('')
                dashboardApp.renderApps()
            })
            $('body').on('click', '.outreach-model',function () {
                dashboardApp.getOutreach()
            })

            $('body').on('click', '.outreachportals, #id_back_to_outreach_list, #id_update_outreach_publish',function () {
                dashboardApp.outreachTable()

            })

            $('body').on('change', '#id_schedule_type',function () {
                if($(this).val()=='recurring'){
                    $('.recurring').removeClass('d-none')
                }
                else{
                    $('.recurring').addClass('d-none')
                }
            })

            $('body').on('click', '.scheduler_slot_delete',function () {
                let slot_id = $(this).data('time_slot')
                $('.slot_div_id_'+slot_id).remove();
                dashboardApp.time_slot -= 1
            })

            $('body').on('keyup', '.timeinput',function () {
                let is_numberic_regex = new RegExp(/^\d+$/)
                if(!(is_numberic_regex.test(parseInt($(this).val(),10))) | $(this).val().split("").length>2){
                    $(this).val('')
                }
            })

            $('body').on('keyup', '#id_notification_text',function (e) {
                let fields = []
                dashboardApp.definedFields.forEach((element,index)=>{
                    fields.push(`{${element}}`)
                })
                $(this).autocomplete({
                    appendTo: "#outreach-model",
                    source: function( request, response ) {
                        var matches = $.map(fields, function (acItem) {
                            var text =  request.term.split( /\s\s*/ ).pop()
                            if (acItem.toUpperCase().indexOf(text.toUpperCase()) === 0) {
                                return acItem;
                            }
                        });
                        response(matches);
                    },
                    focus: function() {
                      // prevent value inserted on focus
                      return false;
                    },
                    select: function( event, ui ) {
                      var terms = this.value.split( /\s\s*/ );
                      // remove the current input
                      terms.pop();
                      // add the selected item
                      terms.push( ui.item.value );
                      // add placeholder to get the space at the end
                      terms.push( "" );
                      this.value = terms.join( " " );
                      return false;
                    }
                })
            })


            $('body').on('click', '#id_add_slot',function () {
                dashboardApp.time_slot += 1
              $('.timeslot').append(
                  `<div class="d-flex justify-content-start slot_div_id_${dashboardApp.time_slot}">
                  <div class="col-md-4 mb-2">
                    <input class="form-control timeinput" id="id_hr${dashboardApp.time_slot}" type="text" name="time${dashboardApp.time_slot}" placeholder="HH" > 
                  </div>
                  <div class="col-md-2 mb-2">
                     <input class="form-control timeinput" id="id_mm${dashboardApp.time_slot}" type="text" name="time${dashboardApp.time_slot}" placeholder="MM" > 
                  </div>
                  <div class="col-md-2 mb-2">
                    <div class="col-md-2 pt-2">
                        <span class="scheduler_slot_delete" title="Delete Slot" data-time_slot="${dashboardApp.time_slot}"><i class="fa fa-trash text-danger ml-1" style="font-size:18px;cursor:pointer;" ></i></span>
                    </div>
                   </div>
              </div>`
              );
            })

            $('body').on('click', '#id_add_outreach',function () {
                let html=''
                dashboardApp.ageFromList = []
                dashboardApp.ageToList = []
                html =`
                <div class="col-md-12 pt-1">
                    <label class="my-1">Outreach name</label> 
                    <input class="form-control" name="outreach-name" type="text">
                </div>
                <div class="col-md-12 pt-1">
                    <div class="card" id="fitler_fields">
                        <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseFieldsFilter" aria-expanded="false" aria-controls="collapseFieldsFilter" >  
                            <label class=" " >Outreach Filters</label> 
                        </a>
                        <div class="collapse form-check form-switch pb-2" id="collapseFieldsFilter" aria-labelledby="headingFilter" data-parent="#fitler_fields">
                            <div class="col-md-6">
                                <label class="my-1">Select Member Type</label> 
                                <select class="form-control" name="outreach_member_filter" id="id_outreach_member_filter">
                                    <option value="all">All Members</option>
                                    <option value="filter">Filter Members</option>
                                </select>
                            </div>
                            <div class="col-md-12 outreach_member_filter d-none pt-2">
                                <ul class="col-md-12 list-group list-group-flush" style="border:1px solid rgba(0,0,0,.125);" id="collapseAgeFilter" >
                                    <li class="list-group-item" style="border:0;">
                                        <label class="my-1">Age</label>
                                        <div class="row justify-content-start input-group">
                                            <div class="col-md-4">
                                                <input class="form-control" type="text" value="" name="filter_age_from" placeholder="From">
                                            </div>
                                            <div class="col-md-4">
                                                <input class="form-control" type="text" value="" name="filter_age_to" placeholder="To">
                                            </div>
                                            <span class="input-group-text" id="id_new_age" ><i class="fa fa-plus-square text-success ml-1" title="Add new age range" style="font-size:18px;cursor:pointer;" ></i></span>
                                        </div>
                                    </li>
                                </ul>
                                <ul class="col-md-12 list-group list-group-flush" style="border:1px solid rgba(0,0,0,.125);" id="collapseGenderFilter" >
                                    <li class="list-group-item" style="border:0;">
                                        <label class="my-1">Gender</label>
                                        <div class="row justify-content-start ml-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" name="maleGender" id="checkMale" checked>
                                            <label class="form-check-label" for="checkMale">
                                            Male
                                            </label>
                                        </div>
                                        <div class="form-check ml-2">
                                            <input class="form-check-input" type="checkbox" value="" name="femaleGender" id="checkFemale" checked>
                                            <label class="form-check-label" for="checkFemale">
                                            Female
                                            </label>
                                        </div>
                                        <div class="form-check ml-2" >
                                            <input class="form-check-input" type="checkbox" value="" name="unknownGender" id="checkUnknown" checked>
                                            <label class="form-check-label" for="checkUnknown">
                                            Unknown
                                            </label>
                                        </div>
                                        <div class="form-check ml-2">
                                            <input class="form-check-input" type="checkbox" value="" name="otherGender" id="checkOther" checked>
                                            <label class="form-check-label" for="checkOther">
                                            Other
                                            </label>
                                        </div>
                                        </div>
                                    </li>
                                </ul>
                                <ul class="col-md-12 list-group list-group-flush" style="border:1px solid rgba(0,0,0,.125);" id="collapseZipFilter" >
                                    <li class="list-group-item" style="border:0;">
                                        <label class="my-1">Zip Code</label>
                                    <div class="row justify-content-start">
                                        <div class="col-md-6">
                                            <input class="form-control" type="text" name="new_filter_zipcode">
                                        </div>
                                        
                                        <span class="input-group-text" id="id_new_zipcode" ><i class="fa fa-plus-square text-success ml-1" title="Add new zip filter" style="font-size:18px;cursor:pointer;" ></i></span>
                                    </div>
                                </li>`
                                    dashboardApp.zipFilterList =[]
                                    html +=`
                                    </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-12 pt-2">
                <div class="card" id="fields">
                    <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseFields" aria-expanded="false" aria-controls="collapseFields" >  
                        <label class=" " >Select Fields</label> 
                    </a>
                <div class="form-check form-switch">
                <ul class="collapse list-group list-group-flush" id="collapseFields" aria-labelledby="headingOne" data-parent="#fields">`
                dashboardApp.definedFields.forEach((element,index)=>{
                    html+=`<li class="list-group-item">
                                    <input class="form-check-input" name="selected-fields" type="checkbox" value="${element}" checked>
                                    <label class="form-check-label" name='selectfields' for="flexSwitchCheckChecked">${element}</label
                           </li>`
                })
                html +=`</ul></div></div></div>
                <div class="col-md-12 pt-2">
                <div class="card" id="status">
                    <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseStatus" aria-expanded="false" aria-controls="collapseStatus" >  
                        <label class=" " >Outreach Status</label> 
                    </a>
                    <div class="form-check form-switch">
                <ul class="collapse list-group list-group-flush" id="collapseStatus" aria-labelledby="headingOne" data-parent="#status">
                <li class="list-group-item">
                <div class="col-md-12 input-group mb-3">
                    <input class="form-control" placeholder="Enter new status...." type="text" aria-describedby="new_status" name="new_status_input">
                    <span class="add_outreach_status_icon input-group-text" id="id_new_status" ><i class="fa fa-plus-square text-success ml-1" title="Add Outreach Status" style="font-size:18px;cursor:pointer;" ></i></span>
                 </div>
            </li>`
                dashboardApp.statusList =[]
                html +=`
                </ul></div></div></div>`
                html+= `<div class="col-md-12 pt-2">
                <div class="card" id="schedule">
                    <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseSchedule" aria-expanded="false" aria-controls="collapseSchedule" >  
                        <label class=" " >Notification Schedule</label> 
                    </a>
                    <div class="form-check form-switch">
                <ul class="collapse list-group list-group-flush" id="collapseSchedule" aria-labelledby="headingOne" data-parent="#schedule">
                <li class="list-group-item">
                <div class="col-md-12" style="padding:0">
                    <input type="radio" value="enabled" name="scheduler_status" style="width:16px;height:16px" >
                    <label class="mx-2" style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;padding:0">Enable</label>
                    <input type="radio" value="disabled" name="scheduler_status" style="width:16px;height:16px" checked>
                    <label class="mx-2" style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;padding:0">Disable</label>
                </div>
                <hr>
                <div class="col-md-12" style="padding:0">
                    <label class="mx-2" style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;padding:0">Notification Text</label>
                    <div class="col-12 form-group">
                        <textarea id="id_notification_text" name="notification_text" rows="5" cols="80" style="width:100%;"></textarea>
                    <div>
                </div>
                <hr>
                <div class="col-md-12 d-flex justify-content-start input-group mb-3" style="padding:0">
                    <div class="col-md-4" style="padding:0">
                      <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Type</label>
                      <select class="form-control" name="schedule_type" id="id_schedule_type">
                        <option value="once">Once</option>    
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                          <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Start Date</label>
                          <input class="form-control datepicker" type="text" name="start_date" id="id_start_date" placeholder="MM/DD/YYYY">
                        </div>
                    </div>
                    <div class="col-md-4 recurring d-none">
                        <div class="form-group">
                          <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">End Date</label>
                          <input class="form-control datepicker customhidden" type="text" name="end_date" id="id_end_date" placeholder="MM/DD/YYYY">
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row mb-2" style="padding:0;">
                    <div class="col-md-12">
                      <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Execute on these days<label>
                    </div>
                    <div class="col-md-12">
                        <div class="weekDays-selector">
                            <input type="checkbox" id="weekday-mon" name="monday" value="monday" class="weekday" />
                            <label for="weekday-mon">Mon</label>
                            <input type="checkbox" id="weekday-tue" name="tuesday" value="tuesday" class="weekday" />
                            <label for="weekday-tue">Tue</label>
                            <input type="checkbox" id="weekday-wed" name="wednesday" value="wednesday" class="weekday" />
                            <label for="weekday-wed">Wed</label>
                            <input type="checkbox" id="weekday-thu" name="thursday" value="thursday" class="weekday" />
                            <label for="weekday-thu">Thu</label>
                            <input type="checkbox" id="weekday-fri" name="friday" value="friday" class="weekday" />
                            <label for="weekday-fri">Fri</label>
                            <input type="checkbox" id="weekday-sat" name="saturday" value="saturday" class="weekday" />
                            <label for="weekday-sat">Sat</label>
                            <input type="checkbox" id="weekday-sun" name="sunday" value="sunday" class="weekday" />
                            <label for="weekday-sun">Sun</label>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="d-flex justify-content-around" style="padding:0">
                    <div class="col-md-6">
                      <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Slots<label>
                    </div>
                    <div class="col-md-6 text-right">
                      <button type="button" class="btn btn-info" id="id_add_slot">Add Slot</button>
                    </div>
                </div>
                <div class="col-md-12 timeslot" style="padding:0">
                    <div class="d-flex justify-content-start">
                        <div class="col-md-4 mb-2">
                          <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Hour(24 hour format)</label>
                          <input class="form-control timeinput" id="id_hr1" type="text" name="hour1" placeholder="HH" > 
                        </div>
                        <div class="col-md-2 mb-2">
                           <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif">Minute</label>
                           <input class="form-control timeinput" id="id_mm1" type="text" name="time1" placeholder="MM" > 
                         </div>
                        <div class="col-md-2 mb-2">
                            <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Action</label>
                        </div>
                    </div>
                </div>
            </li>`
                $('#outreach-model .modal-body').html(html)
                html=`<button type="button" class="btn btn-success" id="id_create_outreach"><i class="fa fa-spinner fa-spin d-none"></i>Create</button>
                <button type="button" class="btn btn-dark" id="id_back_to_outreach_list">Back</button>`
                $('#outreach-model .modal-footer').html(html)
                $('#outreach-model .modal-title').html("Create Outreach Portal")

            })
            $('body').on('click', '#id_new_age',function () {
                let newAgeFrom = parseInt($('input[name=filter_age_from]').val())
                let newAgeTo = parseInt($('input[name=filter_age_to]').val())
                if(isNaN(newAgeFrom) || isNaN(newAgeTo)){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('From and To Cannot be Empty!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else if(newAgeFrom > newAgeTo){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('From Cannot Be Higher Than To!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else{
                    dashboardApp.ageFromList.push(newAgeFrom)
                    dashboardApp.ageToList.push(newAgeTo)
                    let index=dashboardApp.ageFromList.indexOf(newAgeFrom)
                    let html=`<li class="list-group-item col-md-6" style="border:0;" id="ageFilterListItem${index}">
                    <div class="input-group mb-3">
                    <input class=" col-md-4 form-control" value="${newAgeFrom}" type="text" aria-describedby="ageeditbutton${index}" id="agefrominput${index}" disabled>
                    <input class="col-md-4 form-control" value="${newAgeTo}" type="text" aria-describedby="ageeditbutton${index}" id="agetoinput${index}" disabled>
                    <span class="edit_outreach_age_filter_icon input-group-text" id="ageeditbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Age Filter" style="font-size:18px;cursor:pointer;" ></i></span>
                     </div>
                    </li>`
                    $('input[name=filter_age_from]').val("")
                    $('input[name=filter_age_to]').val("")
                    $('#collapseAgeFilter').append(html)
                }
            })
            $('body').on('click', '#id_new_zipcode',function () {
                let newZipFilter = $('input[name=new_filter_zipcode]').val()
                if(newZipFilter==""){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('Zip cannot be empty!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else if(dashboardApp.zipFilterList.indexOf(newZipFilter) > -1){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('Zip code already exists!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else{
                    dashboardApp.zipFilterList.push(newZipFilter)
                    let index=dashboardApp.zipFilterList.indexOf(newZipFilter)
                    let html=`<li class="list-group-item col-md-6" style="border:0;" id="zipFilterListItem${index}">
                    <div class="input-group mb-3">
                    <input class="form-control" value="${newZipFilter}" type="text" aria-describedby="zipeditbutton${index}" id="zipfilterinput${index}" disabled>
                    <span class="edit_outreach_zip_filter_icon input-group-text" id="zipfiltereditbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Zip Filter" style="font-size:18px;cursor:pointer;" ></i></span>
                     </div>
                    </li>`
                    $('input[name=new_filter_zipcode]').val("")
                    $('#collapseZipFilter').append(html)
                }
            })
            $('body').on('click', '#id_new_status',function () {
                let newStatus = $('input[name=new_status_input]').val()
                if(newStatus==""){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('Status cannot be empty!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else if(dashboardApp.statusList.indexOf(newStatus) > -1){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('Status name already exists!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else{
                    dashboardApp.statusList.push(newStatus)
                    let index=dashboardApp.statusList.indexOf(newStatus)
                    let html=`<li class="list-group-item" id="statusListItem${index}">
                    <div class="col-md-12 input-group mb-3">
                    <input class="form-control" value="${newStatus}" type="text" aria-describedby="editbutton${index}" id="statusinput${index}" disabled>
                    <span class="edit_outreach_status_icon input-group-text" id="editbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Status" style="font-size:18px;cursor:pointer;" ></i></span>
                     </div>
                    </li>`
                    $('input[name=new_status_input]').val("")
                    $('#collapseStatus').append(html)
                }
            })
            $('body').on('click', '.edit_outreach_status_icon',function () {
                let index= $(this).data('id')
                let attr = $('#statusinput'+index).attr('disabled')
                if(typeof attr !== 'undefined' && attr !== false){
                    $('#statusinput'+index).removeAttr("disabled", false)
                    let html = `<i class="fa fa-check text-primary ml-1" title="Update Outreach Status" style="font-size:18px;cursor:pointer;" ></i>`
                    $('#editbutton'+index).html(html)
                }
                else{
                    let editedStatus = $('#statusinput'+index).val()
                    if(editedStatus==""){
                        // $('#statusListItem'+index).remove()
                        dashboardApp.statusList.splice(index,1)
                        let html =`<li class="list-group-item">
                            <div class="col-md-12 input-group mb-3">
                                <input class="form-control" placeholder="Enter new status...." type="text" aria-describedby="new_status" name="new_status_input">
                                <span class="add_outreach_status_icon input-group-text" id="id_new_status" ><i class="fa fa-plus-square text-success ml-1" title="Add Outreach Status" style="font-size:18px;cursor:pointer;" ></i></span>
                            </div>
                        </li>`
                        dashboardApp.statusList.forEach((element,index)=>{
                            html+=`<li class="list-group-item" id="statusListItem${index}">
                            <div class="col-md-12 input-group mb-3">
                            <input class="form-control" value="${element}" type="text" aria-describedby="editbutton${index}" id="statusinput${index}" disabled>
                            <span class="edit_outreach_status_icon input-group-text" id="editbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Status" style="font-size:18px;cursor:pointer;" ></i></span>
                             </div>
                            </li>`
                        })
                        $('#collapseStatus').html(html)
                    }
                    else if(dashboardApp.statusList.indexOf(editedStatus) > -1 && dashboardApp.statusList.indexOf(editedStatus)!=index){
                        $('#outreach-error-alert').removeClass('d-none')
                        $('#outreach-error-alert').html('Status name already exists!')
                        setTimeout(function () {
                            $('#outreach-error-alert').addClass('d-none')
                        }, 3000)
                    }
                    else{
                        $('#statusinput'+index).prop("disabled", true)
                        let html = `<i class="fa fa-edit text-primary ml-1" title="Edit Outreach Status" style="font-size:18px;cursor:pointer;" ></i>`
                        $('#editbutton'+index).html(html)
                        dashboardApp.statusList[index] = editedStatus
                    }
                }
            })
            $('body').on('click', '.edit_outreach_age_filter_icon',function () {
                let index= $(this).data('id')
                let attr1 = $('#agefrominput'+index).attr('disabled')
                let attr2 = $('#agetoinput'+index).attr('disabled')
                if(typeof attr1 !== 'undefined' && attr1 !== false && typeof attr2 !== 'undefined' && attr2 !== false){
                    $('#agefrominput'+index).removeAttr("disabled", false)
                    $('#agetoinput'+index).removeAttr("disabled", false)
                    let html = `<i class="fa fa-check text-primary ml-1" title="Update Outreach Age Filter" style="font-size:18px;cursor:pointer;" ></i>`
                    $('#ageeditbutton'+index).html(html)
                }
                else{
                    let editedAgeFromFilter = parseInt($('#agefrominput'+index).val())
                    let editedAgeToFilter = parseInt($('#agetoinput'+index).val())
                    if(isNaN(editedAgeFromFilter) && isNaN(editedAgeToFilter)){
                        // $('#ageFilterListItem'+index).remove()
                        dashboardApp.ageFromList.splice(index,1)
                        dashboardApp.ageToList.splice(index,1)
                        let html=`<li class="list-group-item" style="border:0;">
                                <label class="my-1">Age</label>
                                <div class="row justify-content-start input-group">
                                    <div class="col-md-4">
                                        <input class="form-control" type="text" value="" name="filter_age_from" placeholder="From">
                                    </div>
                                    <div class="col-md-4">
                                        <input class="form-control" type="text" value="" name="filter_age_to" placeholder="To">
                                    </div>
                                    <span class="input-group-text" id="id_new_age" ><i class="fa fa-plus-square text-success ml-1" title="Add new age range" style="font-size:18px;cursor:pointer;" ></i></span>
                                </div>
                            </li>`
                        dashboardApp.ageFromList.forEach((element,index)=>{
                            html+=`<li class="list-group-item col-md-6" style="border:0;" id="ageFilterListItem${index}">
                            <div class="input-group mb-3">
                            <input class=" col-md-4 form-control" value="${element}" type="text" aria-describedby="ageeditbutton${index}" id="agefrominput${index}" disabled>
                            <input class="col-md-4 form-control" value="${dashboardApp.ageToList[index]}" type="text" aria-describedby="ageeditbutton${index}" id="agetoinput${index}" disabled>
                            <span class="edit_outreach_age_filter_icon input-group-text" id="ageeditbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Age Filter" style="font-size:18px;cursor:pointer;" ></i></span>
                             </div>
                            </li>`
                        });
                        $('#collapseAgeFilter').html(html)
                    }
                    else if(isNaN(editedAgeFromFilter) || isNaN(editedAgeToFilter)){
                        $('#outreach-error-alert').removeClass('d-none')
                        $('#outreach-error-alert').html('Invalid input data!')
                        setTimeout(function () {
                            $('#outreach-error-alert').addClass('d-none')
                        }, 3000)
                    }
                    else if(editedAgeFromFilter > editedAgeToFilter){
                        $('#outreach-error-alert').removeClass('d-none')
                        $('#outreach-error-alert').html('From cannot be higher than to!')
                        setTimeout(function () {
                            $('#outreach-error-alert').addClass('d-none')
                        }, 3000)
                    }
                    else{
                        $('#agefrominput'+index).prop("disabled", true)
                        $('#agetoinput'+index).prop("disabled", true)
                        let html = `<i class="fa fa-edit text-primary ml-1" title="Edit Age Filter" style="font-size:18px;cursor:pointer;" ></i>`
                        $('#ageeditbutton'+index).html(html)
                        dashboardApp.ageFromList[index] = editedAgeFromFilter
                        dashboardApp.ageToList[index] = editedAgeToFilter
                    }
                }
            })
            $('body').on('click', '.edit_outreach_zip_filter_icon',function () {
                let index= $(this).data('id')
                let attr = $('#zipfilterinput'+index).attr('disabled')
                if(typeof attr !== 'undefined' && attr !== false){
                    $('#zipfilterinput'+index).removeAttr("disabled", false)
                    let html = `<i class="fa fa-check text-primary ml-1" title="Update Outreach Zip Filter" style="font-size:18px;cursor:pointer;" ></i>`
                    $('#zipfiltereditbutton'+index).html(html)
                }
                else{
                    let editedZipFilter = $('#zipfilterinput'+index).val()
                    if(editedZipFilter==""){
                        // $('#zipFilterListItem'+index).remove()
                        dashboardApp.zipFilterList.splice(index,1)
                        let html =`<li class="list-group-item" style="border:0;">
                                <label class="my-1">Zip Code</label>
                            <div class="row justify-content-start">
                                <div class="col-md-6">
                                    <input class="form-control" type="text" name="new_filter_zipcode">
                                </div>
                                
                                <span class="input-group-text" id="id_new_zipcode" ><i class="fa fa-plus-square text-success ml-1" title="Add new zip filter" style="font-size:18px;cursor:pointer;" ></i></span>
                            </div>
                        </li>`
                        dashboardApp.zipFilterList.forEach((element,index)=>{
                            html+=`<li class="list-group-item col-md-6" style="border:0;" id="zipFilterListItem${index}">
                            <div class="input-group mb-3">
                            <input class="form-control" value="${element}" type="text" aria-describedby="zipeditbutton${index}" id="zipfilterinput${index}" disabled>
                            <span class="edit_outreach_zip_filter_icon input-group-text" id="zipfiltereditbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Zip Filter" style="font-size:18px;cursor:pointer;" ></i></span>
                             </div>
                            </li>`
                        })
                        $('#collapseZipFilter').html(html)
                    }
                    else if(dashboardApp.zipFilterList.indexOf(editedZipFilter) > -1 && dashboardApp.zipFilterList.indexOf(editedZipFilter)!=index){
                        $('#outreach-error-alert').removeClass('d-none')
                        $('#outreach-error-alert').html('Zip filter already added!')
                        setTimeout(function () {
                            $('#outreach-error-alert').addClass('d-none')
                        }, 3000)
                    }
                    else{
                        $('#zipfilterinput'+index).prop("disabled", true)
                        let html = `<i class="fa fa-edit text-primary ml-1" title="Edit Zip Filter" style="font-size:18px;cursor:pointer;" ></i>`
                        $('#zipfiltereditbutton'+index).html(html)
                        dashboardApp.zipFilterList[index] = editedZipFilter
                    }
                }
            })
            $('body').on('click', '#id_create_outreach',function () {
                let outreachName = $('input[name=outreach-name]').val()
                let error = []
                let weekDays = []
                let error_alert =  $('#outreach-error-alert')
                let genders = []
                if($('input[name="maleGender"]').prop('checked')==true){
                    genders.push('male')
                }
                if($('input[name="femaleGender"]').prop('checked')==true){
                    genders.push('female')
                }
                if($('input[name="unknownGender"]').prop('checked')==true){
                    genders.push('unknown')
                }
                if($('input[name="otherGender"]').prop('checked')==true){
                    genders.push('other')
                }
                if($('input[name="monday"]').prop('checked')==true){
                    weekDays.push(1)
                }if($('input[name="tuesday"]').prop('checked')==true){
                    weekDays.push(2)
                }if($('input[name="wednesday"]').prop('checked')==true){
                    weekDays.push(3)
                }if($('input[name="thursday"]').prop('checked')==true){
                    weekDays.push(4)
                }if($('input[name="friday"]').prop('checked')==true){
                    weekDays.push(5)
                }if($('input[name="saturday"]').prop('checked')==true){
                    weekDays.push(6)
                }if($('input[name="sunday"]').prop('checked')==true){
                    weekDays.push(0)
                }
                if(outreachName==""){
                    error_alert.removeClass('d-none')
                    error_alert.html(' outreach Name cannot be empty!')
                    error.push(1)
                }
                if($('#id_outreach_member_filter').val()!='all'){
                    if(genders.length == 0){
                        error_alert.html('Gender filter cannot be empty')
                        error.push(1)
                    }
                }
                if($('input[name="scheduler_status"]:checked').val()=='enabled'){
                    if($('#id_start_date').val()=="" ){
                        error_alert.removeClass('d-none')
                        error_alert.html('Start date cannot be empty!')
                        error.push(1)
                    }
                    if(weekDays.length == 0){
                        error_alert.removeClass('d-none')
                        error_alert.html('Select at least a day!')
                        error.push(1)
                    }
                    for(let i=1;i<= dashboardApp.time_slot;i++){
                        if($(`#id_hr${i}`).val()==""){
                            error_alert.removeClass('d-none')
                            error_alert.html('Hour cannot be empty!')
                            error.push(1)
                        }
                        if($(`#id_mm${i}`).val()==""){
                            error_alert.removeClass('d-none')
                            error_alert.html('Minute cannot be empty!')
                            error.push(1)
                        }
                        if(parseInt($(`#id_mm${i}`).val(),10)<0 | parseInt($(`#id_mm${i}`).val(),10)>59){
                            error_alert.removeClass('d-none')
                            error_alert.html('Invalid minute!')
                            error.push(1)
                        }
                        if(parseInt($(`#id_hr${i}`).val(),10)<0 | parseInt($(`#id_hr${i}`).val(),10)>23){
                            error_alert.removeClass('d-none')
                            error_alert.html('Invalid hour!')
                            error.push(1)
                        }
                        if($('#id_notification_text').val()==''){
                            error_alert.removeClass('d-none')
                            error_alert.html('Notification cannot be empty!')
                            error.push(1)
                        }
                    }
                }
                if(error.length==0){
                    let fieldsList = []
                    $('input[name="selected-fields"]:checked').each(function() {
                        fieldsList.push(this.value);
                    });
                    let statusList = dashboardApp.statusList
                    let ageFromFilter = dashboardApp.ageFromList
                    let ageToFilter = dashboardApp.ageToList
                    let zipFilter = dashboardApp.zipFilterList
                    let is_filter_added
                    if($('#id_outreach_member_filter').val()=='all'){
                        is_filter_added = false
                    }
                    else{
                        is_filter_added = true
                    }
                    let schedule_enabled = false
                    if($('input[name="scheduler_status"]:checked').val()=='enabled'){
                        schedule_enabled = true
                    }
                    let start_date = $('#id_start_date').val()
                    let schedule_hours = []
                    let schedule_minutes = []
                    for(let i=1;i<= dashboardApp.time_slot;i++){
                        schedule_hours.push($(`#id_hr${i}`).val())
                        schedule_minutes.push($(`#id_mm${i}`).val())
                    }
                    let end_date = $('#id_end_date').val()
                    let schedule_type = $('#id_schedule_type').val()
                    let notification_text = $('#id_notification_text').val()
                    $('#id_create_outreach .fa-spinner').removeClass('d-none')
                    $('#id_create_outreach').prop('disabled',true)
                    dashboardApp.outreachCreation(outreachName,fieldsList,statusList,is_filter_added,ageFromFilter,ageToFilter,zipFilter, genders, schedule_enabled, start_date, weekDays, end_date, schedule_type,schedule_hours,schedule_minutes,notification_text)
                }
                else{
                    setTimeout(function () {
                        error_alert.addClass('d-none')
                    }, 3000)
                }
                
            })
            $('body').on('click', '.edit_outreach_publish_icon',function () {
                let index= $(this).data('id')
                const i = dashboardApp.outreachList.findIndex(object => {
                    return object.id === index;
                  })
                let outreach = dashboardApp.outreachList[i]
                let html= `<select class="form-control" id="id_publish_status_change" required>
                    <option value="">Change Status</options>
                    <option value="publish">Publish Outreach</options>
                    <option value="pause">Pause Outreach</options>
                    `
                if(outreach.is_published==true){
                    dashboardApp.outreach_publish_status = 'publish'
                }
                else{
                    dashboardApp.outreach_publish_status = 'pause'
                }
                $('#outreach-model .modal-body').html(html)
                $('#id_publish_status_change').val(dashboardApp.outreach_publish_status)
                html=`<button type="button" class="btn btn-success" id="id_update_outreach_publish" data-id=${outreach.id} disabled>Update</button>
                <button type="button" class="btn btn-dark" id="id_back_to_outreach_list">Back</button>`
                $('#outreach-model .modal-footer').html(html)
                html = `<h5>${outreach.name.toUpperCase()} Current Status: ${outreach.is_published ? '<span class="text-success" style="font-size:1.25rem;">Published</span>' :'<span class="badge text-warning" style="font-size:1.25rem;">Paused</span></h5>'}`
                $('#outreach-model .modal-title').html(html)
            })
            $('body').on('change', '#id_publish_status_change',function () {
                if(dashboardApp.outreach_publish_status == $(this).val() || "" == $(this).val()){
                    $('#id_update_outreach_publish').prop('disabled', true);
                    dashboardApp.outreach_publish_status_selected = ''

                }
                else{
                    $('#id_update_outreach_publish').prop('disabled', false);
                    dashboardApp.outreach_publish_status_selected = $(this).val()

                }
            })
            $('body').on('click', '#id_update_outreach_publish',function (){
                let index= $(this).data('id')
                let published = Boolean()
                if(dashboardApp.outreach_publish_status_selected == 'publish'){
                    published = true
                }
                else{
                    published = false
                }
                $.ajax({
                    type: "POST",
                    url: "/api/edit/outreach/publish/",
                    data: {
                        index,
                        published,
                        csrfmiddlewaretoken: dashboardApp.csrfmiddlewaretoken,
                        
                    },
                    success: (res) => {
                        var error = $('#outreach-error-alert')
                        error.addClass('alert-danger').removeClass('alert-success')
                        error.removeClass('d-none')
                        $('.outreach-spin').addClass('d-none')
                        if(res.status==0){
                            error.html('Something went wrong! Try again')
                        }
                        if(res.status==1){
                            error.removeClass('alert-danger').addClass('alert-success')
                            error.html('Updated successfully')
                            const i = dashboardApp.outreachList.findIndex(object => {
                                return object.id === index;
                              })
                            dashboardApp.outreachList[i].is_published = published
                            let html =`${published ? '<span class="badge badge-pill badge-success">Published</span>' :'<span class="badge badge-pill badge-warning">Paused</span>'}`
                            $('#publish'+index).html(html)
                        }
                        setTimeout(function () {
                            error.addClass('d-none')
                            error.addClass('alert-danger').removeClass('alert-success')
                        }, 3000)
                    },
                    error: (err) => {
                    }
                })
            })
            $('body').on('click', '.edit_outreach_icon',function () {
                let index= $(this).data('id')
                let html=''
                dashboardApp.statusList=["Patient name","Email","Phone number"]
                const i = dashboardApp.outreachList.findIndex(object => {
                    return object.id === index;
                  })
                let outreach = dashboardApp.outreachList[i]
                dashboardApp.ageFromList = outreach.age_from
                dashboardApp.ageToList = outreach.age_to
                dashboardApp.zipFilterList = outreach.zipcode
                let is_filter = outreach.is_filter_added
                html =`
                <div class="col-md-12 pt-1">
                    <label class="my-1">Outreach name</label> 
                    <input class="form-control" name="outreach-name" value="${outreach.name}" type="text">
                </div>
                <div class="col-md-12 pt-1">
                    <div class="card" id="fitler_fields">
                        <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseFieldsFilter" aria-expanded="false" aria-controls="collapseFieldsFilter" >  
                            <label class=" " >Outreach Filters</label> 
                        </a>
                        <div class="collapse form-check form-switch pb-2" id="collapseFieldsFilter" aria-labelledby="headingFilter" data-parent="#fitler_fields">
                            <div class="col-md-6">
                                <label class="my-1">Select Member Type</label> 
                                <select class="form-control" name="outreach_member_filter" id="id_outreach_member_filter">
                                    <option value="all">All Members</option>
                                    <option value="filter">Filter Members</option>
                                </select>
                            </div>
                            <div class="col-md-12 outreach_member_filter d-none">
                            <ul class="col-md-12 list-group list-group-flush" style="border:1px solid rgba(0,0,0,.125);" id="collapseAgeFilter" >
                            <li class="list-group-item" style="border:0;">
                                <label class="my-1">Age</label>
                                <div class="row justify-content-start input-group">
                                    <div class="col-md-4">
                                        <input class="form-control" type="text" value="" name="filter_age_from" placeholder="From">
                                    </div>
                                    <div class="col-md-4">
                                        <input class="form-control" type="text" value="" name="filter_age_to" placeholder="To">
                                    </div>
                                    <span class="input-group-text" id="id_new_age" ><i class="fa fa-plus-square text-success ml-1" title="Add new age range" style="font-size:18px;cursor:pointer;" ></i></span>
                                </div>
                            </li>`
                    dashboardApp.ageFromList.forEach((element,index)=>{
                    html+=`<li class="list-group-item col-md-6" style="border:0;" id="ageFilterListItem${index}">
                    <div class="input-group mb-3">
                    <input class=" col-md-4 form-control" value="${element}" type="text" aria-describedby="ageeditbutton${index}" id="agefrominput${index}" disabled>
                    <input class="col-md-4 form-control" value="${dashboardApp.ageToList[index]}" type="text" aria-describedby="ageeditbutton${index}" id="agetoinput${index}" disabled>
                    <span class="edit_outreach_age_filter_icon input-group-text" id="ageeditbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Age Filter" style="font-size:18px;cursor:pointer;" ></i></span>
                     </div>
                    </li>`
                })
                html +=`
                        </ul>
                        <ul class="col-md-12 list-group list-group-flush" style="border:1px solid rgba(0,0,0,.125);" id="collapseGenderFilter" >
                                    <li class="list-group-item" style="border:0;">
                                        <label class="my-1">Gender</label>
                                        <div class="row justify-content-start ml-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" name="maleGender" id="checkMale" >
                                            <label class="form-check-label" for="checkMale">
                                            Male
                                            </label>
                                        </div>
                                        <div class="form-check ml-2">
                                            <input class="form-check-input" type="checkbox" value="" name="femaleGender" id="checkFemale" >
                                            <label class="form-check-label" for="checkFemale">
                                            Female
                                            </label>
                                        </div>
                                        <div class="form-check ml-2" >
                                            <input class="form-check-input" type="checkbox" value="" name="unknownGender" id="checkUnknown" >
                                            <label class="form-check-label" for="checkUnknown">
                                            Unknown
                                            </label>
                                        </div>
                                        <div class="form-check ml-2">
                                            <input class="form-check-input" type="checkbox" value="" name="otherGender" id="checkOther" >
                                            <label class="form-check-label" for="checkOther">
                                            Other
                                            </label>
                                        </div>
                                        </div>
                                    </li>
                                </ul>
                        <ul class="col-md-12 list-group list-group-flush" style="border:1px solid rgba(0,0,0,.125);" id="collapseZipFilter" >
                            <li class="list-group-item" style="border:0;">
                                <label class="my-1">Zip Code</label>
                            <div class="row justify-content-start">
                                <div class="col-md-6">
                                    <input class="form-control" type="text" name="new_filter_zipcode">
                                </div>
                                
                                <span class="input-group-text" id="id_new_zipcode" ><i class="fa fa-plus-square text-success ml-1" title="Add new zip filter" style="font-size:18px;cursor:pointer;" ></i></span>
                            </div>
                        </li>`
                        dashboardApp.zipFilterList.forEach((element,index)=>{
                            html+=`<li class="list-group-item col-md-6" style="border:0;" id="zipFilterListItem${index}">
                            <div class="input-group mb-3">
                            <input class="form-control" value="${element}" type="text" aria-describedby="zipeditbutton${index}" id="zipfilterinput${index}" disabled>
                            <span class="edit_outreach_zip_filter_icon input-group-text" id="zipfiltereditbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Zip Filter" style="font-size:18px;cursor:pointer;" ></i></span>
                             </div>
                            </li>`
                        })
                            html +=`
                            </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-12 pt-2">
                <div class="card" id="fields">
                    <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseFields" aria-expanded="false" aria-controls="collapseFields" >  
                        <label class=" " >Select Fields</label> 
                    </a>
                <div class="form-check form-switch">
                <ul class="collapse list-group list-group-flush" id="collapseFields" aria-labelledby="headingOne" data-parent="#fields">`
                dashboardApp.definedFields.forEach((element,index)=>{
                    html+=`<li class="list-group-item">`
                    if (outreach.columns.indexOf(element) > -1) {
                        html +=`<input class="form-check-input" name="selected-fields" type="checkbox" value="${element}" checked>`
                    } 
                    else{
                        html += `<input class="form-check-input" name="selected-fields" type="checkbox" value="${element}" >`

                    }
                    html+=`<label class="form-check-label" name='selectfields' for="flexSwitchCheckChecked">${element}</label>
                           </li>`
                })
                html +=`</ul></div></div></div>
                <div class="col-md-12 pt-2">
                <div class="card" id="status">
                    <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseStatus" aria-expanded="false" aria-controls="collapseStatus" >  
                        <label class=" " >Outreach Status</label> 
                    </a>
                    <div class="form-check form-switch">
                <ul class="collapse list-group list-group-flush" id="collapseStatus" aria-labelledby="headingOne" data-parent="#status">
                <li class="list-group-item">
                <div class="col-md-12 input-group mb-3">
                    <input class="form-control" placeholder="Enter new status...." type="text" aria-describedby="new_status" name="new_status_input">
                    <span class="add_outreach_status_icon input-group-text" id="id_new_status" ><i class="fa fa-plus-square text-success ml-1" title="Add Outreach Status" style="font-size:18px;cursor:pointer;" ></i></span>
                 </div>
            </li>`
                    dashboardApp.statusList = outreach.outreach_status_values
                    outreach.outreach_status_values.forEach((element,index)=>{
                    html+=`<li class="list-group-item" id="statusListItem${index}">
                    <div class="col-md-12 input-group mb-3">
                    <input class="form-control" value="${element}" type="text" aria-describedby="editbutton${index}" id="statusinput${index}" disabled>
                    <span class="edit_outreach_status_icon input-group-text" id="editbutton${index}" data-id="${index}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Status" style="font-size:18px;cursor:pointer;" ></i></span>
                     </div>
                    </li>`
                })
                html +=`
                </ul></div></div></div>`

                html+= `<div class="col-md-12 pt-2">
                <div class="card" id="schedule">
                    <a class="card-header" style="cursor: pointer;" data-toggle="collapse" data-target="#collapseSchedule" aria-expanded="false" aria-controls="collapseSchedule" >  
                        <label class=" " >Notification Schedule</label> 
                    </a>
                    <div class="form-check form-switch">
                <ul class="collapse list-group list-group-flush" id="collapseSchedule" aria-labelledby="headingOne" data-parent="#schedule">
                <li class="list-group-item">
                <div class="col-md-12" style="padding:0">
                    <input type="radio" value="enabled" name="scheduler_status" style="width:16px;height:16px" id="enabled">
                    <label class="mx-2" style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;padding:0">Enable</label>
                    <input type="radio" value="disabled" name="scheduler_status" style="width:16px;height:16px" id="disabled">
                    <label class="mx-2" style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;padding:0">Disable</label>
                </div>
                <hr>
                <div class="col-md-12" style="padding:0">
                    <label class="mx-2" style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;padding:0">Notification Text</label>
                    <div class="col-12 form-group">
                        <textarea id="id_notification_text" name="notification_text" rows="5" cols="80" style="width:100%;"></textarea>
                    <div>
                </div>
                <hr>
                <div class="col-md-12 d-flex justify-content-start input-group mb-3" style="padding:0">
                    <div class="col-md-4" style="padding:0">
                      <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Type</label>
                      <select class="form-control" name="schedule_type" id="id_schedule_type">
                        <option value="once">Once</option>    
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                          <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Start Date</label>
                          <input class="form-control datepicker" type="text" name="start_date" id="id_start_date" placeholder="MM/DD/YYYY">
                        </div>
                    </div>
                    <div class="col-md-4 recurring d-none">
                        <div class="form-group">
                          <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">End Date</label>
                          <input class="form-control datepicker customhidden" type="text" name="end_date" id="id_end_date" placeholder="MM/DD/YYYY">
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row mb-2" style="padding:0;">
                    <div class="col-md-12">
                      <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Execute on these days<label>
                    </div>
                    <div class="col-md-12">
                        <div class="weekDays-selector">
                            <input type="checkbox" id="weekday-mon" name="monday" value="monday" class="weekday" />
                            <label for="weekday-mon">Mon</label>
                            <input type="checkbox" id="weekday-tue" name="tuesday" value="tuesday" class="weekday" />
                            <label for="weekday-tue">Tue</label>
                            <input type="checkbox" id="weekday-wed" name="wednesday" value="wednesday" class="weekday" />
                            <label for="weekday-wed">Wed</label>
                            <input type="checkbox" id="weekday-thu" name="thursday" value="thursday" class="weekday" />
                            <label for="weekday-thu">Thu</label>
                            <input type="checkbox" id="weekday-fri" name="friday" value="friday" class="weekday" />
                            <label for="weekday-fri">Fri</label>
                            <input type="checkbox" id="weekday-sat" name="saturday" value="saturday" class="weekday" />
                            <label for="weekday-sat">Sat</label>
                            <input type="checkbox" id="weekday-sun" name="sunday" value="sunday" class="weekday" />
                            <label for="weekday-sun">Sun</label>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="d-flex justify-content-around" style="padding:0">
                    <div class="col-md-6">
                      <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;font-size:16px;font-weight:600;">Slots<label>
                    </div>
                    <div class="col-md-6 text-right">
                      <button type="button" class="btn btn-info" id="id_add_slot">Add Slot</button>
                    </div>
                </div>
                <div class="col-md-12 timeslot" style="padding:0">
                `
                dashboardApp.time_slot = outreach.scheduled_hours.length
                outreach.scheduled_hours.forEach((element,index)=>{
                    html +=`
                    <div class="d-flex justify-content-start slot_div_id_${index+1}">
                  <div class="col-md-4 mb-2">
                    <input class="form-control timeinput" id="id_hr${index+1}" value="${element}" type="text" name="time${index+1}" placeholder="HH" > 
                  </div>
                  <div class="col-md-2 mb-2">
                     <input class="form-control timeinput" id="id_mm${index+1}" type="text" value="${outreach.scheduled_minutes[index]}" name="time${index+1}" placeholder="MM" > 
                  </div>`
                  if(index !==0){
                    html+= `<div class="col-md-2 mb-2">
                        <div class="col-md-2 pt-2">
                            <span class="scheduler_slot_delete" title="Delete Slot" data-time_slot="${index+1}"><i class="fa fa-trash text-danger ml-1" style="font-size:18px;cursor:pointer;" ></i></span>
                        </div>
                    </div>`
                  }  
            html +=`
              </div>
                    `
                })
                html +=`</div>
            </li>`

                $('#outreach-model .modal-body').html(html)
                if(is_filter){
                    $('#id_outreach_member_filter').val('filter');
                    $('.outreach_member_filter').removeClass('d-none')
                }
                else{
                    $('#id_outreach_member_filter').val('all');
                    $('.outreach_member_filter').addClass('d-none')
                }
                html=`<button type="button" class="btn btn-success" id="id_update_outreach" data-id=${outreach.id}><i class="fa fa-spinner fa-spin d-none"></i>Update</button>
                <button type="button" class="btn btn-danger" id="id_delete_outreach" data-id=${outreach.id}>Delete</button>
                <button type="button" class="btn btn-dark" id="id_back_to_outreach_list">Back</button>`
                $('#outreach-model .modal-footer').html(html)
                $('#outreach-model .modal-title').html("Edit Outreach Portal")
                outreach.gender_filters.forEach((element,index)=>{
                    if(element== 'male'){
                        $('input[name="maleGender"]').prop('checked',true)
                    }
                    if(element== 'female'){
                        $('input[name="femaleGender"]').prop('checked',true)
                    }
                    if(element== 'unknown'){
                        $('input[name="unknownGender"]').prop('checked',true)
                    }
                    if(element== 'other'){
                        $('input[name="otherGender"]').prop('checked',true)
                    }
                })
                outreach.weekdays.forEach((element,index)=>{
                    if(parseInt(element)== 1){
                        $('input[name="monday"]').prop('checked',true)
                    }if(parseInt(element)== 2){
                        $('input[name="tuesday"]').prop('checked',true)
                    }if(parseInt(element)== 3){
                        $('input[name="wednesday"]').prop('checked',true)
                    }if(parseInt(element)== 4){
                        $('input[name="thursday"]').prop('checked',true)
                    }if(parseInt(element)== 5){
                        $('input[name="friday"]').prop('checked',true)
                    }if(parseInt(element)== 6){
                        $('input[name="saturday"]').prop('checked',true)
                    }if(parseInt(element)== 0){
                        $('input[name="sunday"]').prop('checked',true)
                    }
                })
                if(outreach.notification_enabled == true){
                    $('#enabled').prop('checked',true)
                }
                else{
                    $('#disabled').prop('checked',true)
                }
                if(outreach.schedule_type=="recurring"){
                    $('#id_schedule_type').val("recurring")
                    $('.recurring').removeClass('d-none')
                }
                else{
                $('#id_schedule_type').val("once")
                }
                $("#id_notification_text").val(outreach.notification_text)
                var sDate = new Date(outreach.start_date)
                var d = sDate.getDate();
                var m =  sDate.getMonth();
                m += 1;  // JavaScript months are 0-11
                var y = sDate.getFullYear();
                $('#id_start_date').val(m + "/" + d + "/" + y)
                var eDate = new Date(outreach.end_date)
                var d = eDate.getDate();
                var m =  eDate.getMonth();
                m += 1;  // JavaScript months are 0-11
                var y = eDate.getFullYear();
                $('#id_end_date').val(m + "/" + d + "/" + y)
            })

            $('body').on('click', '#id_update_outreach',function () {
                let outreachName = $('input[name=outreach-name]').val()
                let index= $(this).data('id')
                let weekDays = []
                let genders = []
                if($('input[name="maleGender"]').prop('checked')==true){
                    genders.push('male')
                }
                if($('input[name="femaleGender"]').prop('checked')==true){
                    genders.push('female')
                }
                if($('input[name="unknownGender"]').prop('checked')==true){
                    genders.push('unknown')
                }
                if($('input[name="otherGender"]').prop('checked')==true){
                    genders.push('other')
                }
                if($('input[name="monday"]').prop('checked')==true){
                    weekDays.push(1)
                }if($('input[name="tuesday"]').prop('checked')==true){
                    weekDays.push(2)
                }if($('input[name="wednesday"]').prop('checked')==true){
                    weekDays.push(3)
                }if($('input[name="thursday"]').prop('checked')==true){
                    weekDays.push(4)
                }if($('input[name="friday"]').prop('checked')==true){
                    weekDays.push(5)
                }if($('input[name="saturday"]').prop('checked')==true){
                    weekDays.push(6)
                }if($('input[name="sunday"]').prop('checked')==true){
                    weekDays.push(0)
                }
                if(outreachName==""){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('Name cannot be empty!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else if($('#id_outreach_member_filter').val()!='all' && genders.length==0){
                    $('#outreach-error-alert').removeClass('d-none')
                    $('#outreach-error-alert').html('Gender filter cannot be empty!')
                    setTimeout(function () {
                        $('#outreach-error-alert').addClass('d-none')
                    }, 3000)
                }
                else{
                    let error = []
                    if($('input[name="scheduler_status"]:checked').val()=='enabled'){
                        if($('#id_start_date').val()=="" ){
                            $('#outreach-error-alert').removeClass('d-none')
                            $('#outreach-error-alert').html('Start date cannot be empty!')
                            setTimeout(function () {
                                $('#outreach-error-alert').addClass('d-none')
                            }, 3000)
                            error.push(1)
                        }
                        if(weekDays.length == 0){
                            $('#outreach-error-alert').removeClass('d-none')
                            $('#outreach-error-alert').html('Select at least a day!')
                            setTimeout(function () {
                                $('#outreach-error-alert').addClass('d-none')
                            }, 3000)
                            error.push(1)
                        }
                        for(let i=1;i<= dashboardApp.time_slot;i++){
                            if($(`#id_hr${i}`).val()==""){
                                $('#outreach-error-alert').removeClass('d-none')
                                $('#outreach-error-alert').html('Hour cannot be empty!')
                                setTimeout(function () {
                                    $('#outreach-error-alert').addClass('d-none')
                                }, 3000)
                            error.push(1)
                            }
                            if($(`#id_mm${i}`).val()==""){
                                $('#outreach-error-alert').removeClass('d-none')
                                $('#outreach-error-alert').html('Minute cannot be empty!')
                                setTimeout(function () {
                                    $('#outreach-error-alert').addClass('d-none')
                                }, 3000)
                            error.push(1)
                            }
                            if(parseInt($(`#id_mm${i}`).val(),10)<0 | parseInt($(`#id_mm${i}`).val(),10)>59){
                                $('#outreach-error-alert').removeClass('d-none')
                                $('#outreach-error-alert').html('Invalid minute!')
                                setTimeout(function () {
                                    $('#outreach-error-alert').addClass('d-none')
                                }, 3000)
                            error.push(1)
                            }
                            if(parseInt($(`#id_hr${i}`).val(),10)<0 | parseInt($(`#id_hr${i}`).val(),10)>24){
                                $('#outreach-error-alert').removeClass('d-none')
                                $('#outreach-error-alert').html('Invalid hour!')
                                setTimeout(function () {
                                    $('#outreach-error-alert').addClass('d-none')
                                }, 3000)
                            error.push(1)
                            }
                            if($('#id_notification_text').val()==''){
                                $('#outreach-error-alert').removeClass('d-none')
                                $('#outreach-error-alert').html('Notification cannot be empty!')
                                setTimeout(function () {
                                    $('#outreach-error-alert').addClass('d-none')
                                }, 3000)
                            error.push(1)
                            }
                        }
                    }
                    if(error.length == 0){
                        let fieldsList = []
                        let ageFromFilter = dashboardApp.ageFromList
                        let ageToFilter = dashboardApp.ageToList
                        let zipFilter = dashboardApp.zipFilterList
                        let is_filter_added
                        if($('#id_outreach_member_filter').val()=='all'){
                            is_filter_added = false
                        }
                        else{
                            is_filter_added = true
                        }
                        $('input[name="selected-fields"]:checked').each(function() {
                            fieldsList.push(this.value);
                        });
                        let statusList = dashboardApp.statusList
                        let schedule_enabled = false
                        if($('input[name="scheduler_status"]:checked').val()=='enabled'){
                            schedule_enabled = true
                        }
                        let start_date = $('#id_start_date').val()
                        let schedule_hours = []
                        let schedule_minutes = []
                        for(let i=1;i<= dashboardApp.time_slot;i++){
                            schedule_hours.push($(`#id_hr${i}`).val())
                            schedule_minutes.push($(`#id_mm${i}`).val())
                        }
                        let end_date = $('#id_end_date').val()
                        let schedule_type = $('#id_schedule_type').val()
                        let notification_text = $('#id_notification_text').val()
                        $('#id_update_outreach .fa-spinner').removeClass('d-none')
                        $('#id_update_outreach').prop('disabled',true)

                        $.ajax({
                            type: "POST",
                            url: "/api/edit/outreach/",
                            data: {
                                'id':index,
                                'outreachName':outreachName,
                                'fieldsList[]':fieldsList,
                                'statusList[]':statusList,
                                'ageFromList[]':ageFromFilter,
                                'ageToList[]':ageToFilter,
                                'zipList[]':zipFilter,
                                'genderList[]':genders,
                                'is_filter_added':is_filter_added,
                                'schedule_enabled':schedule_enabled,
                                'start_date':start_date,
                                'end_date':end_date,
                                'schedule_type':schedule_type,
                                'weekDays[]':weekDays,
                                'schedule_hours[]':schedule_hours,
                                'schedule_minutes[]':schedule_minutes,
                                'notification_text':notification_text,

                                csrfmiddlewaretoken: dashboardApp.csrfmiddlewaretoken,
                                
                            },
                            success: (res) => {
                                var error = $('#outreach-error-alert')
                                error.addClass('alert-danger').removeClass('alert-success')
                                error.removeClass('d-none')
                                $('.outreach-spin').addClass('d-none')
                                $('#id_update_outreach .fa-spinner').addClass('d-none')
                                $('#id_update_outreach').prop('disabled',false)
                                if(res.status==2){
                                    error.html('Outreach with same name already exists!')
                                }
                                if(res.status==0){
                                    error.html('Something went wrong! Try again')
                                }
                                if(res.status==1){
                                    error.removeClass('alert-danger').addClass('alert-success')
                                    error.html('Updated successfully')
                                    const i = dashboardApp.outreachList.findIndex(object => {
                                        return object.id === index;
                                    })
                                    dashboardApp.outreachList[i] = res.data[0]

                                }
                                setTimeout(function () {
                                    error.addClass('d-none')
                                    error.addClass('alert-danger').removeClass('alert-success')
                                }, 3000)
                            },
                            error: (err) => {
                            }
                        })
                    }
                    
                }
            })
            
            $('body').on('click', '#id_delete_outreach',function () {
                let index = $(this).data('id')
                const i = dashboardApp.outreachList.findIndex(object => {
                    return object.id === index;
                  })
                
                let html = `Are you sure to delete ${dashboardApp.outreachList[i].name}?`
                $('#outreach-model .modal-body').html(html)
                html=`<button type="button" class="btn btn-success" id="id_delete_confirm_outreach" data-id=${index}><i class="fa fa-spinner fa-spin d-none"></i>Confirm</button>
                <button type="button" class="btn btn-dark" id="id_back_to_outreach_list">Back</button>`
                $('#outreach-model .modal-footer').html(html)
                $('#outreach-model .modal-title').html("Delete Outreach Portal")
            })
            $('body').on('click', '#id_delete_confirm_outreach',function () {
                let index = $(this).data('id')
                const i = dashboardApp.outreachList.findIndex(object => {
                    return object.id === index;
                  })
                $('#id_delete_confirm_outreach .fa-spinner').removeClass('d-none')
                $('#id_delete_confirm_outreach').prop('disabled',true)
                $.ajax({
                    type: "POST",
                    url: "/api/delete/outreach/",
                    data: {
                        index,
                        csrfmiddlewaretoken: dashboardApp.csrfmiddlewaretoken,
                        
                    },
                    success: (res) => {
                        var error = $('#outreach-error-alert')
                        error.addClass('alert-danger').removeClass('alert-success')
                        error.removeClass('d-none')
                        $('.outreach-spin').addClass('d-none')
                        if(res.status==0){
                            error.html('Something went wrong! Try again')
                        }
                        if(res.status==1){
                            error.removeClass('alert-danger').addClass('alert-success')
                            error.html('Deleted successfully')
                            dashboardApp.outreachList.splice(i, 1)
                            let html = `Go back to Outreach List.`
                            $('#outreach-model .modal-body').html(html)
                            html=`
                            <button type="button" class="btn btn-dark" id="id_back_to_outreach_list">Back</button>`
                            $('#outreach-model .modal-footer').html(html)
                            $('#outreach-model .modal-title').html("Outreach Portal Deleted")
                        }
                        setTimeout(function () {
                            error.addClass('d-none')
                            error.addClass('alert-danger').removeClass('alert-success')
                        }, 3000)
                    },
                    error: (err) => {
                    }
                })
            })

            $('body').on('change','#id_outreach_member_filter',function(e){
                if($(this).val()=='all'){
                    $('.outreach_member_filter').addClass('d-none')
                }
                else{
                    $('.outreach_member_filter').removeClass('d-none')
                }
            })

            $('body').on('keyup','input[name="filter_age_from"]', function () {
                if(!$.isNumeric($('input[name="filter_age_from"]').val())){
                    $('input[name="filter_age_from"]').val('')
                }
            })
            $('body').on('keyup','input[name="filter_age_to"]', function () {
                if(!$.isNumeric($('input[name="filter_age_to"]').val())){
                    $('input[name="filter_age_to"]').val('')
                }
            })

            /////////////////////////////////////////////////////////////

            $('body').on('click', 'span.favourites', function () {
                dashboardApp.favourite_app = $(this).data('id')
                if($(this).find($("svg")).attr("data-prefix")=="fas"){
                    dashboardApp.operation_type = 'Remove from favourites'
                    $(this).find($("svg")).attr('title','Add to favorites')
                    $(this).find($("svg")).attr('data-prefix','far')
                    dashboardApp.data = $.map(dashboardApp.data, function (acItem) {
                        if (acItem.id == dashboardApp.favourite_app) {
                            acItem.favourite = 0;
                        }
                        return acItem
                    }); 
                }
                else{
                    dashboardApp.operation_type = 'Add to favourites'
                    $(this).find($("svg")).attr('title','Remove from favorites')
                    $(this).find($("svg")).attr('data-prefix','fas')
                    dashboardApp.data = $.map(dashboardApp.data, function (acItem) {
                        if (acItem.id == dashboardApp.favourite_app) {
                            acItem['favourite'] = 1;
                        }
                        return acItem
                    }); 
                }
                dashboardApp.FavouriteappPost()
            })

            $( "#sortable" ).sortable({
                start: function(event, ui) {
                    ui.item.startPos = ui.item.index()
                },
                stop: function(event, ui) {
                    ui.item.stopPos = ui.item.index()
                    if(ui.item.startPos!==ui.item.stopPos){
                        const moved_app_one = dashboardApp.apps_order[ui.item.startPos]
                        dashboardApp.apps_order.splice(ui.item.startPos,1);
                        dashboardApp.apps_order.splice(ui.item.stopPos, 0, moved_app_one);
                        dashboardApp.addAppsSortingOrder()
                    }
                }
            })

            $('body').on('click', 'span.appedit', function () {
                if($(this).data('app_type') =='outreach' || $(this).data('app_type') =='vaccine'){
                    $("#id_app_name").prop('disabled', true);
                    $("#id_info_text").prop('disabled', false);
                    $("#id_app_domain").prop('disabled', false);
                    $("#id_app_type").prop('disabled', true);
                    $("#id_app_logo").prop('disabled', false);
                    $('#id_button_name_1').prop('disabled',true).val('')
                    $('#id_button_name_2').prop('disabled',true).val('')
                    $('#id_button_name_3').prop('disabled',true).val('')
                    $('#id_button_url_1').prop('disabled',true).val('')
                    $('#id_button_url_2').prop('disabled',true).val('')
                    $('#id_button_url_3').prop('disabled',true).val('')
                    dashboardApp.type_of_submit = 'outreach_update'
                    $('.app_delete').addClass('d-none')

                }
                else{
                    $("#id_app_name").prop('disabled', false);
                    $("#id_info_text").prop('disabled', false);
                    $("#id_app_domain").prop('disabled', false);
                    $("#id_app_type").prop('disabled', false);
                    $("#id_app_logo").prop('disabled', false);
                    $('#id_button_name_1').prop('disabled',false).val('')
                    $('#id_button_name_2').prop('disabled',false).val('')
                    $('#id_button_name_3').prop('disabled',false).val('')
                    $('#id_button_url_1').prop('disabled',false).val('')
                    $('#id_button_url_2').prop('disabled',false).val('')
                    $('#id_button_url_3').prop('disabled',false).val('')
                    $('.app_delete').removeClass('d-none')
                    dashboardApp.type_of_submit = 'update'
                }
                dashboardApp.app_id = $(this).data('id')
                dashboardApp.app_name = $(this).data('appname')
                $('.update_button').removeClass('d-none')
                $('.add_button').addClass('d-none')
                $('#id_app_name').val($(this).data('appname'))
                $('#id_point_of_contact').val($(this).data('point_of_contact'))
                $('#id_info_text').val($(this).data('info_text'))
                $('#id_app_domain').val($(this).data('app_domain'))
                $('#id_app_type').val($(this).data('app_type') =='vaccine' ? 'humanresources': $(this).data('app_type'))
                let app_logo = $(this).data('app_logo')
                if(app_logo){
                    $('#app_image_preview').removeClass('d-none')
                    $('#app_image_preview').attr("src",app_logo);
                }
                let is_app_hidden = $(this).data('app_hide')
                if(is_app_hidden){
                    $('#id_hide_app').prop('checked',true)
                }
                else{
                    $('#id_hide_app').prop('checked',false)
                }
                const button_data = ($(this).data('button_data')).split(',')
                let id = 1
                for(let i=0;i<button_data.length;i=i+3){
                    $('#id_button_id_'+id).val(button_data[i+0])
                    $('#id_button_url_'+id).val(button_data[i+1])
                    $('#id_button_name_'+id).val(button_data[i+2])
                    id += 1
                }


            })

            $('body').on('click', 'span.default_appedit', function () {
                $("#id_app_name").prop('disabled', true);
                $("#id_info_text").prop('disabled', true);
                $("#id_app_domain").prop('disabled', true);
                $("#id_app_type").prop('disabled', true);
                $("#id_app_logo").prop('disabled', true);
                dashboardApp.app_id = $(this).data('id')
                dashboardApp.type_of_submit = 'defualt_appedit'
                $('.app_delete').addClass('d-none')
                $('.update_button').removeClass('d-none')
                $('.add_button').addClass('d-none')
                $('#id_app_name').val($(this).data('appname'))
                $('#id_point_of_contact').val($(this).data('point_of_contact'))
                $('#id_info_text').val($(this).data('info_text'))
                $('#id_app_domain').val($(this).data('app_domain'))
                $('#id_app_type').val($(this).data('app_type'))
                let app_logo = $(this).data('app_logo')
                if(app_logo){
                    $('#app_image_preview').removeClass('d-none')
                    $('#app_image_preview').attr("src",app_logo);
                }
                let is_app_hidden = $(this).data('app_hide')
                if(is_app_hidden){
                    $('#id_hide_app').prop('checked',true)
                }
                else{
                    $('#id_hide_app').prop('checked',false)
                }
                const button_data = ($(this).data('button_data')).split(',')
                let id = 1
                
                $('#id_button_name_1').prop('disabled',true).val('')
                $('#id_button_name_2').prop('disabled',true).val('')
                $('#id_button_name_3').prop('disabled',true).val('')
                $('#id_button_url_1').prop('disabled',true).val('')
                $('#id_button_url_2').prop('disabled',true).val('')
                $('#id_button_url_3').prop('disabled',true).val('')
                for(let i=0;i<button_data.length;i=i+3){
                    $('#id_button_id_'+id).val(button_data[i+0])
                    $('#id_button_url_'+id).val(button_data[i+1])
                    $('#id_button_name_'+id).val(button_data[i+2])
                    id += 1
                }


            })

            $('#edit-model').on('hidden.bs.modal', function (e) {
                $(this)
                  .find("input,textarea,select")
                     .val('')
                     .end()
                $(this).find("input").prop("checked",false)
            })

            $('#addedituser-model').on('hidden.bs.modal', function (e) {
                $(this)
                  .find("input")
                     .val('')
                     .end()
                $(this).find("input").prop("checked",false)
            })

            $('select[name="apps_type"]').change(function() {
                $('.all-cards-content-division').removeClass('d-none')
                $('.site-admin-division').addClass('d-none')
                $('.user_list_division').addClass('d-none')
                dashboardApp.apps_type = $("#id_apps_type").val()
                dashboardApp.renderApps()
            })

            dashboardApp.getApps()
            
            let start = moment()
            let end = moment()

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment(), moment()],
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
            }, this.setDate);

        },
        validate: function(){
            var pattern = /^(https)?:\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,4}/
            var error = []
            $('#id_app_name').removeClass('error')
            $('#id_app_type').removeClass('error')
            if($('#id_app_name').val()==''){
                $('#id_app_name').addClass('error')
                return false
            }
            if($('#id_app_type').val()==''){
                $('#id_app_type').addClass('error')
                return false
            }
            for(let i=1;i<=3;i++){
                var url = $('#id_button_url_'+i).val()
                if (url!=='' && $('#id_app_type').val()!=="administration")
                    if(pattern.test(url)==false){
                        $('#id_button_url_'+i).addClass('error')
                        error.push(1)
                    }
                    else{
                        $('#id_button_url_'+i).removeClass('error')
                    }
                else{
                    $('#id_button_url_'+i).removeClass('error')
                }
            }
            if(error.length>0){
                return false
            }
            return true
        },
        validateUserModal: function () {
            const all_input_elements = $('#addedituser-model').find('input')
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('is-invalid')
            }
            const error_elements = []
            for (let i = 0; i < all_input_elements.length; i++) {
                const input_name = $(all_input_elements[i]).attr('name')
                if($(all_input_elements[i]).val()==""){
                    if(input_name!='is_staff'){
                        error_elements.push(all_input_elements[i])
                    }
                }
                if (validation.hasOwnProperty(input_name)) {
                    if (!validation[input_name].test($(all_input_elements[i]).val())) {
                        error_elements.push(all_input_elements[i])
                    }
                }
            }
            if (error_elements.length > 0) {
                this.renderError(error_elements)
                return false
            }
            return true
        },
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('is-invalid')
            })
        },
        renderApps:function (){
            $('.header_filters').addClass('d-flex')
            $('.header_filters').removeClass('d-none')
            $('.user_list_division').addClass('d-none')
            $('.site-admin-division').addClass('d-none')
            $('.app_management_division').addClass('d-none')
            $('.all-cards-content-division').removeClass('d-none')
            dashboardApp.apps_table = false
            if (dashboardApp.data.length > 0) {
                let html = ''
                let apps_order = []
                let appData = dashboardApp.data.slice()
                if (dashboardApp.apps_type !== 'all'){
                    if(dashboardApp.apps_type == 'myfavorites'){
                        appData= $.map(dashboardApp.data, function (acItem) {
                            if (parseInt(acItem.favourite) === 1) {
                                return acItem;
                            }
                        });    
                    }
                    else if(dashboardApp.apps_type == 'humanresources'){
                        appData= $.map(dashboardApp.data, function (acItem) {
                            if (acItem.app_type === dashboardApp.apps_type || acItem.app_type === 'vaccine') {
                                return acItem;
                            }
                        });
                    }
                    else{
                        appData= $.map(dashboardApp.data, function (acItem) {
                            if (acItem.app_type === dashboardApp.apps_type) {
                                return acItem;
                            }
                        });
                    }
                }
                if(dashboardApp.search_key !==''){
                    appData = appData.filter(data => data.app_name.toLowerCase().includes(dashboardApp.search_key.toLowerCase()));
                }
                appData.forEach((element, index) => {
                    let buttons = ''
                    let buttons_data = []
                    let type_dashboard_button = ''
                    let type_add_button = ''
                    let type_edit_button = ''
                    let type_other_button = ''
                    apps_order.push(element.app_name)
                    if(element.is_admin_apps_permission == true){
                        let mainButton = ''
                        let buttonType = 0
                        for(let i=0;i<element.buttons.length;i++){
                            if(element.app_type=="administration"){
                                if((element.buttons[i]['button_text'].toLowerCase()).indexOf('dashboard') != -1){
                                    if ((mainButton == '') || (buttonType < 5)){
                                        mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 5
                                    }
                                    type_dashboard_button +=`<div class="col-12 text-center">
                                                            <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-address-card" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                                }
                                else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('edit') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('manage') != -1)){
                                    if ((mainButton == '') || (buttonType < 4)){    
                                        mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 4
                                    }
                                    type_edit_button +=`<div class="col-12 text-center">
                                                            <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-edit" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                                }
                                else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('add') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('create') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('upload') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('form') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('file') != -1)){
                                    if ((mainButton == '') || (buttonType < 3)){    
                                        mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 3
                                    }
                                    type_add_button +=`<div class="col-12 text-center">
                                                            <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-plus" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                                }
                                else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('sign') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('login') != -1)){
                                    if ((mainButton == '') || (buttonType < 2)){    
                                        mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 2
                                    }
                                    type_other_button +=`<div class="col-12 text-center">
                                                            <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-desktop" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                                }
                                else{
                                    if ((mainButton == '') || (buttonType < 1)){    
                                        mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 1
                                    }
                                    type_other_button +=`<div class="col-12 text-center">
                                                        <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-tasks" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                    </div>`
                                }
                            }
                            else{

                                if((element.buttons[i]['button_text'].toLowerCase()).indexOf('dashboard') != -1){
                                    if ((mainButton == '') || (buttonType < 5)){
                                        mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 5
                                    }
                                    type_dashboard_button +=`<div class="col-12 text-center">
                                                            <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-address-card" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                            </div>`
                                }
                                else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('edit') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('manage') != -1)){
                                    if ((mainButton == '') || (buttonType < 4)){    
                                        mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 4
                                    }
                                    type_edit_button +=`<div class="col-12 text-center">
                                                            <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-edit" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                            </div>`
                                }
                                else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('add') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('create') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('upload') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('form') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('file') != -1)){
                                    if ((mainButton == '') || (buttonType < 3)){    
                                        mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 3
                                    }
                                    type_add_button +=`<div class="col-12 text-center">
                                                            <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-plus" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                            </div>`
                                }
                                else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('sign') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('login') != -1)){
                                    if ((mainButton == '') || (buttonType < 2)){    
                                        mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 2
                                    }
                                    type_other_button +=`<div class="col-12 text-center">
                                                            <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-desktop" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                            </div>`
                                }
                                else{
                                    if ((mainButton == '') || (buttonType < 1)){    
                                        mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                        buttonType = 1
                                    }
                                    type_other_button +=`<div class="col-12 text-center">
                                                        <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-tasks" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                                }
                                
                            }
                            buttons_data.push(element.buttons[i]['id'],element.buttons[i]['button_href'],element.buttons[i]['button_text'])
                        }
                        buttons = type_add_button + type_edit_button + type_other_button + type_dashboard_button
                        let edit_option = `<div class="col-1">
                                            </div>`
                        if(element.is_app_admin && element.subscription ==-1){
                            edit_option = `<div class="col-1">
                                <span class="appedit" data-id="${element.id}" data-appname="${element.app_name}" data-subsription="${element.subscription}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-app_logo=${element.app_logo}><i style="cursor:pointer;width:14px;height;14px;" data-toggle="modal" data-target="#edit-model"  title="Edit App" class="fas fa-edit text-primary"></i></span>
                                </div>`
                        }
                        else if(element.is_app_admin && element.subscription >= 0){
                            edit_option = `<div class="col-1">
                                <span class="default_appedit" data-id="${element.id}" data-appname="${element.app_name}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-app_logo=${element.app_logo}><i style="cursor:pointer;width:14px;height;14px;" data-toggle="modal" data-target="#edit-model"  title="Edit App" class="fas fa-edit text-primary"></i></span>
                            </div>`
                        }
                        let fav_icon = `<span class="favourites" data-id="${element.id}"><i style="cursor:pointer;width:14px;height;14px;" title="Add to favorites" class="far fa-star text-primary"></i></span>`
                        if(parseInt(element.favourite) == 1){
                            fav_icon = `<span class="favourites" data-id="${element.id}"><i style="cursor:pointer;width:14px;height;14px;" title="Remove from favorites" class="fas fa-star text-primary"></i></span>`
                        }
                        let top_icons = `<div class="col">
                                            ${edit_option}
                                        </div>
                                        <div class="col-1">
                                            ${fav_icon}
                                        </div>
                                        <div class="col-1 hover-div"style="text-align:left;">
                                            <i style="cursor:pointer;width:12px;height;12px;" class="fa fa-info-circle text-primary" aria-hidden="true" title="${element.info_text}"></i>
                                        </div>`
                        let count = ''
                        let new_notification = ''
                        if(element.app_name=="Grievance" || element.app_name=="Complaint" || element.app_name=="Standards of behavior" || element.app_name=="Secure upload"){
                            count = `<div class="row d-flex justify-content-start">
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.pending}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Pending</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.resolved}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Resolved</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        if(element.newly_submitted!=''){
                            new_notification = `
                            <div class="pl-2 p-0">
                                <span style="font-size:12px;color:#737373"><i class="fa fa-exclamation-triangle" style="color:#e22729" aria-hidden="true"></i> New report submitted</span>
                            </div>`
                        }
                        
                        }
                        else if(element.app_name=='Staff planning dental' || element.app_name=='Staff planning medical' || element.app_name=='Staff planning optometry'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-8 p-0">
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        if(element.last_datetime!=''){
                            new_notification = `
                            <div class="pl-2 p-0">
                                <span style="font-size:12px;color:#737373">Last Updated ${element.last_datetime}</span>
                            </div>`
                        }
                        }
                        else if(element.app_name.indexOf('outreach') != -1 && element.app_name.indexOf('management') == -1 || element.app_name == 'Member management'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.active}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.inactive}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Inactive</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        else if(element.app_name == 'App management' || element.app_name == 'Location management'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373;">${element.total}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                    </div>
                                    <div class="col-12 text-center p-0">
                                    </div>
                                </div>
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        else if(element.app_name == 'User management'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.active}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.inactive}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Inactive</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        else if(element.app_name == 'Log management'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.yesterday}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Yesterday</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.today}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Today</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        else if(element.app_name == 'Outreach management'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.published}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Published</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-4" style="border: 2px solid #F0F0F0;margin-right:4px;border-radius: 5px;">
                                <div class="row d-flex justify-content-start p-0">
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:15px;font-weight: 600;font-family:arial;color:#737373">${element.not_published}</span>
                                    </div>
                                    <div class="col-12 text-center p-0">
                                        <span style="font-size:10px;font-weight: 600;font-family:arial;color:#737373">Paused</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        else if(element.app_name == 'Reference data management'){
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4">
                            </div>
                            <div class="col-4">
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        else{
                            count = `<div class="row d-flex justify-content-start p-1">
                            <div class="col-4">
                            </div>
                            <div class="col-4">
                            </div>
                            <div class="col p-0">
                                <div class="row d-flex justify-content-start p-0">
                                    ${buttons}
                                </div>
                            </div>
                        </div>`
                        }
                        html += 
                        `<div class="col-xl-3 col-md-4 col-sm-6 pt-3 ${element.app_type}" data-name="${element.app_name}">
                            <div class='newsCard news-Slide-up card-box pr-2'>
                                <div class="d-flex justify-content-start pb-0">
                                </div>
                                ${count !== '' ? 
                                `<div class="d-flex justify-content-start pb-0">
                                    <div class="col-4 text-center p-1">
                                        ${mainButton}
                                            <div>
                                            <img src="${element.app_logo}" class="card-img logo-main" alt="..." style="width:4rem;"></a>
                                            </div>
                                        </a>
                                        <p class="card-title" style="font-size:11px;padding:0">${((element.app_name).toUpperCase())}</p>
                                    </div>
                                    <div class="col-8 pt-4">
                                        <div class="row justify-content-center">
                                            <div class="col-12">
                                                ${count}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-start p-0">
                                    ${new_notification}
                                </div>
                                <div class="d-flex justify-content-start p-0 pt-1" style="position:absolute;bottom:0;right:0;left:0;">
                                    <div class="pl-2 p-0">
                                        <p class='newsCaption-title mb-0' style="font-size:11px;color:#737373">App Owner: ${(element.point_of_contact)}</p>
                                    </div>
                                </div>`
                                :
                                `<div class="text-center">
                                    ${mainButton}
                                        <div>
                                        <img src="${element.app_logo}" class="card-img logo-main" alt="..." style="width:4rem;">
                                        </div>
                                    </a>
                                    <p class="card-title" style="font-size:11px;">${((element.app_name).toUpperCase())}</p>
                                    <div class="d-flex justify-content-start p-0" style="position:absolute;bottom:0;right:0;left:0;">
                                        <div class="pl-2 p-0">
                                            <p class='newsCaption-title mb-0' style="font-size:12px;color:#737373">App Owner: ${(element.point_of_contact)}</p>
                                        </div>
                                    </div>
                                </div>`}
                            </div>
                        </div>`
                    }
                })
                this.apps_order = apps_order
                $('.render_cards').html(html)
            }
            else{
                $('.render_cards').html('')
            }
        },
        renderappfavourites: function () {
            if (this.fav_data.length > 0) {
                this.fav_data.forEach((element, index) => {
                    $(`[data-id=${element.app_id}] svg`).attr('data-prefix','fas')
                    $(`[data-id=${element.app_id}] svg`).attr('title','Remove from favorites')
                })
            }
        },
        renderTrackerList(tracker_list, total_visits){
            $('.user_list_division').addClass('d-none')
            $('.all-cards-content-division').addClass('d-none')
            $('.app_management_division').addClass('d-none')
            $('.site-admin-division').removeClass('d-none')
            $('.header_filters').removeClass('d-flex')
            $('.header_filters').addClass('d-none')
            $('#status_all').html(total_visits)
            if (tracker_list.length > 0) {
                let html =''
                tracker_list.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td class="text-left">${element.app_name}</td>
                        <td class="text-left">${element.action}</td>
                        <td class="text-left">${element.username}</td>
                        <td class="text-left">${element.created_datetime}</td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="`+(i + 1)+`">` + (i + 1) + `</li>`;
                        // as we added a page, we reset the separatorAdded
                        separatorAdded = false;
                    } else {
                        if (!separatorAdded) {
                            // only add a separator when it wasn't added before
                            html += `<li class="separator" />`;
                            separatorAdded = true;
                        }
                    }
                }
                $('#holder').html(html)
                document.querySelector('#holder>li[data-page="' + this.page + '"]').classList.add('active')

            } else {
                $('#storebookingData').html('<tr><td colspan="9">No Data</td></tr>');
                $('#holder').html('')
            }
        },
        addAppsSortingOrder(){
            $.ajax({
                type: "POST",
                url: "/api/v1/update/apps/ordering/",
                data: {
                    'apps_order[]':this.apps_order,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                },
                error: (err) => {
                }
            })
        },
        userTrackerGetList(){
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/api/v1/tracker/getlist/",
                data: {

                    app_name: this.site_admin_app_type,
                    search_key: this.search_key,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    page:this.page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    const tracker_list = res.tracker_list
                    this.pagination = res.pagination
                    dashboardApp.renderTrackerList(tracker_list, res.total_visits)
                    dashboardApp.renderSelectBox('type_of_apps_site_admin',res.apps_list,'All')
                },
                error: (err) => {
                    const tracker_list = []
                    dashboardApp.renderTrackerList(tracker_list, res.total_visits)
                }
            })
        },
        FavouriteappPost() {
            $.ajax({
                type: "POST",
                url: "/api/v1/favourites/",
                data: {
                    favourite_app: this.favourite_app,
                    operation_type: this.operation_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    this.fav_data = res.favourite_list
                    this.renderappfavourites()
                },
                error: (err) => {
                    this.fav_data = []
                    this.country_count = res.country_count
                    this.renderappfavourites()
                }
            })
        },
        FavouriteappGet() {
            $.ajax({
                type: "GET",
                url: "/api/v1/favourites/",
                success: (res) => {
                    this.fav_data = res.favourite_list
                    this.renderappfavourites()
                },
                error: (err) => {
                    this.fav_data = []
                    this.renderappfavourites()
                }
            })
        },
        getApps(){
            $.ajax({
                type: "POST",
                url: "/api/v1/apps/list/",
                data: {
                    apps_type: this.apps_type,
                    search_key: this.search_key,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status==1){
                        dashboardApp.data = res.apps_list
                        this.renderLocation(res.location_list)
                        this.quality_reports = res.quality_services
                        this.renderQualityService(this.selected_field)
                        this.renderAppLocationEditSelectBox('editapplocation_app_selector',res.all_app_list)
                    }
                    else{
                        this.data = []
                    }
                    if(dashboardApp.apps_table){
                        this.renderAppsTable()
                    }
                    else{
                    this.renderApps()
                    }
                },
                error: (err) => {
                }
            })
        },
        setDate(start, end) {
            $('#searchBooking').val('');
            if (start.format('MMMM D, YYYY') === 'June 1, 2020') {
                $('#reportrange span').html('Select Date Range');
            } else {
                if (start.format('MMMM D, YYYY') === end.format('MMMM D, YYYY')) {
                    if (moment(new Date()).format('MMMM D, YYYY') === start.format('MMMM D, YYYY'))
                        $('#reportrange span').html('Today');
                    else if(moment().subtract(1, 'days').format('MMMM D, YYYY') === start.format('MMMM D, YYYY'))
                        $('#reportrange span').html('Yesterday');
                    else
                        $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));

                } else
                    $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            }
            $('#date_start').val(start.format('YYYY-MM-DD'));
            $('#date_end').val(end.format('YYYY-MM-DD'));

            dashboardApp.start_date = $('#date_start').val()
            dashboardApp.end_date = $('#date_end').val()
            dashboardApp.userTrackerGetList()
        },
        isPageInRange(curPage, index, maxPages, pageBefore, pageAfter) {
            if (index <= 1) {
                // first 2 pages
                return true;
            }
            if (index >= maxPages - 2) {
                // last 2 pages
                return true;
            }
            if (index >= curPage - pageBefore && index <= curPage + pageAfter) {
                return true;
            }
        },
        renderSelectBox: function(nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['all',firstItem],].concat(choices);
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
            $('select[name="type_of_apps_site_admin"]').val(this.site_admin_app_type)
        },
        deleteApp(){
            $('#delete-app-model .fa-spinner').removeClass('d-none')
            $.ajax({
                type: "POST",
                url:'/api/v1/delete/app/',
                data:{
                    id: dashboardApp.app_id,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    $('#delete-app-model .fa-spinner').addClass('d-none')
                    $('#delete-app-model').modal('hide')
                    $('#edit-model').modal('hide')
                    var alert = $('#server-alert')
                    if(res.status==1){
                        alert.addClass('alert-success').removeClass('alert-danger')
                        alert.removeClass('d-none')
                        alert.html('App deleted successfully')
                        dashboardApp.getApps()
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        //Admin panel part
        renderAppLocationEditSelectBox(nameOfSelect, choices){
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value['app_name']}">${value['app_name']}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
        isPageInRange(curPage, index, maxPages, pageBefore, pageAfter) {
            if (index <= 1) {
                // first 2 pages
                return true;
            }
            if (index >= maxPages - 2) {
                // last 2 pages
                return true;
            }
            if (index >= curPage - pageBefore && index <= curPage + pageAfter) {
                return true;
            }
        },
        addEditUser(date_of_birth,hire_date,positionid,emailid,reports_to_name,payroll_name,position_status,worker_category_description,job_title_description,region,eeo_establishment,job_function_description,home_department_description,union_code,isstaff,emp_status){
            $('#addedituser-model .fa-spinner').removeClass('d-none')
            $.ajax({
                type: "POST",
                url:'/api/v1/addedit/user/', 
                data: {
                    type_of_submit:dashboardApp.user_crud_operation_type,
                    user_id:dashboardApp.userID,
                    positionid:positionid,
                    emailid:emailid,
                    reports_to_name:reports_to_name,
                    payroll_name:payroll_name,
                    date_of_birth:date_of_birth,
                    position_status:position_status,
                    worker_category_description:worker_category_description,
                    job_title_description:job_title_description,
                    hire_date:hire_date,
                    region:region,
                    eeo_establishment:eeo_establishment,
                    job_function_description:job_function_description,
                    home_department_description:home_department_description,
                    union_code:union_code,
                    isstaff: isstaff,
                    emp_status: emp_status,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                 xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: (res) => {
                    $('#addedituser-model .fa-spinner').addClass('d-none')
                    $('#deleteuser-model').modal('hide')
                    if(res.status==1){
                        if(dashboardApp.user_crud_operation_type=='add'){
                            $('#server-alert').html(`User Added Successfully, Invitation sent to ${emailid}.`)
                        }
                        else{
                            $('#server-alert').html('Updated Successfully')
                        }
                        $('#server-alert').removeClass("alert-danger").addClass('alert-success')
                        $('#server-alert').removeClass('d-none')
                        $('#addedituser-model').modal('hide')
                        this.userListPOST()
                    }
                    else if(res.status==2){
                        $('#addedituser-error-alert').html(res.text)
                        $('#addedituser-error-alert').removeClass('d-none')
                    }
                    else{
                        $('#addedituser-error-alert').html("Some error has occured. Please try again later")
                        $('#addedituser-error-alert').removeClass('d-none')
                    }
                    setTimeout(function () {
                        $('#addedituser-error-alert').addClass('d-none')
                        $('#server-alert').addClass('d-none')
                    }, 3000)

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        userListPOST(){
            $('#userDetails').html(`<tr><td colspan="13">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url:'/userAccessApis/',
                data: {
                    limit: this.limit,
                    searchKey: this.search_key,
                    page: this.page,
                    box_type_selected: this.box_type_selected,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: (res) => {
                    if(res.status==1){
                        this.userData = res.data
                        this.pagination = res.pagination
                        this.outreachList =res.outreach_list
                        this.user_count = res.user_count
                        this.renderTable()
                        this.renderAppLocationEditSelectBox('edit_user_app_location_app_selector',res.apps_list)
                    }
                    else{
                        $('#userDetails').html(`<tr><td colspan="4">Some error has occured</td></tr>`);
                    }

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        FetchUserLocation(app_name){
            $.ajax({
                type: "POST",
                url:'/api/v1/fetch/user/location/',
                data:{
                    id: this.userID,
                    app_name: app_name,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#usergroup-alert')
                    if(res.status==1){
                        var html = ''
                        if(res.user_locations.length>0){
                            res.user_locations.forEach((element, index)=>{
                                html += `<li class="userlocation_removegroup" data-id=${element.id} style="font-size:14px;font-weight:500">${element.location__name}</li>`
                            })
                        }
                        else{
                            $('.user_assigned_location').html(html)
                        }
                        $('.user_assigned_location').html(html)
                        html = ''
                        if(res.all_locations.length>0){
                            res.all_locations.forEach((element, index)=>{
                                html += `<li class="userlocation_addgroup" data-id=${element.id} style="font-size:14px;font-weight:500">${element.name}</li>`
                            })
                        }
                        else{
                            $('.user_available_location').html(html)
                        }
                        $('.user_available_location').html(html)
                    }
                    else{
                        $('.user_assigned_location').html('')
                        $('.user_available_location').html('')
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        renderTable(){
            var html ='';
            if(this.userData.length>0){
                this.userData.forEach((element, index)=>{
                  html+=`<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                  <td>${element.username}</td>
                  <td>${element.first_name} ${element.last_name}</td>
                  <td>${element.email}</td>
                  <td>${element.is_staff ? `<span class="edit_icon mr-1" data-id="${element.id}" data-firstname="${element.first_name}" data-lastname="${element.last_name}" data-email="${element.username}" data-isstaff="${element.is_staff}"  data-toggle="modal" data-target="#addedituser-model" ><i  class="fa fa-edit text-primary ml-1" title="Edit Demographics" style="font-size:18px;cursor:pointer;" ></i></span>` : ""}
                  <span class="edit_group_icon mr-1" data-id="${element.id}" data-username="${element.username}" data-toggle="modal" data-target="#usergroup-model" ><i class="fa fa-plus text-primary ml-1" title="Edit Group" style="font-size:18px;cursor:pointer;" ></i></span><span class="delete_user_icon mr-1" data-id="${element.id}" data-username="${element.username}" data-toggle="modal" data-target="#deleteuser-model" ><i class="fa fa-trash text-danger ml-1" title="Delete User" style="font-size:18px;cursor:pointer;" ></i></span></td>
                </tr>`;
                })
                $('.header_filters').removeClass('d-flex')
                $('.header_filters').addClass('d-none')
                $('.all-cards-content-division').addClass('d-none')
                $('.app_management_division').addClass('d-none')
                $('.user_list_division').removeClass('d-none')
                $('#userDetails').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination2" data-page="` + (i + 1) + `">` + (i + 1) + `</li>`;
                        // as we added a page, we reset the separatorAdded
                        separatorAdded = false;
                    } else {
                        if (!separatorAdded) {
                            // only add a separator when it wasn't added before
                            html += `<li class="separator" />`;
                            separatorAdded = true;
                        }
                    }
                }
                $('#holder2').html(html)
                document.querySelector('#holder2>li[data-page="' + this.page + '"]').classList.add('active')
            } else {
                $('#userDetails').html('<tr><td colspan="4">No Data</td></tr>');
                $('#holder2').html('')
            }
            $('#users_all').html(this.user_count.all)
            $('#users_admin').html(this.user_count.org_admin)
        },
        renderAppsTable(){
            var apps_list = []
            var apps_list_before_pagination = []
            apps_list = this.data.slice()
            apps_list.sort((a, b) => {
                if (a.is_app_admin && !b.is_app_admin) {
                  return -1; // a should come before b
                } else if (!a.is_app_admin && b.is_app_admin) {
                  return 1; // a should come after b
                } else {
                  return 0; // no change in order
                }
              });

            if(dashboardApp.search_key!==''){
                apps_list = apps_list.filter(item => item.app_name.toLowerCase().includes(dashboardApp.search_key.toLowerCase()))
            }
            if(dashboardApp.app_management_app_type!=='all'){
                if(dashboardApp.app_management_app_type == 'humanresources'){
                    apps_list = apps_list.filter(function (item) {
                        return item.app_type == dashboardApp.app_management_app_type || item.app_type == 'vaccine'
                    })
                }
                else{
                    apps_list = apps_list.filter(function (item) {
                        return item.app_type == dashboardApp.app_management_app_type
                    })
                }
            }
            const default_apps = apps_list.filter(({ subscription }) => subscription !== -1);
            const tenant_apps = apps_list.filter(({ subscription }) => subscription === -1);
            apps_list_before_pagination = apps_list
            if(dashboardApp.app_table_box!=='Total'){
                if(dashboardApp.app_table_box!=='Custom'){
                    apps_list = apps_list.filter(function (item) {
                        return item.subscription >= 0
                    })
                }
                else if(dashboardApp.app_table_box!=='Default'){
                    apps_list = apps_list.filter(function (item) {
                        return item.subscription < 0
                    })
                }
            }

            if(this.limit && this.page){
                let offset = 0
                let end_offset = 0
                let no_item = 0
                let total_page = 0
                offset = (parseInt(this.page,10) - 1) * parseInt(this.limit,10)
                end_offset = offset + parseInt(this.limit,10)
                no_item = apps_list.length
                total_page = no_item / parseInt(this.limit,10)
                if(no_item % parseInt(this.limit,10) !== 0){
                    total_page += 1
                }
                apps_list = apps_list.slice(offset,end_offset)
                if(apps_list.length !== 0){
                    this.pagination = {
                        'status': '1',
                        'totalPages': parseInt(total_page,10),
                        'currentPage': this.page,
                    }
                }
            }
            var html ='';
            if(apps_list.length>0){
                apps_list.forEach((element, index)=>{
                    let buttons_data = []
                    for(let i=0;i<element.buttons.length;i++){
                        buttons_data.push(element.buttons[i]['id'],element.buttons[i]['button_href'],element.buttons[i]['button_text'])
                    }
                    let edit_option = ``
                        if(element.is_app_admin && element.subscription ==-1){
                            edit_option = `
                                <span class="appedit" data-id="${element.id}" data-subsription="${element.subscription}" data-appname="${element.app_name}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-app_logo=${element.app_logo}><i style="cursor:pointer;width:17px;height;17px;" data-toggle="modal" data-target="#edit-model"  title="Edit App" class="fas fa-edit text-primary"></i></span>
                                <span class="editapplocation-model" data-id="${element.id}" data-subsription="${element.subscription}" data-appname="${element.app_name}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-app_logo=${element.app_logo}><i style="cursor:pointer;width:17px;height;17px;" data-toggle="modal" data-target="#editapplocation-model"  title="Edit App Permission" class="fas fa-plus text-primary"></i></span>
                               `
                        }
                        else if(element.is_app_admin && element.subscription >= 0){
                            edit_option = `
                                <span class="default_appedit" data-id="${element.id}" data-appname="${element.app_name}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-app_logo=${element.app_logo}><i style="cursor:pointer;width:17px;height;17px;" data-toggle="modal" data-target="#edit-model"  title="Edit App" class="fas fa-edit text-primary"></i></span>
                                <span class="editapplocation-model" data-id="${element.id}" data-subsription="${element.subscription}" data-appname="${element.app_name}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-app_logo=${element.app_logo}><i style="cursor:pointer;width:17px;height;17px;" data-toggle="modal" data-target="#editapplocation-model"  title="Edit App Permission" class="fas fa-plus text-primary"></i></span>
                            `
                        }
                  html+=`<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                  <td>${element.app_name}</td>
                  <td>${element.app_type =='vaccine' ? 'humanresources': element.app_type}</td>
                  <td>${element.modified_by}</td>
                  <td>${element.subscription<0?'<span class="badge badge-primary" style="font-size:11px;">Custom App</span>':'<span class="badge badge-danger" style="font-size:11px;">System App</span>'}</td>
                  <td>${element.is_hidden?`<span class="badge badge-danger" style="font-size:11px;">Hidden</span>`:`<span class="badge badge-success" style="font-size:11px;">Published</span>`}</td>
                  <td>${element.created_datetime}</td>
                  <td class="col-md-auto justify-content-start">${edit_option}</td>
                </tr>`;                 
                })
                $('.header_filters').removeClass('d-flex')
                $('.header_filters').addClass('d-none')
                $('.all-cards-content-division').addClass('d-none')
                $('.user_list_division').addClass('d-none')
                $('.app_management_division').removeClass('d-none')
                $('#app_management_apps_render').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination3" data-page="` + (i + 1) + `">` + (i + 1) + `</li>`;
                        // as we added a page, we reset the separatorAdded
                        separatorAdded = false;
                    } else {
                        if (!separatorAdded) {
                            // only add a separator when it wasn't added before
                            html += `<li class="separator" />`;
                            separatorAdded = true;
                        }
                    }
                }
                $('#app_management_holder').html(html)
                document.querySelector('#app_management_holder>li[data-page="' + this.page + '"]').classList.add('active')
            } else {
                $('#app_management_apps_render').html('<tr><td class="col-md-auto text-center" colspan="6">No Data</td></tr>');
                $('#app_management_holder').html('')
            }
            $('#app_management_apps_count').html(apps_list_before_pagination.length)
            $('#app_management_apps_default_count').html(default_apps.length)
            $('#app_management_apps_custom_count').html(tenant_apps.length)
            
        },
        FetchUserGroup(){
            $.ajax({
                type: "POST",
                url:'/api/v1/fetch/user/groups/',
                data:{
                    userid: this.userID,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#usergroup-alert')
                    if(res.status==1){
                        var html = ''
                        if(res.assigned_groups.length>0){
                            res.assigned_groups.forEach((element, index)=>{
                                html += `<li class="remove_group" data-id=${element.id} style="font-size:14px;font-weight:500">${element.name}</li>`
                            })
                        }
                        else{
                            $('.existing_group').html(html)
                        }
                        $('.existing_group').html(html)
                        html = ''
                        if(res.not_assigned_groups.length>0){
                            res.not_assigned_groups.forEach((element, index)=>{
                                html += `<li class="add_group" data-id=${element.id} style="font-size:14px;font-weight:500">${element.name}</li>`
                            })
                        }
                        else{
                            $('.not_existing_group').html(html)
                        }
                        $('.not_existing_group').html(html)
                    }
                    else{
                        $('.existing_group').html('')
                        $('.not_existing_group').html('')
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        FetchUserGroup(){
            $.ajax({
                type: "POST",
                url:'/api/v1/fetch/user/groups/',
                data:{
                    userid: this.userID,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#usergroup-alert')
                    if(res.status==1){
                        var html = ''
                        if(res.assigned_groups.length>0){
                            res.assigned_groups.forEach((element, index)=>{
                                html += `<li class="remove_group" data-id=${element.id} style="font-size:14px;font-weight:500">${element.name}</li>`
                            })
                        }
                        else{
                            $('.existing_group').html(html)
                        }
                        $('.existing_group').html(html)
                        html = ''
                        if(res.not_assigned_groups.length>0){
                            res.not_assigned_groups.forEach((element, index)=>{
                                html += `<li class="add_group" data-id=${element.id} style="font-size:14px;font-weight:500">${element.name}</li>`
                            })
                        }
                        else{
                            $('.not_existing_group').html(html)
                        }
                        $('.not_existing_group').html(html)
                    }
                    else{
                        $('.existing_group').html('')
                        $('.not_existing_group').html('')
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        removeFromGroup(group_id){
            $.ajax({
                type: "POST",
                url:'/remove/group/', 
                data: {
                    group_id: group_id,
                    userid: this.userID,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                crossDomain: true,
                success: (res) => {
                    if(res.status == 1){
                        dashboardApp.FetchUserGroup()
                        $('.not_existing_group,.existing_group').html(
                            `<div class="spinner-border text-primary" role="status">
                              <span class="spinner_loader sr-only">Loading...</span>
                            </div>`
                        );
                    }
                    else if(res.status==2){
                        $('#usergroup-alert').html("You cannot remove your admin access unless you assign it to someone else.")
                        $('#usergroup-alert').removeClass('d-none')
                        setTimeout(function () {
                            $('#usergroup-alert').addClass('d-none')
                        }, 6000)
                    }
                    else{
                        $('#usergroup-alert').html("Something has occcured. Please try again later")
                        $('#usergroup-alert').removeClass('d-none')
                        setTimeout(function () {
                            $('#usergroup-alert').addClass('d-none')
                        }, 3000)
                    }
                },
                error: (err) => {
                
                }
            })
        },
        addtoGroup(group_id){
            $.ajax({
                type: "POST",
                url:'/add/group/', 
                data: {
                    group_id: group_id,
                    userid: this.userID,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    if(res.status == 1){
                        dashboardApp.FetchUserGroup()
                        $('.not_existing_group,.existing_group').html(
                            `<div class="spinner-border text-primary" role="status">
                              <span class="spinner_loader sr-only">Loading...</span>
                            </div>`
                        );
                    }
                    else{
                        $('#usergroup-alert').html("Something has occcured. Please try again later")
                        $('#usergroup-alert').removeClass('d-none')
                        setTimeout(function () {
                            $('#usergroup-alert').addClass('d-none')
                        }, 3000)
                    }
                }
                ,
                error: (err) => {
                }

            })
        },
        UserLocationEdit(id,type_of_submit,app_name){
            $.ajax({
                type: "POST",
                url:'/api/v1/edit/user/location/',
                data:{
                    id: id,
                    user_id: this.userID,
                    app_name: app_name,
                    type_of_submit: type_of_submit,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#editapplocation-alert')
                    if(res.status==1){
                        dashboardApp.FetchUserLocation(app_name)
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        renderLocation(location){
            var html = ''
            if(location.length>0){
                location.forEach((element, index)=>{
                    html += `<li class="addlocation_all_location_list" style="font-size:14px;font-weight:500">${element.name}<span class="delete_location" data-id="${element.id}" data-name="${element.name}" data-toggle="modal" data-target="#editdeletelocation-model"><i class="fa fa-trash text-danger pr-1 pt-1" title="Delete Location" style="font-size:18px;cursor:pointer;float:right;" ></i></span><span class="edit_location" data-id="${element.id}" data-name="${element.name}" data-toggle="modal" data-target="#editdeletelocation-model"><i class="fa fa-edit pr-1 pt-1 text-info" title="Edit Location" style="font-size:18px;cursor:pointer;float:right;"></i></span></li>`
                })
            }
            $('.addlocation_all_location').html(html)
        },
        renderQualityFields() {
            dashboardApp.renderQualityService(dashboardApp.selected_field);
        },
        renderQualityService(field_name){
            var html = ''
            var quality_service = $.map(dashboardApp.quality_reports, function (acItem) {
                if (acItem.quality === dashboardApp.quality_name && acItem.field_name === field_name) {
                    return acItem;
                }
            });
            if(quality_service.length>0){
                quality_service.forEach((element, index)=>{
                    html += `<li class="quality_list" style="font-size:14px;font-weight:500">${element.field_value}<span class="delete_quality_report ml-2" data-id="${element.id}" data-name="${element.field_value}" data-toggle="modal" data-target="#editdeletequalityreport-model"><i class="fa fa-trash text-danger pr-1 pt-1" title="Delete Service Value" style="font-size:18px;cursor:pointer;float:right;" ></i></span><span class="edit_report_type" data-id="${element.id}" data-name="${element.field_value}" data-toggle="modal" data-target="#editdeletequalityreport-model"><i class="fa fa-edit pr-1 pt-1 text-info" title="Edit Service Value" style="font-size:18px;cursor:pointer;float:right;"></i></span></li>`
                })
            }
            $('.all_qualityreport').html(html)

        },
        AddEditLocation(location,type_of_submit){
            $.ajax({
                type: "POST",
                url:'/api/v1/add/location/', 
                data: {
                    id: dashboardApp.userID,
                    type_of_submit: type_of_submit,
                    location: location,
                    csrfmiddlewaretoken:this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#addlocation_error_alert')
                    $('#editdeletelocation-model').modal('hide')
                    $('#addlocation_addlocation').prop('disabled',false)
                    $('#editdeletelocation-model .btn-primary').prop('disabled',false)
                    $('#addlocation-model .fa-spinner').addClass('d-none')
                    if(res.status==1){
                        dashboardApp.renderLocation(res.location)
                        alert.removeClass('alert-danger').addClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Updated successfully')
                        
                        
                    }
                    else if(res.status==2){
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Location already exists')
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Please try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        AddEditQualityReportType(service_type,type_of_submit){
            $.ajax({
                type: "POST",
                url:'/api/v1/add/quality-service/', 
                data: {
                    id: dashboardApp.userID,
                    type_of_submit: type_of_submit,
                    quality_service: service_type,
                    field_name: dashboardApp.selected_field,
                    quality:dashboardApp.quality_name,
                    csrfmiddlewaretoken:this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#addqualityreport_error_alert')
                    $('#editdeletequalityreport-model').modal('hide')
                    $('#id_addqualityreport').prop('disabled',false)
                    $('#editdeletequalityreport-model .btn-primary').prop('disabled',false)
                    $('#addqualityreport-model .fa-spinner').addClass('d-none')
                    if(res.status==1){
                        dashboardApp.quality_reports = res.reports
                        dashboardApp.renderQualityService(this.selected_field)
                        alert.removeClass('alert-danger').addClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Updated successfully')
                        $("input[name='add-qualityreport']").val("")
                        
                    }
                    else if(res.status==2){
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Quality report type already exists')
                    }
                    else if(res.status==3){
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('You don\'t currently have permission to access this service type!')
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Please try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        FetchAppLocation(app_name){
            $.ajax({
                type: "GET",
                url:`/api/v1/fetch/app/location/${app_name}/`,
                success: (res) => {
                    var alert = $('#addlocation_error_alert')
                    if(res.status==1){
                        var html = ''
                        if(res.app_specific_location_list.length>0){
                            res.app_specific_location_list.forEach((element, index)=>{
                                html += `<li class="addlocation_removegroup" data-id=${element.id} style="font-size:14px;font-weight:500">${element.location__name}</li>`
                            })
                        }
                        else{
                            $('.all_assigned_locations').html(html)
                        }
                        $('.all_assigned_locations').html(html)
                        html = ''
                        if(res.location_not_assigned_for_app.length>0){
                            res.location_not_assigned_for_app.forEach((element, index)=>{
                                html += `<li class="addlocation_addgroup" data-id=${element.id} style="font-size:14px;font-weight:500">${element.name}</li>`
                            })
                        }
                        else{
                            $('.all_locations').html(html)
                        }
                        $('.all_locations').html(html)
                        html = ''
                        if(res.all_users.length>0){
                            res.all_users.forEach((element, index)=>{
                                html += `<li class="addlocation_addadmin" data-id=${element.id} style="font-size:14px;font-weight:500">${element.username}</li>`
                            })
                        }
                        else{
                            $('.all_users').html(html)
                        }
                        $('.all_users').html(html)
                        html = ''
                        if(res.admin_users.length>0){
                            res.admin_users.forEach((element, index)=>{
                                html += `<li class="addlocation_removeadmin" data-id=${element.id} style="font-size:14px;font-weight:500">${element.username}</li>`
                            })
                        }
                        else{
                            $('.admin_users').html(html)
                        }
                        $('.admin_users').html(html)
                    }
                    else{
                        $('.all_assigned_locations').html('')
                        $('.all_locations').html('')
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        AppAdminEdit(id,type_of_submit,app_name){
            $.ajax({
                type: "POST",
                url:'/api/v1/edit/app/admin/',
                data:{
                    id: id,
                    app_name: app_name,
                    type_of_submit: type_of_submit,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#editapplocation-alert')
                    if(res.status==1){
                        var html = ''
                        if(res.all_users.length>0){
                            res.all_users.forEach((element, index)=>{
                                html += `<li class="addlocation_addadmin" data-id=${element.id} style="font-size:14px;font-weight:500">${element.username}</li>`
                            })
                        }
                        else{
                            $('.all_users').html(html)
                        }
                        $('.all_users').html(html)
                        html = ''
                        if(res.admin_users.length>0){
                            res.admin_users.forEach((element, index)=>{
                                html += `<li class="addlocation_removeadmin" data-id=${element.id} style="font-size:14px;font-weight:500">${element.username}</li>`
                            })
                        }
                        else{
                            $('.admin_users').html(html)
                        }
                        $('.admin_users').html(html)
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        AppLocationEdit(id,type_of_submit,app_name){
            $.ajax({
                type: "POST",
                url:'/api/v1/edit/app/location/',
                data:{
                    id: id,
                    app_name: app_name,
                    type_of_submit: type_of_submit,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    var alert = $('#editapplocation-alert')
                    if(res.status==1){
                        dashboardApp.FetchAppLocation(app_name)
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        outreachCreation(outreachName,fieldsList,statusList,is_filter_added,ageFromFilter,ageToFilter,zipFilter,genders, schedule_enabled, start_date, weekDays, end_date, schedule_type,schedule_hours,schedule_minutes,notification_text){
            $.ajax({
                type: "POST",
                url: "/api/add/outreach/",
                data: {
                    'outreachName':outreachName,
                    'fieldsList[]':fieldsList,
                    'statusList[]':statusList,
                    'ageFromList[]':ageFromFilter,
                    'ageToList[]':ageToFilter,
                    'zipList[]':zipFilter,
                    'genderList[]':genders,
                    'is_filter_added':is_filter_added,
                    'schedule_enabled':schedule_enabled,
                    'start_date':start_date,
                    'end_date':end_date,
                    'schedule_type':schedule_type,
                    'weekDays[]':weekDays,
                    'schedule_hours[]':schedule_hours,
                    'schedule_minutes[]':schedule_minutes,
                    'notification_text':notification_text,
                    csrfmiddlewaretoken: dashboardApp.csrfmiddlewaretoken,
                    
                },
                success: (res) => {
                    var error = $('#outreach-error-alert')
                    error.addClass('alert-danger').removeClass('alert-success')
                    error.removeClass('d-none')
                    $('.outreach-spin').addClass('d-none')
                    $('#id_create_outreach .fa-spinner').addClass('d-none')
                    $('#id_create_outreach').prop('disabled',false)
                    if(res.status==2){
                        error.html('Outreach with same name already exists!')
                    }
                    if(res.status==0){
                        error.html('Something went wrong! Try again')
                    }
                    if(res.status==1){
                        error.removeClass('alert-danger').addClass('alert-success')
                        error.html('Added successfully')
                        dashboardApp.outreachList.push(res.data[0])
                    }
                    setTimeout(function () {
                        error.addClass('d-none')
                        error.addClass('alert-danger').removeClass('alert-success')
                    }, 3000)
                },
                error: (err) => {
                }
            })
        },
        getOutreach(){
            $.ajax({
                type: "POST",
                url: "/api/v1/outreach/list/",
                data: {
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status==1){
                        this.outreachList = res.outreach_list
                        dashboardApp.outreachTable()
                    }
                    else{
                        this.outreachList = []
                    }
                },
                error: (err) => {
                }
            })
        },
        outreachTable(){
            let html = ""
            if(dashboardApp.outreachList.length == 0){
                $('#outreach-model .modal-body').html("No outreach created yet!")
            }
            else{
                html = `<table class="table table-striped noborder">
                            <thead>
                                <tr>
                                    <td>Outreach name</td>
                                    <td>Status</td>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody id="outreachDetails">
                            </tbody>
                        </table>`
                $('#outreach-model .modal-body').html(html)
                html =''
                dashboardApp.outreachList.forEach((element, index)=>{
                    html+=`<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                    <td>${element.name}</td>
                    <td id="publish${element.id}">${element.is_published ? '<span class="badge badge-pill badge-success">Published</span>' :'<span class="badge badge-pill badge-warning">Paused</span>'}</td>
                    <td><a href="/outreach/scheduler/${element.name}/" target="_blank"><i class="fa fa-calendar text-primary ml-1" title="Time Scheduler" style="font-size:18px;cursor:pointer;" ></i></a><span class="edit_outreach_icon ml-1" data-id="${element.id}" ><i class="fa fa-edit text-primary ml-1" title="Edit Outreach Details" style="font-size:18px;cursor:pointer;" ></i></span><span class="edit_outreach_publish_icon" data-id="${element.id}" ><i class="fa fa-cog text-primary ml-1" title="Edit Outreach Publish Status" style="font-size:18px;cursor:pointer;" ></i></span></td>
                  </tr>`;
                  })
                  $('#outreachDetails').html(html)
            }
            html=`<button type="button" class="btn btn-success" id="id_add_outreach">Add</button>
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>`
            $('#outreach-model .modal-footer').html(html)
            $('#outreach-model .modal-title').html("Outreach Portals")
        },
        renderUserModal() {
            $('#user_data_body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/api/user/demographic/${dashboardApp.userID}/`,
                success: (res) => {
                    $('#user_data_body').html(res)
                },
                error: () => {
                    $('#user_data_body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        FileValidate(event){
            if (event.target.files[0] !== undefined) {
                let file_name = $('input[name=ingress]').val().split('.')
                const file_size = event.target.files[0].size
                var file_ext = file_name[file_name.length - 1].toLowerCase();
                var is_wrong_file = false;
                var error_text = ''
                if (file_ext!='csv' & file_ext!='xlsx') {
                    error_text = 'File type not supported. Please upload csv,xlsx files'
                    is_wrong_file = true;
                }
                if (file_size >= (500 * 1024*1024)) {
                    error_text = 'File size not supported. Allowed maximum size is 5 MB'
                    is_wrong_file = true;
                }
                if (is_wrong_file) {
                    let error = $('#ingress-error-alert')
                    error.html(error_text)
                    error.removeClass('alert-success').addClass('alert-danger')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                    }, 3000)
                    $('input[name=ingress]').val('')
                    return false
                }
                else {
                    return true
                }
            }
        }

        //////////////////////////////////////////////////
    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    dashboardApp.init()

    $("select[name='type_of_apps_site_admin']").change(function () {
        dashboardApp.site_admin_app_type = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userTrackerGetList()
    })

    $('#id_search_site_admin').keyup(function () {
        dashboardApp.search_key = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userTrackerGetList()
    })

    $('body').on('keyup','#id_search_user_list',function () {
        dashboardApp.search_key = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userListPOST()
    })

    $('#limit').change(function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userTrackerGetList()
    })

    $("body").on('change' ,'#limit2', function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userListPOST()
    })

    $("body").on('change' ,'#id_app_management_limit', function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.renderAppsTable()
    })

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.userTrackerGetList()
    });

    $("body").on('click', '.pagination2', function () {
        $(".pagination2").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.userListPOST()
    });

    $("body").on('click', '.pagination3', function () {
        $(".pagination3").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.renderAppsTable()
    });

    $("input[name='apps_search']").keyup(function () {
        dashboardApp.search_key = $(this).val()
        dashboardApp.renderApps()
    })

    $('body').on('keyup','#id_app_management_apps_search',function () {
        dashboardApp.search_key = $(this).val()
        dashboardApp.page = 1
        dashboardApp.renderAppsTable()
    })

    $('body').on('change','#id_app_management_apps_type',function () {
        dashboardApp.app_management_app_type = $(this).val()
        dashboardApp.page = 1
        dashboardApp.renderAppsTable()
    })

    $('body').on('click','.countbox' ,function () {
        $('.countbox').removeClass('border-active')
        $(this).addClass('border-active')
        dashboardApp.box_type_selected = $(this).data('archive')
        dashboardApp.page = 1
        dashboardApp.userListPOST()
    })

    $('body').on('click','.countbox_app_managment' ,function () {
        $('.countbox_app_managment').removeClass('border-info')
        $(this).addClass('border-info')
        dashboardApp.app_table_box = $(this).data('archive')
        dashboardApp.page = 1
        dashboardApp.renderAppsTable()
    })

    $('#id_app_logo').change(function(event){
        if (event.target.files[0] !== undefined) {
            const file_name = event.target.files[0].name.split('.')
            const file_size = event.target.files[0].size
            var file_ext = file_name[file_name.length - 1];
            var is_wrong_file = false;
            if (file_ext!='png') {
                let error = $('#error-display-near-save')
                error.html('File type not supported. Please upload PNG Files')
                error.removeClass('alert-success').addClass('alert-danger')
                error.removeClass('d-none')
                setTimeout(function () {
                    error.addClass('d-none')
                }, 3000)
                is_wrong_file = true;
            }
            if (file_size >= (500 * 1024)) {
                let error = $('#error-display-near-save')
                error.html('File size not supported. Allowed maximum size is 500KB')
                error.removeClass('alert-success').addClass('alert-danger')
                error.removeClass('d-none')
                setTimeout(function () {
                    error.addClass('d-none')
                }, 3000)
                is_wrong_file = true;
            }
            if (is_wrong_file) {
                $(this).val('')
                $('#app_image_preview').addClass('d-none')
                $('#app_image_preview').attr("src","")
            }
            else {
                const [file] = id_app_logo.files
                if (file) {
                    $('#app_image_preview').removeClass('d-none')
                    app_image_preview.src = URL.createObjectURL(file)
                }
            }
        }
    })

    $('body').on('submit','#id_app_form',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        var checkbox = $('input[id=id_hide_app]:checked')
        if(checkbox.length>0){
            checkbox = true
        }
        else{
            checkbox = false
        }
        formData.append('app_hide',checkbox)
        formData.append('app_id',dashboardApp.app_id)
        formData.append('type_of_submit',dashboardApp.type_of_submit)
        formData.append('csrfmiddlewaretoken',dashboardApp.csrfmiddlewaretoken)
        var validate = dashboardApp.validate()
        if(validate){
            $('.fa-spinner').removeClass('d-none')
            $.ajax({
                url:'/api/v1/app/edit/post/',
                type: 'POST',
                data: formData,
                success: function (res) {
                    $('.fa-spinner').addClass('d-none')
                    let error = $('#error-display-near-save')
                    if(res.status==1){
                        error.html('Updated Successfully')
                        error.removeClass('alert-danger').addClass('alert-success')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                            $('#edit-model').modal('hide')
                        }, 1000)
                    }else if(res.status==2){
                        error.html('App name already exists/reserved')
                        error.removeClass('alert-success').addClass('alert-danger')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                        }, 3000)
                    }
                    else{
                        error.html('Something happened try again later')
                        error.removeClass('alert-success').addClass('alert-danger')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                        }, 3000)
                    }
                    dashboardApp.getApps()

                },
                error:function(){
                    $('.fa-spinner').addClass('d-none')
                },
                cache: false,
                contentType: false,
                processData: false
            });
        }
    });
})