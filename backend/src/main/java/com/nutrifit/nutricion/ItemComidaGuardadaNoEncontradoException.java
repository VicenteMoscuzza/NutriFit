package com.nutrifit.nutricion;

public class ItemComidaGuardadaNoEncontradoException extends RuntimeException {

    public ItemComidaGuardadaNoEncontradoException() {
        super("El alimento de esta comida no existe");
    }
}
