export const Header = () => {
  return (
    <div className="text-center flex flex-col items-center space-y-3 md:space-y-4">
      <div className="flex items-center px-2 md:px-4">
        <div className="group relative inline-flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-100 text-indigo-800 text-xs md:text-sm rounded-full hover:bg-indigo-200 transition-all duration-300 shadow-sm overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-full"></div>
          <div className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(99,102,241,0.3)_0%,rgba(99,102,241,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          <span className="relative z-10 flex items-center gap-1">
            <span className="animate-pulse">✨</span>
            <span>Nouveau mode simplifié disponible!</span>
          </span>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-indigo-400/0 via-indigo-400/90 to-indigo-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
        </div>
      </div>
      <h1 className="text-lg md:text-3xl font-bold">Simulateur de Salaire</h1>
      <p className="text-xs md:text-base text-gray-600">
        Calculez votre salaire net en mode simplifié ou avancé
        <span className="block mt-1 text-xs text-gray-500">
          Tous les calculs incluent les charges sociales et fiscales
        </span>
      </p>
    </div>
  );
};