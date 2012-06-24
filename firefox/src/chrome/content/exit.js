Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

// register the css files used by the extension
boycottPlus.tools.registerCSS("chrome://boycottplus/skin/bar.css");

// Adds the page load listener.
const NOTIFY_STATE_DOCUMENT = Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const STATE_IS_REQUEST = Components.interfaces.nsIWebProgressListener.STATE_IS_REQUEST;
const STATE_IS_DOCUMENT = Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT;

const STATE_REDIRECTING = Components.interfaces.nsIWebProgressListener.STATE_REDIRECTING;
const STATE_TRANSFERRING = Components.interfaces.nsIWebProgressListener.STATE_TRANSFERRING;
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;

function registerMyListener() {
	window.getBrowser().addTabsProgressListener(myListener);
}

function unregisterMyListener() {
	window.getBrowser().removeTabsProgressListener(myListener);
}

window.addEventListener("load", registerMyListener, false);
window.addEventListener("unload", unregisterMyListener, false);

var myListener = {
	onStateChange:function(aBrowser,aProgress,aRequest,aFlag,aStatus) {
		// Check only if HTTP, HTTPS, FTP protocols. Ignore ABOUT:CONFIG an so on.
		try {
			if( aFlag & (STATE_IS_DOCUMENT|STATE_START) ) {
				aRequest.QueryInterface(Components.interfaces.nsIChannel);				
				boycottplus.checkSitePrefs(aBrowser, aRequest.URI.host, aRequest.URI.spec);
			}
		}
		catch(e) {
			//console.log(e);
		}
		/*
		var output = '';
		for (property in aRequest) {
		  output += property + ': ' + aRequest[property]+'; ';
		}
		alert('State: '+output);
		*/
	},
	onLocationChange:function(aBrowser,aWebProgress,aRequest,aLocation,aFlags){},
	onProgressChange:function(aBrowser,aWebProgress,aRequest,aCurSelfProgress,aMaxSelfProgress,aCurTotalProgress,aMaxTotalProgress){},
	onStatusChange:function(aBrowser,aWebProgress,aRequest,aStatus,aMessage){},
	onSecurityChange:function(a,b,c,e){}
}

//gBrowser.addEventListener("DOMContentLoaded", boycottPlus.bar.onPageLoad, true);

// load the data to the memory.
boycottPlus.data.restoreData();

// save data on application quit
Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService).addObserver({ observe : function (sub, top, dat) {
	boycottPlus.data.saveData();
}}, "quit-application-requested", false);