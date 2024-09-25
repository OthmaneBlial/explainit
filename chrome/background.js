let GROQ_API_KEY = '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Initialize context menu
function initContextMenu() {
  chrome.contextMenus.create({
    id: "explainText",
    title: "Explain with ExplainIt",
    contexts: ["selection"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.log("Context menu creation error:", chrome.runtime.lastError.message);
    }
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText") {
    chrome.storage.sync.set({ highlighted: info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  initContextMenu();
  chrome.storage.sync.get(['apikey'], result => {
    GROQ_API_KEY = result.apikey || '';
  });
});

// Get explanation prompt based on style
function getExplanationPrompt(style, text) {
  switch (style) {
    case 'eli5':
      return `Explain this as if I'm 5 years old: ${text}`;
    case 'technical':
      return `Provide a technical explanation for: ${text}`;
    case 'analogy':
      return `Explain this using an analogy: ${text}`;
    case 'academic':
      return `Provide an academic explanation for: ${text}`;
    case 'storytelling':
      return `Explain this concept through a short story: ${text}`;
    case 'historical':
      return `Explain this with historical context: ${text}`;
    case 'pros_cons':
      return `Explain the pros and cons of: ${text}`;
    case 'socratic':
      return `Use the Socratic method to explore this concept: ${text}`;
    case 'eli15':
      return `Explain this as if I'm 15 years old: ${text}`;
    default:
      return `Please explain this succinctly: ${text}`;
  }
}

// Explain text using AI
async function explain_text_with_ai(text, style) {
  if (!GROQ_API_KEY) {
    throw new Error('API key not set. Please set the API key in the extension popup.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that explains text concisely and in simple terms.' },
        { role: 'user', content: getExplanationPrompt(style, text) }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const explanation = data.choices[0].message.content;

  await chrome.storage.sync.set({ explained: explanation });
  return explanation;
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'explain_text') {
    chrome.storage.sync.get('explanationStyle', async (result) => {
      const style = result.explanationStyle || 'default';
      chrome.storage.sync.set({ highlighted: request.text, explained: "" }, async () => {
        if (!GROQ_API_KEY) {
          sendResponse({ error: 'API key not set. Please set the API key in the extension popup.' });
        } else {
          try {
            const explanation = await explain_text_with_ai(request.text, style);
            sendResponse({ explanation });
          } catch (error) {
            sendResponse({ error: error.message });
          }
        }
        chrome.action.openPopup();
      });
    });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === 'api_key_updated') {
    GROQ_API_KEY = request.apikey;
    sendResponse({ success: true });
  } else if (request.action === 'update_explanation_style') {
    chrome.storage.sync.set({ explanationStyle: request.style });
    sendResponse({ success: true });
  }
});