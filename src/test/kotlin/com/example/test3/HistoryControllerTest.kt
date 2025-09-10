package com.example.test3.controller

import com.example.test3.model.History
import com.example.test3.model.HistoryId
import com.example.test3.model.Plan
import com.example.test3.model.User
import com.example.test3.service.HistoryService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.doNothing
import org.mockito.MockitoAnnotations
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.time.LocalDate

class HistoryControllerTest {

    @Mock
    private lateinit var historyService: HistoryService

    @InjectMocks
    private lateinit var historyController: HistoryController

    private lateinit var mockMvc: MockMvc

    private val testUser = User(1, "Test", "test@example.com", "password")
    private val testPlan = Plan(1, testUser, 1800)
    private val testDate = LocalDate.of(2024, 4, 1)
    private val testHistory = History(
        id = HistoryId(1, 1),
        user = testUser,
        plan = testPlan,
        date = testDate,
        goal = 1600,
        intake = 1550
    )

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)
        mockMvc = MockMvcBuilders.standaloneSetup(historyController).build()
    }

    @Test
    fun `getAllHistory returns list of histories`() {
        `when`(historyService.getAllHistory()).thenReturn(listOf(testHistory))

        mockMvc.perform(get("/api/history"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.size()").value(1))
            .andExpect(jsonPath("$[0].goal").value(1600))
    }

    @Test
    fun `getHistoryById returns history`() {
        `when`(historyService.getHistoryById(HistoryId(1, 1))).thenReturn(testHistory)

        mockMvc.perform(get("/api/history/1/user/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.intake").value(1550))
    }

    @Test
    fun `getHistoryByUser returns histories for a user`() {
        `when`(historyService.getHistoryByUser(1)).thenReturn(listOf(testHistory))

        mockMvc.perform(get("/api/history/user/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].goal").value(1600))
    }

    @Test
    fun `getHistoryByDateRange returns histories within range`() {
        val start = "2024-04-01"
        val end = "2024-04-10"
        `when`(historyService.getHistoryByDateRange(1, LocalDate.parse(start), LocalDate.parse(end)))
            .thenReturn(listOf(testHistory))

        mockMvc.perform(get("/api/history/user/1/daterange")
            .param("startDate", start)
            .param("endDate", end))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].date[0]").value(2024))
            .andExpect(jsonPath("$[0].date[1]").value(4))
            .andExpect(jsonPath("$[0].date[2]").value(1))
    }

    @Test
    fun `createHistory returns created history`() {
        `when`(historyService.createHistory(1, 1, 1, testDate, 1600, 1550)).thenReturn(testHistory)

        mockMvc.perform(post("/api/history/1/user/1")
            .param("planId", "1")
            .param("date", "2024-04-01")
            .param("goal", "1600")
            .param("intake", "1550"))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.goal").value(1600))
            .andExpect(jsonPath("$.intake").value(1550))
    }

    @Test
    fun `updateHistory returns updated history`() {
        `when`(historyService.updateHistory(1, 1, 1, 1700, 1500)).thenReturn(
            testHistory.copy(goal = 1700, intake = 1500)
        )

        mockMvc.perform(put("/api/history/1/user/1")
            .param("planId", "1")
            .param("goal", "1700")
            .param("intake", "1500"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.goal").value(1700))
            .andExpect(jsonPath("$.intake").value(1500))
    }

    @Test
    fun `deleteHistory returns no content`() {
        doNothing().`when`(historyService).deleteHistory(1, 1)

        mockMvc.perform(delete("/api/history/1/user/1"))
            .andExpect(status().isNoContent)
    }
}