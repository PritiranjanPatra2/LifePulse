const Meal = require('../models/Meal');
const WaterLog = require('../models/WaterLog');
const Exercise = require('../models/Exercise');
const DailyLog = require('../models/DailyLog');
const SleepLog = require('../models/SleepLog');
const WeightLog = require('../models/WeightLog');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// Helper to get previous date string YYYY-MM-DD
const getPrevDateStr = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

// @desc    Get complete dashboard summary for a specific date
// @route   GET /api/dashboard/:date
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const today = req.params.date || new Date().toISOString().split('T')[0];
    const yesterday = getPrevDateStr(today);
    const userId = req.user._id;

    // Fetch user goals
    let goal = await Goal.findOne({ user: userId });
    if (!goal) {
      goal = {
        waterMl: 4000,
        steps: 10000,
        calories: 2200,
        exerciseMinutes: 45,
        sleepHours: 8,
        targetWeight: 68,
        startingWeight: 72,
      };
    }

    // 1. Meals & Calories for today & yesterday
    const [todayMeals, yesterdayMeals] = await Promise.all([
      Meal.find({ user: userId, date: today }),
      Meal.find({ user: userId, date: yesterday }),
    ]);

    const caloriesToday = todayMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
    const caloriesYesterday = yesterdayMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
    const proteinToday = Math.round(todayMeals.reduce((sum, m) => sum + (m.totalProtein || 0), 0) * 10) / 10;
    const carbsToday = Math.round(todayMeals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0) * 10) / 10;
    const fatToday = Math.round(todayMeals.reduce((sum, m) => sum + (m.totalFat || 0), 0) * 10) / 10;

    // 2. Water for today & yesterday
    const [todayWaterLogs, yesterdayWaterLogs] = await Promise.all([
      WaterLog.find({ user: userId, date: today }).sort({ loggedAt: -1 }),
      WaterLog.find({ user: userId, date: yesterday }),
    ]);

    const waterToday = todayWaterLogs.reduce((sum, w) => sum + (w.amountMl || 0), 0);
    const waterYesterday = yesterdayWaterLogs.reduce((sum, w) => sum + (w.amountMl || 0), 0);

    // 3. Steps & DailyLog for today & yesterday
    const [todayDailyLog, yesterdayDailyLog] = await Promise.all([
      DailyLog.findOne({ user: userId, date: today }),
      DailyLog.findOne({ user: userId, date: yesterday }),
    ]);

    const stepsToday = todayDailyLog ? todayDailyLog.steps : 0;
    const stepsYesterday = yesterdayDailyLog ? yesterdayDailyLog.steps : 0;
    const distanceToday = todayDailyLog ? todayDailyLog.distanceKm : 0;

    // 4. Exercise for today & yesterday
    const [todayExercises, yesterdayExercises] = await Promise.all([
      Exercise.find({ user: userId, date: today }).sort({ createdAt: -1 }),
      Exercise.find({ user: userId, date: yesterday }),
    ]);

    const exerciseMinutesToday = todayExercises.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const exerciseMinutesYesterday = yesterdayExercises.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const exerciseCaloriesToday = todayExercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);

    // 5. Sleep for today & yesterday
    const [todaySleep, yesterdaySleep] = await Promise.all([
      SleepLog.findOne({ user: userId, date: today }),
      SleepLog.findOne({ user: userId, date: yesterday }),
    ]);

    const sleepMinutesToday = todaySleep ? todaySleep.durationMinutes : 0;
    const sleepMinutesYesterday = yesterdaySleep ? yesterdaySleep.durationMinutes : 0;
    const sleepHoursToday = Math.round((sleepMinutesToday / 60) * 10) / 10;

    // 6. Weight (latest recorded up to today)
    const latestWeightLog = await WeightLog.findOne({
      user: userId,
      date: { $lte: today },
    }).sort({ date: -1 });

    const currentWeight = latestWeightLog ? latestWeightLog.weightKg : (req.user.weight || 70);

    // 7. Habits for today
    const habits = await Habit.find({ user: userId, isActive: true });
    const habitLogsToday = await HabitLog.find({ user: userId, date: today, completed: true });
    const totalHabits = habits.length;
    const completedHabits = habitLogsToday.length;
    const habitCompletionPct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // 8. Overall Daily Goal Completion percentage
    // Calculated across: Calories, Water, Steps, Exercise, Sleep
    const goalScores = [
      Math.min((caloriesToday / (goal.calories || 2200)) * 100, 100),
      Math.min((waterToday / (goal.waterMl || 4000)) * 100, 100),
      Math.min((stepsToday / (goal.steps || 10000)) * 100, 100),
      Math.min((exerciseMinutesToday / (goal.exerciseMinutes || 45)) * 100, 100),
      Math.min(((sleepMinutesToday / 60) / (goal.sleepHours || 8)) * 100, 100),
    ];
    const overallGoalProgress = Math.round(
      goalScores.reduce((sum, val) => sum + val, 0) / goalScores.length
    );

    // Summary Cards Data
    const summaryCards = {
      calories: {
        value: caloriesToday,
        target: goal.calories || 2200,
        unit: 'kcal',
        percentage: Math.min(Math.round((caloriesToday / (goal.calories || 2200)) * 100), 100),
        remaining: Math.max((goal.calories || 2200) - caloriesToday, 0),
        diffFromYesterday: caloriesToday - caloriesYesterday,
      },
      water: {
        value: waterToday,
        target: goal.waterMl || 4000,
        unit: 'ml',
        percentage: Math.min(Math.round((waterToday / (goal.waterMl || 4000)) * 100), 100),
        remaining: Math.max((goal.waterMl || 4000) - waterToday, 0),
        diffFromYesterday: waterToday - waterYesterday,
      },
      steps: {
        value: stepsToday,
        target: goal.steps || 10000,
        unit: 'steps',
        percentage: Math.min(Math.round((stepsToday / (goal.steps || 10000)) * 100), 100),
        remaining: Math.max((goal.steps || 10000) - stepsToday, 0),
        diffFromYesterday: stepsToday - stepsYesterday,
        distanceKm: distanceToday,
      },
      exercise: {
        value: exerciseMinutesToday,
        target: goal.exerciseMinutes || 45,
        unit: 'min',
        percentage: Math.min(Math.round((exerciseMinutesToday / (goal.exerciseMinutes || 45)) * 100), 100),
        remaining: Math.max((goal.exerciseMinutes || 45) - exerciseMinutesToday, 0),
        diffFromYesterday: exerciseMinutesToday - exerciseMinutesYesterday,
        caloriesBurned: exerciseCaloriesToday,
      },
      sleep: {
        value: sleepHoursToday,
        target: goal.sleepHours || 8,
        unit: 'hrs',
        percentage: Math.min(Math.round((sleepHoursToday / (goal.sleepHours || 8)) * 100), 100),
        remaining: Math.max(Math.round(((goal.sleepHours || 8) - sleepHoursToday) * 10) / 10, 0),
        diffFromYesterday: Math.round(((sleepMinutesToday - sleepMinutesYesterday) / 60) * 10) / 10,
        quality: todaySleep ? todaySleep.quality : 'None',
      },
      meals: {
        value: todayMeals.length,
        target: 4, // standard 3 meals + snack
        unit: 'meals',
        percentage: Math.min(Math.round((todayMeals.length / 4) * 100), 100),
        remaining: Math.max(4 - todayMeals.length, 0),
        diffFromYesterday: todayMeals.length - yesterdayMeals.length,
      },
      weight: {
        value: currentWeight,
        target: goal.targetWeight || 68,
        unit: 'kg',
        starting: goal.startingWeight || 72,
        change: Math.round((currentWeight - (goal.startingWeight || 72)) * 10) / 10,
      },
      goalCompletion: {
        value: overallGoalProgress,
        target: 100,
        unit: '%',
        percentage: overallGoalProgress,
        remaining: Math.max(100 - overallGoalProgress, 0),
      },
    };

    // 7-day trend for dashboard charts (last 7 days up to 'today')
    const last7Dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Dates.push(d.toISOString().split('T')[0]);
    }

    const [weeklyStepsLogs, weeklyWaterLogs, weeklyMeals, weeklySleepLogs, weeklyExercise] = await Promise.all([
      DailyLog.find({ user: userId, date: { $in: last7Dates } }),
      WaterLog.find({ user: userId, date: { $in: last7Dates } }),
      Meal.find({ user: userId, date: { $in: last7Dates } }),
      SleepLog.find({ user: userId, date: { $in: last7Dates } }),
      Exercise.find({ user: userId, date: { $in: last7Dates } }),
    ]);

    const weeklyTrends = last7Dates.map((dStr) => {
      const dayName = new Date(dStr).toLocaleDateString('en-US', { weekday: 'short' });

      const dSteps = weeklyStepsLogs.find((s) => s.date === dStr)?.steps || 0;
      const dWater = weeklyWaterLogs.filter((w) => w.date === dStr).reduce((sum, w) => sum + w.amountMl, 0);
      const dCals = weeklyMeals.filter((m) => m.date === dStr).reduce((sum, m) => sum + m.totalCalories, 0);
      const dSleepMin = weeklySleepLogs.find((sl) => sl.date === dStr)?.durationMinutes || 0;
      const dExMin = weeklyExercise.filter((e) => e.date === dStr).reduce((sum, e) => sum + e.durationMinutes, 0);

      return {
        date: dStr,
        day: dayName,
        steps: dSteps,
        water: dWater,
        calories: dCals,
        sleepHours: Math.round((dSleepMin / 60) * 10) / 10,
        exerciseMinutes: dExMin,
      };
    });

    // Recent activity timeline
    const recentActivities = [
      ...todayMeals.map((m) => ({
        type: 'meal',
        title: `${m.name} (${m.category})`,
        emoji: m.emoji || '🍽️',
        subtitle: `${m.totalCalories} kcal • ${m.items?.length || 0} items`,
        time: m.createdAt,
      })),
      ...todayWaterLogs.slice(0, 5).map((w) => ({
        type: 'water',
        title: `Drank ${w.amountMl} ml water`,
        emoji: '💧',
        subtitle: w.note || 'Hydration intake',
        time: w.loggedAt,
      })),
      ...todayExercises.map((e) => ({
        type: 'exercise',
        title: `${e.name} (${e.category})`,
        emoji: e.emoji || '⚡',
        subtitle: `${e.durationMinutes} mins • ~${e.caloriesBurned} kcal`,
        time: e.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        date: today,
        summaryCards,
        weeklyTrends,
        todayMeals,
        todayExercises,
        todayWaterLogs,
        recentActivities,
        nutritionSummary: {
          calories: caloriesToday,
          protein: proteinToday,
          carbs: carbsToday,
          fat: fatToday,
        },
        habitsOverview: {
          total: totalHabits,
          completed: completedHabits,
          percentage: habitCompletionPct,
        },
        goal,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardData,
};

