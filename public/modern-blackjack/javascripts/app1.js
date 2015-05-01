var main = function() {
	"use strict";
	       


/* New Registeration Form */
	$("#btnRegister").click(function() {
		$("#sss").show();
     });

	$("#sss #popupform #PostSubmit").click(function() {
		$("#sss").hide();
	});

	$("#sss #popupform #PostCancel").click(function() {
		$("#sss").hide();
	});
	/* End New Registeration Form */



/* Login form */
	$("#btnLogon").click(function() {
		$("#abc").show();
	});

	$("#abc #popupform #login1").click(function() {
		$("#abc").hide();
	});


	/* End login form */
	
/* guest form */
	$("#btnguest").click(function() {
		$("#xyz").show();
	});

	$("#xyz #popupform #guest1").click(function() {
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
    confirmpassword:{
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
  confirmpassword:{
    required:"please provide a password",
    minlength:"Your password must be atleast 5 characters long",
    equalTo:"Please enter the same password as above"
  }

}
});


$( "#form2" ).validate({
  rules: {
  username: {
      required: true,
      minlength:2
    },
     password:{
      required:true,
      minlength:5
    }
        },

  messages:{
    username: {
      required:"please enter user name",
      minlength:"Your user name must consists of atleast 2 characters"
  },
  password:{
    required:"please provide a password",
    minlength:"Your password must be atleast 5 characters long"
  }
}
});

$( "#form3" ).validate({

  rules: {
  username: {
      required: true,
      minlength:2
    }
  },
  messages:{
    username: {
      required:"please enter guest name",
      minlength:"Your guest name must consists of atleast 2 characters"
  }
}


  });




$("#guest1").click(function()
{
    var dataString = $("#guestname").val();
    
           $.ajax({
             type: "POST",
             url: "game.html",
             data: "dataString=" + dataString,
             success: function(result){
                 $("#response").html(result);
              }
           });   
    });


}
	
$(document).ready(main);