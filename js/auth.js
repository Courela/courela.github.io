function prepareAuthentication(username, password) {
	let authCred = username + ':' + password;
	let base64Str = btoa(authCred);
	let now = Date.now();
	
	let body = {
		"authenticationType":"Basic ",
		"authenticationCredentials": base64Str,
		"device": {
			"_id": "51f6a9113758960f3a9ee701",
			"creationTime": now,
			"lastEditTime": now,
			"networkAdapters":[],
			"browser":true,
			"os":"Windows",
			"size":"desktop"
		},
		"referrer":"www.bing.com",
		"referrers":"www.bing.com,www.waiterio.com,www.waiterio.com/pt/pricing,www.waiterio.com/docs/pt,undefined",
		"user": {
			"language":"pt",
			"_id":"9ea102d713fb1ce2832209ba",
			"creationTime": now,
			"lastEditTime": now,
			"firstName":"",
			"lastName":"",
			"settings": {
				"showTips":"NEVER",
				"showSuggestions":false,
				"ratedAndroidApp":false,
				"sortOrdersBy":"TABLE_NAME",
				"showOnlyMyOrders":false,
				"hidePaidOrders":true,
				"hideOrdersAutomatically":"AT_" + window.getMealsBackTo + "AM",
				"ordersLayout":"MULTI_COLUMN_VIEW"
			}
		},
		"expireTime":0
	};
	
	return JSON.stringify(body);
}

function authenticateXhr(url, body) {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   // Typical action to be performed when the document is ready:
		   document.getElementById("demo").innerHTML = xhttp.responseText;
		}
	};
	
	xhttp.open("POST", url);
	
	xhttp.setRequestHeader('Content-type', 'application/json');
	
	xhttp.send(body);
}

async function authenticate(url, data) {
	try {
		const res =  await $.ajax({
			type: "post",
			url: url,
			data: data,
			contentType: "application/json"
		});
		
		console.log("User: " + res.user._id);
		console.log("Restaurant: " + res.roles[0].restaurantId);
		console.log("Token: " + res.waiterioToken);
		console.log("Expire: " + res.waiterioTokenExpireTime);
		
		// displayAll(true);
		
		let token = res.waiterioToken;
		
		sessionStorage.setItem("userId", res.user._id);
		sessionStorage.setItem("restaurantId", res.roles[0].restaurantId);
		sessionStorage.setItem("token", token);
		sessionStorage.setItem("expire", res.waiterioTokenExpireTime);
		
		return true;
	}
	catch (err) {
		console.error(err);
		displayAll(false);
	}
	
	return false;
}
