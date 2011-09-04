boycottPlus.data = {
    
    get _data() {
        return Application.storage.get("data", null);
    },
    
    set _data(newdata) {
        Application.storage.set("data", newdata);
    },
    
    _addSource : function (source, obj) {
        try {
            var boycott = obj;
            var companies = boycott.company;
            
            boycottPlus.data._data.tracked[source] = boycott;
            
            for (var i in companies) {
                if (!companies.hasOwnProperty(i))
                    continue;
                
                var domains = companies[i].domains;
                for (var j in domains) {
                    if (!domains.hasOwnProperty(j))
                        continue;
                    
                    companies[i]._src = source;
                    companies[i]._boycott = boycott;
                    if (boycottPlus.data._data.domainToCompanies[domains[j]])
                        boycottPlus.data._data.domainToCompanies[domains[j]].push(companies[i]);
                    else
                        boycottPlus.data._data.domainToCompanies[domains[j]] = [companies[i]];
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
        boycottPlus.data.removeSource(source);
        
        var xhr = new XMLHttpRequest();
        
        var handler = function() {
            if (xhr.readyState === 4 && (source.search(/^http/) === -1 /* remove this condition, temporary hack! */ || xhr.status === 200)) {
                var json = JSON.parse(xhr.responseText);
                boycottPlus.data._addSource(source, json);
                boycottPlus.tools.broadcast("UpdateEntry", "event", JSON.stringify([json.name, source]));
                boycottPlus.data.saveData();
            }
        };
        
        xhr.open("GET", source);
        xhr.overrideMimeType("text/plain");
        xhr.onreadystatechange = handler;
        xhr.send();
    },
    
    removeSource : function (source) {
        var domainToCompanies = boycottPlus.data._data.domainToCompanies;
        
        delete boycottPlus.data._data.tracked[source];
        
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
        
        boycottPlus.data.saveData();
    },
    
    saveData : function () {
        Application.prefs.setValue("extensions.boycottplus.data", JSON.stringify(boycottPlus.data._data));
    },
    
    restoreData : function () {
        if (boycottPlus.data._data === null) {
            boycottPlus.data._data = JSON.parse(Application.prefs.get("extensions.boycottplus.data").value);
        }
    }

};
