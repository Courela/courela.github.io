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
	window.printServerURLOptions = [ '1.64:3000/api', '10.116:3000/api' ];
	window.printServerURL = ''
	window.printerAddrOptions = [ '1.201', '1.202', '1.203', '1.204', '10.201', '10.202', '10.203', '10.204' ];
	window.printerAddr = '';
	window.printOnly = false;
}
