package com.nutrifit.nutricion.dto;

import jakarta.validation.constraints.NotNull;

public record CargarComidaGuardadaRequest(
        @NotNull(message = "Elegí una de tus comidas")
        Long comidaGuardadaId
) {
}
