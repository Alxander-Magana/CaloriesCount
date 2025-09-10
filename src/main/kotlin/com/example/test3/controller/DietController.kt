package com.example.test3.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.example.test3.service.DietService
import com.example.test3.model.Diet
import org.springframework.web.bind.annotation.CrossOrigin


@RestController
@RequestMapping("/api/diets")
@CrossOrigin(origins = ["http://localhost:5173"])
class DietController @Autowired constructor(
    private val dietService: DietService
) {
    @GetMapping
    fun getAllDiets(): ResponseEntity<List<Diet>> {
        val diets = dietService.getAllDiets()
        return ResponseEntity.ok(diets)
    }

    /*
    @GetMapping("/food/{foodId}")
        fun getDietsForFood(@PathVariable foodId: Long): ResponseEntity<List<Diet>> {
            val diets = dietService.getDietsByFoodId(foodId)
            return ResponseEntity.ok(diets)
        }
    */
    @GetMapping("/food/{foodId}")
    fun getDietsForFood(@PathVariable foodId: String): ResponseEntity<List<Diet>> {
        val longFoodId = foodId.toLong()
        val diets = dietService.getDietsByFoodId(longFoodId)
        return ResponseEntity.ok(diets)
    }

    @GetMapping("/name/{dietName}")
    fun getDietsByName(
        @PathVariable dietName: String
    ): ResponseEntity<List<Diet>> {
        val diets = dietService.getDietsByDietName(dietName)
        return ResponseEntity.ok(diets)
    }

    @PostMapping("/food/{foodId}")
    fun addFoodToDiet(
        @PathVariable foodId: Int,
        @RequestParam dietName: String
    ): ResponseEntity<Diet> {
        if (dietName.isBlank()) {
            return ResponseEntity.badRequest().build()
        }

        val diet = dietService.addFoodToDiet(foodId, dietName)
        return ResponseEntity.status(HttpStatus.CREATED).body(diet)
    }

    @PostMapping("")
    fun createDiet(@RequestBody diet: Diet): ResponseEntity<Diet> {
        try {
            val createdDiet = dietService.addFoodToDiet(diet.id.foodId, diet.id.dietName)
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDiet)
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @DeleteMapping("/food/{foodId}")
    fun removeFoodFromDiet(
        @PathVariable foodId: Int,
        @RequestParam dietName: String
    ): ResponseEntity<Void> {
        return try {
            dietService.removeFoodFromDiet(foodId, dietName)
            ResponseEntity.noContent().build()
        } catch (e: RuntimeException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{foodId}/{dietName}")
    fun deleteDiet(
        @PathVariable foodId: Int,
        @PathVariable dietName: String
    ): ResponseEntity<Void> {
        return try {
            println("Attempting to delete diet: foodId=$foodId, dietName=$dietName") // Add logging
            dietService.removeFoodFromDiet(foodId, dietName)
            ResponseEntity.noContent().build()
        } catch (e: Exception) { // Change to catch all exceptions
            println("Error deleting diet: ${e.message}") // Add logging
            e.printStackTrace() // Add stack trace
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }

    }

}