package com.example.alimentos;

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
		name = "alimentos_ocultos",
		uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_id", "alimento_id" })
)
public class AlimentoOculto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "alimento_id", nullable = false)
	private Alimento alimento;

	@Column(name = "created_at", nullable = false)
	private java.time.Instant createdAt;

	protected AlimentoOculto() {
	}

	public AlimentoOculto(Usuario usuario, Alimento alimento) {
		this.usuario = usuario;
		this.alimento = alimento;
		this.createdAt = java.time.Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public Alimento getAlimento() {
		return alimento;
	}
}
