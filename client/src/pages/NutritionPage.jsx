import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MealCard } from '../components/nutrition/MealCard';
import { FoodLibraryModal } from '../components/nutrition/FoodLibraryModal';
import { MacroNutrientBar } from '../components/nutrition/MacroNutrientBar';
import { StackedMealBarChart } from '../components/charts/StackedMealBarChart';
import { NutritionPieChart } from '../components/charts/NutritionPieChart';
import { MEAL_CATEGORIES } from '../constants/emojis';
import { mealService } from '../services/mealService';
import { goalService } from '../services/goalService';
import { UtensilsCrossed, Plus, Sparkles, PieChart, Flame } from 'lucide-react';

export const NutritionPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  const [meals, setMeals] = useState([]);
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Food Library modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('Breakfast');
  const [activeMealTarget, setActiveMealTarget] = useState(null);

  const loadNutritionData = async () => {
    setIsLoading(true);
    try {
      const [mealsRes, goalRes] = await Promise.all([
        mealService.getMeals({ date: selectedDate }),
        goalService.getGoals(),
      ]);
      if (mealsRes.data) setMeals(mealsRes.data);
      if (goalRes.data) setGoal(goalRes.data);
    } catch (err) {
      console.error('Error loading nutrition data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNutritionData();
  }, [selectedDate]);

  // Aggregate daily totals
  const totalCalories = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0) * 10) / 10;
  const totalFat = Math.round(meals.reduce((sum, m) => sum + (m.totalFat || 0), 0) * 10) / 10;

  const targetCalories = goal?.calories || 2200;
  const targetProtein = goal?.proteinGrams || 80;
  const targetCarbs = goal?.carbsGrams || 250;
  const targetFat = goal?.fatGrams || 65;

  const handleOpenAddFood = (categoryName, existingMeal) => {
    setModalCategory(categoryName);
    setActiveMealTarget(existingMeal);
    setIsModalOpen(true);
  };

  const handleSelectFoodItem = async (foodItem) => {
    try {
      if (activeMealTarget) {
        const updatedItems = [...(activeMealTarget.items || []), foodItem];
        await mealService.updateMeal(activeMealTarget._id, {
          items: updatedItems,
        });
      } else {
        await mealService.createMeal({
          date: selectedDate,
          category: modalCategory,
          name: modalCategory,
          items: [foodItem],
        });
      }
      loadNutritionData();
    } catch (err) {
      alert('Error adding food item');
    }
  };

  const handleRemoveMealItem = async (mealId, itemIdx) => {
    const meal = meals.find((m) => m._id === mealId);
    if (!meal) return;
    const updated = meal.items.filter((_, i) => i !== itemIdx);
    try {
      if (updated.length === 0) {
        await mealService.deleteMeal(mealId);
      } else {
        await mealService.updateMeal(mealId, { items: updated });
      }
      loadNutritionData();
    } catch (err) {
      alert('Error removing food item');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Delete this entire meal?')) return;
    try {
      await mealService.deleteMeal(mealId);
      loadNutritionData();
    } catch (err) {
      alert('Error deleting meal');
    }
  };

  // Nutrition Pie Chart Data
  const macroPieData = [
    { name: 'Protein', grams: totalProtein || 1, color: '#10b981' },
    { name: 'Carbohydrates', grams: totalCarbs || 1, color: '#3b82f6' },
    { name: 'Healthy Fats', grams: totalFat || 1, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nutrition & Food Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Emoji-based food logging with live macro & calorie calculations
          </p>
        </div>

        <Button
          size="sm"
          icon={Plus}
          onClick={() => handleOpenAddFood('Breakfast', null)}
        >
          Add Food Entry
        </Button>
      </div>

      {/* DAILY NUTRITION SCORECARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Daily Calorie Budget"
          subtitle={`${selectedDate}`}
          icon={Flame}
          className="flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {totalCalories}
                </span>
                <span className="text-xs text-slate-400 font-semibold ml-1">
                  / {targetCalories} kcal
                </span>
              </div>
              <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                {Math.min(Math.round((totalCalories / targetCalories) * 100), 100)}%
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{
                  width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%`,
                }}
                className="h-full bg-brand-500 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Remaining: {Math.max(targetCalories - totalCalories, 0)} kcal</span>
              <span>Meals logged: {meals.length}</span>
            </div>
          </div>
        </Card>

        {/* Macronutrient Balance Bar Card */}
        <Card
          title="Macronutrient Balance"
          subtitle="Protein • Carbs • Healthy Fats"
          icon={UtensilsCrossed}
          className="lg:col-span-2"
        >
          <MacroNutrientBar
            protein={totalProtein}
            carbs={totalCarbs}
            fat={totalFat}
            targetProtein={targetProtein}
            targetCarbs={targetCarbs}
            targetFat={targetFat}
          />
        </Card>
      </div>

      {/* MEALS CATEGORIES GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Today's Meal Categories
          </h3>
          <span className="text-xs text-slate-400">
            6 customizable meal slots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEAL_CATEGORIES.map((cat) => {
            const matchedMeal = meals.find((m) => m.category === cat.name);
            return (
              <MealCard
                key={cat.id}
                category={cat}
                meal={matchedMeal}
                onOpenAddFood={handleOpenAddFood}
                onRemoveItem={handleRemoveMealItem}
                onDeleteMeal={handleDeleteMeal}
              />
            );
          })}
        </div>
      </div>

      {/* MACRO BREAKDOWN PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Caloric Ratio by Macronutrient"
          subtitle="Daily distribution"
          icon={PieChart}
        >
          <NutritionPieChart data={macroPieData} height={240} />
        </Card>

        <Card
          title="Nutritional Guidelines & Tips"
          subtitle="Based on Indian dietary allowances"
          icon={Sparkles}
        >
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                Optimal Protein Distribution
              </span>
              Aim to consume 20-30g of protein across each main meal (breakfast, lunch, dinner) using items like lentils, paneer, eggs, chicken, or sprouts.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                Complex Carbohydrates
              </span>
              Whole grain rotis, oats, brown rice, and legumes provide sustained energy and high fiber without sugar spikes.
            </div>
          </div>
        </Card>
      </div>

      {/* FOOD LIBRARY MODAL */}
      <FoodLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectFood={handleSelectFoodItem}
        mealCategory={modalCategory}
      />
    </div>
  );
};
