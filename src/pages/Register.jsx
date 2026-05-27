import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contrasenas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await signUp(
      formData.fullName.trim(),
      formData.birthDate || null,
      formData.phone.trim() || null,
      formData.email.trim(),
      formData.password,
    );
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || "No se pudo crear la cuenta. Intentalo nuevamente.");
      return;
    }

    if (data?.session) {
      navigate("/dashboard");
      return;
    }

    setSuccessMessage("Cuenta creada. Revisa tu correo para confirmar el registro antes de iniciar sesion.");
  };

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Registra tus datos para empezar a cuidar tu salud">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <InputField
          id="fullName"
          label="Nombre completo"
          placeholder="Escribe tu nombre"
          autoComplete="name"
          value={formData.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          required
          disabled={isSubmitting}
        />
        <InputField
          id="birthDate"
          label="Fecha de nacimiento"
          type="date"
          autoComplete="bday"
          value={formData.birthDate}
          onChange={(event) => updateField("birthDate", event.target.value)}
          disabled={isSubmitting}
        />
        <InputField
          id="phone"
          label="Numero de celular"
          type="tel"
          placeholder="Ej. 987 654 321"
          autoComplete="tel"
          value={formData.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          disabled={isSubmitting}
        />
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
          placeholder="Crea una contrasena"
          autoComplete="new-password"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
          required
          disabled={isSubmitting}
        />
        <InputField
          id="confirmPassword"
          label="Confirmar contrasena"
          type="password"
          placeholder="Repite tu contrasena"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          required
          disabled={isSubmitting}
        />
        {errorMessage && (
          <p className="rounded-2xl bg-lotus-100 px-4 py-3 text-center text-base font-bold text-lotus-500">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="rounded-2xl bg-mint-100 px-4 py-3 text-center text-base font-bold text-mint-500">
            {successMessage}
          </p>
        )}
        <div className="pt-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </PrimaryButton>
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
