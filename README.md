SubSleuth 🕵️‍♂️ — AI-Powered Subscription & Order Detector
<p align="center">
<img width="1919" height="973" alt="image" src="https://github.com/user-attachments/assets/e7a7cdd5-c162-4f74-a3aa-1f61b53f5d97" />
</p>

<p align="center">
<strong><em>Live Demo:</em></strong> <a href="https://subsleuth.vercel.app" target="_blank"><strong>https://subsleuth.vercel.app</strong></a>

</p>

SubSleuth is a modern, full-stack web application that intelligently scans your Gmail inbox to automatically find, extract, and visualize your digital subscriptions and online orders. In a world of subscription creep and forgotten free trials, SubSleuth provides a clear, beautiful dashboard to help you understand exactly where your money is going.

This project was built from the ground up, leveraging a secure Google OAuth flow for authentication and Google's powerful Gemini AI for intelligent data extraction from email bodies.

✨ Key Features
Secure Google Authentication: Uses the official Google OAuth 2.0 flow, only requesting read-only permissions. The application never sees or stores your password.

AI-Powered Data Extraction: Leverages the Google Gemini AI to intelligently parse unstructured email text and extract key details like:

Product/Service Name

Price (including currency)

Transaction Type (Order vs. Subscription)

Transaction Date

Order Number

Renewal Frequency (e.g., "Monthly", "Yearly")

Hyper-Modern Dashboard: A visually stunning and interactive dashboard built with React and Tailwind CSS, featuring:

Glassmorphism UI: A sleek, modern design with frosted-glass effects.

KPI Cards: At-a-glance summaries of total spending, monthly costs, and transaction counts.

Data Visualization: An animated doughnut chart provides a clear breakdown of spending.

Interactive Bento Grid: A hyper-reactive grid showcasing your most recent activity.

Fully Responsive: A seamless experience across desktop, tablet, and mobile devices.

Stateless Token-Based Auth: Implements a professional, stateless authentication flow where tokens are managed securely on the client-side.

🛠️ Tech Stack
This project is a full-stack application composed of a React frontend and a Node.js backend.

Category

Technology

Frontend

React, TypeScript, Vite, Tailwind CSS, Chart.js

Backend

Node.js, Express.js, Google API Client, Google Gemini AI

Hosting

Frontend: Vercel, Backend: Render

APIs

Google OAuth 2.0, Gmail API, Google Gemini API

🚀 Getting Started
To run this project on your local machine, please follow these steps.

Prerequisites
Node.js (v18 or newer) installed on your machine.

A Google Account to create API credentials.

1. Clone the Repository
git clone [https://github.com/your-username/SubSleuth.git](https://github.com/tanmaygalav/SubSleuth.git)
cd SubSleuth

2. Set Up Google Cloud Credentials
Before you can run the app, you need to get API keys from Google.

Go to the Google Cloud Console and create a new project.

Enable the Gmail API.

Go to "APIs & Services" > "OAuth consent screen", configure it for External users, and add your own Google account to the list of Test users.

Go to "Credentials" and create a new "OAuth 2.0 Client ID" for a Web application.

Add the following URIs:

Authorized JavaScript origins: http://localhost:5173

Authorized redirect URIs: http://localhost:3000/auth/google/callback

Save your Client ID and Client Secret.

Go to Google AI Studio and create a new API key for the Gemini AI.

3. Configure the Backend
Navigate to the backend directory:

cd backend

Install the necessary dependencies:

npm install

Create a new file named .env in the backend folder and add the following variables, replacing the placeholders with your actual credentials:

# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Google AI API Key
GOOGLE_AI_API_KEY=YOUR_GOOGLE_AI_API_KEY

# URLs for local development
YOUR_SITE_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

Start the backend server:

node index.js

Your backend should now be running on http://localhost:3000.

4. Configure the Frontend
Open a new terminal and navigate to the frontend directory:

cd frontend-react 

Install the dependencies:

npm install

Create a new file named .env in the frontend-react folder and add the following variable:

VITE_API_BASE_URL=http://localhost:3000

Start the frontend development server:

npm run dev

Your frontend should now be running on http://localhost:5173. You can open this address in your browser to use the application.

🚢 Deployment
This application is deployed with a modern CI/CD workflow:

The React frontend is hosted on Vercel, which automatically builds and deploys any changes pushed to the main branch.

The Node.js backend is hosted on Render as a Web Service. It is also configured to automatically redeploy upon new commits to the main branch.

All production environment variables are configured securely within the Vercel and Render project settings.
