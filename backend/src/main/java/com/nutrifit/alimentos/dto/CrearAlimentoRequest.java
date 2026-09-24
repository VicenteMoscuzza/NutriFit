package com.nutrifit.alimentos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CrearAlimentoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotNull(message = "Indicá las calorías por 100g")
        @DecimalMin(value = "0.0", message = "Las calorías no pueden ser negativas")
        BigDecimal caloriasPor100g,

        @NotNull(message = "Indicá las proteínas por 100g")
        @DecimalMin(value = "0.0", message = "Las proteínas no pueden ser negativas")
        BigDecimal proteinaPor100g,

        @NotNull(message = "Indicá los carbohidratos por 100g")
        @DecimalMin(value = "0.0", message = "Los carbohidratos no pueden ser negativos")
        BigDecimal carbohidratosPor100g,

        @NotNull(message = "Indicá las grasas por 100g")
        @DecimalMin(value = "0.0", message = "Las grasas no pueden ser negativas")
        BigDecimal grasaPor100g
) {
}
