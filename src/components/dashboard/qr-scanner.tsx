
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeError, QrCodeSuccessCallback } from "html5-qrcode";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { useToast } from "@/hooks/use-toast";
import { type QrData, type QrTransaction } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CameraOff, Loader2 } from "lucide-react";

export function QrScanner({ onScanSuccess }: { onScanSuccess: () => void }) {
  const scannerRegionId = "qr-code-full-region";
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { addMultipleTransactions } = useWalletWatcher();
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Just requesting the stream is enough to check for permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop all tracks immediately to release the camera
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (err) {
        console.error("Camera permission denied.", err);
        setHasPermission(false);
      }
    };
    checkCameraPermission();
  }, []);

  useEffect(() => {
    // Only run this effect if permission has been granted and the scanner isn't already initialized.
    if (hasPermission === true && !scannerRef.current) {
        const onScanSuccessCallback: QrCodeSuccessCallback = async (decodedText, decodedResult) => {
            if (isProcessing) return;
    
            setIsProcessing(true);
            scannerRef.current?.pause();
          
            try {
              const parsedData: QrData = JSON.parse(decodedText);
          
              if (parsedData.type !== 'WalletWatcherReport' || !parsedData.data) {
                throw new Error("Invalid QR code format.");
              }
    
              const transactionsToImport = parsedData.data.map((tx: QrTransaction) => ({
                date: tx.d,
                description: tx.dsc,
                amount: tx.a,
                type: tx.t,
                categoryName: tx.c,
              }));
    
              await addMultipleTransactions(transactionsToImport);
              toast({
                  title: "Import Complete",
                  description: `${transactionsToImport.length} transactions have been added.`
              });
              onScanSuccess();
    
            } catch (error) {
              console.error("QR Scan Error:", error);
              toast({
                variant: "destructive",
                title: "Scan Failed",
                description: error instanceof Error ? error.message : "Could not read QR code.",
              });
              scannerRef.current?.resume();
            } finally {
              setIsProcessing(false);
            }
        };

        const onScanFailureCallback = (error: Html5QrcodeError) => {
            // This callback is called frequently, so we intentionally do nothing here
            // to avoid spamming the console or showing unnecessary alerts.
        };

        const qrScanner = new Html5QrcodeScanner(
            scannerRegionId,
            { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] },
            false // verbose
        );

        qrScanner.render(onScanSuccessCallback, onScanFailureCallback);
        scannerRef.current = qrScanner;
    }

    // Cleanup function to clear the scanner when the component unmounts
    return () => {
      if (scannerRef.current) {
          scannerRef.current.clear().catch(error => {
              console.error("Failed to clear html5-qrcode-scanner.", error);
          });
          scannerRef.current = null;
      }
    };
  }, [hasPermission, addMultipleTransactions, onScanSuccess, toast, isProcessing]);

  return (
    <div className="pt-4 space-y-4 relative">
      {hasPermission === null && (
         <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Checking camera permission...</p>
         </div>
      )}
       {hasPermission === false && (
        <Alert variant="destructive">
            <CameraOff className="h-4 w-4" />
          <AlertTitle>Camera Access Denied</AlertTitle>
          <AlertDescription>
            Please enable camera permissions in your browser settings to use the QR scanner.
          </AlertDescription>
        </Alert>
      )}
      {hasPermission === true && (
          <div id={scannerRegionId} className="w-full" />
      )}
       {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Processing report...</p>
        </div>
      )}
    </div>
  );
}
