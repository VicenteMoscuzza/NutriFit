package com.nutrifit.rutinas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CrearDiaRutinaRequest(
        @NotEmpty(message = "Agregá al menos un ejercicio al día")
        List<@Valid AgregarEjercicioRutinaRequest> ejercicios
) {
}
