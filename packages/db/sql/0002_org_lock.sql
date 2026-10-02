-- NexTure can lock an organization: members lose access to it in Hub until it is unlocked.
ALTER TABLE core.organizations
  ADD COLUMN locked_at     timestamptz,
  ADD COLUMN locked_reason text CHECK (locked_reason IS NULL OR char_length(locked_reason) <= 500),
  ADD COLUMN locked_by     text REFERENCES core."user"(id);
