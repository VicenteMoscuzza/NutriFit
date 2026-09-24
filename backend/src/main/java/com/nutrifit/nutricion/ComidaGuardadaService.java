package com.nutrifit.nutricion;

import com.nutrifit.alimentos.Alimento;
import com.nutrifit.alimentos.AlimentoService;
import com.nutrifit.nutricion.dto.AgregarItemComidaGuardadaRequest;
import com.nutrifit.nutricion.dto.ComidaGuardadaResponse;
import com.nutrifit.nutricion.dto.CrearComidaGuardadaRequest;
import com.nutrifit.nutricion.dto.ItemComidaGuardadaResponse;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ComidaGuardadaService {

    private final ComidaGuardadaRepository comidaGuardadaRepository;
    private final ItemComidaGuardadaRepository itemComidaGuardadaRepository;
    private final AlimentoService alimentoService;
    private final UsuarioService usuarioService;

    public List<ComidaGuardadaResponse> listar(String email) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        return comidaGuardadaRepository.findByUsuarioIdOrderByNombreAsc(usuario.getId()).stream()
                .map(comida -> ComidaGuardadaResponse.desde(comida, obtenerItems(comida.getId())))
                .toList();
    }

    @Transactional
    public ComidaGuardadaResponse crear(String email, CrearComidaGuardadaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);

        ComidaGuardada comida = new ComidaGuardada();
        comida.setUsuario(usuario);
        comida.setNombre(request.nombre().trim());

        return ComidaGuardadaResponse.desde(comidaGuardadaRepository.save(comida), List.of());
    }

    @Transactional
    public void eliminar(String email, Long id) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ComidaGuardada comida = comidaGuardadaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(ComidaGuardadaNoEncontradaException::new);

        comidaGuardadaRepository.delete(comida);
    }

    @Transactional
    public ItemComidaGuardadaResponse agregarItem(String email, Long comidaId, AgregarItemComidaGuardadaRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ComidaGuardada comida = comidaGuardadaRepository.findByIdAndUsuarioId(comidaId, usuario.getId())
                .orElseThrow(ComidaGuardadaNoEncontradaException::new);

        Alimento alimento = alimentoService.obtenerDisponible(usuario, request.alimentoId());

        ItemComidaGuardada item = new ItemComidaGuardada();
        item.setComidaGuardada(comida);
        item.setAlimento(alimento);
        item.setCantidadGramos(request.cantidadGramos());

        return ItemComidaGuardadaResponse.desde(itemComidaGuardadaRepository.save(item));
    }

    @Transactional
    public void eliminarItem(String email, Long itemId) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        ItemComidaGuardada item = itemComidaGuardadaRepository
                .findByIdAndComidaGuardadaUsuarioId(itemId, usuario.getId())
                .orElseThrow(ItemComidaGuardadaNoEncontradoException::new);

        itemComidaGuardadaRepository.delete(item);
    }

    private List<ItemComidaGuardadaResponse> obtenerItems(Long comidaId) {
        return itemComidaGuardadaRepository.buscarPorComida(comidaId).stream()
                .map(ItemComidaGuardadaResponse::desde)
                .toList();
    }
}
