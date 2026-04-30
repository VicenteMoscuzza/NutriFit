package com.example.comidas.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComidaCreateRequest(
		@NotBlank @Size(max = 120) String nombre,
		@Size(max = 2000) String descripcion,
		LocalDate fecha,
		List<Long> alimentoIds
) {
}

