package com.example.entrenamientos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;

public record SerieUpdateRequest(
		@DecimalMin(value = "0.0", inclusive = true, message = "El peso debe ser >= 0")
		@Digits(integer = 8, fraction = 2, message = "El peso debe tener hasta 2 decimales")
		BigDecimal pesoKg,
		@Min(value = 0, message = "Las repeticiones deben ser >= 0")
		Integer reps,
		Boolean completada) {
}
