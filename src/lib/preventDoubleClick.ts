/**
 * Utilitário global para prevenção de cliques duplos e múltiplos acionamentos acidentais.
 * Bloqueia cliques duplicados em botões e submissões repetidas de formulários
 * dentro de uma janela de tempo ou enquanto uma ação assíncrona estiver pendente.
 */

const DEFAULT_DEBOUNCE_MS = 200;
const lastClickMap = new WeakMap<Element, number>();
const lastFormSubmitMap = new WeakMap<HTMLFormElement, number>();

export function initGlobalClickProtection(debounceMs: number = DEFAULT_DEBOUNCE_MS): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const handleClickCapture = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (!target) return;

    // Localiza o botão correspondente (se houver)
    const button = target.closest<HTMLElement>(
      'button, [role="button"], input[type="submit"], input[type="button"]'
    );
    if (!button) return;

    // Elementos interativos de controle ou abas não devem sofrer supressão de clique
    const role = button.getAttribute('role');
    if (
      role === 'tab' ||
      role === 'checkbox' ||
      role === 'radio' ||
      role === 'switch' ||
      role === 'menuitem' ||
      role === 'combobox' ||
      button.hasAttribute('data-state') ||
      button.dataset.allowDoubleClick === 'true' ||
      button.dataset.allowRapidClicks === 'true' ||
      button.dataset.stepper === 'true'
    ) {
      return;
    }

    // Se o botão já está desabilitado ou marcado como ocupado
    if (
      button.hasAttribute('disabled') ||
      button.getAttribute('aria-disabled') === 'true' ||
      button.getAttribute('aria-busy') === 'true' ||
      button.dataset.busy === 'true'
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const now = Date.now();
    const lastClickTime = lastClickMap.get(button) ?? 0;

    if (now - lastClickTime < debounceMs) {
      // Bloqueia clique duplicado rápido
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    lastClickMap.set(button, now);
  };

  const handleSubmitCapture = (event: SubmitEvent) => {
    const form = event.target as HTMLFormElement | null;
    if (!form || !(form instanceof HTMLFormElement)) return;

    if (form.dataset.allowDuplicateSubmit === 'true') {
      return;
    }

    const now = Date.now();
    const lastSubmitTime = lastFormSubmitMap.get(form) ?? 0;

    if (now - lastSubmitTime < debounceMs) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    lastFormSubmitMap.set(form, now);
  };

  document.addEventListener('click', handleClickCapture, true);
  document.addEventListener('submit', handleSubmitCapture, true);

  return () => {
    document.removeEventListener('click', handleClickCapture, true);
    document.removeEventListener('submit', handleSubmitCapture, true);
  };
}
