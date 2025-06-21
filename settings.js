function setSettings() {
	window.apiURL = 'https://api.waiterio.com/api/v3';
	window.descriptionSplit = true;
	window.nullDescription = 'Geral';
	window.showStatuses = ["ORDERED", "COOKING", "READY", "SERVED", "CANCELLED" ];
	window.refreshPeriod = 60000;
	window.markedAsStatus = 'SERVED';
	window.showFullDate = false;
	window.getMealsBackTo = 3; // hours
	window.dishWarningThreshold = 20;
	window.printServerURL = 'https://192.168.1.64:3000/api';
	window.printerAddr = '192.168.1.204';
	window.printOnly = false;
}
