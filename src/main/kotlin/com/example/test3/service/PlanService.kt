package com.example.test3.service

import com.example.test3.exceptions.ResourceNotFoundException
import com.example.test3.model.Plan
import com.example.test3.repository.PlanRepository
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class PlanService @Autowired constructor(
    private val planRepository: PlanRepository,
    private val userRepository: UserRepository
) {
    fun getAllPlans(): List<Plan> = planRepository.findAll()

    fun getPlanById(id: Int): Plan = planRepository.findById(id).orElseThrow {
        ResourceNotFoundException("Plan not found with id: $id")
    }

    fun getPlansByUser(userId: Int): List<Plan> {
        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }
        return planRepository.findByUser(user)
    }

    fun createPlan(userId: Int, calorieGoal: Int): Plan {
        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }

        val plan = Plan(user = user, calorieGoal = calorieGoal)
        return planRepository.save(plan)
    }

    fun updatePlan(id: Int, calorieGoal: Int): Plan {
        val existingPlan = getPlanById(id)

        val planToUpdate = Plan(
            planId = existingPlan.planId,
            user = existingPlan.user,
            calorieGoal = calorieGoal
        )

        return planRepository.save(planToUpdate)
    }

    fun deletePlan(id: Int) {
        if (!planRepository.existsById(id)) {
            throw ResourceNotFoundException("Plan not found with id: $id")
        }
        planRepository.deleteById(id)
    }
}