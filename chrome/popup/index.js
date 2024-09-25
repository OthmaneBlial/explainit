document.addEventListener('DOMContentLoaded', () => {
  const highlightedText = document.getElementById('highlighted_text');
  const explainedText = document.getElementById('explained_text');
  const errorContent = document.getElementById('error-content');
  const popupContent = document.getElementById('popup-content');
  const copyButton = document.getElementById('copy_button');
  const saveButton = document.getElementById('save_button');
  const clearButton = document.getElementById('clear_button');
  const apiKeyInput = document.getElementById('api_key_input');
  const saveApiKeyButton = document.getElementById('save_api_key_button');
  const styleSelect = document.getElementById('style-select');
  const openSettingsButton = document.getElementById('open_settings');
  const apiKeySection = document.getElementById('api-key-section');
  const viewSavedButton = document.getElementById('view_saved');

  const updatePopupContent = async () => {
    console.log("Updating popup content...");
    const { highlighted, explained, apikey, darkMode } = await chrome.storage.sync
    .get(['highlighted', 'explained', 'apikey', 'darkMode']);

    // Ensure dark mode is off by default
    if (darkMode === undefined) {
      await chrome.storage.sync.set({ darkMode: false });
    }

    document.body.classList.toggle('dark-mode', darkMode || false);

    if (apikey) {
      apiKeySection.classList.add('hidden');
      viewSavedButton.parentElement.classList.remove('hidden');
    } else {
      apiKeySection.classList.remove('hidden');
      viewSavedButton.parentElement.classList.add('hidden');
      errorContent.textContent = 'Add your GROQ API key to begin.';
      errorContent.classList.remove('hidden');
      popupContent.classList.add('hidden');
      return;
    }

    if (highlighted) {
      highlightedText.textContent = highlighted;
      explainedText.textContent = explained || 'Explanation will appear here.';
      errorContent.classList.add('hidden');
      popupContent.classList.remove('hidden');
    } else {
      errorContent.textContent = 'Welcome! Highlight text and press Ctrl+Shift+E to explain it.';
      errorContent.classList.remove('hidden');
      popupContent.classList.add('hidden');
    }

    console.log("Popup content updated.");
  };

  saveApiKeyButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      try {
        await chrome.storage.sync.set({ apikey: apiKey });
        chrome.runtime.sendMessage({ action: 'api_key_updated', apikey: apiKey }, (response) => {
          if (response.success) {
            // Clear any previous highlighted text
            chrome.storage.sync.remove(['highlighted', 'explained'], () => {
              updatePopupContent();
            });
          }
        });
      } catch (error) {
        console.error('Failed to save API key: ', error);
      }
    }
  });

  copyButton.addEventListener('click', async () => {
    const { explained } = await chrome.storage.sync.get('explained');
    if (explained) {
      try {
        await navigator.clipboard.writeText(explained);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      } catch (error) {
        console.error('Failed to copy text: ', error);
      }
    }
  });

  saveButton.addEventListener('click', async () => {
    const { highlighted, explained } = await chrome.storage.sync.get(['highlighted', 'explained']);
    if (highlighted && explained) {
      try {
        const result = await chrome.storage.sync.get('savedExplanations');
        const savedExplanations = result.savedExplanations || [];
        savedExplanations.push({ highlighted, explained, date: new Date().toISOString() });
        await chrome.storage.sync.set({ savedExplanations });
        saveButton.textContent = 'Saved!';
        setTimeout(() => {
          saveButton.textContent = 'Save';
        }, 2000);
      } catch (error) {
        console.error('Failed to save explanation: ', error);
      }
    }
  });

  clearButton.addEventListener('click', async () => {
    try {
      await chrome.storage.sync.remove(["highlighted", "explained"]);
      updatePopupContent();
    } catch (error) {
      console.error('Failed to clear storage: ', error);
    }
  });

  openSettingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  viewSavedButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'saved_explanations.html' });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message:", request);
    if (request.action === 'explain_text') {
      chrome.runtime.sendMessage({ action: 'explain_text', text: request.text }, (response) => {
        if (response.error) {
          errorContent.textContent = response.error;
          errorContent.classList.remove('hidden');
          popupContent.classList.add('hidden');
        } else {
          explainedText.textContent = response.explanation;
          errorContent.classList.add('hidden');
          popupContent.classList.remove('hidden');
        }
        updatePopupContent();
      });
    }
  });

  // Update content when popup is opened
  updatePopupContent();
});