package com.nutrifit.nutricion.dto;

import jakarta.validation.constraints.NotBlank;

public record RenombrarComidaRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre
) {
}
