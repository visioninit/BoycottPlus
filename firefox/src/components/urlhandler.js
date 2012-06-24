Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

function TheComponent() { }

TheComponent.prototype = {  
    classDescription: "BoycottPlus URL handler",  
    classID:          Components.ID("{e7497047-f186-4ca5-82e0-69abb255c632}"),  
    contractID:       "@boycottplus.org/urlhandler;1",  
    QueryInterface:	  XPCOMUtils.generateQI([Components.interfaces.nsIContentPolicy]),  
    shouldLoad:		  function (type, location, origin, context, mimeTypeGuess, extra) {
        const ACCEPT = Components.interfaces.nsIContentPolicy.ACCEPT;
        const REJECT_TYPE = Components.interfaces.nsIContentPolicy.REJECT_TYPE;
        const REJECT_OTHER = Components.interfaces.nsIContentPolicy.REJECT_OTHER;
        const TYPE_DOCUMENT = Components.interfaces.nsIContentPolicy.TYPE_DOCUMENT;
        
        if (type !== TYPE_DOCUMENT) {
            return ACCEPT;
        }
        
        if (location.scheme === "boycottplus" || location.scheme === "grupovrs") {
            boycottPlus.tools.broadcast("opened", "URL", "http://" + location.host + location.path);
            return REJECT_OTHER;
        }
        
        if ((location.scheme === "http" || location.scheme === "https") && location.path.search(/\.bcp$/) !== -1) {
			boycottPlus.newCampaign = true;
            boycottPlus.tools.broadcast("opened", "URL", location.scheme + "://" + location.host + location.path);
			return REJECT_OTHER;
        }
        
        return ACCEPT;
    },
    shouldProcess : function (type, location, origin, context, mimeType, extra) {
        const ACCEPT = Components.interfaces.nsIContentPolicy.ACCEPT;
        
        return ACCEPT;
    }
};

var components = [TheComponent];

if (XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);  
}
else {
    var NSGetModule = XPCOMUtils.generateNSGetModule(components);  
}