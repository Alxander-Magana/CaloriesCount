package com.example.test3.service

import com.example.test3.exceptions.ResourceNotFoundException
import com.example.test3.model.Food
import com.example.test3.repository.FoodRepository
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class FoodService @Autowired constructor(
    private val foodRepository: FoodRepository,
    private val userRepository: UserRepository
) {
    fun getAllFoods(): List<Food> = foodRepository.findAll()

    fun getFoodById(id: Int): Food = foodRepository.findById(id).orElseThrow {
        ResourceNotFoundException("Food not found with id: $id")
    }

    fun searchFoodByName(name: String): List<Food> =
        foodRepository.findByFoodNameContainingIgnoreCase(name)

    fun getFoodsByCreator(creatorId: Int): List<Food> {
        val creator = userRepository.findById(creatorId).orElseThrow {
            ResourceNotFoundException("User not found with id: $creatorId")
        }
        return foodRepository.findByCreator(creator)
    }

    fun createFood(food: Food, creatorId: Int): Food {
        val creator = userRepository.findById(creatorId).orElseThrow {
            ResourceNotFoundException("User not found with id: $creatorId")
        }

        // Create new food with the specified creator
        val newFood = Food(
            foodName = food.foodName,
            foodImage = food.foodImage,
            calories = food.calories,
            protein = food.protein,
            totalFat = food.totalFat,
            sodium = food.sodium,
            carbs = food.carbs,
            creator = creator
        )

        return foodRepository.save(newFood)
    }

    fun updateFood(id: Int, updatedFood: Food): Food {
        val existingFood = foodRepository.findById(id)
            .orElseThrow { RuntimeException("Food not found") }

        val foodToUpdate = existingFood.copy(
            foodName = updatedFood.foodName,
            foodImage = updatedFood.foodImage,
            calories = updatedFood.calories,
            protein = updatedFood.protein,
            totalFat = updatedFood.totalFat,
            sodium = updatedFood.sodium,
            carbs = updatedFood.carbs
        )

        return foodRepository.save(foodToUpdate)
    }

    fun deleteFood(id: Int) {
        if (!foodRepository.existsById(id)) {
            throw ResourceNotFoundException("Food not found with id: $id")
        }
        foodRepository.deleteById(id)
    }
    
}