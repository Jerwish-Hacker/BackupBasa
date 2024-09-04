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
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function () {

            $('body').on('click','#id_submit_button',function(){
                var validation = false
                const email = $('#id_email').val()
                const password = $('#id_password').val()
                validation = pStepForm.LoginValidate()
                if(validation){
                    pStepForm.LoginSubmit(email,password,null,null,'Login')
                }
            })
            

            $('body').on('click','.signin_logo',function(){
                $('.register').addClass('d-none')
                $('#id_hidden_type').val('Login')
                $('#id_submit_button').removeClass('d-none')
            })

            $('body').on('click','#id_register_button',function(){
                if($('#id_hidden_type').val()=="Register"){
                    var validation = false
                    const email = $('#id_email').val()
                    const password = $('#id_password').val()
                    const firstname = $('#id_firstname').val()
                    const lastname = $('#id_lastname').val()
                    validation = pStepForm.registerValidate()
                    if(validation){
                        pStepForm.LoginSubmit(email,password,firstname,lastname,'Register')
                    }

                }
                else if($('#id_hidden_type').val()=="Login"){
                    $('.register').removeClass('d-none')
                    $('#id_submit_button').addClass('d-none')
                    $('#id_hidden_type').val('Register')
                }
            })

            $('#addfile').click(function() {
                pStepForm.filenumber = pStepForm.filenumber + 1
                $('#id_file_'+pStepForm.filenumber).removeClass('d-none')
            });

        },
        LoginValidate: function(){
            const email = $('#id_email').val()
            var pattern = /^\b[A-Z0-9._%-]+@[A-Z]+[^.]+\.[A-Z]{2,4}\b$/i
            if(!pattern.test(email)){
                $('#id_email').addClass('error')
                return false
            }
            const password = $('#id_password').val()
            $('#id_email').removeClass('error')
            $('#id_password').removeClass('error')
            if(email==''){
                 $('#id_email').addClass('error')
                 return false
            }
            if(password==''){
                $('#id_password').addClass('error')
                return false
            }
            return true
        },
        registerValidate: function(){
            $('#id_email').removeClass('error')
            $('#id_password').removeClass('error')
            $('#id_confirmpassword').removeClass('error')
            $('#id_firstname').removeClass('error')
            $('#id_lastname').removeClass('error')
            $('.error_notify').addClass("d-none")
            const email = $('#id_email').val()
            const firstname = $('#id_firstname').val()
            const lastname = $('#id_lastname').val()
            var pattern = /^\b[A-Z0-9._%-]+@[A-Z]+[^.]+\.[A-Z]{2,4}\b$/i
            const error_elements = []
            if(!pattern.test(email)){
                error_elements.push('email')
            }
            const password = $('#id_password').val()
            if(password!==$('#id_confirmpassword').val()){
                $('.error_notify').removeClass("d-none")
                $('.error_notify').html("Password not match")
                error_elements.push('confirmpassword')
            }
            if(firstname==''){
                error_elements.push('firstname')
            }
            if(lastname==''){
                error_elements.push('lastname')
            }
            if(password==''){
                error_elements.push('password')
            }
            if(error_elements.length>0){
                pStepForm.renderError(error_elements)
                return false
            }
            return true
        },
        LoginSubmit(email,password,firstname,lastname,type) {
            $.ajax({
                type: "POST",
                url: "/api/v1/authenticate/",
                data: {
                    email: email,
                    password: password,
                    firstname: firstname,
                    lastname: lastname,
                    type: type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status==2){
                        $('.error_notify').removeClass('d-none')
                        $('.error_notify').html('Please enter correct username or password')
                        setTimeout(function () {
                            $('.error_notify').addClass('d-none')
                        }, 3000)
                    }
                    else if(res.status==0){
                        $('.error_notify').removeClass('d-none')
                        $('.error_notify').html('Something happened. Please try again later')
                        setTimeout(function () {
                            $('.error_notify').addClass('d-none')
                        }, 3000)
                    }
                    else{
                        window.location.reload()
                    }
                },
                error: (err) => {
                    $('.error_notify').removeClass('d-none')
                    $('.error_notify').html('Something happened. Please try again later')
                    setTimeout(function () {
                        $('.error_notify').addClass('d-none')
                    }, 3000)
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
            elements.forEach(function (element) {
                $(`input[name="${element}"]`).addClass('error')
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
    }
    pStepForm.init()
})