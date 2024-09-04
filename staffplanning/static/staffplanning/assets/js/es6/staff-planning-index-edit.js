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

    const pStepForm = {
        date:$('#my_date_picker').val(),
        site_name: null,
        comment_icon_name:null,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        number_of_appointments: {
            no_of_provider_appointments:0,
            no_of_app_appointments:0,
            no_of_specialty_appointments_obgyn:0,
            no_of_specialty_appointments_pediatric:0,
            no_of_specialty_appointments_ecmp:0,
            no_of_specialty_appointments_endo_cri:0,
            no_of_specialty_appointments_infectious:0,
            no_of_specialty_appointments_podiatry:0,
            no_of_bh_providers_appointments:0,
            no_of_telepsychiatry_providers_appointments:0,
            no_of_walk_in_providers_appointments:0,
            no_of_specialty_appointments_dsmes:0,
            no_of_specialty_appointments_optometry:0,
        },
        number:1,
        provider_file:false,
        init: function () {

            var type_of_load = window.location.pathname.split('/')
            if(type_of_load[type_of_load.length-2]=='success'){
                $('.alert-text').html(`<i class="mx-5 fa fa-check text-success" style="font-size:48px;"></i><span class="mx-2" style="font-size:18px;">Updated Successfully</span>`)
                $('#submit-model').modal('show')
            }
            const all_input_elements = $('form').find('input');
            for (let i = 0; i < all_input_elements.length; i++) {
                if($(`#id_${all_input_elements[i].getAttribute("name")}`).val()!==''){
                    var name = all_input_elements[i].getAttribute("name")
                    $(`[data-name=${name}] i`).removeClass('text-info').addClass('text-danger')
                }
            }
            if($('#id_list_any_barriers').val()=='Other Reasons'){
                $('.other_reasons_field').removeClass('d-none')
            }
            var all = JSON.parse($('#id_available_locations').val());
            var site = $('#id_site').val()
            pStepForm.renderSelectBox("site",all)
            $('#id_site').val(site)
            pStepForm.site_name = $('#id_site').val()

            $('body').on('click', '#comment-model .btn.btn-primary', function () {
                $(`input[name=${pStepForm.comment_icon_name}]`).val($('#modelcommenttext').val())
                $('#comment-model').modal('hide')
                if($('#modelcommenttext').val()!==''){
                    $(`[data-name=${pStepForm.comment_icon_name}] svg`).removeClass('text-info').addClass('text-danger')
                }
                else{
                    $(`[data-name=${pStepForm.comment_icon_name}] svg`).removeClass('text-danger').addClass('text-info')
                }
            })

            $('body').on('click', '#alert-model .btn.btn-primary', function () {
                window.location = window.location.pathname
            })

            $('body').on('click', '#submit-model .btn.btn-primary', function () {
                var pathnameid = window.location.pathname.split("/")
                pathnameid = pathnameid[pathnameid.length-3]
                window.location = `/staffplanning/staffplanning/medical-update/${pathnameid}/edit/`
            })

            $('body').on('click', '.comment_modal_toggle_icon', function () {
                pStepForm.comment_icon_name = $(this).data('name')
                $('#modelcommenttext').val($(`input[name=${pStepForm.comment_icon_name}]`).val())
            })

            $('body').on('click', '#id_save_provider', function () {
                $('#providers-model').modal('hide')
                let md = 0
                let walkin = 0
                let endocri = 0
                let infectious = 0
                let podiatry = 0
                let optometry = 0
                let bh = 0
                let telephych = 0
                let md_provider = 0
                let walkin_provider = 0
                let endocri_provider = 0
                let infectious_provider = 0
                let podiatry_provider = 0
                let optometry_provider = 0
                let bh_providers = 0
                let telephych_provider = 0
                for(var i=1;i<=pStepForm.number;i++){
                    if($(`#id_provider_type${i}`).val()=="MD/DO"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            md += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(md>0){
                                md_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="Walk-In"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            walkin += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(walkin>0){
                                walkin_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="Endocrinology"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            endocri += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(endocri>0){
                                endocri_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="Infectious Disease"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            infectious += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(infectious>0){
                                infectious_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="Podiatry"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            podiatry += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(podiatry>0){
                                podiatry_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="Optometry"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            optometry += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(optometry>0){
                                optometry_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="BH Provider"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            bh += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(bh>0){
                                bh_providers += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                    else if($(`#id_provider_type${i}`).val()=="Telepsychiatry"){
                        if($.isNumeric($(`#id_no_of_appointments${i}`).val())){
                            telephych += parseFloat($(`#id_no_of_appointments${i}`).val(),10)
                            if(telephych>0){
                                telephych_provider += parseInt($(`#id_provider_count${i}`).val())
                            }
                        }
                    }
                }

                if(md>0 || walkin>0 || endocri>0 || infectious>0 || podiatry>0 || optometry>0 || bh>0 || telephych>0){
                    pStepForm.provider_file = true
                    $('.fa-file').removeClass('text-primary').addClass('text-danger')
                }
                else{
                    $('.fa-file').removeClass('text-danger').addClass('text-primary')
                    pStepForm.provider_file = false
                }

                $("#id_total_providers_appointment_scheduled_today").val(md+walkin)
                $("#id_total_specialty_appointment_scheduled_today").val(endocri+infectious+podiatry+optometry)
                $("#id_total_other_providers_appointment_scheduled_today").val(bh+telephych)

                if(md_provider!==0){
                    $("#id_providers_present").val(md_provider)
                }
                else{
                    $("#id_providers_present").val('')
                }
                if(walkin_provider!==0){
                    $("#id_walk_in_providers_present").val(walkin_provider)
                }
                else{
                    $("#id_walk_in_providers_present").val('')
                }
                if(endocri_provider!==0){
                    $("#id_endocrinology_providers").val(endocri_provider)
                }
                else{
                    $("#id_endocrinology_providers").val('')
                }
                if(infectious_provider!==0){
                    $("#id_infectious_disease_providers_present").val(infectious_provider)
                }
                else{
                    $("#id_infectious_disease_providers_present").val('')
                }
                if(podiatry_provider!==0){
                    $("#id_podiatry_providers_present").val(podiatry_provider)
                }
                else{
                    $("#id_podiatry_providers_present").val('')
                }
                if(optometry_provider!==0){
                    $("#id_optometry").val(optometry_provider)
                }
                else{
                    $("#id_optometry").val('')
                }
                if(bh_providers!==0){
                    $("#id_integrated_bh_providers_present").val(bh_providers)
                }
                else{
                    $("#id_integrated_bh_providers_present").val('')
                }
                if(telephych_provider!==0){
                    $("#id_telepsychiatry_providers_present").val(telephych_provider)
                }
                else{
                    $("#id_telepsychiatry_providers_present").val('')
                }

                $("#id_providers_present").trigger('keyup')
                $("#id_endocrinology_providers").trigger('keyup')
                $("#id_integrated_bh_providers_present").trigger('keyup')

            })
            
            $('body').on('change keyup','select[name="provider_count"],input[name="hours_working"],select[name="provider_type"]', function () {
                const id = $(this).data('id')
                if($.isNumeric($(`#id_provider_count${id}`).val()) || $.isNumeric($(`#id_hours_working${id}`).val())){
                    if($(`#id_provider_type${id}`).val()=="Walk-In"){
                        $(`#id_no_of_appointments${id}`).val($(`#id_provider_count${id}`).val()*$(`#id_hours_working${id}`).val()*4).trigger('change');
                    }
                    else{
                        $(`#id_no_of_appointments${id}`).val($(`#id_provider_count${id}`).val()*$(`#id_hours_working${id}`).val()*3).trigger('change');
                    }
                }
            })

            $('body').on('click', '.remove_row', function () {
                const id = $(this).data('id')
                $(`.newly_added_div${id}`).html('')
            })

            $('body').on('click', '#id_add_provider', function () {
                pStepForm.number = pStepForm.number+1
              $('.timeslot').append(
                  `<div class="d-flex justify-content-between pt-1 newly_added_div${pStepForm.number}" style="padding:0">
                    <div class="col-md-3" style="padding:0">
                        <select class="form-control" name="provider_type" id="id_provider_type${pStepForm.number}" data-id="${pStepForm.number}">
                            <option value="MD/DO">MD/DO</option>
                            <option value="Walk-In">Walk-In</option>
                            <option value="Endocrinology">Endocrinology</option>
                            <option value="Infectious Disease">Infectious Disease</option>
                            <option value="Podiatry">Podiatry</option>
                            <option value="Optometry">Optometry</option>
                            <option value="BH Provider">BH Provider</option>
                            <option value="Telepsychiatry">Telepsychiatry</option>
                        </select>
                    </div>
                    <div class="col-md-2" style="padding:0">
                    <select class="form-control" name="provider_count" id="id_provider_count${pStepForm.number}" data-id="${pStepForm.number}">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    </div>
                    <div class="col-md-2" style="padding:0">
                      <input class="form-control" type="text" name="hours_working" value="" id="id_hours_working${pStepForm.number}" data-id="${pStepForm.number}"> 
                    </div>
                    <div class="col-md-2" style="padding:0">
                      <input class="form-control" type="text" name="no_of_appointments" value="" id="id_no_of_appointments${pStepForm.number}" data-id="${pStepForm.number}" disabled> 
                    </div>
                    <div class="col-md-2" style="padding:0">
                        <button type="button" class="btn btn-outline-danger remove_row" data-id="${pStepForm.number}">Remove</button>
                    </div>
                </div>`
              );
            })

            //PROVIDERS BLOCK
            $("#id_providers_present,#id_walk_in_providers_present").on('keyup',function(){
                if($.isNumeric($('#id_providers_present').val()) || $.isNumeric($("#id_walk_in_providers_present").val())){
                    var value = 0
                    if($.isNumeric($('#id_providers_present').val())){
                        value += parseFloat($('#id_providers_present').val(),10)
                    }
                    if($.isNumeric($('#id_walk_in_providers_present').val())){
                        value += parseFloat($("#id_walk_in_providers_present").val(),10)
                    }
                    if(value!==0){
                        $("#id_total_providers_present").val(value.toFixed(2))
                    }
                    else{
                        $("#id_total_providers_present").val(0)
                    }
                }
                else{
                    $("#id_total_providers_present").val('')
                }
            });

            $("#id_providers_present,#id_walk_in_providers_present").on('keyup',function(){
                if(pStepForm.provider_file==false){
                    if($.isNumeric($('#id_providers_present').val()) || $.isNumeric($("#id_walk_in_providers_present").val())){
                        var specialty_value = 0
                        if($('#id_providers_present').val()!=='' && $.isNumeric($('#id_providers_present').val())){
                            specialty_value += pStepForm.number_of_appointments.no_of_provider_appointments*parseFloat($('#id_providers_present').val(),10)
                        }
                        if($('#id_walk_in_providers_present').val()!=='' || $.isNumeric($('#id_walk_in_providers_present').val())){
                            specialty_value += pStepForm.number_of_appointments.no_of_walk_in_providers_appointments*parseFloat($('#id_walk_in_providers_present').val(),10)
                        }
                        if(specialty_value!==0){
                            $("#id_total_providers_appointment_scheduled_today").val(specialty_value.toFixed(2))
                        }
                        else{
                            $("#id_total_providers_appointment_scheduled_today").val(0)
                        }
                    }
                    else{
                        $("#id_total_providers_appointment_scheduled_today").val('')
                    }
                }
                else{
                    if(!$.isNumeric($('#id_providers_present').val()) && !$.isNumeric($("#id_walk_in_providers_present").val())){
                        $("#id_total_providers_appointment_scheduled_today").val('')
                    }
                }
            });

            //SPECIALTY BLOCK
            $("#id_endocrinology_providers,#id_infectious_disease_providers_present,#id_podiatry_providers_present,#id_optometry").on('keyup',function(){
                if(pStepForm.provider_file==false){
                    if($.isNumeric($("#id_endocrinology_providers").val()) || $.isNumeric($("#id_infectious_disease_providers_present").val()) || $.isNumeric($("#id_podiatry_providers_present").val()) || $.isNumeric($("#id_optometry").val())){
                        var value = 0
                        var specialty_value = 0
                        if($.isNumeric($('#id_endocrinology_providers').val())){
                            value += parseFloat($("#id_endocrinology_providers").val(),10)
                            specialty_value += pStepForm.number_of_appointments.no_of_specialty_appointments_endo_cri*parseFloat($("#id_endocrinology_providers").val(),10)
                        }
                        if($.isNumeric($('#id_infectious_disease_providers_present').val())){
                            value += parseFloat($("#id_infectious_disease_providers_present").val(),10)
                            specialty_value += pStepForm.number_of_appointments.no_of_specialty_appointments_infectious*parseFloat($("#id_infectious_disease_providers_present").val(),10)
                        }
                        if($.isNumeric($('#id_podiatry_providers_present').val())){
                            value += parseFloat($("#id_podiatry_providers_present").val(),10)
                            specialty_value += pStepForm.number_of_appointments.no_of_specialty_appointments_podiatry*parseFloat($("#id_podiatry_providers_present").val(),10)
                        }
                        if($.isNumeric($('#id_optometry').val())){
                            value += parseFloat($("#id_optometry").val(),10)
                            specialty_value += pStepForm.number_of_appointments.no_of_specialty_appointments_optometry*parseFloat($("#id_optometry").val(),10)
                        }
                        if(value!==0){
                            $("#id_total_specialty_providers_present").val(value.toFixed(2))
                        }
                        else{
                            $("#id_total_specialty_providers_present").val(0)
                        }
                        if(specialty_value!==0){
                            $("#id_total_specialty_appointment_scheduled_today").val(specialty_value.toFixed(2))
                        }
                        else{
                            $("#id_total_specialty_appointment_scheduled_today").val(0)
                        }
                    }
                    else{
                        $("#id_total_specialty_appointment_scheduled_today").val('')
                        $("#id_total_specialty_providers_present").val('')
                    }
                }
                else{
                    if($.isNumeric($("#id_endocrinology_providers").val()) || $.isNumeric($("#id_infectious_disease_providers_present").val()) || $.isNumeric($("#id_podiatry_providers_present").val()) || $.isNumeric($("#id_optometry").val())){
                        var value = 0
                        if($.isNumeric($('#id_endocrinology_providers').val())){
                            value += parseFloat($("#id_endocrinology_providers").val(),10)
                        }
                        if($.isNumeric($('#id_infectious_disease_providers_present').val())){
                            value += parseFloat($("#id_infectious_disease_providers_present").val(),10)
                        }
                        if($.isNumeric($('#id_podiatry_providers_present').val())){
                            value += parseFloat($("#id_podiatry_providers_present").val(),10)
                        }
                        if($.isNumeric($('#id_optometry').val())){
                            value += parseFloat($("#id_optometry").val(),10)
                        }
                        if(value!==0){
                            $("#id_total_specialty_providers_present").val(value.toFixed(2))
                        }
                        else{
                            $("#id_total_specialty_providers_present").val(0)
                        }
                    }
                    else{
                        $("#id_total_specialty_appointment_scheduled_today").val('')
                        $("#id_total_specialty_providers_present").val('')
                    }
                }
            });

            //OTHER PROVIDERS
            $("#id_integrated_bh_providers_present,#id_telepsychiatry_providers_present").on('keyup',function(){
                if(pStepForm.provider_file==false){
                    if($.isNumeric($('#id_integrated_bh_providers_present').val()) || $.isNumeric($("#id_telepsychiatry_providers_present").val())){
                        var value = 0
                        var other_value = 0
                        if($.isNumeric($('#id_integrated_bh_providers_present').val())){
                            value += parseFloat($('#id_integrated_bh_providers_present').val(),10)
                            other_value += pStepForm.number_of_appointments.no_of_bh_providers_appointments*parseFloat($('#id_integrated_bh_providers_present').val(),10)
                        }
                        if($.isNumeric($('#id_telepsychiatry_providers_present').val())){
                            value += parseFloat($("#id_telepsychiatry_providers_present").val(),10)
                            other_value += pStepForm.number_of_appointments.no_of_telepsychiatry_providers_appointments*parseFloat($("#id_telepsychiatry_providers_present").val(),10)
                        }
                        if(value!==0){
                            $("#id_total_other_providers_present").val(value.toFixed(2))
                        }
                        else{
                            $("#id_total_other_providers_present").val(0)
                        }
                        if(other_value!==0){
                            $("#id_total_other_providers_appointment_scheduled_today").val(other_value.toFixed(2))
                        }
                        else{
                            $("#id_total_other_providers_appointment_scheduled_today").val(0)
                        }
                    }
                    else{
                        $("#id_total_other_providers_present").val('')
                        $("#id_total_other_providers_appointment_scheduled_today").val('')
                    }
                }
                else{
                    if($.isNumeric($('#id_integrated_bh_providers_present').val()) || $.isNumeric($("#id_telepsychiatry_providers_present").val())){
                        var value = 0
                        if($.isNumeric($('#id_integrated_bh_providers_present').val())){
                            value += parseFloat($('#id_integrated_bh_providers_present').val(),10)
                        }
                        if($.isNumeric($('#id_telepsychiatry_providers_present').val())){
                            value += parseFloat($("#id_telepsychiatry_providers_present").val(),10)
                        }
                        if(value!==0){
                            $("#id_total_other_providers_present").val(value.toFixed(2))
                        }
                        else{
                            $("#id_total_other_providers_present").val(0)
                        }
                    }
                    else{
                        $("#id_total_other_providers_present").val('')
                        $("#id_total_other_providers_appointment_scheduled_today").val('')
                    }
                }
            });

            //NURSES PROVIDERS
            $("#id_nurses_present,#id_providers_present,#id_walk_in_providers_present,#id_total_providers_present,#id_total_specialty_providers_present,#id_endocrinology_providers,#id_infectious_disease_providers_present,#id_podiatry_providers_present,#id_optometry").on('keyup',function(){
                if(($.isNumeric($('#id_nurses_present').val()) && $("#id_nurses_present").val()!=='')){
                    var value = 0
                    var total_providers = 0
                    if($.isNumeric($('#id_nurses_present').val())){
                        value += parseFloat($('#id_nurses_present').val(),10)
                    }
                    if($.isNumeric($('#id_total_providers_present').val())){
                        total_providers += parseFloat($('#id_total_providers_present').val(),10)
                    }
                    if($.isNumeric($('#id_total_specialty_providers_present').val())){
                        total_providers += parseFloat($('#id_total_specialty_providers_present').val(),10)
                    }
                    if(total_providers!==0 && value!==0){
                        $("#id_nurses_provider_ratio").val((value/total_providers).toFixed(2))
                    }
                    else{
                        $("#id_nurses_provider_ratio").val(0)
                    }
                }
                else{
                    $("#id_nurses_provider_ratio").val('')
                }
            });

            $("#id_receptionist_present,#id_providers_present,#id_walk_in_providers_present,#id_total_providers_present,#id_total_specialty_providers_present,#id_endocrinology_providers,#id_infectious_disease_providers_present,#id_podiatry_providers_present,#id_optometry").on('keyup',function(){
                if(($.isNumeric($('#id_receptionist_present').val()) && $("#id_receptionist_present").val()!=='')){
                    var value = 0
                    var total_providers = 0
                    if($.isNumeric($('#id_receptionist_present').val())){
                        value += parseFloat($('#id_receptionist_present').val(),10)
                    }
                    if($.isNumeric($('#id_total_providers_present').val())){
                        total_providers += parseFloat($('#id_total_providers_present').val(),10)
                    }
                    if($.isNumeric($('#id_total_specialty_providers_present').val())){
                        total_providers += parseFloat($('#id_total_specialty_providers_present').val(),10)
                    }
                    if(total_providers!==0 && value!==0){
                        $("#id_receptionist_provider_ratio").val((value/total_providers).toFixed(2))
                    }
                    else{
                        $("#id_receptionist_provider_ratio").val(0)
                    }
                }
                else{
                    $("#id_receptionist_provider_ratio").val('')
                }
            });

            $("#id_provider_specialty_app_walk_in_ma_present,#id_providers_present,#id_walk_in_providers_present,#id_total_providers_present,#id_total_specialty_providers_present,#id_endocrinology_providers,#id_infectious_disease_providers_present,#id_podiatry_providers_present,#id_optometry").on('keyup',function(){
                if(($.isNumeric($('#id_provider_specialty_app_walk_in_ma_present').val()) && $("#id_provider_specialty_app_walk_in_ma_present").val()!=='')){
                    var value = 0
                    var total_providers = 0
                    if($.isNumeric($('#id_provider_specialty_app_walk_in_ma_present').val())){
                        value += parseFloat($('#id_provider_specialty_app_walk_in_ma_present').val(),10)
                    }
                    if($.isNumeric($('#id_total_providers_present').val())){
                        total_providers += parseFloat($('#id_total_providers_present').val(),10)
                    }
                    if($.isNumeric($('#id_total_specialty_providers_present').val())){
                        total_providers += parseFloat($('#id_total_specialty_providers_present').val(),10)
                    }
                    if(total_providers!==0 && value!==0){
                        $("#id_ma_provider_ratio").val((value/total_providers).toFixed(2))
                    }
                    else{
                        $("#id_ma_provider_ratio").val(0)
                    }
                }
                else{
                    $("#id_ma_provider_ratio").val('')
                }
            });
            
            //CALL OUTS
            $("#id_total_providers_appointment_scheduled_today,#id_total_specialty_appointment_scheduled_today,#id_providers_present,#id_walk_in_providers_present,#id_endocrinology_providers,#id_infectious_disease_providers_present,#id_podiatry_providers_present,#id_optometry,#id_integrated_bh_providers_present,#id_telepsychiatry_providers_present,#id_total_other_providers_appointment_scheduled_today").on('keyup',function(){
                if($.isNumeric($('#id_total_providers_appointment_scheduled_today').val()) || $.isNumeric($('#id_total_specialty_appointment_scheduled_today').val()) || $.isNumeric($('#id_total_other_providers_appointment_scheduled_today').val())){
                    var value = 0
                    if($.isNumeric($('#id_total_providers_appointment_scheduled_today').val())){
                        value += parseFloat($('#id_total_providers_appointment_scheduled_today').val(),10)
                    }
                    if($.isNumeric($('#id_total_specialty_appointment_scheduled_today').val())){
                        value += parseFloat($('#id_total_specialty_appointment_scheduled_today').val(),10)
                    }
                    if($.isNumeric($('#id_total_other_providers_appointment_scheduled_today').val())){
                        value += parseFloat($('#id_total_other_providers_appointment_scheduled_today').val(),10)
                    }
                    if(value!==0){
                        $("#id_total_appointment_scheduled_today").val(value.toFixed(2))
                    }
                    else{
                        $("#id_total_appointment_scheduled_today").val(0)
                    }
                }
                else{
                    $("#id_total_appointment_scheduled_today").val('')
                }
            });

            $('#id_providers_call_outs').on('keyup',function(){
                if($.isNumeric($('#id_providers_call_outs').val())){
                    if($('#id_providers_call_outs').val()==0){
                        $('#id_providers_no_of_patients_rescheduled').val(0)
                        $('#id_no_of_patients_placed_on_another_provider_schedule').val(0)
                    }
                }
                else{
                    $('#id_providers_no_of_patients_rescheduled').val('')
                    $('#id_no_of_patients_placed_on_another_provider_schedule').val('')
                }
            })

            $('#id_app_call_outs').on('keyup',function(){
                if($.isNumeric($('#id_app_call_outs').val())){
                    if($('#id_app_call_outs').val()==0){
                        $('#id_app_no_of_patients_rescheduled').val(0)
                        $('#id_no_of_patients_placed_on_another_app_schedule').val(0)
                    }
                }
                else{
                    $('#id_app_no_of_patients_rescheduled').val('')
                    $('#id_no_of_patients_placed_on_another_app_schedule').val('')
                }
            })

            $('#id_specialty_providers_call_outs').on('keyup',function(){
                if($.isNumeric($('#id_specialty_providers_call_outs').val())){
                    if($('#id_specialty_providers_call_outs').val()==0){
                        $('#id_specialty_providers_no_of_patients_rescheduled').val(0)
                        $('#id_no_of_patients_plcd_on_another_splty_provider_schedule').val(0)
                    }
                }
                else{
                    $('#id_specialty_providers_no_of_patients_rescheduled').val('')
                    $('#id_no_of_patients_plcd_on_another_splty_provider_schedule').val('')
                }
            })

            //VISIT CAPAITY
            $("#id_qualified_visits_conducted,#id_total_appointment_scheduled_today,#id_total_providers_appointment_scheduled_today,#id_total_specialty_appointment_scheduled_today,#id_providers_present,#id_endocrinology_providers,#id_infectious_disease_providers_present,#id_podiatry_providers_present,#id_optometry").on('keyup',function(){
                if($.isNumeric($('#id_qualified_visits_conducted').val())){
                    var value = 0
                    var total_appointment_Scheduled_today = 0
                    if($.isNumeric($('#id_qualified_visits_conducted').val())){
                        value += parseFloat($('#id_qualified_visits_conducted').val(),10)
                    }
                    if($.isNumeric($('#id_total_appointment_scheduled_today').val())){
                        total_appointment_Scheduled_today += parseFloat($('#id_total_appointment_scheduled_today').val(),10)
                    }
                    if(total_appointment_Scheduled_today!==0 && value!==0){
                        $("#id_visit_capacity_utilization_percentage").val(((value/total_appointment_Scheduled_today)*100).toFixed(2))
                    }
                    else{
                        $("#id_visit_capacity_utilization_percentage").val(0)
                    }
                }
                else{
                    $("#id_visit_capacity_utilization_percentage").val('')
                }
            });

            $("#id_no_of_providers_who_met_productivity_at_end_of_day,#id_no_of_pds_who_did_not_meet_pdty_at_end_of_day,#id_no_of_medical_appointment_slots_available_at_end_of_day,#id_qualified_visits_conducted,#id_no_of_covid_test_scheduled,#id_visit_capacity_utilization_percentage").on('keyup',function(){
                pStepForm.ProductivityCheck()
             })

            $('.number_input').on('keyup',function(){
                if(!$.isNumeric($(this).val())){
                    $(this).val('')
                }
            })

            $('select[name="list_any_barriers"]').change(function() {
               if($(this).val()=="Other Reasons"){
                    $('.other_reasons_field').removeClass('d-none')
               }
               else{
                    $('.other_reasons_field').addClass('d-none')
                    $('#id_other_reasons').val('')
               }
            })

        },
        ProductivityCheck: function(){
            var count = 0
            if($.isNumeric($('#id_no_of_providers_who_met_productivity_at_end_of_day').val())){
                count += 1
            }
            if($.isNumeric($('#id_no_of_pds_who_did_not_meet_pdty_at_end_of_day').val())){
                count += 1
            }
            if($.isNumeric($('#id_no_of_medical_appointment_slots_available_at_end_of_day').val())){
                count += 1
            }
            if($.isNumeric($('#id_qualified_visits_conducted').val())){
                count += 1
            }
            if($.isNumeric($('#id_visit_capacity_utilization_percentage').val())){
                count += 1
            }
            if(count==5){
                $('#id_productivity_status').val(true)
            }
            else{
                $('#id_productivity_status').val(null)
            }
        },
        validate: function () {
            const error_elements = [];
            const all_select_elements = $('form').find('select');
            const all_input_elements = $('form').find('input');
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('error');
            }
            for (let i = 0; i < all_input_elements.length; i++) {
                if ($(all_input_elements[i]).val() === "") {
                    error_elements.push(all_input_elements[i]);
                }
            }
            for (let i = 0; i < all_select_elements.length; i++) {
                if ($(all_select_elements[i]).val() === "") {
                    error_elements.push(all_select_elements[i]);
                }
            }
            if (error_elements.length > 0) {
                this.renderError(error_elements);
                return false;
            }
            return true
        },
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('error');
            });
        },
        addSubmitButtonErrorMessage: function (errorMessage) {
            $('#error-display-near-submit').removeClass('d-none');
            $('#error-display-near-submit').html(errorMessage);
        },
        checkEntry() {
            $.ajax({
                type: "POST",
                url: "/staffplanning/api/v1/staffplanning/fetch-previous-submission/",
                data: {
                    site_name: this.site_name,
                    day:this.date,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status=='1'){
                        if(res.previous_data.length>0){
                            window.location = `/staffplanning/staffplanning/medical-update/${res.previous_data[0]['id']}/edit/`
                        }
                        else{
                            $('.alert-text').html("No entry available for the chosen date")
                            $('#alert-model').modal('show')
                        }
                    }
                    else{
                        this.number_of_appointments = []
                        $('.alert-text').html("Oops Something Happen")
                        $('#alert-model').modal('show')
                    }
                },
                error: (err) => {
                    this.number_of_appointments = []
                }
            })
        },
        clearAllInput(){
            const all_input_elements = $('form').find('input');
            const all_text_area = $('form').find('textarea');
            for (let i = 0; i < all_input_elements.length; i++) {
                if(all_input_elements[i].getAttribute("name")!=='csrfmiddlewaretoken' && (all_input_elements[i].getAttribute("name")!=='my_date_picker')){
                    $(`[data-name=${all_input_elements[i].getAttribute("name")}] svg`).removeClass('text-danger').addClass('text-info')
                    $(all_input_elements[i]).val('')
                }
            }
            for (let i = 0; i < all_text_area.length; i++) {
                $(all_text_area[i]).val('')
            }
            $('#id_list_any_barriers').val('')
            $('.fa-file').removeClass('text-danger').addClass('text-primary')
        },
        renderSelectBox: function(nameOfSelect, choices, firstItem=false) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            if(firstItem){
                choices = [['',firstItem],].concat(choices);
            }
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
        },
    };
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    pStepForm.init();

    document.pStepForm = pStepForm;
    var all_site = JSON.parse($('#id_available_locations').val());
    pStepForm.number_of_appointments = JSON.parse($('#id_number_of_appointments').val());
    $('#id_staffplanning_form').submit(function (e) {
        pStepForm.provider_file = false
        
        var validationFlag = true
        if (validationFlag) {
            // Valid let the form do it
            document.pStepForm.addSubmitButtonErrorMessage('Your form is being submitted. Please wait.');
            $('#update_report_button').addClass('d-none');
        } else {
            e.preventDefault();
        }
    });
    $('select[name="site"]').change(function() {
        $('.other_reasons_field').addClass('d-none')
        document.pStepForm.clearAllInput()
        pStepForm.provider_file = false
        document.pStepForm.day = null
        var site = $("#id_site").val()
        localStorage.setItem('Site',$('#id_site').val())
        pStepForm.site_name = site
        pStepForm.checkEntry()
    })

    $('input[name="my_date_picker"]').change(function() {
        pStepForm.date = $(this).val()
        pStepForm.checkEntry()
    })

    function pad(number, length) { 
        var str = String(number);
        return (str.length >= length) ? str : ( new Array(length - str.length + 1).join('0') ) + str;
    }

    let datetime = new Date($('input[name="my_date_picker"]').val()+' '+'UTC').toLocaleString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    datetime = datetime.toString()
    datetime = datetime.split(',')
    datetime = datetime[0].split('/')
    $('input[name="my_date_picker"]').val(pad(datetime[0], 2) + '-' + pad(datetime[1], 2) +'-'+datetime[2])
    pStepForm.date = $('input[name="my_date_picker"]').val()
});