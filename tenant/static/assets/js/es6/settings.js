const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
        table_sort: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        archive_id: null,
        tenant_status: null,
        is_superuser: false,
        init() {
            // this.getData()

            // Archive listener

            let localStorageDateSort = localStorage.getItem(CSV_TABLE_SORT)
            if (localStorageDateSort) {
                this.table_sort = JSON.parse(localStorageDateSort)
            }

            let td_keys = $('a.sort-table')

            for (let i = 0; i < td_keys.length; i++) {
                this.changeSortArrow($(td_keys[i]).data('td'))
            }


            $('body').on('click', '.hover-icons', function () {
                dashboardApp.archive_id = $(this).data('id')
                $('#id_tenant_name').val($(this).data('name'))
                $('#id_tenant_admin').val($(this).data('admin'))
                $('#id_tenant_domain').val($(this).data('name')+'.yettihealth.com')
                $('#id_client_id').val($(this).data('client_id'))
                $('#id_secret_id').val($(this).data('secret_id'))
                $('#id_tenant_id').val($(this).data('tenant_id'))
                if(dashboardApp.is_superuser){
                    $('.dynamic').addClass('col-md-6').removeClass('col-md-12')
                    $('.service_plan_hide').removeClass('d-none')
                }
                else{
                    $('.dynamic').removeClass('col-md-6').addClass('col-md-12')
                    $('.service_plan_hide').addClass('d-none')
                }
                $('#id_service_plan').val($(this).data('service'))
                $("#id_view_logo").addClass('d-none')
                $("#id_view_title_logo").addClass('d-none')
                if($(this).data('logo')){
                    $("#id_view_logo").removeClass('d-none')
                    $("#id_view_logo").attr({ "src": $(this).data('logo') });
                }
                if($(this).data('title_logo')){
                    $("#id_view_title_logo").removeClass('d-none')
                    $("#id_view_title_logo").attr({ "src": $(this).data('title_logo') });
                }
                $('#termination_status_text').addClass('d-none')
                $('.acknowledge_division').addClass('d-none')
                })

            $('body').on('change', '#id_status_change', function () {
                $('input[name="acknowledge_checkbox"]').prop('checked', false);
                if($(this).val()=='terminate'){
                    $('#termination_status_text').removeClass('d-none')
                    $('.acknowledge_division').removeClass('d-none')
                }
                else{
                    $('#termination_status_text').addClass('d-none')
                    $('.acknowledge_division').addClass('d-none')
                }
                
            })

            $('body').on('keyup', '#id_tenant_name', function () {
                const tenant_name = $('#id_tenant_name').val()
                var specialCharPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\| -]/;
                $('#id_tenant_domain').val(tenant_name.toLowerCase()+'.yettihealth.com')
                if(tenant_name.length === 0 || (specialCharPattern.test(tenant_name))){
                    $('#id_tenant_domain').val("")
                }
          })

            $('body').on('click', '.tenant_status_edit', function () {
                dashboardApp.archive_id = $(this).data('id')
                const status = $(this).data('status')
                if(status==true){
                    dashboardApp.tenant_status = 'Running'
                    var html = `<option value="">Change Status</options>
                    <option value="stop">Stop Tenant</options>
                    <option value="terminate">Terminate Tenant<options>`
                    $('#id_tenant_status_text_area').removeClass('text-danger').addClass('text-success')
                }
                else{
                    dashboardApp.tenant_status = 'Stopped'
                    var html = `<option value="">Change Status</options>
                    <option value="start">Start Tenant</options>
                    <option value="terminate">Terminate Tenant<options>`
                    $('#id_tenant_status_text_area').addClass('text-danger').removeClass('text-success')
                }
                $('#id_status_change').html(html)
                $('#id_tenant_status_text_area').html(dashboardApp.tenant_status)
            })

            $('body').on('click', '#settingsmodal .btn-primary', function () {
                var validate = dashboardApp.EditValidate($('#id_tenant_name').val(),$('#id_tenant_admin').val(),$('#id_service_plan').val())
                if(validate){
                    $('.fa-spinner').removeClass('d-none')
                    $('#id_logo_upload_form').submit()
                }
                
            })

            $('body').on('click', '#tenantStatusModal .btn-primary', function () {
                const new_tenant_status = $('#id_status_change').val()
                if(dashboardApp.tenant_status!==new_tenant_status){
                    if(new_tenant_status=='terminate'){
                        if($('input[name="acknowledge_checkbox"]:checked').length > 0){
                            $('.fa-spinner').removeClass('d-none')
                            dashboardApp.tenantStatusEdit(new_tenant_status)
                        }
                        else{
                            var error = $('.error_notify')
                            error.addClass('alert-danger').removeClass('alert-success')
                            error.removeClass('d-none')
                            error.html('Please acknowledge the checkbox')
                            setTimeout(function () {
                                error.addClass('d-none')
                            }, 3000)
                        }
                    }
                    else{
                        $('.fa-spinner').removeClass('d-none')
                        dashboardApp.tenantStatusEdit(new_tenant_status)
                    }
                }
            })

            // Modal button listener
            $('#archive-model .btn.btn-primary').click(function () {
                $(this).attr('disabled', true)
                $(this).html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`)
                dashboardApp.archiveAppointment()
                $('#view-model').modal('hide')
            })

            // Sort click
            $('td a.sort-table').click(function () {
                let key = $(this).data('td')
                if (dashboardApp.table_sort[key] == undefined || dashboardApp.table_sort[key] === 'normal') {
                    dashboardApp.table_sort[key] = 'asc'
                } else if (dashboardApp.table_sort[key] === 'asc') {
                    dashboardApp.table_sort[key] = 'dsc'
                } else {
                    dashboardApp.table_sort[key] = 'normal'
                }
                if (dashboardApp.data.length > 0) {
                    dashboardApp.getData()
                }
                dashboardApp.changeSortArrow(key)
                localStorage.setItem(CSV_TABLE_SORT, JSON.stringify(dashboardApp.table_sort))
            })

            // Modal

            $('body').on('click', 'a.view-data', function () {
                dashboardApp.url = $(this).data('url')
                dashboardApp.appointment_fk = $(this).data('id')
                dashboardApp.name = $(this).data('name')
                const status = 'viewing'
                dashboardApp.viewLock(dashboardApp.appointment_fk,status)
            })
            $('#view-model').on('hidden.bs.modal', function () {
                const status = 'closing'
                dashboardApp.viewLock(dashboardApp.appointment_fk,status)
                
            })
            $('body').on('submit','#id_logo_upload_form',function(e){
                e.preventDefault()
                var formData = new FormData(this);
                dashboardApp.tenantEdit($('#id_tenant_name').val(),$('#id_tenant_admin').val(),$('#id_service_plan').val(),formData)
               
            });

            $('body').on('change','#id_logo_upload', function(e){
                var validate = dashboardApp.FileValidate(e)
                if(!validate){
                    $(this).val('')
                }
                else{
                    const [file] = id_logo_upload.files
                    if (file) {
                        $('#id_view_logo').removeClass('d-none')
                        id_view_logo.src = URL.createObjectURL(file)
                    }
                }
                
            })

            $('body').on('change','#id_title_logo', function(e){
                var validate = dashboardApp.FileValidate(e)
                if(!validate){
                    $(this).val('')
                }
                else{
                    const [file] = id_title_logo.files
                    if (file) {
                        $('#id_view_title_logo').removeClass('d-none')
                        id_view_title_logo.src = URL.createObjectURL(file)
                    }
                }
            })
            
            dashboardApp.getData()

        },
        EditValidate: function(org_name,org_admin,service_plan){
            var pattern = /^\b[A-Z0-9._%-]+@[A-Z]+[^.]+\.[A-Z]{2,4}\b$/i
            $('#id_tenant_admin').removeClass('error')
            $('#id_tenant_name').removeClass('error')
            $('#id_service_plan').removeClass('error')
            if(!pattern.test(org_admin)){
                $('#id_tenant_admin').addClass('error')
                return false
            }
            if(org_name==''){
                $('#id_tenant_name').addClass('error')
                return false
            }
            if(service_plan==''){
                $('#id_service_plan').addClass('error')
                return false
            }
            return true
        },

        renderTable() {

            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td class="text-left">${element.name}</td>
                        <td>${element.subscription == 0 ? 'Free' : element.subscription == 1 ? 'Basic' : element.subscription == 2 ? 'Premium' :'Ultra'}</td>
                        <td>${element.admin_user}</td>
                        <td>${element.status ? '<span class="badge text-success">Running</span>' :'<span class="badge text-danger">Stopped</span>'}</td>
                        <td>${element.created_datetime}</td>
                        <td><span class="hover-icons" data-toggle="modal" data-target="#settingsmodal" data-id="${element.id}" data-admin="${element.admin_user}" data-name="${element.name}" data-service="${element.subscription}" data-logo="${element.logo}" data-title_logo="${element.title_logo}" data-client_id="${element.client_id}" data-secret_id="${element.secret_id}" data-tenant_id="${element.tenant_id}" ><i class="fa fa-edit text-primary" title="Edit" style="width: 16px;height: 16px;" ></i></span><span class="hover-icons mx-2 tenant_status_edit"  data-toggle="modal" data-target="#tenantStatusModal" data-id="${element.id}" data-status="${element.status}"><i class="fa fa-cog text-primary" title="Change Status" style="width: 16px;height: 16px;" ></i></span></td>
                    </tr>`
                })
                $('#tenantDetails').html(html);

            } else {
                $('#tenantDetails').html('<tr><td colspan="9">No Data</td></tr>');
                $('#holder').html('')
            }
        },
        getData() {
            $('#tenantDetails').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/api/v1/get/tenant/",
                data: {
                    table_sort: JSON.stringify(this.table_sort),
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    
                },
                success: (res) => {
                    this.data = res.data
                    this.is_superuser = res.is_superuser
                    this.renderTable()
                },
                error: (err) => {
                    this.data = []
                    this.is_superuser = false
                    this.renderTable()
                }
            })
        },
        tenantEdit(tenant_name,tenant_admin,service_type,formData) {
            formData.append('tenant_name', tenant_name);
            formData.append('tenant_admin', tenant_admin);
            formData.append('csrfmiddlewaretoken', this.csrfmiddlewaretoken);
            formData.append('service_type', service_type);
            formData.append('id',this.archive_id)
            formData.append('client_id',$('#id_client_id').val())
            formData.append('secret_id',$('#id_secret_id').val())
            formData.append('tenant_id',$('#id_tenant_id').val())
            $.ajax({
                type: "POST",
                url: "/api/v1/tenant/edit/",
                data: formData,
                success: (res) => {
                    var error = $('.error_notify')
                    error.addClass('alert-danger').removeClass('alert-success')
                    error.removeClass('d-none')
                    $('.fa-spinner').addClass('d-none')
                    if(res.status==1){
                        error.removeClass('alert-danger').addClass('alert-success')
                        error.html('Updated successfully')
                        dashboardApp.getData()
                    }
                    else if(res.status==2){
                        error.html('Organization admin does not exist')
                    }
                    else if(res.status==3){
                        error.html('Organization name not available')
                    }
                    else if(res.status==4){
                        error.html('Invalid string used for the organization name.')
                    }
                    setTimeout(function () {
                        error.addClass('d-none')
                        $('#settingsmodal').modal('hide')
                    }, 3000)
                },
                error: (err) => {
                },
                cache: false,
                contentType: false,
                processData: false
            })
        },
        tenantStatusEdit(tenant_status) {
            $.ajax({
                type: "POST",
                url: "/api/v1/tenant/status/edit/",
                data: {
                    id: this.archive_id,
                    tenant_status: tenant_status,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    
                },
                success: (res) => {
                    var error = $('.error_notify')
                    error.addClass('alert-danger').removeClass('alert-success')
                    error.removeClass('d-none')
                    $('.fa-spinner').addClass('d-none')
                    if(res.status==1){
                        error.removeClass('alert-danger').addClass('alert-success')
                        error.html('Updated successfully')
                        dashboardApp.getData()
                    }
                    setTimeout(function () {
                        error.addClass('d-none')
                        $('#tenantStatusModal').modal('hide')
                    }, 3000)
                },
                error: (err) => {
                }
            })
        },
        archiveAppointment() {
            $.ajax({
                url: `/api/v1/appointmentlist/archive/${this.archive_id}/`,
                type: "POST",
                data: {
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    $('#archive-model').modal('hide')
                    let model = null
                    $('#archive-model .btn.btn-primary').html('Archive')
                    $('#archive-model .btn.btn-primary').attr('disabled', false)
                    if (res.status != 1) {
                        model = $('#error-alert')
                    } else {
                        model = $('#success-alert')
                        $('#archive-view-button').html("Archived");
                        $('#archive-view-button').attr('disabled', true);
                        $('#archive-view-button').removeClass('btn btn-primary');
                        $('#archive-view-button').addClass('btn btn-secondary');
                        dashboardApp.getData()
                    }
                    $(model).removeClass('d-none')
                    setTimeout(function () {
                        $(model).addClass('d-none')
                    }, 3000)
                },
                error: function () {
                    $('#archive-model .btn.btn-primary').html('Archive')
                    $('#archive-model .btn.btn-primary').attr('disabled', false)
                    $('#archive-model').modal('hide')
                    $('#error-alert').removeClass('d-none')
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none')
                    }, 3000)
                }
            })
        },
        changeSortArrow(key) {

            if (this.table_sort[key] === "normal" || this.table_sort[key] === undefined) {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-up position-absolute" style="top: 9px;color: rgba(128, 128, 128, 0.8);"></i>
                <i class="fa fa-sort-down position-absolute" style="top: 10px;color: rgba(128, 128, 128, 0.8)"></i>
                `)
            } else if (this.table_sort[key] === "asc") {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-up position-absolute" style="top: 9px;color: #11B3AA;"></i>
                `)
            } else {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-down position-absolute" style="top: 10px;color:  #11B3AA"></i>
                `)
            }
        },
        renderModal(url, name) {
            $('#modal-view-title').html(name)
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: url,
                success: (res) => {
                    $('#modal-view-body').html(res)
                    if(dashboardApp.viewer!='')
                    {
                        $('#viewlock').addClass('badge badge-danger')
                        $('#viewlock').text('Viewing by: '+ dashboardApp.viewer)
                        $('#archive-view-button').prop('disabled',true)
                    }
                    else
                    {
                        $('#viewlock').text('Not Viewing')
                    }
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        FileValidate(event){
            if (event.target.files[0] !== undefined) {
                const file_name = event.target.files[0].name.split('.')
                const file_size = event.target.files[0].size
                var file_ext = file_name[file_name.length - 1];
                var is_wrong_file = false;
                if (file_ext!='png') {
                    let error = $('.error_notify')
                    error.html('File type not supported. Please upload PNG Files')
                    error.removeClass('alert-success').addClass('alert-danger')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                    }, 3000)
                    is_wrong_file = true;
                }
                if (file_size >= (500 * 1024)) {
                    let error = $('.error_notify')
                    error.html('File size not supported. Allowed maximum size is 500KB')
                    error.removeClass('alert-success').addClass('alert-danger')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                    }, 3000)
                    is_wrong_file = true;
                }
                if (is_wrong_file) {
                    return false
                }
                else {
                    return true
                }
            }
        }
    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    dashboardApp.init()
    document.dashboardApp = dashboardApp;
    
})