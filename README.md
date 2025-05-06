# Spanish Tax Buddy

A modern, AI-powered tax form assistant web application for Spanish residents. This application helps users fill out Spanish tax forms through an interactive chat, manual entry, or by uploading a previously filled PDF for data extraction using OCR.

## Features

- **AI Chat Assistant**: Get guided help in filling your forms
- **Manual Input**: Fill out forms on your own with a user-friendly interface
- **Upload & OCR**: Extract data from existing forms
- **Live PDF Preview**: See changes in real-time
- **Multiple Languages**: Available in English and Spanish
- **Secure Authentication**: Firebase-based user authentication
- **Admin Panel**: Manage tax forms and user data

## Tech Stack

- **Frontend**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend Services**: Firebase (Authentication, Firestore, Storage)
- **PDF Processing**: pdf-lib
- **OCR**: Tesseract.js
- **AI Integration**: OpenAI API

## Project Structure

```
src/
├── components/          // UI components (chat, forms, previews)
├── pages/               // Main routes (Home, Dashboard, Admin)
├── features/            // Modular feature logic
│   ├── auth/            // Login/Signup using Firebase Auth
│   ├── forms/           // Form selection, rendering, input
│   ├── ai-assistant/    // Chatbot logic and prompt flow
│   ├── pdf/             // PDF viewer/editor + generation
│   └── upload/          // OCR + file handling
├── lib/                 // Utility functions (firebase, openai, etc.)
├── context/             // Global state/context (user, form, language)
├── styles/              // Tailwind and global styles
└── app.tsx              // Root component
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/spanish-tax-buddy.git
   cd spanish-tax-buddy
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on `.env.example` and fill in your Firebase and OpenAI API credentials:

   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage services
3. Set up Authentication methods (Email/Password and Google)
4. Create Firestore database with appropriate security rules
5. Set up Storage with appropriate security rules

### Deployment

To build the project for production:

```bash
npm run build
# or
yarn build
```

Deploy to Vercel:

```bash
npx vercel --prod
```

## Security and Compliance

- HTTPS required for all communications
- Firebase security rules to protect user data
- GDPR-compliant data handling
- Secure user authentication
- Data encryption in transit and at rest

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Firebase](https://firebase.google.com/)
- [pdf-lib](https://pdf-lib.js.org/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [OpenAI](https://openai.com/)
