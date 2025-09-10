package com.example.test3.controller

import com.example.test3.dto.MealDTO
import com.example.test3.model.Food
import com.example.test3.model.Meal
import com.example.test3.model.MealFood
import com.example.test3.model.User
import com.example.test3.repository.FoodRepository
import com.example.test3.repository.MealFoodRepository
import com.example.test3.repository.MealRepository
import com.example.test3.repository.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.Optional

class MealControllerTest {

    @Mock
    private lateinit var mealRepository: MealRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var foodRepository: FoodRepository

    @Mock
    private lateinit var mealFoodRepository: MealFoodRepository

    @InjectMocks
    private lateinit var mealController: MealController

    private lateinit var mockMvc: MockMvc
    private lateinit var objectMapper: ObjectMapper

    private val testUser = User(1, "Test", "test@example.com", "password")
    private val testFood = Food(1, "Test Food", "http://example.com/pizza.jpg",100, 10.0, 20.0, 5.0)
    private val testDate = LocalDateTime.of(2024, 4, 1, 12, 0)
    private val testMeal = Meal(
        id = 1,
        mealNumber = 1,
        calories = 300,
        protein = 15.0,
        carbs = 30.0,
        fats = 10.0,
        user = testUser,
        date = testDate
    )

    private val testMealFood = MealFood(
        id = 1,
        meal = testMeal,
        food = testFood,
        servings = 2.0,
        calories = 200,
        protein = 20.0,
        carbs = 40.0,
        fats = 10.0
    )

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)
        mockMvc = MockMvcBuilders.standaloneSetup(mealController).build()
        objectMapper = ObjectMapper()
    }

    @Test
    fun `createMeal returns created meal`() {
        val mealDTO = MealDTO(
            userId = 1,
            mealNumber = 1,
            calories = 300,
            protein = 15.0,
            carbs = 30.0,
            fats = 10.0,
            date = "2024-04-01T12:00:00"
        )

        `when`(userRepository.findById(1)).thenReturn(Optional.of(testUser))
        `when`(mealRepository.save(org.mockito.ArgumentMatchers.any(Meal::class.java))).thenReturn(testMeal)

        mockMvc.perform(post("/api/meals/create")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(mealDTO)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.mealNumber").value(1))
            .andExpect(jsonPath("$.calories").value(300))
            .andExpect(jsonPath("$.protein").value(15.0))
            .andExpect(jsonPath("$.carbs").value(30.0))
            .andExpect(jsonPath("$.fats").value(10.0))
    }

    @Test
    fun `createMeal with user not found returns 404`() {
        val mealDTO = MealDTO(
            userId = 99, // Non-existent user
            mealNumber = 1,
            calories = 300,
            protein = 15.0,
            carbs = 30.0,
            fats = 10.0,
            date = "2024-04-01T12:00:00"
        )

        `when`(userRepository.findById(99)).thenReturn(Optional.empty())

        mockMvc.perform(post("/api/meals/create")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(mealDTO)))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").value("User not found"))
    }

    @Test
    fun `addFoodToMeal returns created meal food relationship`() {
        val addFoodRequest = AddFoodToMealRequest(
            userId = 1,
            foodId = 1,
            mealId = 1,
            servings = 2.0,
            calories = 200,
            protein = 20.0,
            carbs = 40.0,
            fats = 10.0
        )

        `when`(mealRepository.findById(1)).thenReturn(Optional.of(testMeal))
        `when`(foodRepository.findById(1)).thenReturn(Optional.of(testFood))
        `when`(mealFoodRepository.save(org.mockito.ArgumentMatchers.any(MealFood::class.java))).thenReturn(testMealFood)

        mockMvc.perform(post("/api/meals/add-food")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(addFoodRequest)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.servings").value(2.0))
            .andExpect(jsonPath("$.calories").value(200))
            .andExpect(jsonPath("$.protein").value(20.0))
            .andExpect(jsonPath("$.carbs").value(40.0))
            .andExpect(jsonPath("$.fats").value(10.0))
    }

    @Test
    fun `addFoodToMeal with meal not found returns 404`() {
        val addFoodRequest = AddFoodToMealRequest(
            userId = 1,
            foodId = 1,
            mealId = 99, // Non-existent meal
            servings = 2.0,
            calories = 200,
            protein = 20.0,
            carbs = 40.0,
            fats = 10.0
        )

        `when`(mealRepository.findById(99)).thenReturn(Optional.empty())

        mockMvc.perform(post("/api/meals/add-food")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(addFoodRequest)))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").value("Meal not found"))
    }

    @Test
    fun `addFoodToMeal with food not found returns 404`() {
        val addFoodRequest = AddFoodToMealRequest(
            userId = 1,
            foodId = 99, // Non-existent food
            mealId = 1,
            servings = 2.0,
            calories = 200,
            protein = 20.0,
            carbs = 40.0,
            fats = 10.0
        )

        `when`(mealRepository.findById(1)).thenReturn(Optional.of(testMeal))
        `when`(foodRepository.findById(99)).thenReturn(Optional.empty())

        mockMvc.perform(post("/api/meals/add-food")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(addFoodRequest)))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").value("Food not found"))
    }

    @Test
    fun `getMealsByUserAndDate returns meals for specified date`() {
        val date = LocalDate.of(2024, 4, 1)
        val startOfDay = date.atStartOfDay()
        val endOfDay = date.plusDays(1).atStartOfDay()

        `when`(userRepository.findById(1)).thenReturn(Optional.of(testUser))
        `when`(mealRepository.findByUserAndDateBetween(testUser, startOfDay, endOfDay)).thenReturn(listOf(testMeal))

        mockMvc.perform(get("/api/meals/user/1/date/2024-04-01"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].mealNumber").value(1))
            .andExpect(jsonPath("$[0].calories").value(300))
            // Check date components
            .andExpect(jsonPath("$[0].date[0]").value(2024))  // Year
            .andExpect(jsonPath("$[0].date[1]").value(4))     // Month
            .andExpect(jsonPath("$[0].date[2]").value(1))     // Day
    }

    @Test
    fun `getMealsByUserAndDate with user not found returns 404`() {
        `when`(userRepository.findById(99)).thenReturn(Optional.empty())

        mockMvc.perform(get("/api/meals/user/99/date/2024-04-01"))
            .andExpect(status().isNotFound)
    }
}