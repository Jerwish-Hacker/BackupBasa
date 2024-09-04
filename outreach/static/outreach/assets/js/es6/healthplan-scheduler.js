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
    const pStepForm = {
        location: null,
        start_date: moment().format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        id:null,
        type:null,
        data: {},
        number:1,
        init: function () {
          
          let start = moment()
          let end = moment().add(30, 'days')

          // DATE SET
          $('#reportrange').daterangepicker({
              startDate: start,
              endDate: end,
              ranges: {
                  'Clear': [moment(), moment().add(30, 'days')],
              },
          }, this.setDate);

          this.setDate(start, end)

          
          $('#addfile').click(function() {
              pStepForm.number = pStepForm.number+1
              $('.timeslot').append(
                  `<div class="d-flex justify-content-between" style="padding:0">
                      <div class="col-md-2" style="padding:0">
                        <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif">Time</label>
                        <input class="form-control timeinput" type="text" name="time${pStepForm.number}" placeholder="H:M"> 
                      </div>
                      <div class="col-md-2" style="padding:0">
                        <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif">AM/PM</label>
                        <select class="form-control" name="am/pm${pStepForm.number}" id="country-selector" >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                      </select>
                      </div>
                      <div class="col-md-6" style="padding:0">
                        <label style="font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">Maximum booking per slot</label>
                        <input class="form-control maxinput" name="max${pStepForm.number}" type="text"> 
                      </div>
                  </div>`
              );
          });
          
          $('body').on('click', 'button.addlocation', function () {
            const location =  $('input[name="newlocation"]').val()
            pStepForm.addLocation(location)
          })

          $('body').on('click', 'span.edittime', function () {
            pStepForm.id = $(this).data('id')
            let time = $(this).data('time')
            time = time.split(" ")
            $('input[name="time"]').val(time[0])
            $('input[name="max"]').val($(this).data('max'))
            $('input[name="am/pm"]').val(time[1])
            pStepForm.type='edittime'
          })

          $('body').on('click', 'span.addnewslot', function () {
            pStepForm.id = $(this).data('id')
            $('input[name="time"]').val('')
            $('input[name="max"]').val('')
            $('input[name="am/pm"]').val('')
            pStepForm.type='addnewslot'
          })

          $('body').on('click', 'button.delete', function () {
            pStepForm.UpdateSlot()
          })

          $('body').on('click', 'button.editsave', function () {
            $('input[name="time"]').removeClass('error')
            $('input[name="max"]').removeClass('error')
            $('input[name="am/pm"]').removeClass('error')
            if(! /^([1-9]|1[012])(:[0-5]\d)$/.test($('input[name="time"]').val()) || $('input[name="time"]').val()==''){
              pStepForm.addTimeEditError("Please check time entered correctly (Ex: 8:00,10:00)")
              $('input[name="time"]').addClass('error')
              return false
            }
            if(! /^[0-9]*$/.test($('input[name="max"]').val()) || $('input[name="max"]').val()==''){
              pStepForm.addTimeEditError("Integer type is only allowed")
              $('input[name="max"]').addClass('error')
              return false
            }
            if(! /(AM)$|(PM)$/.test($('input[name="am/pm"]').val()) || $('input[name="am/pm"]').val()==''){
              pStepForm.addTimeEditError("Should be uppercase letter AM or PM")
              $('input[name="am/pm"]').addClass('error')
              return false
            }
            const time = $('input[name="time"]').val()
            const maximum = $('input[name="max"]').val()
            const meridian = $('input[name="am/pm"]').val()
            pStepForm.UpdateSlot(time,maximum,meridian)
          })

          $('body').on('click', 'span.deletetime', function () {
            pStepForm.id=$(this).data('id')
            pStepForm.type='deletetime'
            $('.deletemodeltext').html("Location : "+pStepForm.location+`<br>`+"Date : "+moment($(this).data('date'), 'YYYY-MM-DD').format("DD MMM YYYY") +`<br>`+"Time : "+$(this).data('time'))
          })

          $('body').on('click', 'span.deletedate', function () {
            pStepForm.id=$(this).data('id')
            pStepForm.type='deletedate'
            $('.deletemodeltext').html("Location : "+pStepForm.location+`<br>`+"Date : "+moment($(this).data('date'), 'YYYY-MM-DD').format("DD MMM YYYY"))
          })

          $('#id_type').change(function () {
            let value=$(this).val()
            if(value=='custom'){
                $('.recurring').addClass('d-none')
            }
            else{
             $('.recurring').removeClass('d-none')
            }
         })
            
        },
        addTimeEditError(message){
          $('#error-alert-timeedit').removeClass('d-none');
          $('#error-alert-timeedit').html(message);
          setTimeout(function () {
            $('#error-alert-timeedit').addClass('d-none')
          }, 3000)
          
        },
        addSuccessAlertInSlotModel(message){
          $('#success-alert-slot-model').removeClass('d-none');
          $('#success-alert-slot-model').html(message);
          setTimeout(function () {
            $('#success-alert-slot-model').addClass('d-none')
          }, 3000)
        },
        addnewlocationError(message){
          $('#error-alert-addlocation-error').removeClass('d-none');
          $('#error-alert-addlocation-error').html(message);
          setTimeout(function () {
            $('.addlocation-error').addClass('d-none')
          }, 3000)
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

          pStepForm.start_date = $('#date_start').val()
          pStepForm.end_date = $('#date_end').val()
          pStepForm.getData()
        },
        getData(){
          $('.timeslotrender').html('');
          $(".emptytext").addClass('d-none')
          $(".loadspinner").removeClass('d-none')
          $.ajax({
            type: "POST",
            url: "/outreach/api/v1/healthplanscheduler-adminlist/",
            data: {
              location: this.location,
              date_start: this.start_date,
              date_end: this.end_date,
              outreach: $('#id_outreach').val(),
              csrfmiddlewaretoken: this.csrfmiddlewaretoken,
            },
            success: (res) => {
              this.data = res.data
              this.renderSlots()
            },
            error: (err) => {
              this.data = []
              this.renderSlots()
            }
          })
        },
        renderSlots(){
          let html =''
          if(! $.isEmptyObject(pStepForm.data)){
            $.each(pStepForm.data, function(key, value) {
                let html2 = ''
                value.forEach((element,index) => {
                    html2+=`
                    <div class="d-flex justify-content-start timeslotrendercolor-${index % 2 == 0 ? 'even' : 'odd'}" style="padding:0">
                        <div class="col-md-4">
                          <label style="font-weight:400;font-size:14px;" >${element.time}</label>
                        </div>
                        <div class="col-md-4" style="padding:0">
                          <label style="font-weight:400;font-size:12px;" >Max : ${element.maximum_booking_per_slot}</label>
                        </div>
                        <div class="col-md-4" style="padding:0">
                            <span class="edittime" data-id="${element.id}" data-time="${element.time}" data-date="${key}" data-max="${element.maximum_booking_per_slot}" data-toggle="modal" data-target="#edit-model" style="cursor:pointer"><i class="fa fa-edit text-primary" title="Edit" style="width: 16px;height: 16px"></i></span><span class="deletetime pl-3" data-id="${element.id}"  data-time="${element.time}" data-date="${key}" data-toggle="modal" data-target="#delete-model" style="cursor:pointer"><i class="fa fa-trash" title="Delete Time" style="width: 16px;height: 16px;color:#DB4437"></i></span>
                        </div>
                    </div>`
                });
                let date = moment(key, 'YYYY-MM-DD').format("DD MMM YYYY");
                html +=
                `<div class="col-md-3 pb-5">
                    <div class="card">
                      <div class="card-header">
                        <div class="d-flex justify-content-start style="padding:0">
                            <div class="col-md-6"  style=padding:0">
                              <label style="font-weight:600;font-size:16px;color:white" >${date}</label>
                            </div>
                            <div class="col-md-6 text-right"  style="padding:0">
                                <span class="addnewslot" data-date="${key}" data-id="${value[0]['id']}" data-toggle="modal" data-target="#edit-model" style="cursor:pointer"><i class="fa fa-plus" title="Add New Slot" style="width: 18px;height: 18px;color:white"></i></span>
                                <span class="deletedate" data-date="${key}" data-id="${value[0]['id']}" data-toggle="modal" data-target="#delete-model" style="cursor:pointer"><i class="fa fa-trash" title="Delete Date" style="width: 18px;height: 18px;color:white"></i></span>
                            </div>
                        </div>
                      </div>
                      <div class="card-body">
                        ${html2}
                      </div>
                    </div>
                </div>`
            })
            $(".loadspinner").addClass('d-none')
            $('.timeslotrender').html(html);
          }
          else{
            $('.timeslotrender').html('');
            $(".loadspinner").addClass('d-none')
            $(".emptytext").removeClass('d-none')
          }
        },
        UpdateSlot(time=null,maximum=null,meridian=null){
          $(".deletespinner").removeClass('d-none')
          $(".editspinner").removeClass('d-none')
          $.ajax({
            type: "POST",
            url: "/outreach/api/v1/healthplanscheduler-update/",
            data: {
              type: this.type,
              id:this.id,
              time:time,
              maximum:maximum,
              meridian:meridian,
              outreach: $('#id_outreach').val(),
              csrfmiddlewaretoken: this.csrfmiddlewaretoken,
            },
            success: (res) => {
              let model=null
              $(".editspinner").addClass('d-none')
              $(".deletespinner").addClass('d-none')
              if(res.status=='exists'){
                this.addTimeEditError("This time already exists for this location")
              }
              else if(res.status!=1){
                $('#edit-model').modal('hide')
                $('#delete-model').modal('hide')
                model = $('#error-alert')
              }
              else{
                $('#edit-model').modal('hide')
                $('#delete-model').modal('hide')
                model = $('#success-alert')
                pStepForm.getData()
              }
              $(model).removeClass('d-none')
              setTimeout(function () {
                  $(model).addClass('d-none')
              }, 3000)
            },
            error: (err) => {
            }
          })
        },
        addLocation(location){
          $(".addspinner").removeClass('d-none')
          $.ajax({
            type: "POST",
            url: `/outreach/api/v1/outreachscheduler-location/${$('#id_outreach').val()}/`,
            data: {
              location: location,
              csrfmiddlewaretoken: this.csrfmiddlewaretoken,
            },
            success: (res) => {
              let model = null
              $(".addspinner").addClass('d-none')
              if(res.status=='exists'){
                this.addnewlocationError("This location already exists")
              }
              else if(res.status!=1){
                $('#location-model').modal('hide')
                model = $('#error-alert')
              }
              else{
                $('#location-model').modal('hide')
                model = $('#success-alert')
              }
              $(model).removeClass('d-none')
              setTimeout(function () {
                  $(model).addClass('d-none')
              }, 3000)
              pStepForm.getLocation()
            },
            error: (err) => {
            }
          })
        },
        getLocation(){
          $.ajax({
            type: "GET",
            url: `/outreach/api/v1/outreachscheduler-location/${$('#id_outreach').val()}/`,
            success: (res) => {
                if(res.status==1){
                    pStepForm.renderSelectBox("locationselector",res.location)
                    pStepForm.renderSelectBox("location",res.location)
                    pStepForm.location=$('#id_locationselector').val()
                    pStepForm.init()
                }
            },
            error: (err) => {
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
        validate(){
          const time_input = $('.timeslot').find('.timeinput')
          const max_input = $('.timeslot').find('.maxinput')
          const datepicker = $('#slotsubmit').find('.datepicker')
          const error_elements = []
          for (let i = 0; i < datepicker.length; i++) {
            $(datepicker[i]).removeClass('error')
            if($("#id_type").val()!=='custom' || !$(datepicker[i]).is("#id_end_date")){
              if ($(datepicker[i]).val()=='') {
                error_elements.push(datepicker[i])
              }
            }
          }
          for (let i = 0; i < time_input.length; i++) {
            $(time_input[i]).removeClass('error')
            if (!/^([1-9]|1[012])(:[0-5]\d)$/.test($(time_input[i]).val())) {
              error_elements.push(time_input[i])
            }
          }
          for (let i = 0; i < max_input.length; i++) {
            $(max_input[i]).removeClass('error')
            if (!/^[0-9]*$/.test($(max_input[i]).val()) || $(max_input[i]).val()=='' ) {
              error_elements.push(max_input[i])
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
              $(element).addClass('error')
          })
      },
    }
    pStepForm.getLocation()

    $("#slotsubmit").submit(function(e){
      var validation = pStepForm.validate()
      if(validation){
        pStepForm.addSuccessAlertInSlotModel("Your slot is submitting please wait")
        $('#save').addClass('d-none')
      }
      else{
        e.preventDefault()
      }
    })
    $('#id_locationselector').change(function () {
      pStepForm.location = $(this).val()
      pStepForm.getData()
  })
})