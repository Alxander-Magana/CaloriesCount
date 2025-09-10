package com.example.test3.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.example.test3.service.PlanService
import com.example.test3.model.Plan
import org.springframework.web.bind.annotation.CrossOrigin

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = ["http://localhost:5173"])
class PlanController @Autowired constructor(
    private val planService: PlanService
) {
    @GetMapping
    fun getAllPlans(): ResponseEntity<List<Plan>> {
        val plans = planService.getAllPlans()
        return ResponseEntity.ok(plans)
    }

    @GetMapping("/{id}")
    fun getPlanById(@PathVariable id: Int): ResponseEntity<Plan> {
        val plan = planService.getPlanById(id)
        return ResponseEntity.ok(plan)
    }

    @GetMapping("/user/{userId}")
    fun getPlansByUser(@PathVariable userId: Int): ResponseEntity<List<Plan>> {
        val plans = planService.getPlansByUser(userId)
        return ResponseEntity.ok(plans)
    }

    @PostMapping("/user/{userId}")
    fun createPlan(
        @PathVariable userId: Int,
        @RequestParam calorieGoal: Int
    ): ResponseEntity<Plan> {
        val plan = planService.createPlan(userId, calorieGoal)
        return ResponseEntity.status(HttpStatus.CREATED).body(plan)
    }

    @PutMapping("/{id}")
    fun updatePlan(
        @PathVariable id: Int,
        @RequestParam calorieGoal: Int
    ): ResponseEntity<Plan> {
        val updatedPlan = planService.updatePlan(id, calorieGoal)
        return ResponseEntity.ok(updatedPlan)
    }

    @DeleteMapping("/{id}")
    fun deletePlan(@PathVariable id: Int): ResponseEntity<Void> {
        planService.deletePlan(id)
        return ResponseEntity.noContent().build()
    }
}