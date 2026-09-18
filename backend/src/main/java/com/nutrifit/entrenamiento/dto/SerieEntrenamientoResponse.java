package com.nutrifit.entrenamiento.dto;

import com.nutrifit.entrenamiento.SerieEntrenamiento;

public record SerieEntrenamientoResponse(Long id, Integer numeroSerie, Double pesoKg, Integer repeticiones) {

    public static SerieEntrenamientoResponse desde(SerieEntrenamiento serie) {
        return new SerieEntrenamientoResponse(
                serie.getId(),
                serie.getNumeroSerie(),
                serie.getPesoKg(),
                serie.getRepeticiones());
    }
}
