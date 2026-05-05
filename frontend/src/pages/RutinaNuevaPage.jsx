import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./SectionPage.module.css";
import RutinasCrud from "../components/RutinasCrud";
import logo from "../assets/Logo.png";

export default function RutinaNuevaPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.left}>
            <button className={styles.backBtn} onClick={() => navigate("/rutinas/semana")}>
              ← Volver
            </button>

            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <img src={logo} alt="NutriFit" />
              </div>
              <h1 className={styles.brandName}>NutriFit</h1>
            </div>
          </div>

          <div className={styles.userSection}>
            <span className={styles.userEmail}>{user?.email}</span>
            <button onClick={logout} className={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>Nueva rutina</h2>
        <p className={styles.subtitle}>Completá el formulario para crear una rutina y asignarla en tu plan semanal.</p>

        <section className={styles.panel}>
          <RutinasCrud mode="createOnly" onDone={() => navigate("/rutinas/semana")} />
        </section>
      </main>
    </div>
  );
}

