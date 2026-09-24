package com.nutrifit.nutricion;

public class ComidaGuardadaNoEncontradaException extends RuntimeException {

    public ComidaGuardadaNoEncontradaException() {
        super("La comida no existe en Mis comidas");
    }
}
