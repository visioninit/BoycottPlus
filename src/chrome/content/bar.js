var boycottPlus = {
    
    data : {
        domainToCompany : {},
        causeidToCause : {}
    },
    
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
        
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "chrome://boycottplus/content/data.json", false);
        xhr.overrideMimeType("text/plain");
        xhr.send();
        var json = JSON.parse(xhr.responseText);
        
        boycottPlus.loadData(json);
    },
    
    addLoadHandler : function () {
        gBrowser.addEventListener("DOMContentLoaded", boycottPlus.onPageLoad, true);
    },
    
    loadData : function (json) {
        var companies = json["company"];
        var causes = json["causes"];
        
        for (var i in companies) {
            var domains = companies[i].domains;
            for (var j in domains) {
                boycottPlus.data.domainToCompany[domains[j]] = companies[i];
            }
        }
        
        for (var i in causes) {
            boycottPlus.data.causeidToCause[causes[i].causeId] = causes[i];
        }
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