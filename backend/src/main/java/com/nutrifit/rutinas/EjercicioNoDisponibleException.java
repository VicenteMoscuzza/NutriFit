package com.nutrifit.rutinas;

public class EjercicioNoDisponibleException extends RuntimeException {

    public EjercicioNoDisponibleException() {
        super("El ejercicio no existe o no está disponible para tu usuario");
    }
}
