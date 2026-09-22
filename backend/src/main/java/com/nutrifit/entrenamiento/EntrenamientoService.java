package com.nutrifit.entrenamiento;

import com.nutrifit.entrenamiento.dto.EjercicioEntrenamientoResponse;
import com.nutrifit.entrenamiento.dto.EntrenamientoDiaResponse;
import com.nutrifit.entrenamiento.dto.RegistrarSerieRequest;
import com.nutrifit.entrenamiento.dto.SerieEntrenamientoResponse;
import com.nutrifit.rutinas.DiaRutina;
import com.nutrifit.rutinas.DiaRutinaNoEncontradoException;
import com.nutrifit.rutinas.DiaRutinaRepository;
import com.nutrifit.rutinas.EjercicioRutina;
import com.nutrifit.rutinas.EjercicioRutinaNoEncontradoException;
import com.nutrifit.rutinas.EjercicioRutinaRepository;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EntrenamientoService {

    private final DiaRutinaRepository diaRutinaRepository;
    private final EjercicioRutinaRepository ejercicioRutinaRepository;
    private final SerieEntrenamientoRepository serieEntrenamientoRepository;
    private final UsuarioService usuarioService;

    public EntrenamientoDiaResponse obtenerEntrenamientoDelDia(String email, Long diaId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        DiaRutina dia = diaRutinaRepository.findByIdAndRutinaUsuarioId(diaId, usuario.getId())
                .orElseThrow(DiaRutinaNoEncontradoException::new);

        LocalDate hoy = LocalDate.now();
        List<EjercicioRutina> ejerciciosDelDia = ejercicioRutinaRepository.buscarPorDia(dia.getId());

        Map<Long, List<SerieEntrenamiento>> seriesPorEjercicio = serieEntrenamientoRepository
                .buscarPorUsuarioYFecha(usuario.getId(), hoy)
                .stream()
                .collect(Collectors.groupingBy(serie -> serie.getEjercicioRutina().getId()));

        List<EjercicioEntrenamientoResponse> ejercicios = ejerciciosDelDia.stream()
                .map(er -> new EjercicioEntrenamientoResponse(
                        er.getId(),
                        er.getEjercicio().getId(),
                        er.getEjercicio().getNombre(),
                        er.getEjercicio().getGrupoMuscular(),
                        er.getSeriesObjetivo(),
                        er.getRepeticionesObjetivo(),
                        seriesPorEjercicio.getOrDefault(er.getId(), List.of()).stream()
                                .map(SerieEntrenamientoResponse::desde)
                                .toList()))
                .toList();

        return new EntrenamientoDiaResponse(dia.getId(), dia.getNumero(), ejercicios);
    }

    @Transactional
    public SerieEntrenamientoResponse registrarSerie(String email, RegistrarSerieRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        EjercicioRutina ejercicioRutina = ejercicioRutinaRepository.findById(request.ejercicioRutinaId())
                .filter(er -> esPropietario(er, usuario))
                .orElseThrow(EjercicioRutinaNoEncontradoException::new);

        LocalDate hoy = LocalDate.now();
        int siguienteNumero = serieEntrenamientoRepository
                .countByEjercicioRutinaIdAndUsuarioIdAndFecha(ejercicioRutina.getId(), usuario.getId(), hoy) + 1;

        SerieEntrenamiento serie = new SerieEntrenamiento();
        serie.setEjercicioRutina(ejercicioRutina);
        serie.setUsuario(usuario);
        serie.setFecha(hoy);
        serie.setNumeroSerie(siguienteNumero);
        serie.setPesoKg(request.pesoKg());
        serie.setRepeticiones(request.repeticiones());

        return SerieEntrenamientoResponse.desde(serieEntrenamientoRepository.save(serie));
    }

    @Transactional
    public void eliminarSerie(String email, Long serieId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        SerieEntrenamiento serie = serieEntrenamientoRepository.findById(serieId)
                .filter(s -> s.getUsuario().getId().equals(usuario.getId()))
                .orElseThrow(SerieEntrenamientoNoEncontradaException::new);

        serieEntrenamientoRepository.delete(serie);
    }

    private boolean esPropietario(EjercicioRutina ejercicioRutina, Usuario usuario) {
        return ejercicioRutina.getDiaRutina().getRutina().getUsuario().getId().equals(usuario.getId());
    }
}
