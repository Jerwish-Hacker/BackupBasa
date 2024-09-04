const CSV_TABLE_SORT = 'csv_table_sort'




$(document).ready(function () {
    const dashboardApp = {
        data: [],
        site_name: 'all',
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
            kern: 0,
            fresno: 0
        },
        archive_id: null,
        comment_id:null,
        url: '',
        resolvingcomment:'',
        type:'',
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
                dashboardApp.url = $(this).data('url')
                dashboardApp.renderModal()
            })

            $('body').on('click', '.archive', function () {

                //
                  dashboardApp.archive_id = $(this).data('id')
                  $('#resolvingtext').val('')
            })

            $('body').on('click', '.delete', function () {
                  dashboardApp.archive_id = $(this).data('id')
                  dashboardApp.type='grievancedelete'
                  $('.delete-id-text').html("ID : "+dashboardApp.archive_id)
            })

            $('body').on('click', 'span .commentdelete', function () {
                dashboardApp.comment_id = $(this).data('id')
                dashboardApp.type='commentdelete'
                $('.delete-id-text').html('')
            })

            $('body').on('click', 'span .resolutionedit', function () {
                dashboardApp.archive_id = $(this).data('id')
                $('#resolvingtext').val($('#hidden_resolution_statement').val())
            })
            
            $('#delete-model .btn.btn-danger').click(function () {
                $(this).html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`)
                dashboardApp.deleterecord()
                $('#delete-model').modal('hide')
                
            })

            // Modal button listener
            $('#archive-model .btn.btn-primary').click(function () {
                dashboardApp.resolvingcomment= $('#resolvingtext').val()
                $(this).attr('disabled', true)
                $(this).html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`)
                dashboardApp.archiveAppointment()
                $('#view-model').modal('hide')
                
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

            // Export button
            $('#export-button').click(function () {
                dashboardApp.downloadExcel()
            })

            $('body').on('click', '#addcommentbutton', function () {
                const comment = $("#extracomments").val()
                const id = $(this).data('id')
                if(comment!==''){
                    $(this).html(`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`)
                    dashboardApp.AddExtracomment(comment,id)
                }
            })
        },
        downloadExcel() {
            $.ajax({
                type: "POST",
                url: "/grievance/api/v1/grievancelist/",
                data: {
                    site_name: this.site_name,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    export: true,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if (res.status === "1") {
                        const data = res.data
                        for(var i = 0; i < data.length; i++){
                            delete data[i].view_url
                            delete data[i].modified_datetime
                        }
                        var ws = XLSX.utils.json_to_sheet(data);
                        var wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "People");
                        XLSX.writeFile(wb, 'Grievance Report.xlsx');
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
                    var resolvedby = ''
                    if(element.resolved_by!==null){
                        resolvedby = element.resolved_by
                    }
                    var createdby = ''
                    if(element.created_by!==null){
                        createdby = element.created_by
                    }
                    var grievancereporttype =''
                    if(element.grievance_report_type !==null){
                        grievancereporttype = element.grievance_report_type
                    }
                    var servicetype =''
                    if(element.service_type !==null){
                        servicetype = element.service_type
                    }
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td>${element.id}</td>
                        <td>${element.patient_last_name !== null?element.patient_last_name:''}</td>
                        <td>${element.patient_first_name !== null?element.patient_first_name:''}</td>
                        <td>${grievancereporttype}</td>
                        <td>${servicetype}</td>
                        <td class="text-left">${element.site}</td>
                        <td>${element.health_plan}</td>
                        <td>${element.event_type}</td>
                        <td>${createdby}</td>
                        <td>${resolvedby}</td>
                        <td>${element.is_resolved ? '<span class="badge badge-success">Resolved</span>' : '<span class="badge badge-danger">Pending</span>'}</td>
                        <td>${element.created_datetime}</td>
                        <td class="hover-icons"><a class="view-data hover-icons" data-toggle="modal" data-target="#view-model" data-url="${element.view_url}"><i class="fa fa-eye text-primary" title="View" style="width: 16px;height: 16px"></i></a>
                        ${element.is_resolved ? `<span class="delete hover-icons" data-id="${element.id}" data-toggle="modal" data-target="#delete-model" ><a><i class="fa fa-trash text-danger" title="Delete" style="width: 16px;height: 16px" ></i></a></span>`: `
                        <span class="archive hover-icons" data-id="${element.id}" data-toggle="modal" data-target="#archive-model" >
                        <a>
                        <i class="fa fa-archive text-primary ml-1" title="Resolve" style="width: 16px;height: 16px" ></i>
                        </a>
                        </span><span class="delete hover-icons" data-id="${element.id}" data-toggle="modal" data-target="#delete-model" ><a><i class="fa fa-trash text-danger" title="Delete" style="width: 16px;height: 16px" ></i></a></span>`}
                        <a href="/grievance/grievance/update-${element.id}/" target="_blank" ><i class="fa fa-edit text-info" title="Edit" style="width: 16px;height: 16px" ></i></a>
                        </td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="` + (i + 1) + `" data-county_name="` + '' + `" 
                            data-date_start="`+ 'date_start' + `" data-date_end="` + date_end + `"
                            data-searchKey="`+ 'searchKey' + `" data-searchHealthPlan="`+ 'searchHealthPlan' + `"
                            data-searchEventType="`+ 'searchEventType' + `" data-searchProvider="`+ 'searchProvider' + `">` + (i + 1) + `</li>`;
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
                url: "/grievance/api/v1/grievancelist/",
                data: {
                    site_name: this.site_name,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    searchKey: this.searchKey,
                    archived: this.archived,
                    table_sort: JSON.stringify(this.table_sort),
                    page: this.page,
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
        archiveAppointment() {
            $.ajax({
                url: `/grievance/api/v1/grievancelist/archive/${this.archive_id}/`,
                type: "POST",
                data: {
                    resolvingcomment: this.resolvingcomment,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    $('#archive-model').modal('hide')
                    let model = null
                    $('#archive-model .btn.btn-primary').html('Resolve')
                    $('#archive-model .btn.btn-primary').attr('disabled', false)
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
                    $('#archive-model .btn.btn-primary').html('Resolve')
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
        renderModal() {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: dashboardApp.url,
                success: (res) => {
                    $('#modal-view-body').html(res)
                },
                error: () => {
                    $('#modal-view-body').html('An error occurred while fetching data, Try again')
                }
            })
        },
        deleterecord: function(){
            $.ajax({
                url: `/grievance/api/v1/grievancelist/delete/`,
                type: "POST",
                data: {
                    type:dashboardApp.type,
                    comment_id:dashboardApp.comment_id,
                    archive_id: this.archive_id,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    if(dashboardApp.type=='grievancedelete'){
                        $('#delete-model').modal('hide')
                        let model = null
                        $('#delete-model .btn.btn-danger').html('Delete')
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
                    }
                    else if(dashboardApp.type=='commentdelete'){
                        dashboardApp.renderModal()
                        $('#delete-model .btn.btn-danger').html('Delete')
                    }
                },
                error: function () {
                    $('#delete-model .btn.btn-danger').html('Delete')
                    $('#delete-model').modal('hide')
                    $('#error-alert').removeClass('d-none')
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none')
                    }, 3000)
                }
            })
        },
        AddExtracomment: function(comment,id){
            $.ajax({
                url: `/grievance/api/v1/grievancelist/addextracomment/`,
                type: "POST",
                data: {
                    archive_id: id,
                    comment: comment,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
                },
                success: function (res) {
                    dashboardApp.renderModal()
                    $('#addcommentbutton').html('Add')
                },
                error: function () {
                    $('#view-model').modal('hide')
                }
            })
        },
        renderSelectBox: function(nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['',firstItem],].concat(choices);
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
    document.dashboardApp = dashboardApp;
    var all = JSON.parse($('#available_locations').val());
    dashboardApp.renderSelectBox("site",all, 'Select Site')
    dashboardApp.init()

    $('#searchKey').keyup(function () {
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

    $('#site-selector').change(function () {
        if($("#site-selector").val()==''){
            dashboardApp.site_name = 'all'
            dashboardApp.page = 1
            dashboardApp.getData()
        }
        else{
            dashboardApp.site_name = $(this).val()
            dashboardApp.page = 1
            dashboardApp.getData()
        }
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