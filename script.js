function isSelected(dish) {
	return (inSelectedCategory(dish) || inSelectedDescription(dish)) && inSelectedStatus(dish);
}

function inSelectedCategory(dish) {
	const categories = $('#divCategories input[type="checkbox"]:checked');
	const allChecked = categories.length === 1 && categories.val() === 'all';
	if (allChecked) {
		return true;
	}

	var result = false;
	
	const productId = dish.productId;
	var menus = window.menus;
	
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

function inSelectedDescription(dish) {
	const subCategories = $('#divCategories .sub-options input[type="checkbox"]:checked');
	var result = false;
	
	subCategories.each(function () {
		const subCat = $(this).val();
		if (dish.itemDescription == subCat) {
			console.log("Selected sub-category: " + subCat);
			result = true;
		};
	});

	return result;
}

async function print(restaurantId, token) {
	await menus(restaurantId, token);
	meals(restaurantId, token);
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
	$('#dishes').empty();
	var groupByStatuses = groupByStatus(window.mealRequests, window.descriptionSplit);
	printDashboard(groupByStatuses);
}

async function startup() {
	setSettings();
	printStatuses(window.showStatuses);

	var restaurantId = sessionStorage.getItem("restaurantId");
	var token = sessionStorage.getItem("token");
	var expire = Number(sessionStorage.getItem("expire"));
	
	if (restaurantId && token && Date.now() < expire) {
		console.log("Session authentication used");
		displayAll(true);
		await print(restaurantId, token);
	}
	
	$('#login').click(login);

	bindSettingsEvents();
}

function setSettings() {
	window.descriptionSplit = true;
	window.nullDescription = 'Geral';
	window.showStatuses = ["ORDERED", "COOKING", "READY", "SERVED", "CANCELLED" ];
}
