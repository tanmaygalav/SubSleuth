require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://subsleuth.vercel.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

// --- AUTH ROUTES (UNCHANGED) ---
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
  try {
    const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
    res.json({ authUrl: url });
  } catch (error) {
    console.error('[ERROR] Failed to generate Google Auth URL:', error);
    res.status(500).send('Error generating Google authentication URL.');
  }
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('No code received from Google.');
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    res.redirect(`http://localhost:5173/#token=${accessToken}`);
  } catch (error) {
    console.error('[FATAL ERROR IN CALLBACK]', error.message);
    res.status(500).send('Authentication failed on the server.');
  }
});

app.get('/logout', (req, res) => {
  res.status(200).send('Server acknowledged logout.');
});


// --- HELPER FUNCTION (UNCHANGED) ---
function getEmailBody(payload) {
  let body = '';
  if (payload.parts) {
    const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf8');
    }
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf8');
  }
  return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// --- AI function now uses the LATEST Google Gemini model ---
async function extractDetailsWithAI(emailText) {
  try {
    // --- THIS IS THE FIX ---
    // The model name is updated from "gemini-pro" to the latest version.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
    
    const prompt = `
      You are an expert data extraction bot. Analyze the following email text and extract these specific details.
      Respond ONLY with a valid JSON object. Do not include any text before or after the JSON object.
      The JSON object must have these keys: "productName", "price", "type", "transactionDate", "orderNumber", and "renewalFrequency".

      - "productName": The primary product, service, or name of the store.
      - "price": The total cost mentioned, including the currency symbol (e.g., "$9.99", "₹850").
      - "type": Classify as "Order" or "Subscription".
      - "transactionDate": Find the date of the order or billing. Format it as a simple, readable string like "Sep 26, 2025".
      - "orderNumber": If this is an order, find the order number (e.g., "#4024").
      - "renewalFrequency": If this is a subscription, find the billing cycle (e.g., 'Monthly', 'Yearly', 'Billed Annually').
      If a value for any key is not found, use the value null.

      Email Text: "${emailText.substring(0, 8000)}"
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("AI extraction failed:", error);
    return { productName: "AI Error", price: null, type: "Error", transactionDate: null, orderNumber: null, renewalFrequency: null };
  }
}

// --- THE FINAL, FAST SCAN EMAILS ROUTE ---
app.get('/scan-emails', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Authorization header missing or malformed.');
    }
    const token = authHeader.split(' ')[1];
    oauth2Client.setCredentials({ access_token: token });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const query = 'subject:(receipt OR invoice OR "your order" OR subscription OR order OR confirmation OR confirmed) from:(-me)';
    const listResponse = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 10 });
    const messages = listResponse.data.messages || [];
    if (messages.length === 0) return res.json([]);
    
    const messagePromises = messages.map(message => 
      gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' })
    );
    const fullMessages = await Promise.all(messagePromises);

    console.log(`[LOG] Found ${fullMessages.length} emails. Starting AI processing...`);

    const aiPromises = fullMessages.map(msg => {
        const emailBody = getEmailBody(msg.data.payload);
        return extractDetailsWithAI(emailBody).then(aiDetails => {
            const subject = msg.data.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
            const from = msg.data.payload.headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
            return { from, subject, ...aiDetails };
        });
    });

    const results = await Promise.all(aiPromises);
    
    console.log('[LOG] Finished all AI processing successfully.');
    res.json(results);

  } catch (error) {
    console.error('Error in /scan-emails route:', error);
    if (error.message && error.message.includes('invalid_grant')) {
      res.status(401).send('Your Google session has expired. Please log out and log back in.');
    } else {
      res.status(500).send('An unexpected error occurred while scanning emails.');
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});


