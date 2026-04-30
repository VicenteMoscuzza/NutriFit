package com.example.rutinas.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RutinaCreateRequest(
		@NotBlank @Size(max = 120) String nombre,
		@Size(max = 2000) String descripcion,
		List<Long> ejercicioIds
) {
}

