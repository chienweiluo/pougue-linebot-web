const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// 解析 JSON 請求
app.use(bodyParser.json());

// Line Bot Webhook Endpoint
app.post('/webhook', (req, res) => {
  const events = req.body.events;

  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;
      
      if (userMessage === '✅') {
        // 處理收到的✅回覆，例如更新 Google Sheets
        await updateGoogleSheet(event.source.userId);
      }
    }
  });

  res.sendStatus(200);
});

// 假設的更新 Google Sheets 函數
async function updateGoogleSheet(userId) {
  // 在這裡實現您對 Google Sheets 的更新邏輯
  console.log(`Received response from user: ${userId}`);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});