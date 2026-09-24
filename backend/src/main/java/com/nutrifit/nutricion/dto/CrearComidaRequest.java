package com.nutrifit.nutricion.dto;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

public record CrearComidaRequest(
        LocalDate fecha,
        List<@Valid AgregarItemComidaRequest> items,
        List<Long> comidasGuardadasIds
) {
}
