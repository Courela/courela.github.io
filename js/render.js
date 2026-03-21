function renderMeals(toPrepareMeals) {
	let domMeals = $("#meals");
	let table = $('<table></table>');
	let header = $("<tr><th>Mesa</th><th>Estado</th><th>Item</th></tr>");
	table.append(header);
	for (let i = 0; i < toPrepareMeals.length; i++) {
        let meal = buildHtmlOrder(toPrepareMeals[i]);
		table.append(meal);
	}
	
	domMeals.append(table);
}

function renderDashboard(mealRequests) {
	let domDishes = $("#dishes");
    domDishes.html('');

    if (!window.showOrders) {
        if (!window.showTables) {
            renderByDish(domDishes, mealRequests);
        }

        if (window.showTables) {
            renderByTableOrdered(domDishes, mealRequests);
        }
    } else {
        renderByOrders(domDishes, mealRequests);
    }
}

function renderByDish(domDishes, mealRequests) {
    let menus = getRawMenus();
    mealRequests.forEach(meal => {
        let categoryItem = menus.find(m => m.itemId === meal.productId);
        if (categoryItem) {
            if (!categoryItem.dishes) {
                categoryItem.dishes = [];
            }
            categoryItem.dishes.push(meal);
        }
    });
    
    let allCategories = inSelectedAllCategories();
    for (let x = 0; x < menus.length; x++) {
        const categoryItem = menus[x];
        if (allCategories || (isSelectedCategory(categoryItem.category) && isSelectedDescription(categoryItem.category, categoryItem.description))) {
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
            }
            if (categoryItem.available || nrDishes > 0) {
                let div = buildHtmlDish(categoryItem, nrDishes, nrDishes > window.dishWarningThreshold);
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

function renderByTableOrdered(domDishes, mealRequests) {
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

        renderCellsOrdered(dishes, '', domDishes);
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

function renderCellsOrdered(dishes,status, domDishes) {
    // console.log("Dishes: " + JSON.stringify(dishes));
    let dishNames = Object.keys(dishes);
    for (let j = 0; j < dishNames.length; j ++) {
        let tables =  dishes[dishNames[j]];
        let div = $(buildHtmlItemCell(dishNames[j], tables.length, status));
        if (window.showTables) {
            if (tables) {
                for (let l = 0; l < tables.length; l++) {
                    let identifiers = buildHtmlHiddenIdentifiers(tables[l]);
                    //if (status[statusKeys[idx]] === 'ORDERED') {
                        let link = $('<a href="#">' + tables[l].table + '</a>');
                        let createdDom = $('<span class="time">' + toDateTime(tables[l].createdAt, window.showFullDate) + '</span>');
                        link.on('click', (evt) => {
                            let tbl = evt.currentTarget.childNodes[0].data;
                            let ok = confirm('Marcar prato "' + dishNames[j] + '" para a mesa "' + tbl + '" como servido?');
                            if (ok) {
                                markAsServed(evt);
                            }
                        });
                        div.append('<br />', identifiers, link, createdDom);
                    // } else {
                    //     div.append(orderId, itemId);
                    // }
                }
            }
        }
        domDishes.append(div);
    }
}

function renderByOrders(domDishes, mealRequests) {
    let groupByTables = groupByTable(mealRequests);
    let tables = Object.keys(groupByTables);
    for (let i = 0; i < tables.length; i++) {
        let table = tables[i];
        const items = groupByTables[table];
        let showTable = false;
        let selectedItems = [];
        for (let j = 0; j < items.length; j++) {
            if (isSelected(items[j])) {
                showTable = true;
                selectedItems.push(items[j]);
            }
        }
        if (showTable) {
            let domTable = buildTable(table, selectedItems);
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
    let ok = confirm('Marcar items das categorias seleccionadas, para a mesa ' + tbl + ', como servidos? ' );
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

function isSelected(dish) {
	let inAllCategories = inSelectedAllCategories();

	let inCategory = inAllCategories || inSelectedCategory(dish);
	let inDescription = inAllCategories || inSelectedDescription(dish, inCategory);
	let inStatus = inSelectedStatus(dish);

	return inCategory && inDescription && inStatus;
}

function inSelectedAllCategories() {
	const categories = $('#divCategories input[type="checkbox"]:checked');
	const allChecked = categories.length === 1 && categories.val() === 'all';
	return allChecked;
}

function isSelectedCategory(category) {
	let result = false;
	
	const categories = $('#divCategories input[type="checkbox"]:checked');
	let found = categories.filter('[value="'+category+'"]');
	result = found && found.length > 0;

	return result;
}

function isSelectedDescription(itemCategory, itemDescription) {
	let result = false;

	let categories = $('#divCategories > .option');
	let span = categories.children().filter('span:contains('+ itemCategory +')');
	let category = span.parent();
	const subOptions = category.children().filter('.sub-options');
	const subCategories = subOptions.children().filter('input[type="checkbox"]:checked');
	if (subCategories.length > 0) {
		subCategories.each(function () {
			const subCat = $(this).val();
			if (itemDescription == subCat) {
				result = true;
			};
		});
	} else {
		result = true;
	}

	return result;
}

function inSelectedCategory(dish) {
	let result = false;
	
	const productId = dish.productId;
	let menus = getRawMenus();
	
	const categories = $('#divCategories input[type="checkbox"]:checked');
	categories.each(function () {
		const category = $(this).val();
		if (menus.find(m => m.category === category && m.itemId === productId)) {
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

	let result = false;
	
	statuses.each(function () {
		const status = $(this).val();
		if (dish.status == status) {
			result = true;
		};
	});

	return result;
}

function inSelectedDescription(dish, inCategory) {
	let result = false;
	if (!inCategory) {
		return result;
	}

	let menus = getRawMenus();
	const productId = dish.productId;
	let menu =  menus.find(m => m.itemId === productId);

	let categories = $('#divCategories > .option');
	let span = categories.children().filter('span:contains('+ menu.category +')');
	let category = span.parent();
	const subOptions = category.children().filter('.sub-options');
	const subCategories = subOptions.children().filter('input[type="checkbox"]:checked');
	if (subCategories.length > 0) {
		subCategories.each(function () {
			const subCat = $(this).val();
			if (dish.itemDescription == subCat) {
				result = true;
			};
		});
	} else {
		result = true;
	}

	return result;
}

function buildHtmlOrder(order) {
    let template =
        '<tr>'+
            '<td><%= order.table %></td>'+
            '<td><%= order.status %></td>'+
            '<td><%= order.itemName %></td>'+
            '<td><%= order.description %></td>'+
        '</tr>';
    return ejs.render(template, { order: order });
}

function buildHtmlDish(categoryItem, nrDishes, isWarning) {
    let template =
        '<div id="cell-<%= categoryItem.itemId %>" class="board-cell flashing <% isWarning ? "warning" : "" %>">'+
            '<span class="top-left tiny"><%= categoryItem.status %></span><span><%= categoryItem.name %></span><br />'+
            '<span class="alignBottom"><%= nrDishes %></span>'+
        '</div>';
    return ejs.render(template, { categoryItem: categoryItem, nrDishes: nrDishes.toString(), isWarning: isWarning });
}

function buildHtmlItemCell(dishName, count, status) {
    let template =
        '<div class="board-cell flashing">' +
            '<span class="top-left tiny"><%= status %></span><span><%= dishName %></span><br />' +
            '<span><%= count %></span>' +
        '</div>';
    return ejs.render(template, { dishName: dishName, count: count.toString(), status: status });
}

function buildHtmlHiddenIdentifiers(table){
    let template =
        '<input name="<%= table.table %>_orderId" type="hidden" value="<%= table.orderId %>"></input>'+
        '<input name="<%= table.table %>_itemId" type="hidden" value="<%= table.itemId %>"></input>';
    return ejs.render(template, { table: table });    
}

function buildTable(table, items) {
    let domTable = $('<p class="box flashing"></p>');
    let domTableLink = $('<a href="#">'+ table +'</a><br/>');
    domTable.append(domTableLink);
    for (let j = 0; j < items.length; j++) {
        const item = items[j];
        let domTime = toDateTime(item.createdAt, window.showFullDate);
        domTable.append($('<div>' + item.itemName + ' ' + domTime + '</div>'));
    }
    domTableLink.on('click', (evt) => onTableClick(evt, items));
    return domTable;
}