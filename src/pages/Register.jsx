import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Registra tus datos para empezar a cuidar tu salud">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <InputField
          id="fullName"
          label="Nombre completo"
          placeholder="Escribe tu nombre"
          autoComplete="name"
        />
        <InputField id="birthDate" label="Fecha de nacimiento" type="date" autoComplete="bday" />
        <InputField
          id="phone"
          label="Numero de celular"
          type="tel"
          placeholder="Ej. 987 654 321"
          autoComplete="tel"
        />
        <InputField
          id="registerEmail"
          label="Correo electronico"
          type="email"
          placeholder="nombre@correo.com"
          autoComplete="email"
        />
        <InputField
          id="registerPassword"
          label="Contrasena"
          type="password"
          placeholder="Crea una contrasena"
          autoComplete="new-password"
        />
        <InputField
          id="confirmPassword"
          label="Confirmar contrasena"
          type="password"
          placeholder="Repite tu contrasena"
          autoComplete="new-password"
        />
        <div className="pt-2">
          <PrimaryButton type="submit">Crear cuenta</PrimaryButton>
        </div>
      </form>

      <p className="mt-7 text-center text-lg font-semibold text-plum-600">
        ¿Ya tienes una cuenta?{" "}
        <Link className="font-black text-lotus-500 underline-offset-4 hover:underline" to="/login">
          Inicia sesion
        </Link>
      </p>
    </AuthLayout>
  );
}
