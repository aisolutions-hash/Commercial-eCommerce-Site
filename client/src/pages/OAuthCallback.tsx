import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useStore((s) => s.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const role = params.get('role') || 'customer';
    const error = params.get('error');
    const redirect = params.get('redirect') || '/';

    if (error === 'google_email_missing') {
      navigate('/auth?error=google_email_missing', { replace: true });
      return;
    }

    if (token && name && email) {
      setAuth(token, { name, email, role });
      navigate(redirect, { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate, location.search, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
