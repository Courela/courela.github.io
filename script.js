function isSelected(dish) {
	var inAllCategories = inSelectedAllCategories();

	var inCategory = inAllCategories || inSelectedCategory(dish);
	var inDescription = inAllCategories || inSelectedDescription(dish, inCategory);
	var inStatus = inSelectedStatus(dish);

	return inCategory && inDescription && inStatus;
}

function inSelectedAllCategories() {
	const categories = $('#divCategories input[type="checkbox"]:checked');
	const allChecked = categories.length === 1 && categories.val() === 'all';
	return allChecked;
}

function inSelectedCategory(dish) {
	var result = false;
	
	const productId = dish.productId;
	var menus = window.menus;
	
	const categories = $('#divCategories input[type="checkbox"]:checked');
	categories.each(function () {
		const category = $(this).val();
		if (menus.find(m => m.category === category && m.itemId === productId)) {
			console.log("Selected category: " + category);
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

	var result = false;
	
	statuses.each(function () {
		const status = $(this).val();
		if (dish.status == status) {
			console.log("Selected status: " + status);
			result = true;
		};
	});

	return result;
}

function inSelectedDescription(dish, inCategory) {
	var result = false;
	if (!inCategory) {
		return result;
	}

	const subCategories = $('#divCategories .sub-options input[type="checkbox"]:checked');
	if (subCategories.length > 0) {
		subCategories.each(function () {
			const subCat = $(this).val();
			if (dish.itemDescription == subCat) {
				console.log("Selected sub-category: " + subCat);
				result = true;
			};
		});
	} else {
		result = true;
	}

	return result;
}

async function print(restaurantId, token) {
	await menus(restaurantId, token);
	await meals(restaurantId, token);
}

function displayAll(show) {
	if (show) {
		$('#credentials').hide();
		// $('#menusContent').show();
		// $('#mealsContent').show();
		$('#settings').show();
		$('#dashboard').show();
	} else {
		$('#credentials').show();
		// $('#menusContent').hide();
		// $('#mealsContent').hide();
		$('#settings').hide();
		$('#dashboard').hide();
	}
}

function recalculateDashboard() {
	console.log('Refreshing dashboard...');
	$('#dishes').empty();
	var meals = window.meals;
	var mealRequests = parseMeals(meals);
	var groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
	printDashboard(groupByStatuses);
	console.log('Done refreshing dashboard.');
}

function bindRefresh() {
	window.intervalId = setInterval(() => {
		recalculateDashboard();
	}, window.refeshPeriod);
}

function bindSettings() {
	bindSettingsEvents();
	bindRefresh();
}

function setSettings() {
	window.descriptionSplit = true;
	window.nullDescription = 'Geral';
	window.showStatuses = ["ORDERED", "COOKING", "READY", "SERVED", "CANCELLED" ];
	window.refeshPeriod = 3600000;
}

async function startup() {
	setSettings();
	printStatuses(window.showStatuses);

	var restaurantId = sessionStorage.getItem("restaurantId");
	var token = sessionStorage.getItem("token");
	var expire = Number(sessionStorage.getItem("expire"));
	
	if (restaurantId && token && Date.now() < expire) {
		console.log("Session authentication used");
		if (window.location.href.indexOf("index.html") === -1) {
			displayAll(true);
			await print(restaurantId, token);
		} else {
			window.location.href = "kitchen.html";
		}
	}
	
	$('#login').click(login);

	bindSettings();
}
