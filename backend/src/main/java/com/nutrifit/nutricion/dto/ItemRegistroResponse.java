package com.nutrifit.nutricion.dto;

import com.nutrifit.nutricion.ItemRegistroDiario;
import java.math.BigDecimal;

public record ItemRegistroResponse(
        Long id,
        Long alimentoId,
        String nombreAlimento,
        BigDecimal cantidadGramos,
        BigDecimal caloriasCalculadas,
        BigDecimal proteinaCalculada,
        BigDecimal carbohidratosCalculados,
        BigDecimal grasaCalculada
) {

    public static ItemRegistroResponse desde(ItemRegistroDiario item) {
        return new ItemRegistroResponse(
                item.getId(),
                item.getAlimento().getId(),
                item.getAlimento().getNombre(),
                item.getCantidadGramos(),
                item.getCaloriasCalculadas(),
                item.getProteinaCalculada(),
                item.getCarbohidratosCalculados(),
                item.getGrasaCalculada());
    }
}
