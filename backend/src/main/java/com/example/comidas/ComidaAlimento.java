package com.example.comidas;

import com.example.alimentos.Alimento;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "comida_alimentos")
public class ComidaAlimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "comida_id", nullable = false)
	private Comida comida;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "alimento_id", nullable = false)
	private Alimento alimento;

	protected ComidaAlimento() {
	}

	public ComidaAlimento(Comida comida, Alimento alimento) {
		this.comida = comida;
		this.alimento = alimento;
	}

	public Long getId() {
		return id;
	}

	public Comida getComida() {
		return comida;
	}

	public Alimento getAlimento() {
		return alimento;
	}
}

