import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FoodService from '../services/FoodService';
import NutritionModal from './NutritionModal';

const FavoriteModal = ({ isOpen, onClose, userId }) => {
    const [favoritedFoods, setFavoritedFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [unfavoritedItems, setUnfavoritedItems] = useState(new Set());

    // Callback for when favorites change
    const handleFavoriteChange = (foodId, isFavorited) => {
        // Track unfavorited items locally
        setUnfavoritedItems(prev => {
            const updated = new Set(prev);
            if (!isFavorited) {
                updated.add(foodId);
            } else {
                updated.delete(foodId);
            }
            return updated;
        });
        
        // Increment refresh trigger to cause useEffect to re-run
        setRefreshTrigger(prev => prev + 1);
    };

    // Fetch favorite foods when the modal opens
    useEffect(() => {
        if (isOpen && userId) {
            const fetchFavorites = async () => {
                setLoading(true);
                try {
                    const favorites = await FoodService.getUserFavorites(userId);
                    // Map favorites to the format expected by the component
                    const foodPromises = favorites.map(fav => {
                        // Handle different possible formats of the favorite object
                        const foodId = fav.foodID || (fav.id && fav.id.foodId) || (fav.food && fav.food.foodID);
                        if (!foodId) {
                            console.error('Could not determine food ID from favorite:', fav);
                            return Promise.resolve(null);
                        }
                        return FoodService.getFoodById(foodId);
                    });
                    const foodDetails = await Promise.all(foodPromises);
                    // Filter out any null values from the results
                    setFavoritedFoods(foodDetails.filter(food => food != null));
                    setError(null);
                } catch (err) {
                    console.error('Error fetching favorites:', err);
                    setError('Failed to load favorite foods. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            
            fetchFavorites();
        }
                }, [isOpen, userId, refreshTrigger]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
            setUnfavoritedItems(new Set()); // Reset unfavorited items when modal closes
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-lg w-[800px] max-w-[90%] p-6 relative max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => {
                        onClose();
                        setUnfavoritedItems(new Set()); // Reset unfavorited items when modal closes
                    }}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <X size={24}/>
                </button>
                <h2 className="text-2xl font-bold mb-4">Your Favorite Foods</h2>
                
                <div className="overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">Loading your favorites...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 mt-10">
                            {error}
                        </div>
                    ) : favoritedFoods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {favoritedFoods.map((food) => (
                                <div 
                                    key={food.foodID} 
                                    className="border rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setSelectedFood({
                                        id: food.foodID,
                                        title: food.foodName,
                                        imageSrc: `/src/assets/${food.foodImage}`,
                                        description: `Calories: ${food.calories} Protein: ${food.protein} TotalFat: ${food.totalFat}`
                                    })}
                                >
                                    <img 
                                        src={`/src/assets/${food.foodImage}`} 
                                        alt={food.foodName} 
                                        className="w-16 h-16 object-cover rounded-lg mr-4"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{food.foodName}</h3>
                                        <p className="text-sm text-gray-600">
                                            Calories: {food.calories} | Protein: {food.protein}g
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            <p>You haven't added any favorites yet.</p>
                            <p className="mt-2">Explore foods and click the "Add to Favorites" button to save them here!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Nutrition Modal for selected food */}
            <NutritionModal
                isOpen={!!selectedFood}
                onClose={() => setSelectedFood(null)}
                item={selectedFood}
                role="USER"
                userId={userId}
                onEditFood={() => {}}
                onDeleteFood={() => {}}
                initialFavoritedItems={
                    selectedFood && !unfavoritedItems.has(selectedFood.id) 
                        ? new Set([selectedFood.id]) 
                        : new Set()
                }
                onFavoriteChange={handleFavoriteChange}
            />
        </div>
    );
};

export default FavoriteModal;