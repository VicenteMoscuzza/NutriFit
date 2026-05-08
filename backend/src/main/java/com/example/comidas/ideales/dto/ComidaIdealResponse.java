package com.example.comidas.ideales.dto;

import java.time.Instant;
import java.util.List;

import com.example.comidas.dto.AlimentoItemResponse;
import com.example.comidas.dto.MacrosResponse;

public record ComidaIdealResponse(
		Long id,
		int tipoComida,
		String nombre,
		String descripcion,
		Instant createdAt,
		List<AlimentoItemResponse> alimentos,
		MacrosResponse macrosTotales
) {
}

