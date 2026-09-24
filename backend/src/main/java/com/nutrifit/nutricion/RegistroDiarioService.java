package com.nutrifit.nutricion;

import com.nutrifit.nutricion.dto.ComidaRegistradaResponse;
import com.nutrifit.nutricion.dto.ItemRegistroResponse;
import com.nutrifit.nutricion.dto.RegistroDiarioResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistroDiarioService {

    private final RegistroDiarioRepository registroDiarioRepository;
    private final ComidaRegistradaRepository comidaRegistradaRepository;
    private final ItemRegistroDiarioRepository itemRegistroDiarioRepository;
    private final UsuarioService usuarioService;

    public RegistroDiarioResponse obtenerRegistroDelDia(String email, LocalDate fecha) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        LocalDate fechaConsulta = fecha != null ? fecha : LocalDate.now();

        return registroDiarioRepository.findByUsuarioIdAndFecha(usuario.getId(), fechaConsulta)
                .map(this::construirRespuesta)
                .orElseGet(() -> RegistroDiarioResponse.vacio(fechaConsulta));
    }

    private RegistroDiarioResponse construirRespuesta(RegistroDiario registro) {
        List<ComidaRegistradaResponse> comidas = comidaRegistradaRepository
                .findByRegistroDiarioIdOrderByIdAsc(registro.getId()).stream()
                .map(comida -> ComidaRegistradaResponse.desde(comida, obtenerItems(comida.getId())))
                .toList();

        return RegistroDiarioResponse.desde(registro, comidas);
    }

    List<ItemRegistroResponse> obtenerItems(Long comidaId) {
        return itemRegistroDiarioRepository.buscarPorComida(comidaId).stream()
                .map(ItemRegistroResponse::desde)
                .toList();
    }

    RegistroDiario obtenerOCrearRegistro(Usuario usuario, LocalDate fecha) {
        return registroDiarioRepository.findByUsuarioIdAndFecha(usuario.getId(), fecha)
                .orElseGet(() -> crearRegistro(usuario, fecha));
    }

    private RegistroDiario crearRegistro(Usuario usuario, LocalDate fecha) {
        RegistroDiario registro = new RegistroDiario();
        registro.setUsuario(usuario);
        registro.setFecha(fecha);
        return registroDiarioRepository.save(registro);
    }
}
