document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const defaultStyle = document.getElementById('defaultStyle');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const viewSavedExplanationsButton = document.getElementById('viewSavedExplanations');

    // Load settings
    chrome.storage.sync.get(['darkMode', 'explanationStyle', 'apikey'], (result) => {
        darkModeToggle.checked = result.darkMode || false;
        defaultStyle.value = result.explanationStyle || 'default';
        apiKeyInput.value = result.apikey || '';
        
        document.body.classList.toggle('dark-mode', result.darkMode);
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        const isDarkMode = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        chrome.storage.sync.set({ darkMode: isDarkMode });
    });

    // Default style change
    defaultStyle.addEventListener('change', () => {
        chrome.storage.sync.set({ explanationStyle: defaultStyle.value });
    });

    // Save API key
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ apikey: apiKey }, () => {
                saveApiKeyButton.textContent = 'Saved!';
                setTimeout(() => {
                    saveApiKeyButton.textContent = 'Save API Key';
                }, 2000);
            });
        }
    });

    // View saved explanations
    viewSavedExplanationsButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'saved_explanations.html' });
    });
});