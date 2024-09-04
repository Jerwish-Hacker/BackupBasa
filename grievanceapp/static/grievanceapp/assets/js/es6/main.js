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
        noValidate: [],
        submitvariable:0,
        issuccessurl: false,
        filenumber: 1,
        init: function () {
            var me = this
            this.noValidate.push('comments')
            this.noValidate.push('provider_mentioned')
            this.noValidate.push('patient_first_name')
            this.noValidate.push('patient_last_name')
            this.noValidate.push('date_of_event')
            this.noValidate.push('date_of_birth')
            this.noValidate.push('phone_number')
            this.noValidate.push('who_was_involoved')
            this.noValidate.push('steps_taken_to_resolve_this_issue')
            this.noValidate.push('outcome_resolution')
            this.noValidate.push('file_1')
            this.noValidate.push('file_2')
            this.noValidate.push('file_3')
            this.noValidate.push('file_4')
            this.noValidate.push('file_5')
            if(window.location.pathname.slice(1,8)=="success")
            {
                this.successurlcheck=true;
            }

            $('#addfile').click(function() {
                pStepForm.filenumber = pStepForm.filenumber + 1
                $('#id_file_'+pStepForm.filenumber).removeClass('d-none')
            });

            $(document).on('change', '.fileclass', function(event) {
                if (event.target.files[0] !== undefined) {
                    const file_name = event.target.files[0].name.split('.')
                    const file_size = event.target.files[0].size
                    var file_ext = file_name[file_name.length - 1];
                    var is_wrong_file = false;
                    if (file_ext != 'pdf' && file_ext != 'jpg' && file_ext!= 'jpeg' && file_ext!='png') {
                        pStepForm.addSubmitButtonErrorMessage('File type not supported. Please upload PDF, JPG, JPEG, PNG Files')
                        is_wrong_file = true;
                    }
                    if (file_size >= (20 * 1024 * 1024)) {
                        pStepForm.addSubmitButtonErrorMessage('File size not supported. Allowed maximum Size is 20MB')
                        is_wrong_file = true;
                    }
                    if (is_wrong_file) {
                        console.log("FILE NOT OK")
                        $(this).val('')
                    }
                    else {
                        console.log("FILE OK");
                    }
                }
            })

            $('select[name="grievance_report_type"]').change(function() {
                if ($(this).val() == 'Health Plan'){
                    $('#healthplandiv').removeClass('d-none')
                    $('.dynamic').removeClass('col-md-6')
                    $('.dynamic').addClass('col-md-4')
                    me.removeFromNoValidate('health_plan')
                }
                else if ($(this).val() == 'Patient'){
                    $('#healthplandiv').addClass('d-none')
                    $('#id_health_plan').val('')
                    $('.dynamic').removeClass('col-md-4')
                    $('.dynamic').addClass('col-md-6')
                    if(!me.noValidate.includes('health_plan')){
                        me.noValidate.push('health_plan');
                    }
                }
                else {
                    me.removeFromNoValidate('health_plan')
                    $('#healthplandiv').removeClass('d-none')
                    $('.dynamic').removeClass('col-md-6')
                    $('.dynamic').addClass('col-md-4')
                }
            })
        },
        removeFromNoValidate: function(nameOfInput) {
            var index = this.noValidate.indexOf(nameOfInput);
            if(index > -1)
                this.noValidate.splice(index,1);
        },
        addSubmitButtonErrorMessage: function (errorMessage) {
            $('#error-display-near-submit').removeClass('d-none');
            $('#error-display-near-submit').html(errorMessage);
        },
        removeSubmitButtonErrorMessage: function () {
            // Clear error
            $('#error-display-near-submit').addClass('d-none');
            $('#error-display-near-submit').html('--');
        },
        makeAlertSuccessful: function () {
            $('#error-display-near-submit').removeClass('alert-danger').addClass('alert-success');
        },
        validate: function () {
            const all_input_elements = $('#grievance_save_form').find('input')
            const all_select_elements = $('#grievance_save_form').find('select')
            const error_elements = []
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() === "") {
                    const input_name = $(all_input_elements[i]).attr('name')
                    if (!this.noValidate.includes(input_name))
                        error_elements.push(all_input_elements[i])
                }

            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() === "") {
                    const input_name = $(all_select_elements[i]).attr('name')
                    if (!this.noValidate.includes(input_name))
                        error_elements.push(all_select_elements[i])
                }
            }
            if (error_elements.length > 0) {
                this.renderError(error_elements)
                return false
            }
            if($('#captcha-widget-id').length){
                // Do check captcha validation
                var userCaptchaResponse = grecaptcha.getResponse();
                if (!userCaptchaResponse) {
                    this.removeError()
                    this.addSubmitButtonErrorMessage('Captcha should be solved before submitting.')
                    // this.resetCaptcha()
                    return false
                } else {
                    this.removeSubmitButtonErrorMessage();
                }
            }
            return true
        },
        renderError: function (elements) {
            let offsetTop = 1000000;
            elements.forEach(function (element) {
                if ($(element).offset().top < offsetTop)
                    offsetTop = $(element).offset().top
                $(element).addClass('error')
            })
            $(window).scrollTop(offsetTop - 140);
            this.removeError()
        },
        removeError: function () {
            const all_input_elements = $('#grievance_save_form').find('input')
            const all_select_elements = $('#grievance_save_form').find('select')
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() !== "") {
                    $(all_input_elements[i]).removeClass('error')
                }
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() !== "") {
                    $(all_select_elements[i]).removeClass('error')
                }
            }
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
    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    pStepForm.init()
    if(!pStepForm.successurlcheck){
        var available_locations  = JSON.parse($('#available_locations').val());
        pStepForm.renderSelectBox("site",available_locations, 'Select Site')
        if(window.location.pathname.slice(1,27)=='grievance/grievance/update'){
            var date_of_event = $('input[name="hidden_date_of_event"]').val()
            var date_of_birth = $('input[name="hidden_date_of_birth"]').val()
            $('select[name="site"]').val($('input[name="hidden_site"]').val())
            if(date_of_event!==null && date_of_event!==''){
                $('input[name="date_of_event"]').val(moment(new Date(date_of_event)).format("MM/DD/YYYY"))
            }
            if(date_of_birth!==null && date_of_birth!==''){
                $('input[name="date_of_birth"]').val(moment(new Date(date_of_birth)).format("MM/DD/YYYY"))
            }
        }
    }
    $('#submitbuttongform').click(function (e) {
        if(pStepForm.submitvariable==0){
            var validationFlag = pStepForm.validate();
            if (validationFlag) {
                // Valid let the form do it
                pStepForm.removeError()
                pStepForm.submitvariable=1
                $('#submitbuttongform').attr('type','submit')
                pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.')
                pStepForm.makeAlertSuccessful()
                $('#submitbuttongform').click()
                $('button.main-btn').remove();
            } else {
                e.preventDefault();
            }
        }
    })
})