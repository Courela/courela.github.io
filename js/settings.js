function setSettings() {
	window.apiURL = 'https://api.waiterio.com/api/v3';
	window.descriptionSplit = true;               // split dishes based on their description
	window.nullDescription = 'Geral';             // when no description, use this value
	window.showStatuses = ["ORDERED", "COOKING", "READY", "SERVED", "CANCELLED" ];
	window.refreshPeriod = 60000;                 // in milisecconds
	window.markedAsStatus = 'SERVED';             // when changing status of an item, use this value
	window.showFullDate = false;
	window.getMealsBackTo = 3;                    // valid values are (in hours): 1, 3, 6, 12, 24
	window.dishWarningThreshold = 20;             // show different cell color upon higher requests
	window.printServerURLOptions = [ '1.64:3000/api', '10.116:3000/api' ];
	window.printServerURL = ''                    // additional printer server
	window.printerAddrOptions = [ '1.201', '1.202', '1.203', '1.204', '10.201', '10.202', '10.203', '10.204' ];
	window.printerAddr = '';                      // address of printer to use (printServerURL must be set)
	window.printOnly = false;                     // print only orders, do not change their status
	window.showTableThreshold = 700;              // do not show table with name higher than
}
