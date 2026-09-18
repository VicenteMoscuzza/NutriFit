package com.nutrifit.rutinas;

import com.nutrifit.ejercicios.Ejercicio;
import com.nutrifit.ejercicios.EjercicioRepository;
import com.nutrifit.rutinas.dto.AgregarEjercicioRutinaRequest;
import com.nutrifit.rutinas.dto.DiaSemanaResponse;
import com.nutrifit.rutinas.dto.EjercicioRutinaResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RutinaService {

    private static final String[] NOMBRES_DIAS = {
        "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
    };

    private final RutinaRepository rutinaRepository;
    private final DiaRutinaRepository diaRutinaRepository;
    private final EjercicioRutinaRepository ejercicioRutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final UsuarioService usuarioService;

    public List<DiaSemanaResponse> obtenerSemana(String email) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);

        Map<Short, List<EjercicioRutina>> ejerciciosPorDia = rutinaRepository.findByUsuarioId(usuario.getId())
                .map(rutina -> ejercicioRutinaRepository.buscarPorRutina(rutina.getId()))
                .orElse(List.of())
                .stream()
                .collect(Collectors.groupingBy(er -> er.getDiaRutina().getDiaSemana()));

        return IntStream.rangeClosed(1, 7)
                .mapToObj(dia -> new DiaSemanaResponse(
                        dia,
                        NOMBRES_DIAS[dia - 1],
                        ejerciciosPorDia.getOrDefault((short) dia, List.of()).stream()
                                .map(EjercicioRutinaResponse::desde)
                                .toList()))
                .toList();
    }

    @Transactional
    public EjercicioRutinaResponse agregarEjercicio(String email, int diaSemana, AgregarEjercicioRutinaRequest request) {
        if (diaSemana < 1 || diaSemana > 7) {
            throw new DiaSemanaInvalidoException();
        }

        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        Ejercicio ejercicio = ejercicioRepository.findById(request.ejercicioId())
                .filter(e -> e.isEsGlobal() || esPropietario(e, usuario))
                .orElseThrow(EjercicioNoDisponibleException::new);

        Rutina rutina = rutinaRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> crearRutina(usuario));

        DiaRutina diaRutina = diaRutinaRepository.findByRutinaIdAndDiaSemana(rutina.getId(), (short) diaSemana)
                .orElseGet(() -> crearDia(rutina, (short) diaSemana));

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

    private DiaRutina crearDia(Rutina rutina, short diaSemana) {
        DiaRutina dia = new DiaRutina();
        dia.setRutina(rutina);
        dia.setDiaSemana(diaSemana);
        return diaRutinaRepository.save(dia);
    }
}
