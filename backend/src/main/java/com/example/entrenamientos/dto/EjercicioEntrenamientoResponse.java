package com.example.entrenamientos.dto;

import java.util.List;

public record EjercicioEntrenamientoResponse(
		Long id,
		Long ejercicioId,
		String nombre,
		String descripcion,
		int orden,
		List<SerieResponse> series) {
}
