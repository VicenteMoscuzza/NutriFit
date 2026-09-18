package com.nutrifit.entrenamiento;

import com.nutrifit.rutinas.EjercicioRutina;
import com.nutrifit.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "logged_sets")
@Getter
@Setter
@NoArgsConstructor
public class SerieEntrenamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routine_exercise_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private EjercicioRutina ejercicioRutina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @Column(name = "log_date", nullable = false)
    private LocalDate fecha;

    @Column(name = "set_number", nullable = false)
    private Integer numeroSerie;

    @Column(name = "weight_kg", nullable = false)
    private Double pesoKg;

    @Column(name = "reps", nullable = false)
    private Integer repeticiones;
}
