var StorageService = {
    labelKey: '_LABELS',
    domain: null,
    labels: [],
    setDomain: function(domain, callback) {
        this.domain = domain;
        //load labels
        var _this = this;
        var itemsKey = this.domain + this.labelKey;
        chrome.storage.local.get(itemsKey, (items) => {
            if (chrome.runtime.lastError) {
              //showError(chrome.runtime.lastError);
              return;
            }
            if (!items) {
                return;
            }
            var itemsStr = items[itemsKey];
            if (itemsStr && itemsStr.length > 0) {
              _this.labels = itemsStr.split(',');
            }
            if (callback) {
                callback();
            }
        });
    },
    getLabels: function() {
        if (this.domain == null) {
            throw 'Set domain first!';
        }
        return this.labels;
    },
    saveLabel: function(label, contents) {
        if (this.domain == null) {
            throw 'Set domain first!';
        }
        if (this.labels.indexOf(label) == -1) {
            // new label
            this.labels.push(label);
            this.syncLabels();
        }
        //update contents
        var items = {};
        items[this.domain + '_' + label] = contents;
        chrome.storage.local.set(items);
    },
    syncLabels: function() {
        var itemsKey = this.domain + this.labelKey;
        var items = {};
        items[itemsKey] = this.labels.join(',');
        chrome.storage.local.set(items);
    },
    getContents: function(label, callback) {
        if (this.domain == null) {
            throw 'Set domain first!';
        }
        if (this.labels.indexOf(label) == -1) {
            callback('alert("void(0);")');
        }
        var labelKey = this.domain + '_' + label;
        chrome.storage.local.get(labelKey, (items) => {
            if (chrome.runtime.lastError) {
              return callback('alert(' + chrome.runtime.lastError + ')');
            }
            var itemsStr = items[labelKey];
            if (itemsStr.length > 0) {
              return callback(itemsStr);
            }
        });
    },
    removeLabel: function(label) {
        if (this.domain == null) {
            throw 'Set domain first!';
        }
        if ((i = this.labels.indexOf(label)) >= 0) {
            this.labels.splice(i, 1);
            this.syncLabels();
            var labelKey = this.domain + '_' + label;
            chrome.storage.local.remove(labelKey);
        }
    },
    set: function(key, value) {
        var dataKey = this.domain + '_data_' + key;
        var items = {};
        items[key] = value;
        chrome.storage.local.set(items);
    },
    get: function(key, callback) {
        var dataKey = this.domain + '_data_' + key;
        chrome.storage.local.get(dataKey, (items) => {
            if (chrome.runtime.lastError) {
              return callback('alert(' + chrome.runtime.lastError + ')');
            }
            return callback(items[dataKey]);
        });
    },
    remove: function(key) {
        var dataKey = this.domain + '_data_' + key;
        chrome.storage.local.remove(dataKey);
    }
};
