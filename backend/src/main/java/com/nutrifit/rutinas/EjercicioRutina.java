package com.nutrifit.rutinas;

import com.nutrifit.ejercicios.Ejercicio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "routine_exercises")
@Getter
@Setter
@NoArgsConstructor
public class EjercicioRutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routine_day_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private DiaRutina diaRutina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Ejercicio ejercicio;

    @Column(name = "target_sets", nullable = false)
    private Integer seriesObjetivo;

    @Column(name = "target_reps", nullable = false)
    private Integer repeticionesObjetivo;
}
