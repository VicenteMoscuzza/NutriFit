package com.nutrifit.rutinas;

public class DiaRutinaNoEncontradoException extends RuntimeException {

    public DiaRutinaNoEncontradoException() {
        super("El día de la rutina no existe");
    }
}
