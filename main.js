chrome.commands.onCommand.addListener(async (cmd) => {
    switch (cmd) {
        case "sort_by_url":
            await sortTabsByURL();
            break;
        case "group_by_domain":
            await groupTabsByDomain();
            break;
        case "ungroup_tabs":
            await ungroupTabs();
    }
});



function getDomainFromUrl(url) {
    const parsedUrl = new URL(url);
    let domain = parsedUrl.hostname;

    if (domain.startsWith("www.")) {
        domain = domain.slice(4);
    }

    return domain;
}

async function listTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs.map((tab) => ({ url: tab.url, title: tab.title, id: tab.id }));
}


async function ungroupTabs(){
    const tabs = await listTabs();
    tabs.forEach((tab) => {
        chrome.tabs.ungroup(tab.id);
    });
}


async function groupTabsByDomain() {
    const tabs = await listTabs();
    const groups = tabs.reduce((acc, tab) => {
        const domain = getDomainFromUrl(tab.url);
        if (!acc[domain]) {
            acc[domain] = [];
        }
        acc[domain].push(tab);
        return acc;
    }, {});
    for (const [domain, tabs] of Object.entries(groups)) {
        chrome.tabs.group({
            tabIds: tabs.map(tab => tab.id),
        }, (groupId) => {
            chrome.tabGroups.update(groupId, { title: domain, collapsed: true });
        });
    }
}

async function sortTabsByURL() {
    const currentOrder = await listTabs();
    const newOrder = currentOrder.sort((a, b) => {
        if (a.url < b.url) {
            return -1;
        }
        if (a.url > b.url) {
            return 1;
        }
        return 0;
    });

    newOrder.forEach((tab, index) => {
        moveTab(tab.id, index);
    });
}

function moveTab(id, pos) {
    chrome.tabs.move(id, { index: pos });
}