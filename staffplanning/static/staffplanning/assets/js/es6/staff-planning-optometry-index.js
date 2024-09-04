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

    const pStepForm = {
        data: [],
        previous_data:[],
        previous_date_data:[],
        productivity_hyperlink:[],
        all_submitted_users_per_day:[],
        day:null,
        site_name: null,
        comment_icon_name:null,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function () {
            
            if(localStorage.getItem('Site')){
                pStepForm.site_name = localStorage.getItem('Site')
                localStorage.removeItem('Site')
                pStepForm.FetchPreviousSubmission()
            }

            $('#submitbutton_optometry_save_for_tomorrow').click(function(){
                $('#id_save_for_tomorrow').val("True")
            })

            $('#edit_form').click(function(){
                pStepForm.checkLatestEntry()
            })
            
            $('body').on('click', '#comment-model .btn.btn-primary', function () {
                $(`input[name=${pStepForm.comment_icon_name}]`).val($('#modelcommenttext').val())
                $('#comment-model').modal('hide')
                if($('#modelcommenttext').val()!==''){
                    $(`[data-name=${pStepForm.comment_icon_name}] svg`).removeClass('text-info').addClass('text-danger')
                }
                else{
                    $(`[data-name=${pStepForm.comment_icon_name}] svg`).removeClass('text-danger').addClass('text-info')
                }
            })

            $('body').on('click', '.comment_modal_toggle_icon', function () {
                pStepForm.comment_icon_name = $(this).data('name')
                $('#modelcommenttext').val($(`input[name=${pStepForm.comment_icon_name}]`).val())
            })

            //PROVIDERS BLOCK
            $("#id_optometrist_present").on('keyup',function(){
                if($.isNumeric($('#id_optometrist_present').val())){
                    var value = 0
                    value += parseFloat($('#id_optometrist_present').val(),10)
                    if(value!==0){
                        $("#id_total_optometrist_appointments_scheduled_today").val(26*value.toFixed(2))
                    }
                    else{
                        $("#id_total_optometrist_appointments_scheduled_today").val(0)
                    }
                }
                else{
                    $("#id_total_optometrist_appointments_scheduled_today").val('')
                }
            });
            //OTHER PROVIDERS
            $("#id_optometrist_present,#id_optometry_ma_present").on('keyup',function(){
                if($.isNumeric($('#id_optometrist_present').val()) || $.isNumeric($("#id_optometry_ma_present").val())){
                    var numerator = 0
                    var denomenator = 0
                    if($.isNumeric($('#id_optometry_ma_present').val())){
                        numerator += parseFloat($('#id_optometry_ma_present').val(),10)
                    }
                    if($.isNumeric($('#id_optometrist_present').val())){
                        denomenator += parseFloat($("#id_optometrist_present").val(),10)
                    }
                    if(denomenator!==0 && numerator!==0){
                        $("#id_ma_optometrist_ratio").val((numerator/denomenator).toFixed(2))
                    }
                    else{
                        $("#id_ma_optometrist_ratio").val('')
                    }
                }
                else{
                    $("#id_ma_optometrist_ratio").val('')
                }
            });

            $("#id_optometrist_present,#id_receptionist_present").on('keyup',function(){
                if($.isNumeric($('#id_optometrist_present').val()) || $.isNumeric($("#id_receptionist_present").val())){
                    var numerator = 0
                    var denomenator = 0
                    if($.isNumeric($('#id_receptionist_present').val())){
                        numerator += parseFloat($('#id_receptionist_present').val(),10)
                    }
                    if($.isNumeric($('#id_optometrist_present').val())){
                        denomenator += parseFloat($("#id_optometrist_present").val(),10)
                    }
                    if(denomenator!==0 && numerator!==0){
                        $("#id_receptionist_optometrist").val((numerator/denomenator).toFixed(2))
                    }
                    else{
                        $("#id_receptionist_optometrist").val('')
                    }
                }
                else{
                    $("#id_receptionist_optometrist").val('')
                }
            });

            $("#id_optometrist_present,#id_optician").on('keyup',function(){
                if($.isNumeric($('#id_optometrist_present').val()) || $.isNumeric($("#id_optician").val())){
                    var numerator = 0
                    var denomenator = 0
                    if($.isNumeric($('#id_optician').val())){
                        numerator += parseFloat($('#id_optician').val(),10)
                    }
                    if($.isNumeric($('#id_optometrist_present').val())){
                        denomenator += parseFloat($("#id_optometrist_present").val(),10)
                    }
                    if(denomenator!==0 && numerator!==0){
                        $("#id_optician_optometrist_ratio").val((numerator/denomenator).toFixed(2))
                    }
                    else{
                        $("#id_optician_optometrist_ratio").val('')
                    }
                }
                else{
                    $("#id_optician_optometrist_ratio").val('')
                }
            });

            $("#id_optometrist_present,#id_total_optometrist_appointments_scheduled_today,#id_number_of_walk_in_patients_today").on('keyup',function(){
                if($.isNumeric($('#id_total_optometrist_appointments_scheduled_today').val()) || $.isNumeric($("#id_number_of_walk_in_patients_today").val())){
                    var value = 0
                    if($.isNumeric($('#id_total_optometrist_appointments_scheduled_today').val())){
                        value += parseFloat($("#id_total_optometrist_appointments_scheduled_today").val(),10)
                    }
                    if($.isNumeric($('#id_number_of_walk_in_patients_today').val())){
                        value += parseFloat($("#id_number_of_walk_in_patients_today").val(),10)
                    }
                    if(value!==0){
                        $("#id_total_appointment_scheduled_today").val(value)
                    }
                    else{
                        $("#id_total_appointment_scheduled_today").val('')
                    }
                }
                else{
                    $("#id_total_appointment_scheduled_today").val('')
                }
            });

            //VISIT CAPACIITY
            $("#id_qualified_visits_conducted,#id_total_appointment_scheduled_today,#id_number_of_walk_in_patients_today,#id_total_optometrist_appointments_scheduled_today,#id_optometrist_present").on('keyup',function(){
                if($.isNumeric($('#id_qualified_visits_conducted').val()) || $.isNumeric($("#id_total_appointment_scheduled_today").val())){
                    var numerator = 0
                    var denomenator = 0
                    if($.isNumeric($('#id_total_appointment_scheduled_today').val())){
                        denomenator += parseFloat($('#id_total_appointment_scheduled_today').val(),10)
                    }
                    if($.isNumeric($('#id_qualified_visits_conducted').val())){
                        numerator += parseFloat($("#id_qualified_visits_conducted").val(),10)
                    }
                    if(denomenator!==0 && numerator!==0){
                        $("#id_visit_capacity_utilization_percentage").val(((numerator/denomenator)*100).toFixed(2))
                    }
                    else{
                        $("#id_visit_capacity_utilization_percentage").val('')
                    }
                }
                else{
                    $("#id_visit_capacity_utilization_percentage").val('')
                }
            });

            $("#id_optometry_ma_on_leave,#id_optician_on_leave,#id_number_of_walk_in_patients_today,#id_number_of_optometrist_who_met_productivity_at_end_of_day,#id_qualified_visits_conducted,#id_no_of_optometrist_who_did_not_meet_pdty_at_eod,#id_total_appointment_scheduled_today,#id_visit_capacity_utilization_percentage").on('keyup',function(){
               pStepForm.ProductivityCheck()
            })

            $('.number_input').on('keyup',function(){
                if(!$.isNumeric($(this).val())){
                    $(this).val('')
                }
            })

            //RADIO BUTTONS
            $("input[name='fetch_previous_data']").change(function() {
                pStepForm.day=$(this).val()
                pStepForm.FetchPreviousSubmission()
            });

            $('body').on('click', 'span.productivity_text', function () {
                pStepForm.renderModal($(this).data('id'))
            })

            $('select[name="list_any_barriers"]').change(function() {
               if($(this).val()=="Other Reasons"){
                    $('.other_reasons_field').removeClass('d-none')
               }
               else{
                    $('.other_reasons_field').addClass('d-none')
                    $('#id_other_reasons').val('')
               }
            })

        },
        ProductivityCheck: function(){
            var count = 0
            if($.isNumeric($('#id_optometry_ma_on_leave').val())){
                count += 1
            }
            if($.isNumeric($('#id_optician_on_leave').val())){
                count += 1
            }
            if($.isNumeric($('#id_number_of_walk_in_patients_today').val())){
                count += 1
            }
            if($.isNumeric($('#id_number_of_optometrist_who_met_productivity_at_end_of_day').val())){
                count += 1
            }
            if($.isNumeric($('#id_total_appointment_scheduled_today').val())){
                count += 1
            }
            if($.isNumeric($('#id_no_of_optometrist_who_did_not_meet_pdty_at_eod').val())){
                count += 1
            }
            if($.isNumeric($('#id_qualified_visits_conducted').val())){
                count += 1
            }
            if($.isNumeric($('#id_visit_capacity_utilization_percentage').val())){
                count += 1
            }
            if(count==8){
                $('#id_productivity_status').val(true)
            }
            else{
                $('#id_productivity_status').val(null)
            }
        },
        validate: function () {
            const error_elements = [];
            const all_select_elements = $('form').find('select');
            const all_input_elements = $('form').find('input');
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('error');
            }
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() === "") {
                    error_elements.push(all_input_elements[i]);
                }
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() === "") {
                    error_elements.push(all_select_elements[i]);
                }
            }
            if (error_elements.length > 0) {
                this.renderError(error_elements);
                return false;
            }
            return true
        },
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('error');
            });
        },
        addSubmitButtonErrorMessage: function (errorMessage) {
            $('#error-display-near-submit').removeClass('d-none');
            $('#error-display-near-submit').html(errorMessage);
        },
        FetchPreviousSubmission() {
            $.ajax({
                type: "POST",
                url: "/staffplanning/api/v1/staffplanningoptometry/fetch-previous-submission/",
                data: {
                    site_name: this.site_name,
                    day:this.day,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status=='1'){
                        this.data = res.data
                        this.previous_data = res.previous_data
                        this.previous_date_data = res.previous_date_data
                        this.number_of_appointments = res.number_of_appointments
                        this.productivity_hyperlink = res.productivity_hyperlink
                        this.all_submitted_users_per_day = res.all_submitted_users_per_day
                        this.renderPreviousSubmission()
                    }
                    else{
                        this.data = []
                        this.previous_data = []
                        this.previous_date_data = []
                        this.productivity_hyperlink = []
                        this.all_submitted_users_per_day = []
                        this.renderPreviousSubmission()
                    }
                },
                error: (err) => {
                    this.data = []
                    this.previous_data = []
                    this.previous_date_data = []
                    this.productivity_hyperlink = []
                    this.all_submitted_users_per_day = []
                    this.renderPreviousSubmission()
                }
            })
        },
        renderPreviousSubmission(){
            pStepForm.clearAllInput()
            var all_site = JSON.parse($('#available_locations').val());
            pStepForm.renderSelectBox("site",all_site,"Select Site")
            if (this.previous_data.length > 0) {
                this.previous_data.forEach((element, index) => {
                    $.each(element, function(index2, value2) {
                        if(index2=="list_any_barriers" && value2=='Other Reasons'){
                            $('.other_reasons_field').removeClass('d-none')
                        }
                        else if(index2=="list_any_barriers" && value2!=='Other Reasons'){
                            $('.other_reasons_field').addClass('d-none')
                        }
                        $(`#id_${index2}`).val(value2)
                        if(value2){
                            $(`[data-name=${index2}] svg`).removeClass('text-info').addClass('text-danger')
                        }
                    }); 
                })
            }
            else{
                $('#id_optometry_ma_present').val(2)
                $('#id_receptionist_present').val(3)
                $('#id_optician').val(1)
                $('#id_site').val(pStepForm.site_name)
            }
            $(`.radio`).addClass('d-none')
            if (this.previous_date_data.length > 0) {
                this.previous_date_data.forEach((element, index) => {
                    $.each(element, function(index2, value2) {
                        $(`.radio_text_${index+1}`).html(value2)
                        $(`#radio_input_${index+1}`).val(value2)
                        $(`.radio_${index+1}`).removeClass('d-none')
                    }); 
                })
            }
            $('#id_last_user_submitted_time').text('')
            if (this.data.length > 0) {
                this.data.forEach((element, index) => {
                    $('#id_last_user_submitted_time').text(`Last emergency planning data was submitted on ${element.created_datetime_day_name} (${element.created_datetime_date}) at ${element.created_datetime_time} by ${element.record_created_by}`)
                })
                var html = ''
                if(this.all_submitted_users_per_day.length>0){
                    this.all_submitted_users_per_day.forEach((element, index) =>{
                        html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                            <td>${element.record_created_by}</td>
                            <td style="width: 100%;">${element.created_date} ${element.created_datetime_time}</td>
                        </tr>`
                    })
                    $('#per_day_user_submission_log').html(html);
                }
                else{
                    html =`<tr>
                            <td colspan="2">No Submission has made today</td>
                    </tr>`
                    $('#per_day_user_submission_log').html(html);
                }
            }
            $('.productivity_hyper_link').html('')
            if(this.productivity_hyperlink.length>0){
                this.productivity_hyperlink.forEach((element, index) => {
                    $('.productivity_hyper_link').html(`<a href="/staffplanning/staffplanningoptometry/update/${element.id}/"><span class="productivity_text hover-icons" style="cursor:pointer;color:red">Verify and Close Productivity of ${element.record_datetime_date}</span></a>`)
                }
            )}
            $('#id_save_for_tomorrow').val(null)
            pStepForm.ProductivityCheck()
        },
        clearAllInput(){
            const all_input_elements = $('form').find('input');
            const all_text_area = $('form').find('textarea');
            for (let i = 0; i < all_input_elements.length; i++) {
                if(all_input_elements[i].getAttribute("name")!=='csrfmiddlewaretoken' && (all_input_elements[i].getAttribute("name")!=='fetch_previous_data')){
                    $(`[data-name=${all_input_elements[i].getAttribute("name")}] svg`).removeClass('text-danger').addClass('text-info')
                    $(all_input_elements[i]).val('')
                }
            }
            for (let i = 0; i < all_text_area.length; i++) {
                $(all_text_area[i]).val('')
            }
            $('#id_list_any_barriers').val('')
            $('.fa-file').removeClass('text-danger').addClass('text-primary')
        },
        checkLatestEntry() {
            $.ajax({
                type: "POST",
                url: "/staffplanning/api/v1/check/lastest/optometry-entry/",
                data: {
                    site_name: this.site_name,
                    day:this.date,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status=='1'){
                        if(res.id!==0){
                            window.location = `/staffplanning/staffplanning/optometry-update/${res.id}/edit/`
                        }
                        else{
                            $('.alert-text').html("The Chosen site doesn't have any entry to edit")
                            $('#alert-model').modal('show')
                        }
                    }
                    else{
                        $('.alert-text').html("Oops Something Happen")
                        $('#alert-model').modal('show')
                    }
                },
                error: (err) => {
                }
            })
        },
        renderSelectBox: function(nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['',firstItem],].concat(choices);
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
    };
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    pStepForm.init();

    document.pStepForm = pStepForm;
    var all_site = JSON.parse($('#available_locations').val());
    document.pStepForm.renderSelectBox("site",all_site,"Select Site")
    $('#id_staffplanning_optometry_form').submit(function (e) {
        localStorage.setItem('Site',$('#id_site').val())
        
        var validationFlag = true
        if (validationFlag) {
            // Valid let the form do it
            document.pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.');
            $('#submitbutton_optometry_save_for_today').addClass('d-none');
            $('#submitbutton_optometry_save_for_tomorrow').addClass('d-none');
        } else {
            e.preventDefault();
        }
    });
    $('select[name="site"]').change(function() {
        $(`.radio`).addClass('d-none')
        $('#id_last_user_submitted_time').text('')
        $('.productivity_hyper_link').html('')
        $('#radio_input_1').prop('checked', true);
        $('.other_reasons_field').addClass('d-none')
        document.pStepForm.clearAllInput()
        document.pStepForm.day = null
        var site = $("#id_site").val()
        localStorage.setItem('Site',$('#id_site').val())
        
        pStepForm.site_name = site
        pStepForm.FetchPreviousSubmission()
    })
});