package com.nutrifit.entrenamiento.dto;

import java.util.List;

public record EntrenamientoHoyResponse(int diaSemana, String nombreDia, List<EjercicioEntrenamientoResponse> ejercicios) {
}
