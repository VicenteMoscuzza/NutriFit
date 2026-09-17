package com.nutrifit.usuarios.dto;

import com.nutrifit.usuarios.Usuario;

public record UsuarioResponse(Long id, String email) {

    public static UsuarioResponse desde(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getEmail());
    }
}
