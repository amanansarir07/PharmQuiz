"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  buildShareMessage,
  generateShareCard,
  type ShareCardData,
} from "@/lib/share-card";
import {
  Share2,
  Download,
  Copy,
  Check,
  Loader2,
  MessageCircle,
} from "lucide-react";

interface ShareResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareCardData;
}

async function canvasToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type: "image/png" });
}

export function ShareResultDialog({
  open,
  onOpenChange,
  data,
}: ShareResultDialogProps) {
  const [card, setCard] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setCopied(false);
    generateShareCard(data)
      .then((url) => {
        if (!cancelled) setCard(url);
      })
      .catch((err) => {
        console.error("share card generation failed:", err);
        if (!cancelled) setError("Couldn't generate the card on this device.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, data]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://bujh.app";
  const message = buildShareMessage(data, origin);

  const fileShareSupported =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    typeof navigator.share === "function";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("copy failed:", err);
    }
  };

  const handleDownload = () => {
    if (!card) return;
    const a = document.createElement("a");
    a.href = card;
    a.download = "bujh-score.png";
    a.click();
  };

  const handleShare = async () => {
    if (!card) return;
    // Share the actual card image where the platform supports it (mobile share sheet incl. WhatsApp).
    if (fileShareSupported) {
      try {
        const file = await canvasToFile(card, "bujh-score.png");
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Bujh score",
            text: message,
          });
          return;
        }
      } catch (err) {
        // User cancelled the sheet or sharing failed — fall through to WhatsApp link.
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("native share failed:", err);
      }
    }
    // Fallback: WhatsApp share with the score text.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share your score
          </DialogTitle>
          <DialogDescription>
            Challenge your friends — post this card in your WhatsApp groups.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          {card ? (
            <img
              src={card}
              alt="Your Bujh score card"
              className="mx-auto w-auto h-auto max-w-full max-h-[62vh] rounded-lg ring-1 ring-foreground/10"
            />
          ) : error ? (
            <p className="py-10 text-sm text-muted-foreground">{error}</p>
          ) : (
            <div className="flex h-[420px] w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button onClick={handleShare} disabled={!card || busy} className="flex-1">
            <MessageCircle className="mr-2 h-4 w-4" />
            Share on WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!card}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!message}
            className="flex-1"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy text"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
