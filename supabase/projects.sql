-- Projects for the portfolio. Run once in the Supabase dashboard: SQL Editor > New query > Run.
-- "data" holds everything the tile needs (colours, positions, logo, ...): the shape of Project in src/data/projects.ts.

create table if not exists public.projects (
  slug       text primary key,
  name       text not null,
  sort_order int  not null default 0,
  published  boolean not null default true,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Everyone may read published projects. There is no insert/update/delete policy,
-- so only you (dashboard / service role) can change them.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select
  to anon, authenticated
  using (published);

insert into public.projects (slug, name, sort_order, data) values
  ('intermezzo', 'Intermezzo', 1, '{"color":"#f9007e","size":{"w":324.5,"h":316},"grid":{"x":0,"y":25},"blob":{"inset":[0.22,0.33,0.53,0.45]},"logo":{"kind":"image","src":"/projects/intermezzo/logo.png","inset":[17.09,23.88,24.37,19.11],"radius":10.79},"label":[89.87,20.7,3.48,47.46],"badge":[89.08,10.63,2.85,81.51],"stack":{"stackLeft":2.77,"frontRight":2.77,"frontTop":1.9,"frontShiftY":3.16,"stackShiftX":2.86,"aspect":1.017741935483871},"tag":{"text":"2 projects","box":[8.23,63.02,82.91,8.01],"blobInset":[7.39,0,2.31,0],"textBox":[11.08,67.95,85.13,12.94]}}'::jsonb),
  ('internetneeds', 'InternetNeeds', 2, '{"color":"#2451e8","size":{"w":311,"h":313},"grid":{"x":337.5,"y":106},"blob":{"inset":[1.44,1.23,1.06,0.64]},"logo":{"kind":"image","src":"/projects/internetneeds/logo.svg","inset":[23.32,25.24,27.16,24.92]},"label":[91.37,17.2,1.92,46.78],"badge":[90.42,6.75,1.44,85.05]}'::jsonb),
  ('npulse-pave', 'Npulse/Pave', 3, '{"color":"#355d4c","hoverLabelColor":"#6fcfa4","size":{"w":325.5,"h":319},"grid":{"x":658.5,"y":0},"blob":{"inset":[0.96,2.03,0.51,1.51]},"logo":{"kind":"image","src":"/projects/npulse-pave/logo.svg","inset":[33.23,21.81,42.01,21.66]},"label":[89.97,18.13,3.45,47.16],"badge":[89.18,8.29,2.82,83.87]}'::jsonb),
  ('livewall', 'LiveWall', 4, '{"color":"#d1ff00","size":{"w":315.5,"h":310},"grid":{"x":0,"y":372},"blob":{"inset":[0.22,0.33,0.53,0.45]},"logo":{"kind":"image","src":"/projects/livewall/logo.png","inset":[35.48,12.52,41.5,12.36],"crop":{"h":276,"left":-30.37,"top":-91.22,"w":158.27}},"label":[90,18.23,3.23,46.91],"badge":[88.87,8.08,2.9,83.84]}'::jsonb),
  ('pitwall', 'PitWall', 5, '{"color":"#2c2c2c","hoverLabelColor":"#f4f4ed","size":{"w":311,"h":313},"grid":{"x":337.5,"y":447},"blob":{"inset":[1.44,1.23,1.06,0.64]},"logo":{"kind":"image","src":"/projects/pitwall/logo.png","inset":[25.24,24.92,24.92,24.92]},"label":[91.37,16.88,1.92,47.11],"badge":[90.42,6.75,1.44,85.05]}'::jsonb),
  ('educheck', 'EduCheck', 6, '{"color":"#e19fff","size":{"w":325.5,"h":319},"grid":{"x":658.5,"y":341},"blob":{"inset":[0.96,2.03,0.51,1.51]},"logo":{"kind":"text","text":"Edu Check","inset":[46.08,21.51,45.77,21.66],"size":37,"lineHeight":22,"color":"#222"},"label":[90.28,17.82,3.13,47.47],"badge":[89.18,8.29,2.82,83.87]}'::jsonb)
on conflict (slug) do update
  set name = excluded.name, sort_order = excluded.sort_order, data = excluded.data;
