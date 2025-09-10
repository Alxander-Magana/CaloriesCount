package com.example.test3.repository

import com.example.test3.model.Plan
import com.example.test3.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PlanRepository : JpaRepository<Plan, Int> {
    fun findByUser(user: User): List<Plan>
}