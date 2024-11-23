// Create a function to prompt the user to set their preferences.
function promptUserPreferences() {
    // Create a new window with the preference form.
    browser.windows.create({
        url: 'index.html',
        type: 'popup',
        width: 720,
        height: 720,
        allowScriptsToClose: true,
    })
}

browser.composeAction.onClicked.addListener(async (tab) => {
    // store tab id
    browser.storage.local
        .set({
            tabId: tab.id,
        })
        .then(() => promptUserPreferences())
})
