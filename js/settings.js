function setSettings() {
	window.apiURL = 'https://api.waiterio.com/api/v3';
	window.descriptionSplit = true;               // split dishes based on their description
	window.nullDescription = 'Geral';             // when no description, use this value
	window.showStatuses = ["ORDERED", "COOKING", "READY", "SERVED", "CANCELLED" ];
	window.refreshPeriod = 600000;                // in milisecconds
	window.markedAsStatus = 'SERVED';             // when changing status of an item, use this value
	window.showFullDate = false;
	window.getMealsBackTo = 6;                    // valid values are (in hours): 1, 3, 6, 12, 24
	window.dishWarningThreshold = 20;             // show different cell color upon higher requests
	window.printServerURLOptions = [ { label: 'Manual 100', value: '100' }, { label: 'Manual 101', value: '101' }, { label: 'Manual 102', value: '102' } ];
	window.printServerPort = '3000';
	window.printServerPath = '/api';
	window.printServerURL = ''                    // additional printer server
	window.printerAddrOptions = [ { label: 'Manual 201', value: '201' }, { label: 'Manual 202', value: '202' }, { label: 'Manual 203', value: '203' }, { label: 'Manual 204', value: '204' } ];
	window.printerAddr = '';                      // address of printer to use (printServerURL must be set)
	window.printOnly = false;                     // print only orders, do not change their status
	window.showTableThreshold = 700;              // do not show table with name higher than
	window.localIP = '192.168.100.';                // local IP address
	window.forceTLS = true;
}
