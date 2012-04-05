var EXPORTED_SYMBOLS = ["boycottPlus"];

Components.utils.import("resource://boycottplus/modules/tools.jsm");
Components.utils.import("resource://boycottplus/modules/data.jsm");
Components.utils.import("resource://boycottplus/modules/bar.jsm");
Components.utils.import("resource://boycottplus/modules/installrequest.jsm");

var boycottPlus = {
    bar : bar,
    data : data,
    tools : tools
};
