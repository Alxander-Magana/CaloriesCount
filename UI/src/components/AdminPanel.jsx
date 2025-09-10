import React, { useState, useEffect, useRef } from 'react';
import NavigationBar from './NavigationBar';
import FoodService from '../services/FoodService';
import { Search, Trash2, Edit } from 'lucide-react';
import FoodForm from './FoodForm';

const AdminPanel = () => {
    const [view, setView] = useState('users');
    const [users, setUsers] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);

    const profileDropdownRef = useRef(null);
    const profileMenuRef = useRef(null);

    const [diets, setDiets] = useState([]);
    const [newDietName, setNewDietName] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target) &&
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === 'users') {
                    const response = await fetch('http://localhost:8080/api/users');
                    const data = await response.json();
                    setUsers(data);
                } else if (view === 'foods') {
                    const foodsData = await FoodService.getAllFoods();
                    setFoods(foodsData);
                } else if (view === 'diets') {
                    const response = await fetch('http://localhost:8080/api/diets');
                    const data = await response.json();
                    //console.log('Diet data detailed:', JSON.stringify(data, null, 2));
                    setDiets(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };

        fetchData();
    }, [view]);

    useEffect(() => {
        const fetchDiets = async () => {
            if (view === 'diets') {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:8080/api/diets');
                    const data = await response.json();
                    setDiets(data);
                } catch (error) {
                    console.error('Error fetching diets:', error);
                }
                setLoading(false);
            }
        };

        fetchDiets();
    }, [view]);

// Add these handler functions
    const handleAddDiet = async () => {
        if (!newDietName.trim()) return;

        try {
            const dietData = {
                id: {
                    foodId: 0,
                    dietName: newDietName
                }
            };

            const response = await FoodService.createDiet(dietData);
            if (response) {
                setDiets([...diets, response]);
                setNewDietName('');
            }
        } catch (error) {
            console.error('Error adding diet:', error);
        }
    };

    const handleDeleteDiet = async (dietId) => {
        if (window.confirm('Are you sure you want to delete this diet?')) {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/diets/${dietId.foodId}/${encodeURIComponent(dietId.dietName)}`,
                    {
                        method: 'DELETE'
                    }
                );
                if (response.ok) {
                    setDiets(diets.filter(diet =>
                        !(diet.id.foodId === dietId.foodId && diet.id.dietName === dietId.dietName)
                    ));
                }
            } catch (error) {
                console.error('Error deleting diet:', error);
            }
        }
    };

    const handleDeleteUser = async (userID) => {  // Changed parameter name to match backend
        if (!userID) {
            console.error('User ID is undefined');
            return;
        }
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`http://localhost:8080/api/users/${userID}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setUsers(users.filter(user => user.userID !== userID));  // Changed from userId
                } else {
                    console.error('Failed to delete user:', response.status);
                    alert('Failed to delete user. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user. Please try again.');
            }
        }
    };

    const handleDeleteFood = async (foodId) => {
        if (window.confirm('Are you sure you want to delete this food item?')) {
            const success = await FoodService.deleteFood(foodId);
            if (success) {
                setFoods(foods.filter(food => food.foodID !== foodId));
            }
        }
    };

    const handleEditFood = (food) => {
        setSelectedFood(food);
        setIsFoodFormOpen(true);
    };

    const handleEditFoodSubmit = async (updatedFood) => {
        try {
            const response = await FoodService.updateFood(updatedFood.foodID, updatedFood);
            if (response) {
                setFoods((prevFoods) =>
                    prevFoods.map((food) =>
                        food.foodID === updatedFood.foodID ? updatedFood : food
                    )
                );
                setIsFoodFormOpen(false);
                setSelectedFood(null);
            }
        } catch (error) {
            console.error('Error updating food:', error);
        }
    };

    const filteredData = view === 'users'
        ? users.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : view === 'foods'
            ? foods.filter(food =>
                food.foodName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : diets.filter(diet =>
                diet.id.dietName.toLowerCase().includes(searchQuery.toLowerCase())
            );

    const sortedFilteredData = view === 'diets'
        ? filteredData.sort((a, b) => {
            if (a.id.foodId === 0 && b.id.foodId !== 0) return -1;
            if (a.id.foodId !== 0 && b.id.foodId === 0) return 1;

            if (a.id.foodId !== b.id.foodId) {
                return a.id.foodId - b.id.foodId;
            }

            // If foodIds are equal, sort by dietName alphabetically
            return a.id.dietName.localeCompare(b.id.dietName);
        })
        : filteredData;

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <NavigationBar
                simplifiedNavbar={true}
                currentUsername={localStorage.getItem('username')}
                handleLogout={() => {
                    localStorage.clear();
                    window.location.href = '/';
                }}
                isLoggedIn={true}
                userRole="ADMIN"
                isProfileDropdownOpen={isProfileDropdownOpen}
                handleProfileClick={handleProfileClick}
                profileDropdownRef={profileDropdownRef}
                profileMenuRef={profileMenuRef}
            />
            <div className="container mx-auto px-4 pt-24">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admin Panel</h1>
                    <div className="flex space-x-4 items-center">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={`Search ${view}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <select
                            value={view}
                            onChange={(e) => {
                                setView(e.target.value);
                                setSearchQuery('');
                            }}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="users">Users</option>
                            <option value="foods">Foods</option>
                            <option value="diets">Diets/Tags</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
                    </div>
                ) : view === 'users' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.map(user => (
                                <tr key={user.userID} className="dark:text-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap">{user.userID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDeleteUser(user.userID)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : view === 'foods' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map(food => (
                            <div key={food.foodID} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        alt={food.foodName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 dark:text-white">{food.foodName}</h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <p>Calories: {food.calories}</p>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button
                                            onClick={() => handleEditFood(food)}
                                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFood(food.foodID)}
                                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newDietName}
                                onChange={(e) => setNewDietName(e.target.value)}
                                placeholder="Enter new diet name"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddDiet}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add Diet
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Diet Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Food ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedFilteredData.map((diet, index) => (
                                    <tr key={`${diet.id.foodId}-${diet.id.dietName}`} className="dark:text-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {diet.id.dietName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {diet.id.foodId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDeleteDiet(diet.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <FoodForm
                isOpen={isFoodFormOpen}
                onClose={() => {
                    setIsFoodFormOpen(false);
                    setSelectedFood(null);
                }}
                foodToEdit={selectedFood}
                onEditFood={handleEditFoodSubmit}
            />
        </div>
    );
};

export default AdminPanel;
