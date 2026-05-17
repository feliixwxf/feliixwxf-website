do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_images'
      and column_name = 'sort_order'
  ) then
    alter table public.portfolio_images
    add column sort_order integer not null default 0;
  end if;
end
$$;

with ranked_images as (
  select
    id,
    row_number() over (
      partition by category
      order by created_at desc
    ) - 1 as new_sort_order
  from public.portfolio_images
)
update public.portfolio_images
set sort_order = ranked_images.new_sort_order
from ranked_images
where public.portfolio_images.id = ranked_images.id;

