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

export default function Embed() {
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-4">
      <div className="text-center flex flex-col items-center space-y-4 mb-6">
        <Image 
          title='Lucapacioli main logo' 
          src='/luca.png' 
          height={80} 
          width={80} 
          alt='Lucapacioli' 
          className="w-16"
        />
        <h1 className="text-xl font-bold">Consultation Fiscal Unifiée</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
            Identifiant Fiscal (MATF)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
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
          <p className="text-sm text-gray-500">Format requis : 7 chiffres suivis d&apos;une lettre majuscule (ex: 1234567/A)</p>
        </div>

        {taxInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
}