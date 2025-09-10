class MealService {
    static async createMeal(mealData) {
        try {
            console.log("MealService.createMeal called with data:", mealData);

            // Ensure all values are the correct type
            const cleanedData = {
                ...mealData,
                userId: parseInt(mealData.userId),
                mealNumber: parseInt(mealData.mealNumber),
                calories: parseInt(mealData.calories || 0),
                protein: parseFloat(mealData.protein || 0),
                carbs: parseFloat(mealData.carbs || 0),
                fats: parseFloat(mealData.fats || 0)
            };

            console.log("Cleaned meal data for API call:", cleanedData);

            const response = await fetch('http://localhost:8080/api/meals/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response for meal creation:", errorText);
                throw new Error(`Failed to create meal: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in createMeal:', error);
            throw error;
        }
    }

    static async addFoodToMeal(mealData) {
        try {
            console.log("MealService.addFoodToMeal called with data:", mealData);

            // Ensure all numeric fields are actually numbers
            const cleanedData = {
                ...mealData,
                userId: parseInt(mealData.userId),
                foodId: parseInt(mealData.foodId),
                mealId: parseInt(mealData.mealId),
                servings: parseFloat(mealData.servings),
                calories: parseInt(mealData.calories),
                protein: parseFloat(mealData.protein),
                carbs: parseFloat(mealData.carbs),
                fats: parseFloat(mealData.fats)
            };

            console.log("Cleaned data for API call:", cleanedData);

            const response = await fetch('http://localhost:8080/api/meals/add-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                throw new Error(`Failed to add food to meal: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in addFoodToMeal:', error);
            throw error;
        }
    }

    static async getMealsByUser(userId) {
        try {
            const response = await fetch(`http://localhost:8080/api/meals/user/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch meals');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getMealsByUser:', error);
            throw error;
        }
    }

    static async getMealsByUserAndDate(userId, date) {
        try {
            const response = await fetch(`http://localhost:8080/api/meals/user/${userId}/date/${date}`);

            if (!response.ok) {
                throw new Error('Failed to fetch meals by date');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getMealsByUserAndDate:', error);
            throw error;
        }
    }


    static async updateMeal(mealId, updateData) {
        try {
            console.log("MealService.updateMeal called for mealId:", mealId, "with data:", updateData);

            // Since we already have the meal data from the existing object in MealSelectionModal,
            // we can send a complete update directly without fetching first

            // Format the payload with explicit types for the backend
            const payload = {
                id: parseInt(mealId),
                mealNumber: updateData.mealNumber !== undefined ? parseInt(updateData.mealNumber) : null,
                calories: parseInt(updateData.calories || 0),
                protein: parseFloat(updateData.protein || 0),
                carbs: parseFloat(updateData.carbs || 0),
                fats: parseFloat(updateData.fats || 0),
                // Include the date if available
                date: updateData.date,
                // Include user ID information in format the backend can handle
                userId: updateData.userId !== undefined ? parseInt(updateData.userId) : null
            };

            console.log("Prepared update payload:", payload);

            const response = await fetch(`http://localhost:8080/api/meals/update/${mealId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Get response text for better debugging
            const responseText = await response.text();
            console.log("Raw update response:", responseText);

            if (!response.ok) {
                console.error("API Error Response:", responseText);
                throw new Error(`Failed to update meal: ${responseText}`);
            }

            // Parse JSON only if there's content to parse
            return responseText ? JSON.parse(responseText) : {};
        } catch (error) {
            console.error('Error in updateMeal:', error);
            throw error;
        }
    }

    static async deleteMeal(mealId) {
        try {
            const response = await fetch(`http://localhost:8080/api/meals/${mealId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete meal');
            }

            return true;
        } catch (error) {
            console.error('Error in deleteMeal:', error);
            throw error;
        }
    }
}

export default MealService;