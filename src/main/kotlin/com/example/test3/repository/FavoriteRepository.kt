package com.example.test3.repository

import com.example.test3.model.Favorite
import com.example.test3.model.FavoriteId
import com.example.test3.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FavoriteRepository : JpaRepository<Favorite, FavoriteId> {
    fun findByUser(user: User): List<Favorite>
    fun existsByIdUserIdAndIdFoodId(userId: Int, foodId: Int): Boolean
}