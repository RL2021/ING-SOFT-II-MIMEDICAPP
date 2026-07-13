import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado en MiMedicApp:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-plum-50 p-6 text-center text-plum-800">
        <section className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-plum-100">
          <h1 className="text-2xl font-black">No pudimos mostrar esta pantalla</h1>
          <p className="mt-3 font-medium text-plum-600">
            Tu sesión sigue protegida. Recarga para recuperar la aplicación.
          </p>
          {import.meta.env.DEV && (
            <p className="mt-3 rounded-xl bg-lotus-100 p-3 text-left text-sm font-semibold text-lotus-500">
              {this.state.error?.message || "Error desconocido"}
            </p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 min-h-12 rounded-full bg-plum-700 px-6 font-black text-white hover:bg-plum-800"
          >
            Recargar MiMedicApp
          </button>
        </section>
      </main>
    );
  }
}
