import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  actualizarSerie,
  agregarSerie,
  eliminarSerie,
  finalizarEntrenamiento,
  getEntrenamientoActivo,
  iniciarEntrenamiento,
} from "../api/entrenamientos";
import { listRutinaPlan } from "../api/rutinaPlan";
import { listRutinas } from "../api/rutinas";
import styles from "./EntrenarPage.module.css";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function diaSemanaHoy() {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

function mergeSerieInEntrenamiento(entrenamiento, serieActualizada) {
  if (!entrenamiento) return entrenamiento;
  return {
    ...entrenamiento,
    ejercicios: entrenamiento.ejercicios.map((ej) => ({
      ...ej,
      series: ej.series.map((s) => (s.id === serieActualizada.id ? serieActualizada : s)),
    })),
  };
}

function mergeNuevaSerie(entrenamiento, ejercicioEntrenamientoId, nuevaSerie) {
  if (!entrenamiento) return entrenamiento;
  return {
    ...entrenamiento,
    ejercicios: entrenamiento.ejercicios.map((ej) =>
      ej.id === ejercicioEntrenamientoId ? { ...ej, series: [...ej.series, nuevaSerie] } : ej
    ),
  };
}

function mergeEjercicioActualizado(entrenamiento, ejercicioActualizado) {
  if (!entrenamiento) return entrenamiento;
  return {
    ...entrenamiento,
    ejercicios: entrenamiento.ejercicios.map((ej) =>
      ej.id === ejercicioActualizado.id ? ejercicioActualizado : ej
    ),
  };
}

export default function EntrenarPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entrenamiento, setEntrenamiento] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [rutinaHoy, setRutinaHoy] = useState(null);
  const [iniciandoId, setIniciandoId] = useState(null);
  const [savingSerieIds, setSavingSerieIds] = useState(() => new Set());
  const [finalizando, setFinalizando] = useState(false);
  const [drafts, setDrafts] = useState(() => new Map());

  const syncDrafts = useCallback((session) => {
    const next = new Map();
    if (!session?.ejercicios) {
      setDrafts(next);
      return;
    }
    for (const ej of session.ejercicios) {
      for (const s of ej.series) {
        next.set(s.id, {
          pesoKg: s.pesoKg != null ? String(s.pesoKg) : "",
          reps: s.reps != null ? String(s.reps) : "",
        });
      }
    }
    setDrafts(next);
  }, []);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const [activoRes, rutinasRes, planRes] = await Promise.allSettled([
        getEntrenamientoActivo(),
        listRutinas(),
        listRutinaPlan(),
      ]);

      if (activoRes.status === "fulfilled" && activoRes.value) {
        setEntrenamiento(activoRes.value);
        syncDrafts(activoRes.value);
      } else {
        setEntrenamiento(null);
        setDrafts(new Map());
      }

      if (rutinasRes.status === "fulfilled") {
        setRutinas(Array.isArray(rutinasRes.value) ? rutinasRes.value : []);
      }

      if (planRes.status === "fulfilled") {
        const hoy = diaSemanaHoy();
        const items = Array.isArray(planRes.value) ? planRes.value : [];
        const itemHoy = items.find((x) => x.diaSemana === hoy);
        setRutinaHoy(itemHoy?.rutina ?? null);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "No se pudo cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [syncDrafts]);

  const progreso = useMemo(() => {
    if (!entrenamiento?.ejercicios?.length) return { done: 0, total: 0, pct: 0 };
    let done = 0;
    let total = 0;
    for (const ej of entrenamiento.ejercicios) {
      for (const s of ej.series) {
        total++;
        if (s.completada) done++;
      }
    }
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [entrenamiento]);

  async function onIniciar(rutinaId) {
    setError("");
    setIniciandoId(rutinaId);
    try {
      const session = await iniciarEntrenamiento(rutinaId);
      setEntrenamiento(session);
      syncDrafts(session);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.message || "No se pudo iniciar";
      if (msg.includes("en curso")) {
        try {
          const activo = await getEntrenamientoActivo();
          if (activo) {
            setEntrenamiento(activo);
            syncDrafts(activo);
            return;
          }
        } catch {
          /* ignore */
        }
      }
      setError(msg);
    } finally {
      setIniciandoId(null);
    }
  }

  function setDraft(serieId, field, value) {
    setDrafts((prev) => {
      const next = new Map(prev);
      const cur = next.get(serieId) ?? { pesoKg: "", reps: "" };
      next.set(serieId, { ...cur, [field]: value });
      return next;
    });
  }

  async function persistSerie(serie, completadaOverride) {
    const draft = drafts.get(serie.id) ?? { pesoKg: "", reps: "" };
    const pesoRaw = draft.pesoKg.trim();
    const repsRaw = draft.reps.trim();
    const payload = {
      pesoKg: pesoRaw === "" ? null : Number(pesoRaw),
      reps: repsRaw === "" ? null : Number(repsRaw),
    };
    if (completadaOverride !== undefined) {
      payload.completada = completadaOverride;
    }

    setSavingSerieIds((prev) => new Set(prev).add(serie.id));
    try {
      const saved = await actualizarSerie(serie.id, payload);
      setEntrenamiento((prev) => mergeSerieInEntrenamiento(prev, saved));
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "No se pudo guardar la serie");
    } finally {
      setSavingSerieIds((prev) => {
        const next = new Set(prev);
        next.delete(serie.id);
        return next;
      });
    }
  }

  async function onToggleCompletada(serie) {
    await persistSerie(serie, !serie.completada);
  }

  async function onEliminarSerie(serie) {
    const ok = window.confirm(`¿Eliminar la serie ${serie.numeroSerie}?`);
    if (!ok) return;
    setError("");
    setSavingSerieIds((prev) => new Set(prev).add(serie.id));
    try {
      const ejercicioActualizado = await eliminarSerie(serie.id);
      setEntrenamiento((prev) => mergeEjercicioActualizado(prev, ejercicioActualizado));
      setDrafts((prev) => {
        const next = new Map(prev);
        next.delete(serie.id);
        for (const s of ejercicioActualizado.series) {
          next.set(s.id, {
            pesoKg: s.pesoKg != null ? String(s.pesoKg) : "",
            reps: s.reps != null ? String(s.reps) : "",
          });
        }
        return next;
      });
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "No se pudo eliminar la serie");
    } finally {
      setSavingSerieIds((prev) => {
        const next = new Set(prev);
        next.delete(serie.id);
        return next;
      });
    }
  }

  async function onAddSerie(ejercicioEntrenamientoId) {
    setError("");
    try {
      const nueva = await agregarSerie(ejercicioEntrenamientoId);
      setEntrenamiento((prev) => mergeNuevaSerie(prev, ejercicioEntrenamientoId, nueva));
      setDrafts((prev) => {
        const next = new Map(prev);
        next.set(nueva.id, {
          pesoKg: nueva.pesoKg != null ? String(nueva.pesoKg) : "",
          reps: nueva.reps != null ? String(nueva.reps) : "",
        });
        return next;
      });
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "No se pudo añadir la serie");
    }
  }

  async function onFinalizar() {
    if (!entrenamiento?.id) return;
    const ok = window.confirm("¿Finalizar este entrenamiento?");
    if (!ok) return;
    setFinalizando(true);
    setError("");
    try {
      await finalizarEntrenamiento(entrenamiento.id);
      setEntrenamiento(null);
      setDrafts(new Map());
      navigate("/rutinas/semana");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "No se pudo finalizar");
    } finally {
      setFinalizando(false);
    }
  }

  const nombreDia = DIAS[new Date().getDay()];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className={styles.title}>{entrenamiento ? entrenamiento.rutinaNombre : "Entrenar"}</h1>
          <div style={{ width: 44 }} aria-hidden="true" />
        </div>
      </header>

      <main className={styles.main}>
        {error ? <div className={styles.error}>{error}</div> : null}

        {loading ? (
          <p className={styles.loading}>Cargando…</p>
        ) : entrenamiento ? (
          <>
            <section className={styles.sessionHeader}>
              <h2 className={styles.sessionRutina}>{entrenamiento.rutinaNombre}</h2>
              <p className={styles.sessionMeta}>
                {progreso.done} / {progreso.total} series completadas
              </p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progreso.pct}%` }} />
              </div>
            </section>

            {entrenamiento.ejercicios.map((ej) => (
              <article key={ej.id} className={styles.ejercicioCard}>
                <h3 className={styles.ejercicioName}>{ej.nombre}</h3>
                <div className={styles.seriesHeader}>
                  <span>#</span>
                  <span>Peso (kg)</span>
                  <span>Reps</span>
                  <span>✓</span>
                  <span aria-hidden="true" />
                </div>
                {ej.series.map((s) => {
                  const draft = drafts.get(s.id) ?? { pesoKg: "", reps: "" };
                  const saving = savingSerieIds.has(s.id);
                  return (
                    <div key={s.id} className={styles.serieRow}>
                      <span className={styles.serieNum}>{s.numeroSerie}</span>
                      <input
                        className={styles.serieInput}
                        type="number"
                        min="0"
                        step="0.25"
                        inputMode="decimal"
                        placeholder="kg"
                        value={draft.pesoKg}
                        disabled={saving}
                        onChange={(e) => setDraft(s.id, "pesoKg", e.target.value)}
                        onBlur={() => persistSerie(s)}
                      />
                      <input
                        className={styles.serieInput}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        placeholder="reps"
                        value={draft.reps}
                        disabled={saving}
                        onChange={(e) => setDraft(s.id, "reps", e.target.value)}
                        onBlur={() => persistSerie(s)}
                      />
                      <button
                        type="button"
                        className={`${styles.checkBtn} ${s.completada ? styles.checkBtnDone : ""}`}
                        onClick={() => onToggleCompletada(s)}
                        disabled={saving}
                        aria-label={s.completada ? "Serie completada" : "Marcar serie completada"}
                      >
                        {s.completada ? "✓" : "○"}
                      </button>
                      <button
                        type="button"
                        className={styles.deleteSerieBtn}
                        onClick={() => onEliminarSerie(s)}
                        disabled={saving}
                        aria-label={`Eliminar serie ${s.numeroSerie}`}
                        title="Eliminar serie"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className={styles.addSerieBtn}
                  onClick={() => onAddSerie(ej.id)}
                >
                  + Añadir serie
                </button>
              </article>
            ))}
          </>
        ) : (
          <>
            <p className={styles.subtitle}>
              Elegí una rutina y registrá cada serie con su peso mientras entrenás.
            </p>

            {rutinaHoy ? (
              <section className={styles.hoyCard}>
                <p className={styles.hoyLabel}>Hoy — {nombreDia}</p>
                <p className={styles.hoyName}>{rutinaHoy.nombre}</p>
                <button
                  type="button"
                  className={styles.finalizarBtn}
                  disabled={iniciandoId != null}
                  onClick={() => onIniciar(rutinaHoy.id)}
                >
                  {iniciandoId === rutinaHoy.id ? "Iniciando…" : "Empezar rutina de hoy"}
                </button>
              </section>
            ) : null}

            {rutinas.length === 0 ? (
              <p className={styles.empty}>No tenés rutinas. Creá una en el plan semanal.</p>
            ) : (
              <ul className={styles.rutinaList}>
                {rutinas.map((r) => {
                  const count = Array.isArray(r.ejercicios) ? r.ejercicios.length : 0;
                  const esHoy = rutinaHoy?.id === r.id;
                  if (esHoy && rutinaHoy) return null;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        className={styles.rutinaBtn}
                        disabled={iniciandoId != null}
                        onClick={() => onIniciar(r.id)}
                      >
                        <span className={styles.rutinaBtnName}>{r.nombre}</span>
                        <span className={styles.rutinaBtnMeta}>
                          {count} ejercicio{count !== 1 ? "s" : ""}
                          {iniciandoId === r.id ? " — iniciando…" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>

      {entrenamiento ? (
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <button
              type="button"
              className={styles.finalizarBtn}
              disabled={finalizando}
              onClick={onFinalizar}
            >
              {finalizando ? "Finalizando…" : "Finalizar entrenamiento"}
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
