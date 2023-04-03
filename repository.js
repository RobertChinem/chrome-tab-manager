class Repository {
    updateDomainRules(domainRules) {
        chrome.storage.sync.set({ domainRules });
    }

    async getDomainRules() {
        const { domainRules } = await chrome.storage.sync.get(['domainRules']);
        return domainRules || {};
    }
}

export { Repository };
