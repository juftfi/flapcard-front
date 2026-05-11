import { forwardRef } from "react";
import butterfly from "@/assets/butterfly.png";

type Props = {
  name: string;
  professions: string[];
  imageUrl: string | null;
  imageTransform: { x: number; y: number; scale: number };
  walletAddress?: string;
};

export const FlapCardPreview = forwardRef<HTMLDivElement, Props>(
  ({ name, professions, imageUrl, imageTransform, walletAddress }, ref) => {
    const shortWallet = walletAddress
      ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
      : "0xFLAP…CARD";

    return (
      <div
        ref={ref}
        className="relative aspect-[1.586/1] w-full max-w-[480px] rounded-3xl bg-grad-card shadow-card-premium overflow-hidden text-primary-foreground select-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Grain & shine */}
        <div className="absolute inset-0 grain opacity-30" />
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />

        {/* Top row */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img src={butterfly} alt="" width={36} height={36} className="drop-shadow" />
            <span className="font-display font-bold text-lg tracking-tight">FLAP</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Member</div>
            <div className="text-xs font-mono opacity-90">{shortWallet}</div>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 h-24 w-24 rounded-2xl overflow-hidden border border-black/20 bg-black/10 shadow-inner">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{
                transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale})`,
                transformOrigin: "center",
              }}
              draggable={false}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs opacity-60">
              Add photo
            </div>
          )}
        </div>

        {/* Name & professions */}
        <div className="absolute left-32 right-5 top-1/2 -translate-y-1/2">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Holder</div>
          <div className="font-display font-bold text-2xl leading-tight truncate">
            {name || "Your Name"}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(professions.filter(Boolean).length > 0
              ? professions.filter(Boolean)
              : ["Web3 Identity"]
            ).slice(0, 3).map((p, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-black/15 backdrop-blur-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div className="text-[10px] uppercase tracking-[0.25em] opacity-70">
            Flap Card · BSC
          </div>
          <div className="font-display italic text-xl font-semibold opacity-90">VISA-like</div>
        </div>
      </div>
    );
  },
);

FlapCardPreview.displayName = "FlapCardPreview";
