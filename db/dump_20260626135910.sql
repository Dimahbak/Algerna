--
-- PostgreSQL database dump
--

\restrict WROn1QXaDOr0H3bbf4dcFmR8l2lz6KaaJSqaFGeSAH0Hlf3lNPWNtiNwoQMiZ0B

-- Dumped from database version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: bien_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bien_statut AS ENUM (
    'libre',
    'loue',
    'affecte',
    'occupe_sans_titre',
    'en_travaux',
    'contentieux'
);


ALTER TYPE public.bien_statut OWNER TO postgres;

--
-- Name: bien_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bien_type AS ENUM (
    'local_commercial',
    'logement',
    'bureau',
    'equipement',
    'terrain',
    'immeuble'
);


ALTER TYPE public.bien_type OWNER TO postgres;

--
-- Name: contrat_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.contrat_type AS ENUM (
    'location',
    'affectation',
    'mise_a_disposition'
);


ALTER TYPE public.contrat_type OWNER TO postgres;

--
-- Name: epic_categorie; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.epic_categorie AS ENUM (
    'environnement_nettoiement',
    'voirie_eclairage_urbanisme',
    'logement_infrastructure',
    'eau_energie',
    'services_transports',
    'social_artisanat',
    'culture_medias_tourisme'
);


ALTER TYPE public.epic_categorie OWNER TO postgres;

--
-- Name: epic_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.epic_type AS ENUM (
    'local',
    'national'
);


ALTER TYPE public.epic_type OWNER TO postgres;

--
-- Name: etat_physique; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.etat_physique AS ENUM (
    'bon',
    'degrade',
    'en_travaux',
    'inutilisable'
);


ALTER TYPE public.etat_physique OWNER TO postgres;

--
-- Name: famille_service; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.famille_service AS ENUM (
    'A',
    'B'
);


ALTER TYPE public.famille_service OWNER TO civismart;

--
-- Name: paiement_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.paiement_statut AS ENUM (
    'a_jour',
    'retard',
    'impaye'
);


ALTER TYPE public.paiement_statut OWNER TO postgres;

--
-- Name: rdv_statut; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.rdv_statut AS ENUM (
    'reserve',
    'present',
    'absent',
    'annule',
    'traite'
);


ALTER TYPE public.rdv_statut OWNER TO civismart;

--
-- Name: signal_criticite; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.signal_criticite AS ENUM (
    'basse',
    'moyenne',
    'haute'
);


ALTER TYPE public.signal_criticite OWNER TO civismart;

--
-- Name: signal_domaine; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.signal_domaine AS ENUM (
    'proprete',
    'eau'
);


ALTER TYPE public.signal_domaine OWNER TO civismart;

--
-- Name: signal_etat; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.signal_etat AS ENUM (
    'recu',
    'transmis',
    'en_intervention',
    'resolu',
    'rejete'
);


ALTER TYPE public.signal_etat OWNER TO civismart;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.user_role AS ENUM (
    'citoyen',
    'agent',
    'admin_apc',
    'admin_wilaya',
    'operateur'
);


ALTER TYPE public.user_role OWNER TO civismart;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _migrations; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public._migrations (
    nom text NOT NULL,
    applique_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public._migrations OWNER TO civismart;

--
-- Name: bien_historique; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bien_historique (
    id integer NOT NULL,
    bien_id integer NOT NULL,
    ancien_statut public.bien_statut,
    nouveau_statut public.bien_statut NOT NULL,
    motif text,
    agent_id uuid,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bien_historique OWNER TO postgres;

--
-- Name: bien_historique_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bien_historique_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bien_historique_id_seq OWNER TO postgres;

--
-- Name: bien_historique_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bien_historique_id_seq OWNED BY public.bien_historique.id;


--
-- Name: bien_immobilier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bien_immobilier (
    id integer NOT NULL,
    reference text NOT NULL,
    type public.bien_type DEFAULT 'local_commercial'::public.bien_type NOT NULL,
    adresse text NOT NULL,
    commune_id integer,
    surface_m2 numeric(10,2),
    lat double precision,
    lng double precision,
    etat_physique public.etat_physique DEFAULT 'bon'::public.etat_physique NOT NULL,
    statut public.bien_statut DEFAULT 'libre'::public.bien_statut NOT NULL,
    proprietaire text DEFAULT 'Wilaya d''Alger'::text NOT NULL,
    valeur_venale bigint,
    notes text,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    maj_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bien_immobilier OWNER TO postgres;

--
-- Name: bien_immobilier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bien_immobilier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bien_immobilier_id_seq OWNER TO postgres;

--
-- Name: bien_immobilier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bien_immobilier_id_seq OWNED BY public.bien_immobilier.id;


--
-- Name: categorie_signal; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.categorie_signal (
    id integer NOT NULL,
    domaine public.signal_domaine NOT NULL,
    libelle text NOT NULL,
    criticite public.signal_criticite DEFAULT 'moyenne'::public.signal_criticite NOT NULL
);


ALTER TABLE public.categorie_signal OWNER TO civismart;

--
-- Name: categorie_signal_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.categorie_signal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categorie_signal_id_seq OWNER TO civismart;

--
-- Name: categorie_signal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.categorie_signal_id_seq OWNED BY public.categorie_signal.id;


--
-- Name: circonscription; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.circonscription (
    id smallint NOT NULL,
    nom text NOT NULL
);


ALTER TABLE public.circonscription OWNER TO civismart;

--
-- Name: commune; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.commune (
    id integer NOT NULL,
    nom text NOT NULL,
    circonscription_id smallint NOT NULL,
    centre_lat double precision,
    centre_lng double precision
);


ALTER TABLE public.commune OWNER TO civismart;

--
-- Name: commune_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.commune_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.commune_id_seq OWNER TO civismart;

--
-- Name: commune_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.commune_id_seq OWNED BY public.commune.id;


--
-- Name: contrat_occupation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrat_occupation (
    id integer NOT NULL,
    bien_id integer NOT NULL,
    occupant_nom text NOT NULL,
    occupant_tel text,
    occupant_nin text,
    type_contrat public.contrat_type DEFAULT 'location'::public.contrat_type NOT NULL,
    date_debut date NOT NULL,
    date_fin date,
    loyer_mensuel bigint DEFAULT 0 NOT NULL,
    caution bigint DEFAULT 0 NOT NULL,
    statut_paiement public.paiement_statut DEFAULT 'a_jour'::public.paiement_statut NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    notes text,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contrat_occupation OWNER TO postgres;

--
-- Name: contrat_occupation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contrat_occupation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contrat_occupation_id_seq OWNER TO postgres;

--
-- Name: contrat_occupation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contrat_occupation_id_seq OWNED BY public.contrat_occupation.id;


--
-- Name: creneau; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.creneau (
    id integer NOT NULL,
    commune_id integer NOT NULL,
    service_id integer NOT NULL,
    debut timestamp with time zone NOT NULL,
    capacite integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.creneau OWNER TO civismart;

--
-- Name: creneau_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.creneau_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.creneau_id_seq OWNER TO civismart;

--
-- Name: creneau_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.creneau_id_seq OWNED BY public.creneau.id;


--
-- Name: epic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.epic (
    id integer NOT NULL,
    sigle text NOT NULL,
    nom text NOT NULL,
    categorie public.epic_categorie NOT NULL,
    type public.epic_type DEFAULT 'local'::public.epic_type NOT NULL,
    description text,
    actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.epic OWNER TO postgres;

--
-- Name: epic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.epic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.epic_id_seq OWNER TO postgres;

--
-- Name: epic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.epic_id_seq OWNED BY public.epic.id;


--
-- Name: icua_snapshot; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.icua_snapshot (
    id bigint NOT NULL,
    commune_id integer,
    date_calcul date NOT NULL,
    proprete numeric(5,2),
    reactivite numeric(5,2),
    vivre_ensemble numeric(5,2),
    fluidite numeric(5,2),
    engagement numeric(5,2),
    icua_global numeric(5,2)
);


ALTER TABLE public.icua_snapshot OWNER TO civismart;

--
-- Name: icua_snapshot_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.icua_snapshot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.icua_snapshot_id_seq OWNER TO civismart;

--
-- Name: icua_snapshot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.icua_snapshot_id_seq OWNED BY public.icua_snapshot.id;


--
-- Name: loyer_paiement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyer_paiement (
    id integer NOT NULL,
    contrat_id integer NOT NULL,
    mois date NOT NULL,
    montant bigint NOT NULL,
    paye_le date,
    mode_paiement text,
    reference_virement text,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.loyer_paiement OWNER TO postgres;

--
-- Name: loyer_paiement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.loyer_paiement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.loyer_paiement_id_seq OWNER TO postgres;

--
-- Name: loyer_paiement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.loyer_paiement_id_seq OWNED BY public.loyer_paiement.id;


--
-- Name: operateur; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.operateur (
    id integer NOT NULL,
    nom text NOT NULL,
    domaine public.signal_domaine NOT NULL,
    contact text
);


ALTER TABLE public.operateur OWNER TO civismart;

--
-- Name: operateur_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.operateur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operateur_id_seq OWNER TO civismart;

--
-- Name: operateur_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.operateur_id_seq OWNED BY public.operateur.id;


--
-- Name: operateur_perimetre; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.operateur_perimetre (
    operateur_id integer NOT NULL,
    commune_id integer NOT NULL
);


ALTER TABLE public.operateur_perimetre OWNER TO civismart;

--
-- Name: points_journal; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.points_journal (
    id bigint NOT NULL,
    citoyen_id uuid NOT NULL,
    delta integer NOT NULL,
    motif text NOT NULL,
    ref_type text,
    ref_id text,
    le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.points_journal OWNER TO civismart;

--
-- Name: points_journal_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.points_journal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.points_journal_id_seq OWNER TO civismart;

--
-- Name: points_journal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.points_journal_id_seq OWNED BY public.points_journal.id;


--
-- Name: rdv; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.rdv (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creneau_id integer NOT NULL,
    citoyen_id uuid NOT NULL,
    numero_ticket integer NOT NULL,
    statut public.rdv_statut DEFAULT 'reserve'::public.rdv_statut NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    maj_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rdv OWNER TO civismart;

--
-- Name: service; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.service (
    id integer NOT NULL,
    nom text NOT NULL,
    famille public.famille_service NOT NULL,
    duree_min integer DEFAULT 15 NOT NULL
);


ALTER TABLE public.service OWNER TO civismart;

--
-- Name: service_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_id_seq OWNER TO civismart;

--
-- Name: service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.service_id_seq OWNED BY public.service.id;


--
-- Name: signalement; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.signalement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference text NOT NULL,
    domaine public.signal_domaine NOT NULL,
    categorie_id integer NOT NULL,
    citoyen_id uuid,
    commune_id integer,
    operateur_id integer,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    description text,
    photo_path text,
    etat public.signal_etat DEFAULT 'recu'::public.signal_etat NOT NULL,
    preuve_path text,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    resolu_le timestamp with time zone
);


ALTER TABLE public.signalement OWNER TO civismart;

--
-- Name: signalement_historique; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.signalement_historique (
    id bigint NOT NULL,
    signalement_id uuid NOT NULL,
    etat public.signal_etat NOT NULL,
    par_utilisateur uuid,
    le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.signalement_historique OWNER TO civismart;

--
-- Name: signalement_historique_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.signalement_historique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.signalement_historique_id_seq OWNER TO civismart;

--
-- Name: signalement_historique_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.signalement_historique_id_seq OWNED BY public.signalement_historique.id;


--
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.utilisateur (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    telephone text NOT NULL,
    email text,
    nom text,
    prenom text,
    mot_de_passe text NOT NULL,
    role public.user_role DEFAULT 'citoyen'::public.user_role NOT NULL,
    commune_id integer,
    operateur_id integer,
    points integer DEFAULT 0 NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.utilisateur OWNER TO civismart;

--
-- Name: bien_historique id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_historique ALTER COLUMN id SET DEFAULT nextval('public.bien_historique_id_seq'::regclass);


--
-- Name: bien_immobilier id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_immobilier ALTER COLUMN id SET DEFAULT nextval('public.bien_immobilier_id_seq'::regclass);


--
-- Name: categorie_signal id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.categorie_signal ALTER COLUMN id SET DEFAULT nextval('public.categorie_signal_id_seq'::regclass);


--
-- Name: commune id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.commune ALTER COLUMN id SET DEFAULT nextval('public.commune_id_seq'::regclass);


--
-- Name: contrat_occupation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrat_occupation ALTER COLUMN id SET DEFAULT nextval('public.contrat_occupation_id_seq'::regclass);


--
-- Name: creneau id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.creneau ALTER COLUMN id SET DEFAULT nextval('public.creneau_id_seq'::regclass);


--
-- Name: epic id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.epic ALTER COLUMN id SET DEFAULT nextval('public.epic_id_seq'::regclass);


--
-- Name: icua_snapshot id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.icua_snapshot ALTER COLUMN id SET DEFAULT nextval('public.icua_snapshot_id_seq'::regclass);


--
-- Name: loyer_paiement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyer_paiement ALTER COLUMN id SET DEFAULT nextval('public.loyer_paiement_id_seq'::regclass);


--
-- Name: operateur id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.operateur ALTER COLUMN id SET DEFAULT nextval('public.operateur_id_seq'::regclass);


--
-- Name: points_journal id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.points_journal ALTER COLUMN id SET DEFAULT nextval('public.points_journal_id_seq'::regclass);


--
-- Name: service id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.service ALTER COLUMN id SET DEFAULT nextval('public.service_id_seq'::regclass);


--
-- Name: signalement_historique id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement_historique ALTER COLUMN id SET DEFAULT nextval('public.signalement_historique_id_seq'::regclass);


--
-- Data for Name: _migrations; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public._migrations (nom, applique_le) FROM stdin;
001_init.sql	2026-06-24 16:12:13.28135+00
002_patrimoine.sql	2026-06-25 15:54:33.783854+00
\.


--
-- Data for Name: bien_historique; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bien_historique (id, bien_id, ancien_statut, nouveau_statut, motif, agent_id, cree_le) FROM stdin;
1	4	libre	libre	\N	6a66fe3a-b531-409d-a02b-d8128f581a27	2026-06-25 18:05:59.041189+00
\.


--
-- Data for Name: bien_immobilier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bien_immobilier (id, reference, type, adresse, commune_id, surface_m2, lat, lng, etat_physique, statut, proprietaire, valeur_venale, notes, cree_le, maj_le) FROM stdin;
1	PAT-H3FKZWYB	local_commercial	ALGER	18	120.00	\N	\N	bon	libre	Wilaya d'Alger	\N	FVRFR	2026-06-25 16:17:37.962191+00	2026-06-25 16:17:37.962191+00
2	PAT-HTC3UE0J	local_commercial	12 Rue Didouche Mourad, Alger	1	80.00	\N	\N	bon	libre	Wilaya d'Alger	\N	\N	2026-06-25 16:18:11.523579+00	2026-06-25 16:18:11.523579+00
3	PAT-LVN0HMCH	local_commercial	TGGGVG	9	129.00	\N	\N	bon	libre	HBHB	\N	GVGVGV	2026-06-25 16:21:21.14186+00	2026-06-25 16:21:21.14186+00
5	PAT-ALG001	local_commercial	12 Rue Didouche Mourad, Alger-Centre	1	120.00	36.738	3.0481	bon	loue	RFVA — Régie Foncière de la Ville d'Alger	\N	Local commercial en rez-de-chaussée, façade sur rue commerçante	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
6	PAT-ALG002	bureau	3 Rue des Frères Bouali, Sidi M'Hamed	2	85.00	36.7355	3.0685	bon	affecte	Wilaya d'Alger	\N	Bureaux administratifs direction de l'éducation nationale	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
7	PAT-ALG003	logement	Cité Climat de France Bât. C, Bab El Oued	7	65.00	36.7722	3.0443	degrade	occupe_sans_titre	OPGI-HD — Office de Promotion et de Gestion Immobilière — Hussein Dey	\N	Occupant sans titre depuis 2019 — procédure juridique en cours	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
8	PAT-ALG004	equipement	Place des Martyrs, La Casbah	4	200.00	36.7863	3.0582	en_travaux	en_travaux	OGEBC — Office National de Gestion des Biens Culturels Protégés	\N	Salle polyvalente en réhabilitation — livraison prévue T3 2026	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
9	PAT-ALG005	terrain	Zone industrielle Rouïba, lot 14	1	1500.00	36.71	3.28	bon	libre	Wilaya d'Alger	\N	Terrain nu viabilisé disponible pour cession ou location emphytéotique	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
10	PAT-ALG006	local_commercial	47 Bd Krim Belkacem, Hussein Dey	5	95.00	36.7415	3.1085	bon	loue	RFVA — Régie Foncière de la Ville d'Alger	\N	Boutique artisanale, locataire SARL Artisanat du Centre	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
11	PAT-ALG007	bureau	Rue Abane Ramdane, El Madania	3	140.00	36.7215	3.0558	bon	affecte	Wilaya d'Alger	\N	Siège de la direction de l'action sociale de wilaya	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
12	PAT-ALG008	immeuble	Avenue Franklin Roosevelt, Hydra	10	450.00	36.753	3.026	degrade	contentieux	OPGI-BMR — Office de Promotion et de Gestion Immobilière — Bir Mourad Raïs	\N	Immeuble R+5 — litige successoral en instance devant le tribunal	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
13	PAT-ALG009	local_commercial	Marché Meissonnier, Alger-Centre	1	55.00	36.7395	3.051	bon	loue	RFVA — Régie Foncière de la Ville d'Alger	\N	Stand marché couvert — activité maraîchage	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
14	PAT-ALG010	terrain	Oued El Harrach berge Nord, El Harrach	5	3200.00	36.721	3.15	bon	libre	ECOLOH — Établissement de Gestion de l'Oued El Harrach	\N	Terrain riverain dédié à l'aménagement paysager de l'oued	2026-06-25 17:41:07.008831+00	2026-06-25 17:41:07.008831+00
4	PAT-56859XV2	bureau	uhuhuh	34	120.00	\N	\N	bon	libre	Wilaya d'Alger	\N	HUHU	2026-06-25 16:36:21.327874+00	2026-06-25 18:05:59.041189+00
\.


--
-- Data for Name: categorie_signal; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.categorie_signal (id, domaine, libelle, criticite) FROM stdin;
1	proprete	Dépôt sauvage de déchets	haute
2	proprete	Benne pleine / débordante	moyenne
3	proprete	Déchets encombrants	basse
4	proprete	Graffiti / tags	basse
5	proprete	Nid de poule / voirie	haute
6	proprete	Éclairage public défaillant	moyenne
7	proprete	Autre propreté	basse
8	eau	Fuite sur conduite principale	haute
9	eau	Coupure d'eau	haute
10	eau	Eau non potable / colorée	haute
11	eau	Fuite sur compteur	moyenne
12	eau	Pression insuffisante	moyenne
13	eau	Inondation / refoulement	haute
14	eau	Autre eau	basse
\.


--
-- Data for Name: circonscription; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.circonscription (id, nom) FROM stdin;
1	Alger-Centre
2	Bab El Oued
3	Bir Mourad Raïs
4	Bouzaréah
5	Chéraga
6	Zéralda
7	Draria
8	El Harrach
9	Baraki
10	Bab Ezzouar
11	Dar El Beïda
12	Bordj El Kiffan
13	Rouïba
\.


--
-- Data for Name: commune; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.commune (id, nom, circonscription_id, centre_lat, centre_lng) FROM stdin;
1	Alger-Centre	1	36.7372	3.0875
2	Sidi M'Hamed	1	36.75	3.0933
3	El Madania	1	36.7411	3.0742
4	Casbah	1	36.785	3.06
5	Hussein Dey	1	36.735	3.117
6	Oued Koriche	1	36.775	3.035
7	Bab El Oued	2	36.79	3.05
8	Bologhine	2	36.8	3.03
9	Bir Mourad Raïs	3	36.72	3.06
10	Hydra	3	36.745	3.02
11	El Biar	3	36.755	3.015
12	El Mouradia	3	36.73	3.05
13	Birkhradem	3	36.705	3.05
14	Bouzaréah	4	36.78	3
15	El Achour	4	36.735	2.985
16	Dely Ibrahim	4	36.76	2.98
17	Ben Aknoun	4	36.76	2.99
18	Beni Messous	4	36.775	2.97
19	Rahmania	4	36.8	2.95
20	Souidania	4	36.765	2.93
21	Chéraga	5	36.765	2.96
22	Aïn Benian	5	36.805	2.92
23	Raïs Hamidou	5	36.82	2.9
24	Zéralda	6	36.72	2.83
25	Mahelma	6	36.7	2.86
26	Tessala El Merdja	6	36.68	2.91
27	Saoula	6	36.69	2.98
28	Staoueli	6	36.75	2.87
29	Ouled Fayet	6	36.72	2.91
30	Draria	7	36.705	3.01
31	Baba Hassan	7	36.68	3.01
32	Ouled Chebel	7	36.67	3.05
33	Khraïcia	7	36.665	3.08
34	Birtouta	7	36.69	2.97
35	El Harrach	8	36.7167	3.1333
36	Kouba	8	36.7267	3.0983
37	Bachdjarah	8	36.71	3.12
38	Bourouba	8	36.72	3.11
39	Mohammadia	8	36.73	3.14
40	Séhaoula	8	36.705	3.065
41	Djasr Kasentina	8	36.735	3.155
42	Gué de Constantine	8	36.725	3.17
43	Baraki	9	36.67	3.1
44	Les Eucalyptus	9	36.68	3.15
45	Sidi Moussa	9	36.66	3.17
46	Bab Ezzouar	10	36.72	3.183
47	Bordj El Bahri	10	36.74	3.21
48	El Magharia	10	36.71	3.165
49	Oued Smar	10	36.71	3.145
50	Dar El Beïda	11	36.72	3.215
51	Aïn Taya	11	36.79	3.31
52	Hraoua	11	36.72	3.27
53	Bordj El Kiffan	12	36.75	3.22
54	Rouïba	13	36.73	3.285
55	Reghaïa	13	36.725	3.345
\.


--
-- Data for Name: contrat_occupation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contrat_occupation (id, bien_id, occupant_nom, occupant_tel, occupant_nin, type_contrat, date_debut, date_fin, loyer_mensuel, caution, statut_paiement, actif, notes, cree_le) FROM stdin;
1	5	SARL Librairie El Djazair	0551234567	RC-16/00-B-0042317	location	2023-01-01	2026-07-15	45000	90000	a_jour	t	Bail commercial renouvelable — activité librairie-papeterie	2026-06-25 17:41:07.02224+00
2	6	Direction de l'Éducation Nationale — Wilaya d'Alger	021730000	\N	affectation	2021-09-01	2027-08-31	0	0	a_jour	t	Mise à disposition gratuite — usage administratif exclusif	2026-06-25 17:41:07.039757+00
3	10	EURL Confection Moderne	0661890234	RC-16/00-B-0078954	location	2024-03-01	2026-08-01	38000	76000	retard	t	Locataire en retard de 2 mois — relance envoyée le 10/06/2026	2026-06-25 17:41:07.05883+00
4	11	Direction de l'Action Sociale — Wilaya d'Alger	021657890	\N	affectation	2020-01-01	\N	0	0	a_jour	t	Affectation permanente — siège DAS Wilaya	2026-06-25 17:41:07.072272+00
5	13	M. Boumediene Hamid	0770456123	1985-ALG-045678	location	2025-01-01	2025-12-31	18000	36000	impaye	t	Stand marché — loyer impayé depuis avril 2026	2026-06-25 17:41:07.088953+00
\.


--
-- Data for Name: creneau; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.creneau (id, commune_id, service_id, debut, capacite) FROM stdin;
1	1	11	2026-06-25 17:17:35.649196+00	10
2	1	12	2026-06-25 17:17:35.649196+00	10
3	1	13	2026-06-25 17:17:35.649196+00	10
4	1	14	2026-06-25 17:17:35.649196+00	10
5	1	15	2026-06-25 17:17:35.649196+00	10
6	1	11	2026-06-26 17:17:35.649196+00	10
7	1	12	2026-06-26 17:17:35.649196+00	10
8	1	13	2026-06-26 17:17:35.649196+00	10
9	1	14	2026-06-26 17:17:35.649196+00	10
10	1	15	2026-06-26 17:17:35.649196+00	10
11	1	11	2026-06-27 17:17:35.649196+00	10
12	1	12	2026-06-27 17:17:35.649196+00	10
13	1	13	2026-06-27 17:17:35.649196+00	10
14	1	14	2026-06-27 17:17:35.649196+00	10
15	1	15	2026-06-27 17:17:35.649196+00	10
16	1	11	2026-06-28 17:17:35.649196+00	10
17	1	12	2026-06-28 17:17:35.649196+00	10
18	1	13	2026-06-28 17:17:35.649196+00	10
19	1	14	2026-06-28 17:17:35.649196+00	10
20	1	15	2026-06-28 17:17:35.649196+00	10
21	1	11	2026-06-29 17:17:35.649196+00	10
22	1	12	2026-06-29 17:17:35.649196+00	10
23	1	13	2026-06-29 17:17:35.649196+00	10
24	1	14	2026-06-29 17:17:35.649196+00	10
25	1	15	2026-06-29 17:17:35.649196+00	10
26	1	11	2026-06-30 17:17:35.649196+00	10
27	1	12	2026-06-30 17:17:35.649196+00	10
28	1	13	2026-06-30 17:17:35.649196+00	10
29	1	14	2026-06-30 17:17:35.649196+00	10
30	1	15	2026-06-30 17:17:35.649196+00	10
31	1	11	2026-07-01 17:17:35.649196+00	10
32	1	12	2026-07-01 17:17:35.649196+00	10
33	1	13	2026-07-01 17:17:35.649196+00	10
34	1	14	2026-07-01 17:17:35.649196+00	10
35	1	15	2026-07-01 17:17:35.649196+00	10
36	2	11	2026-06-25 17:17:35.649196+00	10
37	2	12	2026-06-25 17:17:35.649196+00	10
38	2	13	2026-06-25 17:17:35.649196+00	10
39	2	14	2026-06-25 17:17:35.649196+00	10
40	2	15	2026-06-25 17:17:35.649196+00	10
41	2	11	2026-06-26 17:17:35.649196+00	10
42	2	12	2026-06-26 17:17:35.649196+00	10
43	2	13	2026-06-26 17:17:35.649196+00	10
44	2	14	2026-06-26 17:17:35.649196+00	10
45	2	15	2026-06-26 17:17:35.649196+00	10
46	2	11	2026-06-27 17:17:35.649196+00	10
47	2	12	2026-06-27 17:17:35.649196+00	10
48	2	13	2026-06-27 17:17:35.649196+00	10
49	2	14	2026-06-27 17:17:35.649196+00	10
50	2	15	2026-06-27 17:17:35.649196+00	10
51	2	11	2026-06-28 17:17:35.649196+00	10
52	2	12	2026-06-28 17:17:35.649196+00	10
53	2	13	2026-06-28 17:17:35.649196+00	10
54	2	14	2026-06-28 17:17:35.649196+00	10
55	2	15	2026-06-28 17:17:35.649196+00	10
56	2	11	2026-06-29 17:17:35.649196+00	10
57	2	12	2026-06-29 17:17:35.649196+00	10
58	2	13	2026-06-29 17:17:35.649196+00	10
59	2	14	2026-06-29 17:17:35.649196+00	10
60	2	15	2026-06-29 17:17:35.649196+00	10
61	2	11	2026-06-30 17:17:35.649196+00	10
62	2	12	2026-06-30 17:17:35.649196+00	10
63	2	13	2026-06-30 17:17:35.649196+00	10
64	2	14	2026-06-30 17:17:35.649196+00	10
65	2	15	2026-06-30 17:17:35.649196+00	10
66	2	11	2026-07-01 17:17:35.649196+00	10
67	2	12	2026-07-01 17:17:35.649196+00	10
68	2	13	2026-07-01 17:17:35.649196+00	10
69	2	14	2026-07-01 17:17:35.649196+00	10
70	2	15	2026-07-01 17:17:35.649196+00	10
71	3	11	2026-06-25 17:17:35.649196+00	10
72	3	12	2026-06-25 17:17:35.649196+00	10
73	3	13	2026-06-25 17:17:35.649196+00	10
74	3	14	2026-06-25 17:17:35.649196+00	10
75	3	15	2026-06-25 17:17:35.649196+00	10
76	3	11	2026-06-26 17:17:35.649196+00	10
77	3	12	2026-06-26 17:17:35.649196+00	10
78	3	13	2026-06-26 17:17:35.649196+00	10
79	3	14	2026-06-26 17:17:35.649196+00	10
80	3	15	2026-06-26 17:17:35.649196+00	10
81	3	11	2026-06-27 17:17:35.649196+00	10
82	3	12	2026-06-27 17:17:35.649196+00	10
83	3	13	2026-06-27 17:17:35.649196+00	10
84	3	14	2026-06-27 17:17:35.649196+00	10
85	3	15	2026-06-27 17:17:35.649196+00	10
86	3	11	2026-06-28 17:17:35.649196+00	10
87	3	12	2026-06-28 17:17:35.649196+00	10
88	3	13	2026-06-28 17:17:35.649196+00	10
89	3	14	2026-06-28 17:17:35.649196+00	10
90	3	15	2026-06-28 17:17:35.649196+00	10
91	3	11	2026-06-29 17:17:35.649196+00	10
92	3	12	2026-06-29 17:17:35.649196+00	10
93	3	13	2026-06-29 17:17:35.649196+00	10
94	3	14	2026-06-29 17:17:35.649196+00	10
95	3	15	2026-06-29 17:17:35.649196+00	10
96	3	11	2026-06-30 17:17:35.649196+00	10
97	3	12	2026-06-30 17:17:35.649196+00	10
98	3	13	2026-06-30 17:17:35.649196+00	10
99	3	14	2026-06-30 17:17:35.649196+00	10
100	3	15	2026-06-30 17:17:35.649196+00	10
101	3	11	2026-07-01 17:17:35.649196+00	10
102	3	12	2026-07-01 17:17:35.649196+00	10
103	3	13	2026-07-01 17:17:35.649196+00	10
104	3	14	2026-07-01 17:17:35.649196+00	10
105	3	15	2026-07-01 17:17:35.649196+00	10
106	4	11	2026-06-25 17:17:35.649196+00	10
107	4	12	2026-06-25 17:17:35.649196+00	10
108	4	13	2026-06-25 17:17:35.649196+00	10
109	4	14	2026-06-25 17:17:35.649196+00	10
110	4	15	2026-06-25 17:17:35.649196+00	10
111	4	11	2026-06-26 17:17:35.649196+00	10
112	4	12	2026-06-26 17:17:35.649196+00	10
113	4	13	2026-06-26 17:17:35.649196+00	10
114	4	14	2026-06-26 17:17:35.649196+00	10
115	4	15	2026-06-26 17:17:35.649196+00	10
116	4	11	2026-06-27 17:17:35.649196+00	10
117	4	12	2026-06-27 17:17:35.649196+00	10
118	4	13	2026-06-27 17:17:35.649196+00	10
119	4	14	2026-06-27 17:17:35.649196+00	10
120	4	15	2026-06-27 17:17:35.649196+00	10
121	4	11	2026-06-28 17:17:35.649196+00	10
122	4	12	2026-06-28 17:17:35.649196+00	10
123	4	13	2026-06-28 17:17:35.649196+00	10
124	4	14	2026-06-28 17:17:35.649196+00	10
125	4	15	2026-06-28 17:17:35.649196+00	10
126	4	11	2026-06-29 17:17:35.649196+00	10
127	4	12	2026-06-29 17:17:35.649196+00	10
128	4	13	2026-06-29 17:17:35.649196+00	10
129	4	14	2026-06-29 17:17:35.649196+00	10
130	4	15	2026-06-29 17:17:35.649196+00	10
131	4	11	2026-06-30 17:17:35.649196+00	10
132	4	12	2026-06-30 17:17:35.649196+00	10
133	4	13	2026-06-30 17:17:35.649196+00	10
134	4	14	2026-06-30 17:17:35.649196+00	10
135	4	15	2026-06-30 17:17:35.649196+00	10
136	4	11	2026-07-01 17:17:35.649196+00	10
137	4	12	2026-07-01 17:17:35.649196+00	10
138	4	13	2026-07-01 17:17:35.649196+00	10
139	4	14	2026-07-01 17:17:35.649196+00	10
140	4	15	2026-07-01 17:17:35.649196+00	10
141	5	11	2026-06-25 17:17:35.649196+00	10
142	5	12	2026-06-25 17:17:35.649196+00	10
143	5	13	2026-06-25 17:17:35.649196+00	10
144	5	14	2026-06-25 17:17:35.649196+00	10
145	5	15	2026-06-25 17:17:35.649196+00	10
146	5	11	2026-06-26 17:17:35.649196+00	10
147	5	12	2026-06-26 17:17:35.649196+00	10
148	5	13	2026-06-26 17:17:35.649196+00	10
149	5	14	2026-06-26 17:17:35.649196+00	10
150	5	15	2026-06-26 17:17:35.649196+00	10
151	5	11	2026-06-27 17:17:35.649196+00	10
152	5	12	2026-06-27 17:17:35.649196+00	10
153	5	13	2026-06-27 17:17:35.649196+00	10
154	5	14	2026-06-27 17:17:35.649196+00	10
155	5	15	2026-06-27 17:17:35.649196+00	10
156	5	11	2026-06-28 17:17:35.649196+00	10
157	5	12	2026-06-28 17:17:35.649196+00	10
158	5	13	2026-06-28 17:17:35.649196+00	10
159	5	14	2026-06-28 17:17:35.649196+00	10
160	5	15	2026-06-28 17:17:35.649196+00	10
161	5	11	2026-06-29 17:17:35.649196+00	10
162	5	12	2026-06-29 17:17:35.649196+00	10
163	5	13	2026-06-29 17:17:35.649196+00	10
164	5	14	2026-06-29 17:17:35.649196+00	10
165	5	15	2026-06-29 17:17:35.649196+00	10
166	5	11	2026-06-30 17:17:35.649196+00	10
167	5	12	2026-06-30 17:17:35.649196+00	10
168	5	13	2026-06-30 17:17:35.649196+00	10
169	5	14	2026-06-30 17:17:35.649196+00	10
170	5	15	2026-06-30 17:17:35.649196+00	10
171	5	11	2026-07-01 17:17:35.649196+00	10
172	5	12	2026-07-01 17:17:35.649196+00	10
173	5	13	2026-07-01 17:17:35.649196+00	10
174	5	14	2026-07-01 17:17:35.649196+00	10
175	5	15	2026-07-01 17:17:35.649196+00	10
176	6	11	2026-06-25 17:17:35.649196+00	10
177	6	12	2026-06-25 17:17:35.649196+00	10
178	6	13	2026-06-25 17:17:35.649196+00	10
179	6	14	2026-06-25 17:17:35.649196+00	10
180	6	15	2026-06-25 17:17:35.649196+00	10
181	6	11	2026-06-26 17:17:35.649196+00	10
182	6	12	2026-06-26 17:17:35.649196+00	10
183	6	13	2026-06-26 17:17:35.649196+00	10
184	6	14	2026-06-26 17:17:35.649196+00	10
185	6	15	2026-06-26 17:17:35.649196+00	10
186	6	11	2026-06-27 17:17:35.649196+00	10
187	6	12	2026-06-27 17:17:35.649196+00	10
188	6	13	2026-06-27 17:17:35.649196+00	10
189	6	14	2026-06-27 17:17:35.649196+00	10
190	6	15	2026-06-27 17:17:35.649196+00	10
191	6	11	2026-06-28 17:17:35.649196+00	10
192	6	12	2026-06-28 17:17:35.649196+00	10
193	6	13	2026-06-28 17:17:35.649196+00	10
194	6	14	2026-06-28 17:17:35.649196+00	10
195	6	15	2026-06-28 17:17:35.649196+00	10
196	6	11	2026-06-29 17:17:35.649196+00	10
197	6	12	2026-06-29 17:17:35.649196+00	10
198	6	13	2026-06-29 17:17:35.649196+00	10
199	6	14	2026-06-29 17:17:35.649196+00	10
200	6	15	2026-06-29 17:17:35.649196+00	10
201	6	11	2026-06-30 17:17:35.649196+00	10
202	6	12	2026-06-30 17:17:35.649196+00	10
203	6	13	2026-06-30 17:17:35.649196+00	10
204	6	14	2026-06-30 17:17:35.649196+00	10
205	6	15	2026-06-30 17:17:35.649196+00	10
206	6	11	2026-07-01 17:17:35.649196+00	10
207	6	12	2026-07-01 17:17:35.649196+00	10
208	6	13	2026-07-01 17:17:35.649196+00	10
209	6	14	2026-07-01 17:17:35.649196+00	10
210	6	15	2026-07-01 17:17:35.649196+00	10
211	7	11	2026-06-25 17:17:35.649196+00	10
212	7	12	2026-06-25 17:17:35.649196+00	10
213	7	13	2026-06-25 17:17:35.649196+00	10
214	7	14	2026-06-25 17:17:35.649196+00	10
215	7	15	2026-06-25 17:17:35.649196+00	10
216	7	11	2026-06-26 17:17:35.649196+00	10
217	7	12	2026-06-26 17:17:35.649196+00	10
218	7	13	2026-06-26 17:17:35.649196+00	10
219	7	14	2026-06-26 17:17:35.649196+00	10
220	7	15	2026-06-26 17:17:35.649196+00	10
221	7	11	2026-06-27 17:17:35.649196+00	10
222	7	12	2026-06-27 17:17:35.649196+00	10
223	7	13	2026-06-27 17:17:35.649196+00	10
224	7	14	2026-06-27 17:17:35.649196+00	10
225	7	15	2026-06-27 17:17:35.649196+00	10
226	7	11	2026-06-28 17:17:35.649196+00	10
227	7	12	2026-06-28 17:17:35.649196+00	10
228	7	13	2026-06-28 17:17:35.649196+00	10
229	7	14	2026-06-28 17:17:35.649196+00	10
230	7	15	2026-06-28 17:17:35.649196+00	10
231	7	11	2026-06-29 17:17:35.649196+00	10
232	7	12	2026-06-29 17:17:35.649196+00	10
233	7	13	2026-06-29 17:17:35.649196+00	10
234	7	14	2026-06-29 17:17:35.649196+00	10
235	7	15	2026-06-29 17:17:35.649196+00	10
236	7	11	2026-06-30 17:17:35.649196+00	10
237	7	12	2026-06-30 17:17:35.649196+00	10
238	7	13	2026-06-30 17:17:35.649196+00	10
239	7	14	2026-06-30 17:17:35.649196+00	10
240	7	15	2026-06-30 17:17:35.649196+00	10
241	7	11	2026-07-01 17:17:35.649196+00	10
242	7	12	2026-07-01 17:17:35.649196+00	10
243	7	13	2026-07-01 17:17:35.649196+00	10
244	7	14	2026-07-01 17:17:35.649196+00	10
245	7	15	2026-07-01 17:17:35.649196+00	10
246	8	11	2026-06-25 17:17:35.649196+00	10
247	8	12	2026-06-25 17:17:35.649196+00	10
248	8	13	2026-06-25 17:17:35.649196+00	10
249	8	14	2026-06-25 17:17:35.649196+00	10
250	8	15	2026-06-25 17:17:35.649196+00	10
251	8	11	2026-06-26 17:17:35.649196+00	10
252	8	12	2026-06-26 17:17:35.649196+00	10
253	8	13	2026-06-26 17:17:35.649196+00	10
254	8	14	2026-06-26 17:17:35.649196+00	10
255	8	15	2026-06-26 17:17:35.649196+00	10
256	8	11	2026-06-27 17:17:35.649196+00	10
257	8	12	2026-06-27 17:17:35.649196+00	10
258	8	13	2026-06-27 17:17:35.649196+00	10
259	8	14	2026-06-27 17:17:35.649196+00	10
260	8	15	2026-06-27 17:17:35.649196+00	10
261	8	11	2026-06-28 17:17:35.649196+00	10
262	8	12	2026-06-28 17:17:35.649196+00	10
263	8	13	2026-06-28 17:17:35.649196+00	10
264	8	14	2026-06-28 17:17:35.649196+00	10
265	8	15	2026-06-28 17:17:35.649196+00	10
266	8	11	2026-06-29 17:17:35.649196+00	10
267	8	12	2026-06-29 17:17:35.649196+00	10
268	8	13	2026-06-29 17:17:35.649196+00	10
269	8	14	2026-06-29 17:17:35.649196+00	10
270	8	15	2026-06-29 17:17:35.649196+00	10
271	8	11	2026-06-30 17:17:35.649196+00	10
272	8	12	2026-06-30 17:17:35.649196+00	10
273	8	13	2026-06-30 17:17:35.649196+00	10
274	8	14	2026-06-30 17:17:35.649196+00	10
275	8	15	2026-06-30 17:17:35.649196+00	10
276	8	11	2026-07-01 17:17:35.649196+00	10
277	8	12	2026-07-01 17:17:35.649196+00	10
278	8	13	2026-07-01 17:17:35.649196+00	10
279	8	14	2026-07-01 17:17:35.649196+00	10
280	8	15	2026-07-01 17:17:35.649196+00	10
281	9	11	2026-06-25 17:17:35.649196+00	10
282	9	12	2026-06-25 17:17:35.649196+00	10
283	9	13	2026-06-25 17:17:35.649196+00	10
284	9	14	2026-06-25 17:17:35.649196+00	10
285	9	15	2026-06-25 17:17:35.649196+00	10
286	9	11	2026-06-26 17:17:35.649196+00	10
287	9	12	2026-06-26 17:17:35.649196+00	10
288	9	13	2026-06-26 17:17:35.649196+00	10
289	9	14	2026-06-26 17:17:35.649196+00	10
290	9	15	2026-06-26 17:17:35.649196+00	10
291	9	11	2026-06-27 17:17:35.649196+00	10
292	9	12	2026-06-27 17:17:35.649196+00	10
293	9	13	2026-06-27 17:17:35.649196+00	10
294	9	14	2026-06-27 17:17:35.649196+00	10
295	9	15	2026-06-27 17:17:35.649196+00	10
296	9	11	2026-06-28 17:17:35.649196+00	10
297	9	12	2026-06-28 17:17:35.649196+00	10
298	9	13	2026-06-28 17:17:35.649196+00	10
299	9	14	2026-06-28 17:17:35.649196+00	10
300	9	15	2026-06-28 17:17:35.649196+00	10
301	9	11	2026-06-29 17:17:35.649196+00	10
302	9	12	2026-06-29 17:17:35.649196+00	10
303	9	13	2026-06-29 17:17:35.649196+00	10
304	9	14	2026-06-29 17:17:35.649196+00	10
305	9	15	2026-06-29 17:17:35.649196+00	10
306	9	11	2026-06-30 17:17:35.649196+00	10
307	9	12	2026-06-30 17:17:35.649196+00	10
308	9	13	2026-06-30 17:17:35.649196+00	10
309	9	14	2026-06-30 17:17:35.649196+00	10
310	9	15	2026-06-30 17:17:35.649196+00	10
311	9	11	2026-07-01 17:17:35.649196+00	10
312	9	12	2026-07-01 17:17:35.649196+00	10
313	9	13	2026-07-01 17:17:35.649196+00	10
314	9	14	2026-07-01 17:17:35.649196+00	10
315	9	15	2026-07-01 17:17:35.649196+00	10
316	10	11	2026-06-25 17:17:35.649196+00	10
317	10	12	2026-06-25 17:17:35.649196+00	10
318	10	13	2026-06-25 17:17:35.649196+00	10
319	10	14	2026-06-25 17:17:35.649196+00	10
320	10	15	2026-06-25 17:17:35.649196+00	10
321	10	11	2026-06-26 17:17:35.649196+00	10
322	10	12	2026-06-26 17:17:35.649196+00	10
323	10	13	2026-06-26 17:17:35.649196+00	10
324	10	14	2026-06-26 17:17:35.649196+00	10
325	10	15	2026-06-26 17:17:35.649196+00	10
326	10	11	2026-06-27 17:17:35.649196+00	10
327	10	12	2026-06-27 17:17:35.649196+00	10
328	10	13	2026-06-27 17:17:35.649196+00	10
329	10	14	2026-06-27 17:17:35.649196+00	10
330	10	15	2026-06-27 17:17:35.649196+00	10
331	10	11	2026-06-28 17:17:35.649196+00	10
332	10	12	2026-06-28 17:17:35.649196+00	10
333	10	13	2026-06-28 17:17:35.649196+00	10
334	10	14	2026-06-28 17:17:35.649196+00	10
335	10	15	2026-06-28 17:17:35.649196+00	10
336	10	11	2026-06-29 17:17:35.649196+00	10
337	10	12	2026-06-29 17:17:35.649196+00	10
338	10	13	2026-06-29 17:17:35.649196+00	10
339	10	14	2026-06-29 17:17:35.649196+00	10
340	10	15	2026-06-29 17:17:35.649196+00	10
341	10	11	2026-06-30 17:17:35.649196+00	10
342	10	12	2026-06-30 17:17:35.649196+00	10
343	10	13	2026-06-30 17:17:35.649196+00	10
344	10	14	2026-06-30 17:17:35.649196+00	10
345	10	15	2026-06-30 17:17:35.649196+00	10
346	10	11	2026-07-01 17:17:35.649196+00	10
347	10	12	2026-07-01 17:17:35.649196+00	10
348	10	13	2026-07-01 17:17:35.649196+00	10
349	10	14	2026-07-01 17:17:35.649196+00	10
350	10	15	2026-07-01 17:17:35.649196+00	10
351	11	11	2026-06-25 17:17:35.649196+00	10
352	11	12	2026-06-25 17:17:35.649196+00	10
353	11	13	2026-06-25 17:17:35.649196+00	10
354	11	14	2026-06-25 17:17:35.649196+00	10
355	11	15	2026-06-25 17:17:35.649196+00	10
356	11	11	2026-06-26 17:17:35.649196+00	10
357	11	12	2026-06-26 17:17:35.649196+00	10
358	11	13	2026-06-26 17:17:35.649196+00	10
359	11	14	2026-06-26 17:17:35.649196+00	10
360	11	15	2026-06-26 17:17:35.649196+00	10
361	11	11	2026-06-27 17:17:35.649196+00	10
362	11	12	2026-06-27 17:17:35.649196+00	10
363	11	13	2026-06-27 17:17:35.649196+00	10
364	11	14	2026-06-27 17:17:35.649196+00	10
365	11	15	2026-06-27 17:17:35.649196+00	10
366	11	11	2026-06-28 17:17:35.649196+00	10
367	11	12	2026-06-28 17:17:35.649196+00	10
368	11	13	2026-06-28 17:17:35.649196+00	10
369	11	14	2026-06-28 17:17:35.649196+00	10
370	11	15	2026-06-28 17:17:35.649196+00	10
371	11	11	2026-06-29 17:17:35.649196+00	10
372	11	12	2026-06-29 17:17:35.649196+00	10
373	11	13	2026-06-29 17:17:35.649196+00	10
374	11	14	2026-06-29 17:17:35.649196+00	10
375	11	15	2026-06-29 17:17:35.649196+00	10
376	11	11	2026-06-30 17:17:35.649196+00	10
377	11	12	2026-06-30 17:17:35.649196+00	10
378	11	13	2026-06-30 17:17:35.649196+00	10
379	11	14	2026-06-30 17:17:35.649196+00	10
380	11	15	2026-06-30 17:17:35.649196+00	10
381	11	11	2026-07-01 17:17:35.649196+00	10
382	11	12	2026-07-01 17:17:35.649196+00	10
383	11	13	2026-07-01 17:17:35.649196+00	10
384	11	14	2026-07-01 17:17:35.649196+00	10
385	11	15	2026-07-01 17:17:35.649196+00	10
386	12	11	2026-06-25 17:17:35.649196+00	10
387	12	12	2026-06-25 17:17:35.649196+00	10
388	12	13	2026-06-25 17:17:35.649196+00	10
389	12	14	2026-06-25 17:17:35.649196+00	10
390	12	15	2026-06-25 17:17:35.649196+00	10
391	12	11	2026-06-26 17:17:35.649196+00	10
392	12	12	2026-06-26 17:17:35.649196+00	10
393	12	13	2026-06-26 17:17:35.649196+00	10
394	12	14	2026-06-26 17:17:35.649196+00	10
395	12	15	2026-06-26 17:17:35.649196+00	10
396	12	11	2026-06-27 17:17:35.649196+00	10
397	12	12	2026-06-27 17:17:35.649196+00	10
398	12	13	2026-06-27 17:17:35.649196+00	10
399	12	14	2026-06-27 17:17:35.649196+00	10
400	12	15	2026-06-27 17:17:35.649196+00	10
401	12	11	2026-06-28 17:17:35.649196+00	10
402	12	12	2026-06-28 17:17:35.649196+00	10
403	12	13	2026-06-28 17:17:35.649196+00	10
404	12	14	2026-06-28 17:17:35.649196+00	10
405	12	15	2026-06-28 17:17:35.649196+00	10
406	12	11	2026-06-29 17:17:35.649196+00	10
407	12	12	2026-06-29 17:17:35.649196+00	10
408	12	13	2026-06-29 17:17:35.649196+00	10
409	12	14	2026-06-29 17:17:35.649196+00	10
410	12	15	2026-06-29 17:17:35.649196+00	10
411	12	11	2026-06-30 17:17:35.649196+00	10
412	12	12	2026-06-30 17:17:35.649196+00	10
413	12	13	2026-06-30 17:17:35.649196+00	10
414	12	14	2026-06-30 17:17:35.649196+00	10
415	12	15	2026-06-30 17:17:35.649196+00	10
416	12	11	2026-07-01 17:17:35.649196+00	10
417	12	12	2026-07-01 17:17:35.649196+00	10
418	12	13	2026-07-01 17:17:35.649196+00	10
419	12	14	2026-07-01 17:17:35.649196+00	10
420	12	15	2026-07-01 17:17:35.649196+00	10
421	13	11	2026-06-25 17:17:35.649196+00	10
422	13	12	2026-06-25 17:17:35.649196+00	10
423	13	13	2026-06-25 17:17:35.649196+00	10
424	13	14	2026-06-25 17:17:35.649196+00	10
425	13	15	2026-06-25 17:17:35.649196+00	10
426	13	11	2026-06-26 17:17:35.649196+00	10
427	13	12	2026-06-26 17:17:35.649196+00	10
428	13	13	2026-06-26 17:17:35.649196+00	10
429	13	14	2026-06-26 17:17:35.649196+00	10
430	13	15	2026-06-26 17:17:35.649196+00	10
431	13	11	2026-06-27 17:17:35.649196+00	10
432	13	12	2026-06-27 17:17:35.649196+00	10
433	13	13	2026-06-27 17:17:35.649196+00	10
434	13	14	2026-06-27 17:17:35.649196+00	10
435	13	15	2026-06-27 17:17:35.649196+00	10
436	13	11	2026-06-28 17:17:35.649196+00	10
437	13	12	2026-06-28 17:17:35.649196+00	10
438	13	13	2026-06-28 17:17:35.649196+00	10
439	13	14	2026-06-28 17:17:35.649196+00	10
440	13	15	2026-06-28 17:17:35.649196+00	10
441	13	11	2026-06-29 17:17:35.649196+00	10
442	13	12	2026-06-29 17:17:35.649196+00	10
443	13	13	2026-06-29 17:17:35.649196+00	10
444	13	14	2026-06-29 17:17:35.649196+00	10
445	13	15	2026-06-29 17:17:35.649196+00	10
446	13	11	2026-06-30 17:17:35.649196+00	10
447	13	12	2026-06-30 17:17:35.649196+00	10
448	13	13	2026-06-30 17:17:35.649196+00	10
449	13	14	2026-06-30 17:17:35.649196+00	10
450	13	15	2026-06-30 17:17:35.649196+00	10
451	13	11	2026-07-01 17:17:35.649196+00	10
452	13	12	2026-07-01 17:17:35.649196+00	10
453	13	13	2026-07-01 17:17:35.649196+00	10
454	13	14	2026-07-01 17:17:35.649196+00	10
455	13	15	2026-07-01 17:17:35.649196+00	10
456	14	11	2026-06-25 17:17:35.649196+00	10
457	14	12	2026-06-25 17:17:35.649196+00	10
458	14	13	2026-06-25 17:17:35.649196+00	10
459	14	14	2026-06-25 17:17:35.649196+00	10
460	14	15	2026-06-25 17:17:35.649196+00	10
461	14	11	2026-06-26 17:17:35.649196+00	10
462	14	12	2026-06-26 17:17:35.649196+00	10
463	14	13	2026-06-26 17:17:35.649196+00	10
464	14	14	2026-06-26 17:17:35.649196+00	10
465	14	15	2026-06-26 17:17:35.649196+00	10
466	14	11	2026-06-27 17:17:35.649196+00	10
467	14	12	2026-06-27 17:17:35.649196+00	10
468	14	13	2026-06-27 17:17:35.649196+00	10
469	14	14	2026-06-27 17:17:35.649196+00	10
470	14	15	2026-06-27 17:17:35.649196+00	10
471	14	11	2026-06-28 17:17:35.649196+00	10
472	14	12	2026-06-28 17:17:35.649196+00	10
473	14	13	2026-06-28 17:17:35.649196+00	10
474	14	14	2026-06-28 17:17:35.649196+00	10
475	14	15	2026-06-28 17:17:35.649196+00	10
476	14	11	2026-06-29 17:17:35.649196+00	10
477	14	12	2026-06-29 17:17:35.649196+00	10
478	14	13	2026-06-29 17:17:35.649196+00	10
479	14	14	2026-06-29 17:17:35.649196+00	10
480	14	15	2026-06-29 17:17:35.649196+00	10
481	14	11	2026-06-30 17:17:35.649196+00	10
482	14	12	2026-06-30 17:17:35.649196+00	10
483	14	13	2026-06-30 17:17:35.649196+00	10
484	14	14	2026-06-30 17:17:35.649196+00	10
485	14	15	2026-06-30 17:17:35.649196+00	10
486	14	11	2026-07-01 17:17:35.649196+00	10
487	14	12	2026-07-01 17:17:35.649196+00	10
488	14	13	2026-07-01 17:17:35.649196+00	10
489	14	14	2026-07-01 17:17:35.649196+00	10
490	14	15	2026-07-01 17:17:35.649196+00	10
491	15	11	2026-06-25 17:17:35.649196+00	10
492	15	12	2026-06-25 17:17:35.649196+00	10
493	15	13	2026-06-25 17:17:35.649196+00	10
494	15	14	2026-06-25 17:17:35.649196+00	10
495	15	15	2026-06-25 17:17:35.649196+00	10
496	15	11	2026-06-26 17:17:35.649196+00	10
497	15	12	2026-06-26 17:17:35.649196+00	10
498	15	13	2026-06-26 17:17:35.649196+00	10
499	15	14	2026-06-26 17:17:35.649196+00	10
500	15	15	2026-06-26 17:17:35.649196+00	10
501	15	11	2026-06-27 17:17:35.649196+00	10
502	15	12	2026-06-27 17:17:35.649196+00	10
503	15	13	2026-06-27 17:17:35.649196+00	10
504	15	14	2026-06-27 17:17:35.649196+00	10
505	15	15	2026-06-27 17:17:35.649196+00	10
506	15	11	2026-06-28 17:17:35.649196+00	10
507	15	12	2026-06-28 17:17:35.649196+00	10
508	15	13	2026-06-28 17:17:35.649196+00	10
509	15	14	2026-06-28 17:17:35.649196+00	10
510	15	15	2026-06-28 17:17:35.649196+00	10
511	15	11	2026-06-29 17:17:35.649196+00	10
512	15	12	2026-06-29 17:17:35.649196+00	10
513	15	13	2026-06-29 17:17:35.649196+00	10
514	15	14	2026-06-29 17:17:35.649196+00	10
515	15	15	2026-06-29 17:17:35.649196+00	10
516	15	11	2026-06-30 17:17:35.649196+00	10
517	15	12	2026-06-30 17:17:35.649196+00	10
518	15	13	2026-06-30 17:17:35.649196+00	10
519	15	14	2026-06-30 17:17:35.649196+00	10
520	15	15	2026-06-30 17:17:35.649196+00	10
521	15	11	2026-07-01 17:17:35.649196+00	10
522	15	12	2026-07-01 17:17:35.649196+00	10
523	15	13	2026-07-01 17:17:35.649196+00	10
524	15	14	2026-07-01 17:17:35.649196+00	10
525	15	15	2026-07-01 17:17:35.649196+00	10
526	16	11	2026-06-25 17:17:35.649196+00	10
527	16	12	2026-06-25 17:17:35.649196+00	10
528	16	13	2026-06-25 17:17:35.649196+00	10
529	16	14	2026-06-25 17:17:35.649196+00	10
530	16	15	2026-06-25 17:17:35.649196+00	10
531	16	11	2026-06-26 17:17:35.649196+00	10
532	16	12	2026-06-26 17:17:35.649196+00	10
533	16	13	2026-06-26 17:17:35.649196+00	10
534	16	14	2026-06-26 17:17:35.649196+00	10
535	16	15	2026-06-26 17:17:35.649196+00	10
536	16	11	2026-06-27 17:17:35.649196+00	10
537	16	12	2026-06-27 17:17:35.649196+00	10
538	16	13	2026-06-27 17:17:35.649196+00	10
539	16	14	2026-06-27 17:17:35.649196+00	10
540	16	15	2026-06-27 17:17:35.649196+00	10
541	16	11	2026-06-28 17:17:35.649196+00	10
542	16	12	2026-06-28 17:17:35.649196+00	10
543	16	13	2026-06-28 17:17:35.649196+00	10
544	16	14	2026-06-28 17:17:35.649196+00	10
545	16	15	2026-06-28 17:17:35.649196+00	10
546	16	11	2026-06-29 17:17:35.649196+00	10
547	16	12	2026-06-29 17:17:35.649196+00	10
548	16	13	2026-06-29 17:17:35.649196+00	10
549	16	14	2026-06-29 17:17:35.649196+00	10
550	16	15	2026-06-29 17:17:35.649196+00	10
551	16	11	2026-06-30 17:17:35.649196+00	10
552	16	12	2026-06-30 17:17:35.649196+00	10
553	16	13	2026-06-30 17:17:35.649196+00	10
554	16	14	2026-06-30 17:17:35.649196+00	10
555	16	15	2026-06-30 17:17:35.649196+00	10
556	16	11	2026-07-01 17:17:35.649196+00	10
557	16	12	2026-07-01 17:17:35.649196+00	10
558	16	13	2026-07-01 17:17:35.649196+00	10
559	16	14	2026-07-01 17:17:35.649196+00	10
560	16	15	2026-07-01 17:17:35.649196+00	10
561	17	11	2026-06-25 17:17:35.649196+00	10
562	17	12	2026-06-25 17:17:35.649196+00	10
563	17	13	2026-06-25 17:17:35.649196+00	10
564	17	14	2026-06-25 17:17:35.649196+00	10
565	17	15	2026-06-25 17:17:35.649196+00	10
566	17	11	2026-06-26 17:17:35.649196+00	10
567	17	12	2026-06-26 17:17:35.649196+00	10
568	17	13	2026-06-26 17:17:35.649196+00	10
569	17	14	2026-06-26 17:17:35.649196+00	10
570	17	15	2026-06-26 17:17:35.649196+00	10
571	17	11	2026-06-27 17:17:35.649196+00	10
572	17	12	2026-06-27 17:17:35.649196+00	10
573	17	13	2026-06-27 17:17:35.649196+00	10
574	17	14	2026-06-27 17:17:35.649196+00	10
575	17	15	2026-06-27 17:17:35.649196+00	10
576	17	11	2026-06-28 17:17:35.649196+00	10
577	17	12	2026-06-28 17:17:35.649196+00	10
578	17	13	2026-06-28 17:17:35.649196+00	10
579	17	14	2026-06-28 17:17:35.649196+00	10
580	17	15	2026-06-28 17:17:35.649196+00	10
581	17	11	2026-06-29 17:17:35.649196+00	10
582	17	12	2026-06-29 17:17:35.649196+00	10
583	17	13	2026-06-29 17:17:35.649196+00	10
584	17	14	2026-06-29 17:17:35.649196+00	10
585	17	15	2026-06-29 17:17:35.649196+00	10
586	17	11	2026-06-30 17:17:35.649196+00	10
587	17	12	2026-06-30 17:17:35.649196+00	10
588	17	13	2026-06-30 17:17:35.649196+00	10
589	17	14	2026-06-30 17:17:35.649196+00	10
590	17	15	2026-06-30 17:17:35.649196+00	10
591	17	11	2026-07-01 17:17:35.649196+00	10
592	17	12	2026-07-01 17:17:35.649196+00	10
593	17	13	2026-07-01 17:17:35.649196+00	10
594	17	14	2026-07-01 17:17:35.649196+00	10
595	17	15	2026-07-01 17:17:35.649196+00	10
596	18	11	2026-06-25 17:17:35.649196+00	10
597	18	12	2026-06-25 17:17:35.649196+00	10
598	18	13	2026-06-25 17:17:35.649196+00	10
599	18	14	2026-06-25 17:17:35.649196+00	10
600	18	15	2026-06-25 17:17:35.649196+00	10
601	18	11	2026-06-26 17:17:35.649196+00	10
602	18	12	2026-06-26 17:17:35.649196+00	10
603	18	13	2026-06-26 17:17:35.649196+00	10
604	18	14	2026-06-26 17:17:35.649196+00	10
605	18	15	2026-06-26 17:17:35.649196+00	10
606	18	11	2026-06-27 17:17:35.649196+00	10
607	18	12	2026-06-27 17:17:35.649196+00	10
608	18	13	2026-06-27 17:17:35.649196+00	10
609	18	14	2026-06-27 17:17:35.649196+00	10
610	18	15	2026-06-27 17:17:35.649196+00	10
611	18	11	2026-06-28 17:17:35.649196+00	10
612	18	12	2026-06-28 17:17:35.649196+00	10
613	18	13	2026-06-28 17:17:35.649196+00	10
614	18	14	2026-06-28 17:17:35.649196+00	10
615	18	15	2026-06-28 17:17:35.649196+00	10
616	18	11	2026-06-29 17:17:35.649196+00	10
617	18	12	2026-06-29 17:17:35.649196+00	10
618	18	13	2026-06-29 17:17:35.649196+00	10
619	18	14	2026-06-29 17:17:35.649196+00	10
620	18	15	2026-06-29 17:17:35.649196+00	10
621	18	11	2026-06-30 17:17:35.649196+00	10
622	18	12	2026-06-30 17:17:35.649196+00	10
623	18	13	2026-06-30 17:17:35.649196+00	10
624	18	14	2026-06-30 17:17:35.649196+00	10
625	18	15	2026-06-30 17:17:35.649196+00	10
626	18	11	2026-07-01 17:17:35.649196+00	10
627	18	12	2026-07-01 17:17:35.649196+00	10
628	18	13	2026-07-01 17:17:35.649196+00	10
629	18	14	2026-07-01 17:17:35.649196+00	10
630	18	15	2026-07-01 17:17:35.649196+00	10
631	19	11	2026-06-25 17:17:35.649196+00	10
632	19	12	2026-06-25 17:17:35.649196+00	10
633	19	13	2026-06-25 17:17:35.649196+00	10
634	19	14	2026-06-25 17:17:35.649196+00	10
635	19	15	2026-06-25 17:17:35.649196+00	10
636	19	11	2026-06-26 17:17:35.649196+00	10
637	19	12	2026-06-26 17:17:35.649196+00	10
638	19	13	2026-06-26 17:17:35.649196+00	10
639	19	14	2026-06-26 17:17:35.649196+00	10
640	19	15	2026-06-26 17:17:35.649196+00	10
641	19	11	2026-06-27 17:17:35.649196+00	10
642	19	12	2026-06-27 17:17:35.649196+00	10
643	19	13	2026-06-27 17:17:35.649196+00	10
644	19	14	2026-06-27 17:17:35.649196+00	10
645	19	15	2026-06-27 17:17:35.649196+00	10
646	19	11	2026-06-28 17:17:35.649196+00	10
647	19	12	2026-06-28 17:17:35.649196+00	10
648	19	13	2026-06-28 17:17:35.649196+00	10
649	19	14	2026-06-28 17:17:35.649196+00	10
650	19	15	2026-06-28 17:17:35.649196+00	10
651	19	11	2026-06-29 17:17:35.649196+00	10
652	19	12	2026-06-29 17:17:35.649196+00	10
653	19	13	2026-06-29 17:17:35.649196+00	10
654	19	14	2026-06-29 17:17:35.649196+00	10
655	19	15	2026-06-29 17:17:35.649196+00	10
656	19	11	2026-06-30 17:17:35.649196+00	10
657	19	12	2026-06-30 17:17:35.649196+00	10
658	19	13	2026-06-30 17:17:35.649196+00	10
659	19	14	2026-06-30 17:17:35.649196+00	10
660	19	15	2026-06-30 17:17:35.649196+00	10
661	19	11	2026-07-01 17:17:35.649196+00	10
662	19	12	2026-07-01 17:17:35.649196+00	10
663	19	13	2026-07-01 17:17:35.649196+00	10
664	19	14	2026-07-01 17:17:35.649196+00	10
665	19	15	2026-07-01 17:17:35.649196+00	10
666	20	11	2026-06-25 17:17:35.649196+00	10
667	20	12	2026-06-25 17:17:35.649196+00	10
668	20	13	2026-06-25 17:17:35.649196+00	10
669	20	14	2026-06-25 17:17:35.649196+00	10
670	20	15	2026-06-25 17:17:35.649196+00	10
671	20	11	2026-06-26 17:17:35.649196+00	10
672	20	12	2026-06-26 17:17:35.649196+00	10
673	20	13	2026-06-26 17:17:35.649196+00	10
674	20	14	2026-06-26 17:17:35.649196+00	10
675	20	15	2026-06-26 17:17:35.649196+00	10
676	20	11	2026-06-27 17:17:35.649196+00	10
677	20	12	2026-06-27 17:17:35.649196+00	10
678	20	13	2026-06-27 17:17:35.649196+00	10
679	20	14	2026-06-27 17:17:35.649196+00	10
680	20	15	2026-06-27 17:17:35.649196+00	10
681	20	11	2026-06-28 17:17:35.649196+00	10
682	20	12	2026-06-28 17:17:35.649196+00	10
683	20	13	2026-06-28 17:17:35.649196+00	10
684	20	14	2026-06-28 17:17:35.649196+00	10
685	20	15	2026-06-28 17:17:35.649196+00	10
686	20	11	2026-06-29 17:17:35.649196+00	10
687	20	12	2026-06-29 17:17:35.649196+00	10
688	20	13	2026-06-29 17:17:35.649196+00	10
689	20	14	2026-06-29 17:17:35.649196+00	10
690	20	15	2026-06-29 17:17:35.649196+00	10
691	20	11	2026-06-30 17:17:35.649196+00	10
692	20	12	2026-06-30 17:17:35.649196+00	10
693	20	13	2026-06-30 17:17:35.649196+00	10
694	20	14	2026-06-30 17:17:35.649196+00	10
695	20	15	2026-06-30 17:17:35.649196+00	10
696	20	11	2026-07-01 17:17:35.649196+00	10
697	20	12	2026-07-01 17:17:35.649196+00	10
698	20	13	2026-07-01 17:17:35.649196+00	10
699	20	14	2026-07-01 17:17:35.649196+00	10
700	20	15	2026-07-01 17:17:35.649196+00	10
701	21	11	2026-06-25 17:17:35.649196+00	10
702	21	12	2026-06-25 17:17:35.649196+00	10
703	21	13	2026-06-25 17:17:35.649196+00	10
704	21	14	2026-06-25 17:17:35.649196+00	10
705	21	15	2026-06-25 17:17:35.649196+00	10
706	21	11	2026-06-26 17:17:35.649196+00	10
707	21	12	2026-06-26 17:17:35.649196+00	10
708	21	13	2026-06-26 17:17:35.649196+00	10
709	21	14	2026-06-26 17:17:35.649196+00	10
710	21	15	2026-06-26 17:17:35.649196+00	10
711	21	11	2026-06-27 17:17:35.649196+00	10
712	21	12	2026-06-27 17:17:35.649196+00	10
713	21	13	2026-06-27 17:17:35.649196+00	10
714	21	14	2026-06-27 17:17:35.649196+00	10
715	21	15	2026-06-27 17:17:35.649196+00	10
716	21	11	2026-06-28 17:17:35.649196+00	10
717	21	12	2026-06-28 17:17:35.649196+00	10
718	21	13	2026-06-28 17:17:35.649196+00	10
719	21	14	2026-06-28 17:17:35.649196+00	10
720	21	15	2026-06-28 17:17:35.649196+00	10
721	21	11	2026-06-29 17:17:35.649196+00	10
722	21	12	2026-06-29 17:17:35.649196+00	10
723	21	13	2026-06-29 17:17:35.649196+00	10
724	21	14	2026-06-29 17:17:35.649196+00	10
725	21	15	2026-06-29 17:17:35.649196+00	10
726	21	11	2026-06-30 17:17:35.649196+00	10
727	21	12	2026-06-30 17:17:35.649196+00	10
728	21	13	2026-06-30 17:17:35.649196+00	10
729	21	14	2026-06-30 17:17:35.649196+00	10
730	21	15	2026-06-30 17:17:35.649196+00	10
731	21	11	2026-07-01 17:17:35.649196+00	10
732	21	12	2026-07-01 17:17:35.649196+00	10
733	21	13	2026-07-01 17:17:35.649196+00	10
734	21	14	2026-07-01 17:17:35.649196+00	10
735	21	15	2026-07-01 17:17:35.649196+00	10
736	22	11	2026-06-25 17:17:35.649196+00	10
737	22	12	2026-06-25 17:17:35.649196+00	10
738	22	13	2026-06-25 17:17:35.649196+00	10
739	22	14	2026-06-25 17:17:35.649196+00	10
740	22	15	2026-06-25 17:17:35.649196+00	10
741	22	11	2026-06-26 17:17:35.649196+00	10
742	22	12	2026-06-26 17:17:35.649196+00	10
743	22	13	2026-06-26 17:17:35.649196+00	10
744	22	14	2026-06-26 17:17:35.649196+00	10
745	22	15	2026-06-26 17:17:35.649196+00	10
746	22	11	2026-06-27 17:17:35.649196+00	10
747	22	12	2026-06-27 17:17:35.649196+00	10
748	22	13	2026-06-27 17:17:35.649196+00	10
749	22	14	2026-06-27 17:17:35.649196+00	10
750	22	15	2026-06-27 17:17:35.649196+00	10
751	22	11	2026-06-28 17:17:35.649196+00	10
752	22	12	2026-06-28 17:17:35.649196+00	10
753	22	13	2026-06-28 17:17:35.649196+00	10
754	22	14	2026-06-28 17:17:35.649196+00	10
755	22	15	2026-06-28 17:17:35.649196+00	10
756	22	11	2026-06-29 17:17:35.649196+00	10
757	22	12	2026-06-29 17:17:35.649196+00	10
758	22	13	2026-06-29 17:17:35.649196+00	10
759	22	14	2026-06-29 17:17:35.649196+00	10
760	22	15	2026-06-29 17:17:35.649196+00	10
761	22	11	2026-06-30 17:17:35.649196+00	10
762	22	12	2026-06-30 17:17:35.649196+00	10
763	22	13	2026-06-30 17:17:35.649196+00	10
764	22	14	2026-06-30 17:17:35.649196+00	10
765	22	15	2026-06-30 17:17:35.649196+00	10
766	22	11	2026-07-01 17:17:35.649196+00	10
767	22	12	2026-07-01 17:17:35.649196+00	10
768	22	13	2026-07-01 17:17:35.649196+00	10
769	22	14	2026-07-01 17:17:35.649196+00	10
770	22	15	2026-07-01 17:17:35.649196+00	10
771	23	11	2026-06-25 17:17:35.649196+00	10
772	23	12	2026-06-25 17:17:35.649196+00	10
773	23	13	2026-06-25 17:17:35.649196+00	10
774	23	14	2026-06-25 17:17:35.649196+00	10
775	23	15	2026-06-25 17:17:35.649196+00	10
776	23	11	2026-06-26 17:17:35.649196+00	10
777	23	12	2026-06-26 17:17:35.649196+00	10
778	23	13	2026-06-26 17:17:35.649196+00	10
779	23	14	2026-06-26 17:17:35.649196+00	10
780	23	15	2026-06-26 17:17:35.649196+00	10
781	23	11	2026-06-27 17:17:35.649196+00	10
782	23	12	2026-06-27 17:17:35.649196+00	10
783	23	13	2026-06-27 17:17:35.649196+00	10
784	23	14	2026-06-27 17:17:35.649196+00	10
785	23	15	2026-06-27 17:17:35.649196+00	10
786	23	11	2026-06-28 17:17:35.649196+00	10
787	23	12	2026-06-28 17:17:35.649196+00	10
788	23	13	2026-06-28 17:17:35.649196+00	10
789	23	14	2026-06-28 17:17:35.649196+00	10
790	23	15	2026-06-28 17:17:35.649196+00	10
791	23	11	2026-06-29 17:17:35.649196+00	10
792	23	12	2026-06-29 17:17:35.649196+00	10
793	23	13	2026-06-29 17:17:35.649196+00	10
794	23	14	2026-06-29 17:17:35.649196+00	10
795	23	15	2026-06-29 17:17:35.649196+00	10
796	23	11	2026-06-30 17:17:35.649196+00	10
797	23	12	2026-06-30 17:17:35.649196+00	10
798	23	13	2026-06-30 17:17:35.649196+00	10
799	23	14	2026-06-30 17:17:35.649196+00	10
800	23	15	2026-06-30 17:17:35.649196+00	10
801	23	11	2026-07-01 17:17:35.649196+00	10
802	23	12	2026-07-01 17:17:35.649196+00	10
803	23	13	2026-07-01 17:17:35.649196+00	10
804	23	14	2026-07-01 17:17:35.649196+00	10
805	23	15	2026-07-01 17:17:35.649196+00	10
806	24	11	2026-06-25 17:17:35.649196+00	10
807	24	12	2026-06-25 17:17:35.649196+00	10
808	24	13	2026-06-25 17:17:35.649196+00	10
809	24	14	2026-06-25 17:17:35.649196+00	10
810	24	15	2026-06-25 17:17:35.649196+00	10
811	24	11	2026-06-26 17:17:35.649196+00	10
812	24	12	2026-06-26 17:17:35.649196+00	10
813	24	13	2026-06-26 17:17:35.649196+00	10
814	24	14	2026-06-26 17:17:35.649196+00	10
815	24	15	2026-06-26 17:17:35.649196+00	10
816	24	11	2026-06-27 17:17:35.649196+00	10
817	24	12	2026-06-27 17:17:35.649196+00	10
818	24	13	2026-06-27 17:17:35.649196+00	10
819	24	14	2026-06-27 17:17:35.649196+00	10
820	24	15	2026-06-27 17:17:35.649196+00	10
821	24	11	2026-06-28 17:17:35.649196+00	10
822	24	12	2026-06-28 17:17:35.649196+00	10
823	24	13	2026-06-28 17:17:35.649196+00	10
824	24	14	2026-06-28 17:17:35.649196+00	10
825	24	15	2026-06-28 17:17:35.649196+00	10
826	24	11	2026-06-29 17:17:35.649196+00	10
827	24	12	2026-06-29 17:17:35.649196+00	10
828	24	13	2026-06-29 17:17:35.649196+00	10
829	24	14	2026-06-29 17:17:35.649196+00	10
830	24	15	2026-06-29 17:17:35.649196+00	10
831	24	11	2026-06-30 17:17:35.649196+00	10
832	24	12	2026-06-30 17:17:35.649196+00	10
833	24	13	2026-06-30 17:17:35.649196+00	10
834	24	14	2026-06-30 17:17:35.649196+00	10
835	24	15	2026-06-30 17:17:35.649196+00	10
836	24	11	2026-07-01 17:17:35.649196+00	10
837	24	12	2026-07-01 17:17:35.649196+00	10
838	24	13	2026-07-01 17:17:35.649196+00	10
839	24	14	2026-07-01 17:17:35.649196+00	10
840	24	15	2026-07-01 17:17:35.649196+00	10
841	25	11	2026-06-25 17:17:35.649196+00	10
842	25	12	2026-06-25 17:17:35.649196+00	10
843	25	13	2026-06-25 17:17:35.649196+00	10
844	25	14	2026-06-25 17:17:35.649196+00	10
845	25	15	2026-06-25 17:17:35.649196+00	10
846	25	11	2026-06-26 17:17:35.649196+00	10
847	25	12	2026-06-26 17:17:35.649196+00	10
848	25	13	2026-06-26 17:17:35.649196+00	10
849	25	14	2026-06-26 17:17:35.649196+00	10
850	25	15	2026-06-26 17:17:35.649196+00	10
851	25	11	2026-06-27 17:17:35.649196+00	10
852	25	12	2026-06-27 17:17:35.649196+00	10
853	25	13	2026-06-27 17:17:35.649196+00	10
854	25	14	2026-06-27 17:17:35.649196+00	10
855	25	15	2026-06-27 17:17:35.649196+00	10
856	25	11	2026-06-28 17:17:35.649196+00	10
857	25	12	2026-06-28 17:17:35.649196+00	10
858	25	13	2026-06-28 17:17:35.649196+00	10
859	25	14	2026-06-28 17:17:35.649196+00	10
860	25	15	2026-06-28 17:17:35.649196+00	10
861	25	11	2026-06-29 17:17:35.649196+00	10
862	25	12	2026-06-29 17:17:35.649196+00	10
863	25	13	2026-06-29 17:17:35.649196+00	10
864	25	14	2026-06-29 17:17:35.649196+00	10
865	25	15	2026-06-29 17:17:35.649196+00	10
866	25	11	2026-06-30 17:17:35.649196+00	10
867	25	12	2026-06-30 17:17:35.649196+00	10
868	25	13	2026-06-30 17:17:35.649196+00	10
869	25	14	2026-06-30 17:17:35.649196+00	10
870	25	15	2026-06-30 17:17:35.649196+00	10
871	25	11	2026-07-01 17:17:35.649196+00	10
872	25	12	2026-07-01 17:17:35.649196+00	10
873	25	13	2026-07-01 17:17:35.649196+00	10
874	25	14	2026-07-01 17:17:35.649196+00	10
875	25	15	2026-07-01 17:17:35.649196+00	10
876	26	11	2026-06-25 17:17:35.649196+00	10
877	26	12	2026-06-25 17:17:35.649196+00	10
878	26	13	2026-06-25 17:17:35.649196+00	10
879	26	14	2026-06-25 17:17:35.649196+00	10
880	26	15	2026-06-25 17:17:35.649196+00	10
881	26	11	2026-06-26 17:17:35.649196+00	10
882	26	12	2026-06-26 17:17:35.649196+00	10
883	26	13	2026-06-26 17:17:35.649196+00	10
884	26	14	2026-06-26 17:17:35.649196+00	10
885	26	15	2026-06-26 17:17:35.649196+00	10
886	26	11	2026-06-27 17:17:35.649196+00	10
887	26	12	2026-06-27 17:17:35.649196+00	10
888	26	13	2026-06-27 17:17:35.649196+00	10
889	26	14	2026-06-27 17:17:35.649196+00	10
890	26	15	2026-06-27 17:17:35.649196+00	10
891	26	11	2026-06-28 17:17:35.649196+00	10
892	26	12	2026-06-28 17:17:35.649196+00	10
893	26	13	2026-06-28 17:17:35.649196+00	10
894	26	14	2026-06-28 17:17:35.649196+00	10
895	26	15	2026-06-28 17:17:35.649196+00	10
896	26	11	2026-06-29 17:17:35.649196+00	10
897	26	12	2026-06-29 17:17:35.649196+00	10
898	26	13	2026-06-29 17:17:35.649196+00	10
899	26	14	2026-06-29 17:17:35.649196+00	10
900	26	15	2026-06-29 17:17:35.649196+00	10
901	26	11	2026-06-30 17:17:35.649196+00	10
902	26	12	2026-06-30 17:17:35.649196+00	10
903	26	13	2026-06-30 17:17:35.649196+00	10
904	26	14	2026-06-30 17:17:35.649196+00	10
905	26	15	2026-06-30 17:17:35.649196+00	10
906	26	11	2026-07-01 17:17:35.649196+00	10
907	26	12	2026-07-01 17:17:35.649196+00	10
908	26	13	2026-07-01 17:17:35.649196+00	10
909	26	14	2026-07-01 17:17:35.649196+00	10
910	26	15	2026-07-01 17:17:35.649196+00	10
911	27	11	2026-06-25 17:17:35.649196+00	10
912	27	12	2026-06-25 17:17:35.649196+00	10
913	27	13	2026-06-25 17:17:35.649196+00	10
914	27	14	2026-06-25 17:17:35.649196+00	10
915	27	15	2026-06-25 17:17:35.649196+00	10
916	27	11	2026-06-26 17:17:35.649196+00	10
917	27	12	2026-06-26 17:17:35.649196+00	10
918	27	13	2026-06-26 17:17:35.649196+00	10
919	27	14	2026-06-26 17:17:35.649196+00	10
920	27	15	2026-06-26 17:17:35.649196+00	10
921	27	11	2026-06-27 17:17:35.649196+00	10
922	27	12	2026-06-27 17:17:35.649196+00	10
923	27	13	2026-06-27 17:17:35.649196+00	10
924	27	14	2026-06-27 17:17:35.649196+00	10
925	27	15	2026-06-27 17:17:35.649196+00	10
926	27	11	2026-06-28 17:17:35.649196+00	10
927	27	12	2026-06-28 17:17:35.649196+00	10
928	27	13	2026-06-28 17:17:35.649196+00	10
929	27	14	2026-06-28 17:17:35.649196+00	10
930	27	15	2026-06-28 17:17:35.649196+00	10
931	27	11	2026-06-29 17:17:35.649196+00	10
932	27	12	2026-06-29 17:17:35.649196+00	10
933	27	13	2026-06-29 17:17:35.649196+00	10
934	27	14	2026-06-29 17:17:35.649196+00	10
935	27	15	2026-06-29 17:17:35.649196+00	10
936	27	11	2026-06-30 17:17:35.649196+00	10
937	27	12	2026-06-30 17:17:35.649196+00	10
938	27	13	2026-06-30 17:17:35.649196+00	10
939	27	14	2026-06-30 17:17:35.649196+00	10
940	27	15	2026-06-30 17:17:35.649196+00	10
941	27	11	2026-07-01 17:17:35.649196+00	10
942	27	12	2026-07-01 17:17:35.649196+00	10
943	27	13	2026-07-01 17:17:35.649196+00	10
944	27	14	2026-07-01 17:17:35.649196+00	10
945	27	15	2026-07-01 17:17:35.649196+00	10
946	28	11	2026-06-25 17:17:35.649196+00	10
947	28	12	2026-06-25 17:17:35.649196+00	10
948	28	13	2026-06-25 17:17:35.649196+00	10
949	28	14	2026-06-25 17:17:35.649196+00	10
950	28	15	2026-06-25 17:17:35.649196+00	10
951	28	11	2026-06-26 17:17:35.649196+00	10
952	28	12	2026-06-26 17:17:35.649196+00	10
953	28	13	2026-06-26 17:17:35.649196+00	10
954	28	14	2026-06-26 17:17:35.649196+00	10
955	28	15	2026-06-26 17:17:35.649196+00	10
956	28	11	2026-06-27 17:17:35.649196+00	10
957	28	12	2026-06-27 17:17:35.649196+00	10
958	28	13	2026-06-27 17:17:35.649196+00	10
959	28	14	2026-06-27 17:17:35.649196+00	10
960	28	15	2026-06-27 17:17:35.649196+00	10
961	28	11	2026-06-28 17:17:35.649196+00	10
962	28	12	2026-06-28 17:17:35.649196+00	10
963	28	13	2026-06-28 17:17:35.649196+00	10
964	28	14	2026-06-28 17:17:35.649196+00	10
965	28	15	2026-06-28 17:17:35.649196+00	10
966	28	11	2026-06-29 17:17:35.649196+00	10
967	28	12	2026-06-29 17:17:35.649196+00	10
968	28	13	2026-06-29 17:17:35.649196+00	10
969	28	14	2026-06-29 17:17:35.649196+00	10
970	28	15	2026-06-29 17:17:35.649196+00	10
971	28	11	2026-06-30 17:17:35.649196+00	10
972	28	12	2026-06-30 17:17:35.649196+00	10
973	28	13	2026-06-30 17:17:35.649196+00	10
974	28	14	2026-06-30 17:17:35.649196+00	10
975	28	15	2026-06-30 17:17:35.649196+00	10
976	28	11	2026-07-01 17:17:35.649196+00	10
977	28	12	2026-07-01 17:17:35.649196+00	10
978	28	13	2026-07-01 17:17:35.649196+00	10
979	28	14	2026-07-01 17:17:35.649196+00	10
980	28	15	2026-07-01 17:17:35.649196+00	10
981	29	11	2026-06-25 17:17:35.649196+00	10
982	29	12	2026-06-25 17:17:35.649196+00	10
983	29	13	2026-06-25 17:17:35.649196+00	10
984	29	14	2026-06-25 17:17:35.649196+00	10
985	29	15	2026-06-25 17:17:35.649196+00	10
986	29	11	2026-06-26 17:17:35.649196+00	10
987	29	12	2026-06-26 17:17:35.649196+00	10
988	29	13	2026-06-26 17:17:35.649196+00	10
989	29	14	2026-06-26 17:17:35.649196+00	10
990	29	15	2026-06-26 17:17:35.649196+00	10
991	29	11	2026-06-27 17:17:35.649196+00	10
992	29	12	2026-06-27 17:17:35.649196+00	10
993	29	13	2026-06-27 17:17:35.649196+00	10
994	29	14	2026-06-27 17:17:35.649196+00	10
995	29	15	2026-06-27 17:17:35.649196+00	10
996	29	11	2026-06-28 17:17:35.649196+00	10
997	29	12	2026-06-28 17:17:35.649196+00	10
998	29	13	2026-06-28 17:17:35.649196+00	10
999	29	14	2026-06-28 17:17:35.649196+00	10
1000	29	15	2026-06-28 17:17:35.649196+00	10
1001	29	11	2026-06-29 17:17:35.649196+00	10
1002	29	12	2026-06-29 17:17:35.649196+00	10
1003	29	13	2026-06-29 17:17:35.649196+00	10
1004	29	14	2026-06-29 17:17:35.649196+00	10
1005	29	15	2026-06-29 17:17:35.649196+00	10
1006	29	11	2026-06-30 17:17:35.649196+00	10
1007	29	12	2026-06-30 17:17:35.649196+00	10
1008	29	13	2026-06-30 17:17:35.649196+00	10
1009	29	14	2026-06-30 17:17:35.649196+00	10
1010	29	15	2026-06-30 17:17:35.649196+00	10
1011	29	11	2026-07-01 17:17:35.649196+00	10
1012	29	12	2026-07-01 17:17:35.649196+00	10
1013	29	13	2026-07-01 17:17:35.649196+00	10
1014	29	14	2026-07-01 17:17:35.649196+00	10
1015	29	15	2026-07-01 17:17:35.649196+00	10
1016	30	11	2026-06-25 17:17:35.649196+00	10
1017	30	12	2026-06-25 17:17:35.649196+00	10
1018	30	13	2026-06-25 17:17:35.649196+00	10
1019	30	14	2026-06-25 17:17:35.649196+00	10
1020	30	15	2026-06-25 17:17:35.649196+00	10
1021	30	11	2026-06-26 17:17:35.649196+00	10
1022	30	12	2026-06-26 17:17:35.649196+00	10
1023	30	13	2026-06-26 17:17:35.649196+00	10
1024	30	14	2026-06-26 17:17:35.649196+00	10
1025	30	15	2026-06-26 17:17:35.649196+00	10
1026	30	11	2026-06-27 17:17:35.649196+00	10
1027	30	12	2026-06-27 17:17:35.649196+00	10
1028	30	13	2026-06-27 17:17:35.649196+00	10
1029	30	14	2026-06-27 17:17:35.649196+00	10
1030	30	15	2026-06-27 17:17:35.649196+00	10
1031	30	11	2026-06-28 17:17:35.649196+00	10
1032	30	12	2026-06-28 17:17:35.649196+00	10
1033	30	13	2026-06-28 17:17:35.649196+00	10
1034	30	14	2026-06-28 17:17:35.649196+00	10
1035	30	15	2026-06-28 17:17:35.649196+00	10
1036	30	11	2026-06-29 17:17:35.649196+00	10
1037	30	12	2026-06-29 17:17:35.649196+00	10
1038	30	13	2026-06-29 17:17:35.649196+00	10
1039	30	14	2026-06-29 17:17:35.649196+00	10
1040	30	15	2026-06-29 17:17:35.649196+00	10
1041	30	11	2026-06-30 17:17:35.649196+00	10
1042	30	12	2026-06-30 17:17:35.649196+00	10
1043	30	13	2026-06-30 17:17:35.649196+00	10
1044	30	14	2026-06-30 17:17:35.649196+00	10
1045	30	15	2026-06-30 17:17:35.649196+00	10
1046	30	11	2026-07-01 17:17:35.649196+00	10
1047	30	12	2026-07-01 17:17:35.649196+00	10
1048	30	13	2026-07-01 17:17:35.649196+00	10
1049	30	14	2026-07-01 17:17:35.649196+00	10
1050	30	15	2026-07-01 17:17:35.649196+00	10
1051	31	11	2026-06-25 17:17:35.649196+00	10
1052	31	12	2026-06-25 17:17:35.649196+00	10
1053	31	13	2026-06-25 17:17:35.649196+00	10
1054	31	14	2026-06-25 17:17:35.649196+00	10
1055	31	15	2026-06-25 17:17:35.649196+00	10
1056	31	11	2026-06-26 17:17:35.649196+00	10
1057	31	12	2026-06-26 17:17:35.649196+00	10
1058	31	13	2026-06-26 17:17:35.649196+00	10
1059	31	14	2026-06-26 17:17:35.649196+00	10
1060	31	15	2026-06-26 17:17:35.649196+00	10
1061	31	11	2026-06-27 17:17:35.649196+00	10
1062	31	12	2026-06-27 17:17:35.649196+00	10
1063	31	13	2026-06-27 17:17:35.649196+00	10
1064	31	14	2026-06-27 17:17:35.649196+00	10
1065	31	15	2026-06-27 17:17:35.649196+00	10
1066	31	11	2026-06-28 17:17:35.649196+00	10
1067	31	12	2026-06-28 17:17:35.649196+00	10
1068	31	13	2026-06-28 17:17:35.649196+00	10
1069	31	14	2026-06-28 17:17:35.649196+00	10
1070	31	15	2026-06-28 17:17:35.649196+00	10
1071	31	11	2026-06-29 17:17:35.649196+00	10
1072	31	12	2026-06-29 17:17:35.649196+00	10
1073	31	13	2026-06-29 17:17:35.649196+00	10
1074	31	14	2026-06-29 17:17:35.649196+00	10
1075	31	15	2026-06-29 17:17:35.649196+00	10
1076	31	11	2026-06-30 17:17:35.649196+00	10
1077	31	12	2026-06-30 17:17:35.649196+00	10
1078	31	13	2026-06-30 17:17:35.649196+00	10
1079	31	14	2026-06-30 17:17:35.649196+00	10
1080	31	15	2026-06-30 17:17:35.649196+00	10
1081	31	11	2026-07-01 17:17:35.649196+00	10
1082	31	12	2026-07-01 17:17:35.649196+00	10
1083	31	13	2026-07-01 17:17:35.649196+00	10
1084	31	14	2026-07-01 17:17:35.649196+00	10
1085	31	15	2026-07-01 17:17:35.649196+00	10
1086	32	11	2026-06-25 17:17:35.649196+00	10
1087	32	12	2026-06-25 17:17:35.649196+00	10
1088	32	13	2026-06-25 17:17:35.649196+00	10
1089	32	14	2026-06-25 17:17:35.649196+00	10
1090	32	15	2026-06-25 17:17:35.649196+00	10
1091	32	11	2026-06-26 17:17:35.649196+00	10
1092	32	12	2026-06-26 17:17:35.649196+00	10
1093	32	13	2026-06-26 17:17:35.649196+00	10
1094	32	14	2026-06-26 17:17:35.649196+00	10
1095	32	15	2026-06-26 17:17:35.649196+00	10
1096	32	11	2026-06-27 17:17:35.649196+00	10
1097	32	12	2026-06-27 17:17:35.649196+00	10
1098	32	13	2026-06-27 17:17:35.649196+00	10
1099	32	14	2026-06-27 17:17:35.649196+00	10
1100	32	15	2026-06-27 17:17:35.649196+00	10
1101	32	11	2026-06-28 17:17:35.649196+00	10
1102	32	12	2026-06-28 17:17:35.649196+00	10
1103	32	13	2026-06-28 17:17:35.649196+00	10
1104	32	14	2026-06-28 17:17:35.649196+00	10
1105	32	15	2026-06-28 17:17:35.649196+00	10
1106	32	11	2026-06-29 17:17:35.649196+00	10
1107	32	12	2026-06-29 17:17:35.649196+00	10
1108	32	13	2026-06-29 17:17:35.649196+00	10
1109	32	14	2026-06-29 17:17:35.649196+00	10
1110	32	15	2026-06-29 17:17:35.649196+00	10
1111	32	11	2026-06-30 17:17:35.649196+00	10
1112	32	12	2026-06-30 17:17:35.649196+00	10
1113	32	13	2026-06-30 17:17:35.649196+00	10
1114	32	14	2026-06-30 17:17:35.649196+00	10
1115	32	15	2026-06-30 17:17:35.649196+00	10
1116	32	11	2026-07-01 17:17:35.649196+00	10
1117	32	12	2026-07-01 17:17:35.649196+00	10
1118	32	13	2026-07-01 17:17:35.649196+00	10
1119	32	14	2026-07-01 17:17:35.649196+00	10
1120	32	15	2026-07-01 17:17:35.649196+00	10
1121	33	11	2026-06-25 17:17:35.649196+00	10
1122	33	12	2026-06-25 17:17:35.649196+00	10
1123	33	13	2026-06-25 17:17:35.649196+00	10
1124	33	14	2026-06-25 17:17:35.649196+00	10
1125	33	15	2026-06-25 17:17:35.649196+00	10
1126	33	11	2026-06-26 17:17:35.649196+00	10
1127	33	12	2026-06-26 17:17:35.649196+00	10
1128	33	13	2026-06-26 17:17:35.649196+00	10
1129	33	14	2026-06-26 17:17:35.649196+00	10
1130	33	15	2026-06-26 17:17:35.649196+00	10
1131	33	11	2026-06-27 17:17:35.649196+00	10
1132	33	12	2026-06-27 17:17:35.649196+00	10
1133	33	13	2026-06-27 17:17:35.649196+00	10
1134	33	14	2026-06-27 17:17:35.649196+00	10
1135	33	15	2026-06-27 17:17:35.649196+00	10
1136	33	11	2026-06-28 17:17:35.649196+00	10
1137	33	12	2026-06-28 17:17:35.649196+00	10
1138	33	13	2026-06-28 17:17:35.649196+00	10
1139	33	14	2026-06-28 17:17:35.649196+00	10
1140	33	15	2026-06-28 17:17:35.649196+00	10
1141	33	11	2026-06-29 17:17:35.649196+00	10
1142	33	12	2026-06-29 17:17:35.649196+00	10
1143	33	13	2026-06-29 17:17:35.649196+00	10
1144	33	14	2026-06-29 17:17:35.649196+00	10
1145	33	15	2026-06-29 17:17:35.649196+00	10
1146	33	11	2026-06-30 17:17:35.649196+00	10
1147	33	12	2026-06-30 17:17:35.649196+00	10
1148	33	13	2026-06-30 17:17:35.649196+00	10
1149	33	14	2026-06-30 17:17:35.649196+00	10
1150	33	15	2026-06-30 17:17:35.649196+00	10
1151	33	11	2026-07-01 17:17:35.649196+00	10
1152	33	12	2026-07-01 17:17:35.649196+00	10
1153	33	13	2026-07-01 17:17:35.649196+00	10
1154	33	14	2026-07-01 17:17:35.649196+00	10
1155	33	15	2026-07-01 17:17:35.649196+00	10
1156	34	11	2026-06-25 17:17:35.649196+00	10
1157	34	12	2026-06-25 17:17:35.649196+00	10
1158	34	13	2026-06-25 17:17:35.649196+00	10
1159	34	14	2026-06-25 17:17:35.649196+00	10
1160	34	15	2026-06-25 17:17:35.649196+00	10
1161	34	11	2026-06-26 17:17:35.649196+00	10
1162	34	12	2026-06-26 17:17:35.649196+00	10
1163	34	13	2026-06-26 17:17:35.649196+00	10
1164	34	14	2026-06-26 17:17:35.649196+00	10
1165	34	15	2026-06-26 17:17:35.649196+00	10
1166	34	11	2026-06-27 17:17:35.649196+00	10
1167	34	12	2026-06-27 17:17:35.649196+00	10
1168	34	13	2026-06-27 17:17:35.649196+00	10
1169	34	14	2026-06-27 17:17:35.649196+00	10
1170	34	15	2026-06-27 17:17:35.649196+00	10
1171	34	11	2026-06-28 17:17:35.649196+00	10
1172	34	12	2026-06-28 17:17:35.649196+00	10
1173	34	13	2026-06-28 17:17:35.649196+00	10
1174	34	14	2026-06-28 17:17:35.649196+00	10
1175	34	15	2026-06-28 17:17:35.649196+00	10
1176	34	11	2026-06-29 17:17:35.649196+00	10
1177	34	12	2026-06-29 17:17:35.649196+00	10
1178	34	13	2026-06-29 17:17:35.649196+00	10
1179	34	14	2026-06-29 17:17:35.649196+00	10
1180	34	15	2026-06-29 17:17:35.649196+00	10
1181	34	11	2026-06-30 17:17:35.649196+00	10
1182	34	12	2026-06-30 17:17:35.649196+00	10
1183	34	13	2026-06-30 17:17:35.649196+00	10
1184	34	14	2026-06-30 17:17:35.649196+00	10
1185	34	15	2026-06-30 17:17:35.649196+00	10
1186	34	11	2026-07-01 17:17:35.649196+00	10
1187	34	12	2026-07-01 17:17:35.649196+00	10
1188	34	13	2026-07-01 17:17:35.649196+00	10
1189	34	14	2026-07-01 17:17:35.649196+00	10
1190	34	15	2026-07-01 17:17:35.649196+00	10
1191	35	11	2026-06-25 17:17:35.649196+00	10
1192	35	12	2026-06-25 17:17:35.649196+00	10
1193	35	13	2026-06-25 17:17:35.649196+00	10
1194	35	14	2026-06-25 17:17:35.649196+00	10
1195	35	15	2026-06-25 17:17:35.649196+00	10
1196	35	11	2026-06-26 17:17:35.649196+00	10
1197	35	12	2026-06-26 17:17:35.649196+00	10
1198	35	13	2026-06-26 17:17:35.649196+00	10
1199	35	14	2026-06-26 17:17:35.649196+00	10
1200	35	15	2026-06-26 17:17:35.649196+00	10
1201	35	11	2026-06-27 17:17:35.649196+00	10
1202	35	12	2026-06-27 17:17:35.649196+00	10
1203	35	13	2026-06-27 17:17:35.649196+00	10
1204	35	14	2026-06-27 17:17:35.649196+00	10
1205	35	15	2026-06-27 17:17:35.649196+00	10
1206	35	11	2026-06-28 17:17:35.649196+00	10
1207	35	12	2026-06-28 17:17:35.649196+00	10
1208	35	13	2026-06-28 17:17:35.649196+00	10
1209	35	14	2026-06-28 17:17:35.649196+00	10
1210	35	15	2026-06-28 17:17:35.649196+00	10
1211	35	11	2026-06-29 17:17:35.649196+00	10
1212	35	12	2026-06-29 17:17:35.649196+00	10
1213	35	13	2026-06-29 17:17:35.649196+00	10
1214	35	14	2026-06-29 17:17:35.649196+00	10
1215	35	15	2026-06-29 17:17:35.649196+00	10
1216	35	11	2026-06-30 17:17:35.649196+00	10
1217	35	12	2026-06-30 17:17:35.649196+00	10
1218	35	13	2026-06-30 17:17:35.649196+00	10
1219	35	14	2026-06-30 17:17:35.649196+00	10
1220	35	15	2026-06-30 17:17:35.649196+00	10
1221	35	11	2026-07-01 17:17:35.649196+00	10
1222	35	12	2026-07-01 17:17:35.649196+00	10
1223	35	13	2026-07-01 17:17:35.649196+00	10
1224	35	14	2026-07-01 17:17:35.649196+00	10
1225	35	15	2026-07-01 17:17:35.649196+00	10
1226	36	11	2026-06-25 17:17:35.649196+00	10
1227	36	12	2026-06-25 17:17:35.649196+00	10
1228	36	13	2026-06-25 17:17:35.649196+00	10
1229	36	14	2026-06-25 17:17:35.649196+00	10
1230	36	15	2026-06-25 17:17:35.649196+00	10
1231	36	11	2026-06-26 17:17:35.649196+00	10
1232	36	12	2026-06-26 17:17:35.649196+00	10
1233	36	13	2026-06-26 17:17:35.649196+00	10
1234	36	14	2026-06-26 17:17:35.649196+00	10
1235	36	15	2026-06-26 17:17:35.649196+00	10
1236	36	11	2026-06-27 17:17:35.649196+00	10
1237	36	12	2026-06-27 17:17:35.649196+00	10
1238	36	13	2026-06-27 17:17:35.649196+00	10
1239	36	14	2026-06-27 17:17:35.649196+00	10
1240	36	15	2026-06-27 17:17:35.649196+00	10
1241	36	11	2026-06-28 17:17:35.649196+00	10
1242	36	12	2026-06-28 17:17:35.649196+00	10
1243	36	13	2026-06-28 17:17:35.649196+00	10
1244	36	14	2026-06-28 17:17:35.649196+00	10
1245	36	15	2026-06-28 17:17:35.649196+00	10
1246	36	11	2026-06-29 17:17:35.649196+00	10
1247	36	12	2026-06-29 17:17:35.649196+00	10
1248	36	13	2026-06-29 17:17:35.649196+00	10
1249	36	14	2026-06-29 17:17:35.649196+00	10
1250	36	15	2026-06-29 17:17:35.649196+00	10
1251	36	11	2026-06-30 17:17:35.649196+00	10
1252	36	12	2026-06-30 17:17:35.649196+00	10
1253	36	13	2026-06-30 17:17:35.649196+00	10
1254	36	14	2026-06-30 17:17:35.649196+00	10
1255	36	15	2026-06-30 17:17:35.649196+00	10
1256	36	11	2026-07-01 17:17:35.649196+00	10
1257	36	12	2026-07-01 17:17:35.649196+00	10
1258	36	13	2026-07-01 17:17:35.649196+00	10
1259	36	14	2026-07-01 17:17:35.649196+00	10
1260	36	15	2026-07-01 17:17:35.649196+00	10
1261	37	11	2026-06-25 17:17:35.649196+00	10
1262	37	12	2026-06-25 17:17:35.649196+00	10
1263	37	13	2026-06-25 17:17:35.649196+00	10
1264	37	14	2026-06-25 17:17:35.649196+00	10
1265	37	15	2026-06-25 17:17:35.649196+00	10
1266	37	11	2026-06-26 17:17:35.649196+00	10
1267	37	12	2026-06-26 17:17:35.649196+00	10
1268	37	13	2026-06-26 17:17:35.649196+00	10
1269	37	14	2026-06-26 17:17:35.649196+00	10
1270	37	15	2026-06-26 17:17:35.649196+00	10
1271	37	11	2026-06-27 17:17:35.649196+00	10
1272	37	12	2026-06-27 17:17:35.649196+00	10
1273	37	13	2026-06-27 17:17:35.649196+00	10
1274	37	14	2026-06-27 17:17:35.649196+00	10
1275	37	15	2026-06-27 17:17:35.649196+00	10
1276	37	11	2026-06-28 17:17:35.649196+00	10
1277	37	12	2026-06-28 17:17:35.649196+00	10
1278	37	13	2026-06-28 17:17:35.649196+00	10
1279	37	14	2026-06-28 17:17:35.649196+00	10
1280	37	15	2026-06-28 17:17:35.649196+00	10
1281	37	11	2026-06-29 17:17:35.649196+00	10
1282	37	12	2026-06-29 17:17:35.649196+00	10
1283	37	13	2026-06-29 17:17:35.649196+00	10
1284	37	14	2026-06-29 17:17:35.649196+00	10
1285	37	15	2026-06-29 17:17:35.649196+00	10
1286	37	11	2026-06-30 17:17:35.649196+00	10
1287	37	12	2026-06-30 17:17:35.649196+00	10
1288	37	13	2026-06-30 17:17:35.649196+00	10
1289	37	14	2026-06-30 17:17:35.649196+00	10
1290	37	15	2026-06-30 17:17:35.649196+00	10
1291	37	11	2026-07-01 17:17:35.649196+00	10
1292	37	12	2026-07-01 17:17:35.649196+00	10
1293	37	13	2026-07-01 17:17:35.649196+00	10
1294	37	14	2026-07-01 17:17:35.649196+00	10
1295	37	15	2026-07-01 17:17:35.649196+00	10
1296	38	11	2026-06-25 17:17:35.649196+00	10
1297	38	12	2026-06-25 17:17:35.649196+00	10
1298	38	13	2026-06-25 17:17:35.649196+00	10
1299	38	14	2026-06-25 17:17:35.649196+00	10
1300	38	15	2026-06-25 17:17:35.649196+00	10
1301	38	11	2026-06-26 17:17:35.649196+00	10
1302	38	12	2026-06-26 17:17:35.649196+00	10
1303	38	13	2026-06-26 17:17:35.649196+00	10
1304	38	14	2026-06-26 17:17:35.649196+00	10
1305	38	15	2026-06-26 17:17:35.649196+00	10
1306	38	11	2026-06-27 17:17:35.649196+00	10
1307	38	12	2026-06-27 17:17:35.649196+00	10
1308	38	13	2026-06-27 17:17:35.649196+00	10
1309	38	14	2026-06-27 17:17:35.649196+00	10
1310	38	15	2026-06-27 17:17:35.649196+00	10
1311	38	11	2026-06-28 17:17:35.649196+00	10
1312	38	12	2026-06-28 17:17:35.649196+00	10
1313	38	13	2026-06-28 17:17:35.649196+00	10
1314	38	14	2026-06-28 17:17:35.649196+00	10
1315	38	15	2026-06-28 17:17:35.649196+00	10
1316	38	11	2026-06-29 17:17:35.649196+00	10
1317	38	12	2026-06-29 17:17:35.649196+00	10
1318	38	13	2026-06-29 17:17:35.649196+00	10
1319	38	14	2026-06-29 17:17:35.649196+00	10
1320	38	15	2026-06-29 17:17:35.649196+00	10
1321	38	11	2026-06-30 17:17:35.649196+00	10
1322	38	12	2026-06-30 17:17:35.649196+00	10
1323	38	13	2026-06-30 17:17:35.649196+00	10
1324	38	14	2026-06-30 17:17:35.649196+00	10
1325	38	15	2026-06-30 17:17:35.649196+00	10
1326	38	11	2026-07-01 17:17:35.649196+00	10
1327	38	12	2026-07-01 17:17:35.649196+00	10
1328	38	13	2026-07-01 17:17:35.649196+00	10
1329	38	14	2026-07-01 17:17:35.649196+00	10
1330	38	15	2026-07-01 17:17:35.649196+00	10
1331	39	11	2026-06-25 17:17:35.649196+00	10
1332	39	12	2026-06-25 17:17:35.649196+00	10
1333	39	13	2026-06-25 17:17:35.649196+00	10
1334	39	14	2026-06-25 17:17:35.649196+00	10
1335	39	15	2026-06-25 17:17:35.649196+00	10
1336	39	11	2026-06-26 17:17:35.649196+00	10
1337	39	12	2026-06-26 17:17:35.649196+00	10
1338	39	13	2026-06-26 17:17:35.649196+00	10
1339	39	14	2026-06-26 17:17:35.649196+00	10
1340	39	15	2026-06-26 17:17:35.649196+00	10
1341	39	11	2026-06-27 17:17:35.649196+00	10
1342	39	12	2026-06-27 17:17:35.649196+00	10
1343	39	13	2026-06-27 17:17:35.649196+00	10
1344	39	14	2026-06-27 17:17:35.649196+00	10
1345	39	15	2026-06-27 17:17:35.649196+00	10
1346	39	11	2026-06-28 17:17:35.649196+00	10
1347	39	12	2026-06-28 17:17:35.649196+00	10
1348	39	13	2026-06-28 17:17:35.649196+00	10
1349	39	14	2026-06-28 17:17:35.649196+00	10
1350	39	15	2026-06-28 17:17:35.649196+00	10
1351	39	11	2026-06-29 17:17:35.649196+00	10
1352	39	12	2026-06-29 17:17:35.649196+00	10
1353	39	13	2026-06-29 17:17:35.649196+00	10
1354	39	14	2026-06-29 17:17:35.649196+00	10
1355	39	15	2026-06-29 17:17:35.649196+00	10
1356	39	11	2026-06-30 17:17:35.649196+00	10
1357	39	12	2026-06-30 17:17:35.649196+00	10
1358	39	13	2026-06-30 17:17:35.649196+00	10
1359	39	14	2026-06-30 17:17:35.649196+00	10
1360	39	15	2026-06-30 17:17:35.649196+00	10
1361	39	11	2026-07-01 17:17:35.649196+00	10
1362	39	12	2026-07-01 17:17:35.649196+00	10
1363	39	13	2026-07-01 17:17:35.649196+00	10
1364	39	14	2026-07-01 17:17:35.649196+00	10
1365	39	15	2026-07-01 17:17:35.649196+00	10
1366	40	11	2026-06-25 17:17:35.649196+00	10
1367	40	12	2026-06-25 17:17:35.649196+00	10
1368	40	13	2026-06-25 17:17:35.649196+00	10
1369	40	14	2026-06-25 17:17:35.649196+00	10
1370	40	15	2026-06-25 17:17:35.649196+00	10
1371	40	11	2026-06-26 17:17:35.649196+00	10
1372	40	12	2026-06-26 17:17:35.649196+00	10
1373	40	13	2026-06-26 17:17:35.649196+00	10
1374	40	14	2026-06-26 17:17:35.649196+00	10
1375	40	15	2026-06-26 17:17:35.649196+00	10
1376	40	11	2026-06-27 17:17:35.649196+00	10
1377	40	12	2026-06-27 17:17:35.649196+00	10
1378	40	13	2026-06-27 17:17:35.649196+00	10
1379	40	14	2026-06-27 17:17:35.649196+00	10
1380	40	15	2026-06-27 17:17:35.649196+00	10
1381	40	11	2026-06-28 17:17:35.649196+00	10
1382	40	12	2026-06-28 17:17:35.649196+00	10
1383	40	13	2026-06-28 17:17:35.649196+00	10
1384	40	14	2026-06-28 17:17:35.649196+00	10
1385	40	15	2026-06-28 17:17:35.649196+00	10
1386	40	11	2026-06-29 17:17:35.649196+00	10
1387	40	12	2026-06-29 17:17:35.649196+00	10
1388	40	13	2026-06-29 17:17:35.649196+00	10
1389	40	14	2026-06-29 17:17:35.649196+00	10
1390	40	15	2026-06-29 17:17:35.649196+00	10
1391	40	11	2026-06-30 17:17:35.649196+00	10
1392	40	12	2026-06-30 17:17:35.649196+00	10
1393	40	13	2026-06-30 17:17:35.649196+00	10
1394	40	14	2026-06-30 17:17:35.649196+00	10
1395	40	15	2026-06-30 17:17:35.649196+00	10
1396	40	11	2026-07-01 17:17:35.649196+00	10
1397	40	12	2026-07-01 17:17:35.649196+00	10
1398	40	13	2026-07-01 17:17:35.649196+00	10
1399	40	14	2026-07-01 17:17:35.649196+00	10
1400	40	15	2026-07-01 17:17:35.649196+00	10
1401	41	11	2026-06-25 17:17:35.649196+00	10
1402	41	12	2026-06-25 17:17:35.649196+00	10
1403	41	13	2026-06-25 17:17:35.649196+00	10
1404	41	14	2026-06-25 17:17:35.649196+00	10
1405	41	15	2026-06-25 17:17:35.649196+00	10
1406	41	11	2026-06-26 17:17:35.649196+00	10
1407	41	12	2026-06-26 17:17:35.649196+00	10
1408	41	13	2026-06-26 17:17:35.649196+00	10
1409	41	14	2026-06-26 17:17:35.649196+00	10
1410	41	15	2026-06-26 17:17:35.649196+00	10
1411	41	11	2026-06-27 17:17:35.649196+00	10
1412	41	12	2026-06-27 17:17:35.649196+00	10
1413	41	13	2026-06-27 17:17:35.649196+00	10
1414	41	14	2026-06-27 17:17:35.649196+00	10
1415	41	15	2026-06-27 17:17:35.649196+00	10
1416	41	11	2026-06-28 17:17:35.649196+00	10
1417	41	12	2026-06-28 17:17:35.649196+00	10
1418	41	13	2026-06-28 17:17:35.649196+00	10
1419	41	14	2026-06-28 17:17:35.649196+00	10
1420	41	15	2026-06-28 17:17:35.649196+00	10
1421	41	11	2026-06-29 17:17:35.649196+00	10
1422	41	12	2026-06-29 17:17:35.649196+00	10
1423	41	13	2026-06-29 17:17:35.649196+00	10
1424	41	14	2026-06-29 17:17:35.649196+00	10
1425	41	15	2026-06-29 17:17:35.649196+00	10
1426	41	11	2026-06-30 17:17:35.649196+00	10
1427	41	12	2026-06-30 17:17:35.649196+00	10
1428	41	13	2026-06-30 17:17:35.649196+00	10
1429	41	14	2026-06-30 17:17:35.649196+00	10
1430	41	15	2026-06-30 17:17:35.649196+00	10
1431	41	11	2026-07-01 17:17:35.649196+00	10
1432	41	12	2026-07-01 17:17:35.649196+00	10
1433	41	13	2026-07-01 17:17:35.649196+00	10
1434	41	14	2026-07-01 17:17:35.649196+00	10
1435	41	15	2026-07-01 17:17:35.649196+00	10
1436	42	11	2026-06-25 17:17:35.649196+00	10
1437	42	12	2026-06-25 17:17:35.649196+00	10
1438	42	13	2026-06-25 17:17:35.649196+00	10
1439	42	14	2026-06-25 17:17:35.649196+00	10
1440	42	15	2026-06-25 17:17:35.649196+00	10
1441	42	11	2026-06-26 17:17:35.649196+00	10
1442	42	12	2026-06-26 17:17:35.649196+00	10
1443	42	13	2026-06-26 17:17:35.649196+00	10
1444	42	14	2026-06-26 17:17:35.649196+00	10
1445	42	15	2026-06-26 17:17:35.649196+00	10
1446	42	11	2026-06-27 17:17:35.649196+00	10
1447	42	12	2026-06-27 17:17:35.649196+00	10
1448	42	13	2026-06-27 17:17:35.649196+00	10
1449	42	14	2026-06-27 17:17:35.649196+00	10
1450	42	15	2026-06-27 17:17:35.649196+00	10
1451	42	11	2026-06-28 17:17:35.649196+00	10
1452	42	12	2026-06-28 17:17:35.649196+00	10
1453	42	13	2026-06-28 17:17:35.649196+00	10
1454	42	14	2026-06-28 17:17:35.649196+00	10
1455	42	15	2026-06-28 17:17:35.649196+00	10
1456	42	11	2026-06-29 17:17:35.649196+00	10
1457	42	12	2026-06-29 17:17:35.649196+00	10
1458	42	13	2026-06-29 17:17:35.649196+00	10
1459	42	14	2026-06-29 17:17:35.649196+00	10
1460	42	15	2026-06-29 17:17:35.649196+00	10
1461	42	11	2026-06-30 17:17:35.649196+00	10
1462	42	12	2026-06-30 17:17:35.649196+00	10
1463	42	13	2026-06-30 17:17:35.649196+00	10
1464	42	14	2026-06-30 17:17:35.649196+00	10
1465	42	15	2026-06-30 17:17:35.649196+00	10
1466	42	11	2026-07-01 17:17:35.649196+00	10
1467	42	12	2026-07-01 17:17:35.649196+00	10
1468	42	13	2026-07-01 17:17:35.649196+00	10
1469	42	14	2026-07-01 17:17:35.649196+00	10
1470	42	15	2026-07-01 17:17:35.649196+00	10
1471	43	11	2026-06-25 17:17:35.649196+00	10
1472	43	12	2026-06-25 17:17:35.649196+00	10
1473	43	13	2026-06-25 17:17:35.649196+00	10
1474	43	14	2026-06-25 17:17:35.649196+00	10
1475	43	15	2026-06-25 17:17:35.649196+00	10
1476	43	11	2026-06-26 17:17:35.649196+00	10
1477	43	12	2026-06-26 17:17:35.649196+00	10
1478	43	13	2026-06-26 17:17:35.649196+00	10
1479	43	14	2026-06-26 17:17:35.649196+00	10
1480	43	15	2026-06-26 17:17:35.649196+00	10
1481	43	11	2026-06-27 17:17:35.649196+00	10
1482	43	12	2026-06-27 17:17:35.649196+00	10
1483	43	13	2026-06-27 17:17:35.649196+00	10
1484	43	14	2026-06-27 17:17:35.649196+00	10
1485	43	15	2026-06-27 17:17:35.649196+00	10
1486	43	11	2026-06-28 17:17:35.649196+00	10
1487	43	12	2026-06-28 17:17:35.649196+00	10
1488	43	13	2026-06-28 17:17:35.649196+00	10
1489	43	14	2026-06-28 17:17:35.649196+00	10
1490	43	15	2026-06-28 17:17:35.649196+00	10
1491	43	11	2026-06-29 17:17:35.649196+00	10
1492	43	12	2026-06-29 17:17:35.649196+00	10
1493	43	13	2026-06-29 17:17:35.649196+00	10
1494	43	14	2026-06-29 17:17:35.649196+00	10
1495	43	15	2026-06-29 17:17:35.649196+00	10
1496	43	11	2026-06-30 17:17:35.649196+00	10
1497	43	12	2026-06-30 17:17:35.649196+00	10
1498	43	13	2026-06-30 17:17:35.649196+00	10
1499	43	14	2026-06-30 17:17:35.649196+00	10
1500	43	15	2026-06-30 17:17:35.649196+00	10
1501	43	11	2026-07-01 17:17:35.649196+00	10
1502	43	12	2026-07-01 17:17:35.649196+00	10
1503	43	13	2026-07-01 17:17:35.649196+00	10
1504	43	14	2026-07-01 17:17:35.649196+00	10
1505	43	15	2026-07-01 17:17:35.649196+00	10
1506	44	11	2026-06-25 17:17:35.649196+00	10
1507	44	12	2026-06-25 17:17:35.649196+00	10
1508	44	13	2026-06-25 17:17:35.649196+00	10
1509	44	14	2026-06-25 17:17:35.649196+00	10
1510	44	15	2026-06-25 17:17:35.649196+00	10
1511	44	11	2026-06-26 17:17:35.649196+00	10
1512	44	12	2026-06-26 17:17:35.649196+00	10
1513	44	13	2026-06-26 17:17:35.649196+00	10
1514	44	14	2026-06-26 17:17:35.649196+00	10
1515	44	15	2026-06-26 17:17:35.649196+00	10
1516	44	11	2026-06-27 17:17:35.649196+00	10
1517	44	12	2026-06-27 17:17:35.649196+00	10
1518	44	13	2026-06-27 17:17:35.649196+00	10
1519	44	14	2026-06-27 17:17:35.649196+00	10
1520	44	15	2026-06-27 17:17:35.649196+00	10
1521	44	11	2026-06-28 17:17:35.649196+00	10
1522	44	12	2026-06-28 17:17:35.649196+00	10
1523	44	13	2026-06-28 17:17:35.649196+00	10
1524	44	14	2026-06-28 17:17:35.649196+00	10
1525	44	15	2026-06-28 17:17:35.649196+00	10
1526	44	11	2026-06-29 17:17:35.649196+00	10
1527	44	12	2026-06-29 17:17:35.649196+00	10
1528	44	13	2026-06-29 17:17:35.649196+00	10
1529	44	14	2026-06-29 17:17:35.649196+00	10
1530	44	15	2026-06-29 17:17:35.649196+00	10
1531	44	11	2026-06-30 17:17:35.649196+00	10
1532	44	12	2026-06-30 17:17:35.649196+00	10
1533	44	13	2026-06-30 17:17:35.649196+00	10
1534	44	14	2026-06-30 17:17:35.649196+00	10
1535	44	15	2026-06-30 17:17:35.649196+00	10
1536	44	11	2026-07-01 17:17:35.649196+00	10
1537	44	12	2026-07-01 17:17:35.649196+00	10
1538	44	13	2026-07-01 17:17:35.649196+00	10
1539	44	14	2026-07-01 17:17:35.649196+00	10
1540	44	15	2026-07-01 17:17:35.649196+00	10
1541	45	11	2026-06-25 17:17:35.649196+00	10
1542	45	12	2026-06-25 17:17:35.649196+00	10
1543	45	13	2026-06-25 17:17:35.649196+00	10
1544	45	14	2026-06-25 17:17:35.649196+00	10
1545	45	15	2026-06-25 17:17:35.649196+00	10
1546	45	11	2026-06-26 17:17:35.649196+00	10
1547	45	12	2026-06-26 17:17:35.649196+00	10
1548	45	13	2026-06-26 17:17:35.649196+00	10
1549	45	14	2026-06-26 17:17:35.649196+00	10
1550	45	15	2026-06-26 17:17:35.649196+00	10
1551	45	11	2026-06-27 17:17:35.649196+00	10
1552	45	12	2026-06-27 17:17:35.649196+00	10
1553	45	13	2026-06-27 17:17:35.649196+00	10
1554	45	14	2026-06-27 17:17:35.649196+00	10
1555	45	15	2026-06-27 17:17:35.649196+00	10
1556	45	11	2026-06-28 17:17:35.649196+00	10
1557	45	12	2026-06-28 17:17:35.649196+00	10
1558	45	13	2026-06-28 17:17:35.649196+00	10
1559	45	14	2026-06-28 17:17:35.649196+00	10
1560	45	15	2026-06-28 17:17:35.649196+00	10
1561	45	11	2026-06-29 17:17:35.649196+00	10
1562	45	12	2026-06-29 17:17:35.649196+00	10
1563	45	13	2026-06-29 17:17:35.649196+00	10
1564	45	14	2026-06-29 17:17:35.649196+00	10
1565	45	15	2026-06-29 17:17:35.649196+00	10
1566	45	11	2026-06-30 17:17:35.649196+00	10
1567	45	12	2026-06-30 17:17:35.649196+00	10
1568	45	13	2026-06-30 17:17:35.649196+00	10
1569	45	14	2026-06-30 17:17:35.649196+00	10
1570	45	15	2026-06-30 17:17:35.649196+00	10
1571	45	11	2026-07-01 17:17:35.649196+00	10
1572	45	12	2026-07-01 17:17:35.649196+00	10
1573	45	13	2026-07-01 17:17:35.649196+00	10
1574	45	14	2026-07-01 17:17:35.649196+00	10
1575	45	15	2026-07-01 17:17:35.649196+00	10
1576	46	11	2026-06-25 17:17:35.649196+00	10
1577	46	12	2026-06-25 17:17:35.649196+00	10
1578	46	13	2026-06-25 17:17:35.649196+00	10
1579	46	14	2026-06-25 17:17:35.649196+00	10
1580	46	15	2026-06-25 17:17:35.649196+00	10
1581	46	11	2026-06-26 17:17:35.649196+00	10
1582	46	12	2026-06-26 17:17:35.649196+00	10
1583	46	13	2026-06-26 17:17:35.649196+00	10
1584	46	14	2026-06-26 17:17:35.649196+00	10
1585	46	15	2026-06-26 17:17:35.649196+00	10
1586	46	11	2026-06-27 17:17:35.649196+00	10
1587	46	12	2026-06-27 17:17:35.649196+00	10
1588	46	13	2026-06-27 17:17:35.649196+00	10
1589	46	14	2026-06-27 17:17:35.649196+00	10
1590	46	15	2026-06-27 17:17:35.649196+00	10
1591	46	11	2026-06-28 17:17:35.649196+00	10
1592	46	12	2026-06-28 17:17:35.649196+00	10
1593	46	13	2026-06-28 17:17:35.649196+00	10
1594	46	14	2026-06-28 17:17:35.649196+00	10
1595	46	15	2026-06-28 17:17:35.649196+00	10
1596	46	11	2026-06-29 17:17:35.649196+00	10
1597	46	12	2026-06-29 17:17:35.649196+00	10
1598	46	13	2026-06-29 17:17:35.649196+00	10
1599	46	14	2026-06-29 17:17:35.649196+00	10
1600	46	15	2026-06-29 17:17:35.649196+00	10
1601	46	11	2026-06-30 17:17:35.649196+00	10
1602	46	12	2026-06-30 17:17:35.649196+00	10
1603	46	13	2026-06-30 17:17:35.649196+00	10
1604	46	14	2026-06-30 17:17:35.649196+00	10
1605	46	15	2026-06-30 17:17:35.649196+00	10
1606	46	11	2026-07-01 17:17:35.649196+00	10
1607	46	12	2026-07-01 17:17:35.649196+00	10
1608	46	13	2026-07-01 17:17:35.649196+00	10
1609	46	14	2026-07-01 17:17:35.649196+00	10
1610	46	15	2026-07-01 17:17:35.649196+00	10
1611	47	11	2026-06-25 17:17:35.649196+00	10
1612	47	12	2026-06-25 17:17:35.649196+00	10
1613	47	13	2026-06-25 17:17:35.649196+00	10
1614	47	14	2026-06-25 17:17:35.649196+00	10
1615	47	15	2026-06-25 17:17:35.649196+00	10
1616	47	11	2026-06-26 17:17:35.649196+00	10
1617	47	12	2026-06-26 17:17:35.649196+00	10
1618	47	13	2026-06-26 17:17:35.649196+00	10
1619	47	14	2026-06-26 17:17:35.649196+00	10
1620	47	15	2026-06-26 17:17:35.649196+00	10
1621	47	11	2026-06-27 17:17:35.649196+00	10
1622	47	12	2026-06-27 17:17:35.649196+00	10
1623	47	13	2026-06-27 17:17:35.649196+00	10
1624	47	14	2026-06-27 17:17:35.649196+00	10
1625	47	15	2026-06-27 17:17:35.649196+00	10
1626	47	11	2026-06-28 17:17:35.649196+00	10
1627	47	12	2026-06-28 17:17:35.649196+00	10
1628	47	13	2026-06-28 17:17:35.649196+00	10
1629	47	14	2026-06-28 17:17:35.649196+00	10
1630	47	15	2026-06-28 17:17:35.649196+00	10
1631	47	11	2026-06-29 17:17:35.649196+00	10
1632	47	12	2026-06-29 17:17:35.649196+00	10
1633	47	13	2026-06-29 17:17:35.649196+00	10
1634	47	14	2026-06-29 17:17:35.649196+00	10
1635	47	15	2026-06-29 17:17:35.649196+00	10
1636	47	11	2026-06-30 17:17:35.649196+00	10
1637	47	12	2026-06-30 17:17:35.649196+00	10
1638	47	13	2026-06-30 17:17:35.649196+00	10
1639	47	14	2026-06-30 17:17:35.649196+00	10
1640	47	15	2026-06-30 17:17:35.649196+00	10
1641	47	11	2026-07-01 17:17:35.649196+00	10
1642	47	12	2026-07-01 17:17:35.649196+00	10
1643	47	13	2026-07-01 17:17:35.649196+00	10
1644	47	14	2026-07-01 17:17:35.649196+00	10
1645	47	15	2026-07-01 17:17:35.649196+00	10
1646	48	11	2026-06-25 17:17:35.649196+00	10
1647	48	12	2026-06-25 17:17:35.649196+00	10
1648	48	13	2026-06-25 17:17:35.649196+00	10
1649	48	14	2026-06-25 17:17:35.649196+00	10
1650	48	15	2026-06-25 17:17:35.649196+00	10
1651	48	11	2026-06-26 17:17:35.649196+00	10
1652	48	12	2026-06-26 17:17:35.649196+00	10
1653	48	13	2026-06-26 17:17:35.649196+00	10
1654	48	14	2026-06-26 17:17:35.649196+00	10
1655	48	15	2026-06-26 17:17:35.649196+00	10
1656	48	11	2026-06-27 17:17:35.649196+00	10
1657	48	12	2026-06-27 17:17:35.649196+00	10
1658	48	13	2026-06-27 17:17:35.649196+00	10
1659	48	14	2026-06-27 17:17:35.649196+00	10
1660	48	15	2026-06-27 17:17:35.649196+00	10
1661	48	11	2026-06-28 17:17:35.649196+00	10
1662	48	12	2026-06-28 17:17:35.649196+00	10
1663	48	13	2026-06-28 17:17:35.649196+00	10
1664	48	14	2026-06-28 17:17:35.649196+00	10
1665	48	15	2026-06-28 17:17:35.649196+00	10
1666	48	11	2026-06-29 17:17:35.649196+00	10
1667	48	12	2026-06-29 17:17:35.649196+00	10
1668	48	13	2026-06-29 17:17:35.649196+00	10
1669	48	14	2026-06-29 17:17:35.649196+00	10
1670	48	15	2026-06-29 17:17:35.649196+00	10
1671	48	11	2026-06-30 17:17:35.649196+00	10
1672	48	12	2026-06-30 17:17:35.649196+00	10
1673	48	13	2026-06-30 17:17:35.649196+00	10
1674	48	14	2026-06-30 17:17:35.649196+00	10
1675	48	15	2026-06-30 17:17:35.649196+00	10
1676	48	11	2026-07-01 17:17:35.649196+00	10
1677	48	12	2026-07-01 17:17:35.649196+00	10
1678	48	13	2026-07-01 17:17:35.649196+00	10
1679	48	14	2026-07-01 17:17:35.649196+00	10
1680	48	15	2026-07-01 17:17:35.649196+00	10
1681	49	11	2026-06-25 17:17:35.649196+00	10
1682	49	12	2026-06-25 17:17:35.649196+00	10
1683	49	13	2026-06-25 17:17:35.649196+00	10
1684	49	14	2026-06-25 17:17:35.649196+00	10
1685	49	15	2026-06-25 17:17:35.649196+00	10
1686	49	11	2026-06-26 17:17:35.649196+00	10
1687	49	12	2026-06-26 17:17:35.649196+00	10
1688	49	13	2026-06-26 17:17:35.649196+00	10
1689	49	14	2026-06-26 17:17:35.649196+00	10
1690	49	15	2026-06-26 17:17:35.649196+00	10
1691	49	11	2026-06-27 17:17:35.649196+00	10
1692	49	12	2026-06-27 17:17:35.649196+00	10
1693	49	13	2026-06-27 17:17:35.649196+00	10
1694	49	14	2026-06-27 17:17:35.649196+00	10
1695	49	15	2026-06-27 17:17:35.649196+00	10
1696	49	11	2026-06-28 17:17:35.649196+00	10
1697	49	12	2026-06-28 17:17:35.649196+00	10
1698	49	13	2026-06-28 17:17:35.649196+00	10
1699	49	14	2026-06-28 17:17:35.649196+00	10
1700	49	15	2026-06-28 17:17:35.649196+00	10
1701	49	11	2026-06-29 17:17:35.649196+00	10
1702	49	12	2026-06-29 17:17:35.649196+00	10
1703	49	13	2026-06-29 17:17:35.649196+00	10
1704	49	14	2026-06-29 17:17:35.649196+00	10
1705	49	15	2026-06-29 17:17:35.649196+00	10
1706	49	11	2026-06-30 17:17:35.649196+00	10
1707	49	12	2026-06-30 17:17:35.649196+00	10
1708	49	13	2026-06-30 17:17:35.649196+00	10
1709	49	14	2026-06-30 17:17:35.649196+00	10
1710	49	15	2026-06-30 17:17:35.649196+00	10
1711	49	11	2026-07-01 17:17:35.649196+00	10
1712	49	12	2026-07-01 17:17:35.649196+00	10
1713	49	13	2026-07-01 17:17:35.649196+00	10
1714	49	14	2026-07-01 17:17:35.649196+00	10
1715	49	15	2026-07-01 17:17:35.649196+00	10
1716	50	11	2026-06-25 17:17:35.649196+00	10
1717	50	12	2026-06-25 17:17:35.649196+00	10
1718	50	13	2026-06-25 17:17:35.649196+00	10
1719	50	14	2026-06-25 17:17:35.649196+00	10
1720	50	15	2026-06-25 17:17:35.649196+00	10
1721	50	11	2026-06-26 17:17:35.649196+00	10
1722	50	12	2026-06-26 17:17:35.649196+00	10
1723	50	13	2026-06-26 17:17:35.649196+00	10
1724	50	14	2026-06-26 17:17:35.649196+00	10
1725	50	15	2026-06-26 17:17:35.649196+00	10
1726	50	11	2026-06-27 17:17:35.649196+00	10
1727	50	12	2026-06-27 17:17:35.649196+00	10
1728	50	13	2026-06-27 17:17:35.649196+00	10
1729	50	14	2026-06-27 17:17:35.649196+00	10
1730	50	15	2026-06-27 17:17:35.649196+00	10
1731	50	11	2026-06-28 17:17:35.649196+00	10
1732	50	12	2026-06-28 17:17:35.649196+00	10
1733	50	13	2026-06-28 17:17:35.649196+00	10
1734	50	14	2026-06-28 17:17:35.649196+00	10
1735	50	15	2026-06-28 17:17:35.649196+00	10
1736	50	11	2026-06-29 17:17:35.649196+00	10
1737	50	12	2026-06-29 17:17:35.649196+00	10
1738	50	13	2026-06-29 17:17:35.649196+00	10
1739	50	14	2026-06-29 17:17:35.649196+00	10
1740	50	15	2026-06-29 17:17:35.649196+00	10
1741	50	11	2026-06-30 17:17:35.649196+00	10
1742	50	12	2026-06-30 17:17:35.649196+00	10
1743	50	13	2026-06-30 17:17:35.649196+00	10
1744	50	14	2026-06-30 17:17:35.649196+00	10
1745	50	15	2026-06-30 17:17:35.649196+00	10
1746	50	11	2026-07-01 17:17:35.649196+00	10
1747	50	12	2026-07-01 17:17:35.649196+00	10
1748	50	13	2026-07-01 17:17:35.649196+00	10
1749	50	14	2026-07-01 17:17:35.649196+00	10
1750	50	15	2026-07-01 17:17:35.649196+00	10
1751	51	11	2026-06-25 17:17:35.649196+00	10
1752	51	12	2026-06-25 17:17:35.649196+00	10
1753	51	13	2026-06-25 17:17:35.649196+00	10
1754	51	14	2026-06-25 17:17:35.649196+00	10
1755	51	15	2026-06-25 17:17:35.649196+00	10
1756	51	11	2026-06-26 17:17:35.649196+00	10
1757	51	12	2026-06-26 17:17:35.649196+00	10
1758	51	13	2026-06-26 17:17:35.649196+00	10
1759	51	14	2026-06-26 17:17:35.649196+00	10
1760	51	15	2026-06-26 17:17:35.649196+00	10
1761	51	11	2026-06-27 17:17:35.649196+00	10
1762	51	12	2026-06-27 17:17:35.649196+00	10
1763	51	13	2026-06-27 17:17:35.649196+00	10
1764	51	14	2026-06-27 17:17:35.649196+00	10
1765	51	15	2026-06-27 17:17:35.649196+00	10
1766	51	11	2026-06-28 17:17:35.649196+00	10
1767	51	12	2026-06-28 17:17:35.649196+00	10
1768	51	13	2026-06-28 17:17:35.649196+00	10
1769	51	14	2026-06-28 17:17:35.649196+00	10
1770	51	15	2026-06-28 17:17:35.649196+00	10
1771	51	11	2026-06-29 17:17:35.649196+00	10
1772	51	12	2026-06-29 17:17:35.649196+00	10
1773	51	13	2026-06-29 17:17:35.649196+00	10
1774	51	14	2026-06-29 17:17:35.649196+00	10
1775	51	15	2026-06-29 17:17:35.649196+00	10
1776	51	11	2026-06-30 17:17:35.649196+00	10
1777	51	12	2026-06-30 17:17:35.649196+00	10
1778	51	13	2026-06-30 17:17:35.649196+00	10
1779	51	14	2026-06-30 17:17:35.649196+00	10
1780	51	15	2026-06-30 17:17:35.649196+00	10
1781	51	11	2026-07-01 17:17:35.649196+00	10
1782	51	12	2026-07-01 17:17:35.649196+00	10
1783	51	13	2026-07-01 17:17:35.649196+00	10
1784	51	14	2026-07-01 17:17:35.649196+00	10
1785	51	15	2026-07-01 17:17:35.649196+00	10
1786	52	11	2026-06-25 17:17:35.649196+00	10
1787	52	12	2026-06-25 17:17:35.649196+00	10
1788	52	13	2026-06-25 17:17:35.649196+00	10
1789	52	14	2026-06-25 17:17:35.649196+00	10
1790	52	15	2026-06-25 17:17:35.649196+00	10
1791	52	11	2026-06-26 17:17:35.649196+00	10
1792	52	12	2026-06-26 17:17:35.649196+00	10
1793	52	13	2026-06-26 17:17:35.649196+00	10
1794	52	14	2026-06-26 17:17:35.649196+00	10
1795	52	15	2026-06-26 17:17:35.649196+00	10
1796	52	11	2026-06-27 17:17:35.649196+00	10
1797	52	12	2026-06-27 17:17:35.649196+00	10
1798	52	13	2026-06-27 17:17:35.649196+00	10
1799	52	14	2026-06-27 17:17:35.649196+00	10
1800	52	15	2026-06-27 17:17:35.649196+00	10
1801	52	11	2026-06-28 17:17:35.649196+00	10
1802	52	12	2026-06-28 17:17:35.649196+00	10
1803	52	13	2026-06-28 17:17:35.649196+00	10
1804	52	14	2026-06-28 17:17:35.649196+00	10
1805	52	15	2026-06-28 17:17:35.649196+00	10
1806	52	11	2026-06-29 17:17:35.649196+00	10
1807	52	12	2026-06-29 17:17:35.649196+00	10
1808	52	13	2026-06-29 17:17:35.649196+00	10
1809	52	14	2026-06-29 17:17:35.649196+00	10
1810	52	15	2026-06-29 17:17:35.649196+00	10
1811	52	11	2026-06-30 17:17:35.649196+00	10
1812	52	12	2026-06-30 17:17:35.649196+00	10
1813	52	13	2026-06-30 17:17:35.649196+00	10
1814	52	14	2026-06-30 17:17:35.649196+00	10
1815	52	15	2026-06-30 17:17:35.649196+00	10
1816	52	11	2026-07-01 17:17:35.649196+00	10
1817	52	12	2026-07-01 17:17:35.649196+00	10
1818	52	13	2026-07-01 17:17:35.649196+00	10
1819	52	14	2026-07-01 17:17:35.649196+00	10
1820	52	15	2026-07-01 17:17:35.649196+00	10
1821	53	11	2026-06-25 17:17:35.649196+00	10
1822	53	12	2026-06-25 17:17:35.649196+00	10
1823	53	13	2026-06-25 17:17:35.649196+00	10
1824	53	14	2026-06-25 17:17:35.649196+00	10
1825	53	15	2026-06-25 17:17:35.649196+00	10
1826	53	11	2026-06-26 17:17:35.649196+00	10
1827	53	12	2026-06-26 17:17:35.649196+00	10
1828	53	13	2026-06-26 17:17:35.649196+00	10
1829	53	14	2026-06-26 17:17:35.649196+00	10
1830	53	15	2026-06-26 17:17:35.649196+00	10
1831	53	11	2026-06-27 17:17:35.649196+00	10
1832	53	12	2026-06-27 17:17:35.649196+00	10
1833	53	13	2026-06-27 17:17:35.649196+00	10
1834	53	14	2026-06-27 17:17:35.649196+00	10
1835	53	15	2026-06-27 17:17:35.649196+00	10
1836	53	11	2026-06-28 17:17:35.649196+00	10
1837	53	12	2026-06-28 17:17:35.649196+00	10
1838	53	13	2026-06-28 17:17:35.649196+00	10
1839	53	14	2026-06-28 17:17:35.649196+00	10
1840	53	15	2026-06-28 17:17:35.649196+00	10
1841	53	11	2026-06-29 17:17:35.649196+00	10
1842	53	12	2026-06-29 17:17:35.649196+00	10
1843	53	13	2026-06-29 17:17:35.649196+00	10
1844	53	14	2026-06-29 17:17:35.649196+00	10
1845	53	15	2026-06-29 17:17:35.649196+00	10
1846	53	11	2026-06-30 17:17:35.649196+00	10
1847	53	12	2026-06-30 17:17:35.649196+00	10
1848	53	13	2026-06-30 17:17:35.649196+00	10
1849	53	14	2026-06-30 17:17:35.649196+00	10
1850	53	15	2026-06-30 17:17:35.649196+00	10
1851	53	11	2026-07-01 17:17:35.649196+00	10
1852	53	12	2026-07-01 17:17:35.649196+00	10
1853	53	13	2026-07-01 17:17:35.649196+00	10
1854	53	14	2026-07-01 17:17:35.649196+00	10
1855	53	15	2026-07-01 17:17:35.649196+00	10
1856	54	11	2026-06-25 17:17:35.649196+00	10
1857	54	12	2026-06-25 17:17:35.649196+00	10
1858	54	13	2026-06-25 17:17:35.649196+00	10
1859	54	14	2026-06-25 17:17:35.649196+00	10
1860	54	15	2026-06-25 17:17:35.649196+00	10
1861	54	11	2026-06-26 17:17:35.649196+00	10
1862	54	12	2026-06-26 17:17:35.649196+00	10
1863	54	13	2026-06-26 17:17:35.649196+00	10
1864	54	14	2026-06-26 17:17:35.649196+00	10
1865	54	15	2026-06-26 17:17:35.649196+00	10
1866	54	11	2026-06-27 17:17:35.649196+00	10
1867	54	12	2026-06-27 17:17:35.649196+00	10
1868	54	13	2026-06-27 17:17:35.649196+00	10
1869	54	14	2026-06-27 17:17:35.649196+00	10
1870	54	15	2026-06-27 17:17:35.649196+00	10
1871	54	11	2026-06-28 17:17:35.649196+00	10
1872	54	12	2026-06-28 17:17:35.649196+00	10
1873	54	13	2026-06-28 17:17:35.649196+00	10
1874	54	14	2026-06-28 17:17:35.649196+00	10
1875	54	15	2026-06-28 17:17:35.649196+00	10
1876	54	11	2026-06-29 17:17:35.649196+00	10
1877	54	12	2026-06-29 17:17:35.649196+00	10
1878	54	13	2026-06-29 17:17:35.649196+00	10
1879	54	14	2026-06-29 17:17:35.649196+00	10
1880	54	15	2026-06-29 17:17:35.649196+00	10
1881	54	11	2026-06-30 17:17:35.649196+00	10
1882	54	12	2026-06-30 17:17:35.649196+00	10
1883	54	13	2026-06-30 17:17:35.649196+00	10
1884	54	14	2026-06-30 17:17:35.649196+00	10
1885	54	15	2026-06-30 17:17:35.649196+00	10
1886	54	11	2026-07-01 17:17:35.649196+00	10
1887	54	12	2026-07-01 17:17:35.649196+00	10
1888	54	13	2026-07-01 17:17:35.649196+00	10
1889	54	14	2026-07-01 17:17:35.649196+00	10
1890	54	15	2026-07-01 17:17:35.649196+00	10
1891	55	11	2026-06-25 17:17:35.649196+00	10
1892	55	12	2026-06-25 17:17:35.649196+00	10
1893	55	13	2026-06-25 17:17:35.649196+00	10
1894	55	14	2026-06-25 17:17:35.649196+00	10
1895	55	15	2026-06-25 17:17:35.649196+00	10
1896	55	11	2026-06-26 17:17:35.649196+00	10
1897	55	12	2026-06-26 17:17:35.649196+00	10
1898	55	13	2026-06-26 17:17:35.649196+00	10
1899	55	14	2026-06-26 17:17:35.649196+00	10
1900	55	15	2026-06-26 17:17:35.649196+00	10
1901	55	11	2026-06-27 17:17:35.649196+00	10
1902	55	12	2026-06-27 17:17:35.649196+00	10
1903	55	13	2026-06-27 17:17:35.649196+00	10
1904	55	14	2026-06-27 17:17:35.649196+00	10
1905	55	15	2026-06-27 17:17:35.649196+00	10
1906	55	11	2026-06-28 17:17:35.649196+00	10
1907	55	12	2026-06-28 17:17:35.649196+00	10
1908	55	13	2026-06-28 17:17:35.649196+00	10
1909	55	14	2026-06-28 17:17:35.649196+00	10
1910	55	15	2026-06-28 17:17:35.649196+00	10
1911	55	11	2026-06-29 17:17:35.649196+00	10
1912	55	12	2026-06-29 17:17:35.649196+00	10
1913	55	13	2026-06-29 17:17:35.649196+00	10
1914	55	14	2026-06-29 17:17:35.649196+00	10
1915	55	15	2026-06-29 17:17:35.649196+00	10
1916	55	11	2026-06-30 17:17:35.649196+00	10
1917	55	12	2026-06-30 17:17:35.649196+00	10
1918	55	13	2026-06-30 17:17:35.649196+00	10
1919	55	14	2026-06-30 17:17:35.649196+00	10
1920	55	15	2026-06-30 17:17:35.649196+00	10
1921	55	11	2026-07-01 17:17:35.649196+00	10
1922	55	12	2026-07-01 17:17:35.649196+00	10
1923	55	13	2026-07-01 17:17:35.649196+00	10
1924	55	14	2026-07-01 17:17:35.649196+00	10
1925	55	15	2026-07-01 17:17:35.649196+00	10
1926	1	11	2026-07-01 08:00:00+00	15
1927	1	11	2026-07-01 08:30:00+00	15
1928	1	11	2026-07-01 09:00:00+00	15
1929	1	11	2026-07-01 09:30:00+00	15
1930	1	11	2026-06-25 09:00:00+00	8
1931	2	11	2026-06-25 09:00:00+00	8
1932	5	11	2026-06-25 09:00:00+00	8
1933	7	11	2026-06-25 09:00:00+00	8
1934	9	11	2026-06-25 09:00:00+00	8
1935	1	12	2026-06-25 09:00:00+00	8
1936	2	12	2026-06-25 09:00:00+00	8
1937	5	12	2026-06-25 09:00:00+00	8
1938	7	12	2026-06-25 09:00:00+00	8
1939	9	12	2026-06-25 09:00:00+00	8
1940	1	13	2026-06-25 09:00:00+00	8
1941	2	13	2026-06-25 09:00:00+00	8
1942	5	13	2026-06-25 09:00:00+00	8
1943	7	13	2026-06-25 09:00:00+00	8
1944	9	13	2026-06-25 09:00:00+00	8
1945	1	14	2026-06-25 09:00:00+00	8
1946	2	14	2026-06-25 09:00:00+00	8
1947	5	14	2026-06-25 09:00:00+00	8
1948	7	14	2026-06-25 09:00:00+00	8
1949	9	14	2026-06-25 09:00:00+00	8
1950	1	15	2026-06-25 09:00:00+00	8
1951	2	15	2026-06-25 09:00:00+00	8
1952	5	15	2026-06-25 09:00:00+00	8
1953	7	15	2026-06-25 09:00:00+00	8
1954	9	15	2026-06-25 09:00:00+00	8
1955	1	11	2026-06-26 09:00:00+00	8
1956	2	11	2026-06-26 09:00:00+00	8
1957	5	11	2026-06-26 09:00:00+00	8
1958	7	11	2026-06-26 09:00:00+00	8
1959	9	11	2026-06-26 09:00:00+00	8
1960	1	12	2026-06-26 09:00:00+00	8
1961	2	12	2026-06-26 09:00:00+00	8
1962	5	12	2026-06-26 09:00:00+00	8
1963	7	12	2026-06-26 09:00:00+00	8
1964	9	12	2026-06-26 09:00:00+00	8
1965	1	13	2026-06-26 09:00:00+00	8
1966	2	13	2026-06-26 09:00:00+00	8
1967	5	13	2026-06-26 09:00:00+00	8
1968	7	13	2026-06-26 09:00:00+00	8
1969	9	13	2026-06-26 09:00:00+00	8
1970	1	14	2026-06-26 09:00:00+00	8
1971	2	14	2026-06-26 09:00:00+00	8
1972	5	14	2026-06-26 09:00:00+00	8
1973	7	14	2026-06-26 09:00:00+00	8
1974	9	14	2026-06-26 09:00:00+00	8
1975	1	15	2026-06-26 09:00:00+00	8
1976	2	15	2026-06-26 09:00:00+00	8
1977	5	15	2026-06-26 09:00:00+00	8
1978	7	15	2026-06-26 09:00:00+00	8
1979	9	15	2026-06-26 09:00:00+00	8
1980	1	11	2026-06-27 09:00:00+00	8
1981	2	11	2026-06-27 09:00:00+00	8
1982	5	11	2026-06-27 09:00:00+00	8
1983	7	11	2026-06-27 09:00:00+00	8
1984	9	11	2026-06-27 09:00:00+00	8
1985	1	12	2026-06-27 09:00:00+00	8
1986	2	12	2026-06-27 09:00:00+00	8
1987	5	12	2026-06-27 09:00:00+00	8
1988	7	12	2026-06-27 09:00:00+00	8
1989	9	12	2026-06-27 09:00:00+00	8
1990	1	13	2026-06-27 09:00:00+00	8
1991	2	13	2026-06-27 09:00:00+00	8
1992	5	13	2026-06-27 09:00:00+00	8
1993	7	13	2026-06-27 09:00:00+00	8
1994	9	13	2026-06-27 09:00:00+00	8
1995	1	14	2026-06-27 09:00:00+00	8
1996	2	14	2026-06-27 09:00:00+00	8
1997	5	14	2026-06-27 09:00:00+00	8
1998	7	14	2026-06-27 09:00:00+00	8
1999	9	14	2026-06-27 09:00:00+00	8
2000	1	15	2026-06-27 09:00:00+00	8
2001	2	15	2026-06-27 09:00:00+00	8
2002	5	15	2026-06-27 09:00:00+00	8
2003	7	15	2026-06-27 09:00:00+00	8
2004	9	15	2026-06-27 09:00:00+00	8
2005	1	11	2026-06-28 09:00:00+00	8
2006	2	11	2026-06-28 09:00:00+00	8
2007	5	11	2026-06-28 09:00:00+00	8
2008	7	11	2026-06-28 09:00:00+00	8
2009	9	11	2026-06-28 09:00:00+00	8
2010	1	12	2026-06-28 09:00:00+00	8
2011	2	12	2026-06-28 09:00:00+00	8
2012	5	12	2026-06-28 09:00:00+00	8
2013	7	12	2026-06-28 09:00:00+00	8
2014	9	12	2026-06-28 09:00:00+00	8
2015	1	13	2026-06-28 09:00:00+00	8
2016	2	13	2026-06-28 09:00:00+00	8
2017	5	13	2026-06-28 09:00:00+00	8
2018	7	13	2026-06-28 09:00:00+00	8
2019	9	13	2026-06-28 09:00:00+00	8
2020	1	14	2026-06-28 09:00:00+00	8
2021	2	14	2026-06-28 09:00:00+00	8
2022	5	14	2026-06-28 09:00:00+00	8
2023	7	14	2026-06-28 09:00:00+00	8
2024	9	14	2026-06-28 09:00:00+00	8
2025	1	15	2026-06-28 09:00:00+00	8
2026	2	15	2026-06-28 09:00:00+00	8
2027	5	15	2026-06-28 09:00:00+00	8
2028	7	15	2026-06-28 09:00:00+00	8
2029	9	15	2026-06-28 09:00:00+00	8
2030	1	11	2026-06-29 09:00:00+00	8
2031	2	11	2026-06-29 09:00:00+00	8
2032	5	11	2026-06-29 09:00:00+00	8
2033	7	11	2026-06-29 09:00:00+00	8
2034	9	11	2026-06-29 09:00:00+00	8
2035	1	12	2026-06-29 09:00:00+00	8
2036	2	12	2026-06-29 09:00:00+00	8
2037	5	12	2026-06-29 09:00:00+00	8
2038	7	12	2026-06-29 09:00:00+00	8
2039	9	12	2026-06-29 09:00:00+00	8
2040	1	13	2026-06-29 09:00:00+00	8
2041	2	13	2026-06-29 09:00:00+00	8
2042	5	13	2026-06-29 09:00:00+00	8
2043	7	13	2026-06-29 09:00:00+00	8
2044	9	13	2026-06-29 09:00:00+00	8
2045	1	14	2026-06-29 09:00:00+00	8
2046	2	14	2026-06-29 09:00:00+00	8
2047	5	14	2026-06-29 09:00:00+00	8
2048	7	14	2026-06-29 09:00:00+00	8
2049	9	14	2026-06-29 09:00:00+00	8
2050	1	15	2026-06-29 09:00:00+00	8
2051	2	15	2026-06-29 09:00:00+00	8
2052	5	15	2026-06-29 09:00:00+00	8
2053	7	15	2026-06-29 09:00:00+00	8
2054	9	15	2026-06-29 09:00:00+00	8
2055	1	11	2026-06-30 09:00:00+00	8
2056	2	11	2026-06-30 09:00:00+00	8
2057	5	11	2026-06-30 09:00:00+00	8
2058	7	11	2026-06-30 09:00:00+00	8
2059	9	11	2026-06-30 09:00:00+00	8
2060	1	12	2026-06-30 09:00:00+00	8
2061	2	12	2026-06-30 09:00:00+00	8
2062	5	12	2026-06-30 09:00:00+00	8
2063	7	12	2026-06-30 09:00:00+00	8
2064	9	12	2026-06-30 09:00:00+00	8
2065	1	13	2026-06-30 09:00:00+00	8
2066	2	13	2026-06-30 09:00:00+00	8
2067	5	13	2026-06-30 09:00:00+00	8
2068	7	13	2026-06-30 09:00:00+00	8
2069	9	13	2026-06-30 09:00:00+00	8
2070	1	14	2026-06-30 09:00:00+00	8
2071	2	14	2026-06-30 09:00:00+00	8
2072	5	14	2026-06-30 09:00:00+00	8
2073	7	14	2026-06-30 09:00:00+00	8
2074	9	14	2026-06-30 09:00:00+00	8
2075	1	15	2026-06-30 09:00:00+00	8
2076	2	15	2026-06-30 09:00:00+00	8
2077	5	15	2026-06-30 09:00:00+00	8
2078	7	15	2026-06-30 09:00:00+00	8
2079	9	15	2026-06-30 09:00:00+00	8
2081	2	11	2026-07-01 09:00:00+00	8
2082	5	11	2026-07-01 09:00:00+00	8
2083	7	11	2026-07-01 09:00:00+00	8
2084	9	11	2026-07-01 09:00:00+00	8
2085	1	12	2026-07-01 09:00:00+00	8
2086	2	12	2026-07-01 09:00:00+00	8
2087	5	12	2026-07-01 09:00:00+00	8
2088	7	12	2026-07-01 09:00:00+00	8
2089	9	12	2026-07-01 09:00:00+00	8
2090	1	13	2026-07-01 09:00:00+00	8
2091	2	13	2026-07-01 09:00:00+00	8
2092	5	13	2026-07-01 09:00:00+00	8
2093	7	13	2026-07-01 09:00:00+00	8
2094	9	13	2026-07-01 09:00:00+00	8
2095	1	14	2026-07-01 09:00:00+00	8
2096	2	14	2026-07-01 09:00:00+00	8
2097	5	14	2026-07-01 09:00:00+00	8
2098	7	14	2026-07-01 09:00:00+00	8
2099	9	14	2026-07-01 09:00:00+00	8
2100	1	15	2026-07-01 09:00:00+00	8
2101	2	15	2026-07-01 09:00:00+00	8
2102	5	15	2026-07-01 09:00:00+00	8
2103	7	15	2026-07-01 09:00:00+00	8
2104	9	15	2026-07-01 09:00:00+00	8
2105	1	11	2026-06-25 09:30:00+00	8
2106	2	11	2026-06-25 09:30:00+00	8
2107	5	11	2026-06-25 09:30:00+00	8
2108	7	11	2026-06-25 09:30:00+00	8
2109	9	11	2026-06-25 09:30:00+00	8
2110	1	12	2026-06-25 09:30:00+00	8
2111	2	12	2026-06-25 09:30:00+00	8
2112	5	12	2026-06-25 09:30:00+00	8
2113	7	12	2026-06-25 09:30:00+00	8
2114	9	12	2026-06-25 09:30:00+00	8
2115	1	13	2026-06-25 09:30:00+00	8
2116	2	13	2026-06-25 09:30:00+00	8
2117	5	13	2026-06-25 09:30:00+00	8
2118	7	13	2026-06-25 09:30:00+00	8
2119	9	13	2026-06-25 09:30:00+00	8
2120	1	14	2026-06-25 09:30:00+00	8
2121	2	14	2026-06-25 09:30:00+00	8
2122	5	14	2026-06-25 09:30:00+00	8
2123	7	14	2026-06-25 09:30:00+00	8
2124	9	14	2026-06-25 09:30:00+00	8
2125	1	15	2026-06-25 09:30:00+00	8
2126	2	15	2026-06-25 09:30:00+00	8
2127	5	15	2026-06-25 09:30:00+00	8
2128	7	15	2026-06-25 09:30:00+00	8
2129	9	15	2026-06-25 09:30:00+00	8
2130	1	11	2026-06-26 09:30:00+00	8
2131	2	11	2026-06-26 09:30:00+00	8
2132	5	11	2026-06-26 09:30:00+00	8
2133	7	11	2026-06-26 09:30:00+00	8
2134	9	11	2026-06-26 09:30:00+00	8
2135	1	12	2026-06-26 09:30:00+00	8
2136	2	12	2026-06-26 09:30:00+00	8
2137	5	12	2026-06-26 09:30:00+00	8
2138	7	12	2026-06-26 09:30:00+00	8
2139	9	12	2026-06-26 09:30:00+00	8
2140	1	13	2026-06-26 09:30:00+00	8
2141	2	13	2026-06-26 09:30:00+00	8
2142	5	13	2026-06-26 09:30:00+00	8
2143	7	13	2026-06-26 09:30:00+00	8
2144	9	13	2026-06-26 09:30:00+00	8
2145	1	14	2026-06-26 09:30:00+00	8
2146	2	14	2026-06-26 09:30:00+00	8
2147	5	14	2026-06-26 09:30:00+00	8
2148	7	14	2026-06-26 09:30:00+00	8
2149	9	14	2026-06-26 09:30:00+00	8
2150	1	15	2026-06-26 09:30:00+00	8
2151	2	15	2026-06-26 09:30:00+00	8
2152	5	15	2026-06-26 09:30:00+00	8
2153	7	15	2026-06-26 09:30:00+00	8
2154	9	15	2026-06-26 09:30:00+00	8
2155	1	11	2026-06-27 09:30:00+00	8
2156	2	11	2026-06-27 09:30:00+00	8
2157	5	11	2026-06-27 09:30:00+00	8
2158	7	11	2026-06-27 09:30:00+00	8
2159	9	11	2026-06-27 09:30:00+00	8
2160	1	12	2026-06-27 09:30:00+00	8
2161	2	12	2026-06-27 09:30:00+00	8
2162	5	12	2026-06-27 09:30:00+00	8
2163	7	12	2026-06-27 09:30:00+00	8
2164	9	12	2026-06-27 09:30:00+00	8
2165	1	13	2026-06-27 09:30:00+00	8
2166	2	13	2026-06-27 09:30:00+00	8
2167	5	13	2026-06-27 09:30:00+00	8
2168	7	13	2026-06-27 09:30:00+00	8
2169	9	13	2026-06-27 09:30:00+00	8
2170	1	14	2026-06-27 09:30:00+00	8
2171	2	14	2026-06-27 09:30:00+00	8
2172	5	14	2026-06-27 09:30:00+00	8
2173	7	14	2026-06-27 09:30:00+00	8
2174	9	14	2026-06-27 09:30:00+00	8
2175	1	15	2026-06-27 09:30:00+00	8
2176	2	15	2026-06-27 09:30:00+00	8
2177	5	15	2026-06-27 09:30:00+00	8
2178	7	15	2026-06-27 09:30:00+00	8
2179	9	15	2026-06-27 09:30:00+00	8
2180	1	11	2026-06-28 09:30:00+00	8
2181	2	11	2026-06-28 09:30:00+00	8
2182	5	11	2026-06-28 09:30:00+00	8
2183	7	11	2026-06-28 09:30:00+00	8
2184	9	11	2026-06-28 09:30:00+00	8
2185	1	12	2026-06-28 09:30:00+00	8
2186	2	12	2026-06-28 09:30:00+00	8
2187	5	12	2026-06-28 09:30:00+00	8
2188	7	12	2026-06-28 09:30:00+00	8
2189	9	12	2026-06-28 09:30:00+00	8
2190	1	13	2026-06-28 09:30:00+00	8
2191	2	13	2026-06-28 09:30:00+00	8
2192	5	13	2026-06-28 09:30:00+00	8
2193	7	13	2026-06-28 09:30:00+00	8
2194	9	13	2026-06-28 09:30:00+00	8
2195	1	14	2026-06-28 09:30:00+00	8
2196	2	14	2026-06-28 09:30:00+00	8
2197	5	14	2026-06-28 09:30:00+00	8
2198	7	14	2026-06-28 09:30:00+00	8
2199	9	14	2026-06-28 09:30:00+00	8
2200	1	15	2026-06-28 09:30:00+00	8
2201	2	15	2026-06-28 09:30:00+00	8
2202	5	15	2026-06-28 09:30:00+00	8
2203	7	15	2026-06-28 09:30:00+00	8
2204	9	15	2026-06-28 09:30:00+00	8
2205	1	11	2026-06-29 09:30:00+00	8
2206	2	11	2026-06-29 09:30:00+00	8
2207	5	11	2026-06-29 09:30:00+00	8
2208	7	11	2026-06-29 09:30:00+00	8
2209	9	11	2026-06-29 09:30:00+00	8
2210	1	12	2026-06-29 09:30:00+00	8
2211	2	12	2026-06-29 09:30:00+00	8
2212	5	12	2026-06-29 09:30:00+00	8
2213	7	12	2026-06-29 09:30:00+00	8
2214	9	12	2026-06-29 09:30:00+00	8
2215	1	13	2026-06-29 09:30:00+00	8
2216	2	13	2026-06-29 09:30:00+00	8
2217	5	13	2026-06-29 09:30:00+00	8
2218	7	13	2026-06-29 09:30:00+00	8
2219	9	13	2026-06-29 09:30:00+00	8
2220	1	14	2026-06-29 09:30:00+00	8
2221	2	14	2026-06-29 09:30:00+00	8
2222	5	14	2026-06-29 09:30:00+00	8
2223	7	14	2026-06-29 09:30:00+00	8
2224	9	14	2026-06-29 09:30:00+00	8
2225	1	15	2026-06-29 09:30:00+00	8
2226	2	15	2026-06-29 09:30:00+00	8
2227	5	15	2026-06-29 09:30:00+00	8
2228	7	15	2026-06-29 09:30:00+00	8
2229	9	15	2026-06-29 09:30:00+00	8
2230	1	11	2026-06-30 09:30:00+00	8
2231	2	11	2026-06-30 09:30:00+00	8
2232	5	11	2026-06-30 09:30:00+00	8
2233	7	11	2026-06-30 09:30:00+00	8
2234	9	11	2026-06-30 09:30:00+00	8
2235	1	12	2026-06-30 09:30:00+00	8
2236	2	12	2026-06-30 09:30:00+00	8
2237	5	12	2026-06-30 09:30:00+00	8
2238	7	12	2026-06-30 09:30:00+00	8
2239	9	12	2026-06-30 09:30:00+00	8
2240	1	13	2026-06-30 09:30:00+00	8
2241	2	13	2026-06-30 09:30:00+00	8
2242	5	13	2026-06-30 09:30:00+00	8
2243	7	13	2026-06-30 09:30:00+00	8
2244	9	13	2026-06-30 09:30:00+00	8
2245	1	14	2026-06-30 09:30:00+00	8
2246	2	14	2026-06-30 09:30:00+00	8
2247	5	14	2026-06-30 09:30:00+00	8
2248	7	14	2026-06-30 09:30:00+00	8
2249	9	14	2026-06-30 09:30:00+00	8
2250	1	15	2026-06-30 09:30:00+00	8
2251	2	15	2026-06-30 09:30:00+00	8
2252	5	15	2026-06-30 09:30:00+00	8
2253	7	15	2026-06-30 09:30:00+00	8
2254	9	15	2026-06-30 09:30:00+00	8
2256	2	11	2026-07-01 09:30:00+00	8
2257	5	11	2026-07-01 09:30:00+00	8
2258	7	11	2026-07-01 09:30:00+00	8
2259	9	11	2026-07-01 09:30:00+00	8
2260	1	12	2026-07-01 09:30:00+00	8
2261	2	12	2026-07-01 09:30:00+00	8
2262	5	12	2026-07-01 09:30:00+00	8
2263	7	12	2026-07-01 09:30:00+00	8
2264	9	12	2026-07-01 09:30:00+00	8
2265	1	13	2026-07-01 09:30:00+00	8
2266	2	13	2026-07-01 09:30:00+00	8
2267	5	13	2026-07-01 09:30:00+00	8
2268	7	13	2026-07-01 09:30:00+00	8
2269	9	13	2026-07-01 09:30:00+00	8
2270	1	14	2026-07-01 09:30:00+00	8
2271	2	14	2026-07-01 09:30:00+00	8
2272	5	14	2026-07-01 09:30:00+00	8
2273	7	14	2026-07-01 09:30:00+00	8
2274	9	14	2026-07-01 09:30:00+00	8
2275	1	15	2026-07-01 09:30:00+00	8
2276	2	15	2026-07-01 09:30:00+00	8
2277	5	15	2026-07-01 09:30:00+00	8
2278	7	15	2026-07-01 09:30:00+00	8
2279	9	15	2026-07-01 09:30:00+00	8
2280	1	11	2026-06-25 10:00:00+00	8
2281	2	11	2026-06-25 10:00:00+00	8
2282	5	11	2026-06-25 10:00:00+00	8
2283	7	11	2026-06-25 10:00:00+00	8
2284	9	11	2026-06-25 10:00:00+00	8
2285	1	12	2026-06-25 10:00:00+00	8
2286	2	12	2026-06-25 10:00:00+00	8
2287	5	12	2026-06-25 10:00:00+00	8
2288	7	12	2026-06-25 10:00:00+00	8
2289	9	12	2026-06-25 10:00:00+00	8
2290	1	13	2026-06-25 10:00:00+00	8
2291	2	13	2026-06-25 10:00:00+00	8
2292	5	13	2026-06-25 10:00:00+00	8
2293	7	13	2026-06-25 10:00:00+00	8
2294	9	13	2026-06-25 10:00:00+00	8
2295	1	14	2026-06-25 10:00:00+00	8
2296	2	14	2026-06-25 10:00:00+00	8
2297	5	14	2026-06-25 10:00:00+00	8
2298	7	14	2026-06-25 10:00:00+00	8
2299	9	14	2026-06-25 10:00:00+00	8
2300	1	15	2026-06-25 10:00:00+00	8
2301	2	15	2026-06-25 10:00:00+00	8
2302	5	15	2026-06-25 10:00:00+00	8
2303	7	15	2026-06-25 10:00:00+00	8
2304	9	15	2026-06-25 10:00:00+00	8
2305	1	11	2026-06-26 10:00:00+00	8
2306	2	11	2026-06-26 10:00:00+00	8
2307	5	11	2026-06-26 10:00:00+00	8
2308	7	11	2026-06-26 10:00:00+00	8
2309	9	11	2026-06-26 10:00:00+00	8
2310	1	12	2026-06-26 10:00:00+00	8
2311	2	12	2026-06-26 10:00:00+00	8
2312	5	12	2026-06-26 10:00:00+00	8
2313	7	12	2026-06-26 10:00:00+00	8
2314	9	12	2026-06-26 10:00:00+00	8
2315	1	13	2026-06-26 10:00:00+00	8
2316	2	13	2026-06-26 10:00:00+00	8
2317	5	13	2026-06-26 10:00:00+00	8
2318	7	13	2026-06-26 10:00:00+00	8
2319	9	13	2026-06-26 10:00:00+00	8
2320	1	14	2026-06-26 10:00:00+00	8
2321	2	14	2026-06-26 10:00:00+00	8
2322	5	14	2026-06-26 10:00:00+00	8
2323	7	14	2026-06-26 10:00:00+00	8
2324	9	14	2026-06-26 10:00:00+00	8
2325	1	15	2026-06-26 10:00:00+00	8
2326	2	15	2026-06-26 10:00:00+00	8
2327	5	15	2026-06-26 10:00:00+00	8
2328	7	15	2026-06-26 10:00:00+00	8
2329	9	15	2026-06-26 10:00:00+00	8
2330	1	11	2026-06-27 10:00:00+00	8
2331	2	11	2026-06-27 10:00:00+00	8
2332	5	11	2026-06-27 10:00:00+00	8
2333	7	11	2026-06-27 10:00:00+00	8
2334	9	11	2026-06-27 10:00:00+00	8
2335	1	12	2026-06-27 10:00:00+00	8
2336	2	12	2026-06-27 10:00:00+00	8
2337	5	12	2026-06-27 10:00:00+00	8
2338	7	12	2026-06-27 10:00:00+00	8
2339	9	12	2026-06-27 10:00:00+00	8
2340	1	13	2026-06-27 10:00:00+00	8
2341	2	13	2026-06-27 10:00:00+00	8
2342	5	13	2026-06-27 10:00:00+00	8
2343	7	13	2026-06-27 10:00:00+00	8
2344	9	13	2026-06-27 10:00:00+00	8
2345	1	14	2026-06-27 10:00:00+00	8
2346	2	14	2026-06-27 10:00:00+00	8
2347	5	14	2026-06-27 10:00:00+00	8
2348	7	14	2026-06-27 10:00:00+00	8
2349	9	14	2026-06-27 10:00:00+00	8
2350	1	15	2026-06-27 10:00:00+00	8
2351	2	15	2026-06-27 10:00:00+00	8
2352	5	15	2026-06-27 10:00:00+00	8
2353	7	15	2026-06-27 10:00:00+00	8
2354	9	15	2026-06-27 10:00:00+00	8
2355	1	11	2026-06-28 10:00:00+00	8
2356	2	11	2026-06-28 10:00:00+00	8
2357	5	11	2026-06-28 10:00:00+00	8
2358	7	11	2026-06-28 10:00:00+00	8
2359	9	11	2026-06-28 10:00:00+00	8
2360	1	12	2026-06-28 10:00:00+00	8
2361	2	12	2026-06-28 10:00:00+00	8
2362	5	12	2026-06-28 10:00:00+00	8
2363	7	12	2026-06-28 10:00:00+00	8
2364	9	12	2026-06-28 10:00:00+00	8
2365	1	13	2026-06-28 10:00:00+00	8
2366	2	13	2026-06-28 10:00:00+00	8
2367	5	13	2026-06-28 10:00:00+00	8
2368	7	13	2026-06-28 10:00:00+00	8
2369	9	13	2026-06-28 10:00:00+00	8
2370	1	14	2026-06-28 10:00:00+00	8
2371	2	14	2026-06-28 10:00:00+00	8
2372	5	14	2026-06-28 10:00:00+00	8
2373	7	14	2026-06-28 10:00:00+00	8
2374	9	14	2026-06-28 10:00:00+00	8
2375	1	15	2026-06-28 10:00:00+00	8
2376	2	15	2026-06-28 10:00:00+00	8
2377	5	15	2026-06-28 10:00:00+00	8
2378	7	15	2026-06-28 10:00:00+00	8
2379	9	15	2026-06-28 10:00:00+00	8
2380	1	11	2026-06-29 10:00:00+00	8
2381	2	11	2026-06-29 10:00:00+00	8
2382	5	11	2026-06-29 10:00:00+00	8
2383	7	11	2026-06-29 10:00:00+00	8
2384	9	11	2026-06-29 10:00:00+00	8
2385	1	12	2026-06-29 10:00:00+00	8
2386	2	12	2026-06-29 10:00:00+00	8
2387	5	12	2026-06-29 10:00:00+00	8
2388	7	12	2026-06-29 10:00:00+00	8
2389	9	12	2026-06-29 10:00:00+00	8
2390	1	13	2026-06-29 10:00:00+00	8
2391	2	13	2026-06-29 10:00:00+00	8
2392	5	13	2026-06-29 10:00:00+00	8
2393	7	13	2026-06-29 10:00:00+00	8
2394	9	13	2026-06-29 10:00:00+00	8
2395	1	14	2026-06-29 10:00:00+00	8
2396	2	14	2026-06-29 10:00:00+00	8
2397	5	14	2026-06-29 10:00:00+00	8
2398	7	14	2026-06-29 10:00:00+00	8
2399	9	14	2026-06-29 10:00:00+00	8
2400	1	15	2026-06-29 10:00:00+00	8
2401	2	15	2026-06-29 10:00:00+00	8
2402	5	15	2026-06-29 10:00:00+00	8
2403	7	15	2026-06-29 10:00:00+00	8
2404	9	15	2026-06-29 10:00:00+00	8
2405	1	11	2026-06-30 10:00:00+00	8
2406	2	11	2026-06-30 10:00:00+00	8
2407	5	11	2026-06-30 10:00:00+00	8
2408	7	11	2026-06-30 10:00:00+00	8
2409	9	11	2026-06-30 10:00:00+00	8
2410	1	12	2026-06-30 10:00:00+00	8
2411	2	12	2026-06-30 10:00:00+00	8
2412	5	12	2026-06-30 10:00:00+00	8
2413	7	12	2026-06-30 10:00:00+00	8
2414	9	12	2026-06-30 10:00:00+00	8
2415	1	13	2026-06-30 10:00:00+00	8
2416	2	13	2026-06-30 10:00:00+00	8
2417	5	13	2026-06-30 10:00:00+00	8
2418	7	13	2026-06-30 10:00:00+00	8
2419	9	13	2026-06-30 10:00:00+00	8
2420	1	14	2026-06-30 10:00:00+00	8
2421	2	14	2026-06-30 10:00:00+00	8
2422	5	14	2026-06-30 10:00:00+00	8
2423	7	14	2026-06-30 10:00:00+00	8
2424	9	14	2026-06-30 10:00:00+00	8
2425	1	15	2026-06-30 10:00:00+00	8
2426	2	15	2026-06-30 10:00:00+00	8
2427	5	15	2026-06-30 10:00:00+00	8
2428	7	15	2026-06-30 10:00:00+00	8
2429	9	15	2026-06-30 10:00:00+00	8
2430	1	11	2026-07-01 10:00:00+00	8
2431	2	11	2026-07-01 10:00:00+00	8
2432	5	11	2026-07-01 10:00:00+00	8
2433	7	11	2026-07-01 10:00:00+00	8
2434	9	11	2026-07-01 10:00:00+00	8
2435	1	12	2026-07-01 10:00:00+00	8
2436	2	12	2026-07-01 10:00:00+00	8
2437	5	12	2026-07-01 10:00:00+00	8
2438	7	12	2026-07-01 10:00:00+00	8
2439	9	12	2026-07-01 10:00:00+00	8
2440	1	13	2026-07-01 10:00:00+00	8
2441	2	13	2026-07-01 10:00:00+00	8
2442	5	13	2026-07-01 10:00:00+00	8
2443	7	13	2026-07-01 10:00:00+00	8
2444	9	13	2026-07-01 10:00:00+00	8
2445	1	14	2026-07-01 10:00:00+00	8
2446	2	14	2026-07-01 10:00:00+00	8
2447	5	14	2026-07-01 10:00:00+00	8
2448	7	14	2026-07-01 10:00:00+00	8
2449	9	14	2026-07-01 10:00:00+00	8
2450	1	15	2026-07-01 10:00:00+00	8
2451	2	15	2026-07-01 10:00:00+00	8
2452	5	15	2026-07-01 10:00:00+00	8
2453	7	15	2026-07-01 10:00:00+00	8
2454	9	15	2026-07-01 10:00:00+00	8
2455	1	11	2026-06-25 10:30:00+00	8
2456	2	11	2026-06-25 10:30:00+00	8
2457	5	11	2026-06-25 10:30:00+00	8
2458	7	11	2026-06-25 10:30:00+00	8
2459	9	11	2026-06-25 10:30:00+00	8
2460	1	12	2026-06-25 10:30:00+00	8
2461	2	12	2026-06-25 10:30:00+00	8
2462	5	12	2026-06-25 10:30:00+00	8
2463	7	12	2026-06-25 10:30:00+00	8
2464	9	12	2026-06-25 10:30:00+00	8
2465	1	13	2026-06-25 10:30:00+00	8
2466	2	13	2026-06-25 10:30:00+00	8
2467	5	13	2026-06-25 10:30:00+00	8
2468	7	13	2026-06-25 10:30:00+00	8
2469	9	13	2026-06-25 10:30:00+00	8
2470	1	14	2026-06-25 10:30:00+00	8
2471	2	14	2026-06-25 10:30:00+00	8
2472	5	14	2026-06-25 10:30:00+00	8
2473	7	14	2026-06-25 10:30:00+00	8
2474	9	14	2026-06-25 10:30:00+00	8
2475	1	15	2026-06-25 10:30:00+00	8
2476	2	15	2026-06-25 10:30:00+00	8
2477	5	15	2026-06-25 10:30:00+00	8
2478	7	15	2026-06-25 10:30:00+00	8
2479	9	15	2026-06-25 10:30:00+00	8
2480	1	11	2026-06-26 10:30:00+00	8
2481	2	11	2026-06-26 10:30:00+00	8
2482	5	11	2026-06-26 10:30:00+00	8
2483	7	11	2026-06-26 10:30:00+00	8
2484	9	11	2026-06-26 10:30:00+00	8
2485	1	12	2026-06-26 10:30:00+00	8
2486	2	12	2026-06-26 10:30:00+00	8
2487	5	12	2026-06-26 10:30:00+00	8
2488	7	12	2026-06-26 10:30:00+00	8
2489	9	12	2026-06-26 10:30:00+00	8
2490	1	13	2026-06-26 10:30:00+00	8
2491	2	13	2026-06-26 10:30:00+00	8
2492	5	13	2026-06-26 10:30:00+00	8
2493	7	13	2026-06-26 10:30:00+00	8
2494	9	13	2026-06-26 10:30:00+00	8
2495	1	14	2026-06-26 10:30:00+00	8
2496	2	14	2026-06-26 10:30:00+00	8
2497	5	14	2026-06-26 10:30:00+00	8
2498	7	14	2026-06-26 10:30:00+00	8
2499	9	14	2026-06-26 10:30:00+00	8
2500	1	15	2026-06-26 10:30:00+00	8
2501	2	15	2026-06-26 10:30:00+00	8
2502	5	15	2026-06-26 10:30:00+00	8
2503	7	15	2026-06-26 10:30:00+00	8
2504	9	15	2026-06-26 10:30:00+00	8
2505	1	11	2026-06-27 10:30:00+00	8
2506	2	11	2026-06-27 10:30:00+00	8
2507	5	11	2026-06-27 10:30:00+00	8
2508	7	11	2026-06-27 10:30:00+00	8
2509	9	11	2026-06-27 10:30:00+00	8
2510	1	12	2026-06-27 10:30:00+00	8
2511	2	12	2026-06-27 10:30:00+00	8
2512	5	12	2026-06-27 10:30:00+00	8
2513	7	12	2026-06-27 10:30:00+00	8
2514	9	12	2026-06-27 10:30:00+00	8
2515	1	13	2026-06-27 10:30:00+00	8
2516	2	13	2026-06-27 10:30:00+00	8
2517	5	13	2026-06-27 10:30:00+00	8
2518	7	13	2026-06-27 10:30:00+00	8
2519	9	13	2026-06-27 10:30:00+00	8
2520	1	14	2026-06-27 10:30:00+00	8
2521	2	14	2026-06-27 10:30:00+00	8
2522	5	14	2026-06-27 10:30:00+00	8
2523	7	14	2026-06-27 10:30:00+00	8
2524	9	14	2026-06-27 10:30:00+00	8
2525	1	15	2026-06-27 10:30:00+00	8
2526	2	15	2026-06-27 10:30:00+00	8
2527	5	15	2026-06-27 10:30:00+00	8
2528	7	15	2026-06-27 10:30:00+00	8
2529	9	15	2026-06-27 10:30:00+00	8
2530	1	11	2026-06-28 10:30:00+00	8
2531	2	11	2026-06-28 10:30:00+00	8
2532	5	11	2026-06-28 10:30:00+00	8
2533	7	11	2026-06-28 10:30:00+00	8
2534	9	11	2026-06-28 10:30:00+00	8
2535	1	12	2026-06-28 10:30:00+00	8
2536	2	12	2026-06-28 10:30:00+00	8
2537	5	12	2026-06-28 10:30:00+00	8
2538	7	12	2026-06-28 10:30:00+00	8
2539	9	12	2026-06-28 10:30:00+00	8
2540	1	13	2026-06-28 10:30:00+00	8
2541	2	13	2026-06-28 10:30:00+00	8
2542	5	13	2026-06-28 10:30:00+00	8
2543	7	13	2026-06-28 10:30:00+00	8
2544	9	13	2026-06-28 10:30:00+00	8
2545	1	14	2026-06-28 10:30:00+00	8
2546	2	14	2026-06-28 10:30:00+00	8
2547	5	14	2026-06-28 10:30:00+00	8
2548	7	14	2026-06-28 10:30:00+00	8
2549	9	14	2026-06-28 10:30:00+00	8
2550	1	15	2026-06-28 10:30:00+00	8
2551	2	15	2026-06-28 10:30:00+00	8
2552	5	15	2026-06-28 10:30:00+00	8
2553	7	15	2026-06-28 10:30:00+00	8
2554	9	15	2026-06-28 10:30:00+00	8
2555	1	11	2026-06-29 10:30:00+00	8
2556	2	11	2026-06-29 10:30:00+00	8
2557	5	11	2026-06-29 10:30:00+00	8
2558	7	11	2026-06-29 10:30:00+00	8
2559	9	11	2026-06-29 10:30:00+00	8
2560	1	12	2026-06-29 10:30:00+00	8
2561	2	12	2026-06-29 10:30:00+00	8
2562	5	12	2026-06-29 10:30:00+00	8
2563	7	12	2026-06-29 10:30:00+00	8
2564	9	12	2026-06-29 10:30:00+00	8
2565	1	13	2026-06-29 10:30:00+00	8
2566	2	13	2026-06-29 10:30:00+00	8
2567	5	13	2026-06-29 10:30:00+00	8
2568	7	13	2026-06-29 10:30:00+00	8
2569	9	13	2026-06-29 10:30:00+00	8
2570	1	14	2026-06-29 10:30:00+00	8
2571	2	14	2026-06-29 10:30:00+00	8
2572	5	14	2026-06-29 10:30:00+00	8
2573	7	14	2026-06-29 10:30:00+00	8
2574	9	14	2026-06-29 10:30:00+00	8
2575	1	15	2026-06-29 10:30:00+00	8
2576	2	15	2026-06-29 10:30:00+00	8
2577	5	15	2026-06-29 10:30:00+00	8
2578	7	15	2026-06-29 10:30:00+00	8
2579	9	15	2026-06-29 10:30:00+00	8
2580	1	11	2026-06-30 10:30:00+00	8
2581	2	11	2026-06-30 10:30:00+00	8
2582	5	11	2026-06-30 10:30:00+00	8
2583	7	11	2026-06-30 10:30:00+00	8
2584	9	11	2026-06-30 10:30:00+00	8
2585	1	12	2026-06-30 10:30:00+00	8
2586	2	12	2026-06-30 10:30:00+00	8
2587	5	12	2026-06-30 10:30:00+00	8
2588	7	12	2026-06-30 10:30:00+00	8
2589	9	12	2026-06-30 10:30:00+00	8
2590	1	13	2026-06-30 10:30:00+00	8
2591	2	13	2026-06-30 10:30:00+00	8
2592	5	13	2026-06-30 10:30:00+00	8
2593	7	13	2026-06-30 10:30:00+00	8
2594	9	13	2026-06-30 10:30:00+00	8
2595	1	14	2026-06-30 10:30:00+00	8
2596	2	14	2026-06-30 10:30:00+00	8
2597	5	14	2026-06-30 10:30:00+00	8
2598	7	14	2026-06-30 10:30:00+00	8
2599	9	14	2026-06-30 10:30:00+00	8
2600	1	15	2026-06-30 10:30:00+00	8
2601	2	15	2026-06-30 10:30:00+00	8
2602	5	15	2026-06-30 10:30:00+00	8
2603	7	15	2026-06-30 10:30:00+00	8
2604	9	15	2026-06-30 10:30:00+00	8
2605	1	11	2026-07-01 10:30:00+00	8
2606	2	11	2026-07-01 10:30:00+00	8
2607	5	11	2026-07-01 10:30:00+00	8
2608	7	11	2026-07-01 10:30:00+00	8
2609	9	11	2026-07-01 10:30:00+00	8
2610	1	12	2026-07-01 10:30:00+00	8
2611	2	12	2026-07-01 10:30:00+00	8
2612	5	12	2026-07-01 10:30:00+00	8
2613	7	12	2026-07-01 10:30:00+00	8
2614	9	12	2026-07-01 10:30:00+00	8
2615	1	13	2026-07-01 10:30:00+00	8
2616	2	13	2026-07-01 10:30:00+00	8
2617	5	13	2026-07-01 10:30:00+00	8
2618	7	13	2026-07-01 10:30:00+00	8
2619	9	13	2026-07-01 10:30:00+00	8
2620	1	14	2026-07-01 10:30:00+00	8
2621	2	14	2026-07-01 10:30:00+00	8
2622	5	14	2026-07-01 10:30:00+00	8
2623	7	14	2026-07-01 10:30:00+00	8
2624	9	14	2026-07-01 10:30:00+00	8
2625	1	15	2026-07-01 10:30:00+00	8
2626	2	15	2026-07-01 10:30:00+00	8
2627	5	15	2026-07-01 10:30:00+00	8
2628	7	15	2026-07-01 10:30:00+00	8
2629	9	15	2026-07-01 10:30:00+00	8
2630	1	11	2026-06-25 11:00:00+00	8
2631	2	11	2026-06-25 11:00:00+00	8
2632	5	11	2026-06-25 11:00:00+00	8
2633	7	11	2026-06-25 11:00:00+00	8
2634	9	11	2026-06-25 11:00:00+00	8
2635	1	12	2026-06-25 11:00:00+00	8
2636	2	12	2026-06-25 11:00:00+00	8
2637	5	12	2026-06-25 11:00:00+00	8
2638	7	12	2026-06-25 11:00:00+00	8
2639	9	12	2026-06-25 11:00:00+00	8
2640	1	13	2026-06-25 11:00:00+00	8
2641	2	13	2026-06-25 11:00:00+00	8
2642	5	13	2026-06-25 11:00:00+00	8
2643	7	13	2026-06-25 11:00:00+00	8
2644	9	13	2026-06-25 11:00:00+00	8
2645	1	14	2026-06-25 11:00:00+00	8
2646	2	14	2026-06-25 11:00:00+00	8
2647	5	14	2026-06-25 11:00:00+00	8
2648	7	14	2026-06-25 11:00:00+00	8
2649	9	14	2026-06-25 11:00:00+00	8
2650	1	15	2026-06-25 11:00:00+00	8
2651	2	15	2026-06-25 11:00:00+00	8
2652	5	15	2026-06-25 11:00:00+00	8
2653	7	15	2026-06-25 11:00:00+00	8
2654	9	15	2026-06-25 11:00:00+00	8
2655	1	11	2026-06-26 11:00:00+00	8
2656	2	11	2026-06-26 11:00:00+00	8
2657	5	11	2026-06-26 11:00:00+00	8
2658	7	11	2026-06-26 11:00:00+00	8
2659	9	11	2026-06-26 11:00:00+00	8
2660	1	12	2026-06-26 11:00:00+00	8
2661	2	12	2026-06-26 11:00:00+00	8
2662	5	12	2026-06-26 11:00:00+00	8
2663	7	12	2026-06-26 11:00:00+00	8
2664	9	12	2026-06-26 11:00:00+00	8
2665	1	13	2026-06-26 11:00:00+00	8
2666	2	13	2026-06-26 11:00:00+00	8
2667	5	13	2026-06-26 11:00:00+00	8
2668	7	13	2026-06-26 11:00:00+00	8
2669	9	13	2026-06-26 11:00:00+00	8
2670	1	14	2026-06-26 11:00:00+00	8
2671	2	14	2026-06-26 11:00:00+00	8
2672	5	14	2026-06-26 11:00:00+00	8
2673	7	14	2026-06-26 11:00:00+00	8
2674	9	14	2026-06-26 11:00:00+00	8
2675	1	15	2026-06-26 11:00:00+00	8
2676	2	15	2026-06-26 11:00:00+00	8
2677	5	15	2026-06-26 11:00:00+00	8
2678	7	15	2026-06-26 11:00:00+00	8
2679	9	15	2026-06-26 11:00:00+00	8
2680	1	11	2026-06-27 11:00:00+00	8
2681	2	11	2026-06-27 11:00:00+00	8
2682	5	11	2026-06-27 11:00:00+00	8
2683	7	11	2026-06-27 11:00:00+00	8
2684	9	11	2026-06-27 11:00:00+00	8
2685	1	12	2026-06-27 11:00:00+00	8
2686	2	12	2026-06-27 11:00:00+00	8
2687	5	12	2026-06-27 11:00:00+00	8
2688	7	12	2026-06-27 11:00:00+00	8
2689	9	12	2026-06-27 11:00:00+00	8
2690	1	13	2026-06-27 11:00:00+00	8
2691	2	13	2026-06-27 11:00:00+00	8
2692	5	13	2026-06-27 11:00:00+00	8
2693	7	13	2026-06-27 11:00:00+00	8
2694	9	13	2026-06-27 11:00:00+00	8
2695	1	14	2026-06-27 11:00:00+00	8
2696	2	14	2026-06-27 11:00:00+00	8
2697	5	14	2026-06-27 11:00:00+00	8
2698	7	14	2026-06-27 11:00:00+00	8
2699	9	14	2026-06-27 11:00:00+00	8
2700	1	15	2026-06-27 11:00:00+00	8
2701	2	15	2026-06-27 11:00:00+00	8
2702	5	15	2026-06-27 11:00:00+00	8
2703	7	15	2026-06-27 11:00:00+00	8
2704	9	15	2026-06-27 11:00:00+00	8
2705	1	11	2026-06-28 11:00:00+00	8
2706	2	11	2026-06-28 11:00:00+00	8
2707	5	11	2026-06-28 11:00:00+00	8
2708	7	11	2026-06-28 11:00:00+00	8
2709	9	11	2026-06-28 11:00:00+00	8
2710	1	12	2026-06-28 11:00:00+00	8
2711	2	12	2026-06-28 11:00:00+00	8
2712	5	12	2026-06-28 11:00:00+00	8
2713	7	12	2026-06-28 11:00:00+00	8
2714	9	12	2026-06-28 11:00:00+00	8
2715	1	13	2026-06-28 11:00:00+00	8
2716	2	13	2026-06-28 11:00:00+00	8
2717	5	13	2026-06-28 11:00:00+00	8
2718	7	13	2026-06-28 11:00:00+00	8
2719	9	13	2026-06-28 11:00:00+00	8
2720	1	14	2026-06-28 11:00:00+00	8
2721	2	14	2026-06-28 11:00:00+00	8
2722	5	14	2026-06-28 11:00:00+00	8
2723	7	14	2026-06-28 11:00:00+00	8
2724	9	14	2026-06-28 11:00:00+00	8
2725	1	15	2026-06-28 11:00:00+00	8
2726	2	15	2026-06-28 11:00:00+00	8
2727	5	15	2026-06-28 11:00:00+00	8
2728	7	15	2026-06-28 11:00:00+00	8
2729	9	15	2026-06-28 11:00:00+00	8
2730	1	11	2026-06-29 11:00:00+00	8
2731	2	11	2026-06-29 11:00:00+00	8
2732	5	11	2026-06-29 11:00:00+00	8
2733	7	11	2026-06-29 11:00:00+00	8
2734	9	11	2026-06-29 11:00:00+00	8
2735	1	12	2026-06-29 11:00:00+00	8
2736	2	12	2026-06-29 11:00:00+00	8
2737	5	12	2026-06-29 11:00:00+00	8
2738	7	12	2026-06-29 11:00:00+00	8
2739	9	12	2026-06-29 11:00:00+00	8
2740	1	13	2026-06-29 11:00:00+00	8
2741	2	13	2026-06-29 11:00:00+00	8
2742	5	13	2026-06-29 11:00:00+00	8
2743	7	13	2026-06-29 11:00:00+00	8
2744	9	13	2026-06-29 11:00:00+00	8
2745	1	14	2026-06-29 11:00:00+00	8
2746	2	14	2026-06-29 11:00:00+00	8
2747	5	14	2026-06-29 11:00:00+00	8
2748	7	14	2026-06-29 11:00:00+00	8
2749	9	14	2026-06-29 11:00:00+00	8
2750	1	15	2026-06-29 11:00:00+00	8
2751	2	15	2026-06-29 11:00:00+00	8
2752	5	15	2026-06-29 11:00:00+00	8
2753	7	15	2026-06-29 11:00:00+00	8
2754	9	15	2026-06-29 11:00:00+00	8
2755	1	11	2026-06-30 11:00:00+00	8
2756	2	11	2026-06-30 11:00:00+00	8
2757	5	11	2026-06-30 11:00:00+00	8
2758	7	11	2026-06-30 11:00:00+00	8
2759	9	11	2026-06-30 11:00:00+00	8
2760	1	12	2026-06-30 11:00:00+00	8
2761	2	12	2026-06-30 11:00:00+00	8
2762	5	12	2026-06-30 11:00:00+00	8
2763	7	12	2026-06-30 11:00:00+00	8
2764	9	12	2026-06-30 11:00:00+00	8
2765	1	13	2026-06-30 11:00:00+00	8
2766	2	13	2026-06-30 11:00:00+00	8
2767	5	13	2026-06-30 11:00:00+00	8
2768	7	13	2026-06-30 11:00:00+00	8
2769	9	13	2026-06-30 11:00:00+00	8
2770	1	14	2026-06-30 11:00:00+00	8
2771	2	14	2026-06-30 11:00:00+00	8
2772	5	14	2026-06-30 11:00:00+00	8
2773	7	14	2026-06-30 11:00:00+00	8
2774	9	14	2026-06-30 11:00:00+00	8
2775	1	15	2026-06-30 11:00:00+00	8
2776	2	15	2026-06-30 11:00:00+00	8
2777	5	15	2026-06-30 11:00:00+00	8
2778	7	15	2026-06-30 11:00:00+00	8
2779	9	15	2026-06-30 11:00:00+00	8
2780	1	11	2026-07-01 11:00:00+00	8
2781	2	11	2026-07-01 11:00:00+00	8
2782	5	11	2026-07-01 11:00:00+00	8
2783	7	11	2026-07-01 11:00:00+00	8
2784	9	11	2026-07-01 11:00:00+00	8
2785	1	12	2026-07-01 11:00:00+00	8
2786	2	12	2026-07-01 11:00:00+00	8
2787	5	12	2026-07-01 11:00:00+00	8
2788	7	12	2026-07-01 11:00:00+00	8
2789	9	12	2026-07-01 11:00:00+00	8
2790	1	13	2026-07-01 11:00:00+00	8
2791	2	13	2026-07-01 11:00:00+00	8
2792	5	13	2026-07-01 11:00:00+00	8
2793	7	13	2026-07-01 11:00:00+00	8
2794	9	13	2026-07-01 11:00:00+00	8
2795	1	14	2026-07-01 11:00:00+00	8
2796	2	14	2026-07-01 11:00:00+00	8
2797	5	14	2026-07-01 11:00:00+00	8
2798	7	14	2026-07-01 11:00:00+00	8
2799	9	14	2026-07-01 11:00:00+00	8
2800	1	15	2026-07-01 11:00:00+00	8
2801	2	15	2026-07-01 11:00:00+00	8
2802	5	15	2026-07-01 11:00:00+00	8
2803	7	15	2026-07-01 11:00:00+00	8
2804	9	15	2026-07-01 11:00:00+00	8
2805	1	11	2026-06-25 11:30:00+00	8
2806	2	11	2026-06-25 11:30:00+00	8
2807	5	11	2026-06-25 11:30:00+00	8
2808	7	11	2026-06-25 11:30:00+00	8
2809	9	11	2026-06-25 11:30:00+00	8
2810	1	12	2026-06-25 11:30:00+00	8
2811	2	12	2026-06-25 11:30:00+00	8
2812	5	12	2026-06-25 11:30:00+00	8
2813	7	12	2026-06-25 11:30:00+00	8
2814	9	12	2026-06-25 11:30:00+00	8
2815	1	13	2026-06-25 11:30:00+00	8
2816	2	13	2026-06-25 11:30:00+00	8
2817	5	13	2026-06-25 11:30:00+00	8
2818	7	13	2026-06-25 11:30:00+00	8
2819	9	13	2026-06-25 11:30:00+00	8
2820	1	14	2026-06-25 11:30:00+00	8
2821	2	14	2026-06-25 11:30:00+00	8
2822	5	14	2026-06-25 11:30:00+00	8
2823	7	14	2026-06-25 11:30:00+00	8
2824	9	14	2026-06-25 11:30:00+00	8
2825	1	15	2026-06-25 11:30:00+00	8
2826	2	15	2026-06-25 11:30:00+00	8
2827	5	15	2026-06-25 11:30:00+00	8
2828	7	15	2026-06-25 11:30:00+00	8
2829	9	15	2026-06-25 11:30:00+00	8
2830	1	11	2026-06-26 11:30:00+00	8
2831	2	11	2026-06-26 11:30:00+00	8
2832	5	11	2026-06-26 11:30:00+00	8
2833	7	11	2026-06-26 11:30:00+00	8
2834	9	11	2026-06-26 11:30:00+00	8
2835	1	12	2026-06-26 11:30:00+00	8
2836	2	12	2026-06-26 11:30:00+00	8
2837	5	12	2026-06-26 11:30:00+00	8
2838	7	12	2026-06-26 11:30:00+00	8
2839	9	12	2026-06-26 11:30:00+00	8
2840	1	13	2026-06-26 11:30:00+00	8
2841	2	13	2026-06-26 11:30:00+00	8
2842	5	13	2026-06-26 11:30:00+00	8
2843	7	13	2026-06-26 11:30:00+00	8
2844	9	13	2026-06-26 11:30:00+00	8
2845	1	14	2026-06-26 11:30:00+00	8
2846	2	14	2026-06-26 11:30:00+00	8
2847	5	14	2026-06-26 11:30:00+00	8
2848	7	14	2026-06-26 11:30:00+00	8
2849	9	14	2026-06-26 11:30:00+00	8
2850	1	15	2026-06-26 11:30:00+00	8
2851	2	15	2026-06-26 11:30:00+00	8
2852	5	15	2026-06-26 11:30:00+00	8
2853	7	15	2026-06-26 11:30:00+00	8
2854	9	15	2026-06-26 11:30:00+00	8
2855	1	11	2026-06-27 11:30:00+00	8
2856	2	11	2026-06-27 11:30:00+00	8
2857	5	11	2026-06-27 11:30:00+00	8
2858	7	11	2026-06-27 11:30:00+00	8
2859	9	11	2026-06-27 11:30:00+00	8
2860	1	12	2026-06-27 11:30:00+00	8
2861	2	12	2026-06-27 11:30:00+00	8
2862	5	12	2026-06-27 11:30:00+00	8
2863	7	12	2026-06-27 11:30:00+00	8
2864	9	12	2026-06-27 11:30:00+00	8
2865	1	13	2026-06-27 11:30:00+00	8
2866	2	13	2026-06-27 11:30:00+00	8
2867	5	13	2026-06-27 11:30:00+00	8
2868	7	13	2026-06-27 11:30:00+00	8
2869	9	13	2026-06-27 11:30:00+00	8
2870	1	14	2026-06-27 11:30:00+00	8
2871	2	14	2026-06-27 11:30:00+00	8
2872	5	14	2026-06-27 11:30:00+00	8
2873	7	14	2026-06-27 11:30:00+00	8
2874	9	14	2026-06-27 11:30:00+00	8
2875	1	15	2026-06-27 11:30:00+00	8
2876	2	15	2026-06-27 11:30:00+00	8
2877	5	15	2026-06-27 11:30:00+00	8
2878	7	15	2026-06-27 11:30:00+00	8
2879	9	15	2026-06-27 11:30:00+00	8
2880	1	11	2026-06-28 11:30:00+00	8
2881	2	11	2026-06-28 11:30:00+00	8
2882	5	11	2026-06-28 11:30:00+00	8
2883	7	11	2026-06-28 11:30:00+00	8
2884	9	11	2026-06-28 11:30:00+00	8
2885	1	12	2026-06-28 11:30:00+00	8
2886	2	12	2026-06-28 11:30:00+00	8
2887	5	12	2026-06-28 11:30:00+00	8
2888	7	12	2026-06-28 11:30:00+00	8
2889	9	12	2026-06-28 11:30:00+00	8
2890	1	13	2026-06-28 11:30:00+00	8
2891	2	13	2026-06-28 11:30:00+00	8
2892	5	13	2026-06-28 11:30:00+00	8
2893	7	13	2026-06-28 11:30:00+00	8
2894	9	13	2026-06-28 11:30:00+00	8
2895	1	14	2026-06-28 11:30:00+00	8
2896	2	14	2026-06-28 11:30:00+00	8
2897	5	14	2026-06-28 11:30:00+00	8
2898	7	14	2026-06-28 11:30:00+00	8
2899	9	14	2026-06-28 11:30:00+00	8
2900	1	15	2026-06-28 11:30:00+00	8
2901	2	15	2026-06-28 11:30:00+00	8
2902	5	15	2026-06-28 11:30:00+00	8
2903	7	15	2026-06-28 11:30:00+00	8
2904	9	15	2026-06-28 11:30:00+00	8
2905	1	11	2026-06-29 11:30:00+00	8
2906	2	11	2026-06-29 11:30:00+00	8
2907	5	11	2026-06-29 11:30:00+00	8
2908	7	11	2026-06-29 11:30:00+00	8
2909	9	11	2026-06-29 11:30:00+00	8
2910	1	12	2026-06-29 11:30:00+00	8
2911	2	12	2026-06-29 11:30:00+00	8
2912	5	12	2026-06-29 11:30:00+00	8
2913	7	12	2026-06-29 11:30:00+00	8
2914	9	12	2026-06-29 11:30:00+00	8
2915	1	13	2026-06-29 11:30:00+00	8
2916	2	13	2026-06-29 11:30:00+00	8
2917	5	13	2026-06-29 11:30:00+00	8
2918	7	13	2026-06-29 11:30:00+00	8
2919	9	13	2026-06-29 11:30:00+00	8
2920	1	14	2026-06-29 11:30:00+00	8
2921	2	14	2026-06-29 11:30:00+00	8
2922	5	14	2026-06-29 11:30:00+00	8
2923	7	14	2026-06-29 11:30:00+00	8
2924	9	14	2026-06-29 11:30:00+00	8
2925	1	15	2026-06-29 11:30:00+00	8
2926	2	15	2026-06-29 11:30:00+00	8
2927	5	15	2026-06-29 11:30:00+00	8
2928	7	15	2026-06-29 11:30:00+00	8
2929	9	15	2026-06-29 11:30:00+00	8
2930	1	11	2026-06-30 11:30:00+00	8
2931	2	11	2026-06-30 11:30:00+00	8
2932	5	11	2026-06-30 11:30:00+00	8
2933	7	11	2026-06-30 11:30:00+00	8
2934	9	11	2026-06-30 11:30:00+00	8
2935	1	12	2026-06-30 11:30:00+00	8
2936	2	12	2026-06-30 11:30:00+00	8
2937	5	12	2026-06-30 11:30:00+00	8
2938	7	12	2026-06-30 11:30:00+00	8
2939	9	12	2026-06-30 11:30:00+00	8
2940	1	13	2026-06-30 11:30:00+00	8
2941	2	13	2026-06-30 11:30:00+00	8
2942	5	13	2026-06-30 11:30:00+00	8
2943	7	13	2026-06-30 11:30:00+00	8
2944	9	13	2026-06-30 11:30:00+00	8
2945	1	14	2026-06-30 11:30:00+00	8
2946	2	14	2026-06-30 11:30:00+00	8
2947	5	14	2026-06-30 11:30:00+00	8
2948	7	14	2026-06-30 11:30:00+00	8
2949	9	14	2026-06-30 11:30:00+00	8
2950	1	15	2026-06-30 11:30:00+00	8
2951	2	15	2026-06-30 11:30:00+00	8
2952	5	15	2026-06-30 11:30:00+00	8
2953	7	15	2026-06-30 11:30:00+00	8
2954	9	15	2026-06-30 11:30:00+00	8
2955	1	11	2026-07-01 11:30:00+00	8
2956	2	11	2026-07-01 11:30:00+00	8
2957	5	11	2026-07-01 11:30:00+00	8
2958	7	11	2026-07-01 11:30:00+00	8
2959	9	11	2026-07-01 11:30:00+00	8
2960	1	12	2026-07-01 11:30:00+00	8
2961	2	12	2026-07-01 11:30:00+00	8
2962	5	12	2026-07-01 11:30:00+00	8
2963	7	12	2026-07-01 11:30:00+00	8
2964	9	12	2026-07-01 11:30:00+00	8
2965	1	13	2026-07-01 11:30:00+00	8
2966	2	13	2026-07-01 11:30:00+00	8
2967	5	13	2026-07-01 11:30:00+00	8
2968	7	13	2026-07-01 11:30:00+00	8
2969	9	13	2026-07-01 11:30:00+00	8
2970	1	14	2026-07-01 11:30:00+00	8
2971	2	14	2026-07-01 11:30:00+00	8
2972	5	14	2026-07-01 11:30:00+00	8
2973	7	14	2026-07-01 11:30:00+00	8
2974	9	14	2026-07-01 11:30:00+00	8
2975	1	15	2026-07-01 11:30:00+00	8
2976	2	15	2026-07-01 11:30:00+00	8
2977	5	15	2026-07-01 11:30:00+00	8
2978	7	15	2026-07-01 11:30:00+00	8
2979	9	15	2026-07-01 11:30:00+00	8
2980	1	11	2026-06-25 12:00:00+00	8
2981	2	11	2026-06-25 12:00:00+00	8
2982	5	11	2026-06-25 12:00:00+00	8
2983	7	11	2026-06-25 12:00:00+00	8
2984	9	11	2026-06-25 12:00:00+00	8
2985	1	12	2026-06-25 12:00:00+00	8
2986	2	12	2026-06-25 12:00:00+00	8
2987	5	12	2026-06-25 12:00:00+00	8
2988	7	12	2026-06-25 12:00:00+00	8
2989	9	12	2026-06-25 12:00:00+00	8
2990	1	13	2026-06-25 12:00:00+00	8
2991	2	13	2026-06-25 12:00:00+00	8
2992	5	13	2026-06-25 12:00:00+00	8
2993	7	13	2026-06-25 12:00:00+00	8
2994	9	13	2026-06-25 12:00:00+00	8
2995	1	14	2026-06-25 12:00:00+00	8
2996	2	14	2026-06-25 12:00:00+00	8
2997	5	14	2026-06-25 12:00:00+00	8
2998	7	14	2026-06-25 12:00:00+00	8
2999	9	14	2026-06-25 12:00:00+00	8
3000	1	15	2026-06-25 12:00:00+00	8
3001	2	15	2026-06-25 12:00:00+00	8
3002	5	15	2026-06-25 12:00:00+00	8
3003	7	15	2026-06-25 12:00:00+00	8
3004	9	15	2026-06-25 12:00:00+00	8
3005	1	11	2026-06-26 12:00:00+00	8
3006	2	11	2026-06-26 12:00:00+00	8
3007	5	11	2026-06-26 12:00:00+00	8
3008	7	11	2026-06-26 12:00:00+00	8
3009	9	11	2026-06-26 12:00:00+00	8
3010	1	12	2026-06-26 12:00:00+00	8
3011	2	12	2026-06-26 12:00:00+00	8
3012	5	12	2026-06-26 12:00:00+00	8
3013	7	12	2026-06-26 12:00:00+00	8
3014	9	12	2026-06-26 12:00:00+00	8
3015	1	13	2026-06-26 12:00:00+00	8
3016	2	13	2026-06-26 12:00:00+00	8
3017	5	13	2026-06-26 12:00:00+00	8
3018	7	13	2026-06-26 12:00:00+00	8
3019	9	13	2026-06-26 12:00:00+00	8
3020	1	14	2026-06-26 12:00:00+00	8
3021	2	14	2026-06-26 12:00:00+00	8
3022	5	14	2026-06-26 12:00:00+00	8
3023	7	14	2026-06-26 12:00:00+00	8
3024	9	14	2026-06-26 12:00:00+00	8
3025	1	15	2026-06-26 12:00:00+00	8
3026	2	15	2026-06-26 12:00:00+00	8
3027	5	15	2026-06-26 12:00:00+00	8
3028	7	15	2026-06-26 12:00:00+00	8
3029	9	15	2026-06-26 12:00:00+00	8
3030	1	11	2026-06-27 12:00:00+00	8
3031	2	11	2026-06-27 12:00:00+00	8
3032	5	11	2026-06-27 12:00:00+00	8
3033	7	11	2026-06-27 12:00:00+00	8
3034	9	11	2026-06-27 12:00:00+00	8
3035	1	12	2026-06-27 12:00:00+00	8
3036	2	12	2026-06-27 12:00:00+00	8
3037	5	12	2026-06-27 12:00:00+00	8
3038	7	12	2026-06-27 12:00:00+00	8
3039	9	12	2026-06-27 12:00:00+00	8
3040	1	13	2026-06-27 12:00:00+00	8
3041	2	13	2026-06-27 12:00:00+00	8
3042	5	13	2026-06-27 12:00:00+00	8
3043	7	13	2026-06-27 12:00:00+00	8
3044	9	13	2026-06-27 12:00:00+00	8
3045	1	14	2026-06-27 12:00:00+00	8
3046	2	14	2026-06-27 12:00:00+00	8
3047	5	14	2026-06-27 12:00:00+00	8
3048	7	14	2026-06-27 12:00:00+00	8
3049	9	14	2026-06-27 12:00:00+00	8
3050	1	15	2026-06-27 12:00:00+00	8
3051	2	15	2026-06-27 12:00:00+00	8
3052	5	15	2026-06-27 12:00:00+00	8
3053	7	15	2026-06-27 12:00:00+00	8
3054	9	15	2026-06-27 12:00:00+00	8
3055	1	11	2026-06-28 12:00:00+00	8
3056	2	11	2026-06-28 12:00:00+00	8
3057	5	11	2026-06-28 12:00:00+00	8
3058	7	11	2026-06-28 12:00:00+00	8
3059	9	11	2026-06-28 12:00:00+00	8
3060	1	12	2026-06-28 12:00:00+00	8
3061	2	12	2026-06-28 12:00:00+00	8
3062	5	12	2026-06-28 12:00:00+00	8
3063	7	12	2026-06-28 12:00:00+00	8
3064	9	12	2026-06-28 12:00:00+00	8
3065	1	13	2026-06-28 12:00:00+00	8
3066	2	13	2026-06-28 12:00:00+00	8
3067	5	13	2026-06-28 12:00:00+00	8
3068	7	13	2026-06-28 12:00:00+00	8
3069	9	13	2026-06-28 12:00:00+00	8
3070	1	14	2026-06-28 12:00:00+00	8
3071	2	14	2026-06-28 12:00:00+00	8
3072	5	14	2026-06-28 12:00:00+00	8
3073	7	14	2026-06-28 12:00:00+00	8
3074	9	14	2026-06-28 12:00:00+00	8
3075	1	15	2026-06-28 12:00:00+00	8
3076	2	15	2026-06-28 12:00:00+00	8
3077	5	15	2026-06-28 12:00:00+00	8
3078	7	15	2026-06-28 12:00:00+00	8
3079	9	15	2026-06-28 12:00:00+00	8
3080	1	11	2026-06-29 12:00:00+00	8
3081	2	11	2026-06-29 12:00:00+00	8
3082	5	11	2026-06-29 12:00:00+00	8
3083	7	11	2026-06-29 12:00:00+00	8
3084	9	11	2026-06-29 12:00:00+00	8
3085	1	12	2026-06-29 12:00:00+00	8
3086	2	12	2026-06-29 12:00:00+00	8
3087	5	12	2026-06-29 12:00:00+00	8
3088	7	12	2026-06-29 12:00:00+00	8
3089	9	12	2026-06-29 12:00:00+00	8
3090	1	13	2026-06-29 12:00:00+00	8
3091	2	13	2026-06-29 12:00:00+00	8
3092	5	13	2026-06-29 12:00:00+00	8
3093	7	13	2026-06-29 12:00:00+00	8
3094	9	13	2026-06-29 12:00:00+00	8
3095	1	14	2026-06-29 12:00:00+00	8
3096	2	14	2026-06-29 12:00:00+00	8
3097	5	14	2026-06-29 12:00:00+00	8
3098	7	14	2026-06-29 12:00:00+00	8
3099	9	14	2026-06-29 12:00:00+00	8
3100	1	15	2026-06-29 12:00:00+00	8
3101	2	15	2026-06-29 12:00:00+00	8
3102	5	15	2026-06-29 12:00:00+00	8
3103	7	15	2026-06-29 12:00:00+00	8
3104	9	15	2026-06-29 12:00:00+00	8
3105	1	11	2026-06-30 12:00:00+00	8
3106	2	11	2026-06-30 12:00:00+00	8
3107	5	11	2026-06-30 12:00:00+00	8
3108	7	11	2026-06-30 12:00:00+00	8
3109	9	11	2026-06-30 12:00:00+00	8
3110	1	12	2026-06-30 12:00:00+00	8
3111	2	12	2026-06-30 12:00:00+00	8
3112	5	12	2026-06-30 12:00:00+00	8
3113	7	12	2026-06-30 12:00:00+00	8
3114	9	12	2026-06-30 12:00:00+00	8
3115	1	13	2026-06-30 12:00:00+00	8
3116	2	13	2026-06-30 12:00:00+00	8
3117	5	13	2026-06-30 12:00:00+00	8
3118	7	13	2026-06-30 12:00:00+00	8
3119	9	13	2026-06-30 12:00:00+00	8
3120	1	14	2026-06-30 12:00:00+00	8
3121	2	14	2026-06-30 12:00:00+00	8
3122	5	14	2026-06-30 12:00:00+00	8
3123	7	14	2026-06-30 12:00:00+00	8
3124	9	14	2026-06-30 12:00:00+00	8
3125	1	15	2026-06-30 12:00:00+00	8
3126	2	15	2026-06-30 12:00:00+00	8
3127	5	15	2026-06-30 12:00:00+00	8
3128	7	15	2026-06-30 12:00:00+00	8
3129	9	15	2026-06-30 12:00:00+00	8
3130	1	11	2026-07-01 12:00:00+00	8
3131	2	11	2026-07-01 12:00:00+00	8
3132	5	11	2026-07-01 12:00:00+00	8
3133	7	11	2026-07-01 12:00:00+00	8
3134	9	11	2026-07-01 12:00:00+00	8
3135	1	12	2026-07-01 12:00:00+00	8
3136	2	12	2026-07-01 12:00:00+00	8
3137	5	12	2026-07-01 12:00:00+00	8
3138	7	12	2026-07-01 12:00:00+00	8
3139	9	12	2026-07-01 12:00:00+00	8
3140	1	13	2026-07-01 12:00:00+00	8
3141	2	13	2026-07-01 12:00:00+00	8
3142	5	13	2026-07-01 12:00:00+00	8
3143	7	13	2026-07-01 12:00:00+00	8
3144	9	13	2026-07-01 12:00:00+00	8
3145	1	14	2026-07-01 12:00:00+00	8
3146	2	14	2026-07-01 12:00:00+00	8
3147	5	14	2026-07-01 12:00:00+00	8
3148	7	14	2026-07-01 12:00:00+00	8
3149	9	14	2026-07-01 12:00:00+00	8
3150	1	15	2026-07-01 12:00:00+00	8
3151	2	15	2026-07-01 12:00:00+00	8
3152	5	15	2026-07-01 12:00:00+00	8
3153	7	15	2026-07-01 12:00:00+00	8
3154	9	15	2026-07-01 12:00:00+00	8
3155	1	11	2026-06-25 12:30:00+00	8
3156	2	11	2026-06-25 12:30:00+00	8
3157	5	11	2026-06-25 12:30:00+00	8
3158	7	11	2026-06-25 12:30:00+00	8
3159	9	11	2026-06-25 12:30:00+00	8
3160	1	12	2026-06-25 12:30:00+00	8
3161	2	12	2026-06-25 12:30:00+00	8
3162	5	12	2026-06-25 12:30:00+00	8
3163	7	12	2026-06-25 12:30:00+00	8
3164	9	12	2026-06-25 12:30:00+00	8
3165	1	13	2026-06-25 12:30:00+00	8
3166	2	13	2026-06-25 12:30:00+00	8
3167	5	13	2026-06-25 12:30:00+00	8
3168	7	13	2026-06-25 12:30:00+00	8
3169	9	13	2026-06-25 12:30:00+00	8
3170	1	14	2026-06-25 12:30:00+00	8
3171	2	14	2026-06-25 12:30:00+00	8
3172	5	14	2026-06-25 12:30:00+00	8
3173	7	14	2026-06-25 12:30:00+00	8
3174	9	14	2026-06-25 12:30:00+00	8
3175	1	15	2026-06-25 12:30:00+00	8
3176	2	15	2026-06-25 12:30:00+00	8
3177	5	15	2026-06-25 12:30:00+00	8
3178	7	15	2026-06-25 12:30:00+00	8
3179	9	15	2026-06-25 12:30:00+00	8
3180	1	11	2026-06-26 12:30:00+00	8
3181	2	11	2026-06-26 12:30:00+00	8
3182	5	11	2026-06-26 12:30:00+00	8
3183	7	11	2026-06-26 12:30:00+00	8
3184	9	11	2026-06-26 12:30:00+00	8
3185	1	12	2026-06-26 12:30:00+00	8
3186	2	12	2026-06-26 12:30:00+00	8
3187	5	12	2026-06-26 12:30:00+00	8
3188	7	12	2026-06-26 12:30:00+00	8
3189	9	12	2026-06-26 12:30:00+00	8
3190	1	13	2026-06-26 12:30:00+00	8
3191	2	13	2026-06-26 12:30:00+00	8
3192	5	13	2026-06-26 12:30:00+00	8
3193	7	13	2026-06-26 12:30:00+00	8
3194	9	13	2026-06-26 12:30:00+00	8
3195	1	14	2026-06-26 12:30:00+00	8
3196	2	14	2026-06-26 12:30:00+00	8
3197	5	14	2026-06-26 12:30:00+00	8
3198	7	14	2026-06-26 12:30:00+00	8
3199	9	14	2026-06-26 12:30:00+00	8
3200	1	15	2026-06-26 12:30:00+00	8
3201	2	15	2026-06-26 12:30:00+00	8
3202	5	15	2026-06-26 12:30:00+00	8
3203	7	15	2026-06-26 12:30:00+00	8
3204	9	15	2026-06-26 12:30:00+00	8
3205	1	11	2026-06-27 12:30:00+00	8
3206	2	11	2026-06-27 12:30:00+00	8
3207	5	11	2026-06-27 12:30:00+00	8
3208	7	11	2026-06-27 12:30:00+00	8
3209	9	11	2026-06-27 12:30:00+00	8
3210	1	12	2026-06-27 12:30:00+00	8
3211	2	12	2026-06-27 12:30:00+00	8
3212	5	12	2026-06-27 12:30:00+00	8
3213	7	12	2026-06-27 12:30:00+00	8
3214	9	12	2026-06-27 12:30:00+00	8
3215	1	13	2026-06-27 12:30:00+00	8
3216	2	13	2026-06-27 12:30:00+00	8
3217	5	13	2026-06-27 12:30:00+00	8
3218	7	13	2026-06-27 12:30:00+00	8
3219	9	13	2026-06-27 12:30:00+00	8
3220	1	14	2026-06-27 12:30:00+00	8
3221	2	14	2026-06-27 12:30:00+00	8
3222	5	14	2026-06-27 12:30:00+00	8
3223	7	14	2026-06-27 12:30:00+00	8
3224	9	14	2026-06-27 12:30:00+00	8
3225	1	15	2026-06-27 12:30:00+00	8
3226	2	15	2026-06-27 12:30:00+00	8
3227	5	15	2026-06-27 12:30:00+00	8
3228	7	15	2026-06-27 12:30:00+00	8
3229	9	15	2026-06-27 12:30:00+00	8
3230	1	11	2026-06-28 12:30:00+00	8
3231	2	11	2026-06-28 12:30:00+00	8
3232	5	11	2026-06-28 12:30:00+00	8
3233	7	11	2026-06-28 12:30:00+00	8
3234	9	11	2026-06-28 12:30:00+00	8
3235	1	12	2026-06-28 12:30:00+00	8
3236	2	12	2026-06-28 12:30:00+00	8
3237	5	12	2026-06-28 12:30:00+00	8
3238	7	12	2026-06-28 12:30:00+00	8
3239	9	12	2026-06-28 12:30:00+00	8
3240	1	13	2026-06-28 12:30:00+00	8
3241	2	13	2026-06-28 12:30:00+00	8
3242	5	13	2026-06-28 12:30:00+00	8
3243	7	13	2026-06-28 12:30:00+00	8
3244	9	13	2026-06-28 12:30:00+00	8
3245	1	14	2026-06-28 12:30:00+00	8
3246	2	14	2026-06-28 12:30:00+00	8
3247	5	14	2026-06-28 12:30:00+00	8
3248	7	14	2026-06-28 12:30:00+00	8
3249	9	14	2026-06-28 12:30:00+00	8
3250	1	15	2026-06-28 12:30:00+00	8
3251	2	15	2026-06-28 12:30:00+00	8
3252	5	15	2026-06-28 12:30:00+00	8
3253	7	15	2026-06-28 12:30:00+00	8
3254	9	15	2026-06-28 12:30:00+00	8
3255	1	11	2026-06-29 12:30:00+00	8
3256	2	11	2026-06-29 12:30:00+00	8
3257	5	11	2026-06-29 12:30:00+00	8
3258	7	11	2026-06-29 12:30:00+00	8
3259	9	11	2026-06-29 12:30:00+00	8
3260	1	12	2026-06-29 12:30:00+00	8
3261	2	12	2026-06-29 12:30:00+00	8
3262	5	12	2026-06-29 12:30:00+00	8
3263	7	12	2026-06-29 12:30:00+00	8
3264	9	12	2026-06-29 12:30:00+00	8
3265	1	13	2026-06-29 12:30:00+00	8
3266	2	13	2026-06-29 12:30:00+00	8
3267	5	13	2026-06-29 12:30:00+00	8
3268	7	13	2026-06-29 12:30:00+00	8
3269	9	13	2026-06-29 12:30:00+00	8
3270	1	14	2026-06-29 12:30:00+00	8
3271	2	14	2026-06-29 12:30:00+00	8
3272	5	14	2026-06-29 12:30:00+00	8
3273	7	14	2026-06-29 12:30:00+00	8
3274	9	14	2026-06-29 12:30:00+00	8
3275	1	15	2026-06-29 12:30:00+00	8
3276	2	15	2026-06-29 12:30:00+00	8
3277	5	15	2026-06-29 12:30:00+00	8
3278	7	15	2026-06-29 12:30:00+00	8
3279	9	15	2026-06-29 12:30:00+00	8
3280	1	11	2026-06-30 12:30:00+00	8
3281	2	11	2026-06-30 12:30:00+00	8
3282	5	11	2026-06-30 12:30:00+00	8
3283	7	11	2026-06-30 12:30:00+00	8
3284	9	11	2026-06-30 12:30:00+00	8
3285	1	12	2026-06-30 12:30:00+00	8
3286	2	12	2026-06-30 12:30:00+00	8
3287	5	12	2026-06-30 12:30:00+00	8
3288	7	12	2026-06-30 12:30:00+00	8
3289	9	12	2026-06-30 12:30:00+00	8
3290	1	13	2026-06-30 12:30:00+00	8
3291	2	13	2026-06-30 12:30:00+00	8
3292	5	13	2026-06-30 12:30:00+00	8
3293	7	13	2026-06-30 12:30:00+00	8
3294	9	13	2026-06-30 12:30:00+00	8
3295	1	14	2026-06-30 12:30:00+00	8
3296	2	14	2026-06-30 12:30:00+00	8
3297	5	14	2026-06-30 12:30:00+00	8
3298	7	14	2026-06-30 12:30:00+00	8
3299	9	14	2026-06-30 12:30:00+00	8
3300	1	15	2026-06-30 12:30:00+00	8
3301	2	15	2026-06-30 12:30:00+00	8
3302	5	15	2026-06-30 12:30:00+00	8
3303	7	15	2026-06-30 12:30:00+00	8
3304	9	15	2026-06-30 12:30:00+00	8
3305	1	11	2026-07-01 12:30:00+00	8
3306	2	11	2026-07-01 12:30:00+00	8
3307	5	11	2026-07-01 12:30:00+00	8
3308	7	11	2026-07-01 12:30:00+00	8
3309	9	11	2026-07-01 12:30:00+00	8
3310	1	12	2026-07-01 12:30:00+00	8
3311	2	12	2026-07-01 12:30:00+00	8
3312	5	12	2026-07-01 12:30:00+00	8
3313	7	12	2026-07-01 12:30:00+00	8
3314	9	12	2026-07-01 12:30:00+00	8
3315	1	13	2026-07-01 12:30:00+00	8
3316	2	13	2026-07-01 12:30:00+00	8
3317	5	13	2026-07-01 12:30:00+00	8
3318	7	13	2026-07-01 12:30:00+00	8
3319	9	13	2026-07-01 12:30:00+00	8
3320	1	14	2026-07-01 12:30:00+00	8
3321	2	14	2026-07-01 12:30:00+00	8
3322	5	14	2026-07-01 12:30:00+00	8
3323	7	14	2026-07-01 12:30:00+00	8
3324	9	14	2026-07-01 12:30:00+00	8
3325	1	15	2026-07-01 12:30:00+00	8
3326	2	15	2026-07-01 12:30:00+00	8
3327	5	15	2026-07-01 12:30:00+00	8
3328	7	15	2026-07-01 12:30:00+00	8
3329	9	15	2026-07-01 12:30:00+00	8
\.


--
-- Data for Name: epic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.epic (id, sigle, nom, categorie, type, description, actif, cree_le) FROM stdin;
1	NETCOM	Établissement de Nettoiement et de Collecte Municipale	environnement_nettoiement	local	Collecte des déchets ménagers et nettoiement des voies publiques — zones Centre et Est d'Alger	t	2026-06-25 17:35:13.005141+00
2	EXTRANET	Établissement de Tri et Gestion des Déchets	environnement_nettoiement	local	Gestion des déchets ménagers et tri sélectif — zones Ouest et Sud	t	2026-06-25 17:35:13.005141+00
3	EDEVAL	Établissement de Développement des Espaces Verts d'Alger	environnement_nettoiement	local	Aménagement, fleurissement et gestion des pépinières de la Wilaya d'Alger	t	2026-06-25 17:35:13.005141+00
4	ECOLOH	Établissement de Gestion de l'Oued El Harrach	environnement_nettoiement	local	Gestion, aménagement et promotion du cours d'eau de l'Oued El Harrach	t	2026-06-25 17:35:13.005141+00
5	HURBAL	Établissement d'Hygiène Urbaine d'Alger	environnement_nettoiement	local	Dératisation, désinfection et démoustication sur le territoire de la Wilaya	t	2026-06-25 17:35:13.005141+00
6	AND	Agence Nationale des Déchets	environnement_nettoiement	national	Planification et traitement des déchets à l'échelle nationale	t	2026-06-25 17:35:13.005141+00
7	ASROUT	Établissement de Maintenance de la Voirie Urbaine d'Alger	voirie_eclairage_urbanisme	local	Maintenance des routes, bitumage, curage des avaloirs et réseaux pluviaux	t	2026-06-25 17:35:13.005141+00
8	ERMA	Établissement du Réseau de l'Éclairage Public et des Feux Tricolores	voirie_eclairage_urbanisme	local	Réalisation, entretien et modernisation du réseau d'éclairage public	t	2026-06-25 17:35:13.005141+00
9	RFVA	Régie Foncière de la Ville d'Alger	voirie_eclairage_urbanisme	local	Gestion du patrimoine immobilier de la wilaya, marchés publics et parkings	t	2026-06-25 17:35:13.005141+00
10	ANRU	Agence Nationale de la Rénovation Urbaine	voirie_eclairage_urbanisme	national	Réhabilitation du vieux bâti et rénovation des quartiers dégradés	t	2026-06-25 17:35:13.005141+00
11	AADL	Agence Nationale de l'Amélioration et du Développement du Logement	logement_infrastructure	national	Programme de logement Location-Vente	t	2026-06-25 17:35:13.005141+00
12	OPGI-HD	Office de Promotion et de Gestion Immobilière — Hussein Dey	logement_infrastructure	local	Logement social — périmètre nord-est d'Alger	t	2026-06-25 17:35:13.005141+00
13	OPGI-BMR	Office de Promotion et de Gestion Immobilière — Bir Mourad Raïs	logement_infrastructure	local	Logement social — périmètre centre-sud d'Alger	t	2026-06-25 17:35:13.005141+00
14	OPGI-DEB	Office de Promotion et de Gestion Immobilière — Dar El Beïda	logement_infrastructure	local	Logement social — périmètre est d'Alger	t	2026-06-25 17:35:13.005141+00
15	ANESRIF	Agence Nationale d'Études et de Suivi des Investissements Ferroviaires	logement_infrastructure	national	Maîtrise d'ouvrage déléguée pour les projets ferroviaires	t	2026-06-25 17:35:13.005141+00
16	ADA	Algérienne des Autoroutes	logement_infrastructure	national	Exploitation et maintenance du réseau autoroutier national	t	2026-06-25 17:35:13.005141+00
17	SEAAL	Société des Eaux et de l'Assainissement d'Alger	eau_energie	local	Distribution d'eau potable et traitement des eaux usées — Alger et Tipaza	t	2026-06-25 17:35:13.005141+00
18	ANTB	Agence Nationale des Barrages et Transferts	eau_energie	national	Coordination hydraulique nationale — barrages et transferts interrégionaux	t	2026-06-25 17:35:13.005141+00
19	ALNAFT	Agence Nationale pour la Valorisation des Ressources en Hydrocarbures	eau_energie	national	Régulation et valorisation des ressources en hydrocarbures	t	2026-06-25 17:35:13.005141+00
20	ALGPOST	Algérie Poste	services_transports	national	Gestion des services postaux et réseau de comptes courants CCP	t	2026-06-25 17:35:13.005141+00
21	EMA	Entreprise du Métro d'Alger	services_transports	local	Exploitation des lignes de métro, tramway et téléphériques d'Alger	t	2026-06-25 17:35:13.005141+00
22	SNTF	Société Nationale des Transports Ferroviaires	services_transports	national	Transport ferroviaire de voyageurs et de marchandises	t	2026-06-25 17:35:13.005141+00
23	SOGRAL	Société de Gestion de la Gare Routière d'Alger	services_transports	local	Gestion de la gare routière du Caroubier et des gares nationales	t	2026-06-25 17:35:13.005141+00
24	PRESCO	Établissement de Gestion des Jardins d'Enfants et Crèches Publiques	social_artisanat	local	Gestion des structures d'accueil de la petite enfance de la Wilaya	t	2026-06-25 17:35:13.005141+00
25	CACVA	Centre d'Apprentissage Coupe, Couture et Broderie d'Art	social_artisanat	local	Formation et insertion professionnelle — artisanat textile	t	2026-06-25 17:35:13.005141+00
26	OGEBC	Office National de Gestion des Biens Culturels Protégés	culture_medias_tourisme	national	Gestion de la Casbah d'Alger et des monuments historiques classés	t	2026-06-25 17:35:13.005141+00
27	ONCI	Office National de la Culture et de l'Information	culture_medias_tourisme	national	Organisation des événements culturels et gestion des infrastructures	t	2026-06-25 17:35:13.005141+00
28	ANEP	Agence Nationale d'Édition et de Publicité	culture_medias_tourisme	national	Gestion publicitaire étatique et édition officielle	t	2026-06-25 17:35:13.005141+00
29	APS	Algérie Presse Service	culture_medias_tourisme	national	Agence de presse officielle nationale	t	2026-06-25 17:35:13.005141+00
\.


--
-- Data for Name: icua_snapshot; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.icua_snapshot (id, commune_id, date_calcul, proprete, reactivite, vivre_ensemble, fluidite, engagement, icua_global) FROM stdin;
\.


--
-- Data for Name: loyer_paiement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyer_paiement (id, contrat_id, mois, montant, paye_le, mode_paiement, reference_virement, cree_le) FROM stdin;
1	1	2026-01-01	45000	2026-01-06	virement	VIR-2026-012026	2026-06-25 17:41:07.105544+00
2	1	2026-02-01	45000	2026-02-06	virement	VIR-2026-022026	2026-06-25 17:41:07.105544+00
3	1	2026-03-01	45000	2026-03-06	virement	VIR-2026-032026	2026-06-25 17:41:07.105544+00
4	1	2026-04-01	45000	2026-04-06	virement	VIR-2026-042026	2026-06-25 17:41:07.105544+00
5	1	2026-05-01	45000	2026-05-06	virement	VIR-2026-052026	2026-06-25 17:41:07.105544+00
6	1	2026-06-01	45000	2026-06-06	virement	VIR-2026-062026	2026-06-25 17:41:07.105544+00
7	3	2026-01-01	38000	2026-01-04	cheque	\N	2026-06-25 17:41:07.122288+00
8	3	2026-02-01	38000	2026-02-04	cheque	\N	2026-06-25 17:41:07.122288+00
9	3	2026-03-01	38000	2026-03-04	cheque	\N	2026-06-25 17:41:07.122288+00
\.


--
-- Data for Name: operateur; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.operateur (id, nom, domaine, contact) FROM stdin;
7	Netcom Alger	proprete	netcom@alger.dz
8	Extranet DZ	proprete	contact@extranet.dz
9	SEAAL	eau	contact@seaal.dz
10	EDEVAL	proprete	\N
11	HURBAL	proprete	\N
12	ASROUT	proprete	\N
13	ANTB	eau	\N
\.


--
-- Data for Name: operateur_perimetre; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.operateur_perimetre (operateur_id, commune_id) FROM stdin;
7	1
8	1
7	2
8	2
7	3
8	3
7	4
8	4
7	5
8	5
7	6
8	6
7	7
8	7
7	8
8	8
7	9
8	9
7	10
8	10
7	11
8	11
7	12
8	12
7	13
8	13
7	14
8	14
7	15
8	15
7	16
8	16
7	17
8	17
7	18
8	18
7	19
8	19
7	20
8	20
7	21
8	21
7	22
8	22
7	23
8	23
7	24
8	24
7	25
8	25
7	26
8	26
7	27
8	27
7	28
8	28
7	29
8	29
7	30
8	30
7	31
8	31
7	32
8	32
7	33
8	33
7	34
8	34
7	35
8	35
7	36
8	36
7	37
8	37
7	38
8	38
7	39
8	39
7	40
8	40
7	41
8	41
7	42
8	42
7	43
8	43
7	44
8	44
7	45
8	45
7	46
8	46
7	47
8	47
7	48
8	48
7	49
8	49
7	50
8	50
7	51
8	51
7	52
8	52
7	53
8	53
7	54
8	54
7	55
8	55
9	1
9	2
9	3
9	4
9	5
9	6
9	7
9	8
9	9
9	10
9	11
9	12
9	13
9	14
9	15
9	16
9	17
9	18
9	19
9	20
9	21
9	22
9	23
9	24
9	25
9	26
9	27
9	28
9	29
9	30
9	31
9	32
9	33
9	34
9	35
9	36
9	37
9	38
9	39
9	40
9	41
9	42
9	43
9	44
9	45
9	46
9	47
9	48
9	49
9	50
9	51
9	52
9	53
9	54
9	55
\.


--
-- Data for Name: points_journal; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.points_journal (id, citoyen_id, delta, motif, ref_type, ref_id, le) FROM stdin;
1	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement créé	signalement	98556087-87ee-4ad2-8f74-935bc6c99e7e	2026-06-25 15:12:38.806835+00
2	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement propreté créé	signalement	\N	2026-06-25 17:41:07.155645+00
3	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement eau créé	signalement	\N	2026-06-25 17:41:07.155645+00
4	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	50	Signalement résolu — bonus citoyen actif	signalement	\N	2026-06-25 17:41:07.155645+00
5	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	30	Participation aux signalements du mois	signalement	\N	2026-06-25 17:41:07.155645+00
6	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	50	Prime engagement civique — juin 2026	signalement	\N	2026-06-25 17:41:07.155645+00
7	6a66fe3a-b531-409d-a02b-d8128f581a27	10	Signalement créé	signalement	7229529b-bc13-4216-b2b7-e54aa78c5a09	2026-06-25 18:16:28.151191+00
\.


--
-- Data for Name: rdv; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.rdv (id, creneau_id, citoyen_id, numero_ticket, statut, cree_le, maj_le) FROM stdin;
8552ce49-d7d0-41b0-9041-8c910ba7ffc8	1957	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	1	reserve	2026-06-25 17:41:06.997292+00	2026-06-25 17:41:06.997292+00
fefa6446-60d7-4bba-bb69-165a2f7ee253	1958	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2	reserve	2026-06-25 17:41:06.997292+00	2026-06-25 17:41:06.997292+00
60dac8a5-9e32-435d-9c0c-784354c030f2	1955	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	3	reserve	2026-06-25 17:41:06.997292+00	2026-06-25 17:41:06.997292+00
83a47a7c-8f6c-4643-bd41-1d3c9ddf19ed	1956	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	4	reserve	2026-06-25 17:41:06.997292+00	2026-06-25 17:41:06.997292+00
3da83270-30d1-4ec5-a607-ba8396e07fc9	1959	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	5	reserve	2026-06-25 17:41:06.997292+00	2026-06-25 17:41:06.997292+00
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.service (id, nom, famille, duree_min) FROM stdin;
9	Extrait de naissance	A	0
10	Certificat de résidence	A	0
11	Carte nationale d'identité	B	30
12	Passeport	B	45
13	Permis de construire	B	60
14	Légalisation de signature	B	15
15	Carte d'invalidité	B	30
16	Fiche familiale	A	0
\.


--
-- Data for Name: signalement; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.signalement (id, reference, domaine, categorie_id, citoyen_id, commune_id, operateur_id, lat, lng, description, photo_path, etat, preuve_path, cree_le, resolu_le) FROM stdin;
98556087-87ee-4ad2-8f74-935bc6c99e7e	PRO-5ITYJ5A2	proprete	1	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	13	7	41.893984	-1.408013	Poubelle sauvage depuis 3 jours	uploads/4199f5244f30ff5caaec6bebe292fc65	recu	\N	2026-06-25 15:12:38.806835+00	\N
73d2c9e7-02ff-4666-98d7-b54f8be86a75	PRO-ALG001	proprete	1	\N	1	7	36.7372	3.0465	Dépôt sauvage de déchets devant le marché Clauzel	\N	resolu	\N	2026-06-10 17:41:06.880348+00	2026-06-15 17:41:06.880348+00
5b73dc8c-9ca1-464a-bf7e-cb9bd0b8eeb2	PRO-ALG002	proprete	2	\N	1	7	36.749	3.0591	Benne débordante rue Didouche Mourad	\N	en_intervention	\N	2026-06-20 17:41:06.880348+00	\N
56ca7610-fd09-462a-88a9-e3cb240f231e	PRO-ALG003	proprete	5	\N	2	7	36.7358	3.068	Nid de poule dangereux avenue de la Bouzareah	\N	transmis	\N	2026-06-17 17:41:06.880348+00	\N
368327c4-9935-43eb-acae-c53c09692116	PRO-ALG004	proprete	6	\N	4	7	36.784	3.06	Éclairage défaillant ruelle de la Casbah	\N	recu	\N	2026-06-23 17:41:06.880348+00	\N
c5b5c3dd-c8d2-4728-9c35-4348dab9e842	PRO-ALG005	proprete	3	\N	7	8	36.772	3.0441	Encombrants abandonnés rue Tripoli Bab El Oued	\N	resolu	\N	2026-06-05 17:41:06.880348+00	2026-06-11 17:41:06.880348+00
5659229c-7ff6-4559-b642-1e326d905f45	PRO-ALG006	proprete	4	\N	3	7	36.721	3.055	Graffitis sur le mur de l'école El Madania	\N	transmis	\N	2026-06-19 17:41:06.880348+00	\N
4a9b3e88-bf06-4f5c-988b-afe1c6b2e7a0	PRO-ALG007	proprete	1	\N	9	8	36.6985	3.078	Dépôt sauvage carrefour Bir Mourad Raïs	\N	en_intervention	\N	2026-06-22 17:41:06.880348+00	\N
f4dd1d58-d50d-48e7-b6d1-daddfb82fe97	PRO-ALG008	proprete	2	\N	5	7	36.741	3.109	Benne saturée avenue des Frères Bouadou Hussein Dey	\N	recu	\N	2026-06-24 17:41:06.880348+00	\N
52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	PRO-ALG009	proprete	5	\N	12	8	36.755	3.042	Voirie dégradée El Mouradia près de la wilaya	\N	resolu	\N	2026-05-26 17:41:06.880348+00	2026-06-03 17:41:06.880348+00
a44c1b61-3670-439d-8dca-f4c4b6ebb8b5	PRO-ALG010	proprete	6	\N	11	7	36.763	3.035	Lampadaires éteints boulevard El Biar	\N	transmis	\N	2026-06-21 17:41:06.880348+00	\N
f6296867-9b42-4f8d-9063-ce76413732b2	EAU-ALG001	eau	8	\N	1	9	36.738	3.048	Fuite importante rue Ben M'hidi centre	\N	resolu	\N	2026-06-13 17:41:06.916554+00	2026-06-17 17:41:06.916554+00
039da10a-dd9d-41e1-ad11-65fefc489239	EAU-ALG002	eau	9	\N	4	9	36.785	3.061	Coupure d'eau totale quartier haute Casbah depuis 48h	\N	en_intervention	\N	2026-06-23 17:41:06.916554+00	\N
989eadf9-0ac7-4d6c-a88b-596f220d5102	EAU-ALG003	eau	12	\N	7	9	36.77	3.046	Pression insuffisante rue Montaigne Bab El Oued	\N	recu	\N	2026-06-24 17:41:06.916554+00	\N
8f9ffe38-5cbc-4c0f-b309-8a76c8ebf159	EAU-ALG004	eau	13	\N	2	9	36.734	3.07	Refoulement égout avenue Belouizdad	\N	transmis	\N	2026-06-18 17:41:06.916554+00	\N
943071a6-f3dc-4b79-a568-8ca8d6f828aa	EAU-ALG005	eau	11	\N	5	9	36.746	3.11	Fuite compteur résidence El Amel Hussein Dey	\N	resolu	\N	2026-06-07 17:41:06.916554+00	2026-06-12 17:41:06.916554+00
8d7eea34-6238-4d42-8623-a95f8f3107c6	EAU-ALG006	eau	10	\N	3	9	36.718	3.053	Eau jaunâtre signalée dans la cité El Madania	\N	en_intervention	\N	2026-06-22 17:41:06.916554+00	\N
6a52fe9f-0956-4ca9-9ffa-f64e23c25e1d	EAU-ALG007	eau	8	\N	9	13	36.696	3.08	Fuite conduite principale Bir Mourad Raïs carrefour RN1	\N	recu	\N	2026-06-25 11:41:06.916554+00	\N
7229529b-bc13-4216-b2b7-e54aa78c5a09	PRO-PX4N2EDO	proprete	2	6a66fe3a-b531-409d-a02b-d8128f581a27	34	7	36.782822	2.959902	buhuhu	\N	recu	\N	2026-06-25 18:16:28.151191+00	\N
\.


--
-- Data for Name: signalement_historique; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.signalement_historique (id, signalement_id, etat, par_utilisateur, le) FROM stdin;
1	98556087-87ee-4ad2-8f74-935bc6c99e7e	recu	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2026-06-25 15:12:38.806835+00
2	73d2c9e7-02ff-4666-98d7-b54f8be86a75	recu	\N	2026-06-10 17:41:06.880348+00
3	5b73dc8c-9ca1-464a-bf7e-cb9bd0b8eeb2	recu	\N	2026-06-20 17:41:06.880348+00
4	56ca7610-fd09-462a-88a9-e3cb240f231e	recu	\N	2026-06-17 17:41:06.880348+00
5	368327c4-9935-43eb-acae-c53c09692116	recu	\N	2026-06-23 17:41:06.880348+00
6	c5b5c3dd-c8d2-4728-9c35-4348dab9e842	recu	\N	2026-06-05 17:41:06.880348+00
7	5659229c-7ff6-4559-b642-1e326d905f45	recu	\N	2026-06-19 17:41:06.880348+00
8	4a9b3e88-bf06-4f5c-988b-afe1c6b2e7a0	recu	\N	2026-06-22 17:41:06.880348+00
9	f4dd1d58-d50d-48e7-b6d1-daddfb82fe97	recu	\N	2026-06-24 17:41:06.880348+00
10	52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	recu	\N	2026-05-26 17:41:06.880348+00
11	a44c1b61-3670-439d-8dca-f4c4b6ebb8b5	recu	\N	2026-06-21 17:41:06.880348+00
12	f6296867-9b42-4f8d-9063-ce76413732b2	recu	\N	2026-06-13 17:41:06.916554+00
13	039da10a-dd9d-41e1-ad11-65fefc489239	recu	\N	2026-06-23 17:41:06.916554+00
14	989eadf9-0ac7-4d6c-a88b-596f220d5102	recu	\N	2026-06-24 17:41:06.916554+00
15	8f9ffe38-5cbc-4c0f-b309-8a76c8ebf159	recu	\N	2026-06-18 17:41:06.916554+00
16	943071a6-f3dc-4b79-a568-8ca8d6f828aa	recu	\N	2026-06-07 17:41:06.916554+00
17	8d7eea34-6238-4d42-8623-a95f8f3107c6	recu	\N	2026-06-22 17:41:06.916554+00
18	6a52fe9f-0956-4ca9-9ffa-f64e23c25e1d	recu	\N	2026-06-25 11:41:06.916554+00
19	73d2c9e7-02ff-4666-98d7-b54f8be86a75	transmis	\N	2026-06-10 19:41:06.880348+00
20	5b73dc8c-9ca1-464a-bf7e-cb9bd0b8eeb2	transmis	\N	2026-06-20 19:41:06.880348+00
21	56ca7610-fd09-462a-88a9-e3cb240f231e	transmis	\N	2026-06-17 19:41:06.880348+00
22	c5b5c3dd-c8d2-4728-9c35-4348dab9e842	transmis	\N	2026-06-05 19:41:06.880348+00
23	5659229c-7ff6-4559-b642-1e326d905f45	transmis	\N	2026-06-19 19:41:06.880348+00
24	4a9b3e88-bf06-4f5c-988b-afe1c6b2e7a0	transmis	\N	2026-06-22 19:41:06.880348+00
25	52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	transmis	\N	2026-05-26 19:41:06.880348+00
26	a44c1b61-3670-439d-8dca-f4c4b6ebb8b5	transmis	\N	2026-06-21 19:41:06.880348+00
27	f6296867-9b42-4f8d-9063-ce76413732b2	transmis	\N	2026-06-13 19:41:06.916554+00
28	039da10a-dd9d-41e1-ad11-65fefc489239	transmis	\N	2026-06-23 19:41:06.916554+00
29	8f9ffe38-5cbc-4c0f-b309-8a76c8ebf159	transmis	\N	2026-06-18 19:41:06.916554+00
30	943071a6-f3dc-4b79-a568-8ca8d6f828aa	transmis	\N	2026-06-07 19:41:06.916554+00
31	8d7eea34-6238-4d42-8623-a95f8f3107c6	transmis	\N	2026-06-22 19:41:06.916554+00
32	73d2c9e7-02ff-4666-98d7-b54f8be86a75	en_intervention	\N	2026-06-11 05:41:06.880348+00
33	5b73dc8c-9ca1-464a-bf7e-cb9bd0b8eeb2	en_intervention	\N	2026-06-21 05:41:06.880348+00
34	c5b5c3dd-c8d2-4728-9c35-4348dab9e842	en_intervention	\N	2026-06-06 05:41:06.880348+00
35	4a9b3e88-bf06-4f5c-988b-afe1c6b2e7a0	en_intervention	\N	2026-06-23 05:41:06.880348+00
36	52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	en_intervention	\N	2026-05-27 05:41:06.880348+00
37	f6296867-9b42-4f8d-9063-ce76413732b2	en_intervention	\N	2026-06-14 05:41:06.916554+00
38	039da10a-dd9d-41e1-ad11-65fefc489239	en_intervention	\N	2026-06-24 05:41:06.916554+00
39	943071a6-f3dc-4b79-a568-8ca8d6f828aa	en_intervention	\N	2026-06-08 05:41:06.916554+00
40	8d7eea34-6238-4d42-8623-a95f8f3107c6	en_intervention	\N	2026-06-23 05:41:06.916554+00
41	73d2c9e7-02ff-4666-98d7-b54f8be86a75	resolu	\N	2026-06-15 17:41:06.880348+00
42	c5b5c3dd-c8d2-4728-9c35-4348dab9e842	resolu	\N	2026-06-11 17:41:06.880348+00
43	52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	resolu	\N	2026-06-03 17:41:06.880348+00
44	f6296867-9b42-4f8d-9063-ce76413732b2	resolu	\N	2026-06-17 17:41:06.916554+00
45	943071a6-f3dc-4b79-a568-8ca8d6f828aa	resolu	\N	2026-06-12 17:41:06.916554+00
46	7229529b-bc13-4216-b2b7-e54aa78c5a09	recu	6a66fe3a-b531-409d-a02b-d8128f581a27	2026-06-25 18:16:28.151191+00
\.


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.utilisateur (id, telephone, email, nom, prenom, mot_de_passe, role, commune_id, operateur_id, points, actif, cree_le) FROM stdin;
28497fb4-33a5-498a-9880-d5fa36bb4a8a	0550000002	youcef@test.dz	Kaci	Youcef	$2a$12$hrKprTTohZAbPbjpfMoOUuMuMDBOUlLo5ZhMAo/UxbVB2.01NXWpy	agent	2	\N	0	t	2026-06-24 17:17:41.378939+00
29e9c386-5cb1-45cf-8318-776c18dab7e5	0550000004	\N	Hadj	Mourad	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	admin_apc	1	\N	0	t	2026-06-25 15:57:51.479867+00
55c0591b-aeda-4d21-8c82-aa0a48b63643	0550000005	\N	Brahimi	Karim	$2a$12$fuJadnbYmLYp7ksFvUVkueo/M3mIOEOiQnJV5X/kN8g9qLlbQBUPW	operateur	1	7	0	t	2026-06-25 17:28:41.42864+00
61dbe80a-d290-438b-8fe6-20ea3c4e898f	0550000006	\N	Aissaoui	Nadia	$2a$12$fuJadnbYmLYp7ksFvUVkueo/M3mIOEOiQnJV5X/kN8g9qLlbQBUPW	operateur	1	9	0	t	2026-06-25 17:28:41.42864+00
624db3e9-3bcc-4087-8ce2-6acfc3f265a7	0550000001	amina@test.dz	Benali	Amina	$2a$12$igZ2zxFZ4mi8sB853pkgCe/DwcsWbZM.dGKG6lCbi63NpBZDxZnbK	citoyen	1	\N	150	t	2026-06-24 17:17:46.654089+00
6a66fe3a-b531-409d-a02b-d8128f581a27	0550000003	rachid@test.dz	Mansouri	Rachid	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	admin_wilaya	1	\N	10	t	2026-06-24 17:17:41.378939+00
\.


--
-- Name: bien_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bien_historique_id_seq', 1, true);


--
-- Name: bien_immobilier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bien_immobilier_id_seq', 14, true);


--
-- Name: categorie_signal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.categorie_signal_id_seq', 14, true);


--
-- Name: commune_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.commune_id_seq', 55, true);


--
-- Name: contrat_occupation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contrat_occupation_id_seq', 5, true);


--
-- Name: creneau_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.creneau_id_seq', 3329, true);


--
-- Name: epic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.epic_id_seq', 29, true);


--
-- Name: icua_snapshot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.icua_snapshot_id_seq', 1, false);


--
-- Name: loyer_paiement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loyer_paiement_id_seq', 9, true);


--
-- Name: operateur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.operateur_id_seq', 13, true);


--
-- Name: points_journal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.points_journal_id_seq', 7, true);


--
-- Name: service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.service_id_seq', 16, true);


--
-- Name: signalement_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.signalement_historique_id_seq', 46, true);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (nom);


--
-- Name: bien_historique bien_historique_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_historique
    ADD CONSTRAINT bien_historique_pkey PRIMARY KEY (id);


--
-- Name: bien_immobilier bien_immobilier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_immobilier
    ADD CONSTRAINT bien_immobilier_pkey PRIMARY KEY (id);


--
-- Name: bien_immobilier bien_immobilier_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_immobilier
    ADD CONSTRAINT bien_immobilier_reference_key UNIQUE (reference);


--
-- Name: categorie_signal categorie_signal_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.categorie_signal
    ADD CONSTRAINT categorie_signal_pkey PRIMARY KEY (id);


--
-- Name: circonscription circonscription_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.circonscription
    ADD CONSTRAINT circonscription_pkey PRIMARY KEY (id);


--
-- Name: commune commune_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.commune
    ADD CONSTRAINT commune_pkey PRIMARY KEY (id);


--
-- Name: contrat_occupation contrat_occupation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrat_occupation
    ADD CONSTRAINT contrat_occupation_pkey PRIMARY KEY (id);


--
-- Name: creneau creneau_commune_id_service_id_debut_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.creneau
    ADD CONSTRAINT creneau_commune_id_service_id_debut_key UNIQUE (commune_id, service_id, debut);


--
-- Name: creneau creneau_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.creneau
    ADD CONSTRAINT creneau_pkey PRIMARY KEY (id);


--
-- Name: epic epic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.epic
    ADD CONSTRAINT epic_pkey PRIMARY KEY (id);


--
-- Name: epic epic_sigle_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.epic
    ADD CONSTRAINT epic_sigle_key UNIQUE (sigle);


--
-- Name: icua_snapshot icua_snapshot_commune_id_date_calcul_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.icua_snapshot
    ADD CONSTRAINT icua_snapshot_commune_id_date_calcul_key UNIQUE (commune_id, date_calcul);


--
-- Name: icua_snapshot icua_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.icua_snapshot
    ADD CONSTRAINT icua_snapshot_pkey PRIMARY KEY (id);


--
-- Name: loyer_paiement loyer_paiement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyer_paiement
    ADD CONSTRAINT loyer_paiement_pkey PRIMARY KEY (id);


--
-- Name: operateur_perimetre operateur_perimetre_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.operateur_perimetre
    ADD CONSTRAINT operateur_perimetre_pkey PRIMARY KEY (operateur_id, commune_id);


--
-- Name: operateur operateur_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.operateur
    ADD CONSTRAINT operateur_pkey PRIMARY KEY (id);


--
-- Name: points_journal points_journal_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.points_journal
    ADD CONSTRAINT points_journal_pkey PRIMARY KEY (id);


--
-- Name: rdv rdv_creneau_id_numero_ticket_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.rdv
    ADD CONSTRAINT rdv_creneau_id_numero_ticket_key UNIQUE (creneau_id, numero_ticket);


--
-- Name: rdv rdv_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.rdv
    ADD CONSTRAINT rdv_pkey PRIMARY KEY (id);


--
-- Name: service service_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_pkey PRIMARY KEY (id);


--
-- Name: signalement_historique signalement_historique_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement_historique
    ADD CONSTRAINT signalement_historique_pkey PRIMARY KEY (id);


--
-- Name: signalement signalement_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_pkey PRIMARY KEY (id);


--
-- Name: signalement signalement_reference_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_reference_key UNIQUE (reference);


--
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);


--
-- Name: utilisateur utilisateur_telephone_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_telephone_key UNIQUE (telephone);


--
-- Name: idx_bien_commune; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bien_commune ON public.bien_immobilier USING btree (commune_id);


--
-- Name: idx_bien_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bien_statut ON public.bien_immobilier USING btree (statut);


--
-- Name: idx_categorie_domaine; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_categorie_domaine ON public.categorie_signal USING btree (domaine);


--
-- Name: idx_contrat_actif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contrat_actif ON public.contrat_occupation USING btree (actif);


--
-- Name: idx_contrat_bien; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contrat_bien ON public.contrat_occupation USING btree (bien_id);


--
-- Name: idx_creneau_lookup; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_creneau_lookup ON public.creneau USING btree (commune_id, service_id, debut);


--
-- Name: idx_histo_signal; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_histo_signal ON public.signalement_historique USING btree (signalement_id);


--
-- Name: idx_points_citoyen; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_points_citoyen ON public.points_journal USING btree (citoyen_id);


--
-- Name: idx_rdv_citoyen; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_rdv_citoyen ON public.rdv USING btree (citoyen_id);


--
-- Name: idx_rdv_statut; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_rdv_statut ON public.rdv USING btree (statut);


--
-- Name: idx_signal_commune; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_signal_commune ON public.signalement USING btree (commune_id);


--
-- Name: idx_signal_domaine_etat; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_signal_domaine_etat ON public.signalement USING btree (domaine, etat);


--
-- Name: idx_signal_geo; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_signal_geo ON public.signalement USING btree (lat, lng);


--
-- Name: idx_utilisateur_role; Type: INDEX; Schema: public; Owner: civismart
--

CREATE INDEX idx_utilisateur_role ON public.utilisateur USING btree (role);


--
-- Name: bien_historique bien_historique_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_historique
    ADD CONSTRAINT bien_historique_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.utilisateur(id);


--
-- Name: bien_historique bien_historique_bien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_historique
    ADD CONSTRAINT bien_historique_bien_id_fkey FOREIGN KEY (bien_id) REFERENCES public.bien_immobilier(id) ON DELETE CASCADE;


--
-- Name: bien_immobilier bien_immobilier_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_immobilier
    ADD CONSTRAINT bien_immobilier_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: commune commune_circonscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.commune
    ADD CONSTRAINT commune_circonscription_id_fkey FOREIGN KEY (circonscription_id) REFERENCES public.circonscription(id);


--
-- Name: contrat_occupation contrat_occupation_bien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrat_occupation
    ADD CONSTRAINT contrat_occupation_bien_id_fkey FOREIGN KEY (bien_id) REFERENCES public.bien_immobilier(id) ON DELETE CASCADE;


--
-- Name: creneau creneau_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.creneau
    ADD CONSTRAINT creneau_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: creneau creneau_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.creneau
    ADD CONSTRAINT creneau_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- Name: icua_snapshot icua_snapshot_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.icua_snapshot
    ADD CONSTRAINT icua_snapshot_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: loyer_paiement loyer_paiement_contrat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyer_paiement
    ADD CONSTRAINT loyer_paiement_contrat_id_fkey FOREIGN KEY (contrat_id) REFERENCES public.contrat_occupation(id) ON DELETE CASCADE;


--
-- Name: operateur_perimetre operateur_perimetre_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.operateur_perimetre
    ADD CONSTRAINT operateur_perimetre_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: operateur_perimetre operateur_perimetre_operateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.operateur_perimetre
    ADD CONSTRAINT operateur_perimetre_operateur_id_fkey FOREIGN KEY (operateur_id) REFERENCES public.operateur(id);


--
-- Name: points_journal points_journal_citoyen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.points_journal
    ADD CONSTRAINT points_journal_citoyen_id_fkey FOREIGN KEY (citoyen_id) REFERENCES public.utilisateur(id);


--
-- Name: rdv rdv_citoyen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.rdv
    ADD CONSTRAINT rdv_citoyen_id_fkey FOREIGN KEY (citoyen_id) REFERENCES public.utilisateur(id);


--
-- Name: rdv rdv_creneau_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.rdv
    ADD CONSTRAINT rdv_creneau_id_fkey FOREIGN KEY (creneau_id) REFERENCES public.creneau(id);


--
-- Name: signalement signalement_categorie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_categorie_id_fkey FOREIGN KEY (categorie_id) REFERENCES public.categorie_signal(id);


--
-- Name: signalement signalement_citoyen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_citoyen_id_fkey FOREIGN KEY (citoyen_id) REFERENCES public.utilisateur(id);


--
-- Name: signalement signalement_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: signalement_historique signalement_historique_par_utilisateur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement_historique
    ADD CONSTRAINT signalement_historique_par_utilisateur_fkey FOREIGN KEY (par_utilisateur) REFERENCES public.utilisateur(id);


--
-- Name: signalement_historique signalement_historique_signalement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement_historique
    ADD CONSTRAINT signalement_historique_signalement_id_fkey FOREIGN KEY (signalement_id) REFERENCES public.signalement(id) ON DELETE CASCADE;


--
-- Name: signalement signalement_operateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_operateur_id_fkey FOREIGN KEY (operateur_id) REFERENCES public.operateur(id);


--
-- Name: utilisateur utilisateur_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: utilisateur utilisateur_operateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_operateur_id_fkey FOREIGN KEY (operateur_id) REFERENCES public.operateur(id);


--
-- Name: TABLE bien_historique; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bien_historique TO civismart;


--
-- Name: SEQUENCE bien_historique_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bien_historique_id_seq TO civismart;


--
-- Name: TABLE bien_immobilier; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bien_immobilier TO civismart;


--
-- Name: SEQUENCE bien_immobilier_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bien_immobilier_id_seq TO civismart;


--
-- Name: TABLE contrat_occupation; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contrat_occupation TO civismart;


--
-- Name: SEQUENCE contrat_occupation_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.contrat_occupation_id_seq TO civismart;


--
-- Name: TABLE epic; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.epic TO civismart;


--
-- Name: SEQUENCE epic_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.epic_id_seq TO civismart;


--
-- Name: TABLE loyer_paiement; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.loyer_paiement TO civismart;


--
-- Name: SEQUENCE loyer_paiement_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.loyer_paiement_id_seq TO civismart;


--
-- PostgreSQL database dump complete
--

\unrestrict WROn1QXaDOr0H3bbf4dcFmR8l2lz6KaaJSqaFGeSAH0Hlf3lNPWNtiNwoQMiZ0B

