package com.example.test3.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.example.test3.service.UserService
import com.example.test3.model.User
import org.springframework.web.bind.annotation.CrossOrigin

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = ["http://localhost:5173"])
class UserController @Autowired constructor(
    private val userService: UserService
) {
    @GetMapping
    fun getAllUsers(): ResponseEntity<List<User>> {
        val users = userService.getAllUsers()
        return ResponseEntity.ok(users)
    }

    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: Int): ResponseEntity<User> {
        val user = userService.getUserById(id)
        return ResponseEntity.ok(user)
    }

    @GetMapping("/username/{username}")
    fun getUserByUsername(@PathVariable username: String): ResponseEntity<User> {
        val user = userService.getUserByUsername(username)
        return if (user != null) {
            ResponseEntity.ok(user)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/get-email-by-username")
    @CrossOrigin(origins = ["http://localhost:5173"])
    fun getEmailByUsername(@RequestBody request: Map<String, String>): ResponseEntity<Map<String, String>> {
        val username =
            request["username"] ?: return ResponseEntity.badRequest().body(mapOf("error" to "Username is required"))

        val user = userService.getUserByUsername(username)
        if (user == null) {
            return ResponseEntity.status(404).body(mapOf("error" to "Username not found"))
        }

        val email =
            user.email ?: return ResponseEntity.badRequest().body(mapOf("error" to "Email not found for this user"))

        return ResponseEntity.ok(
            mapOf(
                "email" to email,
                "message" to "Email found"
            )
        )
    }

    @PostMapping
    fun createUser(@RequestBody user: User): ResponseEntity<User> {
        val createdUser = userService.createUser(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser)
    }

    @PutMapping("/{id}")
    fun updateUser(@PathVariable id: Int, @RequestBody user: User): ResponseEntity<User> {
        val updatedUser = userService.updateUser(id, user)
        return ResponseEntity.ok(updatedUser)
    }

    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Int): ResponseEntity<Void> {
        userService.deleteUser(id)
        return ResponseEntity.noContent().build()
    }
}