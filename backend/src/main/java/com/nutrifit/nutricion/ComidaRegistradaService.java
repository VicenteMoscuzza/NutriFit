package com.nutrifit.nutricion;

import com.nutrifit.alimentos.Alimento;
import com.nutrifit.alimentos.AlimentoService;
import com.nutrifit.nutricion.dto.AgregarItemComidaRequest;
import com.nutrifit.nutricion.dto.ComidaRegistradaResponse;
import com.nutrifit.nutricion.dto.CrearComidaDesdeGuardadaRequest;
import com.nutrifit.nutricion.dto.CrearComidaRequest;
import com.nutrifit.nutricion.dto.ItemRegistroResponse;
import com.nutrifit.nutricion.dto.RenombrarComidaRequest;
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
    public ComidaRegistradaResponse crearEnBlanco(String email, CrearComidaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        LocalDate fecha = request.fecha() != null ? request.fecha() : LocalDate.now();
        RegistroDiario registro = registroDiarioService.obtenerOCrearRegistro(usuario, fecha);

        String nombre = (request.nombre() != null && !request.nombre().isBlank())
                ? request.nombre().trim()
                : nombrePorDefecto(registro.getId());

        ComidaRegistrada comida = new ComidaRegistrada();
        comida.setRegistroDiario(registro);
        comida.setNombre(nombre);
        comida = comidaRegistradaRepository.save(comida);

        return ComidaRegistradaResponse.desde(comida, registroDiarioService.obtenerItems(comida.getId()));
    }

    @Transactional
    public ComidaRegistradaResponse crearDesdeGuardada(String email, CrearComidaDesdeGuardadaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ComidaGuardada plantilla = comidaGuardadaRepository
                .findByIdAndUsuarioId(request.comidaGuardadaId(), usuario.getId())
                .orElseThrow(ComidaGuardadaNoEncontradaException::new);

        LocalDate fecha = request.fecha() != null ? request.fecha() : LocalDate.now();
        RegistroDiario registro = registroDiarioService.obtenerOCrearRegistro(usuario, fecha);

        ComidaRegistrada comida = new ComidaRegistrada();
        comida.setRegistroDiario(registro);
        comida.setNombre(plantilla.getNombre());
        comida = comidaRegistradaRepository.save(comida);

        for (ItemComidaGuardada itemPlantilla : itemComidaGuardadaRepository.buscarPorComida(plantilla.getId())) {
            crearItem(comida, itemPlantilla.getAlimento(), itemPlantilla.getCantidadGramos());
        }

        return ComidaRegistradaResponse.desde(comida, registroDiarioService.obtenerItems(comida.getId()));
    }

    @Transactional
    public ComidaRegistradaResponse renombrar(String email, Long comidaId, RenombrarComidaRequest request) {
        ComidaRegistrada comida = obtenerPropia(email, comidaId);
        comida.setNombre(request.nombre().trim());
        return ComidaRegistradaResponse.desde(comida, registroDiarioService.obtenerItems(comida.getId()));
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

    private String nombrePorDefecto(Long registroId) {
        int siguiente = comidaRegistradaRepository.countByRegistroDiarioId(registroId) + 1;
        return "Comida " + siguiente;
    }
}
