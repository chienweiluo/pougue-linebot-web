const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const querystring = require('querystring');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 8080;

// 解析 JSON 請求
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Line Bot Webhook Endpoint
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  console.log(events, 'events');
  events.forEach(async (event) => {
    const { type } = event;
    if (type === 'postback') {
      const data = event.postback.data;
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

    if (type === 'message') {
      const {source} = event
      const { type: messageType, text: textBody } = event.message
      if (messageType === 'text') {
        // send back message
        if (textBody === 'chubby開團') {
          // TODO: security
          const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
          const token = 'VlcIaZn7yRomy925oqzJ20g+Eo0F5r0jasCpd4jb9BBMXikm1zoQWZI97LjaBQTI74WoZXuca7JMfQrVIGJpZ9DHMGuqyrnrlJmsHkfTZ6wojAfNt+M4tCcjb8CnF66ov5OP9S/iIPeuciRN5VsvZgdB04t89/1O/w1cDnyilFU=';
          const message = {
            to: source,
            "messages": [
              {
                "type": "template",
                "altText": "This is a buttons template",
                "template": {
                  "type": "buttons",
                  "thumbnailImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSftQhDbYCsWZPpNbJqLRGoPneDneEfLNdrLw&s",
                  "imageAspectRatio": "rectangle",
                  "imageSize": "cover",
                  "imageBackgroundColor": "#FFFFFF",
                  "title": "Chubbby",
                  "text": "請你打開",
                  "defaultAction": {
                    "type": "uri",
                    "label": "這個按鈕",
                    "uri": "https://liff.line.me/2006500949-YMqZ2gbp"
                  },
                  "actions": [
                    {
                      "type": "uri",
                      "label": "this",
                      "uri": "https://liff.line.me/2006500949-YMqZ2gbp"
                    }
                  ]
                }
              }
            ]
          };

          const options = {
            url: lineApiUrl,
            "method": "post",
            "headers": {
              "Authorization": "Bearer " + token,
              "Content-Type": "application/json"
            },
            "data": message
          };
        
          axios.request(options);
        }
      }
    }
  });

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
