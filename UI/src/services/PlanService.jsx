import FoodService from "./FoodService.jsx";

const API_BASE_URL = 'http://localhost:8080';

const PlanService = {
    getUserPlans: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/plans/user/${userId}`);
            if (!response.ok) throw new Error("Failed to get user plans");
            return await response.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    createPlan: async (userId, calorieGoal) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/plans/user/${userId}?calorieGoal=${calorieGoal}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error("Failed to create plan");
            return await response.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    updatePlan: async (planId, calorieGoal) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/plans/${planId}?calorieGoal=${calorieGoal}`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error("Failed to update plan");
            return await response.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    deletePlan: async (planId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/plans/${planId}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
};

export default PlanService;