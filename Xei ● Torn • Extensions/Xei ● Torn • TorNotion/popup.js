document.addEventListener('DOMContentLoaded', () => {
    // Load existing settings
    chrome.storage.sync.get(['apiKey', 'notionDbId', 'notionApiKey'], (result) => {
      document.getElementById('apiKey').value = result.apiKey || '';
      document.getElementById('notionDbId').value = result.notionDbId || '';
      document.getElementById('notionApiKey').value = result.notionApiKey || '';
    });

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', () => {
      const apiKey = document.getElementById('apiKey').value;
      const notionDbId = document.getElementById('notionDbId').value;
      const notionApiKey = document.getElementById('notionApiKey').value;
      chrome.storage.sync.set({ apiKey, notionDbId, notionApiKey }, () => {
        alert('Settings saved.');
      });
    });
  });
