package com.example.comidas.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ComidaResponse(
		Long id,
		String nombre,
		String descripcion,
		LocalDate fecha,
		Instant createdAt,
		List<AlimentoItemResponse> alimentos
) {
}

