package com.nutrifit.rutinas;

public class EjercicioRutinaNoEncontradoException extends RuntimeException {

    public EjercicioRutinaNoEncontradoException() {
        super("El ejercicio de la rutina no existe");
    }
}
