interface ErrorDetail {
  readonly title: string;
  readonly description: string;
}

// Copy for every status code the server can route to this page, keyed by code.
const ERRORS: Readonly<Record<string, ErrorDetail>> = {
  '400': {
    title: 'Richiesta non valida',
    description: 'La richiesta non è corretta o non può essere elaborata dal server.',
  },
  '401': {
    title: 'Accesso richiesto',
    description: 'Per vedere questa pagina è necessario accedere.',
  },
  '403': {
    title: 'Accesso negato',
    description: 'Non hai i permessi per vedere questa pagina.',
  },
  '404': {
    title: 'Pagina non trovata',
    description:
      'La pagina che cerchi non esiste o è stata spostata. Le opere sono sempre a portata di mano.',
  },
  '408': {
    title: 'Tempo di attesa scaduto',
    description: 'La connessione ha impiegato troppo tempo. Riprova a caricare la pagina.',
  },
  '429': {
    title: 'Troppe richieste',
    description: 'Hai inviato troppe richieste in poco tempo. Attendi qualche istante e riprova.',
  },
  '500': {
    title: 'Errore del server',
    description: 'Si è verificato un problema momentaneo. Riprova più tardi.',
  },
};

const DEFAULT_CODE = '404';

/**
 * Picks the error to show from the `code` query parameter (`/error/?code=500`).
 * An unlisted 5xx code shows as 500, and a missing or unknown code as 404.
 * @param search - The page's query string, e.g. `window.location.search`.
 * @returns A code that is a key of `ERRORS`.
 */
function resolveCode(search: string): string {
  const code = new URLSearchParams(search).get('code') ?? '';
  if (Object.hasOwn(ERRORS, code)) return code;
  return /^5\d\d$/.test(code) ? '500' : DEFAULT_CODE;
}

/**
 * Writes the error's code, title and description into the page, and sets the
 * document title (the site name is read from the header, not repeated here).
 * @param code - A key of `ERRORS`.
 */
function render(code: string): void {
  const { title, description } = ERRORS[code];
  const siteName = document.querySelector('.site-name')?.textContent?.trim();
  const set = (id: string, text: string): void => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  };
  set('error-code', code);
  set('error-code-label', `Errore ${code}`);
  set('error-title', title);
  set('error-description', description);
  document.title = siteName ? `${title} | ${siteName}` : title;
}

render(resolveCode(window.location.search));
