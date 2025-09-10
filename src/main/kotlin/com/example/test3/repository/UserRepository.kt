package com.example.test3.repository

import com.example.test3.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Int> {
    fun findByUsername(username: String): User?
    fun findByEmail(email: String): User?
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
}