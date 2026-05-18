package com.example.entrenamientos.dto;

import jakarta.validation.constraints.NotNull;

public record EntrenamientoIniciarRequest(@NotNull(message = "La rutina es obligatoria") Long rutinaId) {
}
