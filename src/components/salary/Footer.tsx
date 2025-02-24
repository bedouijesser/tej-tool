import Image from 'next/image';

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/90 border-t shadow-lg text-[10px] md:text-sm">
      <div className="max-w-2xl mx-auto p-3 md:p-4">
        <p className="text-xs md:text-sm text-gray-600 text-center mb-2">
          Ce simulateur est fourni à titre indicatif. Les résultats peuvent varier selon votre situation spécifique.
          <br className="hidden md:block" />
          <span className="block md:inline mt-1">
            Pour plus d'informations, consultez la {' '}
            <a
              href="https://www.cnss.tn"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              CNSS
            </a>
            {' '} ou la {' '}
            <a
              href="https://www.impots.finances.gov.tn"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Direction Générale des Impôts
            </a>
          </span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-xs md:text-sm text-gray-600 py-2">
        <span>Service développé par</span>
        <a
          href="https://silkdev.com.tn"
          className="font-semibold hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <Image src="/silknexus.svg" title='silknexus logo' width='14' height='14' alt="SILKNEXUS" className="h-3 md:h-4" />
          SILKNEXUS
        </a>
        <span>et</span>
        <a
          href="https://lucapacioli.com.tn"
          className="font-semibold font-['LucaFont'] hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <Image src="/luca-icon.svg" title='lucapacioli logo' width='14' height='14' alt="LUCAPACIOLI" className="h-3 md:h-4" />
          LUCA PACIOLI
        </a>
      </div>
    </footer>
  );
};