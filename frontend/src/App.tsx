import { Route, Routes } from 'react-router-dom'
import './App.css'
import RutaPrivada from './auth/RutaPrivada'
import ComidasGuardadasPage from './pages/ComidasGuardadasPage'
import EntrenamientoHoyPage from './pages/EntrenamientoHoyPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NutricionPage from './pages/NutricionPage'
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
      <Route
        path="/nutricion"
        element={
          <RutaPrivada>
            <NutricionPage />
          </RutaPrivada>
        }
      />
      <Route
        path="/nutricion/mis-comidas"
        element={
          <RutaPrivada>
            <ComidasGuardadasPage />
          </RutaPrivada>
        }
      />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App
