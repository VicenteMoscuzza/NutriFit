package com.nutrifit.rutinas.dto;

import com.nutrifit.rutinas.EjercicioRutina;

public record EjercicioRutinaResponse(
        Long id,
        Long ejercicioId,
        String nombreEjercicio,
        String grupoMuscular,
        Integer seriesObjetivo,
        Integer repeticionesObjetivo
) {

    public static EjercicioRutinaResponse desde(EjercicioRutina ejercicioRutina) {
        return new EjercicioRutinaResponse(
                ejercicioRutina.getId(),
                ejercicioRutina.getEjercicio().getId(),
                ejercicioRutina.getEjercicio().getNombre(),
                ejercicioRutina.getEjercicio().getGrupoMuscular(),
                ejercicioRutina.getSeriesObjetivo(),
                ejercicioRutina.getRepeticionesObjetivo());
    }
}
