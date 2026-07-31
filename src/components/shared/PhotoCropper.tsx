import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { getCroppedImg } from '../../utils/cropImage';

interface PhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function PhotoCropper({ imageSrc, onCropComplete, onCancel }: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 150);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ position: 'relative', flex: 1, width: '100%' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        
        <div style={{
          padding: '2rem 1.5rem',
          background: '#1e1b4b',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
            <span style={{ fontSize: '1.2rem' }}>🔍 Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '1rem' }} 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Annulla
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '1rem' }} 
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Salvataggio...' : 'Conferma'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
