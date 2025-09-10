package com.example.test3.controller

import com.example.test3.model.Food
import com.example.test3.service.FoodService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(MockitoExtension::class)
class FoodControllerTest {

    @Mock
    lateinit var foodService: FoodService

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        val foodController = FoodController(foodService)
        mockMvc = MockMvcBuilders.standaloneSetup(foodController).build()
    }

    @Test
    fun `should return 200 when getting all foods`() {
        val foodList = listOf(
            Food(foodID = 1, foodName = "Pizza", foodImage = "http://example.com/pizza.jpg", calories = 300)
        )

        Mockito.`when`(foodService.getAllFoods()).thenReturn(foodList)

        mockMvc.perform(MockMvcRequestBuilders.get("/api/foods"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].foodName").value("Pizza"))
    }

    @Test
    fun `should return 200 when getting food by id`() {
        val food = Food(foodID = 1, foodName = "Pizza", foodImage = "http://example.com/pizza.jpg", calories = 300)

        Mockito.`when`(foodService.getFoodById(1)).thenReturn(food)

        mockMvc.perform(MockMvcRequestBuilders.get("/api/foods/1"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.foodName").value("Pizza"))
    }

    @Test
    fun `should return 200 when searching food by name`() {
        val foodList = listOf(
            Food(foodID = 1, foodName = "Pizza", foodImage = "http://example.com/pizza.jpg", calories = 300)
        )

        Mockito.`when`(foodService.searchFoodByName("Pizza")).thenReturn(foodList)

        mockMvc.perform(MockMvcRequestBuilders.get("/api/foods/search").param("name", "Pizza"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].foodName").value("Pizza"))
    }

    @Test
    fun `should return 200 and correct JSON when searching food by name`() {
        val foodList = listOf(
            Food(
                foodID = 1,
                foodName = "Pizza",
                foodImage = "http://example.com/pizza.jpg",
                calories = 300
            )
        )

        // Mock the service
        Mockito.`when`(foodService.searchFoodByName("Pizza")).thenReturn(foodList)

        val expectedJson = """
        [
            {
                "foodID": 1,
                "foodName": "Pizza",
                "foodImage": "http://example.com/pizza.jpg",
                "calories": 300
            }
        ]
    """.trimIndent()

        // Perform request and match raw JSON
        mockMvc.perform(MockMvcRequestBuilders.get("/api/foods/search").param("name", "Pizza"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.content().json(expectedJson, false))
    }


    @Test
    fun `should return 204 when deleting food`() {
        val foodId = 1

        Mockito.doNothing().`when`(foodService).deleteFood(foodId)

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/foods/$foodId"))
            .andExpect(MockMvcResultMatchers.status().isNoContent)
    }
}
