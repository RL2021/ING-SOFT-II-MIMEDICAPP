import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCargando(true);

    const { error: resetError } = await resetPassword(email);

    setCargando(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setEnviado(true);
  };

  return (
    <AuthLayout
      title="Recuperar contrasena"
      subtitle="Te enviaremos un enlace a tu correo para restablecerla"
    >
      {!enviado ? (
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <InputField
            id="recoverEmail"
            label="Correo electronico"
            type="email"
            placeholder="nombre@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p className="text-center text-base font-semibold text-red-500">
              {error}
            </p>
          )}
          <div className="pt-2">
            <PrimaryButton type="submit" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar enlace"}
            </PrimaryButton>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl bg-plum-50 p-5 text-center text-lg font-semibold text-plum-700 ring-1 ring-plum-100">
          Si tu correo esta registrado, te enviamos un enlace para restablecer tu contrasena.
        </div>
      )}

      <p className="mt-7 text-center text-lg font-semibold text-plum-600">
        ¿Recordaste tu contrasena?{" "}
        <Link className="font-black text-lotus-500 underline-offset-4 hover:underline" to="/login">
          Inicia sesion
        </Link>
      </p>
    </AuthLayout>
  );
}