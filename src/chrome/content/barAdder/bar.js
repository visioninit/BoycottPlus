boycottPlus.bar = {

    onPageLoad : function (ev) {
        var doc = ev.originalTarget;
        
        if (!(doc instanceof HTMLDocument)) {
            return; // handle html documents only
        }
        
        if (doc.defaultView !== doc.defaultView.top) {
            return; // do not handle frames/iframes
        }
        
        // if there already is a bar, remove it
        var browser = gBrowser.getBrowserForDocument(doc);
        var notification = gBrowser.getNotificationBox(browser);
        var currentBar = notification.querySelector("#boycottPlusBar");
        if (currentBar) {
            currentBar.parentNode.removeChild(currentBar);
        }
        
        var companies = boycottPlus.tools.findCompanies(doc.location.host);
        
        if (companies) {
            boycottPlus.bar._addBar(notification, companies);
        }
    },
    
    _addBar : function (notification, companies) {
        var doc = document; // use the global document, ignore doc
        var $ = boycottPlus.tools.$e.bind(doc, doc);
        
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
