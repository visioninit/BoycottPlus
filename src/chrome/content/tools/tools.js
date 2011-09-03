boycottPlus.tools = {
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
    
    findCompanies : function (host) {
        var arr = host.split(".");
        
        while (arr.length > 1) {
            var value = boycottPlus.data._data.domainToCompanies[arr.join(".")];
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