import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Video2StepProps {
  totalBalance: number;
}

const Video2Step = ({ totalBalance }: Video2StepProps) => {
  const [canProceed, setCanProceed] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100;
        setWatchProgress(progress);
      }
    };

    const handleEnded = () => {
      setCanProceed(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handlePayment = () => {
    window.location.href = 'https://www.kintu.org/product/03d42200-86a5-4c5b-a547-a920c6e14fa8';
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            ASSITA O VÍDEO PARA APRENDER A FAZER<br />O PAGAMENTO
          </h1>
          <p className="text-lg font-semibold">
            SEU SALDO É DE Kz {totalBalance.toLocaleString()}KZ
          </p>
          <p className="text-muted-foreground">
            ASSITA O VÍDEO PARA APRENDER A FAZER O PAGAMENTO DA TAXA E<br />
            SACAR O SEU SALDO.
          </p>
        </div>
        
        <div className="bg-black rounded-xl overflow-hidden aspect-[9/16] max-w-sm mx-auto">
          <video 
            ref={videoRef}
            controls 
            className="w-full h-full"
            src="/videos/video2.mp4"
          >
            Seu navegador não suporta vídeo.
          </video>
        </div>
        
        {!canProceed && (
          <div className="w-full max-w-sm mx-auto bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(watchProgress, 100)}%` }}
            />
          </div>
        )}
        
        <div className="text-center">
          <Button
            onClick={handlePayment}
            disabled={!canProceed}
            className="h-14 px-8 text-lg font-semibold bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canProceed ? "PAGAR TAXA AGORA" : "Assista o vídeo completo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Video2Step;
