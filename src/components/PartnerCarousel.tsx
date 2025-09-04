'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LogoCarouselProps {
  className?: string;
}

export default function LogoCarousel({ className = '' }: LogoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Lista de logos con sus URLs
  const logos = [
    { src: '/logo.png', alt: 'Sirius Regenerative', url: 'https://www.siriusregenerative.co/' },
    { src: '/logo2.png', alt: 'Del Llano Alto Oleico', url: 'https://delllanoaltooleico.com/' },
    { src: '/logo-guaicaramo.png', alt: 'Guaicaramo', url: 'https://guaicaramo.com/' },
    { src: '/Logo Fundación (1).png', alt: 'FundacionGuaicaramo', url: 'https://funguaicaramo.org/' }
  ];

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      console.log('Mobile detection:', mobile, 'Width:', window.innerWidth); // Debug
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-avanzar el carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % logos.length);
    }, 2500); // Cambiar cada 2.5 segundos

    return () => clearInterval(interval);
  }, [logos.length]);

  // Efecto de aparición
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Calcular los logos visibles (3 a la vez)
  const getVisibleLogos = () => {
    const visible = [];
    for (let i = 0; i < Math.min(3, logos.length); i++) {
      const index = (currentIndex + i) % logos.length;
      visible.push({ ...logos[index], position: i });
    }
    return visible;
  };

  // Función para obtener el scaling personalizado por logo
  const getLogoScale = (logoSrc: string, isCenter: boolean) => {
    if (!isCenter) return 'scale-100';
    
    // Scaling específico para cada logo problemático
    if (logoSrc === '/Logo Fundación (1).png') {
      return 'scale-90'; // Reducido aún más para la Fundación
    }
    
    if (logoSrc === '/logo2.png') {
      return 'scale-100'; // Mantiene el scaling para Del Llano Alto Oleico
    }
    
    return 'scale-125'; // Scaling normal para otros logos
  };

  // Función para obtener dimensiones específicas por logo
  const getLogoDimensions = (logoSrc: string, isCenter: boolean) => {
    const baseWidth = isCenter ? (isMobile ? 320 : 150) : (isMobile ? 290 : 130);
    const baseHeight = isCenter ? (isMobile ? 320 : 150) : (isMobile ? 290 : 130);
    
    // Ajustar altura específicamente para el logo de la Fundación
    if (logoSrc === '/Logo Fundación (1).png') {
      return {
        width: baseWidth - 20,
        height: Math.round(baseHeight-1000) // Reducir altura en 20%
      };
    }
    
    return {
      width: baseWidth,
      height: baseHeight
    };
  };

  const visibleLogos = getVisibleLogos();

  return (
    <div className={`fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    } ${className}`}>
      
      <div className="flex items-center justify-center space-x-2 md:space-x-12">
        {visibleLogos.map((logo, index) => (
          <div
            key={`${logo.src}-${currentIndex}-${index}`}
            className={`transition-all duration-500 ease-out ${
              index === 1 // Centro
                ? `opacity-100 ${getLogoScale(logo.src, true)} transform` 
                : 'opacity-85 scale-100' // Lados
            }`}
          >
            <div className="relative flex items-center justify-center transition-transform duration-300 hover:scale-110">
              <a 
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(logo.url, '_blank', 'noopener,noreferrer');
                }}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={getLogoDimensions(logo.src, index === 1).width}
                  height={getLogoDimensions(logo.src, index === 1).height}
                  className="object-contain transition-all duration-300 hover:opacity-80"
                  style={{
                    filter: 'brightness(1) contrast(1)',
                  }}
                />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores mínimos */}
      <div className="flex justify-center mt-6">
        <div className="flex space-x-3 bg-black/10 backdrop-blur-sm rounded-full px-3 py-2">
          {logos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex 
                  ? 'w-3 h-3 bg-white/90' 
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}