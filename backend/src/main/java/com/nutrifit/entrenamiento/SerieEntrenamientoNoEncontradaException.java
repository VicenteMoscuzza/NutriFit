package com.nutrifit.entrenamiento;

public class SerieEntrenamientoNoEncontradaException extends RuntimeException {

    public SerieEntrenamientoNoEncontradaException() {
        super("La serie registrada no existe");
    }
}
