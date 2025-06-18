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
		let categories = getCategories(menus);
		printCategories(categories, window.descriptionSplit);
	} catch (err) {
		console.log(err);
	}
}

async function getMeals(restaurantId) {
	let startTime = new Date().getTime() - (window.getMealsBackTo * 60 * 60 * 1000);
	let url = window.apiURL + '/meals?restaurantId=' + restaurantId + '&startTime=' + startTime;

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
        
        printDashboard(mealRequests);
    } catch (err) {
        console.log(err);
    }
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

        console.log('Order ' + orderId + ': ' + JSON.stringify(res));

        return res;
    } catch (err) {
        console.log(err);
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
        return false;
    }
    return true;
}

async function sendToPrinter(table, quantity, itemName) {
    let url = window.printerURL + '/item';
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
    let url = window.printerURL + '/items';
	try {
        console.log('Sending items to printer: ' + JSON.stringify(data));
		let res = await $.ajax({
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