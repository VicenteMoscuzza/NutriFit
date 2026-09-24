package com.nutrifit.calendario.dto;

import com.nutrifit.nutricion.dto.RegistroDiarioResponse;
import java.time.LocalDate;
import java.util.List;

public record DetalleDiaResponse(
        LocalDate fecha,
        List<EjercicioRealizadoResponse> ejercicios,
        RegistroDiarioResponse nutricion
) {
}
