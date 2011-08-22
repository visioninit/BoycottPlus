var boycottPlus = {
    
    data : null,
    
    $e : function (doc, tag, attr, children) {
        var el = doc.createElement(tag);
        if (attr) {
            for (var i in attr) {
                el.setAttribute(i, attr[i]);
            }
        }
        if (children) {
            children.forEach(el.appendChild);
        }
        return el;
    },
    
    entry : function () {
        boycottPlus.addLoadHandler();
        boycottPlus.restoreData();
    },
    
    addLoadHandler : function () {
        gBrowser.addEventListener("DOMContentLoaded", boycottPlus.onPageLoad, true);
    },
    
    addSource : function (source, obj) {
        try {
            obj = obj.boycott;
            var companies = obj.company;
            var causes = obj.causes;
            
            boycottPlus.data.tracked[source] = true;
            
            for (var i in companies) {
                if (!companies.hasOwnProperty(i))
                    continue;
                
                var domains = companies[i].domains;
                for (var j in domains) {
                    if (!domains.hasOwnProperty(j))
                        continue;
                    
                    companies[i]._src = source;
                    boycottPlus.data.domainToCompany[domains[j]] = companies[i];
                }
            }
            
            for (var i in causes) {
                if (!causes.hasOwnProperty(i))
                    continue;
                
                causes[i]._src = source;
                boycottPlus.data.causeidToCause[causes[i].causeId] = causes[i];
            }
        }
        catch (e) {
            if (console && console.log) {
                console.log("BoycottPlus: " + e);
            }
        }
    },
    
    removeSource : function (source) {
        var domainToCompany = boycottPlus.data.domainToCompany;
        var causeidToCause = boycottPlus.data.causeidToCause;
        
        delete boycottPlus.data.tracked[source];
        
        for (var i in domainToCompany) {
            if (!domainToCompany.hasOwnProperty(i))
                continue;
            
            if (domainToCompany[i]._src === source) {
                delete domainToCompany[i];
            }
        }
        
        for (var i in causeidToCause) {
            if (!causeidToCause.hasOwnProperty(i))
                continue;
            
            if (causeidToCause[i]._src === source) {
                delete causeidToCause[i];
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
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                boycottPlus.addSource(source, json);
            }
        };
        
        xhr.open("GET", source);
        xhr.overrideMimeType("text/plain");
        xhr.onreadystatechange = handler;
        xhr.send();
    },
    
    findCompany : function (host) {
        var arr = host.split(".");
        
        while (arr.length > 1) {
            var value = boycottPlus.data.domainToCompany[arr.join(".")];
            if (value) {
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
        
        var company = boycottPlus.findCompany(doc.location.host);
        
        if (company) {
            boycottPlus.addBar(doc, company);
        }

    },
    
    addBar : function (doc, company) {
        var icon = boycottPlus.$e(doc, "span", { id : "boycottIcon" });
        var close = boycottPlus.$e(doc, "div", { id : "boycottButton" });
        
        var causes = company.causes.map(function (i) { return boycottPlus.data.causeidToCause[i]; });
        var causeTitles = causes.map(function (i) { return i.causeTitle; });
        var causeViolations = causes.map(function (i) { return i.causeViolation; });
        
        var lines = [];
        lines.push(doc.createTextNode(
                company.companyName + " is in violation of cause(s): " + causeTitles.join(", ")
            ));
        
        lines.push(boycottPlus.$e(doc, "ul", {},
                causeViolations.map(function (i) {
                    return boycottPlus.$e(doc, "li", {}, [doc.createTextNode(i)])
                })
            ));
        
        var text = boycottPlus.$e(doc, "span", { id : "boycottText" }, lines);
        
        var bar = boycottPlus.$e(doc, "div", { id : "boycottBar" }, [icon, text, close]);
        
        var css = boycottPlus.$e(doc, "link", {
                "type" : "text/css",
                "rel" : "stylesheet",
                "href" : "resource://boycottplus/bar.css"
            });
        doc.body.appendChild(bar);
        doc.querySelector("head").appendChild(css);
    }
};

window.addEventListener("load", boycottPlus.entry, false);