package com.example.test3.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import com.example.test3.service.HistoryService
import com.example.test3.model.History
import com.example.test3.model.HistoryId
import org.springframework.web.bind.annotation.CrossOrigin

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = ["http://localhost:5173"])
class HistoryController @Autowired constructor(
    private val historyService: HistoryService
) {
    @GetMapping
    fun getAllHistory(): ResponseEntity<List<History>> {
        val histories = historyService.getAllHistory()
        return ResponseEntity.ok(histories)
    }

    @GetMapping("/{historyId}/user/{userId}")
    fun getHistoryById(
        @PathVariable historyId: Int,
        @PathVariable userId: Int
    ): ResponseEntity<History> {
        val id = HistoryId(historyId, userId)
        val history = historyService.getHistoryById(id)
        return ResponseEntity.ok(history)
    }

    @GetMapping("/user/{userId}")
    fun getHistoryByUser(@PathVariable userId: Int): ResponseEntity<List<History>> {
        val histories = historyService.getHistoryByUser(userId)
        return ResponseEntity.ok(histories)
    }

    @GetMapping("/user/{userId}/daterange")
    fun getHistoryByDateRange(
        @PathVariable userId: Int,
        @RequestParam startDate: String,
        @RequestParam endDate: String
    ): ResponseEntity<List<History>> {
        val start = LocalDate.parse(startDate)
        val end = LocalDate.parse(endDate)
        val histories = historyService.getHistoryByDateRange(userId, start, end)
        return ResponseEntity.ok(histories)
    }

    @PostMapping("/{historyId}/user/{userId}")
    fun createHistory(
        @PathVariable historyId: Int,
        @PathVariable userId: Int,
        @RequestParam(required = false) planId: Int?,
        @RequestParam date: String,
        @RequestParam(required = false) goal: Int?,
        @RequestParam(required = false) intake: Int?
    ): ResponseEntity<History> {
        val historyDate = LocalDate.parse(date)
        val history = historyService.createHistory(historyId, userId, planId, historyDate, goal, intake)
        return ResponseEntity.status(HttpStatus.CREATED).body(history)
    }

    @PutMapping("/{historyId}/user/{userId}")
    fun updateHistory(
        @PathVariable historyId: Int,
        @PathVariable userId: Int,
        @RequestParam(required = false) planId: Int?,
        @RequestParam(required = false) goal: Int?,
        @RequestParam(required = false) intake: Int?
    ): ResponseEntity<History> {
        val history = historyService.updateHistory(historyId, userId, planId, goal, intake)
        return ResponseEntity.ok(history)
    }

    @DeleteMapping("/{historyId}/user/{userId}")
    fun deleteHistory(
        @PathVariable historyId: Int,
        @PathVariable userId: Int
    ): ResponseEntity<Void> {
        historyService.deleteHistory(historyId, userId)
        return ResponseEntity.noContent().build()
    }
}