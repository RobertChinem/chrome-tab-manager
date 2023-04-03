import { getDomainFromUrl } from './../utils.js'
import { Repository } from './../../repository.js';

class GroupTabsByDomainService {
    async execute() {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const groups = this.__groupTabsByDomain(tabs);
        for (const [domain, tabs] of Object.entries(groups)) {
            chrome.tabs.group(
                { tabIds: tabs.map(tab => tab.id) },
                (groupId) => this.__updateGroupTitle(groupId, domain)
            );
        }
    }

    async __updateGroupTitle(groupId, domain) {
        const repository = new Repository();
        const domainRules = await repository.getDomainRules();
        const title = domainRules[domain] || domain;
        chrome.tabGroups.update(groupId, { title, collapsed: true });
    }

    __groupTabsByDomain(tabs) {
        return tabs.reduce((acc, tab) => {
            const domain = getDomainFromUrl(tab.url);
            if (!acc[domain]) {
                acc[domain] = [];
            }
            acc[domain].push(tab);
            return acc;
        }, {});
    }
}

export { GroupTabsByDomainService };
