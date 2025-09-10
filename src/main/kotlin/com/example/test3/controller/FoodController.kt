package com.example.test3.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.example.test3.service.FoodService
import com.example.test3.model.Food
import org.springframework.web.bind.annotation.CrossOrigin

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = ["http://localhost:5173"]) // Add this annotation to allow requests from your React app
class FoodController @Autowired constructor(
    private val foodService: FoodService
) {
    @GetMapping
    fun getAllFoods(): ResponseEntity<List<Food>> {
        val foods = foodService.getAllFoods()
            // Return a simplified version of the foods to avoid circular reference issues
            val simplifiedFoods = foods.map { food ->
                Food(
                    foodID = food.foodID,
                    foodName = food.foodName,
                    foodImage = food.foodImage,
                    calories = food.calories,
                    protein = food.protein,
                    totalFat = food.totalFat,
                    sodium = food.sodium,
                    carbs = food.carbs,
                    dateCreate = food.dateCreate,
                    creator = null,
                    favoriteByUsers = emptyList()
                )
            }
            return ResponseEntity.ok(simplifiedFoods)
    }

    /*
    @GetMapping("/{id}")
    fun getFoodById(@PathVariable id: Int): ResponseEntity<Food> {
        val food = foodService.getFoodById(id)
        return ResponseEntity.ok(food)
    }*/

    @GetMapping("/{id}")
    fun getFoodById(@PathVariable id: String): ResponseEntity<Food> {
        val foodId = id.toInt()
        val food = foodService.getFoodById(foodId)
        return ResponseEntity.ok(food)
    }

    @GetMapping("/search")
    fun searchFoodByName(@RequestParam name: String): ResponseEntity<List<Food>> {
        val foods = foodService.searchFoodByName(name)
        return ResponseEntity.ok(foods)
    }

    @GetMapping("/creator/{creatorId}")
    fun getFoodsByCreator(@PathVariable creatorId: Int): ResponseEntity<List<Food>> {
        val foods = foodService.getFoodsByCreator(creatorId)
        return ResponseEntity.ok(foods)
    }

    @PostMapping("/creator/{creatorId}")
    fun createFood(
        @RequestBody food: Food,
        @PathVariable creatorId: Int
    ): ResponseEntity<Food> {
        val createdFood = foodService.createFood(food, creatorId)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFood)
    }

    @PutMapping("/{id}")
    fun updateFood(
        @PathVariable id: Int,
        @RequestBody food: Food
    ): ResponseEntity<Food> {
        println("🔧 Incoming UPDATE request for ID: $id")
        println("📦 Payload received: $food")

        return try {
            val updatedFood = foodService.updateFood(id, food)
            ResponseEntity.ok(updatedFood)
        } catch (e: Exception) {
            println("❌ Error during update: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
        //val updatedFood = foodService.updateFood(id, food)
        //return ResponseEntity.ok(updatedFood)
    }

    @DeleteMapping("/{id}")
    fun deleteFood(@PathVariable id: Int): ResponseEntity<Void> {
        foodService.deleteFood(id)
        return ResponseEntity.noContent().build()
    }
}