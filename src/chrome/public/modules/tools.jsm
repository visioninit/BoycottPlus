var EXPORTED_SYMBOLS = ["tools"];

Components.utils.import("resource://boycottplus/modules/data.jsm");

var tools = {
    registerCSS : function () {
        var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                            .getService(Components.interfaces.nsIStyleSheetService);
        var ios = Components.classes["@mozilla.org/network/io-service;1"]
                            .getService(Components.interfaces.nsIIOService);
        var uri = ios.newURI("chrome://boycottplus/skin/bar.css", null, null);
        if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
            sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
        }
    },
    
    _obs : Components.classes["@mozilla.org/observer-service;1"]  
              .getService(Components.interfaces.nsIObserverService),
    
    broadcast : function (subject, channel, data) {
        tools._obs.notifyObservers(null, "boycottPlus" + channel, JSON.stringify([subject, data]));  
    },
    
    addObserver : function (func, channel) {
        var handle = [{ observe : function (sub, top, dat) {
                var arr = JSON.parse(dat);
                func(arr[0], top, arr[1]);
            } }, channel];
        tools._obs.addObserver(handle[0], "boycottPlus" + channel, false);
        return handle;
    },
    
    removeObserver : function (handle) {
        tools._obs.removeObserver(handle[0], handle[1]);
    },
    
    _ww : Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                   .getService(Components.interfaces.nsIWindowWatcher),
    
    _wm : Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator),
    
    openManager : function () {
        var currentManager = tools._wm.getMostRecentWindow("boycottplus:manager");
        if (currentManager) {
            currentManager.focus();
        }
        else {
            tools._ww.openWindow(null,
                            'chrome://boycottplus/content/managerUI/manager.xul',
                            'boycottPlusManagerWindow',
                            'height=450,width=520,resizable,dialog,alwaysRaised,chrome,centerscreen,titlebar',
                            null);
        }
    },
    
    findCompanies : function (host) {
        var arr = host.split(".");
        
        while (arr.length > 1) {
            var value = data._data.domainToCompanies[arr.join(".")];
            if (value && value.length) {
                return value;
            }
            arr.shift();
        }
        return null;
    },
    
    $e : function (doc, tag, attr, children) {
        var el = doc.createElement(tag);
        if (attr) {
            for (var i in attr) {
                if (attr.hasOwnProperty(i)) {
                    el.setAttribute(i, attr[i]);
                }
            }
        }
        if (children) {
            children.forEach(function (i) {
                el.appendChild(i);
            });
        }
        return el;
    }
};