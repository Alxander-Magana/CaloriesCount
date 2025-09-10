import React, { useState, useEffect } from 'react';
import FoodService from '../services/FoodService';

const FoodForm = ({ isOpen, onClose, onAddFood, userID, onEditFood, foodToEdit }) => {
    const [formData, setFormData] = useState({
        foodID: '',
        foodName: '',
        foodImage: '',
        calories: '',
        protein: '',
        totalFat: '',
        sodium: '',
        carbs: '',
    });
    const [availableDiets, setAvailableDiets] = useState([]);
    const [selectedDiets, setSelectedDiets] = useState([]);
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        if (foodToEdit) {
            // Only update formData if foodToEdit is provided
            setFormData({
                foodID: foodToEdit.foodID,
                foodName: foodToEdit.foodName || '',
                foodImage: foodToEdit.foodImage || '',
                calories: foodToEdit.calories || '',
                protein: foodToEdit.protein || '',
                totalFat: foodToEdit.totalFat || '',
                sodium: foodToEdit.sodium || '',
                carbs: foodToEdit.carbs || '',
            });
            if (isAdmin) {
                fetchCurrentDiets();
            }
        }
        if (isAdmin) {
            fetchBaseDiets();
        }
    }, [foodToEdit, isAdmin]);

    const fetchBaseDiets = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/diets');
            const diets = await response.json();
            const baseDiets = diets.filter(diet => diet.id.foodId === 0);
            setAvailableDiets(baseDiets);
        } catch (error) {
            console.error('Error fetching base diets:', error);
        }
    };

    const fetchCurrentDiets = async () => {
        if (foodToEdit && foodToEdit.foodID) {
            try {
                const response = await fetch(`http://localhost:8080/api/diets/food/${foodToEdit.foodID}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    // Add a small delay to avoid race condition
                    signal: AbortSignal.timeout(2000) // 2 second timeout
                });

                if (!response.ok) {
                    console.warn('Non-critical error fetching diets, continuing...');
                    return; // Exit gracefully
                }

                const currentDiets = await response.json();
                if (Array.isArray(currentDiets)) {
                    setSelectedDiets(currentDiets.map(diet => diet.id.dietName));
                }
            } catch (error) {
                // Just log the error but don't throw it
                console.warn('Non-critical error fetching diets:', error);
                // Continue execution without throwing error
            }
        }
    };

    const handleDietChange = async (dietName) => {
        try {
            if (selectedDiets.includes(dietName)) {
                // Remove diet
                await fetch(`http://localhost:8080/api/diets/${formData.foodID}/${encodeURIComponent(dietName)}`, {
                    method: 'DELETE'
                });
                setSelectedDiets(selectedDiets.filter(d => d !== dietName));
            } else {
                // Add diet
                await fetch(`http://localhost:8080/api/diets/food/${formData.foodID}?dietName=${encodeURIComponent(dietName)}`, {
                    method: 'POST'
                });
                setSelectedDiets([...selectedDiets, dietName]);
            }
        } catch (error) {
            console.error('Error updating diet:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const processedFormData = {
            ...formData,
            calories: parseInt(formData.calories),
            protein: formData.protein ? parseFloat(formData.protein) : null,
            totalFat: formData.totalFat ? parseFloat(formData.totalFat) : null,
            sodium: formData.sodium ? parseFloat(formData.sodium) : null,
            carbs: formData.carbs ? parseFloat(formData.carbs) : null,
        };

        if (foodToEdit) {
            await onEditFood({ foodID: formData.foodID, formData: processedFormData });
        } else {
            await onAddFood(processedFormData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {foodToEdit ? 'Edit Food' : 'Add New Food'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Food Name</label>
                        <input
                            type="text"
                            value={formData.foodName}
                            onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                            type="text"
                            value={formData.foodImage}
                            onChange={(e) => setFormData({ ...formData, foodImage: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Calories</label>
                        <input
                            type="number"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.protein}
                            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Fat (g)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.totalFat}
                            onChange={(e) => setFormData({ ...formData, totalFat: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sodium (mg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.sodium}
                            onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.carbs}
                            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {isAdmin && foodToEdit && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diets</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {availableDiets.map(diet => (
                                    <label key={diet.id.dietName} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedDiets.includes(diet.id.dietName)}
                                            onChange={() => handleDietChange(diet.id.dietName)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{diet.id.dietName}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {foodToEdit ? 'Save Changes' : 'Add Food'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodForm;
