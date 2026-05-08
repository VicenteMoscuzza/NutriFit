package com.example.registros.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record RegistroEjercicioResponse(
		Long ejercicioId,
		BigDecimal ultimoPesoMaxKg,
		Instant updatedAt) {
}

