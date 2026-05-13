export default function BrandMark({ compact = false, light = false }) {
  return (
    <div className={`flex items-center ${compact ? "gap-3" : "flex-col gap-4"}`}>
      <div className={compact ? "scale-75" : ""} aria-hidden="true">
        <div className="lotus-mark">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={compact ? "text-left" : "text-center"}>
        <p className={`text-2xl font-black tracking-[0.08em] sm:text-3xl ${light ? "text-white" : "text-plum-800"}`}>
          MIMEDICAPP
        </p>
        {!compact && (
          <p className="mt-2 text-lg font-semibold text-plum-600">
            Tu salud organizada en un solo lugar
          </p>
        )}
      </div>
    </div>
  );
}
