package com.example.comidas.dto;

import java.util.List;

public record ComidaCalcularResponse(
		List<AlimentoItemResponse> alimentos,
		MacrosResponse macrosTotales
) {
}

