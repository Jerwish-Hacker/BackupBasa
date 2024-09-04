const CSV_TABLE_SORT = 'csv_table_sort'


const validation = {
    email: /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,9})/,
    payroll_name: /^[A-Z]/,
    reports_to_name: /^[A-Z]/,
    email_add: /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,9})/,
    payroll_name_add: /^[A-Z]/,
    reports_to_name_add: /^[A-Z]/,
    position_id:/^[a-zA-Z0-9]+$/,
    position_id_add:/^[a-zA-Z0-9]+$/,
}

$(document).ready(function () {
    const dashboardApp = {
        data: [],
        searchKey: '',
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        user_id: null,
        modal:null,
        type:null,
        init() {

            this.getData()

            // Archive listener

            let localStorageDateSort = localStorage.getItem(CSV_TABLE_SORT)
            if (localStorageDateSort) {
                this.table_sort = JSON.parse(localStorageDateSort)
            }

            let td_keys = $('a.sort-table')

            for (let i = 0; i < td_keys.length; i++) {
                this.changeSortArrow($(td_keys[i]).data('td'))
            }

            $("#add-button").click(function () {
               dashboardApp.modal = $('#add-model')
               dashboardApp.type = 'add'
               $('input[name="date_of_birth"]').val('')
               $('input[name="hire_date"]').val('')
               const all_input_elements = $(dashboardApp.modal).find('input')
               for (let i = 0; i < all_input_elements.length; i++) {
                   $(all_input_elements[i]).removeClass('is-invalid')
                   $(all_input_elements[i]).val('')
               }
            })

            $('body').on('click', '.modal-footer .btn-danger', function () {
                dashboardApp.deleteEmployee()
            })
            $('body').on('click', '#employee-save', function () {
                if(dashboardApp.type=='add'){
                    const original_positionid = ''
                    const original_emailid = ''
                    const date_of_birth = $('input[name=date_of_birth_add]').val()
                    const hire_date = $('input[name=hire_date_add]').val()
                    const latest_positionid = $('input[name=position_id_add]').val()
                    const latest_emailid = $('input[name=email_add]').val()
                    const reports_to_name = $('input[name=reports_to_name_add]').val()
                    const payroll_name = $('input[name=payroll_name_add]').val()
                    const position_status = $('input[name=position_status_add]').val()
                    const worker_category_description = $('input[name=worker_category_description_add]').val()
                    const job_title_description = $('input[name=job_title_description_add]').val()
                    const region = $('input[name=region_add]').val()
                    const eeo_establishment = $('input[name=eeo_establishment_add]').val()
                    const job_function_description = $('input[name=job_function_description_add]').val()
                    const home_department_description = $('input[name=home_department_description_add]').val()
                    const union_code = $('input[name=union_code_add]').val()
                    var validation = dashboardApp.validate(dashboardApp.modal)
                    if(validation){
                       dashboardApp.addEmployee(original_positionid,original_emailid,latest_positionid,latest_emailid,reports_to_name,payroll_name,date_of_birth,position_status,worker_category_description,job_title_description,hire_date,region,eeo_establishment,job_function_description,home_department_description,union_code)
                    }
                }
                else{
                    const date_of_birth = $('input[name=date_of_birth]').val()
                    const hire_date = $('input[name=hire_date]').val()
                    const original_positionid = $("#positionid").val()
                    const original_emailid = $("#emailid").val()
                    const latest_positionid = $('input[name=position_id]').val()
                    const latest_emailid = $('input[name=email]').val()
                    const reports_to_name = $('input[name=reports_to_name]').val()
                    const payroll_name = $('input[name=payroll_name]').val()
                    const position_status = $('input[name=position_status]').val()
                    const worker_category_description = $('input[name=worker_category_description]').val()
                    const job_title_description = $('input[name=job_title_description]').val()
                    const region = $('input[name=region]').val()
                    const eeo_establishment = $('input[name=eeo_establishment]').val()
                    const job_function_description = $('input[name=job_function_description]').val()
                    const home_department_description = $('input[name=home_department_description]').val()
                    const union_code = $('input[name=union_code]').val()
                    var validation = dashboardApp.validate(dashboardApp.modal)
                    if(validation){
                       dashboardApp.addEmployee(original_positionid,original_emailid,latest_positionid,latest_emailid,reports_to_name,payroll_name,date_of_birth,position_status,worker_category_description,job_title_description,hire_date,region,eeo_establishment,job_function_description,home_department_description,union_code)
                    }
                }
            })

            $('body').on('click', 'a.viewtoggle', function () {
                dashboardApp.user_id = $(this).data('id')
                dashboardApp.modal = $('#view-model')
                dashboardApp.type = 'update'
                dashboardApp.renderModal()
            })

            $('body').on('click', 'a.deletetoggle', function () {
                dashboardApp.user_id = $(this).data('id')
                $('.deletemodel').html('Postion ID : '+$(this).data('positionid'))
            })

            $('body').on('click', '.add-to-covid-booster', function () {
                dashboardApp.user_id = $(this).data('id')
                $('.addtocovidbooster_bodytext').html('Postion ID : '+$(this).data('positionid'))
            })

            $('body').on('click', '#add-covid-booster-model .btn-success', function () {
                dashboardApp.addEmployeeToCovidBooster()
            })
        },
        renderTable() {
            if (this.data.length > 0) {
                let html = ''
                this.data.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.position_id}</td>
                        <td>${element.payroll_name}</td>
                        <td>${element.home_department_description}</td>
                        <td>${element.eeo_establishment}</td>
                        <td>${element.reports_to_name}</td>
                        <td><a class="viewtoggle hover-icons mx-2" data-toggle="modal" data-target="#view-model" data-id="${element.id}"><i class="fa fa-user-edit text-primary" title="Edit" style="width: 18px;height: 18px"></i></a><a class="deletetoggle hover-icons" data-toggle="modal" data-target="#delete-model" data-id="${element.id}" data-positionid="${element.position_id}"><i class="fa fa-user-times text-danger" title="Delete" style="width: 18px;height: 18px"></i></a><a class="hover-icons mx-2 add-to-covid-booster"  data-id="${element.id}" data-positionid="${element.position_id}" data-toggle="modal" data-target="#add-covid-booster-model"><i class="fas fa-user-plus text-success" title="Add employee to COVID Booster" style="width: 18px;height: 18px"></i></a></td>
                    </tr>`
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
                url: "/vaccine/api/v1/employee-crud/",
                data: {
                    searchKey: this.searchKey,
                    limit: this.limit,
                    page: this.page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    this.data = res.data
                    this.pagination = res.pagination
                    this.renderTable()
                },
                error: (err) => {
                    this.data = []
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
        addEmployee(original_positionid,original_emailid,latest_positionid,latest_emailid,reports_to_name,payroll_name,date_of_birth,position_status,worker_category_description,job_title_description,hire_date,region,eeo_establishment,job_function_description,home_department_description,union_code) {
            $.ajax({
                url: '/vaccine/employee-crud/submit/',
                type: "POST",
                data: {
                    type:dashboardApp.type,
                    user_id:dashboardApp.user_id,
                    original_positionid:original_positionid,
                    original_emailid:original_emailid,
                    latest_positionid:latest_positionid,
                    latest_emailid:latest_emailid,
                    reports_to_name:reports_to_name,
                    payroll_name:payroll_name,
                    date_of_birth:date_of_birth,
                    position_status:position_status,
                    worker_category_description:worker_category_description,
                    job_title_description:job_title_description,
                    hire_date:hire_date,
                    region:region,
                    eeo_establishment:eeo_establishment,
                    job_function_description:job_function_description,
                    home_department_description:home_department_description,
                    union_code:union_code,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    if(dashboardApp.type=='update'){
                        if(res.status=='positionid'){
                            $('#errormessagessubmit').removeClass('d-none')
                            $('#errormessagessubmit').html('Position ID already exist')
                            setTimeout(function () {
                                $('#errormessagessubmit').addClass('d-none')
                            }, 3000)
                        }
                        else if(res.status=='email'){
                            $('#errormessagessubmit').removeClass('d-none')
                            $('#errormessagessubmit').html('Email already exist')
                            setTimeout(function () {
                                $('#errormessagessubmit').addClass('d-none')
                            }, 3000)
                        }
                        else if (res.status==1){
                            $('#view-model').modal('hide')
                            $('#success-alert').removeClass('d-none')
                            setTimeout(function () {
                                $('#success-alert').addClass('d-none')
                            }, 3000)
                            dashboardApp.getData()
                        }
                        else{
                            $('#view-model').modal('hide')
                            $('#error-alert').removeClass('d-none')
                            setTimeout(function () {
                                $('#error-alert').addClass('d-none')
                            }, 3000)
                        }
                    }
                    else if(dashboardApp.type=='add'){
                        if(res.status=='positionid'){
                            $('#errormessagesadd').removeClass('d-none')
                            $('#errormessagesadd').html('Position ID already exist')
                            setTimeout(function () {
                                $('#errormessagesadd').addClass('d-none')
                            }, 3000)
                        }
                        else if(res.status=='email'){
                            $('#errormessagesadd').removeClass('d-none')
                            $('#errormessagesadd').html('Email already exist')
                            setTimeout(function () {
                                $('#errormessagesadd').addClass('d-none')
                            }, 3000)
                        }
                        else if (res.status==1){
                            $('#add-model').modal('hide')
                            $('#success-alert').removeClass('d-none')
                            setTimeout(function () {
                                $('#success-alert').addClass('d-none')
                            }, 3000)
                            dashboardApp.getData()
                        }
                        else{
                            $('#add-model').modal('hide')
                            $('#error-alert').removeClass('d-none')
                            setTimeout(function () {
                                $('#error-alert').addClass('d-none')
                            }, 3000)
                        }
                    }
                },
                error: function () {
                }
            })
        },
        deleteEmployee: function(){
            $.ajax({
                url: '/vaccine/employee-crud/submit/',
                type: "POST",
                data: {
                    type:'delete',
                    user_id:dashboardApp.user_id,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: (res) => {
                    if(res.status==1){
                        $('#delete-model').modal('hide')
                        $('#success-alert').removeClass('d-none')
                           setTimeout(function () {
                               $('#success-alert').addClass('d-none')
                           }, 3000)
                        dashboardApp.getData()
                    }
                    else{
                        $('#delete-model').modal('hide')
                        $('#error-alert').removeClass('d-none')
                        setTimeout(function () {
                            $('#error-alert').addClass('d-none')
                        }, 3000)
                    }
                },
                error: () => {
                }
            })
        },
        renderModal() {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/vaccine/employee-crud/${dashboardApp.user_id}/`,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        validate: function (modal) {
            const all_input_elements = $(modal).find('input')
            for (let i = 0; i < all_input_elements.length; i++) {
                $(all_input_elements[i]).removeClass('is-invalid')
            }
            const error_elements = []
            for (let i = 0; i < all_input_elements.length; i++) {
                const input_name = $(all_input_elements[i]).attr('name')
                if($(all_input_elements[i]).val()==""){
                    error_elements.push(all_input_elements[i])
                }
                if (validation.hasOwnProperty(input_name)) {
                    if (!validation[input_name].test($(all_input_elements[i]).val())) {
                        error_elements.push(all_input_elements[i])
                    }
                }
            }
            if (error_elements.length > 0) {
                this.renderError(error_elements)
                return false
            }
            return true
        },
        renderError: function (elements) {
            elements.forEach(function (element) {
                $(element).addClass('is-invalid')
            })
        },
        addEmployeeToCovidBooster(){
            $.ajax({
                url: '/vaccine/employee-crud/add-to-covid-booster/',
                type: "POST",
                data: {
                    user_id:dashboardApp.user_id,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: (res) => {
                    if(res.status=='1'){
                        $('#add-covid-booster-model').modal('hide')
                        $('#success-alert').removeClass('d-none')
                        setTimeout(function () {
                               $('#success-alert').addClass('d-none')
                           }, 3000)
                        dashboardApp.getData()
                    }
                    else if(res.status=='2'){
                        $('#add-covid-booster-model-error-message').removeClass("d-none")
                        $('#add-covid-booster-model-error-message').html("Employee already exists in Covid Booster")
                        setTimeout(function () {
                            $('#add-covid-booster-model-error-message').addClass("d-none")
                        }, 3000)
                    }
                    else{
                        $('#add-covid-booster-model').modal('hide')
                        $('#error-alert').removeClass('d-none')
                        setTimeout(function () {
                            $('#error-alert').addClass('d-none')
                        }, 3000)
                    }
                },
                error: () => {
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