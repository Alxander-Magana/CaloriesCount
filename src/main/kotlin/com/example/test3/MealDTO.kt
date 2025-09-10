package com.example.test3.dto

import java.time.LocalDateTime

data class MealDTO(
    val userId: Int,
    val mealNumber: Int,
    val calories: Int = 0,
    val protein: Double = 0.0,
    val carbs: Double = 0.0,
    val fats: Double = 0.0,
    val date: String? = null
)