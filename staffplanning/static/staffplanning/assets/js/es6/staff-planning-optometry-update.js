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
        comment_icon_name:null,
        total_appt_scheduled_today:parseFloat($("#id_total_appointment_scheduled_today").val(),10),
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function () {

            if($.isNumeric($("#id_total_appointment_scheduled_today").val())){
                var appt_scheduled_today = parseFloat($("#id_total_appointment_scheduled_today").val(),10)
                if($.isNumeric($("#id_number_of_walk_in_patients_today").val())){
                    var walkinpatients = parseFloat($("#id_number_of_walk_in_patients_today").val(),10)
                    pStepForm.total_appt_scheduled_today = appt_scheduled_today - walkinpatients
                }
            }

            $('.update-disable :input').attr('readonly',true)
            $('.update-disable :input').css({'background':'#dddddd','opacity':'0.5'})
            
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

            $("#id_number_of_walk_in_patients_today").on('keyup',function(){
                if($.isNumeric($("#id_number_of_walk_in_patients_today").val())){
                    var value = 0
                    if($.isNumeric($('#id_number_of_walk_in_patients_today').val())){
                        value += parseFloat($("#id_number_of_walk_in_patients_today").val(),10)
                    }
                    if($.isNumeric(value)){
                        if($.isNumeric(pStepForm.total_appt_scheduled_today)){
                            value += parseFloat(pStepForm.total_appt_scheduled_today,10)
                        }
                        $("#id_total_appointment_scheduled_today").val(value)
                    }
                }
                else{
                    if($.isNumeric(pStepForm.total_appt_scheduled_today)){
                        $("#id_total_appointment_scheduled_today").val(pStepForm.total_appt_scheduled_today)
                    }
                    else{
                        $("#id_total_appointment_scheduled_today").val('')
                    }
                }
            });

            //VISIT CAPAITY

            $("#id_qualified_visits_conducted,#id_number_of_walk_in_patients_today").on('keyup',function(){
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

            $('.number_input').on('keyup',function(){
                if(!$.isNumeric($(this).val())){
                    $(this).val('')
                }
            })

            $('#id_productivity_status').val(true)

            pStepForm.CommentIconColourChange()

        },
        CommentIconColourChange:function(){
            const all_input_elements = $('.editable-section').find('input');
            for (let i = 0; i < all_input_elements.length; i++) {
                let value_check = $(`#id_${all_input_elements[i].getAttribute("name")}`).val()
                if(value_check!=='' && value_check !==null){
                    $(`[data-name=${all_input_elements[i].getAttribute("name")}] i`).removeClass('text-info').addClass('text-danger')
                }
            }
        },
        addSubmitButtonErrorMessage: function (errorMessage) {
            $('#error-display-near-submit').removeClass('d-none');
            $('#error-display-near-submit').html(errorMessage);
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
    $('#id_staffplanning_form').submit(function (e) {
        var validationFlag = true
        if (validationFlag) {
            // Valid let the form do it
            document.pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.');
            $('#form_submit_button').addClass('d-none');
        } else {
            e.preventDefault();
        }
    });
});