/** Conteneur contenu app — pleine largeur dans layout sidebar */
export function AppContainer({
  children,
  narrow = false,
  className = "",
}: {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full px-5 py-8 lg:px-10 lg:py-10 ${
        narrow ? "max-w-4xl" : "max-w-7xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
