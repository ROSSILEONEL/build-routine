import { useState } from 'react';
import GruposMusculares from './components/GruposMusculares.jsx';

const USERS_KEY = 'build-routine-users';
const ACTIVE_USER_KEY = 'build-routine-active-user';

const goalLabels = {
  strength: 'Ganar fuerza',
  muscle: 'Ganar masa muscular',
  lose: 'Bajar de peso',
  wellness: 'Mejorar mi salud',
};

const planTemplates = {
  strength: [
    {
      name: 'Día A · Fuerza',
      focus: 'Movimientos principales · descansos largos',
      exercises: [
        ['🏋️', 'Sentadilla con barra', '4', '5', '2-3 min'],
        ['🛋️', 'Press de banca', '4', '5', '2-3 min'],
        ['🧗', 'Remo con barra', '3', '6-8', '2 min'],
        ['🧍', 'Press militar', '3', '6', '2 min'],
      ],
    },
    {
      name: 'Día B · Fuerza',
      focus: 'Cadena posterior · técnica controlada',
      exercises: [
        ['⚡', 'Peso muerto', '4', '4-6', '3 min'],
        ['🦵', 'Prensa de piernas', '3', '6-8', '2 min'],
        ['🧲', 'Jalón al pecho', '3', '6-8', '2 min'],
        ['💪', 'Fondos asistidos', '3', '6-8', '90 seg'],
      ],
    },
  ],
  muscle: [
    {
      name: 'Día A · Tren superior',
      focus: 'Volumen equilibrado · controlá cada repetición',
      exercises: [
        ['🛋️', 'Press de banca', '3', '8-12', '90 seg'],
        ['🧗', 'Remo con mancuerna', '3', '10-12 por lado', '60-90 seg'],
        ['🧍', 'Press de hombros', '3', '10-12', '60-90 seg'],
        ['💪', 'Curl de bíceps', '3', '12-15', '60 seg'],
      ],
    },
    {
      name: 'Día B · Tren inferior',
      focus: 'Piernas y glúteos · rango completo',
      exercises: [
        ['🏋️', 'Sentadilla', '3', '10-12', '90 seg'],
        ['🚶', 'Zancadas', '3', '10 por pierna', '60-90 seg'],
        ['⚡', 'Peso muerto rumano', '3', '10', '90 seg'],
        ['🦶', 'Elevaciones de talones', '3', '15', '60 seg'],
      ],
    },
  ],
  lose: [
    {
      name: 'Día A · Circuito completo',
      focus: 'Ritmo constante · descansá lo necesario',
      exercises: [
        ['🏋️', 'Sentadilla con mancuerna', '3', '12', '60 seg'],
        ['🛋️', 'Press inclinado', '3', '12', '60 seg'],
        ['🧗', 'Remo en polea', '3', '12', '60 seg'],
        ['🚶', 'Zancadas alternas', '3', '10 por pierna', '60 seg'],
      ],
    },
    {
      name: 'Día B · Circuito completo',
      focus: 'Movimientos compuestos · técnica primero',
      exercises: [
        ['⚡', 'Peso muerto rumano', '3', '12', '60 seg'],
        ['🧍', 'Press de hombros', '3', '12', '60 seg'],
        ['🧲', 'Jalón al pecho', '3', '12', '60 seg'],
        ['🦶', 'Puente de glúteos', '3', '15', '60 seg'],
      ],
    },
  ],
  wellness: [
    {
      name: 'Día A · Movimiento',
      focus: 'Empezá cómodo y priorizá una buena postura',
      exercises: [
        ['🏋️', 'Sentadilla a banco', '2', '10', '90 seg'],
        ['🛋️', 'Press de pecho con mancuernas', '2', '10', '90 seg'],
        ['🧗', 'Remo sentado', '2', '10', '90 seg'],
        ['🦶', 'Elevaciones de talones', '2', '12', '60 seg'],
      ],
    },
    {
      name: 'Día B · Movimiento',
      focus: 'Movilidad y fuerza general',
      exercises: [
        ['🚶', 'Step-up bajo', '2', '8 por pierna', '90 seg'],
        ['⚡', 'Puente de glúteos', '2', '12', '90 seg'],
        ['🧍', 'Press de hombros sentado', '2', '10', '90 seg'],
        ['🧲', 'Jalón al pecho', '2', '10', '90 seg'],
      ],
    },
  ],
};

function createPlan(goal) {
  return planTemplates[goal].map((routine) => ({
    ...routine,
    id: crypto.randomUUID(),
    exercises: routine.exercises.map(([icon, name, sets, reps, rest]) => ({
      id: crypto.randomUUID(),
      icon,
      name,
      sets,
      reps,
      rest,
      weight: '',
      completed: false,
    })),
  }));
}

function loadSavedState() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
    return {
      users: users && typeof users === 'object' && !Array.isArray(users) ? users : {},
      activeUserId: activeUserId && users?.[activeUserId] ? activeUserId : null,
    };
  } catch (error) {
    console.error('No se pudo leer la información guardada del navegador.', error);
    return { users: {}, activeUserId: null };
  }
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Este navegador no permite proteger la contraseña. Usá una conexión segura o actualizá el navegador.');
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Secciones de la barra inferior (celular). Cada ícono es un trazo SVG simple.
const MOBILE_SECTIONS = [
  { id: 'inicio', label: 'Inicio', icon: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z' },
  { id: 'mi-rutina', label: 'Mi rutina', icon: 'M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12' },
  { id: 'progreso', label: 'Progreso', icon: 'M4 19h16M6 15l4-4 3 3 5-6' },
  { id: 'grupos', label: 'Grupos', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
];

function BottomNav({ active, onSelect }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {MOBILE_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id}
          onClick={() => onSelect(section.id)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={section.icon} /></svg>
          {section.label}
        </a>
      ))}
    </nav>
  );
}

function App() {
  const [savedState] = useState(loadSavedState);
  const [users, setUsers] = useState(savedState.users);
  const [activeUserId, setActiveUserId] = useState(savedState.activeUserId);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState('inicio');

  const user = activeUserId ? users[activeUserId] : null;
  const selectedRoutine = user?.routines.find((routine) => routine.id === selectedRoutineId)
    || user?.routines[0];
  const completedCount = user?.routines.reduce(
    (total, routine) => total + routine.exercises.filter((exercise) => exercise.completed).length,
    0,
  ) || 0;
  const exerciseCount = user?.routines.reduce((total, routine) => total + routine.exercises.length, 0) || 0;

  function persistUsers(nextUsers) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      setUsers(nextUsers);
      return true;
    } catch (error) {
      console.error('No se pudieron guardar los cambios en el navegador.', error);
      setNotice('No se pudieron guardar los cambios. Revisá el espacio disponible en el navegador.');
      return false;
    }
  }

  function beginSession(userId) {
    try {
      localStorage.setItem(ACTIVE_USER_KEY, userId);
      setActiveUserId(userId);
      setSelectedRoutineId('');
      setNotice('');
    } catch (error) {
      console.error('No se pudo iniciar la sesión en este navegador.', error);
      setAuthError('No se pudo mantener la sesión en este navegador. Revisá la configuración de almacenamiento.');
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email')).trim().toLowerCase();
    const password = String(formData.get('password'));

    try {
      const passwordHash = await hashPassword(password);
      if (authMode === 'register') {
        const name = String(formData.get('name')).trim();
        if (users[email]) {
          setAuthError('Ya existe una cuenta con ese correo. Iniciá sesión.');
          return;
        }

        const newUser = {
          id: email,
          name,
          email,
          age: Number(formData.get('age')),
          weight: Number(formData.get('weight')),
          goal: String(formData.get('goal')),
          passwordHash,
          routines: createPlan(String(formData.get('goal'))),
        };
        const nextUsers = { ...users, [email]: newUser };
        if (persistUsers(nextUsers)) beginSession(email);
      } else {
        const existingUser = users[email];
        if (!existingUser || existingUser.passwordHash !== passwordHash) {
          setAuthError('El correo o la contraseña no son correctos.');
          return;
        }
        beginSession(email);
      }
    } catch (error) {
      console.error('No se pudo completar el acceso.', error);
      setAuthError(error instanceof Error ? error.message : 'No se pudo completar el acceso.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateExercise(exerciseId, changes) {
    const updatedUser = {
      ...user,
      routines: user.routines.map((routine) => ({
        ...routine,
        exercises: routine.exercises.map((exercise) => (
          exercise.id === exerciseId ? { ...exercise, ...changes } : exercise
        )),
      })),
    };
    persistUsers({ ...users, [activeUserId]: updatedUser });
  }

  function handleLogout() {
    try {
      localStorage.removeItem(ACTIVE_USER_KEY);
      setActiveUserId(null);
      setAuthMode('login');
      setAuthError('');
      setNotice('');
    } catch (error) {
      console.error('No se pudo cerrar la sesión.', error);
      setNotice('No se pudo cerrar la sesión. Volvé a intentarlo.');
    }
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-panel" aria-labelledby="auth-title">
          <a className="brand brand-auth" href="#inicio" aria-label="Build Routine, inicio">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>build<span className="brand-accent">routine</span></span>
          </a>
          <div className="auth-copy">
            <p className="eyebrow">TU ENTRENAMIENTO, A TU RITMO</p>
            <h1 id="auth-title">{authMode === 'register' ? 'Empezá por vos.' : 'Qué bueno verte.'}</h1>
            <p>Guardá tus rutinas, registrá tus cargas y celebrá cada avance.</p>
          </div>
          <div className="auth-tabs" role="tablist" aria-label="Acceso a la cuenta">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'login'}
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'register'}
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
            >
              Crear cuenta
            </button>
          </div>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <>
                <label>
                  Nombre
                  <input name="name" type="text" autoComplete="name" placeholder="¿Cómo te llamás?" required maxLength="60" />
                </label>
                <div className="form-row">
                  <label>
                    Edad
                    <input name="age" type="number" min="13" max="100" placeholder="Ej. 28" required />
                  </label>
                  <label>
                    Peso actual (kg)
                    <input name="weight" type="number" min="20" max="500" step="0.1" placeholder="Ej. 68" required />
                  </label>
                </div>
                <label>
                  ¿Cuál es tu objetivo?
                  <select name="goal" defaultValue="muscle" required>
                    {Object.entries(goalLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label>
              Correo electrónico
              <input name="email" type="email" autoComplete="email" placeholder="vos@correo.com" required />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                placeholder={authMode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                minLength="8"
                required
              />
            </label>
            {authError && <p className="form-error" role="alert">{authError}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Un momento…' : authMode === 'register' ? 'Crear mi cuenta' : 'Entrar a mi cuenta'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="privacy-note">
            Acceso de demostración: la cuenta y tus datos quedan guardados solo en este navegador. No uses una contraseña importante.
          </p>
        </section>
        <aside className="auth-art">
          <div className="art-glow" />
          <img src="/images/woman-training.jpg" alt="" />
          <div className="art-caption">
            <span className="art-label">UN DÍA A LA VEZ</span>
            <p>La constancia<br />se construye.</p>
          </div>
          <span className="art-index">01 — 04</span>
        </aside>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Build Routine, inicio">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>build<span className="brand-accent">routine</span></span>
        </a>
        <nav className="navbar" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#mi-rutina">Mi rutina</a>
          <a href="#progreso">Progreso</a>
          <a href="#grupos">Grupos</a>
        </nav>
        <div className="user-menu">
          <span className="user-avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
          <span className="user-name">{user.name}</span>
          <button className="logout-button" type="button" onClick={handleLogout}>Salir</button>
        </div>
      </header>
      <BottomNav active={activeSection} onSelect={setActiveSection} />

      <main className="dashboard" id="inicio">
        <section className="welcome-section">
          <div className="welcome-copy">
            <p className="eyebrow">TU ESPACIO DE ENTRENAMIENTO</p>
            <h1>Hola, {user.name.split(' ')[0]} <span aria-hidden="true">✦</span></h1>
            <p>Un paso más cerca de tu objetivo. ¿Qué vas a entrenar hoy?</p>
          </div>
          <div className="goal-card">
            <span className="goal-icon" aria-hidden="true">◎</span>
            <div><span className="goal-label">MI OBJETIVO</span><strong>{goalLabels[user.goal]}</strong></div>
          </div>
        </section>

        {notice && <p className="storage-notice" role="status">{notice}</p>}

        <section className="summary-grid" id="progreso" aria-label="Resumen de progreso">
          <article className="summary-card">
            <span className="summary-icon" aria-hidden="true">✓</span>
            <div><strong>{completedCount}<span>/{exerciseCount}</span></strong><p>Ejercicios completados</p></div>
          </article>
          <article className="summary-card">
            <span className="summary-icon" aria-hidden="true">◷</span>
            <div><strong>{user.routines.length}</strong><p>Rutinas en tu plan</p></div>
          </article>
          <article className="summary-card">
            <span className="summary-icon" aria-hidden="true">↗</span>
            <div><strong>{user.weight}<span> kg</span></strong><p>Peso de perfil</p></div>
          </article>
        </section>

        <section className="routine-section" id="mi-rutina">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DISEÑADO PARA VOS</p>
              <h2>Tu plan de entrenamiento</h2>
            </div>
            <span className="plan-badge">PERSONALIZADO</span>
          </div>
          <div className="routine-layout">
            <aside className="routine-list" aria-label="Tus rutinas">
              {user.routines.map((routine, index) => {
                const finished = routine.exercises.filter((exercise) => exercise.completed).length;
                return (
                  <button
                    className={`routine-option${selectedRoutine?.id === routine.id ? ' selected' : ''}`}
                    type="button"
                    key={routine.id}
                    onClick={() => setSelectedRoutineId(routine.id)}
                    aria-pressed={selectedRoutine?.id === routine.id}
                  >
                    <span className="routine-number">0{index + 1}</span>
                    <span className="routine-option-copy">
                      <strong>{routine.name}</strong>
                      <small>{finished}/{routine.exercises.length} ejercicios</small>
                    </span>
                    <span className="routine-arrow" aria-hidden="true">→</span>
                  </button>
                );
              })}
              <div className="coach-note">
                <span aria-hidden="true">✦</span>
                <p>Escuchá a tu cuerpo. La técnica siempre va primero.</p>
              </div>
            </aside>
            {selectedRoutine && (
              <div className="workout-panel">
                <div className="workout-heading">
                  <div>
                    <span className="workout-kicker">TU SESIÓN</span>
                    <h3>{selectedRoutine.name}</h3>
                    <p>{selectedRoutine.focus}</p>
                  </div>
                  <span className="exercise-count">{selectedRoutine.exercises.length} ejercicios</span>
                </div>
                <div className="exercise-list">
                  {selectedRoutine.exercises.map((exercise, index) => (
                    <article className={`exercise-card${exercise.completed ? ' completed' : ''}`} key={exercise.id}>
                      <label className="exercise-check" aria-label={`${exercise.completed ? 'Marcar pendiente' : 'Marcar completado'}: ${exercise.name}`}>
                        <input
                          type="checkbox"
                          checked={exercise.completed}
                          onChange={(event) => updateExercise(exercise.id, { completed: event.target.checked })}
                        />
                        <span className="checkmark" aria-hidden="true">✓</span>
                      </label>
                      <span className="exercise-icon" aria-hidden="true">{exercise.icon}</span>
                      <div className="exercise-main">
                        <span className="exercise-index">EJERCICIO 0{index + 1}</span>
                        <h4>{exercise.name}</h4>
                        <p>{exercise.sets} series <span>·</span> {exercise.reps} reps <span>·</span> {exercise.rest} descanso</p>
                      </div>
                      <label className="weight-input">
                        <span>PESO</span>
                        <span className="weight-field">
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            step="0.5"
                            value={exercise.weight}
                            onChange={(event) => updateExercise(exercise.id, { weight: event.target.value })}
                            aria-label={`Peso usado en ${exercise.name}, en kilogramos`}
                            placeholder="—"
                          />
                          <span>kg</span>
                        </span>
                      </label>
                    </article>
                  ))}
                </div>
                <p className="workout-tip"><span aria-hidden="true">ⓘ</span> Marcá cada ejercicio al terminar y anotá el peso que usaste.</p>
              </div>
            )}
          </div>
        </section>
        <GruposMusculares />
        <footer className="dashboard-footer">BUILD ROUTINE <span>·</span> PROGRESÁ A TU MANERA</footer>
      </main>
    </div>
  );
}

export default App;
