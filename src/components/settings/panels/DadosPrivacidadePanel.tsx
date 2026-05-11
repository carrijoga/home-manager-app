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
  Separator,
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
      <div>
        <h2 className="text-lg font-semibold">Dados & Privacidade</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seus dados e configurações de privacidade.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Dados</h3>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
            Exportar dados
          </Button>
          <Badge variant="secondary">Em breve</Badge>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Limpar dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os seus dados serão apagados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                disabled={isClearingData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isClearingData ? 'Limpando...' : 'Sim, limpar tudo'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Privacidade</h3>

        <div className="flex items-start gap-3">
          <Checkbox
            id="anonymous-sharing"
            checked={anonymousSharing}
            onCheckedChange={(checked) => handlePrivacyToggle(Boolean(checked))}
            disabled={isUpdatingPrivacy}
          />
          <div className="space-y-1">
            <label htmlFor="anonymous-sharing" className="text-sm font-medium cursor-pointer">
              Compartilhamento de dados anônimos
            </label>
            <p className="text-xs text-muted-foreground">
              Ajude a melhorar o Ninho enviando dados de uso anônimos. Nenhuma informação pessoal é compartilhada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
