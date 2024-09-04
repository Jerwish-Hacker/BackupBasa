$(document).ready(function () {
    const UserLogin = {
        positionid: '',
        otp:'',
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        settimeoutmemberiderror :null,
        settimeoutotperror:null,
        toggle:0,


        otpgenerate() {
            console.log(this.positionid)
            $.ajax({
                type: "POST",
                url: "/vaccine/api/v1/otpgenerate/",
                data: {
                    positionid: this.positionid,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.is_member===1){
                        if(this.toggle===0){
                            $('.login').toggleClass("d-none");
                            $('#textmessageregardingmail').html('An email has been sent to your Clinica Sierra Vista email address. Please check your email and enter the 9-digit passcode to login.')
                            this.toggle=1
                        }
                        starttimer()
                    }
                    else{
                        $('.fa-spinner').addClass('d-none')
                        clearTimeout(this.settimeoutmemberiderror);
                        document.getElementById("memberiderror").innerHTML = "Employee ID does not exist";
                        $('#memberiderror').removeClass('d-none')
                        this.settimeoutmemberiderror = setTimeout(function(){ 
                            $('#memberiderror').addClass('d-none') 
                        }, 5000);
                    }
                },
                error: (err) => {
                }
            })
        },
        otpvalidate() {
            $.ajax({
                type: "POST",
                url: "/vaccine/api/v1/otpvalidate/",
                data: {
                    positionid: this.positionid,
                    otp: this.otp,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.is_otpvalid===0){
                        clearTimeout(this.settimeoutotperror);
                        document.getElementById("memberotperror").innerHTML = "Invalid OTP";
                        $('#memberotperror').removeClass('d-none')
                        this.settimeoutotperror = setTimeout(function(){ 
                            $('#memberotperror').addClass('d-none') 
                        }, 5000);
                    }
                    else{
                        /* I had changed the location to covid_booster here we have finished covid vaccine data collection now after login it should go to covid booster page*/
                        window.location.href='/vaccine/covid-booster/'
                    }
                },
                error: (err) => {
                }
            })
        },
        
    }
    $("body").on('click', '#otpgeneratebutton', function () {
        UserLogin.positionid = $('#memeberidvalue').val()
        if(UserLogin.positionid !== ''){
            $('.fa-spinner').removeClass('d-none')
            UserLogin.otpgenerate()
        }
        else{
            clearTimeout(UserLogin.settimeoutmemberiderror);
            document.getElementById("memberiderror").innerHTML = "Employee ID is required";
            $('#memberiderror').removeClass('d-none')
            UserLogin.settimeoutmemberiderror = setTimeout(function(){ 
                $('#memberiderror').addClass('d-none') 
            }, 5000);
        }

    })
    $("body").on('click', '#loginbutton', function () {
        UserLogin.otp = $('#otpvalue').val()
        if(UserLogin.otp !== ''){
            UserLogin.otpvalidate()
        }
        else{
            clearTimeout(UserLogin.settimeoutotperror);
            document.getElementById("memberotperror").innerHTML = "OTP is required";
            $('#memberotperror').removeClass('d-none')
            UserLogin.settimeoutotperror=setTimeout(function(){ 
                $('#memberotperror').addClass('d-none') 
            }, 5000);
        }

    })
    $("body").on('click', '#resendotp', function () {
        clearInterval(UserLogin.otptimer);
        UserLogin.otpgenerate()
    })
    
    function starttimer(){
        var timeleft = 120;
        UserLogin.otptimer = setInterval(function(){
        if(timeleft < 0){
          clearInterval(UserLogin.otptimer);
          document.getElementById("countdown").innerHTML = `<p class="text-danger">OTP Expired</p>`
        } else {
          document.getElementById("countdown").innerHTML = "OTP Expires in : " +timeleft +" Seconds";
        }
          timeleft -= 1;
        }, 1000);
    }
})      