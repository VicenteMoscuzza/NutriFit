package com.nutrifit.nutricion;

public class ComidaRegistradaNoEncontradaException extends RuntimeException {

    public ComidaRegistradaNoEncontradaException() {
        super("La comida no existe");
    }
}
