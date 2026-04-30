import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import logo from "../../assets/Logo.png"
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
  
    try {
      await api.post("/api/usuarios", {
        nombre,
        email,
        password,
        fechaNacimiento,
      });
  
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || "Error inesperado";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img src={logo} alt="NutriFit" />
          </div>
          <h1 className={styles.brand}>NutriFit</h1>
          <p className={styles.tagline}>Comienza tu transformación hoy</p>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <h2 className={styles.title}>Crear Cuenta</h2>
          
          <div className={styles.field}>
            <label className={styles.label}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Nombre completo
            </label>
            <input
              className={styles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </label>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
            <span className={styles.hint}>Usa al menos 8 caracteres</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Fecha de nacimiento
            </label>
            <input
              className={styles.input}
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              type="date"
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? (
              <span className={styles.spinner}></span>
            ) : (
              <>
                Crear cuenta
                <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tenés cuenta? <Link to="/login" className={styles.link}>Iniciar sesión</Link>
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Planes personalizados</span>
          </div>
          <div className={styles.feature}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Seguimiento de progreso</span>
          </div>
          <div className={styles.feature}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Comunidad activa</span>
          </div>
        </div>

        <div className={styles.decoration}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
      </div>
    </div>
  );
}
