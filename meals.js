async function getMeals(restaurantId, token) {
	let startTime = new Date().getTime() - (24 * 60 * 60 * 1000);
	//let url = 'https://api.waiterio.com/api/v3/batch/'
	let url = 'https://api.waiterio.com/api/v3/meals?restaurantId=' + restaurantId + '&startTime=' + startTime;
	//let data = '[{"alias":"restaurant","url":"restaurants/'+ restaurantId + '"},{"alias":"meals?restaurantId=' + restaurantId + '&startTime=' + startTime + '"}]';

    try {
        let res = await $.ajax({
            type: "get",
            url: url,
            //data: data,
            contentType: "application/json",
            headers: { "Authorization": "Token " + token }
        });

        // console.log("Meals: " + JSON.stringify(res));
        window.meals = res;
        let mealRequests = parseMeals(res);
        // printMeals(toPrepareMeals);
        
        let groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
        printDashboard(groupByStatuses);
    } catch (err) {
        console.log(err);
    }		
}

function parseMeals(data) {
	let toPrepareMeals = [];
	for (let i = 0; i < data.length; i++) {
		let order = data[i];
		if (order.deleted) {
			continue;
		}

		let table = order.table;
        let orderId = order._id;
		let keys = Object.keys(order.itemstamps);
		// console.log("Keys to parse: " + keys);
		for (let j = 0; j < keys.length; j++) {
			let item = order.itemstamps[keys[j]];
			// console.log("Item in order: " + JSON.stringify(item));
			let id = item.id;
			let status = item.status;
            let created = item.creationTime;
			let productId = item.item.id;
            let itemName = item.item.name;
			let description = getItemDescription(productId);
			
			toPrepareMeals.push({ "orderId": orderId, "table": table, "itemId": id, "productId": productId, "createdAt": created,  "status": status, "itemName": itemName, "itemDescription": description });
		}
	}
	
	// console.log("To prepare: " + JSON.stringify(toPrepareMeals));
	return toPrepareMeals;
}

function groupByStatus(toPrepareMeals, descriptionSplit) {
	// console.log("Before group by: " + JSON.stringify(toPrepareMeals));
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
	let domMeals = $("#meals");
	let table = $('<table></table>');
	let header = $("<tr><th>Mesa</th><th>Estado</th><th>Item</th></tr>");
	table.append(header);
	for (let i = 0; i < toPrepareMeals.length; i++) {
		let row = $("<tr></tr>");
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
	// console.log("Group by: " + JSON.stringify(groupByStatus));

	let domDishes = $("#dishes");
		
	if (groupByStatus) {
		let statuses = Object.keys(groupByStatus);
		// console.log("Keys to parse: " + statuses);
		for (let i = 0; i < statuses.length; i++) {
			let status = groupByStatus[statuses[i]];
			// console.log('Item in ' + statuses[i] + ': ' + JSON.stringify(status));
			let statusKeys = Object.keys(status);
            for (let k = 0; k < statusKeys.length; k++) {
                let dishes = status[statusKeys[k]].reduce((acc, dish) => {
                    if (isSelected(dish)) {
                        const key = dish.itemName;
                        if (!acc[key]) {
                            acc[key] = 0;
                        }
                        acc[key] = acc[key] + 1;
                    }
                    return acc;
                }, {});

                // console.log("Dishes: " + JSON.stringify(dishes));
                let dishNames = Object.keys(dishes);
                for (let j = 0; j < dishNames.length; j ++) {
                    let div = $('<div class="board-cell"></div>');
                    div.append('<span>'+ dishNames[j] +'</span><br /><span>'+ dishes[dishNames[j]].toString() +'</span>');
                    if (window.showTables) {
                        let tables = getTablesForDish(dishNames[j], status[statusKeys[k]]);
                        if (tables) {
                            for (let l = 0; l < tables.length; l++) {
                                let orderId = $('<input name="' + tables[l].table + '_orderId" type="hidden" value="' + tables[l].orderId + '"></input>')
                                let itemId = $('<input name="' + tables[l].table + '_itemId" type="hidden" value="' + tables[l].itemId + '"></input>')
                                let link = $('<a href="#">' + tables[l].table + '</a>');
                                let createdDom = $('<span style="font-size: 14px;">' + toDateTime(tables[l].createdAt) + '</span>');
                                link.on('click', () => {
                                    let ok = confirm('Marcar como servido?');
                                    let divDish = $(this).parent();
                                    let ids = divDish.filter('input');
                                    let orderId = ids.find("[name$=orderId]");
                                    let itemId = ids.find("[name$=itemId]");
                                });
                                div.append('<br />', orderId, itemId, link, createdDom);
                            }
                        }
                    }
                    domDishes.append(div);
                }
            }
		}
	} else {
		let div = $('<div class="dynamic">Sem refeições</div>');
		domDishes.append(div);
	}
	
	// console.log("Table meals: " + JSON.stringify(table));
}

function getTablesForDish(dishName, ordersByStatus) {
    let result = [];
    let orders = ordersByStatus.filter(o => o.itemName === dishName);
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        result.push({ orderId: order.orderId, table: order.table, itemId: order.itemId, createdAt: order.createdAt });
    }
    return result;
}

function toDateTime(timestamp) {
    let date = new Date(timestamp);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' +
    date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' +
    date.getSeconds();
}