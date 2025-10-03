import { useState, useEffect, useCallback } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export const useCanvasSize = () => {
  const [size, setSize] = useState<CanvasSize>({
    width: 800,
    height: 600,
  });

  const updateSize = useCallback(() => {
    // Calcul de la taille disponible en tenant compte de la nouvelle structure sans padding root
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimation plus précise des éléments de l'interface
    const headerHeight = 100; // Header height ajusté
    const toolbarHeight = 70; // Toolbar height ajusté  
    const mainPadding = 48; // padding de main (p-6 = 24px * 2)
    const containerMargin = 0; // Marges du conteneur canvas
    const borderAndShadow = 8; // Espace pour les bordures et ombres
    
    // Calcul avec la nouvelle structure (pas de padding root)
    const availableWidth = Math.max(400, viewportWidth - mainPadding - containerMargin);
    const availableHeight = Math.max(300, viewportHeight - headerHeight - toolbarHeight - mainPadding - borderAndShadow);
    
    // Assurer des tailles raisonnables pour le dessin
    const finalWidth = Math.min(availableWidth, 4200); // Largeur max augmentée
    const finalHeight = Math.min(availableHeight, 1200); // Hauteur max augmentée
    
    setSize({
      width: Math.floor(finalWidth),
      height: Math.floor(finalHeight),
    });
  }, []);

  useEffect(() => {
    // Mise à jour initiale avec un petit délai pour s'assurer que le DOM est prêt
    const initialUpdate = () => {
      setTimeout(updateSize, 100);
    };
    
    initialUpdate();

    // Écouter les changements de taille de fenêtre avec debounce optimisé
    let timeoutId: number;
    const debouncedUpdateSize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateSize, 100); // Délai réduit pour plus de réactivité
    };

    window.addEventListener('resize', debouncedUpdateSize);
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdateSize);
    };
  }, [updateSize]);

  return size;
};