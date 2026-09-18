package com.nutrifit.rutinas;

public class DiaSemanaInvalidoException extends RuntimeException {

    public DiaSemanaInvalidoException() {
        super("El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)");
    }
}
