package com.nutrifit.calendario.dto;

import com.nutrifit.entrenamiento.dto.SerieEntrenamientoResponse;
import java.util.List;

public record EjercicioRealizadoResponse(
        String nombreEjercicio,
        String grupoMuscular,
        Integer diaRutina,
        List<SerieEntrenamientoResponse> series
) {
}
