const tablePrefix = 'table_';

async function parseMeals(data) {
    console.log('Start parsing meals at ' + new Date().toISOString() + ': ' + data.length);
	let toPrepareMeals = [];

    resetMenuDishes();
    let menus = window.appMenus;

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
            let filterDate = Date.now() - window.filterMealsOlderThan * 60 * 1000;
            // console.log("item: " + item.item.name + ", created: " + created + ", typeof created: " + typeof created + ", filterDate: " + filterDate + ", typeof filterDate: " + typeof filterDate);
            if (created < filterDate) {
                // console.log("item: " + item.item.name + " is older than filterDate, skipping...");
                continue;
            }
			let productId = item.item.id;
            let itemName = item.item.name;
			let description = await getItemDescription(productId);
			
            let dish = {
                "orderId": orderId,
                "table": table,
                "itemId": id,
                "productId": productId,
                "createdAt": created,
                "status": status,
                "itemName": itemName,
                "itemDescription": description
            };
            let categoryItem = menus.find(m => m.itemId === productId);
            if (categoryItem) {
                categoryItem.dishes.push(dish);
            }

			toPrepareMeals.push(dish);
		}
	}
    console.log('Finished parsing meals at ' + new Date().toISOString() + ': ' + toPrepareMeals.length);
	
	return toPrepareMeals;
}

function resetMenuDishes() {
    let menus = window.appMenus;
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

        const descr = 
            meal.itemDescription && meal.itemDescription != 'null' ?
                meal.itemDescription :
                window.nullDescription;
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

function groupByTable(orders) {
	return orders.reduce((acc, order) => {
		const key = tablePrefix + order.table;
		if (!acc[key]) {
			acc[key] = [];
		}
        acc[key].push(order);
        return acc;
	}, {});
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
        if (await updateOrder(orderId, order)) {
            if (window.printServerURL) {
                let item = order.itemstamps[itemId].item;
                await sendToPrinter(table, 1, item.name);
            }
            await refreshAuth();
        };
    } else {
        showModal('Pedido não encontrado!', 3000);
        console.error('Not found: ' + itemId);
    };
}

async function markCategoriesAsServed(order) {
    const categories = $('#divCategories input[type="checkbox"]:checked');
    categories.each(function () {
        const category = $(this).val();
        let selectedItems = window.appMenus.filter(m => m.category === category);
        let keys = Object.keys(order.itemstamps);
        for (let i = 0; i < keys.length; i++) {
            const requestedItem = order.itemstamps[keys[i]];
            let selectedItem = selectedItems.filter(m => m.itemId === requestedItem.item.id);
            if (selectedItem && selectedItem.length > 0) {
                requestedItem.status = window.markedAsStatus;
                let now = Date.now();
                order.lastEditTime = now;
                requestedItem.lastEditTime = now;
            }
        }
    });

    return updateOrder(order._id, order);
}