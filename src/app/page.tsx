'use client';

import React, { useState } from 'react';
import { Download, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface TaxInfo {
  matfis: string;
  codbur: string;
  libbur: string;
  tvacode: string;
  categ: string;
  raison: string;
  activitep: string;
  activites: string | null;
  situation: string;
  obligation: string;
}

export default function Home() {
  const [taxId, setTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);

  const formatTaxId = (value: string) => {
    const cleaned = value.replace(/[^0-9A-Z]/gi, '');
    const numbers = cleaned.replace(/[^\d]/g, '').slice(0, 7);
    const letter = cleaned.replace(/[^A-Z]/gi, '').slice(0, 1).toUpperCase();

    if (numbers && letter) {
      return `${numbers}/${letter}`;
    }
    else if (numbers) {
      return `${numbers}${letter ? `/${letter}` : ''}`;
    }
    return cleaned;
  };

  const validateTaxId = (id: string) => {
    const pattern = /^\d{7}\/[A-Z]$/;
    return pattern.test(id);
  };

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTaxId(e.target.value);
    setTaxId(formattedValue);
    setError('');
  };

  const fetchInfo = async () => {
    if (!validateTaxId(taxId)) {
      setError("L'identifiant fiscal doit être au format: 0000000/S (7 chiffres suivis d'une lettre)");
      return;
    }

    setError('');
    setIsLoading(true);
    setTaxInfo(null);

    try {
      const cleanTaxId = taxId.replace('/', '');
      const response = await fetch(`/api/tej/info?taxId=${encodeURIComponent(cleanTaxId)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tax info');
      }

      const data = await response.json();
      if (data.dossier && data.dossier[0]) {
        setTaxInfo(data.dossier[0]);
      } else {
        setError('No information found for this tax ID');
      }
    } catch (error) {
      console.error('Error:', error);
      setError("Échec de la récupération des informations fiscales");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!validateTaxId(taxId)) {
      setError("L'identifiant fiscal doit être au format: 0000000/S (7 chiffres suivis d'une lettre)");
      return;
    }

    setError('');
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/tej/download?taxId=${encodeURIComponent(taxId)}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_file_${taxId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      setError("Échec du téléchargement du fichier");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[url('/full-img-bg.png')] bg-bottom bg-cover p-4 md:p-8 pb-24 md:pb-48 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-white  rounded-xl shadow-2xl border border-white/20 p-6 md:p-8 space-y-8 md:space-y-10 animate-fade-in">
          <div className="text-center flex flex-col items-center space-y-4">
            <div className="flex items-center animate-bounce-slow">
              <a
                href="https://lucapacioli.com.tn/blog/finance-law-2025-tunisia"
                className="group relative inline-flex items-center gap-1 px-4 py-2 bg-indigo-100 text-indigo-800 text-sm rounded-full hover:bg-indigo-200 transition-all duration-300 shadow-sm overflow-hidden"
              >
                <div className="absolute inset-0 overflow-hidden rounded-full"></div>
                <div className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(99,102,241,0.3)_0%,rgba(99,102,241,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <span className="relative z-10 flex items-center gap-1">
                  <span className="animate-pulse">✨</span>
                  <span>Nouveauté 2025 : Découvrez comment cet outil simplifie vos obligations fiscales</span>
                </span>
                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-indigo-400/0 via-indigo-400/90 to-indigo-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
              </a>
            </div>
            <Image title='Lucapacioli main logo' src='/luca.png' height={150} width={150} alt='Lucapacioli' className="w-24 md:w-48" />
            <h1 className="text-xl md:text-3xl font-bold mb-2">Consultation Fiscal Unifiée</h1>
            <p className="text-gray-600 text-sm md:text-base">Accédez en temps réel à votre dossier fiscal complet et générez vos documents réglementaires</p>
          </div>

          <div className="space-y-6 bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="space-y-2">
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
              Identifiant Fiscal (MATF)
              </label>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  id="taxId"
                  type="text"
                  value={taxId}
                  onChange={handleTaxIdChange}
                  placeholder="Exemple : 1234567A"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  maxLength={9}
                />
                <button
                  onClick={fetchInfo}
                  disabled={isLoading || !taxId}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  Rechercher
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <p className="text-sm text-gray-500">Format requis : 7 chiffres suivis d&apost;une lettre majuscule (ex: 1234567/A)</p>
            </div>

            {taxInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Informations de l&apos;entreprise</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">Raison sociale:</span> {taxInfo.raison}</p>
                      <p><span className="text-gray-500">Activité:</span> {taxInfo.activitep}</p>
                      <p><span className="text-gray-500">Situation:</span> {taxInfo.situation}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Détails fiscaux</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">Bureau fiscal:</span> {taxInfo.libbur}</p>
                      <p><span className="text-gray-500">Code TVA:</span> {taxInfo.tvacode}</p>
                      <p><span className="text-gray-500">Catégorie:</span> {taxInfo.categ}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadFile}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  {isDownloading ? 'Téléchargement...' : 'Télécharger le dossier fiscal'}
                </button>
              </div>
            )}
          </div>
        </div >
      </main >

      <footer className="relative md:fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t shadow-lg">
        <div className="max-w-2xl mx-auto p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-600 text-center mb-2">
            Aucune donnée personnelle n&apos;est collectée, stockée ou traitée.
            Toutes les requêtes sont sécurisées et aucune information n&apos;est conservée après votre session.
            <br className="hidden md:block" />
            <span className="block md:inline mt-1">
              Site officiel : {' '}
              <a
                href="https://tej.finances.gov.tn/tax-file"
                className="text-blue-600 hover:underline"
              >
                Portail TEJ - Ministère des Finances
              </a>
            </span>
          </p>

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
        </div>
      </footer>
    </>
  );
}