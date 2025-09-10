package com.example.test3.controller

import com.example.test3.model.Diet
import com.example.test3.model.DietId
import com.example.test3.service.DietService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.MockitoAnnotations
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.setup.MockMvcBuilders

class DietControllerTest {

    @Mock
    private lateinit var dietService: DietService  // Mocking DietService

    private lateinit var mockMvc: MockMvc

    @InjectMocks
    private lateinit var dietController: DietController  // Injecting mocks into the controller

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)  // Initialize mocks before each test
        mockMvc = MockMvcBuilders.standaloneSetup(dietController).build()  // Initialize MockMvc with the controller
    }

    @Test
    fun `should return 201 when adding food to diet`() {
        val dietName = "Keto"
        val foodId = 1
        val dietId = DietId(foodId = foodId, dietName = dietName)

        val diet = Diet(id = dietId)
        Mockito.`when`(dietService.addFoodToDiet(foodId, dietName)).thenReturn(diet)

        mockMvc.perform(MockMvcRequestBuilders.post("/api/diets/food/$foodId")
            .param("dietName", dietName))
            .andExpect(MockMvcResultMatchers.status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id.dietName").value(dietName))
            .andExpect(MockMvcResultMatchers.jsonPath("$.id.foodId").value(foodId))
    }

    @Test
    fun `should return 400 when diet name is blank while adding food`() {
        val dietName = ""
        val foodId = 1

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/diets/food/$foodId")
                .param("dietName", dietName)
        )
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Test
    fun `should return 204 when removing food from diet`() {
        val dietName = "Keto"
        val foodId = 1

        // Stubbing the void method to do nothing (success)
        Mockito.doNothing().`when`(dietService).removeFoodFromDiet(foodId, dietName)

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/diets/food/$foodId")
            .param("dietName", dietName))
            .andExpect(MockMvcResultMatchers.status().isNoContent)
    }

    @Test
    fun `should return 404 when trying to remove food from diet that doesn't exist`() {
        val dietName = "Keto"
        val foodId = 1

        // Mocking the service to throw RuntimeException when food is not found
        Mockito.`when`(dietService.removeFoodFromDiet(foodId, dietName)).thenThrow(RuntimeException("Food not found"))

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/diets/food/$foodId")
            .param("dietName", dietName))
            .andExpect(MockMvcResultMatchers.status().isNotFound)  // Expecting 404 Not Found
    }


}
