package com.nutrifit.rutinas;

import com.nutrifit.ejercicios.Ejercicio;
import com.nutrifit.ejercicios.EjercicioRepository;
import com.nutrifit.rutinas.dto.AgregarEjercicioRutinaRequest;
import com.nutrifit.rutinas.dto.DiaRutinaResponse;
import com.nutrifit.rutinas.dto.EjercicioRutinaResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final DiaRutinaRepository diaRutinaRepository;
    private final EjercicioRutinaRepository ejercicioRutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final UsuarioService usuarioService;

    public List<DiaRutinaResponse> obtenerDias(String email) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);

        List<DiaRutina> dias = rutinaRepository.findByUsuarioId(usuario.getId())
                .map(rutina -> diaRutinaRepository.findByRutinaIdOrderByNumeroAsc(rutina.getId()))
                .orElse(List.of());

        Map<Long, List<EjercicioRutinaResponse>> ejerciciosPorDia = rutinaRepository.findByUsuarioId(usuario.getId())
                .map(rutina -> ejercicioRutinaRepository.buscarPorRutina(rutina.getId()))
                .orElse(List.of())
                .stream()
                .collect(Collectors.groupingBy(
                        er -> er.getDiaRutina().getId(),
                        Collectors.mapping(EjercicioRutinaResponse::desde, Collectors.toList())));

        return dias.stream()
                .map(dia -> DiaRutinaResponse.desde(dia, ejerciciosPorDia.getOrDefault(dia.getId(), List.of())))
                .toList();
    }

    @Transactional
    public DiaRutinaResponse agregarDia(String email) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        Rutina rutina = rutinaRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> crearRutina(usuario));

        int siguienteNumero = diaRutinaRepository.countByRutinaId(rutina.getId()) + 1;
        DiaRutina dia = crearDia(rutina, siguienteNumero);
        return DiaRutinaResponse.desde(dia, List.of());
    }

    @Transactional
    public void eliminarDia(String email, Long diaId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        DiaRutina dia = diaRutinaRepository.findByIdAndRutinaUsuarioId(diaId, usuario.getId())
                .orElseThrow(DiaRutinaNoEncontradoException::new);

        Long rutinaId = dia.getRutina().getId();
        diaRutinaRepository.delete(dia);

        List<DiaRutina> restantes = diaRutinaRepository.findByRutinaIdOrderByNumeroAsc(rutinaId);
        for (int i = 0; i < restantes.size(); i++) {
            restantes.get(i).setNumero(i + 1);
        }
        diaRutinaRepository.saveAll(restantes);
    }

    @Transactional
    public EjercicioRutinaResponse agregarEjercicio(String email, Long diaId, AgregarEjercicioRutinaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        DiaRutina diaRutina = diaRutinaRepository.findByIdAndRutinaUsuarioId(diaId, usuario.getId())
                .orElseThrow(DiaRutinaNoEncontradoException::new);

        Ejercicio ejercicio = ejercicioRepository.findById(request.ejercicioId())
                .filter(e -> e.isEsGlobal() || esPropietario(e, usuario))
                .orElseThrow(EjercicioNoDisponibleException::new);

        EjercicioRutina ejercicioRutina = new EjercicioRutina();
        ejercicioRutina.setDiaRutina(diaRutina);
        ejercicioRutina.setEjercicio(ejercicio);
        ejercicioRutina.setSeriesObjetivo(request.seriesObjetivo());
        ejercicioRutina.setRepeticionesObjetivo(request.repeticionesObjetivo());

        return EjercicioRutinaResponse.desde(ejercicioRutinaRepository.save(ejercicioRutina));
    }

    @Transactional
    public void eliminarEjercicio(String email, Long ejercicioRutinaId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        EjercicioRutina ejercicioRutina = ejercicioRutinaRepository.findById(ejercicioRutinaId)
                .orElseThrow(EjercicioRutinaNoEncontradoException::new);

        if (!ejercicioRutina.getDiaRutina().getRutina().getUsuario().getId().equals(usuario.getId())) {
            throw new EjercicioRutinaNoEncontradoException();
        }

        ejercicioRutinaRepository.delete(ejercicioRutina);
    }

    private boolean esPropietario(Ejercicio ejercicio, Usuario usuario) {
        return ejercicio.getUsuario() != null && ejercicio.getUsuario().getId().equals(usuario.getId());
    }

    private Rutina crearRutina(Usuario usuario) {
        Rutina rutina = new Rutina();
        rutina.setUsuario(usuario);
        rutina.setNombre("Mi rutina");
        return rutinaRepository.save(rutina);
    }

    private DiaRutina crearDia(Rutina rutina, int numero) {
        DiaRutina dia = new DiaRutina();
        dia.setRutina(rutina);
        dia.setNumero(numero);
        return diaRutinaRepository.save(dia);
    }
}
