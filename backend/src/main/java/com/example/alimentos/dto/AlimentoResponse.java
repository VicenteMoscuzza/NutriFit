package com.example.alimentos.dto;

public record AlimentoResponse(
		Long id,
		String nombre,
		double caloriasPor100g,
		double proteinasPor100g,
		double carbohidratosPor100g,
		double grasasPor100g,
		double fibraPor100g,
		Double tamanoPorcionG,
		String unidadPorcion,
		boolean esGlobal
) {
}

