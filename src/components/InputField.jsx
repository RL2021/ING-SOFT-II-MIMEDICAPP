export default function InputField({ id, label, type = "text", placeholder, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-lg font-bold text-plum-800">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-14 w-full rounded-2xl border-2 border-plum-100 bg-plum-50/50 px-4 text-lg font-medium text-plum-800 placeholder:text-plum-500/65 transition hover:border-plum-200 focus:border-lotus-500 focus:bg-white focus:outline-none"
      />
    </div>
  );
}
