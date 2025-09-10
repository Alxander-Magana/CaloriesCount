package com.example.test3.service

import com.example.test3.exceptions.ResourceNotFoundException
import com.example.test3.model.History
import com.example.test3.model.HistoryId
import com.example.test3.repository.HistoryRepository
import com.example.test3.repository.PlanRepository
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class HistoryService @Autowired constructor(
    private val historyRepository: HistoryRepository,
    private val userRepository: UserRepository,
    private val planRepository: PlanRepository
) {
    fun getAllHistory(): List<History> = historyRepository.findAll()

    fun getHistoryById(historyId: HistoryId): History = historyRepository.findById(historyId).orElseThrow {
        ResourceNotFoundException("History not found with id: $historyId")
    }

    fun getHistoryByUser(userId: Int): List<History> {
        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }
        return historyRepository.findByUser(user)
    }

    fun getHistoryByDateRange(userId: Int, startDate: LocalDate, endDate: LocalDate): List<History> {
        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }
        return historyRepository.findByUserAndDateBetween(user, startDate, endDate)
    }

    fun createHistory(historyId: Int, userId: Int, planId: Int?, date: LocalDate, goal: Int?, intake: Int?): History {
        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }

        val plan = if (planId != null) {
            planRepository.findById(planId).orElseThrow {
                ResourceNotFoundException("Plan not found with id: $planId")
            }
        } else null

        val id = HistoryId(historyId, userId)

        val history = History(
            id = id,
            user = user,
            plan = plan,
            date = date,
            goal = goal,
            intake = intake
        )

        return historyRepository.save(history)
    }

    fun updateHistory(historyId: Int, userId: Int, planId: Int?, goal: Int?, intake: Int?): History {
        val id = HistoryId(historyId, userId)
        val existingHistory = getHistoryById(id)

        val plan = if (planId != null) {
            planRepository.findById(planId).orElseThrow {
                ResourceNotFoundException("Plan not found with id: $planId")
            }
        } else existingHistory.plan

        val historyToUpdate = History(
            id = existingHistory.id,
            user = existingHistory.user,
            plan = plan,
            date = existingHistory.date,
            goal = goal ?: existingHistory.goal,
            intake = intake ?: existingHistory.intake
        )

        return historyRepository.save(historyToUpdate)
    }

    fun deleteHistory(historyId: Int, userId: Int) {
        val id = HistoryId(historyId, userId)
        if (!historyRepository.existsById(id)) {
            throw ResourceNotFoundException("History not found with id: $id")
        }
        historyRepository.deleteById(id)
    }
}