function handleSaveChanges() {
    const cards = Array.from(document.getElementById('list_rules').getElementsByClassName('card-domain-to-title'));
    const rules = cards.map((card) => {
        const domain = card.getElementsByClassName('input_domain')[0].value;
        const title = card.getElementsByClassName('input_title')[0].value;
        console.log({ domain, title, debug: true });
        return { domain, title };
    });
    console.log({ rules })
    chrome.runtime.sendMessage({ action: 'update_rules', rules });
}

function handleRemoveRule(node) {
    node.parentNode.removeChild(node);
}

function handleAddNewRule(domain = "", title = "") {
    const fragment = document.getElementsByClassName('fragment-card-domain-to-title')[0].getElementsByClassName('card-domain-to-title')[0];
    const fragment_clone = fragment.cloneNode(true);
    fragment_clone.getElementsByClassName('input_domain')[0].value = domain;
    fragment_clone.getElementsByClassName('input_title')[0].value = title;
    const list_rules = document.getElementById('list_rules');
    fragment_clone.getElementsByClassName('btn_remove_rule')[0].addEventListener('click', () => handleRemoveRule(fragment_clone));
    list_rules.appendChild(fragment_clone);
}

async function loadConfigs() {
    chrome.storage.local.get(['configs'], function (data) {
        const configs = data.configs || {};
        const domainRules = configs.domainRules || {};
        for (const [domain, title] of Object.entries(domainRules)) {
            console.log({ domain, title })
            handleAddNewRule(domain, title);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const btn_save_changes = document.getElementById('btn_save_changes');
    const btn_add_new_rule = document.getElementById('btn_add_new_rule');
    btn_save_changes.addEventListener('click', handleSaveChanges);
    btn_add_new_rule.addEventListener('click', () => handleAddNewRule());

    loadConfigs();
});
