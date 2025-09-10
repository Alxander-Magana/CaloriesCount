package com.example.test3.controller

import com.example.test3.model.Plan
import com.example.test3.model.User
import com.example.test3.service.PlanService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.doNothing
import org.mockito.MockitoAnnotations
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders

class PlanControllerTest {

    @Mock
    private lateinit var planService: PlanService

    @InjectMocks
    private lateinit var planController: PlanController

    private lateinit var mockMvc: MockMvc

    private val testUser = User(1, "Test", "test@example.com", "password")
    private val testPlan = Plan(planId = 1, user = testUser, calorieGoal = 2000)
    private val testPlansList = listOf(testPlan, Plan(planId = 2, user = testUser, calorieGoal = 1800))

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)
        mockMvc = MockMvcBuilders.standaloneSetup(planController).build()
    }

    @Test
    fun `getAllPlans returns list of plans`() {
        `when`(planService.getAllPlans()).thenReturn(testPlansList)

        mockMvc.perform(get("/api/plans"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].planId").value(1))
            .andExpect(jsonPath("$[0].calorieGoal").value(2000))
            .andExpect(jsonPath("$[1].planId").value(2))
            .andExpect(jsonPath("$[1].calorieGoal").value(1800))
    }

    @Test
    fun `getPlanById returns plan`() {
        `when`(planService.getPlanById(1)).thenReturn(testPlan)

        mockMvc.perform(get("/api/plans/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.planId").value(1))
            .andExpect(jsonPath("$.calorieGoal").value(2000))
    }

    @Test
    fun `getPlansByUser returns plans for a user`() {
        `when`(planService.getPlansByUser(1)).thenReturn(testPlansList)

        mockMvc.perform(get("/api/plans/user/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].planId").value(1))
            .andExpect(jsonPath("$[0].calorieGoal").value(2000))
    }

    @Test
    fun `createPlan returns created plan`() {
        val createdPlan = Plan(planId = 1, user = testUser, calorieGoal = 2000)
        `when`(planService.createPlan(1, 2000)).thenReturn(createdPlan)

        mockMvc.perform(post("/api/plans/user/1")
            .param("calorieGoal", "2000"))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.planId").value(1))  // Verify that the id is 1
            .andExpect(jsonPath("$.calorieGoal").value(2000))
    }

    @Test
    fun `updatePlan returns updated plan`() {
        val updatedPlan = Plan(planId = 1, user = testUser, calorieGoal = 2200)
        `when`(planService.updatePlan(1, 2200)).thenReturn(updatedPlan)

        mockMvc.perform(put("/api/plans/1")
            .param("calorieGoal", "2200"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.planId").value(1))
            .andExpect(jsonPath("$.calorieGoal").value(2200))
    }

    @Test
    fun `deletePlan returns no content`() {
        doNothing().`when`(planService).deletePlan(1)

        mockMvc.perform(delete("/api/plans/1"))
            .andExpect(status().isNoContent)
    }
}
