$(document).ready(function () {
    const UserDashboard = {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        // filenumber: 1,
        init() {
            

            // $('#addfile').click(function() {
            //     const all_input_file_elements = $('form').find('input[type="file"]')
            //     if(all_input_file_elements.length<=2){
            //         UserDashboard.filenumber = UserDashboard.filenumber + 1
            //         $('#filesContainer').append(
            //             $('<input class="fileclass pt-2"/>').attr('type', 'file').attr('name', 'file_'+UserDashboard.filenumber)
            //         );
            //     }
            // });
            if($("#id_employee_submitted_option").val()!=='None' && $("#id_employee_submitted_option").val()!==''){
                const option = $("#id_employee_submitted_option").val()
                const datetime = $("#id_employee_submission_datetime").val()
                if(option=='1'){
                    $("#id_reminder-text-one").html("Your latest submission on the vaccine booster shot is option #"+option)
                    $("#id_reminder-text-two").html("(I received my COVID-19 booster and will upload a copy of my vaccine card/proof of vaccine)")
                    $("#id_reminder-text-three").html("Submitted on "+datetime)
                }else if(option == '2'){
                    $("#id_reminder-text-one").html("Your latest submission on the vaccine booster shot is option #"+option)
                    $("#id_reminder-text-two").html("(I am currently not due for my COVID-19 booster and understand that I am required to test weekly until receipt of my COVID-19 booster.  Upon receiving I will upload a copy of my vaccine/proof of vaccine.)")
                    $("#id_reminder-text-three").html("Submitted on "+datetime)
                }else if(option == '3'){
                    $("#id_reminder-text-one").html("Your latest submission on the vaccine booster shot is option #"+option)
                    $("#id_reminder-text-two").html("(I will be submitting a medical or religious exemption request form to human resources for approval by no later than Monday, January 24, 2022.)")
                    $("#id_reminder-text-three").html("Submitted on "+datetime)
                }else{
                    $("#id_reminder-text-one").html("Your latest submission on the vaccine booster shot is option #"+option)
                    $("#id_reminder-text-two").html("(I will not be receiving the COVID-19 booster shot nor will I be submitting a medical or religious exemption request by the required due date.  With this selection, I am acknowledging that the COVID-19 booster is a requirement of my employment and refusal to follow this mandate as required will result in the termination of my employment with Clinica Sierra Vista.)")
                    $("#id_reminder-text-three").html("Submitted on "+datetime)
                }
                $("#already-submitted-emp-reminder-model").modal('show')
            }

            $("#error-model .btn-secondary").click(function(){
                location.reload()
            })

            $("#success-model .btn-secondary").click(function(){
                location.reload()
            })

            $('#flexCheckDefault1').change(function() {
                if(!this.checked) {
                    const all_input_file_elements = $('form').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('')
                    }
                }
            })

            $('#flexCheckDefault1').change(function() {
                if(this.checked) {
                    $(this).val('True')
                }
                else{
                    const all_input_elements = $('#collapseExample').find('input[type="text"]')
                    for (let i = 0; i < all_input_elements.length; i++) {
                        $(all_input_elements[i]).val('')
                    }
                    $(this).val('False')
                }
            })

            $('#flexCheckDefault2').change(function() {
                if(this.checked) {
                    $(this).val('True')
                }
                else{
                    const all_input_elements = $('#collapsecheckbox2').find('input[type="text"]')
                    for (let i = 0; i < all_input_elements.length; i++) {
                        $(all_input_elements[i]).val('')
                    }
                    $(this).val('False')
                }
            })

            $('#flexCheckDefault3').change(function() {
                if(this.checked) {
                    $(this).val('True')
                }
                else{
                    $(this).val('False')
                }
            })

            $('#flexCheckDefault4').change(function() {
                if(this.checked) {
                    $(this).val('True')
                }
                else{
                    $(this).val('False')
                }
            })

            $('#id_first_checkbox_vaccine_jandj').change(function() {
                if(this.checked) {
                    $(this).val('True')
                    $('.firstcheckbox_toggle_checkbox_second_dose').addClass('d-none')
                    $('#id_first_checkbox_shot_two_date').val('')
                }
                else{
                    $(this).val('False')
                    $('.firstcheckbox_toggle_checkbox_second_dose').removeClass('d-none')
                }
            })

            $('#id_first_checkbox_vaccine_moderna_and_pfizer').change(function() {
                if(this.checked) {
                    $(this).val('True')
                }
                else{
                    $(this).val('False')
                }
            })
            
            $('#id_second_checkbox_vaccine_jandj').change(function() {
                if(this.checked) {
                    $(this).val('True')
                    $('.secondcheckbox_toggle_checkbox_second_dose').addClass('d-none')
                    $('#id_second_checkbox_shot_two_date').val('')
                }
                else{
                    $(this).val('False')
                    $('.secondcheckbox_toggle_checkbox_second_dose').removeClass('d-none')
                }
            })

            $('#id_second_checkbox_vaccine_moderna_and_pfizer').change(function() {
                if(this.checked) {
                    $(this).val('True')
                }
                else{
                    $(this).val('False')
                }
            })

            $(document).on('change', '.fileclass', function(event) {
                if (event.target.files[0] !== undefined) {
                    const file_name = event.target.files[0].name.split('.')
                    const file_size = event.target.files[0].size
                    var file_ext = file_name[file_name.length - 1];
                    var is_wrong_file = false;
                    if (file_ext != 'pdf' && file_ext != 'jpg' && file_ext!= 'jpeg' && file_ext!='png') {
                        UserDashboard.addUploadButtonErrorMessage('File type not supported. Please upload PDF, JPG, JPEG, PNG Files')
                        is_wrong_file = true;
                    }
                    if (file_size >= (5 * 1024 * 1024)) {
                        UserDashboard.addUploadButtonErrorMessage('File size not supported. Allowed maximum Size is 5MB')
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
        },
        Validate(){
            const boxchecked = $('.main-checkbox').find('input[type=checkbox]:checked').length
            if(boxchecked==0){
                UserDashboard.addSubmitButtonErrorMessage('Please check any of the check box')
                return false
            }
            else if(boxchecked>1){
                UserDashboard.addSubmitButtonErrorMessage('Only one check box selection is allowed')
                return false
            }
            if($('#flexCheckDefault1:checked').length >0){
                var empty = false
                const all_input_file_elements = $('#filesContainer1').find('input[type="file"]')
                for (let i = 0; i < all_input_file_elements.length; i++) {
                    if($(all_input_file_elements[i]).val()==''){
                        empty = true
                    }
                }
                if(empty){
                    UserDashboard.addSubmitButtonErrorMessage('Please upload a file')
                    return false
                }
                const vaccineboxtwo = $('#collapseExample').find('input[type=checkbox]:checked').length
                if(vaccineboxtwo == 0){
                    UserDashboard.addSubmitButtonErrorMessage('Please choose a vaccine type')
                    return false
                }
                else if(vaccineboxtwo >1){
                    UserDashboard.addSubmitButtonErrorMessage('Only one vaccine checkbox is allowed to check')
                    return false
                }
                $('#id_first_checkbox_shot_two_date').removeClass('error')
                $('#id_first_checkbox_shot_one_date').removeClass('error')
                $('#id_first_checkbox_booster_one_date').removeClass('error')

                if($('#id_first_checkbox_shot_one_date').val()==''){
                    UserDashboard.addSubmitButtonErrorMessage('Please enter shot one dose date')
                    $('#id_first_checkbox_shot_one_date').addClass('error')
                    return false
                }
                if(!$("#id_first_checkbox_vaccine_jandj").is(":checked")){
                    if($('#id_first_checkbox_shot_two_date').val()==''){
                        UserDashboard.addSubmitButtonErrorMessage('Please enter shot two dose date')
                        $('#id_first_checkbox_shot_two_date').addClass('error')
                        return false
                    }
                }
                if($('#id_first_checkbox_booster_one_date').val()==''){
                    UserDashboard.addSubmitButtonErrorMessage('Please enter booster dose date')
                    $('#id_first_checkbox_booster_one_date').addClass('error')
                    return false
                }
            }
            if($('#flexCheckDefault2:checked').length >0){
                const vaccinebox = $('#collapsecheckbox2').find('input[type=checkbox]:checked').length
                if(vaccinebox == 0){
                    UserDashboard.addSubmitButtonErrorMessage('Please choose a vaccine type')
                    return false
                }
                else if(vaccinebox >1){
                    UserDashboard.addSubmitButtonErrorMessage('Only one vaccine checkbox is allowed to check')
                    return false
                }
                $('#id_second_checkbox_shot_one_date').removeClass('error')
                $('#id_second_checkbox_shot_two_date').removeClass('error')
                if($('#id_second_checkbox_shot_one_date').val()==''){
                    UserDashboard.addSubmitButtonErrorMessage('Please enter shot one dose date')
                    $('#id_second_checkbox_shot_one_date').addClass('error')
                    return false
                }
                if(!$("#id_second_checkbox_vaccine_jandj").is(":checked")){
                    if($('#id_second_checkbox_shot_two_date').val()==''){
                        UserDashboard.addSubmitButtonErrorMessage('Please enter shot two dose date')
                        $('#id_second_checkbox_shot_two_date').addClass('error')
                        return false
                    }
                }
            }
            return true
        },
        addUploadButtonErrorMessage: function (errorMessage) {
            $('#errormessages').removeClass('d-none');
            $('#errormessages').html(errorMessage);
            errormessageshow = setTimeout(function(){ 
                $('#errormessages').addClass('d-none') 
            }, 5000);
        },
        addSubmitButtonErrorMessage: function (errorMessage) {
            $('#submitmessages').removeClass('alert-success d-none');
            $('#submitmessages').addClass('alert-danger');
            $('#submitmessages').removeClass('d-none');
            $('#submitmessages').html(errorMessage);
            errormessageshow = setTimeout(function(){ 
                $('#submitmessages').addClass('d-none') 
            }, 5000);
        },
        MakeAlertSuccessfull: function (successMessage) {
            $('#submitmessages').removeClass('d-none');
            $('#submitmessages').removeClass('alert-danger').addClass('alert-success');
            $('#submitmessages').html(successMessage);
        },

    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    UserDashboard.init()

    $('body').on('click', '#btn', function(e) {
        $('.sidebar').toggleClass('active');
    });

    $('body').on('submit','#upload-user-file',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        var validate = UserDashboard.Validate()
        console.log(validate)
        if(validate){
            UserDashboard.MakeAlertSuccessfull("Your form is being submitted. Please wait.")
            $("#id_form_submit_button").addClass('d-none')
            $("#success-modal-text").html('')
            $.ajax({
                url:'/vaccine/api/v1/covid-booster/user-upload/',
                type: 'POST',
                data: formData,
                success: function (res) {
                    let model = null
                    if (res.status == 1) {
                        model = $('#success-model')
                    }else if(res.status == 2){
                        model = $('#success-model')
                        $("#success-modal-text").html("Now you can select 'COVID-19 Booster Exemption' from the left menu bar for uploading exemption documents")
                    } else {
                        model = $('#error-model')
                    }
                    $(model).modal('show');
                    $('#submitmessages').addClass('d-none');
                    $("#id_form_submit_button").removeClass('d-none')
                },
                error:function(){
                    $('#submitmessages').addClass('d-none');
                    $("#id_form_submit_button").removeClass('d-none')
                },
                cache: false,
                contentType: false,
                processData: false
            });
        }
    });
})      