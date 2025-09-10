package com.example.test3.model

import jakarta.persistence.*
import java.io.Serializable

@Entity
@Table(name = "diet")
data class Diet(
    @EmbeddedId
    val id: DietId,
)

// Composite key for Diet
@Embeddable
data class DietId(
    @Column(name = "food_ID")
    val foodId: Int,

    @Column(name = "diet_name")
    val dietName: String
) : Serializable