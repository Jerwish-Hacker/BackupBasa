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
        data: [],
        limit: 50,
        page: 1,
        pagination: {},
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        outreach:$('input[name=outreach_name]').val(),
        archive_id: null,
        init: function () {

            $('body').on('click', 'span.outreach_status', function () {
                pStepForm.archive_id = $(this).data('id')
                pStepForm.renderModal()
            })

            $('body').on('click', '.confirm-cancel-appointment', function () {
                pStepForm.archive_id = $(this).data('id');
            });

            $('body').on('click', '#confirm-cancel-appointment-model .btn-primary', function () {
                pStepForm.cancelappointment();
                $('#confirm-cancel-appointment-model').modal('hide');
            });
            pStepForm.getData()
        },
        cancelappointment(reason_text=null) {
            $.ajax({
                type: "POST",
                url: "/outreach/api/v1/outreach-cancel-appointment/",
                data: {
                    archive_id: this.archive_id,
                    reason_text: reason_text,
                    outreach: this.outreach,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: res => {
                    $("#id_reason_for_cancel_text").val('')
                    $('#cancel-appointment-model').modal('hide');
                    if (res.status != 1) {
                        var model = $('#error-alert');
                    } else {
                        var model = $('#success-alert');
                    }
                    $(model).removeClass('d-none');
                    setTimeout(function () {
                        $(model).addClass('d-none');
                    }, 3000);
                    this.getData();
                },
                error: err => {
                    $('#cancel-appointment-model').modal('hide');
                    $('#error-alert').removeClass('d-none');
                    setTimeout(function () {
                        $('#error-alert').addClass('d-none');
                    }, 3000);
                }
            });
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
                  filter:'Outreach',
                  limit: this.limit,
                  page: this.page,
                  outreach: this.outreach,
                  csrfmiddlewaretoken: this.csrfmiddlewaretoken,
              },
              success: (res) => {
                  this.data = res.data
                  this.pagination = res.pagination
                  this.renderTable()
                  this.notificationchecker()
              },
              error: (err) => {
                  this.data = []
                  this.renderTable()
              }
          })
        },
        renderTable() {
          if (this.data.length > 0) {
              let html = ''
              this.data.forEach((element, index) => {
                  html += `<tr class="${index % 2 == 0 ? 'even' : 'odd'}">
                      <td>${element.mrn}</td>
                      <td>${element.first_name}</td>
                      <td>${element.last_name}</td>
                      <td>${element.phone_number}</td>
                      <td><span class="outreach_status badge badge-secondary" data-toggle="modal" data-target="#outreach_history-model" data-id="${element.id}" style="cursor:pointer;font-size:12px;width:75%;height:20px;color:white;">Appointment cancelation requested</span></td>
                      <td>${element.created_datetime}</td>
                      <td class="hover-icons"><span class="hover-icons confirm-cancel-appointment" data-toggle="modal" data-target="#confirm-cancel-appointment-model" data-id="${element.call_details_table_id}"><i class="fa fa-times text-danger" aria-hidden="true" title="Confirm cancellation" style="width: 18px;height: 18px"></i></span></td>
                </tr>`;
              })
              $('#storebookingData').html(html);
              let pageLength = this.pagination.totalPages

              html = ''
              let separatorAdded = false
              for (let i = 0; i < pageLength; i++) {
                  if (this.isPageInRange(this.page, i, pageLength, 2, 2)) {
                      html += `<li class="pagination1" data-page="` + (i + 1) +`" 
                          data-date_start="`+ 'date_start' + `"
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
        renderModal() {
            $('#modal-view-body').html(`<div class="text-center">
            <div class="lds-ring primary"><div></div><div></div><div></div><div></div></div>
            Loading....
            </div>`);
            $.ajax({
                type: "GET",
                url: `/outreach/api/v1/${this.outreach}/outreach-history/${this.archive_id}/`,
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
                    accessing_from: this.outreach,
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
    pStepForm.init()
    pStepForm.notificationchecker()
    setInterval(function(){ 
        pStepForm.notificationchecker()
    }, 600000);

    $('#limit').change(function () {
        pStepForm.limit = $(this).val()
        pStepForm.page = 1
        pStepForm.getData()
    })

    $("body").on('click', '.pagination1', function () {
        $(".pagination1").removeClass("active");
        $(this).addClass('active');
        pStepForm.page = $(this).data("page");
        pStepForm.getData()
    });
})