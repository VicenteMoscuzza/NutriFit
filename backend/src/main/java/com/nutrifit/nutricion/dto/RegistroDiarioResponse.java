package com.nutrifit.nutricion.dto;

import com.nutrifit.nutricion.RegistroDiario;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

public record RegistroDiarioResponse(
        Long id,
        LocalDate fecha,
        List<ComidaRegistradaResponse> comidas,
        BigDecimal totalCalorias,
        BigDecimal totalProteina,
        BigDecimal totalCarbohidratos,
        BigDecimal totalGrasa
) {

    public static RegistroDiarioResponse desde(RegistroDiario registro, List<ComidaRegistradaResponse> comidas) {
        return new RegistroDiarioResponse(
                registro.getId(),
                registro.getFecha(),
                comidas,
                sumar(comidas, ComidaRegistradaResponse::subtotalCalorias),
                sumar(comidas, ComidaRegistradaResponse::subtotalProteina),
                sumar(comidas, ComidaRegistradaResponse::subtotalCarbohidratos),
                sumar(comidas, ComidaRegistradaResponse::subtotalGrasa));
    }

    public static RegistroDiarioResponse vacio(LocalDate fecha) {
        return new RegistroDiarioResponse(
                null, fecha, List.of(), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private static BigDecimal sumar(List<ComidaRegistradaResponse> comidas, Function<ComidaRegistradaResponse, BigDecimal> extractor) {
        return comidas.stream().map(extractor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
