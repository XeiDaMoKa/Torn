// contentScript.js
$(document).ready(function() {
  function sendToNotion(tradeItems) {
      const notionDatabaseId = 'YOUR_NOTION_DATABASE_ID';
      const notionSecret = 'YOUR_INTEGRATION_SECRET'; // Be cautious with secrets in client-side code
      const notionVersion = '2022-02-22'; // Adjust based on the latest Notion API version

      tradeItems.forEach(item => {
          const body = {
              parent: { database_id: notionDatabaseId },
              properties: {
                  Name: {
                      title: [
                          {
                              text: {
                                  content: item.itemName
                              }
                          }
                      ]
                  },
                  Quantity: {
                      number: item.quantity
                  },
                  Price: {
                      number: item.price
                  }
              }
          };

          fetch(`https://api.notion.com/v1/pages`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${notionSecret}`,
                  'Notion-Version': notionVersion,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
          })
          .then(response => response.json())
          .then(data => console.log('Success:', data))
          .catch(error => console.error('Error:', error));
      });
  }

  function gatherTradeData() {
      let tradeItems = [];
      // Your existing code to push items into tradeItems
      sendToNotion(tradeItems); // Call this function with the tradeItems array
  }

  gatherTradeData();
});
