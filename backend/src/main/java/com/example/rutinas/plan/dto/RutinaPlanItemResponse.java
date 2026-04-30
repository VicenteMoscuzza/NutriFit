package com.example.rutinas.plan.dto;

public record RutinaPlanItemResponse(
		Long id,
		Integer diaSemana,
		RutinaPlanRutinaResponse rutina
) {
}

