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
      setError('Tax ID must be in format: 0000000/S (7 digits followed by a letter)');
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
      setError('Failed to fetch tax information');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!validateTaxId(taxId)) {
      setError('Tax ID must be in format: 0000000/S (7 digits followed by a letter)');
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
      setError('Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen p-8 pb-16 flex items-center justify-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center flex flex-col items-center space-y-4">
            <Image src='/luca.svg' height={200} width={200} alt='Lucapacioli'/>
            <h1 className="text-3xl font-bold mb-2">Luca Pacioli TEJ Tool</h1>
            <p className="text-gray-600">Look up tax information and download tax files</p>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="space-y-2">
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                Tax ID
              </label>
              <div className="flex gap-2">
                <input
                  id="taxId"
                  type="text"
                  value={taxId}
                  onChange={handleTaxIdChange}
                  placeholder="0000000/S"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  maxLength={9}
                />
                <button
                  onClick={fetchInfo}
                  disabled={isLoading || !taxId}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  Look Up
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <p className="text-sm text-gray-500">Format: 7 digits followed by a letter (e.g., 1234567/A)</p>
            </div>

            {taxInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Company Information</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">Name:</span> {taxInfo.raison}</p>
                      <p><span className="text-gray-500">Activity:</span> {taxInfo.activitep}</p>
                      <p><span className="text-gray-500">Status:</span> {taxInfo.situation}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Tax Details</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">Tax Office:</span> {taxInfo.libbur}</p>
                      <p><span className="text-gray-500">VAT Code:</span> {taxInfo.tvacode}</p>
                      <p><span className="text-gray-500">Category:</span> {taxInfo.categ}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadFile}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  {isDownloading ? 'Downloading...' : 'Download Tax File'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t shadow-lg">
        <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            We do not collect, store, or process any personal data. All queries are handled securely and no information is retained after your session.
            <br />
            Official reference: {' '}
            <a 
              href="https://tej.finances.gov.tn/tax-file" 
              target="_blank"
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              tej.finances.gov.tn/tax-file
            </a>
          </p>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Powered by</span>
          <a 
            href="https://silkdev.com.tn" 
            target="_blank" 
            className="font-semibold hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Image src="/silknexus.svg" width='16' height='16' alt="SILKNEXUS" className="h-4" />
            SILKNEXUS
          </a>
          <span>&</span>
          <a 
            href="https://lucapacioli.com.tn" 
            target="_blank" 
            className="font-semibold hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Image src="/luca-icon.svg" width='16' height='16' alt="LUCAPACIOLI" className="h-4" />
            LUCAPACIOLI
          </a>
        </div>
      </div>
    </>
  );
}