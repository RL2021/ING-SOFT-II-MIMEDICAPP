import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function ForgotPassword() {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
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
          />
          <div className="pt-2">
            <PrimaryButton type="submit">Enviar enlace</PrimaryButton>
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