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
        date:$('#my_date_picker').val(),
        site_name: null,
        comment_icon_name:null,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function () {
            
            var type_of_load = window.location.pathname.split('/')
            if(type_of_load[type_of_load.length-2]=='success'){
                $('.alert-text').html(`<i class="mx-5 fa fa-check text-success" style="font-size:48px;"></i><span class="mx-2" style="font-size:18px;">Updated Successfully</span>`)
                $('#submit-model').modal('show')
            }

            const all_input_elements = $('form').find('input');
            for (let i = 0; i < all_input_elements.length; i++) {
                if($(`#id_${all_input_elements[i].getAttribute("name")}`).val()!==''){
                    var name = all_input_elements[i].getAttribute("name")
                    $(`[data-name=${name}] i`).removeClass('text-info').addClass('text-danger')
                }
            }
            if($('#id_list_any_barriers').val()=='Other Reasons'){
                $('.other_reasons_field').removeClass('d-none')
            }
            var all_site = JSON.parse($('#available_locations').val());
            var site = $('#id_site').val()
            pStepForm.renderSelectBox("site",all_site)
            $('#id_site').val(site)
            pStepForm.site_name = $('#id_site').val()

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

            $('body').on('click', '#alert-model .btn.btn-primary', function () {
                window.location = window.location.pathname
            })

            $('body').on('click', '#submit-model .btn.btn-primary', function () {
                var pathnameid = window.location.pathname.split("/")
                pathnameid = pathnameid[pathnameid.length-3]
                window.location = `/staffplanning/staffplanning/optometry-update/${pathnameid}/edit/`
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
            //callouts
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
        checkEntry() {
            $.ajax({
                type: "POST",
                url: "/staffplanning/api/v1/staffplanningoptometry/fetch-previous-submission/",
                data: {
                    site_name: this.site_name,
                    day:this.date,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status=='1'){
                        if(res.previous_data.length>0){
                            window.location = `/staffplanning/staffplanning/optometry-update/${res.previous_data[0]['id']}/edit/`
                        }
                        else{
                            $('.alert-text').html("No entry available for the chosen date")
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
        renderSelectBox: function(nameOfSelect, choices, firstItem=false) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            if(firstItem){
                choices = [['',firstItem],].concat(choices);
            }
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
    $('#id_staffplanning_optometry_form').submit(function (e) {
        localStorage.setItem('Site',$('#id_site').val())
        
        var validationFlag = true
        if (validationFlag) {
            // Valid let the form do it
            document.pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.');
            $('#update_report_button').addClass('d-none');
        } else {
            e.preventDefault();
        }
    });
    $('select[name="site"]').change(function() {
        $('.other_reasons_field').addClass('d-none')
        document.pStepForm.clearAllInput()
        document.pStepForm.day = null
        var site = $("#id_site").val()
        localStorage.setItem('Site',$('#id_site').val())
        
        pStepForm.site_name = site
        pStepForm.checkEntry()
    })
    
    $('input[name="my_date_picker"]').change(function() {
        pStepForm.date = $(this).val()
        pStepForm.checkEntry()
    })

    function pad(number, length) { 
        var str = String(number);
        return (str.length >= length) ? str : ( new Array(length - str.length + 1).join('0') ) + str;
    }

    let datetime = new Date($('input[name="my_date_picker"]').val()+' '+'UTC').toLocaleString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    datetime = datetime.toString()
    datetime = datetime.split(',')
    datetime = datetime[0].split('/')
    $('input[name="my_date_picker"]').val(pad(datetime[0], 2) + '-' + pad(datetime[1], 2) +'-'+datetime[2])
    pStepForm.date = $('input[name="my_date_picker"]').val()
});