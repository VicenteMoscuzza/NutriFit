package com.nutrifit.nutricion.dto;

import com.nutrifit.nutricion.RegistroDiario;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

public record RegistroDiarioResponse(
        Long id,
        LocalDate fecha,
        List<ItemRegistroResponse> items,
        BigDecimal totalCalorias,
        BigDecimal totalProteina,
        BigDecimal totalCarbohidratos,
        BigDecimal totalGrasa
) {

    public static RegistroDiarioResponse desde(RegistroDiario registro, List<ItemRegistroResponse> items) {
        return new RegistroDiarioResponse(
                registro.getId(),
                registro.getFecha(),
                items,
                sumar(items, ItemRegistroResponse::caloriasCalculadas),
                sumar(items, ItemRegistroResponse::proteinaCalculada),
                sumar(items, ItemRegistroResponse::carbohidratosCalculados),
                sumar(items, ItemRegistroResponse::grasaCalculada));
    }

    public static RegistroDiarioResponse vacio(LocalDate fecha) {
        return new RegistroDiarioResponse(
                null, fecha, List.of(), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private static BigDecimal sumar(List<ItemRegistroResponse> items, Function<ItemRegistroResponse, BigDecimal> extractor) {
        return items.stream().map(extractor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
