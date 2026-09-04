import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Do not attach headers for AWS S3/MinIO presigned URLs
  if (req.url.includes('X-Amz-Signature') || req.url.includes('X-Amz-Algorithm')) {
    return next(req);
  }

  // We can read directly from localStorage or inject AuthService (be careful of circular DI, though HttpInterceptorFn avoids it better)
  const token = localStorage.getItem('token');
  
  // Trace Propagation for Observability (Frontend AI Playbook Requirement)
  const correlationId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

  const setHeaders: Record<string, string> = {
    'X-Correlation-ID': correlationId
  };

  // Only attach token if it exists and request is not specifically bypassing it
  // (In real app, you might want to exclude certain URLs like /login, /register, etc.)
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    setHeaders['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({ setHeaders });

  return next(cloned);
};
