const CSV_TABLE_SORT = 'csv_table_sort';

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
        country_count: {
            all: 0,
            active: 0,
            archived: 0
        },
        archive_id: null,
        init() {
            // this.getData()

            // Archive listener

            let localStorageDateSort = localStorage.getItem(CSV_TABLE_SORT);
            if (localStorageDateSort) {
                this.table_sort = JSON.parse(localStorageDateSort);
            }

            let td_keys = $('a.sort-table');

            for (let i = 0; i < td_keys.length; i++) {
                this.changeSortArrow($(td_keys[i]).data('td'));
            }

            $('body').on('click', '.archive', function () {

                //
                dashboardApp.archive_id = $(this).data('id');
            });

            // Modal button listener
            $('#archive-model .btn.btn-primary').click(function () {
                $(this).attr('disabled', true);
                $(this).html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`);
                dashboardApp.archiveAppointment();
                $('#view-model').modal('hide');
            });

            let start = moment('2021-11-10');
            let end = moment();

            // DATE SET
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment('2021-11-10'), moment().add(90, 'days')],
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, this.setDate);

            this.setDate(start, end);

            // Sort click
            $('td a.sort-table').click(function () {
                let key = $(this).data('td');
                if (dashboardApp.table_sort[key] == undefined || dashboardApp.table_sort[key] === 'normal') {
                    dashboardApp.table_sort[key] = 'asc';
                } else if (dashboardApp.table_sort[key] === 'asc') {
                    dashboardApp.table_sort[key] = 'dsc';
                } else {
                    dashboardApp.table_sort[key] = 'normal';
                }
                if (dashboardApp.data.length > 0) {
                    dashboardApp.getData();
                }
                dashboardApp.changeSortArrow(key);
                localStorage.setItem(CSV_TABLE_SORT, JSON.stringify(dashboardApp.table_sort));
            });

            // Modal

            $('body').on('click', 'a.view-data', function () {
                const url = $(this).data('url');
                const name = $(this).data('name');
                dashboardApp.renderModal(url, name);
            });

            // Export button
            $('#export-button').click(function () {
                dashboardApp.downloadExcel();
            });
        },
        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/appointment/api/v1/uploadappointmentlist/",
                data: {
                    date_start: this.start_date,
                    date_end: this.end_date,
                    export: true,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    console.log(res);
                    if (res.status === "1") {
                        const data = res.data;
                        for (var i = 0; i < data.length; i++) {
                            delete data[i].view_url;
                            delete data[i].attachment_support;
                            delete data[i].insurance_card;
                            delete data[i].insurance_card_back;
                            delete data[i].file_1;
                            delete data[i].file_2;
                            delete data[i].file_3;
                            delete data[i].file_4;
                            delete data[i].file_5;
                        }
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "People");
                        XLSX.writeFile(wb, 'clinica-sierra-vista.xlsx');
                    }
                },
                error: err => {}
            });
        },

        renderTable() {

            $('#status_all').html(this.country_count.all);
            $('#status_active').html(this.country_count.active);
            $('#status_archived').html(this.country_count.archived);

            if (this.data.length > 0) {
                let html = '';
                this.data.forEach((element, index) => {
                    var patient_first_name = '';
                    if (element.patient_first_name != null) {
                        patient_first_name = element.patient_first_name;
                    }
                    var patient_last_name = '';
                    if (element.patient_last_name != null) {
                        patient_last_name = element.patient_last_name;
                    }
                    var date_of_birth = '';
                    if (element.date_of_birth != null) {
                        date_of_birth = element.date_of_birth;
                    }
                    var phone_number = '';
                    if (element.phone_number != null) {
                        phone_number = element.phone_number;
                    }
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td class="text-left">${patient_first_name}</td>
                        <td>${patient_last_name}</td>
                        <td>${date_of_birth}</td>
                        <td>${phone_number}</td>
                        <td>${element.is_resolved ? '<span class="badge badge-primary">Archived</span>' : '<span class="badge badge-success">Active</span>'}</td>
                        <td>${element.created_datetime}</td>
                        <td class="hover-icons"><a class="view-data hover-icons" data-toggle="modal" data-id="${element.id}" data-target="#view-model" data-url="${element.view_url}" data-name="${element.patient_first_name} ${element.patient_last_name}"><i class="fa fa-eye text-primary" title="View" style="width: 18px;height: 18px"></i></a>
                        ${element.is_resolved ? '' : `
                        <span class="archive hover-icons" data-id="${element.id}" data-toggle="modal" data-target="#archive-model" >
                        <a>
                        <i class="fa fa-archive text-primary ml-1" title="Archive" style="width: 18px;height: 18px" ></i>
                        </a>
                        </span>`}
                        <span class="hover-icons"><a class="viewlockshow d-none" data-id="${element.id}"><i class="fa fa-lock text-warning" title="Viewing" style="width: 18px;height: 18px"></i></a></span>
                        </td>
                    </tr>`;
                });
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages;

                html = '';
                let separatorAdded = false;
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" 
                            data-date_start="` + 'date_start' + `" data-date_end="` + date_end + `"
                            data-searchKey="` + 'searchKey' + `">` + (i + 1) + `</li>`;
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
                $('#holder').html(html);
                document.querySelector('#holder>li[data-page="' + this.page + '"]').classList.add('active');
            } else {
                $('#storebookingData').html('<tr><td colspan="9">No Data</td></tr>');
                $('#holder').html('');
            }
        },
        getData() {
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/appointment/api/v1/uploadappointmentlist/",
                data: {
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    page: this.page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    this.data = res.data;
                    this.pagination = res.pagination;
                    this.country_count = res.country_count;
                    this.renderTable();
                },
                error: err => {
                    this.data = [];
                    this.country_count = res.country_count;
                    this.renderTable();
                }
            });
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
                url: `/appointment/api/v1/uploadappointmentlist/archive/${this.archive_id}/`,
                type: "POST",
                data: {
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function (res) {
                    $('#archive-model').modal('hide');
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
                    $('#archive-model').modal('hide');
                    $('#error-alert').removeClass('d-none');
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none');
                    }, 3000);
                }
            });
        },
        setDate(start, end) {
            $('#searchBooking').val('');
            if (start.format('MMMM D, YYYY') === 'June 1, 2020') {
                $('#reportrange span').html('Select Date Range');
            } else {
                if (start.format('MMMM D, YYYY') === end.format('MMMM D, YYYY')) {
                    if (moment(new Date()).format('MMMM D, YYYY') === start.format('MMMM D, YYYY')) $('#reportrange span').html('Today');else if (moment().subtract(1, 'days').format('MMMM D, YYYY') === start.format('MMMM D, YYYY')) $('#reportrange span').html('Yesterday');else $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
                } else $('#reportrange span').html(start.format('MM-DD-YYYY') + ' - ' + end.format('MM-DD-YYYY'));
            }
            $('#date_start').val(start.format('YYYY-MM-DD'));
            $('#date_end').val(end.format('YYYY-MM-DD'));

            dashboardApp.start_date = $('#date_start').val();
            dashboardApp.end_date = $('#date_end').val();
            dashboardApp.getData();
        },
        changeSortArrow(key) {

            if (this.table_sort[key] === "normal" || this.table_sort[key] === undefined) {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-up position-absolute" style="top: 9px;color: rgba(128, 128, 128, 0.8);"></i>
                <i class="fa fa-sort-down position-absolute" style="top: 10px;color: rgba(128, 128, 128, 0.8)"></i>
                `);
            } else if (this.table_sort[key] === "asc") {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-up position-absolute" style="top: 9px;color: #11B3AA;"></i>
                `);
            } else {
                $(`td a.sort-table[data-td="${key}"]`).html(`
                <i class="fa fa-sort-down position-absolute" style="top: 10px;color:  #11B3AA"></i>
                `);
            }
        },
        renderModal(url, name) {
            $('#modal-view-title').html(name);
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: url,
                success: res => {
                    $('#modal-view-body').html(res);
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again');
                }
            });
        }
    };
    $.ajaxSetup({
        beforeSend: function (xhr) {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            xhr.setRequestHeader('Timezone', timezone);
        }
    });
    dashboardApp.init();
    document.dashboardApp = dashboardApp;

    $('#searchBooking').keyup(function () {
        dashboardApp.searchKey = $(this).val();
        dashboardApp.page = 1;
        dashboardApp.getData();
    });
    $('.countbox').click(function () {
        let archived = $(this).data('archive');
        if (archived !== dashboardApp.archived) {
            $('.countbox').removeClass('border-active');
            $(this).addClass('border-active');
            dashboardApp.archived = archived;
            dashboardApp.page = 1;
            dashboardApp.getData();
        }
    });

    $('#limit').change(function () {
        dashboardApp.limit = $(this).val();
        dashboardApp.page = 1;
        dashboardApp.getData();
    });

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.getData();
    });
});