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
    // Calcul de la taille disponible avec la nouvelle structure
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Nouvelle estimation des éléments de l'interface
    const headerHeight = 0; // Header commenté
    const toolbarHeight = 90; // Toolbar en bas avec spacing (bottom-4 + height + padding)
    const mainPadding = 32; // padding de main (p-4 = 16px * 2)
    const containerMargin = 0; // Marges du conteneur canvas
    const borderAndShadow = 8; // Espace pour les bordures et ombres
    
    // Calcul avec la structure optimisée
    const availableWidth = Math.max(400, viewportWidth - mainPadding - containerMargin);
    const availableHeight = Math.max(500, viewportHeight - headerHeight - toolbarHeight - mainPadding - borderAndShadow);
    
    // Assurer des tailles raisonnables pour le dessin
    const finalWidth = Math.min(availableWidth, 4200); // Largeur max
    const finalHeight = Math.min(availableHeight, 2800); // Hauteur max
    
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