const configs = {
    domainRules: {}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case 'update_rules':
            updateRules(request.rules);
            break;
    }
});

chrome.commands.onCommand.addListener(async (cmd) => {
    loadConfigs();
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

async function loadConfigs() {
    const data = await chrome.storage.local.get(['configs']) || {};
    const savedConfigs = data.configs || {};
    configs.domainRules = savedConfigs.domainRules || {};
}


async function listTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs.map((tab) => ({ url: tab.url, title: tab.title, id: tab.id }));
}

function getDomainFromUrl(url) {
    const parsedUrl = new URL(url);
    let domain = parsedUrl.hostname;

    if (domain.startsWith("www.")) {
        domain = domain.slice(4);
    }

    return domain;
}


function getNameForTabGroupFromDomain(domain){
    return configs.domainRules[domain] || domain;
}

function getNameForTabGroup(url) {
    const domain = getDomainFromUrl(url);
    return getNameForTabGroupFromDomain(domain);
}

async function updateTabGroups() {
    const tabs = await listTabs();
    tabs.forEach(tab => {
        chrome.tabs.group({
            tabIds: [tab.id],
        }, (groupId) => {
            chrome.tabGroups.update(groupId, { title: getNameForTabGroup(tab.url), collapsed: true });
        });
    })
}


async function updateRules(rules) {
    configs.domainRules = rules.reduce((acc, rule) => {
        acc[rule.domain] = rule.title;
        return acc;
    }, {});
    chrome.storage.local.set({ configs })
}


async function ungroupTabs() {
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
            chrome.tabGroups.update(groupId, { title: getNameForTabGroupFromDomain(domain), collapsed: true });
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