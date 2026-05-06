package com.example.rutinas;

import com.example.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "rutinas_ocultas",
		uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_id", "rutina_id" })
)
public class RutinaOculta {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "rutina_id", nullable = false)
	private Rutina rutina;

	@Column(name = "created_at", nullable = false)
	private java.time.Instant createdAt;

	protected RutinaOculta() {
	}

	public RutinaOculta(Usuario usuario, Rutina rutina) {
		this.usuario = usuario;
		this.rutina = rutina;
		this.createdAt = java.time.Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public Rutina getRutina() {
		return rutina;
	}
}

