
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import MealService from '../services/MealService';

const MealSelectionModal = ({ isOpen, onClose, foodItem, foodName, userId}) => {
    const [servings, setServings] = useState(1);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState('');
    const [existingMeals, setExistingMeals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch existing meals for today when modal opens
    useEffect(() => {
        const fetchTodaysMeals = async () => {
            if (!isOpen || !userId) return;

            setIsLoading(true);
            try {
                // Format today's date for API
                const today = new Date().toISOString().split('T')[0];
                const meals = await MealService.getMealsByUserAndDate(userId, today);
                setExistingMeals(meals);
                console.log("Fetched today's meals:", meals);
            } catch (error) {
                console.error("Error fetching today's meals:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodaysMeals();
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Calculate adjusted nutrition values based on number of servings
    const adjustedCalories = Math.round(foodItem.calories * servings);
    const adjustedProtein = foodItem.protein ? parseFloat((foodItem.protein * servings).toFixed(1)) : 0;
    const adjustedCarbs = foodItem.carbs ? parseFloat((foodItem.carbs * servings).toFixed(1)) : 0;
    const adjustedFat = foodItem.totalFat ? parseFloat((foodItem.totalFat * servings).toFixed(1)) : 0;

    const handleAddToMeal = async () => {
        console.log("MealSelectionModal received props:", { foodItem, foodName, userId });
        if (!selectedMeal) {
            setMessage('Please select a meal first');
            return;
        }

        if (!userId) {
            setMessage('User ID is required');
            return;
        }

        setIsAdding(true);

        try {
            // Find if this meal number already exists today
            const existingMeal = existingMeals.find(meal => meal.mealNumber === selectedMeal);

            // In the handleAddToMeal function, modify the update meal section:

            if (existingMeal) {
                console.log("Adding to existing meal:", existingMeal);

                // First update the meal nutrition info with ALL required fields
                await MealService.updateMeal(existingMeal.id, {
                    mealNumber: existingMeal.mealNumber,
                    userId: parseInt(userId),
                    calories: existingMeal.calories + adjustedCalories,
                    protein: existingMeal.protein + adjustedProtein,
                    carbs: existingMeal.carbs + adjustedCarbs,
                    fats: existingMeal.fats + adjustedFat,
                    date: existingMeal.date
                });

                // Then add the food-meal relationship
                await MealService.addFoodToMeal({
                    userId: parseInt(userId),
                    foodId: parseInt(foodItem.foodID),
                    mealId: existingMeal.id,
                    servings: servings,
                    calories: adjustedCalories,
                    protein: adjustedProtein,
                    carbs: adjustedCarbs,
                    fats: adjustedFat
                });
            } else {
                console.log("Creating new meal");

                // Create new meal using the MealService instead of direct fetch
                try {
                    // Format today's date to match expected backend format
                    const formattedDate = new Date().toISOString();

                    // Set up meal data in a format the backend expects
                    const mealData = {
                        userId: parseInt(userId),
                        mealNumber: selectedMeal,
                        calories: adjustedCalories,
                        protein: adjustedProtein,
                        carbs: adjustedCarbs,
                        fats: adjustedFat,
                        date: formattedDate
                    };

                    console.log("Creating meal with data:", mealData);

                    // Create a new meal using MealService
                    const newMeal = await createMeal(mealData);

                    if (!newMeal || !newMeal.id) {
                        throw new Error("Failed to create meal - invalid response from server");
                    }

                    console.log("New meal created:", newMeal);

                    // Add food to the new meal
                    const addFoodData = {
                        userId: parseInt(userId),
                        foodId: parseInt(foodItem.foodID),
                        mealId: newMeal.id,
                        servings: servings,
                        calories: adjustedCalories,
                        protein: adjustedProtein,
                        carbs: adjustedCarbs,
                        fats: adjustedFat
                    };

                    console.log("Adding food with data:", addFoodData);

                    const addFoodResponse = await MealService.addFoodToMeal(addFoodData);
                    console.log("Add food response:", addFoodResponse);
                } catch (error) {
                    console.error("Error in meal creation process:", error);
                    throw error;
                }
            }

            setMessage('Successfully added to meal!');
            setTimeout(() => {
                onClose();
                // Force refresh of the current page to show updated data
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error adding food to meal:', error);
            setMessage('Failed to add food to meal. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    // Helper function to create a meal
    const createMeal = async (mealData) => {
        const response = await fetch(`http://localhost:8080/api/meals/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Error response from meal creation:", errorData);
            throw new Error(`Failed to create meal: ${errorData}`);
        }

        return await response.json();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-lg w-[500px] max-w-[90%] p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <X size={24}/>
                </button>

                <h2 className="text-xl font-bold mb-4">Add {foodName} to Meal</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Number of Servings:</label>
                    <div className="flex items-center">
                        <button
                            className="px-3 py-1 bg-gray-200 rounded-l"
                            onClick={() => servings > 0.5 && setServings(prev => parseFloat((prev - 0.5).toFixed(1)))}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={servings}
                            onChange={(e) => setServings(parseFloat(e.target.value) || 0.5)}
                            className="w-16 text-center border-t border-b py-1"
                        />
                        <button
                            className="px-3 py-1 bg-gray-200 rounded-r"
                            onClick={() => setServings(prev => parseFloat((prev + 0.5).toFixed(1)))}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Nutrition per {servings} serving(s):</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-100 p-2 rounded">
                            <span className="text-gray-600">Calories:</span>
                            <span className="float-right font-medium">{adjustedCalories}</span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                            <span className="text-gray-600">Protein:</span>
                            <span className="float-right font-medium">{adjustedProtein}g</span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                            <span className="text-gray-600">Carbs:</span>
                            <span className="float-right font-medium">{adjustedCarbs}g</span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                            <span className="text-gray-600">Fat:</span>
                            <span className="float-right font-medium">{adjustedFat}g</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Select Meal:</h3>
                    <div className="flex space-x-3">
                        {[1, 2, 3].map(mealNum => {
                            const existingMeal = existingMeals.find(m => m.mealNumber === mealNum);
                            return (
                                <button
                                    key={mealNum}
                                    className={`flex-1 py-2 px-4 border rounded-md ${
                                        selectedMeal === mealNum
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedMeal(mealNum)}
                                >
                                    Meal {mealNum}
                                    {existingMeal && (
                                        <span className="block text-xs mt-1">
                                            {existingMeal.calories} cal
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {message && (
                    <div className={`mb-4 p-2 rounded ${
                        message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleAddToMeal}
                        disabled={isAdding || !selectedMeal || isLoading}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                            isAdding || !selectedMeal || isLoading
                                ? 'bg-gray-300 text-gray-500'
                                : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                    >
                        {isLoading ? 'Loading...' : isAdding ? 'Adding...' : (
                            <>
                                <Check size={20} className="mr-2" /> Confirm
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealSelectionModal;