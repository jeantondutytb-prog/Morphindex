-- Consommation atomique d'un crédit d'analyse.
--
-- Pourquoi une fonction plutôt qu'un lire-puis-écrire côté application :
-- deux requêtes concurrentes lisaient toutes les deux `quota_used = 1` et
-- écrivaient toutes les deux `2`, ce qui accordait une analyse de plus que le
-- quota. Sur la formule « à vie », c'est le seul garde-fou entre 59,90 € encaissés
-- une fois et un coût Anthropic répété — la course était donc directement
-- facturable.
--
-- `for update` sérialise les appels concurrents sur la même ligne ; la clause
-- `where` refait la vérification dans l'instruction d'écriture elle-même.

create or replace function public.consume_credit(
  p_user       uuid,
  p_free_limit int,
  p_paid_limit int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_limit  int;
  v_ok     boolean;
begin
  select status into v_status
    from public.subscriptions
   where user_id = p_user
   for update;                      -- verrou de ligne : sérialise les concurrents

  if not found then
    return false;
  end if;

  -- Un compte qui a payé puis annulé n'est pas un compte qui n'a jamais payé :
  -- il a déjà consommé son analyse gratuite avant de souscrire.
  if v_status in ('canceled', 'past_due') then
    return false;
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

  return coalesce(v_ok, false);
end;
$$;

-- Le crédit est décompté au succès, pas au lancement : une analyse ratée ne
-- coûte rien à l'utilisateur.
create or replace function public.refund_credit(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
     set quota_used = greatest(0, quota_used - 1)
   where user_id = p_user;
end;
$$;

-- Ces deux fonctions sont `security definer` : sans révocation, un utilisateur
-- authentifié pourrait appeler `refund_credit` sur son propre compte via
-- PostgREST et se rendre des crédits à volonté. Elles ne sont appelables que
-- par la service role key, côté serveur.
revoke all on function public.consume_credit(uuid, int, int) from public, anon, authenticated;
revoke all on function public.refund_credit(uuid)            from public, anon, authenticated;
