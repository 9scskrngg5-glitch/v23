# Trading Journal v8 — Version Finale

## Nouvelles fonctionnalités v8
- Prop Firm Tracker (FTMO, MyForexFunds, TopStep, E8, Custom)
- Multi-compte (réel, demo, prop, backtest)
- Journal vocal avec transcription Whisper AI
- PWA installable sur mobile et desktop
- Raccourcis clavier (D/T/S/P/K/N/?)

## Variables Vercel complètes
```
# Supabase
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Anthropic (AI Coach)
ANTHROPIC_API_KEY

# Stripe (paiements)
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET

# Resend (emails)
RESEND_API_KEY
EMAIL_DOMAIN

# OpenAI (transcription vocale)
OPENAI_API_KEY

# App
APP_URL
VITE_ADMIN_EMAILS
ADMIN_EMAILS
CRON_SECRET
```

## SQL Supabase v8 (ajouter aux précédents)
```sql
-- Profils publics (si pas encore fait en v7)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  username text unique,
  display_name text,
  public boolean default false
);
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = user_id);
create policy "Public profiles readable" on profiles for select using (public = true);
```

## Raccourcis clavier
- D → Dashboard
- T → Trades  
- S → Stats
- P → Prop Firm
- K → Tasks
- N → Nouveau trade
- ? → Aide raccourcis
- ESC → Fermer modal

## Note journal vocal
Nécessite une clé OpenAI (api.openai.com) pour la transcription Whisper.

## SQL Supabase v9 (ajouter aux précédents)
```sql
-- Referral system
create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users not null unique,
  code text unique not null,
  uses integer default 0,
  free_months_earned integer default 0,
  created_at timestamptz default now()
);
alter table referrals enable row level security;
create policy "Users manage own referral" on referrals for all using (auth.uid() = referrer_id);

create table referral_uses (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users not null,
  referee_id uuid references auth.users not null unique,
  code text not null,
  created_at timestamptz default now()
);
alter table referral_uses enable row level security;
create policy "Users see own referral uses" on referral_uses for select using (auth.uid() = referrer_id);
```

## SQL Supabase v14
```sql
-- Support messages
create table support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  user_email text not null,
  subject text not null,
  message text not null,
  status text default 'open', -- open, in_progress, closed
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz default now()
);
alter table support_messages enable row level security;
create policy "Users see own messages" on support_messages for all using (auth.uid() = user_id);
create policy "Service role full access" on support_messages using (true);
```

## Configuration OAuth (Google + Apple)

### Supabase — Activer les providers
1. Va dans **Supabase Dashboard → Authentication → Providers**
2. Active **Google** :
   - Client ID et Client Secret → depuis Google Cloud Console
   - Authorized redirect URI → `https://TON-PROJECT.supabase.co/auth/v1/callback`
3. Active **Apple** :
   - Service ID, Team ID, Key ID, Private Key → depuis Apple Developer Console
   - Authorized redirect URI → `https://TON-PROJECT.supabase.co/auth/v1/callback`

### Supabase — Désactiver la confirmation email (recommandé)
Pour éviter la confusion avec l'email de confirmation :
1. Va dans **Authentication → Settings**
2. Désactive **"Enable email confirmations"**
3. Les utilisateurs peuvent se connecter immédiatement après inscription

### Supabase — URL de redirection
Dans **Authentication → URL Configuration** :
- Site URL : `https://journal-22.vercel.app`
- Redirect URLs : `https://journal-22.vercel.app`
