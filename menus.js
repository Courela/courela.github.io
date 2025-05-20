function menus(restaurantId, token) {
	var url = 'https://api.waiterio.com/api/v3/menus?restaurantId=' + restaurantId;
	$.ajax({
		type: "get",
		url: url,
		contentType: "application/json",
		headers: { "Authorization": "Token " + token },
		success: function (res) {
			console.log("Menus: " + JSON.stringify(res));
			
			var menus = parseMenus(res);
            window.menus = menus;
			// printMenus(menus);
            var categories = getCategories(menus);
            printCategories(categories);

		}
	});
}

function parseMenus(data) {
	var menus = [];
	var categories = data[0].categories;
	for (var i = 0; i < categories.length; i++) {
		var category = categories[i];
		var catId = category.id;
		var catName = category.name;
		
		// console.log("Category to parse: " + catName);
		
		for (var j = 0; j < category.items.length; j++) {
			var item = category.items[j];
			// console.log("Item in menu: " + item);
			var id = item.id;
			var name = item.name;
			
			menus.push({ "category": catName, "itemId": id, "name": name });
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

function printCategories(categories) {
    if (categories) {
        var settings = $('#divCategories');

        var keys = Object.keys(categories);
		// console.log("Category keys: " + keys);
		for (var i = 0; i < keys.length; i++) {
			var category = keys[i];
		    var checkBox = $('<input type="checkbox" value="' + category + '" title="' + category +'" placeholder="" />');
            checkBox.change(function () {
                $('#chkAllCategories').prop('checked', false);
                recalculateDashboard();
            });
            settings.append('<span>' + category + '</span>', checkBox);
        }
    }
}