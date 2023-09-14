// Fetch data from Torn API
fetch(`https://api.torn.com/user/2373510?selections=log&cat=138&key=${apiKey}`)
  .then(response => response.json())
  .then(tornData => {
    // Process and send data to Notion
    const newEntries = Object.values(tornData.log); // Convert object to array

    // Sync each new entry to Notion
    newEntries.forEach(entry => {
      const payload = {
        "parent": { "database_id": notionDbId },
        "properties": {
          "Title": { "title": [{ "text": { "content": entry.title } }] },
          "Timestamp": { "number": entry.timestamp },
          "Withdrawn": { "number": entry.data.withdrawn },
          "Balance": { "number": entry.data.balance },
          // Add more properties as needed
        }
      };

      // Create a new page in the Notion database
      fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionApiKey}`,
          "Notion-Version": "2021-08-16",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(notionResponse => {
        console.log("Successfully added to Notion:", notionResponse);
      })
      .catch(error => {
        console.error("Error adding to Notion:", error);
      });
    });
  })
  .catch(error => console.error('Error fetching Torn data:', error));
