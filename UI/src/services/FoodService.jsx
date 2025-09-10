const API_BASE_URL = 'http://localhost:8080';

const FoodService = {
    getDietsForFood: async (foodId) => {
        try {
            const longFoodId = BigInt(foodId).toString();
            const response = await fetch(`${API_BASE_URL}/api/diets/food/${foodId}`);
            if (!response.ok) {
                console.error('Error fetching diets for food:', response.statusText);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching diets for food:', error);
            return []; // Return empty array if request fails
        }
    },
    
    getAllFoods: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods`);
            if (!response.ok) {
                throw new Error('Failed to fetch foods');
            }

            // First try standard JSON parsing directly
            try {
                return await response.json();
            } catch (directParseError) {
                console.error('Direct JSON parsing failed, trying text cleanup:', directParseError);

                // Get the response as text for cleaning
                const text = await response.text();

                // Apply all cleanups in a single operation for better performance
                const cleanupPatterns = [
                    [/"id":\{\}/g, '"id":null'],
                    [/"id":\{[^}]*?\}/g, '"id":null'],
                    [/\[\s*\{\s*\}\s*\]/g, '[]'],
                    [/,"favoriteByUsers":\[[^\]]*\]/g, ',"favoriteByUsers":[]'],
                    [/,"creator":\{[^}]*\}/g, ',"creator":null'],
                    [/,"user":\{[^}]*\}/g, ',"user":null'],
                    [/,"food":\{[^}]*\}/g, ',"food":null'],
                    [/,"favorites":\[[^\]]*\]/g, ',"favorites":[]']
                ];

                let cleanedJson = text;
                for (const [pattern, replacement] of cleanupPatterns) {
                    cleanedJson = cleanedJson.replace(pattern, replacement);
                }

                try {
                    // Try parsing the cleaned JSON
                    return JSON.parse(cleanedJson);
                } catch (cleanedParseError) {
                    console.error('Cleaned JSON parsing failed, using extraction fallback:', cleanedParseError);

                    // Unified regex approach - more efficient than multiple passes
                    const foodObjects = [];
                    const regex = /"foodID"\s*:\s*(\d+).*?"foodName"\s*:\s*"([^"]*)".*?(?:"calories"\s*:\s*(\d+))?/g;
                    let match;

                    while ((match = regex.exec(text)) !== null) {
                        const [_, foodID, foodName, calories] = match;
                        if (foodID && foodName) {
                            foodObjects.push({
                                foodID: parseInt(foodID),
                                foodName: foodName,
                                calories: calories ? parseInt(calories) : 0,
                                foodImage: "default.jpg",
                                protein: 0,
                                totalFat: 0,
                                sodium: 0,
                                carbs: 0
                            });
                        }
                    }

                    if (foodObjects.length > 0) {
                        console.log('Successfully extracted', foodObjects.length, 'food items');
                        return foodObjects;
                    }

                    console.log('Extraction failed, returning fallback data');
                    return [
                        {
                            foodID: 1,
                            foodName: "Sample Food",
                            foodImage: "default.jpg",
                            calories: 100,
                            protein: 5.0,
                            totalFat: 2.0,
                            sodium: 50.0,
                            carbs: 15.0
                        }
                    ];
                }
            }
        } catch (error) {
            console.error('Error fetching foods:', error);
            return [];
        }
    },

    getAllFoodsByDiet: async (diet_name) => {
        try {
            console.log(`Fetching foods for diet: ${diet_name}`);
            
            // First, get all diets by diet name
            const response = await fetch(`${API_BASE_URL}/api/diets/name/${diet_name}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
    
            if (!response.ok) {
                console.error(`Error fetching diet ${diet_name}: ${response.status} ${response.statusText}`);
                return [];
            }
    
            try {
                const dietData = await response.json();
                console.log(`Received diet data for ${diet_name}:`, dietData);
                
                // Extract food IDs from diet data
                const foodIds = [];
                
                if (Array.isArray(dietData)) {
                    dietData.forEach(diet => {
                        if (diet && diet.id && diet.id.foodId) {
                            foodIds.push(diet.id.foodId);
                        }
                    });
                }
                
                console.log(`Extracted ${foodIds.length} food IDs from diet ${diet_name}:`, foodIds);
                
                // Fetch the complete food details for each ID
                const foodPromises = foodIds.map(id => FoodService.getFoodById(id));
                const foodsArray = await Promise.all(foodPromises);
                
                console.log(`Retrieved ${foodsArray.length} food objects for diet ${diet_name}:`, foodsArray);
                return foodsArray;
                
            } catch (parseError) {
                console.error(`Error processing diet ${diet_name} data:`, parseError);
                console.error(`Response text:`, await response.text());
                return [];
            }
        } catch (error) {
            console.error(`Error fetching diet ${diet_name}:`, error);
            return [];
        }
    },

    getFoodById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch food with id ${id}`);
            }

            // Try direct JSON parsing first
            try {
                return await response.json();
            } catch (parseError) {
                console.error(`Error parsing food ${id} JSON:`, parseError);

                // Get text response for cleaning
                const text = await response.text();

                // Apply all cleanups in a single operation
                const cleanedJson = text
                    .replace(/"id":\{\}/g, '"id":null')
                    .replace(/"id":\{[^}]*?\}/g, '"id":null')
                    .replace(/,"favoriteByUsers":\[[^\]]*\]/g, ',"favoriteByUsers":[]')
                    .replace(/,"creator":\{[^}]*\}/g, ',"creator":null');

                try {
                    return JSON.parse(cleanedJson);
                } catch (secondError) {
                    console.warn(`Cleaned parsing failed for food ${id}, extracting basic data`);

                    // Extract data using named capture groups for clarity
                    const foodData = text.match(/(?:"foodID"\s*:\s*(?<id>\d+))|(?:"foodName"\s*:\s*"(?<name>[^"]*)")|(?:"calories"\s*:\s*(?<calories>\d+))/g);

                    if (foodData) {
                        const extractId = foodData.find(item => item.includes('"foodID"'))?.match(/\d+/)?.[0];
                        const extractName = foodData.find(item => item.includes('"foodName"'))?.match(/"([^"]*)"/)?.[1];
                        const extractCalories = foodData.find(item => item.includes('"calories"'))?.match(/\d+/)?.[0];

                        if (extractId && extractName) {
                            return {
                                foodID: parseInt(extractId),
                                foodName: extractName,
                                calories: extractCalories ? parseInt(extractCalories) : 0,
                                foodImage: "default.jpg",
                                protein: 0,
                                totalFat: 0,
                                sodium: 0,
                                carbs: 0
                            };
                        }
                    }

                    // Create a fallback object with the requested ID
                    return {
                        foodID: id,
                        foodName: "Unknown Food",
                        calories: 0,
                        foodImage: "default.jpg",
                        protein: 0,
                        totalFat: 0,
                        sodium: 0,
                        carbs: 0
                    };
                }
            }
        } catch (error) {
            console.error(`Error fetching food ${id}:`, error);
            return {
                foodID: id,
                foodName: "Error Loading Food",
                calories: 0,
                foodImage: "default.jpg",
                protein: 0,
                totalFat: 0,
                sodium: 0,
                carbs: 0
            };
        }
    },

    searchFoodByName: async (name) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/search?name=${encodeURIComponent(name)}`);
            if (!response.ok) {
                throw new Error('Failed to search foods');
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching foods:', error);
        }
    },

    getFoodsByCreator: async (creatorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/creator/${creatorId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch foods by creator ${creatorId}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching foods by creator ${creatorId}:`, error);
            return [];
        }
    },

    createFood: async (food, creatorId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/creator/${creatorId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(food),
            });
            if (!response.ok) {
                throw new Error('Failed to create food');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating food:', error);
            return null;
        }
    },

    updateFood: async (id, food) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(food.formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Failed to update food ${id}:`, errorData);
                throw new Error(`Failed to update food ${id}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating food ${id}:`, error);
            return null;
        }
    },

    deleteFood: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to delete food ${id}`);
            }
            return true;
        } catch (error) {
            console.error(`Error deleting food ${id}:`, error);
            return false;
        }
    },

    addFavorite: async (userId, foodId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/favorites/user/${userId}/food/${foodId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to add favorite');
            }

            return true;
        } catch (error) {
            console.error('Error adding favorite:', error);
            return false;
        }
    },

    removeFavorite: async (userId, foodId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/favorites/user/${userId}/food/${foodId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove favorite');
            }

            return true;
        } catch (error) {
            console.error('Error removing favorite:', error);
            return false;
        }
    },

    getUserFavorites: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/favorites/user/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch user favorites');
            }
            try {
                return await response.json();
            } catch (parseError) {
                console.error('Error parsing favorites JSON:', parseError);

                // Get text and apply cleanups in one step
                const text = await response.text();
                const cleanedJson = text
                    .replace(/"id":\{\}/g, '"id":null')
                    .replace(/"id":\{[^}]*?\}/g, '"id":null')
                    .replace(/,"user":\{[^}]*\}/g, ',"user":null')
                    .replace(/,"food":\{[^}]*\}/g, ',"food":null');

                try {
                    return JSON.parse(cleanedJson);
                } catch (secondError) {
                    console.warn('Cleaned parsing failed for favorites, extracting IDs');

                    // Use a more reliable regex for extraction
                    const foodIdRegex = /"food(?:Id|ID)"\s*:\s*(\d+)/g;
                    const foodIds = [];
                    let match;

                    while ((match = foodIdRegex.exec(text)) !== null) {
                        if (match[1]) {
                            foodIds.push({
                                id: {
                                    foodId: parseInt(match[1]),
                                    userId: userId
                                }
                            });
                        }
                    }
                    if (foodIds.length > 0) {
                        console.log(`Extracted ${foodIds.length} favorite food IDs for user ${userId}`);
                        return foodIds;
                    }
                    return [];
                }
            }
        } catch (error) {
            console.error(`Error fetching favorites for user ${userId}:`, error);
            return [];
        }
    },
    async updateFoodTags(foodId, tags) {
        try {
            const response = await fetch(`http://localhost:8080/api/foods/${foodId}/tags`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tags })
            });
            if (!response.ok) {
                throw new Error('Failed to update food tags');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating food tags:', error);
            return null;
        }
    },
    createDiet: async (dietData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/diets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dietData)
            });

            if (!response.ok) {
                throw new Error('Failed to create diet');
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating diet:', error);
            return null;
        }
    },

    getBaseDiets: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/diets`);
            if (!response.ok) {
                throw new Error('Failed to fetch diets');
            }
            const diets = await response.json();
            return diets.filter(diet => diet.id.foodId === 0);
        } catch (error) {
            console.error('Error fetching base diets:', error);
            return [];
        }
    },

};
export default FoodService;