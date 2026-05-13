import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <AuthLayout
      title="MiMedicApp"
      subtitle="Tu salud organizada en un solo lugar"
      hideIntroOnMobile
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <InputField
          id="email"
          label="Correo electronico"
          type="email"
          placeholder="nombre@correo.com"
          autoComplete="email"
        />
        <InputField
          id="password"
          label="Contrasena"
          type="password"
          placeholder="Ingresa tu contrasena"
          autoComplete="current-password"
        />
        <div className="pt-2">
          <PrimaryButton type="submit">Iniciar sesion</PrimaryButton>
        </div>
      </form>

      <p className="mt-7 text-center text-lg font-semibold text-plum-600">
        ¿No tienes una cuenta?{" "}
        <Link className="font-black text-lotus-500 underline-offset-4 hover:underline" to="/register">
          Registrate
        </Link>
      </p>
    </AuthLayout>
  );
}
