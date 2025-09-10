package com.example.test3.service

import com.example.test3.exceptions.ResourceNotFoundException
import com.example.test3.model.Diet
import com.example.test3.model.DietId
import com.example.test3.repository.DietRepository
import com.example.test3.repository.FoodRepository
import com.example.test3.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DietService @Autowired constructor(
    private val dietRepository: DietRepository,
    private val foodRepository: FoodRepository
) {
    fun getAllDiets(): List<Diet> = dietRepository.findAll()

    fun getDietById(foodId: Int, dietName: String): Diet {
        val dietId = DietId(foodId, dietName)
        return dietRepository.findById(dietId)
            .orElseThrow { ResourceNotFoundException("Diet not found with id: $dietId") }
    }

    fun getDietsByDietName(dietName: String): List<Diet> =
        dietRepository.findByIdDietName(dietName)
            
    fun getDietsByFoodId(foodId: Long): List<Diet> =
            dietRepository.findByIdFoodId(foodId)

    @Transactional
    fun addFoodToDiet(foodId: Int, dietName: String): Diet {
        if (!foodRepository.existsById(foodId)) {
            throw ResourceNotFoundException("Food not found with id: $foodId")
        }

        val dietId = DietId(foodId, dietName)
        val diet = Diet(id = dietId)
        return dietRepository.save(diet)
    }

    @Transactional
    fun removeFoodFromDiet(foodId: Int, dietName: String) {
        val dietId = DietId(foodId, dietName)
        if (!dietRepository.existsById(dietId)) {
            throw ResourceNotFoundException("Diet entry not found")
        }
        dietRepository.deleteById(dietId)
    }
}