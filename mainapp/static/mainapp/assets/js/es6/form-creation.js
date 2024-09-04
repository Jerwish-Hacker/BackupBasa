$(document).ready(function() {
    // Add card
    $('.add-card-btn').click(function() {
    var card = $('.card-container .card').last().clone();
    card.find('.card-title').val('');
    card.find('.card-description').val('');
    card.find('.field-type-dropdown').val('');
    card.find('.delete-card-btn').show();
    card.find('.card-options').empty();
    card.find('.card-field-options').hide();
    $('.card-container').append(card);
    });
    
    // Delete card
    $(document).on('click', '.delete-card-btn', function() {
    if ($('.card-container .card').length > 1) {
    $(this).closest('.card').remove();
    }
    });
    
    // Show/hide field options based on selected field type
    $(document).on('change', '.field-type-dropdown', function() {
    var fieldType = $(this).val();
    var fieldOptions = $(this).closest('.card-header').siblings('.card-body').find('.card-options');
    var fieldOptionsWrapper = $(this).closest('.card-header').siblings('.card-body').find('.card-field-options');
    if (fieldType === 'radio' || fieldType === 'checkbox' || fieldType === 'dropdown') {
    fieldOptionsWrapper.show();
    fieldOptions.empty();
    fieldOptions.append('<input type="text" class="form-control option" placeholder="Option">');
    fieldOptions.append('<button type="button" class="btn btn-danger remove-option-btn">Remove</button>');
    } else {
    fieldOptionsWrapper.hide();
    fieldOptions.empty();
    }
    });
    
    // Add field option
    $(document).on('click', '.add-option-btn', function() {
    var fieldOptions = $(this).closest('.card-body').find('.card-options');
    fieldOptions.removeClass('d-none')
    fieldOptions.append('<input type="text" class="form-control option" placeholder="Option">');
    fieldOptions.append('<button type="button" class="btn btn-danger remove-option-btn">Remove</button>');
    });
    
    // Remove field option
    $(document).on('click', '.remove-option-btn', function() {
    $(this).prev().remove(); // remove the input field
    $(this).remove(); // remove the remove button
    });
    
    $(document).on('click', '.submit-btn', function() {
      var cards = [];
      $('.card-container .card').each(function() {
        var card = {};
        card.title = $(this).find('.card-title').val();
        card.description = $(this).find('.card-description').val();
        card.type = $(this).find('.field-type-dropdown').val();
        if (card.type === 'radio' || card.type === 'checkbox' || card.type === 'dropdown') {
          card.options = [];
          $(this).find('.option').each(function() {
            card.options.push($(this).val());
          });
        }
        cards.push(card);
      });
      var jsonData = JSON.stringify(cards);
      console.log(jsonData); // You can use this data as per your requirement
      $.ajax({
        type: "POST",
        url:'/create/form/', 
        data: {
            form_data: jsonData,
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        },
        success: (res) => {
            if(res.status == 1){
                console.log("success");
            }
            else if(res.status==2){
                $('#usergroup-alert').html("You cannot remove your admin access unless you assign it to someone else.")
                $('#usergroup-alert').removeClass('d-none')
                setTimeout(function () {
                    $('#usergroup-alert').addClass('d-none')
                }, 6000)
            }
            else{
                console.log("err");
            }
        },
        error: (err) => {
        
        }
    })
    });
});
    