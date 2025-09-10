package com.example.test3.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "meal_foods")
data class MealFood(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @ManyToOne
    @JoinColumn(name = "meal_id", nullable = false)
    val meal: Meal,

    @ManyToOne
    @JoinColumn(name = "food_id", nullable = false)
    val food: Food,

    val servings: Double = 1.0,

    val calories: Int = 0,
    val protein: Double = 0.0,
    val carbs: Double = 0.0,
    val fats: Double = 0.0,

    @Column(name = "date_added")
    val dateAdded: LocalDateTime = LocalDateTime.now()
)