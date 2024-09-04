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
        site_name:$('input[name=hidden_site]').val(),
        date_start: moment().format('YYYY-MM-DD'),
        date_end: moment().format('YYYY-MM-DD'),
        operations_type: $('input[name=hidden_operation_type]').val(),
        page: 1,
        limit: 50,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),

        init: function () {
            if(pStepForm.operations_type=="Medical"){
                $('.medical_table').removeClass('d-none')
                $('.dental_table').addClass('d-none')
                $('.optometry_table').addClass('d-none')
            }else if(pStepForm.operations_type=="Dental"){
                $('.medical_table').addClass('d-none')
                $('.dental_table').removeClass('d-none')
                $('.optometry_table').addClass('d-none')
            }else if(pStepForm.operations_type=="Optometry"){
                $('.medical_table').addClass('d-none')
                $('.dental_table').addClass('d-none')
                $('.optometry_table').removeClass('d-none')
            }

            $('#my_date_picker').val(pStepForm.date_today);

            let start = moment()
            let end = moment()

            // DATE SET
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 14 Days': [moment().subtract(13, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                    'Last 2 Months': [moment().subtract(1, 'month').startOf('month'), moment().endOf('month')],
                    'Last 3 Months': [moment().subtract(2, 'month').startOf('month'), moment().endOf('month')],
                    'Last 6 Months': [moment().subtract(5, 'month').startOf('month'), moment().endOf('month')],
                    'This Year': [moment().startOf('year'), moment()],
                    'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
                },
            }, this.setDate);

            this.setDate(start, end)

            $('#export-button').click(function () {
                pStepForm.downloadExcel()
            })

        },
        renderTable:function(){
            if (this.data.length > 0) {
                let html = ''
                if(pStepForm.operations_type=="Medical"){
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
                            <td class="text-left" style="font-weight:600;${element.list_any_barriers!=='' && element.list_any_barriers!==null? 'color:red':null}" title="${element.list_any_barriers} ${element.other_reasons !=='' && element.other_reasons !==null ? `(${element.other_reasons})`:''}">${element.record_date_time}</td>
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
                    let pageLength = this.pagination.totalPages
                    html = ''
                    let separatorAdded = false
                    for (let i = 0; i < pageLength; i++) {
                        if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                            html += `<li class="pagination1" data-page="` + (i + 1) + `">` + (i + 1) + `</li>`;
                            // as we added a page, we reset the separatorAdded
                            separatorAdded = false;
                        } else {
                            if (!separatorAdded) {
                                // only add a separator when it wasn't added before
                                html += `<li class="separator" />`;
                                separatorAdded = true;
                            }
                        }
                    }
                    $('#holder').html(html)
                    document.querySelector('#holder>li[data-page="' + this.page + '"]').classList.add('active')
                }
                else if(pStepForm.operations_type=="Dental"){
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
                            <td class="text-left" style="font-weight:600;${element.list_any_barriers!=='' && element.list_any_barriers!==null? 'color:red':null}" title="${element.list_any_barriers} ${element.other_reasons !=='' && element.other_reasons !==null ? `(${element.other_reasons})`:''}">${element.record_date_time}</td>
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
                    let pageLength = this.pagination.totalPages
                    html = ''
                    let separatorAdded = false
                    for (let i = 0; i < pageLength; i++) {
                        if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                            html += `<li class="pagination2" data-page="` + (i + 1) + `">` + (i + 1) + `</li>`;
                            // as we added a page, we reset the separatorAdded
                            separatorAdded = false;
                        } else {
                            if (!separatorAdded) {
                                // only add a separator when it wasn't added before
                                html += `<li class="separator" />`;
                                separatorAdded = true;
                            }
                        }
                    }
                    $('#dentalHolder').html(html)
                    document.querySelector('#dentalHolder>li[data-page="' + this.page + '"]').classList.add('active')
                }
                else if(pStepForm.operations_type=="Optometry"){
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
                    let pageLength = this.pagination.totalPages
                    html = ''
                    let separatorAdded = false
                    for (let i = 0; i < pageLength; i++) {
                        if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                            html += `<li class="pagination2" data-page="` + (i + 1) + `">` + (i + 1) + `</li>`;
                            // as we added a page, we reset the separatorAdded
                            separatorAdded = false;
                        } else {
                            if (!separatorAdded) {
                                // only add a separator when it wasn't added before
                                html += `<li class="separator" />`;
                                separatorAdded = true;
                            }
                        }
                    }
                    $('#optometryHolder').html(html)
                    document.querySelector('#dentalHolder>li[data-page="' + this.page + '"]').classList.add('active')
                }

            }else{
                $('#storebookingData').html(`<tr><td colspan="13">No Data</td></tr>`);
                $('#dentalData').html(`<tr><td colspan="13">No Data</td></tr>`);
                $('#optometryData').html(`<tr><td colspan="12">No Data</td></tr>`);
                $('#holder').html('')
                $('#dentalHolder').html('')
                $('#optometryHolder').html('')
            }
        },
        renderCards:function(){
            if (this.data.length > 0) {
                let html = ''
                let barchart_vcu_data = []
                let barchart_qvc_data = []
                let barchart_co_data = []
                let vcu_count = 0
                let total_vcu = 0
                let total_qvc = 0
                let total_callouts = 0
                let site = ''
                var newarray = this.data.slice().reverse();
                if(pStepForm.operations_type=="Medical"){
                    newarray.forEach((element, index) => {
                        site = element.site
                        var callouts = 0
                        var qvc = 'NA'
                        var vcu = 'NA'
                        if(element.providers_call_outs!=='' && element.providers_call_outs!==null){
                            total_callouts += parseFloat(element.providers_call_outs,10)
                            callouts += parseFloat(element.providers_call_outs,10)
                        }
                        if(element.app_call_outs!=='' && element.app_call_outs!==null){
                            total_callouts += parseFloat(element.app_call_outs,10)
                            callouts += parseFloat(element.app_call_outs,10)
                        }
                        if(element.specialty_providers_call_outs!=='' && element.specialty_providers_call_outs!==null){
                            total_callouts += parseFloat(element.specialty_providers_call_outs,10)
                            callouts += parseFloat(element.specialty_providers_call_outs,10)
                        }
                        if(element.ma_call_outs!=='' && element.ma_call_outs!==null){
                            total_callouts += parseFloat(element.ma_call_outs,10)
                            callouts += parseFloat(element.ma_call_outs,10)
                        }
                        if(element.bh_ma_call_outs!=='' && element.bh_ma_call_outs!==null){
                            total_callouts += parseFloat(element.bh_ma_call_outs,10)
                            callouts += parseFloat(element.bh_ma_call_outs,10)
                        }
                        if(element.retinopathy_ma_call_outs!=='' && element.retinopathy_ma_call_outs!==null){
                            total_callouts += parseFloat(element.retinopathy_ma_call_outs,10)
                            callouts += parseFloat(element.retinopathy_ma_call_outs,10)
                        }
                        if(element.nurses_call_outs!=='' && element.nurses_call_outs!==null){
                            total_callouts += parseFloat(element.nurses_call_outs,10)
                            callouts += parseFloat(element.nurses_call_outs,10)
                        }
                        if(element.receptionist_call_outs!=='' && element.receptionist_call_outs!==null){
                            total_callouts += parseFloat(element.receptionist_call_outs,10)
                            callouts += parseFloat(element.receptionist_call_outs,10)
                        }

                        if(element.visit_capacity_utilization_percentage!='' && element.visit_capacity_utilization_percentage!=null){
                            vcu = parseFloat(element.visit_capacity_utilization_percentage,10)
                            vcu_count += 1
                            total_vcu += parseFloat(element.visit_capacity_utilization_percentage,10)
                        }

                        if(element.qualified_visits_conducted!='' && element.qualified_visits_conducted!=null){
                            qvc = parseFloat(element.qualified_visits_conducted,10)
                            total_qvc += parseFloat(element.qualified_visits_conducted,10)
                        }

                        if(vcu!=='NA'){
                            barchart_vcu_data.push({ label: element.record_date_time, y: vcu })
                        }
                        if(qvc!=='NA'){
                            barchart_qvc_data.push({ label: element.record_date_time, y: qvc })
                        }
                        if(callouts!==0){
                            barchart_co_data.push({ label: element.record_date_time, y: callouts })
                        }
                    })
                }
                else if(pStepForm.operations_type=="Dental"){
                    newarray.forEach((element, index) => {
                        site = element.site
                        var qvc = 'NA'
                        var vcu = 'NA'
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
                        if(element.visit_capacity_utilization_percentage!='' && element.visit_capacity_utilization_percentage!=null){
                            vcu = parseFloat(element.visit_capacity_utilization_percentage,10)
                            vcu_count += 1
                            total_vcu += parseFloat(element.visit_capacity_utilization_percentage,10)
                        }

                        if(element.qualified_visits_conducted!='' && element.qualified_visits_conducted!=null){
                            qvc = parseFloat(element.qualified_visits_conducted,10)
                            total_qvc += parseFloat(element.qualified_visits_conducted,10)
                        }

                        if(vcu!=='NA'){
                            barchart_vcu_data.push({ label: element.record_date_time, y: vcu })
                        }
                        if(qvc!=='NA'){
                            barchart_qvc_data.push({ label: element.record_date_time, y: qvc })
                        }
                        if(callouts!==0){
                            barchart_co_data.push({ label: element.record_date_time, y: callouts })
                        }
                    })

                }
                else if(pStepForm.operations_type=="Optometry"){
                    newarray.forEach((element, index) => {
                        site = element.site
                        var qvc = 'NA'
                        var vcu = 'NA'
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
                        if(element.visit_capacity_utilization_percentage!='' && element.visit_capacity_utilization_percentage!=null){
                            vcu = parseFloat(element.visit_capacity_utilization_percentage,10)
                            vcu_count += 1
                            total_vcu += parseFloat(element.visit_capacity_utilization_percentage,10)
                        }

                        if(element.qualified_visits_conducted!='' && element.qualified_visits_conducted!=null){
                            qvc = parseFloat(element.qualified_visits_conducted,10)
                            total_qvc += parseFloat(element.qualified_visits_conducted,10)
                        }

                        if(vcu!=='NA'){
                            barchart_vcu_data.push({ label: element.record_date_time, y: vcu })
                        }
                        if(qvc!=='NA'){
                            barchart_qvc_data.push({ label: element.record_date_time, y: qvc })
                        }
                        if(callouts!==0){
                            barchart_co_data.push({ label: element.record_date_time, y: callouts })
                        }
                    })
                }
                total_vcu = ((total_vcu/vcu_count).toFixed(2))
                html += `
                <div class="col-xl-2 col-sm-6 col-12 pb-2">
                   <div class="card swiper-slide" style="background-color: #0093E9;background-image:${total_vcu>=90 ? 'linear-gradient(160deg, #20BF55 0%, #7EE8FA 100%);':total_vcu<90 && total_vcu>50 ? 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)': total_vcu<=50 ?'linear-gradient(160deg, #FE0944 0%, #FEAE96 100%)':'linear-gradient(160deg, #FFDD00 0%, #FBB034 100%)'}">
                     <div class="card-content">
                       <div class="card-body">
                       <label style="font-weight:600;font-size:12px;color:white" >${site}</label>
                         <div class="media d-flex">
                           <div class="align-self-center">
                                <span class="float-left" style="font-weight: 600;font-size:30px;color:white">${total_vcu!=='NA' && total_vcu!=='NaN'?`${total_vcu} %`:`NA`}</span>
                           </div>
                           <div class="media-body text-right">
                           </div>
                         </div>
                         <div class="text-left">
                            <span style="font-weight: 600;font-size:15px;color:white">Average VCU</span>
                        </div>
                       </div>
                     </div>
                   </div>
                </div>`

                html+=`
                <div class="col-xl-2 col-sm-6 col-12 pb-2">
                   <div class="card swiper-slide" style="background-color: #0093E9;background-image:linear-gradient(160deg, #93A5CE 0%, #E4EEE9 100%)">
                     <div class="card-content">
                       <div class="card-body">
                       <label style="font-weight:600;font-size:12px;color:white" >${site}</label>
                         <div class="media d-flex">
                           <div class="align-self-center">
                                <span class="float-left" style="font-weight: 600;font-size:30px;color:white">${total_callouts!=='NA' && total_callouts!=='NaN'?`${total_callouts}`:`NA`}</span>
                           </div>
                           <div class="media-body text-right">
                           </div>
                         </div>
                         <div class="text-left">
                            <span style="font-weight: 600;font-size:15px;color:white">Total Call Outs</span>
                        </div>
                       </div>
                     </div>
                   </div>
                </div>`

                html+=`
                <div class="col-xl-2 col-sm-6 col-12 pb-2">
                   <div class="card swiper-slide" style="background-color: #0093E9;background-image:linear-gradient(160deg, #9F98E8 0%, #AFF6CF 100%);">
                     <div class="card-content">
                       <div class="card-body">
                       <label style="font-weight:600;font-size:12px;color:white" >${site}</label>
                         <div class="media d-flex">
                           <div class="align-self-center">
                                <span class="float-left" style="font-weight: 600;font-size:30px;color:white">${total_qvc!=='NA' && total_qvc!=='NaN'?`${total_qvc}`:`NA`}</span>
                           </div>
                           <div class="media-body text-right">
                           </div>
                         </div>
                         <div class="text-left">
                            <span style="font-weight: 600;font-size:15px;color:white">Total Qualified Visits</span>
                        </div>
                       </div>
                     </div>
                   </div>
                </div>`

                pStepForm.vcuBarChart(barchart_vcu_data)
                pStepForm.qvcBarChart(barchart_qvc_data)
                pStepForm.coBarChart(barchart_co_data)
                $('.average_cards').html(html);
            }else{
                let barchart_vcu_data = []
                let barchart_qvc_data = []
                let barchart_co_data = []
                pStepForm.vcuBarChart(barchart_vcu_data)
                pStepForm.qvcBarChart(barchart_qvc_data)
                pStepForm.coBarChart(barchart_co_data)
                $('.average_cards').html(`<div style="margin: auto;">No Data</div>`);
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
                url: "/staffplanning/api/v1/site/details/",
                data: {
                    site_name: this.site_name,
                    date_start: this.date_start,
                    date_end: this.date_end,
                    limit: this.limit,
                    page: this.page,
                    operations_type: this.operations_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status=='1'){
                        this.data = res.data
                        this.pagination = res.pagination
                        this.renderCards()
                        this.renderTable()
                    }
                    else{
                        this.data = []
                        this.pagination = res.pagination
                        this.renderCards()
                        this.renderTable()
                        
                    }
                },
                error: (err) => {
                    this.data = []
                    this.pagination = res.pagination
                    this.renderCards()
                    this.renderTable()
                }
            })
        },
        setDate(start, end) {
            if (start.format('MMMM D, YYYY') === end.format('MMMM D, YYYY')) {
                if (moment(new Date()).format('MMMM D, YYYY') === start.format('MMMM D, YYYY')){
                    $('#reportrange span').html('Today');
                }else if(moment().subtract(1, 'days').format('MMMM D, YYYY') === start.format('MMMM D, YYYY')){
                    $('#reportrange span').html('Yesterday');
                }
                else{
                    $('#reportrange span').html(start.format('MM-DD-YYYY'));
                }
            }
            else{
                $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            }
            $('#date_start').val(start.format('YYYY-MM-DD'));
            $('#date_end').val(end.format('YYYY-MM-DD'));

            pStepForm.date_start = $('#date_start').val()
            pStepForm.date_end = $('#date_end').val()
            pStepForm.getData()
        },
        isPageInRange(curPage, index, maxPages, pageBefore, pageAfter) {
            if (index <= 1) {
                // first 2 pages
                return true;
            }
            if (index >= maxPages - 2) {
                // last 2 pages
                return true;
            }
            if (index >= curPage - pageBefore && index <= curPage + pageAfter) {
                return true;
            }
        },
        vcuBarChart(barchart_vcu_data){
            let date_title = ''
            if(this.date_start == this.date_end){
                date_title = moment(this.date_start, 'YYYY-MM-DD').format('MM-DD-YYYY');
            }else{
                date_title = moment(this.date_start, 'YYYY-MM-DD').format('MM-DD-YYYY')+' to '+moment(this.date_end, 'YYYY-MM-DD').format('MM-DD-YYYY')
            }
            var options = {
                animationEnabled: true,
                dataPointMaxWidth: 30,
                title: {
                    text: date_title,
                    fontFamily: "tahoma",
                    fontColor: "black",
                    fontWeight: "bold",
                    fontSize: 12,
                },
                axisY: {
                    title: "Visit Capacity(in %)",
                    suffix: "%",
                    gridThickness: 0,
                },
                axisX: {
                    title: "Date",
                },
                data: [{
                    type: "column",
                    yValueFormatString: "#,##0.0#"%"",
                    color: "#3498DB",
                    indexLabel: "{y}",
                    indexLabelPlacement: "outside",  
                    indexLabelOrientation: "horizontal",
                    indexLabelFontSize: 12,
                    indexLabelFontWeight: "bold",
                    dataPoints: barchart_vcu_data
                }]
            }; 
            $("#vcu_chart_Container").CanvasJSChart(options);

        },
        qvcBarChart(barchart_qvc_data){
            let date_title = ''
            if(this.date_start == this.date_end){
                date_title = moment(this.date_start, 'YYYY-MM-DD').format('MM-DD-YYYY');
            }else{
                date_title = moment(this.date_start, 'YYYY-MM-DD').format('MM-DD-YYYY')+' to '+moment(this.date_end, 'YYYY-MM-DD').format('MM-DD-YYYY')
            }
            var options = {
                animationEnabled: true,
                dataPointMaxWidth: 30,
                title: {
                    text: date_title,
                    fontFamily: "tahoma",
                    fontColor: "black",
                    fontWeight: "bold",
                    fontSize: 12,
                },
                axisY: {
                    title: "Qualified Visits",
                    gridThickness: 0,
                },
                axisX: {
                    title: "Date",
                    labelPlacement: "outside"
                },
                data: [{
                    type: "column",
                    yValueFormatString: "#,##0.0#"%"",
                    color: "#F1C40F",
                    indexLabel: "{y}",
                    indexLabelPlacement: "outside",  
                    indexLabelOrientation: "horizontal",
                    indexLabelFontSize: 12,
                    indexLabelFontWeight: "bold",
                    dataPoints: barchart_qvc_data
                }]
            }; 
            $("#qvc_chart_Container").CanvasJSChart(options);

        },
        coBarChart(barchart_co_data){
            let date_title = ''
            if(this.date_start == this.date_end){
                date_title = moment(this.date_start, 'YYYY-MM-DD').format('MM-DD-YYYY');
            }else{
                date_title = moment(this.date_start, 'YYYY-MM-DD').format('MM-DD-YYYY')+' to '+moment(this.date_end, 'YYYY-MM-DD').format('MM-DD-YYYY')
            }
            var options = {
                animationEnabled: true,
                dataPointMaxWidth: 30,
                title: {
                    text: date_title,
                    fontFamily: "tahoma",
                    fontColor: "black",
                    fontWeight: "bold",
                    fontSize: 12,
                },
                axisY: {
                    title: "Callouts",
                    gridThickness: 0,
                },
                axisX: {
                    title: "Date",
                    labelPlacement: "outside"
                },
                data: [{
                    type: "column",
                    yValueFormatString: "#,##0.0#"%"",
                    color: "#E91E63",
                    indexLabel: "{y}",
                    indexLabelPlacement: "outside",  
                    indexLabelOrientation: "horizontal",
                    indexLabelFontSize: 12,
                    indexLabelFontWeight: "bold",
                    dataPoints: barchart_co_data
                }]
            }; 
            $("#co_chart_Container").CanvasJSChart(options);

        },
        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/staffplanning/api/v1/site/details/",
                data: {
                    site_name: this.site_name,
                    date_start: this.date_start,
                    date_end: this.date_end,
                    operations_type: this.operations_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if (res.status === 1) {
                        const data = res.data
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Data");
                        XLSX.writeFile(wb, this.site_name+'.xlsx');
                    }
                },
                error: (err) => {
                }
            })

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

    $('#limit').change(function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    })

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.getData()
    });

    $("body").on('click', '.pagination2', function () {
        $(".pagination2").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.getData()
    });

    $('#dentallimit').change(function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    })

    $('#optometrylimit').change(function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    })
});