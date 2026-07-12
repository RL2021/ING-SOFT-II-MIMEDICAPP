import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import CitasMedicas from "./pages/CitasMedicas"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Medicines from "./pages/Medicines"
import Settings from "./pages/Settings"
import Exercise from "./pages/Exercise"
import ForgotPassword from "./pages/ForgotPassword"
import Foods from "./pages/Foods"
import { useAuth } from "./context/AuthContext"
import UpdatePassword from "./pages/UpdatePassword"
import Notifications from "./components/Notifications"
import NotificationListener from "./components/NotificationListener"
import Reports from "./pages/Reports"
import Report from "./pages/Report"


function ProtectedRoute({ children }) {
	const { user, loading } = useAuth()

	if (loading) {
		return (
			<main className="grid min-h-screen place-items-center bg-plum-50 px-4 text-center text-plum-800">
				<p className="text-xl font-black">Cargando MIMEDICAPP...</p>
			</main>
		)
	}

	if (!user) {
		return <Navigate to="/login" replace />
	}

	return (
		<>
			<NotificationListener />
			{children}
		</>
	)
}

export default function App() {
	return (
		<>
		<Toaster position="top-right" toastOptions={{ style: { borderRadius: '1rem', fontFamily: 'inherit' } }} />
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<Login />} />
			<Route path="/forgot_password" element={<ForgotPassword />} />
			<Route path="/register" element={<Register />} />
			<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
			<Route path="/dashboard/citas-medicas" element={<ProtectedRoute><CitasMedicas /></ProtectedRoute>} />
			<Route
				path="/dashboard/notificaciones"
				element={<ProtectedRoute><Notifications asPage /></ProtectedRoute>}
			/>
			<Route path="/dashboard/medicamentos" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
			<Route path="/dashboard/configuracion" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
			<Route path="/dashboard/foods" element={<ProtectedRoute><Foods /></ProtectedRoute>} />
			<Route path="/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
			<Route path="/dashboard/reportes" element={<ProtectedRoute><Report /></ProtectedRoute>} />
			<Route path="/update-password" element={<UpdatePassword />} />

			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
		</>
	)
}
