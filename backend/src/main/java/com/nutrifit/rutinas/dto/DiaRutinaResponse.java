package com.nutrifit.rutinas.dto;

import com.nutrifit.rutinas.DiaRutina;
import java.util.List;

public record DiaRutinaResponse(Long id, Integer numero, List<EjercicioRutinaResponse> ejercicios) {

    public static DiaRutinaResponse desde(DiaRutina dia, List<EjercicioRutinaResponse> ejercicios) {
        return new DiaRutinaResponse(dia.getId(), dia.getNumero(), ejercicios);
    }
}
