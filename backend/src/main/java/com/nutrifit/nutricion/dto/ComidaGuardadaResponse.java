package com.nutrifit.nutricion.dto;

import com.nutrifit.nutricion.ComidaGuardada;
import java.util.List;

public record ComidaGuardadaResponse(Long id, String nombre, List<ItemComidaGuardadaResponse> items) {

    public static ComidaGuardadaResponse desde(ComidaGuardada comida, List<ItemComidaGuardadaResponse> items) {
        return new ComidaGuardadaResponse(comida.getId(), comida.getNombre(), items);
    }
}
