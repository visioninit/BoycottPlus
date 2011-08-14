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
        boycottPlus.loadData();
    },
    
    addLoadHandler : function () {
        gBrowser.addEventListener("DOMContentLoaded", boycottPlus.onPageLoad, true);
    },
    
    loadData : function () {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "chrome://boycottplus/content/data.json", false);
        xhr.overrideMimeType("text/plain");
        xhr.send();
        boycottPlus.data = JSON.parse(xhr.responseText);
    },
    
    findCompany : function (url) {
        var companies = boycottPlus.data["company"];
        var causes = boycottPlus.data["causes"];
        
        for (var i in companies) {
            var domains = companies[i].domains;
            for (var j in domains) {
                var regex = "^" + domains[j].pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
                if (url.search(regex) >= 0) {
                    return companies[i];
                }
            }
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
        var left = boycottPlus.$e(doc, "div", { id : "boycottBarLeft" });
        var right = boycottPlus.$e(doc, "div", { id : "boycottBarRight" });
        
        left.appendChild(doc.createTextNode(JSON.stringify(company.causes)));
        
        var bar = boycottPlus.$e(doc, "div", { id : "boycottBar" }, [left, right]);
        
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