package com.nutrifit.nutricion.dto;

import jakarta.validation.constraints.NotNull;

public record CargarComidaGuardadaRequest(
        @NotNull(message = "Elegí una comida guardada")
        Long comidaGuardadaId
) {
}
