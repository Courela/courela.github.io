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
		let url = 'https://api.waiterio.com/api/v3/authentication';
		let body = prepareAuthentication(username, password);
		const response = await authenticate(url, body);
		if (response) {
			// let restaurantId = sessionStorage.getItem("restaurantId");
			// let token = sessionStorage.getItem("token");
			sessionStorage.setItem("username", username);
			// displayAll(true);
			// await print(restaurantId);
			window.location.href = "links.html";
			
			// await refreshAuth(true);
			// $('#credentials').hide();
			// $('#links').show();
			result = true;
		} else {
			alert('Autentica\xE7\xE3o falhou!');
		}
	} else {
		alert("Utilizador e Password obrigat\xF3rios");
	}

	return result;
}
