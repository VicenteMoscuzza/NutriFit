package com.example.entrenamientos;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.example.rutinas.Rutina;
import com.example.usuarios.Usuario;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "entrenamientos")
public class Entrenamiento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "rutina_id", nullable = false)
	private Rutina rutina;

	@Column(name = "started_at", nullable = false)
	private Instant startedAt;

	@Column(name = "finished_at", nullable = true)
	private Instant finishedAt;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private EstadoEntrenamiento estado = EstadoEntrenamiento.EN_CURSO;

	@OneToMany(mappedBy = "entrenamiento", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<EntrenamientoEjercicio> ejercicios = new ArrayList<>();

	protected Entrenamiento() {
	}

	public Entrenamiento(Usuario usuario, Rutina rutina) {
		this.usuario = usuario;
		this.rutina = rutina;
	}

	@PrePersist
	void prePersist() {
		if (startedAt == null) startedAt = Instant.now();
		if (estado == null) estado = EstadoEntrenamiento.EN_CURSO;
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

	public Instant getStartedAt() {
		return startedAt;
	}

	public Instant getFinishedAt() {
		return finishedAt;
	}

	public void setFinishedAt(Instant finishedAt) {
		this.finishedAt = finishedAt;
	}

	public EstadoEntrenamiento getEstado() {
		return estado;
	}

	public void setEstado(EstadoEntrenamiento estado) {
		this.estado = estado;
	}

	public List<EntrenamientoEjercicio> getEjercicios() {
		return ejercicios;
	}
}
