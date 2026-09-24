package com.nutrifit.alimentos;

import com.nutrifit.alimentos.dto.AlimentoResponse;
import com.nutrifit.alimentos.dto.CrearAlimentoRequest;
import com.nutrifit.usuarios.Usuario;
import com.nutrifit.usuarios.UsuarioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlimentoService {

    private final AlimentoRepository alimentoRepository;
    private final UsuarioService usuarioService;

    public List<AlimentoResponse> listarParaUsuario(String email) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);
        return alimentoRepository.buscarVisiblesParaUsuario(usuario.getId()).stream()
                .map(AlimentoResponse::desde)
                .toList();
    }

    @Transactional
    public AlimentoResponse crear(String email, CrearAlimentoRequest request) {
        Usuario usuario = usuarioService.obtenerEntidadAutenticada(email);

        Alimento alimento = new Alimento();
        alimento.setNombre(request.nombre().trim());
        alimento.setCaloriasPor100g(request.caloriasPor100g());
        alimento.setProteinaPor100g(request.proteinaPor100g());
        alimento.setCarbohidratosPor100g(request.carbohidratosPor100g());
        alimento.setGrasaPor100g(request.grasaPor100g());
        alimento.setEsGlobal(false);
        alimento.setUsuario(usuario);

        return AlimentoResponse.desde(alimentoRepository.save(alimento));
    }

    public Alimento obtenerDisponible(Usuario usuario, Long alimentoId) {
        return alimentoRepository.findById(alimentoId)
                .filter(a -> a.isEsGlobal() || esPropietario(a, usuario))
                .orElseThrow(AlimentoNoDisponibleException::new);
    }

    private boolean esPropietario(Alimento alimento, Usuario usuario) {
        return alimento.getUsuario() != null && alimento.getUsuario().getId().equals(usuario.getId());
    }
}
