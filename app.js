const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const querystring = require('querystring');
const app = express();
const PORT = process.env.PORT || 8080;

// 解析 JSON 請求
app.use(bodyParser.json());

// Line Bot Webhook Endpoint
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  console.log(events, 'events');
  events.forEach(async (event) => {
    const { type, data } = event;
    console.log(type, 'type');
    console.log(data, 'data');
    if (type === 'postback') {
    
      const jsonQuery = querystring.parse(data) || {};
      console.log(jsonQuery, 'jsonQuery');
      if (jsonQuery.action === 'checked') {
        const rowNumber = jsonQuery.rowNumber;
        try {
          const response = await axios.post('https://script.google.com/macros/s/AKfycbxSokQ9woEqX550VBvUt4qS6vW4-1kKJtHPGmFdbCApJ_uX4tR5D3hajKNkN7OSp5Jp/exec', {
            rowNumber: rowNumber
          });
  
          if (response.data.result === 'success') {
            console.log(`Row ${rowNumber} updated successfully.`);
          } else {
            console.error(`Failed to update row: ${response.data.error}`);
          }
        } catch (error) {
          console.error(`Error calling Google Apps Script: ${error.message}`);
        }
      }
    }
  });

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});