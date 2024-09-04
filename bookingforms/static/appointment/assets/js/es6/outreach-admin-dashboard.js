const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
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
        outreach:$('input[name=outreach_name]').val(),
        outreachData:[],
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


            $('body').on('click', '.confirm_appointment', function () {
                  dashboardApp.archive_id = $(this).data('id')
            })

            // Modal button listener
            $('#archive-model .btn.btn-primary').click(function () {
                dashboardApp.confirmAppointment()
                $('#archive-model').modal('hide')
            })


            let start = moment('2021-10-01')
            let end = moment()

            // DATE SET
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment('2021-10-01'), moment()],
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

            $('body').on('click', 'a.view-data', function () {
                dashboardApp.archive_id = $(this).data('id')
                const name = $(this).data('name')
                dashboardApp.renderModal(name)
            })

            $('body').on('click', '.cancel-appointment', function () {
                dashboardApp.archive_id = $(this).data('id');
            });

            $('#cancel-appointment-model .btn.btn-primary').click(function () {
                if($("#id_reason_for_cancel_text").val()==''){
                    $("#id_reason_for_cancel_text").addClass('error')
                }
                else{
                    const reason_text = $("#id_reason_for_cancel_text").val()
                    dashboardApp.cancelAppointment(reason_text);
                    $('#cancel-appointment-model').modal('hide');
                    $("#id_reason_for_cancel_text").removeClass('error')
                }
            });

            $('body').on('click', '.confirm-cancel-appointment', function () {
                dashboardApp.archive_id = $(this).data('id');
            });

            $('body').on('click', '#confirm-cancel-appointment-model .btn-primary', function () {
                dashboardApp.cancelAppointment();
                $('#confirm-cancel-appointment-model').modal('hide');
            });

        },
        cancelAppointment(reason_text=null) {
            $.ajax({
                url: `/appointment/api/v1/outreach/cancel-admin/`,
                type: "POST",
                data: {
                    archive_id: this.archive_id,
                    reason_text: reason_text,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function (res) {
                    $("#id_reason_for_cancel_text").val('')
                    let model = null;
                    if (res.status != 1) {
                        model = $('#error-alert');
                    } else {
                        model = $('#success-alert');
                        dashboardApp.getData();
                    }
                    $(model).removeClass('d-none');
                    setTimeout(function () {
                        $(model).addClass('d-none');
                    }, 3000);
                },
                error: function () {
                    $('#error-alert').removeClass('d-none');
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none');
                    }, 3000);
                }
            });
        },
        renderTable() {

            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    let fields =this.outreachData[0].columns
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">`
                    fields.forEach((field,index)=>{
                            html += `<td>${element[field]}</td>`
                          })
                    html += `
                    <td>${element.latest_outreach_status}</td>
                    <td>${element.latest_outreach_status == 'Appointment scheduled' ? `<span class="hover-icons" data-toggle="modal" data-target="#archive-model"><a class="confirm_appointment" data-id="${element.latest_id}"><i class="fa fa-plus-circle text-warning" aria-hidden="true" title="Confirm" style="width: 18px;height: 18px"></i></a></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.latest_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>` : element.latest_outreach_status == 'Appointment canceled' ? `<span class="hover-icons"><a data-id="${element.latest_id}"><i class="fa fa-check-circle text-danger" aria-hidden="true" title="Appointment Canceled" style="width: 18px;height: 18px"></i></a></span>` : element.latest_outreach_status == 'Appointment cancelation requested' && element.is_cancelation_requested_by_csv == true? `<span class="hover-icons" data-id="${element.latest_id}"><i class="fa fa-times text-warning" aria-hidden="true" title="Appointment cancelation requested" style="width: 18px;height: 18px"></i></span>` : element.latest_outreach_status == 'Appointment cancelation requested' && element.is_cancelation_requested_by_csv == false ? `<span class="hover-icons confirm-cancel-appointment" data-toggle="modal" data-target="#confirm-cancel-appointment-model" data-id="${element.latest_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Confirm Cancelation" style="width: 18px;height: 18px"></i></span>`:`<span class="hover-icons"><a data-id="${element.latest_id}"><i class="fa fa-check-circle text-success" aria-hidden="true" title="Appointment Confirmed" style="width: 18px;height: 18px"></i></a></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.latest_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>`}
                        <a class="view-data hover-icons" data-toggle="modal" data-id="${element.latest_id}" data-target="#view-model" data-name="${element.first_name} ${element.last_name}"><i class="fa fa-eye text-primary" title="View" style="width: 18px;height: 18px"></i></a>
                        </td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" 
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
                url: "/appointment/api/v1/outreachadminlist/",
                data: {
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    searchKey: this.searchKey,
                    table_sort: JSON.stringify(this.table_sort),
                    page: this.page,
                    outreach:this.outreach,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    this.data = res.data
                    this.pagination = res.pagination
                    this.country_count = res.country_count
                    this.outreachData= res.outreachData
                    let html = ''
                    console.log(res);
                    res.outreachData[0]['columns'].forEach((element, index) => {
                        html += `<td>${element}</td>`
                    })
                    html += `
                    <td>Appointment Status</td>
                    <td style="width: 11%;">Action</td>`
                    $('.dynamic_table_headers').html(html);
                    this.renderTable()
                    this.notificationchecker()
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
        confirmAppointment() {
            $.ajax({
                url: `/appointment/api/v1/outreach/appointment/confirm/${this.archive_id}/`,
                type: "POST",
                data: {
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    let model = null
                    if (res.status != 1) {
                        model = $('#error-alert')
                    } else {
                        model = $('#success-alert')
                        dashboardApp.getData()
                    }
                    $(model).removeClass('d-none')
                    setTimeout(function () {
                        $(model).addClass('d-none')
                    }, 3000)
                },
                error: function () {
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
        renderModal(name) {
            $('#modal-view-title').html(name)
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/appointment/outreach/${this.outreach}/${this.archive_id}/`,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        notificationchecker(){
            $.ajax({
                url: `/appointment/api/v1/outreach/notification-check/`,
                type: "POST",
                data: {
                    accessing_from: this.outreach+'-admin-dashboard',
                    outreach:this.outreach,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    $(".icon-button__badge").text(res.count)

                },
                error: function () {
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
    dashboardApp.notificationchecker()
    setInterval(function(){ 
        dashboardApp.notificationchecker()
    }, 300000);
    $('#searchBooking').keyup(function () {
        dashboardApp.searchKey = $(this).val()
        dashboardApp.page = 1
        dashboardApp.getData()
    });

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