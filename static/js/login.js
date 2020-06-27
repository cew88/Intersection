var type = "login";

function swap(){
	if (type == 'login'){
		type = 'signup';
		$("#switch").html("Sign In");
		$("#password2-div").removeClass('hide');
		$("#submit").attr("value", "Sign Up");
		$("#login-text").html("Create a new account");
	}
	else {
		type = 'login';
		$("#switch").html("Sign Up");
		$("#password2-div").addClass('hide');
		$("#submit").attr("value", "Sign In");
		$("#login-text").html("Sign in");
	}
}