async function menus(restaurantId, token) {
	var url = 'https://api.waiterio.com/api/v3/menus?restaurantId=' + restaurantId;
	try {
		var res = await $.ajax({
			type: "get",
			url: url,
			contentType: "application/json",
			headers: { "Authorization": "Token " + token }
		});
		
		var menus = parseMenus(res);
		window.menus = menus;
		// printMenus(menus);
		var categories = getCategories(menus);
		printCategories(categories, window.descriptionSplit);
	} catch (err) {
		console.log(err);
	}
}

function parseMenus(data) {
	var menus = [];
	var categories = data[0].categories;
	for (var i = 0; i < categories.length; i++) {
		var category = categories[i];
		// var catId = category.id;
		var catName = category.name;
		
		// console.log("Category to parse: " + catName);
		
		for (var j = 0; j < category.items.length; j++) {
			var item = category.items[j];
			// console.log("Item in menu: " + item);
			var id = item.id;
			var name = item.name;
			var description = item.description;
			
			menus.push({ "category": catName, "itemId": id, "name": name, "description": description });
		}
	}
	
	// console.log("Menus parsed: " + JSON.stringify(menus));
	return menus;
}

function printMenus(menus) {
	var domMenus = $("#menus");
	var table = $('<table></table>');
	var header = $("<tr><th>Categoria</th><th>Item</th></tr>");
	table.append(header);
	for (var i = 0; i < menus.length; i++) {
		var row = $("<tr></tr>");
		row.append('<td>' + menus[i].category + "</td>");
		row.append('<td>' + menus[i].name + "</td>");
		
		table.append(row);
	}
	
	// console.log("Table menus: " + JSON.stringify(table));
	domMenus.append(table);
}

function getCategories(menus) {
    return menus.reduce((acc, menu) =>{
        var key = menu.category;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(menu);
        return acc;
    }, {});
}

function getItemDescription(itemId) {
	var menus = window.menus;
	var item = menus.find(m => m.itemId === itemId);
	return item && item.description ? item.description : window.nullDescription;
}

function printCategories(categories, descriptionSplit) {
    if (categories) {
        var settings = $('#divCategories');

        var keys = Object.keys(categories);
		// console.log("Category keys: " + keys);
		for (var i = 0; i < keys.length; i++) {
			var category = keys[i];
			var opt = $('<div class="option"></div>');
			var checkBox = $('<input type="checkbox" value="' + category + '" title="' + category +'" placeholder="" />');
			checkBox.change(function () {
				$('#chkAllCategories').prop('checked', false);
				var self = $(this);
				var inputs = self.parent().find('div input');
				inputs.prop('checked', false);
				recalculateDashboard();
			});
			opt.append('<span>' + category + '</span>', checkBox);

			if (descriptionSplit) {
				var items = categories[category];
				printSubCategories(items, opt);
			}

			settings.append(opt);
        }
    }
}

function printSubCategories(items, opt) {
	var subOpt = $('<div class="sub-options"></div>');
	var descriptions = items.reduce((acc, item) => {
		var key = item.description && item.description !== 'null' ? item.description : "Geral";
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(item);
		return acc;
	}, {});

	var descrKeys = Object.keys(descriptions);
	if (descrKeys && descrKeys.length > 1) {
		var addedDescr = [];
		for (var j = 0; j < descrKeys.length; j++) {
			var descr = descrKeys[j];
			if (addedDescr.indexOf(descr) === -1) {
				var subCheckBox = $('<input type="checkbox" value="' + descr + '" title="' + descr +'" placeholder="" />');
				subCheckBox.change(function () {
					$('#chkAllCategories').prop('checked', false);
					var self = $(this);
					var directParent = self.parent();
					var upperParent = directParent.parent();
					// var catInput = $(upperParent).find('input');
					// catInput.prop('checked', self.prop('checked').val());
					var input = upperParent.children().filter('input');
					input.prop('checked', self.prop('checked'));
					recalculateDashboard();
				});
				subOpt.append('<span>' + descr + '</span>', subCheckBox);
			}

			opt.append(subOpt);
		}
	}
}

function printStatuses(statuses) {
    if (statuses && statuses.length > 0) {
        var settings = $('#divStatuses');

        // console.log("Statuses: " + JSON.stringify(statuses));
		for (var i = 0; i < statuses.length; i++) {
			var status = statuses[i];
			var opt = $('<div class="option"></div>');
		    var checkBox = $('<input type="checkbox" value="' + status + '" title="' + status +'" placeholder="" />');
            checkBox.change(function () {
                $('#chkAllStatuses').prop('checked', false);
                recalculateDashboard();
            });
			opt.append('<span>' + status + '</span>', checkBox);
            settings.append(opt);
        }
    }
}

function bindSettingsEvents() {
	$('#chkAllCategories').change(function () {
		const categories = $('#divCategories input[type="checkbox"]:checked');
		categories.each(function () {
			var checkBox = $(this);
			if (checkBox.val() !== 'all') {
				checkBox.prop('checked', false);
			}
		});

		var meals = window.meals;
		var mealRequests = parseMeals(meals);
		var groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
		recalculateDashboard(groupByStatuses);
	});

	$('#chkAllStatuses').change(function () {
		const statuses = $('#divStatuses input[type="checkbox"]:checked');
		statuses.each(function () {
			var checkBox = $(this);
			if (checkBox.val() !== 'all') {
				checkBox.prop('checked', false);
			}
		});

		var meals = window.meals;
		var mealRequests = parseMeals(meals);
		var groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
		recalculateDashboard(groupByStatuses);
	});
}