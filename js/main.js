
var tabId;

function saveEdit() {
    var name = document.getElementById('txtName').value.replace(',', '');
    var contents = document.getElementById('txtContents').value;
    StorageService.saveLabel(name, contents);
}

function loadItems() {
    var labels = StorageService.getLabels();
    var list = document.getElementById('listButtons');
    list.innerHTML = '';
    for (var i = 0; i < labels.length; i++) {
        var a1 = document.createElement('a');
        a1.innerText = labels[i];
        a1.href = '#' + labels[i];
        a1.className = 'execute';
        list.appendChild(a1);
        var a2 = document.createElement('a');
        a2.innerText = 'Edit';
        a2.href = '#' + labels[i];
        a2.className = 'edit';
        list.appendChild(a2);
        list.appendChild(document.createElement('br'));
    }
}

function editLabel(label) {
    document.getElementById('txtName').value = '';
    document.getElementById('txtContents').value = '';
    openTab('edit');
    StorageService.getContents(label, (script) => {
        document.getElementById('txtName').value = label;
        document.getElementById('txtContents').value = script;
    });
}

function openTab(id) {
    var tabs = document.getElementsByClassName('tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById('tab-' + id).style.display = 'block';
}

function showError(message) {
    alert(message);
}

function getCurrentTabDomain(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    tabId = tab.id;
    //extract domain
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];
    domain = domain.split('?')[0];

    callback(domain);
  });
}

function initializeTabs() {
    var labels = document.getElementsByClassName('tab-indicator');
    for (var i = 0; i < labels.length; i++) {
        labels[i].addEventListener('click', (e) => {
            e.preventDefault();
            openTab(e.target.href.split('#')[1]);
        });
    }
}

function initializeButtons() {
    var homes = document.getElementsByClassName('goHome');
    for (var i = 0; i < homes.length; i++ ) {
        homes[i].addEventListener('click', (e) => {
            e.preventDefault();
            openTab('home');
        });
    };

    document.getElementById('btnSave').addEventListener('click', (e) => {
        e.preventDefault();
        saveEdit();
        loadItems();
        openTab('home');
    });

    document.getElementById('btnCancel').addEventListener('click', (e) => {
        e.preventDefault();
        openTab('home');
    });

    //js butotns
    document.getElementById('listButtons').addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.className == 'execute') {
            var label = e.target.innerText;
            StorageService.getContents(label, (script) => {
                chrome.tabs.executeScript(tabId, {
                  code: script
                });
            });
        } else if (e.target.className == 'edit') {
            editLabel(e.target.href.split('#')[1]);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeButtons();
  getCurrentTabDomain((domain) => {
      StorageService.setDomain(domain, () => {
          loadItems();
      });
  });
});
