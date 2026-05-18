import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import logo from "../assets/Logo.png";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <img src={logo} alt="NutriFit" />
            </div>
            <h1 className={styles.brandName}>NutriFit</h1>
          </div>
          <div className={styles.userSection}>
            <span className={styles.userNombre}>{user?.nombre}</span>
            <button onClick={logout} className={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>
            ¡Bienvenido de vuelta, <span>{user?.nombre}</span>!
          </h2>
          <p className={styles.welcomeText}>
            Gestiona tus rutinas de ejercicio y registra tus comidas para alcanzar tus objetivos fitness.
          </p>
        </section>

        <section className={styles.cardsContainer}>
          <article 
            className={styles.card} 
            onClick={() => navigate("/entrenar")}
          >
            <div className={styles.cardIcon}>💪</div>
            <h3 className={styles.cardTitle}>Entrenar ahora</h3>
            <p className={styles.cardDescription}>
              Modo gimnasio: elegí tu rutina y registrá series con peso en tiempo real.
            </p>
            <span className={styles.cardAction}>
              Ir al entrenamiento →
            </span>
          </article>

          <article 
            className={styles.card} 
            onClick={() => navigate("/rutinas/semana")}
          >
            <div className={styles.cardIcon}>🏋️</div>
            <h3 className={styles.cardTitle}>Mis Rutinas</h3>
            <p className={styles.cardDescription}>
              Visualiza, crea y edita tus rutinas de entrenamiento personalizadas.
            </p>
            <span className={styles.cardAction}>
              Ver plan semanal →
            </span>
          </article>

          <article 
            className={styles.card} 
            onClick={() => navigate("/comidas")}
          >
            <div className={styles.cardIcon}>🥗</div>
            <h3 className={styles.cardTitle}>Mis Comidas</h3>
            <p className={styles.cardDescription}>
              Registra y revisa tu alimentación diaria para mantener una dieta balanceada.
            </p>
            <span className={styles.cardAction}>
              Ver comidas →
            </span>
          </article>
        </section>

        <section className={styles.quickStats}>
          <h3 className={styles.statsTitle}>Resumen rápido</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Rutinas creadas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Comidas registradas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Días activo</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}