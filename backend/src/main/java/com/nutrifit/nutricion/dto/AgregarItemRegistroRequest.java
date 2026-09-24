package com.nutrifit.nutricion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record AgregarItemRegistroRequest(
        @NotNull(message = "Elegí un alimento")
        Long alimentoId,

        @NotNull(message = "Indicá la cantidad en gramos")
        @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a 0")
        BigDecimal cantidadGramos,

        LocalDate fecha
) {
}
