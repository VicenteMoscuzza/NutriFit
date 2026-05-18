package com.example.entrenamientos.dto;

import java.time.Instant;
import java.util.List;

import com.example.entrenamientos.EstadoEntrenamiento;

public record EntrenamientoResponse(
		Long id,
		Long rutinaId,
		String rutinaNombre,
		EstadoEntrenamiento estado,
		Instant startedAt,
		Instant finishedAt,
		List<EjercicioEntrenamientoResponse> ejercicios) {
}
