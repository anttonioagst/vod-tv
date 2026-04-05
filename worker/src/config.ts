function require_env(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Variável de ambiente obrigatória não definida: ${name}`)
  return val
}

export const config = {
  twitch: {
    clientId: require_env('TWITCH_CLIENT_ID'),
    clientSecret: require_env('TWITCH_CLIENT_SECRET'),
    webhookSecret: require_env('TWITCH_WEBHOOK_SECRET'),
  },
  supabase: {
    url: require_env('SUPABASE_URL'),
    serviceRoleKey: require_env('SUPABASE_SERVICE_ROLE_KEY'),
  },
  r2: {
    accountId: require_env('R2_ACCOUNT_ID'),
    accessKeyId: require_env('R2_ACCESS_KEY_ID'),
    secretAccessKey: require_env('R2_SECRET_ACCESS_KEY'),
    bucketName: require_env('R2_BUCKET_NAME'),
    publicUrl: require_env('R2_PUBLIC_URL'),
  },
  app: {
    nextAppUrl: require_env('NEXT_APP_URL'),
    adminSecret: require_env('ADMIN_SECRET'),
    workerPort: Number(process.env.WORKER_PORT ?? '3001'),
  },
}
