import { CheckCircle2, KeyRound, Loader2, UserCheck, UserPlus, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import * as nestService from '@/services/nestService';

type Status = 'loading' | 'unauthenticated' | 'success' | 'already_member' | 'error' | 'input_code';

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, sessionChecked, refreshNests } = useApp();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const attempted = useRef(false);

  const token = searchParams.get('token');
  const codeParam = searchParams.get('code');

  const processInvite = useCallback(
    async (inviteToken: string | null, inviteCode: string | null) => {
      setStatus('loading');
      setErrorMessage('');

      try {
        if (inviteCode) {
          sessionStorage.removeItem('pending_invite_code');
          await nestService.joinNestByCode(inviteCode);
        } else if (inviteToken) {
          sessionStorage.removeItem('pending_invite_token');
          await nestService.acceptInvite(inviteToken);
        }
        await refreshNests();
        setStatus('success');
        setTimeout(() => navigate('/dashboard', { replace: true }), 2500);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        const isAlreadyMember =
          msg.toLowerCase().includes('já') ||
          msg.toLowerCase().includes('membro') ||
          msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('pertence');

        if (isAlreadyMember) {
          if (inviteCode) sessionStorage.removeItem('pending_invite_code');
          if (inviteToken) sessionStorage.removeItem('pending_invite_token');
          setStatus('already_member');
        } else {
          setErrorMessage(
            msg || 'Não foi possível aceitar o convite. O código/token pode estar inválido ou expirado.'
          );
          setStatus('error');
        }
      }
    },
    [refreshNests, navigate]
  );

  useEffect(() => {
    if (!sessionChecked) return;
    if (attempted.current) return;

    if (!token && !codeParam) {
      attempted.current = true;
      setStatus('input_code');
      return;
    }

    if (codeParam) {
      sessionStorage.setItem('pending_invite_code', codeParam);
    }
    if (token) {
      sessionStorage.setItem('pending_invite_token', token);
    }

    if (!user) {
      attempted.current = true;
      setStatus('unauthenticated');
      return;
    }

    attempted.current = true;
    processInvite(token, codeParam);
  }, [token, codeParam, user, sessionChecked, processInvite]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = manualCode.trim();
    if (!cleanCode) return;

    if (!user) {
      sessionStorage.setItem('pending_invite_code', cleanCode);
      navigate(`/login?inviteCode=${encodeURIComponent(cleanCode)}`);
      return;
    }

    setSubmittingCode(true);
    await processInvite(null, cleanCode);
    setSubmittingCode(false);
  };

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

        {status === 'input_code' && (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Entrar no Ninho</h1>
              <p className="text-sm text-muted-foreground">
                Digite o código de convite de 6 dígitos que você recebeu para se juntar ao ninho.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
              <Input
                type="text"
                placeholder="Ex: ABC123"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="h-12 text-center text-lg uppercase tracking-widest font-mono border-border/60"
                maxLength={20}
                required
              />

              <Button
                type="submit"
                disabled={submittingCode || !manualCode.trim()}
                className="h-11 w-full font-semibold"
              >
                {submittingCode ? <Loader2 className="size-5 animate-spin" /> : 'Aceitar Convite'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="h-11 w-full"
              >
                Voltar para o Início
              </Button>
            </form>
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
                onClick={() =>
                  navigate(
                    `/register?${
                      codeParam
                        ? `inviteCode=${encodeURIComponent(codeParam)}`
                        : `inviteToken=${encodeURIComponent(token || '')}`
                    }`
                  )
                }
                className="h-11 w-full font-semibold"
              >
                Criar uma conta gratuita
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    `/login?${
                      codeParam
                        ? `inviteCode=${encodeURIComponent(codeParam)}`
                        : `inviteToken=${encodeURIComponent(token || '')}`
                    }`
                  )
                }
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
            <div className="space-y-2">
              <Button
                onClick={() => setStatus('input_code')}
                className="h-11 w-full font-semibold"
              >
                Tentar outro código
              </Button>
              <Button
                onClick={() => navigate('/dashboard', { replace: true })}
                variant="outline"
                className="h-11 w-full"
              >
                Ir para o Início
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
