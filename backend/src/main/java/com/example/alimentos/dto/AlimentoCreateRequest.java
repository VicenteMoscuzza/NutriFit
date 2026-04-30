package com.example.alimentos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AlimentoCreateRequest(
		@NotBlank @Size(max = 100) String nombre,
		@NotNull Double caloriasPor100g,
		@NotNull Double proteinasPor100g,
		@NotNull Double carbohidratosPor100g,
		@NotNull Double grasasPor100g,
		Double fibraPor100g,
		Double tamanoPorcionG,
		@Size(max = 30) String unidadPorcion
) {
}

