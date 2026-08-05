-- Crédits prépayés (achat unitaire d'une nouvelle analyse)
alter table public.subscriptions
  add column if not exists prepaid_credits int not null default 0;

-- Consommation : crédit prépayé > quota abonné > analyse gratuite
create or replace function public.consume_credit(
  p_user       uuid,
  p_free_limit int,
  p_paid_limit int
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status         text;
  v_limit          int;
  v_prepaid        int;
  v_ok             boolean;
begin
  select status, prepaid_credits into v_status, v_prepaid
    from public.subscriptions
   where user_id = p_user
   for update;

  if not found then
    return null;
  end if;

  -- Analyse achetée à l'unité (14,90 €)
  if v_prepaid > 0 then
    update public.subscriptions
       set prepaid_credits = prepaid_credits - 1
     where user_id = p_user
       and prepaid_credits > 0
    returning true into v_ok;

    if coalesce(v_ok, false) then
      return 'prepaid';
    end if;
  end if;

  if v_status in ('canceled', 'past_due') then
    return null;
  end if;

  v_limit := case when v_status = 'active' then p_paid_limit else p_free_limit end;

  update public.subscriptions
     set quota_used = case
                        when quota_reset_at <= now() then 1
                        else quota_used + 1
                      end,
         quota_reset_at = case
                            when quota_reset_at <= now()
                            then date_trunc('month', now()) + interval '1 month'
                            else quota_reset_at
                          end
   where user_id = p_user
     and (quota_reset_at <= now() or quota_used < v_limit)
  returning true into v_ok;

  if coalesce(v_ok, false) then
    return case when v_status = 'active' then 'monthly' else 'free' end;
  end if;

  return null;
end;
$$;

create or replace function public.refund_credit(
  p_user   uuid,
  p_source text default 'monthly'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_source = 'prepaid' then
    update public.subscriptions
       set prepaid_credits = prepaid_credits + 1
     where user_id = p_user;
  else
    update public.subscriptions
       set quota_used = greatest(0, quota_used - 1)
     where user_id = p_user;
  end if;
end;
$$;

create or replace function public.add_prepaid_credit(
  p_user uuid,
  p_n    int default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
     set prepaid_credits = prepaid_credits + p_n
   where user_id = p_user;
end;
$$;

revoke all on function public.consume_credit(uuid, int, int) from public, anon, authenticated;
revoke all on function public.refund_credit(uuid, text)            from public, anon, authenticated;
revoke all on function public.add_prepaid_credit(uuid, int)        from public, anon, authenticated;
