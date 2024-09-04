// https://stackoverflow.com/a/41992719
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
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

    // STEP FORM
    const dashboardApp = {
        data:[],
        operation_type: null,
        favourite_app: null,
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        site_admin_app_type: 'all',
        search_key: '',
        apps_type:'all',
        app_id: null,
        apps_order: [],
        type_of_submit: null,
        app_name:null,
        init: function () {
            
            $('body').on('click', '.add_app_button', function () {
                dashboardApp.type_of_submit = 'add'
                $('.update_button').addClass('d-none')
                $('.add_button').removeClass('d-none')
                $('.app_delete').addClass('d-none')
                $('#app_image_preview').addClass('d-none')
                $('#app_image_preview').attr("src","");
            })

            $('body').on('click', '.app_delete',function () {
                $('#delete_app_text').html(`Do you want to delete '${dashboardApp.app_name}' ?`)
            })

            $('body').on('click', '#delete-app-model .btn-danger',function () {
                dashboardApp.deleteApp()
            })

            $('body').on('click', 'span.favourites', function () {
                dashboardApp.favourite_app = $(this).data('id')
                if($(this).find($("svg")).attr("data-prefix")=="fas"){
                    dashboardApp.operation_type = 'Remove from favourites'
                    $(this).find($("svg")).attr('title','Add to favorites')
                    $(this).find($("svg")).attr('data-prefix','far')
                }
                else{
                    dashboardApp.operation_type = 'Add to favourites'
                    $(this).find($("svg")).attr('title','Remove from favorites')
                    $(this).find($("svg")).attr('data-prefix','fas')
                }
                dashboardApp.FavouriteappPost()
            })

            $('body').on('click', 'a.specific_page', function () {
                const app_name = $(this).data('app')
                const app_specific_page = $(this).data('name')
                dashboardApp.userTrackerPOST(app_name,app_specific_page)
            })

            $( "#sortable" ).sortable({
                start: function(event, ui) {
                    ui.item.startPos = ui.item.index()
                },
                stop: function(event, ui) {
                    ui.item.stopPos = ui.item.index()
                    if(ui.item.startPos!==ui.item.stopPos){
                        const moved_app_one = dashboardApp.apps_order[ui.item.startPos]
                        dashboardApp.apps_order.splice(ui.item.startPos,1);
                        dashboardApp.apps_order.splice(ui.item.stopPos, 0, moved_app_one);
                        dashboardApp.addAppsSortingOrder()
                    }
                }
            })

            $('body').on('click', 'span.appedit', function () {
                dashboardApp.app_id = $(this).data('id')
                dashboardApp.type_of_submit = 'update'
                dashboardApp.app_name = $(this).data('appname')
                $('.update_button').removeClass('d-none')
                $('.add_button').addClass('d-none')
                $('.app_delete').removeClass('d-none')
                $('#id_app_name').val($(this).data('appname'))
                $('#id_point_of_contact').val($(this).data('point_of_contact'))
                $('#id_info_text').val($(this).data('info_text'))
                $('#id_app_domain').val($(this).data('app_domain'))
                $('#id_app_type').val($(this).data('app_type'))
                $('#id_service_type').val($(this).data('service_type'))
                $('#id_required_groups').val($(this).data('app_groups'))
                let app_logo = $(this).data('app_logo')
                if(app_logo){
                    $('#app_image_preview').removeClass('d-none')
                    $('#app_image_preview').attr("src",app_logo);
                }
                let is_app_hidden = $(this).data('app_hide')
                if(is_app_hidden){
                    $('#id_hide_app').prop('checked',true)
                }
                else{
                    $('#id_hide_app').prop('checked',false)
                }
                const button_data = ($(this).data('button_data')).split(',')
                let id = 1
                for(let i=0;i<button_data.length;i=i+3){
                    $('#id_button_id_'+id).val(button_data[i+0])
                    $('#id_button_url_'+id).val(button_data[i+1])
                    $('#id_button_name_'+id).val(button_data[i+2])
                    id += 1
                }


            })

            $('#edit-model').on('hidden.bs.modal', function (e) {
                $(this)
                  .find("input,textarea,select")
                     .val('')
                     .end()
            })

            $('select[name="apps_type"]').change(function() {
                $('.all-cards-content-division').removeClass('d-none')
                $('.site-admin-division').addClass('d-none')
                dashboardApp.apps_type = $("#id_apps_type").val()
                dashboardApp.getApps()
            })

            $('body').on('click', 'a.loganalytics',function () {
                dashboardApp.setDate(start, end)
            })

            $('body').on('click', '.getapps_back_button',function () {
                dashboardApp.getApps()
            })

            dashboardApp.getApps()
            
            let start = moment()
            let end = moment()

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Clear': [moment(), moment()],
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
            }, this.setDate);

        },
        validate: function(){
            var pattern = /^(https)?:\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,4}/
            $('#id_app_name').removeClass('error')
            $('#id_app_type').removeClass('error')
            $('#id_service_type').removeClass('error')
            if($('#id_app_name').val()==''){
                $('#id_app_name').addClass('error')
                return false
            }
            if($('#id_app_type').val()==''){
                $('#id_app_type').addClass('error')
                return false
            }
            if($('#id_service_type').val()==''){
                $('#id_service_type').addClass('error')
                return false
            }
            for(let i=1;i<=3;i++){
                var url = $('#id_button_url_'+i).val()
                if (url!=='' && $('#id_app_type').val()!=="administration")
                    if(pattern.test(url)==false){
                        $('#id_button_url_'+i).addClass('error')
                        error.push(1)
                    }
                    else{
                        $('#id_button_url_'+i).removeClass('error')
                    }
                else{
                    $('#id_button_url_'+i).removeClass('error')
                }
            }
            return true
        },
        renderApps:function (){
            $('.header_filters').addClass('d-flex')
            $('.header_filters').removeClass('d-none')
            $('.site-admin-division').addClass('d-none')
            $('.all-cards-content-division').removeClass('d-none')
            if (this.data.length > 0) {
                let html = ''
                let apps_order = []
                this.data.forEach((element, index) => {
                    let buttons = ''
                    let buttons_data = []
                    let type_dashboard_button = ''
                    let type_add_button = ''
                    let type_edit_button = ''
                    let type_other_button = ''
                    let mainButton = ''
                    let buttonType = 0
                    apps_order.push(element.app_name)
                    for(let i=0;i<element.buttons.length;i++){
                        if(element.app_type=="administration"){
                            if((element.buttons[i]['button_text'].toLowerCase()).indexOf('dashboard') != -1){
                                if ((mainButton == '') || (buttonType < 5)){
                                    mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 5
                                }
                                type_dashboard_button +=`<div class="col-12 text-center">
                                                        <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-address-card" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                    </div>`
                            }
                            else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('edit') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('manage') != -1)){
                                if ((mainButton == '') || (buttonType < 4)){    
                                    mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 4
                                }
                                type_edit_button +=`<div class="col-12 text-center">
                                                        <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-edit" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                    </div>`
                            }
                            else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('add') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('create') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('upload') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('form') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('file') != -1)){
                                if ((mainButton == '') || (buttonType < 3)){    
                                    mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 3
                                }
                                type_add_button +=`<div class="col-12 text-center">
                                                        <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-plus" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                    </div>`
                            }
                            else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('sign') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('login') != -1)){
                                if ((mainButton == '') || (buttonType < 2)){    
                                    mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 2
                                }
                                type_other_button +=`<div class="col-12 text-center">
                                                        <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-desktop" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                    </div>`
                            }
                            else{
                                if ((mainButton == '') || (buttonType < 1)){    
                                    mainButton = `<a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 1
                                }
                                type_other_button +=`<div class="col-12 text-center">
                                                    <a href="#" data-toggle="modal" data-target="#${element.buttons[i]['button_href']}" class="${element.buttons[i]['button_href']}"><i class="fa fa-tasks" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                </div>`
                            }
                        }
                        else{

                            if((element.buttons[i]['button_text'].toLowerCase()).indexOf('dashboard') != -1){
                                if ((mainButton == '') || (buttonType < 5)){
                                    mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 5
                                }
                                type_dashboard_button +=`<div class="col-12 text-center">
                                                        <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-address-card" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                            }
                            else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('edit') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('manage') != -1)){
                                if ((mainButton == '') || (buttonType < 4)){    
                                    mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 4
                                }
                                type_edit_button +=`<div class="col-12 text-center">
                                                        <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-edit" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                            }
                            else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('add') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('create') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('upload') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('form') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('file') != -1)){
                                if ((mainButton == '') || (buttonType < 3)){    
                                    mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 3
                                }
                                type_add_button +=`<div class="col-12 text-center">
                                                        <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-plus" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                            }
                            else if(((element.buttons[i]['button_text'].toLowerCase()).indexOf('sign') != -1)||((element.buttons[i]['button_text'].toLowerCase()).indexOf('login') != -1)){
                                if ((mainButton == '') || (buttonType < 2)){    
                                    mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 2
                                }
                                type_other_button +=`<div class="col-12 text-center">
                                                        <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-desktop" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                        </div>`
                            }
                            else{
                                if ((mainButton == '') || (buttonType < 1)){    
                                    mainButton = `<a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank" title="${element.buttons[i]['button_text']}">`
                                    buttonType = 1
                                }
                                type_other_button +=`<div class="col-12 text-center">
                                                    <a href="${element.buttons[i]['button_href']}" data-app="${element.app_name}" data-name="${element.buttons[i]['button_text']}" target="_blank"><i class="fa fa-tasks" aria-hidden="true" title="${element.buttons[i]['button_text']}" style="height:22px;width:22px;"></i></a>
                                                    </div>`
                            }
                            
                        }
                        buttons_data.push(element.buttons[i]['id'],element.buttons[i]['button_href'],element.buttons[i]['button_text'])
                    }
                    buttons = type_add_button + type_edit_button + type_other_button + type_dashboard_button
                    let edit_option = `<div class="col-1">
                                        <span class="appedit" data-id="${element.id}" data-appname="${element.app_name}" data-point_of_contact="${element.point_of_contact}" data-info_text="${element.info_text}" data-button_data="${buttons_data}" data-app_domain="${element.domain_name}" data-app_type="${element.app_type}" data-app_hide="${element.is_hidden}" data-service_type="${element.subscription}" data-app_logo=${element.app_logo} data-app_groups="${element.groups}"><i style="cursor:pointer;width:14px;height;14px;" data-toggle="modal" data-target="#edit-model"  title="Edit App" class="fas fa-edit text-primary"></i></span>
                                    </div>`
                    let top_icons = `<div class="col">
                                    </div>
                                    ${edit_option}
                                    <div class="col-1">
                                        <span class="favourites" data-id="${element.id}"><i style="cursor:pointer;width:14px;height;14px;" title="Add to favorites" class="far fa-star text-primary"></i></span>
                                    </div>
                                    <div class="col-1 hover-div"style="text-align:left;">
                                        <i style="cursor:pointer;width:12px;height;12px;" class="fa fa-info-circle text-primary" aria-hidden="true" title="${element.info_text}"></i>
                                    </div>`
                    let count = `<div class="row d-flex justify-content-start p-1">
                        <div class="col-4">
                        </div>
                        <div class="col-4">
                        </div>
                        <div class="col-4">
                            <div class="row d-flex justify-content-start p-0">
                                ${buttons}
                            </div>
                        </div>
                    </div>`
                    let new_notification = ''

                    if (element.app_name === "App management" || element.app_name === "Organization management") {
                        // Skip "App management" and "Organization management" apps
                    } else {
                        html += 
                            `<div class="col-12 col-md-3 pt-3 ${element.app_type}" data-name="${element.app_name}">
                                <div class='newsCard news-Slide-up card-box'>
                                    <div class="d-flex justify-content-start d-flex justify-content-start col-12 pr-0">
                                        ${top_icons}
                                    </div>
                                    <div class="d-flex justify-content-start pb-0">
                                        <div class="col-4 text-center p-1">
                                            <div>
                                                ${mainButton}<img src="${element.app_logo}" class="card-img logo-main" alt="..." style="width:4rem;"></a>
                                            </div>
                                            <p class="card-title pt-1" style="font-size:11px;padding:0">${((element.app_name).toUpperCase())}</p>
                                        </div>
                                        <div class="col-8 pt-4">
                                            <div class="row justify-content-center">
                                                <div class="col-12">
                                                    ${count}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-start p-0">
                                        ${new_notification}
                                    </div>
                                    <div class="d-flex justify-content-start p-0 pt-1" style="position:absolute;bottom:0;right:0;left:0;">
                                        <div class="pl-2 p-0">
                                            <p class='newsCaption-title mb-0' style="font-size:11px;color:#737373">App Owner: ${(element.point_of_contact)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    }
                })
                this.apps_order = apps_order
                $('.render_cards').html(html)
            }
            else{
                $('.render_cards').html('')
            }
            dashboardApp.FavouriteappGet()
        },
        renderappfavourites: function () {
            if (this.data.length > 0) {
                this.data.forEach((element, index) => {
                    $(`[data-id=${element.app_id}] svg`).attr('data-prefix','fas')
                    $(`[data-id=${element.app_id}] svg`).attr('title','Remove from favorites')
                })
            }
        },
        renderTrackerList(tracker_list, total_visits){
            $('.header_filters').removeClass('d-flex')
            $('.header_filters').addClass('d-none')
            $('.site-admin-division').removeClass('d-none')
            $('.all-cards-content-division').addClass('d-none')
            $('#status_all').html(total_visits)
            if (tracker_list.length > 0) {
                let html =''
                tracker_list.forEach((element, index) => {
                    html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                        <td class="text-left">${element.app_name}</td>
                        <td class="text-left">${element.app_specific_page_name}</td>
                        <td class="text-left">${element.username}</td>
                        <td class="text-left">${element.created_datetime}</td>
                    </tr>`
                })
                $('#storebookingData').html(html);
                let pageLength = this.pagination.totalPages

                html = ''
                let separatorAdded = false
                for (let i = 0; i < pageLength; i++) {
                    if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                        html += `<li class="pagination1" data-page="`+(i + 1)+`">` + (i + 1) + `</li>`;
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
        addAppsSortingOrder(){
            $.ajax({
                type: "POST",
                url: "/api/v1/update/apps/ordering/",
                data: {
                    'apps_order[]':this.apps_order,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                },
                error: (err) => {
                }
            })
        },
        userTrackerPOST(app_name,app_specific_page){
            $.ajax({
                type: "POST",
                url: "/api/v1/tracker/",
                data: {
                    app_name: app_name,
                    app_specific_page: app_specific_page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                },
                error: (err) => {
                }
            })
        },
        userTrackerGetList(){
            $('#storebookingData').html(`<tr><td colspan="9">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </td></tr>`);
            $.ajax({
                type: "POST",
                url: "/api/v1/tracker/getlist/",
                data: {

                    app_name: this.site_admin_app_type,
                    search_key: this.search_key,
                    date_start: this.start_date,
                    date_end: this.end_date,
                    limit: this.limit,
                    page:this.page,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    const tracker_list = res.tracker_list
                    this.pagination = res.pagination
                    dashboardApp.renderTrackerList(tracker_list, res.total_visits)
                    dashboardApp.renderSelectBox('type_of_apps_site_admin',res.apps_list,'All')
                },
                error: (err) => {
                    const tracker_list = []
                    dashboardApp.renderTrackerList(tracker_list, res.total_visits)
                }
            })
        },
        FavouriteappPost() {
            $.ajax({
                type: "POST",
                url: "/api/v1/favourites/",
                data: {
                    favourite_app: this.favourite_app,
                    operation_type: this.operation_type,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    this.data = res.favourite_list
                    this.renderappfavourites()
                },
                error: (err) => {
                    this.data = []
                    this.country_count = res.country_count
                    this.renderappfavourites()
                }
            })
        },
        FavouriteappGet() {
            $.ajax({
                type: "GET",
                url: "/api/v1/favourites/",
                success: (res) => {
                    this.data = res.favourite_list
                    this.renderappfavourites()
                },
                error: (err) => {
                    this.data = []
                    this.renderappfavourites()
                }
            })
        },
        getApps(){
            $.ajax({
                type: "POST",
                url: "/api/v1/apps/list/",
                data: {
                    apps_type: this.apps_type,
                    search_key: this.search_key,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken,
                },
                success: (res) => {
                    if(res.status==1){
                        this.data = res.apps_list
                    }
                    else{
                        this.data = []
                    }
                    this.renderApps()
                },
                error: (err) => {
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
            dashboardApp.userTrackerGetList()
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
        renderSelectBox: function(nameOfSelect, choices, firstItem) {
            $(`select[name=${nameOfSelect}]`).empty();
            var allOptions = '';
            choices = [['all',firstItem],].concat(choices);
            choices.forEach(function(value,index,array){
                allOptions += `<option value="${value[0]}">${value[1]}<options>`;
            });
            $(`select[name=${nameOfSelect}]`).html(allOptions);
            $('select[name="type_of_apps_site_admin"]').val(this.site_admin_app_type)
        },
        deleteApp(){
            $('#delete-app-model .fa-spinner').removeClass('d-none')
            $.ajax({
                type: "POST",
                url:'/api/v1/delete/app/',
                data:{
                    id: dashboardApp.app_id,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    $('#delete-app-model .fa-spinner').addClass('d-none')
                    $('#delete-app-model').modal('hide')
                    $('#edit-model').modal('hide')
                    var alert = $('#server-alert')
                    if(res.status==1){
                        alert.addClass('alert-success').removeClass('alert-danger')
                        alert.removeClass('d-none')
                        alert.html('App deleted successfully')
                        dashboardApp.getApps()
                    }
                    else{
                        alert.addClass('alert-danger').removeClass('alert-success')
                        alert.removeClass('d-none')
                        alert.html('Something happened. Try again later')
                    }
                    setTimeout(function () {
                        alert.addClass('d-none')
                    }, 3000)
                    

                },
                error: (err) => {
                    console.log(err);
                    $('.fa-spinner').addClass('d-none')
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

    $("select[name='type_of_apps_site_admin']").change(function () {
        dashboardApp.site_admin_app_type = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userTrackerGetList()
    })

    $('#id_search_site_admin').keyup(function () {
        dashboardApp.search_key = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userTrackerGetList()
    })

    $('#limit').change(function () {
        dashboardApp.limit = $(this).val()
        dashboardApp.page = 1
        dashboardApp.userTrackerGetList()
    })

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        dashboardApp.page = $(this).data("page");
        dashboardApp.userTrackerGetList()
    });

    $("input[name='apps_search']").keyup(function () {
        dashboardApp.search_key = $(this).val()
        dashboardApp.getApps()
    })

    $('#id_app_logo').change(function(event){
        if (event.target.files[0] !== undefined) {
            const file_name = event.target.files[0].name.split('.')
            const file_size = event.target.files[0].size
            var file_ext = file_name[file_name.length - 1];
            var is_wrong_file = false;
            if (file_ext!='png') {
                let error = $('#error-display-near-save')
                error.html('File type not supported. Please upload PNG Files')
                error.removeClass('alert-success').addClass('alert-danger')
                error.removeClass('d-none')
                setTimeout(function () {
                    error.addClass('d-none')
                }, 3000)
                is_wrong_file = true;
            }
            if (file_size >= (500 * 1024)) {
                let error = $('#error-display-near-save')
                error.html('File size not supported. Allowed maximum size is 500KB')
                error.removeClass('alert-success').addClass('alert-danger')
                error.removeClass('d-none')
                setTimeout(function () {
                    error.addClass('d-none')
                }, 3000)
                is_wrong_file = true;
            }
            if (is_wrong_file) {
                $(this).val('')
                $('#app_image_preview').addClass('d-none')
                $('#app_image_preview').attr("src","")
            }
            else {
                const [file] = id_app_logo.files
                if (file) {
                    $('#app_image_preview').removeClass('d-none')
                    app_image_preview.src = URL.createObjectURL(file)
                }
            }
        }
    })

    $('body').on('submit','#id_app_form',function(e){
        e.preventDefault()
        var formData = new FormData(this);
        var checkbox = $('input[id=id_hide_app]:checked')
        if(checkbox.length>0){
            checkbox = true
        }
        else{
            checkbox = false
        }
        formData.append('app_hide',checkbox)
        formData.append('app_id',dashboardApp.app_id)
        formData.append('type_of_submit',dashboardApp.type_of_submit)
        formData.append('csrfmiddlewaretoken',dashboardApp.csrfmiddlewaretoken)
        var validate = dashboardApp.validate()
        if(validate){
            $('.fa-spinner').removeClass('d-none')
            $.ajax({
                url:'/api/v1/app/edit/post/',
                type: 'POST',
                data: formData,
                success: function (res) {
                    $('.fa-spinner').addClass('d-none')
                    let error = $('#error-display-near-save')
                    if(res.status==1){
                        error.html('Updated Successfully')
                        error.removeClass('alert-danger').addClass('alert-success')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                            $('#edit-model').modal('hide')
                        }, 1000)
                    }else if(res.status==2){
                        error.html('App name already exists')
                        error.removeClass('alert-success').addClass('alert-danger')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                        }, 3000)
                    }
                    else if(res.status==3){
                        error.html('Group name '+res.group+' already exists')
                        error.removeClass('alert-success').addClass('alert-danger')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                        }, 3000)
                    }
                    else{
                        error.html('Something happened try again later')
                        error.removeClass('alert-success').addClass('alert-danger')
                        error.removeClass('d-none')
                        setTimeout(function () {
                            error.addClass('d-none')
                        }, 3000)
                    }
                    dashboardApp.getApps()

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