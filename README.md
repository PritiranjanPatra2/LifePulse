# LifePulse – Personal Lifestyle Analytics Dashboard

**LifePulse** is a modern, production-quality full-stack personal lifestyle tracking and analytics platform. Built with a Power BI inspired design aesthetic, it transforms everyday lifestyle information into meaningful visual analytics.

---

## 🌟 Key Features

1. **Dashboard Overview**
   - 8 dynamic summary cards with daily targets, progress rings, and yesterday comparisons:
     - Calories Consumed (kcal)
     - Hydration Consumed (ml)
     - Walking Steps Walked
     - Exercise Duration (mins)
     - Sleep Duration (hours)
     - Meals Logged
     - Current Weight (kg)
     - Overall Health & Daily Goal Completion (%)
   - Signature animated water bottle
   - Macronutrient balance bar
   - 7-day walking step trends
   - Recent activity feed & today's meals

2. **Daily Tracker Command Center**
   - Single-screen logging for any chosen date
   - Sections for Food, Water, Fitness, Walking, Sleep, Weight, and Daily Reflection Journal
   - Instant quick logging modal accessible globally from the top navigation

3. **Nutrition & Food Tracker**
   - Searchable food library with categories (Grains, Cereals, Fruits, Vegetables, Dairy, Protein, Indian Snacks, Beverages, Nuts/Seeds)
   - Common Indian foods included (Idli, Dosa, Upma, Poha, Bara, Dal Tadka, Paneer, Curd, Chicken Curry, Fish, Chapati, etc.)
   - Pure emoji-based selection (No photographs or slow image uploads)
   - Real-time proportional macronutrient recalculation based on serving quantity
   - Custom food item creator with custom emoji icon support

4. **Signature Animated Water Tracker**
   - Framer Motion SVG water bottle simulation
   - Multi-layer sine wave fluid movement with floating, rising bubbles
   - Configurable personal targets (default 4.0 Litres)
   - Quick-add buttons (+100ml, +250ml, +500ml, custom amount)
   - Individual timestamped transactions with undo capability

5. **Fitness & Activity Tracker**
   - Activities: Walking, Running, Gym, Cycling, Yoga, Swimming, Football, Badminton, Stretching, Other
   - MET-based calorie burn estimation based on user weight, duration, and intensity
   - Activity category distribution donut chart

6. **Sleep & Recovery Tracker**
   - Bedtime and wake-up time logging
   - Automatic cross-midnight duration calculation (e.g. 23:00 to 07:30 = 8.5 hours)
   - Restorative sleep quality ratings and 7-day sleep consistency area chart

7. **Weight Management Tracker**
   - Starting, Current, and Target weight tracking
   - Automated BMI calculation
   - Net change and progress percentage
   - Historical line chart with weekly and monthly filters

8. **Advanced Power BI-Style Analytics**
   - 13 comprehensive visualization charts:
     1. Daily Calorie Intake – Bar Chart
     2. Weekly Steps – Bar Chart
     3. Hydration Trends – Area Chart
     4. Sleep Duration – Area Chart
     5. Exercise Distribution – Donut Chart
     6. Nutrition Breakdown – Pie Chart
     7. Weight Progress – Line Chart
     8. Weekly Activity Comparison – Grouped Bar Chart
     9. Meal-Wise Calorie Distribution – Stacked Bar Chart
     10. Daily Habit Consistency – 60-Day Contribution Heatmap
     11. Lifestyle Performance – 6-Pillar Radar Chart
     12. Monthly Activity Trends – Area Chart
     13. Daily Goal Completion – Composite Progress Chart
   - Global date filters (Today, Yesterday, Last 7D, Last 30D, This Week, Prev Week, This Month, Prev Month, Custom)
   - Category filters (Nutrition, Water, Steps, Exercise, Sleep, Weight)
   - Period-over-period comparison metrics (+% or -% change)
   - Automated rule-based insights engine

9. **Reports & High-Resolution PNG Export**
   - Dedicated Power BI-style report card
   - High-resolution PNG export via `html-to-image` (Supports 2x HD and 3x Ultra HD print ready)
   - Customizable sections (toggle Nutrition, Hydration, Steps, Sleep, Radar, Heatmap)

10. **Goals & Habit Mastery**
    - Daily habit checklist with instant celebration confetti
    - Real-time streaks calculation
    - Achievement badges (First Step, Consistency Kick, Week Champion, Habit Master)
    - GitHub-style 60-day contribution heatmap

11. **Settings & Themes**
    - Dark mode and Light mode with instant toggle
    - Preset avatar icons
    - Configurable daily targets for steps, water, calories, exercise, and sleep

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - React Router DOM
  - Redux Toolkit
  - Axios
  - Recharts
  - Framer Motion
  - Lucide React
  - html-to-image
  - canvas-confetti

- **Backend**:
  - Node.js & Express.js
  - REST API Architecture
  - JWT Authentication
  - bcrypt password hashing
  - Mongoose & MongoDB (with automatic persistent embedded MongoDB engine fallback)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Quick Run

#### Start Backend Server:
```bash
cd server
npm start
```
The server will start on `http://localhost:5000`. If an external MongoDB is running at `mongodb://127.0.0.1:27017/lifepulse`, it connects automatically. If not, it seamlessly starts the embedded persistent MongoDB engine and seeds the initial food library and demo account.

#### Start Frontend Client (Development Mode):
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

#### Build for Production:
```bash
cd client
npm run build
```
Once built, the Express backend automatically serves the production frontend at `http://localhost:5000/`.

---

## 🔑 Demo Account Credentials

A demo account pre-populated with 14 days of realistic lifestyle tracking history is available for instant evaluation:

- **Email**: `demo@lifepulse.io`
- **Password**: `password123`

You can also click the **"Quick Demo Login"** button on the login screen, or click **"Create your account"** to register a fresh, private user account.

---

## 📂 Project Structure

```
LifePulse/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # Button, Card, Modal, Badge, Skeleton, AvatarPicker
│   │   │   ├── charts/         # 13 Recharts & Heatmap visualizations
│   │   │   ├── dashboard/      # QuickAddModal
│   │   │   ├── hydration/      # WaterBottle (animated SVG), QuickAdd, History
│   │   │   ├── nutrition/      # FoodLibraryModal, MealCard, MacroNutrientBar
│   │   │   └── layout/         # Sidebar, Navbar
│   │   ├── constants/          # Emojis, Food database, Routes, Config
│   │   ├── layouts/            # MainLayout
│   │   ├── pages/              # 11 Dashboard & Analytics Pages + Auth
│   │   ├── services/           # Axios API services
│   │   ├── store/              # Redux slices (Auth, Date, Theme)
│   │   ├── App.jsx             # React Router with Protected Routes
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/                 # MongoDB connection & embedded engine fallback
│   ├── controllers/            # REST API controllers
│   ├── middleware/             # JWT auth protection & error handling
│   ├── models/                 # 11 Mongoose Schemas (User, Meal, WaterLog, etc.)
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Seed data & JWT generator
│   ├── app.js                  # Express application setup
│   └── server.js               # Entry point
│
└── README.md
```

---

## 🔒 Security & Data Isolation

- Every tracking record (meals, water, steps, workouts, sleep, weight, habits) is strictly referenced to the authenticated user ID (`user: req.user.id`).
- All queries enforce user isolation; no user can view or modify records belonging to other users.
- Passwords are encrypted using bcrypt with salt rounds.
- JWT tokens are validated through authorization middleware on all private API endpoints.

