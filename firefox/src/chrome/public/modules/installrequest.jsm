var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://boycottplus/modules/tools.jsm");
Components.utils.import("resource://boycottplus/modules/data.jsm");

function requestHandler(sub, top, dat) {
    tools.openManager();
    tools.broadcast("SourceAddedOrUpdated", "event", JSON.stringify(["...", dat]));
    data.addOrUpdateSource(dat);
}

tools.addObserver(requestHandler, "URL");
