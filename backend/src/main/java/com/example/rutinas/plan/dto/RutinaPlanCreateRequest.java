package com.example.rutinas.plan.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RutinaPlanCreateRequest(
		@NotNull @Min(1) @Max(7) Integer diaSemana,
		@NotNull Long rutinaId
) {
}

