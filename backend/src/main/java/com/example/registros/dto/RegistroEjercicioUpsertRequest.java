package com.example.registros.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

public record RegistroEjercicioUpsertRequest(
		@DecimalMin(value = "0.0", inclusive = true, message = "El peso debe ser >= 0")
		@Digits(integer = 8, fraction = 2, message = "El peso debe tener hasta 2 decimales")
		BigDecimal ultimoPesoMaxKg) {
}

