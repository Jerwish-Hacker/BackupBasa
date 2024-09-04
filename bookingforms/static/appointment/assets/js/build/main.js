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
        date_of_birth: /\d{2}\/\d{2}\/\d{4}/,
        guarantor_date_of_birth: /\d{2}\/\d{2}\/\d{4}/,
        family_size: /^[\d]+$/,
        household_income: /^[\d]+$/,
        zip_code: /^[\d]{5}$/,
        social_security_number: /\d{3}-\d{2}-\d{4}/,
        contact_number: /^\(\d{3}\)\s\d{3}\-\d{4}$/,
        emergency_contact_number: /^\(\d{3}\)\s\d{3}\-\d{4}$/
    };

    const pStepForm = {
        step_element: null,
        step_element1: null,
        form_element: null,
        step: 0,
        nextButton: $('.p-step-form form button.main-btn'),
        prevButton: $('.p-step-form form button.cancel-btn'),
        noValidate: [],
        isFarmworkerurl: false,
        isDelanourl: false,
        isLamonturl: false,
        isSlotNotFull: false,
        init: function () {
            console.log("here");
            this.step_element = $('.p-step-form .form-steps .step');
            this.step_element1 = $('.p-step-form .fixed-steps .form-steps .step');
            this.form_element = $('.p-step-form form>.step-form');
            this.noValidate.push('temp_1');
            // this.noValidate.push('is_declaration_accepted')
            this.noValidate.push('description');
            this.noValidate.push('group_number');
            this.noValidate.push('identification_document');
            this.noValidate.push('temp_2');
            this.noValidate.push('group_number');
            this.noValidate.push('insurance_card_back');
            this.noValidate.push('insurance_card');
            this.noValidate.push('identification_document');
            this.noValidate.push('attachment_support');
            this.noValidate.push('emergency_contact_relationship_entered');
            this.noValidate.push('primary_langauge_entered');
            this.noValidate.push('covid_vaccine_manufacturer');

            var me = this;
            $(this.nextButton).click(function () {
                this.next();
            }.bind(this));
            $(this.prevButton).click(function () {
                this.prev();
            }.bind(this));
            this.render();

            $('body').on('click', '.file-hidden button', function () {
                let input_file = $(this).closest('.file-hidden').find('input[type="file"]');
                $(input_file).click();
            });

            $('input[name="is_previously_vaccinated"]').change(function () {
                let input_value = $(this).val();
                const radio_button = $('input[name="covid_vaccine_manufacturer"]');
                let radio_button_linked = $('.removed-col-vaccine');
                if (input_value === "true") {
                    $(radio_button_linked).removeClass('d-none');
                    $(radio_button[0]).prop('checked', true);
                } else {
                    $(radio_button_linked).addClass('d-none');
                    $('input[name="covid_vaccine_manufacturer"]').prop('checked', false);
                }
            });

            $('input[name="covid_vaccine_manufacturer"]').change(function () {

                let input_value = $('input[name="is_previously_vaccinated"]:checked').val();
                if (input_value === "no") $('input[name="covid_vaccine_manufacturer"]').prop('checked', false);
            });

            $('select[name="appointment_type"]').change(function () {
                let input_value = $(this).val();
                let select_value_divison = $('.vaccine-manufacturer-select');
                let input_value_divison = $('.prevoisly_vaccinated_question');
                let radio_button_linked = $('.removed-col-vaccine');
                if (input_value !== "COVID-19 Vaccine") {
                    $(select_value_divison).removeClass('d-none');
                    $(input_value_divison).addClass('d-none');
                    $(radio_button_linked).addClass('d-none');
                    $('input[name="covid_vaccine_manufacturer"]').prop('checked', false);
                    $('input[name="is_previously_vaccinated"]').prop('checked', false);
                    me.removeFromNoValidate('covid_vaccine_manufacturer');
                } else {
                    $(select_value_divison).addClass('d-none');
                    $(input_value_divison).removeClass('d-none');
                    $('input[name="is_previously_vaccinated"]').prop('checked', true);
                    $('select[name="covid_vaccine_manufacturer"]').val('');
                    if (!me.noValidate.includes('covid_vaccine_manufacturer')) {
                        me.noValidate.push('covid_vaccine_manufacturer');
                    }
                }
            });
            $('select[name="covid_vaccine_manufacturer"]').change(function () {
                let input_value = $(this).val();
                if (input_value !== 'Moderna') {
                    console.log("if");
                    var choices = [['Fresno - Addams Elementary Health and Wellness Center', 'Fresno - Addams Elementary Health and Wellness Center'], ['Kern – East Bakersfield Community Health Center', 'Kern – East Bakersfield Community Health Center'], ['Fresno - Gaston Middle School Health and Wellness Center', 'Fresno - Gaston Middle School Health and Wellness Center'], ['Kern – Greenfield Community Health Center', 'Kern – Greenfield Community Health Center'], ['Kern – Lamont Community Health Center', 'Kern – Lamont Community Health Center'], ['Fresno - North Fine', 'Fresno - North Fine']];
                    pStepForm.renderSelectBox('county', choices, 'Select Location');
                } else {
                    var choices = JSON.parse($('#vaccinate_location').val());
                    pStepForm.renderSelectBox('county', choices, 'Select Location');
                }
            });
            //If farmworker url then these fields are not important
            if (this.isFarmworkerurl == true || this.isDelanourl == true || this.isLamonturl == true) {
                this.noValidate.push('emergency_contact_name');
                this.noValidate.push('emergency_contact_number');
                this.noValidate.push('emergency_contact_relationship');
                this.noValidate.push('email_address');
                this.isSlotNotFull = true;
                setTimeout(function () {
                    $("#farmworkerdefaultcheckedincome").click();
                    $("#farmworkerdefaultcheckedssn").click();
                }, 500);
            }
            // $('input[name="is_healthworker"]').change(function () {
            //     var input_value = $(this).val();
            //     var radio_button = $('input[name="is_above_age_65"]');
            //     var radio_button_linked = $('.is-65-years-old-and-over');

            //     if (input_value === "false") {
            //         $(radio_button_linked).removeClass('d-none');
            //         me.removeFromNoValidate('is_above_age_65');
            //     } else {
            //         $(radio_button_linked).addClass('d-none');
            //         me.noValidate.push('is_above_age_65');
            //         radio_button.prop('checked', false);
            //     }
            // });

            //$('select[name="appointment_type"]').change(function() {
            //var related_not_required = ["is_healthworker","is_above_age_65"];
            //var firstItem = 'Select Location';
            //if ($(this).val() == 'COVID-19 Testing')
            //{
            // $('.js-healthworker-or-65-years').addClass('d-none');
            // related_not_required.forEach(function(value,index,array){
            //     me.noValidate.push(value);
            // })
            //var choices = JSON.parse($('#testing_location').val());
            //console.log("Testing")
            //}
            //else if($(this).val() == 'COVID-19 Vaccine')
            //{
            // $('.js-healthworker-or-65-years').removeClass('d-none');
            // related_not_required.forEach(function(value,index,array){
            //     me.removeFromNoValidate(value);
            //     $(`input[name=${value}]`).prop('checked',false)
            // })
            // var choices = JSON.parse($('#vaccinate_location').val());
            //$('.js-vaccine-healthworker-confirm').addClass('show');
            //$('#vaccine-first-for-health-or-65-modal').modal('show')
            //}
            //else
            //{
            //    $('#vaccine-first-for-health-or-65-modal').modal('hide')
            //}
            //me.renderSelectBox("county",choices, firstItem);
            //})
            // let input_value = $('input[name="is_healthworker_or_above_age_65"]:checked').val()
            // if(input_value === "false"){
            //     $('form button.main-btn').attr('disabled',true)
            // }

            // $('input[name="is_healthworker_or_above_age_65"]').change(function () {
            //     let input_value = $('input[name="is_healthworker_or_above_age_65"]:checked').val()
            //     if(input_value === "false"){
            //         $('#alert-for-patient-submit').removeClass('d-none')
            //         $('form button.main-btn').attr('disabled',true)
            //     }else{
            //         $('#alert-for-patient-submit').addClass('d-none')
            //         $('form button.main-btn').attr('disabled',false)
            //     }

            // })

            // $('.js-vaccine-healthworker-confirm').click(function(){
            //     $('#vaccine-first-for-health-or-65-modal').modal('hide')
            // });
            $('select[name="county"]').change(function () {
                var county = $("#id_county").val();
                if (county != "Any Bakersfield Availability") {
                    $("#id_preferred_day_of_week").val('');
                    $('#day_table').addClass('d-none');
                    $('#date_table').removeClass('d-none');
                    if (!me.noValidate.includes('preferred_day_of_week')) {
                        me.noValidate.push('preferred_day_of_week');
                    }
                    me.removeFromNoValidate('preferred_date');
                    if (county == "Kern – Kern River Community Health Center") {
                        var day1 = 2;
                        var day2 = 7;
                        var day3 = 7;
                        var day4 = 7;
                        var day5 = 7;
                        var day6 = 7;
                        var disableddate = [];
                        me.datepickerrender(day1, day2, day3, day4, day5, day6, disableddate);
                        me.fielddisabling();
                    } else if (county == "Kern – Greenfield Community Health Center") {
                        var day1 = 2;
                        var day2 = 3;
                        var day3 = 4;
                        var day4 = 5;
                        var day5 = 7;
                        var day6 = 7;
                        var disableddate = [];
                        me.datepickerrender(day1, day2, day3, day4, day5, day6, disableddate);
                        me.fielddisabling();
                    } else if (county == "Kern – East Bakersfield Community Health Center") {
                        var day1 = 1;
                        var day2 = 2;
                        var day3 = 3;
                        var day4 = 4;
                        var day5 = 7;
                        var day6 = 7;
                        var disableddate = [];
                        me.datepickerrender(day1, day2, day3, day4, day5, day6, disableddate);
                        me.fielddisabling();
                    } else if (county == "Kern – Frazier Mountain Community Health Center") {
                        var day1 = 3;
                        var day2 = 7;
                        var day3 = 7;
                        var day4 = 7;
                        var day5 = 7;
                        var day6 = 7;
                        var disableddate = [];
                        me.datepickerrender(day1, day2, day3, day4, day5, day6, disableddate);
                        me.fielddisabling();
                    } else if (county == "Kern – Lamont Community Health Center") {
                        var day1 = 1;
                        var day2 = 2;
                        var day3 = 3;
                        var day4 = 4;
                        var day5 = 5;
                        var day6 = 6;
                        var disableddate = ["2021-05-01"];
                        me.datepickerrender(day1, day2, day3, day4, day5, day6, disableddate);
                        me.fielddisabling();
                    } else if (county == "Fresno – ELM CHC" || county == "Fresno - North Fine" || county == "Fresno - Orange & Buttler CHC" || county == "Fresno - Regional Medical CHC" || county == "Fresno - West Fresno CHC" || county == "Fresno - West Shaw CHC" || county == "Fresno - Addams Elementary Health and Wellness Center" || county == "Fresno - Gaston Middle School Health and Wellness Center") {
                        var day1 = 1;
                        var day2 = 2;
                        var day3 = 3;
                        var day4 = 4;
                        var day5 = 5;
                        var day6 = 7;
                        var disableddate = [];
                        me.datepickerrender(day1, day2, day3, day4, day5, day6, disableddate);
                        me.fielddisabling();
                    } else if (county == '') {
                        $("#id_preferred_date").val('');
                        $('#id_preferred_date').prop('disabled', true);
                        $('#id_preferred_time_frame').prop('disabled', true);
                        $('#id_preferred_date').css({ 'background': '#dddddd', 'opacity': '0.5' });
                        $('#id_preferred_time_frame').css({ 'background': '#dddddd', 'opacity': '0.5' });
                        $('#id_preferred_time_frame').val('');
                    }
                } else {
                    $('#id_preferred_day_of_week').prop('disabled', false);
                    $('#id_preferred_time_frame').prop('disabled', false);
                    $('#id_preferred_day_of_week').css({ 'background': '#ffffff', 'opacity': '1' });
                    $('#id_preferred_time_frame').css({ 'background': '#ffffff', 'opacity': '1' });
                    $("#id_preferred_date").val('1111-11-11');
                    $('#day_table').removeClass('d-none');
                    $('#date_table').addClass('d-none');
                    if (!me.noValidate.includes('preferred_date')) {
                        me.noValidate.push('preferred_date');
                    }
                    me.removeFromNoValidate('preferred_day_of_week');
                    var choices_for_day = JSON.parse($('#day_regular').val());
                    me.renderSelectBox("preferred_day_of_week", choices_for_day, 'Select a Preferred day of week');
                    var choices_time_frame = JSON.parse($('#regular_time_frame').val());
                    me.renderSelectBox("preferred_time_frame", choices_time_frame, 'Select a Time');
                }
            });

            const check_box_inputs = [];
            const all_decline_checkbox = $('.decline_checkbox');
            for (let i = 0; i < all_decline_checkbox.length; i++) {
                check_box_inputs.push($(`input[name="${$(all_decline_checkbox[i]).data('input')}"]`));
            }

            $('.decline_checkbox').change(function () {
                const related_element_id = $(this).data('trigger');

                let components = [];
                if (related_element_id !== undefined) {
                    let temp = $(related_element_id).find('input');
                    for (let i = 0; i < temp.length; i++) {
                        components.push(temp[i]);
                    }
                    temp = $(related_element_id).find('select');
                    for (let i = 0; i < temp.length; i++) {
                        components.push(temp[i]);
                    }
                }
                if ($(this).prop("checked") == true) {
                    $(related_element_id).addClass('d-none');
                    $(`input[name="${$(this).data('input')}"]`).val('');
                    $(`input[name="${$(this).data('input')}"]`).attr('readonly', true);
                    components.forEach(function (c) {
                        $(c).val("");
                        if (!pStepForm.noValidate.includes($(c).attr('name'))) {
                            pStepForm.noValidate.push($(c).attr('name'));
                        }
                    });
                } else {
                    $(related_element_id).removeClass('d-none');
                    $(`input[name="${$(this).data('input')}"]`).attr('readonly', false);
                    components.forEach(function (c) {
                        const index = pStepForm.noValidate.indexOf($(c).attr('name'));
                        if (index > -1 && $(c).attr('name') !== "group_number") {
                            pStepForm.noValidate.splice(index, 1);
                        }
                    });
                }
            });

            $('.other-select').change(function () {
                const related_element_id = $(this).data('trigger');
                let components = [];
                if (related_element_id !== undefined) {
                    let temp = $(related_element_id).find('input');
                    for (let i = 0; i < temp.length; i++) {
                        components.push(temp[i]);
                    }
                    temp = $(related_element_id).find('select');
                    for (let i = 0; i < temp.length; i++) {
                        components.push(temp[i]);
                    }
                }
                const value = $(this).val();
                if (value === "Other") {
                    $(related_element_id).removeClass('d-none');
                    $(`select[name="${$(this).data('input')}"]`).val('');
                    $(`select[name="${$(this).data('input')}"]`).change();

                    $(`input[name="${$(this).data('input')}"]`).attr('readonly', true);
                    $(`select[name="${$(this).data('input')}"]`).attr('disabled', true);

                    components.forEach(function (c) {
                        const index = pStepForm.noValidate.indexOf($(c).attr('name'));
                        if (index > -1 && $(c).attr('name') !== "group_number") {
                            pStepForm.noValidate.splice(index, 1);
                        }
                    });
                } else {
                    $(related_element_id).addClass('d-none');
                    $(`input[name="${$(this).data('input')}"]`).val('');
                    $(`input[name="${$(this).data('input')}"]`).attr('readonly', false);
                    $(`select[name="${$(this).data('input')}"]`).attr('disabled', false);
                    components.forEach(function (c) {
                        $(c).val("");
                        if (!pStepForm.noValidate.includes($(c).attr('name'))) {
                            pStepForm.noValidate.push($(c).attr('name'));
                        }
                    });
                }
            });

            // FILE VALIDATION
            $('input[type="file"]').change(function (event) {
                const related_input = $(this).parent().find('input[type="text"]');
                if (event.target.files[0] !== undefined) {
                    const file_name = event.target.files[0].name.split('.');
                    const file_size = event.target.files[0].size;

                    $(related_input).removeClass('error');
                    var file_ext = file_name[file_name.length - 1];
                    var is_wrong_file = false;
                    if (file_ext != 'png' && file_ext != 'pdf' && file_ext != 'jpg') {
                        document.pStepForm.addSubmitButtonErrorMessage('Not a supported file type like png, pdf, png.');
                        is_wrong_file = true;
                    }
                    if (file_size >= 3 * 1024 * 1024) {
                        document.pStepForm.addSubmitButtonErrorMessage('Not a supported file size. Should be less than 3MB');
                        is_wrong_file = true;
                    }
                    if (is_wrong_file) {
                        console.log("FILE NOT OK");
                        $(this).val('');
                        $(related_input).val('');
                        $(related_input).addClass('error');
                    } else {
                        console.log("FILE OK");
                        $(related_input).val(file_name);
                    }
                } else {
                    $(related_input).val('');
                }
            });

            // document
            $('.document-select').change(function () {
                const target = $(this).data('target');
                if ($(this).val() === "") {
                    $('input[name="attachment_support"]').val('');
                    $('input[name="attachment_support"]').change();
                    $(target).attr('disabled', true);
                } else {
                    $(target).attr('disabled', false);
                }
            });
        },
        render: function () {
            $(this.step_element).removeClass('active');
            $(this.step_element).find('.step-item').removeClass('active');
            for (let i = 0; i < 4; i++) {
                $(this.step_element[i]).find('.step-item').html(i + 1);
                $(this.step_element[i]).find('.step-item').removeClass('current');
            }
            for (let i = 0; i < this.step; i++) {
                $(this.step_element[i]).find('.step-item').addClass('active');
                $(this.step_element[i]).find('.step-item').html('&#x2713;');
                $(this.step_element[i]).addClass('active');
            }
            $(this.step_element[this.step]).find('.step-item').addClass('current');
            for (let i = 0; i < 4; i++) {
                $(this.step_element1[i]).find('.step-item').html(i + 1);
                $(this.step_element1[i]).find('.step-item').removeClass('current');
            }
            for (let i = 0; i < this.step; i++) {
                $(this.step_element1[i]).find('.step-item').addClass('active');
                $(this.step_element1[i]).find('.step-item').html('&#x2713;');
                $(this.step_element1[i]).addClass('active');
            }
            $(this.step_element1[this.step]).find('.step-item').addClass('current');
            if (this.step !== 3) {
                $(this.nextButton).attr('type', 'button');
                $(this.nextButton).text('Next Step');
                $('#captcha-in-submit-page').addClass('d-none');
                this.resetCaptcha();
            } else {
                setTimeout(function () {
                    $(this.nextButton).attr('type', 'submit');
                }.bind(this), 500);
                $(this.nextButton).text('Submit');
                $('#captcha-in-submit-page').removeClass('d-none');
            }
            $(this.form_element).addClass('d-none');
            $(this.form_element[this.step]).removeClass('d-none');
            if (this.step !== 0) {
                const offsetOfForm = $('form').offset().top;
                $("html, body").scrollTop(offsetOfForm);
            }
        },
        next: function () {
            this.removeError();
            if (!this.validate()) {
                return;
            }
            $(this.prevButton).removeClass('d-none');
            if (this.step < 3) {
                this.step++;
                this.render();
            }
        },
        prev: function () {
            if (this.step > 0) {
                this.step--;
                if (this.step == 0) $(this.prevButton).addClass('d-none');
                this.render();
            } else {
                $(this.prevButton).addClass('d-none');
            }
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
        resetCaptcha: function () {
            try {
                if (window.grecaptcha) {
                    grecaptcha.reset();
                }
            } catch (error) {
                console.log('This error is catched: ', error);
            }
        },
        validate: function () {
            const current_form = this.form_element[this.step];
            const all_input_elements = $(current_form).find('input');
            const all_radio_input_elements = $(current_form).find('.is-validation-needed input[type=radio]');
            const all_select_elements = $(current_form).find('select');
            const all_textarea_elements = $(current_form).find('textarea');
            const error_elements = [];
            for (let i = 0; i < all_input_elements.length; i++) {
                if (!$(all_input_elements[i]).hasClass('decline_checkbox')) {
                    const isReadable = $(all_input_elements[i]).attr('readonly') === undefined ? true : false;
                    var readonly_required_names = ['preferred_date', 'date_of_birth', 'guarantor_date_of_birth'];

                    if (readonly_required_names.includes($(all_input_elements[i]).attr('name')) || isReadable) {
                        const input_name = $(all_input_elements[i]).attr('name');
                        if ($(all_input_elements[i]).val() === "") {
                            if (!this.noValidate.includes(input_name)) {
                                error_elements.push(all_input_elements[i]);
                            }
                        } else {
                            if (validation.hasOwnProperty(input_name)) {
                                if (!validation[input_name].test($(all_input_elements[i]).val())) {
                                    error_elements.push(all_input_elements[i]);
                                }
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() === "") {
                    const input_name = $(all_select_elements[i]).attr('name');
                    if (!this.noValidate.includes(input_name)) error_elements.push(all_select_elements[i]);
                }
            }
            for (let i = 0; i < all_textarea_elements.length; i++) {
                if ($(all_textarea_elements[i]).val() === "") {
                    const input_name = $(all_textarea_elements[i]).attr('name');
                    if (!this.noValidate.includes(input_name)) error_elements.push(all_textarea_elements[i]);
                }
            }
            var me = this;
            all_radio_input_elements.each(function () {
                const input_name = $(this).attr('name');
                if (!me.noValidate.includes(input_name)) {
                    if (!$(`input[name=${input_name}]:checked`).val()) error_elements.push($(this));
                }
            });

            if (error_elements.length > 0) {
                this.renderError(error_elements);
                return false;
            }
            const declaration_checkbox = $('input[type="checkbox"][name="is_declaration_accepted"]');
            if (this.step == 3 && $(declaration_checkbox).prop('checked') === false) {
                this.addSubmitButtonErrorMessage('Declaration should be accepted before submitting.');
                return false;
            } else {
                this.removeSubmitButtonErrorMessage();
            }
            if (this.step == 3 && $('#captcha-widget-id').length) {
                // Do check captcha validation
                var userCaptchaResponse = grecaptcha.getResponse();
                if (!userCaptchaResponse) {
                    this.addSubmitButtonErrorMessage('Captcha should be solved before submitting.');
                    // this.resetCaptcha()
                    return false;
                } else {
                    this.removeSubmitButtonErrorMessage();
                }
            }
            return true;
        },
        renderError: function (elements) {
            let offsetTop = 1000000;
            elements.forEach(function (element) {
                if ($(element).offset().top < offsetTop) offsetTop = $(element).offset().top;
                if ($(element).attr('type') == 'radio') {
                    $(element).closest('.radio').addClass('radio-button-error');
                }
                $(element).addClass('error');
            });

            $(window).scrollTop(offsetTop - 140);
        },
        removeError: function () {
            const current_form = this.form_element[this.step];
            const all_input_elements = $(current_form).find('input');
            const all_select_elements = $(current_form).find('select');
            const all_textarea_elements = $(current_form).find('textarea');
            $('div.radio').each(function () {
                $(this).removeClass('radio-button-error');
            });
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('error');
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                $(all_select_elements[i]).removeClass('error');
            }
            for (let i = 0; i < all_textarea_elements.length; i++) {
                $(all_textarea_elements[i]).removeClass('error');
            }
        },
        syncDeclinedInputs: function () {
            // Workaround: Click event fires change event on those inputs. 2 click ensures value is same 
            $('.decline_checkbox[type=checkbox]').click().click();
        },
        removeFromNoValidate: function (nameOfInput) {
            var index = this.noValidate.indexOf(nameOfInput);
            if (index > -1) this.noValidate.splice(index, 1);
        },
        renderSelectBox: function (nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            if (this.isFarmworkerurl || this.isDelanourl || this.isLamonturl) {
                choices.forEach(function (value, index, array) {
                    allOptions += `<option value="${value[0]}">${value[1]}<options>`;
                });
            } else {
                choices = [['', firstItem]].concat(choices);
                choices.forEach(function (value, index, array) {
                    allOptions += `<option value="${value[0]}">${value[1]}<options>`;
                });
            }
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
        slotrendering: function () {
            var location = $('#id_county').val();
            var date = $('#id_preferred_date').val();
            date = date.split("/").reverse().join("-");
            $.ajax({
                type: "GET",
                url: `/appointment/slotrender/${location}/${date}/`,
                success: res => {
                    var optionsHtml = '';
                    res['preferred_time'].forEach(function (time) {
                        optionsHtml += `<option value="${time[0]}">${time[1]}</option>`;
                    });
                    $('#id_preferred_time_frame').prop('disabled', false);
                    $('#id_preferred_time_frame').css({ 'background': '#ffffff', 'opacity': '1' });
                    $("#id_preferred_time_frame").html($(optionsHtml));
                },
                error: () => {
                    console.log("errors");
                    return false;
                }
            });
        },
        datepickerrender: function (day1, day2, day3, day4, day5, day6, disableddate) {
            $("#id_preferred_date").val('');
            $(".datepickerform1").datepicker("destroy");
            $(".datepickerform1").datepicker({
                changeMonth: true,
                changeYear: true,
                yearRange: "c:+5",
                defaultDate: "-147y",
                minDate: new Date(),
                beforeShowDay: function (date) {
                    var day = date.getDay();
                    var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
                    return [disableddate.indexOf(string) == -1 && (day == day1 || day == day2 || day == day3 || day == day4 || day == day5 || day == day6)];
                },
                onSelect: function () {
                    document.pStepForm.slotrendering();
                }
            });
            $(".datepickerform1").datepicker("refresh");
        },
        fielddisabling: function () {
            $('#id_preferred_time_frame').prop('disabled', true);
            $('#id_preferred_time_frame').css({ 'background': '#dddddd', 'opacity': '0.5' });
            $('#id_preferred_date').prop('disabled', false);
            $('#id_preferred_date').css({ 'background': '#ffffff', 'opacity': '1' });
            $('#id_preferred_time_frame').val('');
        },
        //Checking the url if farmworker or not
        slotchecking: function () {
            var time = $('#id_preferred_time_frame').val();
            var date = $('#id_preferred_date').val();
            var location = $('#id_county').val();
            date = date.split("/").reverse().join("-");
            $.ajax({
                type: "GET",
                url: `/appointment/slotcheck/${time}/${location}/${date}/`,
                success: res => {
                    if (res != 'SlotIsFull') {
                        this.isSlotNotFull = true;
                    } else {
                        this.isSlotNotFull = false;
                        $(`#id_preferred_time_frame option[value="${time}"]`).text(time + ' (Slot Full)');
                        $(`#id_preferred_time_frame option[value="${time}"]`).val('').change();
                    }
                },
                error: () => {
                    console.log("error");
                    return false;
                }
            });
        },
        farmWorkerUrlCheck: function () {
            if (window.location.pathname.slice(1, 12) == "farmworkers") {
                this.isFarmworkerurl = true;
            }
        },
        delanoUrlCheck: function () {
            if (window.location.pathname.slice(1, 7) == "delano") {
                this.isDelanourl = true;
            }
        },
        lamontUrlCheck: function () {
            if (window.location.pathname.slice(1, 7) == "lamont") {
                this.isLamonturl = true;
            }
        }
    };

    pStepForm.farmWorkerUrlCheck();
    pStepForm.delanoUrlCheck();
    pStepForm.lamontUrlCheck();
    pStepForm.init();
    pStepForm.syncDeclinedInputs();
    var choices = JSON.parse($('#vaccinate_location').val());
    pStepForm.renderSelectBox('county', choices, 'Select Location');
    if (pStepForm.isFarmworkerurl == false && pStepForm.isLamonturl == false && pStepForm.isDelanourl == false) {
        $('#id_preferred_day_of_week').prop('disabled', true);
        $('#id_preferred_time_frame').prop('disabled', true);
        $('#id_preferred_day_of_week').css({ 'background': '#dddddd', 'opacity': '0.5' });
        $('#id_preferred_time_frame').css({ 'background': '#dddddd', 'opacity': '0.5' });
        var choices_for_day = JSON.parse($('#day_regular').val());
        var choices_time_frame = JSON.parse($('#regular_time_frame').val());
        pStepForm.renderSelectBox("preferred_time_frame", choices_time_frame, 'Select a Time');
        pStepForm.renderSelectBox('preferred_day_of_week', choices_for_day, 'Select a Preferred day of week');
    }

    document.pStepForm = pStepForm;

    var preferred_time_frame_status = $('#preferred_time_frame').val();
    if (preferred_time_frame_status) {
        document.pStepForm.addSubmitButtonErrorMessage('The time slot you have selected is taken. Please go back to the first page and choose another time and continue.');
    }

    const cityLoader = {
        stateSelector: '#id_state',
        citySelector: '#id_city',
        init: function () {
            $(this.stateSelector).change(function () {
                var selectedStateCode = $(this).val();
                $.get({
                    url: '/appointment/city-list/',
                    data: { state_code: selectedStateCode },
                    success: function (data, textStatus, jqXHR) {
                        var cities = [['', 'Select City']].concat(data.states);
                        var optionsHtml = '';
                        cities.forEach(function (city) {
                            optionsHtml += `<option value="${city[0]}">${city[1]}</option>`;
                        });
                        $(cityLoader.citySelector).html($(optionsHtml));
                    }
                });
            });
        }
    };
    $.ajaxSetup({
        beforeSend: function (xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    cityLoader.init();

    $('#id_is_declaration_accepted').change(function () {
        if ($(this).prop('checked') == true && !pStepForm.isFarmworkerurl && !pStepForm.isLamonturl && !pStepForm.isDelanourl) {
            pStepForm.slotchecking();
        }
    });

    $('.p-step-form form button.cancel-btn').click(function () {
        if ($('#id_is_declaration_accepted').prop('checked') == true) {
            $("#id_is_declaration_accepted").click();
        }
    });

    $('#appointment_save_form').submit(function (e) {
        var validationFlag = pStepForm.validate();
        if (validationFlag && pStepForm.isSlotNotFull) {
            // Valid let the form do it
            document.pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.');
            document.pStepForm.makeAlertSuccessful();
            $('button.main-btn').remove();
            $('button.cancel-btn').remove();
        } else {
            e.preventDefault();
            if ($('#id_is_declaration_accepted').prop('checked') == true && pStepForm.isSlotNotFull == false) {
                pStepForm.addSubmitButtonErrorMessage('The time slot you have selected is taken. Please go back to the first page and choose another time and continue.');
                $("#id_is_declaration_accepted").click();
            }
        }
    });

    // SCROLL
    $(window).scroll(function () {
        const formOffset = $('.p-step-form form').offset().top;
        const windowOffset = $(window).scrollTop();
        if (windowOffset >= formOffset) {
            $('.p-step-form .fixed-steps').css('display', 'block');
        } else {
            $('.p-step-form .fixed-steps').css('display', 'none');
        }
    });
});