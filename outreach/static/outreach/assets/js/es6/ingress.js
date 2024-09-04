$(function () {

    "use strict";

    // STEP FORM

    const pStepForm = {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function () {
            $('body').on('change','#id_ingress', function(e){
                var validate = pStepForm.FileValidate(e)
                if(validate){
                    $('#id_ingress_form .btn-primary').prop('disabled', false);
                }
                else{
                    $('#id_ingress_form .btn-primary').prop('disabled', true);
                }
                
            }),
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
            });
            
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
})