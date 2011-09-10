var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://boycottplus/modules/tools.jsm");

function addUrl(win, url) {
    if (win.document.readyState === "complete") {
        win.addUrl(url);
    }
    else {
        tools.setTimeout(addUrl.bind(win, win, url), 100);
    }
}

function requestHandler(sub, top, dat) {
    var managerWin = tools.openManager();
    addUrl(managerWin, dat);
}

tools.addObserver(requestHandler, "URL");
