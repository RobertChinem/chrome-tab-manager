async function listTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs.map((tab) => ({ url: tab.url, title: tab.title, id: tab.id }));
}

function sortTabsByURL(tabs){
    return tabs.sort((a, b) => {
        if (a.url < b.url) {
            return -1;
        }
        if (a.url > b.url) {
            return 1;
        }
        return 0;
    });
}

function moveTab(id, pos) {
    chrome.tabs.move(id, { index: pos });
}

chrome.commands.onCommand.addListener(async (cmd) => {
    console.log({ chrome })

    const currentOrder = await listTabs();
    const newOrder = sortTabsByURL([...currentOrder]);

    newOrder.forEach((tab, index) => {
        moveTab(tab.id, index);
    });
});

