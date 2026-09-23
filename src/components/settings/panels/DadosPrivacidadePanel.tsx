import { Download, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Checkbox,
  Label,
} from '@/components/ui';
import * as settingsService from '@/services/settingsService';

export function DadosPrivacidadePanel() {
  const [anonymousSharing, setAnonymousSharing] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  const handlePrivacyToggle = async (checked: boolean) => {
    setAnonymousSharing(checked);
    setIsUpdatingPrivacy(true);
    try {
      await settingsService.updatePrivacySettings({ anonymousDataSharing: checked });
    } catch {
      setAnonymousSharing(!checked);
      toast.error('Erro ao atualizar configurações de privacidade.');
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const handleClearData = async () => {
    setIsClearingData(true);
    try {
      await settingsService.clearData();
      toast.success('Dados limpos com sucesso.');
    } catch {
      toast.error('Erro ao limpar dados.');
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Privacidade & Dados
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Dados & Privacidade</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o armazenamento de dados, exportação de arquivos e preferências de telemetria.
        </p>
      </div>

      {/* Data Management Section Card */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Gerenciamento de Dados</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Faça download ou limpe as informações armazenadas no seu perfil local.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2 rounded-xl border-border/50"
            >
              <Download className="size-4" />
              <span>Exportar Dados</span>
            </Button>
            <Badge variant="secondary" className="rounded-md text-[10px]">
              Em breve
            </Badge>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 rounded-xl shadow-xs"
              >
                <Trash2 className="size-4" />
                <span>Limpar Dados do Perfil</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="size-5" />
                  <span>Limpar todos os dados?</span>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Esta ação é irreversível. Todos os dados temporários e preferências salvas serão apagados do seu navegador.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  disabled={isClearingData}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isClearingData ? 'Limpando...' : 'Sim, limpar tudo'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Privacy Settings Section Card */}
      <section className="space-y-3 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Telemetria & Diagnósticos</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Contribua com a melhoria contínua da estabilidade e experiência do Ninho.
          </p>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id="anonymous-sharing"
            checked={anonymousSharing}
            onCheckedChange={(checked) => handlePrivacyToggle(Boolean(checked))}
            disabled={isUpdatingPrivacy}
          />
          <div className="space-y-1">
            <Label htmlFor="anonymous-sharing" className="cursor-pointer text-xs font-semibold text-foreground">
              Compartilhar dados anônimos de uso
            </Label>
            <p className="text-xs text-muted-foreground">
              Ajude-nos a identificar falhas enviando estatísticas de uso completamente anônimas. Nenhuma informação pessoal ou financeira é coletada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

