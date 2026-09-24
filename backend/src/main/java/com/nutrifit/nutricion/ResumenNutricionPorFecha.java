package com.nutrifit.nutricion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResumenNutricionPorFecha(
        LocalDate fecha,
        Long comidas,
        BigDecimal calorias,
        BigDecimal proteina,
        BigDecimal carbohidratos,
        BigDecimal grasa
) {
}
