import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Upload, Plus, X, Download, Sparkles, Twitter, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { FlapCardPreview } from "@/components/FlapCardPreview";
import { connectWallet, mintFlapCard, MINT_FEE_BNB } from "@/lib/wallet";
import butterfly from "@/assets/butterfly.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flap Card — Premium NFT Identity Cards on BSC" },
      {
        name: "description",
        content:
          "Mint your personalized butterfly-themed identity NFT on Binance Smart Chain. Premium Web3 cards for the new era.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [address, setAddress] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [professions, setProfessions] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, scale: 1 });
  const [minting, setMinting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { address } = await connectWallet();
      setAddress(address);
      toast.success("Wallet connected", { description: shortAddr(address) });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    if (!address) {
      handleConnect();
      return;
    }
    if (!name.trim()) {
      toast.error("Enter a name first");
      return;
    }
    try {
      setMinting(true);
      toast.message("Confirm in your wallet…");
      const tx = await mintFlapCard({
        name,
        professions: professions.filter(Boolean),
        hasImage: !!imageUrl,
      });
      toast.loading("Minting your Flap Card…", { id: tx.hash });
      await tx.wait();
      toast.success("Flap Card minted!", {
        id: tx.hash,
        description: `Tx: ${tx.hash.slice(0, 10)}…`,
      });
    } catch (e: any) {
      toast.error(e?.shortMessage ?? e?.message ?? "Mint failed");
    } finally {
      setMinting(false);
    }
  };

  const downloadCard = async () => {
    // simple canvas-less approach: use html2canvas-lite via DOM-to-image trick is heavy;
    // instead open print-friendly window with the SVG. We provide a quick PNG via
    // built-in SVG screenshot using foreignObject would be complex — so just toast.
    toast.success("Card preview is live — screenshot to save, or mint to keep on-chain ✨");
  };

  const updateProfession = (i: number, v: string) => {
    setProfessions((arr) => arr.map((p, idx) => (idx === i ? v : p)));
  };

  const onCardMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onCardMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setPos((p) => ({
      ...p,
      x: dragRef.current!.ox + (e.clientX - dragRef.current!.startX),
      y: dragRef.current!.oy + (e.clientY - dragRef.current!.startY),
    }));
  };
  const endDrag = () => (dragRef.current = null);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Toaster theme="dark" position="top-right" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[140px]" />

      {/* Header */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={butterfly} alt="Flap Card" width={40} height={40} className="animate-float" />
          <div>
            <div className="font-display font-bold text-xl tracking-tight">Flap Card</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Web3 Identity · BSC
            </div>
          </div>
        </div>
        <Button
          onClick={handleConnect}
          disabled={connecting}
          variant={address ? "secondary" : "default"}
          className={
            address
              ? "rounded-full font-mono"
              : "rounded-full bg-grad-primary text-primary-foreground hover:opacity-90 shadow-glow"
          }
        >
          {connecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {address ? shortAddr(address) : "Connect Wallet"}
        </Button>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-8 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Mint your identity on Binance Smart Chain
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-5 text-5xl md:text-6xl font-display font-bold text-balance"
        >
          Your identity, <span className="bg-grad-primary bg-clip-text text-transparent">reborn</span>.
        </motion.h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-balance">
          Design a premium Visa-style NFT card with a butterfly soul. Mint forever on-chain for{" "}
          <span className="text-primary font-semibold">{MINT_FEE_BNB} BNB</span>.
        </p>
      </section>

      {/* Studio */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
        {/* Left: card preview */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateX: 8 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ rotateY: 4, rotateX: -3, scale: 1.02 }}
            onMouseDown={onCardMouseDown}
            onMouseMove={onCardMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            className="mx-auto cursor-grab active:cursor-grabbing"
            style={{ perspective: 1200 }}
          >
            <FlapCardPreview
              ref={cardRef}
              name={name}
              professions={professions}
              imageUrl={imageUrl}
              imageTransform={pos}
              walletAddress={address ?? undefined}
            />
          </motion.div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Photo</Label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
                />
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/25 transition">
                  <Upload className="h-3.5 w-3.5" /> Upload image
                </span>
              </label>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Zoom</Label>
              <Slider
                value={[pos.scale * 100]}
                min={50}
                max={250}
                step={1}
                onValueChange={(v) => setPos((p) => ({ ...p, scale: v[0] / 100 }))}
                className="mt-2"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Drag on the card to reposition · scroll the zoom slider to scale.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Card Details</h2>
            <p className="text-sm text-muted-foreground">Live preview updates as you type.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Satoshi Nakamoto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={28}
              className="bg-input/60 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Professions</Label>
            {professions.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={i === 0 ? "Founder" : "Add another…"}
                  value={p}
                  onChange={(e) => updateProfession(i, e.target.value)}
                  maxLength={24}
                  className="bg-input/60 border-border"
                />
                {professions.length > 1 && (
                  <button
                    onClick={() =>
                      setProfessions((arr) => arr.filter((_, idx) => idx !== i))
                    }
                    className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {professions.length < 3 && (
              <button
                onClick={() => setProfessions((a) => [...a, ""])}
                className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80"
              >
                <Plus className="h-3.5 w-3.5" /> Add profession
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-secondary/60 border border-border p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Mint Fee
              </div>
              <div className="font-display text-xl font-bold">{MINT_FEE_BNB} BNB</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Chain</div>
              <div className="font-medium text-sm">BNB Smart Chain</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleMint}
              disabled={minting}
              className="flex-1 h-12 rounded-2xl bg-grad-primary text-primary-foreground font-semibold text-base hover:opacity-95 shadow-glow"
            >
              {minting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Minting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Mint Flap Card
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={downloadCard}
              className="h-12 rounded-2xl"
              aria-label="Save preview"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            By minting you agree to commit your card metadata to BSC. Gas fees apply.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <img src={butterfly} alt="" width={20} height={20} />© FlapCard
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-primary transition">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Telegram" className="hover:text-primary transition">
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
