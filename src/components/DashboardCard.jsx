export default function DashboardCard({
  icon: Icon,
  title,
  description,
  accent = "bg-plum-100 text-plum-700",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick || (() => window.alert("Modulo en desarrollo"))}
      className="group flex min-h-48 flex-col rounded-3xl border-2 border-plum-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-lotus-400 hover:shadow-soft sm:min-h-52 sm:p-5"
      aria-label={`${title}. ${description}`}
    >
      <span className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl sm:mb-5 sm:h-16 sm:w-16 ${accent}`}>
        <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className="text-lg font-black leading-tight text-plum-800 sm:text-xl">{title}</span>
      <span className="mt-2 text-sm font-medium leading-relaxed text-plum-600 sm:text-base">{description}</span>
      <span className="mt-auto pt-4 text-sm font-extrabold text-lotus-500 group-hover:text-plum-700 sm:pt-5 sm:text-base">
        Abrir modulo
      </span>
    </button>
  );
}
