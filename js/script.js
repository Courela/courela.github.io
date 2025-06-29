function bindSettingsEvents() {
	bindCheckBoxes();

	let refreshPeriod = window.refreshPeriod / 1000;
	$('#iptRefreshPeriod').val(refreshPeriod);
	$('#iptdishWarningThreshold').val(window.dishWarningThreshold);

	bindPrinterSettings();

	$('#btnApply').click(onApplyClick);

	$('#btnRefreshMenu').click(onRefreshMenu);

	$('#collapseSettings').on('click', evt => {
		let div = $(evt.currentTarget).parent();
		let collapseElements = div.children().filter('.collapse');
		collapseElements.toggle();
	});
}

function bindCheckBoxes() {
	$('#chkAllCategories').change(function () {
		const categories = $('#divCategories input[type="checkbox"]:checked');
		categories.each(function () {
			let checkBox = $(this);
			if (checkBox.val() !== 'all') {
				checkBox.prop('checked', false);
			}
		});

		let meals = window.meals;
		let mealRequests = parseMeals(meals);
		let groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
		recalculateDashboard(groupByStatuses);
	});

	$('#chkAllStatuses').change(function () {
		const statuses = $('#divStatuses input[type="checkbox"]:checked');
		statuses.each(function () {
			let checkBox = $(this);
			if (checkBox.val() !== 'all') {
				checkBox.prop('checked', false);
			}
		});

		let meals = window.meals;
		let mealRequests = parseMeals(meals);
		let groupByStatuses = groupByStatus(mealRequests, window.descriptionSplit);
		recalculateDashboard(groupByStatuses);
	});

	$('#chkPrintOnly').prop('checked', window.printOnly);
	$('#chkPrintOnly').change((evt) => {
		let checkBox = $(evt.target);
		let checkedStatus = checkBox.prop('checked');
		window.printOnly = checkedStatus;
	});
}

function bindPrinterSettings() {
	let printServerURL = $('#sltPrintServerURL');
	for (let i = 0; i < window.printServerURLOptions.length; i++) {
		const element = window.printServerURLOptions[i];
		printServerURL.append(new Option(element, element));
	}
	printServerURL.on('change', function() {
        $('#imgChanges').show();
    });

	let printerAddr = $('#sltPrinterAddr');
	for (let i = 0; i < window.printerAddrOptions.length; i++) {
		const element = window.printerAddrOptions[i];
		printerAddr.append(new Option(element, element));
	}
	printerAddr.on('change', function() {
        $('#imgChanges').show();
    });
}

function onApplyClick() {
	clearInterval(window.intervalId);
	clearInterval(window.timeIntervalId);
	
	let newDishWarningThreshold = $('#iptdishWarningThreshold').val();
	if (newDishWarningThreshold && newDishWarningThreshold > 0) {
		window.dishWarningThreshold = newDishWarningThreshold;
	}

	let newRefreshPeriod = $('#iptRefreshPeriod').val();
	window.refreshPeriod = parseInt(newRefreshPeriod) * 1000;

	let printServerURL = $('#sltPrintServerURL').val();
	if (printServerURL) {
		window.printServerURL = 'https://192.168.' + printServerURL;
	} else {
		window.printServerURL = '';
	}

	let printerAddr = $('#sltPrinterAddr').val();
	if (printerAddr) {
		window.printerAddr = '192.168.' + printerAddr;
	} else {
		window.printerAddr = '';
	}

	bindRefresh();

	$('#imgChanges').hide();

	refreshAuth();
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
	let menus = window.menus;
	
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

	let menus = window.menus;
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

async function print(restaurantId, showMenus) {
	if (showMenus) {
		await getMenus(restaurantId);
	}
	await getMeals(restaurantId);
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
	let meals = window.meals;
	let mealRequests = parseMeals(meals);
	printDashboard(mealRequests);
	console.log('Done refreshing dashboard.');
}

function bindRefresh() {
	window.intervalId = setInterval(async () => {
		refreshAuth();
		// recalculateDashboard();
	}, window.refreshPeriod);
	
	window.timeLeft = window.refreshPeriod / 1000;
	
	window.timeIntervalId = setInterval(() => {
		if (window.timeLeft <= 0) {
			window.timeLeft = window.refreshPeriod / 1000;
		}
		$('#timer').html(window.timeLeft);
		window.timeLeft--;
	}, 1000);
}

function bindSettings() {
	bindSettingsEvents();
	bindRefresh();
}

async function startup() {
	setSettings();
	printStatuses(window.showStatuses);

	await refreshAuth(true);

	bindSettings();

	$('#username').html(sessionStorage.getItem("username"));
}

async function refreshAuth(showMenus) {
	let restaurantId = sessionStorage.getItem("restaurantId");
	let expire = Number(sessionStorage.getItem("expire"));
	
	if (restaurantId && Date.now() < expire) {
		console.log("Session authentication used");
		if (window.location.href.indexOf("index.html") === -1) {
			displayAll(true);
			await print(restaurantId, showMenus);
		}
	} else {
		console.log('Not authenticated');
		if (window.location.href.indexOf("index.html") === -1) {
			window.location.href = "index.html";
		}
	}
}
