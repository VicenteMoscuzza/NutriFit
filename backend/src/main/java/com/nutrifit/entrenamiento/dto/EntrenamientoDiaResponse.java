package com.nutrifit.entrenamiento.dto;

import java.util.List;

public record EntrenamientoDiaResponse(Long diaId, Integer numero, List<EjercicioEntrenamientoResponse> ejercicios) {
}
