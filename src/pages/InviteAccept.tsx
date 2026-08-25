import { CheckCircle2, Loader2, UserCheck, UserPlus, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import * as nestService from '@/services/nestService';

type Status = 'loading' | 'unauthenticated' | 'success' | 'already_member' | 'error';

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, sessionChecked, refreshNests } = useApp();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const attempted = useRef(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!sessionChecked) return;
    if (attempted.current) return;

    if (!token) {
      attempted.current = true;
      setErrorMessage('Token de convite não encontrado na URL.');
      setStatus('error');
      return;
    }

    // Guardar o token na sessão para recuperar após login/registro se necessário
    sessionStorage.setItem('pending_invite_token', token);

    // Se o usuário não estiver autenticado, exibe a tela de boas-vindas ao convite
    if (!user) {
      attempted.current = true;
      setStatus('unauthenticated');
      return;
    }

    // Usuário está logado — tentar aceitar o convite
    attempted.current = true;
    setStatus('loading');

    nestService
      .acceptInvite(token)
      .then(async () => {
        sessionStorage.removeItem('pending_invite_token');
        await refreshNests();
        setStatus('success');
        setTimeout(() => navigate('/dashboard', { replace: true }), 2500);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '';
        const isAlreadyMember =
          msg.toLowerCase().includes('já') ||
          msg.toLowerCase().includes('membro') ||
          msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('pertence');

        if (isAlreadyMember) {
          sessionStorage.removeItem('pending_invite_token');
          setStatus('already_member');
        } else {
          setErrorMessage(
            msg || 'Não foi possível aceitar o convite. Ele pode ter expirado ou já foi utilizado.'
          );
          setStatus('error');
        }
      });
  }, [token, user, sessionChecked, refreshNests, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card p-8 text-center shadow-xl sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Logo size="medium" showText={false} />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Processando convite...</h1>
              <p className="mt-1 text-sm text-muted-foreground">Aguarde um momento.</p>
            </div>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="size-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Você recebeu um convite! 🪺</h1>
              <p className="text-sm text-muted-foreground">
                Você foi convidado para participar de um Ninho no Home Manager. Para continuar e
                aceitar o convite, entre na sua conta ou crie uma nova.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => navigate(`/register?inviteToken=${encodeURIComponent(token || '')}`)}
                className="h-11 w-full font-semibold"
              >
                Criar uma conta gratuita
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/login?inviteToken=${encodeURIComponent(token || '')}`)}
                className="h-11 w-full"
              >
                Já tenho uma conta (Fazer Login)
              </Button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto size-14 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bem-vindo ao Ninho! 🪺</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Convite aceito com sucesso! Redirecionando para o seu painel...
              </p>
            </div>
          </div>
        )}

        {status === 'already_member' && (
          <div className="space-y-6">
            <UserCheck className="mx-auto size-14 text-primary" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Você já está neste Ninho! 🪺</h1>
              <p className="text-sm text-muted-foreground">
                Sua conta já é membro deste ninho e tem acesso a todas as tarefas, finanças e
                configurações compartilhadas.
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="h-11 w-full font-semibold"
            >
              Ir para o Painel
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="mx-auto size-14 text-destructive" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Convite Inválido</h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button
              onClick={() => navigate('/dashboard', { replace: true })}
              variant="outline"
              className="h-11 w-full"
            >
              Ir para o Início
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
