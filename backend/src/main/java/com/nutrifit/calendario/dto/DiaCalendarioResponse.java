package com.nutrifit.calendario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DiaCalendarioResponse(
        LocalDate fecha,
        int seriesRegistradas,
        int comidasRegistradas,
        BigDecimal calorias,
        BigDecimal proteina,
        BigDecimal carbohidratos,
        BigDecimal grasa
) {
}
