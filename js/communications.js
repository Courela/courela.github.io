async function getMenus(restaurantId) {
	let url = window.apiURL + '/menus?restaurantId=' + restaurantId;
	try {
		let res = await $.ajax({
			type: "get",
			url: url,
			contentType: "application/json",
			headers: getAuthHeader()
		});

        console.log('Receive menus: ' + (res.length > 0 && res[0].categories ? res[0].categories.length : 0));
		
		let menus = parseMenus(res);
		window.menus = menus;
        return menus;
	} catch (err) {
		console.log(err);
        alert('Falha a obter menu!');
	}
    return [];
}

async function getMeals(restaurantId) {
	let currentTime = new Date().getTime();
    let startTime = window.getMealsBackTo * 60 * 60 * 1000;
	let url = window.apiURL + '/meals?restaurantId=' + restaurantId + '&startTime=' + (currentTime - startTime);

    try {
        let res = await $.ajax({
            type: "get",
            url: url,
            contentType: "application/json",
            headers: getAuthHeader()
        });

        console.log('Receive meals: ' + res.length);

        window.meals = res;
        let mealRequests = parseMeals(res);
        
        return mealRequests;
    } catch (err) {
        console.log(err);
        alert('Falha a obter refei\xE7\xF5es!');
    }

    return [];
}

async function getOrder(orderId) {
    let url = window.apiURL + '/meals/' + orderId;
    try {
        let res = await $.ajax({
            type: "get",
            url: url,
            contentType: "application/json",
            headers: getAuthHeader()
        });

        // console.log('Order ' + orderId + ': ' + JSON.stringify(res));

        return res;
    } catch (err) {
        console.log(err);
        alert('Falha a obter pedido "' + orderId + '"!');
    }

    return null;
}

async function updateOrder(orderId, order) {
    let url = window.apiURL + '/meals/' + orderId;
    try {
        
        let res = await $.ajax({
            type: "put",
            url: url,
            contentType: "application/json",
            headers: getAuthHeader(),
            data: JSON.stringify(order)
        });

        console.log('Update order "' + orderId + '"');
    } catch (err) {
        console.log(err);
        alert('Falha a actualizar pedido "' + orderId + '"!');
        return false;
    }
    return true;
}

async function sendToPrinter(table, quantity, itemName) {
    let url = window.printServerURL + '/item';
    if (window.printerAddr) {
        url = url + '?printer=' + window.printerAddr;
    }
	try {
        console.log('Sending to printer: ' + table + ' ' + quantity + ' ' + itemName);
		let res = await $.ajax({
			type: "post",
			url: url,
            data: JSON.stringify({ "table": table, "quantity": quantity, "itemName": itemName }),
			contentType: "application/json",
		});
	} catch (err) {
		console.log(err);
        alert('Impressora falhou.');
	}
}

async function sendItemsToPrinter(data) {
    let url = window.printServerURL + '/items';
    if (window.printerAddr) {
        url = url + '?printer=' + window.printerAddr;
    }
	try {
        console.log('Sending items to printer: ' + JSON.stringify(data));
		await $.ajax({
			type: "post",
			url: url,
            data: JSON.stringify(data),
			contentType: "application/json",
		});
	} catch (err) {
		console.log(err);
        alert('Impressora falhou.');
	}
}

function getAuthHeader() {
    let token = sessionStorage.getItem("token");
    return { "Authorization": "Token " + token };
}