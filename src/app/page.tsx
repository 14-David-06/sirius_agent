'use client';

import dynamic from 'next/dynamic';
import PartnerCarousel from '../components/PartnerCarousel';
import GaiaMinimal from '../components/GaiaMinimal';

// Importar dinámicamente el componente para evitar problemas de SSR con Three.js
const ThreeAnimation = dynamic(() => import('../components/ThreeAnimationFixed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden relative">
      <ThreeAnimation />
      <PartnerCarousel />
      
      {/* GAIA Minimal - Centrado debajo de la esfera */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {/* Espaciado para posicionar debajo de la esfera */}
        <div className="h-150"></div> {/* Espacio para la esfera */}
        <div className="pointer-events-auto">
          <GaiaMinimal />
        </div>
      </div>
    </div>
  );
}
