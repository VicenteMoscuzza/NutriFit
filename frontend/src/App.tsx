import { Route, Routes } from 'react-router-dom'
import './App.css'
import RutaPrivada from './auth/RutaPrivada'
import EjerciciosPage from './pages/EjerciciosPage'
import EntrenamientoHoyPage from './pages/EntrenamientoHoyPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RutinaPage from './pages/RutinaPage'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RutaPrivada>
            <HomePage />
          </RutaPrivada>
        }
      />
      <Route
        path="/ejercicios"
        element={
          <RutaPrivada>
            <EjerciciosPage />
          </RutaPrivada>
        }
      />
      <Route
        path="/rutina"
        element={
          <RutaPrivada>
            <RutinaPage />
          </RutaPrivada>
        }
      />
      <Route
        path="/entrenamiento"
        element={
          <RutaPrivada>
            <EntrenamientoHoyPage />
          </RutaPrivada>
        }
      />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App
