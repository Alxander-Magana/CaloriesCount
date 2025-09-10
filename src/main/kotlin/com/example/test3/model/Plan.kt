package com.example.test3.model

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*

@Entity
@Table(name = "plan")
data class Plan(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_ID")
    val planId: Int = 0,

    @ManyToOne
    @JoinColumn(name = "user", nullable = false)
    @JsonBackReference
    val user: User,

    @Column(name = "calorieGoal", nullable = false)
    val calorieGoal: Int,

    @OneToMany(mappedBy = "plan")
    val histories: List<History> = emptyList()
)