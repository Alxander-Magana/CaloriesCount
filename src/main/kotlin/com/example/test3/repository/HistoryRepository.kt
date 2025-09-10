package com.example.test3.repository

import com.example.test3.model.History
import com.example.test3.model.HistoryId
import com.example.test3.model.Plan
import com.example.test3.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface HistoryRepository : JpaRepository<History, HistoryId> {
    fun findByUser(user: User): List<History>
    fun findByUserAndDateBetween(user: User, startDate: LocalDate, endDate: LocalDate): List<History>
    fun findByPlan(plan: Plan): List<History>
}