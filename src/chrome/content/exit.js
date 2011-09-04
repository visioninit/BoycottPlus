gBrowser.addEventListener("DOMContentLoaded", boycottPlus.bar.onPageLoad, true);

boycottPlus.tools.registerCSS();

boycottPlus.data.restoreData();

Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService)
    .addObserver({ observe : function (sub, top, dat) {
            boycottPlus.data.saveData();
        }}, "quit-application-requested", false);