"use client";
import React, { useRef, useEffect, useState } from 'react';
import { TaxTable } from './TaxTable';
import { SalaryTabData } from '@/types/salary';

type Props = {
  tabs: SalaryTabData[];
  annualIncome: number;
}

export const ResultTabs = ({ tabs, annualIncome }: Props) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({ left: false, right: false });

  const scrollTabToCenter = (tabElement: HTMLElement | null) => {
    if (!tabElement || !tabsContainerRef.current) return;
    const container = tabsContainerRef.current;
    const { left: tabLeft, width: tabWidth } = tabElement.getBoundingClientRect();
    const { left: containerLeft, width: containerWidth } = container.getBoundingClientRect();
    container.scrollTo({
      left: container.scrollLeft + (tabLeft - containerLeft) - (containerWidth / 2) + (tabWidth / 2),
      behavior: 'smooth'
    });
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    scrollTabToCenter(document.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement);
  };

  const checkScrollButtons = () => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    setShowScrollButtons({
      left: scrollLeft > 0,
      right: scrollLeft < (scrollWidth - clientWidth)
    });
  };

  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(checkScrollButtons);
    observer.observe(container);
    container.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons();

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', checkScrollButtons);
    };
  }, []);

  // If there are only two tabs (basic mode), show them side by side
  if (tabs.length === 2) {
    return (
      <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {tabs.map((tab) => (
          <BasicTabPanel key={tab.id} tab={tab} />
        ))}
      </div>
    );
  }

  // Advanced mode with scrollable tabs
  return (
    <div className="mt-4 md:mt-8">
      <div className="relative overflow-hidden md:hidden">
        {showScrollButtons.left && (
          <ScrollButton direction="left" onClick={() => {
            if (!tabsContainerRef.current) return;
            tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
          }} />
        )}

        <div ref={tabsContainerRef} className="flex overflow-x-auto py-2 scrollbar-none scroll-smooth">
          <div className="flex gap-2 min-w-max px-4">
            {tabs.filter(tab => !tab.intermediate).map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
              />
            ))}
          </div>
        </div>

        {showScrollButtons.right && (
          <ScrollButton direction="right" onClick={() => {
            if (!tabsContainerRef.current) return;
            tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
          }} />
        )}
      </div>

      <div className="hidden md:flex flex-wrap gap-2 mb-4">
        {tabs.filter(tab => !tab.intermediate).map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          />
        ))}
      </div>

      {tabs.map((tab) => (
        <TabPanel
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          isTooltipActive={activeTooltip === tab.id}
          onTooltipToggle={() => setActiveTooltip(activeTooltip === tab.id ? null : tab.id)}
        />
      ))}
    </div>
  );
};

const BasicTabPanel = ({ tab }: { tab: SalaryTabData }) => (
  <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{tab.icon}</span>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{tab.label}</h3>
          <p className="text-sm text-gray-500">{tab.description}</p>
        </div>
      </div>
      <div className={`text-2xl font-bold ${tab.negative ? 'text-red-600' : 'text-indigo-600'}`}>
        {tab.value.toLocaleString('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND
      </div>
    </div>
  </div>
);

const TabButton = ({ tab, isActive, onClick }: { 
  tab: SalaryTabData; 
  isActive: boolean; 
  onClick: () => void; 
}) => (
  <button
    data-tab-id={tab.id}
    onClick={onClick}
    className={`
      flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap
      transition-all duration-200 ease-in-out
      ${isActive
        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200'
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
  >
    <span>{tab.icon}</span>
    <span>{tab.label}</span>
    <span className={`ml-1 px-1.5 py-0.5 md:px-2 rounded-full text-[10px] md:text-xs
      ${isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-700'}`}
    >
      {tab.negative ? '-' : '+'}{Math.abs(tab.value).toLocaleString('fr-TN', { maximumFractionDigits: 0 })}
    </span>
  </button>
);

const TabPanel = ({ tab, isActive, isTooltipActive, onTooltipToggle }: {
  tab: SalaryTabData;
  isActive: boolean;
  isTooltipActive: boolean;
  onTooltipToggle: () => void;
}) => (
  <div className={`${isActive ? 'block' : 'hidden'}`}>
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-2xl">{tab.icon}</span>
            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">{tab.label}</h3>
              <p className="text-xs md:text-sm text-gray-500">{tab.description}</p>
            </div>
          </div>
          <div className={`text-xl md:text-2xl font-bold ${tab.negative ? 'text-red-600' : 'text-indigo-600'}`}>
            {tab.value.toFixed(2)} TND
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-sm">
          <div className="flex items-start gap-3">
            <button
              onClick={onTooltipToggle}
              className="flex-shrink-0 mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">Comment est-ce calculé ?</h4>
                {isTooltipActive && (
                  <button
                    onClick={onTooltipToggle}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Fermer
                  </button>
                )}
              </div>
              <div className={`
                mt-2 transition-all duration-200 ease-in-out overflow-hidden
                ${isTooltipActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100'}
              `}>
                <p className="text-gray-600 whitespace-pre-line">{tab.tooltip}</p>
                {tab.formula && (
                  <div className="mt-3 flex items-center gap-2 text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{tab.formula}</span>
                  </div>
                )}
                {tab.table && (
                  <div className="mt-4">{tab.table}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ScrollButton = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => (
  <>
    <div className={`absolute ${direction}-0 top-0 bottom-0 w-12 bg-gradient-to-${direction === 'left' ? 'r' : 'l'} from-black/10 to-transparent z-[1] pointer-events-none`} />
    <button
      onClick={onClick}
      className={`absolute ${direction}-0 top-1/2 -translate-y-1/2 z-10 h-full w-8 flex items-center justify-center bg-white shadow-lg backdrop-blur-sm hover:bg-white transition-all`}
      aria-label={`Scroll ${direction}`}
    >
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={direction === 'left' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  </>
);