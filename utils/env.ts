export function validateEnv() {
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

  if (missingEnvs.length > 0) {
    console.error(
      'Missing required environment variables:\n' +
      missingEnvs.map(env => `- ${env}`).join('\n') +
      '\n\nMake sure these are set in your .env file or deployment environment.'
    );
    return false;
  }

  return true;
} 