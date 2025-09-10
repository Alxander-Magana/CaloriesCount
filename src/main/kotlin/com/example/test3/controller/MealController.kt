package com.example.test3.controller

import com.example.test3.dto.MealDTO
import com.example.test3.model.Meal
import com.example.test3.model.MealFood
import com.example.test3.repository.FoodRepository
import com.example.test3.repository.MealFoodRepository
import com.example.test3.repository.MealRepository
import com.example.test3.repository.UserRepository
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/meals")
class MealController(
    private val mealRepository: MealRepository,
    private val userRepository: UserRepository,
    private val foodRepository: FoodRepository,
    private val mealFoodRepository: MealFoodRepository
) {

    // Existing endpoints

    // New endpoint for creating a meal with just userId
    @PostMapping("/create")
    fun createMeal(@RequestBody mealDTO: MealDTO): ResponseEntity<Any> {
        try {
            // Find the user by ID
            val user = userRepository.findById(mealDTO.userId).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("status" to 404, "message" to "User not found"))

            // Parse the date if provided, otherwise use current date/time
            val mealDate = if (mealDTO.date != null) {
                try {
                    // Try to parse as ISO format (default JS Date.toISOString())
                    LocalDateTime.parse(mealDTO.date)
                } catch (e: Exception) {
                    try {
                        // Fallback to parsing just the date portion
                        LocalDate.parse(mealDTO.date.split("T")[0]).atStartOfDay()
                    } catch (e: Exception) {
                        // If all parsing fails, use current date/time
                        LocalDateTime.now()
                    }
                }
            } else {
                LocalDateTime.now()
            }

            // Create the new meal
            val newMeal = Meal(
                mealNumber = mealDTO.mealNumber,
                calories = mealDTO.calories,
                protein = mealDTO.protein,
                carbs = mealDTO.carbs,
                fats = mealDTO.fats,
                user = user,
                date = mealDate
            )

            // Save the meal
            val savedMeal = mealRepository.save(newMeal)
            return ResponseEntity.ok(savedMeal)
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("status" to 500, "message" to "An unexpected error occurred"))
        }
    }

    // Add an endpoint to add food to a meal
    @PostMapping("/add-food")
    fun addFoodToMeal(@RequestBody request: AddFoodToMealRequest): ResponseEntity<Any> {
        try {
            // Find meal by ID
            val meal = mealRepository.findById(request.mealId).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("status" to 404, "message" to "Meal not found"))

            // Find food by ID
            val food = foodRepository.findById(request.foodId).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("status" to 404, "message" to "Food not found"))

            // Create meal-food relationship
            val mealFood = MealFood(
                meal = meal,
                food = food,
                servings = request.servings,
                calories = request.calories,
                protein = request.protein,
                carbs = request.carbs,
                fats = request.fats
            )

            // Save the relationship
            val savedMealFood = mealFoodRepository.save(mealFood)
            return ResponseEntity.ok(savedMealFood)
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("status" to 500, "message" to "An unexpected error occurred"))
        }
    }

    // Get meals by user ID and date
    @GetMapping("/user/{userId}/date/{date}")
    fun getMealsByUserAndDate(
        @PathVariable userId: Int,
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<List<Meal>> {
        val user = userRepository.findById(userId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Get start and end of the specified date
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.plusDays(1).atStartOfDay()

        val meals = mealRepository.findByUserAndDateBetween(user, startOfDay, endOfDay)
        return ResponseEntity.ok(meals)
    }
    // Add this endpoint to your MealController class
    @PutMapping("/update/{id}")
    fun updateMeal(@PathVariable id: Int, @RequestBody request: UpdateMealRequest): ResponseEntity<Any> {
        try {
            // Find the existing meal
            val existingMeal = mealRepository.findById(id).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("status" to 404, "message" to "Meal not found"))

            // Find the user if userId is provided
            val user = if (request.userId != null) {
                userRepository.findById(request.userId).orElse(null)
                    ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(mapOf("status" to 404, "message" to "User not found"))
            } else {
                existingMeal.user
            }

            // Create updated meal using Kotlin's copy function
            val updatedMeal = existingMeal.copy(
                mealNumber = request.mealNumber ?: existingMeal.mealNumber,
                calories = request.calories ?: existingMeal.calories,
                protein = request.protein ?: existingMeal.protein,
                carbs = request.carbs ?: existingMeal.carbs,
                fats = request.fats ?: existingMeal.fats,
                // Keep the same date or parse new date if provided
                date = if (request.date != null) {
                    try {
                        LocalDateTime.parse(request.date)
                    } catch (e: Exception) {
                        existingMeal.date
                    }
                } else {
                    existingMeal.date
                },
                user = user
            )

            val savedMeal = mealRepository.save(updatedMeal)
            return ResponseEntity.ok(savedMeal)
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("status" to 500, "message" to "An unexpected error occurred: ${e.message}"))
        }
    }



    // Other endpoints...
}

data class AddFoodToMealRequest(
    val userId: Int,
    val foodId: Int,
    val mealId: Int,
    val servings: Double,
    val calories: Int,
    val protein: Double,
    val carbs: Double,
    val fats: Double
)
// Add this data class at the end of the file
data class UpdateMealRequest(
    val userId: Int? = null,
    val mealNumber: Int? = null,
    val calories: Int? = null,
    val protein: Double? = null,
    val carbs: Double? = null,
    val fats: Double? = null,
    val date: String? = null
)