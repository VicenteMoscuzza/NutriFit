package com.nutrifit.nutricion.dto;

import com.nutrifit.nutricion.ItemComidaGuardada;
import java.math.BigDecimal;

public record ItemComidaGuardadaResponse(
        Long id,
        Long alimentoId,
        String nombreAlimento,
        BigDecimal cantidadGramos
) {

    public static ItemComidaGuardadaResponse desde(ItemComidaGuardada item) {
        return new ItemComidaGuardadaResponse(
                item.getId(),
                item.getAlimento().getId(),
                item.getAlimento().getNombre(),
                item.getCantidadGramos());
    }
}
