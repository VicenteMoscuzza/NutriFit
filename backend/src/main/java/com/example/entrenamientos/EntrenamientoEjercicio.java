package com.example.entrenamientos;

import java.util.ArrayList;
import java.util.List;

import com.example.ejercicios.Ejercicio;

import org.hibernate.annotations.BatchSize;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "entrenamiento_ejercicios")
public class EntrenamientoEjercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "entrenamiento_id", nullable = false)
	private Entrenamiento entrenamiento;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ejercicio_id", nullable = false)
	private Ejercicio ejercicio;

	@Column(nullable = false)
	private int orden;

	@OneToMany(mappedBy = "entrenamientoEjercicio", cascade = CascadeType.ALL, orphanRemoval = true)
	@BatchSize(size = 50)
	private List<EntrenamientoSerie> series = new ArrayList<>();

	protected EntrenamientoEjercicio() {
	}

	public EntrenamientoEjercicio(Entrenamiento entrenamiento, Ejercicio ejercicio, int orden) {
		this.entrenamiento = entrenamiento;
		this.ejercicio = ejercicio;
		this.orden = orden;
	}

	public Long getId() {
		return id;
	}

	public Entrenamiento getEntrenamiento() {
		return entrenamiento;
	}

	public Ejercicio getEjercicio() {
		return ejercicio;
	}

	public int getOrden() {
		return orden;
	}

	public List<EntrenamientoSerie> getSeries() {
		return series;
	}
}
