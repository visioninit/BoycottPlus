var EXPORTED_SYMBOLS = ["bar"];

Components.utils.import("resource://boycottplus/modules/tools.jsm");

var bar = {

    onPageLoad : function (ev) {
        var doc = ev.originalTarget;
        var win = doc.defaultView;
        
        if (!win || !win.HTMLDocument || !(doc instanceof win.HTMLDocument)) {
            return; // handle html documents only
        }
        
        if (doc.defaultView !== doc.defaultView.top) {
            return; // do not handle frames/iframes
        }
        
        // if there already is a bar, remove it
        var gBrowser = this;
        var browser = gBrowser.getBrowserForDocument(doc);
        var notification = gBrowser.getNotificationBox(browser);
        var currentBar = notification.querySelector("#boycottPlusBar");
        if (currentBar) {
            currentBar.parentNode.removeChild(currentBar);
        }
        
        var companies = tools.findCompanies(doc.location.host);
        
        if (companies) {
            bar._addBar(notification, companies);
        }
    },
    
    _addBar : function (notification, companies) {
        var doc = document; // use the global document, ignore doc
        var $ = tools.$e.bind(doc, doc);
        
        var currentBar = notification.querySelector("#boycottPlusBar");
        if (currentBar) {
            currentBar.parentNode.removeChild(currentBar);
        }
        
        var company = companies[0]; // use only the first company for now
        var listItems = company.causeDetail
                            .map(function (i) { return doc.createTextNode(i); })
                            .map(function (i) { var li = doc.createElement("li"); li.appendChild(i); return li; });
        
        var bar = 
            $("box", { "id" : "boycottPlusBar" }, [
                $("ul", {}, listItems)
            ]);
        
        notification.insertBefore(bar, notification.firstChild);
        
    }
};
