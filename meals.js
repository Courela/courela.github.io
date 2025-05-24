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
			
			var groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
			printDashboard(groupByStatuses);
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
            var itemName = item.item.name;
			var description = getItemDescription(productId);
			
			toPrepareMeals.push({ "table": table, "itemId": id, "productId": productId, "status": status, "itemName": itemName, "itemDescription": description });
		}
	}
	
	// console.log("To prepare: " + JSON.stringify(toPrepareMeals));
	return toPrepareMeals;
}

function groupByStatus(toPrepareMeals, descriptionSplit) {
	console.log("Before group by: " + JSON.stringify(toPrepareMeals));
	return toPrepareMeals.reduce((acc, meal) => {
		const key = meal.status;
		if (!acc[key]) {
			acc[key] = {};
		}

        const descr = meal.itemDescription && meal.itemDescription != 'null' ? meal.itemDescription : window.nullDescription;
        if (descriptionSplit) {
            if (!acc[key][descr]) {
                acc[key][descr] = [];
            }
            acc[key][descr].push(meal);
        } else {
            acc[key][descr] = [ meal ];
        }
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
        row.append('<td>' + toPrepareMeals[i].itemName + "</td>");
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
			var statusKeys = Object.keys(status);
            for (var k = 0; k < statusKeys.length; k++) {
                var dishes = status[statusKeys[k]].reduce((acc, dish) => {
                    if (isSelected(dish)) {
                        const key = dish.itemName;
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
		}
	} else {
		var div = $('<div class="dynamic">Sem refeições</div>');
		domDishes.append(div);
	}
	
	// console.log("Table meals: " + JSON.stringify(table));
}
