package com.nutrifit.ejercicios;

import com.nutrifit.ejercicios.dto.CrearEjercicioRequest;
import com.nutrifit.ejercicios.dto.EjercicioResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EjercicioService {

    private final EjercicioRepository ejercicioRepository;
    private final UsuarioService usuarioService;

    public List<EjercicioResponse> listarParaUsuario(String email) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        return ejercicioRepository.buscarVisiblesParaUsuario(usuario.getId()).stream()
                .map(EjercicioResponse::desde)
                .toList();
    }

    @Transactional
    public EjercicioResponse crear(String email, CrearEjercicioRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);

        Ejercicio ejercicio = new Ejercicio();
        ejercicio.setNombre(request.nombre().trim());
        ejercicio.setGrupoMuscular(request.grupoMuscular().trim());
        ejercicio.setEsGlobal(false);
        ejercicio.setUsuario(usuario);

        return EjercicioResponse.desde(ejercicioRepository.save(ejercicio));
    }
}
