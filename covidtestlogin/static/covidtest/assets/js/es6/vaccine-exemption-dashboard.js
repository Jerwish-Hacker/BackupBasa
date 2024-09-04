const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
        county_name: 'all',
        vaccine_type: $('input[name=vaccine_type]').val(),
        searchKey: '',
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        country_count: {
            all: 0,
        },
        user_id: null,
        email:'',
        name:'',
        rejectcomment:'',
        file_name:'',
        file_approve:true,
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

            $('body').on('click', '.fileapprovebutton', function () {
                dashboardApp.file_name = $(this).data('filename')
                dashboardApp.file_approve = true
                dashboardApp.verifyData()
            })

            $('body').on('click', '.filerejectbutton', function () {
                dashboardApp.file_name = $(this).data('filename')
                dashboardApp.file_approve = false
            })

            $('body').on('click', 'span.viewtoggler', function () {
                dashboardApp.name = $(this).data('name')
                dashboardApp.user_id = $(this).data('id')
                dashboardApp.email = $(this).data('email')
                dashboardApp.renderModal()
            })

            // Modal button listener
            $('#archive-model .btn.btn-primary').click(function () {
                dashboardApp.rejectcomment= $('#rejecttext').val()
                dashboardApp.verifyData()
                $('#archive-model').modal('hide')
                
            })


            let start = moment('2021-01-01')
            let end = moment()

            // DATE SET
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment('2021-01-01'), moment()],
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
            }, this.setDate);

            this.setDate(start, end)

            $('#export-button').click(function () {
                dashboardApp.downloadExcel()
            })


        },
        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/vaccine/api/v1/vaccineexemption-dashboard/",
                data: {
                    county_name: this.county_name,
                    date_start: this.start_date,
                    searchKey: this.searchKey,
                    date_end: this.end_date,
                    page: this.page,
                    vaccine_type: this.vaccine_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if (res.status === "1") {
                        const data = res.data
                        for(var i = 0; i < data.length; i++){
                            delete data[i].id
                            delete data[i].user_id
                            delete data[i].file_1
                            delete data[i].file_1_status
                            delete data[i].file_2
                            delete data[i].file_2_status
                            delete data[i].file_3
                            delete data[i].file_3_status
                            delete data[i].file_4
                            delete data[i].file_4_status
                            delete data[i].file_5
                            delete data[i].file_5_status
                            delete data[i].file_6
                            delete data[i].file_6_status
                            delete data[i].file_7
                            delete data[i].file_7_status
                            delete data[i].signature
                        }
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "People");
                        XLSX.writeFile(wb, 'Vaccine Exemption.xlsx');
                    }
                },
                error: (err) => {
                }
            })
        },
        renderTable() {

            $('#status_all').html(this.country_count.all)

            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    var length_of_uploaded_file = 0
                    var file_status_total = 0
                    var status = ''

                    if(element.file_1 !== '' && element.file_1 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_1_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_1_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(element.file_2 !== '' && element.file_2 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_2_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_2_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(element.file_3 !== '' && element.file_3 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_3_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_3_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(element.file_4 !== '' && element.file_4 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_4_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_4_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(element.file_5 !== '' && element.file_5 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_5_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_5_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(element.file_6 !== '' && element.file_6 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_6_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_6_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(element.file_7 !== '' && element.file_7 !== null){
                        length_of_uploaded_file = length_of_uploaded_file + 1
                        if(element.file_7_status){
                            file_status_total = file_status_total + 1
                        }
                        else if(element.file_7_status==false){
                            status = 'Rejected'
                        }
                    }
                    if(length_of_uploaded_file==file_status_total){
                        status = 'Completed'
                    }
                    else if(status == ''){  
                        status = 'Review'
                    }
                    var reviewed_date = ''
                    if(element.reviewed_date!==null){
                        reviewed_date = moment(element.reviewed_date,'YYYY-MM-DD').format("MM-DD-YYYY")
                    }
                    var staff =''
                    if(element.staff!==null){
                        staff = element.staff
                    }
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.position_id}</td>
                        <td>${element.payroll_name}</td>
                        <td>${element.type_of_exemption}</td>
                        <td>${element.home_department_description}</td>
                        <td>${element.eeo_establishment}</td>
                        <td>${element.reports_to_name}</td>
                        <td>${staff}</td>
                        <td>${reviewed_date}</td>
                        <td>${status=="Review" ? `<span class="badge badge-warning archive hover-icons viewtoggler" data-id="${element.id}" data-name="${element.payroll_name}" data-email="${element.email}" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Review</span>` : status=="Completed" ? `<span class="badge badge-success archive hover-icons viewtoggler" data-id="${element.id}" data-name="${element.payroll_name}" data-email="${element.email}" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Completed</span>`: `<span class="badge badge-danger archive hover-icons viewtoggler" data-id="${element.id}" data-name="${element.payroll_name}" data-email="${element.email}" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Rejected</span>`}</td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" data-county_name="` + '' + `" 
                            data-date_start="`+ 'date_start' + `" data-date_end="` + date_end +`">` + (i + 1) + `</li>`;
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
                url: "/vaccine/api/v1/vaccineexemption-dashboard/",
                data: {
                    county_name: this.county_name,
                    date_start: this.start_date,
                    searchKey: this.searchKey,
                    date_end: this.end_date,
                    limit: this.limit,
                    is_vaccinated: this.is_vaccinated,
                    page: this.page,
                    vaccine_type: this.vaccine_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
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
        verifyData() {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                url: '/vaccine/api/v1/vaccine-exemption/verify/',
                type: "POST",
                data: {
                    file_approve: dashboardApp.file_approve,
                    file_name: dashboardApp.file_name,
                    rejectcomment: dashboardApp.rejectcomment,
                    user_id:dashboardApp.user_id,
                    email:dashboardApp.email,
                    name:dashboardApp.name,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    $('#archive-model').modal('hide')
                    let model = null
                    $('#archive-model .btn.btn-primary').html('Proceed')
                    if (res.status != 1) {
                        model = $('#error-alert')
                    } else {
                        model = $('#success-alert')
                        $('#rejecttext').val('')
                        dashboardApp.renderModal()
                        dashboardApp.getData()
                    }
                    $(model).removeClass('d-none')
                    setTimeout(function () {
                        $(model).addClass('d-none')
                    }, 3000)
                },
                error: function () {
                    $('#archive-model .btn.btn-primary').html('Proceed')
                    $('#archive-model').modal('hide')
                    $('#error-alert').removeClass('d-none')
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none')
                    }, 3000)
                }
            })
        },
        setDate(start, end) {
            $('#searchKey').val('');
            dashboardApp.searchKey=''
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
        renderModal() {
            $('#modal-view-title').html(dashboardApp.name)
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/vaccine/vaccine-exemption-dashboard/${dashboardApp.user_id}/`,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        renderSelectBox: function(nameOfSelect, choices) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
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
    var location = JSON.parse($('#alllocation').val());
    dashboardApp.renderSelectBox("location",location)

    $('#location-selector').change(function () {
        if($("#county-selector").val()==''){
            dashboardApp.county_name = 'all'
            dashboardApp.page = 1
            dashboardApp.getData()
        }
        else{
            dashboardApp.county_name = $(this).val()
            dashboardApp.page = 1
            dashboardApp.getData()
        }
    })
    $('#employee-response').change(function () {
        if($("#employee-response").val()==''){
            dashboardApp.employee_response_selector = 'all'
            dashboardApp.page = 1
            dashboardApp.getData()
        }
        else{
            dashboardApp.employee_response_selector = $(this).val()
            dashboardApp.page = 1
            dashboardApp.getData()
        }
    })
    $('#searchKey').keyup(function () {
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