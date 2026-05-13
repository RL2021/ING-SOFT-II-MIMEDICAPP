export default function PrimaryButton({ children, type = "button", variant = "solid", onClick }) {
  const styles =
    variant === "outline"
      ? "border-4 border-plum-700 bg-white text-plum-700 hover:bg-plum-50"
      : "border-4 border-plum-700 bg-plum-700 text-white shadow-lg shadow-plum-700/20 hover:bg-plum-800 hover:border-plum-800";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center justify-center rounded-full px-6 py-3 text-lg font-extrabold transition active:scale-[0.98] ${styles}`}
    >
      {children}
    </button>
  );
}
