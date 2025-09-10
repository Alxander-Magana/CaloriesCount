import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FoodService from '../services/FoodService';
import MealSelectionModal from './MealSelectionModal';

const NutritionModal = ({ isOpen, onClose, item, role, onEditFood, onDeleteFood, userId, initialFavoritedItems, onFavoriteChange, onAddToMeal }) => {
    const [foodDetails, setFoodDetails] = useState(null);
    const [foodDiets, setFoodDiets] = useState([]);
    const [showMealSelection, setShowMealSelection] = useState(false);
    const [favoritedItems, setFavoritedItems] = useState(initialFavoritedItems || new Set());
    const navigate = useNavigate();

    // Function to handle diet tag clicks
    const handleDietTagClick = (dietName) => {
        console.log(`Filtering by diet: ${dietName}`);
        onClose(); // Close the modal
        navigate(`/?diet=${encodeURIComponent(dietName)}`); // Navigate to homepage with diet filter
    };

    // Update favorited items when initialFavoritedItems changes
    useEffect(() => {
        if (initialFavoritedItems) {
            setFavoritedItems(initialFavoritedItems);
        }
    }, [initialFavoritedItems]);

    // Fetch user favorites when component mounts or userId/item changes
    useEffect(() => {
        if (userId && item) {
            const fetchUserFavorites = async () => {
                try {
                    const favorites = await FoodService.getUserFavorites(userId);
                    if (favorites && favorites.length > 0) {
                        // Create a set of favorited food IDs
                        const favoriteIds = new Set();

                        favorites.forEach(fav => {
                            // Handle different possible formats of the favorite object
                            const foodId = fav.foodID ||
                                (fav.id && fav.id.foodId) ||
                                (fav.food && fav.food.foodID);

                            if (foodId) {
                                favoriteIds.add(parseInt(foodId));
                            }
                        });

                        setFavoritedItems(favoriteIds);
                    }
                } catch (error) {
                    console.error('Error fetching user favorites:', error);
                }
            };

            fetchUserFavorites();
        }
    }, [userId, item]);

    useEffect(() => {
        if (item) {
            const fetchFoodDetails = async () => {
                try {
                    // Use foodID if available, otherwise fall back to id
                    const foodId = item.foodID || item.id;
                    if (!foodId) {
                        console.error('No valid ID found for food item:', item);
                        return;
                    }

                    const details = await FoodService.getFoodById(foodId);
                    console.log('Fetched food details:', details);
                    setFoodDetails(details);

                    // Fetch diets for this food
                    const diets = await FoodService.getDietsForFood(foodId);
                    console.log('Fetched diets for food:', diets);
                    setFoodDiets(diets);
                } catch (err) {
                    console.error('Error fetching food details:', err);
                }
            };

            fetchFoodDetails();
        }
    }, [item]);

    // Log food details when it changes to help debug
    useEffect(() => {
        if (foodDetails) {
            console.log('Food details updated in state:', foodDetails);
        }
    }, [foodDetails]);

    if (!isOpen || !item) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleAddToMeal = () => {
        console.log('Adding to meal with userId:', userId);
        setShowMealSelection(true);
    };

    const handleCloseMealSelection = () => {
        setShowMealSelection(false);
    };

    const handleAddToFavorites = async () => {
        try {
            // Use foodID if available, otherwise fall back to id
            const foodId = item.foodID || item.id;
            if (!foodId) {
                console.error('No valid ID found for food item:', item);
                return;
            }

            if (isFavorited) {
                await FoodService.removeFavorite(userId, foodId);
            } else {
                await FoodService.addFavorite(userId, foodId);
            }

            setFavoritedItems(prev => {
                const updated = new Set(prev);
                if (updated.has(foodId)) {
                    updated.delete(foodId);
                } else {
                    updated.add(foodId);
                }
                return updated;
            });

            // Notify parent component that favorites have changed
            if (onFavoriteChange) {
                onFavoriteChange(foodId, !isFavorited);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    // Use foodID if available, otherwise fall back to id
    const foodId = item.foodID || item.id;
    const isFavorited = foodId ? favoritedItems.has(foodId) : false;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-lg w-[800px] max-w-[90%] p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <X size={24}/>
                </button>

                <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
                <div className="flex justify-between">
                    <div className="w-5/12 pr-4">
                        <div className="relative pb-[100%] w-full">
                            <img
                                src={item.imageSrc}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = "/src/assets/default.jpg";
                                }}
                            />
                        </div>

                        {/* Diet Tags Section */}
                        {foodDetails && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {foodDiets && foodDiets.length > 0 ? (
                                    foodDiets.map((diet) => {
                                        const dietName = diet.id && diet.id.dietName ? diet.id.dietName :
                                            diet.dietName ? diet.dietName : diet;
                                        return (
                                            <button
                                                key={diet.id ? (typeof diet.id === 'object' ? diet.id.dietName : diet.id) : dietName || diet}
                                                className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                                                onClick={() => handleDietTagClick(dietName)}
                                                title={`Filter by ${dietName} diet`}
                                            >
                                                {dietName}
                                            </button>
                                        );
                                    })
                                    ) : (
                                    <span className="text-gray-500 text-sm">No diet information available</span>
                                    )}
                            </div>
                        )}
                    </div>
                    <div className="w-7/12 pl-4">
                        <h3 className="text-lg font-semibold mb-3">Nutrition Facts</h3>
                        {foodDetails ? (
                            <div className="space-y-2">
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-gray-600">Calories</span>
                                    <span className="font-medium">{foodDetails.calories} kcal</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-gray-600">Protein</span>
                                    <span className="font-medium">{foodDetails.protein}g</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-gray-600">Carbohydrates</span>
                                    <span className="font-medium">{foodDetails.carbs}g</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-gray-600">Fat</span>
                                    <span className="font-medium">{foodDetails.totalFat}g</span>
                                </div>

                                {/* Add Food to Meal Button */}
                                <button
                                    className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold shadow-sm flex items-center justify-center"
                                    onClick={handleAddToMeal}
                                >
                                    <PlusCircle size={20} className="mr-2" /> Add to Meal
                                </button>

                                {/* Add Food to Favorites Button - Only for logged in users */}
                                {userId && (
                                    <button
                                        className={`mt-4 w-full px-4 py-2 rounded-lg transition-all font-semibold shadow-sm flex items-center justify-center ${
                                            isFavorited ? 'bg-green-600 text-white' : 'bg-red-500 text-white hover:bg-green-600'
                                        }`}
                                        onClick={handleAddToFavorites}
                                    >
                                        {isFavorited ? (
                                            <Check size={20} className="mr-2" />
                                        ) : (
                                            <PlusCircle size={20} className="mr-2" />
                                        )}
                                        {isFavorited ? 'Favorited!' : 'Add to Favorites'}
                                    </button>

                                )}
                            </div>
                        ) : (
                            <p>Loading nutritional information...</p>
                        )}

                        {/* Admin buttons */}
                        {role === 'ADMIN' && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold shadow-sm"
                                    onClick={() => onEditFood(item)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold shadow-sm"
                                    onClick={() => onDeleteFood(item)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Meal Selection Modal */}
                {showMealSelection && foodDetails && (
                    <MealSelectionModal
                        isOpen={showMealSelection}
                        onClose={handleCloseMealSelection}
                        foodItem={foodDetails}
                        foodName={item.title}
                        userId={userId}
                    />
                )}
            </div>
        </div>

    );
};

export default NutritionModal;
