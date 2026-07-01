async function searchPrinterServer()
{
    for (let idx = 1; idx < 254; idx++) {
        // TODO find ip range automatically
        let url = `https://${window.localIP}${idx}:3000/api/ping`;
        $.ajax({
            url: url,
            type: "GET",
            timeout: 500,
            success: function(res) {
                console.log(`Server ping response for ${idx}: ${res}`);
                window.printServerURLOptions.push(`1.${idx}:3000/api`);
            },
            error: function(xhr, status, error) {
                if (status != 'timeout') {
                    console.warn("An error occurred:", error);
                }
            }
        });
    }
}

async function searchPrinters()
{
    for (let idx = 1; idx < 254; idx++) {
        // TODO find ip range automatically
        let url = `${window.localIP}${idx}`;
        $.ajax({
            url: url,
            type: "GET",
            timeout: 500,
            success: function(res) {
                console.log(`Printer response for ${idx}: ${res}`);
                window.printerAddrOptions.push(`1.${idx}`);
            },
            error: function(xhr, status, error) {
                if (status != 'timeout') {
                    console.warn("An error occurred:", error);
                }
            }
        });
    }
}

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
		return res;
	} catch (err) {
		console.log(err);
        showModal('Falha a obter menu!', 10000);
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
        return res;
    } catch (err) {
        console.log(err);
        showModal('Falha a obter refei\xE7\xF5es!', 10000);
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
        showModal('Falha a obter pedido "' + orderId + '"!', 3000);
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
        showModal('Falha a actualizar pedido "' + orderId + '"!', 3000);
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
        showModal('Falha a imprimir "' + itemName + '" para a mesa "' + table + '"!', 3000);
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
        showModal('Impressora falhou.', 3000);
	}
}

function getAuthHeader() {
    let token = sessionStorage.getItem("token");
    return { "Authorization": "Token " + token };
}