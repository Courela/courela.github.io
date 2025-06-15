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
		for (let j = 0; j < keys.length; j++) {
			let item = order.itemstamps[keys[j]];
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
	
	domMeals.append(table);
}

function printDashboard(mealRequests) {
	let domDishes = $("#dishes");
    domDishes.html('');

    if (!window.showTables) {
        printByDish(domDishes);
    }

    if (window.showTables) {
        printByTable(domDishes, mealRequests);
    }
}

function printByDish(domDishes) {
    let menus = window.menus;
    for (let x = 0; x < menus.length; x++) {
        const categoryItem = menus[x];
        if (inSelectedAllCategories() || (isSelectedCategory(categoryItem.category) && isSelectedDescription(categoryItem.category, categoryItem.description))) {
            console.log('Found selected category: ', categoryItem.category);
            let div = $('<div id="cell-' + categoryItem.itemId + '" class="board-cell"></div>');
            let nrDishes = 0;
            let status = '--';
            if (categoryItem.dishes.length > 0) {
                for (let y = 0; y < categoryItem.dishes.length; y++) {
                    const dish = categoryItem.dishes[y];
                    if (isSelected(dish)) {
                        nrDishes++;
                        if (status === '--') {
                            status = dish.status;
                        } else if (status !== 'MULTI' && status !== dish.status) {
                            status = 'MULTI';
                        }
                    }
                }
                if (nrDishes > window.dishWarningThreshold) {
                    div.addClass('warning');
                }
            }
            div.append('<span class="top-left tiny">'+status+'</span>');
            div.append('<span>'+ categoryItem.name +'</span><br />');
            div.append('<span class="alignBottom">'+ nrDishes.toString() +'</span>');
            domDishes.append(div);
        }
    }
}

function printByTableOrdered(domDishes) {
    /*let menus = window.menus;
    for (let x = 0; x < menus.length; x++) {
        const categoryItem = menus[x];
        if (inSelectedAllCategories() || (isSelectedCategory(categoryItem.category) && isSelectedDescription(categoryItem.category, categoryItem.description))) {
            console.log('Found selected category: ', categoryItem.category);
            let div = $('<div id="cell-' + categoryItem.itemId + '" class="board-cell"></div>');
            let nrDishes = 0;
            let status = '--';
            if (categoryItem.dishes.length > 0) {
                for (let y = 0; y < categoryItem.dishes.length; y++) {
                    const dish = categoryItem.dishes[y];
                    if (isSelected(dish)) {
                        nrDishes++;
                        if (status === '--') {
                            status = dish.status;
                        } else if (status !== 'MULTI' && status !== dish.status) {
                            status = 'MULTI';
                        }
                    }
                }
                if (nrDishes > window.dishWarningThreshold) {
                    div.addClass('warning');
                }
            }
            div.append('<span class="top-left tiny">'+status+'</span>');
            div.append('<span>'+ categoryItem.name +'</span><br />');
            div.append('<span class="alignBottom">'+ nrDishes.toString() +'</span>');
            domDishes.append(div);
        }
    }*/
}

function printByTable(domDishes, mealRequests){
    let groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
    if (groupByStatuses) {
        let statuses = Object.keys(groupByStatuses);
        for (let i = 0; i < statuses.length; i++) {
            let statusDishList = groupByStatuses[statuses[i]];
            let statusKeys = Object.keys(statusDishList);
            for (let keyIndex = 0; keyIndex < statusKeys.length; keyIndex++) {
                let dishes = statusDishList[statusKeys[keyIndex]].reduce((acc, dish) => {
                    if (isSelected(dish)) {
                        const key = dish.itemName;
                        if (!acc[key]) {
                            acc[key] = 0;
                        }
                        acc[key] = acc[key] + 1;
                    }
                    return acc;
                }, {});

                printCells(keyIndex, dishes, statusDishList, statusKeys, statuses[i], domDishes);
            }
        }
    } else {
        let div = $('<div class="dynamic">Sem refeições</div>');
        domDishes.append(div);
    }
}

function printCells(idx, dishes, statusDishList, statusKeys, status, domDishes) {
    // console.log("Dishes: " + JSON.stringify(dishes));
    let dishNames = Object.keys(dishes);
    for (let j = 0; j < dishNames.length; j ++) {
        let div = $('<div class="board-cell"></div>');
        div.append('<span class="top-left tiny">'+status+'</span>');
        div.append('<span>'+ dishNames[j] +'</span><br /><span>'+ dishes[dishNames[j]].toString() +'</span>');
        if (window.showTables) {
            let tables = getTablesForDish(dishNames[j], statusDishList[statusKeys[idx]]);
            if (tables) {
                for (let l = 0; l < tables.length; l++) {
                    let orderId = $('<input name="' + tables[l].table + '_orderId" type="hidden" value="' + tables[l].orderId + '"></input>')
                    let itemId = $('<input name="' + tables[l].table + '_itemId" type="hidden" value="' + tables[l].itemId + '"></input>')
                    //if (status[statusKeys[idx]] === 'ORDERED') {
                        let link = $('<a href="#">' + tables[l].table + '</a>');
                        let createdDom = $('<span class="time">' + toDateTime(tables[l].createdAt) + '</span>');
                        link.on('click', (evt) => {
                            let tbl = evt.currentTarget.childNodes[0].data;
                            let ok = confirm('Marcar prato "' + dishNames[j] + '" para a mesa "' + tbl + '" como servido?');
                            if (ok) {
                                markAsServed(evt);
                            }
                        });
                        div.append('<br />', orderId, itemId, link, createdDom);
                    // } else {
                    //     div.append(orderId, itemId);
                    // }
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
    if (window.showFullDate) {
        let fullDate = date.getDate() + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
            date.getFullYear();
        return fullDate + ' ' + date.getHours() + ':' + date.getMinutes() + ':' +
            date.getSeconds();
    }
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0') + ':' +
        date.getSeconds();
}

async function markAsServed(evt) {
    let anchor = $($(evt)[0].target);
    let table = anchor.text();
    let ids = anchor.parent().find('input');
    let orderId = ids.filter('[name='+ table +'_orderId]').val();
    let itemId = ids.filter('[name='+ table +'_itemId]').val();

    let order = await getOrder(orderId);

    if (order && order.itemstamps[itemId]) {
        order.itemstamps[itemId].status = window.markedAsStatus;
        let now = Date.now();
        order.lastEditTime = now;
        order.itemstamps[itemId].lastEditTime = now;
        if (!updateOrder(orderId, order)) {
            alert('Ocorreu um erro! Verifique os logs.');
        } else {
            if (window.printerURL) {
                let item = order.itemstamps[itemId].item;
                await sendToPrinter(table, 1, item.name);
                await refreshAuth();
            }
        };
    } else {
        alert('Não encontrado!');
        console.err('Not found: ' + itemId);
    };
}
