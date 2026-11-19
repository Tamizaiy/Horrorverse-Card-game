-- Execute uma vez no SQL Editor, após as etapas anteriores.
begin;

create table if not exists public.hv_duel_rewards (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  duel_id text not null check (length(duel_id) between 1 and 150),
  result jsonb not null,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id),
  unique (user_id, duel_id)
);
alter table public.hv_duel_rewards enable row level security;
revoke all on public.hv_duel_rewards from public, anon, authenticated;
grant select on public.hv_duel_rewards to authenticated;
drop policy if exists "Ler minhas recompensas" on public.hv_duel_rewards;
create policy "Ler minhas recompensas" on public.hv_duel_rewards
  for select to authenticated using (user_id = (select auth.uid()));

-- Um único snapshot evita combinar coleção e saldo de momentos diferentes.
create or replace function public.hv_get_state()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'rubedio', p.rubedio,
    'tutorial_reward_claimed', p.tutorial_reward_claimed,
    'card_ids', d.card_ids,
    'collection', coalesce((
      select jsonb_agg(jsonb_build_object(
        'card_id', c.card_id, 'quantity', c.quantity, 'is_new', c.is_new
      )) from public.hv_collection c where c.user_id = p.user_id
    ), '[]'::jsonb),
    'inventory', coalesce((
      select jsonb_agg(jsonb_build_object('pack_id', i.pack_id, 'quantity', i.quantity))
      from public.hv_inventory i where i.user_id = p.user_id
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(r.result order by r.created_at desc)
      from public.hv_duel_rewards r
      where r.user_id = p.user_id and not r.archived
    ), '[]'::jsonb) || case when p.tutorial_reward_claimed then
      '[{"id":"tutorial","mode":"Tutorial","total":1000,"rows":[{"label":"Tutorial concluído","points":1000}]}]'::jsonb
      else '[]'::jsonb end
  )
  from public.hv_progress p
  join public.hv_decks d on d.user_id = p.user_id
  where p.user_id = (select auth.uid());
$$;

-- Duelo local/CPU ainda roda no navegador. Esta função calcula a pontuação,
-- limita os valores e impede crédito repetido; ela não valida uma gravação do duelo.
create or replace function public.hv_award_duel(
  p_duel_id text, p_stats jsonb, p_mode text,
  p_sanity integer, p_request_id uuid
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  player_id uuid := auth.uid();
  previous public.hv_duel_rewards%rowtype;
  rows jsonb := '[]'::jsonb;
  amount integer := 0;
  rule record;
  total integer := 0;
  answer jsonb;
  stat_name text;
begin
  if player_id is null then raise exception 'Entre na sua conta.'; end if;
  if p_request_id is null or p_duel_id is null or length(p_duel_id) not between 1 and 150
    or p_mode is null or p_mode not in ('Contra CPU', 'Duelo local')
    or p_sanity is null or p_sanity not between 0 and 10
    or jsonb_typeof(p_stats) is distinct from 'object' then
    raise exception 'Resultado de duelo inválido.';
  end if;

  perform public.hv_initialize_account();
  perform 1 from public.hv_progress where user_id = player_id for update;

  select * into previous from public.hv_duel_rewards
    where user_id = player_id and (request_id = p_request_id or duel_id = p_duel_id)
    order by created_at limit 1;
  if found then
    if previous.duel_id <> p_duel_id then
      raise exception 'Identificação já usada para outro duelo.';
    end if;
    return previous.result;
  end if;

  foreach stat_name in array array[
    'terrorDamage','sanityDamage','healed','spells','items',
    'spellAttempts','itemAttempts','peakDraw','chain','lost'
  ] loop
    if jsonb_typeof(p_stats->stat_name) is distinct from 'number'
      or (p_stats->>stat_name)::numeric not between 0 and 100000
      or trunc((p_stats->>stat_name)::numeric) <> (p_stats->>stat_name)::numeric then
      raise exception 'Estatísticas inválidas: %', stat_name;
    end if;
  end loop;
  if jsonb_typeof(p_stats->'important') is distinct from 'array'
    or jsonb_array_length(p_stats->'important') > 1000
    or jsonb_typeof(p_stats->'exact') is distinct from 'boolean'
    or jsonb_typeof(p_stats->'gek') is distinct from 'boolean' then
    raise exception 'Estatísticas inválidas.';
  end if;

  for rule in
    select * from (values
      ('Vitória',30),
      ('Dano ao TERROR inimigo',least(20,(p_stats->>'terrorDamage')::integer)),
      ('Dano à Sanidade inimiga',least(20,(p_stats->>'sanityDamage')::integer*2)),
      ('Sanidade recuperada',least(10,(p_stats->>'healed')::integer*2)),
      ('Feitiços resolvidos',least(12,(p_stats->>'spells')::integer*2)),
      ('Itens resolvidos',least(12,(p_stats->>'items')::integer*2)),
      ('Vitória sem Feitiços',case when (p_stats->>'spellAttempts')::integer=0 then 6 else 0 end),
      ('Vitória sem Itens',case when (p_stats->>'itemAttempts')::integer=0 then 6 else 0 end),
      ('Compra em série',case when (p_stats->>'peakDraw')::integer>=3 then 8 else 0 end),
      ('Efeito em Corrente',case when (p_stats->>'chain')::integer>=3 then least(24,12+((p_stats->>'chain')::integer-3)*3) else 0 end),
      ('Efeitos marcantes',least(15,jsonb_array_length(p_stats->'important')*5)),
      ('Dano Exato',case when (p_stats->>'exact')::boolean then 15 else 0 end),
      ('Evolução natural de Gek Omelliax',case when (p_stats->>'gek')::boolean then 20 else 0 end),
      ('Vitória Intacta',case when (p_stats->>'lost')::integer=0 then 15 else 0 end),
      ('Por um Fio',case when p_sanity=1 then 15 else 0 end)
    ) as rules(label, points)
  loop
    if rule.points>0 then
      rows := rows || jsonb_build_array(jsonb_build_object('label',rule.label,'points',rule.points));
      total := total + rule.points;
    end if;
  end loop;

  answer := jsonb_build_object(
    'id',p_duel_id,'mode',p_mode,'total',total,'rows',rows,'stats',p_stats
  );
  insert into public.hv_duel_rewards(user_id,request_id,duel_id,result)
    values(player_id,p_request_id,p_duel_id,answer);
  update public.hv_progress set rubedio=rubedio+total,updated_at=now()
    where user_id=player_id;
  return answer;
end;
$$;

-- Mantém os recibos para que uma resposta antiga nunca credite uma compra
-- ou uma recompensa novamente depois do reset.
create or replace function public.hv_reset_account(p_request_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  player_id uuid := auth.uid();
  starter_deck text[] := array[
    'cultista','cultista','vigia','vigia','sobrevivente','sobrevivente',
    'espectro','espectro','papa_sonhos','papa_sonhos',
    'corredor_carmesin','corredor_carmesin','ghostface','ghostface',
    'velas','velas','grande_impacto','grande_impacto',
    'lamina','amuleto','espelho','corte','ritual','bruma'
  ];
begin
  if player_id is null then raise exception 'Entre na sua conta.'; end if;
  if p_request_id is null then raise exception 'O reset precisa de uma identificação.'; end if;
  perform public.hv_initialize_account();
  perform 1 from public.hv_progress where user_id=player_id for update;
  insert into public.hv_account_resets(user_id,request_id)
    values(player_id,p_request_id) on conflict do nothing;
  if not found then return; end if;

  delete from public.hv_collection where user_id=player_id;
  delete from public.hv_inventory where user_id=player_id;
  update public.hv_duel_rewards set archived=true where user_id=player_id;
  update public.hv_progress
    set rubedio=0,tutorial_reward_claimed=false,updated_at=now()
    where user_id=player_id;
  insert into public.hv_collection(user_id,card_id,quantity,is_new)
    select player_id,card,count(*)::integer,false
    from unnest(starter_deck) as cards(card) group by card;
  insert into public.hv_decks(user_id,card_ids)
    values(player_id,starter_deck)
    on conflict(user_id) do update
      set card_ids=excluded.card_ids,updated_at=now();
end;
$$;

revoke all on function public.hv_get_state() from public,anon;
revoke all on function public.hv_award_duel(text,jsonb,text,integer,uuid) from public,anon;
revoke all on function public.hv_reset_account(uuid) from public,anon;
grant execute on function public.hv_get_state() to authenticated;
grant execute on function public.hv_award_duel(text,jsonb,text,integer,uuid) to authenticated;
grant execute on function public.hv_reset_account(uuid) to authenticated;
commit;
