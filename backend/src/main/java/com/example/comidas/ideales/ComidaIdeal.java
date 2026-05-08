package com.example.comidas.ideales;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.example.usuarios.Usuario;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "comidas_ideales",
		uniqueConstraints = @UniqueConstraint(columnNames = { "usuario_id", "tipo_comida" })
)
public class ComidaIdeal {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(nullable = false, length = 120)
	private String nombre;

	@Column(nullable = true, length = 2000)
	private String descripcion;

	/** 1=Desayuno, 2=Almuerzo, 3=Merienda, 4=Cena */
	@Column(name = "tipo_comida", nullable = false)
	private int tipoComida;

	/**
	 * Columna existente en BD (NOT NULL). Se mantiene igual que {@code tipoComida} para no romper inserts.
	 */
	@Column(name = "orden", nullable = false)
	private int orden;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@OneToMany(mappedBy = "comidaIdeal", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ComidaIdealAlimento> alimentos = new ArrayList<>();

	protected ComidaIdeal() {
	}

	public ComidaIdeal(Usuario usuario, String nombre, String descripcion, int tipoComida) {
		this.usuario = usuario;
		this.nombre = nombre;
		this.descripcion = descripcion;
		this.tipoComida = tipoComida;
		this.orden = tipoComida;
	}

	@PrePersist
	void prePersist() {
		if (createdAt == null) createdAt = Instant.now();
		sincronizarOrdenConTipo();
	}

	@PreUpdate
	void preUpdate() {
		sincronizarOrdenConTipo();
	}

	private void sincronizarOrdenConTipo() {
		this.orden = this.tipoComida;
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public int getTipoComida() {
		return tipoComida;
	}

	public void setTipoComida(int tipoComida) {
		this.tipoComida = tipoComida;
		this.orden = tipoComida;
	}

	public int getOrden() {
		return orden;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public List<ComidaIdealAlimento> getAlimentos() {
		return alimentos;
	}
}

