var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://boycottplus/modules/tools.jsm");
Components.utils.import("resource://boycottplus/modules/data.jsm");

function requestHandler(sub, top, dat) {
	// Get JSON and open Campaign Details Window.
    tools.broadcast("SourceAddedOrUpdated", "event", JSON.stringify(["...", dat]));
	
	if( data._data.tracked[dat] ){
		// Subscribed already.
		Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");
		boycottPlus.newCampaign = false;
		boycottPlus.selectedCampaign = dat;
		tools.openCampaignDetails();
	} else {
		// New Campaign.
		data.showNewBoycottDetailsJSON(dat, false);
	}
}

tools.addObserver(requestHandler, "URL");