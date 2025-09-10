import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import PlanService from './PlanService';

const CaloriePlanPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [existingPlan, setExistingPlan] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [goal, setGoal] = useState('maintain');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState(''); // Now in inches
    const [weight, setWeight] = useState(''); // Now in pounds
    const [sex, setSex] = useState('');
    const [weightChangeRate, setWeightChangeRate] = useState('1');
    const [goalWeight, setGoalWeight] = useState(''); // Now in pounds
    const [calculatedCalories, setCalculatedCalories] = useState(null);

    // UI state
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || '');
    const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId') || null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const [showLoginPage, setShowLoginPage] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }

        const fetchUserPlan = async () => {
            try {
                setLoading(true);
                const plans = await PlanService.getUserPlans(currentUserId);
                if (plans && plans.length > 0) {
                    setExistingPlan(plans[0]);
                    setCalculatedCalories(plans[0].calorieGoal);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch user plan. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserPlan();
    }, [isLoggedIn, currentUserId, navigate]);

    const calculateCalories = () => {
        // Convert from US to metric for calculation
        const weightInKg = parseFloat(weight) * 0.453592; // Convert pounds to kg
        const heightInCm = parseFloat(height) * 2.54; // Convert inches to cm

        // Basic BMR calculation using Mifflin-St Jeor Equation
        let bmr;

        if (sex === 'male') {
            bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseFloat(age) + 5;
        } else if (sex === 'female') {
            bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseFloat(age) - 161;
        } else {
            // Default to average of male/female if not specified
            const maleBmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseFloat(age) + 5;
            const femaleBmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseFloat(age) - 161;
            bmr = (maleBmr + femaleBmr) / 2;
        }

        // Activity factor (assuming moderate activity)
        const maintenanceCalories = bmr * 1.55;

        let targetCalories;
        if (goal === 'maintain') {
            targetCalories = maintenanceCalories;
        } else if (goal === 'lose') {
            // Each pound of fat is roughly 3500 calories
            const weeklyDeficit = parseFloat(weightChangeRate) * 3500;
            targetCalories = maintenanceCalories - (weeklyDeficit / 7);
        } else if (goal === 'gain') {
            // Each pound of weight gain (mix of muscle/fat) requires roughly 3500 calories
            const weeklySurplus = parseFloat(weightChangeRate) * 3500;
            targetCalories = maintenanceCalories + (weeklySurplus / 7);
        }

        return Math.round(targetCalories);
    };

    const handleCalculate = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!age || !height || !weight || !sex || (goal !== 'maintain' && !goalWeight)) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const calories = calculateCalories();
            setCalculatedCalories(calories);
            setError(null);
        } catch (err) {
            setError('Error calculating calories. Please check your inputs and try again.');
        }
    };

    const handleSavePlan = async () => {
        if (!calculatedCalories) {
            setError('Please calculate your calorie needs before saving');
            return;
        }

        try {
            if (existingPlan) {
                await PlanService.updatePlan(existingPlan.planId, calculatedCalories);
                setSuccessMessage('Your calorie plan has been updated!');
            } else {
                await PlanService.createPlan(currentUserId, calculatedCalories);
                setSuccessMessage('Your calorie plan has been created!');
            }

            // Refresh the plan data
            const plans = await PlanService.getUserPlans(currentUserId);
            if (plans && plans.length > 0) {
                setExistingPlan(plans[0]);
            }

            // Clear any error
            setError(null);

            // Hide the success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            setError('Failed to save plan. Please try again later.');
        }
    };

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleProfileNavigation = () => {
        setIsProfileDropdownOpen(false);
        navigate('/profile');
    };

    const handleCaloriePlanNavigation = () => {
        setIsProfileDropdownOpen(false);
        // Already on this page, so close dropdown
    };

    const handleDeletePlan = async () => {
        if (!existingPlan) {
            setError('No plan to delete');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to delete your current calorie plan?');
        if (!confirmed) return;

        try {
            await PlanService.deletePlan(existingPlan.planId);
            setExistingPlan(null);
            setCalculatedCalories(null);
            setSuccessMessage('Your calorie plan has been deleted!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to delete plan. Please try again later.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUsername("");
        setCurrentUserId(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setIsProfileDropdownOpen(false);
        navigate('/');
    };

    if (!isLoggedIn) {
        return null; // Redirect handled by useEffect
    }

    return (
        <div>
            <NavigationBar
                searchQuery=""
                setSearchQuery={() => {}}
                searchInputRef={{current: null}}
                isMoreDropdownOpen={isMoreDropdownOpen}
                setIsMoreDropdownOpen={setIsMoreDropdownOpen}
                moreButtonRef={{current: null}}
                isProfileDropdownOpen={isProfileDropdownOpen}
                handleProfileClick={handleProfileClick}
                profileDropdownRef={{current: null}}
                isLoggedIn={isLoggedIn}
                currentUsername={currentUsername}
                handleProfileNavigation={handleProfileNavigation}
                handleCaloriePlanNavigation={handleCaloriePlanNavigation}
                handleLogout={handleLogout}
                setShowLoginPage={setShowLoginPage}
                simplifiedNavbar={true}
            />

            <div className="container mx-auto px-4 pt-24 pb-10">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-center mb-6 border-b pb-3">User Planner</h1>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading your plan...</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {successMessage}
                                </div>
                            )}

                            {existingPlan && (
                                <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4">
                                    <p className="font-medium">Your current calorie goal: {existingPlan.calorieGoal} calories/day</p>
                                    <p className="text-sm mt-1">You can update your plan below if needed.</p>
                                </div>
                            )}

                            <form onSubmit={handleCalculate}>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-lg font-semibold mb-3">What is your goal?</label>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            type="button"
                                            className={`px-6 py-2 rounded-md ${goal === 'maintain' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                            onClick={() => setGoal('maintain')}
                                        >
                                            Maintain weight
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-6 py-2 rounded-md ${goal === 'gain' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                            onClick={() => setGoal('gain')}
                                        >
                                            Gain weight
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-6 py-2 rounded-md ${goal === 'lose' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                            onClick={() => setGoal('lose')}
                                        >
                                            Lose weight
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 mb-2">What is your age?</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 border rounded-md"
                                            placeholder="Enter age"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            min="15"
                                            max="100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2">What is your current height? (inches)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 border rounded-md"
                                            placeholder="Enter height in inches"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            min="36"
                                            max="96"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-gray-700 mb-2">What is your current weight? (pounds)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 border rounded-md"
                                            placeholder="Enter weight in pounds"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            min="66"
                                            max="550"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-2">What is your sex?</label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-md"
                                            value={sex}
                                            onChange={(e) => setSex(e.target.value)}
                                            style={{ color: sex ? 'inherit' : '#9CA3AF' }}
                                        >
                                            <option value="" disabled>Select sex</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                {goal !== 'maintain' && (
                                    <div className="mt-6">
                                        <label className="block text-gray-700 text-lg font-semibold mb-3">
                                            How quickly do you want to {goal === 'lose' ? 'lose' : 'gain'} weight?
                                        </label>
                                        <div className="flex flex-wrap gap-4">
                                            <button
                                                type="button"
                                                className={`px-6 py-2 rounded-md ${weightChangeRate === '0.5' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                                onClick={() => setWeightChangeRate('0.5')}
                                            >
                                                0.5 pounds / week
                                            </button>
                                            <button
                                                type="button"
                                                className={`px-6 py-2 rounded-md ${weightChangeRate === '1' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                                onClick={() => setWeightChangeRate('1')}
                                            >
                                                1 pound / week
                                            </button>
                                            <button
                                                type="button"
                                                className={`px-6 py-2 rounded-md ${weightChangeRate === '1.5' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                                onClick={() => setWeightChangeRate('1.5')}
                                            >
                                                1.5 pounds / week
                                            </button>
                                            <button
                                                type="button"
                                                className={`px-6 py-2 rounded-md ${weightChangeRate === '2' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                                                onClick={() => setWeightChangeRate('2')}
                                            >
                                                2 pounds / week
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {goal !== 'maintain' && (
                                    <div className="mt-6">
                                        <label className="block text-gray-700 mb-2">What is your goal weight? (pounds)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 border rounded-md"
                                            placeholder="Enter goal weight in pounds"
                                            value={goalWeight}
                                            onChange={(e) => setGoalWeight(e.target.value)}
                                            min="66"
                                            max="550"
                                        />
                                    </div>
                                )}

                                <div className="mt-8 flex justify-center">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Calculate
                                    </button>
                                </div>
                            </form>

                            {calculatedCalories && (
                                <div className="mt-8 border-t pt-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="text-lg font-semibold">Calculated calorie planner goal:</div>
                                        <div className="text-2xl font-bold text-blue-600">{calculatedCalories} calories</div>
                                    </div>

                                    <div className="flex justify-center mt-4">
                                        <div className="flex gap-4">
                                            <button
                                                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                                onClick={handleSavePlan}
                                            >
                                                Save Plan
                                            </button>
                                            {existingPlan && (
                                                <button
                                                    className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    onClick={handleDeletePlan}
                                                >
                                                    Delete Plan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaloriePlanPage;