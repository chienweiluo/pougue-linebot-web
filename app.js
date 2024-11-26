import OpenAI from 'openai';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import querystring from 'querystring';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 8080;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
const corsOptions = {
  origin: [
    'https://nextjs-static-zpwr.onrender.com',
    'http://localhost:3000',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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
        const { rowNumber, startDate, KOLName, storeName} = jsonQuery
        try {
          const response = await axios.post('https://script.google.com/macros/s/AKfycbxSokQ9woEqX550VBvUt4qS6vW4-1kKJtHPGmFdbCApJ_uX4tR5D3hajKNkN7OSp5Jp/exec', {
            type: 'checkSchedule',
            rowNumber,
            startDate,
            KOLName,
            storeName
          });
  
          if (response.data.result === 'success') {
            console.log(`${KOLName}'s ${storeName} on ${startDate} updated successfully.`);
          } else {
            console.error(`Failed to update row: ${response.data.error}`);
          }
        } catch (error) {
          console.error(`Error calling Google Apps Script: ${error.message}`);
        }
      }
    }

    if (type === 'message') {
      const { source } = event
      const { type: messageType, text: textBody } = event.message
      
      if (messageType === 'text') {
        // send back message
        if (textBody === 'chubby開團') {
          // TODO: security
          const userId = source.userId
          if (!userId) {
            return
          }
          const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
          const token = process.env.LINE_TOKEN;
          const message = {
            to: userId,
            "messages": [
              {
                "type": "template",
                "altText": "Chubby Kai Tuan",
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

app.post('/api/write_brief', async (req, res) => {
  const { KOLName, brandName, productName } = req.body
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `
        You are a helpful assistant that can write a brief for a invitation letter, and you are a Taiwanese girl. 
        You always search and prepare for the trending information of brand and products.
        ` },
      { role: "user", content: `
        Help Cutie Abby to write a Brief message to ${KOLName} about ${productName} from the brand ${brandName}.
        1. please write in Chinese.
        2. please write in a spoken verbal Taiwan tone with concise and genuine.
        3. to make the KOL more likely to raise the collective buying(團購) event.
      ` 
    },
    ],
  });
  res.send(completion.choices[0].message.content);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
