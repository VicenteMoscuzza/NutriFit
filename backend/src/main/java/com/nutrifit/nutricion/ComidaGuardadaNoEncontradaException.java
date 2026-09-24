package com.nutrifit.nutricion;

public class ComidaGuardadaNoEncontradaException extends RuntimeException {

    public ComidaGuardadaNoEncontradaException() {
        super("La comida guardada no existe");
    }
}
