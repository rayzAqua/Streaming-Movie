-- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://redmine.postgresql.org/projects/pgadmin4/issues/new if you find any bugs, including reproduction steps.
BEGIN;


CREATE TABLE IF NOT EXISTS public.actors
(
    id integer NOT NULL DEFAULT nextval('actors_id_seq'::regclass),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    photo character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT actors_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.favorite_film
(
    user_id integer NOT NULL,
    film_id integer NOT NULL,
    CONSTRAINT favorite_film_pkey PRIMARY KEY (user_id, film_id)
);

CREATE TABLE IF NOT EXISTS public.film
(
    id integer NOT NULL DEFAULT nextval('film_id_seq'::regclass),
    title character varying COLLATE pg_catalog."default" NOT NULL,
    length integer NOT NULL,
    poster character varying COLLATE pg_catalog."default" NOT NULL,
    production_year integer NOT NULL,
    path character varying COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    price integer NOT NULL,
    genre_id integer NOT NULL,
    status boolean NOT NULL DEFAULT true,
    add_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT film_pkey PRIMARY KEY (id),
    CONSTRAINT film_title_key UNIQUE (title)
);

CREATE TABLE IF NOT EXISTS public.film_actor
(
    actor_id integer NOT NULL,
    film_id integer NOT NULL,
    CONSTRAINT film_actor_pkey PRIMARY KEY (actor_id, film_id)
);

CREATE TABLE IF NOT EXISTS public.genre
(
    id integer NOT NULL DEFAULT nextval('genre_id_seq'::regclass),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT genre_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.payment
(
    id integer NOT NULL DEFAULT nextval('payment_id_seq'::regclass),
    user_id integer NOT NULL,
    pricing_id integer,
    film_id integer,
    pay integer NOT NULL,
    status integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    end_date timestamp with time zone NOT NULL,
    CONSTRAINT payment_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.pricing
(
    id integer NOT NULL DEFAULT nextval('pricing_id_seq'::regclass),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    price numeric NOT NULL,
    days numeric NOT NULL,
    status boolean NOT NULL DEFAULT true,
    CONSTRAINT pricing_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.rating_film
(
    user_id integer NOT NULL,
    film_id integer NOT NULL,
    rate numeric NOT NULL,
    CONSTRAINT rating_film_pkey PRIMARY KEY (user_id, film_id)
);

CREATE TABLE IF NOT EXISTS public.stamping
(
    user_id integer NOT NULL,
    film_id integer NOT NULL,
    time_stamping numeric NOT NULL,
    CONSTRAINT stamping_pkey PRIMARY KEY (user_id, film_id)
);

CREATE TABLE IF NOT EXISTS public.token
(
    token_id integer NOT NULL DEFAULT nextval('token_token_id_seq'::regclass),
    user_id integer NOT NULL,
    token character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT token_pkey PRIMARY KEY (token_id),
    CONSTRAINT token_token_key UNIQUE (token),
    CONSTRAINT token_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
    email character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    "isAdmin" boolean NOT NULL DEFAULT false,
    verified boolean NOT NULL DEFAULT false,
    status boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_email_key UNIQUE (email)
);

ALTER TABLE IF EXISTS public.favorite_film
    ADD CONSTRAINT favorite_film_film_id_fkey FOREIGN KEY (film_id)
    REFERENCES public.film (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.favorite_film
    ADD CONSTRAINT favorite_film_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.film
    ADD CONSTRAINT film_genre_id_fkey FOREIGN KEY (genre_id)
    REFERENCES public.genre (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.film_actor
    ADD CONSTRAINT film_actor_actor_id_fkey FOREIGN KEY (actor_id)
    REFERENCES public.actors (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.film_actor
    ADD CONSTRAINT film_actor_film_id_fkey FOREIGN KEY (film_id)
    REFERENCES public.film (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT payment_film_id_fkey FOREIGN KEY (film_id)
    REFERENCES public.film (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT payment_pricing_id_fkey FOREIGN KEY (pricing_id)
    REFERENCES public.pricing (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.payment
    ADD CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.rating_film
    ADD CONSTRAINT rating_film_film_id_fkey FOREIGN KEY (film_id)
    REFERENCES public.film (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.rating_film
    ADD CONSTRAINT rating_film_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.stamping
    ADD CONSTRAINT stamping_film_id_fkey FOREIGN KEY (film_id)
    REFERENCES public.film (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.stamping
    ADD CONSTRAINT stamping_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.token
    ADD CONSTRAINT token_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS token_user_id_key
    ON public.token(user_id);

END;