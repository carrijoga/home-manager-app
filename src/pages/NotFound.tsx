import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  CheckSquare,
  Compass,
  Home,
  ShieldCheck,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useApp();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }
  };

  const quickLinks = [
    { label: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { label: 'Compras', path: '/shopping', icon: ShoppingCart },
    { label: 'Finanças', path: '/financial', icon: Wallet },
    { label: 'Calendário', path: '/calendar', icon: CalendarDays },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Cabeçalho */}
      <header className="flex w-full items-center justify-between px-6 py-6 sm:px-10">
        <Link
          to={user ? '/dashboard' : '/login'}
          className="rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Voltar para a página inicial"
        >
          <Logo size="default" showText={true} />
        </Link>
        <ThemeToggle />
      </header>

      {/* Conteúdo Central */}
      <main className="flex w-full flex-1 items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          <Card className="flex flex-col items-center border border-border/60 bg-card p-6 text-center shadow-sm sm:p-10">
            {/* Ilustração animada do Ninho */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="relative mb-6 flex items-center justify-center"
            >
              {/* Círculo com efeito de glow/gradiente */}
              <div className="absolute h-32 w-32 rounded-full bg-primary/10 blur-xl dark:bg-primary/20" />

              {/* SVG estilizado de Ninho e 404 */}
              <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-border/80 bg-background/80 shadow-sm backdrop-blur-sm">
                <svg
                  viewBox="0 0 80 80"
                  className="h-20 w-20 text-foreground"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Fundo sutil do ninho */}
                  <circle cx="40" cy="40" r="36" fill="#8B5A3C" fillOpacity="0.08" />

                  {/* Ninho */}
                  <ellipse cx="40" cy="48" rx="22" ry="10" fill="#8B5A3C" />
                  <ellipse cx="40" cy="51" rx="20" ry="8" fill="#654321" />

                  {/* Galhos cruzados */}
                  <path
                    d="M 20 48 Q 24 45 28 48"
                    stroke="#654321"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 32 46 Q 36 43 40 46"
                    stroke="#654321"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 48 46 Q 52 43 56 46"
                    stroke="#654321"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 52 49 Q 56 47 60 49"
                    stroke="#654321"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* Pequena folha brotando */}
                  <path
                    d="M 22 40 Q 18 36 20 33"
                    stroke="#52B788"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <ellipse
                    cx="19"
                    cy="34"
                    rx="3"
                    ry="4.5"
                    fill="#52B788"
                    opacity="0.8"
                    transform="rotate(-25 19 34)"
                  />

                  {/* Ponto de interrogação / elemento flutuante sobre o ninho */}
                  <path
                    d="M 36 26 C 36 21.5, 44 21.5, 44 26 C 44 29, 40 30, 40 33"
                    stroke="#E07A5F"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <circle cx="40" cy="38.5" r="2" fill="#E07A5F" />
                </svg>
              </div>
            </motion.div>

            {/* Badge 404 */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>404 • Página não encontrada</span>
            </div>

            {/* Título & Mensagem */}
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ops! Esse cantinho não existe
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Parece que a página que você tentou acessar voou para longe, mudou de endereço ou
              nunca existiu no seu Ninho.
            </p>

            {/* Ações Principais */}
            <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="default" className="w-full sm:w-auto">
                <Link to={user ? '/dashboard' : '/login'}>
                  <Home className="mr-2 h-4 w-4" />
                  {user ? 'Ir para o Dashboard' : 'Ir para o Início'}
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à página anterior
              </Button>
            </div>

            {/* Atalhos Rápidos (caso o usuário esteja autenticado) */}
            {user && (
              <div className="mt-8 w-full border-t border-border/60 pt-6">
                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Atalhos rápidos para seu Ninho
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {quickLinks.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <IconComponent className="h-4 w-4 text-primary" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </main>

      {/* Rodapé */}
      <footer className="w-full py-4 text-center text-[11px] text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Ambiente seguro • Ninho Home</span>
        </div>
      </footer>
    </div>
  );
}
