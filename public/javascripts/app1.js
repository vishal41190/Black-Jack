var main = function() {
    "use strict";



    /* New Registeration Form */
    $("#btnRegister").click(function() {
        $("#sss").show();
    });



    $("#sss #popupform #PostCancel").click(function() {
        $("label.error").hide();
        $(".error").removeClass("error");

        $('#firstname').val("");
        $('#lastname').val("");
        $('input[type="password"]').val('');
        $('input[type="email"]').val('');
        $("#sss").hide();
    });
    /* End New Registeration Form */



    /* Login form */
    $("#btnLogon").click(function() {
        $("#abc").show();
    });

    /*code referred from http://stackoverflow.com/questions/2086287/how-to-clear-jquery-validation-error-messages */
    /*http://stackoverflow.com/questions/10951809/clear-text-field-value-in-jquery */
    $("#abc #popupform #login2").click(function() {
        $("label.error").hide();
        $(".error").removeClass("error");

        $('#email').val("");
        $('input[type="password"]').val('');
        $('input[type="email"]').val('');
        $("#abc").hide();
    });


    /* End login form */

    /* guest form */
    $("#btnguest").click(function() {
        $("#xyz").show();
    });

    $("#xyz #popupform #guest2").click(function() {
        $("label.error").hide();
        $(".error").removeClass("error");
        $('#guestname').val("");

        $("#xyz").hide();
    });


    /* End guest form */


    /*validations*/

    //referred from http://jqueryvalidation.org/ 
    $( "#form1" ).validate({
        rules: {
            firstname: {
                required: true,
                minlength:2
            },
            lastname:"required",
            email:{
                required:true,
                email:true
            },
            password:{
                required:true,
                minlength:5
            },
            reenterpassword:{
                required:true,
                minlength:5,
                equalTo:"#password"
            }

        },
        messages:{
            firstname: {
                required:"please enter first name",
                minlength:"Your first name must consists of atleast 2 characters"
            },
            lastname:"please enter last name",
            password:{
                required:"please provide a password",
                minlength:"Your password must be atleast 5 characters long"
            },
            reenterpassword:{
                required:"please provide a password",
                minlength:"Your password must be atleast 5 characters long",
                equalTo:"Please enter the same password as above"
            }

        }
    });


    $( "#form2" ).validate({
        rules: {
            email:{
                required:true,
                email:true
            },
            password:{
                required:true,
                minlength:5
            }
        },

        messages:{

            password:{
                required:"please provide a password",
                minlength:"Your password must be atleast 5 characters long"
            }
        }
    });

    $( "#form3" ).validate({
        
        rules: {
            guestname: {
                required:true,
                minlength:2,
                maxlength:7
               
            }
        },
        messages:{
            guestname: {
                required:"please enter guest name",
                minlength:"Your guest name must consists of atleast 2 characters",
                maxlength: "Your guest name should not exeed 7 characters"
            }
        },
        submitHandler: function(form) {
           form.submit();
            }


    });




    $("#guest1").click(function(){

        var userName = $("#guestname").val();
        if(userName.length>2 && userName.length<8){
        console.log("guest login");
        var playerName = JSON.stringify({playerName:userName});
        $.ajax({

            type: "POST",
            url: "/users",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: playerName
        })
            .done(function(data, status) {

            window.location.replace(data.url);


        })
            .fail(function(data, status) {
            console.log("fail called");
            console.log(data);
            console.log(status);
        });
    }
        else{
            
        }
    });


}

$(document).ready(main);
