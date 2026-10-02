-- Bilingual Atlas: English overrides of the public projection. Keys present only when the company wrote them.
ALTER TABLE atlas.entities  ADD COLUMN en jsonb NOT NULL DEFAULT '{}';
ALTER TABLE atlas.companies ADD COLUMN en jsonb NOT NULL DEFAULT '{}';
