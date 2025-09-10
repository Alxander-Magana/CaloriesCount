package com.example.test3.repository

import com.example.test3.model.Meal
import com.example.test3.model.MealFood
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MealFoodRepository : JpaRepository<MealFood, Int> {
    fun findByMeal(meal: Meal): List<MealFood>
}
