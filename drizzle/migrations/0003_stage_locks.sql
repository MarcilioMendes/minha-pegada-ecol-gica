CREATE TABLE public.stage_locks (
  stage text PRIMARY KEY CHECK (stage IN ('pre','carbon','post')),
  locked boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.stage_locks TO service_role;
ALTER TABLE public.stage_locks ENABLE ROW LEVEL SECURITY;
