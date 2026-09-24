package com.nutrifit.nutricion;

import com.nutrifit.alimentos.Alimento;
import com.nutrifit.alimentos.AlimentoService;
import com.nutrifit.nutricion.dto.AgregarItemRegistroRequest;
import com.nutrifit.nutricion.dto.ItemRegistroResponse;
import com.nutrifit.nutricion.dto.RegistroDiarioResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistroDiarioService {

    private final RegistroDiarioRepository registroDiarioRepository;
    private final ItemRegistroDiarioRepository itemRegistroDiarioRepository;
    private final AlimentoService alimentoService;
    private final UsuarioService usuarioService;

    public RegistroDiarioResponse obtenerRegistroDelDia(String email, LocalDate fecha) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        LocalDate fechaConsulta = fecha != null ? fecha : LocalDate.now();

        return registroDiarioRepository.findByUsuarioIdAndFecha(usuario.getId(), fechaConsulta)
                .map(registro -> RegistroDiarioResponse.desde(registro, obtenerItems(registro.getId())))
                .orElseGet(() -> RegistroDiarioResponse.vacio(fechaConsulta));
    }

    @Transactional
    public ItemRegistroResponse agregarItem(String email, AgregarItemRegistroRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        Alimento alimento = alimentoService.obtenerDisponible(usuario, request.alimentoId());
        LocalDate fecha = request.fecha() != null ? request.fecha() : LocalDate.now();

        RegistroDiario registro = obtenerOCrearRegistro(usuario, fecha);
        ItemRegistroDiario item = crearItem(registro, alimento, request.cantidadGramos());
        return ItemRegistroResponse.desde(item);
    }

    @Transactional
    public void eliminarItem(String email, Long itemId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ItemRegistroDiario item = itemRegistroDiarioRepository.findByIdAndRegistroDiarioUsuarioId(itemId, usuario.getId())
                .orElseThrow(ItemRegistroDiarioNoEncontradoException::new);

        itemRegistroDiarioRepository.delete(item);
    }

    RegistroDiario obtenerOCrearRegistro(Usuario usuario, LocalDate fecha) {
        return registroDiarioRepository.findByUsuarioIdAndFecha(usuario.getId(), fecha)
                .orElseGet(() -> crearRegistro(usuario, fecha));
    }

    ItemRegistroDiario crearItem(RegistroDiario registro, Alimento alimento, BigDecimal cantidadGramos) {
        CalculoNutricional.ValoresCalculados valores = CalculoNutricional.calcular(alimento, cantidadGramos);

        ItemRegistroDiario item = new ItemRegistroDiario();
        item.setRegistroDiario(registro);
        item.setAlimento(alimento);
        item.setCantidadGramos(cantidadGramos);
        item.setCaloriasCalculadas(valores.calorias());
        item.setProteinaCalculada(valores.proteina());
        item.setCarbohidratosCalculados(valores.carbohidratos());
        item.setGrasaCalculada(valores.grasa());

        return itemRegistroDiarioRepository.save(item);
    }

    List<ItemRegistroResponse> obtenerItems(Long registroId) {
        return itemRegistroDiarioRepository.buscarPorRegistro(registroId).stream()
                .map(ItemRegistroResponse::desde)
                .toList();
    }

    private RegistroDiario crearRegistro(Usuario usuario, LocalDate fecha) {
        RegistroDiario registro = new RegistroDiario();
        registro.setUsuario(usuario);
        registro.setFecha(fecha);
        return registroDiarioRepository.save(registro);
    }
}
