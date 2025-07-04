function parseMenus(data) {
	let menus = [];
	let categories = data[0].categories;
	for (let i = 0; i < categories.length; i++) {
		let category = categories[i];
		let catName = category.name;
		
		for (let j = 0; j < category.items.length; j++) {
			let item = category.items[j];
			let id = item.id;
			let name = item.name;
			let available = item.available;
			let description = item.description;
			
			menus.push({
				"category": catName,
				"itemId": id,
				"name": name,
				"available": available,
				"description": description,
				"dishes": []
			});
		}
	}
	
	return menus;
}

function renderMenus(menus) {
	let domMenus = $("#menus");
	domMenus.html('');

	let table = $('<table></table>');
	let header = $("<tr><th>Categoria</th><th>Item</th></tr>");
	table.append(header);
	for (let i = 0; i < menus.length; i++) {
		let row = $("<tr></tr>");
		row.append('<td>' + menus[i].category + "</td>");
		row.append('<td>' + menus[i].name + "</td>");
		
		table.append(row);
	}
	
	domMenus.append(table);
}

function getCategories(menus) {
    return menus.reduce((acc, menu) =>{
        let key = menu.category;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(menu);
        return acc;
    }, {});
}

function getItemDescription(itemId) {
	let menus = window.menus;
	let item = menus.find(m => m.itemId === itemId);
	return item && item.description ? item.description : window.nullDescription;
}

function renderCategories(categories, descriptionSplit) {
    if (categories) {
        let settings = $('#divCategories');

        let keys = Object.keys(categories);
		for (let i = 0; i < keys.length; i++) {
			let category = keys[i];
			let opt = $('<div class="option"></div>');
			let checkBox = $('<input type="checkbox" value="' + category + '" title="' + category +'" placeholder="" />');
			checkBox.change(function () {
				$('#chkAllCategories').prop('checked', false);
				let self = $(this);
				let inputs = self.parent().find('div input');
				inputs.prop('checked', false);
				recalculateDashboard();
			});
			opt.append('<span>' + category + '</span>', checkBox);

			if (descriptionSplit) {
				let items = categories[category];
				renderSubCategories(items, opt);
			}

			settings.append(opt);
        }
    }
}

function renderSubCategories(items, opt) {
	let subOpt = $('<div class="sub-options"></div>');
	let descriptions = items.reduce((acc, item) => {
		let key = item.description && item.description !== 'null' ? item.description : "Geral";
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(item);
		return acc;
	}, {});

	let descrKeys = Object.keys(descriptions);
	if (descrKeys && descrKeys.length > 1) {
		let addedDescr = [];
		for (let j = 0; j < descrKeys.length; j++) {
			let descr = descrKeys[j];
			if (addedDescr.indexOf(descr) === -1) {
				let subCheckBox = $('<input type="checkbox" value="' + descr + '" title="' + descr +'" placeholder="" />');
				subCheckBox.change(function () {
					$('#chkAllCategories').prop('checked', false);
					let self = $(this);
					let directParent = self.parent();
					let upperParent = directParent.parent();
					let input = upperParent.children().filter('input');
					input.prop('checked', self.prop('checked'));
					recalculateDashboard();
				});
				subOpt.append('<span>' + descr + '</span>', subCheckBox);
			}

			opt.append(subOpt);
		}
	}
}

function renderStatuses(statuses) {
    if (statuses && statuses.length > 0) {
        let settings = $('#divStatuses');

		for (let i = 0; i < statuses.length; i++) {
			let status = statuses[i];
			let opt = $('<div class="option"></div>');
		    let checkBox = $('<input type="checkbox" value="' + status + '" title="' + status +'" placeholder="" />');
            checkBox.change(function () {
                $('#chkAllStatuses').prop('checked', false);
                recalculateDashboard();
            });
			opt.append('<span>' + status + '</span>', checkBox);
            settings.append(opt);
        }
    }
}

async function onRefreshMenu() {
	let domCategories = $("#divCategories .option");
    domCategories.remove();

	let restaurantId = sessionStorage.getItem("restaurantId");
	let menus = await getMenus(restaurantId);
	let categories = getCategories(menus);
	renderCategories(categories, window.descriptionSplit);

	refreshAuth();
}