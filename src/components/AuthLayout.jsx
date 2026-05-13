import BrandMark from "./BrandMark";

export default function AuthLayout({ children, title, subtitle, hideIntroOnMobile = false }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-plum-50 via-white to-lotus-100 px-4 py-8 text-plum-800 sm:px-6 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-soft ring-1 ring-plum-100 sm:p-9 lg:p-10">
            <div className="mb-8 flex justify-center">
              <BrandMark />
            </div>
            <div className={`mb-7 ${hideIntroOnMobile ? "hidden" : ""}`}>
              <h1 className="text-3xl font-black text-plum-800 sm:text-4xl">{title}</h1>
              <p className="mt-3 text-lg font-medium leading-relaxed text-plum-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
