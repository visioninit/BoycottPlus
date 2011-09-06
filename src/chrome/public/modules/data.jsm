var EXPORTED_SYMBOLS = ["data"];

Components.utils.import("resource://boycottplus/modules/tools.jsm");

var Application = Components.classes["@mozilla.org/fuel/application;1"]
                      .getService(Components.interfaces.fuelIApplication);

var data = {
    
    _data : null,
    
    _addSource : function (source, obj) {
        try {
            var boycott = obj;
            var companies = boycott.company;
            
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
        }
        catch (e) {
            if (console && console.log) {
                console.log("BoycottPlus: " + e);
            }
        }
    },
    
    addOrUpdateSource : function (source) {
        data.removeSource(source);
        
        var xhr = new XMLHttpRequest();
        
        var handler = function() {
            if (xhr.readyState === 4 && (source.search(/^http/) === -1 /* remove this condition, temporary hack! */ || xhr.status === 200)) {
                var json = JSON.parse(xhr.responseText);
                data._addSource(source, json);
                tools.broadcast("UpdateEntry", "event", JSON.stringify([json.name, source]));
                data.saveData();
            }
        };
        
        xhr.open("GET", source);
        xhr.overrideMimeType("text/plain");
        xhr.onreadystatechange = handler;
        xhr.send();
    },
    
    removeSource : function (source) {
        var domainToCompanies = data._data.domainToCompanies;
        
        delete data._data.tracked[source];
        
        for (var i in domainToCompanies) {
            if (!domainToCompanies.hasOwnProperty(i))
                continue;

            var companylist = domainToCompanies[i];
            for (var j = 0; j < companylist.length; ++j) {
                if (companylist[j]._src === source) {
                    companylist.splice(j, 1);
                }
            }
            
            if (companylist.length === 0) {
                delete domainToCompanies[i];
            }
        }
        
        data.saveData();
    },
    
    saveData : function () {
        Application.prefs.setValue("extensions.boycottplus.data", JSON.stringify(data._data));
    },
    
    restoreData : function () {
        if (data._data === null) {
            data._data = JSON.parse(Application.prefs.get("extensions.boycottplus.data").value);
        }
    }

};
