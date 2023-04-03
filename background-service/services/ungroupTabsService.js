class UngroupTabsService {
    async execute() {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        tabs.forEach((tab) => chrome.tabs.ungroup(tab.id));
    }
}

export { UngroupTabsService };
