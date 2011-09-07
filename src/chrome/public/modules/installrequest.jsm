var EXPORTED_SYMBOLS = ["notification"];

Components.utils.import("resource://boycottplus/modules/tools.jsm");

var notification = {
    addPopup : function () {
        var win = this;
        win.gBrowser.parentNode.appendChild(makePopup(win));
    },
    
    showPopup : showPopup
};

function makePopup(win) {
    var $ = tools.$e.bind(win.document, win.document);
    
    var popup = $("box", {"id" : "boycottPopup", "class" : "boycottPopupHidden"}, []);
    
    return popup;
}

function showPopup(str, duration) {
    duration = duration || 2500;
    var browserWin = tools._wm.getMostRecentWindow("navigator:browser");
    var popup = browserWin.document.querySelector("#boycottPopup");
    popup.textContent = str;
    popup.className = "boycottPopupVisible";
    var time = (new Date()).getTime();
    popup.setUserData("time", time, null);
    
    var hideAgain = function () {
        if (popup.getUserData("time") != time) {
            return;
        }
        
        popup.className = "boycottPopupHidden";
    };
    
    browserWin.setTimeout(hideAgain, duration);
}

function requestHandler(sub, top, dat) {
    var browserWin = tools._wm.getMostRecentWindow("navigator:browser");
    showPopup("Fetching " + dat + "...");
    var xhr = new browserWin.XMLHttpRequest();
    xhr.open("GET", dat);
    var handler = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            showPopup("Fetched!");
            browserWin.alert(xhr.responseText);
        }
        else if (xhr.readyState === 4) {
            showPopup("Request failed.");
        }
    };
    xhr.onreadystatechange = handler;
    xhr.send();
}

tools.addObserver(requestHandler, "URL");