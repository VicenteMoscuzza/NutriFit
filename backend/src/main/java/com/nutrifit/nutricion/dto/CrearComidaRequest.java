package com.nutrifit.nutricion.dto;

import java.time.LocalDate;

public record CrearComidaRequest(LocalDate fecha, String nombre) {
}
