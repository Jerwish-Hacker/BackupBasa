$(document).ready(function () {
    const UserDashboard = {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        filenumber: 1,
        filenumber2: 1,
        signaturePadcheck:null,
        dataurl:'',
        firstcheckbox:'',
        secondcheckbox:'',
        thirdcheckbox:'',
        init() {

            var canvas = document.getElementById("can");
            const context = canvas.getContext('2d');
            UserDashboard.signaturePadcheck = new SignaturePad(canvas);
            document.getElementById('clear').addEventListener('click', function() {
                UserDashboard.signaturePadcheck = new SignaturePad(canvas);
            }, false)
            
            const chosenoption = $('#chosenoption').val()
            if(chosenoption=='medical'){
                setTimeout(function() {
                    $("#medicalcheckboxid").click();
                }, 50);
            }
            else if(chosenoption=='religion'){
                setTimeout(function() {
                    $("#religioncheckboxid").click();
                }, 50);
            }

            $('#addfile').click(function() {
                if(UserDashboard.filenumber<=6){
                    UserDashboard.filenumber = UserDashboard.filenumber + 1
                    $('#filesContainer').append(
                        $('<input class="fileclass pt-2"/>').attr('type', 'file').attr('name', 'file_'+UserDashboard.filenumber)
                    );
                }
            });
            $('#addfile2').click(function() {
                if(UserDashboard.filenumber2<=6){
                    UserDashboard.filenumber2 = UserDashboard.filenumber2 + 1
                    $('#filesContainer2').append(
                        $('<input class="fileclass pt-2"/>').attr('type', 'file').attr('name', 'file_'+UserDashboard.filenumber2)
                    );
                }
            });

            $('#medicalcheckboxid').change(function() {
                if(!this.checked) {
                    const all_input_file_elements = $('form #filesContainer').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('')
                    }
                }
            })
            $('#religioncheckboxid').change(function() {
                if(!this.checked) {
                    const all_input_file_elements = $('form #filesContainer2').find('input[type="file"]')
                    for (let i = 0; i < all_input_file_elements.length; i++) {
                        $(all_input_file_elements[i]).val('')
                    }
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
                    if (file_size >= (10 * 1024 * 1024)) {
                        UserDashboard.addUploadButtonErrorMessage('File size not supported. Allowed maximum Size is 10MB')
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
            const boxchecked = document.querySelectorAll('input[type="checkbox"]:checked').length
            if(boxchecked<=0){
                UserDashboard.ErrorMessageSubmit("Please check a check box")
                return false
            }
            else if(boxchecked>1){
                UserDashboard.ErrorMessageSubmit("Only one check box check is allowded")
                return false
            }
            if($('#medicalcheckboxid:checked').length >0){
                const all_input_file_elements = $('form #filesContainer').find('input[type="file"]')
                var empty = false
                for (let i = 0; i < all_input_file_elements.length; i++) {
                    if($(all_input_file_elements[i]).val()!==''){
                        empty = true
                    }
                }
                if(!empty){
                    UserDashboard.ErrorMessageSubmit("Please upload a file")
                    return false
                }
            }
            if($('#religioncheckboxid:checked').length >0){
                const all_input_file_elements = $('form #filesContainer2').find('input[type="file"]')
                if($('#religioustext').val()==''){
                    UserDashboard.ErrorMessageSubmit("Reason for exemption text must be provided")
                    $('#religioustext').css('border', 'solid 2px red');
                    errormessageshow = setTimeout(function(){ 
                        $('#religioustext').css('border', 'solid 1px black');
                    }, 5000);
                    return false
                }
                var empty = false
                for (let i = 0; i < all_input_file_elements.length; i++) {
                    if($(all_input_file_elements[i]).val()!==''){
                        empty = true
                    }
                }
                if(!empty){
                    UserDashboard.ErrorMessageSubmit("Please upload a file")
                    return false
                }
            }
            if(UserDashboard.signaturePadcheck.isEmpty()) {
                UserDashboard.ErrorMessageSubmit("Signature must be provided")
                return false
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
        ErrorMessageSubmit: function(errormessage){
            $('#errormessagessubmit').removeClass('alert-success').addClass('alert-danger');
            $('#errormessagessubmit').removeClass('d-none');
            $('#errormessagessubmit').html(errormessage);
            errormessageshow = setTimeout(function(){ 
                $('#errormessagessubmit').addClass('d-none') 
            }, 5000);
        },
        MakeAlertSuccessfull: function (successMessage) {
            $('#errormessagessubmit').removeClass('d-none');
            $('#errormessagessubmit').removeClass('alert-danger').addClass('alert-success');
            $('#errormessagessubmit').html(successMessage);
        },
    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    UserDashboard.init()

    $('#vaccineexemptionform').submit(function(e){
        const signatureurl = (document.getElementById('can').value = UserDashboard.signaturePadcheck.toDataURL())
        $('#sigantureurlinput').val(signatureurl)
        var Validate = UserDashboard.Validate()
        if(Validate){
            UserDashboard.MakeAlertSuccessfull("Your form is being submitted. Please wait.")
        }
        else{
            e.preventDefault();
        }
    })
})      