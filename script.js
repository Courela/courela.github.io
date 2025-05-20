function meals(restaurantId, token) {
	var startTime = new Date().getTime() - (24 * 60 * 60 * 1000);
	//var url = 'https://api.waiterio.com/api/v3/batch/'
	var url = 'https://api.waiterio.com/api/v3/meals?restaurantId=' + restaurantId + '&startTime=' + startTime;
	//var data = '[{"alias":"restaurant","url":"restaurants/'+ restaurantId + '"},{"alias":"meals?restaurantId=' + restaurantId + '&startTime=' + startTime + '"}]';
	$.ajax({
		type: "get",
		url: url,
		//data: data,
		contentType: "application/json",
		headers: { "Authorization": "Token " + token },
		success: function (res) {
			// console.log("Meals: " + JSON.stringify(res));
			var mealRequests = parseMeals(res);
			window.mealRequests = mealRequests;
			// printMeals(toPrepareMeals);
			
			var groupByStatus = groupByDishes(mealRequests);
			printDashboard(groupByStatus);
		}
	});
}

function parseMeals(data) {
	var toPrepareMeals = [];
	for (var i = 0; i < data.length; i++) {
		var order = data[i];
		if (order.deleted) {
			continue;
		}

		var table = order.table;
		var keys = Object.keys(order.itemstamps);
		// console.log("Keys to parse: " + keys);
		for (var j = 0; j < keys.length; j++) {
			var item = order.itemstamps[keys[j]];
			// console.log("Item in order: " + JSON.stringify(item));
			var id = item.id;
			var status = item.status;
			var productId = item.item.id;
			var description = item.item.name;
			
			toPrepareMeals.push({ "table": table, "itemId": id, "productId": productId, "status": status, "description": description });
		}
	}
	
	// console.log("To prepare: " + JSON.stringify(toPrepareMeals));
	return toPrepareMeals;
}

function groupByDishes(toPrepareMeals) {
	// var ordered = toPrepareMeals.filter(m => m.status == 'ORDERED');
	return toPrepareMeals.reduce((acc, meal) => {
		const key = meal.status;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(meal);
		return acc;
	}, {});
}

function printMeals(toPrepareMeals) {
	var domMeals = $("#meals");
	var table = $('<table></table>');
	var header = $("<tr><th>Mesa</th><th>Estado</th><th>Item</th></tr>");
	table.append(header);
	for (var i = 0; i < toPrepareMeals.length; i++) {
		var row = $("<tr></tr>");
		row.append('<td>' + toPrepareMeals[i].table + "</td>");
		row.append('<td>' + toPrepareMeals[i].status + "</td>");
		row.append('<td>' + toPrepareMeals[i].description + "</td>");
		
		table.append(row);
	}
	
	// console.log("Table meals: " + JSON.stringify(table));
	domMeals.append(table);
}

function printDashboard(groupByStatus) {
	console.log("Group by: " + JSON.stringify(groupByStatus));

	var domDishes = $("#dishes");
		
	if (groupByStatus) {
		var statuses = Object.keys(groupByStatus);
		// console.log("Keys to parse: " + statuses);
		for (var i = 0; i < statuses.length; i++) {
			var status = groupByStatus[statuses[i]];
			// console.log('Item in ' + statuses[i] + ': ' + JSON.stringify(status));
			
			var dishes = status.reduce((acc, dish) => {
				if (isSelected(dish)) {
					const key = dish.description;
					if (!acc[key]) {
						acc[key] = 0;
					}
					acc[key] = acc[key] + 1;
				}
				return acc;
			}, {});

			console.log("Dishes: " + JSON.stringify(dishes));
			var dishNames = Object.keys(dishes);
			for (var j = 0; j < dishNames.length; j ++) {
				var div = $('<div class="board-cell"></div>');
				div.append('<span>'+ dishNames[j] +'</span><br /><span>'+ dishes[dishNames[j]].toString() +'</span>');
				domDishes.append(div);
			}
		}
	} else {
		var div = $('<div class="dynamic">Sem refeições</div>');
		domDishes.append(div);
	}
	
	// console.log("Table meals: " + JSON.stringify(table));
}

function isSelected(dish) {
	return inSelectedCategory(dish) && inSelectedStatus(dish);
}

function inSelectedCategory(dish) {
	const categories = $('#divCategories input[type="checkbox"]:checked');
	const allChecked = categories.length === 1 && categories.val() === 'all';
	if (allChecked) {
		return true;
	}

	var result = false;
	
	const productId = dish.productId;
	var menus = window.menus;
	
	categories.each(function () {
		const category = $(this).val();
		if (menus.find(m => m.category === category && m.itemId === productId)) {
			console.log("Selected category: " + category);
			result = true;
		};
	});

	return result;
}

function inSelectedStatus(dish) {
	const statuses = $('#divStatuses input[type="checkbox"]:checked');
	const allChecked = statuses.length === 1 && statuses.val() === 'all';
	if (allChecked) {
		return true;
	}

	var result = false;
	
	statuses.each(function () {
		const status = $(this).val();
		if (dish.status == status) {
			console.log("Selected status: " + status);
			result = true;
		};
	});

	return result;
}

function print(restaurantId, token) {
	menus(restaurantId, token);
	meals(restaurantId, token);
}

function displayAll(show) {
	if (show) {
		$('#credentials').hide();
		// $('#menusContent').show();
		// $('#mealsContent').show();
		$('#settings').show();
		$('#dashboard').show();
	} else {
		$('#credentials').show();
		// $('#menusContent').hide();
		// $('#mealsContent').hide();
		$('#settings').hide();
		$('#dashboard').hide();
	}
}

function recalculateDashboard() {
	$('#dishes').empty();
	var groupByStatus = groupByDishes(window.mealRequests);
	printDashboard(groupByStatus);
}

function printStatuses(statuses) {
    if (statuses && statuses.length > 0) {
        var settings = $('#divStatuses');

        // console.log("Statuses: " + JSON.stringify(statuses));
		for (var i = 0; i < statuses.length; i++) {
			var status = statuses[i];
		    var checkBox = $('<input type="checkbox" value="' + status + '" title="' + status +'" placeholder="" />');
            checkBox.change(function () {
                $('#chkAllStatuses').prop('checked', false);
                recalculateDashboard();
            });
            settings.append('<span>' + status + '</span>', checkBox);
        }
    }
}