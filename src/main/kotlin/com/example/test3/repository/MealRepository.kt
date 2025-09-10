package com.example.test3.repository

import com.example.test3.model.Meal
import com.example.test3.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface MealRepository : JpaRepository<Meal, Int> {
    fun findByUser(user: User): List<Meal>
    fun findByUserAndDateBetween(user: User, startDate: LocalDateTime, endDate: LocalDateTime): List<Meal>
    fun findByUserAndMealNumber(user: User, mealNumber: Int): List<Meal>
    fun findByUserAndMealNumberAndDate(user: User, mealNumber: Int, date: LocalDateTime): Meal?
}
