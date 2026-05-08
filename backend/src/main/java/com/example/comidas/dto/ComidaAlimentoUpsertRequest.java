package com.example.comidas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ComidaAlimentoUpsertRequest(
		@NotNull Long alimentoId,
		@NotNull @Min(1) Double cantidadG
) {
}

