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
    
    const pStepForm = {
        searchKey: '',
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        memberData:[],
        member_status:'all',
        memberExpanded: [],
        memberID: null,
        memberIndex: null,
        consentID: null,
        consentType: [],
        consentTypeLoaded: [],
        consentHistoryID: null,
        consentAlterType: null,
        tenantList: [],
        init: function () {

            $('body').on('change','#id_ingress', function(e){
                var validate = pStepForm.FileValidate(e)
                if(validate){
                    $('#id_ingress_form .btn-primary').prop('disabled', false);
                }
                else{
                    $('#id_ingress_form .btn-primary').prop('disabled', true);
                }
                
            })

            $('body').on('change','input[name="consent_status"]', function(e){

                if($(this).prop('checked') === true){
                    $('#id_consent_status_radio_text').html("Yes")
                    $('.consent-form').removeClass('d-none')
                }
                else{
                    $('#id_consent_status_radio_text').html("No")
                    $('.consent-form').addClass('d-none')
                }
            })

            $('#edit-model').on('hidden.bs.modal', function (e) {
                $(this).find("input[type=number]").val('').end('').find("input[type=checkbox]")
                .prop("checked", "")
                .end();
            });

            $('body').on('click', '.expandCollapseArrow', function(e){
                if($('#expandCollapseArrow'+$(this).data('index')).hasClass('fa-arrow-right')){
                    $('#expandCollapseArrow'+$(this).data('index')).removeClass('fa-arrow-right').addClass('fa-arrow-down')
                    pStepForm.memberID = $(this).data('id')
                    pStepForm.memberIndex =  $(this).data('index')
                    if(!pStepForm.memberExpanded.includes(pStepForm.memberID)){
                        pStepForm.memberExpanded.push(pStepForm.memberID)
                        pStepForm.getMemberDetails();
                    }

                }
                else{
                    $('#expandCollapseArrow'+$(this).data('index')).removeClass('fa-arrow-down').addClass('fa-arrow-right')
                }
            })

            
            $('body').on('click', '.consentEdit', function(e){
                var b = moment();
                var a = moment($(this).data('consent_duration'));
                if(a.diff(b, 'days')+1 > -1){
                    $('#id_consent_duration').val(parseInt(a.diff(b, 'days')+1,10))
                    $('#consent_duration_val').val(parseInt(a.diff(b, 'days')+1,10))
                }
                else{
                    $('#id_consent_duration').val(0)
                    $('#consent_duration_val').val(0)
                }


                if($(this).data('consent_status') === true){
                    $("#id_consent_status").prop("checked", true); 
                    $('#id_consent_status_radio_text').html("Yes")
                    $('.consent-form').removeClass('d-none')
                }
                else{
                    $("#id_consent_status").prop("checked", false); 
                    $('#id_consent_status_radio_text').html("No")
                    $('.consent-form').addClass('d-none')
                }

                if($(this).data('consent_notify') === true){
                    $("#id_consent_notification").prop("checked", true); 
                    $('#id_consent_notification_radio_text').html("Yes")
                }
                else{
                    $("#id_consent_notification").prop("checked", false); 
                    $('#id_consent_notification_radio_text').html("No")
                }

                if($(this).data('sharing_for_research') === true){
                    $("#id_sharing_for_research").prop("checked", true); 
                    $('#id_sharing_for_research_radio_text').html("Yes")
                }
                else{
                    $("#id_sharing_for_research").prop("checked", false); 
                    $('#id_sharing_for_research_radio_text').html("No")
                }
                pStepForm.consentType = []
                const value = $(this).data('purpose_of_data_sharing').split(",");
                pStepForm.consentType.push(...value)
                pStepForm.consentID = $(this).data('id')
                pStepForm.consentHistoryID =  $(this).data('consent_history_id')
                pStepForm.consentAlterType = 'Update'
                pStepForm.getConsentTypes($(this).data('sharing_with_provider'));
                $('#edit-model .modal-title').html("Edit consent")
                var allOptions = '';
                pStepForm.tenantList.forEach(function(value,index,array){
                    allOptions += `<option value="${value['tenant__name']}">${value['tenant__name']}<options>`;
                });
                $(`select[name='sharing_with_provider']`).html(allOptions);
                $(`select[name='sharing_with_provider']`).val($(this).data('sharing_with_provider'));
                $(`select[name='sharing_with_provider']`).prop('disabled', true);
            })

            $('body').on('click', '.consentAdd', function(e){
                pStepForm.consentType = []
                pStepForm.consentAlterType = 'Add'
                pStepForm.memberID = $(this).data('id')
                pStepForm.memberIndex= $(this).data('index')
                pStepForm.getConsentTypes()
                $("#id_consent_status").prop("checked", true);
                $('#id_consent_status_radio_text').html("Yes")
                $('.consent-form').removeClass('d-none')
                $('#edit-model .modal-title').html("Add new consent")
                pStepForm.renderSelectBox('sharing_with_provider',pStepForm.tenantList)
                $(`select[name='sharing_with_provider']`).prop('disabled', false);
                $("#id_consent_status").prop("checked", true); 
                $('#id_consent_status_radio_text').html("Yes")
                $('#id_consent_duration').val(0)
                $('#consent_duration_val').val(0)
                $('.consent-form').removeClass('d-none')
                
              })

              $('body').on('change', '#id_sharing_with_provider', function(e){
                pStepForm.getConsentTypes($(this).val());
              })

              $('body').on('change', '#id_sharing_for_research', function(e){
                if($(this).prop('checked') === true){
                    $('#id_sharing_for_research_radio_text').html("Yes")
                }
                else{
                    $('#id_sharing_for_research_radio_text').html("No")
                }
              })

              $('body').on('change', '#id_consent_notification', function(e){
                if($(this).prop('checked') === true){
                    $('#id_consent_notification_radio_text').html("Yes")
                }
                else{
                    $('#id_consent_notification_radio_text').html("No")
                }
              })
            
            $('body').on('click', '.consentHistory', function(e){
                pStepForm.consentID = $(this).data('id')
                pStepForm.getConsentHistory()
            })

            $('body').on('input', '#id_consent_duration', function(e){
                if($(this).val()<0 || $(this).val() === ""){
                    $(this).val(0)
                }
                else{
                    $(this).val(parseInt( $(this).val(),10))
                }
                $('#consent_duration_val').val($(this).val())
            })

            $('body').on('input', '#consent_duration_val', function(e){
                if($(this).val()<0 || $(this).val() === ""){
                    $(this).val(0)
                }
                else if($(this).val() > 1000){
                    $(this).val(1000)
                }
                else{
                    $(this).val(parseInt( $(this).val(),10))
                }
                $('#id_consent_duration').val($(this).val())

            })
            $('body').on('click', '.edit_consent_button', function(e){
                let consent_status = 'false'
                if($('input[name="consent_status"]').prop('checked') === true){
                    consent_status = "true"
                }
                let consent_duration = $('#id_consent_duration').val();
                if(consent_duration > -1 && consent_duration !== ''){
                    consent_duration = (moment().add(consent_duration, 'days')).format('YYYY-MM-DD');
                }
                else{
                    consent_duration = 0
                }
                let consent_notify = 'false'
                if($('input[name="consent_notification"]').prop('checked') === true){
                    consent_notify = "true"
                }

                let sharing_for_research = 'false'
                if($('input[name="sharing_for_research"]').prop('checked') === true){
                    sharing_for_research = "true"
                }
                const sharing_with_provider = $('#id_sharing_with_provider').val();
                pStepForm.saveConsentStatus(consent_status,consent_duration,consent_notify,sharing_with_provider,sharing_for_research)
            })

            $('body').on('click', '.weekday', function(e) {
                const value = $(this).val();
                const index = pStepForm.consentType.indexOf(value);
            
                if ($(this).prop('checked') === true) {
                    if (index === -1) {
                        pStepForm.consentType.push(value);
                    }
                } else {
                    if (index !== -1) {
                        pStepForm.consentType.splice(index, 1);
                    }
                }
            });            

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
          $('#storeMemberData').html(`<tr><td colspan="19">
          <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
          Loading....
          </td></tr>`);
          $.ajax({
              type: "POST",
              url: "/consent/management/",
              data: {
                  csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                  filter:this.filter,
                  country_name: this.country_name,
                  limit: this.limit,
                  searchKey: this.searchKey,
                  page: this.page,
              },
              success: (res) => {
                  this.pagination = res.pagination
                  this.memberData = res.memberData
                  this.consentTypeLoaded = res.consentTypes
                  this.tenantList = res.tenantList
                  this.renderTable()
              },
              error: (err) => {
                  this.memberData = []
                  this.renderTable()
              }
          })
        },
        renderTable() {
          if (this.memberData.length > 0) {
              let html = ''
              this.memberData.forEach((element, index) => {
                  html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}"> 
                        <td><span><i style="cursor:pointer;font-size:15px;" id="expandCollapseArrow${index}" data-id="${element.id}" data-index="${index}" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}" title="View Consent" class="fa fa-solid fa-arrow-right text-primary expandCollapseArrow" fa-lg></i></span></td>
                        <td>${element.identifier}</td>
                        <td>${element.name_given}</td>
                        <td>${element.birthDate}</td>
                        <td>${element.email}</td>
                        <td>${element.contact_value}</td>
                        <td>${element.preferred_language}</td>
                        <td> <span class="consentAdd" data-id="${element.id}" data-index="${index}"><i style="cursor:pointer;font-size:15px;" data-toggle="modal" data-target="#edit-model"  title="Add new consent" class="fa fa-plus text-primary" fa-lg></i></span></td>
                    </tr>
                    <tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td colspan="14" style="padding:2px; margin:2px;">
                          <div class="collapse" id="collapse${index}">
                            <div class="card card-body" id="chevrontable${index}">
                              
                            </div>
                            </div>
                        </td>
                    </tr>`;
              })
              $('#storeMemberData').html(html);
              let pageLength = this.pagination.totalPages

              html = ''
              let separatorAdded = false
              for (let i = 0; i < pageLength; i++) {
                  if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                      html += `<li class="pagination" data-page="` + (i + 1) + `">` + (i + 1) + `</li>`;
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
              $('#storeMemberData').html('<tr><td colspan="19">No Data</td></tr>');
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
        ErrorDisplay(text){
            let error = $('.error_notify')
            error.html(text)
            error.removeClass('alert-success').addClass('alert-danger')
            error.removeClass('d-none')
            setTimeout(function () {
                error.addClass('d-none')
            }, 3000)
        },
        getMemberDetails() {
            $(`#chevrontable${this.memberIndex}`).html(`<tr><td colspan="19" class="row w-100 justify-content-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/api/v1/consent/individual/",
                data: {
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    id: this.memberID,
                },
                success: (res) => {
                    this.renderChevronTable(res.memberConsentList)
                },
                error: (err) => {
                }
            })
          },
          renderChevronTable(memberConsentList) {
            if (memberConsentList.length > 0) {
                let html = ''
                var b = moment();
                memberConsentList.forEach((element, index) => {
                    var a = moment(element.consent_duration);
                    html += `
                    <tr class="${index % 2 == 0 ? 'even' : 'odd'}"> 
                          <td>${element.consent_status === true ? `<span class="badge badge-success">Given</span>`:`<span class="badge badge-danger">Revoked</span>`}</td>
                          <td>${element.consent_duration !== '' &&  element.consent_duration !== null ? a.diff(b, 'days') > -1 ? a.diff(b, 'days')+1 +` Days (${moment(element.consent_duration,'YYYY-MM-DD').format('MM-DD-YYYY')})`: "0" : "0"}</td>
                          <td>${element.purpose_of_data_sharing}</td>
                          <td>${element.sharing_with_provider}</td>
                          <td>${element.sharing_for_research === true ? "Yes":"No"}</td>
                          <td>${element.created_datetime}</td>
                          <td>
                                <span class="consentHistory" data-id="${element.id}" ><i style="cursor:pointer;font-size:15px;" data-toggle="modal" data-target="#view-model"  title="View Consent History" class="fa fa-eye text-primary" fa-lg></i></span>
                                <span class="consentEdit" data-id="${element.id}" data-consent_history_id="${element.consent_history_id}" data-consent_status="${element.consent_status}" data-consent_duration="${element.consent_duration}" data-purpose_of_data_sharing="${element.purpose_of_data_sharing}" data-sharing_with_provider="${element.sharing_with_provider}" data-sharing_for_research="${element.sharing_for_research}" data-consent_notify="${element.consent_notify}"><i style="cursor:pointer;font-size:15px;" data-toggle="modal" data-target="#edit-model"  title="Edit Patient" class="fa fa-edit text-primary" fa-lg></i></span>
                          </td>
                      </tr>`;
                })
                let division = `
                    <div class="table-responsive">
                        <table class="table storebookTable noborder">
                            <thead>
                                <tr>
                                    <td>Consent&nbsp;Status</td>
                                    <td>Consent&nbsp;Duration<br/></td>
                                    <td>Purpose&nbsp;of&nbsp;Data&nbsp;Sharing</td>
                                    <td>Sharing&nbsp;with&nbsp;Provider</td>
                                    <td>Sharing&nbsp;for&nbsp;Research</td>
                                    <td>Created&nbsp;DateTime</td>
                                    <td >Action</td>
                                </tr>
                            </thead>
                            <tbody>
                                ${html}
                            </tbody>
                        </table>
                    </div>`
                $(`#chevrontable${this.memberIndex}`).html(division);
            }
            else{
                $(`#chevrontable${this.memberIndex}`).html('<tr><td colspan="14" class="row w-100 justify-content-center">No Data</td></tr>');
            }
        },
        saveConsentStatus(consentStatus=null,consentDuration=null,consentNotify=null,sharing_with_provider=null,sharing_for_research=null) {
            $.ajax({
                type: "POST",
                url: "/api/v1/consent/saveupdate/",
                data: {
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    id: this.consentID,
                    consentHistoryID: this.consentHistoryID,
                    consentType: this.consentType,
                    typeofSubmit: this.consentAlterType,
                    memberID: this.memberID,
                    consentStatus: consentStatus,
                    consentDuration: consentDuration,
                    consentNotify: consentNotify,
                    sharingWithProvider: sharing_with_provider,
                    sharingForResearch: sharing_for_research,
                },
                success: (res) => {
                    $('#edit-model').modal('hide')
                    if(res.status === "0"){
                        this.getMemberDetails();
                        $('#success-alert').removeClass('d-none')
                        setTimeout(function () {
                         $('#success-alert').addClass('d-none')
                     }, 3000)
                     }
                     else{
                         $('#error-alert').removeClass('d-none')
                         setTimeout(function () {
                             $('#error-alert').addClass('d-none')
                         }, 3000)
                     }
                },
                error: (err) => {
                }
            })
        },
        getConsentHistory() {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/api/v1/consent/history/${this.consentID}/`,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        getConsentTypes(providerName) {
            $('#consent_type_selector').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "POST",
                url: `/api/v1/consent-type/list/`,
                data: {
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    tenant_name: providerName
                },
                success: (res) => {
                    let consentRadios = ''
                    res.consentTypes.forEach((element, index) => {
                        const isChecked = pStepForm.consentType.some(arr => arr.includes(element.field_value));
                        consentRadios += `
                        <input type="checkbox" id="${element.field_value}" name="consent-types" value="${element.field_value}" class="weekday" ${isChecked ? 'checked' : ''} />
                        <label for="${element.field_value}" class="px-2 w-25 text-overflow h-auto" title="${element.field_value}">${element.field_value}</label>`;
                    })
                    $('#consent_type_selector').html(consentRadios);
                },
                error: () => {
                    $('#consent_type_selector').html('An error occurred while fetching data, Try again')
                }
            })
        },
        renderSelectBox: function(nameOfSelect, choices) {
            var allOptions = '';
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value['tenant__name']}">${value['tenant__name']}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
        
    }
    pStepForm.init()

    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });

    $('.countbox').click(function () {
        let status = $(this).data('status')
        if (status !== pStepForm.member_status) {
            $('.countbox').removeClass('border-active')
            $(this).addClass('border-active')
            pStepForm.member_status = status
            pStepForm.page = 1
            pStepForm.getData()
        }
    })

    $('#searchKey').keyup(function () {
      pStepForm.searchKey = $(this).val()
      pStepForm.page = 1
      pStepForm.getData()
    });

    $('#limit').change(function () {
        pStepForm.limit = $(this).val()
        pStepForm.page = 1
        pStepForm.getData()
    })
    $("body").on('click', '.pagination', function () {
        $(".pagination").removeClass("active");
        $(this).addClass('active');
        pStepForm.page = $(this).data("page");
        pStepForm.getData()
    });
});