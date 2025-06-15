function setSettings() {
	window.apiURL = 'https://api.waiterio.com/api/v3';
	window.descriptionSplit = true;
	window.nullDescription = 'Geral';
	window.showStatuses = ["ORDERED", "COOKING", "READY", "SERVED", "CANCELLED" ];
	window.refreshPeriod = 600000;
	window.markedAsStatus = 'SERVED';
	window.showFullDate = false;
	window.getMealsBackTo = 6; // hours
	window.dishWarningThreshold = 20;
	window.printerURL = 'http://192.168.1.83:8001/api';
}
