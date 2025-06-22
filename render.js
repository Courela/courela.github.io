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

    if (!window.showOrders) {
        if (!window.showTables) {
            printByDish(domDishes);
        }

        if (window.showTables) {
            // printByTable(domDishes, mealRequests);
            printByTableOrdered(domDishes, mealRequests);
        }
    } else {
        printByOrders(domDishes, mealRequests);
    }
}

function printByDish(domDishes) {
    let menus = window.menus;
    for (let x = 0; x < menus.length; x++) {
        const categoryItem = menus[x];
        if (inSelectedAllCategories() || (isSelectedCategory(categoryItem.category) && isSelectedDescription(categoryItem.category, categoryItem.description))) {
            let div = $('<div id="cell-' + categoryItem.itemId + '" class="board-cell"></div>');
            let nrDishes = 0;
            let status = '--';
            if (categoryItem.dishes.length > 0) {
                for (let y = 0; y < categoryItem.dishes.length; y++) {
                    const dish = categoryItem.dishes[y];
                    if (isSelected(dish) && isShowTable(dish.table)) {
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
            if (categoryItem.available || nrDishes > 0) {
                div.append('<span class="top-left tiny">'+status+'</span>');
                div.append('<span>'+ categoryItem.name +'</span><br />');
                div.append('<span class="alignBottom">'+ nrDishes.toString() +'</span>');
                domDishes.append(div);
            }
        }
    }
}

function isShowTable(table) {
    let result = false;
    try {
        result = table && parseInt(table) < window.showTableThreshold;
    } catch(err) {
        console.error(err);
    }
    return result;
}

function printByTableOrdered(domDishes, mealRequests) {
    if (mealRequests) {
        let dishes = mealRequests.reduce((acc, dish) => {
            if (isSelected(dish)) {
                const key = dish.itemName;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key] = insertOrdered(acc[key], dish);
            }
            return acc;
        }, {});

        printCellsOrdered(dishes, '', domDishes);
    } else {
        let div = $('<div class="dynamic">Sem refeições</div>');
        domDishes.append(div);
    }
}

function insertOrdered(arr, dish) {
  const index = arr.findIndex((arrDish) => arrDish.createdAt > dish.createdAt);
  if (index === -1) {
    arr.push(dish); // Add to the end if no larger element is found
  } else {
    arr.splice(index, 0, dish); // Insert at the correct position
  }
  return arr;
}

function printCellsOrdered(dishes,status, domDishes) {
    // console.log("Dishes: " + JSON.stringify(dishes));
    let dishNames = Object.keys(dishes);
    for (let j = 0; j < dishNames.length; j ++) {
        let div = $('<div class="board-cell"></div>');
        div.append('<span class="top-left tiny">'+status+'</span>');
        div.append('<span>'+ dishNames[j] +'</span><br /><span>'+ dishes[dishNames[j]].length +'</span>');
        if (window.showTables) {
            let tables =  dishes[dishNames[j]];
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

function printByOrders(domDishes, mealRequests) {
    let groupByTables = groupByTable(mealRequests);
    let tables = Object.keys(groupByTables);
    for (let i = 0; i < tables.length; i++) {
        let table = tables[i];
        const items = groupByTables[table];
        let showTable = false;
        for (let j = 0; j < items.length; j++) {
            if (isSelected(items[j])) {
                showTable = true;
            }
        }
        if (showTable) {
            let domTable = $('<p></p>');
            let domTableLink = $('<a href="#">'+ table +'</a>');
            domTableLink.on('click', (evt) => onTableClick(evt, items));
            domTable.append(domTableLink);
            domDishes.append(domTable);
        }
    }
}

async function onTableClick (evt, items) {
    let tbl = evt.currentTarget.childNodes[0].data;
    let req = { "table": tbl, "items": [] };
    for (let j = 0; j < items.length; j++) {
        if (isSelected(items[j])) {
            let item = req.items.find(it => it.name === items[j].itemName);
            if (item) {
                item.quantity++; 
            } else {
                req.items.push({ 
                    "quantity": 1, 
                    "name": items[j].itemName, 
                    "orderId": items[j].orderId, 
                    "productId": items[j].productId
                });
            }
        }
    }
    if (req.items.length === 0) {
        alert('Nada para imprimir.');
        return;
    }
    let ok = confirm('Imprimir categorias seleccionadas para a mesa ' + tbl + '? ' );
    if (ok) {
        let orderId = req.items[0].orderId;
        let order = await getOrder(orderId);
        if (!window.printOnly) {
            let updated = await markCategoriesAsServed(order);
            if (!updated) {
                alert('Ocorreu um erro! Verifique os logs.');
                return;
            }
            await refreshAuth();
        }
        if (window.printServerURL) {
            sendItemsToPrinter(req);
        }
    }
}