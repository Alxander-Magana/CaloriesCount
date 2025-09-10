package com.example.test3.controller

import com.example.test3.model.Favorite
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.example.test3.service.FavoriteService
import org.springframework.web.bind.annotation.CrossOrigin

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = ["http://localhost:5173"])
class FavoriteController @Autowired constructor(
    private val favoriteService: FavoriteService
) {
    @GetMapping
    fun getAllFavorites(): ResponseEntity<List<Favorite>> {
        val favorites = favoriteService.getAllFavorites()
        return ResponseEntity.ok(favorites)
    }

    /*
    @GetMapping("/user/{userId}")
    fun getFavoritesByUser(@PathVariable userId: Int): ResponseEntity<List<Favorite>> {
        val favorites = favoriteService.getFavoritesByUser(userId)
        return ResponseEntity.ok(favorites)
    }*/

    @GetMapping("/user/{userId}")
    fun getFavoritesByUser(@PathVariable userId: String): ResponseEntity<List<Favorite>> {
        val userIdInt = userId.toInt()
        val favorites = favoriteService.getFavoritesByUser(userIdInt)
        return ResponseEntity.ok(favorites)
    }

    @PostMapping("/user/{userId}/food/{foodId}")
    fun addFavorite(
        @PathVariable userId: Int,
        @PathVariable foodId: Int
    ): ResponseEntity<Favorite> {
        val favorite = favoriteService.addFavorite(userId, foodId)
        return ResponseEntity.status(HttpStatus.CREATED).body(favorite)
    }

    @DeleteMapping("/user/{userId}/food/{foodId}")
    fun removeFavorite(
        @PathVariable userId: Int,
        @PathVariable foodId: Int
    ): ResponseEntity<Void> {
        favoriteService.removeFavorite(userId, foodId)
        return ResponseEntity.noContent().build()
    }
}