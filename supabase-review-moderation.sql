do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reviews'
      and column_name = 'is_approved'
  ) then
    alter table public.reviews
    add column is_approved boolean not null default false;

    update public.reviews
    set is_approved = true;
  end if;
end
$$;

