// ConsoleLog for developing
var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var console = {
	log: function(str) {
		if ( typeof(str) == 'string' ) {
			aConsoleService.logStringMessage(str);
		/*
		} else if ( typeof(str) == 'integer' ) {
			aConsoleService.logStringMessage(str.toSource());
		
		} else if ( typeof(str) == 'object' ) {
			aConsoleService.logStringMessage(str.toSource());
		*/
		} else {
			aConsoleService.logStringMessage((new XMLSerializer()).serializeToString(str));
		}
	}
};

/* Alert for developing
var output = '';
for (property in object) {
  output += property + ': ' + object[property]+'; ';
}
alert(output);
*/

Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");

// Boycottplus Object
var boycottplus = {
	// Retrieve the preferences.
	 prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.boycottplus.")
	
	// Methods.
	,onPageLoad: function() {
		// We no longer need the gBrowser load Listener.
		gBrowser.removeEventListener("load", boycottplus.onPageLoad, true);
		if ( boycottplus.prefs.getBoolPref("just_installed") ) {
			boycottplus.prefs.setBoolPref("just_installed", false);
			window.openDialog(
				'chrome://boycottplus/content/dialogs/just_installed.xul',
				'just_installed',
				'modal,centerscreen,resizable=no'
			);
		} else {	
			// Check Periodic updates.
			boycottplus.checkSiteUpdate();
		}
	}
	
	// If we just installed the extension, this method opens the post-install page and update the preferences. 
	,justInstalled: function(dialog) {
		dialog.close();
		// Creating a new tab with Boycottplus site.
		var myUrl = boycottplus.prefs.getCharPref("post_install_url");
		var tab = window.gBrowser.addTab(myUrl);
		window.gBrowser.selectedTab = tab;
	}
	
	/*
	// Delete the "BoycottPlus" branch of preferences. Not yet supported.
	,deletePrefs: function(){
		Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).deleteBranch("extensions.boycottplus.");
		//Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).clearUserPref('data');
	}
	*/
	
	// Add new Tab to the current chrome and select it.
	,newTab: function(url, selected) {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator); 
		var mainWindow = wm.getMostRecentWindow("navigator:browser");
		var tab = mainWindow.gBrowser.addTab(url);
		
		if ( selected ) {
			mainWindow.gBrowser.selectedTab = tab;
		}
	}
	
	// Unsuscribe from a Campaign.
	,doUnsuscribe: function(source) {
		boycottPlus.data.removeSource(source, false);
	}
	
	// Suscribe to a Campaign
	,doSuscribe: function() {
		var source = boycottPlus.newBoycottJSON.source;
		var json = boycottPlus.newBoycottJSON.JSON;

		// If already suscribed, remove source.
        try {
			boycottPlus.data.removeSource(source, false);
		}
		catch(e) {
		}
		
		boycottPlus.data._addSource(source, json);
	}
	
	// Update Campaign saving user's Preferences
	,doUpdate: function(source, selected) {
		boycottPlus.data.showNewBoycottDetailsJSON(source, true);
		var json = boycottPlus.newBoycottJSON.JSON;
		
		// If there're no changes, escape function.
		if ( boycottPlus.data._data.tracked[source].updatedDate == json.updatedDate ) {
			boycottPlus.data._data.tracked[source].locallyUpdated = Math.floor(new Date().getTime() / 1000);
			return false;
		}
		
		if ( boycottPlus.data._data.tracked[source].displayChanges ) {
			// Just for now... until Json data is renewed.
			var url = 'http://boycottplus.org';
			
			boycottplus.newTab(url, selected);	
		}
		
		var notificationType = boycottPlus.data._data.tracked[source].notificationType;
		var displayChanges = boycottPlus.data._data.tracked[source].displayChanges;
		var updateFrecuency = boycottPlus.data._data.tracked[source].updateFrecuency;
		
		boycottPlus.data.removeSource(source, true);

		boycottPlus.data._addSource(source, json);
		
		// Save user's Changes to the Campaign.		
		boycottplus.setSiteNotificationType(source, notificationType);
		boycottplus.setDisplayChanges(source, displayChanges);
		boycottplus.setSiteUpdateFrecuency(source, updateFrecuency);
	}
	
	,doUpdateAll: function() {
		var tracked = boycottPlus.data._data.tracked;
		
		for(var track in tracked) {
			boycottplus.doUpdate(track, false);
		}
	}
	
	// Set site notificationType.
	,setSiteNotificationType: function(address, notificationType) {
		// Tracked notificationType.
		boycottPlus.data._data.tracked[address].notificationType = notificationType;
		
		// Company notificationType.
		var companies = boycottPlus.data._data.domainToCompanies;
		for(var company in companies) {
			if (boycottPlus.data._data.domainToCompanies[company][0]._src == address ) {
				 boycottPlus.data._data.domainToCompanies[company][0]._boycott.notificationType = notificationType;
			}
		}
		
		boycottPlus.data.saveData();
	}
	
	// Set site displayChanges.
	,setDisplayChanges: function(address, displayChanges) {
		boycottPlus.data._data.tracked[address].displayChanges = displayChanges;
		
		boycottPlus.data.saveData();
	}
	// Set site updateFrecuency.
	,setSiteUpdateFrecuency: function(address, updateFrecuency) {
		boycottPlus.data._data.tracked[address].updateFrecuency = updateFrecuency;
		
		boycottPlus.data.saveData();
	}
	
	// Check if the site is tagged as Banned or Notify, then calls the appropriate function.
	,checkSitePrefs: function(url) {
		// if there already is a bar, remove it
        var browser = window.gBrowser.getBrowserForDocument(url);
        var notification = gBrowser.getNotificationBox(browser);
        var currentBar = notification.querySelector(".boycottBar");
        if (currentBar) {
            currentBar.parentNode.removeChild(currentBar);
        }

        var company = boycottPlus.tools.findCompanies(boycottPlus.data, url);
        if (company) {
			// Block or put the notification Bar.
			if( company[0]._boycott.notificationType == '1' ) {
				boycottPlus.bar._addBar(notification.ownerDocument, notification, company, gBrowser);
			} else if( company[0]._boycott.notificationType == '2' ) {
				boycottplus.blockSite(browser, url, company[0]);
			}
        }
	}
	,checkSiteUpdate: function() {
		var tracked = boycottPlus.data._data.tracked;
		var now = Math.floor(new Date().getTime() / 1000);

		for(var track in tracked) {
			switch(tracked[track].updateFrecuency) {
				case '0':
				default:
					continue;
					break;
				case '1':
					// One day.
					var diff = 86400;
					break;
				case '2':
					// One week.
					var diff = 604800;
					break;
				case '3':
					// One month.
					var diff = 2592000;
					break;
			}

			if ( (now - tracked[track].locallyUpdated) >= diff ) {
				boycottplus.doUpdate(track, false);
			}
		}
	}
	
	,allowTab: function() {
		gBrowser.selectedBrowser.setAttribute('boycottPlus_allow', 'true');
	}

	// Block the Banned Site.
	,blockSite: function(browser, url, company) {
		//Missing campaignURL, for now go to boycottplus.org
		var campaignURL = 'boycottplus.org';
		
		window.stop();

		var causeDetails = '';
		company.causeDetail.forEach(function (cause) {
			causeDetails += '<li>'+cause+'</li>';
		});

		// Change content of the last accessed page with the Boycotted Page content.
		window.gBrowser.contentDocument.getElementsByTagName('body')[0].className = 'boycottBanned';
		
		window.gBrowser.contentDocument.body.innerHTML = '<div id="errorPageContainer"><div id="errorTitle"><h1 id="errorTitleTextNormal">Adress is Boycotted</h1></div><div id="errorLongContent"><div id="errorShortDesc"><p id="errorShortDescTextNormal">"'+url+'" has been blocked in accordance with the boycott campaign "'+company._boycott.name+'".</p></div><div id="errorLongDesc"><p id="errorLongDescText"><ul>'+causeDetails+'</ul></p></div></div><div id="boycott_buttons"><button id="continue" type="button">Continue to site</button><button type="button" onclick="location.href=\'http://'+campaignURL+'\'">Boycott Details</button></div></div>';
		
		window.gBrowser.contentDocument.getElementById('continue').onclick = function() { boycottplus.allowTab(); window.loadURI(url); };
		
		window.gBrowser.contentDocument.head.innerHTML = '<title>Address is Boycotted</title><link rel="shortcut icon" type="image/x-icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAMNQAADDUB0lnRHAAAAAd0SU1FB9sJHg0xAMd+kHAAAALBSURBVDjLdZLNa11lGMR/z3vO/UhOa6RdaOPWhQiCIIZSXAg1C1GhIF0pulCkIWk1BV0ogiJi01ZLUEFQKaRUQVAxWBAqbWpM1aogmlw//oCKK6/m3uSe857nHRc3lCB0YJa/YRgGtunS0mrR70fv96OuY//0kyvFdsauwRdXi7v33rY+c3jZUoyyEAAsJVHXrqpyQp7b6ff369y5KzsOHty3ARAAvjz/c3H7Hbf+O3142SQpH21Zs2iRtZuyRkPKclLILc+DBoNok5N3rZ9Z+GoEwBYXfyjum7xzfWr6kiGp0WwQ8gwzqGsRK6csa1rtjFMn9pqSMDNGRho6u3Bh1Pr96E9NXQwIZY2MYBkhyyxkQe6iLGvaLePEsQlDIOCZ2RVdvbphi5/dn3IgbPYGyloty5QUgpm5gIAnMdIOnJybsOQJzDj67Dfq/NG12CsFhBygKhPBXCFAMCQMcHbubPD63IQl1xb8rVY7XWIlxVoA5ABllSyQZCYIhikwNtbk1PEhbGYcOXpZnd/+JkYRYyJWMgS5gHLgmGrMAmDcOJbz9vw+S0qYGTOzl9X5tUuMaThsFHVM2xqULiNDiF27Wrz7zj2WNKw4fWQlrXX+oXa3uhZ1PQypowRYDqKsHOS2e3dbC+/da4YhiUMzK1rtdM094S6r64S75I7V0bXVwFJxw2hA0odn9pu2nvnEoWWtdbq4C/dESlDXSZ5EqqSbxscMI+VvzX8+ev6Lhzb7G9W1wR5/ckmra11SEikJT8IdpQReOTfv2WE/fndAL7/0QcMAXn3l4+bU9AOb7ik88ugF/fJ711IaAkpshWCpStpzS2FfLz3ob8x91Dx28rEUAF548eHqzfnFdlE09edfA6vWS8VeRexVVvVKq3oV3i81Pl7YT98f0PHXhjD/1/PPnc17vei9XtR17LNPnw7bmf8AqXneg8IuvvoAAAAASUVORK5CYII=" /><link rel="stylesheet" href="chrome://global/skin/netError.css" type="text/css" media="all"/><link rel="stylesheet" href="chrome://browser/skin/aboutPrivateBrowsing.css" type="text/css" media="all"/> <style type="text/css">body.normal .showPrivate, body.private .showNormal { display: none; } body.appMenuButtonVisible .toolsMenu { display: none; } body.appMenuButtonInvisible .appMenuButton { display: none; } .boycottBanned #errorPageContainer { background-image: url(data:image/png;base64,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); background-repeat: no-repeat; } #boycott_buttons { -moz-margin-start: 80px; margin-top: 30px } #boycott_buttons button { margin-right: 20px }</style>';
	}
};

window.addEventListener("load", function onLoad(){
	// We no longer need the window load Listener.
	window.removeEventListener("load", onLoad, true);
	
	// Create a gBrowser Listener to fire on load once.
	gBrowser.addEventListener("load", boycottplus.onPageLoad, true);
}, true);

//window.addAddonListener('uninstalled', boycottplus.deletePrefs, true);