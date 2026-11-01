import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { notifyToast } from '../common/Toast';
import { FOOD_CATEGORIES, EMOJI_PICKER_FOODS } from '../../constants/emojis';
import { foodService } from '../../services/foodService';
import { Search, Plus, Sparkles, Check, Trash2, Edit2 } from 'lucide-react';

export const FoodLibraryModal = ({
  isOpen,
  onClose,
  onSelectFood,
  mealCategory = 'Breakfast',
}) => {
  const [foods, setFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected food item for portion configuration
  const [activeFood, setActiveFood] = useState(null);
  const [portionQuantity, setPortionQuantity] = useState(1);
  const [calculatedCals, setCalculatedCals] = useState(0);
  const [calculatedProtein, setCalculatedProtein] = useState(0);
  const [calculatedCarbs, setCalculatedCarbs] = useState(0);
  const [calculatedFat, setCalculatedFat] = useState(0);

  // Custom food creator form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍲');
  const [customCategory, setCustomCategory] = useState('Grains');
  const [customServingSize, setCustomServingSize] = useState('100');
  const [customServingUnit, setCustomServingUnit] = useState('g');
  const [customCalories, setCustomCalories] = useState('150');
  const [customProtein, setCustomProtein] = useState('5');
  const [customCarbs, setCustomCarbs] = useState('20');
  const [customFat, setCustomFat] = useState('3');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFoods();
    }
  }, [isOpen]);

  const loadFoods = async () => {
    setIsLoading(true);
    try {
      const res = await foodService.getFoods();
      if (res.data) setFoods(res.data);
    } catch (err) {
      console.error('Error loading foods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // When a food card is clicked
  const handleSelectFoodCard = (food) => {
    setActiveFood(food);
    setPortionQuantity(1);
    setCalculatedCals(food.calories);
    setCalculatedProtein(food.protein || 0);
    setCalculatedCarbs(food.carbs || 0);
    setCalculatedFat(food.fat || 0);
  };

  // Recalculate nutrition when quantity changes
  const handleQuantityChange = (qty) => {
    const num = Math.max(Number(qty), 0.1);
    setPortionQuantity(num);
    if (activeFood) {
      setCalculatedCals(Math.round(activeFood.calories * num));
      setCalculatedProtein(Math.round((activeFood.protein || 0) * num * 10) / 10);
      setCalculatedCarbs(Math.round((activeFood.carbs || 0) * num * 10) / 10);
      setCalculatedFat(Math.round((activeFood.fat || 0) * num * 10) / 10);
    }
  };

  // Confirm addition to meal
  const handleConfirmAdd = () => {
    if (!activeFood) return;

    onSelectFood({
      foodId: activeFood._id,
      name: activeFood.name,
      emoji: activeFood.emoji,
      quantity: portionQuantity,
      servingSize: activeFood.servingSize,
      servingUnit: activeFood.servingUnit,
      calories: calculatedCals,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
    });

    setActiveFood(null);
    onClose();
  };

  // Handle custom food submission
  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    setIsSubmittingCustom(true);

    try {
      const res = await foodService.createFood({
        name: customName,
        emoji: customEmoji,
        category: customCategory,
        servingSize: Number(customServingSize),
        servingUnit: customServingUnit,
        calories: Number(customCalories),
        protein: Number(customProtein),
        carbs: Number(customCarbs),
        fat: Number(customFat),
      });

      if (res.data) {
        setFoods([res.data, ...foods]);
        setShowCustomForm(false);
        // Pre-select newly created custom food
        handleSelectFoodCard(res.data);
        alert(`Custom food "${res.data.name}" created successfully!`);
        notifyToast({
          title: 'Custom Food Created! 🥗',
          message: `Created "${res.data.name}" with ${res.data.calories} kcal.`,
          type: 'success',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating custom food');
      notifyToast({
        title: 'Food Creation Failed',
        message: err.response?.data?.message || 'Error creating custom food',
        type: 'error',
      });
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleDeleteFood = async (foodId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this custom food item?')) return;
    try {
      await foodService.deleteFood(foodId);
      setFoods(foods.filter((f) => f._id !== foodId));
      if (activeFood?._id === foodId) setActiveFood(null);
      notifyToast({
        title: 'Food Item Removed',
        message: 'Custom food deleted from library.',
        type: 'info',
      });
    } catch (err) {
      notifyToast({
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not delete food item',
        type: 'error',
      });
    }
  };

  // Filter foods by category and search
  const filteredFoods = foods.filter((f) => {
    const matchCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() || f.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchCategory && matchSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Food to ${mealCategory}`}
      subtitle="Searchable food library with nutritional estimates"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Search bar + New Custom Food Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods (e.g. Rice, Idli, Apple, Dal...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            {showCustomForm ? 'Food Library' : 'Create Food'}
          </Button>
        </div>

        {/* CUSTOM FOOD CREATOR FORM */}
        {showCustomForm ? (
          <form
            onSubmit={handleCreateCustomFood}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Create Custom Food Item
            </h4>

            {/* Emoji Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Select Emoji Icon: <span className="text-xl ml-1">{customEmoji}</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                {EMOJI_PICKER_FOODS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setCustomEmoji(em)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:scale-110 transition-transform ${
                      customEmoji === em ? 'bg-brand-500/20 ring-2 ring-brand-500' : ''
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Masala Oats"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {FOOD_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Serving Size
                </label>
                <input
                  type="number"
                  value={customServingSize}
                  onChange={(e) => setCustomServingSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Unit
                </label>
                <select
                  value={customServingUnit}
                  onChange={(e) => setCustomServingUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="g">g (grams)</option>
                  <option value="piece">piece</option>
                  <option value="bowl">bowl</option>
                  <option value="plate">plate</option>
                  <option value="cup">cup</option>
                  <option value="ml">ml</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  required
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmittingCustom}>
                Save to Library
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Foods Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredFoods.map((food) => {
                const isSelected = activeFood?._id === food._id;
                return (
                  <div
                    key={food._id}
                    onClick={() => handleSelectFoodCard(food)}
                    className={`relative p-3 rounded-2xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-2xl mb-1.5 block">{food.emoji}</span>
                        {food.isCustom && (
                          <button
                            onClick={(e) => handleDeleteFood(food._id, e)}
                            title="Delete custom food"
                            className="p-1 rounded text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {food.name}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        {food.servingSize} {food.servingUnit}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-brand-600 dark:text-brand-400">
                        {food.calories} kcal
                      </span>
                      <span className="text-slate-400">P: {food.protein}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Selected Food Portion Configurator Bar */}
        {activeFood && (
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeFood.emoji}</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeFood.name}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Standard serving: {activeFood.servingSize} {activeFood.servingUnit} (
                    {activeFood.calories} kcal)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                  {calculatedCals} kcal
                </span>
                <span className="text-[11px] text-slate-500 block">
                  P: {calculatedProtein}g • C: {calculatedCarbs}g • F: {calculatedFat}g
                </span>
              </div>
            </div>

            {/* Quantity Slider / Stepper */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantity ({activeFood.servingUnit} multiplier):
              </span>
              <div className="flex items-center gap-1.5">
                {[0.5, 1, 1.5, 2, 3].map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => handleQuantityChange(mult)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      portionQuantity === mult
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={portionQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-18 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center font-bold outline-none"
              />
              <Button size="sm" onClick={handleConfirmAdd} className="ml-auto">
                Add to Meal
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

