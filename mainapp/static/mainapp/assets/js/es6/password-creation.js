$(function () {
    "use strict";
    const ConfigApp = {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        userId: $('input[name=user-id]').val(),
        init: function () {


        },
        pwcheck(value) {
            var pwdLength = /^.{10,16}$/;
            var pwdUpper = /[A-Z]+/;
            var pwdLower = /[a-z]+/;
            var pwdNumber = /[0-9]+/;
            var pwdSpecial = /[!@#$%^&()'[\]"?+-/*={}.,;:_]+/;
            if (pwdLength.test(value) && pwdUpper.test(value) && pwdLower.test(value) && pwdNumber.test(value) && pwdSpecial.test(value)) {
                return true
            } else {
                return false
            }

        }
       
    }
    ConfigApp.init();

    $("#id_set_password").click(function () {
        let input1 = $("#id_creation_form :input[name='password1']").val();
        let input2 = $("#id_creation_form :input[name='password2']").val();
        var error = $('#password-error-alert')
        // let currentUrl = window.location.href;
        // let domain = extractDomain(currentUrl);
        // console.log(currentUrl+"something")
        // console.log(domain)
        error.addClass('alert-danger').removeClass('alert-success')

        if (ConfigApp.pwcheck(input1) && input1 == input2) {

            

            $("#id_set_password").prop('disabled', true)
            $.ajax({
                type: "POST",
                url: "/api/set/password/",
                data: {
                    userid: ConfigApp.userId,
                    pwd: input1,                   
                    csrfmiddlewaretoken: ConfigApp.csrfmiddlewaretoken,
                },
                success: (res) => {

                    if (res.status == 0) {
                        error.html('Something went wrong! Try again')
                        error.removeClass('d-none')

                    }
                    if (res.status == 1) {
                        error.removeClass('alert-danger').addClass('alert-success')
                        error.html('Added successfully')
                        error.removeClass('d-none')
                        setTimeout(function () {                            
                            $('#id_card_title').html('Email verified')
                            $('#id_creation_form').addClass('d-none')                          
                            $('#id_redirect').removeClass('d-none')
                        }, 3000)
                    }
                },
                error: (err) => {
                }
            })
            $("#id_set_password").prop('disabled', false)

        }
        else if (!ConfigApp.pwcheck(input1)) {
            error.html('You have entered a weak password !')
            error.removeClass('d-none')

        }
        else if (input1 != input2) {
            error.html('Passwords are not matching !')
            error.removeClass('d-none')

        }
        setTimeout(function () {
            error.addClass('d-none')
            error.addClass('alert-danger').removeClass('alert-success')
        }, 3000)
    });
})