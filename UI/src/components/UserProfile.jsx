
import React, {useState, useEffect, useRef} from 'react';
import {User, Edit, Plus, ArrowLeft, Calendar, RefreshCw} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import MealService from '../services/MealService';
import axios from 'axios';
import NavigationBar from './NavigationBar';

const UserProfile = () => {
    const [meals, setMeals] = useState([
        {id: 1, calories: 0, carbs: 0, fats: 0, protein: 0},
        {id: 2, calories: 0, carbs: 0, fats: 0, protein: 0},
        {id: 3, calories: 0, carbs: 0, fats: 0, protein: 0}
    ]);

    const [isEditing, setIsEditing] = useState(null);
    const navigate = useNavigate();
    const [editingMealData, setEditingMealData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const currentUserId = localStorage.getItem('userId');
    const [calorieGoal, setCalorieGoal] = useState(3400); // Default goal
    const [userPlan, setUserPlan] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calorieHistory, setCalorieHistory] = useState([]);
    const [pastDays, setPastDays] = useState([]);

    // NavigationBar state
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || '');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [showLoginPage, setShowLoginPage] = useState(false);
    const profileDropdownRef = useRef(null);

    // Generate past 7 days including today
    useEffect(() => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            days.push(date);
        }

        setPastDays(days);
    }, []);

    // Format date as MM/DD for display
    const formatDateShort = (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Format date as YYYY-MM-DD for API calls
    const formatDateForApi = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Check if two dates are the same day
    const isSameDay = (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    // Fetch user's plan to get the calorie goal
    useEffect(() => {
        const fetchUserPlan = async () => {
            if (!currentUserId) return;

            try {
                const response = await axios.get(`http://localhost:8080/api/plans/user/${currentUserId}`);
                if (response.data && response.data.length > 0) {
                    // Get the most recent plan if multiple plans exist
                    const latestPlan = response.data[0];
                    setUserPlan(latestPlan);
                    setCalorieGoal(latestPlan.calorieGoal);
                }
            } catch (error) {
                console.error('Error fetching user plan:', error);
            }
        };

        fetchUserPlan();
    }, [currentUserId]);

    // Fetch calorie history for the past 7 days
    useEffect(() => {
        const fetchCalorieHistory = async () => {
            if (!currentUserId) {
                setIsHistoryLoading(false);
                return;
            }

            try {
                setIsHistoryLoading(true);

                // Get date 7 days ago
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 6);

                // Format dates for API request
                const startDate = formatDateForApi(sevenDaysAgo);
                const endDate = formatDateForApi(today);

                const response = await axios.get(`http://localhost:8080/api/history/user/${currentUserId}?startDate=${startDate}&endDate=${endDate}`);

                if (response.data) {
                    setCalorieHistory(response.data);
                }
            } catch (error) {
                console.error('Error fetching calorie history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchCalorieHistory();
    }, [currentUserId, refreshCounter]);

    // Fetch meals for the selected date
    useEffect(() => {
        const fetchMeals = async () => {
            if (!currentUserId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                console.log("Fetching meals for date:", formatDateForApi(selectedDate));

                // Format selected date for API request
                const formattedDate = formatDateForApi(selectedDate);

                const fetchedMeals = await MealService.getMealsByUserAndDate(currentUserId, formattedDate);
                console.log("Fetched meals:", fetchedMeals);

                // Create an array of 3 meals
                let updatedMeals = [
                    {id: 1, calories: 0, carbs: 0, fats: 0, protein: 0},
                    {id: 2, calories: 0, carbs: 0, fats: 0, protein: 0},
                    {id: 3, calories: 0, carbs: 0, fats: 0, protein: 0}
                ];

                // Update with fetched data
                fetchedMeals.forEach(meal => {
                    if (meal.mealNumber >= 1 && meal.mealNumber <= 3) {
                        updatedMeals[meal.mealNumber - 1] = {
                            id: meal.mealNumber,
                            calories: meal.calories || 0,
                            carbs: meal.carbs || 0,
                            fats: meal.fats || 0,
                            protein: meal.protein || 0,
                            mealId: meal.id
                        };
                    }
                });

                setMeals(updatedMeals);
            } catch (error) {
                console.error('Error fetching meals:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeals();
    }, [currentUserId, selectedDate, refreshCounter]);

    // Update calorie intake in history when meals change
    useEffect(() => {
        const updateCalorieHistory = async () => {
            if (!currentUserId || !isSameDay(selectedDate, new Date())) {
                // Only update history for today
                return;
            }

            const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

            try {
                // Check if history entry exists for today
                const today = formatDateForApi(new Date());
                const historyForToday = calorieHistory.find(h => h.date === today);

                if (historyForToday) {
                    // Update existing history
                    await axios.put(`http://localhost:8080/api/history/${historyForToday.id.historyId}/${currentUserId}`, {
                        planId: userPlan?.planId,
                        goal: calorieGoal,
                        intake: totalCalories
                    });
                } else {
                    // Create new history entry
                    await axios.post(`http://localhost:8080/api/history`, {
                        userId: currentUserId,
                        planId: userPlan?.planId,
                        date: today,
                        goal: calorieGoal,
                        intake: totalCalories
                    });
                }

                // No need to refresh history here as it will cause an infinite loop
            } catch (error) {
                console.error('Error updating calorie history:', error);
            }
        };

        // Only run if meals have been loaded and are for today
        if (!isLoading && isSameDay(selectedDate, new Date())) {
            updateCalorieHistory();
        }
    }, [meals, currentUserId, userPlan, calorieGoal, selectedDate, isLoading, calorieHistory]);

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

    const handleEditMeal = (mealId) => {
        const mealToEdit = meals.find(meal => meal.id === mealId);
        setEditingMealData({...mealToEdit});
        setIsEditing(mealId);
    };

    const handleRefresh = () => {
        setRefreshCounter(prev => prev + 1);
    };

    const handleSaveMeal = async (mealId, updatedMeal) => {
        try {
            // Format selected date for API request
            const formattedDate = formatDateForApi(selectedDate);

            // If the meal has an ID in the database
            if (updatedMeal.mealId) {
                await MealService.updateMeal(updatedMeal.mealId, {
                    calories: updatedMeal.calories,
                    carbs: updatedMeal.carbs,
                    fats: updatedMeal.fats,
                    protein: updatedMeal.protein,
                    date: formattedDate
                });
            } else {
                // Create a new meal
                const mealData = {
                    userId: currentUserId,
                    mealNumber: mealId,
                    calories: updatedMeal.calories,
                    carbs: updatedMeal.carbs,
                    fats: updatedMeal.fats,
                    protein: updatedMeal.protein,
                    date: new Date().toISOString()
                };

                // Create the meal
                const response = await fetch('http://localhost:8080/api/meals', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(mealData)
                });

                if (!response.ok) {
                    throw new Error('Failed to create meal');
                }

                const newMeal = await response.json();
                updatedMeal.mealId = newMeal.id;
            }

            setMeals(meals.map(meal =>
                meal.id === mealId ? {...meal, ...updatedMeal} : meal
            ));
            setIsEditing(null);

            // Refresh data
            handleRefresh();
        } catch (error) {
            console.error('Error saving meal:', error);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
    };

    // Navigation handlers
    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleProfileNavigation = () => {
        setIsProfileDropdownOpen(false);
        // Already on profile page
    };

    const handleCaloriePlanNavigation = () => {
        setIsProfileDropdownOpen(false);
        navigate('/calorie-plan');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUsername('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setIsProfileDropdownOpen(false);
        navigate('/');
    };

    const renderMealRow = (meal) => {
        if (isEditing === meal.id) {
            return (
                <tr key={meal.id} className="bg-blue-50">
                    <td>Meal {meal.id}</td>
                    <td>
                        <input
                            type="number"
                            value={editingMealData.calories || ''}
                            className="w-20 border rounded p-1"
                            onChange={(e) =>
                                setEditingMealData({...editingMealData, calories: parseInt(e.target.value) || 0})
                            }
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={editingMealData.carbs || ''}
                            className="w-20 border rounded p-1"
                            onChange={(e) =>
                                setEditingMealData({...editingMealData, carbs: parseInt(e.target.value) || 0})
                            }
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={editingMealData.fats || ''}
                            className="w-20 border rounded p-1"
                            onChange={(e) =>
                                setEditingMealData({...editingMealData, fats: parseInt(e.target.value) || 0})
                            }
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={editingMealData.protein || ''}
                            className="w-20 border rounded p-1"
                            onChange={(e) =>
                                setEditingMealData({...editingMealData, protein: parseInt(e.target.value) || 0})
                            }
                        />
                    </td>
                    <td>
                        <button
                            onClick={() => handleSaveMeal(meal.id, editingMealData)}
                            className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                        >
                            Save
                        </button>
                    </td>
                </tr>
            );
        }

        const isReadOnly = !isSameDay(selectedDate, new Date());

        return (
            <tr key={meal.id}>
                <td>Meal {meal.id}</td>
                <td>{meal.calories}</td>
                <td>{meal.carbs}</td>
                <td>{meal.fats}</td>
                <td>{meal.protein}</td>
                <td>
                    {!isReadOnly && (
                        <button
                            onClick={() => handleEditMeal(meal.id)}
                            className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                        >
                            <Edit size={16}/>
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    const handleCaloriePlanClick = () => {
        navigate('/calorie-plan');
    };

    // Find history entry for selected date
    const selectedDateHistory = calorieHistory.find(h => {
        const historyDate = new Date(h.date);
        return isSameDay(historyDate, selectedDate);
    });

    // Get the correct calorie goal for the selected date
    const selectedDateGoal = selectedDateHistory?.goal || calorieGoal;

    // Get the actual intake for the selected date (from history or current meals)
    const selectedDateIntake = isSameDay(selectedDate, new Date())
        ? totalCalories
        : (selectedDateHistory?.intake || 0);

    // Calculate the progress percentage safely
    const caloriePercentage = selectedDateGoal > 0 ? (selectedDateIntake / selectedDateGoal) * 100 : 0;
    // Ensure the percentage doesn't exceed 100%
    const safePercentage = Math.min(caloriePercentage, 100);

    // Format current date for display
    const formattedCurrentDate = selectedDate.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div>
            <NavigationBar
                searchQuery=""
                setSearchQuery={() => {
                }}
                searchInputRef={{current: null}}
                isMoreDropdownOpen={false}
                setIsMoreDropdownOpen={() => {
                }}
                moreButtonRef={{current: null}}
                isProfileDropdownOpen={isProfileDropdownOpen}
                handleProfileClick={handleProfileClick}
                profileDropdownRef={profileDropdownRef}
                isLoggedIn={isLoggedIn}
                currentUsername={currentUsername}
                handleProfileNavigation={handleProfileNavigation}
                handleCaloriePlanNavigation={handleCaloriePlanNavigation}
                handleLogout={handleLogout}
                setShowLoginPage={setShowLoginPage}
                simplifiedNavbar={true}
                setIsProfileDropdownOpen={setIsProfileDropdownOpen}
            />

            <div className="container mx-auto px-4 pt-24">
                <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={handleBackToHome}
                            className="mr-4 text-blue-500 hover:bg-blue-100 p-2 rounded-full"
                        >
                            <ArrowLeft size={24}/>
                        </button>
                        <User size={40} className="text-gray-600 mr-4"/>
                        <h1 className="text-2xl font-bold">User Profile</h1>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            Nutrition Tracking for {formattedCurrentDate}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleRefresh}
                                className="bg-gray-200 text-gray-600 px-3 py-1 rounded hover:bg-gray-300 flex items-center"
                                title="Refresh data"
                            >
                                <RefreshCw size={16} className="mr-1"/> Refresh
                            </button>
                            {!isSameDay(selectedDate, new Date()) && (
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                                >
                                    <Calendar size={16} className="mr-1"/> Return to Today
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        {isLoading ? (
                            <div className="text-center py-4">Loading meal data...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th>Meal</th>
                                    <th>Calories</th>
                                    <th>Carbs</th>
                                    <th>Fats</th>
                                    <th>Protein</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {meals.map(renderMealRow)}
                                <tr className="font-bold bg-gray-50">
                                    <td>Total</td>
                                    <td>{isSameDay(selectedDate, new Date()) ? totalCalories : selectedDateIntake}</td>
                                    <td>{totalCarbs}</td>
                                    <td>{totalFats}</td>
                                    <td>{totalProtein}</td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="flex justify-between">
                        {isSameDay(selectedDate, new Date()) && (
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                                onClick={() => navigate('/')}
                            >
                                <Plus size={20} className="mr-2"/> Add Food to Meal
                            </button>
                        )}
                        {/* Removed the "Log Weight" button */}
                    </div>

                    <div className="grid grid-cols-1 gap-6 mt-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Calories Consumed vs. Remaining</h3>
                            <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full"
                                    style={{width: `${safePercentage}%`}}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span>{isSameDay(selectedDate, new Date()) ? totalCalories : selectedDateIntake}</span>
                                <span className="flex">
                                Goal: {selectedDateGoal}
                                    {isSameDay(selectedDate, new Date()) && (
                                        <button
                                            onClick={handleCaloriePlanClick}
                                            className="ml-2 text-blue-500 hover:bg-blue-100 p-1 rounded"
                                        >
                                            <Edit size={14}/>
                                        </button>
                                    )}
                            </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Calorie Tracking History</h3>
                            <div className="flex space-x-2 flex-wrap">
                                {isHistoryLoading ? (
                                    <div className="text-gray-500">Loading history...</div>
                                ) : (
                                    pastDays.map((date, index) => {
                                        const isSelected = isSameDay(date, selectedDate);

                                        // Find history entry for this date
                                        const historyEntry = calorieHistory.find(h => {
                                            const historyDate = new Date(h.date);
                                            return isSameDay(historyDate, date);
                                        });

                                        // Color based on percentage of goal reached
                                        let bgColor = "bg-gray-200";
                                        if (historyEntry) {
                                            const percentage = historyEntry.goal > 0 ?
                                                (historyEntry.intake / historyEntry.goal) * 100 : 0;

                                            if (percentage >= 90 && percentage <= 110) {
                                                bgColor = "bg-green-100"; // Good range
                                            } else if (percentage > 110) {
                                                bgColor = "bg-red-100"; // Over goal
                                            } else if (percentage < 90 && percentage >= 50) {
                                                bgColor = "bg-yellow-100"; // Under goal but not too far
                                            } else if (percentage < 50) {
                                                bgColor = "bg-orange-100"; // Far under goal
                                            }
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleSelectDate(date)}
                                                className={`px-3 py-1 rounded text-sm font-medium transition-colors mb-2 
                                                ${isSelected ? 'ring-2 ring-blue-500 ' + bgColor : bgColor}
                                                hover:bg-blue-100`}
                                                title={historyEntry ?
                                                    `Calories: ${historyEntry.intake}/${historyEntry.goal}` :
                                                    "No data for this day"}
                                            >
                                                {formatDateShort(date)}
                                                {isSameDay(date, new Date()) && " (Today)"}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default UserProfile;