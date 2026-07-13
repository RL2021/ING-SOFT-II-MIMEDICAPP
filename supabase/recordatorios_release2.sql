-- MiMedicApp Release 2 - US-050, US-051 y US-052
-- Ejecutar una vez en Supabase SQL Editor.

alter table public.appointments
  add column if not exists is_completed boolean not null default false;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
on public.notifications for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.confirm_reminder(p_notification_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.notifications%rowtype;
begin
  select *
  into target
  from public.notifications
  where id = p_notification_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Recordatorio no encontrado o no autorizado'
      using errcode = 'P0002';
  end if;

  if target.type::text = 'medicine' and target.medicine_id is not null then
    update public.medicines
    set is_taken = true,
        updated_at = now()
    where id = target.medicine_id
      and user_id = auth.uid();
  elsif target.type::text = 'appointment' and target.appointment_id is not null then
    update public.appointments
    set is_completed = true,
        updated_at = now()
    where id = target.appointment_id
      and user_id = auth.uid();
  elsif target.type::text = 'exercise' and target.exercise_id is not null then
    update public.exercises
    set is_completed = true,
        updated_at = now()
    where id = target.exercise_id
      and user_id = auth.uid();
  end if;

  update public.notifications
  set is_read = true
  where id = target.id
    and user_id = auth.uid();
end;
$$;

revoke all on function public.confirm_reminder(bigint) from public;
grant execute on function public.confirm_reminder(bigint) to authenticated;

-- Realtime para que la campana y la vista unificada se actualicen al instante.
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end;
$$;
