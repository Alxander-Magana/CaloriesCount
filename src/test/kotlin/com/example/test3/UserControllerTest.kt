package com.example.test3.controller

import com.example.test3.model.User
import com.example.test3.model.UserRole
import com.example.test3.service.UserService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.MockitoAnnotations
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus

// Create a simple exception handler for the tests
@RestControllerAdvice
class TestExceptionHandler {
    @ExceptionHandler(RuntimeException::class)
    fun handleRuntimeException(ex: RuntimeException): ResponseEntity<Map<String, String>> {
        val body = mapOf("message" to (ex.message ?: "An error occurred"))
        return ResponseEntity(body, HttpStatus.NOT_FOUND)
    }
}

class UserControllerTest {

    @Mock
    private lateinit var userService: UserService

    @InjectMocks
    private lateinit var userController: UserController

    private lateinit var mockMvc: MockMvc

    private lateinit var user1: User
    private lateinit var user2: User
    private val objectMapper = ObjectMapper()

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)

        // Add the test exception handler
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
            .setControllerAdvice(TestExceptionHandler())
            .build()

        // Create user instances with proper constructor parameters
        user1 = User(
            userID = 1,
            username = "john_doe",
            password = "password123",
            email = "john.doe@example.com",
            role = UserRole.USER
        )

        user2 = User(
            userID = 2,
            username = "jane_doe",
            password = "password456",
            email = "jane.doe@example.com",
            role = UserRole.USER
        )
    }

    @Test
    fun `getAllUsers should return list of users`() {
        val users = listOf(user1, user2)
        Mockito.`when`(userService.getAllUsers()).thenReturn(users)

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].username").value("john_doe"))
            .andExpect(jsonPath("$[1].username").value("jane_doe"))
    }

    @Test
    fun `getUser ById should return user when user exists`() {
        Mockito.`when`(userService.getUserById(1)).thenReturn(user1)

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.username").value("john_doe"))
    }

    @Test
    fun `deleteUser should delete user`() {
        Mockito.doNothing().`when`(userService).deleteUser(1)

        mockMvc.perform(delete("/api/users/1"))
            .andExpect(status().isNoContent)
    }
}