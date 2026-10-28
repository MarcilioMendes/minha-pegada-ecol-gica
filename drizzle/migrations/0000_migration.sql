CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudonym text NOT NULL UNIQUE,
  class_name text NOT NULL DEFAULT '81',
  pin_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('pre','post')),
  perception jsonb NOT NULL DEFAULT '{}'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  planets numeric NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, phase)
);
GRANT ALL ON public.responses TO service_role;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

INSERT INTO public.students (pseudonym, class_name)
SELECT 'A' || lpad(g::text, 3, '0'), '81' FROM generate_series(1, 30) g;