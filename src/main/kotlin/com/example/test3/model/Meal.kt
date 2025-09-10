package com.example.test3.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "meals")
data class Meal(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(nullable = false)
    val mealNumber: Int, // 1, 2, or 3

    val calories: Int = 0,
    val protein: Double = 0.0,
    val carbs: Double = 0.0,
    val fats: Double = 0.0,

    @Column(name = "date_created")
    val dateCreated: LocalDateTime = LocalDateTime.now(),

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToMany
    @JoinTable(
        name = "meal_foods",
        joinColumns = [JoinColumn(name = "meal_id")],
        inverseJoinColumns = [JoinColumn(name = "food_id")]
    )
    val foods: List<Food> = emptyList(),

    @Column(name = "date")
    val date: LocalDateTime = LocalDateTime.now()
)