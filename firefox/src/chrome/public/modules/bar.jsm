var EXPORTED_SYMBOLS = ["bar"];

Components.utils.import("resource://boycottplus/modules/tools.jsm");
Components.utils.import("resource://boycottplus/modules/data.jsm");

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
        var currentBar = notification.querySelector(".boycottBar");
        if (currentBar) {
            currentBar.parentNode.removeChild(currentBar);
        }

        // if we're on boycottplus.org, add an attribute to notify the site
        if (doc.location.host.split(".").slice(-2).join(".") === "boycottplus.org") {
            doc.body.setAttribute("data-extension", "yes");
        }
        
        var companies = tools.findCompanies(data, doc.location.host);
        
        if (companies) {
			bar._addBar(notification.ownerDocument, notification, companies);
        }
    },
    
    _makeBarlet : function (doc, company) {
        var $ = tools.$e.bind(doc, doc);
        
        var barlet = $("vbox", {"class" : "boycottBarlet"}, [doc.createTextNode("Boycott " + company.companyName + " for the cause \"" + company._boycott.name + "\"")]);
        if (company.causeDetail.length) {
            var ul = doc.createElementNS("http://www.w3.org/1999/xhtml", "ul");
            company.causeDetail.forEach(function (text) {
                var li = doc.createElementNS("http://www.w3.org/1999/xhtml", "li");
                li.appendChild(doc.createTextNode(text));
                ul.appendChild(li);
            });
            barlet.appendChild(ul);
        }
        
        return barlet;
    },
    
    _addBar : function (doc, notification, companies, gBrowser) {	
        var $ = tools.$e.bind(doc, doc);
        
        var currentBar = notification.querySelector(".boycottBar");
        if (currentBar) {
            currentBar.parentNode.removeChild(currentBar);
        }
        
        var barlets = [];
        for (var i = 0; i < companies.length; ++i) {
            barlets.push(this._makeBarlet(doc, companies[i]));
        }
        
        var bar = $("hbox", {"class" : "boycottBar"}, [
            $("vbox", {"class" : "boycottImageContainer"}, [
                $("image", {"class" : "boycottImage", "src" : "chrome://boycottplus/skin/icon32.png"})
            ]),
            $("vbox", {"class" : "boycottBarletContainer"}, barlets),
            $("vbox", {"class" : "boycottCloseContainer"}, [
                $("image", {"class" : "boycottClose", "src" : "chrome://boycottplus/skin/close12.png"})
            ])
        ]);
        
        notification.insertBefore(bar, notification.firstChild);
        
        notification.querySelector(".boycottClose").addEventListener("click", function () {
			gBrowser.selectedBrowser.setAttribute('boycottPlus_allow', 'true');
            var bar = notification.querySelector(".boycottBar");
            bar.parentNode.removeChild(bar);
			
        }, true);
    },
};
