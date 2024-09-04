const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
        vaccine_type: $('input[name=vaccine_type]').val(),
        county_name: 'all',
        searchKey: '',
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        limit: 50,
        is_vaccinated: '',
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        country_count: {
            all: 0,
            pending:0,
            vaccinated: 0,
            unvaccinated: 0
        },
        user_id: null,
        vaccination_table_id: null,
        url: '',
        name:'',
        rejectcomment:'',
        file_name:'',
        file_approve:true,
        filenumber:1,
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

            $('body').on('click', '#epic_medical_record_approve', function () {
                const buttontype = 'approve'
                const epicrejectcomment = ''
                dashboardApp.Epicmedical(buttontype,epicrejectcomment)
            })

            $('body').on('click', '#epic_medical_record_reject_proceed', function () {
                const buttontype = 'reject'
                const epicrejectcomment = $('#rejecttextepicrecord').val()
                dashboardApp.Epicmedical(buttontype,epicrejectcomment)
            })

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
                if($(this).data('status')!='Not Submitted'){
                    dashboardApp.vaccination_table_id = $(this).data('id')
                    dashboardApp.user_id = $(this).data('userid')
                    dashboardApp.renderModal()
                }
                else{
                    dashboardApp.user_id = $(this).data('id')
                    $('#modal-view-title').html(dashboardApp.name)
                    $('#modal-view-body').html(`<div class="row justify-content-start">
                    <div class="col-md-6 pt-4">
                         <div class="alert alert-danger d-none my-2" role="alert" id="errormessages">
                        </div>
                        <form id="pending-employeevaccination-file-form" enctype="multipart/form-data">
                            <div class="collapse show">
                            <div class="card card-body">
                                <div class="row justify-content-start">
                                    <div class="text-left col-md-12">
                                        <input class="form-check-input" type="hidden" value="" id="hiddenuserid" name="userid">
                                        <p>Upload PDF or JPG Files<br>Maximum file size is 2.5 MB<br>Maximum 3 files can be uploaded</p>
                                        <button type="button" class="btn btn-info" id="addfile"><i class="bi bi-file-earmark-plus p-2"></i>Add File</button>
                                    </div>
                                    <div class="col-md-3 pt-2" id="filesContainer">
                                        <input class="fileclass" type="file" name="file_1">
                                    </div>
                                </div>
                                <div class="col-md-12 text-right">
                                    <button type="submit" class="btn btn-primary"><i class="fa fa-spinner fa-spin d-none"></i>Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                </div>`)
                }
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

            $('body').on('click','#addfile',function() {
                const all_input_file_elements = $('#view-model').find('input[type="file"]')
                if(all_input_file_elements.length<3){
                    dashboardApp.filenumber = dashboardApp.filenumber + 1
                    $('#filesContainer').append(
                        $('<input class="fileclass pt-2"/>').attr('type', 'file').attr('name', 'file_'+dashboardApp.filenumber)
                    );
                }
            });


        },
        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/vaccine/api/v1/covidnontesting/",
                data: {
                    county_name: this.county_name,
                    date_start: this.start_date,
                    searchKey: this.searchKey,
                    date_end: this.end_date,
                    is_vaccinated: this.is_vaccinated,
                    page: this.page,
                    vaccine_type: this.vaccine_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if (res.status === "1") {
                        const data = res.data
                        delete data[i].id
                        delete data[i].user_id
                        delete data[i].file_1
                        delete data[i].file_1_status
                        delete data[i].file_2
                        delete data[i].file_2_status
                        delete data[i].signature_data
                        delete data[i].created_datetime
                        delete data[i].modified_datetime
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "People");
                        XLSX.writeFile(wb, 'Vaccine Reporting.xlsx');
                    }
                },
                error: (err) => {
                }
            })
        },
        renderTable() {

            $('#status_all').html(this.country_count.all)
            $('#status_pending').html(this.country_count.pending)
            $('#status_up').html(this.country_count.vaccinated)
            $('#status_com').html(this.country_count.unvaccinated)

            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    var length_of_uploaded_file = 0
                    var file_status_total = 0
                    var status = ''
                    var file_status = ''
                    if(element.user_submission_datetime==null){
                        status = 'Not Submitted'
                        employee_response = 'Pending'
                    }
                    else{
                        if(element.file_1 !== '' && element.file_1 !== null){
                            length_of_uploaded_file = length_of_uploaded_file + 1
                            if(element.file_1_status){
                                file_status_total = file_status_total + 1
                            }
                            else if(element.file_1_status==false){
                                file_status = 'Rejected'
                            }
                        }
                        if(element.file_2 !== '' && element.file_2 !== null){
                            length_of_uploaded_file = length_of_uploaded_file + 1
                            if(element.file_2_status){
                                file_status_total = file_status_total + 1
                            }
                            else if(element.file_2_status==false){
                                file_status = 'Rejected'
                            }
                        }
                        if(element.file_3 !== '' && element.file_3 !== null){
                            length_of_uploaded_file = length_of_uploaded_file + 1
                            if(element.file_3_status){
                                file_status_total = file_status_total + 1
                            }
                            else if(element.file_3_status==false){
                                file_status = 'Rejected'
                            }
                        }
                        if(element.is_proof_or_vaccination_copy_provided){
                            employee_response = 'Checkbox One'
                            if(length_of_uploaded_file==file_status_total){
                                status = 'Completed'
                            }
                            else if(status == ''){  
                                status = 'Review'
                            }
                            else if(file_status=='Rejected'){
                                status = 'Rejected'
                            }
                        }
                        else if(element.allow_csv_to_pull_record){
                            employee_response = 'Checkbox Two'
                            if(length_of_uploaded_file==file_status_total && element.is_approved_by_staff==true){
                                status = 'Completed'
                            }
                            else if(element.is_approved_by_staff==false || file_status=='Rejected'){
                                status = 'Rejected'
                            }
                            else{
                                status = 'Review'
                            }
                        }
                        else if(element.is_vaccine_declined){
                            employee_response = 'Checkbox Three'
                            if(length_of_uploaded_file==file_status_total){
                                status = 'Completed'
                            }
                            else if(file_status=='Rejected'){
                                status = 'Rejected'
                            }
                            else{
                                status = 'Review'
                            }
                        }
                    }
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.user__position_id}</td>
                        <td>${element.user__payroll_name}</td>
                        <td>${element.user__job_title_description}</td>
                        <td>${employee_response}</td>
                        <td>${element.user__home_department_description}</td>
                        <td>${status=="Review" ? `<span class="badge badge-warning archive hover-icons viewtoggler" data-id="${element.id}" data-userid="${element.user__id}" data-name="${element.user__payroll_name}" data-status="Review" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Review</span>` : status=="Completed" ? `<span class="badge badge-success archive hover-icons viewtoggler" data-id="${element.id}" data-userid="${element.user__id}" data-name="${element.user__payroll_name}" data-status="Completed" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Completed</span>`:  status=="Rejected" ? `<span class="badge badge-danger archive hover-icons viewtoggler" data-id="${element.id}" data-userid="${element.user__id}" data-name="${element.user__payroll_name}" data-status="Rejected" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Rejected</span>`:`<span class="badge badge-info archive hover-icons viewtoggler" data-id="${element.id}" data-name="${element.user__payroll_name}" data-status="Not Submitted" data-toggle="modal" data-target="#view-model" style="cursor:pointer;width:80%;height:22px;font-size:12px;font-family: Arial, Helvetica, sans-serif;">Not Submitted</span>`}</td>
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
                url: "/vaccine/api/v1/vaccinationlist/",
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
                url: '/vaccine/api/v1/covidtest/verify/',
                type: "POST",
                data: {
                    file_approve: dashboardApp.file_approve,
                    file_name: dashboardApp.file_name,
                    rejectcomment: dashboardApp.rejectcomment,
                    user_id:dashboardApp.user_id,
                    vaccine_type: this.vaccine_type,
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
        Epicmedical(status,epicrejectcomment) {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                url: '/vaccine/api/v1/covidtest/verify-epicrecord/',
                type: "POST",
                data: {
                    epicmedical_status: status,
                    user_id:dashboardApp.user_id,
                    vaccine_type: this.vaccine_type,
                    epicrejectcomment:epicrejectcomment,

                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    $('rejecttextepicrecord').val('')
                    $('#view-model').modal('hide')
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
                    $('#view-model').modal('hide')
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
                url: `/vaccine/dashboard/${dashboardApp.vaccination_table_id}/`,
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
        addUploadButtonErrorMessage: function (errorMessage) {
            $('#errormessages').removeClass('d-none');
            $('#errormessages').html(errorMessage);
            errormessageshow = setTimeout(function(){ 
                $('#errormessages').addClass('d-none') 
            }, 5000);
        },
        validate: function(){
            var empty = false
            const all_input_file_elements = $('#view-model').find('input[type="file"]')
            for (let i = 0; i < all_input_file_elements.length; i++) {
                if($(all_input_file_elements[i]).val()!==''){
                    empty = true
                }
            }
            if(!empty){
                return false
            }
            return true
        }
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

    $('.countbox').click(function () {
        let is_vaccinated = $(this).data('archive')
        if (is_vaccinated !== dashboardApp.is_vaccinated) {
            $('.countbox').removeClass('border-active')
            $(this).addClass('border-active')
            dashboardApp.is_vaccinated = is_vaccinated
            dashboardApp.page = 1
            dashboardApp.getData()
        }
    })

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
    
    $(document).on('change', '.fileclass', function(event) {
        if (event.target.files[0] !== undefined) {
            const file_name = event.target.files[0].name.split('.')
            const file_size = event.target.files[0].size
            var file_ext = file_name[file_name.length - 1];
            var is_wrong_file = false;
            if (file_ext != 'pdf' &&
                file_ext != 'jpg' &&
                file_ext != 'png') {
                dashboardApp.addUploadButtonErrorMessage('File type not supported. Please upload pdf,jpg,png files')
                is_wrong_file = true;
            }
            if (file_size > (3 * 1024 * 1024)) {
                dashboardApp.addUploadButtonErrorMessage('File size not supported. Maximum file size should be 3 MB')
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
    $(document).on("submit", "#pending-employeevaccination-file-form", function(e){
        e.preventDefault();
        $('#hiddenuserid').val(dashboardApp.user_id)
        dashboardApp.filenumber=1
        var formData = new FormData(this);
        formData.append('csrfmiddlewaretoken', dashboardApp.csrfmiddlewaretoken);
        formData.append('vaccine_type', dashboardApp.vaccine_type);
        var validate = dashboardApp.validate()
        if(validate){
            $('.fa-spinner').removeClass('d-none')
            $.ajax({
                url:'/vaccine/api/v1/adminupload/',
                type: 'POST',
                data: formData,
                success: function (res) {
                    $('.fa-spinner').addClass('d-none')
                    $('#view-model').modal('hide')
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
                error:function(){
                    $('.fa-spinner').addClass('d-none')
                },
                cache: false,
                contentType: false,
                processData: false
            });
        }
    });
})