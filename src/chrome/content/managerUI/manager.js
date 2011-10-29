Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

function onAddClicked () {
    var url = window.prompt("Enter the Boycott URL:");
    if (url) {
        boycottPlus.tools.broadcast("SourceAddedOrUpdated", "event", JSON.stringify(["...", url]));
        boycottPlus.data.addOrUpdateSource(url);
    }
}

function onRemoveClicked () {
    var source = document.querySelector("#displayWidget").getSelected();
    if (source) {
        boycottPlus.data.removeSource(source);
    }
}
