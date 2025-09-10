package com.example.test3.controller

import com.example.test3.model.*
import com.example.test3.service.FavoriteService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.Mockito
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

class FavoriteControllerTest {

    @Mock
    private lateinit var favoriteService: FavoriteService

    private lateinit var favoriteController: FavoriteController
    private lateinit var mockMvc: MockMvc

    // Create a sample User and Food instance
    private val user = User(
        userID = 1,
        username = "testuser",
        password = "password123",
        email = "testuser@example.com"
    )

    private val food = Food(
        foodID = 1,
        foodName = "Pizza",
        foodImage = "http://example.com/pizza.jpg",
        calories = 300
    )

    private val favorite = Favorite(
        id = FavoriteId(user.userID, food.foodID),
        user = user,
        food = food
    )

    private val allFavorites = listOf(favorite)
    private val userFavorites = listOf(favorite)

    @BeforeEach
    fun setUp() {
        // Initialize FavoriteService as a mock
        favoriteService = Mockito.mock(FavoriteService::class.java)

        // Mocking the behavior of the FavoriteService
        Mockito.`when`(favoriteService.getAllFavorites()).thenReturn(allFavorites)
        Mockito.`when`(favoriteService.getFavoritesByUser(user.userID)).thenReturn(userFavorites)
        Mockito.`when`(favoriteService.addFavorite(user.userID, food.foodID)).thenReturn(favorite)

        favoriteController = FavoriteController(favoriteService)
        mockMvc = MockMvcBuilders.standaloneSetup(favoriteController).build()
    }

    @Test
    fun `should return 200 when getting all favorites`() {
        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/favorites"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].id.userId").value(user.userID))
    }

    @Test
    fun `should return 200 when getting favorites by user`() {
        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.get("/api/favorites/user/${user.userID}"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].id.userId").value(user.userID))
    }

    @Test
    fun `should return 201 when adding favorite`() {
        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.post("/api/favorites/user/${user.userID}/food/${food.foodID}"))
            .andExpect(MockMvcResultMatchers.status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id.userId").value(user.userID))
    }

    @Test
    fun `should return 204 when removing favorite`() {
        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/favorites/user/${user.userID}/food/${food.foodID}"))
            .andExpect(MockMvcResultMatchers.status().isNoContent)
    }
}
