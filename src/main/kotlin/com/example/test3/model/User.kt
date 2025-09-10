package com.example.test3.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*

enum class UserRole {
    USER,
    ADMIN
}

@Entity
@Table(name = "user")
@JsonIgnoreProperties(ignoreUnknown = true)
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val userID: Int = 0,

    @Column(nullable = false, unique = true)
    val username: String,

    @Column(nullable = false)
    @JsonIgnore
    val password: String,

    @Column(nullable = false, unique = true)
    val email: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val role: UserRole = UserRole.USER,

    @OneToMany(mappedBy = "creator")
    @JsonIgnore
    val createdFoods: List<Food> = emptyList(),

    @OneToMany(mappedBy = "user")
    @JsonManagedReference
    val plans: List<Plan> = emptyList(),

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    val histories: List<History> = emptyList(),

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    val favorites: List<Favorite> = emptyList(),

    /*
        @ManyToMany
        @JoinTable(
            name = "diet",
            joinColumns = [JoinColumn(name = "userID")],
            inverseJoinColumns = [JoinColumn(name = "food_ID")]
        )
        val dietFoods: List<Food> = emptyList(),


        @ManyToMany
        @JoinTable(
            name = "favorite",
            joinColumns = [JoinColumn(name = "user")],
            inverseJoinColumns = [JoinColumn(name = "food")]
        )
        val favoriteFoods: List<Food> = emptyList()
        */
)