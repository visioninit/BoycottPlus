var EXPORTED_SYMBOLS = ["Broadcast"];

var Broadcast = {
    _obs : Components.classes["@mozilla.org/observer-service;1"]  
              .getService(Components.interfaces.nsIObserverService),
    
    broadcast : function (subject, channel, data) {
        Broadcast._obs.notifyObservers(null, "boycottPlus" + channel, JSON.stringify([subject, data]));  
    },
    
    addObserver : function (func, channel) {
        var handle = [{ observe : function (sub, top, dat) {
                var arr = JSON.parse(dat);
                func(arr[0], top, arr[1]);
            } }, channel];
        Broadcast._obs.addObserver(handle[0], "boycottPlus" + channel, false);
        return handle;
    },
    
    removeObserver : function (handle) {
        Broadcast._obs.removeObserver(handle[0], handle[1]);
    }
};

//conceptual boycott URL handler
Broadcast.addObserver(function (sub, top, dat) {
        Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser")
            .alert(JSON.stringify({sub: sub, top: top, dat: dat})); 
    }, "URL");