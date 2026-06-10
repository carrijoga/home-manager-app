import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import * as nestService from '@/services/nestService';

type Status = 'loading' | 'success' | 'error';

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshNests } = useApp();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const attempted = useRef(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setErrorMessage('Token de convite não encontrado na URL.');
      setStatus('error');
      return;
    }

    nestService.acceptInvite(token)
      .then(async () => {
        await refreshNests();
        setStatus('success');
        setTimeout(() => navigate('/dashboard', { replace: true }), 2500);
      })
      .catch(err => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Não foi possível aceitar o convite. Ele pode ter expirado ou já foi utilizado.'
        );
        setStatus('error');
      });
  }, [token, refreshNests, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="size-12 text-primary animate-spin mx-auto" />
            <div>
              <h1 className="text-xl font-semibold">Aceitando convite...</h1>
              <p className="text-muted-foreground text-sm mt-1">Aguarde um momento.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="size-12 text-green-500 mx-auto" />
            <div>
              <h1 className="text-xl font-semibold">Bem-vindo ao ninho! 🪺</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Convite aceito com sucesso. Redirecionando...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="size-12 text-destructive mx-auto" />
            <div>
              <h1 className="text-xl font-semibold">Convite inválido</h1>
              <p className="text-muted-foreground text-sm mt-1">{errorMessage}</p>
            </div>
            <Button onClick={() => navigate('/dashboard', { replace: true })}>
              Ir para o início
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
