package com.example.rutinas.dto;

import java.time.Instant;
import java.util.List;

public record RutinaResponse(
		Long id,
		String nombre,
		String descripcion,
		Instant createdAt,
		List<EjercicioItemResponse> ejercicios
) {
}

