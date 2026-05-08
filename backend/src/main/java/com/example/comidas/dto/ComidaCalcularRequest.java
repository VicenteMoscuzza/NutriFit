package com.example.comidas.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record ComidaCalcularRequest(
		@NotEmpty List<ComidaAlimentoUpsertRequest> alimentos
) {
}

