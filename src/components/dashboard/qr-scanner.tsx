
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    if (hasPermission === null || !hasPermission || scannerRef.current) {
      return;
    }

    const onScanSuccessCallback: QrCodeSuccessCallback = async (decodedText, decodedResult) => {
        if (isProcessing) return;

        scannerRef.current?.pause();
        setIsProcessing(true);
      
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
        // This is called frequently, so we don't want to show a toast here.
        // console.warn(`QR error = ${error}`);
    };

    const qrScanner = new Html5QrcodeScanner(
      scannerRegionId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false // verbose
    );

    qrScanner.render(onScanSuccessCallback, onScanFailureCallback);
    scannerRef.current = qrScanner;

    return () => {
      scannerRef.current?.clear().catch(error => {
        console.error("Failed to clear html5-qrcode-scanner.", error);
      });
      scannerRef.current = null;
    };
  }, [hasPermission, addMultipleTransactions, onScanSuccess, toast, isProcessing]);

  return (
    <div className="pt-4 space-y-4">
      {hasPermission === null && (
         <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
       {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Processing report...</p>
        </div>
      )}
      <div id={scannerRegionId} className="w-full" />
    </div>
  );
}
