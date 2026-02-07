"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface H1ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeFT: number | null;
  awayFT: number | null;
  initialHomeH1: number | null;
  initialAwayH1: number | null;
  onSave: (eventId: string, homeH1: number, awayH1: number) => Promise<void>;
}

export function H1ScoreModal({
  isOpen,
  onClose,
  eventId,
  homeTeam,
  awayTeam,
  homeFT,
  awayFT,
  initialHomeH1,
  initialAwayH1,
  onSave,
}: H1ScoreModalProps) {
  const [homeH1, setHomeH1] = useState<number>(initialHomeH1 ?? 0);
  const [awayH1, setAwayH1] = useState<number>(initialAwayH1 ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset values when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setHomeH1(initialHomeH1 ?? 0);
      setAwayH1(initialAwayH1 ?? 0);
      setError(null);
    }
  }, [isOpen, initialHomeH1, initialAwayH1]);

  // Calculate H2 scores
  const homeH2 = homeFT !== null ? homeFT - homeH1 : null;
  const awayH2 = awayFT !== null ? awayFT - awayH1 : null;

  // Validation
  const isValid = () => {
    if (homeH1 < 0 || awayH1 < 0) return false;
    if (homeFT !== null && homeH1 > homeFT) return false;
    if (awayFT !== null && awayH1 > awayFT) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isValid()) {
      setError("Le score MT1 ne peut pas depasser le score final");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(eventId, homeH1, awayH1);
      onClose();
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      console.error("Error saving H1 score:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Score Mi-Temps (MT1)</DialogTitle>
          <DialogDescription>
            Saisissez le score a la mi-temps pour calculer les resultats des paris H1/H2.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Full-time score display */}
          <div className="text-center p-2 bg-slate-100 rounded-md">
            <span className="text-xs text-muted-foreground">Score Final</span>
            <div className="font-bold text-lg">
              {homeFT ?? "-"} - {awayFT ?? "-"}
            </div>
          </div>

          {/* H1 Score inputs */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="w-32 text-sm truncate" title={homeTeam}>
                {homeTeam}
              </Label>
              <Input
                type="number"
                min={0}
                max={homeFT ?? undefined}
                value={homeH1}
                onChange={(e) => setHomeH1(parseInt(e.target.value) || 0)}
                className="w-20 text-center"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-32 text-sm truncate" title={awayTeam}>
                {awayTeam}
              </Label>
              <Input
                type="number"
                min={0}
                max={awayFT ?? undefined}
                value={awayH1}
                onChange={(e) => setAwayH1(parseInt(e.target.value) || 0)}
                className="w-20 text-center"
              />
            </div>
          </div>

          {/* H2 Score display (calculated) */}
          {homeH2 !== null && awayH2 !== null && homeH2 >= 0 && awayH2 >= 0 && (
            <div className="text-center p-2 bg-blue-50 rounded-md">
              <span className="text-xs text-muted-foreground">MT2 (calcule)</span>
              <div className="font-medium text-blue-700">
                {homeH2} - {awayH2}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-center text-sm text-red-600">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !isValid()}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
