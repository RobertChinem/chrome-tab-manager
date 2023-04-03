import { SortTabsByURLService } from './services/sortTabsByURLService.js';
import { UngroupTabsService } from './services/ungroupTabsService.js';
import { GroupTabsByDomainService } from './services/groupTabsByDomainService.js';
import { Repository } from './../repository.js';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case 'update_rules':
            updateRules(request.rules);
            break;
    }
});

chrome.commands.onCommand.addListener(async (cmd) => {
    switch (cmd) {
        case "sort_by_url":
            await new SortTabsByURLService().execute();
            break;
        case "group_by_domain":
            await new GroupTabsByDomainService().execute();
            break;
        case "ungroup_tabs":
            await new UngroupTabsService().execute();
    }
});



async function updateRules(rules) {
    const repository = new Repository();
    repository.updateDomainRules(rules);
}
