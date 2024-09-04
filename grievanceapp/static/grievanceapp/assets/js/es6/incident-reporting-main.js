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
            this.noValidate.push('service_line')
            this.noValidate.push('severity')
            this.noValidate.push('level_of_intervention')
            this.noValidate.push('location_site')
            this.noValidate.push('ethnicity_race')
            this.noValidate.push('mrn')
            this.noValidate.push('phone_number')
            this.noValidate.push('letter_sent_date')
            this.noValidate.push('letter_signed_date')
            this.noValidate.push('scanned_date')
            this.noValidate.push('file_1')
            this.noValidate.push('file_2')
            this.noValidate.push('file_3')
            this.noValidate.push('file_4')
            this.noValidate.push('file_5')

            $('input[name="severity"]').change(function() {
                var severity = $(this).val()
                $('input[name="level_of_intervention').prop("checked",false)
                $(".verbalthreats").addClass("d-none")
                $(".overtaggression").addClass("d-none")
                $(".anxietyandagitation").addClass("d-none")
                if(severity=="Anxiety and Agitation"){
                    $(".anxietyandagitation").removeClass("d-none")
                }
                else if(severity=="Verbal Threats"){
                    $(".verbalthreats").removeClass("d-none")
                }
                else if(severity=="Overt Aggression"){
                    $(".overtaggression").removeClass("d-none")
                }
            })

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
                        pStepForm.addSubmitButtonMessage('File type not supported. Please upload PDF, JPG, JPEG, PNG Files')
                        is_wrong_file = true;
                    }
                    if (file_size >= (20 * 1024 * 1024)) {
                        pStepForm.addSubmitButtonMessage('File size not supported. Allowed maximum Size is 20MB')
                        is_wrong_file = true;
                    }
                    if (is_wrong_file) {
                        $(this).val('')
                    }
                }
            })
        },
        addSubmitButtonMessage: function (errorMessage) {
            $('#error-display-near-submit').removeClass('d-none');
            $('#error-display-near-submit').html(errorMessage);
        },
        removeSubmitButtonMessage: function () {
            // Clear error
            $('#error-display-near-submit').addClass('d-none');
            $('#error-display-near-submit').html('--');
        },
        makeAlertSuccessful: function () {
            $('#error-display-near-submit').removeClass('alert-danger').addClass('alert-success');
        },
        makeAlertError: function(){
            $('#error-display-near-submit').removeClass('alert-success').addClass('alert-danger');
        },
        removeError: function () {
            const all_input_elements = $('#incident_save_form').find('input')
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('error')
            }
        },
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('error')
            })
        },
        validate: function () {
            this.removeError()
            const all_input_elements = $('#incident_save_form').find('input')
            const all_select_element = $('#incident_save_form').find('select')
            const error_elements = []
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() === "") {
                    const input_name = $(all_input_elements[i]).attr('name')
                    if (!this.noValidate.includes(input_name))
                        error_elements.push(all_input_elements[i])
                }

            }
            for (let i = 0; i < all_select_element.length; i++) {
                if ($(all_select_element[i]).val() === "") {
                    const input_name = $(all_select_element[i]).attr('name')
                    if (!this.noValidate.includes(input_name))
                        error_elements.push(all_select_element[i])
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
                    this.makeAlertSuccessful()
                    this.addSubmitButtonMessage('Captcha should be solved before submitting.')
                    return false
                } else {
                    this.removeSubmitButtonMessage();
                }
            }
            return true
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
    var all = JSON.parse($('#available_locations').val());
    pStepForm.renderSelectBox("location_site",all, 'Select Location/Site')
    if(window.location.pathname.slice(1,39)=='grievance/standards-of-behavior/update'){
        var letter_signed_date = $('input[name="hidden_letter_signed_date"]').val()
        var letter_sent_date = $('input[name="hidden_letter_sent_date"]').val()
        var scanned = $('input[name="hidden_scanned_date"]').val()
        $('select[name="location_site"]').val($('input[name="hidden_location"]').val())
        $('input[name="letter_signed_date"]').val(moment(new Date(letter_signed_date)).format("MM/DD/YYYY"))
        $('input[name="letter_sent_date"]').val(moment(new Date(letter_sent_date)).format("MM/DD/YYYY"))  
        $('input[name="scanned_date"]').val(moment(new Date(scanned)).format("MM/DD/YYYY"))
        var severity = $('input[name="hidden_severity"]').val()
        if(severity=="Anxiety and Agitation"){
            $(".anxietyandagitation").removeClass("d-none")
        }
        else if(severity=="Verbal Threats"){
            $(".verbalthreats").removeClass("d-none")
        }
        else if(severity=="Overt Aggression"){
            $(".overtaggression").removeClass("d-none")
        }
    }
    $('#incident_save_form').submit(function (e) {
        var validationFlag = pStepForm.validate();
        if (validationFlag) {
            // Valid let the form do it
            pStepForm.addSubmitButtonMessage('Your form is being submitted. Please wait.')
            pStepForm.makeAlertSuccessful()
            $('button.main-btn').remove();
        } else {
            e.preventDefault();
        }
    })
})