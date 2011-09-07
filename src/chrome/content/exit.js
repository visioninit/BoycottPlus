Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

// register the css files used by the extension
boycottPlus.tools.registerCSS();

// add the page load listener
gBrowser.addEventListener("DOMContentLoaded", boycottPlus.bar.onPageLoad, true);

// add the notification box
top.addEventListener("load", boycottPlus.notification.addPopup, false)

// load the data to the memory
boycottPlus.data.restoreData();

// save data on application quit
Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService)
    .addObserver({ observe : function (sub, top, dat) {
            boycottPlus.data.saveData();
        }}, "quit-application-requested", false);