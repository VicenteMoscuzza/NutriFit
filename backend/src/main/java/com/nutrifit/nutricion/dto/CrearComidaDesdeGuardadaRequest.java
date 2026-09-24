package com.nutrifit.nutricion.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CrearComidaDesdeGuardadaRequest(
        LocalDate fecha,

        @NotNull(message = "Elegí una comida guardada")
        Long comidaGuardadaId
) {
}
