package com.example.ejercicios;

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
		name = "ejercicios_ocultos",
		uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_id", "ejercicio_id" })
)
public class EjercicioOculto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ejercicio_id", nullable = false)
	private Ejercicio ejercicio;

	@Column(name = "created_at", nullable = false)
	private java.time.Instant createdAt;

	protected EjercicioOculto() {
	}

	public EjercicioOculto(Usuario usuario, Ejercicio ejercicio) {
		this.usuario = usuario;
		this.ejercicio = ejercicio;
		this.createdAt = java.time.Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public Ejercicio getEjercicio() {
		return ejercicio;
	}
}

