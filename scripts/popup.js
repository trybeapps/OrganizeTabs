var extBaseUrl = 'chrome-extension://' + chrome.runtime.id + '/';
var reDirUrl = 'templates/dashboard.html';
var siteExists = { flag: false, id: 0 };

chrome.tabs.getAllInWindow(null, function (tabs) {
    var itemArray = [];
    for (tab in tabs) {
        var tabDomain = getDomainFromUrl(tabs[tab].url),
            tabUrl = tabs[tab].url,
            tabTitle = tabs[tab].title,
            tabFavIconUrl = tabs[tab].favIconUrl;

        tabDomain = tabDomain.replace("www.", '');


        if (tabDomain && itemArray.indexOf(tabDomain) === -1) {
            document.getElementById('popup-space').innerHTML += '<div data-title="' + tabTitle + ' data-favicon="' + tabFavIconUrl + ' data-url="' + tabUrl + '" data-domain="' + tabDomain + '" class="site-list-item">' + tabDomain + '</div>';
            itemArray.push(tabDomain);
        }
    }
});

setTimeout(function () {
    var items = document.getElementsByClassName('site-list-item');
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function () {
            var siteName = this.getAttribute('data-domain');
            chrome.tabs.getAllInWindow(null, function (tabs) {
                var tabsListForLocalStorage = [];
                for (count in tabs) {
                    var tab = tabs[count];
                    var domain = getDomainFromUrl(tab.url);
                    domain = domain.replace("www.", '');
                    var condition = false;
                    debugger;
                    if (siteName === 'all') {
                        condition = true;
                    } else if (siteName === 'selected') {
                        condition = tab.highlighted  ;
                    } else {
                        condition = domain === siteName ;
                    }

                    if (domain && condition && tab.audible !== true) {


                        var tempTabDetailObject = {
                            id: tab.id,
                            title: tab.title,
                            url: tab.url,
                            favIcon: tab.favIconUrl,
                        };
                        tabsListForLocalStorage.push(tempTabDetailObject);


                    } else {
                        if (tab.url === extBaseUrl + reDirUrl) {
                            siteExists = { flag: true, id: tab.id };
                            console.log('here');
                        }

                    }

                }

                tabsListForLocalStorage.map(function (tabb) {
                    chrome.tabs.remove(tabb.id);
                });

                if( siteName === 'selected' ){
                    siteName = 'all';
                }
                if (localStorage.hasOwnProperty(siteName)) {

                    var oldDataOfSite = JSON.parse(localStorage[siteName]);
                    if (tabsListForLocalStorage.length) {
                        oldDataOfSite = oldDataOfSite.concat(tabsListForLocalStorage);
                    }
                    var newDataOfSite = JSON.stringify(oldDataOfSite);
                    localStorage.setItem(siteName, newDataOfSite);

                } else {
                    
                    localStorage.setItem(siteName, JSON.stringify(tabsListForLocalStorage));
                }


                if (siteExists.flag) {
                    chrome.tabs.reload(siteExists.id);
                } else {
                    chrome.tabs.create({ index: 0, url: reDirUrl });
                }
                console.log(extBaseUrl+reDirUrl);
            });


        }, false);
    }
}, 0);


function getDomainFromUrl(url) {
    var splitedUrl = url.split('/');
    if (splitedUrl[0] !== 'chrome-extension:' && splitedUrl[0] !== 'chrome:') {
        return url.split('/')[2] || '';
    } else {
        return '';
    }

}