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

    resetMenuDishes();
    let menus = window.menus;

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
			if (item.paid) {
                continue;
            }
            let id = item.id;
			let status = item.status;
            let created = item.creationTime;
			let productId = item.item.id;
            let itemName = item.item.name;
			let description = getItemDescription(productId);
			
            let dish = { "orderId": orderId, "table": table, "itemId": id, "productId": productId, "createdAt": created,  "status": status, "itemName": itemName, "itemDescription": description };
            let categoryItem = menus.find(m => m.itemId === productId);
            if (categoryItem) {
                categoryItem.dishes.push(dish);
            }

			toPrepareMeals.push(dish);
		}
	}
	
	// console.log("To prepare: " + JSON.stringify(toPrepareMeals));
	return toPrepareMeals;
}

function resetMenuDishes() {
    let menus = window.menus;
    for (let z = 0; z < menus.length; z++) {
        const menu = menus[z];
        menu.dishes = [];
    }
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
    domDishes.html('');

    let menus = window.menus;
    for (let x = 0; x < menus.length; x++) {
        const categoryItem = menus[x];
        if (inSelectedAllCategories() || (isSelectedCategory(categoryItem.category) && isSelectedDescription(categoryItem.category, categoryItem.description))) {
            console.log('Found selected category: ', categoryItem.category);
            let div = $('<div id="cell-' + categoryItem.itemId + '" class="board-cell"></div>');
            let nrDishes = 0;
            if (categoryItem.dishes.length > 0) {
                for (let y = 0; y < categoryItem.dishes.length; y++) {
                    const dish = categoryItem.dishes[y];
                    if (isSelected(dish)) {
                        nrDishes++;
                    }
                }
            }
            div.append('<span>'+ categoryItem.name +'</span><br /><span>'+ nrDishes.toString() +'</span>');
            domDishes.append(div);
        }
    }

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

                if (window.showTables) {
                    printCells(k, dishes, status, statusKeys, domDishes);
                }
            }
		}
	} else {
		let div = $('<div class="dynamic">Sem refeições</div>');
		domDishes.append(div);
	}
	
	// console.log("Table meals: " + JSON.stringify(table));
}

function printCells(idx, dishes, status, statusKeys, domDishes) {
    // console.log("Dishes: " + JSON.stringify(dishes));
    let dishNames = Object.keys(dishes);
    for (let j = 0; j < dishNames.length; j ++) {
        let div = $('<div class="board-cell"></div>');
        div.append('<span>'+ dishNames[j] +'</span><br /><span>'+ dishes[dishNames[j]].toString() +'</span>');
        if (window.showTables) {
            let tables = getTablesForDish(dishNames[j], status[statusKeys[idx]]);
            if (tables) {
                for (let l = 0; l < tables.length; l++) {
                    let orderId = $('<input name="' + tables[l].table + '_orderId" type="hidden" value="' + tables[l].orderId + '"></input>')
                    let itemId = $('<input name="' + tables[l].table + '_itemId" type="hidden" value="' + tables[l].itemId + '"></input>')
                    let link = $('<a href="#">' + tables[l].table + '</a>');
                    let createdDom = $('<span style="font-size: 14px;">' + toDateTime(tables[l].createdAt) + '</span>');
                    link.on('click', evt => {
                        let ok = confirm('Marcar como servido?');
                        if (ok) {
                            markAsServed(evt);
                        }
                    });
                    div.append('<br />', orderId, itemId, link, createdDom);
                }
            }
        }
        domDishes.append(div);
    }
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
    let fullDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' +
    date.getFullYear();
    
    if (window.showFullDate) {
        return fullDate + ' ' + date.getHours() + ':' + date.getMinutes() + ':' +
            date.getSeconds();
    }
    return date.getHours() + ':' + date.getMinutes() + ':' +
        date.getSeconds();
}

async function markAsServed(evt) {
    let anchor = $($(evt)[0].target);
    let table = anchor.text();
    let ids = anchor.parent().find('input');
    let orderId = ids.filter('[name='+ table +'_orderId]').val();
    let itemId = ids.filter('[name='+ table +'_itemId]').val();

    let order = await getOrder(orderId);

    // let items = Object.keys(order.itemstamps);
    if (order && order.itemstamps[itemId]) {
        order.itemstamps[itemId].status = window.markedAsStatus;
        let now = Date.now();
        order.lastEditTime = now;
        order.itemstamps[itemId].lastEditTime = now;
    } else {
        alert('Não encontrado!');
        console.err('Not found: ' + itemId);
    };

    updateOrder(orderId, order);

    // let payload = '{"table":"'+table+'","restaurantId":"'+ restaurantId +'","usersIds":["'+sessionStorage.getItem("userId");+'"],"service":"TABLE","_id":"'+orderId+'","shortId":"CP3o","creationTime":1748898713029,"lastEditTime":'+Date.now()+',"itemstamps":{"fdcd66fe3cd328da6ea4d8be":{"id":"fdcd66fe3cd328da6ea4d8be","creationTime":1748898724212,"userId":"3e91b1b06e4744924069fc5c","status":"COOKING","item":{"id":"01dac1fc7243a00c1ed31440","name":"Queijo Seco","price":2.5},"lastEditTime":1748899093389,"course":0,"extras":[]},"63c96d8d747d1c79faf464b3":{"id":"63c96d8d747d1c79faf464b3","creationTime":1748898727043,"userId":"3e91b1b06e4744924069fc5c","status":"ORDERED","item":{"id":"b721fb8b5219d64bd5a4da1e","name":"Prego","price":3.5},"lastEditTime":1748898739325,"course":0,"extras":[]},"d090ad49127dedd32368887a":{"id":"d090ad49127dedd32368887a","creationTime":1748898729392,"userId":"3e91b1b06e4744924069fc5c","status":"ORDERED","item":{"id":"e61f2a8a124321bebb354b5f","name":"Favas com Entrecosto","price":0},"lastEditTime":1748898739325,"course":0,"extras":[]},"251c2ef958123d49c6a59fd1":{"id":"251c2ef958123d49c6a59fd1","creationTime":1748898732787,"userId":"3e91b1b06e4744924069fc5c","status":"ORDERED","item":{"id":"2adb864aa470396550a75af5","name":"Cheesecake","price":2},"lastEditTime":1748898739325,"course":0,"extras":[]}},"customers":1,"customersPaid":0}';
}

async function getOrder(orderId) {
    let url = 'https://api.waiterio.com/api/v3/meals/' + orderId;
    try {
        let token = sessionStorage.getItem("token");
        let res = await $.ajax({
            type: "get",
            url: url,
            contentType: "application/json",
            headers: {
                "Authorization": "Token " + token
            }
        });

        console.log('Order ' + orderId + ': ' + JSON.stringify(res));

        return res;
    } catch (err) {
        console.log(err);
    }

    return null;
}

async function updateOrder(orderId, order) {
    let url = 'https://api.waiterio.com/api/v3/meals/' + orderId;
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
    }
}