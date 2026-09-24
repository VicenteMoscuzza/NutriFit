package com.nutrifit.alimentos;

public class AlimentoNoDisponibleException extends RuntimeException {

    public AlimentoNoDisponibleException() {
        super("El alimento no existe o no está disponible para tu usuario");
    }
}
