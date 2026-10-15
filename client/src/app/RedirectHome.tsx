// Vuelve al inicio mostrando un aviso (etapa bloqueada o inexistente...).
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, type ToastTone } from './Toaster';

export function RedirectHome({ message, tone = 'info' }: { message: string; tone?: ToastTone }) {
  const navigate = useNavigate();
  const toast = useToast();
  useEffect(() => {
    toast(message, tone);
    navigate('/', { replace: true });
  }, [message, tone, toast, navigate]);
  return null;
}
