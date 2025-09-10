package com.example.test3.model

import jakarta.persistence.*
import java.io.Serializable
import java.time.LocalDate

@Entity
@Table(name = "history")
data class History(
    @EmbeddedId
    val id: HistoryId,

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user")
    val user: User,

    @ManyToOne
    @JoinColumn(name = "plan")
    val plan: Plan? = null,

    @Column(nullable = false)
    val date: LocalDate,

    val goal: Int? = null,

    val intake: Int? = null
)

// Composite key for History
@Embeddable
data class HistoryId(
    @Column(name = "history_ID")
    val historyId: Int,

    @Column(name = "user")
    val userId: Int
) : Serializable