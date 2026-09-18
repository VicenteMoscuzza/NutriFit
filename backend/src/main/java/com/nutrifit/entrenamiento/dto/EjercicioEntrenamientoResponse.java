package com.nutrifit.entrenamiento.dto;

import java.util.List;

public record EjercicioEntrenamientoResponse(
        Long ejercicioRutinaId,
        Long ejercicioId,
        String nombreEjercicio,
        String grupoMuscular,
        Integer seriesObjetivo,
        Integer repeticionesObjetivo,
        List<SerieEntrenamientoResponse> series
) {
}
