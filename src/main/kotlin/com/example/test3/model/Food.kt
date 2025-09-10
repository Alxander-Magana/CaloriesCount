package com.example.test3.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "food")
@JsonIgnoreProperties(ignoreUnknown = true)
data class Food(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val foodID: Int = 0,

    @Column(nullable = false)
    val foodName: String,

    val foodImage: String? = null,

    @Column(nullable = false)
    val calories: Int,

    val protein: Double? = null,

    val totalFat: Double? = null,

    val sodium: Double? = null,

    val carbs: Double? = null,

    @Column(name = "date_create")
    val dateCreate: LocalDateTime = LocalDateTime.now(),

    @ManyToOne
    @JoinColumn(name = "creator")
    @JsonIgnore
    val creator: User? = null,

    /*
    @ManyToMany(mappedBy = "dietFoods")
    val dietUsers: List<User> = emptyList(),
    */

    @OneToMany(mappedBy = "food")
    @JsonIgnore
    val favoriteByUsers: List<Favorite> = emptyList()
)