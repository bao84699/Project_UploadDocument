# Auth Optimizations

## What changed

- Đăng nhập và đăng ký được đồng bộ trạng thái qua `AuthUtils` thay vì set rời rạc ở từng file.
- Khi đăng ký, app không còn tự coi user là đã đăng nhập nếu Supabase chưa trả về session.
- Đăng xuất sẽ xóa trạng thái UI và các token auth của Supabase trong storage.
- Quyền admin không còn dựa vào mật khẩu hardcode `123`; app chuyển sang kiểm tra email admin đã cấu hình.
- Dashboard và trang viết blog có fallback kiểm tra lại trạng thái admin từ profile đã lưu.

## Admin rule (current app)

- Email admin được cấu hình trong `auth-utils.js`.
- Mặc định là `admin@doczone.com`.
- Nếu muốn đổi admin theo email khác, cập nhật `ADMIN_EMAILS` trong `auth-utils.js` rồi đăng nhập lại.

## Limitations

- Hiện tại app vẫn có lớp phân quyền phía client.
- Để bảo mật đúng nghĩa, cần phân quyền thật ở Supabase bằng role + RLS policy.

## SQL migration (role + trigger + admin)

Chạy toàn bộ block dưới trong Supabase SQL Editor:

```sql
begin;

-- 0) Ensure required columns
alter table public.uside_user_property
  add column if not exists user_id uuid,
  add column if not exists role text default 'user';

-- If old id column exists, migrate id -> user_id when user_id is null
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'uside_user_property'
      and column_name = 'id'
  ) then
    execute '
      update public.uside_user_property
      set user_id = id
      where user_id is null
        and id is not null
    ';
  end if;
end $$;

-- 1) Normalize constraints
alter table public.uside_user_property
  alter column user_id set not null;

alter table public.uside_user_property
  alter column role set default 'user';

update public.uside_user_property
set role = 'user'
where role is null;

alter table public.uside_user_property
  alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'uside_user_property_role_check'
  ) then
    alter table public.uside_user_property
      add constraint uside_user_property_role_check
      check (role in ('user', 'admin'));
  end if;
end $$;

create unique index if not exists uside_user_property_user_id_uidx
on public.uside_user_property(user_id);

-- 2) Trigger function for new auth user
create or replace function public.handle_new_user_property()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.uside_user_property (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- 3) Replace old broken triggers
drop trigger if exists on_auth_user_created_uside_property on auth.users;
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created_uside_property
after insert on auth.users
for each row
execute function public.handle_new_user_property();

-- 4) Backfill existing users
insert into public.uside_user_property (user_id, role)
select u.id, 'user'
from auth.users u
left join public.uside_user_property p on p.user_id = u.id
where p.user_id is null;

-- 5) Set admin role by email
update public.uside_user_property p
set role = 'admin'
from auth.users u
where p.user_id = u.id
  and lower(u.email) = lower('admin@doczone.com');

commit;
```

## Optional: enable RLS for uside_user_property

```sql
alter table public.uside_user_property enable row level security;

drop policy if exists uside_property_select_own_or_admin on public.uside_user_property;
create policy uside_property_select_own_or_admin
on public.uside_user_property
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.uside_user_property me
    where me.user_id = auth.uid()
      and me.role = 'admin'
  )
);

drop policy if exists uside_property_update_own_or_admin on public.uside_user_property;
create policy uside_property_update_own_or_admin
on public.uside_user_property
for update
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.uside_user_property me
    where me.user_id = auth.uid()
      and me.role = 'admin'
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.uside_user_property me
    where me.user_id = auth.uid()
      and me.role = 'admin'
  )
);
```

## Verification queries

```sql
-- Verify admin account role
select u.email, p.user_id, p.role
from auth.users u
left join public.uside_user_property p on p.user_id = u.id
where lower(u.email) = lower('admin@doczone.com');

-- Verify current triggers on auth.users
select t.tgname, pg_get_triggerdef(t.oid)
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal
  and n.nspname = 'auth'
  and c.relname = 'users';
```
<!-- mk admin123 -->

