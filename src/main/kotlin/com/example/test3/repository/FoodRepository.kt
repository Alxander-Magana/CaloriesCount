package com.example.test3.repository

import com.example.test3.model.Food
import com.example.test3.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FoodRepository : JpaRepository<Food, Int> {
    fun findByFoodNameContainingIgnoreCase(name: String): List<Food>
    fun findByCreator(creator: User): List<Food>
    fun findByCaloriesLessThan(calories: Int): List<Food>
}