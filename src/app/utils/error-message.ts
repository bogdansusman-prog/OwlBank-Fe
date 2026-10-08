import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: HttpErrorResponse, fallback: string): string {
  if (error.status === 0) {
    return 'Cannot connect to the server.';
  }

  const body = error.error;

  // dacă BE trimite JSON: { message: "..." } sau ProblemDetails
  if (body && typeof body === 'object') {
    const msg = body.message || body.detail || body.title;
    return typeof msg === 'string' && msg.trim() ? msg.trim() : fallback;
  }

  // ce trimite BE acum: "System.Exception: Email already exists\r\n   at OwlBank..."
  if (typeof body === 'string' && body.trim()) {
    const msg = body
      .trim()
      .split(/\r?\n/)[0]                    // doar prima linie
      .replace(/^[\w.]+Exception:\s*/, '')  // scoate "System.Exception: "
      .split(/\s+at [\w.]+[.(]/)[0]         // taie stack trace-ul dacă e pe aceeași linie
      .trim();
    return msg || fallback;
  }

  return fallback;
}