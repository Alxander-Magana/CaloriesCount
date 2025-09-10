import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/plans';

const PlanService = {
    // Get user's plans
    getUserPlans: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user plans:', error);
            throw error;
        }
    },

    // Create a new plan
    createPlan: async (userId, calorieGoal) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/${userId}?calorieGoal=${calorieGoal}`
            );
            return response.data;
        } catch (error) {
            console.error('Error creating plan:', error);
            throw error;
        }
    },

    // Update an existing plan
    updatePlan: async (planId, calorieGoal) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/${planId}?calorieGoal=${calorieGoal}`
            );
            return response.data;
        } catch (error) {
            console.error('Error updating plan:', error);
            throw error;
        }
    },

    // Delete a plan
    deletePlan: async (planId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${planId}`);
            return true;
        } catch (error) {
            console.error('Error deleting plan:', error);
            throw error;
        }
    }
};

export default PlanService;