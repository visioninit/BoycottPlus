var EXPORTED_SYMBOLS = ["data"];

Components.utils.import("resource://boycottplus/modules/tools.jsm");

var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);

var data = {
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.boycottplus."),
	
    _data : null,
    
    _addSource : function (source, obj) {
        try {
            var boycott = obj;
            var companies = boycott.company;
			
			// Just for now... until Json data is renewed.
            boycott.notificationType = data.prefs.getCharPref('notificationType');
			boycott.updateFrecuency = data.prefs.getCharPref('updateFrecuency');
			boycott.displayChanges = JSON.stringify(data.prefs.getBoolPref('displayChanges'));
			
			boycott.locallyUpdated = JSON.stringify(Math.floor(new Date().getTime() / 1000));
			
            data._data.tracked[source] = boycott;
            
            for (var i in companies) {
                if (!companies.hasOwnProperty(i))
                    continue;
                
                var domains = companies[i].domains;
                for (var j in domains) {
                    if (!domains.hasOwnProperty(j))
                        continue;
                    
                    companies[i]._src = source;
                    companies[i]._boycott = boycott;
                    if (data._data.domainToCompanies[domains[j]])
                        data._data.domainToCompanies[domains[j]].push(companies[i]);
                    else
                        data._data.domainToCompanies[domains[j]] = [companies[i]];
                }
            }
            
            delete boycott.company;
			
			tools.broadcast("SourceAddedOrUpdated", "event", JSON.stringify([obj.name, source]));
			data.saveData();
        }
        catch (e) {
            if (console && console.log) {
                console.log("BoycottPlus: " + e);
            }
        }
    },

	showNewBoycottDetailsJSON : function (source, update) {
		/*
        var xhr = new tools.XMLHttpRequest();
        
        var handler = function() {
            if (xhr.readyState === 4 && (source.search(/^http/) === -1  || xhr.status === 200)) {
                try {
                    var json = JSON.parse(xhr.responseText);
                    if (!tools.validate(json)) {
                        throw "Invalid .bcp file";
                    }
					
					// Imported here because it doesn't work at the top.
					Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");
					
					// Just for now... until Json data is renewed.
					boycottPlus.newBoycottJSON.source = source;
					boycottPlus.newBoycottJSON.JSON = json;
					
					if ( !update ) {
						//Suscribe
						tools.openCampaignDetails();
					}
                }
                catch (ex) {
                }
            }
        };
        
        xhr.open("GET", source);
        xhr.overrideMimeType("text/plain");
        xhr.onreadystatechange = handler;
        xhr.send();
		*/
		var xhr = new tools.XMLHttpRequest();
		xhr.open("GET", source, false);
		xhr.send(null);  
  
		if (xhr.status === 200) {  
			var json = JSON.parse(xhr.responseText);
			if (!tools.validate(json)) {
				throw "Invalid .bcp file";
			}
			
			// Imported here because it doesn't work at the top.
			Components.utils.import("resource://boycottplus/modules/boycottplus.jsm");
			
			// Just for now... until Json data is renewed.
			boycottPlus.newBoycottJSON.source = source;
			boycottPlus.newBoycottJSON.JSON = json;
			
			if ( !update ) {
				//Suscribe
				tools.openCampaignDetails();
			}
		}
  	},
    
    removeSource : function (source, update) {

		var domainToCompanies = data._data.domainToCompanies;

        delete data._data.tracked[source];
        
        for (var i in domainToCompanies) {
            if (!domainToCompanies.hasOwnProperty(i))
                continue;

            var companylist = domainToCompanies[i];
            for (var j = companylist.length - 1; j >= 0; --j) {
                if (companylist[j]._src === source) {
                    companylist.splice(j, 1);
                }
            }

            if (companylist.length === 0) {
                delete domainToCompanies[i];
            }

        }

		if ( !update ) {
			tools.broadcast("SourceRemoved", "event", source);
		}
		
		data.saveData();
    },
    
    saveData : function () {
        Application.prefs.setValue("extensions.boycottplus.data", JSON.stringify(data._data));
		
		// Needed?
		//data.restoreData();
    },
    
    restoreData : function () {
        if (data._data === null) {
            data._data = JSON.parse(Application.prefs.get("extensions.boycottplus.data").value);
        }
    }

};
