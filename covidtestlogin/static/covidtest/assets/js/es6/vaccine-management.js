$(document).ready(function () {
    const dashboardApp = {
        data: [],
        searchKey: '',
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        type_of_submit: null,
        id: null,
        employee_table_fields: [],
        init() {

            this.getData()

            $('body').on('click', '#id_vaccine_add_button', function () {
                dashboardApp.type_of_submit='add'
                $('#vaccine-add-edit-model-title').html('Add Vaccine')
                $('#id_vaccine_crud').html('<i class="fa fa-spinner fa-spin d-none"></i> Add')
                $('input[name=vaccine_name]').val('')
                $('input[name=vaccine_title]').val('')
                $('textarea[name=vaccine_text]').val('')
                $('input[name=acknowledgement_title]').val('')
                $('textarea[name=acknowledgement_text]').val('')
            })

            $('#id_acknowledgement_text').on('focus', function() {
                $('#id_acknowledgement_text_info').removeClass('d-none');
              });
          
              $('#id_acknowledgement_text').on('blur', function() {
                $('#id_acknowledgement_text_info').addClass('d-none');
              });
              id_vaccine_text
              $('#id_vaccine_text').on('focus', function() {
                $('#id_vaccine_text_info').removeClass('d-none');
              });
          
              $('#id_vaccine_text').on('blur', function() {
                $('#id_vaccine_text_info').addClass('d-none');
              });
            $('body').on('click', '.edit_icon', function () {
                dashboardApp.id = $(this).data('id')
                dashboardApp.type_of_submit = 'update'
                $('#id_vaccine_crud').html('<i class="fa fa-spinner fa-spin d-none"></i> Update')
                $('#vaccine-add-edit-model-title').html('Edit Vaccine')
                $('input[name=vaccine_name]').val($(this).data('name'))
                $('input[name=vaccine_title]').val($(this).data('title'))
                $('textarea[name=vaccine_text]').val($(this).data('text'))
                $('input[name=acknowledgement_title]').val($(this).data('acknowledgement_title'))
                $('textarea[name=acknowledgement_text]').val($(this).data('acknowledgement_text'))
                $('input[name=checkbox_one]').val($(this).data('checkbox_one_text'))
                $('input[name=checkbox_two]').val($(this).data('checkbox_two_text'))
                $('input[name=checkbox_three]').val($(this).data('checkbox_three_text'))
                if($(this).data('file_upload_enable_checkbox_one')==false){
                    $('#id_file_upload_enable_checkbox_one').prop('checked',false)
                }
                else{
                    $('#id_file_upload_enable_checkbox_one').prop('checked',true)
                }
                if($(this).data('file_upload_enable_checkbox_two')==false){
                    $('#id_file_upload_enable_checkbox_two').prop('checked',false)
                }
                else{
                    $('#id_file_upload_enable_checkbox_two').prop('checked',true)
                }
                if($(this).data('file_upload_enable_checkbox_three')==false){
                    $('#id_file_upload_enable_checkbox_three').prop('checked',false)
                }
                else{
                    $('#id_file_upload_enable_checkbox_three').prop('checked',true)
                }
                if($(this).data('is_file_upload_one_required')==false){
                    $('#id_file_upload_required_checkbox_one').prop('checked',false)
                }
                else{
                    $('#id_file_upload_required_checkbox_one').prop('checked',true)
                }
                if($(this).data('is_file_upload_two_required')==false){
                    $('#id_file_upload_required_checkbox_two').prop('checked',false)
                }
                else{
                    $('#id_file_upload_required_checkbox_two').prop('checked',true)
                }
                if($(this).data('is_file_upload_three_required')==false){
                    $('#id_file_upload_required_checkbox_three').prop('checked',false)
                }
                else{
                    $('#id_file_upload_required_checkbox_three').prop('checked',true)
                }
                let file_type = $(this).data('file_type').split(',')
                file_type.forEach(element => {
                    $('input[name='+element+'_file]').prop('checked',true)
                });
                $('input[name=file_size_checkbox][value='+$(this).data('file_size')+']').prop('checked',true)
                $('input[name=maximum_file_upload][value='+$(this).data('max_file_upload')+']').prop('checked',true)
                if($(this).data('published')==false){
                    $('#id_vaccine_status_not_published').prop('checked',true)
                }
                else{
                    $('#id_vaccine_status_published').prop('checked',true)
                }
            })

            $('body').on('click', '.delete_icon', function () {
                dashboardApp.id = $(this).data('id')
                dashboardApp.type_of_submit = 'delete'
                $('#id_delete_vaccine_text').html(`Do you want to delete ${$(this).data('name')}?. <br><label class="pt-2" style="color:red">Once deleted all the data associated with it get removed and cannot be recovered</label>`)
            })

            $('body').on('click', '#delete-vaccine-model .btn-danger', function () {
                dashboardApp.vaccineCRUD(null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null)
            })

            $('body').on('click', '#id_vaccine_crud', function () {
                const vaccine_name = $('input[name=vaccine_name]').val()
                const vaccine_title = $('input[name=vaccine_title]').val()
                const vaccine_text = $('textarea[name=vaccine_text]').val()
                const acknowledgement_title = $('input[name=acknowledgement_title]').val()
                const acknowledgement_text = $('textarea[name=acknowledgement_text]').val()
                const checkbox_one_text = $('input[name=checkbox_one]').val()
                const checkbox_two_text = $('input[name=checkbox_two]').val()
                const checkbox_three_text = $('input[name=checkbox_three]').val()
                let file_upload_enable_checkbox_one = false
                if($('input[name="file_upload_enable_checkbox_one"]').prop('checked')==true){
                    file_upload_enable_checkbox_one = true
                }
                let file_upload_enable_checkbox_two = false
                if($('input[name="file_upload_enable_checkbox_two"]').prop('checked')==true){
                    file_upload_enable_checkbox_two = true
                }
                let file_upload_enable_checkbox_three = false
                if($('input[name="file_upload_enable_checkbox_three"]').prop('checked')==true){
                    file_upload_enable_checkbox_three = true
                }
                let is_file_upload_one_required = false
                if(file_upload_enable_checkbox_one){
                    if($('input[name="file_upload_required_checkbox_one"]').prop('checked')==true){
                        is_file_upload_one_required = true
                    }
                }
                let is_file_upload_two_required = false
                if(file_upload_enable_checkbox_two){
                    if($('input[name="file_upload_required_checkbox_two"]').prop('checked')==true){
                        is_file_upload_two_required = true
                    }
                }
                let is_file_upload_three_required = false
                if(file_upload_enable_checkbox_three){
                    if($('input[name="file_upload_required_checkbox_three"]').prop('checked')==true){
                        is_file_upload_three_required = true
                    }
                }
                let published = false
                if($('input[name="vaccine_status"]:checked').val()=='published'){
                    published = true
                }
                let file_type = []
                if($('input[name="pdf_file"]').prop('checked')==true){
                    file_type.push('pdf')
                }
                if($('input[name="jpg_file"]').prop('checked')==true){
                    file_type.push('jpg')
                }
                if($('input[name="png_file"]').prop('checked')==true){
                    file_type.push('png')
                }
                let file_max_size = parseInt($('input[name="file_size_checkbox"]:checked').val(),10)
                let max_file_upload = parseInt($('input[name="maximum_file_upload"]:checked').val(),10)
                var validation = dashboardApp.validate('#vaccine-add-edit-model')
                if(validation){
                   dashboardApp.vaccineCRUD(vaccine_name,vaccine_title,vaccine_text,acknowledgement_text,acknowledgement_title,published,checkbox_one_text,checkbox_two_text,checkbox_three_text,file_upload_enable_checkbox_one,file_upload_enable_checkbox_two,file_upload_enable_checkbox_three,file_type,file_max_size,max_file_upload,is_file_upload_one_required,is_file_upload_two_required,is_file_upload_three_required)
                }
            })

            $('body').on('keyup', '#id_acknowledgement_text',function (e) {
                let fields = []
                dashboardApp.employee_table_fields.forEach((element,index)=>{
                    fields.push(`${element}`)
                })
                $(this).autocomplete({
                    appendTo: "#vaccine-add-edit-model",
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

            $('body').on('keyup','#id_vaccine_text',function (e) {
                let fields = []
                dashboardApp.employee_table_fields.forEach((element,index)=>{
                    fields.push(`${element}`)
                })
                $(this).autocomplete({
                    appendTo: "#vaccine-add-edit-model",
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
            
        },
        renderTable() {
            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.name}</td>
                        <td>${element.is_published==false?'<span class="badge badge-danger">Not Published</span>':'<span class="badge badge-success">Published</span>'}</td>
                        <td>${element.created_by}</td>
                        <td>${element.created_datetime}</td>
                        <td><span class="hover-icons edit_icon" data-id="${element.id}" data-name="${element.name}" data-title="${element.title}" data-text="${element.text}" data-acknowledgement_title="${element.acknowledgement_title}" data-acknowledgement_text="${element.acknowledgement_text}" data-published="${element.is_published}"  data-checkbox_one_text="${element.checkbox_one_text}"  data-checkbox_two_text="${element.checkbox_two_text}"  data-checkbox_three_text="${element.checkbox_three_text}"  data-file_upload_enable_checkbox_one="${element.checkbox_one_file_upload}" data-file_upload_enable_checkbox_two="${element.checkbox_two_file_upload}" data-file_upload_enable_checkbox_three="${element.checkbox_three_file_upload}" data-file_type=${element.file_type} data-file_size=${element.max_file_size} data-max_file_upload="${element.max_file_upload}" data-is_file_upload_one_required="${element.is_file_upload_one_required}" data-is_file_upload_two_required="${element.is_file_upload_two_required}" data-is_file_upload_three_required="${element.is_file_upload_three_required}" data-toggle="modal" data-target="#vaccine-add-edit-model"><i class="fa fa-edit text-primary" aria-hidden="true" title="Edit" style="width:18px;height:18px"></i></span><span class="hover-icons delete_icon ml-2" data-id="${element.id}" data-name="${element.name}" data-toggle="modal" data-target="#delete-vaccine-model"><i class="fa fa-trash text-danger" aria-hidden="true" title="Delete" style="width:18px;height:18px"></i></span></td>
                    </tr>`
                })
                $('#storebookingData').html(html);

            } else {
                $('#storebookingData').html('<tr><td colspan="9">No Data</td></tr>');
            }
        },
        getData() {
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/vaccine/api/v1/vaccine-management/list/",
                data: {
                    searchKey: this.searchKey,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status==1){
                        this.data = res.data
                        this.employee_table_fields = res.fields
                    }
                    this.renderTable()
                },
                error: (err) => {
                    this.data = []
                    this.employee_table_fields = []
                    this.renderTable()
                }
            })
        },
        vaccineCRUD(vaccine_name,vaccine_title,vaccine_text,acknowledgement_text,acknowledgement_title,published,checkbox_one_text,checkbox_two_text,checkbox_three_text,file_upload_enable_checkbox_one,file_upload_enable_checkbox_two,file_upload_enable_checkbox_three,file_type,file_max_size,max_file_upload,is_file_upload_one_required,is_file_upload_two_required,is_file_upload_three_required) {
            if(dashboardApp.type_of_submit=='delete'){
                $('#delete-vaccine-model .fa-spinner').removeClass('d-none')
            }
            else if(dashboardApp.type_of_submit=='add' || dashboardApp.type_of_submit=='update'){
                $('#id_vaccine_crud .fa-spinner').removeClass('d-none')
            }
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/vaccine/api/v1/vaccine-management/crud/",
                data: {
                    id: dashboardApp.id,
                    vaccine_name: vaccine_name,
                    vaccine_title: vaccine_title,
                    vaccine_text: vaccine_text,
                    acknowledgement_text:acknowledgement_text,
                    acknowledgement_title:acknowledgement_title,
                    checkbox_one_text: checkbox_one_text,
                    checkbox_two_text: checkbox_two_text,
                    checkbox_three_text: checkbox_three_text,
                    file_upload_enable_checkbox_one: file_upload_enable_checkbox_one,
                    file_upload_enable_checkbox_two: file_upload_enable_checkbox_two,
                    file_upload_enable_checkbox_three: file_upload_enable_checkbox_three,
                    'file_type[]': file_type,
                    file_max_size: file_max_size,
                    max_file_upload: max_file_upload,
                    published: published,
                    type_of_submit: dashboardApp.type_of_submit,
                    is_file_upload_one_required: is_file_upload_one_required,
                    is_file_upload_two_required: is_file_upload_two_required,
                    is_file_upload_three_required: is_file_upload_three_required,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    $('#vaccine-add-edit-model-error').addClass('d-none')
                    let modal = ''
                    if(dashboardApp.type_of_submit=='delete'){
                        modal = $('#delete-vaccine-model')
                        $('#delete-vaccine-model .fa-spinner').addClass('d-none')
                    }
                    else{
                        $('#id_vaccine_crud .fa-spinner').addClass('d-none')
                        modal = $('#vaccine-add-edit-model')
                    }
                    let alert = $('#server-alerts')
                    if(res.status==1){
                        modal.modal('hide')
                        alert.removeClass('d-none')
                        alert.removeClass('alert-danger')
                        alert.addClass('alert-success')
                        alert.html('Updated Successfully')
                        this.getData()
                    }
                    else if(res.status==2){
                        $('#vaccine-add-edit-model-error').removeClass('d-none')
                        $('#vaccine-add-edit-model-error').html("Vaccine name/App name already exists")
                        setTimeout(function () {
                            $('#vaccine-add-edit-model-error').addClass('d-none')
                        }, 3000)
                        this.renderTable()
                    }
                    else{
                        modal.modal('hide')
                        alert.addClass('alert-danger')
                        alert.removeClass('alert-success')
                        alert.html('Something happened. Please try again later')
                        this.renderTable()
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                },
                error: (err) => {
                    this.data = []
                    this.renderTable()
                }
            })
        },
        renderModal() {
            $('#modal-view-title').html(dashboardApp.name)
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/vaccine/dashboard/${dashboardApp.user_id}/`,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        renderSelectBox: function(nameOfSelect, choices) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
        validate: function (modal) {
            const all_input_elements = $(modal).find('input')
            const all_textarea_elements = $(modal).find('textarea')
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('is-invalid')
            }
            for (let i = 0; i < all_textarea_elements.length; i++) {
                $(all_textarea_elements[i]).removeClass('is-invalid')
            }
            const error_elements = []
            for (let i = 0; i < all_input_elements.length; i++) {
                const input_name = $(all_input_elements[i]).attr('name')
                if($(all_input_elements[i]).val()==""){
                    error_elements.push(all_input_elements[i])
                }
            }
            for (let i = 0; i < all_textarea_elements.length; i++) {
                const input_name = $(all_textarea_elements[i]).attr('name')
                if($(all_textarea_elements[i]).val()==""){
                    error_elements.push(all_textarea_elements[i])
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
    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    dashboardApp.init()
    document.dashboardApp = dashboardApp;

    $('#searchKey').keyup(function () {
        dashboardApp.searchKey = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    });
    
})