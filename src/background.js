const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

let projectName = import.meta.env.VITE_PROJECT
let toArray = import.meta.env.VITE_TO ? import.meta.env.VITE_TO.split(',') : []
let ccArray = import.meta.env.VITE_CC ? import.meta.env.VITE_CC.split(',') : []

// Load the user's settings from storage using the browser.storage API.
browser.storage.local
    .get(['toArray', 'ccArray', 'projectName'])
    .then((result) => {
        console.log('get storage: ', result)
        toArray = result.toArray || toArray
        ccArray = result.ccArray || ccArray
        projectName = result.projectName || projectName
    })

// Create a function to prompt the user to set their preferences.
function promptUserPreferences() {
    // Create a new window with the preference form.
    browser.windows.create({
        url: 'index.html',
        type: 'popup',
        width: 400,
        height: 600,
        allowScriptsToClose: true,
    })

    // Add a listener to update the variables when the user's preferences change.
    browser.storage.onChanged.addListener((changes) => {
        if (
            'toArray' in changes ||
            'ccArray' in changes ||
            'projectName' in changes
        ) {
            toArray = changes.toArray?.newValue || toArray
            ccArray = changes.ccArray?.newValue || ccArray
            projectName = changes.projectName?.newValue || projectName
        }
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
