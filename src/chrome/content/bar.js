var boycottPlus = {
    
    data : null,
    
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
    },
    
    entry : function () {
        boycottPlus.addLoadHandler();
        boycottPlus.registerCSS();
        boycottPlus.restoreData();
    },
    
    addLoadHandler : function () {
        gBrowser.addEventListener("DOMContentLoaded", boycottPlus.onPageLoad, true);
    },
    
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
    
    addSource : function (source, obj) {
        try {
            var boycott = obj.boycott;
            var companies = boycott.company;
            
            boycottPlus.data.tracked[source] = true;
            
            for (var i in companies) {
                if (!companies.hasOwnProperty(i))
                    continue;
                
                var domains = companies[i].domains;
                for (var j in domains) {
                    if (!domains.hasOwnProperty(j))
                        continue;
                    
                    companies[i]._src = source;
                    companies[i]._boycott = boycott;
                    if (boycottPlus.data.domainToCompanies[domains[j]])
                        boycottPlus.data.domainToCompanies[domains[j]].push(companies[i]);
                    else
                        boycottPlus.data.domainToCompanies[domains[j]] = [companies[i]];
                }
            }
            
            delete boycott.company;
        }
        catch (e) {
            if (console && console.log) {
                console.log("BoycottPlus: " + e);
            }
        }
    },
    
    removeSource : function (source) {
        var domainToCompanies = boycottPlus.data.domainToCompanies;
        
        delete boycottPlus.data.tracked[source];
        
        for (var i in domainToCompanies) {
            if (!domainToCompanies.hasOwnProperty(i))
                continue;

            var companylist = domainToCompanies[i];
            for (var j = 0; j < companylist.length; ++j) {
                if (companylist[j]._src === source) {
                    companylist.splice(j, 1);
                }
            }
            
            if (companylist.length === 0) {
                delete domainToCompanies[i];
            }
        }
        
    },
    
    saveData : function () {
        Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.boycottplus.")
            .setCharPref("data", JSON.stringify(boycottPlus.data));
    },
    
    restoreData : function () {
        boycottPlus.data = JSON.parse(
            Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.boycottplus.")
                .getCharPref("data"));
    },
    
    addOrUpdateSource : function (source) {
        boycottPlus.removeSource(source);
        
        var xhr = new XMLHttpRequest();
        
        var handler = function() {
            if (xhr.readyState === 4 && (source.search(/^http/) === -1 /* remove this condition, temporary hack! */ || xhr.status === 200)) {
                var json = JSON.parse(xhr.responseText);
                boycottPlus.addSource(source, json);
            }
        };
        
        xhr.open("GET", source);
        xhr.overrideMimeType("text/plain");
        xhr.onreadystatechange = handler;
        xhr.send();
    },
    
    findCompanies : function (host) {
        var arr = host.split(".");
        
        while (arr.length > 1) {
            var value = boycottPlus.data.domainToCompanies[arr.join(".")];
            if (value && value.length) {
                return value;
            }
            arr.shift();
        }
        return null;
    },
    
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
        
        var companies = boycottPlus.findCompanies(doc.location.host);
        
        if (companies) {
            boycottPlus.addBar(notification, companies);
        }

    },
    
    addBar : function (notification, companies) {
        var doc = document; // use the global document, ignore doc
        var $ = boycottPlus.$e.bind(doc, doc);
        
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

window.addEventListener("load", boycottPlus.entry, false);