//open("chrome://boycottplus/content/managerUI/manager.xul", "boycottPlusManagerWindow", "height=450,width=520,resizable=yes,dialog=yes,modal=yes,alwaysRaised=yes,chrome=yes,centerscreen=yes,titlebar=yes")
boycottPlus = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow).boycottPlus;

alert(JSON.stringify(boycottPlus.data._data));