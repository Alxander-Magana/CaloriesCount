package com.example.test3.repository

import com.example.test3.model.Diet
import com.example.test3.model.DietId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DietRepository : JpaRepository<Diet, DietId> {
    fun findByIdDietName(dietName: String): List<Diet>
    fun findByIdFoodId(foodId: Long): List<Diet>
}