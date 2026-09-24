package com.nutrifit.nutricion;

public class ItemRegistroDiarioNoEncontradoException extends RuntimeException {

    public ItemRegistroDiarioNoEncontradoException() {
        super("El alimento registrado no existe");
    }
}
