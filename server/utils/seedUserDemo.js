require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Food = require('../models/Food');
const Meal = require('../models/Meal');
const WaterLog = require('../models/WaterLog');
const Exercise = require('../models/Exercise');
const DailyLog = require('../models/DailyLog');
const SleepLog = require('../models/SleepLog');
const WeightLog = require('../models/WeightLog');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { seedInitialFoods } = require('./seed');

const seedDemoData = async () => {
  try {
    await connectDB();
    await seedInitialFoods();

    console.log('[LifePulse Seed] Setting up demo user: demo@lifepulse.io ...');

    let user = await User.findOne({ email: 'demo@lifepulse.io' });
    if (user) {
      // Clear previous demo records to keep fresh
      await Promise.all([
        Meal.deleteMany({ user: user._id }),
        WaterLog.deleteMany({ user: user._id }),
        Exercise.deleteMany({ user: user._id }),
        DailyLog.deleteMany({ user: user._id }),
        SleepLog.deleteMany({ user: user._id }),
        WeightLog.deleteMany({ user: user._id }),
        Habit.deleteMany({ user: user._id }),
        HabitLog.deleteMany({ user: user._id }),
        Goal.deleteMany({ user: user._id }),
      ]);
    } else {
      user = await User.create({
        name: 'Alex Morgan',
        email: 'demo@lifepulse.io',
        password: 'password123',
        avatar: 'pulse-avatar-1',
        height: 175,
        weight: 72.5,
        gender: 'male',
        activityLevel: 'active',
        preferences: {
          theme: 'dark',
          unitSystem: 'metric',
          dateFormat: 'yyyy-MM-dd',
          strideLengthCm: 75,
        },
      });
    }

    // Goal
    await Goal.create({
      user: user._id,
      waterMl: 4000,
      steps: 10000,
      calories: 2200,
      proteinGrams: 85,
      carbsGrams: 240,
      fatGrams: 60,
      exerciseMinutes: 45,
      sleepHours: 8,
      startingWeight: 75.0,
      targetWeight: 68.0,
    });

    // Habits
    const habits = await Habit.insertMany([
      { user: user._id, name: 'Morning Walk', emoji: '🚶', color: '#1ea678', targetDaysPerWeek: 7 },
      { user: user._id, name: 'Hydration (3L+)', emoji: '💧', color: '#06b6d4', targetDaysPerWeek: 7 },
      { user: user._id, name: 'No Sugary Drinks', emoji: '🥤', color: '#ef4444', targetDaysPerWeek: 6 },
      { user: user._id, name: '10 Min Meditation', emoji: '🧘', color: '#8b5cf6', targetDaysPerWeek: 5 },
      { user: user._id, name: 'Sleep by 11 PM', emoji: '🌙', color: '#3b82f6', targetDaysPerWeek: 7 },
    ]);

    // Available foods for generating realistic meals
    const foods = await Food.find({ user: null });
    const getFood = (name) => foods.find((f) => f.name.toLowerCase().includes(name.toLowerCase())) || foods[0];

    const today = new Date();

    console.log('[LifePulse Seed] Generating 14 days of realistic lifestyle records...');

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // 1. Water logs (2 - 5 separate transactions per day)
      const waterAmounts = [250, 500, 500, 250, 500, 500, 250, 250];
      const dailyTransactions = 3 + (i % 4);
      for (let w = 0; w < dailyTransactions; w++) {
        const logTime = new Date(d);
        logTime.setHours(8 + w * 2, 15 + (w * 10) % 40, 0);
        await WaterLog.create({
          user: user._id,
          date: dateStr,
          amountMl: waterAmounts[w % waterAmounts.length],
          loggedAt: logTime,
          note: w === 0 ? 'Morning hydration' : 'Water refill',
        });
      }

      // 2. Steps & DailyLog
      const baseSteps = 8500 + ((i * 739) % 4500);
      const distanceKm = Math.round(((baseSteps * 75) / 100000) * 100) / 100;
      await DailyLog.create({
        user: user._id,
        date: dateStr,
        steps: baseSteps,
        distanceKm,
        notes: i === 0 ? 'Felt energetic throughout the day!' : 'Productive routine.',
        overallMood: i % 3 === 0 ? 'great' : 'good',
      });

      // 3. SleepLog
      const bedHours = 22 + (i % 2); // 22 or 23
      const wakeHours = 6 + ((i + 1) % 2); // 6 or 7
      const sleepMinutes = 420 + ((i * 35) % 90); // 7 to 8.5 hours
      await SleepLog.create({
        user: user._id,
        date: dateStr,
        bedtime: `${bedHours}:30`,
        wakeTime: `0${wakeHours}:30`,
        durationMinutes: sleepMinutes,
        quality: i % 4 === 0 ? 'excellent' : 'good',
        notes: 'Restful sleep',
      });

      // 4. Exercise (1 session most days)
      if (i % 6 !== 2) {
        const exTypes = [
          { name: 'Morning Jog in Park', cat: 'Running', emoji: '🏃', dur: 35, cals: 320 },
          { name: 'Upper Body Workout', cat: 'Gym', emoji: '🏋️', dur: 50, cals: 380 },
          { name: 'Evening Cycling', cat: 'Cycling', emoji: '🚴', dur: 45, cals: 310 },
          { name: 'Vinyasa Flow Yoga', cat: 'Yoga', emoji: '🧘', dur: 40, cals: 160 },
          { name: 'Brisk Walking', cat: 'Walking', emoji: '🚶', dur: 30, cals: 140 },
          { name: 'Badminton Match', cat: 'Badminton', emoji: '🏸', dur: 45, cals: 280 },
        ];
        const selected = exTypes[i % exTypes.length];
        await Exercise.create({
          user: user._id,
          date: dateStr,
          name: selected.name,
          category: selected.cat,
          emoji: selected.emoji,
          durationMinutes: selected.dur,
          startTime: '07:30',
          intensity: 'medium',
          caloriesBurned: selected.cals,
          notes: 'Great workout session',
        });
      }

      // 5. Weight measurement (every 2-3 days)
      if (i % 2 === 0) {
        const progressiveWeight = Math.round((74.5 - (13 - i) * 0.15) * 10) / 10;
        await WeightLog.create({
          user: user._id,
          date: dateStr,
          weightKg: progressiveWeight,
          notes: 'Morning weigh-in',
        });
      }

      // 6. Meals (Breakfast, Lunch, Dinner, Snack)
      const idli = getFood('Idli');
      const dal = getFood('Dal');
      const rice = getFood('Rice');
      const chicken = getFood('Chicken');
      const salad = getFood('Salad');
      const apple = getFood('Apple');
      const roti = getFood('Roti');

      // Breakfast
      await Meal.create({
        user: user._id,
        date: dateStr,
        category: 'Breakfast',
        name: 'South Indian Breakfast',
        emoji: '🥞',
        items: [
          {
            name: idli.name,
            emoji: idli.emoji,
            quantity: 2,
            servingSize: idli.servingSize,
            servingUnit: idli.servingUnit,
            calories: idli.calories * 2,
            protein: idli.protein * 2,
            carbs: idli.carbs * 2,
            fat: idli.fat * 2,
          },
          {
            name: apple.name,
            emoji: apple.emoji,
            quantity: 1,
            servingSize: apple.servingSize,
            servingUnit: apple.servingUnit,
            calories: apple.calories,
            protein: apple.protein,
            carbs: apple.carbs,
            fat: apple.fat,
          },
        ],
        totalCalories: idli.calories * 2 + apple.calories,
        totalProtein: idli.protein * 2 + apple.protein,
        totalCarbs: idli.carbs * 2 + apple.carbs,
        totalFat: idli.fat * 2 + apple.fat,
        notes: 'Felt fresh and light',
      });

      // Lunch
      await Meal.create({
        user: user._id,
        date: dateStr,
        category: 'Lunch',
        name: 'Traditional Thali Lunch',
        emoji: '🍛',
        items: [
          {
            name: rice.name,
            emoji: rice.emoji,
            quantity: 1.5,
            servingSize: rice.servingSize,
            servingUnit: rice.servingUnit,
            calories: Math.round(rice.calories * 1.5),
            protein: Math.round(rice.protein * 1.5),
            carbs: Math.round(rice.carbs * 1.5),
            fat: Math.round(rice.fat * 1.5),
          },
          {
            name: dal.name,
            emoji: dal.emoji,
            quantity: 1,
            servingSize: dal.servingSize,
            servingUnit: dal.servingUnit,
            calories: dal.calories,
            protein: dal.protein,
            carbs: dal.carbs,
            fat: dal.fat,
          },
          {
            name: salad.name,
            emoji: salad.emoji,
            quantity: 1,
            servingSize: salad.servingSize,
            servingUnit: salad.servingUnit,
            calories: salad.calories,
            protein: salad.protein,
            carbs: salad.carbs,
            fat: salad.fat,
          },
        ],
        totalCalories: Math.round(rice.calories * 1.5) + dal.calories + salad.calories,
        totalProtein: Math.round(rice.protein * 1.5) + dal.protein + salad.protein,
        totalCarbs: Math.round(rice.carbs * 1.5) + dal.carbs + salad.carbs,
        totalFat: Math.round(rice.fat * 1.5) + dal.fat + salad.fat,
      });

      // Dinner
      await Meal.create({
        user: user._id,
        date: dateStr,
        category: 'Dinner',
        name: 'High Protein Dinner',
        emoji: '🍽️',
        items: [
          {
            name: roti.name,
            emoji: roti.emoji,
            quantity: 2,
            servingSize: roti.servingSize,
            servingUnit: roti.servingUnit,
            calories: roti.calories * 2,
            protein: roti.protein * 2,
            carbs: roti.carbs * 2,
            fat: roti.fat * 2,
          },
          {
            name: chicken.name,
            emoji: chicken.emoji,
            quantity: 1,
            servingSize: chicken.servingSize,
            servingUnit: chicken.servingUnit,
            calories: chicken.calories,
            protein: chicken.protein,
            carbs: chicken.carbs,
            fat: chicken.fat,
          },
        ],
        totalCalories: roti.calories * 2 + chicken.calories,
        totalProtein: roti.protein * 2 + chicken.protein,
        totalCarbs: roti.carbs * 2 + chicken.carbs,
        totalFat: roti.fat * 2 + chicken.fat,
      });

      // 7. Habit logs
      for (const h of habits) {
        if ((i + h.name.length) % 3 !== 0) {
          await HabitLog.create({
            user: user._id,
            habit: h._id,
            date: dateStr,
            completed: true,
          });
        }
      }
    }

    console.log('[LifePulse Seed] Demo data seeded successfully!');
    console.log('Demo Credentials:');
    console.log('Email: demo@lifepulse.io');
    console.log('Password: password123');

    await closeDB();
  } catch (err) {
    console.error('[LifePulse Seed Error]:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDemoData();
}

module.exports = { seedDemoData };

