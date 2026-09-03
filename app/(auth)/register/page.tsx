'use client';

import { useState } from 'react';
import { registerAction } from '@/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          fontSize: 20,
          fontWeight: 800,
          color: 'white',
        }}>
          B
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--color-muted-foreground)', fontSize: 14 }}>
          Start your learning journey with BIAN OS
        </p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--color-destructive-light)',
              color: 'var(--color-destructive)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '10px 16px' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <p style={{
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        color: 'var(--color-muted-foreground)',
      }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
