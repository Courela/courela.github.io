function bindLogin() {
    $('#login').on('click', async function(){
        $('#spinner').show();
        await login();
        $('#spinner').hide();
    });
}

async function login() {	
	console.log("Going to authenticate...");
	
	let result = false;

	let username = $('#username').val();
	let password = $('#password').val();
	
	if (username && password) {
		let url = window.apiURL + '/authentication';
		let body = prepareAuthentication(username, password);
		const response = await authenticate(url, body);
		if (response) {
			sessionStorage.setItem("username", username);
			window.location.href = "links.html";
			result = true;
		} else {
			alert('Autentica\xE7\xE3o falhou!');
		}
	} else {
		alert("Utilizador e Password obrigat\xF3rios");
	}

	return result;
}
