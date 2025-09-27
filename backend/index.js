// require('dotenv').config();
// const express = require('express');
// const { google } = require('googleapis');
// const cors = require('cors');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const app = express();

// // --- Secure CORS Configuration for Production ---
// const allowedOrigins = [
//   'http://localhost:5173', // Your local dev environment
//   process.env.YOUR_SITE_URL // Your live frontend URL from .env
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // --- THIS IS THE DEBUGGING LOG ---
//     console.log(`[CORS CHECK] Request Origin: ${origin}`);
//     console.log(`[CORS CHECK] Allowed Origins: ${allowedOrigins}`);

//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// app.use((req, res, next) => {
//   res.set('Cache-Control', 'no-store');
//   next();
// });

// // The redirect URI is now pulled from your environment variables
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI 
// );

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // --- AUTH ROUTES ---
// app.get('/auth/google', (req, res) => {
//   const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
//   try {
//     const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });
//     res.json({ authUrl: url });
//   } catch (error) {
//     console.error('[ERROR] Failed to generate Google Auth URL:', error);
//     res.status(500).send('Error generating Google authentication URL.');
//   }
// });

// app.get('/auth/google/callback', async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) throw new Error('No code received from Google.');
//     const { tokens } = await oauth2Client.getToken(code);
//     const accessToken = tokens.access_token;
//     // This now correctly redirects to the frontend URL defined in your environment
//     res.redirect(`${process.env.YOUR_SITE_URL}/#token=${accessToken}`);
//   } catch (error) {
//     console.error('[FATAL ERROR IN CALLBACK]', error.message);
//     res.status(500).send('Authentication failed on the server.');
//   }
// });

// app.get('/logout', (req, res) => {
//   res.status(200).send('Server acknowledged logout.');
// });

// // --- HELPER & AI FUNCTIONS ---
// function getEmailBody(payload) {
//   let body = '';
//   if (payload.parts) {
//     const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
//     if (textPart && textPart.body && textPart.body.data) {
//       body = Buffer.from(textPart.body.data, 'base64').toString('utf8');
//     }
//   } else if (payload.body && payload.body.data) {
//     body = Buffer.from(payload.body.data, 'base64').toString('utf8');
//   }
//   return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
// }

// async function extractDetailsWithAI(emailText) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
//     const prompt = `
//       You are an expert data extraction bot. Analyze the following email text and extract these specific details.
//       Respond ONLY with a valid JSON object. Do not include any text before or after the JSON object.
//       The JSON object must have these keys: "productName", "price", "type", "transactionDate", "orderNumber", and "renewalFrequency".

//       - "productName": The primary product, service, or name of the store.
//       - "price": The total cost mentioned, including the currency symbol (e.g., "$9.99", "₹850").
//       - "type": Classify as "Order" or "Subscription".
//       - "transactionDate": Find the date of the order or billing. Format it as a simple, readable string like "Sep 26, 2025".
//       - "orderNumber": If this is an order, find the order number (e.g., "#4024").
//       - "renewalFrequency": If this is a subscription, find the billing cycle (e.g., 'Monthly', 'Yearly', 'Billed Annually').
//       If a value for any key is not found, use the value null.

//       Email Text: "${emailText.substring(0, 8000)}"
//     `;
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     const jsonString = text.replace(/^```json\n/, '').replace(/\n```$/, '');
//     return JSON.parse(jsonString);

//   } catch (error) {
//     console.error("AI extraction failed:", error);
//     return { productName: "AI Error", price: null, type: "Error", transactionDate: null, orderNumber: null, renewalFrequency: null };
//   }
// }

// app.get('/scan-emails', async (req, res) => {
//     // This route is unchanged, the error happens before this is even called.
//     // ...
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Backend server is running on http://localhost:${PORT}`);
// });









// TEST

require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// --- Secure CORS Configuration for Production ---
const allowedOrigins = [
  'http://localhost:5173', // Your local dev environment
  process.env.YOUR_SITE_URL // Your live frontend URL from .env
];

app.use(cors({
  origin: function (origin, callback) {
    // This logic allows requests from the origins defined in the `allowedOrigins` array.
    console.log(`[CORS CHECK] Request Origin: ${origin}`);
    console.log(`[CORS CHECK] Allowed Origins: ${allowedOrigins}`);

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  }
}));

// Middleware to prevent browser caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// The redirect URI is now correctly and securely pulled from your environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI 
);

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTHENTICATION ROUTES ---

// Route to generate the Google authentication URL
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

// The callback route that Google redirects to after successful login
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('No code received from Google.');
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    // This now correctly redirects to the live frontend URL defined in your environment
    res.redirect(`${process.env.YOUR_SITE_URL}/#token=${accessToken}`);
  } catch (error) {
    console.error('[FATAL ERROR IN CALLBACK]', error.message);
    res.status(500).send('Authentication failed on the server.');
  }
});

// Simple logout route
app.get('/logout', (req, res) => {
  res.status(200).send('Server acknowledged logout.');
});


// --- HELPER & AI FUNCTIONS ---

// Helper function to decode email body from base64
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

// AI function to extract details using the latest Google Gemini model
async function extractDetailsWithAI(emailText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
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
    // Return a structured error object if the AI fails
    return { productName: "AI Error", price: null, type: "Error", transactionDate: null, orderNumber: null, renewalFrequency: null };
  }
}

// The main route to scan emails
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
    if (messages.length === 0) {
      return res.json([]);
    }
    
    // Fetch all email bodies in parallel for speed
    const messagePromises = messages.map(message => 
      gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' })
    );
    const fullMessages = await Promise.all(messagePromises);

    console.log(`[LOG] Found ${fullMessages.length} emails. Starting AI processing...`);

    // Call the AI for each email in parallel
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
    // Provide specific error messages for common issues like expired tokens
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




















