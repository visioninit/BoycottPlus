Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

function onCommand() {
    boycottPlus.tools.openManager();
}

boycottPlus.tools.registerCSS("chrome://boycottplus/skin/toolbarbutton.css");

var $ = boycottPlus.tools.$e.bind(document, document);

var eventListenerHandle = boycottPlus.tools.addObserver(eventListener, "event");

function prompt2() {
    var result = prompt.apply(this, arguments);
    var win = boycottPlus.tools._wm.getMostRecentWindow("navigator:browser");
    win.document.querySelector("#boycottToolbarButton").open = true;
    return result;
}

function eventListener(subject, topic, data) {
    if (subject === "SourceAddedOrUpdated") {
        updateEntry(JSON.parse(data));
    }
    else if (subject === "SourceRemoved") {
        removeSource(data);
    }
}

function removeSource(source) {
    var row = findBySource(source);
    if (row) {
        var item = row.parentNode;
        item.parentNode.removeChild(item);
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
    else {
        var treechildren = document.querySelector("treechildren");
        treechildren.appendChild(
            $("treeitem", {}, [
                $("treerow", {}, [
                    $("treecell", {"label" : name}),
                    $("treecell", {"label" : source})
                ])
            ]));
    }
}

function removeBySource(url) {
    var existing = findBySource(url);
    while (existing) {
        existing.parentNode.parentNode.removeChild(existing.parentNode);
        existing = findBySource(url);
    }
}

function addUrl(url) {
    var tree = document.querySelector("tree");
    var treechildren = document.querySelector("treechildren");
    
    removeBySource(url);
    treechildren.appendChild(makeTreeItem(["...", url]));
    boycottPlus.data.addOrUpdateSource(url);
}

function onAddClicked () {
    var url = prompt2("Enter the Boycott URL:");
    if (url) {
        addUrl(url);
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
}

function onModifyClicked () {
    var tree = document.querySelector("tree");
    var treechildren = document.querySelector("treechildren");

    if (tree.currentIndex === -1) {
        return;
    }
    
    var selected = treechildren.childNodes[tree.currentIndex];
    var source = selected.firstChild.childNodes[1].getAttribute("label");
    
    var url = prompt2("Enter the new Boycott URL:");
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
