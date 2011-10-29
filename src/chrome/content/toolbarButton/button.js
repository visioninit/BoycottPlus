Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

boycottPlus.toolbarButton = {
    onAddClicked : function () {
        var url = window.prompt("Enter the Boycott URL:");
        if (url) {
            boycottPlus.tools.broadcast("SourceAddedOrUpdated", "event", JSON.stringify(["...", url]));
            boycottPlus.data.addOrUpdateSource(url);
        }
    },

    onRemoveClicked: function () {
        var source = document.querySelector("#boycottToolbarDisplayWidget").getSelected();
        if (source) {
            boycottPlus.data.removeSource(source);
        }
    }
};
