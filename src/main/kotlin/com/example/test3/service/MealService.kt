package com.example.test3.service

import com.example.test3.model.Food
import com.example.test3.model.Meal
import com.example.test3.model.MealFood
import com.example.test3.model.User
import com.example.test3.repository.FoodRepository
import com.example.test3.repository.MealFoodRepository
import com.example.test3.repository.MealRepository
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Service
class MealService @Autowired constructor(
    private val mealRepository: MealRepository,
    private val mealFoodRepository: MealFoodRepository,
    private val foodRepository: FoodRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun addFoodToMeal(userId: Int, foodId: Int, mealNumber: Int, servings: Double): Meal {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        val food = foodRepository.findById(foodId)
            .orElseThrow { RuntimeException("Food not found") }

        // Get today's date with time set to start of day
        val today = LocalDate.now()
        val startOfDay = LocalDateTime.of(today, LocalTime.MIN)
        val endOfDay = LocalDateTime.of(today, LocalTime.MAX)

        // Find or create the meal for today
        val meal = mealRepository.findByUserAndMealNumberAndDate(user, mealNumber, startOfDay)
            ?: Meal(
                mealNumber = mealNumber,
                user = user,
                date = startOfDay
            ).let { mealRepository.save(it) }

        // Calculate nutrition based on servings
        val calories = (food.calories * servings).toInt()
        val protein = food.protein?.times(servings) ?: 0.0
        val carbs = food.carbs?.times(servings) ?: 0.0
        val fats = food.totalFat?.times(servings) ?: 0.0

        // Create meal food entry
        val mealFood = MealFood(
            meal = meal,
            food = food,
            servings = servings,
            calories = calories,
            protein = protein,
            carbs = carbs,
            fats = fats
        )
        mealFoodRepository.save(mealFood)

        // Update meal totals
        val updatedMeal = meal.copy(
            calories = meal.calories + calories,
            protein = meal.protein + protein,
            carbs = meal.carbs + carbs,
            fats = meal.fats + fats
        )

        return mealRepository.save(updatedMeal)
    }

    fun getMealsByUser(userId: Int): List<Meal> {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        return mealRepository.findByUser(user)
    }

    fun getTodaysMealsByUser(userId: Int): List<Meal> {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        val today = LocalDate.now()
        val startOfDay = LocalDateTime.of(today, LocalTime.MIN)
        val endOfDay = LocalDateTime.of(today, LocalTime.MAX)

        return mealRepository.findByUserAndDateBetween(user, startOfDay, endOfDay)
    }

    fun getMealById(mealId: Int): Meal {
        return mealRepository.findById(mealId)
            .orElseThrow { RuntimeException("Meal not found") }
    }

    fun updateMeal(mealId: Int, calories: Int, protein: Double, carbs: Double, fats: Double): Meal {
        val meal = mealRepository.findById(mealId)
            .orElseThrow { RuntimeException("Meal not found") }

        val updatedMeal = meal.copy(
            calories = calories,
            protein = protein,
            carbs = carbs,
            fats = fats
        )

        return mealRepository.save(updatedMeal)
    }

    fun getFoodsInMeal(mealId: Int): List<MealFood> {
        val meal = mealRepository.findById(mealId)
            .orElseThrow { RuntimeException("Meal not found") }

        return mealFoodRepository.findByMeal(meal)
    }
}