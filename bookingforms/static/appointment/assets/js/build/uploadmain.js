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
        date_of_birth: /\d{2}\/\d{2}\/\d{4}/
    };

    const pStepForm = {
        filenumber: 1,
        init: function () {
            $('body').on('click', '.file-hidden button', function () {
                let input_file = $(this).closest('.file-hidden').find('input[type="file"]');
                $(input_file).click();
            });

            $('#addfile').click(function () {
                pStepForm.filenumber = pStepForm.filenumber + 1;
                $('#id_file_' + pStepForm.filenumber).removeClass('d-none');
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
                    if (file_ext != 'png' && file_ext != 'pdf' && file_ext != 'jpg' && file_ext != 'jpeg') {
                        document.pStepForm.addSubmitButtonErrorMessage('Not a supported file type like png, pdf, png, jpeg.');
                        is_wrong_file = true;
                    }
                    if (file_size >= 20 * 1024 * 1024) {
                        document.pStepForm.addSubmitButtonErrorMessage('Not a supported file size. Should be less than 20MB');
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
            if ($('#captcha-widget-id').length) {
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
        }
    };
    $.ajaxSetup({
        beforeSend: function (xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    pStepForm.init();
    document.pStepForm = pStepForm;

    $('#upload_save_form').submit(function (e) {
        var validationFlag = pStepForm.validate();
        if (validationFlag) {
            // Valid let the form do it
            document.pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.');
            document.pStepForm.makeAlertSuccessful();
            $('button.main-btn').remove();
            $('button.cancel-btn').remove();
        } else {
            e.preventDefault();
        }
    });
});