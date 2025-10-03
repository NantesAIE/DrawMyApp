import html2canvas from 'html2canvas';

export const exportCanvasAsPNG = async (
  canvasElement: HTMLCanvasElement,
  filename: string = 'drawing'
): Promise<void> => {
  try {
    // Create a temporary container with white background
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    
    // Clone the canvas
    const clonedCanvas = canvasElement.cloneNode(true) as HTMLCanvasElement;
    const context = clonedCanvas.getContext('2d');
    
    if (context) {
      // Copy the original canvas content to the cloned canvas
      const originalContext = canvasElement.getContext('2d');
      if (originalContext) {
        const imageData = originalContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
        context.putImageData(imageData, 0, 0);
      }
    }
    
    container.appendChild(clonedCanvas);
    document.body.appendChild(container);

    // Generate image using html2canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    // Clean up
    document.body.removeChild(container);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Erreur lors de l\'export PNG:', error);
    alert('Erreur lors de l\'export. Veuillez réessayer.');
  }
};

export const exportCanvasDirectly = (
  canvasElement: HTMLCanvasElement,
  filename: string = 'drawing'
): void => {
  try {
    // Create a new canvas with white background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasElement.width;
    exportCanvas.height = canvasElement.height;
    
    const exportContext = exportCanvas.getContext('2d');
    if (!exportContext) {
      throw new Error('Impossible de créer le contexte de canvas pour l\'export');
    }

    // Fill with white background
    exportContext.fillStyle = '#ffffff';
    exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Copy the original canvas content
    exportContext.drawImage(canvasElement, 0, 0);

    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Erreur lors de l\'export PNG direct:', error);
    alert('Erreur lors de l\'export. Veuillez réessayer.');
  }
};