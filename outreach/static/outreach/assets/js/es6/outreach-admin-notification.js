const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
        limit: 50,
        page: 1,
        pagination: {},
        table_sort: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        archive_id: null,
        outreach:$('input[name=outreach_name]').val(),

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

            $('body').on('click', 'a.view-data', function () {
                dashboardApp.archive_id = $(this).data('id')
                const name = $(this).data('name')
                dashboardApp.renderModal(name)
            })

            $('body').on('click', '.confirm-cancel-appointment', function () {
                dashboardApp.archive_id = $(this).data('id');
            });

            $('body').on('click', '#confirm-cancel-appointment-model .btn-primary', function () {
                dashboardApp.cancelAppointment();
                $('#confirm-cancel-appointment-model').modal('hide');
            });

            dashboardApp.getData()
        },
        cancelAppointment(reason_text=null) {
            $.ajax({
                url: `/outreach/api/v1/outreach/cancel-admin/`,
                type: "POST",
                data: {
                    archive_id: this.archive_id,
                    reason_text: reason_text,
                    outreach: this.outreach,
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

                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.mrn}</td>
                        <td class="text-left">${element.appointment_location}</td>
                        <td>${element.appointment_date}</td>
                        <td>${element.appointment_time}</td>
                        <td>${element.first_name}</td>
                        <td>${element.last_name}</td>
                        <td>${element.phone_number}</td>
                        <td>${element.created_datetime}</td>
                        <td>${element.out_reach_status == 'Appointment scheduled' ? `<span class="hover-icons" data-toggle="modal" data-target="#archive-model"><a class="confirm_appointment" data-id="${element.id}"><i class="fa fa-plus-circle text-warning" aria-hidden="true" title="Confirm" style="width: 18px;height: 18px"></i></a></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>` : element.out_reach_status == 'Appointment canceled' ? `<span class="hover-icons"><a data-id="${element.id}"><i class="fa fa-check-circle text-danger" aria-hidden="true" title="Appointment Canceled" style="width: 18px;height: 18px"></i></a></span>` : element.out_reach_status == 'Appointment cancelation requested' && element.is_cancelation_requested_by_csv == true? `<span class="hover-icons" data-id="${element.id}"><i class="fa fa-times text-warning" aria-hidden="true" title="Appointment cancelation requested" style="width: 18px;height: 18px"></i></span>` : element.out_reach_status == 'Appointment cancelation requested' && element.is_cancelation_requested_by_csv == false ? `<span class="hover-icons confirm-cancel-appointment" data-toggle="modal" data-target="#confirm-cancel-appointment-model" data-id="${element.id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Confirm Cancelation" style="width: 18px;height: 18px"></i></span>`:`<span class="hover-icons"><a data-id="${element.id}"><i class="fa fa-check-circle text-success" aria-hidden="true" title="Appointment Confirmed" style="width: 18px;height: 18px"></i></a></span><span class="hover-icons cancel-appointment" data-toggle="modal" data-target="#cancel-appointment-model" data-id="${element.id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Cancel Appointment" style="width: 18px;height: 18px"></i></span>`}
                        <a class="view-data hover-icons" data-toggle="modal" data-id="${element.id}" data-target="#view-model" data-name="${element.first_name} ${element.last_name}"><i class="fa fa-eye text-primary" title="View" style="width: 18px;height: 18px"></i></a>
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
                url: "/outreach/api/v1/outreach/notification/",
                data: {
                    filter:'Outreach dashboard',
                    limit: this.limit,
                    page: this.page,
                    outreach: this.outreach,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    this.data = res.data
                    this.pagination = res.pagination
                    this.country_count = res.country_count
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
                url: `/outreach/api/v1/outreach/appointment/confirm/${this.archive_id}/`,
                type: "POST",
                data: {
                    outreach: this.outreach,
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
        renderModal(name) {
            $('#modal-view-title').html(name)
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/outreach/outreach/${this.outreach}/${this.archive_id}/`,
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
                url: `/outreach/api/v1/outreach/notification-check/`,
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
    }, 600000);
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