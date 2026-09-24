package com.nutrifit.calendario;

import com.nutrifit.calendario.dto.DetalleDiaResponse;
import com.nutrifit.calendario.dto.DiaCalendarioResponse;
import com.nutrifit.calendario.dto.EjercicioRealizadoResponse;
import com.nutrifit.entrenamiento.ResumenSeriesPorFecha;
import com.nutrifit.entrenamiento.SerieEntrenamiento;
import com.nutrifit.entrenamiento.SerieEntrenamientoRepository;
import com.nutrifit.entrenamiento.dto.SerieEntrenamientoResponse;
import com.nutrifit.nutricion.RegistroDiarioRepository;
import com.nutrifit.nutricion.RegistroDiarioService;
import com.nutrifit.nutricion.ResumenNutricionPorFecha;
import com.nutrifit.rutinas.EjercicioRutina;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CalendarioService {

    private final SerieEntrenamientoRepository serieEntrenamientoRepository;
    private final RegistroDiarioRepository registroDiarioRepository;
    private final RegistroDiarioService registroDiarioService;
    private final UsuarioService usuarioService;

    public List<DiaCalendarioResponse> obtenerMes(String email, YearMonth mes) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        LocalDate desde = mes.atDay(1);
        LocalDate hasta = mes.atEndOfMonth();

        Map<LocalDate, ResumenSeriesPorFecha> series = serieEntrenamientoRepository
                .resumirPorFecha(usuario.getId(), desde, hasta).stream()
                .collect(Collectors.toMap(ResumenSeriesPorFecha::fecha, Function.identity()));
        Map<LocalDate, ResumenNutricionPorFecha> nutricion = registroDiarioRepository
                .resumirPorFecha(usuario.getId(), desde, hasta).stream()
                .collect(Collectors.toMap(ResumenNutricionPorFecha::fecha, Function.identity()));

        TreeSet<LocalDate> fechas = new TreeSet<>(series.keySet());
        fechas.addAll(nutricion.keySet());

        return fechas.stream()
                .map(fecha -> construirDia(fecha, series.get(fecha), nutricion.get(fecha)))
                .toList();
    }

    @Transactional(readOnly = true)
    public DetalleDiaResponse obtenerDia(String email, LocalDate fecha) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);

        Map<EjercicioRutina, List<SerieEntrenamiento>> seriesPorEjercicio = serieEntrenamientoRepository
                .buscarConEjercicioPorUsuarioYFecha(usuario.getId(), fecha).stream()
                .collect(Collectors.groupingBy(
                        SerieEntrenamiento::getEjercicioRutina, LinkedHashMap::new, Collectors.toList()));

        List<EjercicioRealizadoResponse> ejercicios = seriesPorEjercicio.entrySet().stream()
                .map(entrada -> new EjercicioRealizadoResponse(
                        entrada.getKey().getEjercicio().getNombre(),
                        entrada.getKey().getEjercicio().getGrupoMuscular(),
                        entrada.getKey().getDiaRutina().getNumero(),
                        entrada.getValue().stream().map(SerieEntrenamientoResponse::desde).toList()))
                .toList();

        return new DetalleDiaResponse(fecha, ejercicios, registroDiarioService.obtenerRegistroDelDia(email, fecha));
    }

    private DiaCalendarioResponse construirDia(
            LocalDate fecha, ResumenSeriesPorFecha series, ResumenNutricionPorFecha nutricion) {
        return new DiaCalendarioResponse(
                fecha,
                series != null ? series.series().intValue() : 0,
                nutricion != null ? nutricion.comidas().intValue() : 0,
                nutricion != null ? nutricion.calorias() : BigDecimal.ZERO,
                nutricion != null ? nutricion.proteina() : BigDecimal.ZERO,
                nutricion != null ? nutricion.carbohidratos() : BigDecimal.ZERO,
                nutricion != null ? nutricion.grasa() : BigDecimal.ZERO);
    }
}
