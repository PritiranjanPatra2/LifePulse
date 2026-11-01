const Meal = require('../models/Meal');
const WaterLog = require('../models/WaterLog');
const Exercise = require('../models/Exercise');
const DailyLog = require('../models/DailyLog');
const SleepLog = require('../models/SleepLog');
const WeightLog = require('../models/WeightLog');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// Helper to calculate date ranges based on filter preset
const getDateRange = (filter = 'last7', customStart, customEnd) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (filter) {
    case 'today':
      // startDate and endDate are today
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      endDate.setDate(now.getDate() - 1);
      break;
    case 'last7':
      startDate.setDate(now.getDate() - 6);
      break;
    case 'last30':
      startDate.setDate(now.getDate() - 29);
      break;
    case 'thisWeek': {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      startDate.setDate(now.getDate() - diffToMonday);
      break;
    }
    case 'prevWeek': {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      endDate.setDate(now.getDate() - diffToMonday - 1);
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      break;
    }
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'prevMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'custom':
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
      }
      break;
    default:
      startDate.setDate(now.getDate() - 6);
  }

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  return { startStr, endStr, startDate, endDate };
};

// Generates continuous array of date strings between start and end
const getDatesArray = (startStr, endStr) => {
  const dates = [];
  const curr = new Date(startStr);
  const end = new Date(endStr);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// @desc    Get master analytics dashboard data
// @route   GET /api/analytics/overview
// @access  Private
const getAnalyticsOverview = async (req, res, next) => {
  try {
    const { timeRange = 'last7', category = 'All', startDate: cStart, endDate: cEnd } = req.query;
    const userId = req.user._id;

    const { startStr, endStr } = getDateRange(timeRange, cStart, cEnd);
    const allDates = getDatesArray(startStr, endStr);

    const goal = (await Goal.findOne({ user: userId })) || {
      calories: 2200,
      waterMl: 4000,
      steps: 10000,
      exerciseMinutes: 45,
      sleepHours: 8,
      targetWeight: 68,
    };

    // Parallel fetch within the selected date range
    const [meals, waterLogs, exercises, dailyLogs, sleepLogs, weightLogs, habitLogs, habits] =
      await Promise.all([
        Meal.find({ user: userId, date: { $gte: startStr, $lte: endStr } }),
        WaterLog.find({ user: userId, date: { $gte: startStr, $lte: endStr } }),
        Exercise.find({ user: userId, date: { $gte: startStr, $lte: endStr } }),
        DailyLog.find({ user: userId, date: { $gte: startStr, $lte: endStr } }),
        SleepLog.find({ user: userId, date: { $gte: startStr, $lte: endStr } }),
        WeightLog.find({ user: userId, date: { $gte: startStr, $lte: endStr } }).sort({ date: 1 }),
        HabitLog.find({ user: userId, date: { $gte: startStr, $lte: endStr }, completed: true }),
        Habit.find({ user: userId, isActive: true }),
      ]);

    // Build day-by-day continuous timeline
    let totalCalories = 0;
    let totalWater = 0;
    let totalSteps = 0;
    let totalExerciseMin = 0;
    let totalSleepMin = 0;

    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const dailyCalorieIntake = [];
    const hydrationTrends = [];
    const stepsTrend = [];
    const sleepDurationTrend = [];
    const mealWiseCalories = [];
    const dailyGoalCompletion = [];

    allDates.forEach((dStr) => {
      const dObj = new Date(dStr);
      const dayLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOfWeek = dObj.toLocaleDateString('en-US', { weekday: 'short' });

      // Meals & Calories
      const dayMeals = meals.filter((m) => m.date === dStr);
      let dayCals = 0;
      let bFast = 0, mSnack = 0, lunch = 0, eSnack = 0, dinner = 0, otherFood = 0;

      dayMeals.forEach((m) => {
        const c = m.totalCalories || 0;
        dayCals += c;
        totalProtein += m.totalProtein || 0;
        totalCarbs += m.totalCarbs || 0;
        totalFat += m.totalFat || 0;

        if (m.category === 'Breakfast') bFast += c;
        else if (m.category === 'Morning Snacks') mSnack += c;
        else if (m.category === 'Lunch') lunch += c;
        else if (m.category === 'Evening Snacks') eSnack += c;
        else if (m.category === 'Dinner') dinner += c;
        else otherFood += c;
      });

      totalCalories += dayCals;
      dailyCalorieIntake.push({
        date: dStr,
        day: dayLabel,
        calories: dayCals,
        target: goal.calories,
      });

      mealWiseCalories.push({
        date: dStr,
        day: dayLabel,
        Breakfast: bFast,
        'Morning Snacks': mSnack,
        Lunch: lunch,
        'Evening Snacks': eSnack,
        Dinner: dinner,
        Other: otherFood,
        total: dayCals,
      });

      // Water
      const dayWater = waterLogs
        .filter((w) => w.date === dStr)
        .reduce((sum, w) => sum + (w.amountMl || 0), 0);
      totalWater += dayWater;
      hydrationTrends.push({
        date: dStr,
        day: dayLabel,
        waterMl: dayWater,
        target: goal.waterMl,
      });

      // Steps
      const stepEntry = dailyLogs.find((s) => s.date === dStr);
      const daySteps = stepEntry ? stepEntry.steps : 0;
      totalSteps += daySteps;
      stepsTrend.push({
        date: dStr,
        day: dayLabel,
        weekday: dayOfWeek,
        steps: daySteps,
        target: goal.steps,
      });

      // Sleep
      const sleepEntry = sleepLogs.find((sl) => sl.date === dStr);
      const daySleepMin = sleepEntry ? sleepEntry.durationMinutes : 0;
      totalSleepMin += daySleepMin;
      const sleepHrs = Math.round((daySleepMin / 60) * 10) / 10;
      sleepDurationTrend.push({
        date: dStr,
        day: dayLabel,
        hours: sleepHrs,
        target: goal.sleepHours,
        quality: sleepEntry ? sleepEntry.quality : 'None',
      });

      // Exercise
      const dayEx = exercises
        .filter((e) => e.date === dStr)
        .reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
      totalExerciseMin += dayEx;

      // Daily Goal Completion Progress
      const calScore = Math.min((dayCals / (goal.calories || 2200)) * 100, 100);
      const waterScore = Math.min((dayWater / (goal.waterMl || 4000)) * 100, 100);
      const stepsScore = Math.min((daySteps / (goal.steps || 10000)) * 100, 100);
      const exScore = Math.min((dayEx / (goal.exerciseMinutes || 45)) * 100, 100);
      const sleepScore = Math.min((sleepHrs / (goal.sleepHours || 8)) * 100, 100);
      const avgScore = Math.round((calScore + waterScore + stepsScore + exScore + sleepScore) / 5);

      dailyGoalCompletion.push({
        date: dStr,
        day: dayLabel,
        completion: avgScore,
      });
    });

    const dayCount = allDates.length || 1;

    // Nutrition Breakdown (Macronutrient distribution in grams & calories)
    // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
    const nutritionBreakdown = [
      { name: 'Protein', grams: Math.round(totalProtein), color: '#10b981' },
      { name: 'Carbohydrates', grams: Math.round(totalCarbs), color: '#3b82f6' },
      { name: 'Healthy Fats', grams: Math.round(totalFat), color: '#f59e0b' },
    ];

    // Exercise Distribution (by category)
    const exerciseCategoryMap = {};
    exercises.forEach((ex) => {
      exerciseCategoryMap[ex.category] = (exerciseCategoryMap[ex.category] || 0) + ex.durationMinutes;
    });

    const exerciseDistribution = Object.keys(exerciseCategoryMap).map((cat) => ({
      name: cat,
      minutes: exerciseCategoryMap[cat],
    }));

    // Weight Progress
    const weightProgress = weightLogs.map((w) => ({
      date: w.date,
      weight: w.weightKg,
      target: goal.targetWeight,
    }));

    // Radar Chart: Lifestyle Performance (0-100 scale)
    const avgCalories = Math.round(totalCalories / dayCount);
    const avgWater = Math.round(totalWater / dayCount);
    const avgSteps = Math.round(totalSteps / dayCount);
    const avgExercise = Math.round(totalExerciseMin / dayCount);
    const avgSleepHours = Math.round((totalSleepMin / dayCount / 60) * 10) / 10;

    const lifestyleRadar = [
      {
        metric: 'Nutrition',
        score: Math.min(Math.round((avgCalories / (goal.calories || 2200)) * 100), 100),
        fullMark: 100,
      },
      {
        metric: 'Hydration',
        score: Math.min(Math.round((avgWater / (goal.waterMl || 4000)) * 100), 100),
        fullMark: 100,
      },
      {
        metric: 'Walking',
        score: Math.min(Math.round((avgSteps / (goal.steps || 10000)) * 100), 100),
        fullMark: 100,
      },
      {
        metric: 'Fitness',
        score: Math.min(Math.round((avgExercise / (goal.exerciseMinutes || 45)) * 100), 100),
        fullMark: 100,
      },
      {
        metric: 'Sleep',
        score: Math.min(Math.round((avgSleepHours / (goal.sleepHours || 8)) * 100), 100),
        fullMark: 100,
      },
      {
        metric: 'Consistency',
        score: habits.length > 0 ? Math.min(Math.round((habitLogs.length / (habits.length * dayCount)) * 100), 100) : 75,
        fullMark: 100,
      },
    ];

    // Weekly activity comparison (Grouped bar chart: Steps, Water/10, Calories/10, Exercise)
    const weeklyActivityComparison = dailyCalorieIntake.slice(-7).map((d) => {
      const wMatch = hydrationTrends.find((h) => h.date === d.date)?.waterMl || 0;
      const sMatch = stepsTrend.find((s) => s.date === d.date)?.steps || 0;
      const slMatch = sleepDurationTrend.find((sl) => sl.date === d.date)?.hours || 0;
      return {
        day: d.day,
        steps: sMatch,
        calories: d.calories,
        waterMl: wMatch,
        sleepHours: slMatch,
      };
    });

    // Best & lowest performing days for steps and calories
    const sortedBySteps = [...stepsTrend].sort((a, b) => b.steps - a.steps);
    const bestStepsDay = sortedBySteps[0] || null;
    const lowestStepsDay = sortedBySteps[sortedBySteps.length - 1] || null;

    // Period Comparisons (e.g. this period vs equivalent previous period)
    const prevEndDate = new Date(startStr);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - (dayCount - 1));

    const prevStartStr = prevStartDate.toISOString().split('T')[0];
    const prevEndStr = prevEndDate.toISOString().split('T')[0];

    const [prevMeals, prevWater, prevDaily, prevSleep, prevEx] = await Promise.all([
      Meal.find({ user: userId, date: { $gte: prevStartStr, $lte: prevEndStr } }),
      WaterLog.find({ user: userId, date: { $gte: prevStartStr, $lte: prevEndStr } }),
      DailyLog.find({ user: userId, date: { $gte: prevStartStr, $lte: prevEndStr } }),
      SleepLog.find({ user: userId, date: { $gte: prevStartStr, $lte: prevEndStr } }),
      Exercise.find({ user: userId, date: { $gte: prevStartStr, $lte: prevEndStr } }),
    ]);

    const prevSteps = prevDaily.reduce((sum, d) => sum + (d.steps || 0), 0);
    const prevWaterTotal = prevWater.reduce((sum, w) => sum + (w.amountMl || 0), 0);
    const prevCalTotal = prevMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
    const prevExTotal = prevEx.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const prevSleepTotal = prevSleep.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const calcPctDiff = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const comparisons = {
      stepsChangePct: calcPctDiff(totalSteps, prevSteps),
      waterChangePct: calcPctDiff(totalWater, prevWaterTotal),
      caloriesChangePct: calcPctDiff(totalCalories, prevCalTotal),
      exerciseChangePct: calcPctDiff(totalExerciseMin, prevExTotal),
      sleepChangePct: calcPctDiff(totalSleepMin, prevSleepTotal),
    };

    res.status(200).json({
      success: true,
      data: {
        filter: {
          timeRange,
          category,
          startStr,
          endStr,
          dayCount,
        },
        averages: {
          calories: avgCalories,
          water: avgWater,
          steps: avgSteps,
          exerciseMin: avgExercise,
          sleepHours: avgSleepHours,
        },
        bestDays: {
          steps: bestStepsDay,
          lowestSteps: lowestStepsDay,
        },
        comparisons,
        charts: {
          dailyCalorieIntake,
          weeklySteps: stepsTrend,
          hydrationTrends,
          sleepDuration: sleepDurationTrend,
          exerciseDistribution,
          nutritionBreakdown,
          weightProgress,
          weeklyActivityComparison,
          mealWiseCalories,
          lifestyleRadar,
          dailyGoalCompletion,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalyticsOverview,
};
