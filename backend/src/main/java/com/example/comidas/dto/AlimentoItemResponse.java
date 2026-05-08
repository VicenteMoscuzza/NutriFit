package com.example.comidas.dto;

public record AlimentoItemResponse(
		Long id,
		String nombre,
		double cantidadG,
		MacrosResponse macros
) {
}

