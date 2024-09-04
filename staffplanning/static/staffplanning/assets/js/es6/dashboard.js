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
        data: [],
        previous_data:[],
        site_name:'All',
        date_today: moment().format('YYYY-MM-DD'),
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        operations_type: 'Medical',

        init: function () {
            
            $('#my_date_picker').val(moment(pStepForm.date_today,"YYYY-MM-DD").format('MM-DD-YYYY'));

            $('body').on('change', '#id_site_selector', function () {
                pStepForm.site_name = $(this).val()
                pStepForm.getData()
            })

            $('body').on('click', '.operation_button', function () {
                var operation = $(this).data('operation')
                var medical = JSON.parse($('#medical_location').val());
                var dental = JSON.parse($('#dental_location').val());
                var optometry = JSON.parse($('#optometry_location').val());
                if(pStepForm.operations_type!==operation){
                    pStepForm.operations_type = operation
                    if(operation=="Medical"){
                        $('.medical_table').removeClass('d-none')
                        $('.dental_table').addClass('d-none')
                        $('.optometry_table').addClass('d-none')
                        $('[data-operation="Medical"]').removeClass('btn btn-outline-primary').addClass('btn btn-primary')
                        $('[data-operation="Dental"]').removeClass('btn btn-primary').addClass('btn btn-outline-primary')
                        $('[data-operation="Optometry"]').removeClass('btn btn-primary').addClass('btn btn-outline-primary')
                        document.pStepForm.renderSelectBox("site",medical,"All Sites")
                    }else if(operation=="Dental"){
                        $('.medical_table').addClass('d-none')
                        $('.dental_table').removeClass('d-none')
                        $('.optometry_table').addClass('d-none')
                        $('[data-operation="Dental"]').removeClass('btn btn-outline-primary').addClass('btn btn-primary')
                        $('[data-operation="Medical"]').removeClass('btn btn-primary').addClass('btn btn-outline-primary')
                        $('[data-operation="Optometry"]').removeClass('btn btn-primary').addClass('btn btn-outline-primary')
                        document.pStepForm.renderSelectBox("site",dental,"All Sites")
                    }else if(operation=="Optometry"){
                        $('.medical_table').addClass('d-none')
                        $('.dental_table').addClass('d-none')
                        $('.optometry_table').removeClass('d-none')
                        $('[data-operation="Optometry"]').removeClass('btn btn-outline-primary').addClass('btn btn-primary')
                        $('[data-operation="Dental"]').removeClass('btn btn-primary').addClass('btn btn-outline-primary')
                        $('[data-operation="Medical"]').removeClass('btn btn-primary').addClass('btn btn-outline-primary')
                        document.pStepForm.renderSelectBox("site",optometry,"All Sites")
                    }
                    pStepForm.getData()
                }
            })

        },
        renderTable:function(){
            if(pStepForm.operations_type=="Medical"){
                if (this.data.length > 0) {
                    let html = ''
                    this.data.forEach((element, index) => {
                        var total_providers = 0
                        if(element.total_providers_present!=='' && element.total_providers_present!==null){
                            total_providers += parseFloat(element.total_providers_present,10)
                        }
                        if(element.total_specialty_providers_present!=='' && element.total_specialty_providers_present!==null){
                            total_providers += parseFloat(element.total_specialty_providers_present,10)
                        }
                        if(total_providers==0){
                            total_providers=''
                        }
                        var callouts = 0
                        if(element.providers_call_outs!=='' && element.providers_call_outs!==null){
                            callouts += parseFloat(element.providers_call_outs,10)
                        }
                        if(element.app_call_outs!=='' && element.app_call_outs!==null){
                            callouts += parseFloat(element.app_call_outs,10)
                        }
                        if(element.specialty_providers_call_outs!=='' && element.specialty_providers_call_outs!==null){
                            callouts += parseFloat(element.specialty_providers_call_outs,10)
                        }
                        if(element.ma_call_outs!=='' && element.ma_call_outs!==null){
                            callouts += parseFloat(element.ma_call_outs,10)
                        }
                        if(element.bh_ma_call_outs!=='' && element.bh_ma_call_outs!==null){
                            callouts += parseFloat(element.bh_ma_call_outs,10)
                        }
                        if(element.retinopathy_ma_call_outs!=='' && element.retinopathy_ma_call_outs!==null){
                            callouts += parseFloat(element.retinopathy_ma_call_outs,10)
                        }
                        if(element.nurses_call_outs!=='' && element.nurses_call_outs!==null){
                            callouts += parseFloat(element.nurses_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            callouts += parseFloat(element.receptionist_call_outs,10)
                        }
                        if(callouts==0){
                            callouts=''
                        }

                        html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                            <td class="text-left" style="font-weight:600;${element.list_any_barriers!=='' && element.list_any_barriers!==null? 'color:red':null}" title="${element.list_any_barriers} ${element.other_reasons !=='' && element.other_reasons !==null ? `(${element.other_reasons})`:''}">${element.site}</td>
                            <td title="${element.providers_present_comment}">${element.providers_present !== '' && element.providers_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.providers_present_comment!=='' && element.providers_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.providers_present}</p>`:''}</p></td>
                            <td title="${element.walk_in_providers_present_comment}">${element.walk_in_providers_present !== '' && element.walk_in_providers_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.walk_in_providers_present_comment!=='' && element.walk_in_providers_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.walk_in_providers_present}</p>`:''}</p></td>
                            <td title="${element.total_specialty_providers_present_comment}">${element.total_specialty_providers_present !== '' && element.total_specialty_providers_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.total_specialty_providers_present_comment!=='' && element.total_specialty_providers_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.total_specialty_providers_present}</p>`:''}</p></td>
                            <td title="${element.total_providers_present_comment}">${total_providers !== '' && total_providers !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.total_providers_present_comment!=='' && element.total_providers_present_comment!==null ?'border:2px solid #DD1700;':null}">${total_providers}</p>`:''}</td>
                            <td title="${element.receptionist_present_comment}">${element.receptionist_present !== '' && element.receptionist_present !== null ? `<p style="background-color:#7B3F00;width:55px;height:25px;color:white;${element.receptionist_present_comment!=='' && element.receptionist_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.receptionist_present}</p>`:''}</p></td>
                            <td title="${element.receptionist_provider_ratio_comment}">${element.receptionist_provider_ratio !== '' && element.receptionist_provider_ratio !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.receptionist_provider_ratio_comment!=='' && element.receptionist_provider_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.receptionist_provider_ratio}</p>`:''}</p></td>
                            <td title="${element.provider_specialty_app_walk_in_ma_present_comment}">${element.provider_specialty_app_walk_in_ma_present !== '' && element.provider_specialty_app_walk_in_ma_present !== null ? `<p style="background-color:#283593;width:55px;height:25px;color:white;${element.provider_specialty_app_walk_in_ma_present_comment!=='' && element.provider_specialty_app_walk_in_ma_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.provider_specialty_app_walk_in_ma_present}</p>`:''}</p></td>
                            <td title="${element.ma_provider_ratio_comment}">${element.ma_provider_ratio !== '' && element.ma_provider_ratio !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.ma_provider_ratio_comment!=='' && element.ma_provider_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.ma_provider_ratio}</p>`:''}</p></td>
                            <td title="${element.nurses_present_comment}">${element.nurses_present !== '' && element.nurses_present !== null ? `<p style="background-color:#E1BEE7;width:55px;height:25px;color:white;${element.nurses_present_comment!=='' && element.nurses_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.nurses_present}</p>`:''}</p></td>
                            <td title="${element.nurses_provider_ratio_comment}">${element.nurses_provider_ratio !== '' && element.nurses_provider_ratio !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.nurses_provider_ratio_comment!=='' && element.nurses_provider_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.nurses_provider_ratio}</p>`:''}</p></td>
                            <td>${callouts !== '' && callouts !== null ? `<p style="background-color:#E91E63;width:55px;height:25px;color:white">${callouts}</p>`:''}</p></td>
                            <td title="${element.total_appointment_scheduled_today_comment}">${element.total_appointment_scheduled_today !== '' && element.total_appointment_scheduled_today !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.total_appointment_scheduled_today_comment!=='' && element.total_appointment_scheduled_today_comment!==null ?'border:2px solid #DD1700;':null}">${element.total_appointment_scheduled_today}</p>`:''}</p></td>
                            <td title="${element.qualified_visits_conducted_comment}">${element.qualified_visits_conducted !== '' && element.qualified_visits_conducted !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.qualified_visits_conducted_comment!=='' && element.qualified_visits_conducted_comment!==null ?'border:2px solid #DD1700;':null}">${element.qualified_visits_conducted}</p>`:''}</p></td>
                            <td title="${element.visit_capacity_utilization_percentage_comment}">${element.visit_capacity_utilization_percentage !== '' && element.visit_capacity_utilization_percentage !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.visit_capacity_utilization_percentage_comment!=='' && element.visit_capacity_utilization_percentage_comment!==null ?'border:2px solid #DD1700;':null}">${element.visit_capacity_utilization_percentage}</p>`:''}</p></td>
                      </tr>`;
                    })
                    $('#storebookingData').html(html);
                }else{
                    $('#storebookingData').html(`<tr><td colspan="13">No Data</td></tr>`);
                }
            }else if(pStepForm.operations_type=="Dental"){
                if (this.data.length > 0) {
                    let html = ''
                    this.data.forEach((element, index) => {
                        var callouts = 0
                        if(element.providers_call_outs!=='' && element.providers_call_outs!==null){
                            callouts += parseFloat(element.providers_call_outs,10)
                        }
                        if(element.registered_dental_hygienist_call_outs!=='' && element.registered_dental_hygienist_call_outs!==null){
                            callouts += parseFloat(element.registered_dental_hygienist_call_outs,10)
                        }
                        if(element.dental_assistant_call_outs!=='' && element.dental_assistant_call_outs!==null){
                            callouts += parseFloat(element.dental_assistant_call_outs,10)
                        }
                        if(element.registered_dental_assistant_call_outs!=='' && element.registered_dental_assistant_call_outs!==null){
                            callouts += parseFloat(element.registered_dental_assistant_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            callouts += parseFloat(element.receptionist_call_outs,10)
                        }
                        if(callouts==0){
                            callouts=''
                        }

                        html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                            <td class="text-left" style="font-weight:600;${element.list_any_barriers!=='' && element.list_any_barriers!==null? 'color:red':null}" title="${element.list_any_barriers} ${element.other_reasons !=='' && element.other_reasons !==null ? `(${element.other_reasons})`:''}">${element.site}</td>
                            <td title="${element.providers_present_comment}">${element.providers_present !== '' && element.providers_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.providers_present_comment!=='' && element.providers_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.providers_present}</p>`:''}</p></td>
                            <td title="${element.registered_dental_hygienist_present_comment}">${element.registered_dental_hygienist_present !== '' && element.registered_dental_hygienist_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.registered_dental_hygienist_present_comment!=='' && element.registered_dental_hygienist_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.registered_dental_hygienist_present}</p>`:''}</p></td>
                            <td title="${element.total_providers_present_comment}">${element.total_providers_present !== '' && element.total_providers_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.total_providers_present_comment!=='' && element.total_providers_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.total_providers_present}</p>`:''}</td>
                            <td title="${element.dental_hygienist_provider_ratio_comment}">${element.dental_hygienist_provider_ratio !== '' && element.dental_hygienist_provider_ratio !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.dental_hygienist_provider_ratio_comment!=='' && element.dental_hygienist_provider_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.dental_hygienist_provider_ratio}</p>`:''}</p></td>
                            <td title="${element.receptionist_present_comment}">${element.receptionist_present !== '' && element.receptionist_present !== null ? `<p style="background-color:#7B3F00;width:55px;height:25px;color:white;${element.receptionist_present_comment!=='' && element.receptionist_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.receptionist_present}</p>`:''}</p></td>
                            <td title="${element.receptionist_provider_ratio_comment}">${element.receptionist_provider_ratio !== '' && element.receptionist_provider_ratio !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.receptionist_provider_ratio_comment!=='' && element.receptionist_provider_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.receptionist_provider_ratio}</p>`:''}</p></td>
                            <td title="${element.registered_dental_assistants_present_comment}">${element.registered_dental_assistants_present !== '' && element.registered_dental_assistants_present !== null ? `<p style="background-color:#283593;width:55px;height:25px;color:white;${element.registered_dental_assistants_present_comment!=='' && element.registered_dental_assistants_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.registered_dental_assistants_present}</p>`:''}</p></td>
                            <td title="${element.dental_assistants_present_comment}">${element.dental_assistants_present !== '' && element.dental_assistants_present !== null ? `<p style="background-color:#283593;width:55px;height:25px;color:white;${element.dental_assistants_present_comment!=='' && element.dental_assistants_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.dental_assistants_present}</p>`:''}</p></td>
                            <td title="${element.dental_assistant_provider_ratio_comment}">${element.dental_assistant_provider_ratio !== '' && element.dental_assistant_provider_ratio !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.dental_assistant_provider_ratio_comment!=='' && element.dental_assistant_provider_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.dental_assistant_provider_ratio}</p>`:''}</p></td>
                            <td>${callouts !== '' && callouts !== null ? `<p style="background-color:#E91E63;width:55px;height:25px;color:white">${callouts}</p>`:''}</p></td>
                            <td title="${element.total_appointment_scheduled_today_comment}">${element.total_appointment_scheduled_today !== '' && element.total_appointment_scheduled_today !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.total_appointment_scheduled_today_comment!=='' && element.total_appointment_scheduled_today_comment!==null ?'border:2px solid #DD1700;':null}">${element.total_appointment_scheduled_today}</p>`:''}</p></td>
                            <td title="${element.qualified_visits_conducted_comment}">${element.qualified_visits_conducted !== '' && element.qualified_visits_conducted !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.qualified_visits_conducted_comment!=='' && element.qualified_visits_conducted_comment!==null ?'border:2px solid #DD1700;':null}">${element.qualified_visits_conducted}</p>`:''}</p></td>
                            <td title="${element.visit_capacity_utilization_percentage_comment}">${element.visit_capacity_utilization_percentage !== '' && element.visit_capacity_utilization_percentage !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.visit_capacity_utilization_percentage_comment!=='' && element.visit_capacity_utilization_percentage_comment!==null ?'border:2px solid #DD1700;':null}">${element.visit_capacity_utilization_percentage}</p>`:''}</p></td>
                      </tr>`;
                    })
                    $('#dentalData').html(html);
                }else{
                    $('#dentalData').html(`<tr><td colspan="13">No Data</td></tr>`);
                }
            }
            else if(pStepForm.operations_type=="Optometry"){
                if (this.data.length > 0) {
                    let html = ''
                    this.data.forEach((element, index) => {
                        var callouts = 0
                        if(element.optometrist_call_outs!=='' && element.optometrist_call_outs!==null){
                            callouts += parseFloat(element.optometrist_call_outs,10)
                        }
                        if(element.optometry_ma_call_outs!=='' && element.optometry_ma_call_outs!==null){
                            callouts += parseFloat(element.optometry_ma_call_outs,10)
                        }
                        if(element.optician_call_outs!=='' && element.optician_call_outs!==null){
                            callouts += parseFloat(element.optician_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            callouts += parseFloat(element.receptionist_call_outs,10)
                        }
                        if(callouts==0){
                            callouts=''
                        }

                        html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                            <td class="text-left" style="font-weight:600;${element.list_any_barriers!=='' && element.list_any_barriers!==null? 'color:red':null}" title="${element.list_any_barriers} ${element.other_reasons !=='' && element.other_reasons !==null ? `(${element.other_reasons})`:''}">${element.site}</td>
                            <td title="${element.optometrist_present_comment}">${element.optometrist_present !== '' && element.optometrist_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.optometrist_present_comment!=='' && element.optometrist_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.optometrist_present}</p>`:''}</p></td>
                            <td title="${element.optometry_ma_present_comment}">${element.optometry_ma_present !== '' && element.optometry_ma_present !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.optometry_ma_present_comment!=='' && element.optometry_ma_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.optometry_ma_present}</p>`:''}</p></td>
                            <td title="${element.ma_optometrist_ratio_comment}">${element.ma_optometrist_ratio !== '' && element.ma_optometrist_ratio !== null ? `<p style="background-color:#26A69A;width:55px;height:25px;color:white;${element.ma_optometrist_ratio_comment!=='' && element.ma_optometrist_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.ma_optometrist_ratio}</p>`:''}</td>
                            <td title="${element.receptionist_present_comment}">${element.receptionist_present !== '' && element.receptionist_present !== null ? `<p style="background-color:#7B3F00;width:55px;height:25px;color:white;${element.receptionist_present_comment!=='' && element.receptionist_present_comment!==null ?'border:2px solid #DD1700;':null}">${element.receptionist_present}</p>`:''}</p></td>
                            <td title="${element.receptionist_optometrist_comment}">${element.receptionist_optometrist !== '' && element.receptionist_optometrist !== null ? `<p style="background-color:#F57C00;width:55px;height:25px;color:white;${element.receptionist_optometrist_comment!=='' && element.receptionist_optometrist_comment!==null ?'border:2px solid #DD1700;':null}">${element.receptionist_optometrist}</p>`:''}</p></td>
                            <td title="${element.optician_comment}">${element.optician !== '' && element.optician !== null ? `<p style="background-color:#283593;width:55px;height:25px;color:white;${element.optician_comment!=='' && element.optician_comment!==null ?'border:2px solid #DD1700;':null}">${element.optician}</p>`:''}</p></td>
                            <td title="${element.optician_optometrist_ratio_comment}">${element.optician_optometrist_ratio !== '' && element.optician_optometrist_ratio !== null ? `<p style="background-color:#283593;width:55px;height:25px;color:white;${element.optician_optometrist_ratio_comment!=='' && element.optician_optometrist_ratio_comment!==null ?'border:2px solid #DD1700;':null}">${element.optician_optometrist_ratio}</p>`:''}</p></td>
                            <td>${callouts !== '' && callouts !== null ? `<p style="background-color:#E91E63;width:55px;height:25px;color:white">${callouts}</p>`:''}</p></td>
                            <td title="${element.total_appointment_scheduled_today_comment}">${element.total_appointment_scheduled_today !== '' && element.total_appointment_scheduled_today !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.total_appointment_scheduled_today_comment!=='' && element.total_appointment_scheduled_today_comment!==null ?'border:2px solid #DD1700;':null}">${element.total_appointment_scheduled_today}</p>`:''}</p></td>
                            <td title="${element.qualified_visits_conducted_comment}">${element.qualified_visits_conducted !== '' && element.qualified_visits_conducted !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.qualified_visits_conducted_comment!=='' && element.qualified_visits_conducted_comment!==null ?'border:2px solid #DD1700;':null}">${element.qualified_visits_conducted}</p>`:''}</p></td>
                            <td title="${element.visit_capacity_utilization_percentage_comment}">${element.visit_capacity_utilization_percentage !== '' && element.visit_capacity_utilization_percentage !== null ? `<p style="background-color:#004D40;width:60px;height:25px;color:white;${element.visit_capacity_utilization_percentage_comment!=='' && element.visit_capacity_utilization_percentage_comment!==null ?'border:2px solid #DD1700;':null}">${element.visit_capacity_utilization_percentage}</p>`:''}</p></td>
                        </tr>`;
                        })
                        $('#optometryData').html(html);
                    }else{
                    $('#optometryData').html(`<tr><td colspan="13">No Data</td></tr>`);
                }
            }
        },
        renderCards:function(){
            if (this.previous_data.length > 0) {
                let html = ''
                let vcu_count = 0
                let total_vcu = 0
                let total_qvc = 0
                let total_callouts = 0
                this.previous_data.forEach((element, index) => {
                    if(pStepForm.operations_type=="Medical"){
                        var callouts = 0
                        if(element.providers_call_outs!=='' && element.providers_call_outs!==null){
                            callouts += parseFloat(element.providers_call_outs,10)
                            total_callouts += parseFloat(element.providers_call_outs,10)
                        }
                        if(element.app_call_outs!=='' && element.app_call_outs!==null){
                            callouts += parseFloat(element.app_call_outs,10)
                            total_callouts += parseFloat(element.app_call_outs,10)
                        }
                        if(element.specialty_providers_call_outs!=='' && element.specialty_providers_call_outs!==null){
                            callouts += parseFloat(element.specialty_providers_call_outs,10)
                            total_callouts += parseFloat(element.specialty_providers_call_outs,10)
                        }
                        if(element.ma_call_outs!=='' && element.ma_call_outs!==null){
                            callouts += parseFloat(element.ma_call_outs,10)
                            total_callouts += parseFloat(element.ma_call_outs,10)
                        }
                        if(element.bh_ma_call_outs!=='' && element.bh_ma_call_outs!==null){
                            callouts += parseFloat(element.bh_ma_call_outs,10)
                            total_callouts += parseFloat(element.bh_ma_call_outs,10)
                        }
                        if(element.retinopathy_ma_call_outs!=='' && element.retinopathy_ma_call_outs!==null){
                            callouts += parseFloat(element.retinopathy_ma_call_outs,10)
                            total_callouts += parseFloat(element.retinopathy_ma_call_outs,10)
                        }
                        if(element.nurses_call_outs!=='' && element.nurses_call_outs!==null){
                            callouts += parseFloat(element.nurses_call_outs,10)
                            total_callouts += parseFloat(element.nurses_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            callouts += parseFloat(element.receptionist_call_outs,10)
                            total_callouts += parseFloat(element.receptionist_call_outs,10)
                        }
                        if(callouts==0){
                            callouts='NA'
                        }
                        var vcu = "NA"
                        if(element.visit_capacity_utilization_percentage!='' && element.visit_capacity_utilization_percentage!=null){
                            vcu = element.visit_capacity_utilization_percentage
                            vcu_count += 1
                            total_vcu += parseFloat(element.visit_capacity_utilization_percentage,10)
                        }
                        var qvc = "NA"
                        if(element.qualified_visits_conducted!='' && element.qualified_visits_conducted!=null){
                            qvc = element.qualified_visits_conducted
                            total_qvc += parseFloat(element.qualified_visits_conducted,10)
                        }
                        var site = element.site
                        if(site=='Elm Peds/Gyn'){
                            site = 'Elm Peds Gyn'
                        }
                    }
                    else if(pStepForm.operations_type=="Dental"){
                        var callouts = 0
                        if(element.providers_call_outs!=='' && element.providers_call_outs!==null){
                            callouts += parseFloat(element.providers_call_outs,10)
                            total_callouts += parseFloat(element.providers_call_outs,10)
                        }
                        if(element.registered_dental_hygienist_call_outs!=='' && element.registered_dental_hygienist_call_outs!==null){
                            callouts += parseFloat(element.registered_dental_hygienist_call_outs,10)
                            total_callouts += parseFloat(element.registered_dental_hygienist_call_outs,10)
                        }
                        if(element.dental_assistant_call_outs!=='' && element.dental_assistant_call_outs!==null){
                            callouts += parseFloat(element.dental_assistant_call_outs,10)
                            total_callouts += parseFloat(element.dental_assistant_call_outs,10)
                        }
                        if(element.registered_dental_assistant_call_outs!=='' && element.registered_dental_assistant_call_outs!==null){
                            callouts += parseFloat(element.registered_dental_assistant_call_outs,10)
                            total_callouts += parseFloat(element.registered_dental_assistant_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            callouts += parseFloat(element.receptionist_call_outs,10)
                            total_callouts += parseFloat(element.receptionist_call_outs,10)
                        }
                        if(callouts==0){
                            callouts='NA'
                        }
                        var vcu = "NA"
                        if(element.visit_capacity_utilization_percentage!='' && element.visit_capacity_utilization_percentage!=null){
                            vcu = element.visit_capacity_utilization_percentage
                            vcu_count += 1
                            total_vcu += parseFloat(element.visit_capacity_utilization_percentage,10)
                        }
                        var qvc = "NA"
                        if(element.qualified_visits_conducted!='' && element.qualified_visits_conducted!=null){
                            qvc = element.qualified_visits_conducted
                            total_qvc += parseFloat(element.qualified_visits_conducted,10)
                        }
                        var site = element.site
                    }
                    else if(pStepForm.operations_type=="Optometry"){
                        var callouts = 0
                        if(element.optometrist_call_outs!=='' && element.optometrist_call_outs!==null){
                            callouts += parseFloat(element.optometrist_call_outs,10)
                            total_callouts += parseFloat(element.optometrist_call_outs,10)
                        }
                        if(element.optometry_ma_call_outs!=='' && element.optometry_ma_call_outs!==null){
                            callouts += parseFloat(element.optometry_ma_call_outs,10)
                            total_callouts += parseFloat(element.optometry_ma_call_outs,10)
                        }
                        if(element.optician_call_outs!=='' && element.optician_call_outs!==null){
                            callouts += parseFloat(element.optician_call_outs,10)
                            total_callouts += parseFloat(element.optician_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            callouts += parseFloat(element.receptionist_call_outs,10)
                            total_callouts += parseFloat(element.receptionist_call_outs,10)
                        }
                        if(callouts==0){
                            callouts='NA'
                        }
                        var vcu = "NA"
                        if(element.visit_capacity_utilization_percentage!='' && element.visit_capacity_utilization_percentage!=null){
                            vcu = element.visit_capacity_utilization_percentage
                            vcu_count += 1
                            total_vcu += parseFloat(element.visit_capacity_utilization_percentage,10)
                        }
                        var qvc = "NA"
                        if(element.qualified_visits_conducted!='' && element.qualified_visits_conducted!=null){
                            qvc = element.qualified_visits_conducted
                            total_qvc += parseFloat(element.qualified_visits_conducted,10)
                        }
                        var site = element.site
                    }
                    html += `
                    <div class="col-xxl-2 col-xl-3 col-sm-4 col-12 pb-2">
                       <a href="/staffplanning/details/${site}/${pStepForm.operations_type}/" style="text-decoration:none"><div class="card swiper-slide" style="background-color: #0093E9;background-image:${vcu>=90 ? 'linear-gradient(160deg, #20BF55 0%, #7EE8FA 100%);':vcu=='NA' ? 'linear-gradient(160deg, #FFDD00 0%, #FBB034 100%)': vcu<=50 ?'linear-gradient(160deg, #FE0944 0%, #FEAE96 100%)':'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)'}">
                         <div class="card-content">
                           <div class="card-body">
                           <label style="font-weight:600;font-size:12px;color:white" >${element.site}</label>
                             <div class="media d-flex">
                               <div class="align-self-center">
                                    <span class="float-left" style="font-weight: 600;font-size:25px;color:white">${vcu!=='NA'?`${vcu} %`:`${vcu}`}</span>
                               </div>
                               <div class="media-body text-right">
                                <h6 style="font-weight: 600;font-size:15px;color:white">CO : ${callouts!=='NA'?`${callouts}`:`${callouts}`}</h6>
                                <span style="font-weight: 600;font-size:15px;color:white">QVC : ${qvc!=='NA'?`${qvc}`:`${qvc}`}</span>
                               </div>
                             </div>
                             <div class="text-left">
                                <span style="font-weight: 600;font-size:15px;color:white">VCU</span>
                            </div>
                           </div>
                         </div>
                       </div></a>
                    </div>`
                })
                total_vcu = ((total_vcu/vcu_count).toFixed(2))
                html += `
                    <div class="col-xxl-2 col-xl-3 col-sm-4 col-12 pb-2">
                        <a href="#" style="text-decoration:none"><div class="card swiper-slide" style="background-color: #0093E9;background-image:${total_vcu>=90 ? 'linear-gradient(160deg, #20BF55 0%, #7EE8FA 100%);':total_vcu<90 && total_vcu>50 ? 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)': total_vcu<=50 ?'linear-gradient(160deg, #FE0944 0%, #FEAE96 100%)':'linear-gradient(160deg, #FFDD00 0%, #FBB034 100%)'}">
                            <div class="card-content">
                              <div class="card-body">
                              <label style="font-weight:600;font-size:14px;color:white" >All Sites</label>
                                <div class="media d-flex">
                                  <div class="align-self-center">
                                       <span class="float-left" style="font-weight: 600;font-size:25px;color:white">${total_vcu!=='NA' && total_vcu!=='NaN'?`${total_vcu} %`:`NA`}</span>
                                  </div>
                                  <div class="media-body text-right">
                                   <h6 style="font-weight: 600;font-size:14px;color:white">Total CO : ${total_callouts!=='NA'?`${total_callouts}`:`${total_callouts}`}</h6>
                                   <span style="font-weight: 600;font-size:14px;color:white">Total QVC : ${total_qvc!=='NA'?`${total_qvc}`:`${total_qvc}`}</span>
                                  </div>
                                </div>
                                <div class="text-left">
                                   <span style="font-weight: 600;font-size:14px;color:white">Average VCU</span>
                               </div>
                              </div>
                            </div>
                        </div></a>
                    </div>`
                $('.previous_day_cards').html(html);
            }else{
                $('.previous_day_cards').html(`<div style="margin: auto;">No Data</div>`);
            }
        },
        getData() {
            if(pStepForm.operations_type=="Medical"){
                $('#storebookingData').html(`<tr><td colspan="13">
                <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
                Loading....
                </td></tr>`);
            }else if(pStepForm.operations_type=="Dental"){
                $('#dentalData').html(`<tr><td colspan="13">
                <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
                Loading....
                </td></tr>`);
            }
            $.ajax({
                type: "POST",
                url: "/staffplanning/api/v1/staffplanning/fetch-dashboard-data/",
                data: {
                    site: this.site_name,
                    date_today: this.date_today,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    operations_type: this.operations_type,
                },
                success: (res) => {
                    if(res.status=='1'){
                        this.data = res.data
                        this.previous_data = res.previous_data
                        $('.previous_date').html(`<p style="color: #11556c;font-weight: 600;font-size: 16px;">${res.previous_date}</p>`)
                        $('.start_date').html(`<p style="color: #11556c;font-weight: 600;font-size: 16px;">${res.start_date}</p>`)
                        this.renderCards()
                        this.renderTable()
                    }
                    else{
                        this.data = []
                        this.previous_data = []
                        this.renderCards()
                        this.renderTable()
                    }
                },
                error: (err) => {
                    this.data = []
                    this.previous_data = []
                    this.renderCards()
                    this.renderTable()
                }
            })
        },
        renderSelectBox: function(nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['All',firstItem],].concat(choices);
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
    var medical = JSON.parse($('#medical_location').val());
    var dental = JSON.parse($('#dental_location').val());
    var optometry = JSON.parse($('#optometry_location').val());
    document.pStepForm.renderSelectBox("site",medical,"All Sites")
    pStepForm.getData();

    $('input[name="my_date_picker"]').change(function() {
        pStepForm.date_today = moment($(this).val(),'MM-DD-YYYY').format("YYYY-MM-DD")
        pStepForm.getData()
    })

    $('select[name="site"]').change(function() {
        pStepForm.site_name = $(this).val()
        pStepForm.getData()
    })

    $('select[name="site"]').change(function() {
        pStepForm.site_name = $(this).val()
        pStepForm.getData()
    })
});