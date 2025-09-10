package com.example.test3.service

import com.example.test3.exceptions.ResourceAlreadyExistsException
import com.example.test3.exceptions.ResourceNotFoundException
import com.example.test3.model.User
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class UserService @Autowired constructor(
    private val userRepository: UserRepository
) {
    fun getAllUsers(): List<User> = userRepository.findAll()

    fun getUserById(id: Int): User = userRepository.findById(id).orElseThrow {
        ResourceNotFoundException("User not found with id: $id")
    }

    fun getUserByUsername(username: String): User? = userRepository.findByUsername(username)

    fun createUser(user: User): User {
        if (userRepository.existsByUsername(user.username)) {
            throw ResourceAlreadyExistsException("Username already taken")
        }
        if (userRepository.existsByEmail(user.email)) {
            throw ResourceAlreadyExistsException("Email already in use")
        }
        return userRepository.save(user)
    }

    fun updateUser(id: Int, updatedUser: User): User {
        val existingUser = getUserById(id)

        // Create a new user object with updated fields but same ID
        val userToUpdate = User(
            userID = existingUser.userID,
            username = updatedUser.username,
            password = updatedUser.password,
            email = updatedUser.email,
            role = updatedUser.role
        )

        return userRepository.save(userToUpdate)
    }

    fun deleteUser(id: Int) {
        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException("User not found with id: $id")
        }
        userRepository.deleteById(id)
    }
}