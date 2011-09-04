//open("chrome://boycottplus/content/managerUI/manager.xul", "boycottPlusManagerWindow", "height=450,width=520,resizable=yes,dialog=yes,modal=yes,alwaysRaised=yes,titlebar=yes")

boycottPlus = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow).boycottPlus;


var $ = boycottPlus.tools.$e.bind(document, document);

var eventListenerHandle = boycottPlus.tools.addObserver(eventListener, "event");

function eventListener(subject, topic, data) {
    if (subject === "UpdateEntry") {
        updateEntry(JSON.parse(data));
    }
}

function makeTreeItem(i) {
    return $("treeitem", {}, [
            $("treerow", {}, i.map(function (j) { return $("treecell", {"label" : j}) }))
        ]);
}

function findBySource(source) {
    var rows = document.querySelectorAll("treerow");
    for (var i = 0; i < rows.length; ++i) {
        if (rows[i].childNodes[1].getAttribute("label") == source) {
            return rows[i];
        }
    }
    return null;
}

function updateEntry(array) {
    var name = array[0];
    var source = array[1];
    
    var row = findBySource(source);
    if (row) {
        row.childNodes[0].setAttribute("label", name);
    }
}

function removeBySource(url) {
    var existing = findBySource(url);
    while (existing) {
        existing.parentNode.parentNode.removeChild(existing.parentNode);
        existing = findBySource(url);
    }
}

function onAddClicked () {
    var tree = document.querySelector("tree");
    var treechildren = document.querySelector("treechildren");
    
    var url = window.prompt("Enter the Boycott URL:");
    if (url) {
        removeBySource(url);
        treechildren.appendChild(makeTreeItem(["...", url]));
        boycottPlus.data.addOrUpdateSource(url);
    }
}

function onRemoveClicked () {
    var tree = document.querySelector("tree");
    var treechildren = document.querySelector("treechildren");
    
    if (tree.currentIndex === -1) {
        return;
    }
    
    var selected = treechildren.childNodes[tree.currentIndex];
    var source = selected.firstChild.childNodes[1].getAttribute("label");
    boycottPlus.data.removeSource(source);
    selected.parentNode.removeChild(selected);
}

function onModifyClicked () {
    var tree = document.querySelector("tree");
    var treechildren = document.querySelector("treechildren");

    if (tree.currentIndex === -1) {
        return;
    }
    
    var selected = treechildren.childNodes[tree.currentIndex];
    var source = selected.firstChild.childNodes[1].getAttribute("label");
    
    var url = window.prompt("Enter the new Boycott URL:");
    if (url && url !== source) {
        removeBySource(source);
        boycottPlus.data.removeSource(source);
        treechildren.appendChild(makeTreeItem(["...", url]));
        boycottPlus.data.addOrUpdateSource(url);
    }
}

function refreshList() {
    var treechildren = document.querySelector("treechildren");
    
    while (treechildren.firstChild) {
        treechildren.removeChild(firstChild);
    }
    
    var items = [];
    var tracked = boycottPlus.data._data.tracked;
    for (var i in tracked) {
        if (!tracked.hasOwnProperty(i)) {
            continue;
        }
        items.push([tracked[i].name, i]);
    }
    
    items = items.map(makeTreeItem);
    
    items.forEach(function(i) {
        treechildren.appendChild(i);
    });
}

function onLoad() {
    refreshList();
    
}

function onUnload() {
    boycottPlus.tools.removeObserver(eventListenerHandle);
}

window.addEventListener("load", onLoad, false);
window.addEventListener("unload", onUnload, false);