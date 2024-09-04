$(document).ready(function () {
    const UserDashboard = {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        filenumber: 1,
        signaturePadcheck:null,
        dataurl:'',
        file_type: [],
        max_file_size: 1,
        max_file_upload: 1,
        is_not_submitted_yet: true,
        init() {

            var previous_submission = $('input[name=hidden_previous_submission').val()
            if(previous_submission=="True"){
                UserDashboard.is_not_submitted_yet = false
            }

            $('body').on('click','#resubmit-model .btn-primary',function(e){
                UserDashboard.is_not_submitted_yet = true
            })

            $('body').on('click','#submit-popup-model,#error-model .btn-secondary',function(e){
                location.reload()
            })

            if($('input[name=file_type]').val()!=='' || $('input[name=file_type]').val()!==null){
                this.file_type = $('input[name=file_type]').val().split(',')
            }
            this.max_file_size = parseInt($('input[name=file_size]').val(),10)
            this.max_file_upload = parseInt($('input[name=max_file_upload]').val(),10);
            var canvas = document.getElementById("can");
            const context = canvas.getContext('2d');
            UserDashboard.signaturePadcheck = new SignaturePad(canvas);
            document.getElementById('clear').addEventListener('click', function() {
                UserDashboard.signaturePadcheck = new SignaturePad(canvas);
            }, false)

            $('.addfile').click(function() {
                let filesContainer = $(this).data('filecontainer')
                const all_input_file_elements = $(filesContainer).find('input[type="file"]')
                if(all_input_file_elements.length<UserDashboard.max_file_upload){
                    UserDashboard.filenumber = UserDashboard.filenumber + 1
                    $(filesContainer).append(
                        $('<input class="fileclass pt-2"/>').attr('type', 'file').attr('name', 'file_'+UserDashboard.filenumber)
                    );
                }
            });

            $('#flexCheckDefault1').change(function() {
                if(previous_submission=="True"){
                    UserDashboard.is_not_submitted_yet = false
                }
                if(!this.checked) {
                    const all_input_file_elements = $('#collapseExample').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('')
                    }
                    $(this).val(false)
                }
                else{
                    $(this).val(true)
                }
            })
            $('#flexCheckDefault2').change(function() {
                if(previous_submission=="True"){
                    UserDashboard.is_not_submitted_yet = false
                }
                if(!this.checked) {
                    const all_input_file_elements = $('#collapseExample2').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('')
                    }
                    $(this).val(false)
                }
                else{
                    $(this).val(true)
                }

            })
            $('#flexCheckDefault3').change(function() {
                if(previous_submission=="True"){
                    UserDashboard.is_not_submitted_yet = false
                }
                if(!this.checked) {
                    const all_input_file_elements = $('#collapsecheckbox3').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('')
                    }
                    $(this).val(false)
                }
                else{
                    $(this).val(true)
                }

            })

            $(document).on('change', '.fileclass', function(event) {
                if (event.target.files[0] !== undefined) {
                    const file_name = event.target.files[0].name.split('.')
                    const file_size = event.target.files[0].size
                    var file_ext = file_name[file_name.length - 1];
                    var is_wrong_file = false;
                    if (UserDashboard.file_type.indexOf(file_ext) === -1) {
                        UserDashboard.addUploadButtonErrorMessage('File type not supported. Please upload '+UserDashboard.file_type+' files')
                        is_wrong_file = true;
                    }
                    if (file_size > (UserDashboard.max_file_size * 1024 * 1024)) {
                        UserDashboard.addUploadButtonErrorMessage('File size not supported. Maximum file size should be '+UserDashboard.max_file_size+' MB')
                        is_wrong_file = true;
                    }
                    if (is_wrong_file) {
                        $(this).val('')
                    }
                }
            })
        },
        // ToImage(dataurl){
        //     var i = new Image()
        //     var signature = dataurl
        //     i.src = 'data:' + signature;
        //     $(i).appendTo('#can')
        // },
        Validate(){
            const length = $('form').find('input[type="checkbox"]:checked').length
            if(length==0){
                UserDashboard.addSubmitButtonErrorMessage('Please make a selection')
                return false
            }
            else if(length>1){
                UserDashboard.addSubmitButtonErrorMessage('Only one selection is allowed')
                return false
            }
            
            if($('#flexCheckDefault1:checked').length >0){
                if($('input[name=file_upload_one_mandatory]').val()=='True'){
                    var empty = false
                    const all_input_file_elements = $('#collapseExample').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        if($(all_input_file_elements[i]).val()!==''){
                            empty = true
                        }
                    }
                    if(!empty){
                        UserDashboard.addSubmitButtonErrorMessage('Please upload a file')
                        return false
                    }
                }
            }
            if($('#flexCheckDefault2:checked').length >0){
                if($('input[name=file_upload_two_mandatory]').val()=='True'){
                    var empty = false
                    const all_input_file_elements = $('#collapseExample2').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        if($(all_input_file_elements[i]).val()!==''){
                            empty = true
                        }
                    }
                    if(!empty){
                        UserDashboard.addSubmitButtonErrorMessage('Please upload a file')
                        return false
                    }
                }
            }
            if($('#flexCheckDefault3:checked').length >0){
                if($('input[name=file_upload_three_mandatory]').val()=='True'){
                    var empty = false
                    const all_input_file_elements = $('#collapsecheckbox3').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        if($(all_input_file_elements[i]).val()!==''){
                            empty = true
                        }
                    }
                    if(!empty){
                        UserDashboard.addSubmitButtonErrorMessage('Please upload a file')
                        return false
                    }
                }
                if(UserDashboard.signaturePadcheck.isEmpty()) {
                    UserDashboard.addSubmitButtonErrorMessage('Signature must be provided')
                    return false
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
            $('#submitmessages').removeClass('alert-success').addClass('alert-danger');
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

    $('body').on('click', '#id_form_submit_button', function(e) {
        $('#useruploadform').submit()
    });

    $('body').on('submit','#useruploadform',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        UserDashboard.dataurl = (document.getElementById('can').value = UserDashboard.signaturePadcheck.toDataURL())
        formData.append('signatureurl', UserDashboard.dataurl);
        var validate = UserDashboard.Validate()
        if(validate && UserDashboard.is_not_submitted_yet==false){
            $('#resubmit-model').modal('show')
        }
        if(validate && UserDashboard.is_not_submitted_yet){
            UserDashboard.MakeAlertSuccessfull("Your form is being submitted. Please wait.")
            $("#id_form_submit_button").addClass('d-none')
            $.ajax({
                url:'/vaccine/api/v1/usersubmission/',
                type: 'POST',
                data: formData,
                success: function (res) {
                    let model = $('#submit-popup-model')
                    if (res.status == 1) {
                        $(model).modal('show');
                    }else{
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
    $('body').on('click', '#btn', function(e) {
        $('.sidebar').toggleClass('active');
    });
})      