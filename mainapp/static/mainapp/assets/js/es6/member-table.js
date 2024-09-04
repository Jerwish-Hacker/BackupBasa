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
        email_address: /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,9})/,
        date_of_birth: /\d{2}\/\d{2}\/\d{4}/,
    }

    const pStepForm = {
        data: [],
        searchKey: '',
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        noValidate: [],
        filter:null,
        outreachData:[],
        memberData:[],
        patient_id:'',
        member_status:'all',
        init: function () {
            
            $('body').on('click', 'span.patientdelete', function () {
                pStepForm.patient_id = $(this).data('id')
                $("#delete_patient_name").html($(this).data('name'))
            })
            $('body').on('click', 'span.activatelogin', function () {
                pStepForm.patient_id = $(this).data('id')
                $("#active_login_email").html($(this).data('email'))
                $("#id_patient_login_email").val($(this).data('email'))
            })
            $('body').on('click', 'span.patientedit', function () {
                var patient =pStepForm.memberData[$(this).data('index')]
                pStepForm.GetStates(patient['address_country'],patient['address_state'])
                pStepForm.patient_id = $(this).data('id')
                pStepForm.type_of_submit = 'update'
                $('.update_button').removeClass('d-none')
                $('.add_button').addClass('d-none')
                $('.edit_button').addClass('d-none')
                $("#id_patient_country").val(patient['address_country']);
                $('#id_patient').val(patient['identifier'])
                $("#id_patient_system").val(patient['identifier_system'])
                $("#id_patient_given_name").val(patient['name_given']);
                $("#id_patient_family_name").val(patient['name_family']);
                $("#id_patient_name_prefix").val(patient['name_prefix'])
                $("#id_patient_name_suffix").val(patient['name_suffix']);
                $("#id_patient_contact").val(patient['contact_value']);
                $("#id_patient_contact_use").val(patient['contact_use']);
                $("#id_patient_gender").val(patient['gender']);
                $("#id_patient_dob").val(patient['birthDate']);
                $("#id_patient_address_use").val(patient['address_use']);
                $("#id_patient_Line").val(patient['address_line']);
                $("#id_patient_city").val(patient['address_city']);
                $("#id_patient_district").val(patient['address_district']);
                updateStates();
                $("#id_patient_state").val(patient['address_state']);
                $("#id_patient_postalcode").val(patient['address_postalCode']);
                //$("#id_patient_photo").val(patient['photo']);
                $("#id_patient_photo_view").attr("src",patient['photo']);
                $("#id_patient_active").val(patient['active']);
                $("#id_email").val(patient['email']);
                $("#id_preferred_language").val(patient['preferred_language']);
                // let choice
                // if(patient['active']){
                //     choice = "active"
                // }
                // else{
                //     choice = "inactive"
                // }
                // $('#id_patient_active').val(choice)

                var patient = patient['active']
                let choice = patient ? "active" : "inactive";
                $('input[name=patient_active][value=' + choice + ']').prop('checked', true);
                $('#patient-title').html("Edit Member")
            })
            $('body').on('click', '.add_member', function () {
                pStepForm.patient_id = ''
                pStepForm.type_of_submit = 'add'
                $('.add_button').removeClass('d-none')
                $('.update_button').addClass('d-none')
                $('.edit_button').addClass('d-none')
                $('#patient-title').html("Add Member")
                $('#id_patient').val('')
                $("#id_patient_system").val('')
                $("#id_patient_given_name").val('');
                $("#id_patient_family_name").val('');
                $("#id_patient_name_prefix").val('')
                $("#id_patient_name_suffix").val('');
                $("#id_patient_contact").val('');
                $("#id_patient_contact_use").val('');
                $("#id_patient_gender").val('');
                $("#id_patient_dob").val('');
                $("#id_patient_address_use").val('');
                $("#id_patient_Line").val('');
                $("#id_patient_city").val('');
                $("#id_patient_district").val('');
                $("#id_patient_state").html('');
                $("#id_patient_postalcode").val('');
                $("#id_patient_country").val('');
                $("#id_patient_photo").val('');
                $("#id_patient_active").val('');
                $("#id_email").val('');
                $("#id_preferred_language").val('');

            })

            $('body').on('change','#id_ingress', function(e){
                var validate = pStepForm.FileValidate(e)
                if(validate){
                    $('#id_ingress_form .btn-primary').prop('disabled', false);
                }
                else{
                    $('#id_ingress_form .btn-primary').prop('disabled', true);
                }
                
            })
            $('body').on('submit','#id_ingress_form',function(e){
                e.preventDefault()
                $('.fa-spinner').removeClass('d-none')
                $('.upload_text').removeClass('d-none')
                var formData = new FormData(this);
                $.ajax({
                    type: "POST",
                    url: "/outreach/api/v1/outreach/ingress/",
                    data: formData,
                    success: (res) => {
                        var error = $('.error_notify')
                        error.addClass('alert-danger').removeClass('alert-success')
                        error.removeClass('d-none')
                        $('.upload_text').addClass('d-none')
                        $('.fa-spinner').addClass('d-none')
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
                            $('#settingsmodal').modal('hide')
                        }, 3000)
                    },
                    error: (err) => {
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                })
            })

            $('#view-model').on('hidden.bs.modal', function (e) {
                $(this)
                  .find("input,textarea,select")
                     .val('')
                     .end()
                  .find("input[type=checkbox], input[type=radio]")
                     .prop("checked", "")
                     .end();
                $('#collapseExample').removeClass('show')
                $('#patientrequestedtocallback').removeClass('show')
                $('#patientrefusedservice').removeClass('show')
                $('#completed_else_where_collapse').removeClass('show')
                $('#other').removeClass('show')
            })

            pStepForm.getData()
        },
        getData() {
          $('#storebookingData').html(`<tr><td colspan="19">
          <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
          Loading....
          </td></tr>`);
          $.ajax({
              type: "POST",
              url: "/member/patients/",
              data: {
                  csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                  filter:this.filter,
                  country_name: this.country_name,
                  limit: this.limit,
                  searchKey: this.searchKey,
                  page: this.page,
                  member_status: this.member_status,
              },
              success: (res) => {
                  this.data = res.data
                  this.pagination = res.pagination
                  this.memberData = res.memberData
                  this.renderTable()
              },
              error: (err) => {
                  this.data = []
                  this.renderTable()
              }
          })
        },
        renderTable() {
          if (this.memberData.length > 0) {
              let html = ''
              this.memberData.forEach((element, index) => {
                let active = ``
                if(element['active'] == true ){
                    active = `<span class="badge badge-success">Active</span>`
                }
                else{
                    active = `<span class="badge badge-secondary">Inactive</span>`
                }
                  html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}"> 
                    <td>${element['name_given']}</td>
                    <td>${element['name_family']}</td>
                    <td>${element['name_prefix']}</td>
                    <td>${element['name_suffix']}</td>
                    <td>${element['contact_value']}</td>
                    <td>${element['contact_use']}</td>
                    <td>${element['gender']}</td>
                    <td>${element['birthDate']}</td>
                    <td>${element['email']}</td>
                    <td>${active}</td>
                    <td>
                        <span class="patientedit ml-1" data-index="${index}" data-id="${element.identifier}" data-name="${element.name_given}"  data-birthdate="${element.birthDate}"><i style="cursor:pointer;font-size:15px;" data-toggle="modal" data-target="#edit-model"  title="Edit Member" class="fa fa-edit text-secondary" fa-lg></i></span>
                        <span class="activatelogin ml-1" data-index="${index}" data-id="${element.identifier}" data-email="${element.email}" ><i style="cursor:pointer;font-size:15px;" data-toggle="modal" data-target="#activatelogin-model"  title="Activate Login" class="fa fa-user text-secondary" fa-lg></i></span>
                    </td>
                    
                    </tr>`;
              })
              $('#storebookingData').html(html);
              let pageLength = this.pagination.totalPages

              html = ''
              let separatorAdded = false
              for (let i = 0; i < pageLength; i++) {
                  if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                      html += `<li class="pagination1" data-page="` + (i + 1) +`" 
                          data-date_start="`+ 'date_start' + `"
                          data-searchKey="`+ 'searchKey' + `">` + (i + 1) + `</li>`;
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
              $('#storebookingData').html('<tr><td colspan="19">No Data</td></tr>');
              $('#holder').html('')
          }
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
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('error')
            })
        },
        datepickerRender: function(enabled_date){
            $("#id_date").val('')
            $("#id_date").datepicker("destroy");
            $("#id_date").datepicker({
                changeMonth: true,
                changeYear: true,
                minDate: new Date(),
                beforeShowDay: function(date) {
                    var day = date.getDay();
                    var string = jQuery.datepicker.formatDate('yy-mm-dd', date)
                    return [ enabled_date.indexOf(string) != -1];
                },
            })
            $( "#id_date" ).datepicker("refresh");
        },
        ErrorDisplay(text){
            let error = $('.error_notify')
            error.html(text)
            error.removeClass('alert-success').addClass('alert-danger')
            error.removeClass('d-none')
            setTimeout(function () {
                error.addClass('d-none')
            }, 3000)
        },
        GetStates(country,state){
            if(country !=='')
            {
                $.get({
                    url: '/state-list/',
                    data: { country_code: country },
                    success: function (data, textStatus, jqXHR) {
                        var states = [['', 'Select State'],].concat(data.states);
                        var optionsHtml = ''
                        states.forEach(function (state) {
                            optionsHtml += `<option value="${state[1]}">${state[1]}</option>`
                        });
                        $(stateLoader.stateSelector).html($(optionsHtml))
                        $(stateLoader.stateSelector).val(state)
                    }
                })
            }
        },
        FileValidate(event){
            if (event.target.files[0] !== undefined) {
                let file_name = $('input[name=ingress]').val().split('.')
                const file_size = event.target.files[0].size
                var file_ext = file_name[file_name.length - 1].toLowerCase();
                var is_wrong_file = false;
                if (file_ext!='csv' & file_ext!='xlsx') {
                    pStepForm.ErrorDisplay('File type not supported. Please upload csv,xlsx files')
                    is_wrong_file = true;
                }
                if (file_size >= (500 * 1024*1024)) {
                    pStepForm.ErrorDisplay('File size not supported. Allowed maximum size is 5 MB')
                    is_wrong_file = true;
                }
                if (is_wrong_file) {
                    $('input[name=ingress]').val('')
                    return false
                }
                else {
                    return true
                }
            }
        }
    }
    pStepForm.init()

    $("body").on('change' ,'#id_member_status', function () {
        pStepForm.member_status = $(this).val()
        pStepForm.page = 1
        pStepForm.getData()
    })

    $('#searchBooking').keyup(function () {
      pStepForm.searchKey = $(this).val()
      pStepForm.page = 1
      pStepForm.getData()
    });

    $('#limit').change(function () {
        pStepForm.limit = $(this).val()
        pStepForm.page = 1
        pStepForm.getData()
    })
    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        pStepForm.page = $(this).data("page");
        pStepForm.getData()
    });
    $('body').on('submit','#id_patient_activate_user_form',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        formData.append('id',pStepForm.patient_id)
        formData.append('csrfmiddlewaretoken',pStepForm.csrfmiddlewaretoken)
        $('.fa-spinner').removeClass('d-none')
        $('#activatelogin-model .confirm_button').prop('disabled',true)
        $.ajax({
            url:'api/v1/patient/createuser/post/',
            type: 'POST',
            data: formData,
            success: function (res) {
                $('.fa-spinner').addClass('d-none')
                let error = $('#error-display-near-save-activate')
                $('#activatelogin-model .confirm_button').prop('disabled',false)
                if(res.status==1){
                    error.html('Created Successfully')
                    error.removeClass('alert-danger').addClass('alert-success')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                        $('#activatelogin-model').modal('hide')
                    }, 1000)
                    pStepForm.getData()
                }
                else if(res.status==2){
                    error.html('ID already exists')
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

            },
            error:function(e){
                $('.fa-spinner').addClass('d-none')
            },
            cache: false,
            contentType: false,
            processData: false
        });
    });
    $('body').on('submit','#id_patient_form',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        if(formData.get('patient_gender') !== "" && formData.get('patient_gender') !== "male" && formData.get('patient_gender') !== "female" && formData.get('patient_gender') !== "other" && formData.get('patient_gender') !== "unknown"){
            let error = $('#error-display-near-save')
            error.html('Invalid gender value!')
                    error.removeClass('alert-success').addClass('alert-danger')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                    }, 3000)
            return
        }
        if(formData.get('email') === ""){
            let error = $('#error-display-near-save')
            error.html('Please enter email')
            error.removeClass('alert-success').addClass('alert-danger')
            error.removeClass('d-none')
            setTimeout(function () {
                error.addClass('d-none')
            }, 3000)
            return
        }
        if(formData.get('email') !== ""){
            if (!validation['email_address'].test(formData.get('email'))) {
                let error = $('#error-display-near-save')
                error.html('Please enter valid email')
                error.removeClass('alert-success').addClass('alert-danger')
                error.removeClass('d-none')
                setTimeout(function () {
                    error.addClass('d-none')
                }, 3000)
                return
            }
        }
        if(formData.get('patient_state') == 'Select State' || formData.get('patient_state') == null){
            formData.set('patient_state','')
        }
        if(formData.get('patient_country') == null){
            formData.set('patient_country','')
        }
        formData.append('id',pStepForm.patient_id)
        formData.append('type_of_submit',pStepForm.type_of_submit)
        formData.append('csrfmiddlewaretoken',pStepForm.csrfmiddlewaretoken)
        $('.fa-spinner').removeClass('d-none')
        $('#edit-model .update_button').prop('disabled',true)
        $('#edit-model .add_button').prop('disabled',true)
        $.ajax({
            url:'/api/v1/patient/edit/post/',
            type: 'POST',
            data: formData,
            success: function (res) {
                $('.fa-spinner').addClass('d-none')
                let error = $('#error-display-near-save')
                $('#edit-model .update_button').prop('disabled',false)
                $('#edit-model .add_button').prop('disabled',false)
                if(res.status==1){
                    error.html('Updated Successfully')
                    error.removeClass('alert-danger').addClass('alert-success')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                        $('#edit-model').modal('hide')
                    }, 1000)
                    pStepForm.getData()
                }else if(res.status==2){
                    error.html('ID already exists')
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

            },
            error:function(e){
                $('.fa-spinner').addClass('d-none')
                console.log('e');
            },
            cache: false,
            contentType: false,
            processData: false
        });
    });
    $('body').on('submit','#id_patient_delete_form',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        formData.append('id',pStepForm.patient_id)
        formData.append('csrfmiddlewaretoken',pStepForm.csrfmiddlewaretoken)
        $('.fa-spinner').removeClass('d-none')
        $('#delete-model .delete_button').prop('disabled',true)
        $.ajax({
            url:'/api/v1/patient/delete/post/',
            type: 'POST',
            data: formData,
            success: function (res) {
                $('.fa-spinner').addClass('d-none')
                let error = $('#error-display-near-save-delete')
                $('#delete-model .delete_button').prop('disabled',false)
                if(res.status==1){
                    error.html('Deleted Successfully')
                    error.removeClass('alert-danger').addClass('alert-success')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                        $('#delete-model').modal('hide')
                    }, 1000)
                    pStepForm.getData()
                }
                else{
                    error.html('Something happened try again later')
                    error.removeClass('alert-success').addClass('alert-danger')
                    error.removeClass('d-none')
                    setTimeout(function () {
                        error.addClass('d-none')
                    }, 3000)
                }

            },
            error:function(e){
                $('.fa-spinner').addClass('d-none')
            },
            cache: false,
            contentType: false,
            processData: false
        });
    });
    const stateLoader = {
        stateSelector: '#id_patient_state',
        countrySelector: '#id_patient_country',
        init: function () {
            $(this.countrySelector).change(function () {
                var selectedCountryCode = $(this).val();
                pStepForm.GetStates(selectedCountryCode,'Select State')
            });
        }
    };
    stateLoader.init();
})