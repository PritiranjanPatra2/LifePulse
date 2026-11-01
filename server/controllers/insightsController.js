const Meal = require('../models/Meal');
const WaterLog = require('../models/WaterLog');
const Exercise = require('../models/Exercise');
const DailyLog = require('../models/DailyLog');
const SleepLog = require('../models/SleepLog');
const Goal = require('../models/Goal');

// @desc    Get dynamic rule-based insights from real user records
// @route   GET /api/analytics/insights
// @access  Private
const getSmartInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goal = (await Goal.findOne({ user: userId })) || {
      calories: 2200,
      waterMl: 4000,
      steps: 10000,
      exerciseMinutes: 45,
      sleepHours: 8,
    };

    // Last 7 days
    const now = new Date();
    const last7Start = new Date(now);
    last7Start.setDate(now.getDate() - 6);
    const startStr7 = last7Start.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // Previous 7 days (day 7 to 13 ago)
    const prev7Start = new Date(now);
    prev7Start.setDate(now.getDate() - 13);
    const prev7End = new Date(now);
    prev7End.setDate(now.getDate() - 7);
    const prevStartStr = prev7Start.toISOString().split('T')[0];
    const prevEndStr = prev7End.toISOString().split('T')[0];

    const [currSteps, prevSteps, currWater, currMeals, currSleep, currExercises] = await Promise.all([
      DailyLog.find({ user: userId, date: { $gte: startStr7, $lte: todayStr } }),
      DailyLog.find({ user: userId, date: { $gte: prevStartStr, $lte: prevEndStr } }),
      WaterLog.find({ user: userId, date: { $gte: startStr7, $lte: todayStr } }),
      Meal.find({ user: userId, date: { $gte: startStr7, $lte: todayStr } }),
      SleepLog.find({ user: userId, date: { $gte: startStr7, $lte: todayStr } }),
      Exercise.find({ user: userId, date: { $gte: startStr7, $lte: todayStr } }),
    ]);

    const insights = [];

    // 1. Steps insight
    if (currSteps.length >= 2) {
      const currTotalSteps = currSteps.reduce((sum, s) => sum + (s.steps || 0), 0);
      const currAvgSteps = Math.round(currTotalSteps / currSteps.length);

      if (prevSteps.length >= 2) {
        const prevTotalSteps = prevSteps.reduce((sum, s) => sum + (s.steps || 0), 0);
        const prevAvgSteps = Math.round(prevTotalSteps / prevSteps.length);

        if (prevAvgSteps > 0) {
          const diffPct = Math.round(((currAvgSteps - prevAvgSteps) / prevAvgSteps) * 100);
          if (diffPct > 0) {
            insights.push({
              category: 'Steps',
              type: 'positive',
              icon: '🚶',
              title: 'Walking Momentum',
              message: `Your average steps increased by ${diffPct}% this week compared to last week (averaging ${currAvgSteps.toLocaleString()} steps/day).`,
            });
          } else if (diffPct < -10) {
            insights.push({
              category: 'Steps',
              type: 'warning',
              icon: '🚶',
              title: 'Step Count Opportunity',
              message: `Your step count is down ${Math.abs(diffPct)}% compared to last week. Try taking a 15-minute brisk walk after lunch.`,
            });
          }
        }
      } else {
        insights.push({
          category: 'Steps',
          type: 'neutral',
          icon: '🚶',
          title: 'Daily Steps Tracking',
          message: `You averaged ${currAvgSteps.toLocaleString()} steps over the last ${currSteps.length} recorded days (target: ${goal.steps.toLocaleString()}).`,
        });
      }
    }

    // 2. Hydration insight
    const waterByDate = {};
    currWater.forEach((w) => {
      waterByDate[w.date] = (waterByDate[w.date] || 0) + w.amountMl;
    });
    const loggedWaterDates = Object.keys(waterByDate);

    if (loggedWaterDates.length > 0) {
      let daysBelowWater = 0;
      let daysMetWater = 0;
      loggedWaterDates.forEach((d) => {
        if (waterByDate[d] < (goal.waterMl || 4000)) {
          daysBelowWater++;
        } else {
          daysMetWater++;
        }
      });

      if (daysBelowWater > 0) {
        insights.push({
          category: 'Hydration',
          type: daysBelowWater > 3 ? 'warning' : 'neutral',
          icon: '💧',
          title: 'Hydration Check',
          message: `Your water consumption was below your target of ${goal.waterMl} ml on ${daysBelowWater} of the past 7 days.`,
        });
      } else if (daysMetWater >= 3) {
        insights.push({
          category: 'Hydration',
          type: 'positive',
          icon: '💧',
          title: 'Hydration Champion',
          message: `Great job! You achieved your hydration target on all ${daysMetWater} tracked days this week.`,
        });
      }
    }

    // 3. Sleep insight
    if (currSleep.length >= 2) {
      const totalSleepMin = currSleep.reduce((sum, s) => sum + s.durationMinutes, 0);
      const avgSleepHrs = Math.round((totalSleepMin / currSleep.length / 60) * 10) / 10;
      insights.push({
        category: 'Sleep',
        type: avgSleepHrs >= 7 ? 'positive' : 'warning',
        icon: '🌙',
        title: 'Sleep Duration',
        message: `Your average sleep duration was ${avgSleepHrs} hours over ${currSleep.length} tracked nights (target: ${goal.sleepHours}h).`,
      });
    }

    // 4. Breakfast consistency
    const breakfastDays = new Set(
      currMeals.filter((m) => m.category === 'Breakfast').map((m) => m.date)
    );
    if (breakfastDays.size >= 4) {
      insights.push({
        category: 'Nutrition',
        type: 'positive',
        icon: '🍳',
        title: 'Nutritious Start',
        message: `You logged a nutritious breakfast on ${breakfastDays.size} out of the last 7 days!`,
      });
    }

    // 5. Exercise peak day & frequency
    if (currExercises.length >= 1) {
      const exerciseMinutesByDay = {};
      currExercises.forEach((e) => {
        const dayName = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' });
        exerciseMinutesByDay[dayName] = (exerciseMinutesByDay[dayName] || 0) + e.durationMinutes;
      });

      let mostActiveDay = '';
      let maxMin = 0;
      Object.entries(exerciseMinutesByDay).forEach(([day, min]) => {
        if (min > maxMin) {
          maxMin = min;
          mostActiveDay = day;
        }
      });

      if (mostActiveDay) {
        insights.push({
          category: 'Fitness',
          type: 'positive',
          icon: '🔥',
          title: 'Peak Fitness Day',
          message: `Your most active day was ${mostActiveDay} with ${maxMin} minutes of logged workout sessions.`,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: insights.length,
      data: insights,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSmartInsights,
};

