import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/Logo.png"
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // limpiar error anterior
    try {
      await login({ identifier, password });
      navigate("/", { replace: true });
    } catch (err) {
      // El backend debería devolver un mensaje en err.response.data.message
      setError(err.response?.data?.message || "Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img 
              src={logo}
              alt="NutriFit"

            />
          </div>
          <h1 className={styles.brand}>NutriFit</h1>
          <p className={styles.tagline}>Tu camino hacia una vida más saludable</p>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <h2 className={styles.title}>Iniciar Sesión</h2>
          
          <div className={styles.field}>
            <label className={styles.label}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Email o nombre de usuario
            </label>
            <input
              className={styles.input}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Contraseña
            </label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className={styles.error}>{error}</p>
          )}
          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              <>
                Entrar
                <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className={styles.footer}>
          ¿No tenés cuenta? <Link to="/register" className={styles.link}>Registrate</Link>
        </p>

        <div className={styles.decoration}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
      </div>
    </div>
  );
}
