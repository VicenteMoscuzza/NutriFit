import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { deleteRutina, listRutinas } from "../api/rutinas";
import { addRutinaToDia, listRutinaPlan, removeRutinaPlanItem } from "../api/rutinaPlan";
import { listRegistrosEjercicios, upsertRegistroEjercicio } from "../api/registrosEjercicios";
import styles from "./PlanRutinasPage.module.css";
import ui from "./ListForm.module.css";
import logo from "../assets/Logo.png";

const DIAS = [
  { n: 1, label: "Lunes" },
  { n: 2, label: "Martes" },
  { n: 3, label: "Miércoles" },
  { n: 4, label: "Jueves" },
  { n: 5, label: "Viernes" },
  { n: 6, label: "Sábado" },
  { n: 7, label: "Domingo" },
];

export default function PlanRutinasPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [rutinas, setRutinas] = useState([]);
  const [plan, setPlan] = useState([]); // items: {id, diaSemana, rutina: {id,nombre,descripcion}}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingDia, setAddingDia] = useState(() => new Map()); // diaSemana -> rutinaId (string)
  const [savingDia, setSavingDia] = useState(() => new Set()); // diaSemana currently saving

  const [openRutinaIds, setOpenRutinaIds] = useState(() => new Set()); // "ver ejercicios"

  const [registrosByEjercicioId, setRegistrosByEjercicioId] = useState(() => new Map());
  const [showRutinaModal, setShowRutinaModal] = useState(false);
  const [modalRutina, setModalRutina] = useState(null);
  const [pesoDraftByEjercicioId, setPesoDraftByEjercicioId] = useState(() => new Map());
  const [savingPesoIds, setSavingPesoIds] = useState(() => new Set());

  const planPorDia = useMemo(() => {
    const map = new Map();
    for (const d of DIAS) map.set(d.n, []);
    for (const item of plan) {
      if (!map.has(item.diaSemana)) map.set(item.diaSemana, []);
      map.get(item.diaSemana).push(item);
    }
    return map;
  }, [plan]);

  async function refresh() {
    setError("");
    setLoading(true);
    const results = await Promise.allSettled([listRutinas(), listRutinaPlan(), listRegistrosEjercicios()]);

    const [rutinasRes, planRes, registrosRes] = results;

    if (rutinasRes.status === "fulfilled") {
      setRutinas(Array.isArray(rutinasRes.value) ? rutinasRes.value : []);
    } else {
      setRutinas([]);
      const e = rutinasRes.reason;
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          `No se pudieron cargar tus rutinas${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`
      );
    }

    if (planRes.status === "fulfilled") {
      setPlan(Array.isArray(planRes.value) ? planRes.value : []);
    } else {
      setPlan([]);
      const e = planRes.reason;
      setError((prev) => {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          `No se pudo cargar tu plan semanal${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`;
        return prev ? `${prev}\n${msg}` : msg;
      });
    }

    if (registrosRes.status === "fulfilled") {
      const map = new Map();
      const registros = registrosRes.value;
      if (Array.isArray(registros)) {
        for (const r of registros) {
          if (r && r.ejercicioId != null) map.set(Number(r.ejercicioId), r);
        }
      }
      setRegistrosByEjercicioId(map);
    } else {
      setRegistrosByEjercicioId(new Map());
      // No lo tratamos como un error fatal: el plan y las rutinas pueden funcionar igual.
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd(diaSemana, rutinaIdArg) {
    const rutinaIdRaw = rutinaIdArg ?? addingDia.get(diaSemana);
    const rutinaId = Number(rutinaIdRaw);
    if (!rutinaId) return;

    const items = planPorDia.get(diaSemana) ?? [];
    // Si ya está asignada esa misma rutina, no hacemos nada.
    if (items.some((x) => Number(x?.rutina?.id) === rutinaId)) {
      setAddingDia((prev) => {
        const next = new Map(prev);
        next.set(diaSemana, "");
        return next;
      });
      return;
    }

    setError("");
    try {
      setSavingDia((prev) => {
        const next = new Set(prev);
        next.add(diaSemana);
        return next;
      });

      // Regla: 1 rutina por día. Si ya hay una, la reemplazamos.
      if (items.length > 0) {
        await Promise.all(items.map((it) => removeRutinaPlanItem(it.id)));
        setPlan((prev) => prev.filter((x) => x.diaSemana !== diaSemana));
      }

      const created = await addRutinaToDia({ diaSemana, rutinaId });
      setPlan((prev) => [...prev, created]);
      setAddingDia((prev) => {
        const next = new Map(prev);
        next.set(diaSemana, "");
        return next;
      });
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.detail ||
        "No se pudo guardar la rutina de ese día";
      setError(msg);
    } finally {
      setSavingDia((prev) => {
        const next = new Set(prev);
        next.delete(diaSemana);
        return next;
      });
    }
  }

  async function onRemove(itemId) {
    setError("");
    try {
      await removeRutinaPlanItem(itemId);
      setPlan((prev) => prev.filter((x) => x.id !== itemId));
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.detail ||
        "No se pudo quitar la rutina de ese día";
      setError(msg);
    }
  }

  function toggleOpenRutina(rutinaId) {
    setOpenRutinaIds((prev) => {
      const next = new Set(prev);
      if (next.has(rutinaId)) next.delete(rutinaId);
      else next.add(rutinaId);
      return next;
    });
  }

  function openRutinaDetalle(rutina) {
    setModalRutina(rutina ?? null);
    setPesoDraftByEjercicioId(() => {
      const next = new Map();
      const ejercicios = Array.isArray(rutina?.ejercicios) ? rutina.ejercicios : [];
      for (const ej of ejercicios) {
        const r = registrosByEjercicioId.get(Number(ej.id));
        const val = r?.ultimoPesoMaxKg;
        next.set(Number(ej.id), val == null ? "" : String(val));
      }
      return next;
    });
    setShowRutinaModal(true);
  }

  function closeRutinaDetalle() {
    setShowRutinaModal(false);
    setModalRutina(null);
    setPesoDraftByEjercicioId(new Map());
    setSavingPesoIds(new Set());
  }

  async function onSavePeso(ejercicioId) {
    const id = Number(ejercicioId);
    if (!id) return;
    setError("");
    setSavingPesoIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      const raw = (pesoDraftByEjercicioId.get(id) ?? "").trim();
      const payload = { ultimoPesoMaxKg: raw === "" ? null : Number(raw) };
      const saved = await upsertRegistroEjercicio(id, payload);
      setRegistrosByEjercicioId((prev) => {
        const next = new Map(prev);
        next.set(Number(saved.ejercicioId), saved);
        return next;
      });
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        "No se pudo guardar el peso del ejercicio";
      setError(msg);
    } finally {
      setSavingPesoIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function onDeleteRutina(r) {
    const ok = window.confirm(`¿Eliminar la rutina "${r.nombre}"?`);
    if (!ok) return;
    setError("");
    try {
      await deleteRutina(r.id);
      await refresh();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "No se pudo eliminar la rutina";
      setError(msg);
    }
  }

  function IconEye({ className }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2.2 12c1.7-4.6 6-8 9.8-8s8.1 3.4 9.8 8c-1.7 4.6-6 8-9.8 8s-8.1-3.4-9.8-8Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  function IconPencil({ className }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L15.5 3.5a2.1 2.1 0 0 0-3 0L2 14v6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M13.5 5.5 18.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  function IconTrash({ className }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 4h6m-9 3h12m-1 0-1 14H8L7 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 11v7M14 11v7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  useEffect(() => {
    if (!showRutinaModal) return;
    function onKeyDown(e) {
      if (e.key === "Escape") closeRutinaDetalle();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRutinaModal]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.left}>
            <button className={styles.backBtn} onClick={() => navigate("/")}>
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
        <h2 className={styles.title}>Plan semanal</h2>
        <p className={styles.subtitle}>
          Elegí un día y agregá una de tus rutinas. Podés repetir rutinas en distintos días.
        </p>

        <section className={styles.panel}>
          {error && <div className={styles.error}>{error}</div>}

          {loading ? <p className={styles.empty}>Cargando...</p> : null}

          <div className={styles.weekGrid} aria-busy={loading ? "true" : "false"}>
            {DIAS.map((d) => {
              const items = planPorDia.get(d.n) ?? [];
              const selected = addingDia.get(d.n) ?? "";
              const isSaving = savingDia.has(d.n);
              const canAdd = !loading && rutinas.length > 0 && !isSaving;
              return (
                <div key={d.n} className={styles.dayCol}>
                  <div className={styles.dayHeader}>
                    <h3 className={styles.dayTitle}>{d.label}</h3>
                    <span className={styles.dayCount}>{items.length}</span>
                  </div>

                  <div className={styles.addRow}>
                    <select
                      className={styles.select}
                      value={selected}
                      disabled={!canAdd}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddingDia((prev) => {
                          const next = new Map(prev);
                          next.set(d.n, val);
                          return next;
                        });
                        if (val) onAdd(d.n, val);
                      }}
                    >
                      <option value="">
                        {rutinas.length === 0 ? "Creá una rutina abajo…" : "Elegí una rutina…"}
                      </option>
                      {rutinas.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                    {isSaving ? <span className={styles.saving}>Guardando…</span> : null}
                  </div>

                  {items.length === 0 ? (
                    <p className={styles.empty}>Descanso</p>
                  ) : (
                    <ul className={styles.list}>
                      {items.map((it) => (
                        <li key={it.id} className={styles.item}>
                          <div className={styles.itemTop}>
                            <p className={styles.itemName}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                style={{
                                  width: "auto",
                                  height: "auto",
                                  padding: "6px 10px",
                                  borderRadius: 10,
                                  fontWeight: 900,
                                }}
                                onClick={() => openRutinaDetalle(it.rutina)}
                                title="Ver y editar pesos"
                              >
                                {it.rutina?.nombre ?? "Rutina"}
                              </button>
                            </p>
                            <button className={styles.removeBtn} type="button" onClick={() => onRemove(it.id)}>
                              Quitar
                            </button>
                          </div>
                          {it.rutina?.descripcion && <p className={styles.itemDesc}>{it.rutina.descripcion}</p>}
                          {Array.isArray(it.rutina?.ejercicios) && it.rutina.ejercicios.length > 0 ? (
                            <ul className={styles.exerciseList}>
                              {it.rutina.ejercicios.map((ej) => (
                                <li key={ej.id} className={styles.exerciseItem}>
                                  <span className={styles.exerciseName}>{ej.nombre}</span>
                                  {ej.descripcion ? (
                                    <span className={styles.exerciseDesc}> — {ej.descripcion}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {showRutinaModal ? (
          <div
            className={ui.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de rutina"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeRutinaDetalle();
            }}
          >
            <div className={`${ui.modal} ${styles.rutinaModal}`} onMouseDown={(e) => e.stopPropagation()}>
              <div className={ui.modalHeader}>
                <p className={ui.modalTitle}>{modalRutina?.nombre ?? "Rutina"}</p>
                <button className={ui.modalClose} type="button" onClick={closeRutinaDetalle}>
                  ✕
                </button>
              </div>
              <div className={`${ui.modalBody} ${styles.rutinaModalBody}`}>
                {modalRutina?.descripcion ? <p className={ui.exerciseCardDesc}>{modalRutina.descripcion}</p> : null}
                <div className={ui.divider} />

                {Array.isArray(modalRutina?.ejercicios) && modalRutina.ejercicios.length > 0 ? (
                  <div className={`${ui.exerciseGrid} ${styles.rutinaExerciseGrid}`}>
                    {modalRutina.ejercicios.map((ej) => {
                      const id = Number(ej.id);
                      const registro = registrosByEjercicioId.get(id);
                      const draft = pesoDraftByEjercicioId.get(id) ?? "";
                      const saving = savingPesoIds.has(id);
                      return (
                        <div
                          key={ej.id}
                          className={`${ui.exerciseCard} ${styles.rutinaExerciseCard}`}
                          style={{ cursor: "default" }}
                        >
                          <div className={ui.exerciseCardTop}>
                            <div className={ui.exerciseCardTitle}>{ej.nombre}</div>
                            <div className={ui.exerciseCardMark} aria-hidden="true">
                              kg
                            </div>
                          </div>

                          {ej.descripcion ? <p className={ui.exerciseCardDesc}>{ej.descripcion}</p> : null}
                          <p className={ui.exerciseCardDesc}>
                            Último guardado: <b>{registro?.ultimoPesoMaxKg != null ? `${registro.ultimoPesoMaxKg} kg` : "—"}</b>
                          </p>

                          <label className={ui.label}>
                            Editar peso máx (kg)
                            <input
                              className={`${ui.input} ${styles.rutinaExerciseInput}`}
                              type="number"
                              min="0"
                              step="0.25"
                              value={draft}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPesoDraftByEjercicioId((prev) => {
                                  const next = new Map(prev);
                                  next.set(id, val);
                                  return next;
                                });
                              }}
                              placeholder="Ej: 100"
                              disabled={saving}
                            />
                          </label>

                          <div className={ui.itemActions} style={{ marginTop: 8 }}>
                            <button className={ui.secondary} type="button" onClick={() => onSavePeso(id)} disabled={saving}>
                              {saving ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={ui.empty}>Esta rutina no tiene ejercicios todavía.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <section className={styles.panel} style={{ marginTop: 16 }}>
          <div className={styles.rutinasHeader}>
            <div>
              <h3 className={styles.rutinasTitle}>Rutinas creadas</h3>
              <p className={styles.rutinasSubtitle}>
                Revisá tus rutinas antes de asignarlas (ver ejercicios, editar o eliminar).
              </p>
            </div>
            <button className={styles.rutinasAddBtn} type="button" onClick={() => navigate("/rutinas/nueva")}>
              + Nueva rutina
            </button>
          </div>

          {loading ? null : rutinas.length === 0 ? (
            <p className={styles.empty}>Todavía no tenés rutinas creadas.</p>
          ) : (
            <ul className={styles.rutinasList}>
              {rutinas.map((r) => {
                const open = openRutinaIds.has(r.id);
                const hasEj = Array.isArray(r.ejercicios) && r.ejercicios.length > 0;
                return (
                  <li key={r.id} className={styles.rutinaCard}>
                    <div className={styles.rutinaTop}>
                      <div className={styles.rutinaInfo}>
                        <p className={styles.rutinaName}>{r.nombre}</p>
                        {r.descripcion ? <p className={styles.rutinaDesc}>{r.descripcion}</p> : null}
                      </div>

                      <div className={styles.rutinaActions}>
                        <button
                          className={styles.iconBtn}
                          type="button"
                          onClick={() => toggleOpenRutina(r.id)}
                          aria-label={open ? "Ocultar ejercicios" : "Ver ejercicios"}
                          title={open ? "Ocultar ejercicios" : "Ver ejercicios"}
                        >
                          <IconEye className={styles.icon} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          type="button"
                          onClick={() => navigate(`/rutinas/nueva?edit=${encodeURIComponent(String(r.id))}`)}
                          aria-label="Editar"
                          title="Editar"
                        >
                          <IconPencil className={styles.icon} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconDanger}`}
                          type="button"
                          onClick={() => onDeleteRutina(r)}
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <IconTrash className={styles.icon} />
                        </button>
                      </div>
                    </div>

                    {open ? (
                      hasEj ? (
                        <ul className={styles.rutinaEjList}>
                          {r.ejercicios.map((ej) => (
                            <li key={ej.id} className={styles.rutinaEjItem}>
                              <span className={styles.rutinaEjName}>{ej.nombre}</span>
                              {ej.descripcion ? <span className={styles.rutinaEjDesc}> — {ej.descripcion}</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.empty} style={{ marginTop: 8 }}>
                          Esta rutina no tiene ejercicios todavía.
                        </p>
                      )
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

