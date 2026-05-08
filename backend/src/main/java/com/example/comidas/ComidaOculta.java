package com.example.comidas;

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
		name = "comidas_ocultas",
		uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_id", "comida_id" })
)
public class ComidaOculta {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "comida_id", nullable = false)
	private Comida comida;

	@Column(name = "created_at", nullable = false)
	private java.time.Instant createdAt;

	protected ComidaOculta() {
	}

	public ComidaOculta(Usuario usuario, Comida comida) {
		this.usuario = usuario;
		this.comida = comida;
		this.createdAt = java.time.Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public Comida getComida() {
		return comida;
	}
}
