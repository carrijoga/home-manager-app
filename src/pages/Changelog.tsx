import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bug,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import EmptyState from '@/components/common/EmptyState';
import { FadeIn } from '@/components/common/FadeIn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  ChangelogItem,
  ChangelogType,
  CurrentVersionResponse,
  VersionHistoryItem,
} from '@/schemas/version';
import { getChangelogHistory, getCurrentVersion } from '@/services/versionService';
import { formatDateBR } from '@/utils/formatters';

type FilterType = 'ALL' | ChangelogType;

const TYPE_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; borderClass: string; icon: React.ElementType }
> = {
  Added: {
    label: 'Novidade',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/25',
    icon: Sparkles,
  },
  Fixed: {
    label: 'Correção',
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-500/25',
    icon: Bug,
  },
  Changed: {
    label: 'Melhoria',
    bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-500/25',
    icon: Wrench,
  },
  Security: {
    label: 'Segurança',
    bgClass: 'bg-violet-500/10 dark:bg-violet-500/20',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-500/25',
    icon: ShieldCheck,
  },
  Removed: {
    label: 'Removido',
    bgClass: 'bg-rose-500/10 dark:bg-rose-500/20',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-500/25',
    icon: Trash2,
  },
  Deprecated: {
    label: 'Descontinuado',
    bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-500/25',
    icon: AlertTriangle,
  },
};

function getTypeConfig(type: string) {
  return (
    TYPE_CONFIG[type] ?? {
      label: type,
      bgClass: 'bg-muted',
      textClass: 'text-muted-foreground',
      borderClass: 'border-border/50',
      icon: Tag,
    }
  );
}

export function ChangelogPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [versions, setVersions] = useState<VersionHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [currentVersionInfo, setCurrentVersionInfo] = useState<CurrentVersionResponse | null>(
    null
  );

  // Filtros em Popover
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FilterType>('ALL');

  const fetchChangelogData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * pageSize;
      const [historyData, currentInfo] = await Promise.all([
        getChangelogHistory(skip, pageSize),
        getCurrentVersion().catch(() => null),
      ]);

      setVersions(historyData.versions);
      setTotalCount(historyData.totalCount);
      setPageCount(historyData.pageCount || 1);
      if (currentInfo) {
        setCurrentVersionInfo(currentInfo);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar o histórico de versões.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChangelogData(currentPage);
  }, [currentPage, fetchChangelogData]);

  // Filtragem local por busca e tipo
  const filteredVersions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return versions
      .map((item) => {
        const matchingChangelogs = item.changelogs.filter((c: ChangelogItem) => {
          if (selectedType !== 'ALL' && c.type.toLowerCase() !== selectedType.toLowerCase()) {
            return false;
          }

          if (term) {
            const inTitle = c.title.toLowerCase().includes(term);
            const inDesc = c.description.toLowerCase().includes(term);
            const inVersion = item.version.toLowerCase().includes(term);
            return inTitle || inDesc || inVersion;
          }

          return true;
        });

        const matchesVersionDirectly = term && item.version.toLowerCase().includes(term);
        const finalChangelogs = matchesVersionDirectly ? item.changelogs : matchingChangelogs;

        if (finalChangelogs.length === 0 && !matchesVersionDirectly) {
          return null;
        }

        return {
          ...item,
          changelogs: finalChangelogs,
        };
      })
      .filter((item): item is VersionHistoryItem => item !== null);
  }, [versions, searchTerm, selectedType]);

  const hasActiveFilters = searchTerm !== '' || selectedType !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
  };

  return (
    <FadeIn>
      <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
        {/* ── 1. CABEÇALHO CENTRALIZADO E ELEGANTE ── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-7 shadow-xs">
          {/* Topo do Header: Tag à esquerda e Ações/Badges à direita */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <History className="size-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Histórico de Atualizações
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentVersionInfo && (
                <Badge variant="secondary" className="font-mono text-xs font-semibold px-2.5 py-1">
                  v{currentVersionInfo.version}
                </Badge>
              )}

              {/* Botão de Filtros */}
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={hasActiveFilters ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 gap-1.5 rounded-xl px-3 text-xs font-medium shadow-2xs"
                  >
                    <Filter className="size-3.5" />
                    <span>Filtrar</span>
                    {hasActiveFilters && (
                      <span className="flex size-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-80 rounded-2xl p-4 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Filtros de Versão
                      </span>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <RotateCcw className="size-3" />
                          <span>Limpar</span>
                        </button>
                      )}
                    </div>

                    {/* Busca */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Buscar termo ou versão..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-9 pl-8.5 rounded-xl border-border/60 text-xs"
                        />
                      </div>
                    </div>

                    {/* Tipos */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Tipo de Alteração</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'ALL', label: 'Todos' },
                          { id: 'Added', label: 'Novidades' },
                          { id: 'Fixed', label: 'Correções' },
                          { id: 'Changed', label: 'Melhorias' },
                          { id: 'Security', label: 'Segurança' },
                          { id: 'Removed', label: 'Removidos' },
                        ].map((tab) => {
                          const isActive = selectedType === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setSelectedType(tab.id as FilterType)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                isActive
                                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Título & Subtítulo */}
          <div className="mt-4 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Notas da Versão & Changelog
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Acompanhe em detalhes todas as novidades, melhorias e correções do Ninho App.
            </p>
          </div>
        </div>

        {/* ── 2. INDICADOR DE FILTROS ATIVOS ── */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">Filtro ativo:</span>
              {searchTerm && <span>Busca: "{searchTerm}"</span>}
              {selectedType !== 'ALL' && (
                <Badge variant="secondary" className="text-[10px]">
                  {getTypeConfig(selectedType).label}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 font-medium text-primary hover:underline shrink-0"
            >
              <X className="size-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        )}

        {/* ── 3. LISTA DE VERSÕES (CARDS ALINHADOS E LIMPOS) ── */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-border/40 p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertTriangle}
            title="Falha ao carregar changelog"
            description={error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchChangelogData(currentPage)}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className="size-3.5" />
                <span>Tentar novamente</span>
              </Button>
            }
          />
        ) : filteredVersions.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nenhum registro encontrado"
            description={
              hasActiveFilters
                ? 'Nenhum lançamento corresponde aos filtros selecionados.'
                : 'Nenhum histórico de versão cadastrado até o momento.'
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-2 rounded-xl"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Limpar filtros</span>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredVersions.map((item, idx) => {
              const isCurrent =
                currentVersionInfo && item.version === currentVersionInfo.version;
              const isLatest = idx === 0 && currentPage === 1;

              return (
                <motion.div
                  key={item.versionHistoryId || item.version}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="rounded-2xl border border-border/60 bg-card p-5 shadow-2xs transition-all hover:border-border"
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-foreground">
                        v{item.version}
                      </span>

                      {isCurrent && (
                        <Badge variant="default" className="text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-600 text-white">
                          Versão Atual
                        </Badge>
                      )}

                      {isLatest && !isCurrent && (
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          Mais Recente
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 text-muted-foreground/70" />
                      <span>{formatDateBR(item.releaseDate)}</span>
                    </div>
                  </div>

                  {/* Lista de Changelogs */}
                  <div className="mt-4 space-y-2.5">
                    {item.changelogs.map((changelog, cIdx) => {
                      const typeInfo = getTypeConfig(changelog.type);
                      const Icon = typeInfo.icon;

                      return (
                        <div
                          key={cIdx}
                          className="group flex flex-col gap-1 rounded-xl border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${typeInfo.bgClass} ${typeInfo.textClass} ${typeInfo.borderClass}`}
                            >
                              <Icon className="size-3 shrink-0" />
                              <span>{typeInfo.label}</span>
                            </span>
                            <h4 className="text-sm font-semibold text-foreground">
                              {changelog.title}
                            </h4>
                          </div>

                          {changelog.description && (
                            <p className="text-xs leading-relaxed text-muted-foreground pl-0.5">
                              {changelog.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── 4. PAGINAÇÃO ── */}
        {pageCount > 1 && !loading && (
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <span className="text-xs text-muted-foreground">
              Página <strong className="text-foreground">{currentPage}</strong> de{' '}
              <strong className="text-foreground">{pageCount}</strong> ({totalCount} registros)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="h-8 gap-1 rounded-xl text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>Anterior</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                className="h-8 gap-1 rounded-xl text-xs"
              >
                <span>Próxima</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

export default ChangelogPage;
