package com.example.test3.service

import com.example.test3.exceptions.ResourceAlreadyExistsException
import com.example.test3.exceptions.ResourceNotFoundException
import com.example.test3.model.Favorite
import com.example.test3.model.FavoriteId
import com.example.test3.repository.FavoriteRepository
import com.example.test3.repository.FoodRepository
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FavoriteService @Autowired constructor(
    private val favoriteRepository: FavoriteRepository,
    private val userRepository: UserRepository,
    private val foodRepository: FoodRepository
) {
    fun getAllFavorites(): List<Favorite> = favoriteRepository.findAll()

    fun getFavoritesByUser(userId: Int): List<Favorite> {
        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }
        return favoriteRepository.findByUser(user)
    }

    @Transactional
    fun addFavorite(userId: Int, foodId: Int): Favorite {
        // Check if already a favorite
        if (favoriteRepository.existsByIdUserIdAndIdFoodId(userId, foodId)) {
            throw ResourceAlreadyExistsException("Food is already marked as favorite")
        }

        val user = userRepository.findById(userId).orElseThrow {
            ResourceNotFoundException("User not found with id: $userId")
        }

        val food = foodRepository.findById(foodId).orElseThrow {
            ResourceNotFoundException("Food not found with id: $foodId")
        }

        val favoriteId = FavoriteId(userId, foodId)
        val favorite = Favorite(id = favoriteId, user = user, food = food)

        return favoriteRepository.save(favorite)
    }

    @Transactional
    fun removeFavorite(userId: Int, foodId: Int) {
        val favoriteId = FavoriteId(userId, foodId)
        if (!favoriteRepository.existsById(favoriteId)) {
            throw ResourceNotFoundException("Favorite not found")
        }
        favoriteRepository.deleteById(favoriteId)
    }
}