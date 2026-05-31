import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function UpdatePassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contrasenas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);
    const { error: updateError } = await updatePassword(password);
    setCargando(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setListo(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <AuthLayout
      title="Nueva contrasena"
      subtitle="Ingresa tu nueva contrasena para tu cuenta"
    >
      {!listo ? (
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <InputField
            id="newPassword"
            label="Nueva contrasena"
            type="password"
            placeholder="Ingresa tu nueva contrasena"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputField
            id="confirmPassword"
            label="Confirmar contrasena"
            type="password"
            placeholder="Repite tu nueva contrasena"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && (
            <p className="text-center text-base font-semibold text-red-500">
              {error}
            </p>
          )}
          <div className="pt-2">
            <PrimaryButton type="submit" disabled={cargando}>
              {cargando ? "Actualizando..." : "Actualizar contrasena"}
            </PrimaryButton>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl bg-plum-50 p-5 text-center text-lg font-semibold text-plum-700 ring-1 ring-plum-100">
          Contrasena actualizada. Redirigiendo al inicio de sesion...
        </div>
      )}
    </AuthLayout>
  );
}