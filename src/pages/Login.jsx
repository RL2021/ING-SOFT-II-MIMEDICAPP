import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await signIn(formData.email.trim(), formData.password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage("Correo o contrasena incorrectos. Revisa tus datos e intentalo otra vez.");
      return;
    }

    navigate("/dashboard");
  };

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
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
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
          disabled={isSubmitting}
        />
        <InputField
          id="password"
          label="Contrasena"
          type="password"
          placeholder="Ingresa tu contrasena"
          autoComplete="current-password"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
          required
          disabled={isSubmitting}
        />
        {errorMessage && (
          <p className="rounded-2xl bg-lotus-100 px-4 py-3 text-center text-base font-bold text-lotus-500">
            {errorMessage}
          </p>
        )}
        <div className="-mt-2 text-right">
          <Link
            to="/forgot_password"
            className="text-base font-semibold text-lotus-500 underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contrasena?
          </Link>
        </div>
        <div className="pt-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
          </PrimaryButton>
        </div>
      </form>

      <p className="mt-7 text-center text-lg font-semibold text-plum-600">
        ¿No tienes una cuenta?{" "}
        <Link
          className="font-black text-lotus-500 underline-offset-4 hover:underline"
          to="/register"
        >
          Registrate
        </Link>
      </p>
    </AuthLayout>
  );
}
