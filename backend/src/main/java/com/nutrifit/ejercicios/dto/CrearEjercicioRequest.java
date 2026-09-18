package com.nutrifit.ejercicios.dto;

import jakarta.validation.constraints.NotBlank;

public record CrearEjercicioRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El grupo muscular es obligatorio")
        String grupoMuscular
) {
}
