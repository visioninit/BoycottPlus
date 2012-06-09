Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

// register the css files used by the extension
boycottPlus.tools.registerCSS("chrome://boycottplus/skin/bar.css");

// Adds the page load listener.
//const NOTIFY_STATE_DOCUMENT = Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const STATE_IS_DOCUMENT = Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT;
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;

function registerMyListener() {
	window.getBrowser().addProgressListener(myListener);
}

function unregisterMyListener() {
	window.getBrowser().removeProgressListener(myListener);
}

window.addEventListener("load", registerMyListener, false);
window.addEventListener("unload", unregisterMyListener, false);

var myListener = {
	onStateChange:function(aProgress,aRequest,aFlag,aStatus) {

		// If we click on the "Continue to Site" button, don't checkSitePrefs.
		if (!window.gBrowser.selectedBrowser.getAttribute('boycottPlus_allow') || typeof window.gBrowser === "undefined"){
			if(aFlag & (STATE_IS_DOCUMENT|STATE_START)) {
				aRequest.QueryInterface(Components.interfaces.nsIChannel);
				boycottplus.checkSitePrefs(aRequest.URI.host);
			}
		}
	},
	onLocationChange:function(a,b,c){},
	onProgressChange:function(a,b,c,d,e,f){},
	onStatusChange:function(a,b,c,d){},
	onSecurityChange:function(a,b,c){},
}

//gBrowser.addEventListener("DOMContentLoaded", boycottPlus.bar.onPageLoad, true);

// load the data to the memory.
boycottPlus.data.restoreData();

// save data on application quit
Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService).addObserver({ observe : function (sub, top, dat) {
	boycottPlus.data.saveData();
}}, "quit-application-requested", false);