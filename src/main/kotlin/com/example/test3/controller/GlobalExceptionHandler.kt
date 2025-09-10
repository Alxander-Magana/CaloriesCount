package com.example.test3.controller

import com.example.test3.exceptions.ResourceAlreadyExistsException
import com.example.test3.exceptions.ResourceNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFoundException(ex: ResourceNotFoundException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.message)
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse)
    }

    @ExceptionHandler(ResourceAlreadyExistsException::class)
    fun handleResourceAlreadyExistsException(ex: ResourceAlreadyExistsException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(HttpStatus.CONFLICT.value(), ex.message)
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected error occurred")
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}

data class ErrorResponse(
    val status: Int,
    val message: String?
)