package com.nutrifit.rutinas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AgregarEjercicioRutinaRequest(
        @NotNull(message = "Elegí un ejercicio")
        Long ejercicioId,

        @NotNull(message = "Indicá las series objetivo")
        @Min(value = 1, message = "Las series deben ser al menos 1")
        Integer seriesObjetivo,

        @NotNull(message = "Indicá las repeticiones objetivo")
        @Min(value = 1, message = "Las repeticiones deben ser al menos 1")
        Integer repeticionesObjetivo
) {
}
