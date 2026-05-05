package com.example.rutinas.plan.dto;

import java.util.List;

import com.example.rutinas.dto.EjercicioItemResponse;

public record RutinaPlanRutinaResponse(
		Long id,
		String nombre,
		String descripcion,
		List<EjercicioItemResponse> ejercicios
) {
}

