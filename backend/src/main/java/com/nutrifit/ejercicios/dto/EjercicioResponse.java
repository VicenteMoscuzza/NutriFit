package com.nutrifit.ejercicios.dto;

import com.nutrifit.ejercicios.Ejercicio;

public record EjercicioResponse(Long id, String nombre, String grupoMuscular, boolean esGlobal) {

    public static EjercicioResponse desde(Ejercicio ejercicio) {
        return new EjercicioResponse(
                ejercicio.getId(),
                ejercicio.getNombre(),
                ejercicio.getGrupoMuscular(),
                ejercicio.isEsGlobal());
    }
}
