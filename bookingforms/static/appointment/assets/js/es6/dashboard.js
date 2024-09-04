const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
        country_name: 'all',
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        searchKey: '',
        limit: 50,
        archived: '',
        page: 1,
        pagination: {},
        table_sort: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        appointment_type:'all',
        country_count: {
            all: 0,
            kern: 0,
            fresno: 0
        },
        archive_id: null,
        appointment_fk:'',
        url: '',
        name: '',
        viewer: '',
        init() {
            // this.getData()

            // Archive listener

            let localStorageDateSort = localStorage.getItem(CSV_TABLE_SORT)
            if (localStorageDateSort) {
                this.table_sort = JSON.parse(localStorageDateSort)
            }

            let td_keys = $('a.sort-table')

            for (let i = 0; i < td_keys.length; i++) {
                this.changeSortArrow($(td_keys[i]).data('td'))
            }


            $('body').on('click', '.archive', function () {

                //
                  dashboardApp.archive_id = $(this).data('id')
            })

            // Modal button listener
            $('#archive-model .btn.btn-primary').click(function () {
                $(this).attr('disabled', true)
                $(this).html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`)
                dashboardApp.archiveAppointment()
                $('#view-model').modal('hide')
            })


            let start = moment('2020-01-01')
            let end = moment()

            // DATE SET
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment('2020-01-01'), moment().add(90, 'days')],
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
            }, this.setDate);

            this.setDate(start, end)

            // Sort click
            $('td a.sort-table').click(function () {
                let key = $(this).data('td')
                if (dashboardApp.table_sort[key] == undefined || dashboardApp.table_sort[key] === 'normal') {
                    dashboardApp.table_sort[key] = 'asc'
                } else if (dashboardApp.table_sort[key] === 'asc') {
                    dashboardApp.table_sort[key] = 'dsc'
                } else {
                    dashboardApp.table_sort[key] = 'normal'
                }
                if (dashboardApp.data.length > 0) {
                    dashboardApp.getData()
                }
                dashboardApp.changeSortArrow(key)
                localStorage.setItem(CSV_TABLE_SORT, JSON.stringify(dashboardApp.table_sort))
            })

            // Modal

            $('body').on('click', 'a.view-data', function () {
                dashboardApp.url = $(this).data('url')
                dashboardApp.appointment_fk = $(this).data('id')
                dashboardApp.name = $(this).data('name')
                const status = 'viewing'
                dashboardApp.viewLock(dashboardApp.appointment_fk,status)
            })
            $('#view-model').on('hidden.bs.modal', function () {
                const status = 'closing'
                dashboardApp.viewLock(dashboardApp.appointment_fk,status)
                
            })

            $(window).on('beforeunload', function(){
                const status = 'closing'
                dashboardApp.viewLock(dashboardApp.appointment_fk,status)
            })

            // Export button
            $('#export-button').click(function () {
                dashboardApp.downloadExcel()
            })

        },
        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/appointment/api/v1/appointmentlist/",
                data: {
                    country_name: this.country_name,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    export: true,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    appointment_type: this.appointment_type
                },
                success: (res) => {
                    if (res.status === "1") {
                        const data = res.data
                        for(var i = 0; i < data.length; i++){
                            delete data[i].view_url
                            var val = data[i].county
                            delete data[i].county
                            delete data[i].is_healthworker_or_above_age_65
                            data[i].Location = val
                            if(data[i].vaccine_eligibility_status == null)
                            {
                                data[i].vaccine_eligibility_status =''
                                if(data[i].is_healthworker != null)
                                {
                                    if(data[i].is_healthworker == 1)
                                    {
                                        data[i].vaccine_eligibility_status = "Healthcare Worker"
                                    }
                                    else
                                    {
                                        if(data[i].is_above_age_65 != null)
                                        {
                                            if(data[i].is_above_age_65 == 1)
                                            {
                                                data[i].vaccine_eligibility_status = "65+ Year Old"
                                            }
                                        }
                                    }
                                }
                            }
                            delete data[i].is_above_age_65
                            delete data[i].is_healthworker
                            if(data[i].preferred_date == '1111-11-11')
                            {
                                data[i].preferred_date = ''
                            }
                        }
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "People");
                        XLSX.writeFile(wb, 'clinica-sierra-vista.xlsx');
                    }
                },
                error: (err) => {
                }
            })

        },

        renderTable() {

            $('#status_all').html(this.country_count.all)
            $('#status_up').html(this.country_count.fresno)
            $('#status_com').html(this.country_count.kern)

            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    var preferred_date = element.preferred_date
                    if(element.preferred_date == null || element.preferred_date == '1111-11-11')
                    {
                        if(element.preferred_day_of_week != null)
                        {
                            preferred_date = element.preferred_day_of_week
                        }
                        else
                        {
                            preferred_date = ''
                        }
                    }
                    var isAcceptText = '';
                    if(element.is_contact_number_reachable_by_text != null)
                    {
                        isAcceptText = element.is_contact_number_reachable_by_text == 1 ? 'Yes':'No';
                    }
                    // var vaccineAppointmentSpecific = '';
                    // if($('#appointment_type').val() == 'COVID-19 Vaccine')
                    // {
                    //     vaccineAppointmentSpecific = `
                    //     <td>${isHealthWorker}</td>
                    //     <td>${isAboveAge65}</td>
                    //     `;
                    // }
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td class="text-left">${element.county}</td>
                        <td>${element.appointment_type}</td>
                        <td>${preferred_date}</td>
                        <td>${element.preferred_time_frame}</td>
                        <td>${isAcceptText}</td>
                        <td>${element.first_name}</td>
                        <td>${element.last_name}</td>
                        <td>${element.contact_number}</td>
                        <td>${element.is_archived ? '<span class="badge badge-primary">Archived</span>' : '<span class="badge badge-success">Active</span>'}</td>
                        <td>${element.created_datetime}</td>
                        <td class="hover-icons"><a class="view-data hover-icons" data-toggle="modal" data-id="${element.id}" data-target="#view-model" data-url="${element.view_url}" data-name="${element.first_name} ${element.last_name}"><i class="fa fa-eye text-primary" title="View" style="width: 18px;height: 18px"></i></a>
                        ${element.is_archived ? '' : `
                        <span class="archive hover-icons" data-id="${element.id}" data-toggle="modal" data-target="#archive-model" >
                        <a>
                        <i class="fa fa-archive text-primary ml-1" title="Archive" style="width: 18px;height: 18px" ></i>
                        </a>
                        </span>`}
                        <span class="hover-icons"><a class="viewlockshow d-none" data-id="${element.id}"><i class="fa fa-lock text-warning" title="Viewing" style="width: 18px;height: 18px"></i></a></span>
                        </td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" data-country_name="` + '' + `" 
                            data-date_start="`+ 'date_start' + `" data-date_end="` + date_end + `"
                            data-searchKey="`+ 'searchKey' + `">` + (i + 1) + `</li>`;
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

            } else {
                $('#storebookingData').html('<tr><td colspan="9">No Data</td></tr>');
                $('#holder').html('')
            }
        },
        getData() {
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/appointment/api/v1/appointmentlist/",
                data: {
                    country_name: this.country_name,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    page: this.page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                    appointment_type: this.appointment_type,
                },
                success: (res) => {
                    this.data = res.data
                    this.pagination = res.pagination
                    this.country_count = res.country_count
                    this.renderTable()
                },
                error: (err) => {
                    this.data = []
                    this.country_count = res.country_count
                    this.renderTable()
                }
            })
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
        archiveAppointment() {
            $.ajax({
                url: `/appointment/api/v1/appointmentlist/archive/${this.archive_id}/`,
                type: "POST",
                data: {
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    $('#archive-model').modal('hide')
                    let model = null
                    $('#archive-model .btn.btn-primary').html('Archive')
                    $('#archive-model .btn.btn-primary').attr('disabled', false)
                    if (res.status != 1) {
                        model = $('#error-alert')
                    } else {
                        model = $('#success-alert')
                        $('#archive-view-button').html("Archived");
                        $('#archive-view-button').attr('disabled', true);
                        $('#archive-view-button').removeClass('btn btn-primary');
                        $('#archive-view-button').addClass('btn btn-secondary');
                        dashboardApp.getData()
                    }
                    $(model).removeClass('d-none')
                    setTimeout(function () {
                        $(model).addClass('d-none')
                    }, 3000)
                },
                error: function () {
                    $('#archive-model .btn.btn-primary').html('Archive')
                    $('#archive-model .btn.btn-primary').attr('disabled', false)
                    $('#archive-model').modal('hide')
                    $('#error-alert').removeClass('d-none')
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none')
                    }, 3000)
                }
            })
        },
        setDate(start, end) {
            $('#searchBooking').val('');
            if (start.format('MMMM D, YYYY') === 'June 1, 2020') {
                $('#reportrange span').html('Select Date Range');
            } else {
                if (start.format('MMMM D, YYYY') === end.format('MMMM D, YYYY')) {
                    if (moment(new Date()).format('MMMM D, YYYY') === start.format('MMMM D, YYYY'))
                        $('#reportrange span').html('Today');
                    else if(moment().subtract(1, 'days').format('MMMM D, YYYY') === start.format('MMMM D, YYYY'))
                        $('#reportrange span').html('Yesterday');
                    else
                        $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));

                } else
                    $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            }
            $('#date_start').val(start.format('YYYY-MM-DD'));
            $('#date_end').val(end.format('YYYY-MM-DD'));

            dashboardApp.start_date = $('#date_start').val()
            dashboardApp.end_date = $('#date_end').val()
            dashboardApp.getData()
        },
        changeSortArrow(key) {

            if (this.table_sort[key] === "normal" || this.table_sort[key] === undefined) {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-up position-absolute" style="top: 9px;color: rgba(128, 128, 128, 0.8);"></i>
                <i class="fa fa-sort-down position-absolute" style="top: 10px;color: rgba(128, 128, 128, 0.8)"></i>
                `)
            } else if (this.table_sort[key] === "asc") {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-up position-absolute" style="top: 9px;color: #11B3AA;"></i>
                `)
            } else {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-down position-absolute" style="top: 10px;color:  #11B3AA"></i>
                `)
            }
        },
        renderModal(url, name) {
            $('#modal-view-title').html(name)
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: url,
                success: (res) => {
                    $('#modal-view-body').html(res)
                    if(dashboardApp.viewer!='')
                    {
                        $('#viewlock').addClass('badge badge-danger')
                        $('#viewlock').text('Viewing by: '+ dashboardApp.viewer)
                        $('#archive-view-button').prop('disabled',true)
                    }
                    else
                    {
                        $('#viewlock').text('Not Viewing')
                    }
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        viewLock(appointment_fk,status) {
            $.ajax({
                type: "POST",
                url: `/appointment/viewlock/${appointment_fk}/`,
                data: {
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                    status:status,
                },
                success: (res) => {
                    dashboardApp.viewer=res
                    dashboardApp.renderModal(dashboardApp.url, dashboardApp.name)
                },
                error: () => {
                    console.log("error")
                }
            })
        },
    }
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    dashboardApp.init()
    document.dashboardApp = dashboardApp;

    setInterval(function(){ 
        $.ajax({
            type: "GET",
            url: `/appointment/viewlockfetchid/`,
            success: (res) => {
                $('.viewlockshow').addClass('d-none')
                for(let i=0;i<res.locked_appointment.length; i++)
                {
                    $($(`[data-id=${res.locked_appointment[i].id}]`)[2]).removeClass('d-none')
                }
            },
            error: () => {
                console.log("error")
            }
        })
    }, 5000);

    $('#searchBooking').keyup(function () {
        dashboardApp.searchKey = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    });
    $('.countbox').click(function () {
        let archived = $(this).data('archive')
        if (archived !== dashboardApp.archived) {
            $('.countbox').removeClass('border-active')
            $(this).addClass('border-active')
            dashboardApp.archived = archived
            dashboardApp.page = 1
            dashboardApp.getData()
        }
    })

    $('#country-selector').change(function () {
        dashboardApp.country_name = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    })

    $('#vaccine-type').change(function () {
        dashboardApp.appointment_type = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    })


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
    
})