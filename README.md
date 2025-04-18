# Glitzy - AI-Powered Trip Planning App

Glitzy is a full-stack mobile application that helps users plan trips with their friends. The app features AI-powered trip suggestions, real-time group chat, and expense tracking with bill splitting.

## 📱 App Overview

Glitzy streamlines the trip planning process with these core features:

### 🔗 User Flow

**Friendship System:**
- Users must be friends before planning trips together
- Add/accept friend requests

**Trip Group Creation:**
- Create trip groups with selected friends
- AI suggests must-visit locations based on the destination
- Select from AI suggestions or add your own places

**Group Details:**
- Real-time group chat
- Add/edit/delete plans
- AI auto-generates a trip itinerary considering:
  - Selected places
  - Travel time between locations
  - Rest time, meals, etc.

**Expense Module:**
- Log purchases during the trip
- After the trip ends, the app calculates and splits the bill fairly among group members

## ⚙️ Tech Stack

- **Frontend**: React Native + TailwindCSS
- **Backend**: Node.js with Express
- **APIs**: RESTful (with mock data initially)
- **Features**: Authentication, AI-powered suggestions, group chat, expense tracking

## 📁 Project Structure

```
glitzy-app/
├── frontend/                # React Native app
│   ├── app/                 # Expo Router screens
│   │   ├── (auth)/          # Authentication screens
│   │   └── (tabs)/          # Main app tabs
│   ├── components/          # Reusable UI components
│   ├── constants/           # App constants
│   ├── services/            # API services
│   ├── store/               # State management
│   └── types/               # TypeScript type definitions
│
└── backend/                 # Express.js server
    ├── prisma/              # Database schema
    └── src/
        ├── modules/         # Feature modules
        │   ├── user/        # User authentication
        │   ├── friends/     # Friend management
        │   ├── groups/      # Trip groups
        │   ├── chat/        # Real-time chat
        │   ├── expense/     # Expense tracking
        │   └── travel-recommendations/ # AI recommendations
        └── shared/          # Shared utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- React Native development environment

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/glitzy-app.git
   cd glitzy-app
   ```

2. Install dependencies
   ```
   npm run install:all
   ```

3. Set up environment variables
   ```
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` file with your database and API keys

4. Start the development servers
   ```
   npm start
   ```

## 🧠 AI Integration

Glitzy uses AI to enhance the trip planning experience:

1. **Location Recommendations**: AI suggests must-visit places based on the destination and user interests
2. **Itinerary Generation**: AI creates optimized daily schedules considering:
   - Selected locations
   - Opening hours
   - Travel time
   - Meal breaks
   - Rest periods

## 📊 Expense Splitting

The expense module allows users to:

1. Log expenses during the trip
2. Specify who paid and who should pay
3. Split bills equally, by percentage, or fixed amounts
4. View a summary of who owes whom
5. Mark expenses as paid

## 📱 Screenshots

[Coming soon]

## 📄 License

This project is licensed under the ISC License.
