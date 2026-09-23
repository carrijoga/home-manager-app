import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { resolveUserAvatar } from '@/constants/koboyoAvatars';
import { cn } from '@/lib/utils';
import type { NestMember } from '@/schemas/nest';

interface MemberMultiSelectProps {
  members: NestMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MemberMultiSelect({
  members,
  selectedIds,
  onChange,
  placeholder = 'Selecione os responsáveis...',
  className,
}: MemberMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter((id) => id !== memberId));
    } else {
      onChange([...selectedIds, memberId]);
    }
  };

  const removeMember = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== memberId));
  };

  const selectedMembers = members.filter((m) => selectedIds.includes(m.userId));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex min-h-[48px] h-auto w-full items-center justify-between rounded-2xl border-border/40 bg-muted/30 px-3 py-2 text-left font-normal shadow-none hover:bg-muted/40 focus:ring-2 focus:ring-primary',
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
            {selectedMembers.length === 0 ? (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            ) : (
              selectedMembers.map((m) => {
                const avatarSrc = resolveUserAvatar(m.photoUrl, m.avatarSlug);
                return (
                  <span
                    key={m.userId}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2 py-0.5 text-xs font-medium text-foreground shadow-2xs"
                  >
                    <Avatar className="size-4 rounded-full">
                      {avatarSrc && <AvatarImage src={avatarSrc} alt={m.name} />}
                      <AvatarFallback className="text-[8px]">
                        {m.name?.substring(0, 1).toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[100px]">{m.name?.split(' ')[0]}</span>
                    <button
                      type="button"
                      onClick={(e) => removeMember(m.userId, e)}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-lg border-border/60" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
            <CommandGroup>
              {members.map((member) => {
                const isSelected = selectedIds.includes(member.userId);
                const avatarSrc = resolveUserAvatar(member.photoUrl, member.avatarSlug);
                return (
                  <CommandItem
                    key={member.userId}
                    onSelect={() => toggleMember(member.userId)}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-xl"
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-md border border-primary transition-colors',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="size-3" />
                    </div>
                    <Avatar className="size-6 rounded-full">
                      {avatarSrc && <AvatarImage src={avatarSrc} alt={member.name} />}
                      <AvatarFallback className="text-xs">
                        {member.name?.substring(0, 1).toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {member.name}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
