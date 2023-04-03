class SortTabsByURLService {
    async execute() {
        const tabs = await chrome.tabs.query({ currentWindow: true })
        tabs.sort((a, b) => {
            if (a.url < b.url) return -1;
            if (a.url > b.url) return 1;
            return 0;
        }).forEach((tab, index) => chrome.tabs.move(tab.id, { index }));
    }
}

export { SortTabsByURLService };
