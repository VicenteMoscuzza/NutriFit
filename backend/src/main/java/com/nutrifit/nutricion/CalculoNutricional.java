package com.nutrifit.nutricion;

import com.nutrifit.alimentos.Alimento;
import java.math.BigDecimal;
import java.math.RoundingMode;

final class CalculoNutricional {

    private CalculoNutricional() {
    }

    static ValoresCalculados calcular(Alimento alimento, BigDecimal cantidadGramos) {
        return new ValoresCalculados(
                escalar(alimento.getCaloriasPor100g(), cantidadGramos),
                escalar(alimento.getProteinaPor100g(), cantidadGramos),
                escalar(alimento.getCarbohidratosPor100g(), cantidadGramos),
                escalar(alimento.getGrasaPor100g(), cantidadGramos));
    }

    private static BigDecimal escalar(BigDecimal valorPor100g, BigDecimal cantidadGramos) {
        return valorPor100g.multiply(cantidadGramos)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    record ValoresCalculados(BigDecimal calorias, BigDecimal proteina, BigDecimal carbohidratos, BigDecimal grasa) {
    }
}
