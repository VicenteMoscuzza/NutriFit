package com.nutrifit.entrenamiento.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RegistrarSerieRequest(
        @NotNull(message = "Elegí un ejercicio")
        Long ejercicioRutinaId,

        @NotNull(message = "Indicá el peso")
        @DecimalMin(value = "0.0", message = "El peso no puede ser negativo")
        Double pesoKg,

        @NotNull(message = "Indicá las repeticiones")
        @Min(value = 1, message = "Las repeticiones deben ser al menos 1")
        Integer repeticiones
) {
}
