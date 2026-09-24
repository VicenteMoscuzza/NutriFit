package com.nutrifit.nutricion;

import com.nutrifit.alimentos.Alimento;
import com.nutrifit.alimentos.AlimentoService;
import com.nutrifit.nutricion.dto.AgregarItemComidaRequest;
import com.nutrifit.nutricion.dto.CargarComidaGuardadaRequest;
import com.nutrifit.nutricion.dto.ComidaRegistradaResponse;
import com.nutrifit.nutricion.dto.CrearComidaRequest;
import com.nutrifit.nutricion.dto.ItemRegistroResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ComidaRegistradaService {

    private final ComidaRegistradaRepository comidaRegistradaRepository;
    private final ItemRegistroDiarioRepository itemRegistroDiarioRepository;
    private final ComidaGuardadaRepository comidaGuardadaRepository;
    private final ItemComidaGuardadaRepository itemComidaGuardadaRepository;
    private final AlimentoService alimentoService;
    private final RegistroDiarioService registroDiarioService;
    private final UsuarioService usuarioService;

    @Transactional
    public ComidaRegistradaResponse crear(String email, CrearComidaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        LocalDate fecha = request.fecha() != null ? request.fecha() : LocalDate.now();
        RegistroDiario registro = registroDiarioService.obtenerOCrearRegistro(usuario, fecha);

        ComidaRegistrada comida = new ComidaRegistrada();
        comida.setRegistroDiario(registro);
        comida = comidaRegistradaRepository.save(comida);

        if (request.items() != null) {
            for (AgregarItemComidaRequest item : request.items()) {
                Alimento alimento = alimentoService.obtenerDisponible(usuario, item.alimentoId());
                crearItem(comida, alimento, item.cantidadGramos());
            }
        }
        if (request.comidasGuardadasIds() != null) {
            for (Long comidaGuardadaId : request.comidasGuardadasIds()) {
                copiarItemsDeGuardada(usuario, comida, comidaGuardadaId);
            }
        }

        return registroDiarioService.construirRespuesta(comida);
    }

    @Transactional
    public ComidaRegistradaResponse cargarComidaGuardada(String email, Long comidaId, CargarComidaGuardadaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ComidaRegistrada comida = comidaRegistradaRepository.findByIdAndRegistroDiarioUsuarioId(comidaId, usuario.getId())
                .orElseThrow(ComidaRegistradaNoEncontradaException::new);

        copiarItemsDeGuardada(usuario, comida, request.comidaGuardadaId());

        return registroDiarioService.construirRespuesta(comida);
    }

    private void copiarItemsDeGuardada(Usuario usuario, ComidaRegistrada comida, Long comidaGuardadaId) {
        ComidaGuardada plantilla = comidaGuardadaRepository
                .findByIdAndUsuarioId(comidaGuardadaId, usuario.getId())
                .orElseThrow(ComidaGuardadaNoEncontradaException::new);

        for (ItemComidaGuardada itemPlantilla : itemComidaGuardadaRepository.buscarPorComida(plantilla.getId())) {
            crearItem(comida, itemPlantilla.getAlimento(), itemPlantilla.getCantidadGramos());
        }
    }

    @Transactional
    public void eliminarComida(String email, Long comidaId) {
        ComidaRegistrada comida = obtenerPropia(email, comidaId);
        comidaRegistradaRepository.delete(comida);
    }

    @Transactional
    public ItemRegistroResponse agregarItem(String email, Long comidaId, AgregarItemComidaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ComidaRegistrada comida = comidaRegistradaRepository.findByIdAndRegistroDiarioUsuarioId(comidaId, usuario.getId())
                .orElseThrow(ComidaRegistradaNoEncontradaException::new);

        Alimento alimento = alimentoService.obtenerDisponible(usuario, request.alimentoId());
        ItemRegistroDiario item = crearItem(comida, alimento, request.cantidadGramos());
        return ItemRegistroResponse.desde(item);
    }

    @Transactional
    public void eliminarItem(String email, Long itemId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ItemRegistroDiario item = itemRegistroDiarioRepository
                .findByIdAndComidaRegistradaRegistroDiarioUsuarioId(itemId, usuario.getId())
                .orElseThrow(ItemRegistroDiarioNoEncontradoException::new);

        itemRegistroDiarioRepository.delete(item);
    }

    private ComidaRegistrada obtenerPropia(String email, Long comidaId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        return comidaRegistradaRepository.findByIdAndRegistroDiarioUsuarioId(comidaId, usuario.getId())
                .orElseThrow(ComidaRegistradaNoEncontradaException::new);
    }

    private ItemRegistroDiario crearItem(ComidaRegistrada comida, Alimento alimento, BigDecimal cantidadGramos) {
        CalculoNutricional.ValoresCalculados valores = CalculoNutricional.calcular(alimento, cantidadGramos);

        ItemRegistroDiario item = new ItemRegistroDiario();
        item.setComidaRegistrada(comida);
        item.setAlimento(alimento);
        item.setCantidadGramos(cantidadGramos);
        item.setCaloriasCalculadas(valores.calorias());
        item.setProteinaCalculada(valores.proteina());
        item.setCarbohidratosCalculados(valores.carbohidratos());
        item.setGrasaCalculada(valores.grasa());

        return itemRegistroDiarioRepository.save(item);
    }
}
