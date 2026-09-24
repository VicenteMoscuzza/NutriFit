package com.nutrifit.alimentos.dto;

import com.nutrifit.alimentos.Alimento;
import java.math.BigDecimal;

public record AlimentoResponse(
        Long id,
        String nombre,
        BigDecimal caloriasPor100g,
        BigDecimal proteinaPor100g,
        BigDecimal carbohidratosPor100g,
        BigDecimal grasaPor100g,
        boolean esGlobal
) {

    public static AlimentoResponse desde(Alimento alimento) {
        return new AlimentoResponse(
                alimento.getId(),
                alimento.getNombre(),
                alimento.getCaloriasPor100g(),
                alimento.getProteinaPor100g(),
                alimento.getCarbohidratosPor100g(),
                alimento.getGrasaPor100g(),
                alimento.isEsGlobal());
    }
}
