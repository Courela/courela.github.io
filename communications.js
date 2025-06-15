async function getMenus(restaurantId, token) {
	let url = window.apiURL + '/menus?restaurantId=' + restaurantId;
	try {
		let res = await $.ajax({
			type: "get",
			url: url,
			contentType: "application/json",
			headers: { "Authorization": "Token " + token }
		});
		
		let menus = parseMenus(res);
		window.menus = menus;
		let categories = getCategories(menus);
		printCategories(categories, window.descriptionSplit);
	} catch (err) {
		console.log(err);
	}
}

async function getMeals(restaurantId, token) {
	let startTime = new Date().getTime() - (window.getMealsBackTo * 60 * 60 * 1000);
	let url = window.apiURL + '/meals?restaurantId=' + restaurantId + '&startTime=' + startTime;

    try {
        let res = await $.ajax({
            type: "get",
            url: url,
            contentType: "application/json",
            headers: { "Authorization": "Token " + token }
        });

        window.meals = res;
        let mealRequests = parseMeals(res);
        
        printDashboard(mealRequests);
    } catch (err) {
        console.log(err);
    }
}

async function updateOrder(orderId, order) {
    let url = window.apiURL + '/meals/' + orderId;
    try {
        let token = sessionStorage.getItem("token");
        let res = await $.ajax({
            type: "put",
            url: url,
            contentType: "application/json",
            headers: {
                "Authorization": "Token " + token
            },
            data: JSON.stringify(order)
        });

        console.log('Update order ' + orderId + ': ' + JSON.stringify(res));
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
}
