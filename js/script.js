async function startup() {
	setSettings();
	searchPrinterServer();
	renderStatuses(window.showStatuses);
	
	await refreshAuth(true);
	
	bindSettings();
	
	$('#username').html(sessionStorage.getItem("username"));
}

function bindSettings() {
	bindSettingsEvents();
	bindRefresh();
}

function bindSettingsEvents() {
	bindCheckBoxes();

	let refreshPeriod = window.refreshPeriod / 1000;
	$('#iptRefreshPeriod').val(refreshPeriod);
	$('#iptIPRange').val(window.localIP);
	$('#iptdishWarningThreshold').val(window.dishWarningThreshold);
	
	// bindColumns();

	bindFontSize();

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

function bindColumns() {
	// TODO absolute value instead of pixels
	let columns = $(".board-cell").css("width");
	$('#iptCols').val(parseInt(columns));
	$('#iptCols').change(function () {
		let newCols = $('#iptCols').val();
		if (newCols && newCols > 0) {
			$(".board-cell").css("width", newCols + "px");
		}
	});
}

function bindFontSize() {
	let currentFontSize = $(".board-cell span").css("font-size");
	$('#iptFontSize').val(parseInt(currentFontSize));
	$('#iptFontSize').change(function (evt) {
		let newFontSize = evt.target.value;
		if (newFontSize && newFontSize > 0) {
			let boardCells = $(".board-cell");
			let spanElements = boardCells.find("span");
			let previousFontSize = spanElements.first().css("font-size");
			spanElements.css("font-size", newFontSize + "px");
			// if (newFontSize % 2 === 0) {
			// 	let diff = parseInt(newFontSize) > parseInt(previousFontSize) ? 10 : -10;
			// 	let minHeight = parseInt(boardCells.css("min-height"));
			// 	boardCells.css("min-height", minHeight + diff.toString() + "px");
			// }
		}
	});
}

function bindPrinterSettings() {
	let printServerURL = $('#sltPrintServerURL');
	for (let i = 0; i < window.printServerURLOptions.length; i++) {
		const label = window.printServerURLOptions[i].label;
		const val = window.printServerURLOptions[i].value;
		printServerURL.append(new Option(label, val));
	}
	printServerURL.on('change', function() {
        $('#imgChanges').show();
    });

	let printerAddr = $('#sltPrinterAddr');
	for (let i = 0; i < window.printerAddrOptions.length; i++) {
		const label = window.printerAddrOptions[i].label;
		const val = window.printerAddrOptions[i].value;
		printerAddr.append(new Option(label, val));
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

	let newIPRange = $('#iptIPRange').val();
	if (newIPRange && newIPRange !== window.localIP) {
		window.localIP = newIPRange;
		searchPrinterServer();
	}

	let printServerURL = $('#sltPrintServerURL').val();
	if (printServerURL) {
		window.printServerURL = `https://${window.localIP}${printServerURL}:${window.printServerPort}${window.printServerPath}`;
	} else {
		window.printServerURL = '';
	}

	let printerAddr = $('#sltPrinterAddr').val();
	if (printerAddr) {
		window.printerAddr = `${window.localIP}${printerAddr}`;
	} else {
		window.printerAddr = '';
	}

	bindRefresh();

	$('#imgChanges').hide();

	refreshAuth();
}

async function render(restaurantId, showMenus) {
	if (showMenus) {
		let res = await getMenus(restaurantId);
		window.menus = res;
		let menus = getParsedMenus();
		
		let categories = getCategories(menus);
		renderCategories(categories, window.descriptionSplit);
	}
	let meals = await getMeals(restaurantId);
	window.meals = meals;
	let mealRequests = parseMeals(meals);
	console.log("Meals parsed.");
	renderDashboard(mealRequests);
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
	renderDashboard(mealRequests);
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

async function refreshAuth(showMenus) {
	let restaurantId = getCurrentRestaurantId();
	let expire = Number(sessionStorage.getItem("expire"));
	
	if (restaurantId && Date.now() < expire) {
		console.log("Session authentication used");
		if (window.location.href.indexOf("index.html") === -1) {
			displayAll(true);
			await render(restaurantId, showMenus);
		}
	} else {
		console.log('Not authenticated');
		if (window.location.href.indexOf("index.html") === -1) {
			window.location.href = "index.html";
		}
	}
}

function toDateTime(timestamp, showFullDate) {
    let date = new Date(timestamp);
    if (showFullDate) {
        let fullDate = date.getDate() + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
            date.getFullYear();
        return fullDate + ' ' + date.getHours() + ':' + date.getMinutes() + ':' +
            date.getSeconds();
    }
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0') + ':' +
        date.getSeconds();
}

function getCurrentRestaurantId() {
	return sessionStorage.getItem("restaurantId");
}
