package com.example.ejercicios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {
	List<Ejercicio> findAllByOrderByNombreAsc();
}

