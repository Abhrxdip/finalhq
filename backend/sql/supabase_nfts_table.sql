create table if not exists public.nfts (
  id text primary key default md5(random()::text || clock_timestamp()::text),
  name text not null,
  category text not null,
  prompt text not null,
  image_url text not null,
  owner_id text,
  is_minted boolean not null default false,
  algo_asset_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_nfts_created_at on public.nfts (created_at desc);
create index if not exists idx_nfts_owner_id on public.nfts (owner_id);
