$(function () {
    "use strict";
    const ConfigApp = {
        county:[],
        location:[],
        countySelected:'',
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        init: function () {


        },
        CountyList(){
            $.ajax({
                type: "GET",
                url:'/countyApis/',
                success: (res) => {
                    if(res.status==1){
                        this.county = res.county
                        this.renderCountyDropdown()
                    }
                    else{
                        console.log('error');
                    }

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },

        LocationList(){
            $.ajax({
                type: "POST",
                url:'/locationApis/',
                data: {
                    county: this.countySelected,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    if(res.status==1){
                        this.location = res.location
                        this.renderLocationDropdown()
                    }
                    else{
                        console.log('error');
                    }

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        AddNewCounty(){
            var newCounty = $('input[id=id_new_county]').val();
            $.ajax({
                type: "POST",
                url:'/api/add/county/',
                data: {
                    county: newCounty,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    if(res.status==1){
                        this.CountyList()
                    }
                    else{
                        console.log('error');
                    }

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        AddNewLocation(){
            var newLocation = $('input[id=id_new_location]').val();
            $.ajax({
                type: "POST",
                url:'/api/add/location/',
                data: {
                    county: this.countySelected,
                    location: newLocation,
                    csrfmiddlewaretoken: this.csrfmiddlewaretoken
                },
                success: (res) => {
                    if(res.status==1){
                        this.LocationList()     
                    }
                    else{
                        console.log('error');
                    }

                },
                error: (err) => {
                    console.log(err);
                }

            })
        },
        renderCountyDropdown(){
            $('#id_select_county').empty()
            $('#id_select_county').append($('<option>', {
                value: '',
                text : "Select County",
            }, '</option>' ));
            $.each(this.county, function (i, item) {
                $('#id_select_county').append($('<option>', {
                    value: item,
                    text : item,
                }, '</option>' ));
            });
            this.renderLocationDropdown()
        },
        renderLocationDropdown(){
            $('#id_select_location').empty()
            $('#id_select_location').append($('<option>', {
                value: '',
                text : "Select Location",
            }, '</option>' ));
            $.each(this.location, function (i, item) {
                $('#id_select_location').append($('<option>', {
                    value: item,
                    text : item,
                }, '</option>' ));
            });
        },
    }
    ConfigApp.init();
    ConfigApp.CountyList();

    $('#id_select_county').change(function () {
        ConfigApp.countySelected = $(this).val()
        ConfigApp.LocationList();

    });
    
    $('#id_add_county').click(function () {
        if($('#id_new_county').val() == ""){
            alert("County name can't be empty")
        }
        else{
            ConfigApp.AddNewCounty();
            alert("New county added !")
            $('#id_new_county').val("")
        }
    });

    $('#id_add_location').click(function () {
        if($('#id_select_county').val() == ""){
            alert("Select corresponding county first !")
        }
        else if($('#id_new_location').val() == ""){
            alert("Location name can't be empty")
        }
        else{
            ConfigApp.AddNewLocation();
            alert("New location added !")
            $('#id_new_location').val("")
        }

    });


})