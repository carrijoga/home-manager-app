import { Check, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui';
import {
  getKoboyoAvatarUrl,
  KOBOYO_AVATAR_NAMES,
  KOBOYO_FACE_SLUGS,
} from '@/constants/koboyoAvatars';
import * as settingsService from '@/services/settingsService';

interface KoboyoAvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSlug?: string | null;
  onSelectAvatar: (slug: string) => Promise<void>;
}

export function KoboyoAvatarPickerModal({
  open,
  onOpenChange,
  currentSlug,
  onSelectAvatar,
}: KoboyoAvatarPickerModalProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(currentSlug || 'face-beaming');
  const [avatarSlugs, setAvatarSlugs] = useState<string[]>(KOBOYO_FACE_SLUGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (currentSlug) {
      setSelectedSlug(currentSlug);
    }
  }, [currentSlug, open]);

  // Carrega os avatares disponíveis do endpoint GET /api/users/avatar-options
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setIsLoadingOptions(true);
    settingsService
      .getAvatarOptions()
      .then((options) => {
        if (isMounted && options && options.length > 0) {
          setAvatarSlugs(options);
        }
      })
      .catch(() => {
        // Se falhar a busca na API, mantém a lista padrão local
      })
      .finally(() => {
        if (isMounted) setIsLoadingOptions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const filteredSlugs = useMemo(() => {
    if (!searchQuery.trim()) return avatarSlugs;
    const q = searchQuery.toLowerCase().trim();
    return avatarSlugs.filter((slug) => {
      const name = KOBOYO_AVATAR_NAMES[slug]?.toLowerCase() || '';
      return slug.toLowerCase().includes(q) || name.includes(q);
    });
  }, [searchQuery, avatarSlugs]);

  const handleConfirm = async () => {
    if (!selectedSlug) return;
    setIsSubmitting(true);
    try {
      await onSelectAvatar(selectedSlug);
      onOpenChange(false);
    } catch {
      toast.error('Erro ao alterar o avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl p-0">
        {/* Header */}
        <DialogHeader className="border-b p-5 pb-3">
          <DialogTitle className="text-xl font-semibold">Escolha seu avatar</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Selecione uma das ilustrações para o seu perfil no Ninho.
          </DialogDescription>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar avatar (ex: radiante, fone, robô, festa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-2xl pl-9 pr-8 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Grid de Ícones com Fundo Branco */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoadingOptions && avatarSlugs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Carregando avatares...</p>
            </div>
          ) : filteredSlugs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum avatar encontrado para &quot;{searchQuery}&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filteredSlugs.map((slug) => {
                const isSelected = selectedSlug === slug;
                const name = KOBOYO_AVATAR_NAMES[slug] || slug;
                const avatarUrl = getKoboyoAvatarUrl(slug);

                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setSelectedSlug(slug)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl border bg-white p-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'scale-[1.03] border-primary shadow-md ring-2 ring-primary/30'
                        : 'shadow-xs border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Badge de Selecionado */}
                    {isSelected && (
                      <div className="absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5 text-primary-foreground shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Imagem SVG em Fundo Branco Limpo */}
                    <div className="my-1 flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1">
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="h-full w-auto max-w-full object-contain drop-shadow-sm filter transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Nome do Ícone */}
                    <span className="mt-1 line-clamp-1 w-full text-center text-[11px] font-medium text-slate-700">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between gap-2 border-t bg-muted/30 p-4 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-w-[130px] rounded-2xl"
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedSlug}
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar Avatar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
