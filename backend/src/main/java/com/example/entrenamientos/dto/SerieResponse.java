package com.example.entrenamientos.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record SerieResponse(
		Long id,
		int numeroSerie,
		BigDecimal pesoKg,
		Integer reps,
		boolean completada,
		Instant completadaAt) {
}
