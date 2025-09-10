package com.example.test3.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.io.Serializable

@Entity
@Table(name = "favorite")
@JsonIgnoreProperties(ignoreUnknown = true)
data class Favorite(
    @EmbeddedId
    val id: FavoriteId,

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user")
    @JsonIgnore
    val user: User,

    @ManyToOne
    @MapsId("foodId")
    @JoinColumn(name = "food")
    @JsonIgnore
    val food: Food
)

// Composite key for Favorite
@Embeddable
@JsonIgnoreProperties(ignoreUnknown = true)
data class FavoriteId(
    @Column(name = "user")
    val userId: Int,

    @Column(name = "food")
    val foodId: Int
) : Serializable