// https://stackoverflow.com/a/41992719
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
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
        date_of_birth: /\d{2}\/\d{2}\/\d{4}/
    };

    const pStepForm = {
        data: [],
        country_name: 'all',
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        searchKey: '',
        limit: 50,
        archived: '',
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        appointment_type: 'Cervical Cancer Screening',
        noValidate: [],
        archive_id: null,
        filter: null,
        notification_popup: false,
        outreach: $('input[name=outreach_name]').val(),
        outreachData: [],
        init: function () {

            this.noValidate.push('new_phone_number');
            this.noValidate.push('preferred_language');

            $('#id_date').prop('disabled', true);
            $('#id_time').prop('disabled', true);
            $('#id_date').css({ 'background': '#dddddd', 'opacity': '0.5' });
            $('#id_time').css({ 'background': '#dddddd', 'opacity': '0.5' });

            $('select[name="filter_appointment_call_back"]').change(function () {
                let value = $(this).val();
                if (value !== '') {
                    pStepForm.filter = value;
                    $('.datepickerhidden').removeClass('d-none');
                    pStepForm.getData();
                } else {
                    $('.datepickerhidden').addClass('d-none');
                    pStepForm.filter = null;
                    let start = moment();
                    let end = moment();
                    pStepForm.setDate(start, end);
                }
            });

            $('select[name="location"]').change(function () {
                var location = $("#id_location").val();
                if (location !== '') {
                    pStepForm.FetchAvailableDates(location);
                    $('#id_date').prop('disabled', false);
                    $('#id_date').css({ 'background': '#ffffff', 'opacity': '1' });
                } else {
                    $('#id_date').prop('disabled', true);
                    $('#id_date').css({ 'background': '#dddddd', 'opacity': '0.5' });
                }
            });

            $('input[name="date"]').change(function () {
                var date = $("#id_date").val();
                if (date !== '' && date !== null) {
                    $('#id_time').prop('disabled', false);
                    $('#id_time').css({ 'background': '#ffffff', 'opacity': '1' });
                    var location = $("#id_location").val();
                    pStepForm.slotcheck(location, date);
                } else {
                    $('#id_time').prop('disabled', true);
                    $('#id_time').css({ 'background': '#dddddd', 'opacity': '0.5' });
                }
            });

            pStepForm.getLocation();

            let start = moment();
            let end = moment();

            // DATE SET
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
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, this.setDate);

            this.setDate(start, end);

            $('body').on('click', 'a.view-data', function () {
                pStepForm.archive_id = $(this).data('id');
            });

            $('body').on('click', 'span.outreach_status', function () {
                pStepForm.archive_id = $(this).data('id');
                pStepForm.renderModal();
            });

            $('body').on('click', '#id_accept_text_message', function () {
                let checked = $('#id_accept_text_message:checked').length > 0;
                let optional_text = $('.optional-text');
                if (checked === true) {
                    $(optional_text).removeClass('d-none');
                } else {
                    $(optional_text).addClass('d-none');
                    const all_input_file_elements = $('.optional-text').find('input[type="text"]');
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('');
                    }
                }
            });

            $('body').on('click', '#id_schedule_appointment', function () {
                var checked = $('#id_schedule_appointment:checked').length > 0;
                if (!checked) {
                    var messagedchecked = $('#id_accept_text_message:checked').length > 0;
                    if (messagedchecked) {
                        setTimeout(function () {
                            $("#id_accept_text_message").click();
                        }, 50);
                    }
                    const all_input_file_elements = $('#collapseExample').find('input');
                    const all_input_select_elements = $('#collapseExample').find('select');
                    const all_input_textarea_elements = $('#collapseExample').find('textarea');
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('');
                    }
                    for (let i = 0; i < all_input_select_elements.length; i++) {
                        $(all_input_select_elements[i]).val('');
                    }
                    for (let i = 0; i < all_input_textarea_elements.length; i++) {
                        $(all_input_textarea_elements[i]).val('');
                    }
                }
            });

            $('body').on('click', '#patient-save', function () {
                var validation = pStepForm.Validate();
                const outreachstatus = $('#id_outreach_status').val();
                if (validation) {
                    if ($('#id_outreach_status').val() == "Appointment scheduled") {
                        const location = $('#id_location').val();
                        var preferred_date = $('#id_date').val();
                        if (preferred_date) {
                            preferred_date = preferred_date.split("/");
                            preferred_date = preferred_date[2] + '-' + preferred_date[0] + '-' + preferred_date[1];
                        }
                        const time = $('#id_time').val();
                        const phone_number = $('#id_new_phone_number').val();
                        const preferred_language = $('#id_preferred_language').val();
                        const comments = $('#id_comments').val();
                        var accept_text = false;
                        if ($('#id_accept_text_message:checked').length > 0) {
                            accept_text = true;
                        }
                        pStepForm.scheduleAppointment(outreachstatus, location, preferred_date, time, phone_number, preferred_language, comments, accept_text);
                    } else {
                        pStepForm.patientOutreachStatusUpdate(outreachstatus);
                    }
                }
            });
            $('#view-model').on('hidden.bs.modal', function (e) {
                $(this).find("input,textarea,select").val('').end().find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
                $('#collapseExample').removeClass('show');
                $('#patientrequestedtocallback').removeClass('show');
                $('#patientrefusedservice').removeClass('show');
                $('#completed_else_where_collapse').removeClass('show');
                $('#other').removeClass('show');
            });

            $('body').on('click', '.remindedpatient', function () {
                pStepForm.archive_id = $(this).data('id');
            });

            $('body').on('click', '#archive-model .btn-primary', function () {
                pStepForm.remindedthepatient();
            });
            $('body').on('click', '.cancel-appointment', function () {
                pStepForm.archive_id = $(this).data('id');
            });

            $('body').on('click', '#cancel-appointment-model .btn-primary', function () {
                if ($("#id_reason_for_cancel_text").val() == '') {
                    $("#id_reason_for_cancel_text").addClass('error');
                } else {
                    const reason_text = $("#id_reason_for_cancel_text").val();
                    $('#cancel-appointment-model').modal('hide');
                    $("#id_reason_for_cancel_text").removeClass('error');
                    pStepForm.cancelappointment(reason_text);
                }
            });

            $('body').on('click', '.confirm-cancel-appointment', function () {
                pStepForm.archive_id = $(this).data('id');
            });

            $('body').on('click', '#confirm-cancel-appointment-model .btn-primary', function () {
                pStepForm.cancelappointment();
                $('#confirm-cancel-appointment-model').modal('hide');
            });
        },
        cancelappointment(reason_text = null) {
            $.ajax({
                type: "POST",
                url: "/appointment/api/v1/healthplan-cancel-appointment/",
                data: {
                    archive_id: this.archive_id,
                    reason_text: reason_text,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    $("#id_reason_for_cancel_text").val('');
                    $('#cancel-appointment-model').modal('hide');
                    if (res.status != 1) {
                        var model = $('#error-alert');
                    } else {
                        var model = $('#success-alert');
                    }
                    $(model).removeClass('d-none');
                    setTimeout(function () {
                        $(model).addClass('d-none');
                    }, 3000);
                    this.getData();
                },
                error: err => {
                    $('#cancel-appointment-model').modal('hide');
                    $('#error-alert').removeClass('d-none');
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none');
                    }, 3000);
                }
            });
        },
        setDate(start, end) {
            $('#searchBooking').val('');
            $('#searchBooking').val('');
            if (start.format('MMMM D, YYYY') === 'June 1, 2020') {
                $('#reportrange span').html('Select Date Range');
            } else {
                if (start.format('MMMM D, YYYY') === end.format('MMMM D, YYYY')) {
                    if (moment(new Date()).format('MMMM D, YYYY') === start.format('MMMM D, YYYY')) $('#reportrange span').html('Today');else if (moment().subtract(1, 'days').format('MMMM D, YYYY') === start.format('MMMM D, YYYY')) $('#reportrange span').html('Yesterday');else $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
                } else $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            }
            $('#date_start').val(start.format('YYYY-MM-DD'));
            $('#date_end').val(end.format('YYYY-MM-DD'));

            pStepForm.start_date = $('#date_start').val();
            pStepForm.end_date = $('#date_end').val();
            pStepForm.getData();
        },
        getData() {
            $('#storebookingData').html(`<tr><td colspan="9">
          <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
          Loading....
          </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/appointment/api/v1/outreach/",
                data: {
                    filter: this.filter,
                    country_name: this.country_name,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    searchKey: this.searchKey,
                    page: this.page,
                    outreach: this.outreach,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    appointment_type: this.appointment_type
                },
                success: res => {
                    this.data = res.data;
                    this.pagination = res.pagination;
                    this.outreachData = res.outreachData;
                    if (res.outreachData.length > 0) {
                        let html = '';
                        let status = `<option value="">Select Status</option>`;
                        res.outreachData[0]['columns'].forEach((element, index) => {
                            html += `<td style="text-transform:capitalize;">${element.replace('_', ' ')}</td>`;
                        });
                        res.outreachData[0]['outreach_status_values'].forEach((element, index) => {
                            status += `<option value="${element}">${element}</option>`;
                        });
                        html += `<td style="text-transform:capitalize;width:5%">Out Reach Status</td>`;
                        html += `<td>Action</td>`;
                        $('.dynamic_table_headers').html(html);
                        $('#id_outreach_status').html(status);
                    }
                    let html = `<tr class="odd">
                                <td class="hover-icons"><a class="view-data hover-icons" data-toggle="modal" data-id="{element.id}" data-target="#view-model" data-name="{element.first_name} {element.last_name}"><i class="fa fa-plus fa-lg text-primary" title="View" style="width: 18px;height: 18px"></i></a></td>
                            </tr>`;
                    $('#storebookingData').html(html);
                    this.renderTable();
                    this.notificationchecker();
                },
                error: err => {
                    this.data = [];
                    this.renderTable();
                }
            });
        },
        renderTable() {
            if (this.data.length > 0) {
                let html = '';
                let fields = this.outreachData[0].columns;
                this.data.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}"> `;
                    fields.forEach((field, index) => {
                        html += `<td>${element[field]}</td>`;
                    });
                    html += `<td style="width:5%">${element['latest_outreach_status'] == 'Appointment confirmed' ? `<span class="outreach_status badge badge-success" title="${element['latest_outreach_status']}" data-toggle="modal" data-target="#outreach_history-model" data-id="${element['id']}" style="cursor:pointer;font-size:12px;width:75%;overflow:hidden">Appointment confirmed</span>` : element['latest_outreach_status'] == 'Appointment scheduled' ? `<span class="outreach_status badge badge-primary" title="${element['latest_outreach_status']}" data-toggle="modal" data-target="#outreach_history-model" data-id="${element['id']}" style="cursor:pointer;font-size:12px;width:75%;overflow:hidden">Appointment scheduled</span>` : element['latest_outreach_status'] == 'Appointment canceled' ? `<span class="outreach_status badge badge-danger" title="${element['latest_outreach_status']}" data-toggle="modal" data-target="#outreach_history-model" data-id="${element['id']}" style="cursor:pointer;font-size:12px;width:75%;overflow:hidden">Appointment canceled</span>` : element['latest_outreach_status'] == 'Appointment cancelation requested' ? `<span class="outreach_status badge badge-secondary" title="${element['latest_outreach_status']}" data-toggle="modal" data-target="#outreach_history-model" data-id="${element['id']}" style="cursor:pointer;font-size:12px;width:75%;color:white;overflow:hidden">Appointment cancelation requested</span>` : element['latest_outreach_status'] !== null && element['latest_outreach_status'] !== '' ? `<span class="outreach_status badge badge-warning" title="${element['latest_outreach_status']}" data-toggle="modal" data-target="#outreach_history-model" data-id="${element['id']}" style="cursor:pointer;font-size:12px;width:75%;overflow:hidden;">${element['latest_outreach_status']}</span>` : `<span class="badge badge-info" style="font-size:12px;width:75%;">New</span>`}</td>`;
                    html += `<td class="hover-icons"><a class="view-data hover-icons" data-toggle="modal" data-id="${element.id}" data-target="#view-model" data-name="${element.first_name} ${element.last_name}"><i class="fa fa-plus fa-lg text-primary" title="View" style="width: 18px;height: 18px"></i></a>
                      ${element.is_appointment_scheduled_patient_reminded == true && element.out_reach_status == 'Appointment confirmed' ? `<span class="hover-icons"><i class="fa fa-bell text-success" aria-hidden="true" title="Reminded" style="width: 18px;height: 18px"></i></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.call_details_table_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>` : element.is_appointment_scheduled_patient_reminded == true && element.out_reach_status == 'Appointment scheduled' ? `<span class="hover-icons"><i class="fa fa-bell text-success" aria-hidden="true" title="Reminded" style="width: 18px;height: 18px"></i></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.call_details_table_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>` : element.is_appointment_scheduled_patient_reminded == false && element.out_reach_status == 'Appointment scheduled' ? `<span class="hover-icons remindedpatient" data-toggle="modal" data-target="#archive-model" data-id="${element.call_details_table_id}"><a class="confirm_appointment"><i class="fa fa-bell-slash text-danger" aria-hidden="true" title="Remind Patient" style="width: 18px;height: 18px"></i></a></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.call_details_table_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>` : element.is_appointment_scheduled_patient_reminded == false && element.out_reach_status == 'Appointment confirmed' ? `<span class="hover-icons remindedpatient" data-toggle="modal" data-target="#archive-model" data-id="${element.call_details_table_id}"><a class="confirm_appointment"><i class="fa fa-bell-slash text-danger" aria-hidden="true" title="Remind Patient" style="width: 18px;height: 18px"></i></a></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.call_details_table_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>` : ''}
                      ${element.out_reach_status == 'Appointment cancelation requested' && element.is_cancelation_requested_by_csv == true ? `<span class="hover-icons confirm-cancel-appointment" data-toggle="modal" data-target="#confirm-cancel-appointment-model" data-id="${element.call_details_table_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Confirm cancellation" style="width: 18px;height: 18px"></i></span>` : ''}</td>
                </tr>`;
                });
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages;

                html = '';
                let separatorAdded = false;
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" 
                          data-date_start="` + 'date_start' + `"
                          data-searchKey="` + 'searchKey' + `">` + (i + 1) + `</li>`;
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
                $('#holder').html(html);
                document.querySelector('#holder>li[data-page="' + this.page + '"]').classList.add('active');
            } else {
                $('#storebookingData').html('<tr><td colspan="9">No Data</td></tr>');
                $('#holder').html('');
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
        Validate() {
            const outreach_status = $('#id_outreach_status').val();
            if (outreach_status == '') {
                return false;
            }
            return true;
        },
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('error');
            });
        },
        scheduleAppointment: function (outreachstatus, location, preferred_date, time, phone_number, preferred_language, comments, accept_text) {
            $.ajax({
                type: "POST",
                url: "/appointment/api/healthplan/schedule/",
                data: {
                    id: this.archive_id,
                    outreachstatus: outreachstatus,
                    location: location,
                    preferred_date: preferred_date,
                    time: time,
                    phone_number: phone_number,
                    preferred_language: preferred_language,
                    comments: comments,
                    accept_text: accept_text,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    if (res.status == 'slotfull') {
                        this.saveErrorMessage('The time slot you have selected is taken. Please choose another slot and continue.');
                        $(`#id_time option[value="${time}"]`).text(time + ' (Slot Full)');
                        $(`#id_time option[value="${time}"]`).val('').change();
                    } else if (res.status != 1) {
                        $('#view-model').modal('hide');
                        var model = $('#error-alert');
                    } else {
                        $('#view-model').modal('hide');
                        var model = $('#success-alert');
                    }
                    $(model).removeClass('d-none');
                    setTimeout(function () {
                        $(model).addClass('d-none');
                    }, 3000);
                    this.getData();
                },
                error: err => {
                    $('#view-model').modal('hide');
                    $('#error-alert').removeClass('d-none');
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none');
                    }, 3000);
                }
            });
        },
        patientOutreachStatusUpdate: function (outreachstatus, parameter = null) {
            $.ajax({
                type: "POST",
                url: "/appointment/api/healthplan/schedule/",
                data: {
                    id: this.archive_id,
                    outreachstatus: outreachstatus,
                    parameter: parameter,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    $('#view-model').modal('hide');
                    if (res.status != 1) {
                        var model = $('#error-alert');
                    } else {
                        var model = $('#success-alert');
                    }
                    $(model).removeClass('d-none');
                    setTimeout(function () {
                        $(model).addClass('d-none');
                    }, 3000);
                    this.getData();
                },
                error: err => {
                    $('#view-model').modal('hide');
                    $('#error-alert').removeClass('d-none');
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none');
                    }, 3000);
                }
            });
        },
        slotcheck(location, date) {
            $.ajax({
                type: "GET",
                url: "/appointment/api/healthplan/schedule/",
                data: {
                    location: location,
                    date: date
                },
                success: res => {
                    if (res.status == 1) {
                        var optionsHtml = '';
                        res['preferred_time'].forEach(function (time) {
                            optionsHtml += `<option value="${time[0]}">${time[1]}</option>`;
                        });
                        $("#id_time").html($(optionsHtml));
                    }
                },
                error: res => {}
            });
        },
        datepickerRender: function (enabled_date) {
            $("#id_date").val('');
            $("#id_date").datepicker("destroy");
            $("#id_date").datepicker({
                changeMonth: true,
                changeYear: true,
                minDate: new Date(),
                beforeShowDay: function (date) {
                    var day = date.getDay();
                    var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
                    return [enabled_date.indexOf(string) != -1];
                }
            });
            $("#id_date").datepicker("refresh");
        },
        renderModal() {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/appointment/api/v1/healthplan/outreach-history/${this.archive_id}/`,
                success: res => {
                    $('#modal-view-body').html(res);
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again');
                }
            });
        },
        saveErrorMessage: function (message) {
            $('#errormessagessubmit').removeClass('d-none');
            $('#errormessagessubmit').html(message);
            setTimeout(function () {
                $('#errormessagessubmit').addClass('d-none');
            }, 5000);
        },
        remindedthepatient() {
            $.ajax({
                type: "post",
                url: `/appointment/api/v1/healthplan/patient/reminder/${this.archive_id}/`,
                data: {
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    $('#archive-model').modal('hide');
                    if (res.status != 1) {
                        var model = $('#error-alert');
                    } else {
                        var model = $('#success-alert');
                    }
                    $(model).removeClass('d-none');
                    setTimeout(function () {
                        $(model).addClass('d-none');
                    }, 3000);
                    this.getData();
                },
                error: () => {}
            });
        },
        FetchAvailableDates: function (location) {
            $.ajax({
                type: "post",
                url: `/appointment/api/v1/healthplans-fetch-available-dates/`,
                data: {
                    location: location,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    if (res.status == 1) {
                        pStepForm.datepickerRender(res.date);
                    }
                },
                error: res => {}
            });
        },
        getLocation() {
            $.ajax({
                type: "GET",
                url: "/appointment/api/v1/healthplanscheduler-location/",
                success: res => {
                    if (res.status == 1) {
                        pStepForm.renderSelectBox("location", res.location, 'Select Location');
                    }
                },
                error: err => {
                    console.log(res);
                }
            });
        },
        renderSelectBox: function (nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['', firstItem]].concat(choices);
            choices.forEach(function (value, index, array) {
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
        notificationchecker() {
            $.ajax({
                url: `/appointment/api/v1/healthplan/notification-check/`,
                type: "POST",
                data: {
                    accessing_from: 'Healthplan',
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function (res) {
                    $(".icon-button__badge").text(res.count);
                    if (res.count > 0 && pStepForm.notification_popup == false) {
                        pStepForm.notification_popup = true;
                        $("#notification-popup-model").modal('show');
                    }
                },
                error: function () {}
            });
        }
    };
    pStepForm.init();
    pStepForm.notificationchecker();
    setInterval(function () {
        pStepForm.notificationchecker();
    }, 300000);
    $('#searchBooking').keyup(function () {
        pStepForm.searchKey = $(this).val();
        pStepForm.page = 1;
        pStepForm.getData();
    });

    $('#limit').change(function () {
        pStepForm.limit = $(this).val();
        pStepForm.page = 1;
        pStepForm.getData();
    });

    $('#id_appointment_type').change(function () {
        pStepForm.appointment_type = $(this).val();
        pStepForm.page = 1;
        pStepForm.getData();
    });

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        pStepForm.page = $(this).data("page");
        pStepForm.getData();
    });
});