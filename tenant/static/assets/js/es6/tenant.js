$(function () {
    "use strict";
    const app = {
        tenantAvailable:false,
        trail:false,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function (){

            $('#id_organisation_name').keyup(function () {
                const organisation_name= $('#id_organisation_name').val()
                var specialCharPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\| -]/;
                $('#id_organisation_domain_name').val(organisation_name.toLowerCase()+".yettihealth.com")
                if(organisation_name.length !== 0 && (!specialCharPattern.test(organisation_name))){
                    app.tenantCheck(organisation_name)
                }
                else{
                    $('#server-alert').html(`<span class="text-danger">Organization name not available</span>`)
                    $('#id_organisation_domain_name').val("")
                }
            })

            $('#addTenant').click(function (){
                const organisation_name = $('#id_organisation_name').val().toLowerCase();
                const organisation_admin = $('#id_organisation_admin').val().toLowerCase();
                var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                var specialCharPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\| -]/;
                const service_plan = $('#id_service_plan').val()
                if(app.tenantAvailable == false || (specialCharPattern.test(organisation_name))){
                    $('#server-alert').html(`<span class="text-danger">Choose a valid tenant name.</span>`)
                }
                else if (!emailPattern.test(organisation_admin)) {
                    $('#server-alert').html(`<span class="text-danger">Enter a valid Email ID.</span>`)
                }
                else if(organisation_name.length === 0 || organisation_admin.length === 0 || service_plan.length === 0){
                    $('#server-alert').html(`<span class="text-danger">Enter all mandatory fields.</span>`)
                }
                else{
                    $('#server-alert').html(`<span class="text-warning">Please wait. New organization is being created...</span>`)
                    app.addTenant(organisation_name,service_plan, organisation_admin)
                }
            })
        },
        tenantCheck: function(organisation_name){
            $.ajax({
                type: "POST",
                url:'/api/v1/tenant-name/', 
                data: {
                    organisation_name: organisation_name, 
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    if(res.status==0){
                        $('#server-alert').html(`<span class="text-success">Organization name is available`)
                        app.tenantAvailable = true
                    }
                    else{
                        $('#server-alert').html(`<span class="text-danger">Organization name is not available</span>`)
                        app.tenantAvailable = false
                    }
                },
                error: (err) => {
                    console.log(err);
                }
            })
        },
        addTenant: function(organisation_name,service_plan, organisation_admin){
            $('#addTenant').attr('disabled','disabled');
            $('#addTenant').attr('loading',true);
            $.ajax({
                type: "POST",
                url:'/api/v1/add-tenant/', 
                data: {
                    organisation_name: organisation_name,
                    service_plan: service_plan,
                    organisation_admin: organisation_admin,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    if(res.status==1){
                        $('#server-alert').html(`<span class="text-success">Organization added successfully. Invitation mail sent to `+organisation_admin+`.`)
                    }
                    else{
                        $('#server-alert').html(`<span class="text-danger">Something went wrong. Try again.</span>`)
                    }
                    $('#addTenant').removeAttr('disabled');
                    $('#addTenant').attr('loading',false);   
                },
                error: (err) => {
                    $('#server-alert').html(`<span class="text-danger">Something went wrong. Try again.</span>`)
                    console.log(err);
                    $('#addTenant').removeAttr('disabled');
                    $('#addTenant').attr('loading',false);   
                }
          })
        }
    }
    app.init();

})