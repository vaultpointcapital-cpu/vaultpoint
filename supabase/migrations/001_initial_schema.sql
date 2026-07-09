-- =====================================================================
-- VaultPoint MVP Schema — Sprint 1-2
-- Run this entire file once in Supabase SQL Editor.
-- Safe to re-run: uses "if not exists" / "or replace" where possible.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USERS (extends Supabase's built-in auth.users with app-specific data)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  country text,                          -- e.g. 'NG' for Nigeria — used for payment provider routing
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 2. BROKER_CONNECTIONS (encrypted API keys for Bybit/KuCoin/Hantec/MT5)
-- ---------------------------------------------------------------------
create table if not exists public.broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  broker_name text not null,             -- 'bybit' | 'kucoin' | 'hantec' | 'mt5'
  label text,                            -- user-friendly nickname, e.g. "Main Bybit"
  encrypted_api_key text not null,       -- AES-256-GCM ciphertext, never plaintext
  encrypted_api_secret text not null,
  encryption_iv text not null,           -- initialization vector, required to decrypt
  is_active boolean default true,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 3. PORTFOLIO_SNAPSHOTS (periodic balance snapshots, powers charts/history)
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  broker_connection_id uuid references public.broker_connections(id) on delete set null,
  total_value_usd numeric(18,2) not null,
  snapshot_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 4. POSITIONS (current open positions per broker connection)
-- ---------------------------------------------------------------------
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  broker_connection_id uuid not null references public.broker_connections(id) on delete cascade,
  symbol text not null,                  -- e.g. 'BTCUSDT', 'XAUUSD'
  side text not null,                    -- 'long' | 'short'
  entry_price numeric(18,6),
  current_price numeric(18,6),
  quantity numeric(18,8),
  unrealized_pnl numeric(18,2),
  opened_at timestamptz,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 5. SAVINGS_PODS (goal-based savings feature)
-- ---------------------------------------------------------------------
create table if not exists public.savings_pods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,                    -- e.g. "Japan Trip 2027"
  target_amount numeric(18,2) not null,
  current_amount numeric(18,2) default 0,
  currency text default 'USD',
  target_date date,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 6. POD_CONTRIBUTIONS (individual deposits into a savings pod)
-- ---------------------------------------------------------------------
create table if not exists public.pod_contributions (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.savings_pods(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(18,2) not null,
  contributed_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 7. MANUAL_ASSETS (assets user tracks without a live broker connection)
-- ---------------------------------------------------------------------
create table if not exists public.manual_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,                    -- e.g. "Real estate - Lagos"
  value_usd numeric(18,2) not null,
  notes text,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 8. ALERTS (user-configured price/portfolio alerts)
-- ---------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  symbol text,                           -- null if it's a portfolio-wide alert
  condition_type text not null,          -- 'price_above' | 'price_below' | 'pnl_drop_pct' etc.
  threshold_value numeric(18,6) not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 9. ALERT_HISTORY (log of alerts that have fired)
-- ---------------------------------------------------------------------
create table if not exists public.alert_history (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  triggered_value numeric(18,6),
  message text,
  triggered_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 10. SUBSCRIPTIONS (billing/plan tier)
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null default 'free',     -- 'free' | 'pro' | 'premium'
  status text not null default 'active', -- 'active' | 'cancelled' | 'past_due'
  provider text,                          -- 'stripe' | 'paystack' | 'flutterwave'
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY — every table locked to its owning user by default
-- =====================================================================

alter table public.users enable row level security;
alter table public.broker_connections enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.positions enable row level security;
alter table public.savings_pods enable row level security;
alter table public.pod_contributions enable row level security;
alter table public.manual_assets enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_history enable row level security;
alter table public.subscriptions enable row level security;

-- USERS: can only read/update their own row
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- BROKER_CONNECTIONS: full CRUD on own rows only
create policy "Users manage own broker connections" on public.broker_connections
  for all using (auth.uid() = user_id);

-- PORTFOLIO_SNAPSHOTS: read own, insert own (writes usually come from backend service)
create policy "Users view own snapshots" on public.portfolio_snapshots
  for select using (auth.uid() = user_id);
create policy "Users insert own snapshots" on public.portfolio_snapshots
  for insert with check (auth.uid() = user_id);

-- POSITIONS: full CRUD on own rows only
create policy "Users manage own positions" on public.positions
  for all using (auth.uid() = user_id);

-- SAVINGS_PODS: full CRUD on own rows only
create policy "Users manage own pods" on public.savings_pods
  for all using (auth.uid() = user_id);

-- POD_CONTRIBUTIONS: full CRUD on own rows only
create policy "Users manage own contributions" on public.pod_contributions
  for all using (auth.uid() = user_id);

-- MANUAL_ASSETS: full CRUD on own rows only
create policy "Users manage own manual assets" on public.manual_assets
  for all using (auth.uid() = user_id);

-- ALERTS: full CRUD on own rows only
create policy "Users manage own alerts" on public.alerts
  for all using (auth.uid() = user_id);

-- ALERT_HISTORY: read-only for the user, backend inserts via service_role
create policy "Users view own alert history" on public.alert_history
  for select using (auth.uid() = user_id);

-- SUBSCRIPTIONS: read-only for the user, backend manages writes via service_role
create policy "Users view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- =====================================================================
-- INDEXES for common lookups
-- =====================================================================
create index if not exists idx_broker_connections_user on public.broker_connections(user_id);
create index if not exists idx_portfolio_snapshots_user_time on public.portfolio_snapshots(user_id, snapshot_at desc);
create index if not exists idx_positions_user on public.positions(user_id);
create index if not exists idx_savings_pods_user on public.savings_pods(user_id);
create index if not exists idx_pod_contributions_pod on public.pod_contributions(pod_id);
create index if not exists idx_alerts_user on public.alerts(user_id);
create index if not exists idx_alert_history_user on public.alert_history(user_id);

-- =====================================================================
-- AUTO-CREATE public.users row whenever someone signs up via Supabase Auth
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
