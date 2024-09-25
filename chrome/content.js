// Function to send the selected text to the background script
function sendSelectedText() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage({action: "explain_text", text: selectedText});
  }
}

// Listen for the Ctrl + Shift + E shortcut
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'e') {
    event.preventDefault(); // Prevent default browser behavior
    sendSelectedText();
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({text: selectedText});
  }
});

// Optional: Add a context menu item for explaining selected text
chrome.runtime.sendMessage({action: "add_context_menu"});