import React, {useState, useRef, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import NavigationBar from './NavigationBar';
import ContentBlock from './ContentBlock';
import NutritionModal from './NutritionModal';
import LoginSignupModal from './LoginSignupModal';
import FoodService from '../services/FoodService';
import FoodForm from "./FoodForm.jsx";
import UserProfile from "./UserProfile.jsx";
import { HelpCircle, X } from 'lucide-react';

const HomePage = () => {
    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const [showLoginPage, setShowLoginPage] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || "");
    const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId') || null);
    const [userRole, setUserRole] = useState('USER');

    const searchInputRef = useRef(null);
    const moreButtonRef = useRef(null);
    const profileDropdownRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const moreDropdownRef = useRef(null);
    const profileMenuRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);  // Store the food item to edit
    const [isFoodFormOpen, setIsFoodFormOpen] = useState(false); // For adding food items
    const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
    const [selectedDiet, setSelectedDiet] = useState(null); // New state for diet filter

    const helpTopics = [
        { title: 'Searching Foods', content: 'Use the search bar to find foods by name, category, or nutritional content.' },
        { title: 'Diet Filters', content: 'Click on diet icons to filter foods according to your dietary preferences.' },
        { title: 'Categories', content: 'Use the "More" menu to browse foods by category.' },
        { title: 'Calorie Planner', content: 'Create and track your daily meal plans in the Calorie Planner section.' },
        { title: 'Favorites', content: 'Save your favorite foods for quick access in the future.' }
    ];

    useEffect(() => {
        const dietParam = searchParams.get('diet');
        if (dietParam) {
            console.log('Found diet parameter in URL:', dietParam);
            setSelectedDiet(dietParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let foodsData;

                // If a diet is selected, fetch foods by diet
                if (selectedDiet) {
                    console.log('Fetching foods for diet:', selectedDiet);
                    foodsData = await FoodService.getAllFoodsByDiet(selectedDiet);
                } else if (searchQuery.trim() !== '') {
                    // If there's a search query, fetch foods by search
                    foodsData = await FoodService.searchFoodByName(searchQuery);
                } else {
                    // Otherwise, fetch all foods
                    foodsData = await FoodService.getAllFoods();
                }

                const filteredFoodsData = foodsData.filter(food => food.foodID !== 0);

                setFoods(filteredFoodsData);
                setFilteredFoods(filteredFoodsData);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch foods. Please try again later.');
                setLoading(false);
            }
        };

        // Debounce the search to prevent too many API calls
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedDiet]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreButtonRef.current && !moreButtonRef.current.contains(event.target) && moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
                setIsMoreDropdownOpen(false);
            }

            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target) && profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleProfileNavigation = () => {
        setIsProfileDropdownOpen(false);
        navigate('/profile');
    };

    const handleCaloriePlanNavigation = () => {
        setIsProfileDropdownOpen(false);
        navigate('/calorie-plan');
    };

    // Function to handle diet filtering
    const handleDietFilter = (dietType) => {
        // If the same diet is clicked again, clear the filter
        if (dietType === selectedDiet) {
            setSelectedDiet(null);
            setSearchQuery(''); // Clear search when removing diet filter
            navigate('/'); // Remove diet parameter from URL
        } else {
            setSelectedDiet(dietType);
            setSearchQuery(''); // Clear search when changing diet filter
            navigate(`/?diet=${encodeURIComponent(dietType)}`); // Add diet parameter to URL
        }
    };

    const handleSuccessfulLogin = (username, userId, userRole) => {
        setIsLoggedIn(true);
        setCurrentUsername(username);
        setCurrentUserId(userId);
        setUserRole(userRole);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userRole', userRole);
        setShowLoginPage(false);
        setIsProfileDropdownOpen(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUsername("");
        setCurrentUserId(null);
        setUserRole("USER");
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        setIsProfileDropdownOpen(false);
    };

    const handleDeleteAccount = async () => {
        // Show confirmation dialog
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/users/${currentUserId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // If deletion was successful, log out the user
                handleLogout();
            } else {
                alert('Failed to delete account. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('An error occurred while deleting your account.');
        }
    };

    const closeLoginPage = () => {
        setShowLoginPage(false);
    };

    const handleAddFood = async (newFood) => {
        if (!currentUserId) {
            alert('You must be logged in to add food!');
            return;
        }

        const createdFood = await FoodService.createFood(newFood, currentUserId);
        if (createdFood) {
            setFoods(prev => [...prev, createdFood]);
            setFilteredFoods(prev => [...prev, createdFood]);
            setIsFoodFormOpen(false);
        }
    };

    const handleEditFood = (food) => {
        setSelectedItem(food);
        setSelectedFood(food);
        setIsFoodFormOpen(true);
    };

    const clearDietFilter = () => {
        setSelectedDiet(null);
        navigate('/');
    };

    const handleEditFoodSubmit = async (updatedFood) => {
        try {
            // Update food in the backend (API call)
            const response = await FoodService.updateFood(updatedFood.foodID, updatedFood);
            console.log("Updating food with ID:", updatedFood.foodID, updatedFood);
            if (response) {
                // Update the food in the local state if backend update is successful
                setFoods((prevFoods) =>
                    prevFoods.map((food) =>
                        food.foodID === updatedFood.foodID ? updatedFood : food
                    )
                );
                window.location.reload();
                setSelectedItem(response);
                setSelectedFood(response); //Updates selected food item to latest
                setIsFoodFormOpen(false);
            }
        } catch (error) {
            console.error('Error updating food:', error);
        }
    };

    const handleDeleteFood = async (food) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${food.title}"?`);
        if (!confirmDelete) return;

        const success = await FoodService.deleteFood(food.id);
        if (success) {
            setFoods(prev => prev.filter(f => f.foodID !== food.id));
            setFilteredFoods(prev => prev.filter(f => f.foodID !== food.id));
            setSelectedItem(null); // Close modal
        } else {
            alert('Failed to delete the food item. Please try again.');
        }
    };

    useEffect(() => {
        if (!isLoggedIn || !currentUserId) {
            return;
        }

        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/users/${currentUserId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user with id ${id}`);
                }
                const data = await response.json();
                //console.log('Fetched user data:', data);
                setUserRole(data.role);
            } catch (error) {
                console.error(`Error fetching user ${id}:`, error);
                return null;
            }
        };

        fetchCurrentUser();
    }, [isLoggedIn, currentUserId]);

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [filteredFoods]);

    const filteredContent = filteredFoods.map(food => {
        // Check if this is already in the right format
        if (food.id && food.title && food.imageSrc) {
            return food;
        }

        // Otherwise, transform it to the right format with fallbacks
        return {
            ...food,
            imageSrc: food.imageSrc || `/src/assets/${food.foodImage || 'default.jpg'}`,
            title: food.title || food.foodName || 'Unknown Food',
            description: food.description ||
                `Calories: ${food.calories || 0}   Protein: ${food.protein || 0}   TotalFat: ${food.totalFat || 0}`,
            id: food.id || food.foodID
        };
    });

    const handleAddToMealClick = (food) => {
        setSelectedFood(food);
        setIsModalOpen(true);
        setSelectedItem(null); // Close the nutrition modal
    };

    const navigateToFAQ = () => {
        navigate('/faq');
        setIsHelpModalOpen(false);
    };

    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <NavigationBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchInputRef={searchInputRef}
                isMoreDropdownOpen={isMoreDropdownOpen}
                setIsMoreDropdownOpen={setIsMoreDropdownOpen}
                moreButtonRef={moreButtonRef}
                isProfileDropdownOpen={isProfileDropdownOpen}
                handleProfileClick={handleProfileClick}
                profileDropdownRef={profileDropdownRef}
                isLoggedIn={isLoggedIn}
                currentUsername={currentUsername}
                handleProfileNavigation={handleProfileNavigation}
                handleCaloriePlanNavigation={handleCaloriePlanNavigation}
                handleLogout={handleLogout}
                setShowLoginPage={setShowLoginPage}
                onAddFoodClick={() => setIsFoodFormOpen(true)}
                handleDietFilter={handleDietFilter}
                selectedDiet={selectedDiet}
                userRole={userRole}
                setIsProfileDropdownOpen={setIsProfileDropdownOpen}
                handleDeleteAccount={handleDeleteAccount}
            />
            <div className="container mx-auto px-4 pt-24">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">Loading foods...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 mt-10">
                        {error}
                    </div>
                ) : (
                    <>
                        {selectedDiet && (
                            <div className="mb-4 flex items-center">
                                <span className="mr-2 text-gray-600">Currently showing:</span>
                                <span
                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                {selectedDiet}
                                    <button
                                        onClick={clearDietFilter}
                                        className="ml-2 text-green-800 hover:text-green-950"
                                        title="Clear filter"
                                    >
                    ×
                </button>
            </span>
                            </div>
                        )}
                        <div className="grid grid-cols-4 gap-4">
                            {filteredContent.map((block, index) => (
                                <ContentBlock
                                    key={index}
                                    {...block}
                                    onSelect={() => setSelectedItem(block)}
                                    role={userRole}
                                    onEditFood={handleEditFood}
                                />
                            ))}
                        </div>
                    </>
                )}
                {!loading && !error && filteredContent.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No items found matching "{searchQuery}"
                    </div>
                )}
            </div>
            <NutritionModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                role={userRole}
                userId={currentUserId}
                onEditFood={(food) => {
                    setSelectedFood(food);
                    setIsFoodFormOpen(true);
                }}
                onDeleteFood={handleDeleteFood}
                onAddToMeal={handleAddToMealClick}  // Add this line
                initialFavoritedItems={new Set()}
                onFavoriteChange={() => {
                }}
            />
            <LoginSignupModal
                isOpen={showLoginPage}
                onClose={closeLoginPage}
                onSuccessfulLogin={handleSuccessfulLogin}
            />
            <FoodForm
                isOpen={isFoodFormOpen}
                onClose={() => setIsFoodFormOpen(false)}
                onAddFood={handleAddFood}
                foodToEdit={selectedFood}  // Pass selected food to the form
                onEditFood={handleEditFoodSubmit}
            />

            {/* Help Button - removed background shading */}
            <div className="fixed top-5 right-28 z-50">
                <button
                    onClick={() => setIsHelpModalOpen(true)}
                    className="group relative p-2 transition-colors"
                    aria-label="Help"
                >
                    <HelpCircle size={28} className="text-blue-600" />
                    <span className="absolute bottom-full right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                        Help Center
                    </span>
                </button>
            </div>

            {/* Help Modal */}
            {isHelpModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsHelpModalOpen(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-semibold text-gray-800">Help Center</h2>
                            <button
                                onClick={() => setIsHelpModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <div className="space-y-6">
                                {helpTopics.map((topic, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                        <h3 className="text-lg font-medium text-blue-600 mb-2">{topic.title}</h3>
                                        <p className="text-gray-600">{topic.content}</p>
                                    </div>
                                ))}
                                <div className="border-b border-gray-200 pb-4 last:border-0">
                                    <h3 className="text-lg font-medium text-blue-600 mb-2">Need More Help?</h3>
                                    <p className="text-gray-600">
                                        Contact our support team at fakesupport@caloriescount.com or{' '}
                                        <button
                                            onClick={navigateToFAQ}
                                            className="text-blue-600 hover:underline focus:outline-none"
                                        >
                                            visit our FAQ page
                                        </button>.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
                            <button
                                onClick={() => setIsHelpModalOpen(false)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;