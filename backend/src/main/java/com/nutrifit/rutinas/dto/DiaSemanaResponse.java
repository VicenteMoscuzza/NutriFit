package com.nutrifit.rutinas.dto;

import java.util.List;

public record DiaSemanaResponse(int diaSemana, String nombreDia, List<EjercicioRutinaResponse> ejercicios) {
}
