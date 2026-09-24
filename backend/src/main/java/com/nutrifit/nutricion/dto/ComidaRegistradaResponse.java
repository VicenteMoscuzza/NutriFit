package com.nutrifit.nutricion.dto;

import com.nutrifit.nutricion.ComidaRegistrada;
import java.math.BigDecimal;
import java.util.List;
import java.util.function.Function;

public record ComidaRegistradaResponse(
        Long id,
        int numero,
        List<ItemRegistroResponse> items,
        BigDecimal subtotalCalorias,
        BigDecimal subtotalProteina,
        BigDecimal subtotalCarbohidratos,
        BigDecimal subtotalGrasa
) {

    public static ComidaRegistradaResponse desde(ComidaRegistrada comida, int numero, List<ItemRegistroResponse> items) {
        return new ComidaRegistradaResponse(
                comida.getId(),
                numero,
                items,
                sumar(items, ItemRegistroResponse::caloriasCalculadas),
                sumar(items, ItemRegistroResponse::proteinaCalculada),
                sumar(items, ItemRegistroResponse::carbohidratosCalculados),
                sumar(items, ItemRegistroResponse::grasaCalculada));
    }

    private static BigDecimal sumar(List<ItemRegistroResponse> items, Function<ItemRegistroResponse, BigDecimal> extractor) {
        return items.stream().map(extractor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
