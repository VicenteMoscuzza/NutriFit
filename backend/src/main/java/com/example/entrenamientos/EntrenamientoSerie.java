package com.example.entrenamientos;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "entrenamiento_series")
public class EntrenamientoSerie {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "entrenamiento_ejercicio_id", nullable = false)
	private EntrenamientoEjercicio entrenamientoEjercicio;

	@Column(name = "numero_serie", nullable = false)
	private int numeroSerie;

	@Column(name = "peso_kg", nullable = true, precision = 10, scale = 2)
	private BigDecimal pesoKg;

	@Column(nullable = true)
	private Integer reps;

	@Column(nullable = false)
	private boolean completada = false;

	@Column(name = "completada_at", nullable = true)
	private Instant completadaAt;

	protected EntrenamientoSerie() {
	}

	public EntrenamientoSerie(EntrenamientoEjercicio entrenamientoEjercicio, int numeroSerie, BigDecimal pesoKg) {
		this(entrenamientoEjercicio, numeroSerie, pesoKg, null);
	}

	public EntrenamientoSerie(EntrenamientoEjercicio entrenamientoEjercicio, int numeroSerie, BigDecimal pesoKg, Integer reps) {
		this.entrenamientoEjercicio = entrenamientoEjercicio;
		this.numeroSerie = numeroSerie;
		this.pesoKg = pesoKg;
		this.reps = reps;
	}

	public void setNumeroSerie(int numeroSerie) {
		this.numeroSerie = numeroSerie;
	}

	public Long getId() {
		return id;
	}

	public EntrenamientoEjercicio getEntrenamientoEjercicio() {
		return entrenamientoEjercicio;
	}

	public int getNumeroSerie() {
		return numeroSerie;
	}

	public BigDecimal getPesoKg() {
		return pesoKg;
	}

	public void setPesoKg(BigDecimal pesoKg) {
		this.pesoKg = pesoKg;
	}

	public Integer getReps() {
		return reps;
	}

	public void setReps(Integer reps) {
		this.reps = reps;
	}

	public boolean isCompletada() {
		return completada;
	}

	public void setCompletada(boolean completada) {
		this.completada = completada;
		if (completada && completadaAt == null) {
			completadaAt = Instant.now();
		} else if (!completada) {
			completadaAt = null;
		}
	}

	public Instant getCompletadaAt() {
		return completadaAt;
	}
}
