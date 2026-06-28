--
-- PostgreSQL database dump
--

\restrict AbhiaKe42yY9R0cZMMX2dYJqvJ4VqNEfo30jAOikvHbMPyaDzlnx2AZwXo79BEd

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
-- Name: cap_priorite; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.cap_priorite AS ENUM (
    'basse',
    'normale',
    'haute',
    'urgente'
);


ALTER TYPE public.cap_priorite OWNER TO civismart;

--
-- Name: cap_specialisation; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.cap_specialisation AS ENUM (
    'stationnement',
    'jeunesse',
    'sport',
    'general'
);


ALTER TYPE public.cap_specialisation OWNER TO civismart;

--
-- Name: cap_type_intervention; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.cap_type_intervention AS ENUM (
    'orientation',
    'mediation',
    'constat',
    'accompagnement',
    'autre'
);


ALTER TYPE public.cap_type_intervention OWNER TO civismart;

--
-- Name: carte_resident_statut; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.carte_resident_statut AS ENUM (
    'active',
    'expiree',
    'revoquee'
);


ALTER TYPE public.carte_resident_statut OWNER TO civismart;

--
-- Name: commune_zone; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.commune_zone AS ENUM (
    'centre',
    'peripherie'
);


ALTER TYPE public.commune_zone OWNER TO civismart;

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
-- Name: justificatif_type; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.justificatif_type AS ENUM (
    'ticket',
    'bon',
    'facture',
    'recu_mobile'
);


ALTER TYPE public.justificatif_type OWNER TO civismart;

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
-- Name: parking_zone_type; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.parking_zone_type AS ENUM (
    'blanche',
    'bleue',
    'jaune',
    'rouge'
);


ALTER TYPE public.parking_zone_type OWNER TO civismart;

--
-- Name: public_prioritaire; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.public_prioritaire AS ENUM (
    'age',
    'handicap',
    'femme_enceinte'
);


ALTER TYPE public.public_prioritaire OWNER TO civismart;

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
    'eau',
    'general'
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
-- Name: signal_gravite; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.signal_gravite AS ENUM (
    'danger_immediat',
    'risque_blessure',
    'degradation'
);


ALTER TYPE public.signal_gravite OWNER TO civismart;

--
-- Name: type_encaisseur; Type: TYPE; Schema: public; Owner: civismart
--

CREATE TYPE public.type_encaisseur AS ENUM (
    'kiosque',
    'buraliste',
    'agent_tpe',
    'mobile',
    'autre'
);


ALTER TYPE public.type_encaisseur OWNER TO civismart;

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
-- Name: badge; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.badge (
    id integer NOT NULL,
    code text NOT NULL,
    nom text NOT NULL,
    description text,
    icone text DEFAULT '🏅'::text,
    condition_type text NOT NULL,
    condition_seuil integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.badge OWNER TO civismart;

--
-- Name: badge_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.badge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.badge_id_seq OWNER TO civismart;

--
-- Name: badge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.badge_id_seq OWNED BY public.badge.id;


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
-- Name: cap_agent; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.cap_agent (
    id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    specialisation public.cap_specialisation DEFAULT 'general'::public.cap_specialisation NOT NULL,
    commune_id integer,
    secteur text,
    actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    parking_zone_id integer
);


ALTER TABLE public.cap_agent OWNER TO civismart;

--
-- Name: cap_agent_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.cap_agent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cap_agent_id_seq OWNER TO civismart;

--
-- Name: cap_agent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.cap_agent_id_seq OWNED BY public.cap_agent.id;


--
-- Name: cap_intervention; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.cap_intervention (
    id integer NOT NULL,
    reference text NOT NULL,
    agent_id integer NOT NULL,
    type public.cap_type_intervention NOT NULL,
    priorite public.cap_priorite DEFAULT 'normale'::public.cap_priorite NOT NULL,
    description text NOT NULL,
    lat double precision,
    lng double precision,
    commune_id integer,
    citoyen_id uuid,
    signalement_id uuid,
    alerte_superviseur boolean DEFAULT false NOT NULL,
    motif_alerte text,
    etat text DEFAULT 'en_cours'::text NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    termine_le timestamp with time zone,
    notes text,
    CONSTRAINT cap_intervention_etat_check CHECK ((etat = ANY (ARRAY['en_cours'::text, 'termine'::text, 'annule'::text])))
);


ALTER TABLE public.cap_intervention OWNER TO civismart;

--
-- Name: cap_intervention_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.cap_intervention_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cap_intervention_id_seq OWNER TO civismart;

--
-- Name: cap_intervention_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.cap_intervention_id_seq OWNED BY public.cap_intervention.id;


--
-- Name: carte_resident; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.carte_resident (
    id integer NOT NULL,
    citoyen_id uuid NOT NULL,
    commune_id integer NOT NULL,
    plaque text,
    justif_residence boolean DEFAULT false NOT NULL,
    statut public.carte_resident_statut DEFAULT 'active'::public.carte_resident_statut NOT NULL,
    valide_jusqu_a date NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carte_resident OWNER TO civismart;

--
-- Name: carte_resident_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.carte_resident_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carte_resident_id_seq OWNER TO civismart;

--
-- Name: carte_resident_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.carte_resident_id_seq OWNED BY public.carte_resident.id;


--
-- Name: categorie_signal; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.categorie_signal (
    id integer NOT NULL,
    domaine public.signal_domaine NOT NULL,
    libelle text NOT NULL,
    criticite public.signal_criticite DEFAULT 'moyenne'::public.signal_criticite NOT NULL,
    epic_id integer,
    famille text
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
    centre_lng double precision,
    zone public.commune_zone DEFAULT 'centre'::public.commune_zone NOT NULL
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
-- Name: iqep; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.iqep (
    parc_id integer NOT NULL,
    note_auto smallint DEFAULT 100 NOT NULL,
    note_manuelle smallint,
    sc_espaces_verts smallint,
    sc_equipements smallint,
    sc_proprete smallint,
    sc_eclairage smallint,
    sc_securite smallint,
    sc_satisfaction smallint,
    maj_le timestamp with time zone DEFAULT now() NOT NULL,
    maj_par uuid,
    CONSTRAINT iqep_note_auto_check CHECK (((note_auto >= 0) AND (note_auto <= 100))),
    CONSTRAINT iqep_note_manuelle_check CHECK (((note_manuelle IS NULL) OR ((note_manuelle >= 0) AND (note_manuelle <= 100)))),
    CONSTRAINT iqep_sc_eclairage_check CHECK (((sc_eclairage IS NULL) OR ((sc_eclairage >= 0) AND (sc_eclairage <= 100)))),
    CONSTRAINT iqep_sc_equipements_check CHECK (((sc_equipements IS NULL) OR ((sc_equipements >= 0) AND (sc_equipements <= 100)))),
    CONSTRAINT iqep_sc_espaces_verts_check CHECK (((sc_espaces_verts IS NULL) OR ((sc_espaces_verts >= 0) AND (sc_espaces_verts <= 100)))),
    CONSTRAINT iqep_sc_proprete_check CHECK (((sc_proprete IS NULL) OR ((sc_proprete >= 0) AND (sc_proprete <= 100)))),
    CONSTRAINT iqep_sc_satisfaction_check CHECK (((sc_satisfaction IS NULL) OR ((sc_satisfaction >= 0) AND (sc_satisfaction <= 100)))),
    CONSTRAINT iqep_sc_securite_check CHECK (((sc_securite IS NULL) OR ((sc_securite >= 0) AND (sc_securite <= 100))))
);


ALTER TABLE public.iqep OWNER TO civismart;

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
-- Name: parc; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.parc (
    id integer NOT NULL,
    nom text NOT NULL,
    commune_id integer,
    lat double precision,
    lng double precision,
    superficie real,
    actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.parc OWNER TO civismart;

--
-- Name: parc_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.parc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parc_id_seq OWNER TO civismart;

--
-- Name: parc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.parc_id_seq OWNED BY public.parc.id;


--
-- Name: parking_encaissement; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.parking_encaissement (
    id integer NOT NULL,
    parking_zone_id integer NOT NULL,
    montant numeric(8,2) NOT NULL,
    duree_minutes integer,
    date_heure timestamp with time zone DEFAULT now() NOT NULL,
    type_encaisseur public.type_encaisseur DEFAULT 'autre'::public.type_encaisseur NOT NULL,
    encaisseur_ref text,
    justificatif_type public.justificatif_type DEFAULT 'ticket'::public.justificatif_type NOT NULL,
    justificatif_numero text NOT NULL,
    numero_sequence integer NOT NULL,
    plaque text,
    citoyen_id uuid,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.parking_encaissement OWNER TO civismart;

--
-- Name: parking_encaissement_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.parking_encaissement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parking_encaissement_id_seq OWNER TO civismart;

--
-- Name: parking_encaissement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.parking_encaissement_id_seq OWNED BY public.parking_encaissement.id;


--
-- Name: parking_extension; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.parking_extension (
    id integer NOT NULL,
    parking_zone_id integer NOT NULL,
    type_extension text NOT NULL,
    identifiant text,
    actif boolean DEFAULT false NOT NULL,
    config_json jsonb DEFAULT '{}'::jsonb,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT parking_extension_type_extension_check CHECK ((type_extension = ANY (ARRAY['horodateur'::text, 'capteur_place'::text, 'anpr'::text, 'paiement_mobile'::text])))
);


ALTER TABLE public.parking_extension OWNER TO civismart;

--
-- Name: parking_extension_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.parking_extension_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parking_extension_id_seq OWNER TO civismart;

--
-- Name: parking_extension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.parking_extension_id_seq OWNED BY public.parking_extension.id;


--
-- Name: parking_ticket_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.parking_ticket_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parking_ticket_seq OWNER TO civismart;

--
-- Name: parking_zone; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.parking_zone (
    id integer NOT NULL,
    nom text NOT NULL,
    commune_id integer,
    type public.parking_zone_type DEFAULT 'blanche'::public.parking_zone_type NOT NULL,
    lat double precision,
    lng double precision,
    places_total integer,
    tarif_horaire numeric(6,2),
    places_resident integer,
    places_pmr integer,
    places_livraison integer,
    places_transit integer,
    actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.parking_zone OWNER TO civismart;

--
-- Name: parking_zone_id_seq; Type: SEQUENCE; Schema: public; Owner: civismart
--

CREATE SEQUENCE public.parking_zone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parking_zone_id_seq OWNER TO civismart;

--
-- Name: parking_zone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: civismart
--

ALTER SEQUENCE public.parking_zone_id_seq OWNED BY public.parking_zone.id;


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
    maj_le timestamp with time zone DEFAULT now() NOT NULL,
    public_prioritaire public.public_prioritaire,
    note_satisfaction smallint,
    rdv_honore boolean,
    delai_respecte boolean,
    commentaire_eval text,
    evalue_le timestamp with time zone,
    CONSTRAINT rdv_note_satisfaction_check CHECK (((note_satisfaction IS NULL) OR ((note_satisfaction >= 1) AND (note_satisfaction <= 5))))
);


ALTER TABLE public.rdv OWNER TO civismart;

--
-- Name: service; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.service (
    id integer NOT NULL,
    nom text NOT NULL,
    famille public.famille_service NOT NULL,
    duree_min integer DEFAULT 15 NOT NULL,
    categorie text,
    description text,
    pieces_requises jsonb DEFAULT '[]'::jsonb,
    formulaires jsonb DEFAULT '[]'::jsonb,
    frais text,
    delai_reel text,
    assistant_questions jsonb DEFAULT '[]'::jsonb
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
    resolu_le timestamp with time zone,
    epic_id integer,
    parc_id integer,
    gravite public.signal_gravite DEFAULT 'degradation'::public.signal_gravite,
    nb_confirmations integer DEFAULT 0 NOT NULL
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
-- Name: utilisateur_badge; Type: TABLE; Schema: public; Owner: civismart
--

CREATE TABLE public.utilisateur_badge (
    utilisateur_id uuid NOT NULL,
    badge_id integer NOT NULL,
    obtenu_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.utilisateur_badge OWNER TO civismart;

--
-- Name: badge id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.badge ALTER COLUMN id SET DEFAULT nextval('public.badge_id_seq'::regclass);


--
-- Name: bien_historique id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_historique ALTER COLUMN id SET DEFAULT nextval('public.bien_historique_id_seq'::regclass);


--
-- Name: bien_immobilier id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bien_immobilier ALTER COLUMN id SET DEFAULT nextval('public.bien_immobilier_id_seq'::regclass);


--
-- Name: cap_agent id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_agent ALTER COLUMN id SET DEFAULT nextval('public.cap_agent_id_seq'::regclass);


--
-- Name: cap_intervention id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention ALTER COLUMN id SET DEFAULT nextval('public.cap_intervention_id_seq'::regclass);


--
-- Name: carte_resident id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.carte_resident ALTER COLUMN id SET DEFAULT nextval('public.carte_resident_id_seq'::regclass);


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
-- Name: parc id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parc ALTER COLUMN id SET DEFAULT nextval('public.parc_id_seq'::regclass);


--
-- Name: parking_encaissement id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_encaissement ALTER COLUMN id SET DEFAULT nextval('public.parking_encaissement_id_seq'::regclass);


--
-- Name: parking_extension id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_extension ALTER COLUMN id SET DEFAULT nextval('public.parking_extension_id_seq'::regclass);


--
-- Name: parking_zone id; Type: DEFAULT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_zone ALTER COLUMN id SET DEFAULT nextval('public.parking_zone_id_seq'::regclass);


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
003_edeval_iqep.sql	2026-06-26 21:37:05.287621+00
004_cap_civipark.sql	2026-06-26 22:01:35.077527+00
005_civiadmin_enrichi.sql	2026-06-26 22:59:08.063234+00
006_fix_coords_demo.sql	2026-06-26 23:16:57.522403+00
007_creneaux_nouveaux_services_b.sql	2026-06-26 23:23:33.98737+00
008_sous_categories_nettoyage.sql	2026-06-27 13:16:03.403678+00
009_gravite_signalement.sql	2026-06-27 13:16:45.688628+00
010_confirmations_signalement.sql	2026-06-27 13:18:56.064458+00
011_badges.sql	2026-06-27 13:20:48.859616+00
\.


--
-- Data for Name: badge; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.badge (id, code, nom, description, icone, condition_type, condition_seuil) FROM stdin;
1	premier_signalement	Premier signalement	Vous avez créé votre premier signalement.	🎯	signalements_total	1
2	dix_resolus	10 problèmes résolus	10 de vos signalements ont été résolus.	✅	resolus	10
3	sentinelle_quartier	Sentinelle du quartier	20 signalements dans la même commune.	🛡️	commune	20
4	protecteur_parcs	Protecteur des parcs	5 signalements espaces verts.	🌳	famille_espaces_verts	5
5	ambassadeur_eau	Ambassadeur de l'eau	5 signalements liés à l'eau.	💧	famille_eau	5
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
-- Data for Name: cap_agent; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.cap_agent (id, utilisateur_id, specialisation, commune_id, secteur, actif, cree_le, parking_zone_id) FROM stdin;
\.


--
-- Data for Name: cap_intervention; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.cap_intervention (id, reference, agent_id, type, priorite, description, lat, lng, commune_id, citoyen_id, signalement_id, alerte_superviseur, motif_alerte, etat, cree_le, termine_le, notes) FROM stdin;
\.


--
-- Data for Name: carte_resident; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.carte_resident (id, citoyen_id, commune_id, plaque, justif_residence, statut, valide_jusqu_a, cree_le) FROM stdin;
\.


--
-- Data for Name: categorie_signal; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.categorie_signal (id, domaine, libelle, criticite, epic_id, famille) FROM stdin;
7	proprete	Autre propreté	basse	\N	proprete
14	eau	Autre eau	basse	\N	eau
22	general	Autre espaces verts	basse	3	espaces_verts
26	general	Autre éclairage	basse	8	eclairage
31	general	Autre voirie	basse	30	voirie
35	general	Autre stationnement	basse	31	stationnement
36	general	Autre problème	basse	\N	autre
1	proprete	Dépôt sauvage (ordures, gravats)	haute	\N	proprete
2	proprete	Benne pleine ou débordante	moyenne	\N	proprete
3	proprete	Encombrants sur la voie publique	basse	\N	proprete
4	proprete	Tags ou graffitis	basse	\N	proprete
5	proprete	Chaussée dégradée (nid-de-poule)	haute	30	voirie
6	proprete	Éclairage défaillant	moyenne	8	eclairage
8	eau	Fuite d'eau visible	haute	\N	eau
9	eau	Coupure d'eau ou pression faible	haute	\N	eau
10	eau	Eau non potable ou colorée	haute	\N	eau
11	eau	Fuite sur compteur	moyenne	\N	eau
12	eau	Pression insuffisante	moyenne	\N	eau
13	eau	Inondation ou refoulement	haute	\N	eau
15	proprete	Arbre dangereux ou espace vert dégradé	moyenne	3	espaces_verts
16	proprete	Stationnement gênant ou anarchique	moyenne	31	stationnement
17	proprete	Décharge sauvage (enfouissement illicite)	haute	32	proprete
18	general	Arrosage défectueux ou fuite	moyenne	3	espaces_verts
19	general	Mobilier urbain dégradé (banc…)	basse	3	espaces_verts
20	general	Aire de jeux endommagée	moyenne	3	espaces_verts
21	general	Plantation ou fleurissement à entretenir	basse	3	espaces_verts
23	general	Lampadaire éteint	moyenne	8	eclairage
24	general	Lampadaire clignotant ou défectueux	moyenne	8	eclairage
25	general	Câble électrique apparent (danger)	haute	8	eclairage
28	general	Trottoir dégradé ou inaccessible	moyenne	30	voirie
29	general	Signalisation manquante ou endommagée	moyenne	30	voirie
30	general	Feu tricolore en panne	haute	30	voirie
33	general	Place PMR non respectée	moyenne	31	stationnement
34	general	Zone à réguler	basse	31	stationnement
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

COPY public.commune (id, nom, circonscription_id, centre_lat, centre_lng, zone) FROM stdin;
1	Alger-Centre	1	36.7372	3.0875	centre
3	El Madania	1	36.7411	3.0742	centre
4	Casbah	1	36.785	3.06	centre
5	Hussein Dey	1	36.735	3.117	centre
6	Oued Koriche	1	36.775	3.035	centre
7	Bab El Oued	2	36.79	3.05	centre
8	Bologhine	2	36.8	3.03	centre
9	Bir Mourad Raïs	3	36.72	3.06	centre
10	Hydra	3	36.745	3.02	centre
11	El Biar	3	36.755	3.015	centre
12	El Mouradia	3	36.73	3.05	centre
13	Birkhradem	3	36.705	3.05	centre
14	Bouzaréah	4	36.78	3	centre
15	El Achour	4	36.735	2.985	centre
16	Dely Ibrahim	4	36.76	2.98	centre
17	Ben Aknoun	4	36.76	2.99	centre
18	Beni Messous	4	36.775	2.97	centre
19	Rahmania	4	36.8	2.95	centre
20	Souidania	4	36.765	2.93	centre
21	Chéraga	5	36.765	2.96	centre
22	Aïn Benian	5	36.805	2.92	centre
23	Raïs Hamidou	5	36.82	2.9	centre
24	Zéralda	6	36.72	2.83	centre
25	Mahelma	6	36.7	2.86	centre
26	Tessala El Merdja	6	36.68	2.91	centre
27	Saoula	6	36.69	2.98	centre
28	Staoueli	6	36.75	2.87	centre
29	Ouled Fayet	6	36.72	2.91	centre
30	Draria	7	36.705	3.01	centre
31	Baba Hassan	7	36.68	3.01	centre
32	Ouled Chebel	7	36.67	3.05	centre
33	Khraïcia	7	36.665	3.08	centre
34	Birtouta	7	36.69	2.97	centre
35	El Harrach	8	36.7167	3.1333	centre
36	Kouba	8	36.7267	3.0983	centre
37	Bachdjarah	8	36.71	3.12	centre
38	Bourouba	8	36.72	3.11	centre
39	Mohammadia	8	36.73	3.14	centre
40	Séhaoula	8	36.705	3.065	centre
41	Djasr Kasentina	8	36.735	3.155	centre
42	Gué de Constantine	8	36.725	3.17	centre
43	Baraki	9	36.67	3.1	centre
44	Les Eucalyptus	9	36.68	3.15	centre
45	Sidi Moussa	9	36.66	3.17	centre
46	Bab Ezzouar	10	36.72	3.183	centre
47	Bordj El Bahri	10	36.74	3.21	centre
48	El Magharia	10	36.71	3.165	centre
49	Oued Smar	10	36.71	3.145	centre
50	Dar El Beïda	11	36.72	3.215	centre
51	Aïn Taya	11	36.79	3.31	centre
52	Hraoua	11	36.72	3.27	centre
53	Bordj El Kiffan	12	36.75	3.22	centre
54	Rouïba	13	36.73	3.285	centre
55	Reghaïa	13	36.725	3.345	centre
56	Douéra	7	36.668	2.948	centre
57	El Marsa	11	36.805	3.258	centre
2	Sidi M'Hamed	1	36.75	3.0933	centre
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
3330	56	12	2026-06-27 08:30:00+00	10
2	1	12	2026-06-25 17:17:35.649196+00	10
3	1	13	2026-06-25 17:17:35.649196+00	10
4	1	14	2026-06-25 17:17:35.649196+00	10
5	1	15	2026-06-25 17:17:35.649196+00	10
3331	57	12	2026-06-27 08:30:00+00	10
7	1	12	2026-06-26 17:17:35.649196+00	10
8	1	13	2026-06-26 17:17:35.649196+00	10
9	1	14	2026-06-26 17:17:35.649196+00	10
10	1	15	2026-06-26 17:17:35.649196+00	10
3332	56	13	2026-06-27 09:30:00+00	10
12	1	12	2026-06-27 17:17:35.649196+00	10
13	1	13	2026-06-27 17:17:35.649196+00	10
14	1	14	2026-06-27 17:17:35.649196+00	10
15	1	15	2026-06-27 17:17:35.649196+00	10
3333	57	13	2026-06-27 09:30:00+00	10
17	1	12	2026-06-28 17:17:35.649196+00	10
18	1	13	2026-06-28 17:17:35.649196+00	10
19	1	14	2026-06-28 17:17:35.649196+00	10
20	1	15	2026-06-28 17:17:35.649196+00	10
3334	56	14	2026-06-27 10:30:00+00	10
22	1	12	2026-06-29 17:17:35.649196+00	10
23	1	13	2026-06-29 17:17:35.649196+00	10
24	1	14	2026-06-29 17:17:35.649196+00	10
25	1	15	2026-06-29 17:17:35.649196+00	10
3335	57	14	2026-06-27 10:30:00+00	10
27	1	12	2026-06-30 17:17:35.649196+00	10
28	1	13	2026-06-30 17:17:35.649196+00	10
29	1	14	2026-06-30 17:17:35.649196+00	10
30	1	15	2026-06-30 17:17:35.649196+00	10
3336	56	15	2026-06-27 11:30:00+00	10
32	1	12	2026-07-01 17:17:35.649196+00	10
33	1	13	2026-07-01 17:17:35.649196+00	10
34	1	14	2026-07-01 17:17:35.649196+00	10
35	1	15	2026-07-01 17:17:35.649196+00	10
3337	57	15	2026-06-27 11:30:00+00	10
37	2	12	2026-06-25 17:17:35.649196+00	10
38	2	13	2026-06-25 17:17:35.649196+00	10
39	2	14	2026-06-25 17:17:35.649196+00	10
40	2	15	2026-06-25 17:17:35.649196+00	10
3338	56	12	2026-06-28 08:30:00+00	10
42	2	12	2026-06-26 17:17:35.649196+00	10
43	2	13	2026-06-26 17:17:35.649196+00	10
44	2	14	2026-06-26 17:17:35.649196+00	10
45	2	15	2026-06-26 17:17:35.649196+00	10
3339	57	12	2026-06-28 08:30:00+00	10
47	2	12	2026-06-27 17:17:35.649196+00	10
48	2	13	2026-06-27 17:17:35.649196+00	10
49	2	14	2026-06-27 17:17:35.649196+00	10
50	2	15	2026-06-27 17:17:35.649196+00	10
3340	56	13	2026-06-28 09:30:00+00	10
52	2	12	2026-06-28 17:17:35.649196+00	10
53	2	13	2026-06-28 17:17:35.649196+00	10
54	2	14	2026-06-28 17:17:35.649196+00	10
55	2	15	2026-06-28 17:17:35.649196+00	10
3341	57	13	2026-06-28 09:30:00+00	10
57	2	12	2026-06-29 17:17:35.649196+00	10
58	2	13	2026-06-29 17:17:35.649196+00	10
59	2	14	2026-06-29 17:17:35.649196+00	10
60	2	15	2026-06-29 17:17:35.649196+00	10
3342	56	14	2026-06-28 10:30:00+00	10
62	2	12	2026-06-30 17:17:35.649196+00	10
63	2	13	2026-06-30 17:17:35.649196+00	10
64	2	14	2026-06-30 17:17:35.649196+00	10
65	2	15	2026-06-30 17:17:35.649196+00	10
3343	57	14	2026-06-28 10:30:00+00	10
67	2	12	2026-07-01 17:17:35.649196+00	10
68	2	13	2026-07-01 17:17:35.649196+00	10
69	2	14	2026-07-01 17:17:35.649196+00	10
70	2	15	2026-07-01 17:17:35.649196+00	10
3344	56	15	2026-06-28 11:30:00+00	10
72	3	12	2026-06-25 17:17:35.649196+00	10
73	3	13	2026-06-25 17:17:35.649196+00	10
74	3	14	2026-06-25 17:17:35.649196+00	10
75	3	15	2026-06-25 17:17:35.649196+00	10
3345	57	15	2026-06-28 11:30:00+00	10
77	3	12	2026-06-26 17:17:35.649196+00	10
78	3	13	2026-06-26 17:17:35.649196+00	10
79	3	14	2026-06-26 17:17:35.649196+00	10
80	3	15	2026-06-26 17:17:35.649196+00	10
3346	56	12	2026-06-29 08:30:00+00	10
82	3	12	2026-06-27 17:17:35.649196+00	10
83	3	13	2026-06-27 17:17:35.649196+00	10
84	3	14	2026-06-27 17:17:35.649196+00	10
85	3	15	2026-06-27 17:17:35.649196+00	10
3347	57	12	2026-06-29 08:30:00+00	10
87	3	12	2026-06-28 17:17:35.649196+00	10
88	3	13	2026-06-28 17:17:35.649196+00	10
89	3	14	2026-06-28 17:17:35.649196+00	10
90	3	15	2026-06-28 17:17:35.649196+00	10
3348	56	13	2026-06-29 09:30:00+00	10
92	3	12	2026-06-29 17:17:35.649196+00	10
93	3	13	2026-06-29 17:17:35.649196+00	10
94	3	14	2026-06-29 17:17:35.649196+00	10
95	3	15	2026-06-29 17:17:35.649196+00	10
3349	57	13	2026-06-29 09:30:00+00	10
97	3	12	2026-06-30 17:17:35.649196+00	10
98	3	13	2026-06-30 17:17:35.649196+00	10
99	3	14	2026-06-30 17:17:35.649196+00	10
100	3	15	2026-06-30 17:17:35.649196+00	10
3350	56	14	2026-06-29 10:30:00+00	10
102	3	12	2026-07-01 17:17:35.649196+00	10
103	3	13	2026-07-01 17:17:35.649196+00	10
104	3	14	2026-07-01 17:17:35.649196+00	10
105	3	15	2026-07-01 17:17:35.649196+00	10
3351	57	14	2026-06-29 10:30:00+00	10
107	4	12	2026-06-25 17:17:35.649196+00	10
108	4	13	2026-06-25 17:17:35.649196+00	10
109	4	14	2026-06-25 17:17:35.649196+00	10
110	4	15	2026-06-25 17:17:35.649196+00	10
3352	56	15	2026-06-29 11:30:00+00	10
112	4	12	2026-06-26 17:17:35.649196+00	10
113	4	13	2026-06-26 17:17:35.649196+00	10
114	4	14	2026-06-26 17:17:35.649196+00	10
115	4	15	2026-06-26 17:17:35.649196+00	10
3353	57	15	2026-06-29 11:30:00+00	10
117	4	12	2026-06-27 17:17:35.649196+00	10
118	4	13	2026-06-27 17:17:35.649196+00	10
119	4	14	2026-06-27 17:17:35.649196+00	10
120	4	15	2026-06-27 17:17:35.649196+00	10
3354	56	12	2026-06-30 08:30:00+00	10
122	4	12	2026-06-28 17:17:35.649196+00	10
123	4	13	2026-06-28 17:17:35.649196+00	10
124	4	14	2026-06-28 17:17:35.649196+00	10
125	4	15	2026-06-28 17:17:35.649196+00	10
3355	57	12	2026-06-30 08:30:00+00	10
127	4	12	2026-06-29 17:17:35.649196+00	10
128	4	13	2026-06-29 17:17:35.649196+00	10
129	4	14	2026-06-29 17:17:35.649196+00	10
130	4	15	2026-06-29 17:17:35.649196+00	10
3356	56	13	2026-06-30 09:30:00+00	10
132	4	12	2026-06-30 17:17:35.649196+00	10
133	4	13	2026-06-30 17:17:35.649196+00	10
134	4	14	2026-06-30 17:17:35.649196+00	10
135	4	15	2026-06-30 17:17:35.649196+00	10
3357	57	13	2026-06-30 09:30:00+00	10
137	4	12	2026-07-01 17:17:35.649196+00	10
138	4	13	2026-07-01 17:17:35.649196+00	10
139	4	14	2026-07-01 17:17:35.649196+00	10
140	4	15	2026-07-01 17:17:35.649196+00	10
3358	56	14	2026-06-30 10:30:00+00	10
142	5	12	2026-06-25 17:17:35.649196+00	10
143	5	13	2026-06-25 17:17:35.649196+00	10
144	5	14	2026-06-25 17:17:35.649196+00	10
145	5	15	2026-06-25 17:17:35.649196+00	10
3359	57	14	2026-06-30 10:30:00+00	10
147	5	12	2026-06-26 17:17:35.649196+00	10
148	5	13	2026-06-26 17:17:35.649196+00	10
149	5	14	2026-06-26 17:17:35.649196+00	10
150	5	15	2026-06-26 17:17:35.649196+00	10
3360	56	15	2026-06-30 11:30:00+00	10
152	5	12	2026-06-27 17:17:35.649196+00	10
153	5	13	2026-06-27 17:17:35.649196+00	10
154	5	14	2026-06-27 17:17:35.649196+00	10
155	5	15	2026-06-27 17:17:35.649196+00	10
3361	57	15	2026-06-30 11:30:00+00	10
157	5	12	2026-06-28 17:17:35.649196+00	10
158	5	13	2026-06-28 17:17:35.649196+00	10
159	5	14	2026-06-28 17:17:35.649196+00	10
160	5	15	2026-06-28 17:17:35.649196+00	10
3362	56	12	2026-07-01 08:30:00+00	10
162	5	12	2026-06-29 17:17:35.649196+00	10
163	5	13	2026-06-29 17:17:35.649196+00	10
164	5	14	2026-06-29 17:17:35.649196+00	10
165	5	15	2026-06-29 17:17:35.649196+00	10
3363	57	12	2026-07-01 08:30:00+00	10
167	5	12	2026-06-30 17:17:35.649196+00	10
168	5	13	2026-06-30 17:17:35.649196+00	10
169	5	14	2026-06-30 17:17:35.649196+00	10
170	5	15	2026-06-30 17:17:35.649196+00	10
3364	56	13	2026-07-01 09:30:00+00	10
172	5	12	2026-07-01 17:17:35.649196+00	10
173	5	13	2026-07-01 17:17:35.649196+00	10
174	5	14	2026-07-01 17:17:35.649196+00	10
175	5	15	2026-07-01 17:17:35.649196+00	10
3365	57	13	2026-07-01 09:30:00+00	10
177	6	12	2026-06-25 17:17:35.649196+00	10
178	6	13	2026-06-25 17:17:35.649196+00	10
179	6	14	2026-06-25 17:17:35.649196+00	10
180	6	15	2026-06-25 17:17:35.649196+00	10
3366	56	14	2026-07-01 10:30:00+00	10
182	6	12	2026-06-26 17:17:35.649196+00	10
183	6	13	2026-06-26 17:17:35.649196+00	10
184	6	14	2026-06-26 17:17:35.649196+00	10
185	6	15	2026-06-26 17:17:35.649196+00	10
3367	57	14	2026-07-01 10:30:00+00	10
187	6	12	2026-06-27 17:17:35.649196+00	10
188	6	13	2026-06-27 17:17:35.649196+00	10
189	6	14	2026-06-27 17:17:35.649196+00	10
190	6	15	2026-06-27 17:17:35.649196+00	10
3368	56	15	2026-07-01 11:30:00+00	10
192	6	12	2026-06-28 17:17:35.649196+00	10
193	6	13	2026-06-28 17:17:35.649196+00	10
194	6	14	2026-06-28 17:17:35.649196+00	10
195	6	15	2026-06-28 17:17:35.649196+00	10
3369	57	15	2026-07-01 11:30:00+00	10
197	6	12	2026-06-29 17:17:35.649196+00	10
198	6	13	2026-06-29 17:17:35.649196+00	10
199	6	14	2026-06-29 17:17:35.649196+00	10
200	6	15	2026-06-29 17:17:35.649196+00	10
3370	56	12	2026-07-02 08:30:00+00	10
202	6	12	2026-06-30 17:17:35.649196+00	10
203	6	13	2026-06-30 17:17:35.649196+00	10
204	6	14	2026-06-30 17:17:35.649196+00	10
205	6	15	2026-06-30 17:17:35.649196+00	10
3371	57	12	2026-07-02 08:30:00+00	10
207	6	12	2026-07-01 17:17:35.649196+00	10
208	6	13	2026-07-01 17:17:35.649196+00	10
209	6	14	2026-07-01 17:17:35.649196+00	10
210	6	15	2026-07-01 17:17:35.649196+00	10
3372	56	13	2026-07-02 09:30:00+00	10
212	7	12	2026-06-25 17:17:35.649196+00	10
213	7	13	2026-06-25 17:17:35.649196+00	10
214	7	14	2026-06-25 17:17:35.649196+00	10
215	7	15	2026-06-25 17:17:35.649196+00	10
3373	57	13	2026-07-02 09:30:00+00	10
217	7	12	2026-06-26 17:17:35.649196+00	10
218	7	13	2026-06-26 17:17:35.649196+00	10
219	7	14	2026-06-26 17:17:35.649196+00	10
220	7	15	2026-06-26 17:17:35.649196+00	10
3374	56	14	2026-07-02 10:30:00+00	10
222	7	12	2026-06-27 17:17:35.649196+00	10
223	7	13	2026-06-27 17:17:35.649196+00	10
224	7	14	2026-06-27 17:17:35.649196+00	10
225	7	15	2026-06-27 17:17:35.649196+00	10
3375	57	14	2026-07-02 10:30:00+00	10
227	7	12	2026-06-28 17:17:35.649196+00	10
228	7	13	2026-06-28 17:17:35.649196+00	10
229	7	14	2026-06-28 17:17:35.649196+00	10
230	7	15	2026-06-28 17:17:35.649196+00	10
3376	56	15	2026-07-02 11:30:00+00	10
232	7	12	2026-06-29 17:17:35.649196+00	10
233	7	13	2026-06-29 17:17:35.649196+00	10
234	7	14	2026-06-29 17:17:35.649196+00	10
235	7	15	2026-06-29 17:17:35.649196+00	10
3377	57	15	2026-07-02 11:30:00+00	10
237	7	12	2026-06-30 17:17:35.649196+00	10
238	7	13	2026-06-30 17:17:35.649196+00	10
239	7	14	2026-06-30 17:17:35.649196+00	10
240	7	15	2026-06-30 17:17:35.649196+00	10
3378	56	12	2026-07-03 08:30:00+00	10
242	7	12	2026-07-01 17:17:35.649196+00	10
243	7	13	2026-07-01 17:17:35.649196+00	10
244	7	14	2026-07-01 17:17:35.649196+00	10
245	7	15	2026-07-01 17:17:35.649196+00	10
3379	57	12	2026-07-03 08:30:00+00	10
247	8	12	2026-06-25 17:17:35.649196+00	10
248	8	13	2026-06-25 17:17:35.649196+00	10
249	8	14	2026-06-25 17:17:35.649196+00	10
250	8	15	2026-06-25 17:17:35.649196+00	10
3380	56	13	2026-07-03 09:30:00+00	10
252	8	12	2026-06-26 17:17:35.649196+00	10
253	8	13	2026-06-26 17:17:35.649196+00	10
254	8	14	2026-06-26 17:17:35.649196+00	10
255	8	15	2026-06-26 17:17:35.649196+00	10
3381	57	13	2026-07-03 09:30:00+00	10
257	8	12	2026-06-27 17:17:35.649196+00	10
258	8	13	2026-06-27 17:17:35.649196+00	10
259	8	14	2026-06-27 17:17:35.649196+00	10
260	8	15	2026-06-27 17:17:35.649196+00	10
3382	56	14	2026-07-03 10:30:00+00	10
262	8	12	2026-06-28 17:17:35.649196+00	10
263	8	13	2026-06-28 17:17:35.649196+00	10
264	8	14	2026-06-28 17:17:35.649196+00	10
265	8	15	2026-06-28 17:17:35.649196+00	10
3383	57	14	2026-07-03 10:30:00+00	10
267	8	12	2026-06-29 17:17:35.649196+00	10
268	8	13	2026-06-29 17:17:35.649196+00	10
269	8	14	2026-06-29 17:17:35.649196+00	10
270	8	15	2026-06-29 17:17:35.649196+00	10
3384	56	15	2026-07-03 11:30:00+00	10
272	8	12	2026-06-30 17:17:35.649196+00	10
273	8	13	2026-06-30 17:17:35.649196+00	10
274	8	14	2026-06-30 17:17:35.649196+00	10
275	8	15	2026-06-30 17:17:35.649196+00	10
3385	57	15	2026-07-03 11:30:00+00	10
277	8	12	2026-07-01 17:17:35.649196+00	10
278	8	13	2026-07-01 17:17:35.649196+00	10
279	8	14	2026-07-01 17:17:35.649196+00	10
280	8	15	2026-07-01 17:17:35.649196+00	10
3386	14	12	2026-06-27 14:00:00+00	10
282	9	12	2026-06-25 17:17:35.649196+00	10
283	9	13	2026-06-25 17:17:35.649196+00	10
284	9	14	2026-06-25 17:17:35.649196+00	10
285	9	15	2026-06-25 17:17:35.649196+00	10
3387	14	13	2026-06-27 15:00:00+00	10
287	9	12	2026-06-26 17:17:35.649196+00	10
288	9	13	2026-06-26 17:17:35.649196+00	10
289	9	14	2026-06-26 17:17:35.649196+00	10
290	9	15	2026-06-26 17:17:35.649196+00	10
3388	14	14	2026-06-27 16:00:00+00	10
292	9	12	2026-06-27 17:17:35.649196+00	10
293	9	13	2026-06-27 17:17:35.649196+00	10
294	9	14	2026-06-27 17:17:35.649196+00	10
295	9	15	2026-06-27 17:17:35.649196+00	10
3389	14	15	2026-06-27 17:00:00+00	10
297	9	12	2026-06-28 17:17:35.649196+00	10
298	9	13	2026-06-28 17:17:35.649196+00	10
299	9	14	2026-06-28 17:17:35.649196+00	10
300	9	15	2026-06-28 17:17:35.649196+00	10
3390	21	12	2026-06-27 14:00:00+00	10
302	9	12	2026-06-29 17:17:35.649196+00	10
303	9	13	2026-06-29 17:17:35.649196+00	10
304	9	14	2026-06-29 17:17:35.649196+00	10
305	9	15	2026-06-29 17:17:35.649196+00	10
3391	21	13	2026-06-27 15:00:00+00	10
307	9	12	2026-06-30 17:17:35.649196+00	10
308	9	13	2026-06-30 17:17:35.649196+00	10
309	9	14	2026-06-30 17:17:35.649196+00	10
310	9	15	2026-06-30 17:17:35.649196+00	10
3392	21	14	2026-06-27 16:00:00+00	10
312	9	12	2026-07-01 17:17:35.649196+00	10
313	9	13	2026-07-01 17:17:35.649196+00	10
314	9	14	2026-07-01 17:17:35.649196+00	10
315	9	15	2026-07-01 17:17:35.649196+00	10
3393	21	15	2026-06-27 17:00:00+00	10
317	10	12	2026-06-25 17:17:35.649196+00	10
318	10	13	2026-06-25 17:17:35.649196+00	10
319	10	14	2026-06-25 17:17:35.649196+00	10
320	10	15	2026-06-25 17:17:35.649196+00	10
3394	24	12	2026-06-27 14:00:00+00	10
322	10	12	2026-06-26 17:17:35.649196+00	10
323	10	13	2026-06-26 17:17:35.649196+00	10
324	10	14	2026-06-26 17:17:35.649196+00	10
325	10	15	2026-06-26 17:17:35.649196+00	10
3395	24	13	2026-06-27 15:00:00+00	10
327	10	12	2026-06-27 17:17:35.649196+00	10
328	10	13	2026-06-27 17:17:35.649196+00	10
329	10	14	2026-06-27 17:17:35.649196+00	10
330	10	15	2026-06-27 17:17:35.649196+00	10
3396	24	14	2026-06-27 16:00:00+00	10
332	10	12	2026-06-28 17:17:35.649196+00	10
333	10	13	2026-06-28 17:17:35.649196+00	10
334	10	14	2026-06-28 17:17:35.649196+00	10
335	10	15	2026-06-28 17:17:35.649196+00	10
3397	24	15	2026-06-27 17:00:00+00	10
337	10	12	2026-06-29 17:17:35.649196+00	10
338	10	13	2026-06-29 17:17:35.649196+00	10
339	10	14	2026-06-29 17:17:35.649196+00	10
340	10	15	2026-06-29 17:17:35.649196+00	10
3398	35	12	2026-06-27 14:00:00+00	10
342	10	12	2026-06-30 17:17:35.649196+00	10
343	10	13	2026-06-30 17:17:35.649196+00	10
344	10	14	2026-06-30 17:17:35.649196+00	10
345	10	15	2026-06-30 17:17:35.649196+00	10
3399	35	13	2026-06-27 15:00:00+00	10
347	10	12	2026-07-01 17:17:35.649196+00	10
348	10	13	2026-07-01 17:17:35.649196+00	10
349	10	14	2026-07-01 17:17:35.649196+00	10
350	10	15	2026-07-01 17:17:35.649196+00	10
3400	35	14	2026-06-27 16:00:00+00	10
352	11	12	2026-06-25 17:17:35.649196+00	10
353	11	13	2026-06-25 17:17:35.649196+00	10
354	11	14	2026-06-25 17:17:35.649196+00	10
355	11	15	2026-06-25 17:17:35.649196+00	10
3401	35	15	2026-06-27 17:00:00+00	10
357	11	12	2026-06-26 17:17:35.649196+00	10
358	11	13	2026-06-26 17:17:35.649196+00	10
359	11	14	2026-06-26 17:17:35.649196+00	10
360	11	15	2026-06-26 17:17:35.649196+00	10
3402	36	12	2026-06-27 14:00:00+00	10
362	11	12	2026-06-27 17:17:35.649196+00	10
363	11	13	2026-06-27 17:17:35.649196+00	10
364	11	14	2026-06-27 17:17:35.649196+00	10
365	11	15	2026-06-27 17:17:35.649196+00	10
3403	36	13	2026-06-27 15:00:00+00	10
367	11	12	2026-06-28 17:17:35.649196+00	10
368	11	13	2026-06-28 17:17:35.649196+00	10
369	11	14	2026-06-28 17:17:35.649196+00	10
370	11	15	2026-06-28 17:17:35.649196+00	10
3404	36	14	2026-06-27 16:00:00+00	10
372	11	12	2026-06-29 17:17:35.649196+00	10
373	11	13	2026-06-29 17:17:35.649196+00	10
374	11	14	2026-06-29 17:17:35.649196+00	10
375	11	15	2026-06-29 17:17:35.649196+00	10
3405	36	15	2026-06-27 17:00:00+00	10
377	11	12	2026-06-30 17:17:35.649196+00	10
378	11	13	2026-06-30 17:17:35.649196+00	10
379	11	14	2026-06-30 17:17:35.649196+00	10
380	11	15	2026-06-30 17:17:35.649196+00	10
3406	43	12	2026-06-27 14:00:00+00	10
382	11	12	2026-07-01 17:17:35.649196+00	10
383	11	13	2026-07-01 17:17:35.649196+00	10
384	11	14	2026-07-01 17:17:35.649196+00	10
385	11	15	2026-07-01 17:17:35.649196+00	10
3407	43	13	2026-06-27 15:00:00+00	10
387	12	12	2026-06-25 17:17:35.649196+00	10
388	12	13	2026-06-25 17:17:35.649196+00	10
389	12	14	2026-06-25 17:17:35.649196+00	10
390	12	15	2026-06-25 17:17:35.649196+00	10
3408	43	14	2026-06-27 16:00:00+00	10
392	12	12	2026-06-26 17:17:35.649196+00	10
393	12	13	2026-06-26 17:17:35.649196+00	10
394	12	14	2026-06-26 17:17:35.649196+00	10
395	12	15	2026-06-26 17:17:35.649196+00	10
3409	43	15	2026-06-27 17:00:00+00	10
397	12	12	2026-06-27 17:17:35.649196+00	10
398	12	13	2026-06-27 17:17:35.649196+00	10
399	12	14	2026-06-27 17:17:35.649196+00	10
400	12	15	2026-06-27 17:17:35.649196+00	10
3410	46	12	2026-06-27 14:00:00+00	10
402	12	12	2026-06-28 17:17:35.649196+00	10
403	12	13	2026-06-28 17:17:35.649196+00	10
404	12	14	2026-06-28 17:17:35.649196+00	10
405	12	15	2026-06-28 17:17:35.649196+00	10
3411	46	13	2026-06-27 15:00:00+00	10
407	12	12	2026-06-29 17:17:35.649196+00	10
408	12	13	2026-06-29 17:17:35.649196+00	10
409	12	14	2026-06-29 17:17:35.649196+00	10
410	12	15	2026-06-29 17:17:35.649196+00	10
3412	46	14	2026-06-27 16:00:00+00	10
412	12	12	2026-06-30 17:17:35.649196+00	10
413	12	13	2026-06-30 17:17:35.649196+00	10
414	12	14	2026-06-30 17:17:35.649196+00	10
415	12	15	2026-06-30 17:17:35.649196+00	10
3413	46	15	2026-06-27 17:00:00+00	10
417	12	12	2026-07-01 17:17:35.649196+00	10
418	12	13	2026-07-01 17:17:35.649196+00	10
419	12	14	2026-07-01 17:17:35.649196+00	10
420	12	15	2026-07-01 17:17:35.649196+00	10
3414	50	12	2026-06-27 14:00:00+00	10
422	13	12	2026-06-25 17:17:35.649196+00	10
423	13	13	2026-06-25 17:17:35.649196+00	10
424	13	14	2026-06-25 17:17:35.649196+00	10
425	13	15	2026-06-25 17:17:35.649196+00	10
3415	50	13	2026-06-27 15:00:00+00	10
427	13	12	2026-06-26 17:17:35.649196+00	10
428	13	13	2026-06-26 17:17:35.649196+00	10
429	13	14	2026-06-26 17:17:35.649196+00	10
430	13	15	2026-06-26 17:17:35.649196+00	10
3416	50	14	2026-06-27 16:00:00+00	10
432	13	12	2026-06-27 17:17:35.649196+00	10
433	13	13	2026-06-27 17:17:35.649196+00	10
434	13	14	2026-06-27 17:17:35.649196+00	10
435	13	15	2026-06-27 17:17:35.649196+00	10
3417	50	15	2026-06-27 17:00:00+00	10
437	13	12	2026-06-28 17:17:35.649196+00	10
438	13	13	2026-06-28 17:17:35.649196+00	10
439	13	14	2026-06-28 17:17:35.649196+00	10
440	13	15	2026-06-28 17:17:35.649196+00	10
3418	14	12	2026-06-28 14:00:00+00	10
442	13	12	2026-06-29 17:17:35.649196+00	10
443	13	13	2026-06-29 17:17:35.649196+00	10
444	13	14	2026-06-29 17:17:35.649196+00	10
445	13	15	2026-06-29 17:17:35.649196+00	10
3419	14	13	2026-06-28 15:00:00+00	10
447	13	12	2026-06-30 17:17:35.649196+00	10
448	13	13	2026-06-30 17:17:35.649196+00	10
449	13	14	2026-06-30 17:17:35.649196+00	10
450	13	15	2026-06-30 17:17:35.649196+00	10
3420	14	14	2026-06-28 16:00:00+00	10
452	13	12	2026-07-01 17:17:35.649196+00	10
453	13	13	2026-07-01 17:17:35.649196+00	10
454	13	14	2026-07-01 17:17:35.649196+00	10
455	13	15	2026-07-01 17:17:35.649196+00	10
3421	14	15	2026-06-28 17:00:00+00	10
457	14	12	2026-06-25 17:17:35.649196+00	10
458	14	13	2026-06-25 17:17:35.649196+00	10
459	14	14	2026-06-25 17:17:35.649196+00	10
460	14	15	2026-06-25 17:17:35.649196+00	10
3422	21	12	2026-06-28 14:00:00+00	10
462	14	12	2026-06-26 17:17:35.649196+00	10
463	14	13	2026-06-26 17:17:35.649196+00	10
464	14	14	2026-06-26 17:17:35.649196+00	10
465	14	15	2026-06-26 17:17:35.649196+00	10
3423	21	13	2026-06-28 15:00:00+00	10
467	14	12	2026-06-27 17:17:35.649196+00	10
468	14	13	2026-06-27 17:17:35.649196+00	10
469	14	14	2026-06-27 17:17:35.649196+00	10
470	14	15	2026-06-27 17:17:35.649196+00	10
3424	21	14	2026-06-28 16:00:00+00	10
472	14	12	2026-06-28 17:17:35.649196+00	10
473	14	13	2026-06-28 17:17:35.649196+00	10
474	14	14	2026-06-28 17:17:35.649196+00	10
475	14	15	2026-06-28 17:17:35.649196+00	10
3425	21	15	2026-06-28 17:00:00+00	10
477	14	12	2026-06-29 17:17:35.649196+00	10
478	14	13	2026-06-29 17:17:35.649196+00	10
479	14	14	2026-06-29 17:17:35.649196+00	10
480	14	15	2026-06-29 17:17:35.649196+00	10
3426	24	12	2026-06-28 14:00:00+00	10
482	14	12	2026-06-30 17:17:35.649196+00	10
483	14	13	2026-06-30 17:17:35.649196+00	10
484	14	14	2026-06-30 17:17:35.649196+00	10
485	14	15	2026-06-30 17:17:35.649196+00	10
3427	24	13	2026-06-28 15:00:00+00	10
487	14	12	2026-07-01 17:17:35.649196+00	10
488	14	13	2026-07-01 17:17:35.649196+00	10
489	14	14	2026-07-01 17:17:35.649196+00	10
490	14	15	2026-07-01 17:17:35.649196+00	10
3428	24	14	2026-06-28 16:00:00+00	10
492	15	12	2026-06-25 17:17:35.649196+00	10
493	15	13	2026-06-25 17:17:35.649196+00	10
494	15	14	2026-06-25 17:17:35.649196+00	10
495	15	15	2026-06-25 17:17:35.649196+00	10
3429	24	15	2026-06-28 17:00:00+00	10
497	15	12	2026-06-26 17:17:35.649196+00	10
498	15	13	2026-06-26 17:17:35.649196+00	10
499	15	14	2026-06-26 17:17:35.649196+00	10
500	15	15	2026-06-26 17:17:35.649196+00	10
3430	35	12	2026-06-28 14:00:00+00	10
502	15	12	2026-06-27 17:17:35.649196+00	10
503	15	13	2026-06-27 17:17:35.649196+00	10
504	15	14	2026-06-27 17:17:35.649196+00	10
505	15	15	2026-06-27 17:17:35.649196+00	10
3431	35	13	2026-06-28 15:00:00+00	10
507	15	12	2026-06-28 17:17:35.649196+00	10
508	15	13	2026-06-28 17:17:35.649196+00	10
509	15	14	2026-06-28 17:17:35.649196+00	10
510	15	15	2026-06-28 17:17:35.649196+00	10
3432	35	14	2026-06-28 16:00:00+00	10
512	15	12	2026-06-29 17:17:35.649196+00	10
513	15	13	2026-06-29 17:17:35.649196+00	10
514	15	14	2026-06-29 17:17:35.649196+00	10
515	15	15	2026-06-29 17:17:35.649196+00	10
3433	35	15	2026-06-28 17:00:00+00	10
517	15	12	2026-06-30 17:17:35.649196+00	10
518	15	13	2026-06-30 17:17:35.649196+00	10
519	15	14	2026-06-30 17:17:35.649196+00	10
520	15	15	2026-06-30 17:17:35.649196+00	10
3434	36	12	2026-06-28 14:00:00+00	10
522	15	12	2026-07-01 17:17:35.649196+00	10
523	15	13	2026-07-01 17:17:35.649196+00	10
524	15	14	2026-07-01 17:17:35.649196+00	10
525	15	15	2026-07-01 17:17:35.649196+00	10
3435	36	13	2026-06-28 15:00:00+00	10
527	16	12	2026-06-25 17:17:35.649196+00	10
528	16	13	2026-06-25 17:17:35.649196+00	10
529	16	14	2026-06-25 17:17:35.649196+00	10
530	16	15	2026-06-25 17:17:35.649196+00	10
3436	36	14	2026-06-28 16:00:00+00	10
532	16	12	2026-06-26 17:17:35.649196+00	10
533	16	13	2026-06-26 17:17:35.649196+00	10
534	16	14	2026-06-26 17:17:35.649196+00	10
535	16	15	2026-06-26 17:17:35.649196+00	10
3437	36	15	2026-06-28 17:00:00+00	10
537	16	12	2026-06-27 17:17:35.649196+00	10
538	16	13	2026-06-27 17:17:35.649196+00	10
539	16	14	2026-06-27 17:17:35.649196+00	10
540	16	15	2026-06-27 17:17:35.649196+00	10
3438	43	12	2026-06-28 14:00:00+00	10
542	16	12	2026-06-28 17:17:35.649196+00	10
543	16	13	2026-06-28 17:17:35.649196+00	10
544	16	14	2026-06-28 17:17:35.649196+00	10
545	16	15	2026-06-28 17:17:35.649196+00	10
3439	43	13	2026-06-28 15:00:00+00	10
547	16	12	2026-06-29 17:17:35.649196+00	10
548	16	13	2026-06-29 17:17:35.649196+00	10
549	16	14	2026-06-29 17:17:35.649196+00	10
550	16	15	2026-06-29 17:17:35.649196+00	10
3440	43	14	2026-06-28 16:00:00+00	10
552	16	12	2026-06-30 17:17:35.649196+00	10
553	16	13	2026-06-30 17:17:35.649196+00	10
554	16	14	2026-06-30 17:17:35.649196+00	10
555	16	15	2026-06-30 17:17:35.649196+00	10
3441	43	15	2026-06-28 17:00:00+00	10
557	16	12	2026-07-01 17:17:35.649196+00	10
558	16	13	2026-07-01 17:17:35.649196+00	10
559	16	14	2026-07-01 17:17:35.649196+00	10
560	16	15	2026-07-01 17:17:35.649196+00	10
3442	46	12	2026-06-28 14:00:00+00	10
562	17	12	2026-06-25 17:17:35.649196+00	10
563	17	13	2026-06-25 17:17:35.649196+00	10
564	17	14	2026-06-25 17:17:35.649196+00	10
565	17	15	2026-06-25 17:17:35.649196+00	10
3443	46	13	2026-06-28 15:00:00+00	10
567	17	12	2026-06-26 17:17:35.649196+00	10
568	17	13	2026-06-26 17:17:35.649196+00	10
569	17	14	2026-06-26 17:17:35.649196+00	10
570	17	15	2026-06-26 17:17:35.649196+00	10
3444	46	14	2026-06-28 16:00:00+00	10
572	17	12	2026-06-27 17:17:35.649196+00	10
573	17	13	2026-06-27 17:17:35.649196+00	10
574	17	14	2026-06-27 17:17:35.649196+00	10
575	17	15	2026-06-27 17:17:35.649196+00	10
3445	46	15	2026-06-28 17:00:00+00	10
577	17	12	2026-06-28 17:17:35.649196+00	10
578	17	13	2026-06-28 17:17:35.649196+00	10
579	17	14	2026-06-28 17:17:35.649196+00	10
580	17	15	2026-06-28 17:17:35.649196+00	10
3446	50	12	2026-06-28 14:00:00+00	10
582	17	12	2026-06-29 17:17:35.649196+00	10
583	17	13	2026-06-29 17:17:35.649196+00	10
584	17	14	2026-06-29 17:17:35.649196+00	10
585	17	15	2026-06-29 17:17:35.649196+00	10
3447	50	13	2026-06-28 15:00:00+00	10
587	17	12	2026-06-30 17:17:35.649196+00	10
588	17	13	2026-06-30 17:17:35.649196+00	10
589	17	14	2026-06-30 17:17:35.649196+00	10
590	17	15	2026-06-30 17:17:35.649196+00	10
3448	50	14	2026-06-28 16:00:00+00	10
592	17	12	2026-07-01 17:17:35.649196+00	10
593	17	13	2026-07-01 17:17:35.649196+00	10
594	17	14	2026-07-01 17:17:35.649196+00	10
595	17	15	2026-07-01 17:17:35.649196+00	10
3449	50	15	2026-06-28 17:00:00+00	10
597	18	12	2026-06-25 17:17:35.649196+00	10
598	18	13	2026-06-25 17:17:35.649196+00	10
599	18	14	2026-06-25 17:17:35.649196+00	10
600	18	15	2026-06-25 17:17:35.649196+00	10
3450	14	12	2026-06-29 14:00:00+00	10
602	18	12	2026-06-26 17:17:35.649196+00	10
603	18	13	2026-06-26 17:17:35.649196+00	10
604	18	14	2026-06-26 17:17:35.649196+00	10
605	18	15	2026-06-26 17:17:35.649196+00	10
3451	14	13	2026-06-29 15:00:00+00	10
607	18	12	2026-06-27 17:17:35.649196+00	10
608	18	13	2026-06-27 17:17:35.649196+00	10
609	18	14	2026-06-27 17:17:35.649196+00	10
610	18	15	2026-06-27 17:17:35.649196+00	10
3452	14	14	2026-06-29 16:00:00+00	10
612	18	12	2026-06-28 17:17:35.649196+00	10
613	18	13	2026-06-28 17:17:35.649196+00	10
614	18	14	2026-06-28 17:17:35.649196+00	10
615	18	15	2026-06-28 17:17:35.649196+00	10
3453	14	15	2026-06-29 17:00:00+00	10
617	18	12	2026-06-29 17:17:35.649196+00	10
618	18	13	2026-06-29 17:17:35.649196+00	10
619	18	14	2026-06-29 17:17:35.649196+00	10
620	18	15	2026-06-29 17:17:35.649196+00	10
3454	21	12	2026-06-29 14:00:00+00	10
622	18	12	2026-06-30 17:17:35.649196+00	10
623	18	13	2026-06-30 17:17:35.649196+00	10
624	18	14	2026-06-30 17:17:35.649196+00	10
625	18	15	2026-06-30 17:17:35.649196+00	10
3455	21	13	2026-06-29 15:00:00+00	10
627	18	12	2026-07-01 17:17:35.649196+00	10
628	18	13	2026-07-01 17:17:35.649196+00	10
629	18	14	2026-07-01 17:17:35.649196+00	10
630	18	15	2026-07-01 17:17:35.649196+00	10
3456	21	14	2026-06-29 16:00:00+00	10
632	19	12	2026-06-25 17:17:35.649196+00	10
633	19	13	2026-06-25 17:17:35.649196+00	10
634	19	14	2026-06-25 17:17:35.649196+00	10
635	19	15	2026-06-25 17:17:35.649196+00	10
3457	21	15	2026-06-29 17:00:00+00	10
637	19	12	2026-06-26 17:17:35.649196+00	10
638	19	13	2026-06-26 17:17:35.649196+00	10
639	19	14	2026-06-26 17:17:35.649196+00	10
640	19	15	2026-06-26 17:17:35.649196+00	10
3458	24	12	2026-06-29 14:00:00+00	10
642	19	12	2026-06-27 17:17:35.649196+00	10
643	19	13	2026-06-27 17:17:35.649196+00	10
644	19	14	2026-06-27 17:17:35.649196+00	10
645	19	15	2026-06-27 17:17:35.649196+00	10
3459	24	13	2026-06-29 15:00:00+00	10
647	19	12	2026-06-28 17:17:35.649196+00	10
648	19	13	2026-06-28 17:17:35.649196+00	10
649	19	14	2026-06-28 17:17:35.649196+00	10
650	19	15	2026-06-28 17:17:35.649196+00	10
3460	24	14	2026-06-29 16:00:00+00	10
652	19	12	2026-06-29 17:17:35.649196+00	10
653	19	13	2026-06-29 17:17:35.649196+00	10
654	19	14	2026-06-29 17:17:35.649196+00	10
655	19	15	2026-06-29 17:17:35.649196+00	10
3461	24	15	2026-06-29 17:00:00+00	10
657	19	12	2026-06-30 17:17:35.649196+00	10
658	19	13	2026-06-30 17:17:35.649196+00	10
659	19	14	2026-06-30 17:17:35.649196+00	10
660	19	15	2026-06-30 17:17:35.649196+00	10
3462	35	12	2026-06-29 14:00:00+00	10
662	19	12	2026-07-01 17:17:35.649196+00	10
663	19	13	2026-07-01 17:17:35.649196+00	10
664	19	14	2026-07-01 17:17:35.649196+00	10
665	19	15	2026-07-01 17:17:35.649196+00	10
3463	35	13	2026-06-29 15:00:00+00	10
667	20	12	2026-06-25 17:17:35.649196+00	10
668	20	13	2026-06-25 17:17:35.649196+00	10
669	20	14	2026-06-25 17:17:35.649196+00	10
670	20	15	2026-06-25 17:17:35.649196+00	10
3464	35	14	2026-06-29 16:00:00+00	10
672	20	12	2026-06-26 17:17:35.649196+00	10
673	20	13	2026-06-26 17:17:35.649196+00	10
674	20	14	2026-06-26 17:17:35.649196+00	10
675	20	15	2026-06-26 17:17:35.649196+00	10
3465	35	15	2026-06-29 17:00:00+00	10
677	20	12	2026-06-27 17:17:35.649196+00	10
678	20	13	2026-06-27 17:17:35.649196+00	10
679	20	14	2026-06-27 17:17:35.649196+00	10
680	20	15	2026-06-27 17:17:35.649196+00	10
3466	36	12	2026-06-29 14:00:00+00	10
682	20	12	2026-06-28 17:17:35.649196+00	10
683	20	13	2026-06-28 17:17:35.649196+00	10
684	20	14	2026-06-28 17:17:35.649196+00	10
685	20	15	2026-06-28 17:17:35.649196+00	10
3467	36	13	2026-06-29 15:00:00+00	10
687	20	12	2026-06-29 17:17:35.649196+00	10
688	20	13	2026-06-29 17:17:35.649196+00	10
689	20	14	2026-06-29 17:17:35.649196+00	10
690	20	15	2026-06-29 17:17:35.649196+00	10
3468	36	14	2026-06-29 16:00:00+00	10
692	20	12	2026-06-30 17:17:35.649196+00	10
693	20	13	2026-06-30 17:17:35.649196+00	10
694	20	14	2026-06-30 17:17:35.649196+00	10
695	20	15	2026-06-30 17:17:35.649196+00	10
3469	36	15	2026-06-29 17:00:00+00	10
697	20	12	2026-07-01 17:17:35.649196+00	10
698	20	13	2026-07-01 17:17:35.649196+00	10
699	20	14	2026-07-01 17:17:35.649196+00	10
700	20	15	2026-07-01 17:17:35.649196+00	10
3470	43	12	2026-06-29 14:00:00+00	10
702	21	12	2026-06-25 17:17:35.649196+00	10
703	21	13	2026-06-25 17:17:35.649196+00	10
704	21	14	2026-06-25 17:17:35.649196+00	10
705	21	15	2026-06-25 17:17:35.649196+00	10
3471	43	13	2026-06-29 15:00:00+00	10
707	21	12	2026-06-26 17:17:35.649196+00	10
708	21	13	2026-06-26 17:17:35.649196+00	10
709	21	14	2026-06-26 17:17:35.649196+00	10
710	21	15	2026-06-26 17:17:35.649196+00	10
3472	43	14	2026-06-29 16:00:00+00	10
712	21	12	2026-06-27 17:17:35.649196+00	10
713	21	13	2026-06-27 17:17:35.649196+00	10
714	21	14	2026-06-27 17:17:35.649196+00	10
715	21	15	2026-06-27 17:17:35.649196+00	10
3473	43	15	2026-06-29 17:00:00+00	10
717	21	12	2026-06-28 17:17:35.649196+00	10
718	21	13	2026-06-28 17:17:35.649196+00	10
719	21	14	2026-06-28 17:17:35.649196+00	10
720	21	15	2026-06-28 17:17:35.649196+00	10
3474	46	12	2026-06-29 14:00:00+00	10
722	21	12	2026-06-29 17:17:35.649196+00	10
723	21	13	2026-06-29 17:17:35.649196+00	10
724	21	14	2026-06-29 17:17:35.649196+00	10
725	21	15	2026-06-29 17:17:35.649196+00	10
3475	46	13	2026-06-29 15:00:00+00	10
727	21	12	2026-06-30 17:17:35.649196+00	10
728	21	13	2026-06-30 17:17:35.649196+00	10
729	21	14	2026-06-30 17:17:35.649196+00	10
730	21	15	2026-06-30 17:17:35.649196+00	10
3476	46	14	2026-06-29 16:00:00+00	10
732	21	12	2026-07-01 17:17:35.649196+00	10
733	21	13	2026-07-01 17:17:35.649196+00	10
734	21	14	2026-07-01 17:17:35.649196+00	10
735	21	15	2026-07-01 17:17:35.649196+00	10
3477	46	15	2026-06-29 17:00:00+00	10
737	22	12	2026-06-25 17:17:35.649196+00	10
738	22	13	2026-06-25 17:17:35.649196+00	10
739	22	14	2026-06-25 17:17:35.649196+00	10
740	22	15	2026-06-25 17:17:35.649196+00	10
3478	50	12	2026-06-29 14:00:00+00	10
742	22	12	2026-06-26 17:17:35.649196+00	10
743	22	13	2026-06-26 17:17:35.649196+00	10
744	22	14	2026-06-26 17:17:35.649196+00	10
745	22	15	2026-06-26 17:17:35.649196+00	10
3479	50	13	2026-06-29 15:00:00+00	10
747	22	12	2026-06-27 17:17:35.649196+00	10
748	22	13	2026-06-27 17:17:35.649196+00	10
749	22	14	2026-06-27 17:17:35.649196+00	10
750	22	15	2026-06-27 17:17:35.649196+00	10
3480	50	14	2026-06-29 16:00:00+00	10
752	22	12	2026-06-28 17:17:35.649196+00	10
753	22	13	2026-06-28 17:17:35.649196+00	10
754	22	14	2026-06-28 17:17:35.649196+00	10
755	22	15	2026-06-28 17:17:35.649196+00	10
3481	50	15	2026-06-29 17:00:00+00	10
757	22	12	2026-06-29 17:17:35.649196+00	10
758	22	13	2026-06-29 17:17:35.649196+00	10
759	22	14	2026-06-29 17:17:35.649196+00	10
760	22	15	2026-06-29 17:17:35.649196+00	10
3482	14	12	2026-06-30 14:00:00+00	10
762	22	12	2026-06-30 17:17:35.649196+00	10
763	22	13	2026-06-30 17:17:35.649196+00	10
764	22	14	2026-06-30 17:17:35.649196+00	10
765	22	15	2026-06-30 17:17:35.649196+00	10
3483	14	13	2026-06-30 15:00:00+00	10
767	22	12	2026-07-01 17:17:35.649196+00	10
768	22	13	2026-07-01 17:17:35.649196+00	10
769	22	14	2026-07-01 17:17:35.649196+00	10
770	22	15	2026-07-01 17:17:35.649196+00	10
3484	14	14	2026-06-30 16:00:00+00	10
772	23	12	2026-06-25 17:17:35.649196+00	10
773	23	13	2026-06-25 17:17:35.649196+00	10
774	23	14	2026-06-25 17:17:35.649196+00	10
775	23	15	2026-06-25 17:17:35.649196+00	10
3485	14	15	2026-06-30 17:00:00+00	10
777	23	12	2026-06-26 17:17:35.649196+00	10
778	23	13	2026-06-26 17:17:35.649196+00	10
779	23	14	2026-06-26 17:17:35.649196+00	10
780	23	15	2026-06-26 17:17:35.649196+00	10
3486	21	12	2026-06-30 14:00:00+00	10
782	23	12	2026-06-27 17:17:35.649196+00	10
783	23	13	2026-06-27 17:17:35.649196+00	10
784	23	14	2026-06-27 17:17:35.649196+00	10
785	23	15	2026-06-27 17:17:35.649196+00	10
3487	21	13	2026-06-30 15:00:00+00	10
787	23	12	2026-06-28 17:17:35.649196+00	10
788	23	13	2026-06-28 17:17:35.649196+00	10
789	23	14	2026-06-28 17:17:35.649196+00	10
790	23	15	2026-06-28 17:17:35.649196+00	10
3488	21	14	2026-06-30 16:00:00+00	10
792	23	12	2026-06-29 17:17:35.649196+00	10
793	23	13	2026-06-29 17:17:35.649196+00	10
794	23	14	2026-06-29 17:17:35.649196+00	10
795	23	15	2026-06-29 17:17:35.649196+00	10
3489	21	15	2026-06-30 17:00:00+00	10
797	23	12	2026-06-30 17:17:35.649196+00	10
798	23	13	2026-06-30 17:17:35.649196+00	10
799	23	14	2026-06-30 17:17:35.649196+00	10
800	23	15	2026-06-30 17:17:35.649196+00	10
3490	24	12	2026-06-30 14:00:00+00	10
802	23	12	2026-07-01 17:17:35.649196+00	10
803	23	13	2026-07-01 17:17:35.649196+00	10
804	23	14	2026-07-01 17:17:35.649196+00	10
805	23	15	2026-07-01 17:17:35.649196+00	10
3491	24	13	2026-06-30 15:00:00+00	10
807	24	12	2026-06-25 17:17:35.649196+00	10
808	24	13	2026-06-25 17:17:35.649196+00	10
809	24	14	2026-06-25 17:17:35.649196+00	10
810	24	15	2026-06-25 17:17:35.649196+00	10
3492	24	14	2026-06-30 16:00:00+00	10
812	24	12	2026-06-26 17:17:35.649196+00	10
813	24	13	2026-06-26 17:17:35.649196+00	10
814	24	14	2026-06-26 17:17:35.649196+00	10
815	24	15	2026-06-26 17:17:35.649196+00	10
3493	24	15	2026-06-30 17:00:00+00	10
817	24	12	2026-06-27 17:17:35.649196+00	10
818	24	13	2026-06-27 17:17:35.649196+00	10
819	24	14	2026-06-27 17:17:35.649196+00	10
820	24	15	2026-06-27 17:17:35.649196+00	10
3494	35	12	2026-06-30 14:00:00+00	10
822	24	12	2026-06-28 17:17:35.649196+00	10
823	24	13	2026-06-28 17:17:35.649196+00	10
824	24	14	2026-06-28 17:17:35.649196+00	10
825	24	15	2026-06-28 17:17:35.649196+00	10
3495	35	13	2026-06-30 15:00:00+00	10
827	24	12	2026-06-29 17:17:35.649196+00	10
828	24	13	2026-06-29 17:17:35.649196+00	10
829	24	14	2026-06-29 17:17:35.649196+00	10
830	24	15	2026-06-29 17:17:35.649196+00	10
3496	35	14	2026-06-30 16:00:00+00	10
832	24	12	2026-06-30 17:17:35.649196+00	10
833	24	13	2026-06-30 17:17:35.649196+00	10
834	24	14	2026-06-30 17:17:35.649196+00	10
835	24	15	2026-06-30 17:17:35.649196+00	10
3497	35	15	2026-06-30 17:00:00+00	10
837	24	12	2026-07-01 17:17:35.649196+00	10
838	24	13	2026-07-01 17:17:35.649196+00	10
839	24	14	2026-07-01 17:17:35.649196+00	10
840	24	15	2026-07-01 17:17:35.649196+00	10
3498	36	12	2026-06-30 14:00:00+00	10
842	25	12	2026-06-25 17:17:35.649196+00	10
843	25	13	2026-06-25 17:17:35.649196+00	10
844	25	14	2026-06-25 17:17:35.649196+00	10
845	25	15	2026-06-25 17:17:35.649196+00	10
3499	36	13	2026-06-30 15:00:00+00	10
847	25	12	2026-06-26 17:17:35.649196+00	10
848	25	13	2026-06-26 17:17:35.649196+00	10
849	25	14	2026-06-26 17:17:35.649196+00	10
850	25	15	2026-06-26 17:17:35.649196+00	10
3500	36	14	2026-06-30 16:00:00+00	10
852	25	12	2026-06-27 17:17:35.649196+00	10
853	25	13	2026-06-27 17:17:35.649196+00	10
854	25	14	2026-06-27 17:17:35.649196+00	10
855	25	15	2026-06-27 17:17:35.649196+00	10
3501	36	15	2026-06-30 17:00:00+00	10
857	25	12	2026-06-28 17:17:35.649196+00	10
858	25	13	2026-06-28 17:17:35.649196+00	10
859	25	14	2026-06-28 17:17:35.649196+00	10
860	25	15	2026-06-28 17:17:35.649196+00	10
3502	43	12	2026-06-30 14:00:00+00	10
862	25	12	2026-06-29 17:17:35.649196+00	10
863	25	13	2026-06-29 17:17:35.649196+00	10
864	25	14	2026-06-29 17:17:35.649196+00	10
865	25	15	2026-06-29 17:17:35.649196+00	10
3503	43	13	2026-06-30 15:00:00+00	10
867	25	12	2026-06-30 17:17:35.649196+00	10
868	25	13	2026-06-30 17:17:35.649196+00	10
869	25	14	2026-06-30 17:17:35.649196+00	10
870	25	15	2026-06-30 17:17:35.649196+00	10
3504	43	14	2026-06-30 16:00:00+00	10
872	25	12	2026-07-01 17:17:35.649196+00	10
873	25	13	2026-07-01 17:17:35.649196+00	10
874	25	14	2026-07-01 17:17:35.649196+00	10
875	25	15	2026-07-01 17:17:35.649196+00	10
3505	43	15	2026-06-30 17:00:00+00	10
877	26	12	2026-06-25 17:17:35.649196+00	10
878	26	13	2026-06-25 17:17:35.649196+00	10
879	26	14	2026-06-25 17:17:35.649196+00	10
880	26	15	2026-06-25 17:17:35.649196+00	10
3506	46	12	2026-06-30 14:00:00+00	10
882	26	12	2026-06-26 17:17:35.649196+00	10
883	26	13	2026-06-26 17:17:35.649196+00	10
884	26	14	2026-06-26 17:17:35.649196+00	10
885	26	15	2026-06-26 17:17:35.649196+00	10
3507	46	13	2026-06-30 15:00:00+00	10
887	26	12	2026-06-27 17:17:35.649196+00	10
888	26	13	2026-06-27 17:17:35.649196+00	10
889	26	14	2026-06-27 17:17:35.649196+00	10
890	26	15	2026-06-27 17:17:35.649196+00	10
3508	46	14	2026-06-30 16:00:00+00	10
892	26	12	2026-06-28 17:17:35.649196+00	10
893	26	13	2026-06-28 17:17:35.649196+00	10
894	26	14	2026-06-28 17:17:35.649196+00	10
895	26	15	2026-06-28 17:17:35.649196+00	10
3509	46	15	2026-06-30 17:00:00+00	10
897	26	12	2026-06-29 17:17:35.649196+00	10
898	26	13	2026-06-29 17:17:35.649196+00	10
899	26	14	2026-06-29 17:17:35.649196+00	10
900	26	15	2026-06-29 17:17:35.649196+00	10
3510	50	12	2026-06-30 14:00:00+00	10
902	26	12	2026-06-30 17:17:35.649196+00	10
903	26	13	2026-06-30 17:17:35.649196+00	10
904	26	14	2026-06-30 17:17:35.649196+00	10
905	26	15	2026-06-30 17:17:35.649196+00	10
3511	50	13	2026-06-30 15:00:00+00	10
907	26	12	2026-07-01 17:17:35.649196+00	10
908	26	13	2026-07-01 17:17:35.649196+00	10
909	26	14	2026-07-01 17:17:35.649196+00	10
910	26	15	2026-07-01 17:17:35.649196+00	10
3512	50	14	2026-06-30 16:00:00+00	10
912	27	12	2026-06-25 17:17:35.649196+00	10
913	27	13	2026-06-25 17:17:35.649196+00	10
914	27	14	2026-06-25 17:17:35.649196+00	10
915	27	15	2026-06-25 17:17:35.649196+00	10
3513	50	15	2026-06-30 17:00:00+00	10
917	27	12	2026-06-26 17:17:35.649196+00	10
918	27	13	2026-06-26 17:17:35.649196+00	10
919	27	14	2026-06-26 17:17:35.649196+00	10
920	27	15	2026-06-26 17:17:35.649196+00	10
3514	14	12	2026-07-01 14:00:00+00	10
922	27	12	2026-06-27 17:17:35.649196+00	10
923	27	13	2026-06-27 17:17:35.649196+00	10
924	27	14	2026-06-27 17:17:35.649196+00	10
925	27	15	2026-06-27 17:17:35.649196+00	10
3515	14	13	2026-07-01 15:00:00+00	10
927	27	12	2026-06-28 17:17:35.649196+00	10
928	27	13	2026-06-28 17:17:35.649196+00	10
929	27	14	2026-06-28 17:17:35.649196+00	10
930	27	15	2026-06-28 17:17:35.649196+00	10
3516	14	14	2026-07-01 16:00:00+00	10
932	27	12	2026-06-29 17:17:35.649196+00	10
933	27	13	2026-06-29 17:17:35.649196+00	10
934	27	14	2026-06-29 17:17:35.649196+00	10
935	27	15	2026-06-29 17:17:35.649196+00	10
3517	14	15	2026-07-01 17:00:00+00	10
937	27	12	2026-06-30 17:17:35.649196+00	10
938	27	13	2026-06-30 17:17:35.649196+00	10
939	27	14	2026-06-30 17:17:35.649196+00	10
940	27	15	2026-06-30 17:17:35.649196+00	10
3518	21	12	2026-07-01 14:00:00+00	10
942	27	12	2026-07-01 17:17:35.649196+00	10
943	27	13	2026-07-01 17:17:35.649196+00	10
944	27	14	2026-07-01 17:17:35.649196+00	10
945	27	15	2026-07-01 17:17:35.649196+00	10
3519	21	13	2026-07-01 15:00:00+00	10
947	28	12	2026-06-25 17:17:35.649196+00	10
948	28	13	2026-06-25 17:17:35.649196+00	10
949	28	14	2026-06-25 17:17:35.649196+00	10
950	28	15	2026-06-25 17:17:35.649196+00	10
3520	21	14	2026-07-01 16:00:00+00	10
952	28	12	2026-06-26 17:17:35.649196+00	10
953	28	13	2026-06-26 17:17:35.649196+00	10
954	28	14	2026-06-26 17:17:35.649196+00	10
955	28	15	2026-06-26 17:17:35.649196+00	10
3521	21	15	2026-07-01 17:00:00+00	10
957	28	12	2026-06-27 17:17:35.649196+00	10
958	28	13	2026-06-27 17:17:35.649196+00	10
959	28	14	2026-06-27 17:17:35.649196+00	10
960	28	15	2026-06-27 17:17:35.649196+00	10
3522	24	12	2026-07-01 14:00:00+00	10
962	28	12	2026-06-28 17:17:35.649196+00	10
963	28	13	2026-06-28 17:17:35.649196+00	10
964	28	14	2026-06-28 17:17:35.649196+00	10
965	28	15	2026-06-28 17:17:35.649196+00	10
3523	24	13	2026-07-01 15:00:00+00	10
967	28	12	2026-06-29 17:17:35.649196+00	10
968	28	13	2026-06-29 17:17:35.649196+00	10
969	28	14	2026-06-29 17:17:35.649196+00	10
970	28	15	2026-06-29 17:17:35.649196+00	10
3524	24	14	2026-07-01 16:00:00+00	10
972	28	12	2026-06-30 17:17:35.649196+00	10
973	28	13	2026-06-30 17:17:35.649196+00	10
974	28	14	2026-06-30 17:17:35.649196+00	10
975	28	15	2026-06-30 17:17:35.649196+00	10
3525	24	15	2026-07-01 17:00:00+00	10
977	28	12	2026-07-01 17:17:35.649196+00	10
978	28	13	2026-07-01 17:17:35.649196+00	10
979	28	14	2026-07-01 17:17:35.649196+00	10
980	28	15	2026-07-01 17:17:35.649196+00	10
3526	35	12	2026-07-01 14:00:00+00	10
982	29	12	2026-06-25 17:17:35.649196+00	10
983	29	13	2026-06-25 17:17:35.649196+00	10
984	29	14	2026-06-25 17:17:35.649196+00	10
985	29	15	2026-06-25 17:17:35.649196+00	10
3527	35	13	2026-07-01 15:00:00+00	10
987	29	12	2026-06-26 17:17:35.649196+00	10
988	29	13	2026-06-26 17:17:35.649196+00	10
989	29	14	2026-06-26 17:17:35.649196+00	10
990	29	15	2026-06-26 17:17:35.649196+00	10
3528	35	14	2026-07-01 16:00:00+00	10
992	29	12	2026-06-27 17:17:35.649196+00	10
993	29	13	2026-06-27 17:17:35.649196+00	10
994	29	14	2026-06-27 17:17:35.649196+00	10
995	29	15	2026-06-27 17:17:35.649196+00	10
3529	35	15	2026-07-01 17:00:00+00	10
997	29	12	2026-06-28 17:17:35.649196+00	10
998	29	13	2026-06-28 17:17:35.649196+00	10
999	29	14	2026-06-28 17:17:35.649196+00	10
1000	29	15	2026-06-28 17:17:35.649196+00	10
3530	36	12	2026-07-01 14:00:00+00	10
1002	29	12	2026-06-29 17:17:35.649196+00	10
1003	29	13	2026-06-29 17:17:35.649196+00	10
1004	29	14	2026-06-29 17:17:35.649196+00	10
1005	29	15	2026-06-29 17:17:35.649196+00	10
3531	36	13	2026-07-01 15:00:00+00	10
1007	29	12	2026-06-30 17:17:35.649196+00	10
1008	29	13	2026-06-30 17:17:35.649196+00	10
1009	29	14	2026-06-30 17:17:35.649196+00	10
1010	29	15	2026-06-30 17:17:35.649196+00	10
3532	36	14	2026-07-01 16:00:00+00	10
1012	29	12	2026-07-01 17:17:35.649196+00	10
1013	29	13	2026-07-01 17:17:35.649196+00	10
1014	29	14	2026-07-01 17:17:35.649196+00	10
1015	29	15	2026-07-01 17:17:35.649196+00	10
3533	36	15	2026-07-01 17:00:00+00	10
1017	30	12	2026-06-25 17:17:35.649196+00	10
1018	30	13	2026-06-25 17:17:35.649196+00	10
1019	30	14	2026-06-25 17:17:35.649196+00	10
1020	30	15	2026-06-25 17:17:35.649196+00	10
3534	43	12	2026-07-01 14:00:00+00	10
1022	30	12	2026-06-26 17:17:35.649196+00	10
1023	30	13	2026-06-26 17:17:35.649196+00	10
1024	30	14	2026-06-26 17:17:35.649196+00	10
1025	30	15	2026-06-26 17:17:35.649196+00	10
3535	43	13	2026-07-01 15:00:00+00	10
1027	30	12	2026-06-27 17:17:35.649196+00	10
1028	30	13	2026-06-27 17:17:35.649196+00	10
1029	30	14	2026-06-27 17:17:35.649196+00	10
1030	30	15	2026-06-27 17:17:35.649196+00	10
3536	43	14	2026-07-01 16:00:00+00	10
1032	30	12	2026-06-28 17:17:35.649196+00	10
1033	30	13	2026-06-28 17:17:35.649196+00	10
1034	30	14	2026-06-28 17:17:35.649196+00	10
1035	30	15	2026-06-28 17:17:35.649196+00	10
3537	43	15	2026-07-01 17:00:00+00	10
1037	30	12	2026-06-29 17:17:35.649196+00	10
1038	30	13	2026-06-29 17:17:35.649196+00	10
1039	30	14	2026-06-29 17:17:35.649196+00	10
1040	30	15	2026-06-29 17:17:35.649196+00	10
3538	46	12	2026-07-01 14:00:00+00	10
1042	30	12	2026-06-30 17:17:35.649196+00	10
1043	30	13	2026-06-30 17:17:35.649196+00	10
1044	30	14	2026-06-30 17:17:35.649196+00	10
1045	30	15	2026-06-30 17:17:35.649196+00	10
3539	46	13	2026-07-01 15:00:00+00	10
1047	30	12	2026-07-01 17:17:35.649196+00	10
1048	30	13	2026-07-01 17:17:35.649196+00	10
1049	30	14	2026-07-01 17:17:35.649196+00	10
1050	30	15	2026-07-01 17:17:35.649196+00	10
3540	46	14	2026-07-01 16:00:00+00	10
1052	31	12	2026-06-25 17:17:35.649196+00	10
1053	31	13	2026-06-25 17:17:35.649196+00	10
1054	31	14	2026-06-25 17:17:35.649196+00	10
1055	31	15	2026-06-25 17:17:35.649196+00	10
3541	46	15	2026-07-01 17:00:00+00	10
1057	31	12	2026-06-26 17:17:35.649196+00	10
1058	31	13	2026-06-26 17:17:35.649196+00	10
1059	31	14	2026-06-26 17:17:35.649196+00	10
1060	31	15	2026-06-26 17:17:35.649196+00	10
3542	50	12	2026-07-01 14:00:00+00	10
1062	31	12	2026-06-27 17:17:35.649196+00	10
1063	31	13	2026-06-27 17:17:35.649196+00	10
1064	31	14	2026-06-27 17:17:35.649196+00	10
1065	31	15	2026-06-27 17:17:35.649196+00	10
3543	50	13	2026-07-01 15:00:00+00	10
1067	31	12	2026-06-28 17:17:35.649196+00	10
1068	31	13	2026-06-28 17:17:35.649196+00	10
1069	31	14	2026-06-28 17:17:35.649196+00	10
1070	31	15	2026-06-28 17:17:35.649196+00	10
3544	50	14	2026-07-01 16:00:00+00	10
1072	31	12	2026-06-29 17:17:35.649196+00	10
1073	31	13	2026-06-29 17:17:35.649196+00	10
1074	31	14	2026-06-29 17:17:35.649196+00	10
1075	31	15	2026-06-29 17:17:35.649196+00	10
3545	50	15	2026-07-01 17:00:00+00	10
1077	31	12	2026-06-30 17:17:35.649196+00	10
1078	31	13	2026-06-30 17:17:35.649196+00	10
1079	31	14	2026-06-30 17:17:35.649196+00	10
1080	31	15	2026-06-30 17:17:35.649196+00	10
3546	14	12	2026-07-02 14:00:00+00	10
1082	31	12	2026-07-01 17:17:35.649196+00	10
1083	31	13	2026-07-01 17:17:35.649196+00	10
1084	31	14	2026-07-01 17:17:35.649196+00	10
1085	31	15	2026-07-01 17:17:35.649196+00	10
3547	14	13	2026-07-02 15:00:00+00	10
1087	32	12	2026-06-25 17:17:35.649196+00	10
1088	32	13	2026-06-25 17:17:35.649196+00	10
1089	32	14	2026-06-25 17:17:35.649196+00	10
1090	32	15	2026-06-25 17:17:35.649196+00	10
3548	14	14	2026-07-02 16:00:00+00	10
1092	32	12	2026-06-26 17:17:35.649196+00	10
1093	32	13	2026-06-26 17:17:35.649196+00	10
1094	32	14	2026-06-26 17:17:35.649196+00	10
1095	32	15	2026-06-26 17:17:35.649196+00	10
3549	14	15	2026-07-02 17:00:00+00	10
1097	32	12	2026-06-27 17:17:35.649196+00	10
1098	32	13	2026-06-27 17:17:35.649196+00	10
1099	32	14	2026-06-27 17:17:35.649196+00	10
1100	32	15	2026-06-27 17:17:35.649196+00	10
3550	21	12	2026-07-02 14:00:00+00	10
1102	32	12	2026-06-28 17:17:35.649196+00	10
1103	32	13	2026-06-28 17:17:35.649196+00	10
1104	32	14	2026-06-28 17:17:35.649196+00	10
1105	32	15	2026-06-28 17:17:35.649196+00	10
3551	21	13	2026-07-02 15:00:00+00	10
1107	32	12	2026-06-29 17:17:35.649196+00	10
1108	32	13	2026-06-29 17:17:35.649196+00	10
1109	32	14	2026-06-29 17:17:35.649196+00	10
1110	32	15	2026-06-29 17:17:35.649196+00	10
3552	21	14	2026-07-02 16:00:00+00	10
1112	32	12	2026-06-30 17:17:35.649196+00	10
1113	32	13	2026-06-30 17:17:35.649196+00	10
1114	32	14	2026-06-30 17:17:35.649196+00	10
1115	32	15	2026-06-30 17:17:35.649196+00	10
3553	21	15	2026-07-02 17:00:00+00	10
1117	32	12	2026-07-01 17:17:35.649196+00	10
1118	32	13	2026-07-01 17:17:35.649196+00	10
1119	32	14	2026-07-01 17:17:35.649196+00	10
1120	32	15	2026-07-01 17:17:35.649196+00	10
3554	24	12	2026-07-02 14:00:00+00	10
1122	33	12	2026-06-25 17:17:35.649196+00	10
1123	33	13	2026-06-25 17:17:35.649196+00	10
1124	33	14	2026-06-25 17:17:35.649196+00	10
1125	33	15	2026-06-25 17:17:35.649196+00	10
3555	24	13	2026-07-02 15:00:00+00	10
1127	33	12	2026-06-26 17:17:35.649196+00	10
1128	33	13	2026-06-26 17:17:35.649196+00	10
1129	33	14	2026-06-26 17:17:35.649196+00	10
1130	33	15	2026-06-26 17:17:35.649196+00	10
3556	24	14	2026-07-02 16:00:00+00	10
1132	33	12	2026-06-27 17:17:35.649196+00	10
1133	33	13	2026-06-27 17:17:35.649196+00	10
1134	33	14	2026-06-27 17:17:35.649196+00	10
1135	33	15	2026-06-27 17:17:35.649196+00	10
3557	24	15	2026-07-02 17:00:00+00	10
1137	33	12	2026-06-28 17:17:35.649196+00	10
1138	33	13	2026-06-28 17:17:35.649196+00	10
1139	33	14	2026-06-28 17:17:35.649196+00	10
1140	33	15	2026-06-28 17:17:35.649196+00	10
3558	35	12	2026-07-02 14:00:00+00	10
1142	33	12	2026-06-29 17:17:35.649196+00	10
1143	33	13	2026-06-29 17:17:35.649196+00	10
1144	33	14	2026-06-29 17:17:35.649196+00	10
1145	33	15	2026-06-29 17:17:35.649196+00	10
3559	35	13	2026-07-02 15:00:00+00	10
1147	33	12	2026-06-30 17:17:35.649196+00	10
1148	33	13	2026-06-30 17:17:35.649196+00	10
1149	33	14	2026-06-30 17:17:35.649196+00	10
1150	33	15	2026-06-30 17:17:35.649196+00	10
3560	35	14	2026-07-02 16:00:00+00	10
1152	33	12	2026-07-01 17:17:35.649196+00	10
1153	33	13	2026-07-01 17:17:35.649196+00	10
1154	33	14	2026-07-01 17:17:35.649196+00	10
1155	33	15	2026-07-01 17:17:35.649196+00	10
3561	35	15	2026-07-02 17:00:00+00	10
1157	34	12	2026-06-25 17:17:35.649196+00	10
1158	34	13	2026-06-25 17:17:35.649196+00	10
1159	34	14	2026-06-25 17:17:35.649196+00	10
1160	34	15	2026-06-25 17:17:35.649196+00	10
3562	36	12	2026-07-02 14:00:00+00	10
1162	34	12	2026-06-26 17:17:35.649196+00	10
1163	34	13	2026-06-26 17:17:35.649196+00	10
1164	34	14	2026-06-26 17:17:35.649196+00	10
1165	34	15	2026-06-26 17:17:35.649196+00	10
3563	36	13	2026-07-02 15:00:00+00	10
1167	34	12	2026-06-27 17:17:35.649196+00	10
1168	34	13	2026-06-27 17:17:35.649196+00	10
1169	34	14	2026-06-27 17:17:35.649196+00	10
1170	34	15	2026-06-27 17:17:35.649196+00	10
3564	36	14	2026-07-02 16:00:00+00	10
1172	34	12	2026-06-28 17:17:35.649196+00	10
1173	34	13	2026-06-28 17:17:35.649196+00	10
1174	34	14	2026-06-28 17:17:35.649196+00	10
1175	34	15	2026-06-28 17:17:35.649196+00	10
3565	36	15	2026-07-02 17:00:00+00	10
1177	34	12	2026-06-29 17:17:35.649196+00	10
1178	34	13	2026-06-29 17:17:35.649196+00	10
1179	34	14	2026-06-29 17:17:35.649196+00	10
1180	34	15	2026-06-29 17:17:35.649196+00	10
3566	43	12	2026-07-02 14:00:00+00	10
1182	34	12	2026-06-30 17:17:35.649196+00	10
1183	34	13	2026-06-30 17:17:35.649196+00	10
1184	34	14	2026-06-30 17:17:35.649196+00	10
1185	34	15	2026-06-30 17:17:35.649196+00	10
3567	43	13	2026-07-02 15:00:00+00	10
1187	34	12	2026-07-01 17:17:35.649196+00	10
1188	34	13	2026-07-01 17:17:35.649196+00	10
1189	34	14	2026-07-01 17:17:35.649196+00	10
1190	34	15	2026-07-01 17:17:35.649196+00	10
3568	43	14	2026-07-02 16:00:00+00	10
1192	35	12	2026-06-25 17:17:35.649196+00	10
1193	35	13	2026-06-25 17:17:35.649196+00	10
1194	35	14	2026-06-25 17:17:35.649196+00	10
1195	35	15	2026-06-25 17:17:35.649196+00	10
3569	43	15	2026-07-02 17:00:00+00	10
1197	35	12	2026-06-26 17:17:35.649196+00	10
1198	35	13	2026-06-26 17:17:35.649196+00	10
1199	35	14	2026-06-26 17:17:35.649196+00	10
1200	35	15	2026-06-26 17:17:35.649196+00	10
3570	46	12	2026-07-02 14:00:00+00	10
1202	35	12	2026-06-27 17:17:35.649196+00	10
1203	35	13	2026-06-27 17:17:35.649196+00	10
1204	35	14	2026-06-27 17:17:35.649196+00	10
1205	35	15	2026-06-27 17:17:35.649196+00	10
3571	46	13	2026-07-02 15:00:00+00	10
1207	35	12	2026-06-28 17:17:35.649196+00	10
1208	35	13	2026-06-28 17:17:35.649196+00	10
1209	35	14	2026-06-28 17:17:35.649196+00	10
1210	35	15	2026-06-28 17:17:35.649196+00	10
3572	46	14	2026-07-02 16:00:00+00	10
1212	35	12	2026-06-29 17:17:35.649196+00	10
1213	35	13	2026-06-29 17:17:35.649196+00	10
1214	35	14	2026-06-29 17:17:35.649196+00	10
1215	35	15	2026-06-29 17:17:35.649196+00	10
3573	46	15	2026-07-02 17:00:00+00	10
1217	35	12	2026-06-30 17:17:35.649196+00	10
1218	35	13	2026-06-30 17:17:35.649196+00	10
1219	35	14	2026-06-30 17:17:35.649196+00	10
1220	35	15	2026-06-30 17:17:35.649196+00	10
3574	50	12	2026-07-02 14:00:00+00	10
1222	35	12	2026-07-01 17:17:35.649196+00	10
1223	35	13	2026-07-01 17:17:35.649196+00	10
1224	35	14	2026-07-01 17:17:35.649196+00	10
1225	35	15	2026-07-01 17:17:35.649196+00	10
3575	50	13	2026-07-02 15:00:00+00	10
1227	36	12	2026-06-25 17:17:35.649196+00	10
1228	36	13	2026-06-25 17:17:35.649196+00	10
1229	36	14	2026-06-25 17:17:35.649196+00	10
1230	36	15	2026-06-25 17:17:35.649196+00	10
3576	50	14	2026-07-02 16:00:00+00	10
1232	36	12	2026-06-26 17:17:35.649196+00	10
1233	36	13	2026-06-26 17:17:35.649196+00	10
1234	36	14	2026-06-26 17:17:35.649196+00	10
1235	36	15	2026-06-26 17:17:35.649196+00	10
3577	50	15	2026-07-02 17:00:00+00	10
1237	36	12	2026-06-27 17:17:35.649196+00	10
1238	36	13	2026-06-27 17:17:35.649196+00	10
1239	36	14	2026-06-27 17:17:35.649196+00	10
1240	36	15	2026-06-27 17:17:35.649196+00	10
3578	14	12	2026-07-03 14:00:00+00	10
1242	36	12	2026-06-28 17:17:35.649196+00	10
1243	36	13	2026-06-28 17:17:35.649196+00	10
1244	36	14	2026-06-28 17:17:35.649196+00	10
1245	36	15	2026-06-28 17:17:35.649196+00	10
3579	14	13	2026-07-03 15:00:00+00	10
1247	36	12	2026-06-29 17:17:35.649196+00	10
1248	36	13	2026-06-29 17:17:35.649196+00	10
1249	36	14	2026-06-29 17:17:35.649196+00	10
1250	36	15	2026-06-29 17:17:35.649196+00	10
3580	14	14	2026-07-03 16:00:00+00	10
1252	36	12	2026-06-30 17:17:35.649196+00	10
1253	36	13	2026-06-30 17:17:35.649196+00	10
1254	36	14	2026-06-30 17:17:35.649196+00	10
1255	36	15	2026-06-30 17:17:35.649196+00	10
3581	14	15	2026-07-03 17:00:00+00	10
1257	36	12	2026-07-01 17:17:35.649196+00	10
1258	36	13	2026-07-01 17:17:35.649196+00	10
1259	36	14	2026-07-01 17:17:35.649196+00	10
1260	36	15	2026-07-01 17:17:35.649196+00	10
3582	21	12	2026-07-03 14:00:00+00	10
1262	37	12	2026-06-25 17:17:35.649196+00	10
1263	37	13	2026-06-25 17:17:35.649196+00	10
1264	37	14	2026-06-25 17:17:35.649196+00	10
1265	37	15	2026-06-25 17:17:35.649196+00	10
3583	21	13	2026-07-03 15:00:00+00	10
1267	37	12	2026-06-26 17:17:35.649196+00	10
1268	37	13	2026-06-26 17:17:35.649196+00	10
1269	37	14	2026-06-26 17:17:35.649196+00	10
1270	37	15	2026-06-26 17:17:35.649196+00	10
3584	21	14	2026-07-03 16:00:00+00	10
1272	37	12	2026-06-27 17:17:35.649196+00	10
1273	37	13	2026-06-27 17:17:35.649196+00	10
1274	37	14	2026-06-27 17:17:35.649196+00	10
1275	37	15	2026-06-27 17:17:35.649196+00	10
3585	21	15	2026-07-03 17:00:00+00	10
1277	37	12	2026-06-28 17:17:35.649196+00	10
1278	37	13	2026-06-28 17:17:35.649196+00	10
1279	37	14	2026-06-28 17:17:35.649196+00	10
1280	37	15	2026-06-28 17:17:35.649196+00	10
3586	24	12	2026-07-03 14:00:00+00	10
1282	37	12	2026-06-29 17:17:35.649196+00	10
1283	37	13	2026-06-29 17:17:35.649196+00	10
1284	37	14	2026-06-29 17:17:35.649196+00	10
1285	37	15	2026-06-29 17:17:35.649196+00	10
3587	24	13	2026-07-03 15:00:00+00	10
1287	37	12	2026-06-30 17:17:35.649196+00	10
1288	37	13	2026-06-30 17:17:35.649196+00	10
1289	37	14	2026-06-30 17:17:35.649196+00	10
1290	37	15	2026-06-30 17:17:35.649196+00	10
3588	24	14	2026-07-03 16:00:00+00	10
1292	37	12	2026-07-01 17:17:35.649196+00	10
1293	37	13	2026-07-01 17:17:35.649196+00	10
1294	37	14	2026-07-01 17:17:35.649196+00	10
1295	37	15	2026-07-01 17:17:35.649196+00	10
3589	24	15	2026-07-03 17:00:00+00	10
1297	38	12	2026-06-25 17:17:35.649196+00	10
1298	38	13	2026-06-25 17:17:35.649196+00	10
1299	38	14	2026-06-25 17:17:35.649196+00	10
1300	38	15	2026-06-25 17:17:35.649196+00	10
3590	35	12	2026-07-03 14:00:00+00	10
1302	38	12	2026-06-26 17:17:35.649196+00	10
1303	38	13	2026-06-26 17:17:35.649196+00	10
1304	38	14	2026-06-26 17:17:35.649196+00	10
1305	38	15	2026-06-26 17:17:35.649196+00	10
3591	35	13	2026-07-03 15:00:00+00	10
1307	38	12	2026-06-27 17:17:35.649196+00	10
1308	38	13	2026-06-27 17:17:35.649196+00	10
1309	38	14	2026-06-27 17:17:35.649196+00	10
1310	38	15	2026-06-27 17:17:35.649196+00	10
3592	35	14	2026-07-03 16:00:00+00	10
1312	38	12	2026-06-28 17:17:35.649196+00	10
1313	38	13	2026-06-28 17:17:35.649196+00	10
1314	38	14	2026-06-28 17:17:35.649196+00	10
1315	38	15	2026-06-28 17:17:35.649196+00	10
3593	35	15	2026-07-03 17:00:00+00	10
1317	38	12	2026-06-29 17:17:35.649196+00	10
1318	38	13	2026-06-29 17:17:35.649196+00	10
1319	38	14	2026-06-29 17:17:35.649196+00	10
1320	38	15	2026-06-29 17:17:35.649196+00	10
3594	36	12	2026-07-03 14:00:00+00	10
1322	38	12	2026-06-30 17:17:35.649196+00	10
1323	38	13	2026-06-30 17:17:35.649196+00	10
1324	38	14	2026-06-30 17:17:35.649196+00	10
1325	38	15	2026-06-30 17:17:35.649196+00	10
3595	36	13	2026-07-03 15:00:00+00	10
1327	38	12	2026-07-01 17:17:35.649196+00	10
1328	38	13	2026-07-01 17:17:35.649196+00	10
1329	38	14	2026-07-01 17:17:35.649196+00	10
1330	38	15	2026-07-01 17:17:35.649196+00	10
3596	36	14	2026-07-03 16:00:00+00	10
1332	39	12	2026-06-25 17:17:35.649196+00	10
1333	39	13	2026-06-25 17:17:35.649196+00	10
1334	39	14	2026-06-25 17:17:35.649196+00	10
1335	39	15	2026-06-25 17:17:35.649196+00	10
3597	36	15	2026-07-03 17:00:00+00	10
1337	39	12	2026-06-26 17:17:35.649196+00	10
1338	39	13	2026-06-26 17:17:35.649196+00	10
1339	39	14	2026-06-26 17:17:35.649196+00	10
1340	39	15	2026-06-26 17:17:35.649196+00	10
3598	43	12	2026-07-03 14:00:00+00	10
1342	39	12	2026-06-27 17:17:35.649196+00	10
1343	39	13	2026-06-27 17:17:35.649196+00	10
1344	39	14	2026-06-27 17:17:35.649196+00	10
1345	39	15	2026-06-27 17:17:35.649196+00	10
3599	43	13	2026-07-03 15:00:00+00	10
1347	39	12	2026-06-28 17:17:35.649196+00	10
1348	39	13	2026-06-28 17:17:35.649196+00	10
1349	39	14	2026-06-28 17:17:35.649196+00	10
1350	39	15	2026-06-28 17:17:35.649196+00	10
3600	43	14	2026-07-03 16:00:00+00	10
1352	39	12	2026-06-29 17:17:35.649196+00	10
1353	39	13	2026-06-29 17:17:35.649196+00	10
1354	39	14	2026-06-29 17:17:35.649196+00	10
1355	39	15	2026-06-29 17:17:35.649196+00	10
3601	43	15	2026-07-03 17:00:00+00	10
1357	39	12	2026-06-30 17:17:35.649196+00	10
1358	39	13	2026-06-30 17:17:35.649196+00	10
1359	39	14	2026-06-30 17:17:35.649196+00	10
1360	39	15	2026-06-30 17:17:35.649196+00	10
3602	46	12	2026-07-03 14:00:00+00	10
1362	39	12	2026-07-01 17:17:35.649196+00	10
1363	39	13	2026-07-01 17:17:35.649196+00	10
1364	39	14	2026-07-01 17:17:35.649196+00	10
1365	39	15	2026-07-01 17:17:35.649196+00	10
3603	46	13	2026-07-03 15:00:00+00	10
1367	40	12	2026-06-25 17:17:35.649196+00	10
1368	40	13	2026-06-25 17:17:35.649196+00	10
1369	40	14	2026-06-25 17:17:35.649196+00	10
1370	40	15	2026-06-25 17:17:35.649196+00	10
3604	46	14	2026-07-03 16:00:00+00	10
1372	40	12	2026-06-26 17:17:35.649196+00	10
1373	40	13	2026-06-26 17:17:35.649196+00	10
1374	40	14	2026-06-26 17:17:35.649196+00	10
1375	40	15	2026-06-26 17:17:35.649196+00	10
3605	46	15	2026-07-03 17:00:00+00	10
1377	40	12	2026-06-27 17:17:35.649196+00	10
1378	40	13	2026-06-27 17:17:35.649196+00	10
1379	40	14	2026-06-27 17:17:35.649196+00	10
1380	40	15	2026-06-27 17:17:35.649196+00	10
3606	50	12	2026-07-03 14:00:00+00	10
1382	40	12	2026-06-28 17:17:35.649196+00	10
1383	40	13	2026-06-28 17:17:35.649196+00	10
1384	40	14	2026-06-28 17:17:35.649196+00	10
1385	40	15	2026-06-28 17:17:35.649196+00	10
3607	50	13	2026-07-03 15:00:00+00	10
1387	40	12	2026-06-29 17:17:35.649196+00	10
1388	40	13	2026-06-29 17:17:35.649196+00	10
1389	40	14	2026-06-29 17:17:35.649196+00	10
1390	40	15	2026-06-29 17:17:35.649196+00	10
3608	50	14	2026-07-03 16:00:00+00	10
1392	40	12	2026-06-30 17:17:35.649196+00	10
1393	40	13	2026-06-30 17:17:35.649196+00	10
1394	40	14	2026-06-30 17:17:35.649196+00	10
1395	40	15	2026-06-30 17:17:35.649196+00	10
3609	50	15	2026-07-03 17:00:00+00	10
1397	40	12	2026-07-01 17:17:35.649196+00	10
1398	40	13	2026-07-01 17:17:35.649196+00	10
1399	40	14	2026-07-01 17:17:35.649196+00	10
1400	40	15	2026-07-01 17:17:35.649196+00	10
3610	14	12	2026-07-04 14:00:00+00	10
1402	41	12	2026-06-25 17:17:35.649196+00	10
1403	41	13	2026-06-25 17:17:35.649196+00	10
1404	41	14	2026-06-25 17:17:35.649196+00	10
1405	41	15	2026-06-25 17:17:35.649196+00	10
3611	14	13	2026-07-04 15:00:00+00	10
1407	41	12	2026-06-26 17:17:35.649196+00	10
1408	41	13	2026-06-26 17:17:35.649196+00	10
1409	41	14	2026-06-26 17:17:35.649196+00	10
1410	41	15	2026-06-26 17:17:35.649196+00	10
3612	14	14	2026-07-04 16:00:00+00	10
1412	41	12	2026-06-27 17:17:35.649196+00	10
1413	41	13	2026-06-27 17:17:35.649196+00	10
1414	41	14	2026-06-27 17:17:35.649196+00	10
1415	41	15	2026-06-27 17:17:35.649196+00	10
3613	14	15	2026-07-04 17:00:00+00	10
1417	41	12	2026-06-28 17:17:35.649196+00	10
1418	41	13	2026-06-28 17:17:35.649196+00	10
1419	41	14	2026-06-28 17:17:35.649196+00	10
1420	41	15	2026-06-28 17:17:35.649196+00	10
3614	21	12	2026-07-04 14:00:00+00	10
1422	41	12	2026-06-29 17:17:35.649196+00	10
1423	41	13	2026-06-29 17:17:35.649196+00	10
1424	41	14	2026-06-29 17:17:35.649196+00	10
1425	41	15	2026-06-29 17:17:35.649196+00	10
3615	21	13	2026-07-04 15:00:00+00	10
1427	41	12	2026-06-30 17:17:35.649196+00	10
1428	41	13	2026-06-30 17:17:35.649196+00	10
1429	41	14	2026-06-30 17:17:35.649196+00	10
1430	41	15	2026-06-30 17:17:35.649196+00	10
3616	21	14	2026-07-04 16:00:00+00	10
1432	41	12	2026-07-01 17:17:35.649196+00	10
1433	41	13	2026-07-01 17:17:35.649196+00	10
1434	41	14	2026-07-01 17:17:35.649196+00	10
1435	41	15	2026-07-01 17:17:35.649196+00	10
3617	21	15	2026-07-04 17:00:00+00	10
1437	42	12	2026-06-25 17:17:35.649196+00	10
1438	42	13	2026-06-25 17:17:35.649196+00	10
1439	42	14	2026-06-25 17:17:35.649196+00	10
1440	42	15	2026-06-25 17:17:35.649196+00	10
3618	24	12	2026-07-04 14:00:00+00	10
1442	42	12	2026-06-26 17:17:35.649196+00	10
1443	42	13	2026-06-26 17:17:35.649196+00	10
1444	42	14	2026-06-26 17:17:35.649196+00	10
1445	42	15	2026-06-26 17:17:35.649196+00	10
3619	24	13	2026-07-04 15:00:00+00	10
1447	42	12	2026-06-27 17:17:35.649196+00	10
1448	42	13	2026-06-27 17:17:35.649196+00	10
1449	42	14	2026-06-27 17:17:35.649196+00	10
1450	42	15	2026-06-27 17:17:35.649196+00	10
3620	24	14	2026-07-04 16:00:00+00	10
1452	42	12	2026-06-28 17:17:35.649196+00	10
1453	42	13	2026-06-28 17:17:35.649196+00	10
1454	42	14	2026-06-28 17:17:35.649196+00	10
1455	42	15	2026-06-28 17:17:35.649196+00	10
3621	24	15	2026-07-04 17:00:00+00	10
1457	42	12	2026-06-29 17:17:35.649196+00	10
1458	42	13	2026-06-29 17:17:35.649196+00	10
1459	42	14	2026-06-29 17:17:35.649196+00	10
1460	42	15	2026-06-29 17:17:35.649196+00	10
3622	35	12	2026-07-04 14:00:00+00	10
1462	42	12	2026-06-30 17:17:35.649196+00	10
1463	42	13	2026-06-30 17:17:35.649196+00	10
1464	42	14	2026-06-30 17:17:35.649196+00	10
1465	42	15	2026-06-30 17:17:35.649196+00	10
3623	35	13	2026-07-04 15:00:00+00	10
1467	42	12	2026-07-01 17:17:35.649196+00	10
1468	42	13	2026-07-01 17:17:35.649196+00	10
1469	42	14	2026-07-01 17:17:35.649196+00	10
1470	42	15	2026-07-01 17:17:35.649196+00	10
3624	35	14	2026-07-04 16:00:00+00	10
1472	43	12	2026-06-25 17:17:35.649196+00	10
1473	43	13	2026-06-25 17:17:35.649196+00	10
1474	43	14	2026-06-25 17:17:35.649196+00	10
1475	43	15	2026-06-25 17:17:35.649196+00	10
3625	35	15	2026-07-04 17:00:00+00	10
1477	43	12	2026-06-26 17:17:35.649196+00	10
1478	43	13	2026-06-26 17:17:35.649196+00	10
1479	43	14	2026-06-26 17:17:35.649196+00	10
1480	43	15	2026-06-26 17:17:35.649196+00	10
3626	36	12	2026-07-04 14:00:00+00	10
1482	43	12	2026-06-27 17:17:35.649196+00	10
1483	43	13	2026-06-27 17:17:35.649196+00	10
1484	43	14	2026-06-27 17:17:35.649196+00	10
1485	43	15	2026-06-27 17:17:35.649196+00	10
3627	36	13	2026-07-04 15:00:00+00	10
1487	43	12	2026-06-28 17:17:35.649196+00	10
1488	43	13	2026-06-28 17:17:35.649196+00	10
1489	43	14	2026-06-28 17:17:35.649196+00	10
1490	43	15	2026-06-28 17:17:35.649196+00	10
3628	36	14	2026-07-04 16:00:00+00	10
1492	43	12	2026-06-29 17:17:35.649196+00	10
1493	43	13	2026-06-29 17:17:35.649196+00	10
1494	43	14	2026-06-29 17:17:35.649196+00	10
1495	43	15	2026-06-29 17:17:35.649196+00	10
3629	36	15	2026-07-04 17:00:00+00	10
1497	43	12	2026-06-30 17:17:35.649196+00	10
1498	43	13	2026-06-30 17:17:35.649196+00	10
1499	43	14	2026-06-30 17:17:35.649196+00	10
1500	43	15	2026-06-30 17:17:35.649196+00	10
3630	43	12	2026-07-04 14:00:00+00	10
1502	43	12	2026-07-01 17:17:35.649196+00	10
1503	43	13	2026-07-01 17:17:35.649196+00	10
1504	43	14	2026-07-01 17:17:35.649196+00	10
1505	43	15	2026-07-01 17:17:35.649196+00	10
3631	43	13	2026-07-04 15:00:00+00	10
1507	44	12	2026-06-25 17:17:35.649196+00	10
1508	44	13	2026-06-25 17:17:35.649196+00	10
1509	44	14	2026-06-25 17:17:35.649196+00	10
1510	44	15	2026-06-25 17:17:35.649196+00	10
3632	43	14	2026-07-04 16:00:00+00	10
1512	44	12	2026-06-26 17:17:35.649196+00	10
1513	44	13	2026-06-26 17:17:35.649196+00	10
1514	44	14	2026-06-26 17:17:35.649196+00	10
1515	44	15	2026-06-26 17:17:35.649196+00	10
3633	43	15	2026-07-04 17:00:00+00	10
1517	44	12	2026-06-27 17:17:35.649196+00	10
1518	44	13	2026-06-27 17:17:35.649196+00	10
1519	44	14	2026-06-27 17:17:35.649196+00	10
1520	44	15	2026-06-27 17:17:35.649196+00	10
3634	46	12	2026-07-04 14:00:00+00	10
1522	44	12	2026-06-28 17:17:35.649196+00	10
1523	44	13	2026-06-28 17:17:35.649196+00	10
1524	44	14	2026-06-28 17:17:35.649196+00	10
1525	44	15	2026-06-28 17:17:35.649196+00	10
3635	46	13	2026-07-04 15:00:00+00	10
1527	44	12	2026-06-29 17:17:35.649196+00	10
1528	44	13	2026-06-29 17:17:35.649196+00	10
1529	44	14	2026-06-29 17:17:35.649196+00	10
1530	44	15	2026-06-29 17:17:35.649196+00	10
3636	46	14	2026-07-04 16:00:00+00	10
1532	44	12	2026-06-30 17:17:35.649196+00	10
1533	44	13	2026-06-30 17:17:35.649196+00	10
1534	44	14	2026-06-30 17:17:35.649196+00	10
1535	44	15	2026-06-30 17:17:35.649196+00	10
3637	46	15	2026-07-04 17:00:00+00	10
1537	44	12	2026-07-01 17:17:35.649196+00	10
1538	44	13	2026-07-01 17:17:35.649196+00	10
1539	44	14	2026-07-01 17:17:35.649196+00	10
1540	44	15	2026-07-01 17:17:35.649196+00	10
3638	50	12	2026-07-04 14:00:00+00	10
1542	45	12	2026-06-25 17:17:35.649196+00	10
1543	45	13	2026-06-25 17:17:35.649196+00	10
1544	45	14	2026-06-25 17:17:35.649196+00	10
1545	45	15	2026-06-25 17:17:35.649196+00	10
3639	50	13	2026-07-04 15:00:00+00	10
1547	45	12	2026-06-26 17:17:35.649196+00	10
1548	45	13	2026-06-26 17:17:35.649196+00	10
1549	45	14	2026-06-26 17:17:35.649196+00	10
1550	45	15	2026-06-26 17:17:35.649196+00	10
3640	50	14	2026-07-04 16:00:00+00	10
1552	45	12	2026-06-27 17:17:35.649196+00	10
1553	45	13	2026-06-27 17:17:35.649196+00	10
1554	45	14	2026-06-27 17:17:35.649196+00	10
1555	45	15	2026-06-27 17:17:35.649196+00	10
3641	50	15	2026-07-04 17:00:00+00	10
1557	45	12	2026-06-28 17:17:35.649196+00	10
1558	45	13	2026-06-28 17:17:35.649196+00	10
1559	45	14	2026-06-28 17:17:35.649196+00	10
1560	45	15	2026-06-28 17:17:35.649196+00	10
3642	14	12	2026-07-05 14:00:00+00	10
1562	45	12	2026-06-29 17:17:35.649196+00	10
1563	45	13	2026-06-29 17:17:35.649196+00	10
1564	45	14	2026-06-29 17:17:35.649196+00	10
1565	45	15	2026-06-29 17:17:35.649196+00	10
3643	14	13	2026-07-05 15:00:00+00	10
1567	45	12	2026-06-30 17:17:35.649196+00	10
1568	45	13	2026-06-30 17:17:35.649196+00	10
1569	45	14	2026-06-30 17:17:35.649196+00	10
1570	45	15	2026-06-30 17:17:35.649196+00	10
3644	14	14	2026-07-05 16:00:00+00	10
1572	45	12	2026-07-01 17:17:35.649196+00	10
1573	45	13	2026-07-01 17:17:35.649196+00	10
1574	45	14	2026-07-01 17:17:35.649196+00	10
1575	45	15	2026-07-01 17:17:35.649196+00	10
3645	14	15	2026-07-05 17:00:00+00	10
1577	46	12	2026-06-25 17:17:35.649196+00	10
1578	46	13	2026-06-25 17:17:35.649196+00	10
1579	46	14	2026-06-25 17:17:35.649196+00	10
1580	46	15	2026-06-25 17:17:35.649196+00	10
3646	21	12	2026-07-05 14:00:00+00	10
1582	46	12	2026-06-26 17:17:35.649196+00	10
1583	46	13	2026-06-26 17:17:35.649196+00	10
1584	46	14	2026-06-26 17:17:35.649196+00	10
1585	46	15	2026-06-26 17:17:35.649196+00	10
3647	21	13	2026-07-05 15:00:00+00	10
1587	46	12	2026-06-27 17:17:35.649196+00	10
1588	46	13	2026-06-27 17:17:35.649196+00	10
1589	46	14	2026-06-27 17:17:35.649196+00	10
1590	46	15	2026-06-27 17:17:35.649196+00	10
3648	21	14	2026-07-05 16:00:00+00	10
1592	46	12	2026-06-28 17:17:35.649196+00	10
1593	46	13	2026-06-28 17:17:35.649196+00	10
1594	46	14	2026-06-28 17:17:35.649196+00	10
1595	46	15	2026-06-28 17:17:35.649196+00	10
3649	21	15	2026-07-05 17:00:00+00	10
1597	46	12	2026-06-29 17:17:35.649196+00	10
1598	46	13	2026-06-29 17:17:35.649196+00	10
1599	46	14	2026-06-29 17:17:35.649196+00	10
1600	46	15	2026-06-29 17:17:35.649196+00	10
3650	24	12	2026-07-05 14:00:00+00	10
1602	46	12	2026-06-30 17:17:35.649196+00	10
1603	46	13	2026-06-30 17:17:35.649196+00	10
1604	46	14	2026-06-30 17:17:35.649196+00	10
1605	46	15	2026-06-30 17:17:35.649196+00	10
3651	24	13	2026-07-05 15:00:00+00	10
1607	46	12	2026-07-01 17:17:35.649196+00	10
1608	46	13	2026-07-01 17:17:35.649196+00	10
1609	46	14	2026-07-01 17:17:35.649196+00	10
1610	46	15	2026-07-01 17:17:35.649196+00	10
3652	24	14	2026-07-05 16:00:00+00	10
1612	47	12	2026-06-25 17:17:35.649196+00	10
1613	47	13	2026-06-25 17:17:35.649196+00	10
1614	47	14	2026-06-25 17:17:35.649196+00	10
1615	47	15	2026-06-25 17:17:35.649196+00	10
3653	24	15	2026-07-05 17:00:00+00	10
1617	47	12	2026-06-26 17:17:35.649196+00	10
1618	47	13	2026-06-26 17:17:35.649196+00	10
1619	47	14	2026-06-26 17:17:35.649196+00	10
1620	47	15	2026-06-26 17:17:35.649196+00	10
3654	35	12	2026-07-05 14:00:00+00	10
1622	47	12	2026-06-27 17:17:35.649196+00	10
1623	47	13	2026-06-27 17:17:35.649196+00	10
1624	47	14	2026-06-27 17:17:35.649196+00	10
1625	47	15	2026-06-27 17:17:35.649196+00	10
3655	35	13	2026-07-05 15:00:00+00	10
1627	47	12	2026-06-28 17:17:35.649196+00	10
1628	47	13	2026-06-28 17:17:35.649196+00	10
1629	47	14	2026-06-28 17:17:35.649196+00	10
1630	47	15	2026-06-28 17:17:35.649196+00	10
3656	35	14	2026-07-05 16:00:00+00	10
1632	47	12	2026-06-29 17:17:35.649196+00	10
1633	47	13	2026-06-29 17:17:35.649196+00	10
1634	47	14	2026-06-29 17:17:35.649196+00	10
1635	47	15	2026-06-29 17:17:35.649196+00	10
3657	35	15	2026-07-05 17:00:00+00	10
1637	47	12	2026-06-30 17:17:35.649196+00	10
1638	47	13	2026-06-30 17:17:35.649196+00	10
1639	47	14	2026-06-30 17:17:35.649196+00	10
1640	47	15	2026-06-30 17:17:35.649196+00	10
3658	36	12	2026-07-05 14:00:00+00	10
1642	47	12	2026-07-01 17:17:35.649196+00	10
1643	47	13	2026-07-01 17:17:35.649196+00	10
1644	47	14	2026-07-01 17:17:35.649196+00	10
1645	47	15	2026-07-01 17:17:35.649196+00	10
3659	36	13	2026-07-05 15:00:00+00	10
1647	48	12	2026-06-25 17:17:35.649196+00	10
1648	48	13	2026-06-25 17:17:35.649196+00	10
1649	48	14	2026-06-25 17:17:35.649196+00	10
1650	48	15	2026-06-25 17:17:35.649196+00	10
3660	36	14	2026-07-05 16:00:00+00	10
1652	48	12	2026-06-26 17:17:35.649196+00	10
1653	48	13	2026-06-26 17:17:35.649196+00	10
1654	48	14	2026-06-26 17:17:35.649196+00	10
1655	48	15	2026-06-26 17:17:35.649196+00	10
3661	36	15	2026-07-05 17:00:00+00	10
1657	48	12	2026-06-27 17:17:35.649196+00	10
1658	48	13	2026-06-27 17:17:35.649196+00	10
1659	48	14	2026-06-27 17:17:35.649196+00	10
1660	48	15	2026-06-27 17:17:35.649196+00	10
3662	43	12	2026-07-05 14:00:00+00	10
1662	48	12	2026-06-28 17:17:35.649196+00	10
1663	48	13	2026-06-28 17:17:35.649196+00	10
1664	48	14	2026-06-28 17:17:35.649196+00	10
1665	48	15	2026-06-28 17:17:35.649196+00	10
3663	43	13	2026-07-05 15:00:00+00	10
1667	48	12	2026-06-29 17:17:35.649196+00	10
1668	48	13	2026-06-29 17:17:35.649196+00	10
1669	48	14	2026-06-29 17:17:35.649196+00	10
1670	48	15	2026-06-29 17:17:35.649196+00	10
3664	43	14	2026-07-05 16:00:00+00	10
1672	48	12	2026-06-30 17:17:35.649196+00	10
1673	48	13	2026-06-30 17:17:35.649196+00	10
1674	48	14	2026-06-30 17:17:35.649196+00	10
1675	48	15	2026-06-30 17:17:35.649196+00	10
3665	43	15	2026-07-05 17:00:00+00	10
1677	48	12	2026-07-01 17:17:35.649196+00	10
1678	48	13	2026-07-01 17:17:35.649196+00	10
1679	48	14	2026-07-01 17:17:35.649196+00	10
1680	48	15	2026-07-01 17:17:35.649196+00	10
3666	46	12	2026-07-05 14:00:00+00	10
1682	49	12	2026-06-25 17:17:35.649196+00	10
1683	49	13	2026-06-25 17:17:35.649196+00	10
1684	49	14	2026-06-25 17:17:35.649196+00	10
1685	49	15	2026-06-25 17:17:35.649196+00	10
3667	46	13	2026-07-05 15:00:00+00	10
1687	49	12	2026-06-26 17:17:35.649196+00	10
1688	49	13	2026-06-26 17:17:35.649196+00	10
1689	49	14	2026-06-26 17:17:35.649196+00	10
1690	49	15	2026-06-26 17:17:35.649196+00	10
3668	46	14	2026-07-05 16:00:00+00	10
1692	49	12	2026-06-27 17:17:35.649196+00	10
1693	49	13	2026-06-27 17:17:35.649196+00	10
1694	49	14	2026-06-27 17:17:35.649196+00	10
1695	49	15	2026-06-27 17:17:35.649196+00	10
3669	46	15	2026-07-05 17:00:00+00	10
1697	49	12	2026-06-28 17:17:35.649196+00	10
1698	49	13	2026-06-28 17:17:35.649196+00	10
1699	49	14	2026-06-28 17:17:35.649196+00	10
1700	49	15	2026-06-28 17:17:35.649196+00	10
3670	50	12	2026-07-05 14:00:00+00	10
1702	49	12	2026-06-29 17:17:35.649196+00	10
1703	49	13	2026-06-29 17:17:35.649196+00	10
1704	49	14	2026-06-29 17:17:35.649196+00	10
1705	49	15	2026-06-29 17:17:35.649196+00	10
3671	50	13	2026-07-05 15:00:00+00	10
1707	49	12	2026-06-30 17:17:35.649196+00	10
1708	49	13	2026-06-30 17:17:35.649196+00	10
1709	49	14	2026-06-30 17:17:35.649196+00	10
1710	49	15	2026-06-30 17:17:35.649196+00	10
3672	50	14	2026-07-05 16:00:00+00	10
1712	49	12	2026-07-01 17:17:35.649196+00	10
1713	49	13	2026-07-01 17:17:35.649196+00	10
1714	49	14	2026-07-01 17:17:35.649196+00	10
1715	49	15	2026-07-01 17:17:35.649196+00	10
3673	50	15	2026-07-05 17:00:00+00	10
1717	50	12	2026-06-25 17:17:35.649196+00	10
1718	50	13	2026-06-25 17:17:35.649196+00	10
1719	50	14	2026-06-25 17:17:35.649196+00	10
1720	50	15	2026-06-25 17:17:35.649196+00	10
3674	14	12	2026-07-06 14:00:00+00	10
1722	50	12	2026-06-26 17:17:35.649196+00	10
1723	50	13	2026-06-26 17:17:35.649196+00	10
1724	50	14	2026-06-26 17:17:35.649196+00	10
1725	50	15	2026-06-26 17:17:35.649196+00	10
3675	14	13	2026-07-06 15:00:00+00	10
1727	50	12	2026-06-27 17:17:35.649196+00	10
1728	50	13	2026-06-27 17:17:35.649196+00	10
1729	50	14	2026-06-27 17:17:35.649196+00	10
1730	50	15	2026-06-27 17:17:35.649196+00	10
3676	14	14	2026-07-06 16:00:00+00	10
1732	50	12	2026-06-28 17:17:35.649196+00	10
1733	50	13	2026-06-28 17:17:35.649196+00	10
1734	50	14	2026-06-28 17:17:35.649196+00	10
1735	50	15	2026-06-28 17:17:35.649196+00	10
3677	14	15	2026-07-06 17:00:00+00	10
1737	50	12	2026-06-29 17:17:35.649196+00	10
1738	50	13	2026-06-29 17:17:35.649196+00	10
1739	50	14	2026-06-29 17:17:35.649196+00	10
1740	50	15	2026-06-29 17:17:35.649196+00	10
3678	21	12	2026-07-06 14:00:00+00	10
1742	50	12	2026-06-30 17:17:35.649196+00	10
1743	50	13	2026-06-30 17:17:35.649196+00	10
1744	50	14	2026-06-30 17:17:35.649196+00	10
1745	50	15	2026-06-30 17:17:35.649196+00	10
3679	21	13	2026-07-06 15:00:00+00	10
1747	50	12	2026-07-01 17:17:35.649196+00	10
1748	50	13	2026-07-01 17:17:35.649196+00	10
1749	50	14	2026-07-01 17:17:35.649196+00	10
1750	50	15	2026-07-01 17:17:35.649196+00	10
3680	21	14	2026-07-06 16:00:00+00	10
1752	51	12	2026-06-25 17:17:35.649196+00	10
1753	51	13	2026-06-25 17:17:35.649196+00	10
1754	51	14	2026-06-25 17:17:35.649196+00	10
1755	51	15	2026-06-25 17:17:35.649196+00	10
3681	21	15	2026-07-06 17:00:00+00	10
1757	51	12	2026-06-26 17:17:35.649196+00	10
1758	51	13	2026-06-26 17:17:35.649196+00	10
1759	51	14	2026-06-26 17:17:35.649196+00	10
1760	51	15	2026-06-26 17:17:35.649196+00	10
3682	24	12	2026-07-06 14:00:00+00	10
1762	51	12	2026-06-27 17:17:35.649196+00	10
1763	51	13	2026-06-27 17:17:35.649196+00	10
1764	51	14	2026-06-27 17:17:35.649196+00	10
1765	51	15	2026-06-27 17:17:35.649196+00	10
3683	24	13	2026-07-06 15:00:00+00	10
1767	51	12	2026-06-28 17:17:35.649196+00	10
1768	51	13	2026-06-28 17:17:35.649196+00	10
1769	51	14	2026-06-28 17:17:35.649196+00	10
1770	51	15	2026-06-28 17:17:35.649196+00	10
3684	24	14	2026-07-06 16:00:00+00	10
1772	51	12	2026-06-29 17:17:35.649196+00	10
1773	51	13	2026-06-29 17:17:35.649196+00	10
1774	51	14	2026-06-29 17:17:35.649196+00	10
1775	51	15	2026-06-29 17:17:35.649196+00	10
3685	24	15	2026-07-06 17:00:00+00	10
1777	51	12	2026-06-30 17:17:35.649196+00	10
1778	51	13	2026-06-30 17:17:35.649196+00	10
1779	51	14	2026-06-30 17:17:35.649196+00	10
1780	51	15	2026-06-30 17:17:35.649196+00	10
3686	35	12	2026-07-06 14:00:00+00	10
1782	51	12	2026-07-01 17:17:35.649196+00	10
1783	51	13	2026-07-01 17:17:35.649196+00	10
1784	51	14	2026-07-01 17:17:35.649196+00	10
1785	51	15	2026-07-01 17:17:35.649196+00	10
3687	35	13	2026-07-06 15:00:00+00	10
1787	52	12	2026-06-25 17:17:35.649196+00	10
1788	52	13	2026-06-25 17:17:35.649196+00	10
1789	52	14	2026-06-25 17:17:35.649196+00	10
1790	52	15	2026-06-25 17:17:35.649196+00	10
3688	35	14	2026-07-06 16:00:00+00	10
1792	52	12	2026-06-26 17:17:35.649196+00	10
1793	52	13	2026-06-26 17:17:35.649196+00	10
1794	52	14	2026-06-26 17:17:35.649196+00	10
1795	52	15	2026-06-26 17:17:35.649196+00	10
3689	35	15	2026-07-06 17:00:00+00	10
1797	52	12	2026-06-27 17:17:35.649196+00	10
1798	52	13	2026-06-27 17:17:35.649196+00	10
1799	52	14	2026-06-27 17:17:35.649196+00	10
1800	52	15	2026-06-27 17:17:35.649196+00	10
3690	36	12	2026-07-06 14:00:00+00	10
1802	52	12	2026-06-28 17:17:35.649196+00	10
1803	52	13	2026-06-28 17:17:35.649196+00	10
1804	52	14	2026-06-28 17:17:35.649196+00	10
1805	52	15	2026-06-28 17:17:35.649196+00	10
3691	36	13	2026-07-06 15:00:00+00	10
1807	52	12	2026-06-29 17:17:35.649196+00	10
1808	52	13	2026-06-29 17:17:35.649196+00	10
1809	52	14	2026-06-29 17:17:35.649196+00	10
1810	52	15	2026-06-29 17:17:35.649196+00	10
3692	36	14	2026-07-06 16:00:00+00	10
1812	52	12	2026-06-30 17:17:35.649196+00	10
1813	52	13	2026-06-30 17:17:35.649196+00	10
1814	52	14	2026-06-30 17:17:35.649196+00	10
1815	52	15	2026-06-30 17:17:35.649196+00	10
3693	36	15	2026-07-06 17:00:00+00	10
1817	52	12	2026-07-01 17:17:35.649196+00	10
1818	52	13	2026-07-01 17:17:35.649196+00	10
1819	52	14	2026-07-01 17:17:35.649196+00	10
1820	52	15	2026-07-01 17:17:35.649196+00	10
3694	43	12	2026-07-06 14:00:00+00	10
1822	53	12	2026-06-25 17:17:35.649196+00	10
1823	53	13	2026-06-25 17:17:35.649196+00	10
1824	53	14	2026-06-25 17:17:35.649196+00	10
1825	53	15	2026-06-25 17:17:35.649196+00	10
3695	43	13	2026-07-06 15:00:00+00	10
1827	53	12	2026-06-26 17:17:35.649196+00	10
1828	53	13	2026-06-26 17:17:35.649196+00	10
1829	53	14	2026-06-26 17:17:35.649196+00	10
1830	53	15	2026-06-26 17:17:35.649196+00	10
3696	43	14	2026-07-06 16:00:00+00	10
1832	53	12	2026-06-27 17:17:35.649196+00	10
1833	53	13	2026-06-27 17:17:35.649196+00	10
1834	53	14	2026-06-27 17:17:35.649196+00	10
1835	53	15	2026-06-27 17:17:35.649196+00	10
3697	43	15	2026-07-06 17:00:00+00	10
1837	53	12	2026-06-28 17:17:35.649196+00	10
1838	53	13	2026-06-28 17:17:35.649196+00	10
1839	53	14	2026-06-28 17:17:35.649196+00	10
1840	53	15	2026-06-28 17:17:35.649196+00	10
3698	46	12	2026-07-06 14:00:00+00	10
1842	53	12	2026-06-29 17:17:35.649196+00	10
1843	53	13	2026-06-29 17:17:35.649196+00	10
1844	53	14	2026-06-29 17:17:35.649196+00	10
1845	53	15	2026-06-29 17:17:35.649196+00	10
3699	46	13	2026-07-06 15:00:00+00	10
1847	53	12	2026-06-30 17:17:35.649196+00	10
1848	53	13	2026-06-30 17:17:35.649196+00	10
1849	53	14	2026-06-30 17:17:35.649196+00	10
1850	53	15	2026-06-30 17:17:35.649196+00	10
3700	46	14	2026-07-06 16:00:00+00	10
1852	53	12	2026-07-01 17:17:35.649196+00	10
1853	53	13	2026-07-01 17:17:35.649196+00	10
1854	53	14	2026-07-01 17:17:35.649196+00	10
1855	53	15	2026-07-01 17:17:35.649196+00	10
3701	46	15	2026-07-06 17:00:00+00	10
1857	54	12	2026-06-25 17:17:35.649196+00	10
1858	54	13	2026-06-25 17:17:35.649196+00	10
1859	54	14	2026-06-25 17:17:35.649196+00	10
1860	54	15	2026-06-25 17:17:35.649196+00	10
3702	50	12	2026-07-06 14:00:00+00	10
1862	54	12	2026-06-26 17:17:35.649196+00	10
1863	54	13	2026-06-26 17:17:35.649196+00	10
1864	54	14	2026-06-26 17:17:35.649196+00	10
1865	54	15	2026-06-26 17:17:35.649196+00	10
3703	50	13	2026-07-06 15:00:00+00	10
1867	54	12	2026-06-27 17:17:35.649196+00	10
1868	54	13	2026-06-27 17:17:35.649196+00	10
1869	54	14	2026-06-27 17:17:35.649196+00	10
1870	54	15	2026-06-27 17:17:35.649196+00	10
3704	50	14	2026-07-06 16:00:00+00	10
1872	54	12	2026-06-28 17:17:35.649196+00	10
1873	54	13	2026-06-28 17:17:35.649196+00	10
1874	54	14	2026-06-28 17:17:35.649196+00	10
1875	54	15	2026-06-28 17:17:35.649196+00	10
3705	50	15	2026-07-06 17:00:00+00	10
1877	54	12	2026-06-29 17:17:35.649196+00	10
1878	54	13	2026-06-29 17:17:35.649196+00	10
1879	54	14	2026-06-29 17:17:35.649196+00	10
1880	54	15	2026-06-29 17:17:35.649196+00	10
3706	14	12	2026-07-07 14:00:00+00	10
1882	54	12	2026-06-30 17:17:35.649196+00	10
1883	54	13	2026-06-30 17:17:35.649196+00	10
1884	54	14	2026-06-30 17:17:35.649196+00	10
1885	54	15	2026-06-30 17:17:35.649196+00	10
3707	14	13	2026-07-07 15:00:00+00	10
1887	54	12	2026-07-01 17:17:35.649196+00	10
1888	54	13	2026-07-01 17:17:35.649196+00	10
1889	54	14	2026-07-01 17:17:35.649196+00	10
1890	54	15	2026-07-01 17:17:35.649196+00	10
3708	14	14	2026-07-07 16:00:00+00	10
1892	55	12	2026-06-25 17:17:35.649196+00	10
1893	55	13	2026-06-25 17:17:35.649196+00	10
1894	55	14	2026-06-25 17:17:35.649196+00	10
1895	55	15	2026-06-25 17:17:35.649196+00	10
3709	14	15	2026-07-07 17:00:00+00	10
1897	55	12	2026-06-26 17:17:35.649196+00	10
1898	55	13	2026-06-26 17:17:35.649196+00	10
1899	55	14	2026-06-26 17:17:35.649196+00	10
1900	55	15	2026-06-26 17:17:35.649196+00	10
3710	21	12	2026-07-07 14:00:00+00	10
1902	55	12	2026-06-27 17:17:35.649196+00	10
1903	55	13	2026-06-27 17:17:35.649196+00	10
1904	55	14	2026-06-27 17:17:35.649196+00	10
1905	55	15	2026-06-27 17:17:35.649196+00	10
3711	21	13	2026-07-07 15:00:00+00	10
1907	55	12	2026-06-28 17:17:35.649196+00	10
1908	55	13	2026-06-28 17:17:35.649196+00	10
1909	55	14	2026-06-28 17:17:35.649196+00	10
1910	55	15	2026-06-28 17:17:35.649196+00	10
3712	21	14	2026-07-07 16:00:00+00	10
1912	55	12	2026-06-29 17:17:35.649196+00	10
1913	55	13	2026-06-29 17:17:35.649196+00	10
1914	55	14	2026-06-29 17:17:35.649196+00	10
1915	55	15	2026-06-29 17:17:35.649196+00	10
3713	21	15	2026-07-07 17:00:00+00	10
1917	55	12	2026-06-30 17:17:35.649196+00	10
1918	55	13	2026-06-30 17:17:35.649196+00	10
1919	55	14	2026-06-30 17:17:35.649196+00	10
1920	55	15	2026-06-30 17:17:35.649196+00	10
3714	24	12	2026-07-07 14:00:00+00	10
1922	55	12	2026-07-01 17:17:35.649196+00	10
1923	55	13	2026-07-01 17:17:35.649196+00	10
1924	55	14	2026-07-01 17:17:35.649196+00	10
1925	55	15	2026-07-01 17:17:35.649196+00	10
3715	24	13	2026-07-07 15:00:00+00	10
3716	24	14	2026-07-07 16:00:00+00	10
3717	24	15	2026-07-07 17:00:00+00	10
3718	35	12	2026-07-07 14:00:00+00	10
3719	35	13	2026-07-07 15:00:00+00	10
3720	35	14	2026-07-07 16:00:00+00	10
3721	35	15	2026-07-07 17:00:00+00	10
3722	36	12	2026-07-07 14:00:00+00	10
3723	36	13	2026-07-07 15:00:00+00	10
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
3724	36	14	2026-07-07 16:00:00+00	10
3725	36	15	2026-07-07 17:00:00+00	10
3726	43	12	2026-07-07 14:00:00+00	10
3727	43	13	2026-07-07 15:00:00+00	10
3728	43	14	2026-07-07 16:00:00+00	10
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
3729	43	15	2026-07-07 17:00:00+00	10
3730	46	12	2026-07-07 14:00:00+00	10
3731	46	13	2026-07-07 15:00:00+00	10
3732	46	14	2026-07-07 16:00:00+00	10
3733	46	15	2026-07-07 17:00:00+00	10
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
3734	50	12	2026-07-07 14:00:00+00	10
3735	50	13	2026-07-07 15:00:00+00	10
3736	50	14	2026-07-07 16:00:00+00	10
3737	50	15	2026-07-07 17:00:00+00	10
3738	14	12	2026-07-08 14:00:00+00	10
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
3739	14	13	2026-07-08 15:00:00+00	10
3740	14	14	2026-07-08 16:00:00+00	10
3741	14	15	2026-07-08 17:00:00+00	10
3742	21	12	2026-07-08 14:00:00+00	10
3743	21	13	2026-07-08 15:00:00+00	10
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
3744	21	14	2026-07-08 16:00:00+00	10
3745	21	15	2026-07-08 17:00:00+00	10
3746	24	12	2026-07-08 14:00:00+00	10
3747	24	13	2026-07-08 15:00:00+00	10
3748	24	14	2026-07-08 16:00:00+00	10
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
3749	24	15	2026-07-08 17:00:00+00	10
3750	35	12	2026-07-08 14:00:00+00	10
3751	35	13	2026-07-08 15:00:00+00	10
3752	35	14	2026-07-08 16:00:00+00	10
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
3753	35	15	2026-07-08 17:00:00+00	10
3754	36	12	2026-07-08 14:00:00+00	10
3755	36	13	2026-07-08 15:00:00+00	10
3756	36	14	2026-07-08 16:00:00+00	10
3757	36	15	2026-07-08 17:00:00+00	10
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
3758	43	12	2026-07-08 14:00:00+00	10
3759	43	13	2026-07-08 15:00:00+00	10
3760	43	14	2026-07-08 16:00:00+00	10
3761	43	15	2026-07-08 17:00:00+00	10
3762	46	12	2026-07-08 14:00:00+00	10
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
3763	46	13	2026-07-08 15:00:00+00	10
3764	46	14	2026-07-08 16:00:00+00	10
3765	46	15	2026-07-08 17:00:00+00	10
3766	50	12	2026-07-08 14:00:00+00	10
3767	50	13	2026-07-08 15:00:00+00	10
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
3768	50	14	2026-07-08 16:00:00+00	10
3769	50	15	2026-07-08 17:00:00+00	10
3770	14	12	2026-07-09 14:00:00+00	10
3771	14	13	2026-07-09 15:00:00+00	10
3772	14	14	2026-07-09 16:00:00+00	10
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
3773	14	15	2026-07-09 17:00:00+00	10
3774	21	12	2026-07-09 14:00:00+00	10
3775	21	13	2026-07-09 15:00:00+00	10
3776	21	14	2026-07-09 16:00:00+00	10
3777	21	15	2026-07-09 17:00:00+00	10
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
3778	24	12	2026-07-09 14:00:00+00	10
3779	24	13	2026-07-09 15:00:00+00	10
3780	24	14	2026-07-09 16:00:00+00	10
3781	24	15	2026-07-09 17:00:00+00	10
3782	35	12	2026-07-09 14:00:00+00	10
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
3783	35	13	2026-07-09 15:00:00+00	10
3784	35	14	2026-07-09 16:00:00+00	10
3785	35	15	2026-07-09 17:00:00+00	10
3786	36	12	2026-07-09 14:00:00+00	10
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
3787	36	13	2026-07-09 15:00:00+00	10
3788	36	14	2026-07-09 16:00:00+00	10
3789	36	15	2026-07-09 17:00:00+00	10
3790	43	12	2026-07-09 14:00:00+00	10
3791	43	13	2026-07-09 15:00:00+00	10
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
3792	43	14	2026-07-09 16:00:00+00	10
3793	43	15	2026-07-09 17:00:00+00	10
3794	46	12	2026-07-09 14:00:00+00	10
3795	46	13	2026-07-09 15:00:00+00	10
3796	46	14	2026-07-09 16:00:00+00	10
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
3797	46	15	2026-07-09 17:00:00+00	10
3798	50	12	2026-07-09 14:00:00+00	10
3799	50	13	2026-07-09 15:00:00+00	10
3800	50	14	2026-07-09 16:00:00+00	10
3801	50	15	2026-07-09 17:00:00+00	10
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
3802	14	12	2026-07-10 14:00:00+00	10
3803	14	13	2026-07-10 15:00:00+00	10
3804	14	14	2026-07-10 16:00:00+00	10
3805	14	15	2026-07-10 17:00:00+00	10
3806	21	12	2026-07-10 14:00:00+00	10
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
3807	21	13	2026-07-10 15:00:00+00	10
3808	21	14	2026-07-10 16:00:00+00	10
3809	21	15	2026-07-10 17:00:00+00	10
3810	24	12	2026-07-10 14:00:00+00	10
3811	24	13	2026-07-10 15:00:00+00	10
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
3812	24	14	2026-07-10 16:00:00+00	10
3813	24	15	2026-07-10 17:00:00+00	10
3814	35	12	2026-07-10 14:00:00+00	10
3815	35	13	2026-07-10 15:00:00+00	10
3816	35	14	2026-07-10 16:00:00+00	10
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
3817	35	15	2026-07-10 17:00:00+00	10
3818	36	12	2026-07-10 14:00:00+00	10
3819	36	13	2026-07-10 15:00:00+00	10
3820	36	14	2026-07-10 16:00:00+00	10
3821	36	15	2026-07-10 17:00:00+00	10
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
3822	43	12	2026-07-10 14:00:00+00	10
3823	43	13	2026-07-10 15:00:00+00	10
3824	43	14	2026-07-10 16:00:00+00	10
3825	43	15	2026-07-10 17:00:00+00	10
3826	46	12	2026-07-10 14:00:00+00	10
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
3827	46	13	2026-07-10 15:00:00+00	10
3828	46	14	2026-07-10 16:00:00+00	10
3829	46	15	2026-07-10 17:00:00+00	10
3830	50	12	2026-07-10 14:00:00+00	10
3831	50	13	2026-07-10 15:00:00+00	10
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
3832	50	14	2026-07-10 16:00:00+00	10
3833	50	15	2026-07-10 17:00:00+00	10
4052	9	17	2026-07-15 13:00:00+00	8
4053	9	17	2026-07-16 08:00:00+00	8
4054	9	17	2026-07-16 10:00:00+00	8
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
4055	9	17	2026-07-16 13:00:00+00	8
4056	9	17	2026-07-17 08:00:00+00	8
4057	9	17	2026-07-17 10:00:00+00	8
4058	9	17	2026-07-17 13:00:00+00	8
4059	14	17	2026-06-29 08:00:00+00	8
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
4060	14	17	2026-06-29 10:00:00+00	8
4061	14	17	2026-06-29 13:00:00+00	8
4062	14	17	2026-06-30 08:00:00+00	8
4063	14	17	2026-06-30 10:00:00+00	8
4064	14	17	2026-06-30 13:00:00+00	8
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
4065	14	17	2026-07-01 08:00:00+00	8
4066	14	17	2026-07-01 10:00:00+00	8
4067	14	17	2026-07-01 13:00:00+00	8
4068	14	17	2026-07-02 08:00:00+00	8
4069	14	17	2026-07-02 10:00:00+00	8
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
3834	1	17	2026-06-29 08:00:00+00	8
3835	1	17	2026-06-29 10:00:00+00	8
3836	1	17	2026-06-29 13:00:00+00	8
3837	1	17	2026-06-30 08:00:00+00	8
3838	1	17	2026-06-30 10:00:00+00	8
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
3839	1	17	2026-06-30 13:00:00+00	8
3840	1	17	2026-07-01 08:00:00+00	8
3841	1	17	2026-07-01 10:00:00+00	8
3842	1	17	2026-07-01 13:00:00+00	8
3843	1	17	2026-07-02 08:00:00+00	8
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
3844	1	17	2026-07-02 10:00:00+00	8
3845	1	17	2026-07-02 13:00:00+00	8
3846	1	17	2026-07-03 08:00:00+00	8
3847	1	17	2026-07-03 10:00:00+00	8
3848	1	17	2026-07-03 13:00:00+00	8
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
3849	1	17	2026-07-06 08:00:00+00	8
3850	1	17	2026-07-06 10:00:00+00	8
3851	1	17	2026-07-06 13:00:00+00	8
3852	1	17	2026-07-07 08:00:00+00	8
3853	1	17	2026-07-07 10:00:00+00	8
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
3854	1	17	2026-07-07 13:00:00+00	8
3855	1	17	2026-07-08 08:00:00+00	8
3856	1	17	2026-07-08 10:00:00+00	8
3857	1	17	2026-07-08 13:00:00+00	8
3858	1	17	2026-07-09 08:00:00+00	8
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
3859	1	17	2026-07-09 10:00:00+00	8
3860	1	17	2026-07-09 13:00:00+00	8
3861	1	17	2026-07-10 08:00:00+00	8
3862	1	17	2026-07-10 10:00:00+00	8
3863	1	17	2026-07-10 13:00:00+00	8
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
3864	1	17	2026-07-13 08:00:00+00	8
3865	1	17	2026-07-13 10:00:00+00	8
3866	1	17	2026-07-13 13:00:00+00	8
3867	1	17	2026-07-14 08:00:00+00	8
3868	1	17	2026-07-14 10:00:00+00	8
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
3869	1	17	2026-07-14 13:00:00+00	8
3870	1	17	2026-07-15 08:00:00+00	8
3871	1	17	2026-07-15 10:00:00+00	8
3872	1	17	2026-07-15 13:00:00+00	8
3873	1	17	2026-07-16 08:00:00+00	8
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
3874	1	17	2026-07-16 10:00:00+00	8
3875	1	17	2026-07-16 13:00:00+00	8
3876	1	17	2026-07-17 08:00:00+00	8
3877	1	17	2026-07-17 10:00:00+00	8
3878	1	17	2026-07-17 13:00:00+00	8
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
3879	2	17	2026-06-29 08:00:00+00	8
3880	2	17	2026-06-29 10:00:00+00	8
3881	2	17	2026-06-29 13:00:00+00	8
3882	2	17	2026-06-30 08:00:00+00	8
3883	2	17	2026-06-30 10:00:00+00	8
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
3884	2	17	2026-06-30 13:00:00+00	8
3885	2	17	2026-07-01 08:00:00+00	8
3886	2	17	2026-07-01 10:00:00+00	8
3887	2	17	2026-07-01 13:00:00+00	8
3888	2	17	2026-07-02 08:00:00+00	8
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
3889	2	17	2026-07-02 10:00:00+00	8
3890	2	17	2026-07-02 13:00:00+00	8
3891	2	17	2026-07-03 08:00:00+00	8
3892	2	17	2026-07-03 10:00:00+00	8
3893	2	17	2026-07-03 13:00:00+00	8
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
3894	2	17	2026-07-06 08:00:00+00	8
3895	2	17	2026-07-06 10:00:00+00	8
3896	2	17	2026-07-06 13:00:00+00	8
3897	2	17	2026-07-07 08:00:00+00	8
3898	2	17	2026-07-07 10:00:00+00	8
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
3899	2	17	2026-07-07 13:00:00+00	8
3900	2	17	2026-07-08 08:00:00+00	8
3901	2	17	2026-07-08 10:00:00+00	8
3902	2	17	2026-07-08 13:00:00+00	8
3903	2	17	2026-07-09 08:00:00+00	8
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
3904	2	17	2026-07-09 10:00:00+00	8
3905	2	17	2026-07-09 13:00:00+00	8
3906	2	17	2026-07-10 08:00:00+00	8
3907	2	17	2026-07-10 10:00:00+00	8
3908	2	17	2026-07-10 13:00:00+00	8
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
3909	2	17	2026-07-13 08:00:00+00	8
3910	2	17	2026-07-13 10:00:00+00	8
3911	2	17	2026-07-13 13:00:00+00	8
3912	2	17	2026-07-14 08:00:00+00	8
3913	2	17	2026-07-14 10:00:00+00	8
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
3914	2	17	2026-07-14 13:00:00+00	8
3915	2	17	2026-07-15 08:00:00+00	8
3916	2	17	2026-07-15 10:00:00+00	8
3917	2	17	2026-07-15 13:00:00+00	8
3918	2	17	2026-07-16 08:00:00+00	8
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
3919	2	17	2026-07-16 10:00:00+00	8
3920	2	17	2026-07-16 13:00:00+00	8
3921	2	17	2026-07-17 08:00:00+00	8
3922	2	17	2026-07-17 10:00:00+00	8
3923	2	17	2026-07-17 13:00:00+00	8
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
3924	5	17	2026-06-29 08:00:00+00	8
3925	5	17	2026-06-29 10:00:00+00	8
3926	5	17	2026-06-29 13:00:00+00	8
3927	5	17	2026-06-30 08:00:00+00	8
3928	5	17	2026-06-30 10:00:00+00	8
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
3929	5	17	2026-06-30 13:00:00+00	8
3930	5	17	2026-07-01 08:00:00+00	8
3931	5	17	2026-07-01 10:00:00+00	8
3932	5	17	2026-07-01 13:00:00+00	8
3933	5	17	2026-07-02 08:00:00+00	8
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
3934	5	17	2026-07-02 10:00:00+00	8
3935	5	17	2026-07-02 13:00:00+00	8
3936	5	17	2026-07-03 08:00:00+00	8
3937	5	17	2026-07-03 10:00:00+00	8
3938	5	17	2026-07-03 13:00:00+00	8
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
3939	5	17	2026-07-06 08:00:00+00	8
3940	5	17	2026-07-06 10:00:00+00	8
3941	5	17	2026-07-06 13:00:00+00	8
3942	5	17	2026-07-07 08:00:00+00	8
3943	5	17	2026-07-07 10:00:00+00	8
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
3944	5	17	2026-07-07 13:00:00+00	8
3945	5	17	2026-07-08 08:00:00+00	8
3946	5	17	2026-07-08 10:00:00+00	8
3947	5	17	2026-07-08 13:00:00+00	8
3948	5	17	2026-07-09 08:00:00+00	8
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
3949	5	17	2026-07-09 10:00:00+00	8
3950	5	17	2026-07-09 13:00:00+00	8
3951	5	17	2026-07-10 08:00:00+00	8
3952	5	17	2026-07-10 10:00:00+00	8
3953	5	17	2026-07-10 13:00:00+00	8
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
3954	5	17	2026-07-13 08:00:00+00	8
3955	5	17	2026-07-13 10:00:00+00	8
3956	5	17	2026-07-13 13:00:00+00	8
3957	5	17	2026-07-14 08:00:00+00	8
3958	5	17	2026-07-14 10:00:00+00	8
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
3959	5	17	2026-07-14 13:00:00+00	8
3960	5	17	2026-07-15 08:00:00+00	8
3961	5	17	2026-07-15 10:00:00+00	8
3962	5	17	2026-07-15 13:00:00+00	8
3963	5	17	2026-07-16 08:00:00+00	8
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
3964	5	17	2026-07-16 10:00:00+00	8
3965	5	17	2026-07-16 13:00:00+00	8
3966	5	17	2026-07-17 08:00:00+00	8
3967	5	17	2026-07-17 10:00:00+00	8
3968	5	17	2026-07-17 13:00:00+00	8
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
3969	7	17	2026-06-29 08:00:00+00	8
3970	7	17	2026-06-29 10:00:00+00	8
3971	7	17	2026-06-29 13:00:00+00	8
3972	7	17	2026-06-30 08:00:00+00	8
3973	7	17	2026-06-30 10:00:00+00	8
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
3974	7	17	2026-06-30 13:00:00+00	8
3975	7	17	2026-07-01 08:00:00+00	8
3976	7	17	2026-07-01 10:00:00+00	8
3977	7	17	2026-07-01 13:00:00+00	8
3978	7	17	2026-07-02 08:00:00+00	8
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
3979	7	17	2026-07-02 10:00:00+00	8
3980	7	17	2026-07-02 13:00:00+00	8
3981	7	17	2026-07-03 08:00:00+00	8
3982	7	17	2026-07-03 10:00:00+00	8
3983	7	17	2026-07-03 13:00:00+00	8
3984	7	17	2026-07-06 08:00:00+00	8
3985	7	17	2026-07-06 10:00:00+00	8
3986	7	17	2026-07-06 13:00:00+00	8
3987	7	17	2026-07-07 08:00:00+00	8
3988	7	17	2026-07-07 10:00:00+00	8
3989	7	17	2026-07-07 13:00:00+00	8
3990	7	17	2026-07-08 08:00:00+00	8
3991	7	17	2026-07-08 10:00:00+00	8
3992	7	17	2026-07-08 13:00:00+00	8
3993	7	17	2026-07-09 08:00:00+00	8
3994	7	17	2026-07-09 10:00:00+00	8
3995	7	17	2026-07-09 13:00:00+00	8
3996	7	17	2026-07-10 08:00:00+00	8
3997	7	17	2026-07-10 10:00:00+00	8
3998	7	17	2026-07-10 13:00:00+00	8
3999	7	17	2026-07-13 08:00:00+00	8
4000	7	17	2026-07-13 10:00:00+00	8
4001	7	17	2026-07-13 13:00:00+00	8
4002	7	17	2026-07-14 08:00:00+00	8
4003	7	17	2026-07-14 10:00:00+00	8
4004	7	17	2026-07-14 13:00:00+00	8
4005	7	17	2026-07-15 08:00:00+00	8
4006	7	17	2026-07-15 10:00:00+00	8
4007	7	17	2026-07-15 13:00:00+00	8
4008	7	17	2026-07-16 08:00:00+00	8
4009	7	17	2026-07-16 10:00:00+00	8
4010	7	17	2026-07-16 13:00:00+00	8
4011	7	17	2026-07-17 08:00:00+00	8
4012	7	17	2026-07-17 10:00:00+00	8
4013	7	17	2026-07-17 13:00:00+00	8
4014	9	17	2026-06-29 08:00:00+00	8
4015	9	17	2026-06-29 10:00:00+00	8
4016	9	17	2026-06-29 13:00:00+00	8
4017	9	17	2026-06-30 08:00:00+00	8
4018	9	17	2026-06-30 10:00:00+00	8
4019	9	17	2026-06-30 13:00:00+00	8
4020	9	17	2026-07-01 08:00:00+00	8
4021	9	17	2026-07-01 10:00:00+00	8
4022	9	17	2026-07-01 13:00:00+00	8
4023	9	17	2026-07-02 08:00:00+00	8
4024	9	17	2026-07-02 10:00:00+00	8
4025	9	17	2026-07-02 13:00:00+00	8
4026	9	17	2026-07-03 08:00:00+00	8
4027	9	17	2026-07-03 10:00:00+00	8
4028	9	17	2026-07-03 13:00:00+00	8
4029	9	17	2026-07-06 08:00:00+00	8
4030	9	17	2026-07-06 10:00:00+00	8
4031	9	17	2026-07-06 13:00:00+00	8
4032	9	17	2026-07-07 08:00:00+00	8
4033	9	17	2026-07-07 10:00:00+00	8
4034	9	17	2026-07-07 13:00:00+00	8
4035	9	17	2026-07-08 08:00:00+00	8
4036	9	17	2026-07-08 10:00:00+00	8
4037	9	17	2026-07-08 13:00:00+00	8
4038	9	17	2026-07-09 08:00:00+00	8
4039	9	17	2026-07-09 10:00:00+00	8
4040	9	17	2026-07-09 13:00:00+00	8
4041	9	17	2026-07-10 08:00:00+00	8
4042	9	17	2026-07-10 10:00:00+00	8
4043	9	17	2026-07-10 13:00:00+00	8
4044	9	17	2026-07-13 08:00:00+00	8
4045	9	17	2026-07-13 10:00:00+00	8
4046	9	17	2026-07-13 13:00:00+00	8
4047	9	17	2026-07-14 08:00:00+00	8
4048	9	17	2026-07-14 10:00:00+00	8
4049	9	17	2026-07-14 13:00:00+00	8
4050	9	17	2026-07-15 08:00:00+00	8
4051	9	17	2026-07-15 10:00:00+00	8
4070	14	17	2026-07-02 13:00:00+00	8
4071	14	17	2026-07-03 08:00:00+00	8
4072	14	17	2026-07-03 10:00:00+00	8
4073	14	17	2026-07-03 13:00:00+00	8
4074	14	17	2026-07-06 08:00:00+00	8
4075	14	17	2026-07-06 10:00:00+00	8
4076	14	17	2026-07-06 13:00:00+00	8
4077	14	17	2026-07-07 08:00:00+00	8
4078	14	17	2026-07-07 10:00:00+00	8
4079	14	17	2026-07-07 13:00:00+00	8
4080	14	17	2026-07-08 08:00:00+00	8
4081	14	17	2026-07-08 10:00:00+00	8
4082	14	17	2026-07-08 13:00:00+00	8
4083	14	17	2026-07-09 08:00:00+00	8
4084	14	17	2026-07-09 10:00:00+00	8
4085	14	17	2026-07-09 13:00:00+00	8
4086	14	17	2026-07-10 08:00:00+00	8
4087	14	17	2026-07-10 10:00:00+00	8
4088	14	17	2026-07-10 13:00:00+00	8
4089	14	17	2026-07-13 08:00:00+00	8
4090	14	17	2026-07-13 10:00:00+00	8
4091	14	17	2026-07-13 13:00:00+00	8
4092	14	17	2026-07-14 08:00:00+00	8
4093	14	17	2026-07-14 10:00:00+00	8
4094	14	17	2026-07-14 13:00:00+00	8
4095	14	17	2026-07-15 08:00:00+00	8
4096	14	17	2026-07-15 10:00:00+00	8
4097	14	17	2026-07-15 13:00:00+00	8
4098	14	17	2026-07-16 08:00:00+00	8
4099	14	17	2026-07-16 10:00:00+00	8
4100	14	17	2026-07-16 13:00:00+00	8
4101	14	17	2026-07-17 08:00:00+00	8
4102	14	17	2026-07-17 10:00:00+00	8
4103	14	17	2026-07-17 13:00:00+00	8
4104	21	17	2026-06-29 08:00:00+00	8
4105	21	17	2026-06-29 10:00:00+00	8
4106	21	17	2026-06-29 13:00:00+00	8
4107	21	17	2026-06-30 08:00:00+00	8
4108	21	17	2026-06-30 10:00:00+00	8
4109	21	17	2026-06-30 13:00:00+00	8
4110	21	17	2026-07-01 08:00:00+00	8
4111	21	17	2026-07-01 10:00:00+00	8
4112	21	17	2026-07-01 13:00:00+00	8
4113	21	17	2026-07-02 08:00:00+00	8
4114	21	17	2026-07-02 10:00:00+00	8
4115	21	17	2026-07-02 13:00:00+00	8
4116	21	17	2026-07-03 08:00:00+00	8
4117	21	17	2026-07-03 10:00:00+00	8
4118	21	17	2026-07-03 13:00:00+00	8
4119	21	17	2026-07-06 08:00:00+00	8
4120	21	17	2026-07-06 10:00:00+00	8
4121	21	17	2026-07-06 13:00:00+00	8
4122	21	17	2026-07-07 08:00:00+00	8
4123	21	17	2026-07-07 10:00:00+00	8
4124	21	17	2026-07-07 13:00:00+00	8
4125	21	17	2026-07-08 08:00:00+00	8
4126	21	17	2026-07-08 10:00:00+00	8
4127	21	17	2026-07-08 13:00:00+00	8
4128	21	17	2026-07-09 08:00:00+00	8
4129	21	17	2026-07-09 10:00:00+00	8
4130	21	17	2026-07-09 13:00:00+00	8
4131	21	17	2026-07-10 08:00:00+00	8
4132	21	17	2026-07-10 10:00:00+00	8
4133	21	17	2026-07-10 13:00:00+00	8
4134	21	17	2026-07-13 08:00:00+00	8
4135	21	17	2026-07-13 10:00:00+00	8
4136	21	17	2026-07-13 13:00:00+00	8
4137	21	17	2026-07-14 08:00:00+00	8
4138	21	17	2026-07-14 10:00:00+00	8
4139	21	17	2026-07-14 13:00:00+00	8
4140	21	17	2026-07-15 08:00:00+00	8
4141	21	17	2026-07-15 10:00:00+00	8
4142	21	17	2026-07-15 13:00:00+00	8
4143	21	17	2026-07-16 08:00:00+00	8
4144	21	17	2026-07-16 10:00:00+00	8
4145	21	17	2026-07-16 13:00:00+00	8
4146	21	17	2026-07-17 08:00:00+00	8
4147	21	17	2026-07-17 10:00:00+00	8
4148	21	17	2026-07-17 13:00:00+00	8
4149	24	17	2026-06-29 08:00:00+00	8
4150	24	17	2026-06-29 10:00:00+00	8
4151	24	17	2026-06-29 13:00:00+00	8
4152	24	17	2026-06-30 08:00:00+00	8
4153	24	17	2026-06-30 10:00:00+00	8
4154	24	17	2026-06-30 13:00:00+00	8
4155	24	17	2026-07-01 08:00:00+00	8
4156	24	17	2026-07-01 10:00:00+00	8
4157	24	17	2026-07-01 13:00:00+00	8
4158	24	17	2026-07-02 08:00:00+00	8
4159	24	17	2026-07-02 10:00:00+00	8
4160	24	17	2026-07-02 13:00:00+00	8
4161	24	17	2026-07-03 08:00:00+00	8
4162	24	17	2026-07-03 10:00:00+00	8
4163	24	17	2026-07-03 13:00:00+00	8
4164	24	17	2026-07-06 08:00:00+00	8
4165	24	17	2026-07-06 10:00:00+00	8
4166	24	17	2026-07-06 13:00:00+00	8
4167	24	17	2026-07-07 08:00:00+00	8
4168	24	17	2026-07-07 10:00:00+00	8
4169	24	17	2026-07-07 13:00:00+00	8
4170	24	17	2026-07-08 08:00:00+00	8
4171	24	17	2026-07-08 10:00:00+00	8
4172	24	17	2026-07-08 13:00:00+00	8
4173	24	17	2026-07-09 08:00:00+00	8
4174	24	17	2026-07-09 10:00:00+00	8
4175	24	17	2026-07-09 13:00:00+00	8
4176	24	17	2026-07-10 08:00:00+00	8
4177	24	17	2026-07-10 10:00:00+00	8
4178	24	17	2026-07-10 13:00:00+00	8
4179	24	17	2026-07-13 08:00:00+00	8
4180	24	17	2026-07-13 10:00:00+00	8
4181	24	17	2026-07-13 13:00:00+00	8
4182	24	17	2026-07-14 08:00:00+00	8
4183	24	17	2026-07-14 10:00:00+00	8
4184	24	17	2026-07-14 13:00:00+00	8
4185	24	17	2026-07-15 08:00:00+00	8
4186	24	17	2026-07-15 10:00:00+00	8
4187	24	17	2026-07-15 13:00:00+00	8
4188	24	17	2026-07-16 08:00:00+00	8
4189	24	17	2026-07-16 10:00:00+00	8
4190	24	17	2026-07-16 13:00:00+00	8
4191	24	17	2026-07-17 08:00:00+00	8
4192	24	17	2026-07-17 10:00:00+00	8
4193	24	17	2026-07-17 13:00:00+00	8
4194	35	17	2026-06-29 08:00:00+00	8
4195	35	17	2026-06-29 10:00:00+00	8
4196	35	17	2026-06-29 13:00:00+00	8
4197	35	17	2026-06-30 08:00:00+00	8
4198	35	17	2026-06-30 10:00:00+00	8
4199	35	17	2026-06-30 13:00:00+00	8
4200	35	17	2026-07-01 08:00:00+00	8
4201	35	17	2026-07-01 10:00:00+00	8
4202	35	17	2026-07-01 13:00:00+00	8
4203	35	17	2026-07-02 08:00:00+00	8
4204	35	17	2026-07-02 10:00:00+00	8
4205	35	17	2026-07-02 13:00:00+00	8
4206	35	17	2026-07-03 08:00:00+00	8
4207	35	17	2026-07-03 10:00:00+00	8
4208	35	17	2026-07-03 13:00:00+00	8
4209	35	17	2026-07-06 08:00:00+00	8
4210	35	17	2026-07-06 10:00:00+00	8
4211	35	17	2026-07-06 13:00:00+00	8
4212	35	17	2026-07-07 08:00:00+00	8
4213	35	17	2026-07-07 10:00:00+00	8
4214	35	17	2026-07-07 13:00:00+00	8
4215	35	17	2026-07-08 08:00:00+00	8
4216	35	17	2026-07-08 10:00:00+00	8
4217	35	17	2026-07-08 13:00:00+00	8
4218	35	17	2026-07-09 08:00:00+00	8
4219	35	17	2026-07-09 10:00:00+00	8
4220	35	17	2026-07-09 13:00:00+00	8
4221	35	17	2026-07-10 08:00:00+00	8
4222	35	17	2026-07-10 10:00:00+00	8
4223	35	17	2026-07-10 13:00:00+00	8
4224	35	17	2026-07-13 08:00:00+00	8
4225	35	17	2026-07-13 10:00:00+00	8
4226	35	17	2026-07-13 13:00:00+00	8
4227	35	17	2026-07-14 08:00:00+00	8
4228	35	17	2026-07-14 10:00:00+00	8
4229	35	17	2026-07-14 13:00:00+00	8
4230	35	17	2026-07-15 08:00:00+00	8
4231	35	17	2026-07-15 10:00:00+00	8
4232	35	17	2026-07-15 13:00:00+00	8
4233	35	17	2026-07-16 08:00:00+00	8
4234	35	17	2026-07-16 10:00:00+00	8
4235	35	17	2026-07-16 13:00:00+00	8
4236	35	17	2026-07-17 08:00:00+00	8
4237	35	17	2026-07-17 10:00:00+00	8
4238	35	17	2026-07-17 13:00:00+00	8
4239	36	17	2026-06-29 08:00:00+00	8
4240	36	17	2026-06-29 10:00:00+00	8
4241	36	17	2026-06-29 13:00:00+00	8
4242	36	17	2026-06-30 08:00:00+00	8
4243	36	17	2026-06-30 10:00:00+00	8
4244	36	17	2026-06-30 13:00:00+00	8
4245	36	17	2026-07-01 08:00:00+00	8
4246	36	17	2026-07-01 10:00:00+00	8
4247	36	17	2026-07-01 13:00:00+00	8
4248	36	17	2026-07-02 08:00:00+00	8
4249	36	17	2026-07-02 10:00:00+00	8
4250	36	17	2026-07-02 13:00:00+00	8
4251	36	17	2026-07-03 08:00:00+00	8
4252	36	17	2026-07-03 10:00:00+00	8
4253	36	17	2026-07-03 13:00:00+00	8
4254	36	17	2026-07-06 08:00:00+00	8
4255	36	17	2026-07-06 10:00:00+00	8
4256	36	17	2026-07-06 13:00:00+00	8
4257	36	17	2026-07-07 08:00:00+00	8
4258	36	17	2026-07-07 10:00:00+00	8
4259	36	17	2026-07-07 13:00:00+00	8
4260	36	17	2026-07-08 08:00:00+00	8
4261	36	17	2026-07-08 10:00:00+00	8
4262	36	17	2026-07-08 13:00:00+00	8
4263	36	17	2026-07-09 08:00:00+00	8
4264	36	17	2026-07-09 10:00:00+00	8
4265	36	17	2026-07-09 13:00:00+00	8
4266	36	17	2026-07-10 08:00:00+00	8
4267	36	17	2026-07-10 10:00:00+00	8
4268	36	17	2026-07-10 13:00:00+00	8
4269	36	17	2026-07-13 08:00:00+00	8
4270	36	17	2026-07-13 10:00:00+00	8
4271	36	17	2026-07-13 13:00:00+00	8
4272	36	17	2026-07-14 08:00:00+00	8
4273	36	17	2026-07-14 10:00:00+00	8
4274	36	17	2026-07-14 13:00:00+00	8
4275	36	17	2026-07-15 08:00:00+00	8
4276	36	17	2026-07-15 10:00:00+00	8
4277	36	17	2026-07-15 13:00:00+00	8
4278	36	17	2026-07-16 08:00:00+00	8
4279	36	17	2026-07-16 10:00:00+00	8
4280	36	17	2026-07-16 13:00:00+00	8
4281	36	17	2026-07-17 08:00:00+00	8
4282	36	17	2026-07-17 10:00:00+00	8
4283	36	17	2026-07-17 13:00:00+00	8
4284	43	17	2026-06-29 08:00:00+00	8
4285	43	17	2026-06-29 10:00:00+00	8
4286	43	17	2026-06-29 13:00:00+00	8
4287	43	17	2026-06-30 08:00:00+00	8
4288	43	17	2026-06-30 10:00:00+00	8
4289	43	17	2026-06-30 13:00:00+00	8
4290	43	17	2026-07-01 08:00:00+00	8
4291	43	17	2026-07-01 10:00:00+00	8
4292	43	17	2026-07-01 13:00:00+00	8
4293	43	17	2026-07-02 08:00:00+00	8
4294	43	17	2026-07-02 10:00:00+00	8
4295	43	17	2026-07-02 13:00:00+00	8
4296	43	17	2026-07-03 08:00:00+00	8
4297	43	17	2026-07-03 10:00:00+00	8
4298	43	17	2026-07-03 13:00:00+00	8
4299	43	17	2026-07-06 08:00:00+00	8
4300	43	17	2026-07-06 10:00:00+00	8
4301	43	17	2026-07-06 13:00:00+00	8
4302	43	17	2026-07-07 08:00:00+00	8
4303	43	17	2026-07-07 10:00:00+00	8
4304	43	17	2026-07-07 13:00:00+00	8
4305	43	17	2026-07-08 08:00:00+00	8
4306	43	17	2026-07-08 10:00:00+00	8
4307	43	17	2026-07-08 13:00:00+00	8
4308	43	17	2026-07-09 08:00:00+00	8
4309	43	17	2026-07-09 10:00:00+00	8
4310	43	17	2026-07-09 13:00:00+00	8
4311	43	17	2026-07-10 08:00:00+00	8
4312	43	17	2026-07-10 10:00:00+00	8
4313	43	17	2026-07-10 13:00:00+00	8
4314	43	17	2026-07-13 08:00:00+00	8
4315	43	17	2026-07-13 10:00:00+00	8
4316	43	17	2026-07-13 13:00:00+00	8
4317	43	17	2026-07-14 08:00:00+00	8
4318	43	17	2026-07-14 10:00:00+00	8
4319	43	17	2026-07-14 13:00:00+00	8
4320	43	17	2026-07-15 08:00:00+00	8
4321	43	17	2026-07-15 10:00:00+00	8
4322	43	17	2026-07-15 13:00:00+00	8
4323	43	17	2026-07-16 08:00:00+00	8
4324	43	17	2026-07-16 10:00:00+00	8
4325	43	17	2026-07-16 13:00:00+00	8
4326	43	17	2026-07-17 08:00:00+00	8
4327	43	17	2026-07-17 10:00:00+00	8
4328	43	17	2026-07-17 13:00:00+00	8
4329	46	17	2026-06-29 08:00:00+00	8
4330	46	17	2026-06-29 10:00:00+00	8
4331	46	17	2026-06-29 13:00:00+00	8
4332	46	17	2026-06-30 08:00:00+00	8
4333	46	17	2026-06-30 10:00:00+00	8
4334	46	17	2026-06-30 13:00:00+00	8
4335	46	17	2026-07-01 08:00:00+00	8
4336	46	17	2026-07-01 10:00:00+00	8
4337	46	17	2026-07-01 13:00:00+00	8
4338	46	17	2026-07-02 08:00:00+00	8
4339	46	17	2026-07-02 10:00:00+00	8
4340	46	17	2026-07-02 13:00:00+00	8
4341	46	17	2026-07-03 08:00:00+00	8
4342	46	17	2026-07-03 10:00:00+00	8
4343	46	17	2026-07-03 13:00:00+00	8
4344	46	17	2026-07-06 08:00:00+00	8
4345	46	17	2026-07-06 10:00:00+00	8
4346	46	17	2026-07-06 13:00:00+00	8
4347	46	17	2026-07-07 08:00:00+00	8
4348	46	17	2026-07-07 10:00:00+00	8
4349	46	17	2026-07-07 13:00:00+00	8
4350	46	17	2026-07-08 08:00:00+00	8
4351	46	17	2026-07-08 10:00:00+00	8
4352	46	17	2026-07-08 13:00:00+00	8
4353	46	17	2026-07-09 08:00:00+00	8
4354	46	17	2026-07-09 10:00:00+00	8
4355	46	17	2026-07-09 13:00:00+00	8
4356	46	17	2026-07-10 08:00:00+00	8
4357	46	17	2026-07-10 10:00:00+00	8
4358	46	17	2026-07-10 13:00:00+00	8
4359	46	17	2026-07-13 08:00:00+00	8
4360	46	17	2026-07-13 10:00:00+00	8
4361	46	17	2026-07-13 13:00:00+00	8
4362	46	17	2026-07-14 08:00:00+00	8
4363	46	17	2026-07-14 10:00:00+00	8
4364	46	17	2026-07-14 13:00:00+00	8
4365	46	17	2026-07-15 08:00:00+00	8
4366	46	17	2026-07-15 10:00:00+00	8
4367	46	17	2026-07-15 13:00:00+00	8
4368	46	17	2026-07-16 08:00:00+00	8
4369	46	17	2026-07-16 10:00:00+00	8
4370	46	17	2026-07-16 13:00:00+00	8
4371	46	17	2026-07-17 08:00:00+00	8
4372	46	17	2026-07-17 10:00:00+00	8
4373	46	17	2026-07-17 13:00:00+00	8
4374	50	17	2026-06-29 08:00:00+00	8
4375	50	17	2026-06-29 10:00:00+00	8
4376	50	17	2026-06-29 13:00:00+00	8
4377	50	17	2026-06-30 08:00:00+00	8
4378	50	17	2026-06-30 10:00:00+00	8
4379	50	17	2026-06-30 13:00:00+00	8
4380	50	17	2026-07-01 08:00:00+00	8
4381	50	17	2026-07-01 10:00:00+00	8
4382	50	17	2026-07-01 13:00:00+00	8
4383	50	17	2026-07-02 08:00:00+00	8
4384	50	17	2026-07-02 10:00:00+00	8
4385	50	17	2026-07-02 13:00:00+00	8
4386	50	17	2026-07-03 08:00:00+00	8
4387	50	17	2026-07-03 10:00:00+00	8
4388	50	17	2026-07-03 13:00:00+00	8
4389	50	17	2026-07-06 08:00:00+00	8
4390	50	17	2026-07-06 10:00:00+00	8
4391	50	17	2026-07-06 13:00:00+00	8
4392	50	17	2026-07-07 08:00:00+00	8
4393	50	17	2026-07-07 10:00:00+00	8
4394	50	17	2026-07-07 13:00:00+00	8
4395	50	17	2026-07-08 08:00:00+00	8
4396	50	17	2026-07-08 10:00:00+00	8
4397	50	17	2026-07-08 13:00:00+00	8
4398	50	17	2026-07-09 08:00:00+00	8
4399	50	17	2026-07-09 10:00:00+00	8
4400	50	17	2026-07-09 13:00:00+00	8
4401	50	17	2026-07-10 08:00:00+00	8
4402	50	17	2026-07-10 10:00:00+00	8
4403	50	17	2026-07-10 13:00:00+00	8
4404	50	17	2026-07-13 08:00:00+00	8
4405	50	17	2026-07-13 10:00:00+00	8
4406	50	17	2026-07-13 13:00:00+00	8
4407	50	17	2026-07-14 08:00:00+00	8
4408	50	17	2026-07-14 10:00:00+00	8
4409	50	17	2026-07-14 13:00:00+00	8
4410	50	17	2026-07-15 08:00:00+00	8
4411	50	17	2026-07-15 10:00:00+00	8
4412	50	17	2026-07-15 13:00:00+00	8
4413	50	17	2026-07-16 08:00:00+00	8
4414	50	17	2026-07-16 10:00:00+00	8
4415	50	17	2026-07-16 13:00:00+00	8
4416	50	17	2026-07-17 08:00:00+00	8
4417	50	17	2026-07-17 10:00:00+00	8
4418	50	17	2026-07-17 13:00:00+00	8
4419	1	18	2026-06-29 08:00:00+00	8
4420	1	18	2026-06-29 10:00:00+00	8
4421	1	18	2026-06-29 13:00:00+00	8
4422	1	18	2026-06-30 08:00:00+00	8
4423	1	18	2026-06-30 10:00:00+00	8
4424	1	18	2026-06-30 13:00:00+00	8
4425	1	18	2026-07-01 08:00:00+00	8
4426	1	18	2026-07-01 10:00:00+00	8
4427	1	18	2026-07-01 13:00:00+00	8
4428	1	18	2026-07-02 08:00:00+00	8
4429	1	18	2026-07-02 10:00:00+00	8
4430	1	18	2026-07-02 13:00:00+00	8
4431	1	18	2026-07-03 08:00:00+00	8
4432	1	18	2026-07-03 10:00:00+00	8
4433	1	18	2026-07-03 13:00:00+00	8
4434	1	18	2026-07-06 08:00:00+00	8
4435	1	18	2026-07-06 10:00:00+00	8
4436	1	18	2026-07-06 13:00:00+00	8
4437	1	18	2026-07-07 08:00:00+00	8
4438	1	18	2026-07-07 10:00:00+00	8
4439	1	18	2026-07-07 13:00:00+00	8
4440	1	18	2026-07-08 08:00:00+00	8
4441	1	18	2026-07-08 10:00:00+00	8
4442	1	18	2026-07-08 13:00:00+00	8
4443	1	18	2026-07-09 08:00:00+00	8
4444	1	18	2026-07-09 10:00:00+00	8
4445	1	18	2026-07-09 13:00:00+00	8
4446	1	18	2026-07-10 08:00:00+00	8
4447	1	18	2026-07-10 10:00:00+00	8
4448	1	18	2026-07-10 13:00:00+00	8
4449	1	18	2026-07-13 08:00:00+00	8
4450	1	18	2026-07-13 10:00:00+00	8
4451	1	18	2026-07-13 13:00:00+00	8
4452	1	18	2026-07-14 08:00:00+00	8
4453	1	18	2026-07-14 10:00:00+00	8
4454	1	18	2026-07-14 13:00:00+00	8
4455	1	18	2026-07-15 08:00:00+00	8
4456	1	18	2026-07-15 10:00:00+00	8
4457	1	18	2026-07-15 13:00:00+00	8
4458	1	18	2026-07-16 08:00:00+00	8
4459	1	18	2026-07-16 10:00:00+00	8
4460	1	18	2026-07-16 13:00:00+00	8
4461	1	18	2026-07-17 08:00:00+00	8
4462	1	18	2026-07-17 10:00:00+00	8
4463	1	18	2026-07-17 13:00:00+00	8
4464	2	18	2026-06-29 08:00:00+00	8
4465	2	18	2026-06-29 10:00:00+00	8
4466	2	18	2026-06-29 13:00:00+00	8
4467	2	18	2026-06-30 08:00:00+00	8
4468	2	18	2026-06-30 10:00:00+00	8
4469	2	18	2026-06-30 13:00:00+00	8
4470	2	18	2026-07-01 08:00:00+00	8
4471	2	18	2026-07-01 10:00:00+00	8
4472	2	18	2026-07-01 13:00:00+00	8
4473	2	18	2026-07-02 08:00:00+00	8
4474	2	18	2026-07-02 10:00:00+00	8
4475	2	18	2026-07-02 13:00:00+00	8
4476	2	18	2026-07-03 08:00:00+00	8
4477	2	18	2026-07-03 10:00:00+00	8
4478	2	18	2026-07-03 13:00:00+00	8
4479	2	18	2026-07-06 08:00:00+00	8
4480	2	18	2026-07-06 10:00:00+00	8
4481	2	18	2026-07-06 13:00:00+00	8
4482	2	18	2026-07-07 08:00:00+00	8
4483	2	18	2026-07-07 10:00:00+00	8
4484	2	18	2026-07-07 13:00:00+00	8
4485	2	18	2026-07-08 08:00:00+00	8
4486	2	18	2026-07-08 10:00:00+00	8
4487	2	18	2026-07-08 13:00:00+00	8
4488	2	18	2026-07-09 08:00:00+00	8
4489	2	18	2026-07-09 10:00:00+00	8
4490	2	18	2026-07-09 13:00:00+00	8
4491	2	18	2026-07-10 08:00:00+00	8
4492	2	18	2026-07-10 10:00:00+00	8
4493	2	18	2026-07-10 13:00:00+00	8
4494	2	18	2026-07-13 08:00:00+00	8
4495	2	18	2026-07-13 10:00:00+00	8
4496	2	18	2026-07-13 13:00:00+00	8
4497	2	18	2026-07-14 08:00:00+00	8
4498	2	18	2026-07-14 10:00:00+00	8
4499	2	18	2026-07-14 13:00:00+00	8
4500	2	18	2026-07-15 08:00:00+00	8
4501	2	18	2026-07-15 10:00:00+00	8
4502	2	18	2026-07-15 13:00:00+00	8
4503	2	18	2026-07-16 08:00:00+00	8
4504	2	18	2026-07-16 10:00:00+00	8
4505	2	18	2026-07-16 13:00:00+00	8
4506	2	18	2026-07-17 08:00:00+00	8
4507	2	18	2026-07-17 10:00:00+00	8
4508	2	18	2026-07-17 13:00:00+00	8
4509	5	18	2026-06-29 08:00:00+00	8
4510	5	18	2026-06-29 10:00:00+00	8
4511	5	18	2026-06-29 13:00:00+00	8
4512	5	18	2026-06-30 08:00:00+00	8
4513	5	18	2026-06-30 10:00:00+00	8
4514	5	18	2026-06-30 13:00:00+00	8
4515	5	18	2026-07-01 08:00:00+00	8
4516	5	18	2026-07-01 10:00:00+00	8
4517	5	18	2026-07-01 13:00:00+00	8
4518	5	18	2026-07-02 08:00:00+00	8
4519	5	18	2026-07-02 10:00:00+00	8
4520	5	18	2026-07-02 13:00:00+00	8
4521	5	18	2026-07-03 08:00:00+00	8
4522	5	18	2026-07-03 10:00:00+00	8
4523	5	18	2026-07-03 13:00:00+00	8
4524	5	18	2026-07-06 08:00:00+00	8
4525	5	18	2026-07-06 10:00:00+00	8
4526	5	18	2026-07-06 13:00:00+00	8
4527	5	18	2026-07-07 08:00:00+00	8
4528	5	18	2026-07-07 10:00:00+00	8
4529	5	18	2026-07-07 13:00:00+00	8
4530	5	18	2026-07-08 08:00:00+00	8
4531	5	18	2026-07-08 10:00:00+00	8
4532	5	18	2026-07-08 13:00:00+00	8
4533	5	18	2026-07-09 08:00:00+00	8
4534	5	18	2026-07-09 10:00:00+00	8
4535	5	18	2026-07-09 13:00:00+00	8
4536	5	18	2026-07-10 08:00:00+00	8
4537	5	18	2026-07-10 10:00:00+00	8
4538	5	18	2026-07-10 13:00:00+00	8
4539	5	18	2026-07-13 08:00:00+00	8
4540	5	18	2026-07-13 10:00:00+00	8
4541	5	18	2026-07-13 13:00:00+00	8
4542	5	18	2026-07-14 08:00:00+00	8
4543	5	18	2026-07-14 10:00:00+00	8
4544	5	18	2026-07-14 13:00:00+00	8
4545	5	18	2026-07-15 08:00:00+00	8
4546	5	18	2026-07-15 10:00:00+00	8
4547	5	18	2026-07-15 13:00:00+00	8
4548	5	18	2026-07-16 08:00:00+00	8
4549	5	18	2026-07-16 10:00:00+00	8
4550	5	18	2026-07-16 13:00:00+00	8
4551	5	18	2026-07-17 08:00:00+00	8
4552	5	18	2026-07-17 10:00:00+00	8
4553	5	18	2026-07-17 13:00:00+00	8
4554	7	18	2026-06-29 08:00:00+00	8
4555	7	18	2026-06-29 10:00:00+00	8
4556	7	18	2026-06-29 13:00:00+00	8
4557	7	18	2026-06-30 08:00:00+00	8
4558	7	18	2026-06-30 10:00:00+00	8
4559	7	18	2026-06-30 13:00:00+00	8
4560	7	18	2026-07-01 08:00:00+00	8
4561	7	18	2026-07-01 10:00:00+00	8
4562	7	18	2026-07-01 13:00:00+00	8
4563	7	18	2026-07-02 08:00:00+00	8
4564	7	18	2026-07-02 10:00:00+00	8
4565	7	18	2026-07-02 13:00:00+00	8
4566	7	18	2026-07-03 08:00:00+00	8
4567	7	18	2026-07-03 10:00:00+00	8
4568	7	18	2026-07-03 13:00:00+00	8
4569	7	18	2026-07-06 08:00:00+00	8
4570	7	18	2026-07-06 10:00:00+00	8
4571	7	18	2026-07-06 13:00:00+00	8
4572	7	18	2026-07-07 08:00:00+00	8
4573	7	18	2026-07-07 10:00:00+00	8
4574	7	18	2026-07-07 13:00:00+00	8
4575	7	18	2026-07-08 08:00:00+00	8
4576	7	18	2026-07-08 10:00:00+00	8
4577	7	18	2026-07-08 13:00:00+00	8
4578	7	18	2026-07-09 08:00:00+00	8
4579	7	18	2026-07-09 10:00:00+00	8
4580	7	18	2026-07-09 13:00:00+00	8
4581	7	18	2026-07-10 08:00:00+00	8
4582	7	18	2026-07-10 10:00:00+00	8
4583	7	18	2026-07-10 13:00:00+00	8
4584	7	18	2026-07-13 08:00:00+00	8
4585	7	18	2026-07-13 10:00:00+00	8
4586	7	18	2026-07-13 13:00:00+00	8
4587	7	18	2026-07-14 08:00:00+00	8
4588	7	18	2026-07-14 10:00:00+00	8
4589	7	18	2026-07-14 13:00:00+00	8
4590	7	18	2026-07-15 08:00:00+00	8
4591	7	18	2026-07-15 10:00:00+00	8
4592	7	18	2026-07-15 13:00:00+00	8
4593	7	18	2026-07-16 08:00:00+00	8
4594	7	18	2026-07-16 10:00:00+00	8
4595	7	18	2026-07-16 13:00:00+00	8
4596	7	18	2026-07-17 08:00:00+00	8
4597	7	18	2026-07-17 10:00:00+00	8
4598	7	18	2026-07-17 13:00:00+00	8
4599	9	18	2026-06-29 08:00:00+00	8
4600	9	18	2026-06-29 10:00:00+00	8
4601	9	18	2026-06-29 13:00:00+00	8
4602	9	18	2026-06-30 08:00:00+00	8
4603	9	18	2026-06-30 10:00:00+00	8
4604	9	18	2026-06-30 13:00:00+00	8
4605	9	18	2026-07-01 08:00:00+00	8
4606	9	18	2026-07-01 10:00:00+00	8
4607	9	18	2026-07-01 13:00:00+00	8
4608	9	18	2026-07-02 08:00:00+00	8
4609	9	18	2026-07-02 10:00:00+00	8
4610	9	18	2026-07-02 13:00:00+00	8
4611	9	18	2026-07-03 08:00:00+00	8
4612	9	18	2026-07-03 10:00:00+00	8
4613	9	18	2026-07-03 13:00:00+00	8
4614	9	18	2026-07-06 08:00:00+00	8
4615	9	18	2026-07-06 10:00:00+00	8
4616	9	18	2026-07-06 13:00:00+00	8
4617	9	18	2026-07-07 08:00:00+00	8
4618	9	18	2026-07-07 10:00:00+00	8
4619	9	18	2026-07-07 13:00:00+00	8
4620	9	18	2026-07-08 08:00:00+00	8
4621	9	18	2026-07-08 10:00:00+00	8
4622	9	18	2026-07-08 13:00:00+00	8
4623	9	18	2026-07-09 08:00:00+00	8
4624	9	18	2026-07-09 10:00:00+00	8
4625	9	18	2026-07-09 13:00:00+00	8
4626	9	18	2026-07-10 08:00:00+00	8
4627	9	18	2026-07-10 10:00:00+00	8
4628	9	18	2026-07-10 13:00:00+00	8
4629	9	18	2026-07-13 08:00:00+00	8
4630	9	18	2026-07-13 10:00:00+00	8
4631	9	18	2026-07-13 13:00:00+00	8
4632	9	18	2026-07-14 08:00:00+00	8
4633	9	18	2026-07-14 10:00:00+00	8
4634	9	18	2026-07-14 13:00:00+00	8
4635	9	18	2026-07-15 08:00:00+00	8
4636	9	18	2026-07-15 10:00:00+00	8
4637	9	18	2026-07-15 13:00:00+00	8
4638	9	18	2026-07-16 08:00:00+00	8
4639	9	18	2026-07-16 10:00:00+00	8
4640	9	18	2026-07-16 13:00:00+00	8
4641	9	18	2026-07-17 08:00:00+00	8
4642	9	18	2026-07-17 10:00:00+00	8
4643	9	18	2026-07-17 13:00:00+00	8
4644	14	18	2026-06-29 08:00:00+00	8
4645	14	18	2026-06-29 10:00:00+00	8
4646	14	18	2026-06-29 13:00:00+00	8
4647	14	18	2026-06-30 08:00:00+00	8
4648	14	18	2026-06-30 10:00:00+00	8
4649	14	18	2026-06-30 13:00:00+00	8
4650	14	18	2026-07-01 08:00:00+00	8
4651	14	18	2026-07-01 10:00:00+00	8
4652	14	18	2026-07-01 13:00:00+00	8
4653	14	18	2026-07-02 08:00:00+00	8
4654	14	18	2026-07-02 10:00:00+00	8
4655	14	18	2026-07-02 13:00:00+00	8
4656	14	18	2026-07-03 08:00:00+00	8
4657	14	18	2026-07-03 10:00:00+00	8
4658	14	18	2026-07-03 13:00:00+00	8
4659	14	18	2026-07-06 08:00:00+00	8
4660	14	18	2026-07-06 10:00:00+00	8
4661	14	18	2026-07-06 13:00:00+00	8
4662	14	18	2026-07-07 08:00:00+00	8
4663	14	18	2026-07-07 10:00:00+00	8
4664	14	18	2026-07-07 13:00:00+00	8
4665	14	18	2026-07-08 08:00:00+00	8
4666	14	18	2026-07-08 10:00:00+00	8
4667	14	18	2026-07-08 13:00:00+00	8
4668	14	18	2026-07-09 08:00:00+00	8
4669	14	18	2026-07-09 10:00:00+00	8
4670	14	18	2026-07-09 13:00:00+00	8
4671	14	18	2026-07-10 08:00:00+00	8
4672	14	18	2026-07-10 10:00:00+00	8
4673	14	18	2026-07-10 13:00:00+00	8
4674	14	18	2026-07-13 08:00:00+00	8
4675	14	18	2026-07-13 10:00:00+00	8
4676	14	18	2026-07-13 13:00:00+00	8
4677	14	18	2026-07-14 08:00:00+00	8
4678	14	18	2026-07-14 10:00:00+00	8
4679	14	18	2026-07-14 13:00:00+00	8
4680	14	18	2026-07-15 08:00:00+00	8
4681	14	18	2026-07-15 10:00:00+00	8
4682	14	18	2026-07-15 13:00:00+00	8
4683	14	18	2026-07-16 08:00:00+00	8
4684	14	18	2026-07-16 10:00:00+00	8
4685	14	18	2026-07-16 13:00:00+00	8
4686	14	18	2026-07-17 08:00:00+00	8
4687	14	18	2026-07-17 10:00:00+00	8
4688	14	18	2026-07-17 13:00:00+00	8
4689	21	18	2026-06-29 08:00:00+00	8
4690	21	18	2026-06-29 10:00:00+00	8
4691	21	18	2026-06-29 13:00:00+00	8
4692	21	18	2026-06-30 08:00:00+00	8
4693	21	18	2026-06-30 10:00:00+00	8
4694	21	18	2026-06-30 13:00:00+00	8
4695	21	18	2026-07-01 08:00:00+00	8
4696	21	18	2026-07-01 10:00:00+00	8
4697	21	18	2026-07-01 13:00:00+00	8
4698	21	18	2026-07-02 08:00:00+00	8
4699	21	18	2026-07-02 10:00:00+00	8
4700	21	18	2026-07-02 13:00:00+00	8
4701	21	18	2026-07-03 08:00:00+00	8
4702	21	18	2026-07-03 10:00:00+00	8
4703	21	18	2026-07-03 13:00:00+00	8
4704	21	18	2026-07-06 08:00:00+00	8
4705	21	18	2026-07-06 10:00:00+00	8
4706	21	18	2026-07-06 13:00:00+00	8
4707	21	18	2026-07-07 08:00:00+00	8
4708	21	18	2026-07-07 10:00:00+00	8
4709	21	18	2026-07-07 13:00:00+00	8
4710	21	18	2026-07-08 08:00:00+00	8
4711	21	18	2026-07-08 10:00:00+00	8
4712	21	18	2026-07-08 13:00:00+00	8
4713	21	18	2026-07-09 08:00:00+00	8
4714	21	18	2026-07-09 10:00:00+00	8
4715	21	18	2026-07-09 13:00:00+00	8
4716	21	18	2026-07-10 08:00:00+00	8
4717	21	18	2026-07-10 10:00:00+00	8
4718	21	18	2026-07-10 13:00:00+00	8
4719	21	18	2026-07-13 08:00:00+00	8
4720	21	18	2026-07-13 10:00:00+00	8
4721	21	18	2026-07-13 13:00:00+00	8
4722	21	18	2026-07-14 08:00:00+00	8
4723	21	18	2026-07-14 10:00:00+00	8
4724	21	18	2026-07-14 13:00:00+00	8
4725	21	18	2026-07-15 08:00:00+00	8
4726	21	18	2026-07-15 10:00:00+00	8
4727	21	18	2026-07-15 13:00:00+00	8
4728	21	18	2026-07-16 08:00:00+00	8
4729	21	18	2026-07-16 10:00:00+00	8
4730	21	18	2026-07-16 13:00:00+00	8
4731	21	18	2026-07-17 08:00:00+00	8
4732	21	18	2026-07-17 10:00:00+00	8
4733	21	18	2026-07-17 13:00:00+00	8
4734	24	18	2026-06-29 08:00:00+00	8
4735	24	18	2026-06-29 10:00:00+00	8
4736	24	18	2026-06-29 13:00:00+00	8
4737	24	18	2026-06-30 08:00:00+00	8
4738	24	18	2026-06-30 10:00:00+00	8
4739	24	18	2026-06-30 13:00:00+00	8
4740	24	18	2026-07-01 08:00:00+00	8
4741	24	18	2026-07-01 10:00:00+00	8
4742	24	18	2026-07-01 13:00:00+00	8
4743	24	18	2026-07-02 08:00:00+00	8
4744	24	18	2026-07-02 10:00:00+00	8
4745	24	18	2026-07-02 13:00:00+00	8
4746	24	18	2026-07-03 08:00:00+00	8
4747	24	18	2026-07-03 10:00:00+00	8
4748	24	18	2026-07-03 13:00:00+00	8
4749	24	18	2026-07-06 08:00:00+00	8
4750	24	18	2026-07-06 10:00:00+00	8
4751	24	18	2026-07-06 13:00:00+00	8
4752	24	18	2026-07-07 08:00:00+00	8
4753	24	18	2026-07-07 10:00:00+00	8
4754	24	18	2026-07-07 13:00:00+00	8
4755	24	18	2026-07-08 08:00:00+00	8
4756	24	18	2026-07-08 10:00:00+00	8
4757	24	18	2026-07-08 13:00:00+00	8
4758	24	18	2026-07-09 08:00:00+00	8
4759	24	18	2026-07-09 10:00:00+00	8
4760	24	18	2026-07-09 13:00:00+00	8
4761	24	18	2026-07-10 08:00:00+00	8
4762	24	18	2026-07-10 10:00:00+00	8
4763	24	18	2026-07-10 13:00:00+00	8
4764	24	18	2026-07-13 08:00:00+00	8
4765	24	18	2026-07-13 10:00:00+00	8
4766	24	18	2026-07-13 13:00:00+00	8
4767	24	18	2026-07-14 08:00:00+00	8
4768	24	18	2026-07-14 10:00:00+00	8
4769	24	18	2026-07-14 13:00:00+00	8
4770	24	18	2026-07-15 08:00:00+00	8
4771	24	18	2026-07-15 10:00:00+00	8
4772	24	18	2026-07-15 13:00:00+00	8
4773	24	18	2026-07-16 08:00:00+00	8
4774	24	18	2026-07-16 10:00:00+00	8
4775	24	18	2026-07-16 13:00:00+00	8
4776	24	18	2026-07-17 08:00:00+00	8
4777	24	18	2026-07-17 10:00:00+00	8
4778	24	18	2026-07-17 13:00:00+00	8
4779	35	18	2026-06-29 08:00:00+00	8
4780	35	18	2026-06-29 10:00:00+00	8
4781	35	18	2026-06-29 13:00:00+00	8
4782	35	18	2026-06-30 08:00:00+00	8
4783	35	18	2026-06-30 10:00:00+00	8
4784	35	18	2026-06-30 13:00:00+00	8
4785	35	18	2026-07-01 08:00:00+00	8
4786	35	18	2026-07-01 10:00:00+00	8
4787	35	18	2026-07-01 13:00:00+00	8
4788	35	18	2026-07-02 08:00:00+00	8
4789	35	18	2026-07-02 10:00:00+00	8
4790	35	18	2026-07-02 13:00:00+00	8
4791	35	18	2026-07-03 08:00:00+00	8
4792	35	18	2026-07-03 10:00:00+00	8
4793	35	18	2026-07-03 13:00:00+00	8
4794	35	18	2026-07-06 08:00:00+00	8
4795	35	18	2026-07-06 10:00:00+00	8
4796	35	18	2026-07-06 13:00:00+00	8
4797	35	18	2026-07-07 08:00:00+00	8
4798	35	18	2026-07-07 10:00:00+00	8
4799	35	18	2026-07-07 13:00:00+00	8
4800	35	18	2026-07-08 08:00:00+00	8
4801	35	18	2026-07-08 10:00:00+00	8
4802	35	18	2026-07-08 13:00:00+00	8
4803	35	18	2026-07-09 08:00:00+00	8
4804	35	18	2026-07-09 10:00:00+00	8
4805	35	18	2026-07-09 13:00:00+00	8
4806	35	18	2026-07-10 08:00:00+00	8
4807	35	18	2026-07-10 10:00:00+00	8
4808	35	18	2026-07-10 13:00:00+00	8
4809	35	18	2026-07-13 08:00:00+00	8
4810	35	18	2026-07-13 10:00:00+00	8
4811	35	18	2026-07-13 13:00:00+00	8
4812	35	18	2026-07-14 08:00:00+00	8
4813	35	18	2026-07-14 10:00:00+00	8
4814	35	18	2026-07-14 13:00:00+00	8
4815	35	18	2026-07-15 08:00:00+00	8
4816	35	18	2026-07-15 10:00:00+00	8
4817	35	18	2026-07-15 13:00:00+00	8
4818	35	18	2026-07-16 08:00:00+00	8
4819	35	18	2026-07-16 10:00:00+00	8
4820	35	18	2026-07-16 13:00:00+00	8
4821	35	18	2026-07-17 08:00:00+00	8
4822	35	18	2026-07-17 10:00:00+00	8
4823	35	18	2026-07-17 13:00:00+00	8
4824	36	18	2026-06-29 08:00:00+00	8
4825	36	18	2026-06-29 10:00:00+00	8
4826	36	18	2026-06-29 13:00:00+00	8
4827	36	18	2026-06-30 08:00:00+00	8
4828	36	18	2026-06-30 10:00:00+00	8
4829	36	18	2026-06-30 13:00:00+00	8
4830	36	18	2026-07-01 08:00:00+00	8
4831	36	18	2026-07-01 10:00:00+00	8
4832	36	18	2026-07-01 13:00:00+00	8
4833	36	18	2026-07-02 08:00:00+00	8
4834	36	18	2026-07-02 10:00:00+00	8
4835	36	18	2026-07-02 13:00:00+00	8
4836	36	18	2026-07-03 08:00:00+00	8
4837	36	18	2026-07-03 10:00:00+00	8
4838	36	18	2026-07-03 13:00:00+00	8
4839	36	18	2026-07-06 08:00:00+00	8
4840	36	18	2026-07-06 10:00:00+00	8
4841	36	18	2026-07-06 13:00:00+00	8
4842	36	18	2026-07-07 08:00:00+00	8
4843	36	18	2026-07-07 10:00:00+00	8
4844	36	18	2026-07-07 13:00:00+00	8
4845	36	18	2026-07-08 08:00:00+00	8
4846	36	18	2026-07-08 10:00:00+00	8
4847	36	18	2026-07-08 13:00:00+00	8
4848	36	18	2026-07-09 08:00:00+00	8
4849	36	18	2026-07-09 10:00:00+00	8
4850	36	18	2026-07-09 13:00:00+00	8
4851	36	18	2026-07-10 08:00:00+00	8
4852	36	18	2026-07-10 10:00:00+00	8
4853	36	18	2026-07-10 13:00:00+00	8
4854	36	18	2026-07-13 08:00:00+00	8
4855	36	18	2026-07-13 10:00:00+00	8
4856	36	18	2026-07-13 13:00:00+00	8
4857	36	18	2026-07-14 08:00:00+00	8
4858	36	18	2026-07-14 10:00:00+00	8
4859	36	18	2026-07-14 13:00:00+00	8
4860	36	18	2026-07-15 08:00:00+00	8
4861	36	18	2026-07-15 10:00:00+00	8
4862	36	18	2026-07-15 13:00:00+00	8
4863	36	18	2026-07-16 08:00:00+00	8
4864	36	18	2026-07-16 10:00:00+00	8
4865	36	18	2026-07-16 13:00:00+00	8
4866	36	18	2026-07-17 08:00:00+00	8
4867	36	18	2026-07-17 10:00:00+00	8
4868	36	18	2026-07-17 13:00:00+00	8
4869	43	18	2026-06-29 08:00:00+00	8
4870	43	18	2026-06-29 10:00:00+00	8
4871	43	18	2026-06-29 13:00:00+00	8
4872	43	18	2026-06-30 08:00:00+00	8
4873	43	18	2026-06-30 10:00:00+00	8
4874	43	18	2026-06-30 13:00:00+00	8
4875	43	18	2026-07-01 08:00:00+00	8
4876	43	18	2026-07-01 10:00:00+00	8
4877	43	18	2026-07-01 13:00:00+00	8
4878	43	18	2026-07-02 08:00:00+00	8
4879	43	18	2026-07-02 10:00:00+00	8
4880	43	18	2026-07-02 13:00:00+00	8
4881	43	18	2026-07-03 08:00:00+00	8
4882	43	18	2026-07-03 10:00:00+00	8
4883	43	18	2026-07-03 13:00:00+00	8
4884	43	18	2026-07-06 08:00:00+00	8
4885	43	18	2026-07-06 10:00:00+00	8
4886	43	18	2026-07-06 13:00:00+00	8
4887	43	18	2026-07-07 08:00:00+00	8
4888	43	18	2026-07-07 10:00:00+00	8
4889	43	18	2026-07-07 13:00:00+00	8
4890	43	18	2026-07-08 08:00:00+00	8
4891	43	18	2026-07-08 10:00:00+00	8
4892	43	18	2026-07-08 13:00:00+00	8
4893	43	18	2026-07-09 08:00:00+00	8
4894	43	18	2026-07-09 10:00:00+00	8
4895	43	18	2026-07-09 13:00:00+00	8
4896	43	18	2026-07-10 08:00:00+00	8
4897	43	18	2026-07-10 10:00:00+00	8
4898	43	18	2026-07-10 13:00:00+00	8
4899	43	18	2026-07-13 08:00:00+00	8
4900	43	18	2026-07-13 10:00:00+00	8
4901	43	18	2026-07-13 13:00:00+00	8
4902	43	18	2026-07-14 08:00:00+00	8
4903	43	18	2026-07-14 10:00:00+00	8
4904	43	18	2026-07-14 13:00:00+00	8
4905	43	18	2026-07-15 08:00:00+00	8
4906	43	18	2026-07-15 10:00:00+00	8
4907	43	18	2026-07-15 13:00:00+00	8
4908	43	18	2026-07-16 08:00:00+00	8
4909	43	18	2026-07-16 10:00:00+00	8
4910	43	18	2026-07-16 13:00:00+00	8
4911	43	18	2026-07-17 08:00:00+00	8
4912	43	18	2026-07-17 10:00:00+00	8
4913	43	18	2026-07-17 13:00:00+00	8
4914	46	18	2026-06-29 08:00:00+00	8
4915	46	18	2026-06-29 10:00:00+00	8
4916	46	18	2026-06-29 13:00:00+00	8
4917	46	18	2026-06-30 08:00:00+00	8
4918	46	18	2026-06-30 10:00:00+00	8
4919	46	18	2026-06-30 13:00:00+00	8
4920	46	18	2026-07-01 08:00:00+00	8
4921	46	18	2026-07-01 10:00:00+00	8
4922	46	18	2026-07-01 13:00:00+00	8
4923	46	18	2026-07-02 08:00:00+00	8
4924	46	18	2026-07-02 10:00:00+00	8
4925	46	18	2026-07-02 13:00:00+00	8
4926	46	18	2026-07-03 08:00:00+00	8
4927	46	18	2026-07-03 10:00:00+00	8
4928	46	18	2026-07-03 13:00:00+00	8
4929	46	18	2026-07-06 08:00:00+00	8
4930	46	18	2026-07-06 10:00:00+00	8
4931	46	18	2026-07-06 13:00:00+00	8
4932	46	18	2026-07-07 08:00:00+00	8
4933	46	18	2026-07-07 10:00:00+00	8
4934	46	18	2026-07-07 13:00:00+00	8
4935	46	18	2026-07-08 08:00:00+00	8
4936	46	18	2026-07-08 10:00:00+00	8
4937	46	18	2026-07-08 13:00:00+00	8
4938	46	18	2026-07-09 08:00:00+00	8
4939	46	18	2026-07-09 10:00:00+00	8
4940	46	18	2026-07-09 13:00:00+00	8
4941	46	18	2026-07-10 08:00:00+00	8
4942	46	18	2026-07-10 10:00:00+00	8
4943	46	18	2026-07-10 13:00:00+00	8
4944	46	18	2026-07-13 08:00:00+00	8
4945	46	18	2026-07-13 10:00:00+00	8
4946	46	18	2026-07-13 13:00:00+00	8
4947	46	18	2026-07-14 08:00:00+00	8
4948	46	18	2026-07-14 10:00:00+00	8
4949	46	18	2026-07-14 13:00:00+00	8
4950	46	18	2026-07-15 08:00:00+00	8
4951	46	18	2026-07-15 10:00:00+00	8
4952	46	18	2026-07-15 13:00:00+00	8
4953	46	18	2026-07-16 08:00:00+00	8
4954	46	18	2026-07-16 10:00:00+00	8
4955	46	18	2026-07-16 13:00:00+00	8
4956	46	18	2026-07-17 08:00:00+00	8
4957	46	18	2026-07-17 10:00:00+00	8
4958	46	18	2026-07-17 13:00:00+00	8
4959	50	18	2026-06-29 08:00:00+00	8
4960	50	18	2026-06-29 10:00:00+00	8
4961	50	18	2026-06-29 13:00:00+00	8
4962	50	18	2026-06-30 08:00:00+00	8
4963	50	18	2026-06-30 10:00:00+00	8
4964	50	18	2026-06-30 13:00:00+00	8
4965	50	18	2026-07-01 08:00:00+00	8
4966	50	18	2026-07-01 10:00:00+00	8
4967	50	18	2026-07-01 13:00:00+00	8
4968	50	18	2026-07-02 08:00:00+00	8
4969	50	18	2026-07-02 10:00:00+00	8
4970	50	18	2026-07-02 13:00:00+00	8
4971	50	18	2026-07-03 08:00:00+00	8
4972	50	18	2026-07-03 10:00:00+00	8
4973	50	18	2026-07-03 13:00:00+00	8
4974	50	18	2026-07-06 08:00:00+00	8
4975	50	18	2026-07-06 10:00:00+00	8
4976	50	18	2026-07-06 13:00:00+00	8
4977	50	18	2026-07-07 08:00:00+00	8
4978	50	18	2026-07-07 10:00:00+00	8
4979	50	18	2026-07-07 13:00:00+00	8
4980	50	18	2026-07-08 08:00:00+00	8
4981	50	18	2026-07-08 10:00:00+00	8
4982	50	18	2026-07-08 13:00:00+00	8
4983	50	18	2026-07-09 08:00:00+00	8
4984	50	18	2026-07-09 10:00:00+00	8
4985	50	18	2026-07-09 13:00:00+00	8
4986	50	18	2026-07-10 08:00:00+00	8
4987	50	18	2026-07-10 10:00:00+00	8
4988	50	18	2026-07-10 13:00:00+00	8
4989	50	18	2026-07-13 08:00:00+00	8
4990	50	18	2026-07-13 10:00:00+00	8
4991	50	18	2026-07-13 13:00:00+00	8
4992	50	18	2026-07-14 08:00:00+00	8
4993	50	18	2026-07-14 10:00:00+00	8
4994	50	18	2026-07-14 13:00:00+00	8
4995	50	18	2026-07-15 08:00:00+00	8
4996	50	18	2026-07-15 10:00:00+00	8
4997	50	18	2026-07-15 13:00:00+00	8
4998	50	18	2026-07-16 08:00:00+00	8
4999	50	18	2026-07-16 10:00:00+00	8
5000	50	18	2026-07-16 13:00:00+00	8
5001	50	18	2026-07-17 08:00:00+00	8
5002	50	18	2026-07-17 10:00:00+00	8
5003	50	18	2026-07-17 13:00:00+00	8
5004	1	19	2026-06-29 08:00:00+00	8
5005	1	19	2026-06-29 10:00:00+00	8
5006	1	19	2026-06-29 13:00:00+00	8
5007	1	19	2026-06-30 08:00:00+00	8
5008	1	19	2026-06-30 10:00:00+00	8
5009	1	19	2026-06-30 13:00:00+00	8
5010	1	19	2026-07-01 08:00:00+00	8
5011	1	19	2026-07-01 10:00:00+00	8
5012	1	19	2026-07-01 13:00:00+00	8
5013	1	19	2026-07-02 08:00:00+00	8
5014	1	19	2026-07-02 10:00:00+00	8
5015	1	19	2026-07-02 13:00:00+00	8
5016	1	19	2026-07-03 08:00:00+00	8
5017	1	19	2026-07-03 10:00:00+00	8
5018	1	19	2026-07-03 13:00:00+00	8
5019	1	19	2026-07-06 08:00:00+00	8
5020	1	19	2026-07-06 10:00:00+00	8
5021	1	19	2026-07-06 13:00:00+00	8
5022	1	19	2026-07-07 08:00:00+00	8
5023	1	19	2026-07-07 10:00:00+00	8
5024	1	19	2026-07-07 13:00:00+00	8
5025	1	19	2026-07-08 08:00:00+00	8
5026	1	19	2026-07-08 10:00:00+00	8
5027	1	19	2026-07-08 13:00:00+00	8
5028	1	19	2026-07-09 08:00:00+00	8
5029	1	19	2026-07-09 10:00:00+00	8
5030	1	19	2026-07-09 13:00:00+00	8
5031	1	19	2026-07-10 08:00:00+00	8
5032	1	19	2026-07-10 10:00:00+00	8
5033	1	19	2026-07-10 13:00:00+00	8
5034	1	19	2026-07-13 08:00:00+00	8
5035	1	19	2026-07-13 10:00:00+00	8
5036	1	19	2026-07-13 13:00:00+00	8
5037	1	19	2026-07-14 08:00:00+00	8
5038	1	19	2026-07-14 10:00:00+00	8
5039	1	19	2026-07-14 13:00:00+00	8
5040	1	19	2026-07-15 08:00:00+00	8
5041	1	19	2026-07-15 10:00:00+00	8
5042	1	19	2026-07-15 13:00:00+00	8
5043	1	19	2026-07-16 08:00:00+00	8
5044	1	19	2026-07-16 10:00:00+00	8
5045	1	19	2026-07-16 13:00:00+00	8
5046	1	19	2026-07-17 08:00:00+00	8
5047	1	19	2026-07-17 10:00:00+00	8
5048	1	19	2026-07-17 13:00:00+00	8
5049	2	19	2026-06-29 08:00:00+00	8
5050	2	19	2026-06-29 10:00:00+00	8
5051	2	19	2026-06-29 13:00:00+00	8
5052	2	19	2026-06-30 08:00:00+00	8
5053	2	19	2026-06-30 10:00:00+00	8
5054	2	19	2026-06-30 13:00:00+00	8
5055	2	19	2026-07-01 08:00:00+00	8
5056	2	19	2026-07-01 10:00:00+00	8
5057	2	19	2026-07-01 13:00:00+00	8
5058	2	19	2026-07-02 08:00:00+00	8
5059	2	19	2026-07-02 10:00:00+00	8
5060	2	19	2026-07-02 13:00:00+00	8
5061	2	19	2026-07-03 08:00:00+00	8
5062	2	19	2026-07-03 10:00:00+00	8
5063	2	19	2026-07-03 13:00:00+00	8
5064	2	19	2026-07-06 08:00:00+00	8
5065	2	19	2026-07-06 10:00:00+00	8
5066	2	19	2026-07-06 13:00:00+00	8
5067	2	19	2026-07-07 08:00:00+00	8
5068	2	19	2026-07-07 10:00:00+00	8
5069	2	19	2026-07-07 13:00:00+00	8
5070	2	19	2026-07-08 08:00:00+00	8
5071	2	19	2026-07-08 10:00:00+00	8
5072	2	19	2026-07-08 13:00:00+00	8
5073	2	19	2026-07-09 08:00:00+00	8
5074	2	19	2026-07-09 10:00:00+00	8
5075	2	19	2026-07-09 13:00:00+00	8
5076	2	19	2026-07-10 08:00:00+00	8
5077	2	19	2026-07-10 10:00:00+00	8
5078	2	19	2026-07-10 13:00:00+00	8
5079	2	19	2026-07-13 08:00:00+00	8
5080	2	19	2026-07-13 10:00:00+00	8
5081	2	19	2026-07-13 13:00:00+00	8
5082	2	19	2026-07-14 08:00:00+00	8
5083	2	19	2026-07-14 10:00:00+00	8
5084	2	19	2026-07-14 13:00:00+00	8
5085	2	19	2026-07-15 08:00:00+00	8
5086	2	19	2026-07-15 10:00:00+00	8
5087	2	19	2026-07-15 13:00:00+00	8
5088	2	19	2026-07-16 08:00:00+00	8
5089	2	19	2026-07-16 10:00:00+00	8
5090	2	19	2026-07-16 13:00:00+00	8
5091	2	19	2026-07-17 08:00:00+00	8
5092	2	19	2026-07-17 10:00:00+00	8
5093	2	19	2026-07-17 13:00:00+00	8
5094	5	19	2026-06-29 08:00:00+00	8
5095	5	19	2026-06-29 10:00:00+00	8
5096	5	19	2026-06-29 13:00:00+00	8
5097	5	19	2026-06-30 08:00:00+00	8
5098	5	19	2026-06-30 10:00:00+00	8
5099	5	19	2026-06-30 13:00:00+00	8
5100	5	19	2026-07-01 08:00:00+00	8
5101	5	19	2026-07-01 10:00:00+00	8
5102	5	19	2026-07-01 13:00:00+00	8
5103	5	19	2026-07-02 08:00:00+00	8
5104	5	19	2026-07-02 10:00:00+00	8
5105	5	19	2026-07-02 13:00:00+00	8
5106	5	19	2026-07-03 08:00:00+00	8
5107	5	19	2026-07-03 10:00:00+00	8
5108	5	19	2026-07-03 13:00:00+00	8
5109	5	19	2026-07-06 08:00:00+00	8
5110	5	19	2026-07-06 10:00:00+00	8
5111	5	19	2026-07-06 13:00:00+00	8
5112	5	19	2026-07-07 08:00:00+00	8
5113	5	19	2026-07-07 10:00:00+00	8
5114	5	19	2026-07-07 13:00:00+00	8
5115	5	19	2026-07-08 08:00:00+00	8
5116	5	19	2026-07-08 10:00:00+00	8
5117	5	19	2026-07-08 13:00:00+00	8
5118	5	19	2026-07-09 08:00:00+00	8
5119	5	19	2026-07-09 10:00:00+00	8
5120	5	19	2026-07-09 13:00:00+00	8
5121	5	19	2026-07-10 08:00:00+00	8
5122	5	19	2026-07-10 10:00:00+00	8
5123	5	19	2026-07-10 13:00:00+00	8
5124	5	19	2026-07-13 08:00:00+00	8
5125	5	19	2026-07-13 10:00:00+00	8
5126	5	19	2026-07-13 13:00:00+00	8
5127	5	19	2026-07-14 08:00:00+00	8
5128	5	19	2026-07-14 10:00:00+00	8
5129	5	19	2026-07-14 13:00:00+00	8
5130	5	19	2026-07-15 08:00:00+00	8
5131	5	19	2026-07-15 10:00:00+00	8
5132	5	19	2026-07-15 13:00:00+00	8
5133	5	19	2026-07-16 08:00:00+00	8
5134	5	19	2026-07-16 10:00:00+00	8
5135	5	19	2026-07-16 13:00:00+00	8
5136	5	19	2026-07-17 08:00:00+00	8
5137	5	19	2026-07-17 10:00:00+00	8
5138	5	19	2026-07-17 13:00:00+00	8
5139	7	19	2026-06-29 08:00:00+00	8
5140	7	19	2026-06-29 10:00:00+00	8
5141	7	19	2026-06-29 13:00:00+00	8
5142	7	19	2026-06-30 08:00:00+00	8
5143	7	19	2026-06-30 10:00:00+00	8
5144	7	19	2026-06-30 13:00:00+00	8
5145	7	19	2026-07-01 08:00:00+00	8
5146	7	19	2026-07-01 10:00:00+00	8
5147	7	19	2026-07-01 13:00:00+00	8
5148	7	19	2026-07-02 08:00:00+00	8
5149	7	19	2026-07-02 10:00:00+00	8
5150	7	19	2026-07-02 13:00:00+00	8
5151	7	19	2026-07-03 08:00:00+00	8
5152	7	19	2026-07-03 10:00:00+00	8
5153	7	19	2026-07-03 13:00:00+00	8
5154	7	19	2026-07-06 08:00:00+00	8
5155	7	19	2026-07-06 10:00:00+00	8
5156	7	19	2026-07-06 13:00:00+00	8
5157	7	19	2026-07-07 08:00:00+00	8
5158	7	19	2026-07-07 10:00:00+00	8
5159	7	19	2026-07-07 13:00:00+00	8
5160	7	19	2026-07-08 08:00:00+00	8
5161	7	19	2026-07-08 10:00:00+00	8
5162	7	19	2026-07-08 13:00:00+00	8
5163	7	19	2026-07-09 08:00:00+00	8
5164	7	19	2026-07-09 10:00:00+00	8
5165	7	19	2026-07-09 13:00:00+00	8
5166	7	19	2026-07-10 08:00:00+00	8
5167	7	19	2026-07-10 10:00:00+00	8
5168	7	19	2026-07-10 13:00:00+00	8
5169	7	19	2026-07-13 08:00:00+00	8
5170	7	19	2026-07-13 10:00:00+00	8
5171	7	19	2026-07-13 13:00:00+00	8
5172	7	19	2026-07-14 08:00:00+00	8
5173	7	19	2026-07-14 10:00:00+00	8
5174	7	19	2026-07-14 13:00:00+00	8
5175	7	19	2026-07-15 08:00:00+00	8
5176	7	19	2026-07-15 10:00:00+00	8
5177	7	19	2026-07-15 13:00:00+00	8
5178	7	19	2026-07-16 08:00:00+00	8
5179	7	19	2026-07-16 10:00:00+00	8
5180	7	19	2026-07-16 13:00:00+00	8
5181	7	19	2026-07-17 08:00:00+00	8
5182	7	19	2026-07-17 10:00:00+00	8
5183	7	19	2026-07-17 13:00:00+00	8
5184	9	19	2026-06-29 08:00:00+00	8
5185	9	19	2026-06-29 10:00:00+00	8
5186	9	19	2026-06-29 13:00:00+00	8
5187	9	19	2026-06-30 08:00:00+00	8
5188	9	19	2026-06-30 10:00:00+00	8
5189	9	19	2026-06-30 13:00:00+00	8
5190	9	19	2026-07-01 08:00:00+00	8
5191	9	19	2026-07-01 10:00:00+00	8
5192	9	19	2026-07-01 13:00:00+00	8
5193	9	19	2026-07-02 08:00:00+00	8
5194	9	19	2026-07-02 10:00:00+00	8
5195	9	19	2026-07-02 13:00:00+00	8
5196	9	19	2026-07-03 08:00:00+00	8
5197	9	19	2026-07-03 10:00:00+00	8
5198	9	19	2026-07-03 13:00:00+00	8
5199	9	19	2026-07-06 08:00:00+00	8
5200	9	19	2026-07-06 10:00:00+00	8
5201	9	19	2026-07-06 13:00:00+00	8
5202	9	19	2026-07-07 08:00:00+00	8
5203	9	19	2026-07-07 10:00:00+00	8
5204	9	19	2026-07-07 13:00:00+00	8
5205	9	19	2026-07-08 08:00:00+00	8
5206	9	19	2026-07-08 10:00:00+00	8
5207	9	19	2026-07-08 13:00:00+00	8
5208	9	19	2026-07-09 08:00:00+00	8
5209	9	19	2026-07-09 10:00:00+00	8
5210	9	19	2026-07-09 13:00:00+00	8
5211	9	19	2026-07-10 08:00:00+00	8
5212	9	19	2026-07-10 10:00:00+00	8
5213	9	19	2026-07-10 13:00:00+00	8
5214	9	19	2026-07-13 08:00:00+00	8
5215	9	19	2026-07-13 10:00:00+00	8
5216	9	19	2026-07-13 13:00:00+00	8
5217	9	19	2026-07-14 08:00:00+00	8
5218	9	19	2026-07-14 10:00:00+00	8
5219	9	19	2026-07-14 13:00:00+00	8
5220	9	19	2026-07-15 08:00:00+00	8
5221	9	19	2026-07-15 10:00:00+00	8
5222	9	19	2026-07-15 13:00:00+00	8
5223	9	19	2026-07-16 08:00:00+00	8
5224	9	19	2026-07-16 10:00:00+00	8
5225	9	19	2026-07-16 13:00:00+00	8
5226	9	19	2026-07-17 08:00:00+00	8
5227	9	19	2026-07-17 10:00:00+00	8
5228	9	19	2026-07-17 13:00:00+00	8
5229	14	19	2026-06-29 08:00:00+00	8
5230	14	19	2026-06-29 10:00:00+00	8
5231	14	19	2026-06-29 13:00:00+00	8
5232	14	19	2026-06-30 08:00:00+00	8
5233	14	19	2026-06-30 10:00:00+00	8
5234	14	19	2026-06-30 13:00:00+00	8
5235	14	19	2026-07-01 08:00:00+00	8
5236	14	19	2026-07-01 10:00:00+00	8
5237	14	19	2026-07-01 13:00:00+00	8
5238	14	19	2026-07-02 08:00:00+00	8
5239	14	19	2026-07-02 10:00:00+00	8
5240	14	19	2026-07-02 13:00:00+00	8
5241	14	19	2026-07-03 08:00:00+00	8
5242	14	19	2026-07-03 10:00:00+00	8
5243	14	19	2026-07-03 13:00:00+00	8
5244	14	19	2026-07-06 08:00:00+00	8
5245	14	19	2026-07-06 10:00:00+00	8
5246	14	19	2026-07-06 13:00:00+00	8
5247	14	19	2026-07-07 08:00:00+00	8
5248	14	19	2026-07-07 10:00:00+00	8
5249	14	19	2026-07-07 13:00:00+00	8
5250	14	19	2026-07-08 08:00:00+00	8
5251	14	19	2026-07-08 10:00:00+00	8
5252	14	19	2026-07-08 13:00:00+00	8
5253	14	19	2026-07-09 08:00:00+00	8
5254	14	19	2026-07-09 10:00:00+00	8
5255	14	19	2026-07-09 13:00:00+00	8
5256	14	19	2026-07-10 08:00:00+00	8
5257	14	19	2026-07-10 10:00:00+00	8
5258	14	19	2026-07-10 13:00:00+00	8
5259	14	19	2026-07-13 08:00:00+00	8
5260	14	19	2026-07-13 10:00:00+00	8
5261	14	19	2026-07-13 13:00:00+00	8
5262	14	19	2026-07-14 08:00:00+00	8
5263	14	19	2026-07-14 10:00:00+00	8
5264	14	19	2026-07-14 13:00:00+00	8
5265	14	19	2026-07-15 08:00:00+00	8
5266	14	19	2026-07-15 10:00:00+00	8
5267	14	19	2026-07-15 13:00:00+00	8
5268	14	19	2026-07-16 08:00:00+00	8
5269	14	19	2026-07-16 10:00:00+00	8
5270	14	19	2026-07-16 13:00:00+00	8
5271	14	19	2026-07-17 08:00:00+00	8
5272	14	19	2026-07-17 10:00:00+00	8
5273	14	19	2026-07-17 13:00:00+00	8
5274	21	19	2026-06-29 08:00:00+00	8
5275	21	19	2026-06-29 10:00:00+00	8
5276	21	19	2026-06-29 13:00:00+00	8
5277	21	19	2026-06-30 08:00:00+00	8
5278	21	19	2026-06-30 10:00:00+00	8
5279	21	19	2026-06-30 13:00:00+00	8
5280	21	19	2026-07-01 08:00:00+00	8
5281	21	19	2026-07-01 10:00:00+00	8
5282	21	19	2026-07-01 13:00:00+00	8
5283	21	19	2026-07-02 08:00:00+00	8
5284	21	19	2026-07-02 10:00:00+00	8
5285	21	19	2026-07-02 13:00:00+00	8
5286	21	19	2026-07-03 08:00:00+00	8
5287	21	19	2026-07-03 10:00:00+00	8
5288	21	19	2026-07-03 13:00:00+00	8
5289	21	19	2026-07-06 08:00:00+00	8
5290	21	19	2026-07-06 10:00:00+00	8
5291	21	19	2026-07-06 13:00:00+00	8
5292	21	19	2026-07-07 08:00:00+00	8
5293	21	19	2026-07-07 10:00:00+00	8
5294	21	19	2026-07-07 13:00:00+00	8
5295	21	19	2026-07-08 08:00:00+00	8
5296	21	19	2026-07-08 10:00:00+00	8
5297	21	19	2026-07-08 13:00:00+00	8
5298	21	19	2026-07-09 08:00:00+00	8
5299	21	19	2026-07-09 10:00:00+00	8
5300	21	19	2026-07-09 13:00:00+00	8
5301	21	19	2026-07-10 08:00:00+00	8
5302	21	19	2026-07-10 10:00:00+00	8
5303	21	19	2026-07-10 13:00:00+00	8
5304	21	19	2026-07-13 08:00:00+00	8
5305	21	19	2026-07-13 10:00:00+00	8
5306	21	19	2026-07-13 13:00:00+00	8
5307	21	19	2026-07-14 08:00:00+00	8
5308	21	19	2026-07-14 10:00:00+00	8
5309	21	19	2026-07-14 13:00:00+00	8
5310	21	19	2026-07-15 08:00:00+00	8
5311	21	19	2026-07-15 10:00:00+00	8
5312	21	19	2026-07-15 13:00:00+00	8
5313	21	19	2026-07-16 08:00:00+00	8
5314	21	19	2026-07-16 10:00:00+00	8
5315	21	19	2026-07-16 13:00:00+00	8
5316	21	19	2026-07-17 08:00:00+00	8
5317	21	19	2026-07-17 10:00:00+00	8
5318	21	19	2026-07-17 13:00:00+00	8
5319	24	19	2026-06-29 08:00:00+00	8
5320	24	19	2026-06-29 10:00:00+00	8
5321	24	19	2026-06-29 13:00:00+00	8
5322	24	19	2026-06-30 08:00:00+00	8
5323	24	19	2026-06-30 10:00:00+00	8
5324	24	19	2026-06-30 13:00:00+00	8
5325	24	19	2026-07-01 08:00:00+00	8
5326	24	19	2026-07-01 10:00:00+00	8
5327	24	19	2026-07-01 13:00:00+00	8
5328	24	19	2026-07-02 08:00:00+00	8
5329	24	19	2026-07-02 10:00:00+00	8
5330	24	19	2026-07-02 13:00:00+00	8
5331	24	19	2026-07-03 08:00:00+00	8
5332	24	19	2026-07-03 10:00:00+00	8
5333	24	19	2026-07-03 13:00:00+00	8
5334	24	19	2026-07-06 08:00:00+00	8
5335	24	19	2026-07-06 10:00:00+00	8
5336	24	19	2026-07-06 13:00:00+00	8
5337	24	19	2026-07-07 08:00:00+00	8
5338	24	19	2026-07-07 10:00:00+00	8
5339	24	19	2026-07-07 13:00:00+00	8
5340	24	19	2026-07-08 08:00:00+00	8
5341	24	19	2026-07-08 10:00:00+00	8
5342	24	19	2026-07-08 13:00:00+00	8
5343	24	19	2026-07-09 08:00:00+00	8
5344	24	19	2026-07-09 10:00:00+00	8
5345	24	19	2026-07-09 13:00:00+00	8
5346	24	19	2026-07-10 08:00:00+00	8
5347	24	19	2026-07-10 10:00:00+00	8
5348	24	19	2026-07-10 13:00:00+00	8
5349	24	19	2026-07-13 08:00:00+00	8
5350	24	19	2026-07-13 10:00:00+00	8
5351	24	19	2026-07-13 13:00:00+00	8
5352	24	19	2026-07-14 08:00:00+00	8
5353	24	19	2026-07-14 10:00:00+00	8
5354	24	19	2026-07-14 13:00:00+00	8
5355	24	19	2026-07-15 08:00:00+00	8
5356	24	19	2026-07-15 10:00:00+00	8
5357	24	19	2026-07-15 13:00:00+00	8
5358	24	19	2026-07-16 08:00:00+00	8
5359	24	19	2026-07-16 10:00:00+00	8
5360	24	19	2026-07-16 13:00:00+00	8
5361	24	19	2026-07-17 08:00:00+00	8
5362	24	19	2026-07-17 10:00:00+00	8
5363	24	19	2026-07-17 13:00:00+00	8
5364	35	19	2026-06-29 08:00:00+00	8
5365	35	19	2026-06-29 10:00:00+00	8
5366	35	19	2026-06-29 13:00:00+00	8
5367	35	19	2026-06-30 08:00:00+00	8
5368	35	19	2026-06-30 10:00:00+00	8
5369	35	19	2026-06-30 13:00:00+00	8
5370	35	19	2026-07-01 08:00:00+00	8
5371	35	19	2026-07-01 10:00:00+00	8
5372	35	19	2026-07-01 13:00:00+00	8
5373	35	19	2026-07-02 08:00:00+00	8
5374	35	19	2026-07-02 10:00:00+00	8
5375	35	19	2026-07-02 13:00:00+00	8
5376	35	19	2026-07-03 08:00:00+00	8
5377	35	19	2026-07-03 10:00:00+00	8
5378	35	19	2026-07-03 13:00:00+00	8
5379	35	19	2026-07-06 08:00:00+00	8
5380	35	19	2026-07-06 10:00:00+00	8
5381	35	19	2026-07-06 13:00:00+00	8
5382	35	19	2026-07-07 08:00:00+00	8
5383	35	19	2026-07-07 10:00:00+00	8
5384	35	19	2026-07-07 13:00:00+00	8
5385	35	19	2026-07-08 08:00:00+00	8
5386	35	19	2026-07-08 10:00:00+00	8
5387	35	19	2026-07-08 13:00:00+00	8
5388	35	19	2026-07-09 08:00:00+00	8
5389	35	19	2026-07-09 10:00:00+00	8
5390	35	19	2026-07-09 13:00:00+00	8
5391	35	19	2026-07-10 08:00:00+00	8
5392	35	19	2026-07-10 10:00:00+00	8
5393	35	19	2026-07-10 13:00:00+00	8
5394	35	19	2026-07-13 08:00:00+00	8
5395	35	19	2026-07-13 10:00:00+00	8
5396	35	19	2026-07-13 13:00:00+00	8
5397	35	19	2026-07-14 08:00:00+00	8
5398	35	19	2026-07-14 10:00:00+00	8
5399	35	19	2026-07-14 13:00:00+00	8
5400	35	19	2026-07-15 08:00:00+00	8
5401	35	19	2026-07-15 10:00:00+00	8
5402	35	19	2026-07-15 13:00:00+00	8
5403	35	19	2026-07-16 08:00:00+00	8
5404	35	19	2026-07-16 10:00:00+00	8
5405	35	19	2026-07-16 13:00:00+00	8
5406	35	19	2026-07-17 08:00:00+00	8
5407	35	19	2026-07-17 10:00:00+00	8
5408	35	19	2026-07-17 13:00:00+00	8
5409	36	19	2026-06-29 08:00:00+00	8
5410	36	19	2026-06-29 10:00:00+00	8
5411	36	19	2026-06-29 13:00:00+00	8
5412	36	19	2026-06-30 08:00:00+00	8
5413	36	19	2026-06-30 10:00:00+00	8
5414	36	19	2026-06-30 13:00:00+00	8
5415	36	19	2026-07-01 08:00:00+00	8
5416	36	19	2026-07-01 10:00:00+00	8
5417	36	19	2026-07-01 13:00:00+00	8
5418	36	19	2026-07-02 08:00:00+00	8
5419	36	19	2026-07-02 10:00:00+00	8
5420	36	19	2026-07-02 13:00:00+00	8
5421	36	19	2026-07-03 08:00:00+00	8
5422	36	19	2026-07-03 10:00:00+00	8
5423	36	19	2026-07-03 13:00:00+00	8
5424	36	19	2026-07-06 08:00:00+00	8
5425	36	19	2026-07-06 10:00:00+00	8
5426	36	19	2026-07-06 13:00:00+00	8
5427	36	19	2026-07-07 08:00:00+00	8
5428	36	19	2026-07-07 10:00:00+00	8
5429	36	19	2026-07-07 13:00:00+00	8
5430	36	19	2026-07-08 08:00:00+00	8
5431	36	19	2026-07-08 10:00:00+00	8
5432	36	19	2026-07-08 13:00:00+00	8
5433	36	19	2026-07-09 08:00:00+00	8
5434	36	19	2026-07-09 10:00:00+00	8
5435	36	19	2026-07-09 13:00:00+00	8
5436	36	19	2026-07-10 08:00:00+00	8
5437	36	19	2026-07-10 10:00:00+00	8
5438	36	19	2026-07-10 13:00:00+00	8
5439	36	19	2026-07-13 08:00:00+00	8
5440	36	19	2026-07-13 10:00:00+00	8
5441	36	19	2026-07-13 13:00:00+00	8
5442	36	19	2026-07-14 08:00:00+00	8
5443	36	19	2026-07-14 10:00:00+00	8
5444	36	19	2026-07-14 13:00:00+00	8
5445	36	19	2026-07-15 08:00:00+00	8
5446	36	19	2026-07-15 10:00:00+00	8
5447	36	19	2026-07-15 13:00:00+00	8
5448	36	19	2026-07-16 08:00:00+00	8
5449	36	19	2026-07-16 10:00:00+00	8
5450	36	19	2026-07-16 13:00:00+00	8
5451	36	19	2026-07-17 08:00:00+00	8
5452	36	19	2026-07-17 10:00:00+00	8
5453	36	19	2026-07-17 13:00:00+00	8
5454	43	19	2026-06-29 08:00:00+00	8
5455	43	19	2026-06-29 10:00:00+00	8
5456	43	19	2026-06-29 13:00:00+00	8
5457	43	19	2026-06-30 08:00:00+00	8
5458	43	19	2026-06-30 10:00:00+00	8
5459	43	19	2026-06-30 13:00:00+00	8
5460	43	19	2026-07-01 08:00:00+00	8
5461	43	19	2026-07-01 10:00:00+00	8
5462	43	19	2026-07-01 13:00:00+00	8
5463	43	19	2026-07-02 08:00:00+00	8
5464	43	19	2026-07-02 10:00:00+00	8
5465	43	19	2026-07-02 13:00:00+00	8
5466	43	19	2026-07-03 08:00:00+00	8
5467	43	19	2026-07-03 10:00:00+00	8
5468	43	19	2026-07-03 13:00:00+00	8
5469	43	19	2026-07-06 08:00:00+00	8
5470	43	19	2026-07-06 10:00:00+00	8
5471	43	19	2026-07-06 13:00:00+00	8
5472	43	19	2026-07-07 08:00:00+00	8
5473	43	19	2026-07-07 10:00:00+00	8
5474	43	19	2026-07-07 13:00:00+00	8
5475	43	19	2026-07-08 08:00:00+00	8
5476	43	19	2026-07-08 10:00:00+00	8
5477	43	19	2026-07-08 13:00:00+00	8
5478	43	19	2026-07-09 08:00:00+00	8
5479	43	19	2026-07-09 10:00:00+00	8
5480	43	19	2026-07-09 13:00:00+00	8
5481	43	19	2026-07-10 08:00:00+00	8
5482	43	19	2026-07-10 10:00:00+00	8
5483	43	19	2026-07-10 13:00:00+00	8
5484	43	19	2026-07-13 08:00:00+00	8
5485	43	19	2026-07-13 10:00:00+00	8
5486	43	19	2026-07-13 13:00:00+00	8
5487	43	19	2026-07-14 08:00:00+00	8
5488	43	19	2026-07-14 10:00:00+00	8
5489	43	19	2026-07-14 13:00:00+00	8
5490	43	19	2026-07-15 08:00:00+00	8
5491	43	19	2026-07-15 10:00:00+00	8
5492	43	19	2026-07-15 13:00:00+00	8
5493	43	19	2026-07-16 08:00:00+00	8
5494	43	19	2026-07-16 10:00:00+00	8
5495	43	19	2026-07-16 13:00:00+00	8
5496	43	19	2026-07-17 08:00:00+00	8
5497	43	19	2026-07-17 10:00:00+00	8
5498	43	19	2026-07-17 13:00:00+00	8
5499	46	19	2026-06-29 08:00:00+00	8
5500	46	19	2026-06-29 10:00:00+00	8
5501	46	19	2026-06-29 13:00:00+00	8
5502	46	19	2026-06-30 08:00:00+00	8
5503	46	19	2026-06-30 10:00:00+00	8
5504	46	19	2026-06-30 13:00:00+00	8
5505	46	19	2026-07-01 08:00:00+00	8
5506	46	19	2026-07-01 10:00:00+00	8
5507	46	19	2026-07-01 13:00:00+00	8
5508	46	19	2026-07-02 08:00:00+00	8
5509	46	19	2026-07-02 10:00:00+00	8
5510	46	19	2026-07-02 13:00:00+00	8
5511	46	19	2026-07-03 08:00:00+00	8
5512	46	19	2026-07-03 10:00:00+00	8
5513	46	19	2026-07-03 13:00:00+00	8
5514	46	19	2026-07-06 08:00:00+00	8
5515	46	19	2026-07-06 10:00:00+00	8
5516	46	19	2026-07-06 13:00:00+00	8
5517	46	19	2026-07-07 08:00:00+00	8
5518	46	19	2026-07-07 10:00:00+00	8
5519	46	19	2026-07-07 13:00:00+00	8
5520	46	19	2026-07-08 08:00:00+00	8
5521	46	19	2026-07-08 10:00:00+00	8
5522	46	19	2026-07-08 13:00:00+00	8
5523	46	19	2026-07-09 08:00:00+00	8
5524	46	19	2026-07-09 10:00:00+00	8
5525	46	19	2026-07-09 13:00:00+00	8
5526	46	19	2026-07-10 08:00:00+00	8
5527	46	19	2026-07-10 10:00:00+00	8
5528	46	19	2026-07-10 13:00:00+00	8
5529	46	19	2026-07-13 08:00:00+00	8
5530	46	19	2026-07-13 10:00:00+00	8
5531	46	19	2026-07-13 13:00:00+00	8
5532	46	19	2026-07-14 08:00:00+00	8
5533	46	19	2026-07-14 10:00:00+00	8
5534	46	19	2026-07-14 13:00:00+00	8
5535	46	19	2026-07-15 08:00:00+00	8
5536	46	19	2026-07-15 10:00:00+00	8
5537	46	19	2026-07-15 13:00:00+00	8
5538	46	19	2026-07-16 08:00:00+00	8
5539	46	19	2026-07-16 10:00:00+00	8
5540	46	19	2026-07-16 13:00:00+00	8
5541	46	19	2026-07-17 08:00:00+00	8
5542	46	19	2026-07-17 10:00:00+00	8
5543	46	19	2026-07-17 13:00:00+00	8
5544	50	19	2026-06-29 08:00:00+00	8
5545	50	19	2026-06-29 10:00:00+00	8
5546	50	19	2026-06-29 13:00:00+00	8
5547	50	19	2026-06-30 08:00:00+00	8
5548	50	19	2026-06-30 10:00:00+00	8
5549	50	19	2026-06-30 13:00:00+00	8
5550	50	19	2026-07-01 08:00:00+00	8
5551	50	19	2026-07-01 10:00:00+00	8
5552	50	19	2026-07-01 13:00:00+00	8
5553	50	19	2026-07-02 08:00:00+00	8
5554	50	19	2026-07-02 10:00:00+00	8
5555	50	19	2026-07-02 13:00:00+00	8
5556	50	19	2026-07-03 08:00:00+00	8
5557	50	19	2026-07-03 10:00:00+00	8
5558	50	19	2026-07-03 13:00:00+00	8
5559	50	19	2026-07-06 08:00:00+00	8
5560	50	19	2026-07-06 10:00:00+00	8
5561	50	19	2026-07-06 13:00:00+00	8
5562	50	19	2026-07-07 08:00:00+00	8
5563	50	19	2026-07-07 10:00:00+00	8
5564	50	19	2026-07-07 13:00:00+00	8
5565	50	19	2026-07-08 08:00:00+00	8
5566	50	19	2026-07-08 10:00:00+00	8
5567	50	19	2026-07-08 13:00:00+00	8
5568	50	19	2026-07-09 08:00:00+00	8
5569	50	19	2026-07-09 10:00:00+00	8
5570	50	19	2026-07-09 13:00:00+00	8
5571	50	19	2026-07-10 08:00:00+00	8
5572	50	19	2026-07-10 10:00:00+00	8
5573	50	19	2026-07-10 13:00:00+00	8
5574	50	19	2026-07-13 08:00:00+00	8
5575	50	19	2026-07-13 10:00:00+00	8
5576	50	19	2026-07-13 13:00:00+00	8
5577	50	19	2026-07-14 08:00:00+00	8
5578	50	19	2026-07-14 10:00:00+00	8
5579	50	19	2026-07-14 13:00:00+00	8
5580	50	19	2026-07-15 08:00:00+00	8
5581	50	19	2026-07-15 10:00:00+00	8
5582	50	19	2026-07-15 13:00:00+00	8
5583	50	19	2026-07-16 08:00:00+00	8
5584	50	19	2026-07-16 10:00:00+00	8
5585	50	19	2026-07-16 13:00:00+00	8
5586	50	19	2026-07-17 08:00:00+00	8
5587	50	19	2026-07-17 10:00:00+00	8
5588	50	19	2026-07-17 13:00:00+00	8
5589	1	20	2026-06-29 08:00:00+00	8
5590	1	20	2026-06-29 10:00:00+00	8
5591	1	20	2026-06-29 13:00:00+00	8
5592	1	20	2026-06-30 08:00:00+00	8
5593	1	20	2026-06-30 10:00:00+00	8
5594	1	20	2026-06-30 13:00:00+00	8
5595	1	20	2026-07-01 08:00:00+00	8
5596	1	20	2026-07-01 10:00:00+00	8
5597	1	20	2026-07-01 13:00:00+00	8
5598	1	20	2026-07-02 08:00:00+00	8
5599	1	20	2026-07-02 10:00:00+00	8
5600	1	20	2026-07-02 13:00:00+00	8
5601	1	20	2026-07-03 08:00:00+00	8
5602	1	20	2026-07-03 10:00:00+00	8
5603	1	20	2026-07-03 13:00:00+00	8
5604	1	20	2026-07-06 08:00:00+00	8
5605	1	20	2026-07-06 10:00:00+00	8
5606	1	20	2026-07-06 13:00:00+00	8
5607	1	20	2026-07-07 08:00:00+00	8
5608	1	20	2026-07-07 10:00:00+00	8
5609	1	20	2026-07-07 13:00:00+00	8
5610	1	20	2026-07-08 08:00:00+00	8
5611	1	20	2026-07-08 10:00:00+00	8
5612	1	20	2026-07-08 13:00:00+00	8
5613	1	20	2026-07-09 08:00:00+00	8
5614	1	20	2026-07-09 10:00:00+00	8
5615	1	20	2026-07-09 13:00:00+00	8
5616	1	20	2026-07-10 08:00:00+00	8
5617	1	20	2026-07-10 10:00:00+00	8
5618	1	20	2026-07-10 13:00:00+00	8
5619	1	20	2026-07-13 08:00:00+00	8
5620	1	20	2026-07-13 10:00:00+00	8
5621	1	20	2026-07-13 13:00:00+00	8
5622	1	20	2026-07-14 08:00:00+00	8
5623	1	20	2026-07-14 10:00:00+00	8
5624	1	20	2026-07-14 13:00:00+00	8
5625	1	20	2026-07-15 08:00:00+00	8
5626	1	20	2026-07-15 10:00:00+00	8
5627	1	20	2026-07-15 13:00:00+00	8
5628	1	20	2026-07-16 08:00:00+00	8
5629	1	20	2026-07-16 10:00:00+00	8
5630	1	20	2026-07-16 13:00:00+00	8
5631	1	20	2026-07-17 08:00:00+00	8
5632	1	20	2026-07-17 10:00:00+00	8
5633	1	20	2026-07-17 13:00:00+00	8
5634	2	20	2026-06-29 08:00:00+00	8
5635	2	20	2026-06-29 10:00:00+00	8
5636	2	20	2026-06-29 13:00:00+00	8
5637	2	20	2026-06-30 08:00:00+00	8
5638	2	20	2026-06-30 10:00:00+00	8
5639	2	20	2026-06-30 13:00:00+00	8
5640	2	20	2026-07-01 08:00:00+00	8
5641	2	20	2026-07-01 10:00:00+00	8
5642	2	20	2026-07-01 13:00:00+00	8
5643	2	20	2026-07-02 08:00:00+00	8
5644	2	20	2026-07-02 10:00:00+00	8
5645	2	20	2026-07-02 13:00:00+00	8
5646	2	20	2026-07-03 08:00:00+00	8
5647	2	20	2026-07-03 10:00:00+00	8
5648	2	20	2026-07-03 13:00:00+00	8
5649	2	20	2026-07-06 08:00:00+00	8
5650	2	20	2026-07-06 10:00:00+00	8
5651	2	20	2026-07-06 13:00:00+00	8
5652	2	20	2026-07-07 08:00:00+00	8
5653	2	20	2026-07-07 10:00:00+00	8
5654	2	20	2026-07-07 13:00:00+00	8
5655	2	20	2026-07-08 08:00:00+00	8
5656	2	20	2026-07-08 10:00:00+00	8
5657	2	20	2026-07-08 13:00:00+00	8
5658	2	20	2026-07-09 08:00:00+00	8
5659	2	20	2026-07-09 10:00:00+00	8
5660	2	20	2026-07-09 13:00:00+00	8
5661	2	20	2026-07-10 08:00:00+00	8
5662	2	20	2026-07-10 10:00:00+00	8
5663	2	20	2026-07-10 13:00:00+00	8
5664	2	20	2026-07-13 08:00:00+00	8
5665	2	20	2026-07-13 10:00:00+00	8
5666	2	20	2026-07-13 13:00:00+00	8
5667	2	20	2026-07-14 08:00:00+00	8
5668	2	20	2026-07-14 10:00:00+00	8
5669	2	20	2026-07-14 13:00:00+00	8
5670	2	20	2026-07-15 08:00:00+00	8
5671	2	20	2026-07-15 10:00:00+00	8
5672	2	20	2026-07-15 13:00:00+00	8
5673	2	20	2026-07-16 08:00:00+00	8
5674	2	20	2026-07-16 10:00:00+00	8
5675	2	20	2026-07-16 13:00:00+00	8
5676	2	20	2026-07-17 08:00:00+00	8
5677	2	20	2026-07-17 10:00:00+00	8
5678	2	20	2026-07-17 13:00:00+00	8
5679	5	20	2026-06-29 08:00:00+00	8
5680	5	20	2026-06-29 10:00:00+00	8
5681	5	20	2026-06-29 13:00:00+00	8
5682	5	20	2026-06-30 08:00:00+00	8
5683	5	20	2026-06-30 10:00:00+00	8
5684	5	20	2026-06-30 13:00:00+00	8
5685	5	20	2026-07-01 08:00:00+00	8
5686	5	20	2026-07-01 10:00:00+00	8
5687	5	20	2026-07-01 13:00:00+00	8
5688	5	20	2026-07-02 08:00:00+00	8
5689	5	20	2026-07-02 10:00:00+00	8
5690	5	20	2026-07-02 13:00:00+00	8
5691	5	20	2026-07-03 08:00:00+00	8
5692	5	20	2026-07-03 10:00:00+00	8
5693	5	20	2026-07-03 13:00:00+00	8
5694	5	20	2026-07-06 08:00:00+00	8
5695	5	20	2026-07-06 10:00:00+00	8
5696	5	20	2026-07-06 13:00:00+00	8
5697	5	20	2026-07-07 08:00:00+00	8
5698	5	20	2026-07-07 10:00:00+00	8
5699	5	20	2026-07-07 13:00:00+00	8
5700	5	20	2026-07-08 08:00:00+00	8
5701	5	20	2026-07-08 10:00:00+00	8
5702	5	20	2026-07-08 13:00:00+00	8
5703	5	20	2026-07-09 08:00:00+00	8
5704	5	20	2026-07-09 10:00:00+00	8
5705	5	20	2026-07-09 13:00:00+00	8
5706	5	20	2026-07-10 08:00:00+00	8
5707	5	20	2026-07-10 10:00:00+00	8
5708	5	20	2026-07-10 13:00:00+00	8
5709	5	20	2026-07-13 08:00:00+00	8
5710	5	20	2026-07-13 10:00:00+00	8
5711	5	20	2026-07-13 13:00:00+00	8
5712	5	20	2026-07-14 08:00:00+00	8
5713	5	20	2026-07-14 10:00:00+00	8
5714	5	20	2026-07-14 13:00:00+00	8
5715	5	20	2026-07-15 08:00:00+00	8
5716	5	20	2026-07-15 10:00:00+00	8
5717	5	20	2026-07-15 13:00:00+00	8
5718	5	20	2026-07-16 08:00:00+00	8
5719	5	20	2026-07-16 10:00:00+00	8
5720	5	20	2026-07-16 13:00:00+00	8
5721	5	20	2026-07-17 08:00:00+00	8
5722	5	20	2026-07-17 10:00:00+00	8
5723	5	20	2026-07-17 13:00:00+00	8
5724	7	20	2026-06-29 08:00:00+00	8
5725	7	20	2026-06-29 10:00:00+00	8
5726	7	20	2026-06-29 13:00:00+00	8
5727	7	20	2026-06-30 08:00:00+00	8
5728	7	20	2026-06-30 10:00:00+00	8
5729	7	20	2026-06-30 13:00:00+00	8
5730	7	20	2026-07-01 08:00:00+00	8
5731	7	20	2026-07-01 10:00:00+00	8
5732	7	20	2026-07-01 13:00:00+00	8
5733	7	20	2026-07-02 08:00:00+00	8
5734	7	20	2026-07-02 10:00:00+00	8
5735	7	20	2026-07-02 13:00:00+00	8
5736	7	20	2026-07-03 08:00:00+00	8
5737	7	20	2026-07-03 10:00:00+00	8
5738	7	20	2026-07-03 13:00:00+00	8
5739	7	20	2026-07-06 08:00:00+00	8
5740	7	20	2026-07-06 10:00:00+00	8
5741	7	20	2026-07-06 13:00:00+00	8
5742	7	20	2026-07-07 08:00:00+00	8
5743	7	20	2026-07-07 10:00:00+00	8
5744	7	20	2026-07-07 13:00:00+00	8
5745	7	20	2026-07-08 08:00:00+00	8
5746	7	20	2026-07-08 10:00:00+00	8
5747	7	20	2026-07-08 13:00:00+00	8
5748	7	20	2026-07-09 08:00:00+00	8
5749	7	20	2026-07-09 10:00:00+00	8
5750	7	20	2026-07-09 13:00:00+00	8
5751	7	20	2026-07-10 08:00:00+00	8
5752	7	20	2026-07-10 10:00:00+00	8
5753	7	20	2026-07-10 13:00:00+00	8
5754	7	20	2026-07-13 08:00:00+00	8
5755	7	20	2026-07-13 10:00:00+00	8
5756	7	20	2026-07-13 13:00:00+00	8
5757	7	20	2026-07-14 08:00:00+00	8
5758	7	20	2026-07-14 10:00:00+00	8
5759	7	20	2026-07-14 13:00:00+00	8
5760	7	20	2026-07-15 08:00:00+00	8
5761	7	20	2026-07-15 10:00:00+00	8
5762	7	20	2026-07-15 13:00:00+00	8
5763	7	20	2026-07-16 08:00:00+00	8
5764	7	20	2026-07-16 10:00:00+00	8
5765	7	20	2026-07-16 13:00:00+00	8
5766	7	20	2026-07-17 08:00:00+00	8
5767	7	20	2026-07-17 10:00:00+00	8
5768	7	20	2026-07-17 13:00:00+00	8
5769	9	20	2026-06-29 08:00:00+00	8
5770	9	20	2026-06-29 10:00:00+00	8
5771	9	20	2026-06-29 13:00:00+00	8
5772	9	20	2026-06-30 08:00:00+00	8
5773	9	20	2026-06-30 10:00:00+00	8
5774	9	20	2026-06-30 13:00:00+00	8
5775	9	20	2026-07-01 08:00:00+00	8
5776	9	20	2026-07-01 10:00:00+00	8
5777	9	20	2026-07-01 13:00:00+00	8
5778	9	20	2026-07-02 08:00:00+00	8
5779	9	20	2026-07-02 10:00:00+00	8
5780	9	20	2026-07-02 13:00:00+00	8
5781	9	20	2026-07-03 08:00:00+00	8
5782	9	20	2026-07-03 10:00:00+00	8
5783	9	20	2026-07-03 13:00:00+00	8
5784	9	20	2026-07-06 08:00:00+00	8
5785	9	20	2026-07-06 10:00:00+00	8
5786	9	20	2026-07-06 13:00:00+00	8
5787	9	20	2026-07-07 08:00:00+00	8
5788	9	20	2026-07-07 10:00:00+00	8
5789	9	20	2026-07-07 13:00:00+00	8
5790	9	20	2026-07-08 08:00:00+00	8
5791	9	20	2026-07-08 10:00:00+00	8
5792	9	20	2026-07-08 13:00:00+00	8
5793	9	20	2026-07-09 08:00:00+00	8
5794	9	20	2026-07-09 10:00:00+00	8
5795	9	20	2026-07-09 13:00:00+00	8
5796	9	20	2026-07-10 08:00:00+00	8
5797	9	20	2026-07-10 10:00:00+00	8
5798	9	20	2026-07-10 13:00:00+00	8
5799	9	20	2026-07-13 08:00:00+00	8
5800	9	20	2026-07-13 10:00:00+00	8
5801	9	20	2026-07-13 13:00:00+00	8
5802	9	20	2026-07-14 08:00:00+00	8
5803	9	20	2026-07-14 10:00:00+00	8
5804	9	20	2026-07-14 13:00:00+00	8
5805	9	20	2026-07-15 08:00:00+00	8
5806	9	20	2026-07-15 10:00:00+00	8
5807	9	20	2026-07-15 13:00:00+00	8
5808	9	20	2026-07-16 08:00:00+00	8
5809	9	20	2026-07-16 10:00:00+00	8
5810	9	20	2026-07-16 13:00:00+00	8
5811	9	20	2026-07-17 08:00:00+00	8
5812	9	20	2026-07-17 10:00:00+00	8
5813	9	20	2026-07-17 13:00:00+00	8
5814	14	20	2026-06-29 08:00:00+00	8
5815	14	20	2026-06-29 10:00:00+00	8
5816	14	20	2026-06-29 13:00:00+00	8
5817	14	20	2026-06-30 08:00:00+00	8
5818	14	20	2026-06-30 10:00:00+00	8
5819	14	20	2026-06-30 13:00:00+00	8
5820	14	20	2026-07-01 08:00:00+00	8
5821	14	20	2026-07-01 10:00:00+00	8
5822	14	20	2026-07-01 13:00:00+00	8
5823	14	20	2026-07-02 08:00:00+00	8
5824	14	20	2026-07-02 10:00:00+00	8
5825	14	20	2026-07-02 13:00:00+00	8
5826	14	20	2026-07-03 08:00:00+00	8
5827	14	20	2026-07-03 10:00:00+00	8
5828	14	20	2026-07-03 13:00:00+00	8
5829	14	20	2026-07-06 08:00:00+00	8
5830	14	20	2026-07-06 10:00:00+00	8
5831	14	20	2026-07-06 13:00:00+00	8
5832	14	20	2026-07-07 08:00:00+00	8
5833	14	20	2026-07-07 10:00:00+00	8
5834	14	20	2026-07-07 13:00:00+00	8
5835	14	20	2026-07-08 08:00:00+00	8
5836	14	20	2026-07-08 10:00:00+00	8
5837	14	20	2026-07-08 13:00:00+00	8
5838	14	20	2026-07-09 08:00:00+00	8
5839	14	20	2026-07-09 10:00:00+00	8
5840	14	20	2026-07-09 13:00:00+00	8
5841	14	20	2026-07-10 08:00:00+00	8
5842	14	20	2026-07-10 10:00:00+00	8
5843	14	20	2026-07-10 13:00:00+00	8
5844	14	20	2026-07-13 08:00:00+00	8
5845	14	20	2026-07-13 10:00:00+00	8
5846	14	20	2026-07-13 13:00:00+00	8
5847	14	20	2026-07-14 08:00:00+00	8
5848	14	20	2026-07-14 10:00:00+00	8
5849	14	20	2026-07-14 13:00:00+00	8
5850	14	20	2026-07-15 08:00:00+00	8
5851	14	20	2026-07-15 10:00:00+00	8
5852	14	20	2026-07-15 13:00:00+00	8
5853	14	20	2026-07-16 08:00:00+00	8
5854	14	20	2026-07-16 10:00:00+00	8
5855	14	20	2026-07-16 13:00:00+00	8
5856	14	20	2026-07-17 08:00:00+00	8
5857	14	20	2026-07-17 10:00:00+00	8
5858	14	20	2026-07-17 13:00:00+00	8
5859	21	20	2026-06-29 08:00:00+00	8
5860	21	20	2026-06-29 10:00:00+00	8
5861	21	20	2026-06-29 13:00:00+00	8
5862	21	20	2026-06-30 08:00:00+00	8
5863	21	20	2026-06-30 10:00:00+00	8
5864	21	20	2026-06-30 13:00:00+00	8
5865	21	20	2026-07-01 08:00:00+00	8
5866	21	20	2026-07-01 10:00:00+00	8
5867	21	20	2026-07-01 13:00:00+00	8
5868	21	20	2026-07-02 08:00:00+00	8
5869	21	20	2026-07-02 10:00:00+00	8
5870	21	20	2026-07-02 13:00:00+00	8
5871	21	20	2026-07-03 08:00:00+00	8
5872	21	20	2026-07-03 10:00:00+00	8
5873	21	20	2026-07-03 13:00:00+00	8
5874	21	20	2026-07-06 08:00:00+00	8
5875	21	20	2026-07-06 10:00:00+00	8
5876	21	20	2026-07-06 13:00:00+00	8
5877	21	20	2026-07-07 08:00:00+00	8
5878	21	20	2026-07-07 10:00:00+00	8
5879	21	20	2026-07-07 13:00:00+00	8
5880	21	20	2026-07-08 08:00:00+00	8
5881	21	20	2026-07-08 10:00:00+00	8
5882	21	20	2026-07-08 13:00:00+00	8
5883	21	20	2026-07-09 08:00:00+00	8
5884	21	20	2026-07-09 10:00:00+00	8
5885	21	20	2026-07-09 13:00:00+00	8
5886	21	20	2026-07-10 08:00:00+00	8
5887	21	20	2026-07-10 10:00:00+00	8
5888	21	20	2026-07-10 13:00:00+00	8
5889	21	20	2026-07-13 08:00:00+00	8
5890	21	20	2026-07-13 10:00:00+00	8
5891	21	20	2026-07-13 13:00:00+00	8
5892	21	20	2026-07-14 08:00:00+00	8
5893	21	20	2026-07-14 10:00:00+00	8
5894	21	20	2026-07-14 13:00:00+00	8
5895	21	20	2026-07-15 08:00:00+00	8
5896	21	20	2026-07-15 10:00:00+00	8
5897	21	20	2026-07-15 13:00:00+00	8
5898	21	20	2026-07-16 08:00:00+00	8
5899	21	20	2026-07-16 10:00:00+00	8
5900	21	20	2026-07-16 13:00:00+00	8
5901	21	20	2026-07-17 08:00:00+00	8
5902	21	20	2026-07-17 10:00:00+00	8
5903	21	20	2026-07-17 13:00:00+00	8
5904	24	20	2026-06-29 08:00:00+00	8
5905	24	20	2026-06-29 10:00:00+00	8
5906	24	20	2026-06-29 13:00:00+00	8
5907	24	20	2026-06-30 08:00:00+00	8
5908	24	20	2026-06-30 10:00:00+00	8
5909	24	20	2026-06-30 13:00:00+00	8
5910	24	20	2026-07-01 08:00:00+00	8
5911	24	20	2026-07-01 10:00:00+00	8
5912	24	20	2026-07-01 13:00:00+00	8
5913	24	20	2026-07-02 08:00:00+00	8
5914	24	20	2026-07-02 10:00:00+00	8
5915	24	20	2026-07-02 13:00:00+00	8
5916	24	20	2026-07-03 08:00:00+00	8
5917	24	20	2026-07-03 10:00:00+00	8
5918	24	20	2026-07-03 13:00:00+00	8
5919	24	20	2026-07-06 08:00:00+00	8
5920	24	20	2026-07-06 10:00:00+00	8
5921	24	20	2026-07-06 13:00:00+00	8
5922	24	20	2026-07-07 08:00:00+00	8
5923	24	20	2026-07-07 10:00:00+00	8
5924	24	20	2026-07-07 13:00:00+00	8
5925	24	20	2026-07-08 08:00:00+00	8
5926	24	20	2026-07-08 10:00:00+00	8
5927	24	20	2026-07-08 13:00:00+00	8
5928	24	20	2026-07-09 08:00:00+00	8
5929	24	20	2026-07-09 10:00:00+00	8
5930	24	20	2026-07-09 13:00:00+00	8
5931	24	20	2026-07-10 08:00:00+00	8
5932	24	20	2026-07-10 10:00:00+00	8
5933	24	20	2026-07-10 13:00:00+00	8
5934	24	20	2026-07-13 08:00:00+00	8
5935	24	20	2026-07-13 10:00:00+00	8
5936	24	20	2026-07-13 13:00:00+00	8
5937	24	20	2026-07-14 08:00:00+00	8
5938	24	20	2026-07-14 10:00:00+00	8
5939	24	20	2026-07-14 13:00:00+00	8
5940	24	20	2026-07-15 08:00:00+00	8
5941	24	20	2026-07-15 10:00:00+00	8
5942	24	20	2026-07-15 13:00:00+00	8
5943	24	20	2026-07-16 08:00:00+00	8
5944	24	20	2026-07-16 10:00:00+00	8
5945	24	20	2026-07-16 13:00:00+00	8
5946	24	20	2026-07-17 08:00:00+00	8
5947	24	20	2026-07-17 10:00:00+00	8
5948	24	20	2026-07-17 13:00:00+00	8
5949	35	20	2026-06-29 08:00:00+00	8
5950	35	20	2026-06-29 10:00:00+00	8
5951	35	20	2026-06-29 13:00:00+00	8
5952	35	20	2026-06-30 08:00:00+00	8
5953	35	20	2026-06-30 10:00:00+00	8
5954	35	20	2026-06-30 13:00:00+00	8
5955	35	20	2026-07-01 08:00:00+00	8
5956	35	20	2026-07-01 10:00:00+00	8
5957	35	20	2026-07-01 13:00:00+00	8
5958	35	20	2026-07-02 08:00:00+00	8
5959	35	20	2026-07-02 10:00:00+00	8
5960	35	20	2026-07-02 13:00:00+00	8
5961	35	20	2026-07-03 08:00:00+00	8
5962	35	20	2026-07-03 10:00:00+00	8
5963	35	20	2026-07-03 13:00:00+00	8
5964	35	20	2026-07-06 08:00:00+00	8
5965	35	20	2026-07-06 10:00:00+00	8
5966	35	20	2026-07-06 13:00:00+00	8
5967	35	20	2026-07-07 08:00:00+00	8
5968	35	20	2026-07-07 10:00:00+00	8
5969	35	20	2026-07-07 13:00:00+00	8
5970	35	20	2026-07-08 08:00:00+00	8
5971	35	20	2026-07-08 10:00:00+00	8
5972	35	20	2026-07-08 13:00:00+00	8
5973	35	20	2026-07-09 08:00:00+00	8
5974	35	20	2026-07-09 10:00:00+00	8
5975	35	20	2026-07-09 13:00:00+00	8
5976	35	20	2026-07-10 08:00:00+00	8
5977	35	20	2026-07-10 10:00:00+00	8
5978	35	20	2026-07-10 13:00:00+00	8
5979	35	20	2026-07-13 08:00:00+00	8
5980	35	20	2026-07-13 10:00:00+00	8
5981	35	20	2026-07-13 13:00:00+00	8
5982	35	20	2026-07-14 08:00:00+00	8
5983	35	20	2026-07-14 10:00:00+00	8
5984	35	20	2026-07-14 13:00:00+00	8
5985	35	20	2026-07-15 08:00:00+00	8
5986	35	20	2026-07-15 10:00:00+00	8
5987	35	20	2026-07-15 13:00:00+00	8
5988	35	20	2026-07-16 08:00:00+00	8
5989	35	20	2026-07-16 10:00:00+00	8
5990	35	20	2026-07-16 13:00:00+00	8
5991	35	20	2026-07-17 08:00:00+00	8
5992	35	20	2026-07-17 10:00:00+00	8
5993	35	20	2026-07-17 13:00:00+00	8
5994	36	20	2026-06-29 08:00:00+00	8
5995	36	20	2026-06-29 10:00:00+00	8
5996	36	20	2026-06-29 13:00:00+00	8
5997	36	20	2026-06-30 08:00:00+00	8
5998	36	20	2026-06-30 10:00:00+00	8
5999	36	20	2026-06-30 13:00:00+00	8
6000	36	20	2026-07-01 08:00:00+00	8
6001	36	20	2026-07-01 10:00:00+00	8
6002	36	20	2026-07-01 13:00:00+00	8
6003	36	20	2026-07-02 08:00:00+00	8
6004	36	20	2026-07-02 10:00:00+00	8
6005	36	20	2026-07-02 13:00:00+00	8
6006	36	20	2026-07-03 08:00:00+00	8
6007	36	20	2026-07-03 10:00:00+00	8
6008	36	20	2026-07-03 13:00:00+00	8
6009	36	20	2026-07-06 08:00:00+00	8
6010	36	20	2026-07-06 10:00:00+00	8
6011	36	20	2026-07-06 13:00:00+00	8
6012	36	20	2026-07-07 08:00:00+00	8
6013	36	20	2026-07-07 10:00:00+00	8
6014	36	20	2026-07-07 13:00:00+00	8
6015	36	20	2026-07-08 08:00:00+00	8
6016	36	20	2026-07-08 10:00:00+00	8
6017	36	20	2026-07-08 13:00:00+00	8
6018	36	20	2026-07-09 08:00:00+00	8
6019	36	20	2026-07-09 10:00:00+00	8
6020	36	20	2026-07-09 13:00:00+00	8
6021	36	20	2026-07-10 08:00:00+00	8
6022	36	20	2026-07-10 10:00:00+00	8
6023	36	20	2026-07-10 13:00:00+00	8
6024	36	20	2026-07-13 08:00:00+00	8
6025	36	20	2026-07-13 10:00:00+00	8
6026	36	20	2026-07-13 13:00:00+00	8
6027	36	20	2026-07-14 08:00:00+00	8
6028	36	20	2026-07-14 10:00:00+00	8
6029	36	20	2026-07-14 13:00:00+00	8
6030	36	20	2026-07-15 08:00:00+00	8
6031	36	20	2026-07-15 10:00:00+00	8
6032	36	20	2026-07-15 13:00:00+00	8
6033	36	20	2026-07-16 08:00:00+00	8
6034	36	20	2026-07-16 10:00:00+00	8
6035	36	20	2026-07-16 13:00:00+00	8
6036	36	20	2026-07-17 08:00:00+00	8
6037	36	20	2026-07-17 10:00:00+00	8
6038	36	20	2026-07-17 13:00:00+00	8
6039	43	20	2026-06-29 08:00:00+00	8
6040	43	20	2026-06-29 10:00:00+00	8
6041	43	20	2026-06-29 13:00:00+00	8
6042	43	20	2026-06-30 08:00:00+00	8
6043	43	20	2026-06-30 10:00:00+00	8
6044	43	20	2026-06-30 13:00:00+00	8
6045	43	20	2026-07-01 08:00:00+00	8
6046	43	20	2026-07-01 10:00:00+00	8
6047	43	20	2026-07-01 13:00:00+00	8
6048	43	20	2026-07-02 08:00:00+00	8
6049	43	20	2026-07-02 10:00:00+00	8
6050	43	20	2026-07-02 13:00:00+00	8
6051	43	20	2026-07-03 08:00:00+00	8
6052	43	20	2026-07-03 10:00:00+00	8
6053	43	20	2026-07-03 13:00:00+00	8
6054	43	20	2026-07-06 08:00:00+00	8
6055	43	20	2026-07-06 10:00:00+00	8
6056	43	20	2026-07-06 13:00:00+00	8
6057	43	20	2026-07-07 08:00:00+00	8
6058	43	20	2026-07-07 10:00:00+00	8
6059	43	20	2026-07-07 13:00:00+00	8
6060	43	20	2026-07-08 08:00:00+00	8
6061	43	20	2026-07-08 10:00:00+00	8
6062	43	20	2026-07-08 13:00:00+00	8
6063	43	20	2026-07-09 08:00:00+00	8
6064	43	20	2026-07-09 10:00:00+00	8
6065	43	20	2026-07-09 13:00:00+00	8
6066	43	20	2026-07-10 08:00:00+00	8
6067	43	20	2026-07-10 10:00:00+00	8
6068	43	20	2026-07-10 13:00:00+00	8
6069	43	20	2026-07-13 08:00:00+00	8
6070	43	20	2026-07-13 10:00:00+00	8
6071	43	20	2026-07-13 13:00:00+00	8
6072	43	20	2026-07-14 08:00:00+00	8
6073	43	20	2026-07-14 10:00:00+00	8
6074	43	20	2026-07-14 13:00:00+00	8
6075	43	20	2026-07-15 08:00:00+00	8
6076	43	20	2026-07-15 10:00:00+00	8
6077	43	20	2026-07-15 13:00:00+00	8
6078	43	20	2026-07-16 08:00:00+00	8
6079	43	20	2026-07-16 10:00:00+00	8
6080	43	20	2026-07-16 13:00:00+00	8
6081	43	20	2026-07-17 08:00:00+00	8
6082	43	20	2026-07-17 10:00:00+00	8
6083	43	20	2026-07-17 13:00:00+00	8
6084	46	20	2026-06-29 08:00:00+00	8
6085	46	20	2026-06-29 10:00:00+00	8
6086	46	20	2026-06-29 13:00:00+00	8
6087	46	20	2026-06-30 08:00:00+00	8
6088	46	20	2026-06-30 10:00:00+00	8
6089	46	20	2026-06-30 13:00:00+00	8
6090	46	20	2026-07-01 08:00:00+00	8
6091	46	20	2026-07-01 10:00:00+00	8
6092	46	20	2026-07-01 13:00:00+00	8
6093	46	20	2026-07-02 08:00:00+00	8
6094	46	20	2026-07-02 10:00:00+00	8
6095	46	20	2026-07-02 13:00:00+00	8
6096	46	20	2026-07-03 08:00:00+00	8
6097	46	20	2026-07-03 10:00:00+00	8
6098	46	20	2026-07-03 13:00:00+00	8
6099	46	20	2026-07-06 08:00:00+00	8
6100	46	20	2026-07-06 10:00:00+00	8
6101	46	20	2026-07-06 13:00:00+00	8
6102	46	20	2026-07-07 08:00:00+00	8
6103	46	20	2026-07-07 10:00:00+00	8
6104	46	20	2026-07-07 13:00:00+00	8
6105	46	20	2026-07-08 08:00:00+00	8
6106	46	20	2026-07-08 10:00:00+00	8
6107	46	20	2026-07-08 13:00:00+00	8
6108	46	20	2026-07-09 08:00:00+00	8
6109	46	20	2026-07-09 10:00:00+00	8
6110	46	20	2026-07-09 13:00:00+00	8
6111	46	20	2026-07-10 08:00:00+00	8
6112	46	20	2026-07-10 10:00:00+00	8
6113	46	20	2026-07-10 13:00:00+00	8
6114	46	20	2026-07-13 08:00:00+00	8
6115	46	20	2026-07-13 10:00:00+00	8
6116	46	20	2026-07-13 13:00:00+00	8
6117	46	20	2026-07-14 08:00:00+00	8
6118	46	20	2026-07-14 10:00:00+00	8
6119	46	20	2026-07-14 13:00:00+00	8
6120	46	20	2026-07-15 08:00:00+00	8
6121	46	20	2026-07-15 10:00:00+00	8
6122	46	20	2026-07-15 13:00:00+00	8
6123	46	20	2026-07-16 08:00:00+00	8
6124	46	20	2026-07-16 10:00:00+00	8
6125	46	20	2026-07-16 13:00:00+00	8
6126	46	20	2026-07-17 08:00:00+00	8
6127	46	20	2026-07-17 10:00:00+00	8
6128	46	20	2026-07-17 13:00:00+00	8
6129	50	20	2026-06-29 08:00:00+00	8
6130	50	20	2026-06-29 10:00:00+00	8
6131	50	20	2026-06-29 13:00:00+00	8
6132	50	20	2026-06-30 08:00:00+00	8
6133	50	20	2026-06-30 10:00:00+00	8
6134	50	20	2026-06-30 13:00:00+00	8
6135	50	20	2026-07-01 08:00:00+00	8
6136	50	20	2026-07-01 10:00:00+00	8
6137	50	20	2026-07-01 13:00:00+00	8
6138	50	20	2026-07-02 08:00:00+00	8
6139	50	20	2026-07-02 10:00:00+00	8
6140	50	20	2026-07-02 13:00:00+00	8
6141	50	20	2026-07-03 08:00:00+00	8
6142	50	20	2026-07-03 10:00:00+00	8
6143	50	20	2026-07-03 13:00:00+00	8
6144	50	20	2026-07-06 08:00:00+00	8
6145	50	20	2026-07-06 10:00:00+00	8
6146	50	20	2026-07-06 13:00:00+00	8
6147	50	20	2026-07-07 08:00:00+00	8
6148	50	20	2026-07-07 10:00:00+00	8
6149	50	20	2026-07-07 13:00:00+00	8
6150	50	20	2026-07-08 08:00:00+00	8
6151	50	20	2026-07-08 10:00:00+00	8
6152	50	20	2026-07-08 13:00:00+00	8
6153	50	20	2026-07-09 08:00:00+00	8
6154	50	20	2026-07-09 10:00:00+00	8
6155	50	20	2026-07-09 13:00:00+00	8
6156	50	20	2026-07-10 08:00:00+00	8
6157	50	20	2026-07-10 10:00:00+00	8
6158	50	20	2026-07-10 13:00:00+00	8
6159	50	20	2026-07-13 08:00:00+00	8
6160	50	20	2026-07-13 10:00:00+00	8
6161	50	20	2026-07-13 13:00:00+00	8
6162	50	20	2026-07-14 08:00:00+00	8
6163	50	20	2026-07-14 10:00:00+00	8
6164	50	20	2026-07-14 13:00:00+00	8
6165	50	20	2026-07-15 08:00:00+00	8
6166	50	20	2026-07-15 10:00:00+00	8
6167	50	20	2026-07-15 13:00:00+00	8
6168	50	20	2026-07-16 08:00:00+00	8
6169	50	20	2026-07-16 10:00:00+00	8
6170	50	20	2026-07-16 13:00:00+00	8
6171	50	20	2026-07-17 08:00:00+00	8
6172	50	20	2026-07-17 10:00:00+00	8
6173	50	20	2026-07-17 13:00:00+00	8
6174	1	21	2026-06-29 08:00:00+00	8
6175	1	21	2026-06-29 10:00:00+00	8
6176	1	21	2026-06-29 13:00:00+00	8
6177	1	21	2026-06-30 08:00:00+00	8
6178	1	21	2026-06-30 10:00:00+00	8
6179	1	21	2026-06-30 13:00:00+00	8
6180	1	21	2026-07-01 08:00:00+00	8
6181	1	21	2026-07-01 10:00:00+00	8
6182	1	21	2026-07-01 13:00:00+00	8
6183	1	21	2026-07-02 08:00:00+00	8
6184	1	21	2026-07-02 10:00:00+00	8
6185	1	21	2026-07-02 13:00:00+00	8
6186	1	21	2026-07-03 08:00:00+00	8
6187	1	21	2026-07-03 10:00:00+00	8
6188	1	21	2026-07-03 13:00:00+00	8
6189	1	21	2026-07-06 08:00:00+00	8
6190	1	21	2026-07-06 10:00:00+00	8
6191	1	21	2026-07-06 13:00:00+00	8
6192	1	21	2026-07-07 08:00:00+00	8
6193	1	21	2026-07-07 10:00:00+00	8
6194	1	21	2026-07-07 13:00:00+00	8
6195	1	21	2026-07-08 08:00:00+00	8
6196	1	21	2026-07-08 10:00:00+00	8
6197	1	21	2026-07-08 13:00:00+00	8
6198	1	21	2026-07-09 08:00:00+00	8
6199	1	21	2026-07-09 10:00:00+00	8
6200	1	21	2026-07-09 13:00:00+00	8
6201	1	21	2026-07-10 08:00:00+00	8
6202	1	21	2026-07-10 10:00:00+00	8
6203	1	21	2026-07-10 13:00:00+00	8
6204	1	21	2026-07-13 08:00:00+00	8
6205	1	21	2026-07-13 10:00:00+00	8
6206	1	21	2026-07-13 13:00:00+00	8
6207	1	21	2026-07-14 08:00:00+00	8
6208	1	21	2026-07-14 10:00:00+00	8
6209	1	21	2026-07-14 13:00:00+00	8
6210	1	21	2026-07-15 08:00:00+00	8
6211	1	21	2026-07-15 10:00:00+00	8
6212	1	21	2026-07-15 13:00:00+00	8
6213	1	21	2026-07-16 08:00:00+00	8
6214	1	21	2026-07-16 10:00:00+00	8
6215	1	21	2026-07-16 13:00:00+00	8
6216	1	21	2026-07-17 08:00:00+00	8
6217	1	21	2026-07-17 10:00:00+00	8
6218	1	21	2026-07-17 13:00:00+00	8
6219	2	21	2026-06-29 08:00:00+00	8
6220	2	21	2026-06-29 10:00:00+00	8
6221	2	21	2026-06-29 13:00:00+00	8
6222	2	21	2026-06-30 08:00:00+00	8
6223	2	21	2026-06-30 10:00:00+00	8
6224	2	21	2026-06-30 13:00:00+00	8
6225	2	21	2026-07-01 08:00:00+00	8
6226	2	21	2026-07-01 10:00:00+00	8
6227	2	21	2026-07-01 13:00:00+00	8
6228	2	21	2026-07-02 08:00:00+00	8
6229	2	21	2026-07-02 10:00:00+00	8
6230	2	21	2026-07-02 13:00:00+00	8
6231	2	21	2026-07-03 08:00:00+00	8
6232	2	21	2026-07-03 10:00:00+00	8
6233	2	21	2026-07-03 13:00:00+00	8
6234	2	21	2026-07-06 08:00:00+00	8
6235	2	21	2026-07-06 10:00:00+00	8
6236	2	21	2026-07-06 13:00:00+00	8
6237	2	21	2026-07-07 08:00:00+00	8
6238	2	21	2026-07-07 10:00:00+00	8
6239	2	21	2026-07-07 13:00:00+00	8
6240	2	21	2026-07-08 08:00:00+00	8
6241	2	21	2026-07-08 10:00:00+00	8
6242	2	21	2026-07-08 13:00:00+00	8
6243	2	21	2026-07-09 08:00:00+00	8
6244	2	21	2026-07-09 10:00:00+00	8
6245	2	21	2026-07-09 13:00:00+00	8
6246	2	21	2026-07-10 08:00:00+00	8
6247	2	21	2026-07-10 10:00:00+00	8
6248	2	21	2026-07-10 13:00:00+00	8
6249	2	21	2026-07-13 08:00:00+00	8
6250	2	21	2026-07-13 10:00:00+00	8
6251	2	21	2026-07-13 13:00:00+00	8
6252	2	21	2026-07-14 08:00:00+00	8
6253	2	21	2026-07-14 10:00:00+00	8
6254	2	21	2026-07-14 13:00:00+00	8
6255	2	21	2026-07-15 08:00:00+00	8
6256	2	21	2026-07-15 10:00:00+00	8
6257	2	21	2026-07-15 13:00:00+00	8
6258	2	21	2026-07-16 08:00:00+00	8
6259	2	21	2026-07-16 10:00:00+00	8
6260	2	21	2026-07-16 13:00:00+00	8
6261	2	21	2026-07-17 08:00:00+00	8
6262	2	21	2026-07-17 10:00:00+00	8
6263	2	21	2026-07-17 13:00:00+00	8
6264	5	21	2026-06-29 08:00:00+00	8
6265	5	21	2026-06-29 10:00:00+00	8
6266	5	21	2026-06-29 13:00:00+00	8
6267	5	21	2026-06-30 08:00:00+00	8
6268	5	21	2026-06-30 10:00:00+00	8
6269	5	21	2026-06-30 13:00:00+00	8
6270	5	21	2026-07-01 08:00:00+00	8
6271	5	21	2026-07-01 10:00:00+00	8
6272	5	21	2026-07-01 13:00:00+00	8
6273	5	21	2026-07-02 08:00:00+00	8
6274	5	21	2026-07-02 10:00:00+00	8
6275	5	21	2026-07-02 13:00:00+00	8
6276	5	21	2026-07-03 08:00:00+00	8
6277	5	21	2026-07-03 10:00:00+00	8
6278	5	21	2026-07-03 13:00:00+00	8
6279	5	21	2026-07-06 08:00:00+00	8
6280	5	21	2026-07-06 10:00:00+00	8
6281	5	21	2026-07-06 13:00:00+00	8
6282	5	21	2026-07-07 08:00:00+00	8
6283	5	21	2026-07-07 10:00:00+00	8
6284	5	21	2026-07-07 13:00:00+00	8
6285	5	21	2026-07-08 08:00:00+00	8
6286	5	21	2026-07-08 10:00:00+00	8
6287	5	21	2026-07-08 13:00:00+00	8
6288	5	21	2026-07-09 08:00:00+00	8
6289	5	21	2026-07-09 10:00:00+00	8
6290	5	21	2026-07-09 13:00:00+00	8
6291	5	21	2026-07-10 08:00:00+00	8
6292	5	21	2026-07-10 10:00:00+00	8
6293	5	21	2026-07-10 13:00:00+00	8
6294	5	21	2026-07-13 08:00:00+00	8
6295	5	21	2026-07-13 10:00:00+00	8
6296	5	21	2026-07-13 13:00:00+00	8
6297	5	21	2026-07-14 08:00:00+00	8
6298	5	21	2026-07-14 10:00:00+00	8
6299	5	21	2026-07-14 13:00:00+00	8
6300	5	21	2026-07-15 08:00:00+00	8
6301	5	21	2026-07-15 10:00:00+00	8
6302	5	21	2026-07-15 13:00:00+00	8
6303	5	21	2026-07-16 08:00:00+00	8
6304	5	21	2026-07-16 10:00:00+00	8
6305	5	21	2026-07-16 13:00:00+00	8
6306	5	21	2026-07-17 08:00:00+00	8
6307	5	21	2026-07-17 10:00:00+00	8
6308	5	21	2026-07-17 13:00:00+00	8
6309	7	21	2026-06-29 08:00:00+00	8
6310	7	21	2026-06-29 10:00:00+00	8
6311	7	21	2026-06-29 13:00:00+00	8
6312	7	21	2026-06-30 08:00:00+00	8
6313	7	21	2026-06-30 10:00:00+00	8
6314	7	21	2026-06-30 13:00:00+00	8
6315	7	21	2026-07-01 08:00:00+00	8
6316	7	21	2026-07-01 10:00:00+00	8
6317	7	21	2026-07-01 13:00:00+00	8
6318	7	21	2026-07-02 08:00:00+00	8
6319	7	21	2026-07-02 10:00:00+00	8
6320	7	21	2026-07-02 13:00:00+00	8
6321	7	21	2026-07-03 08:00:00+00	8
6322	7	21	2026-07-03 10:00:00+00	8
6323	7	21	2026-07-03 13:00:00+00	8
6324	7	21	2026-07-06 08:00:00+00	8
6325	7	21	2026-07-06 10:00:00+00	8
6326	7	21	2026-07-06 13:00:00+00	8
6327	7	21	2026-07-07 08:00:00+00	8
6328	7	21	2026-07-07 10:00:00+00	8
6329	7	21	2026-07-07 13:00:00+00	8
6330	7	21	2026-07-08 08:00:00+00	8
6331	7	21	2026-07-08 10:00:00+00	8
6332	7	21	2026-07-08 13:00:00+00	8
6333	7	21	2026-07-09 08:00:00+00	8
6334	7	21	2026-07-09 10:00:00+00	8
6335	7	21	2026-07-09 13:00:00+00	8
6336	7	21	2026-07-10 08:00:00+00	8
6337	7	21	2026-07-10 10:00:00+00	8
6338	7	21	2026-07-10 13:00:00+00	8
6339	7	21	2026-07-13 08:00:00+00	8
6340	7	21	2026-07-13 10:00:00+00	8
6341	7	21	2026-07-13 13:00:00+00	8
6342	7	21	2026-07-14 08:00:00+00	8
6343	7	21	2026-07-14 10:00:00+00	8
6344	7	21	2026-07-14 13:00:00+00	8
6345	7	21	2026-07-15 08:00:00+00	8
6346	7	21	2026-07-15 10:00:00+00	8
6347	7	21	2026-07-15 13:00:00+00	8
6348	7	21	2026-07-16 08:00:00+00	8
6349	7	21	2026-07-16 10:00:00+00	8
6350	7	21	2026-07-16 13:00:00+00	8
6351	7	21	2026-07-17 08:00:00+00	8
6352	7	21	2026-07-17 10:00:00+00	8
6353	7	21	2026-07-17 13:00:00+00	8
6354	9	21	2026-06-29 08:00:00+00	8
6355	9	21	2026-06-29 10:00:00+00	8
6356	9	21	2026-06-29 13:00:00+00	8
6357	9	21	2026-06-30 08:00:00+00	8
6358	9	21	2026-06-30 10:00:00+00	8
6359	9	21	2026-06-30 13:00:00+00	8
6360	9	21	2026-07-01 08:00:00+00	8
6361	9	21	2026-07-01 10:00:00+00	8
6362	9	21	2026-07-01 13:00:00+00	8
6363	9	21	2026-07-02 08:00:00+00	8
6364	9	21	2026-07-02 10:00:00+00	8
6365	9	21	2026-07-02 13:00:00+00	8
6366	9	21	2026-07-03 08:00:00+00	8
6367	9	21	2026-07-03 10:00:00+00	8
6368	9	21	2026-07-03 13:00:00+00	8
6369	9	21	2026-07-06 08:00:00+00	8
6370	9	21	2026-07-06 10:00:00+00	8
6371	9	21	2026-07-06 13:00:00+00	8
6372	9	21	2026-07-07 08:00:00+00	8
6373	9	21	2026-07-07 10:00:00+00	8
6374	9	21	2026-07-07 13:00:00+00	8
6375	9	21	2026-07-08 08:00:00+00	8
6376	9	21	2026-07-08 10:00:00+00	8
6377	9	21	2026-07-08 13:00:00+00	8
6378	9	21	2026-07-09 08:00:00+00	8
6379	9	21	2026-07-09 10:00:00+00	8
6380	9	21	2026-07-09 13:00:00+00	8
6381	9	21	2026-07-10 08:00:00+00	8
6382	9	21	2026-07-10 10:00:00+00	8
6383	9	21	2026-07-10 13:00:00+00	8
6384	9	21	2026-07-13 08:00:00+00	8
6385	9	21	2026-07-13 10:00:00+00	8
6386	9	21	2026-07-13 13:00:00+00	8
6387	9	21	2026-07-14 08:00:00+00	8
6388	9	21	2026-07-14 10:00:00+00	8
6389	9	21	2026-07-14 13:00:00+00	8
6390	9	21	2026-07-15 08:00:00+00	8
6391	9	21	2026-07-15 10:00:00+00	8
6392	9	21	2026-07-15 13:00:00+00	8
6393	9	21	2026-07-16 08:00:00+00	8
6394	9	21	2026-07-16 10:00:00+00	8
6395	9	21	2026-07-16 13:00:00+00	8
6396	9	21	2026-07-17 08:00:00+00	8
6397	9	21	2026-07-17 10:00:00+00	8
6398	9	21	2026-07-17 13:00:00+00	8
6399	14	21	2026-06-29 08:00:00+00	8
6400	14	21	2026-06-29 10:00:00+00	8
6401	14	21	2026-06-29 13:00:00+00	8
6402	14	21	2026-06-30 08:00:00+00	8
6403	14	21	2026-06-30 10:00:00+00	8
6404	14	21	2026-06-30 13:00:00+00	8
6405	14	21	2026-07-01 08:00:00+00	8
6406	14	21	2026-07-01 10:00:00+00	8
6407	14	21	2026-07-01 13:00:00+00	8
6408	14	21	2026-07-02 08:00:00+00	8
6409	14	21	2026-07-02 10:00:00+00	8
6410	14	21	2026-07-02 13:00:00+00	8
6411	14	21	2026-07-03 08:00:00+00	8
6412	14	21	2026-07-03 10:00:00+00	8
6413	14	21	2026-07-03 13:00:00+00	8
6414	14	21	2026-07-06 08:00:00+00	8
6415	14	21	2026-07-06 10:00:00+00	8
6416	14	21	2026-07-06 13:00:00+00	8
6417	14	21	2026-07-07 08:00:00+00	8
6418	14	21	2026-07-07 10:00:00+00	8
6419	14	21	2026-07-07 13:00:00+00	8
6420	14	21	2026-07-08 08:00:00+00	8
6421	14	21	2026-07-08 10:00:00+00	8
6422	14	21	2026-07-08 13:00:00+00	8
6423	14	21	2026-07-09 08:00:00+00	8
6424	14	21	2026-07-09 10:00:00+00	8
6425	14	21	2026-07-09 13:00:00+00	8
6426	14	21	2026-07-10 08:00:00+00	8
6427	14	21	2026-07-10 10:00:00+00	8
6428	14	21	2026-07-10 13:00:00+00	8
6429	14	21	2026-07-13 08:00:00+00	8
6430	14	21	2026-07-13 10:00:00+00	8
6431	14	21	2026-07-13 13:00:00+00	8
6432	14	21	2026-07-14 08:00:00+00	8
6433	14	21	2026-07-14 10:00:00+00	8
6434	14	21	2026-07-14 13:00:00+00	8
6435	14	21	2026-07-15 08:00:00+00	8
6436	14	21	2026-07-15 10:00:00+00	8
6437	14	21	2026-07-15 13:00:00+00	8
6438	14	21	2026-07-16 08:00:00+00	8
6439	14	21	2026-07-16 10:00:00+00	8
6440	14	21	2026-07-16 13:00:00+00	8
6441	14	21	2026-07-17 08:00:00+00	8
6442	14	21	2026-07-17 10:00:00+00	8
6443	14	21	2026-07-17 13:00:00+00	8
6444	21	21	2026-06-29 08:00:00+00	8
6445	21	21	2026-06-29 10:00:00+00	8
6446	21	21	2026-06-29 13:00:00+00	8
6447	21	21	2026-06-30 08:00:00+00	8
6448	21	21	2026-06-30 10:00:00+00	8
6449	21	21	2026-06-30 13:00:00+00	8
6450	21	21	2026-07-01 08:00:00+00	8
6451	21	21	2026-07-01 10:00:00+00	8
6452	21	21	2026-07-01 13:00:00+00	8
6453	21	21	2026-07-02 08:00:00+00	8
6454	21	21	2026-07-02 10:00:00+00	8
6455	21	21	2026-07-02 13:00:00+00	8
6456	21	21	2026-07-03 08:00:00+00	8
6457	21	21	2026-07-03 10:00:00+00	8
6458	21	21	2026-07-03 13:00:00+00	8
6459	21	21	2026-07-06 08:00:00+00	8
6460	21	21	2026-07-06 10:00:00+00	8
6461	21	21	2026-07-06 13:00:00+00	8
6462	21	21	2026-07-07 08:00:00+00	8
6463	21	21	2026-07-07 10:00:00+00	8
6464	21	21	2026-07-07 13:00:00+00	8
6465	21	21	2026-07-08 08:00:00+00	8
6466	21	21	2026-07-08 10:00:00+00	8
6467	21	21	2026-07-08 13:00:00+00	8
6468	21	21	2026-07-09 08:00:00+00	8
6469	21	21	2026-07-09 10:00:00+00	8
6470	21	21	2026-07-09 13:00:00+00	8
6471	21	21	2026-07-10 08:00:00+00	8
6472	21	21	2026-07-10 10:00:00+00	8
6473	21	21	2026-07-10 13:00:00+00	8
6474	21	21	2026-07-13 08:00:00+00	8
6475	21	21	2026-07-13 10:00:00+00	8
6476	21	21	2026-07-13 13:00:00+00	8
6477	21	21	2026-07-14 08:00:00+00	8
6478	21	21	2026-07-14 10:00:00+00	8
6479	21	21	2026-07-14 13:00:00+00	8
6480	21	21	2026-07-15 08:00:00+00	8
6481	21	21	2026-07-15 10:00:00+00	8
6482	21	21	2026-07-15 13:00:00+00	8
6483	21	21	2026-07-16 08:00:00+00	8
6484	21	21	2026-07-16 10:00:00+00	8
6485	21	21	2026-07-16 13:00:00+00	8
6486	21	21	2026-07-17 08:00:00+00	8
6487	21	21	2026-07-17 10:00:00+00	8
6488	21	21	2026-07-17 13:00:00+00	8
6489	24	21	2026-06-29 08:00:00+00	8
6490	24	21	2026-06-29 10:00:00+00	8
6491	24	21	2026-06-29 13:00:00+00	8
6492	24	21	2026-06-30 08:00:00+00	8
6493	24	21	2026-06-30 10:00:00+00	8
6494	24	21	2026-06-30 13:00:00+00	8
6495	24	21	2026-07-01 08:00:00+00	8
6496	24	21	2026-07-01 10:00:00+00	8
6497	24	21	2026-07-01 13:00:00+00	8
6498	24	21	2026-07-02 08:00:00+00	8
6499	24	21	2026-07-02 10:00:00+00	8
6500	24	21	2026-07-02 13:00:00+00	8
6501	24	21	2026-07-03 08:00:00+00	8
6502	24	21	2026-07-03 10:00:00+00	8
6503	24	21	2026-07-03 13:00:00+00	8
6504	24	21	2026-07-06 08:00:00+00	8
6505	24	21	2026-07-06 10:00:00+00	8
6506	24	21	2026-07-06 13:00:00+00	8
6507	24	21	2026-07-07 08:00:00+00	8
6508	24	21	2026-07-07 10:00:00+00	8
6509	24	21	2026-07-07 13:00:00+00	8
6510	24	21	2026-07-08 08:00:00+00	8
6511	24	21	2026-07-08 10:00:00+00	8
6512	24	21	2026-07-08 13:00:00+00	8
6513	24	21	2026-07-09 08:00:00+00	8
6514	24	21	2026-07-09 10:00:00+00	8
6515	24	21	2026-07-09 13:00:00+00	8
6516	24	21	2026-07-10 08:00:00+00	8
6517	24	21	2026-07-10 10:00:00+00	8
6518	24	21	2026-07-10 13:00:00+00	8
6519	24	21	2026-07-13 08:00:00+00	8
6520	24	21	2026-07-13 10:00:00+00	8
6521	24	21	2026-07-13 13:00:00+00	8
6522	24	21	2026-07-14 08:00:00+00	8
6523	24	21	2026-07-14 10:00:00+00	8
6524	24	21	2026-07-14 13:00:00+00	8
6525	24	21	2026-07-15 08:00:00+00	8
6526	24	21	2026-07-15 10:00:00+00	8
6527	24	21	2026-07-15 13:00:00+00	8
6528	24	21	2026-07-16 08:00:00+00	8
6529	24	21	2026-07-16 10:00:00+00	8
6530	24	21	2026-07-16 13:00:00+00	8
6531	24	21	2026-07-17 08:00:00+00	8
6532	24	21	2026-07-17 10:00:00+00	8
6533	24	21	2026-07-17 13:00:00+00	8
6534	35	21	2026-06-29 08:00:00+00	8
6535	35	21	2026-06-29 10:00:00+00	8
6536	35	21	2026-06-29 13:00:00+00	8
6537	35	21	2026-06-30 08:00:00+00	8
6538	35	21	2026-06-30 10:00:00+00	8
6539	35	21	2026-06-30 13:00:00+00	8
6540	35	21	2026-07-01 08:00:00+00	8
6541	35	21	2026-07-01 10:00:00+00	8
6542	35	21	2026-07-01 13:00:00+00	8
6543	35	21	2026-07-02 08:00:00+00	8
6544	35	21	2026-07-02 10:00:00+00	8
6545	35	21	2026-07-02 13:00:00+00	8
6546	35	21	2026-07-03 08:00:00+00	8
6547	35	21	2026-07-03 10:00:00+00	8
6548	35	21	2026-07-03 13:00:00+00	8
6549	35	21	2026-07-06 08:00:00+00	8
6550	35	21	2026-07-06 10:00:00+00	8
6551	35	21	2026-07-06 13:00:00+00	8
6552	35	21	2026-07-07 08:00:00+00	8
6553	35	21	2026-07-07 10:00:00+00	8
6554	35	21	2026-07-07 13:00:00+00	8
6555	35	21	2026-07-08 08:00:00+00	8
6556	35	21	2026-07-08 10:00:00+00	8
6557	35	21	2026-07-08 13:00:00+00	8
6558	35	21	2026-07-09 08:00:00+00	8
6559	35	21	2026-07-09 10:00:00+00	8
6560	35	21	2026-07-09 13:00:00+00	8
6561	35	21	2026-07-10 08:00:00+00	8
6562	35	21	2026-07-10 10:00:00+00	8
6563	35	21	2026-07-10 13:00:00+00	8
6564	35	21	2026-07-13 08:00:00+00	8
6565	35	21	2026-07-13 10:00:00+00	8
6566	35	21	2026-07-13 13:00:00+00	8
6567	35	21	2026-07-14 08:00:00+00	8
6568	35	21	2026-07-14 10:00:00+00	8
6569	35	21	2026-07-14 13:00:00+00	8
6570	35	21	2026-07-15 08:00:00+00	8
6571	35	21	2026-07-15 10:00:00+00	8
6572	35	21	2026-07-15 13:00:00+00	8
6573	35	21	2026-07-16 08:00:00+00	8
6574	35	21	2026-07-16 10:00:00+00	8
6575	35	21	2026-07-16 13:00:00+00	8
6576	35	21	2026-07-17 08:00:00+00	8
6577	35	21	2026-07-17 10:00:00+00	8
6578	35	21	2026-07-17 13:00:00+00	8
6579	36	21	2026-06-29 08:00:00+00	8
6580	36	21	2026-06-29 10:00:00+00	8
6581	36	21	2026-06-29 13:00:00+00	8
6582	36	21	2026-06-30 08:00:00+00	8
6583	36	21	2026-06-30 10:00:00+00	8
6584	36	21	2026-06-30 13:00:00+00	8
6585	36	21	2026-07-01 08:00:00+00	8
6586	36	21	2026-07-01 10:00:00+00	8
6587	36	21	2026-07-01 13:00:00+00	8
6588	36	21	2026-07-02 08:00:00+00	8
6589	36	21	2026-07-02 10:00:00+00	8
6590	36	21	2026-07-02 13:00:00+00	8
6591	36	21	2026-07-03 08:00:00+00	8
6592	36	21	2026-07-03 10:00:00+00	8
6593	36	21	2026-07-03 13:00:00+00	8
6594	36	21	2026-07-06 08:00:00+00	8
6595	36	21	2026-07-06 10:00:00+00	8
6596	36	21	2026-07-06 13:00:00+00	8
6597	36	21	2026-07-07 08:00:00+00	8
6598	36	21	2026-07-07 10:00:00+00	8
6599	36	21	2026-07-07 13:00:00+00	8
6600	36	21	2026-07-08 08:00:00+00	8
6601	36	21	2026-07-08 10:00:00+00	8
6602	36	21	2026-07-08 13:00:00+00	8
6603	36	21	2026-07-09 08:00:00+00	8
6604	36	21	2026-07-09 10:00:00+00	8
6605	36	21	2026-07-09 13:00:00+00	8
6606	36	21	2026-07-10 08:00:00+00	8
6607	36	21	2026-07-10 10:00:00+00	8
6608	36	21	2026-07-10 13:00:00+00	8
6609	36	21	2026-07-13 08:00:00+00	8
6610	36	21	2026-07-13 10:00:00+00	8
6611	36	21	2026-07-13 13:00:00+00	8
6612	36	21	2026-07-14 08:00:00+00	8
6613	36	21	2026-07-14 10:00:00+00	8
6614	36	21	2026-07-14 13:00:00+00	8
6615	36	21	2026-07-15 08:00:00+00	8
6616	36	21	2026-07-15 10:00:00+00	8
6617	36	21	2026-07-15 13:00:00+00	8
6618	36	21	2026-07-16 08:00:00+00	8
6619	36	21	2026-07-16 10:00:00+00	8
6620	36	21	2026-07-16 13:00:00+00	8
6621	36	21	2026-07-17 08:00:00+00	8
6622	36	21	2026-07-17 10:00:00+00	8
6623	36	21	2026-07-17 13:00:00+00	8
6624	43	21	2026-06-29 08:00:00+00	8
6625	43	21	2026-06-29 10:00:00+00	8
6626	43	21	2026-06-29 13:00:00+00	8
6627	43	21	2026-06-30 08:00:00+00	8
6628	43	21	2026-06-30 10:00:00+00	8
6629	43	21	2026-06-30 13:00:00+00	8
6630	43	21	2026-07-01 08:00:00+00	8
6631	43	21	2026-07-01 10:00:00+00	8
6632	43	21	2026-07-01 13:00:00+00	8
6633	43	21	2026-07-02 08:00:00+00	8
6634	43	21	2026-07-02 10:00:00+00	8
6635	43	21	2026-07-02 13:00:00+00	8
6636	43	21	2026-07-03 08:00:00+00	8
6637	43	21	2026-07-03 10:00:00+00	8
6638	43	21	2026-07-03 13:00:00+00	8
6639	43	21	2026-07-06 08:00:00+00	8
6640	43	21	2026-07-06 10:00:00+00	8
6641	43	21	2026-07-06 13:00:00+00	8
6642	43	21	2026-07-07 08:00:00+00	8
6643	43	21	2026-07-07 10:00:00+00	8
6644	43	21	2026-07-07 13:00:00+00	8
6645	43	21	2026-07-08 08:00:00+00	8
6646	43	21	2026-07-08 10:00:00+00	8
6647	43	21	2026-07-08 13:00:00+00	8
6648	43	21	2026-07-09 08:00:00+00	8
6649	43	21	2026-07-09 10:00:00+00	8
6650	43	21	2026-07-09 13:00:00+00	8
6651	43	21	2026-07-10 08:00:00+00	8
6652	43	21	2026-07-10 10:00:00+00	8
6653	43	21	2026-07-10 13:00:00+00	8
6654	43	21	2026-07-13 08:00:00+00	8
6655	43	21	2026-07-13 10:00:00+00	8
6656	43	21	2026-07-13 13:00:00+00	8
6657	43	21	2026-07-14 08:00:00+00	8
6658	43	21	2026-07-14 10:00:00+00	8
6659	43	21	2026-07-14 13:00:00+00	8
6660	43	21	2026-07-15 08:00:00+00	8
6661	43	21	2026-07-15 10:00:00+00	8
6662	43	21	2026-07-15 13:00:00+00	8
6663	43	21	2026-07-16 08:00:00+00	8
6664	43	21	2026-07-16 10:00:00+00	8
6665	43	21	2026-07-16 13:00:00+00	8
6666	43	21	2026-07-17 08:00:00+00	8
6667	43	21	2026-07-17 10:00:00+00	8
6668	43	21	2026-07-17 13:00:00+00	8
6669	46	21	2026-06-29 08:00:00+00	8
6670	46	21	2026-06-29 10:00:00+00	8
6671	46	21	2026-06-29 13:00:00+00	8
6672	46	21	2026-06-30 08:00:00+00	8
6673	46	21	2026-06-30 10:00:00+00	8
6674	46	21	2026-06-30 13:00:00+00	8
6675	46	21	2026-07-01 08:00:00+00	8
6676	46	21	2026-07-01 10:00:00+00	8
6677	46	21	2026-07-01 13:00:00+00	8
6678	46	21	2026-07-02 08:00:00+00	8
6679	46	21	2026-07-02 10:00:00+00	8
6680	46	21	2026-07-02 13:00:00+00	8
6681	46	21	2026-07-03 08:00:00+00	8
6682	46	21	2026-07-03 10:00:00+00	8
6683	46	21	2026-07-03 13:00:00+00	8
6684	46	21	2026-07-06 08:00:00+00	8
6685	46	21	2026-07-06 10:00:00+00	8
6686	46	21	2026-07-06 13:00:00+00	8
6687	46	21	2026-07-07 08:00:00+00	8
6688	46	21	2026-07-07 10:00:00+00	8
6689	46	21	2026-07-07 13:00:00+00	8
6690	46	21	2026-07-08 08:00:00+00	8
6691	46	21	2026-07-08 10:00:00+00	8
6692	46	21	2026-07-08 13:00:00+00	8
6693	46	21	2026-07-09 08:00:00+00	8
6694	46	21	2026-07-09 10:00:00+00	8
6695	46	21	2026-07-09 13:00:00+00	8
6696	46	21	2026-07-10 08:00:00+00	8
6697	46	21	2026-07-10 10:00:00+00	8
6698	46	21	2026-07-10 13:00:00+00	8
6699	46	21	2026-07-13 08:00:00+00	8
6700	46	21	2026-07-13 10:00:00+00	8
6701	46	21	2026-07-13 13:00:00+00	8
6702	46	21	2026-07-14 08:00:00+00	8
6703	46	21	2026-07-14 10:00:00+00	8
6704	46	21	2026-07-14 13:00:00+00	8
6705	46	21	2026-07-15 08:00:00+00	8
6706	46	21	2026-07-15 10:00:00+00	8
6707	46	21	2026-07-15 13:00:00+00	8
6708	46	21	2026-07-16 08:00:00+00	8
6709	46	21	2026-07-16 10:00:00+00	8
6710	46	21	2026-07-16 13:00:00+00	8
6711	46	21	2026-07-17 08:00:00+00	8
6712	46	21	2026-07-17 10:00:00+00	8
6713	46	21	2026-07-17 13:00:00+00	8
6714	50	21	2026-06-29 08:00:00+00	8
6715	50	21	2026-06-29 10:00:00+00	8
6716	50	21	2026-06-29 13:00:00+00	8
6717	50	21	2026-06-30 08:00:00+00	8
6718	50	21	2026-06-30 10:00:00+00	8
6719	50	21	2026-06-30 13:00:00+00	8
6720	50	21	2026-07-01 08:00:00+00	8
6721	50	21	2026-07-01 10:00:00+00	8
6722	50	21	2026-07-01 13:00:00+00	8
6723	50	21	2026-07-02 08:00:00+00	8
6724	50	21	2026-07-02 10:00:00+00	8
6725	50	21	2026-07-02 13:00:00+00	8
6726	50	21	2026-07-03 08:00:00+00	8
6727	50	21	2026-07-03 10:00:00+00	8
6728	50	21	2026-07-03 13:00:00+00	8
6729	50	21	2026-07-06 08:00:00+00	8
6730	50	21	2026-07-06 10:00:00+00	8
6731	50	21	2026-07-06 13:00:00+00	8
6732	50	21	2026-07-07 08:00:00+00	8
6733	50	21	2026-07-07 10:00:00+00	8
6734	50	21	2026-07-07 13:00:00+00	8
6735	50	21	2026-07-08 08:00:00+00	8
6736	50	21	2026-07-08 10:00:00+00	8
6737	50	21	2026-07-08 13:00:00+00	8
6738	50	21	2026-07-09 08:00:00+00	8
6739	50	21	2026-07-09 10:00:00+00	8
6740	50	21	2026-07-09 13:00:00+00	8
6741	50	21	2026-07-10 08:00:00+00	8
6742	50	21	2026-07-10 10:00:00+00	8
6743	50	21	2026-07-10 13:00:00+00	8
6744	50	21	2026-07-13 08:00:00+00	8
6745	50	21	2026-07-13 10:00:00+00	8
6746	50	21	2026-07-13 13:00:00+00	8
6747	50	21	2026-07-14 08:00:00+00	8
6748	50	21	2026-07-14 10:00:00+00	8
6749	50	21	2026-07-14 13:00:00+00	8
6750	50	21	2026-07-15 08:00:00+00	8
6751	50	21	2026-07-15 10:00:00+00	8
6752	50	21	2026-07-15 13:00:00+00	8
6753	50	21	2026-07-16 08:00:00+00	8
6754	50	21	2026-07-16 10:00:00+00	8
6755	50	21	2026-07-16 13:00:00+00	8
6756	50	21	2026-07-17 08:00:00+00	8
6757	50	21	2026-07-17 10:00:00+00	8
6758	50	21	2026-07-17 13:00:00+00	8
6759	1	22	2026-06-29 08:00:00+00	8
6760	1	22	2026-06-29 10:00:00+00	8
6761	1	22	2026-06-29 13:00:00+00	8
6762	1	22	2026-06-30 08:00:00+00	8
6763	1	22	2026-06-30 10:00:00+00	8
6764	1	22	2026-06-30 13:00:00+00	8
6765	1	22	2026-07-01 08:00:00+00	8
6766	1	22	2026-07-01 10:00:00+00	8
6767	1	22	2026-07-01 13:00:00+00	8
6768	1	22	2026-07-02 08:00:00+00	8
6769	1	22	2026-07-02 10:00:00+00	8
6770	1	22	2026-07-02 13:00:00+00	8
6771	1	22	2026-07-03 08:00:00+00	8
6772	1	22	2026-07-03 10:00:00+00	8
6773	1	22	2026-07-03 13:00:00+00	8
6774	1	22	2026-07-06 08:00:00+00	8
6775	1	22	2026-07-06 10:00:00+00	8
6776	1	22	2026-07-06 13:00:00+00	8
6777	1	22	2026-07-07 08:00:00+00	8
6778	1	22	2026-07-07 10:00:00+00	8
6779	1	22	2026-07-07 13:00:00+00	8
6780	1	22	2026-07-08 08:00:00+00	8
6781	1	22	2026-07-08 10:00:00+00	8
6782	1	22	2026-07-08 13:00:00+00	8
6783	1	22	2026-07-09 08:00:00+00	8
6784	1	22	2026-07-09 10:00:00+00	8
6785	1	22	2026-07-09 13:00:00+00	8
6786	1	22	2026-07-10 08:00:00+00	8
6787	1	22	2026-07-10 10:00:00+00	8
6788	1	22	2026-07-10 13:00:00+00	8
6789	1	22	2026-07-13 08:00:00+00	8
6790	1	22	2026-07-13 10:00:00+00	8
6791	1	22	2026-07-13 13:00:00+00	8
6792	1	22	2026-07-14 08:00:00+00	8
6793	1	22	2026-07-14 10:00:00+00	8
6794	1	22	2026-07-14 13:00:00+00	8
6795	1	22	2026-07-15 08:00:00+00	8
6796	1	22	2026-07-15 10:00:00+00	8
6797	1	22	2026-07-15 13:00:00+00	8
6798	1	22	2026-07-16 08:00:00+00	8
6799	1	22	2026-07-16 10:00:00+00	8
6800	1	22	2026-07-16 13:00:00+00	8
6801	1	22	2026-07-17 08:00:00+00	8
6802	1	22	2026-07-17 10:00:00+00	8
6803	1	22	2026-07-17 13:00:00+00	8
6804	2	22	2026-06-29 08:00:00+00	8
6805	2	22	2026-06-29 10:00:00+00	8
6806	2	22	2026-06-29 13:00:00+00	8
6807	2	22	2026-06-30 08:00:00+00	8
6808	2	22	2026-06-30 10:00:00+00	8
6809	2	22	2026-06-30 13:00:00+00	8
6810	2	22	2026-07-01 08:00:00+00	8
6811	2	22	2026-07-01 10:00:00+00	8
6812	2	22	2026-07-01 13:00:00+00	8
6813	2	22	2026-07-02 08:00:00+00	8
6814	2	22	2026-07-02 10:00:00+00	8
6815	2	22	2026-07-02 13:00:00+00	8
6816	2	22	2026-07-03 08:00:00+00	8
6817	2	22	2026-07-03 10:00:00+00	8
6818	2	22	2026-07-03 13:00:00+00	8
6819	2	22	2026-07-06 08:00:00+00	8
6820	2	22	2026-07-06 10:00:00+00	8
6821	2	22	2026-07-06 13:00:00+00	8
6822	2	22	2026-07-07 08:00:00+00	8
6823	2	22	2026-07-07 10:00:00+00	8
6824	2	22	2026-07-07 13:00:00+00	8
6825	2	22	2026-07-08 08:00:00+00	8
6826	2	22	2026-07-08 10:00:00+00	8
6827	2	22	2026-07-08 13:00:00+00	8
6828	2	22	2026-07-09 08:00:00+00	8
6829	2	22	2026-07-09 10:00:00+00	8
6830	2	22	2026-07-09 13:00:00+00	8
6831	2	22	2026-07-10 08:00:00+00	8
6832	2	22	2026-07-10 10:00:00+00	8
6833	2	22	2026-07-10 13:00:00+00	8
6834	2	22	2026-07-13 08:00:00+00	8
6835	2	22	2026-07-13 10:00:00+00	8
6836	2	22	2026-07-13 13:00:00+00	8
6837	2	22	2026-07-14 08:00:00+00	8
6838	2	22	2026-07-14 10:00:00+00	8
6839	2	22	2026-07-14 13:00:00+00	8
6840	2	22	2026-07-15 08:00:00+00	8
6841	2	22	2026-07-15 10:00:00+00	8
6842	2	22	2026-07-15 13:00:00+00	8
6843	2	22	2026-07-16 08:00:00+00	8
6844	2	22	2026-07-16 10:00:00+00	8
6845	2	22	2026-07-16 13:00:00+00	8
6846	2	22	2026-07-17 08:00:00+00	8
6847	2	22	2026-07-17 10:00:00+00	8
6848	2	22	2026-07-17 13:00:00+00	8
6849	5	22	2026-06-29 08:00:00+00	8
6850	5	22	2026-06-29 10:00:00+00	8
6851	5	22	2026-06-29 13:00:00+00	8
6852	5	22	2026-06-30 08:00:00+00	8
6853	5	22	2026-06-30 10:00:00+00	8
6854	5	22	2026-06-30 13:00:00+00	8
6855	5	22	2026-07-01 08:00:00+00	8
6856	5	22	2026-07-01 10:00:00+00	8
6857	5	22	2026-07-01 13:00:00+00	8
6858	5	22	2026-07-02 08:00:00+00	8
6859	5	22	2026-07-02 10:00:00+00	8
6860	5	22	2026-07-02 13:00:00+00	8
6861	5	22	2026-07-03 08:00:00+00	8
6862	5	22	2026-07-03 10:00:00+00	8
6863	5	22	2026-07-03 13:00:00+00	8
6864	5	22	2026-07-06 08:00:00+00	8
6865	5	22	2026-07-06 10:00:00+00	8
6866	5	22	2026-07-06 13:00:00+00	8
6867	5	22	2026-07-07 08:00:00+00	8
6868	5	22	2026-07-07 10:00:00+00	8
6869	5	22	2026-07-07 13:00:00+00	8
6870	5	22	2026-07-08 08:00:00+00	8
6871	5	22	2026-07-08 10:00:00+00	8
6872	5	22	2026-07-08 13:00:00+00	8
6873	5	22	2026-07-09 08:00:00+00	8
6874	5	22	2026-07-09 10:00:00+00	8
6875	5	22	2026-07-09 13:00:00+00	8
6876	5	22	2026-07-10 08:00:00+00	8
6877	5	22	2026-07-10 10:00:00+00	8
6878	5	22	2026-07-10 13:00:00+00	8
6879	5	22	2026-07-13 08:00:00+00	8
6880	5	22	2026-07-13 10:00:00+00	8
6881	5	22	2026-07-13 13:00:00+00	8
6882	5	22	2026-07-14 08:00:00+00	8
6883	5	22	2026-07-14 10:00:00+00	8
6884	5	22	2026-07-14 13:00:00+00	8
6885	5	22	2026-07-15 08:00:00+00	8
6886	5	22	2026-07-15 10:00:00+00	8
6887	5	22	2026-07-15 13:00:00+00	8
6888	5	22	2026-07-16 08:00:00+00	8
6889	5	22	2026-07-16 10:00:00+00	8
6890	5	22	2026-07-16 13:00:00+00	8
6891	5	22	2026-07-17 08:00:00+00	8
6892	5	22	2026-07-17 10:00:00+00	8
6893	5	22	2026-07-17 13:00:00+00	8
6894	7	22	2026-06-29 08:00:00+00	8
6895	7	22	2026-06-29 10:00:00+00	8
6896	7	22	2026-06-29 13:00:00+00	8
6897	7	22	2026-06-30 08:00:00+00	8
6898	7	22	2026-06-30 10:00:00+00	8
6899	7	22	2026-06-30 13:00:00+00	8
6900	7	22	2026-07-01 08:00:00+00	8
6901	7	22	2026-07-01 10:00:00+00	8
6902	7	22	2026-07-01 13:00:00+00	8
6903	7	22	2026-07-02 08:00:00+00	8
6904	7	22	2026-07-02 10:00:00+00	8
6905	7	22	2026-07-02 13:00:00+00	8
6906	7	22	2026-07-03 08:00:00+00	8
6907	7	22	2026-07-03 10:00:00+00	8
6908	7	22	2026-07-03 13:00:00+00	8
6909	7	22	2026-07-06 08:00:00+00	8
6910	7	22	2026-07-06 10:00:00+00	8
6911	7	22	2026-07-06 13:00:00+00	8
6912	7	22	2026-07-07 08:00:00+00	8
6913	7	22	2026-07-07 10:00:00+00	8
6914	7	22	2026-07-07 13:00:00+00	8
6915	7	22	2026-07-08 08:00:00+00	8
6916	7	22	2026-07-08 10:00:00+00	8
6917	7	22	2026-07-08 13:00:00+00	8
6918	7	22	2026-07-09 08:00:00+00	8
6919	7	22	2026-07-09 10:00:00+00	8
6920	7	22	2026-07-09 13:00:00+00	8
6921	7	22	2026-07-10 08:00:00+00	8
6922	7	22	2026-07-10 10:00:00+00	8
6923	7	22	2026-07-10 13:00:00+00	8
6924	7	22	2026-07-13 08:00:00+00	8
6925	7	22	2026-07-13 10:00:00+00	8
6926	7	22	2026-07-13 13:00:00+00	8
6927	7	22	2026-07-14 08:00:00+00	8
6928	7	22	2026-07-14 10:00:00+00	8
6929	7	22	2026-07-14 13:00:00+00	8
6930	7	22	2026-07-15 08:00:00+00	8
6931	7	22	2026-07-15 10:00:00+00	8
6932	7	22	2026-07-15 13:00:00+00	8
6933	7	22	2026-07-16 08:00:00+00	8
6934	7	22	2026-07-16 10:00:00+00	8
6935	7	22	2026-07-16 13:00:00+00	8
6936	7	22	2026-07-17 08:00:00+00	8
6937	7	22	2026-07-17 10:00:00+00	8
6938	7	22	2026-07-17 13:00:00+00	8
6939	9	22	2026-06-29 08:00:00+00	8
6940	9	22	2026-06-29 10:00:00+00	8
6941	9	22	2026-06-29 13:00:00+00	8
6942	9	22	2026-06-30 08:00:00+00	8
6943	9	22	2026-06-30 10:00:00+00	8
6944	9	22	2026-06-30 13:00:00+00	8
6945	9	22	2026-07-01 08:00:00+00	8
6946	9	22	2026-07-01 10:00:00+00	8
6947	9	22	2026-07-01 13:00:00+00	8
6948	9	22	2026-07-02 08:00:00+00	8
6949	9	22	2026-07-02 10:00:00+00	8
6950	9	22	2026-07-02 13:00:00+00	8
6951	9	22	2026-07-03 08:00:00+00	8
6952	9	22	2026-07-03 10:00:00+00	8
6953	9	22	2026-07-03 13:00:00+00	8
6954	9	22	2026-07-06 08:00:00+00	8
6955	9	22	2026-07-06 10:00:00+00	8
6956	9	22	2026-07-06 13:00:00+00	8
6957	9	22	2026-07-07 08:00:00+00	8
6958	9	22	2026-07-07 10:00:00+00	8
6959	9	22	2026-07-07 13:00:00+00	8
6960	9	22	2026-07-08 08:00:00+00	8
6961	9	22	2026-07-08 10:00:00+00	8
6962	9	22	2026-07-08 13:00:00+00	8
6963	9	22	2026-07-09 08:00:00+00	8
6964	9	22	2026-07-09 10:00:00+00	8
6965	9	22	2026-07-09 13:00:00+00	8
6966	9	22	2026-07-10 08:00:00+00	8
6967	9	22	2026-07-10 10:00:00+00	8
6968	9	22	2026-07-10 13:00:00+00	8
6969	9	22	2026-07-13 08:00:00+00	8
6970	9	22	2026-07-13 10:00:00+00	8
6971	9	22	2026-07-13 13:00:00+00	8
6972	9	22	2026-07-14 08:00:00+00	8
6973	9	22	2026-07-14 10:00:00+00	8
6974	9	22	2026-07-14 13:00:00+00	8
6975	9	22	2026-07-15 08:00:00+00	8
6976	9	22	2026-07-15 10:00:00+00	8
6977	9	22	2026-07-15 13:00:00+00	8
6978	9	22	2026-07-16 08:00:00+00	8
6979	9	22	2026-07-16 10:00:00+00	8
6980	9	22	2026-07-16 13:00:00+00	8
6981	9	22	2026-07-17 08:00:00+00	8
6982	9	22	2026-07-17 10:00:00+00	8
6983	9	22	2026-07-17 13:00:00+00	8
6984	14	22	2026-06-29 08:00:00+00	8
6985	14	22	2026-06-29 10:00:00+00	8
6986	14	22	2026-06-29 13:00:00+00	8
6987	14	22	2026-06-30 08:00:00+00	8
6988	14	22	2026-06-30 10:00:00+00	8
6989	14	22	2026-06-30 13:00:00+00	8
6990	14	22	2026-07-01 08:00:00+00	8
6991	14	22	2026-07-01 10:00:00+00	8
6992	14	22	2026-07-01 13:00:00+00	8
6993	14	22	2026-07-02 08:00:00+00	8
6994	14	22	2026-07-02 10:00:00+00	8
6995	14	22	2026-07-02 13:00:00+00	8
6996	14	22	2026-07-03 08:00:00+00	8
6997	14	22	2026-07-03 10:00:00+00	8
6998	14	22	2026-07-03 13:00:00+00	8
6999	14	22	2026-07-06 08:00:00+00	8
7000	14	22	2026-07-06 10:00:00+00	8
7001	14	22	2026-07-06 13:00:00+00	8
7002	14	22	2026-07-07 08:00:00+00	8
7003	14	22	2026-07-07 10:00:00+00	8
7004	14	22	2026-07-07 13:00:00+00	8
7005	14	22	2026-07-08 08:00:00+00	8
7006	14	22	2026-07-08 10:00:00+00	8
7007	14	22	2026-07-08 13:00:00+00	8
7008	14	22	2026-07-09 08:00:00+00	8
7009	14	22	2026-07-09 10:00:00+00	8
7010	14	22	2026-07-09 13:00:00+00	8
7011	14	22	2026-07-10 08:00:00+00	8
7012	14	22	2026-07-10 10:00:00+00	8
7013	14	22	2026-07-10 13:00:00+00	8
7014	14	22	2026-07-13 08:00:00+00	8
7015	14	22	2026-07-13 10:00:00+00	8
7016	14	22	2026-07-13 13:00:00+00	8
7017	14	22	2026-07-14 08:00:00+00	8
7018	14	22	2026-07-14 10:00:00+00	8
7019	14	22	2026-07-14 13:00:00+00	8
7020	14	22	2026-07-15 08:00:00+00	8
7021	14	22	2026-07-15 10:00:00+00	8
7022	14	22	2026-07-15 13:00:00+00	8
7023	14	22	2026-07-16 08:00:00+00	8
7024	14	22	2026-07-16 10:00:00+00	8
7025	14	22	2026-07-16 13:00:00+00	8
7026	14	22	2026-07-17 08:00:00+00	8
7027	14	22	2026-07-17 10:00:00+00	8
7028	14	22	2026-07-17 13:00:00+00	8
7029	21	22	2026-06-29 08:00:00+00	8
7030	21	22	2026-06-29 10:00:00+00	8
7031	21	22	2026-06-29 13:00:00+00	8
7032	21	22	2026-06-30 08:00:00+00	8
7033	21	22	2026-06-30 10:00:00+00	8
7034	21	22	2026-06-30 13:00:00+00	8
7035	21	22	2026-07-01 08:00:00+00	8
7036	21	22	2026-07-01 10:00:00+00	8
7037	21	22	2026-07-01 13:00:00+00	8
7038	21	22	2026-07-02 08:00:00+00	8
7039	21	22	2026-07-02 10:00:00+00	8
7040	21	22	2026-07-02 13:00:00+00	8
7041	21	22	2026-07-03 08:00:00+00	8
7042	21	22	2026-07-03 10:00:00+00	8
7043	21	22	2026-07-03 13:00:00+00	8
7044	21	22	2026-07-06 08:00:00+00	8
7045	21	22	2026-07-06 10:00:00+00	8
7046	21	22	2026-07-06 13:00:00+00	8
7047	21	22	2026-07-07 08:00:00+00	8
7048	21	22	2026-07-07 10:00:00+00	8
7049	21	22	2026-07-07 13:00:00+00	8
7050	21	22	2026-07-08 08:00:00+00	8
7051	21	22	2026-07-08 10:00:00+00	8
7052	21	22	2026-07-08 13:00:00+00	8
7053	21	22	2026-07-09 08:00:00+00	8
7054	21	22	2026-07-09 10:00:00+00	8
7055	21	22	2026-07-09 13:00:00+00	8
7056	21	22	2026-07-10 08:00:00+00	8
7057	21	22	2026-07-10 10:00:00+00	8
7058	21	22	2026-07-10 13:00:00+00	8
7059	21	22	2026-07-13 08:00:00+00	8
7060	21	22	2026-07-13 10:00:00+00	8
7061	21	22	2026-07-13 13:00:00+00	8
7062	21	22	2026-07-14 08:00:00+00	8
7063	21	22	2026-07-14 10:00:00+00	8
7064	21	22	2026-07-14 13:00:00+00	8
7065	21	22	2026-07-15 08:00:00+00	8
7066	21	22	2026-07-15 10:00:00+00	8
7067	21	22	2026-07-15 13:00:00+00	8
7068	21	22	2026-07-16 08:00:00+00	8
7069	21	22	2026-07-16 10:00:00+00	8
7070	21	22	2026-07-16 13:00:00+00	8
7071	21	22	2026-07-17 08:00:00+00	8
7072	21	22	2026-07-17 10:00:00+00	8
7073	21	22	2026-07-17 13:00:00+00	8
7074	24	22	2026-06-29 08:00:00+00	8
7075	24	22	2026-06-29 10:00:00+00	8
7076	24	22	2026-06-29 13:00:00+00	8
7077	24	22	2026-06-30 08:00:00+00	8
7078	24	22	2026-06-30 10:00:00+00	8
7079	24	22	2026-06-30 13:00:00+00	8
7080	24	22	2026-07-01 08:00:00+00	8
7081	24	22	2026-07-01 10:00:00+00	8
7082	24	22	2026-07-01 13:00:00+00	8
7083	24	22	2026-07-02 08:00:00+00	8
7084	24	22	2026-07-02 10:00:00+00	8
7085	24	22	2026-07-02 13:00:00+00	8
7086	24	22	2026-07-03 08:00:00+00	8
7087	24	22	2026-07-03 10:00:00+00	8
7088	24	22	2026-07-03 13:00:00+00	8
7089	24	22	2026-07-06 08:00:00+00	8
7090	24	22	2026-07-06 10:00:00+00	8
7091	24	22	2026-07-06 13:00:00+00	8
7092	24	22	2026-07-07 08:00:00+00	8
7093	24	22	2026-07-07 10:00:00+00	8
7094	24	22	2026-07-07 13:00:00+00	8
7095	24	22	2026-07-08 08:00:00+00	8
7096	24	22	2026-07-08 10:00:00+00	8
7097	24	22	2026-07-08 13:00:00+00	8
7098	24	22	2026-07-09 08:00:00+00	8
7099	24	22	2026-07-09 10:00:00+00	8
7100	24	22	2026-07-09 13:00:00+00	8
7101	24	22	2026-07-10 08:00:00+00	8
7102	24	22	2026-07-10 10:00:00+00	8
7103	24	22	2026-07-10 13:00:00+00	8
7104	24	22	2026-07-13 08:00:00+00	8
7105	24	22	2026-07-13 10:00:00+00	8
7106	24	22	2026-07-13 13:00:00+00	8
7107	24	22	2026-07-14 08:00:00+00	8
7108	24	22	2026-07-14 10:00:00+00	8
7109	24	22	2026-07-14 13:00:00+00	8
7110	24	22	2026-07-15 08:00:00+00	8
7111	24	22	2026-07-15 10:00:00+00	8
7112	24	22	2026-07-15 13:00:00+00	8
7113	24	22	2026-07-16 08:00:00+00	8
7114	24	22	2026-07-16 10:00:00+00	8
7115	24	22	2026-07-16 13:00:00+00	8
7116	24	22	2026-07-17 08:00:00+00	8
7117	24	22	2026-07-17 10:00:00+00	8
7118	24	22	2026-07-17 13:00:00+00	8
7119	35	22	2026-06-29 08:00:00+00	8
7120	35	22	2026-06-29 10:00:00+00	8
7121	35	22	2026-06-29 13:00:00+00	8
7122	35	22	2026-06-30 08:00:00+00	8
7123	35	22	2026-06-30 10:00:00+00	8
7124	35	22	2026-06-30 13:00:00+00	8
7125	35	22	2026-07-01 08:00:00+00	8
7126	35	22	2026-07-01 10:00:00+00	8
7127	35	22	2026-07-01 13:00:00+00	8
7128	35	22	2026-07-02 08:00:00+00	8
7129	35	22	2026-07-02 10:00:00+00	8
7130	35	22	2026-07-02 13:00:00+00	8
7131	35	22	2026-07-03 08:00:00+00	8
7132	35	22	2026-07-03 10:00:00+00	8
7133	35	22	2026-07-03 13:00:00+00	8
7134	35	22	2026-07-06 08:00:00+00	8
7135	35	22	2026-07-06 10:00:00+00	8
7136	35	22	2026-07-06 13:00:00+00	8
7137	35	22	2026-07-07 08:00:00+00	8
7138	35	22	2026-07-07 10:00:00+00	8
7139	35	22	2026-07-07 13:00:00+00	8
7140	35	22	2026-07-08 08:00:00+00	8
7141	35	22	2026-07-08 10:00:00+00	8
7142	35	22	2026-07-08 13:00:00+00	8
7143	35	22	2026-07-09 08:00:00+00	8
7144	35	22	2026-07-09 10:00:00+00	8
7145	35	22	2026-07-09 13:00:00+00	8
7146	35	22	2026-07-10 08:00:00+00	8
7147	35	22	2026-07-10 10:00:00+00	8
7148	35	22	2026-07-10 13:00:00+00	8
7149	35	22	2026-07-13 08:00:00+00	8
7150	35	22	2026-07-13 10:00:00+00	8
7151	35	22	2026-07-13 13:00:00+00	8
7152	35	22	2026-07-14 08:00:00+00	8
7153	35	22	2026-07-14 10:00:00+00	8
7154	35	22	2026-07-14 13:00:00+00	8
7155	35	22	2026-07-15 08:00:00+00	8
7156	35	22	2026-07-15 10:00:00+00	8
7157	35	22	2026-07-15 13:00:00+00	8
7158	35	22	2026-07-16 08:00:00+00	8
7159	35	22	2026-07-16 10:00:00+00	8
7160	35	22	2026-07-16 13:00:00+00	8
7161	35	22	2026-07-17 08:00:00+00	8
7162	35	22	2026-07-17 10:00:00+00	8
7163	35	22	2026-07-17 13:00:00+00	8
7164	36	22	2026-06-29 08:00:00+00	8
7165	36	22	2026-06-29 10:00:00+00	8
7166	36	22	2026-06-29 13:00:00+00	8
7167	36	22	2026-06-30 08:00:00+00	8
7168	36	22	2026-06-30 10:00:00+00	8
7169	36	22	2026-06-30 13:00:00+00	8
7170	36	22	2026-07-01 08:00:00+00	8
7171	36	22	2026-07-01 10:00:00+00	8
7172	36	22	2026-07-01 13:00:00+00	8
7173	36	22	2026-07-02 08:00:00+00	8
7174	36	22	2026-07-02 10:00:00+00	8
7175	36	22	2026-07-02 13:00:00+00	8
7176	36	22	2026-07-03 08:00:00+00	8
7177	36	22	2026-07-03 10:00:00+00	8
7178	36	22	2026-07-03 13:00:00+00	8
7179	36	22	2026-07-06 08:00:00+00	8
7180	36	22	2026-07-06 10:00:00+00	8
7181	36	22	2026-07-06 13:00:00+00	8
7182	36	22	2026-07-07 08:00:00+00	8
7183	36	22	2026-07-07 10:00:00+00	8
7184	36	22	2026-07-07 13:00:00+00	8
7185	36	22	2026-07-08 08:00:00+00	8
7186	36	22	2026-07-08 10:00:00+00	8
7187	36	22	2026-07-08 13:00:00+00	8
7188	36	22	2026-07-09 08:00:00+00	8
7189	36	22	2026-07-09 10:00:00+00	8
7190	36	22	2026-07-09 13:00:00+00	8
7191	36	22	2026-07-10 08:00:00+00	8
7192	36	22	2026-07-10 10:00:00+00	8
7193	36	22	2026-07-10 13:00:00+00	8
7194	36	22	2026-07-13 08:00:00+00	8
7195	36	22	2026-07-13 10:00:00+00	8
7196	36	22	2026-07-13 13:00:00+00	8
7197	36	22	2026-07-14 08:00:00+00	8
7198	36	22	2026-07-14 10:00:00+00	8
7199	36	22	2026-07-14 13:00:00+00	8
7200	36	22	2026-07-15 08:00:00+00	8
7201	36	22	2026-07-15 10:00:00+00	8
7202	36	22	2026-07-15 13:00:00+00	8
7203	36	22	2026-07-16 08:00:00+00	8
7204	36	22	2026-07-16 10:00:00+00	8
7205	36	22	2026-07-16 13:00:00+00	8
7206	36	22	2026-07-17 08:00:00+00	8
7207	36	22	2026-07-17 10:00:00+00	8
7208	36	22	2026-07-17 13:00:00+00	8
7209	43	22	2026-06-29 08:00:00+00	8
7210	43	22	2026-06-29 10:00:00+00	8
7211	43	22	2026-06-29 13:00:00+00	8
7212	43	22	2026-06-30 08:00:00+00	8
7213	43	22	2026-06-30 10:00:00+00	8
7214	43	22	2026-06-30 13:00:00+00	8
7215	43	22	2026-07-01 08:00:00+00	8
7216	43	22	2026-07-01 10:00:00+00	8
7217	43	22	2026-07-01 13:00:00+00	8
7218	43	22	2026-07-02 08:00:00+00	8
7219	43	22	2026-07-02 10:00:00+00	8
7220	43	22	2026-07-02 13:00:00+00	8
7221	43	22	2026-07-03 08:00:00+00	8
7222	43	22	2026-07-03 10:00:00+00	8
7223	43	22	2026-07-03 13:00:00+00	8
7224	43	22	2026-07-06 08:00:00+00	8
7225	43	22	2026-07-06 10:00:00+00	8
7226	43	22	2026-07-06 13:00:00+00	8
7227	43	22	2026-07-07 08:00:00+00	8
7228	43	22	2026-07-07 10:00:00+00	8
7229	43	22	2026-07-07 13:00:00+00	8
7230	43	22	2026-07-08 08:00:00+00	8
7231	43	22	2026-07-08 10:00:00+00	8
7232	43	22	2026-07-08 13:00:00+00	8
7233	43	22	2026-07-09 08:00:00+00	8
7234	43	22	2026-07-09 10:00:00+00	8
7235	43	22	2026-07-09 13:00:00+00	8
7236	43	22	2026-07-10 08:00:00+00	8
7237	43	22	2026-07-10 10:00:00+00	8
7238	43	22	2026-07-10 13:00:00+00	8
7239	43	22	2026-07-13 08:00:00+00	8
7240	43	22	2026-07-13 10:00:00+00	8
7241	43	22	2026-07-13 13:00:00+00	8
7242	43	22	2026-07-14 08:00:00+00	8
7243	43	22	2026-07-14 10:00:00+00	8
7244	43	22	2026-07-14 13:00:00+00	8
7245	43	22	2026-07-15 08:00:00+00	8
7246	43	22	2026-07-15 10:00:00+00	8
7247	43	22	2026-07-15 13:00:00+00	8
7248	43	22	2026-07-16 08:00:00+00	8
7249	43	22	2026-07-16 10:00:00+00	8
7250	43	22	2026-07-16 13:00:00+00	8
7251	43	22	2026-07-17 08:00:00+00	8
7252	43	22	2026-07-17 10:00:00+00	8
7253	43	22	2026-07-17 13:00:00+00	8
7254	46	22	2026-06-29 08:00:00+00	8
7255	46	22	2026-06-29 10:00:00+00	8
7256	46	22	2026-06-29 13:00:00+00	8
7257	46	22	2026-06-30 08:00:00+00	8
7258	46	22	2026-06-30 10:00:00+00	8
7259	46	22	2026-06-30 13:00:00+00	8
7260	46	22	2026-07-01 08:00:00+00	8
7261	46	22	2026-07-01 10:00:00+00	8
7262	46	22	2026-07-01 13:00:00+00	8
7263	46	22	2026-07-02 08:00:00+00	8
7264	46	22	2026-07-02 10:00:00+00	8
7265	46	22	2026-07-02 13:00:00+00	8
7266	46	22	2026-07-03 08:00:00+00	8
7267	46	22	2026-07-03 10:00:00+00	8
7268	46	22	2026-07-03 13:00:00+00	8
7269	46	22	2026-07-06 08:00:00+00	8
7270	46	22	2026-07-06 10:00:00+00	8
7271	46	22	2026-07-06 13:00:00+00	8
7272	46	22	2026-07-07 08:00:00+00	8
7273	46	22	2026-07-07 10:00:00+00	8
7274	46	22	2026-07-07 13:00:00+00	8
7275	46	22	2026-07-08 08:00:00+00	8
7276	46	22	2026-07-08 10:00:00+00	8
7277	46	22	2026-07-08 13:00:00+00	8
7278	46	22	2026-07-09 08:00:00+00	8
7279	46	22	2026-07-09 10:00:00+00	8
7280	46	22	2026-07-09 13:00:00+00	8
7281	46	22	2026-07-10 08:00:00+00	8
7282	46	22	2026-07-10 10:00:00+00	8
7283	46	22	2026-07-10 13:00:00+00	8
7284	46	22	2026-07-13 08:00:00+00	8
7285	46	22	2026-07-13 10:00:00+00	8
7286	46	22	2026-07-13 13:00:00+00	8
7287	46	22	2026-07-14 08:00:00+00	8
7288	46	22	2026-07-14 10:00:00+00	8
7289	46	22	2026-07-14 13:00:00+00	8
7290	46	22	2026-07-15 08:00:00+00	8
7291	46	22	2026-07-15 10:00:00+00	8
7292	46	22	2026-07-15 13:00:00+00	8
7293	46	22	2026-07-16 08:00:00+00	8
7294	46	22	2026-07-16 10:00:00+00	8
7295	46	22	2026-07-16 13:00:00+00	8
7296	46	22	2026-07-17 08:00:00+00	8
7297	46	22	2026-07-17 10:00:00+00	8
7298	46	22	2026-07-17 13:00:00+00	8
7299	50	22	2026-06-29 08:00:00+00	8
7300	50	22	2026-06-29 10:00:00+00	8
7301	50	22	2026-06-29 13:00:00+00	8
7302	50	22	2026-06-30 08:00:00+00	8
7303	50	22	2026-06-30 10:00:00+00	8
7304	50	22	2026-06-30 13:00:00+00	8
7305	50	22	2026-07-01 08:00:00+00	8
7306	50	22	2026-07-01 10:00:00+00	8
7307	50	22	2026-07-01 13:00:00+00	8
7308	50	22	2026-07-02 08:00:00+00	8
7309	50	22	2026-07-02 10:00:00+00	8
7310	50	22	2026-07-02 13:00:00+00	8
7311	50	22	2026-07-03 08:00:00+00	8
7312	50	22	2026-07-03 10:00:00+00	8
7313	50	22	2026-07-03 13:00:00+00	8
7314	50	22	2026-07-06 08:00:00+00	8
7315	50	22	2026-07-06 10:00:00+00	8
7316	50	22	2026-07-06 13:00:00+00	8
7317	50	22	2026-07-07 08:00:00+00	8
7318	50	22	2026-07-07 10:00:00+00	8
7319	50	22	2026-07-07 13:00:00+00	8
7320	50	22	2026-07-08 08:00:00+00	8
7321	50	22	2026-07-08 10:00:00+00	8
7322	50	22	2026-07-08 13:00:00+00	8
7323	50	22	2026-07-09 08:00:00+00	8
7324	50	22	2026-07-09 10:00:00+00	8
7325	50	22	2026-07-09 13:00:00+00	8
7326	50	22	2026-07-10 08:00:00+00	8
7327	50	22	2026-07-10 10:00:00+00	8
7328	50	22	2026-07-10 13:00:00+00	8
7329	50	22	2026-07-13 08:00:00+00	8
7330	50	22	2026-07-13 10:00:00+00	8
7331	50	22	2026-07-13 13:00:00+00	8
7332	50	22	2026-07-14 08:00:00+00	8
7333	50	22	2026-07-14 10:00:00+00	8
7334	50	22	2026-07-14 13:00:00+00	8
7335	50	22	2026-07-15 08:00:00+00	8
7336	50	22	2026-07-15 10:00:00+00	8
7337	50	22	2026-07-15 13:00:00+00	8
7338	50	22	2026-07-16 08:00:00+00	8
7339	50	22	2026-07-16 10:00:00+00	8
7340	50	22	2026-07-16 13:00:00+00	8
7341	50	22	2026-07-17 08:00:00+00	8
7342	50	22	2026-07-17 10:00:00+00	8
7343	50	22	2026-07-17 13:00:00+00	8
7344	1	23	2026-06-29 08:00:00+00	8
7345	1	23	2026-06-29 10:00:00+00	8
7346	1	23	2026-06-29 13:00:00+00	8
7347	1	23	2026-06-30 08:00:00+00	8
7348	1	23	2026-06-30 10:00:00+00	8
7349	1	23	2026-06-30 13:00:00+00	8
7350	1	23	2026-07-01 08:00:00+00	8
7351	1	23	2026-07-01 10:00:00+00	8
7352	1	23	2026-07-01 13:00:00+00	8
7353	1	23	2026-07-02 08:00:00+00	8
7354	1	23	2026-07-02 10:00:00+00	8
7355	1	23	2026-07-02 13:00:00+00	8
7356	1	23	2026-07-03 08:00:00+00	8
7357	1	23	2026-07-03 10:00:00+00	8
7358	1	23	2026-07-03 13:00:00+00	8
7359	1	23	2026-07-06 08:00:00+00	8
7360	1	23	2026-07-06 10:00:00+00	8
7361	1	23	2026-07-06 13:00:00+00	8
7362	1	23	2026-07-07 08:00:00+00	8
7363	1	23	2026-07-07 10:00:00+00	8
7364	1	23	2026-07-07 13:00:00+00	8
7365	1	23	2026-07-08 08:00:00+00	8
7366	1	23	2026-07-08 10:00:00+00	8
7367	1	23	2026-07-08 13:00:00+00	8
7368	1	23	2026-07-09 08:00:00+00	8
7369	1	23	2026-07-09 10:00:00+00	8
7370	1	23	2026-07-09 13:00:00+00	8
7371	1	23	2026-07-10 08:00:00+00	8
7372	1	23	2026-07-10 10:00:00+00	8
7373	1	23	2026-07-10 13:00:00+00	8
7374	1	23	2026-07-13 08:00:00+00	8
7375	1	23	2026-07-13 10:00:00+00	8
7376	1	23	2026-07-13 13:00:00+00	8
7377	1	23	2026-07-14 08:00:00+00	8
7378	1	23	2026-07-14 10:00:00+00	8
7379	1	23	2026-07-14 13:00:00+00	8
7380	1	23	2026-07-15 08:00:00+00	8
7381	1	23	2026-07-15 10:00:00+00	8
7382	1	23	2026-07-15 13:00:00+00	8
7383	1	23	2026-07-16 08:00:00+00	8
7384	1	23	2026-07-16 10:00:00+00	8
7385	1	23	2026-07-16 13:00:00+00	8
7386	1	23	2026-07-17 08:00:00+00	8
7387	1	23	2026-07-17 10:00:00+00	8
7388	1	23	2026-07-17 13:00:00+00	8
7389	2	23	2026-06-29 08:00:00+00	8
7390	2	23	2026-06-29 10:00:00+00	8
7391	2	23	2026-06-29 13:00:00+00	8
7392	2	23	2026-06-30 08:00:00+00	8
7393	2	23	2026-06-30 10:00:00+00	8
7394	2	23	2026-06-30 13:00:00+00	8
7395	2	23	2026-07-01 08:00:00+00	8
7396	2	23	2026-07-01 10:00:00+00	8
7397	2	23	2026-07-01 13:00:00+00	8
7398	2	23	2026-07-02 08:00:00+00	8
7399	2	23	2026-07-02 10:00:00+00	8
7400	2	23	2026-07-02 13:00:00+00	8
7401	2	23	2026-07-03 08:00:00+00	8
7402	2	23	2026-07-03 10:00:00+00	8
7403	2	23	2026-07-03 13:00:00+00	8
7404	2	23	2026-07-06 08:00:00+00	8
7405	2	23	2026-07-06 10:00:00+00	8
7406	2	23	2026-07-06 13:00:00+00	8
7407	2	23	2026-07-07 08:00:00+00	8
7408	2	23	2026-07-07 10:00:00+00	8
7409	2	23	2026-07-07 13:00:00+00	8
7410	2	23	2026-07-08 08:00:00+00	8
7411	2	23	2026-07-08 10:00:00+00	8
7412	2	23	2026-07-08 13:00:00+00	8
7413	2	23	2026-07-09 08:00:00+00	8
7414	2	23	2026-07-09 10:00:00+00	8
7415	2	23	2026-07-09 13:00:00+00	8
7416	2	23	2026-07-10 08:00:00+00	8
7417	2	23	2026-07-10 10:00:00+00	8
7418	2	23	2026-07-10 13:00:00+00	8
7419	2	23	2026-07-13 08:00:00+00	8
7420	2	23	2026-07-13 10:00:00+00	8
7421	2	23	2026-07-13 13:00:00+00	8
7422	2	23	2026-07-14 08:00:00+00	8
7423	2	23	2026-07-14 10:00:00+00	8
7424	2	23	2026-07-14 13:00:00+00	8
7425	2	23	2026-07-15 08:00:00+00	8
7426	2	23	2026-07-15 10:00:00+00	8
7427	2	23	2026-07-15 13:00:00+00	8
7428	2	23	2026-07-16 08:00:00+00	8
7429	2	23	2026-07-16 10:00:00+00	8
7430	2	23	2026-07-16 13:00:00+00	8
7431	2	23	2026-07-17 08:00:00+00	8
7432	2	23	2026-07-17 10:00:00+00	8
7433	2	23	2026-07-17 13:00:00+00	8
7434	5	23	2026-06-29 08:00:00+00	8
7435	5	23	2026-06-29 10:00:00+00	8
7436	5	23	2026-06-29 13:00:00+00	8
7437	5	23	2026-06-30 08:00:00+00	8
7438	5	23	2026-06-30 10:00:00+00	8
7439	5	23	2026-06-30 13:00:00+00	8
7440	5	23	2026-07-01 08:00:00+00	8
7441	5	23	2026-07-01 10:00:00+00	8
7442	5	23	2026-07-01 13:00:00+00	8
7443	5	23	2026-07-02 08:00:00+00	8
7444	5	23	2026-07-02 10:00:00+00	8
7445	5	23	2026-07-02 13:00:00+00	8
7446	5	23	2026-07-03 08:00:00+00	8
7447	5	23	2026-07-03 10:00:00+00	8
7448	5	23	2026-07-03 13:00:00+00	8
7449	5	23	2026-07-06 08:00:00+00	8
7450	5	23	2026-07-06 10:00:00+00	8
7451	5	23	2026-07-06 13:00:00+00	8
7452	5	23	2026-07-07 08:00:00+00	8
7453	5	23	2026-07-07 10:00:00+00	8
7454	5	23	2026-07-07 13:00:00+00	8
7455	5	23	2026-07-08 08:00:00+00	8
7456	5	23	2026-07-08 10:00:00+00	8
7457	5	23	2026-07-08 13:00:00+00	8
7458	5	23	2026-07-09 08:00:00+00	8
7459	5	23	2026-07-09 10:00:00+00	8
7460	5	23	2026-07-09 13:00:00+00	8
7461	5	23	2026-07-10 08:00:00+00	8
7462	5	23	2026-07-10 10:00:00+00	8
7463	5	23	2026-07-10 13:00:00+00	8
7464	5	23	2026-07-13 08:00:00+00	8
7465	5	23	2026-07-13 10:00:00+00	8
7466	5	23	2026-07-13 13:00:00+00	8
7467	5	23	2026-07-14 08:00:00+00	8
7468	5	23	2026-07-14 10:00:00+00	8
7469	5	23	2026-07-14 13:00:00+00	8
7470	5	23	2026-07-15 08:00:00+00	8
7471	5	23	2026-07-15 10:00:00+00	8
7472	5	23	2026-07-15 13:00:00+00	8
7473	5	23	2026-07-16 08:00:00+00	8
7474	5	23	2026-07-16 10:00:00+00	8
7475	5	23	2026-07-16 13:00:00+00	8
7476	5	23	2026-07-17 08:00:00+00	8
7477	5	23	2026-07-17 10:00:00+00	8
7478	5	23	2026-07-17 13:00:00+00	8
7479	7	23	2026-06-29 08:00:00+00	8
7480	7	23	2026-06-29 10:00:00+00	8
7481	7	23	2026-06-29 13:00:00+00	8
7482	7	23	2026-06-30 08:00:00+00	8
7483	7	23	2026-06-30 10:00:00+00	8
7484	7	23	2026-06-30 13:00:00+00	8
7485	7	23	2026-07-01 08:00:00+00	8
7486	7	23	2026-07-01 10:00:00+00	8
7487	7	23	2026-07-01 13:00:00+00	8
7488	7	23	2026-07-02 08:00:00+00	8
7489	7	23	2026-07-02 10:00:00+00	8
7490	7	23	2026-07-02 13:00:00+00	8
7491	7	23	2026-07-03 08:00:00+00	8
7492	7	23	2026-07-03 10:00:00+00	8
7493	7	23	2026-07-03 13:00:00+00	8
7494	7	23	2026-07-06 08:00:00+00	8
7495	7	23	2026-07-06 10:00:00+00	8
7496	7	23	2026-07-06 13:00:00+00	8
7497	7	23	2026-07-07 08:00:00+00	8
7498	7	23	2026-07-07 10:00:00+00	8
7499	7	23	2026-07-07 13:00:00+00	8
7500	7	23	2026-07-08 08:00:00+00	8
7501	7	23	2026-07-08 10:00:00+00	8
7502	7	23	2026-07-08 13:00:00+00	8
7503	7	23	2026-07-09 08:00:00+00	8
7504	7	23	2026-07-09 10:00:00+00	8
7505	7	23	2026-07-09 13:00:00+00	8
7506	7	23	2026-07-10 08:00:00+00	8
7507	7	23	2026-07-10 10:00:00+00	8
7508	7	23	2026-07-10 13:00:00+00	8
7509	7	23	2026-07-13 08:00:00+00	8
7510	7	23	2026-07-13 10:00:00+00	8
7511	7	23	2026-07-13 13:00:00+00	8
7512	7	23	2026-07-14 08:00:00+00	8
7513	7	23	2026-07-14 10:00:00+00	8
7514	7	23	2026-07-14 13:00:00+00	8
7515	7	23	2026-07-15 08:00:00+00	8
7516	7	23	2026-07-15 10:00:00+00	8
7517	7	23	2026-07-15 13:00:00+00	8
7518	7	23	2026-07-16 08:00:00+00	8
7519	7	23	2026-07-16 10:00:00+00	8
7520	7	23	2026-07-16 13:00:00+00	8
7521	7	23	2026-07-17 08:00:00+00	8
7522	7	23	2026-07-17 10:00:00+00	8
7523	7	23	2026-07-17 13:00:00+00	8
7524	9	23	2026-06-29 08:00:00+00	8
7525	9	23	2026-06-29 10:00:00+00	8
7526	9	23	2026-06-29 13:00:00+00	8
7527	9	23	2026-06-30 08:00:00+00	8
7528	9	23	2026-06-30 10:00:00+00	8
7529	9	23	2026-06-30 13:00:00+00	8
7530	9	23	2026-07-01 08:00:00+00	8
7531	9	23	2026-07-01 10:00:00+00	8
7532	9	23	2026-07-01 13:00:00+00	8
7533	9	23	2026-07-02 08:00:00+00	8
7534	9	23	2026-07-02 10:00:00+00	8
7535	9	23	2026-07-02 13:00:00+00	8
7536	9	23	2026-07-03 08:00:00+00	8
7537	9	23	2026-07-03 10:00:00+00	8
7538	9	23	2026-07-03 13:00:00+00	8
7539	9	23	2026-07-06 08:00:00+00	8
7540	9	23	2026-07-06 10:00:00+00	8
7541	9	23	2026-07-06 13:00:00+00	8
7542	9	23	2026-07-07 08:00:00+00	8
7543	9	23	2026-07-07 10:00:00+00	8
7544	9	23	2026-07-07 13:00:00+00	8
7545	9	23	2026-07-08 08:00:00+00	8
7546	9	23	2026-07-08 10:00:00+00	8
7547	9	23	2026-07-08 13:00:00+00	8
7548	9	23	2026-07-09 08:00:00+00	8
7549	9	23	2026-07-09 10:00:00+00	8
7550	9	23	2026-07-09 13:00:00+00	8
7551	9	23	2026-07-10 08:00:00+00	8
7552	9	23	2026-07-10 10:00:00+00	8
7553	9	23	2026-07-10 13:00:00+00	8
7554	9	23	2026-07-13 08:00:00+00	8
7555	9	23	2026-07-13 10:00:00+00	8
7556	9	23	2026-07-13 13:00:00+00	8
7557	9	23	2026-07-14 08:00:00+00	8
7558	9	23	2026-07-14 10:00:00+00	8
7559	9	23	2026-07-14 13:00:00+00	8
7560	9	23	2026-07-15 08:00:00+00	8
7561	9	23	2026-07-15 10:00:00+00	8
7562	9	23	2026-07-15 13:00:00+00	8
7563	9	23	2026-07-16 08:00:00+00	8
7564	9	23	2026-07-16 10:00:00+00	8
7565	9	23	2026-07-16 13:00:00+00	8
7566	9	23	2026-07-17 08:00:00+00	8
7567	9	23	2026-07-17 10:00:00+00	8
7568	9	23	2026-07-17 13:00:00+00	8
7569	14	23	2026-06-29 08:00:00+00	8
7570	14	23	2026-06-29 10:00:00+00	8
7571	14	23	2026-06-29 13:00:00+00	8
7572	14	23	2026-06-30 08:00:00+00	8
7573	14	23	2026-06-30 10:00:00+00	8
7574	14	23	2026-06-30 13:00:00+00	8
7575	14	23	2026-07-01 08:00:00+00	8
7576	14	23	2026-07-01 10:00:00+00	8
7577	14	23	2026-07-01 13:00:00+00	8
7578	14	23	2026-07-02 08:00:00+00	8
7579	14	23	2026-07-02 10:00:00+00	8
7580	14	23	2026-07-02 13:00:00+00	8
7581	14	23	2026-07-03 08:00:00+00	8
7582	14	23	2026-07-03 10:00:00+00	8
7583	14	23	2026-07-03 13:00:00+00	8
7584	14	23	2026-07-06 08:00:00+00	8
7585	14	23	2026-07-06 10:00:00+00	8
7586	14	23	2026-07-06 13:00:00+00	8
7587	14	23	2026-07-07 08:00:00+00	8
7588	14	23	2026-07-07 10:00:00+00	8
7589	14	23	2026-07-07 13:00:00+00	8
7590	14	23	2026-07-08 08:00:00+00	8
7591	14	23	2026-07-08 10:00:00+00	8
7592	14	23	2026-07-08 13:00:00+00	8
7593	14	23	2026-07-09 08:00:00+00	8
7594	14	23	2026-07-09 10:00:00+00	8
7595	14	23	2026-07-09 13:00:00+00	8
7596	14	23	2026-07-10 08:00:00+00	8
7597	14	23	2026-07-10 10:00:00+00	8
7598	14	23	2026-07-10 13:00:00+00	8
7599	14	23	2026-07-13 08:00:00+00	8
7600	14	23	2026-07-13 10:00:00+00	8
7601	14	23	2026-07-13 13:00:00+00	8
7602	14	23	2026-07-14 08:00:00+00	8
7603	14	23	2026-07-14 10:00:00+00	8
7604	14	23	2026-07-14 13:00:00+00	8
7605	14	23	2026-07-15 08:00:00+00	8
7606	14	23	2026-07-15 10:00:00+00	8
7607	14	23	2026-07-15 13:00:00+00	8
7608	14	23	2026-07-16 08:00:00+00	8
7609	14	23	2026-07-16 10:00:00+00	8
7610	14	23	2026-07-16 13:00:00+00	8
7611	14	23	2026-07-17 08:00:00+00	8
7612	14	23	2026-07-17 10:00:00+00	8
7613	14	23	2026-07-17 13:00:00+00	8
7614	21	23	2026-06-29 08:00:00+00	8
7615	21	23	2026-06-29 10:00:00+00	8
7616	21	23	2026-06-29 13:00:00+00	8
7617	21	23	2026-06-30 08:00:00+00	8
7618	21	23	2026-06-30 10:00:00+00	8
7619	21	23	2026-06-30 13:00:00+00	8
7620	21	23	2026-07-01 08:00:00+00	8
7621	21	23	2026-07-01 10:00:00+00	8
7622	21	23	2026-07-01 13:00:00+00	8
7623	21	23	2026-07-02 08:00:00+00	8
7624	21	23	2026-07-02 10:00:00+00	8
7625	21	23	2026-07-02 13:00:00+00	8
7626	21	23	2026-07-03 08:00:00+00	8
7627	21	23	2026-07-03 10:00:00+00	8
7628	21	23	2026-07-03 13:00:00+00	8
7629	21	23	2026-07-06 08:00:00+00	8
7630	21	23	2026-07-06 10:00:00+00	8
7631	21	23	2026-07-06 13:00:00+00	8
7632	21	23	2026-07-07 08:00:00+00	8
7633	21	23	2026-07-07 10:00:00+00	8
7634	21	23	2026-07-07 13:00:00+00	8
7635	21	23	2026-07-08 08:00:00+00	8
7636	21	23	2026-07-08 10:00:00+00	8
7637	21	23	2026-07-08 13:00:00+00	8
7638	21	23	2026-07-09 08:00:00+00	8
7639	21	23	2026-07-09 10:00:00+00	8
7640	21	23	2026-07-09 13:00:00+00	8
7641	21	23	2026-07-10 08:00:00+00	8
7642	21	23	2026-07-10 10:00:00+00	8
7643	21	23	2026-07-10 13:00:00+00	8
7644	21	23	2026-07-13 08:00:00+00	8
7645	21	23	2026-07-13 10:00:00+00	8
7646	21	23	2026-07-13 13:00:00+00	8
7647	21	23	2026-07-14 08:00:00+00	8
7648	21	23	2026-07-14 10:00:00+00	8
7649	21	23	2026-07-14 13:00:00+00	8
7650	21	23	2026-07-15 08:00:00+00	8
7651	21	23	2026-07-15 10:00:00+00	8
7652	21	23	2026-07-15 13:00:00+00	8
7653	21	23	2026-07-16 08:00:00+00	8
7654	21	23	2026-07-16 10:00:00+00	8
7655	21	23	2026-07-16 13:00:00+00	8
7656	21	23	2026-07-17 08:00:00+00	8
7657	21	23	2026-07-17 10:00:00+00	8
7658	21	23	2026-07-17 13:00:00+00	8
7659	24	23	2026-06-29 08:00:00+00	8
7660	24	23	2026-06-29 10:00:00+00	8
7661	24	23	2026-06-29 13:00:00+00	8
7662	24	23	2026-06-30 08:00:00+00	8
7663	24	23	2026-06-30 10:00:00+00	8
7664	24	23	2026-06-30 13:00:00+00	8
7665	24	23	2026-07-01 08:00:00+00	8
7666	24	23	2026-07-01 10:00:00+00	8
7667	24	23	2026-07-01 13:00:00+00	8
7668	24	23	2026-07-02 08:00:00+00	8
7669	24	23	2026-07-02 10:00:00+00	8
7670	24	23	2026-07-02 13:00:00+00	8
7671	24	23	2026-07-03 08:00:00+00	8
7672	24	23	2026-07-03 10:00:00+00	8
7673	24	23	2026-07-03 13:00:00+00	8
7674	24	23	2026-07-06 08:00:00+00	8
7675	24	23	2026-07-06 10:00:00+00	8
7676	24	23	2026-07-06 13:00:00+00	8
7677	24	23	2026-07-07 08:00:00+00	8
7678	24	23	2026-07-07 10:00:00+00	8
7679	24	23	2026-07-07 13:00:00+00	8
7680	24	23	2026-07-08 08:00:00+00	8
7681	24	23	2026-07-08 10:00:00+00	8
7682	24	23	2026-07-08 13:00:00+00	8
7683	24	23	2026-07-09 08:00:00+00	8
7684	24	23	2026-07-09 10:00:00+00	8
7685	24	23	2026-07-09 13:00:00+00	8
7686	24	23	2026-07-10 08:00:00+00	8
7687	24	23	2026-07-10 10:00:00+00	8
7688	24	23	2026-07-10 13:00:00+00	8
7689	24	23	2026-07-13 08:00:00+00	8
7690	24	23	2026-07-13 10:00:00+00	8
7691	24	23	2026-07-13 13:00:00+00	8
7692	24	23	2026-07-14 08:00:00+00	8
7693	24	23	2026-07-14 10:00:00+00	8
7694	24	23	2026-07-14 13:00:00+00	8
7695	24	23	2026-07-15 08:00:00+00	8
7696	24	23	2026-07-15 10:00:00+00	8
7697	24	23	2026-07-15 13:00:00+00	8
7698	24	23	2026-07-16 08:00:00+00	8
7699	24	23	2026-07-16 10:00:00+00	8
7700	24	23	2026-07-16 13:00:00+00	8
7701	24	23	2026-07-17 08:00:00+00	8
7702	24	23	2026-07-17 10:00:00+00	8
7703	24	23	2026-07-17 13:00:00+00	8
7704	35	23	2026-06-29 08:00:00+00	8
7705	35	23	2026-06-29 10:00:00+00	8
7706	35	23	2026-06-29 13:00:00+00	8
7707	35	23	2026-06-30 08:00:00+00	8
7708	35	23	2026-06-30 10:00:00+00	8
7709	35	23	2026-06-30 13:00:00+00	8
7710	35	23	2026-07-01 08:00:00+00	8
7711	35	23	2026-07-01 10:00:00+00	8
7712	35	23	2026-07-01 13:00:00+00	8
7713	35	23	2026-07-02 08:00:00+00	8
7714	35	23	2026-07-02 10:00:00+00	8
7715	35	23	2026-07-02 13:00:00+00	8
7716	35	23	2026-07-03 08:00:00+00	8
7717	35	23	2026-07-03 10:00:00+00	8
7718	35	23	2026-07-03 13:00:00+00	8
7719	35	23	2026-07-06 08:00:00+00	8
7720	35	23	2026-07-06 10:00:00+00	8
7721	35	23	2026-07-06 13:00:00+00	8
7722	35	23	2026-07-07 08:00:00+00	8
7723	35	23	2026-07-07 10:00:00+00	8
7724	35	23	2026-07-07 13:00:00+00	8
7725	35	23	2026-07-08 08:00:00+00	8
7726	35	23	2026-07-08 10:00:00+00	8
7727	35	23	2026-07-08 13:00:00+00	8
7728	35	23	2026-07-09 08:00:00+00	8
7729	35	23	2026-07-09 10:00:00+00	8
7730	35	23	2026-07-09 13:00:00+00	8
7731	35	23	2026-07-10 08:00:00+00	8
7732	35	23	2026-07-10 10:00:00+00	8
7733	35	23	2026-07-10 13:00:00+00	8
7734	35	23	2026-07-13 08:00:00+00	8
7735	35	23	2026-07-13 10:00:00+00	8
7736	35	23	2026-07-13 13:00:00+00	8
7737	35	23	2026-07-14 08:00:00+00	8
7738	35	23	2026-07-14 10:00:00+00	8
7739	35	23	2026-07-14 13:00:00+00	8
7740	35	23	2026-07-15 08:00:00+00	8
7741	35	23	2026-07-15 10:00:00+00	8
7742	35	23	2026-07-15 13:00:00+00	8
7743	35	23	2026-07-16 08:00:00+00	8
7744	35	23	2026-07-16 10:00:00+00	8
7745	35	23	2026-07-16 13:00:00+00	8
7746	35	23	2026-07-17 08:00:00+00	8
7747	35	23	2026-07-17 10:00:00+00	8
7748	35	23	2026-07-17 13:00:00+00	8
7749	36	23	2026-06-29 08:00:00+00	8
7750	36	23	2026-06-29 10:00:00+00	8
7751	36	23	2026-06-29 13:00:00+00	8
7752	36	23	2026-06-30 08:00:00+00	8
7753	36	23	2026-06-30 10:00:00+00	8
7754	36	23	2026-06-30 13:00:00+00	8
7755	36	23	2026-07-01 08:00:00+00	8
7756	36	23	2026-07-01 10:00:00+00	8
7757	36	23	2026-07-01 13:00:00+00	8
7758	36	23	2026-07-02 08:00:00+00	8
7759	36	23	2026-07-02 10:00:00+00	8
7760	36	23	2026-07-02 13:00:00+00	8
7761	36	23	2026-07-03 08:00:00+00	8
7762	36	23	2026-07-03 10:00:00+00	8
7763	36	23	2026-07-03 13:00:00+00	8
7764	36	23	2026-07-06 08:00:00+00	8
7765	36	23	2026-07-06 10:00:00+00	8
7766	36	23	2026-07-06 13:00:00+00	8
7767	36	23	2026-07-07 08:00:00+00	8
7768	36	23	2026-07-07 10:00:00+00	8
7769	36	23	2026-07-07 13:00:00+00	8
7770	36	23	2026-07-08 08:00:00+00	8
7771	36	23	2026-07-08 10:00:00+00	8
7772	36	23	2026-07-08 13:00:00+00	8
7773	36	23	2026-07-09 08:00:00+00	8
7774	36	23	2026-07-09 10:00:00+00	8
7775	36	23	2026-07-09 13:00:00+00	8
7776	36	23	2026-07-10 08:00:00+00	8
7777	36	23	2026-07-10 10:00:00+00	8
7778	36	23	2026-07-10 13:00:00+00	8
7779	36	23	2026-07-13 08:00:00+00	8
7780	36	23	2026-07-13 10:00:00+00	8
7781	36	23	2026-07-13 13:00:00+00	8
7782	36	23	2026-07-14 08:00:00+00	8
7783	36	23	2026-07-14 10:00:00+00	8
7784	36	23	2026-07-14 13:00:00+00	8
7785	36	23	2026-07-15 08:00:00+00	8
7786	36	23	2026-07-15 10:00:00+00	8
7787	36	23	2026-07-15 13:00:00+00	8
7788	36	23	2026-07-16 08:00:00+00	8
7789	36	23	2026-07-16 10:00:00+00	8
7790	36	23	2026-07-16 13:00:00+00	8
7791	36	23	2026-07-17 08:00:00+00	8
7792	36	23	2026-07-17 10:00:00+00	8
7793	36	23	2026-07-17 13:00:00+00	8
7794	43	23	2026-06-29 08:00:00+00	8
7795	43	23	2026-06-29 10:00:00+00	8
7796	43	23	2026-06-29 13:00:00+00	8
7797	43	23	2026-06-30 08:00:00+00	8
7798	43	23	2026-06-30 10:00:00+00	8
7799	43	23	2026-06-30 13:00:00+00	8
7800	43	23	2026-07-01 08:00:00+00	8
7801	43	23	2026-07-01 10:00:00+00	8
7802	43	23	2026-07-01 13:00:00+00	8
7803	43	23	2026-07-02 08:00:00+00	8
7804	43	23	2026-07-02 10:00:00+00	8
7805	43	23	2026-07-02 13:00:00+00	8
7806	43	23	2026-07-03 08:00:00+00	8
7807	43	23	2026-07-03 10:00:00+00	8
7808	43	23	2026-07-03 13:00:00+00	8
7809	43	23	2026-07-06 08:00:00+00	8
7810	43	23	2026-07-06 10:00:00+00	8
7811	43	23	2026-07-06 13:00:00+00	8
7812	43	23	2026-07-07 08:00:00+00	8
7813	43	23	2026-07-07 10:00:00+00	8
7814	43	23	2026-07-07 13:00:00+00	8
7815	43	23	2026-07-08 08:00:00+00	8
7816	43	23	2026-07-08 10:00:00+00	8
7817	43	23	2026-07-08 13:00:00+00	8
7818	43	23	2026-07-09 08:00:00+00	8
7819	43	23	2026-07-09 10:00:00+00	8
7820	43	23	2026-07-09 13:00:00+00	8
7821	43	23	2026-07-10 08:00:00+00	8
7822	43	23	2026-07-10 10:00:00+00	8
7823	43	23	2026-07-10 13:00:00+00	8
7824	43	23	2026-07-13 08:00:00+00	8
7825	43	23	2026-07-13 10:00:00+00	8
7826	43	23	2026-07-13 13:00:00+00	8
7827	43	23	2026-07-14 08:00:00+00	8
7828	43	23	2026-07-14 10:00:00+00	8
7829	43	23	2026-07-14 13:00:00+00	8
7830	43	23	2026-07-15 08:00:00+00	8
7831	43	23	2026-07-15 10:00:00+00	8
7832	43	23	2026-07-15 13:00:00+00	8
7833	43	23	2026-07-16 08:00:00+00	8
7834	43	23	2026-07-16 10:00:00+00	8
7835	43	23	2026-07-16 13:00:00+00	8
7836	43	23	2026-07-17 08:00:00+00	8
7837	43	23	2026-07-17 10:00:00+00	8
7838	43	23	2026-07-17 13:00:00+00	8
7839	46	23	2026-06-29 08:00:00+00	8
7840	46	23	2026-06-29 10:00:00+00	8
7841	46	23	2026-06-29 13:00:00+00	8
7842	46	23	2026-06-30 08:00:00+00	8
7843	46	23	2026-06-30 10:00:00+00	8
7844	46	23	2026-06-30 13:00:00+00	8
7845	46	23	2026-07-01 08:00:00+00	8
7846	46	23	2026-07-01 10:00:00+00	8
7847	46	23	2026-07-01 13:00:00+00	8
7848	46	23	2026-07-02 08:00:00+00	8
7849	46	23	2026-07-02 10:00:00+00	8
7850	46	23	2026-07-02 13:00:00+00	8
7851	46	23	2026-07-03 08:00:00+00	8
7852	46	23	2026-07-03 10:00:00+00	8
7853	46	23	2026-07-03 13:00:00+00	8
7854	46	23	2026-07-06 08:00:00+00	8
7855	46	23	2026-07-06 10:00:00+00	8
7856	46	23	2026-07-06 13:00:00+00	8
7857	46	23	2026-07-07 08:00:00+00	8
7858	46	23	2026-07-07 10:00:00+00	8
7859	46	23	2026-07-07 13:00:00+00	8
7860	46	23	2026-07-08 08:00:00+00	8
7861	46	23	2026-07-08 10:00:00+00	8
7862	46	23	2026-07-08 13:00:00+00	8
7863	46	23	2026-07-09 08:00:00+00	8
7864	46	23	2026-07-09 10:00:00+00	8
7865	46	23	2026-07-09 13:00:00+00	8
7866	46	23	2026-07-10 08:00:00+00	8
7867	46	23	2026-07-10 10:00:00+00	8
7868	46	23	2026-07-10 13:00:00+00	8
7869	46	23	2026-07-13 08:00:00+00	8
7870	46	23	2026-07-13 10:00:00+00	8
7871	46	23	2026-07-13 13:00:00+00	8
7872	46	23	2026-07-14 08:00:00+00	8
7873	46	23	2026-07-14 10:00:00+00	8
7874	46	23	2026-07-14 13:00:00+00	8
7875	46	23	2026-07-15 08:00:00+00	8
7876	46	23	2026-07-15 10:00:00+00	8
7877	46	23	2026-07-15 13:00:00+00	8
7878	46	23	2026-07-16 08:00:00+00	8
7879	46	23	2026-07-16 10:00:00+00	8
7880	46	23	2026-07-16 13:00:00+00	8
7881	46	23	2026-07-17 08:00:00+00	8
7882	46	23	2026-07-17 10:00:00+00	8
7883	46	23	2026-07-17 13:00:00+00	8
7884	50	23	2026-06-29 08:00:00+00	8
7885	50	23	2026-06-29 10:00:00+00	8
7886	50	23	2026-06-29 13:00:00+00	8
7887	50	23	2026-06-30 08:00:00+00	8
7888	50	23	2026-06-30 10:00:00+00	8
7889	50	23	2026-06-30 13:00:00+00	8
7890	50	23	2026-07-01 08:00:00+00	8
7891	50	23	2026-07-01 10:00:00+00	8
7892	50	23	2026-07-01 13:00:00+00	8
7893	50	23	2026-07-02 08:00:00+00	8
7894	50	23	2026-07-02 10:00:00+00	8
7895	50	23	2026-07-02 13:00:00+00	8
7896	50	23	2026-07-03 08:00:00+00	8
7897	50	23	2026-07-03 10:00:00+00	8
7898	50	23	2026-07-03 13:00:00+00	8
7899	50	23	2026-07-06 08:00:00+00	8
7900	50	23	2026-07-06 10:00:00+00	8
7901	50	23	2026-07-06 13:00:00+00	8
7902	50	23	2026-07-07 08:00:00+00	8
7903	50	23	2026-07-07 10:00:00+00	8
7904	50	23	2026-07-07 13:00:00+00	8
7905	50	23	2026-07-08 08:00:00+00	8
7906	50	23	2026-07-08 10:00:00+00	8
7907	50	23	2026-07-08 13:00:00+00	8
7908	50	23	2026-07-09 08:00:00+00	8
7909	50	23	2026-07-09 10:00:00+00	8
7910	50	23	2026-07-09 13:00:00+00	8
7911	50	23	2026-07-10 08:00:00+00	8
7912	50	23	2026-07-10 10:00:00+00	8
7913	50	23	2026-07-10 13:00:00+00	8
7914	50	23	2026-07-13 08:00:00+00	8
7915	50	23	2026-07-13 10:00:00+00	8
7916	50	23	2026-07-13 13:00:00+00	8
7917	50	23	2026-07-14 08:00:00+00	8
7918	50	23	2026-07-14 10:00:00+00	8
7919	50	23	2026-07-14 13:00:00+00	8
7920	50	23	2026-07-15 08:00:00+00	8
7921	50	23	2026-07-15 10:00:00+00	8
7922	50	23	2026-07-15 13:00:00+00	8
7923	50	23	2026-07-16 08:00:00+00	8
7924	50	23	2026-07-16 10:00:00+00	8
7925	50	23	2026-07-16 13:00:00+00	8
7926	50	23	2026-07-17 08:00:00+00	8
7927	50	23	2026-07-17 10:00:00+00	8
7928	50	23	2026-07-17 13:00:00+00	8
7929	1	24	2026-06-29 08:00:00+00	8
7930	1	24	2026-06-29 10:00:00+00	8
7931	1	24	2026-06-29 13:00:00+00	8
7932	1	24	2026-06-30 08:00:00+00	8
7933	1	24	2026-06-30 10:00:00+00	8
7934	1	24	2026-06-30 13:00:00+00	8
7935	1	24	2026-07-01 08:00:00+00	8
7936	1	24	2026-07-01 10:00:00+00	8
7937	1	24	2026-07-01 13:00:00+00	8
7938	1	24	2026-07-02 08:00:00+00	8
7939	1	24	2026-07-02 10:00:00+00	8
7940	1	24	2026-07-02 13:00:00+00	8
7941	1	24	2026-07-03 08:00:00+00	8
7942	1	24	2026-07-03 10:00:00+00	8
7943	1	24	2026-07-03 13:00:00+00	8
7944	1	24	2026-07-06 08:00:00+00	8
7945	1	24	2026-07-06 10:00:00+00	8
7946	1	24	2026-07-06 13:00:00+00	8
7947	1	24	2026-07-07 08:00:00+00	8
7948	1	24	2026-07-07 10:00:00+00	8
7949	1	24	2026-07-07 13:00:00+00	8
7950	1	24	2026-07-08 08:00:00+00	8
7951	1	24	2026-07-08 10:00:00+00	8
7952	1	24	2026-07-08 13:00:00+00	8
7953	1	24	2026-07-09 08:00:00+00	8
7954	1	24	2026-07-09 10:00:00+00	8
7955	1	24	2026-07-09 13:00:00+00	8
7956	1	24	2026-07-10 08:00:00+00	8
7957	1	24	2026-07-10 10:00:00+00	8
7958	1	24	2026-07-10 13:00:00+00	8
7959	1	24	2026-07-13 08:00:00+00	8
7960	1	24	2026-07-13 10:00:00+00	8
7961	1	24	2026-07-13 13:00:00+00	8
7962	1	24	2026-07-14 08:00:00+00	8
7963	1	24	2026-07-14 10:00:00+00	8
7964	1	24	2026-07-14 13:00:00+00	8
7965	1	24	2026-07-15 08:00:00+00	8
7966	1	24	2026-07-15 10:00:00+00	8
7967	1	24	2026-07-15 13:00:00+00	8
7968	1	24	2026-07-16 08:00:00+00	8
7969	1	24	2026-07-16 10:00:00+00	8
7970	1	24	2026-07-16 13:00:00+00	8
7971	1	24	2026-07-17 08:00:00+00	8
7972	1	24	2026-07-17 10:00:00+00	8
7973	1	24	2026-07-17 13:00:00+00	8
7974	2	24	2026-06-29 08:00:00+00	8
7975	2	24	2026-06-29 10:00:00+00	8
7976	2	24	2026-06-29 13:00:00+00	8
7977	2	24	2026-06-30 08:00:00+00	8
7978	2	24	2026-06-30 10:00:00+00	8
7979	2	24	2026-06-30 13:00:00+00	8
7980	2	24	2026-07-01 08:00:00+00	8
7981	2	24	2026-07-01 10:00:00+00	8
7982	2	24	2026-07-01 13:00:00+00	8
7983	2	24	2026-07-02 08:00:00+00	8
7984	2	24	2026-07-02 10:00:00+00	8
7985	2	24	2026-07-02 13:00:00+00	8
7986	2	24	2026-07-03 08:00:00+00	8
7987	2	24	2026-07-03 10:00:00+00	8
7988	2	24	2026-07-03 13:00:00+00	8
7989	2	24	2026-07-06 08:00:00+00	8
7990	2	24	2026-07-06 10:00:00+00	8
7991	2	24	2026-07-06 13:00:00+00	8
7992	2	24	2026-07-07 08:00:00+00	8
7993	2	24	2026-07-07 10:00:00+00	8
7994	2	24	2026-07-07 13:00:00+00	8
7995	2	24	2026-07-08 08:00:00+00	8
7996	2	24	2026-07-08 10:00:00+00	8
7997	2	24	2026-07-08 13:00:00+00	8
7998	2	24	2026-07-09 08:00:00+00	8
7999	2	24	2026-07-09 10:00:00+00	8
8000	2	24	2026-07-09 13:00:00+00	8
8001	2	24	2026-07-10 08:00:00+00	8
8002	2	24	2026-07-10 10:00:00+00	8
8003	2	24	2026-07-10 13:00:00+00	8
8004	2	24	2026-07-13 08:00:00+00	8
8005	2	24	2026-07-13 10:00:00+00	8
8006	2	24	2026-07-13 13:00:00+00	8
8007	2	24	2026-07-14 08:00:00+00	8
8008	2	24	2026-07-14 10:00:00+00	8
8009	2	24	2026-07-14 13:00:00+00	8
8010	2	24	2026-07-15 08:00:00+00	8
8011	2	24	2026-07-15 10:00:00+00	8
8012	2	24	2026-07-15 13:00:00+00	8
8013	2	24	2026-07-16 08:00:00+00	8
8014	2	24	2026-07-16 10:00:00+00	8
8015	2	24	2026-07-16 13:00:00+00	8
8016	2	24	2026-07-17 08:00:00+00	8
8017	2	24	2026-07-17 10:00:00+00	8
8018	2	24	2026-07-17 13:00:00+00	8
8019	5	24	2026-06-29 08:00:00+00	8
8020	5	24	2026-06-29 10:00:00+00	8
8021	5	24	2026-06-29 13:00:00+00	8
8022	5	24	2026-06-30 08:00:00+00	8
8023	5	24	2026-06-30 10:00:00+00	8
8024	5	24	2026-06-30 13:00:00+00	8
8025	5	24	2026-07-01 08:00:00+00	8
8026	5	24	2026-07-01 10:00:00+00	8
8027	5	24	2026-07-01 13:00:00+00	8
8028	5	24	2026-07-02 08:00:00+00	8
8029	5	24	2026-07-02 10:00:00+00	8
8030	5	24	2026-07-02 13:00:00+00	8
8031	5	24	2026-07-03 08:00:00+00	8
8032	5	24	2026-07-03 10:00:00+00	8
8033	5	24	2026-07-03 13:00:00+00	8
8034	5	24	2026-07-06 08:00:00+00	8
8035	5	24	2026-07-06 10:00:00+00	8
8036	5	24	2026-07-06 13:00:00+00	8
8037	5	24	2026-07-07 08:00:00+00	8
8038	5	24	2026-07-07 10:00:00+00	8
8039	5	24	2026-07-07 13:00:00+00	8
8040	5	24	2026-07-08 08:00:00+00	8
8041	5	24	2026-07-08 10:00:00+00	8
8042	5	24	2026-07-08 13:00:00+00	8
8043	5	24	2026-07-09 08:00:00+00	8
8044	5	24	2026-07-09 10:00:00+00	8
8045	5	24	2026-07-09 13:00:00+00	8
8046	5	24	2026-07-10 08:00:00+00	8
8047	5	24	2026-07-10 10:00:00+00	8
8048	5	24	2026-07-10 13:00:00+00	8
8049	5	24	2026-07-13 08:00:00+00	8
8050	5	24	2026-07-13 10:00:00+00	8
8051	5	24	2026-07-13 13:00:00+00	8
8052	5	24	2026-07-14 08:00:00+00	8
8053	5	24	2026-07-14 10:00:00+00	8
8054	5	24	2026-07-14 13:00:00+00	8
8055	5	24	2026-07-15 08:00:00+00	8
8056	5	24	2026-07-15 10:00:00+00	8
8057	5	24	2026-07-15 13:00:00+00	8
8058	5	24	2026-07-16 08:00:00+00	8
8059	5	24	2026-07-16 10:00:00+00	8
8060	5	24	2026-07-16 13:00:00+00	8
8061	5	24	2026-07-17 08:00:00+00	8
8062	5	24	2026-07-17 10:00:00+00	8
8063	5	24	2026-07-17 13:00:00+00	8
8064	7	24	2026-06-29 08:00:00+00	8
8065	7	24	2026-06-29 10:00:00+00	8
8066	7	24	2026-06-29 13:00:00+00	8
8067	7	24	2026-06-30 08:00:00+00	8
8068	7	24	2026-06-30 10:00:00+00	8
8069	7	24	2026-06-30 13:00:00+00	8
8070	7	24	2026-07-01 08:00:00+00	8
8071	7	24	2026-07-01 10:00:00+00	8
8072	7	24	2026-07-01 13:00:00+00	8
8073	7	24	2026-07-02 08:00:00+00	8
8074	7	24	2026-07-02 10:00:00+00	8
8075	7	24	2026-07-02 13:00:00+00	8
8076	7	24	2026-07-03 08:00:00+00	8
8077	7	24	2026-07-03 10:00:00+00	8
8078	7	24	2026-07-03 13:00:00+00	8
8079	7	24	2026-07-06 08:00:00+00	8
8080	7	24	2026-07-06 10:00:00+00	8
8081	7	24	2026-07-06 13:00:00+00	8
8082	7	24	2026-07-07 08:00:00+00	8
8083	7	24	2026-07-07 10:00:00+00	8
8084	7	24	2026-07-07 13:00:00+00	8
8085	7	24	2026-07-08 08:00:00+00	8
8086	7	24	2026-07-08 10:00:00+00	8
8087	7	24	2026-07-08 13:00:00+00	8
8088	7	24	2026-07-09 08:00:00+00	8
8089	7	24	2026-07-09 10:00:00+00	8
8090	7	24	2026-07-09 13:00:00+00	8
8091	7	24	2026-07-10 08:00:00+00	8
8092	7	24	2026-07-10 10:00:00+00	8
8093	7	24	2026-07-10 13:00:00+00	8
8094	7	24	2026-07-13 08:00:00+00	8
8095	7	24	2026-07-13 10:00:00+00	8
8096	7	24	2026-07-13 13:00:00+00	8
8097	7	24	2026-07-14 08:00:00+00	8
8098	7	24	2026-07-14 10:00:00+00	8
8099	7	24	2026-07-14 13:00:00+00	8
8100	7	24	2026-07-15 08:00:00+00	8
8101	7	24	2026-07-15 10:00:00+00	8
8102	7	24	2026-07-15 13:00:00+00	8
8103	7	24	2026-07-16 08:00:00+00	8
8104	7	24	2026-07-16 10:00:00+00	8
8105	7	24	2026-07-16 13:00:00+00	8
8106	7	24	2026-07-17 08:00:00+00	8
8107	7	24	2026-07-17 10:00:00+00	8
8108	7	24	2026-07-17 13:00:00+00	8
8109	9	24	2026-06-29 08:00:00+00	8
8110	9	24	2026-06-29 10:00:00+00	8
8111	9	24	2026-06-29 13:00:00+00	8
8112	9	24	2026-06-30 08:00:00+00	8
8113	9	24	2026-06-30 10:00:00+00	8
8114	9	24	2026-06-30 13:00:00+00	8
8115	9	24	2026-07-01 08:00:00+00	8
8116	9	24	2026-07-01 10:00:00+00	8
8117	9	24	2026-07-01 13:00:00+00	8
8118	9	24	2026-07-02 08:00:00+00	8
8119	9	24	2026-07-02 10:00:00+00	8
8120	9	24	2026-07-02 13:00:00+00	8
8121	9	24	2026-07-03 08:00:00+00	8
8122	9	24	2026-07-03 10:00:00+00	8
8123	9	24	2026-07-03 13:00:00+00	8
8124	9	24	2026-07-06 08:00:00+00	8
8125	9	24	2026-07-06 10:00:00+00	8
8126	9	24	2026-07-06 13:00:00+00	8
8127	9	24	2026-07-07 08:00:00+00	8
8128	9	24	2026-07-07 10:00:00+00	8
8129	9	24	2026-07-07 13:00:00+00	8
8130	9	24	2026-07-08 08:00:00+00	8
8131	9	24	2026-07-08 10:00:00+00	8
8132	9	24	2026-07-08 13:00:00+00	8
8133	9	24	2026-07-09 08:00:00+00	8
8134	9	24	2026-07-09 10:00:00+00	8
8135	9	24	2026-07-09 13:00:00+00	8
8136	9	24	2026-07-10 08:00:00+00	8
8137	9	24	2026-07-10 10:00:00+00	8
8138	9	24	2026-07-10 13:00:00+00	8
8139	9	24	2026-07-13 08:00:00+00	8
8140	9	24	2026-07-13 10:00:00+00	8
8141	9	24	2026-07-13 13:00:00+00	8
8142	9	24	2026-07-14 08:00:00+00	8
8143	9	24	2026-07-14 10:00:00+00	8
8144	9	24	2026-07-14 13:00:00+00	8
8145	9	24	2026-07-15 08:00:00+00	8
8146	9	24	2026-07-15 10:00:00+00	8
8147	9	24	2026-07-15 13:00:00+00	8
8148	9	24	2026-07-16 08:00:00+00	8
8149	9	24	2026-07-16 10:00:00+00	8
8150	9	24	2026-07-16 13:00:00+00	8
8151	9	24	2026-07-17 08:00:00+00	8
8152	9	24	2026-07-17 10:00:00+00	8
8153	9	24	2026-07-17 13:00:00+00	8
8154	14	24	2026-06-29 08:00:00+00	8
8155	14	24	2026-06-29 10:00:00+00	8
8156	14	24	2026-06-29 13:00:00+00	8
8157	14	24	2026-06-30 08:00:00+00	8
8158	14	24	2026-06-30 10:00:00+00	8
8159	14	24	2026-06-30 13:00:00+00	8
8160	14	24	2026-07-01 08:00:00+00	8
8161	14	24	2026-07-01 10:00:00+00	8
8162	14	24	2026-07-01 13:00:00+00	8
8163	14	24	2026-07-02 08:00:00+00	8
8164	14	24	2026-07-02 10:00:00+00	8
8165	14	24	2026-07-02 13:00:00+00	8
8166	14	24	2026-07-03 08:00:00+00	8
8167	14	24	2026-07-03 10:00:00+00	8
8168	14	24	2026-07-03 13:00:00+00	8
8169	14	24	2026-07-06 08:00:00+00	8
8170	14	24	2026-07-06 10:00:00+00	8
8171	14	24	2026-07-06 13:00:00+00	8
8172	14	24	2026-07-07 08:00:00+00	8
8173	14	24	2026-07-07 10:00:00+00	8
8174	14	24	2026-07-07 13:00:00+00	8
8175	14	24	2026-07-08 08:00:00+00	8
8176	14	24	2026-07-08 10:00:00+00	8
8177	14	24	2026-07-08 13:00:00+00	8
8178	14	24	2026-07-09 08:00:00+00	8
8179	14	24	2026-07-09 10:00:00+00	8
8180	14	24	2026-07-09 13:00:00+00	8
8181	14	24	2026-07-10 08:00:00+00	8
8182	14	24	2026-07-10 10:00:00+00	8
8183	14	24	2026-07-10 13:00:00+00	8
8184	14	24	2026-07-13 08:00:00+00	8
8185	14	24	2026-07-13 10:00:00+00	8
8186	14	24	2026-07-13 13:00:00+00	8
8187	14	24	2026-07-14 08:00:00+00	8
8188	14	24	2026-07-14 10:00:00+00	8
8189	14	24	2026-07-14 13:00:00+00	8
8190	14	24	2026-07-15 08:00:00+00	8
8191	14	24	2026-07-15 10:00:00+00	8
8192	14	24	2026-07-15 13:00:00+00	8
8193	14	24	2026-07-16 08:00:00+00	8
8194	14	24	2026-07-16 10:00:00+00	8
8195	14	24	2026-07-16 13:00:00+00	8
8196	14	24	2026-07-17 08:00:00+00	8
8197	14	24	2026-07-17 10:00:00+00	8
8198	14	24	2026-07-17 13:00:00+00	8
8199	21	24	2026-06-29 08:00:00+00	8
8200	21	24	2026-06-29 10:00:00+00	8
8201	21	24	2026-06-29 13:00:00+00	8
8202	21	24	2026-06-30 08:00:00+00	8
8203	21	24	2026-06-30 10:00:00+00	8
8204	21	24	2026-06-30 13:00:00+00	8
8205	21	24	2026-07-01 08:00:00+00	8
8206	21	24	2026-07-01 10:00:00+00	8
8207	21	24	2026-07-01 13:00:00+00	8
8208	21	24	2026-07-02 08:00:00+00	8
8209	21	24	2026-07-02 10:00:00+00	8
8210	21	24	2026-07-02 13:00:00+00	8
8211	21	24	2026-07-03 08:00:00+00	8
8212	21	24	2026-07-03 10:00:00+00	8
8213	21	24	2026-07-03 13:00:00+00	8
8214	21	24	2026-07-06 08:00:00+00	8
8215	21	24	2026-07-06 10:00:00+00	8
8216	21	24	2026-07-06 13:00:00+00	8
8217	21	24	2026-07-07 08:00:00+00	8
8218	21	24	2026-07-07 10:00:00+00	8
8219	21	24	2026-07-07 13:00:00+00	8
8220	21	24	2026-07-08 08:00:00+00	8
8221	21	24	2026-07-08 10:00:00+00	8
8222	21	24	2026-07-08 13:00:00+00	8
8223	21	24	2026-07-09 08:00:00+00	8
8224	21	24	2026-07-09 10:00:00+00	8
8225	21	24	2026-07-09 13:00:00+00	8
8226	21	24	2026-07-10 08:00:00+00	8
8227	21	24	2026-07-10 10:00:00+00	8
8228	21	24	2026-07-10 13:00:00+00	8
8229	21	24	2026-07-13 08:00:00+00	8
8230	21	24	2026-07-13 10:00:00+00	8
8231	21	24	2026-07-13 13:00:00+00	8
8232	21	24	2026-07-14 08:00:00+00	8
8233	21	24	2026-07-14 10:00:00+00	8
8234	21	24	2026-07-14 13:00:00+00	8
8235	21	24	2026-07-15 08:00:00+00	8
8236	21	24	2026-07-15 10:00:00+00	8
8237	21	24	2026-07-15 13:00:00+00	8
8238	21	24	2026-07-16 08:00:00+00	8
8239	21	24	2026-07-16 10:00:00+00	8
8240	21	24	2026-07-16 13:00:00+00	8
8241	21	24	2026-07-17 08:00:00+00	8
8242	21	24	2026-07-17 10:00:00+00	8
8243	21	24	2026-07-17 13:00:00+00	8
8244	24	24	2026-06-29 08:00:00+00	8
8245	24	24	2026-06-29 10:00:00+00	8
8246	24	24	2026-06-29 13:00:00+00	8
8247	24	24	2026-06-30 08:00:00+00	8
8248	24	24	2026-06-30 10:00:00+00	8
8249	24	24	2026-06-30 13:00:00+00	8
8250	24	24	2026-07-01 08:00:00+00	8
8251	24	24	2026-07-01 10:00:00+00	8
8252	24	24	2026-07-01 13:00:00+00	8
8253	24	24	2026-07-02 08:00:00+00	8
8254	24	24	2026-07-02 10:00:00+00	8
8255	24	24	2026-07-02 13:00:00+00	8
8256	24	24	2026-07-03 08:00:00+00	8
8257	24	24	2026-07-03 10:00:00+00	8
8258	24	24	2026-07-03 13:00:00+00	8
8259	24	24	2026-07-06 08:00:00+00	8
8260	24	24	2026-07-06 10:00:00+00	8
8261	24	24	2026-07-06 13:00:00+00	8
8262	24	24	2026-07-07 08:00:00+00	8
8263	24	24	2026-07-07 10:00:00+00	8
8264	24	24	2026-07-07 13:00:00+00	8
8265	24	24	2026-07-08 08:00:00+00	8
8266	24	24	2026-07-08 10:00:00+00	8
8267	24	24	2026-07-08 13:00:00+00	8
8268	24	24	2026-07-09 08:00:00+00	8
8269	24	24	2026-07-09 10:00:00+00	8
8270	24	24	2026-07-09 13:00:00+00	8
8271	24	24	2026-07-10 08:00:00+00	8
8272	24	24	2026-07-10 10:00:00+00	8
8273	24	24	2026-07-10 13:00:00+00	8
8274	24	24	2026-07-13 08:00:00+00	8
8275	24	24	2026-07-13 10:00:00+00	8
8276	24	24	2026-07-13 13:00:00+00	8
8277	24	24	2026-07-14 08:00:00+00	8
8278	24	24	2026-07-14 10:00:00+00	8
8279	24	24	2026-07-14 13:00:00+00	8
8280	24	24	2026-07-15 08:00:00+00	8
8281	24	24	2026-07-15 10:00:00+00	8
8282	24	24	2026-07-15 13:00:00+00	8
8283	24	24	2026-07-16 08:00:00+00	8
8284	24	24	2026-07-16 10:00:00+00	8
8285	24	24	2026-07-16 13:00:00+00	8
8286	24	24	2026-07-17 08:00:00+00	8
8287	24	24	2026-07-17 10:00:00+00	8
8288	24	24	2026-07-17 13:00:00+00	8
8289	35	24	2026-06-29 08:00:00+00	8
8290	35	24	2026-06-29 10:00:00+00	8
8291	35	24	2026-06-29 13:00:00+00	8
8292	35	24	2026-06-30 08:00:00+00	8
8293	35	24	2026-06-30 10:00:00+00	8
8294	35	24	2026-06-30 13:00:00+00	8
8295	35	24	2026-07-01 08:00:00+00	8
8296	35	24	2026-07-01 10:00:00+00	8
8297	35	24	2026-07-01 13:00:00+00	8
8298	35	24	2026-07-02 08:00:00+00	8
8299	35	24	2026-07-02 10:00:00+00	8
8300	35	24	2026-07-02 13:00:00+00	8
8301	35	24	2026-07-03 08:00:00+00	8
8302	35	24	2026-07-03 10:00:00+00	8
8303	35	24	2026-07-03 13:00:00+00	8
8304	35	24	2026-07-06 08:00:00+00	8
8305	35	24	2026-07-06 10:00:00+00	8
8306	35	24	2026-07-06 13:00:00+00	8
8307	35	24	2026-07-07 08:00:00+00	8
8308	35	24	2026-07-07 10:00:00+00	8
8309	35	24	2026-07-07 13:00:00+00	8
8310	35	24	2026-07-08 08:00:00+00	8
8311	35	24	2026-07-08 10:00:00+00	8
8312	35	24	2026-07-08 13:00:00+00	8
8313	35	24	2026-07-09 08:00:00+00	8
8314	35	24	2026-07-09 10:00:00+00	8
8315	35	24	2026-07-09 13:00:00+00	8
8316	35	24	2026-07-10 08:00:00+00	8
8317	35	24	2026-07-10 10:00:00+00	8
8318	35	24	2026-07-10 13:00:00+00	8
8319	35	24	2026-07-13 08:00:00+00	8
8320	35	24	2026-07-13 10:00:00+00	8
8321	35	24	2026-07-13 13:00:00+00	8
8322	35	24	2026-07-14 08:00:00+00	8
8323	35	24	2026-07-14 10:00:00+00	8
8324	35	24	2026-07-14 13:00:00+00	8
8325	35	24	2026-07-15 08:00:00+00	8
8326	35	24	2026-07-15 10:00:00+00	8
8327	35	24	2026-07-15 13:00:00+00	8
8328	35	24	2026-07-16 08:00:00+00	8
8329	35	24	2026-07-16 10:00:00+00	8
8330	35	24	2026-07-16 13:00:00+00	8
8331	35	24	2026-07-17 08:00:00+00	8
8332	35	24	2026-07-17 10:00:00+00	8
8333	35	24	2026-07-17 13:00:00+00	8
8334	36	24	2026-06-29 08:00:00+00	8
8335	36	24	2026-06-29 10:00:00+00	8
8336	36	24	2026-06-29 13:00:00+00	8
8337	36	24	2026-06-30 08:00:00+00	8
8338	36	24	2026-06-30 10:00:00+00	8
8339	36	24	2026-06-30 13:00:00+00	8
8340	36	24	2026-07-01 08:00:00+00	8
8341	36	24	2026-07-01 10:00:00+00	8
8342	36	24	2026-07-01 13:00:00+00	8
8343	36	24	2026-07-02 08:00:00+00	8
8344	36	24	2026-07-02 10:00:00+00	8
8345	36	24	2026-07-02 13:00:00+00	8
8346	36	24	2026-07-03 08:00:00+00	8
8347	36	24	2026-07-03 10:00:00+00	8
8348	36	24	2026-07-03 13:00:00+00	8
8349	36	24	2026-07-06 08:00:00+00	8
8350	36	24	2026-07-06 10:00:00+00	8
8351	36	24	2026-07-06 13:00:00+00	8
8352	36	24	2026-07-07 08:00:00+00	8
8353	36	24	2026-07-07 10:00:00+00	8
8354	36	24	2026-07-07 13:00:00+00	8
8355	36	24	2026-07-08 08:00:00+00	8
8356	36	24	2026-07-08 10:00:00+00	8
8357	36	24	2026-07-08 13:00:00+00	8
8358	36	24	2026-07-09 08:00:00+00	8
8359	36	24	2026-07-09 10:00:00+00	8
8360	36	24	2026-07-09 13:00:00+00	8
8361	36	24	2026-07-10 08:00:00+00	8
8362	36	24	2026-07-10 10:00:00+00	8
8363	36	24	2026-07-10 13:00:00+00	8
8364	36	24	2026-07-13 08:00:00+00	8
8365	36	24	2026-07-13 10:00:00+00	8
8366	36	24	2026-07-13 13:00:00+00	8
8367	36	24	2026-07-14 08:00:00+00	8
8368	36	24	2026-07-14 10:00:00+00	8
8369	36	24	2026-07-14 13:00:00+00	8
8370	36	24	2026-07-15 08:00:00+00	8
8371	36	24	2026-07-15 10:00:00+00	8
8372	36	24	2026-07-15 13:00:00+00	8
8373	36	24	2026-07-16 08:00:00+00	8
8374	36	24	2026-07-16 10:00:00+00	8
8375	36	24	2026-07-16 13:00:00+00	8
8376	36	24	2026-07-17 08:00:00+00	8
8377	36	24	2026-07-17 10:00:00+00	8
8378	36	24	2026-07-17 13:00:00+00	8
8379	43	24	2026-06-29 08:00:00+00	8
8380	43	24	2026-06-29 10:00:00+00	8
8381	43	24	2026-06-29 13:00:00+00	8
8382	43	24	2026-06-30 08:00:00+00	8
8383	43	24	2026-06-30 10:00:00+00	8
8384	43	24	2026-06-30 13:00:00+00	8
8385	43	24	2026-07-01 08:00:00+00	8
8386	43	24	2026-07-01 10:00:00+00	8
8387	43	24	2026-07-01 13:00:00+00	8
8388	43	24	2026-07-02 08:00:00+00	8
8389	43	24	2026-07-02 10:00:00+00	8
8390	43	24	2026-07-02 13:00:00+00	8
8391	43	24	2026-07-03 08:00:00+00	8
8392	43	24	2026-07-03 10:00:00+00	8
8393	43	24	2026-07-03 13:00:00+00	8
8394	43	24	2026-07-06 08:00:00+00	8
8395	43	24	2026-07-06 10:00:00+00	8
8396	43	24	2026-07-06 13:00:00+00	8
8397	43	24	2026-07-07 08:00:00+00	8
8398	43	24	2026-07-07 10:00:00+00	8
8399	43	24	2026-07-07 13:00:00+00	8
8400	43	24	2026-07-08 08:00:00+00	8
8401	43	24	2026-07-08 10:00:00+00	8
8402	43	24	2026-07-08 13:00:00+00	8
8403	43	24	2026-07-09 08:00:00+00	8
8404	43	24	2026-07-09 10:00:00+00	8
8405	43	24	2026-07-09 13:00:00+00	8
8406	43	24	2026-07-10 08:00:00+00	8
8407	43	24	2026-07-10 10:00:00+00	8
8408	43	24	2026-07-10 13:00:00+00	8
8409	43	24	2026-07-13 08:00:00+00	8
8410	43	24	2026-07-13 10:00:00+00	8
8411	43	24	2026-07-13 13:00:00+00	8
8412	43	24	2026-07-14 08:00:00+00	8
8413	43	24	2026-07-14 10:00:00+00	8
8414	43	24	2026-07-14 13:00:00+00	8
8415	43	24	2026-07-15 08:00:00+00	8
8416	43	24	2026-07-15 10:00:00+00	8
8417	43	24	2026-07-15 13:00:00+00	8
8418	43	24	2026-07-16 08:00:00+00	8
8419	43	24	2026-07-16 10:00:00+00	8
8420	43	24	2026-07-16 13:00:00+00	8
8421	43	24	2026-07-17 08:00:00+00	8
8422	43	24	2026-07-17 10:00:00+00	8
8423	43	24	2026-07-17 13:00:00+00	8
8424	46	24	2026-06-29 08:00:00+00	8
8425	46	24	2026-06-29 10:00:00+00	8
8426	46	24	2026-06-29 13:00:00+00	8
8427	46	24	2026-06-30 08:00:00+00	8
8428	46	24	2026-06-30 10:00:00+00	8
8429	46	24	2026-06-30 13:00:00+00	8
8430	46	24	2026-07-01 08:00:00+00	8
8431	46	24	2026-07-01 10:00:00+00	8
8432	46	24	2026-07-01 13:00:00+00	8
8433	46	24	2026-07-02 08:00:00+00	8
8434	46	24	2026-07-02 10:00:00+00	8
8435	46	24	2026-07-02 13:00:00+00	8
8436	46	24	2026-07-03 08:00:00+00	8
8437	46	24	2026-07-03 10:00:00+00	8
8438	46	24	2026-07-03 13:00:00+00	8
8439	46	24	2026-07-06 08:00:00+00	8
8440	46	24	2026-07-06 10:00:00+00	8
8441	46	24	2026-07-06 13:00:00+00	8
8442	46	24	2026-07-07 08:00:00+00	8
8443	46	24	2026-07-07 10:00:00+00	8
8444	46	24	2026-07-07 13:00:00+00	8
8445	46	24	2026-07-08 08:00:00+00	8
8446	46	24	2026-07-08 10:00:00+00	8
8447	46	24	2026-07-08 13:00:00+00	8
8448	46	24	2026-07-09 08:00:00+00	8
8449	46	24	2026-07-09 10:00:00+00	8
8450	46	24	2026-07-09 13:00:00+00	8
8451	46	24	2026-07-10 08:00:00+00	8
8452	46	24	2026-07-10 10:00:00+00	8
8453	46	24	2026-07-10 13:00:00+00	8
8454	46	24	2026-07-13 08:00:00+00	8
8455	46	24	2026-07-13 10:00:00+00	8
8456	46	24	2026-07-13 13:00:00+00	8
8457	46	24	2026-07-14 08:00:00+00	8
8458	46	24	2026-07-14 10:00:00+00	8
8459	46	24	2026-07-14 13:00:00+00	8
8460	46	24	2026-07-15 08:00:00+00	8
8461	46	24	2026-07-15 10:00:00+00	8
8462	46	24	2026-07-15 13:00:00+00	8
8463	46	24	2026-07-16 08:00:00+00	8
8464	46	24	2026-07-16 10:00:00+00	8
8465	46	24	2026-07-16 13:00:00+00	8
8466	46	24	2026-07-17 08:00:00+00	8
8467	46	24	2026-07-17 10:00:00+00	8
8468	46	24	2026-07-17 13:00:00+00	8
8469	50	24	2026-06-29 08:00:00+00	8
8470	50	24	2026-06-29 10:00:00+00	8
8471	50	24	2026-06-29 13:00:00+00	8
8472	50	24	2026-06-30 08:00:00+00	8
8473	50	24	2026-06-30 10:00:00+00	8
8474	50	24	2026-06-30 13:00:00+00	8
8475	50	24	2026-07-01 08:00:00+00	8
8476	50	24	2026-07-01 10:00:00+00	8
8477	50	24	2026-07-01 13:00:00+00	8
8478	50	24	2026-07-02 08:00:00+00	8
8479	50	24	2026-07-02 10:00:00+00	8
8480	50	24	2026-07-02 13:00:00+00	8
8481	50	24	2026-07-03 08:00:00+00	8
8482	50	24	2026-07-03 10:00:00+00	8
8483	50	24	2026-07-03 13:00:00+00	8
8484	50	24	2026-07-06 08:00:00+00	8
8485	50	24	2026-07-06 10:00:00+00	8
8486	50	24	2026-07-06 13:00:00+00	8
8487	50	24	2026-07-07 08:00:00+00	8
8488	50	24	2026-07-07 10:00:00+00	8
8489	50	24	2026-07-07 13:00:00+00	8
8490	50	24	2026-07-08 08:00:00+00	8
8491	50	24	2026-07-08 10:00:00+00	8
8492	50	24	2026-07-08 13:00:00+00	8
8493	50	24	2026-07-09 08:00:00+00	8
8494	50	24	2026-07-09 10:00:00+00	8
8495	50	24	2026-07-09 13:00:00+00	8
8496	50	24	2026-07-10 08:00:00+00	8
8497	50	24	2026-07-10 10:00:00+00	8
8498	50	24	2026-07-10 13:00:00+00	8
8499	50	24	2026-07-13 08:00:00+00	8
8500	50	24	2026-07-13 10:00:00+00	8
8501	50	24	2026-07-13 13:00:00+00	8
8502	50	24	2026-07-14 08:00:00+00	8
8503	50	24	2026-07-14 10:00:00+00	8
8504	50	24	2026-07-14 13:00:00+00	8
8505	50	24	2026-07-15 08:00:00+00	8
8506	50	24	2026-07-15 10:00:00+00	8
8507	50	24	2026-07-15 13:00:00+00	8
8508	50	24	2026-07-16 08:00:00+00	8
8509	50	24	2026-07-16 10:00:00+00	8
8510	50	24	2026-07-16 13:00:00+00	8
8511	50	24	2026-07-17 08:00:00+00	8
8512	50	24	2026-07-17 10:00:00+00	8
8513	50	24	2026-07-17 13:00:00+00	8
8514	1	25	2026-06-29 08:00:00+00	8
8515	1	25	2026-06-29 10:00:00+00	8
8516	1	25	2026-06-29 13:00:00+00	8
8517	1	25	2026-06-30 08:00:00+00	8
8518	1	25	2026-06-30 10:00:00+00	8
8519	1	25	2026-06-30 13:00:00+00	8
8520	1	25	2026-07-01 08:00:00+00	8
8521	1	25	2026-07-01 10:00:00+00	8
8522	1	25	2026-07-01 13:00:00+00	8
8523	1	25	2026-07-02 08:00:00+00	8
8524	1	25	2026-07-02 10:00:00+00	8
8525	1	25	2026-07-02 13:00:00+00	8
8526	1	25	2026-07-03 08:00:00+00	8
8527	1	25	2026-07-03 10:00:00+00	8
8528	1	25	2026-07-03 13:00:00+00	8
8529	1	25	2026-07-06 08:00:00+00	8
8530	1	25	2026-07-06 10:00:00+00	8
8531	1	25	2026-07-06 13:00:00+00	8
8532	1	25	2026-07-07 08:00:00+00	8
8533	1	25	2026-07-07 10:00:00+00	8
8534	1	25	2026-07-07 13:00:00+00	8
8535	1	25	2026-07-08 08:00:00+00	8
8536	1	25	2026-07-08 10:00:00+00	8
8537	1	25	2026-07-08 13:00:00+00	8
8538	1	25	2026-07-09 08:00:00+00	8
8539	1	25	2026-07-09 10:00:00+00	8
8540	1	25	2026-07-09 13:00:00+00	8
8541	1	25	2026-07-10 08:00:00+00	8
8542	1	25	2026-07-10 10:00:00+00	8
8543	1	25	2026-07-10 13:00:00+00	8
8544	1	25	2026-07-13 08:00:00+00	8
8545	1	25	2026-07-13 10:00:00+00	8
8546	1	25	2026-07-13 13:00:00+00	8
8547	1	25	2026-07-14 08:00:00+00	8
8548	1	25	2026-07-14 10:00:00+00	8
8549	1	25	2026-07-14 13:00:00+00	8
8550	1	25	2026-07-15 08:00:00+00	8
8551	1	25	2026-07-15 10:00:00+00	8
8552	1	25	2026-07-15 13:00:00+00	8
8553	1	25	2026-07-16 08:00:00+00	8
8554	1	25	2026-07-16 10:00:00+00	8
8555	1	25	2026-07-16 13:00:00+00	8
8556	1	25	2026-07-17 08:00:00+00	8
8557	1	25	2026-07-17 10:00:00+00	8
8558	1	25	2026-07-17 13:00:00+00	8
8559	2	25	2026-06-29 08:00:00+00	8
8560	2	25	2026-06-29 10:00:00+00	8
8561	2	25	2026-06-29 13:00:00+00	8
8562	2	25	2026-06-30 08:00:00+00	8
8563	2	25	2026-06-30 10:00:00+00	8
8564	2	25	2026-06-30 13:00:00+00	8
8565	2	25	2026-07-01 08:00:00+00	8
8566	2	25	2026-07-01 10:00:00+00	8
8567	2	25	2026-07-01 13:00:00+00	8
8568	2	25	2026-07-02 08:00:00+00	8
8569	2	25	2026-07-02 10:00:00+00	8
8570	2	25	2026-07-02 13:00:00+00	8
8571	2	25	2026-07-03 08:00:00+00	8
8572	2	25	2026-07-03 10:00:00+00	8
8573	2	25	2026-07-03 13:00:00+00	8
8574	2	25	2026-07-06 08:00:00+00	8
8575	2	25	2026-07-06 10:00:00+00	8
8576	2	25	2026-07-06 13:00:00+00	8
8577	2	25	2026-07-07 08:00:00+00	8
8578	2	25	2026-07-07 10:00:00+00	8
8579	2	25	2026-07-07 13:00:00+00	8
8580	2	25	2026-07-08 08:00:00+00	8
8581	2	25	2026-07-08 10:00:00+00	8
8582	2	25	2026-07-08 13:00:00+00	8
8583	2	25	2026-07-09 08:00:00+00	8
8584	2	25	2026-07-09 10:00:00+00	8
8585	2	25	2026-07-09 13:00:00+00	8
8586	2	25	2026-07-10 08:00:00+00	8
8587	2	25	2026-07-10 10:00:00+00	8
8588	2	25	2026-07-10 13:00:00+00	8
8589	2	25	2026-07-13 08:00:00+00	8
8590	2	25	2026-07-13 10:00:00+00	8
8591	2	25	2026-07-13 13:00:00+00	8
8592	2	25	2026-07-14 08:00:00+00	8
8593	2	25	2026-07-14 10:00:00+00	8
8594	2	25	2026-07-14 13:00:00+00	8
8595	2	25	2026-07-15 08:00:00+00	8
8596	2	25	2026-07-15 10:00:00+00	8
8597	2	25	2026-07-15 13:00:00+00	8
8598	2	25	2026-07-16 08:00:00+00	8
8599	2	25	2026-07-16 10:00:00+00	8
8600	2	25	2026-07-16 13:00:00+00	8
8601	2	25	2026-07-17 08:00:00+00	8
8602	2	25	2026-07-17 10:00:00+00	8
8603	2	25	2026-07-17 13:00:00+00	8
8604	5	25	2026-06-29 08:00:00+00	8
8605	5	25	2026-06-29 10:00:00+00	8
8606	5	25	2026-06-29 13:00:00+00	8
8607	5	25	2026-06-30 08:00:00+00	8
8608	5	25	2026-06-30 10:00:00+00	8
8609	5	25	2026-06-30 13:00:00+00	8
8610	5	25	2026-07-01 08:00:00+00	8
8611	5	25	2026-07-01 10:00:00+00	8
8612	5	25	2026-07-01 13:00:00+00	8
8613	5	25	2026-07-02 08:00:00+00	8
8614	5	25	2026-07-02 10:00:00+00	8
8615	5	25	2026-07-02 13:00:00+00	8
8616	5	25	2026-07-03 08:00:00+00	8
8617	5	25	2026-07-03 10:00:00+00	8
8618	5	25	2026-07-03 13:00:00+00	8
8619	5	25	2026-07-06 08:00:00+00	8
8620	5	25	2026-07-06 10:00:00+00	8
8621	5	25	2026-07-06 13:00:00+00	8
8622	5	25	2026-07-07 08:00:00+00	8
8623	5	25	2026-07-07 10:00:00+00	8
8624	5	25	2026-07-07 13:00:00+00	8
8625	5	25	2026-07-08 08:00:00+00	8
8626	5	25	2026-07-08 10:00:00+00	8
8627	5	25	2026-07-08 13:00:00+00	8
8628	5	25	2026-07-09 08:00:00+00	8
8629	5	25	2026-07-09 10:00:00+00	8
8630	5	25	2026-07-09 13:00:00+00	8
8631	5	25	2026-07-10 08:00:00+00	8
8632	5	25	2026-07-10 10:00:00+00	8
8633	5	25	2026-07-10 13:00:00+00	8
8634	5	25	2026-07-13 08:00:00+00	8
8635	5	25	2026-07-13 10:00:00+00	8
8636	5	25	2026-07-13 13:00:00+00	8
8637	5	25	2026-07-14 08:00:00+00	8
8638	5	25	2026-07-14 10:00:00+00	8
8639	5	25	2026-07-14 13:00:00+00	8
8640	5	25	2026-07-15 08:00:00+00	8
8641	5	25	2026-07-15 10:00:00+00	8
8642	5	25	2026-07-15 13:00:00+00	8
8643	5	25	2026-07-16 08:00:00+00	8
8644	5	25	2026-07-16 10:00:00+00	8
8645	5	25	2026-07-16 13:00:00+00	8
8646	5	25	2026-07-17 08:00:00+00	8
8647	5	25	2026-07-17 10:00:00+00	8
8648	5	25	2026-07-17 13:00:00+00	8
8649	7	25	2026-06-29 08:00:00+00	8
8650	7	25	2026-06-29 10:00:00+00	8
8651	7	25	2026-06-29 13:00:00+00	8
8652	7	25	2026-06-30 08:00:00+00	8
8653	7	25	2026-06-30 10:00:00+00	8
8654	7	25	2026-06-30 13:00:00+00	8
8655	7	25	2026-07-01 08:00:00+00	8
8656	7	25	2026-07-01 10:00:00+00	8
8657	7	25	2026-07-01 13:00:00+00	8
8658	7	25	2026-07-02 08:00:00+00	8
8659	7	25	2026-07-02 10:00:00+00	8
8660	7	25	2026-07-02 13:00:00+00	8
8661	7	25	2026-07-03 08:00:00+00	8
8662	7	25	2026-07-03 10:00:00+00	8
8663	7	25	2026-07-03 13:00:00+00	8
8664	7	25	2026-07-06 08:00:00+00	8
8665	7	25	2026-07-06 10:00:00+00	8
8666	7	25	2026-07-06 13:00:00+00	8
8667	7	25	2026-07-07 08:00:00+00	8
8668	7	25	2026-07-07 10:00:00+00	8
8669	7	25	2026-07-07 13:00:00+00	8
8670	7	25	2026-07-08 08:00:00+00	8
8671	7	25	2026-07-08 10:00:00+00	8
8672	7	25	2026-07-08 13:00:00+00	8
8673	7	25	2026-07-09 08:00:00+00	8
8674	7	25	2026-07-09 10:00:00+00	8
8675	7	25	2026-07-09 13:00:00+00	8
8676	7	25	2026-07-10 08:00:00+00	8
8677	7	25	2026-07-10 10:00:00+00	8
8678	7	25	2026-07-10 13:00:00+00	8
8679	7	25	2026-07-13 08:00:00+00	8
8680	7	25	2026-07-13 10:00:00+00	8
8681	7	25	2026-07-13 13:00:00+00	8
8682	7	25	2026-07-14 08:00:00+00	8
8683	7	25	2026-07-14 10:00:00+00	8
8684	7	25	2026-07-14 13:00:00+00	8
8685	7	25	2026-07-15 08:00:00+00	8
8686	7	25	2026-07-15 10:00:00+00	8
8687	7	25	2026-07-15 13:00:00+00	8
8688	7	25	2026-07-16 08:00:00+00	8
8689	7	25	2026-07-16 10:00:00+00	8
8690	7	25	2026-07-16 13:00:00+00	8
8691	7	25	2026-07-17 08:00:00+00	8
8692	7	25	2026-07-17 10:00:00+00	8
8693	7	25	2026-07-17 13:00:00+00	8
8694	9	25	2026-06-29 08:00:00+00	8
8695	9	25	2026-06-29 10:00:00+00	8
8696	9	25	2026-06-29 13:00:00+00	8
8697	9	25	2026-06-30 08:00:00+00	8
8698	9	25	2026-06-30 10:00:00+00	8
8699	9	25	2026-06-30 13:00:00+00	8
8700	9	25	2026-07-01 08:00:00+00	8
8701	9	25	2026-07-01 10:00:00+00	8
8702	9	25	2026-07-01 13:00:00+00	8
8703	9	25	2026-07-02 08:00:00+00	8
8704	9	25	2026-07-02 10:00:00+00	8
8705	9	25	2026-07-02 13:00:00+00	8
8706	9	25	2026-07-03 08:00:00+00	8
8707	9	25	2026-07-03 10:00:00+00	8
8708	9	25	2026-07-03 13:00:00+00	8
8709	9	25	2026-07-06 08:00:00+00	8
8710	9	25	2026-07-06 10:00:00+00	8
8711	9	25	2026-07-06 13:00:00+00	8
8712	9	25	2026-07-07 08:00:00+00	8
8713	9	25	2026-07-07 10:00:00+00	8
8714	9	25	2026-07-07 13:00:00+00	8
8715	9	25	2026-07-08 08:00:00+00	8
8716	9	25	2026-07-08 10:00:00+00	8
8717	9	25	2026-07-08 13:00:00+00	8
8718	9	25	2026-07-09 08:00:00+00	8
8719	9	25	2026-07-09 10:00:00+00	8
8720	9	25	2026-07-09 13:00:00+00	8
8721	9	25	2026-07-10 08:00:00+00	8
8722	9	25	2026-07-10 10:00:00+00	8
8723	9	25	2026-07-10 13:00:00+00	8
8724	9	25	2026-07-13 08:00:00+00	8
8725	9	25	2026-07-13 10:00:00+00	8
8726	9	25	2026-07-13 13:00:00+00	8
8727	9	25	2026-07-14 08:00:00+00	8
8728	9	25	2026-07-14 10:00:00+00	8
8729	9	25	2026-07-14 13:00:00+00	8
8730	9	25	2026-07-15 08:00:00+00	8
8731	9	25	2026-07-15 10:00:00+00	8
8732	9	25	2026-07-15 13:00:00+00	8
8733	9	25	2026-07-16 08:00:00+00	8
8734	9	25	2026-07-16 10:00:00+00	8
8735	9	25	2026-07-16 13:00:00+00	8
8736	9	25	2026-07-17 08:00:00+00	8
8737	9	25	2026-07-17 10:00:00+00	8
8738	9	25	2026-07-17 13:00:00+00	8
8739	14	25	2026-06-29 08:00:00+00	8
8740	14	25	2026-06-29 10:00:00+00	8
8741	14	25	2026-06-29 13:00:00+00	8
8742	14	25	2026-06-30 08:00:00+00	8
8743	14	25	2026-06-30 10:00:00+00	8
8744	14	25	2026-06-30 13:00:00+00	8
8745	14	25	2026-07-01 08:00:00+00	8
8746	14	25	2026-07-01 10:00:00+00	8
8747	14	25	2026-07-01 13:00:00+00	8
8748	14	25	2026-07-02 08:00:00+00	8
8749	14	25	2026-07-02 10:00:00+00	8
8750	14	25	2026-07-02 13:00:00+00	8
8751	14	25	2026-07-03 08:00:00+00	8
8752	14	25	2026-07-03 10:00:00+00	8
8753	14	25	2026-07-03 13:00:00+00	8
8754	14	25	2026-07-06 08:00:00+00	8
8755	14	25	2026-07-06 10:00:00+00	8
8756	14	25	2026-07-06 13:00:00+00	8
8757	14	25	2026-07-07 08:00:00+00	8
8758	14	25	2026-07-07 10:00:00+00	8
8759	14	25	2026-07-07 13:00:00+00	8
8760	14	25	2026-07-08 08:00:00+00	8
8761	14	25	2026-07-08 10:00:00+00	8
8762	14	25	2026-07-08 13:00:00+00	8
8763	14	25	2026-07-09 08:00:00+00	8
8764	14	25	2026-07-09 10:00:00+00	8
8765	14	25	2026-07-09 13:00:00+00	8
8766	14	25	2026-07-10 08:00:00+00	8
8767	14	25	2026-07-10 10:00:00+00	8
8768	14	25	2026-07-10 13:00:00+00	8
8769	14	25	2026-07-13 08:00:00+00	8
8770	14	25	2026-07-13 10:00:00+00	8
8771	14	25	2026-07-13 13:00:00+00	8
8772	14	25	2026-07-14 08:00:00+00	8
8773	14	25	2026-07-14 10:00:00+00	8
8774	14	25	2026-07-14 13:00:00+00	8
8775	14	25	2026-07-15 08:00:00+00	8
8776	14	25	2026-07-15 10:00:00+00	8
8777	14	25	2026-07-15 13:00:00+00	8
8778	14	25	2026-07-16 08:00:00+00	8
8779	14	25	2026-07-16 10:00:00+00	8
8780	14	25	2026-07-16 13:00:00+00	8
8781	14	25	2026-07-17 08:00:00+00	8
8782	14	25	2026-07-17 10:00:00+00	8
8783	14	25	2026-07-17 13:00:00+00	8
8784	21	25	2026-06-29 08:00:00+00	8
8785	21	25	2026-06-29 10:00:00+00	8
8786	21	25	2026-06-29 13:00:00+00	8
8787	21	25	2026-06-30 08:00:00+00	8
8788	21	25	2026-06-30 10:00:00+00	8
8789	21	25	2026-06-30 13:00:00+00	8
8790	21	25	2026-07-01 08:00:00+00	8
8791	21	25	2026-07-01 10:00:00+00	8
8792	21	25	2026-07-01 13:00:00+00	8
8793	21	25	2026-07-02 08:00:00+00	8
8794	21	25	2026-07-02 10:00:00+00	8
8795	21	25	2026-07-02 13:00:00+00	8
8796	21	25	2026-07-03 08:00:00+00	8
8797	21	25	2026-07-03 10:00:00+00	8
8798	21	25	2026-07-03 13:00:00+00	8
8799	21	25	2026-07-06 08:00:00+00	8
8800	21	25	2026-07-06 10:00:00+00	8
8801	21	25	2026-07-06 13:00:00+00	8
8802	21	25	2026-07-07 08:00:00+00	8
8803	21	25	2026-07-07 10:00:00+00	8
8804	21	25	2026-07-07 13:00:00+00	8
8805	21	25	2026-07-08 08:00:00+00	8
8806	21	25	2026-07-08 10:00:00+00	8
8807	21	25	2026-07-08 13:00:00+00	8
8808	21	25	2026-07-09 08:00:00+00	8
8809	21	25	2026-07-09 10:00:00+00	8
8810	21	25	2026-07-09 13:00:00+00	8
8811	21	25	2026-07-10 08:00:00+00	8
8812	21	25	2026-07-10 10:00:00+00	8
8813	21	25	2026-07-10 13:00:00+00	8
8814	21	25	2026-07-13 08:00:00+00	8
8815	21	25	2026-07-13 10:00:00+00	8
8816	21	25	2026-07-13 13:00:00+00	8
8817	21	25	2026-07-14 08:00:00+00	8
8818	21	25	2026-07-14 10:00:00+00	8
8819	21	25	2026-07-14 13:00:00+00	8
8820	21	25	2026-07-15 08:00:00+00	8
8821	21	25	2026-07-15 10:00:00+00	8
8822	21	25	2026-07-15 13:00:00+00	8
8823	21	25	2026-07-16 08:00:00+00	8
8824	21	25	2026-07-16 10:00:00+00	8
8825	21	25	2026-07-16 13:00:00+00	8
8826	21	25	2026-07-17 08:00:00+00	8
8827	21	25	2026-07-17 10:00:00+00	8
8828	21	25	2026-07-17 13:00:00+00	8
8829	24	25	2026-06-29 08:00:00+00	8
8830	24	25	2026-06-29 10:00:00+00	8
8831	24	25	2026-06-29 13:00:00+00	8
8832	24	25	2026-06-30 08:00:00+00	8
8833	24	25	2026-06-30 10:00:00+00	8
8834	24	25	2026-06-30 13:00:00+00	8
8835	24	25	2026-07-01 08:00:00+00	8
8836	24	25	2026-07-01 10:00:00+00	8
8837	24	25	2026-07-01 13:00:00+00	8
8838	24	25	2026-07-02 08:00:00+00	8
8839	24	25	2026-07-02 10:00:00+00	8
8840	24	25	2026-07-02 13:00:00+00	8
8841	24	25	2026-07-03 08:00:00+00	8
8842	24	25	2026-07-03 10:00:00+00	8
8843	24	25	2026-07-03 13:00:00+00	8
8844	24	25	2026-07-06 08:00:00+00	8
8845	24	25	2026-07-06 10:00:00+00	8
8846	24	25	2026-07-06 13:00:00+00	8
8847	24	25	2026-07-07 08:00:00+00	8
8848	24	25	2026-07-07 10:00:00+00	8
8849	24	25	2026-07-07 13:00:00+00	8
8850	24	25	2026-07-08 08:00:00+00	8
8851	24	25	2026-07-08 10:00:00+00	8
8852	24	25	2026-07-08 13:00:00+00	8
8853	24	25	2026-07-09 08:00:00+00	8
8854	24	25	2026-07-09 10:00:00+00	8
8855	24	25	2026-07-09 13:00:00+00	8
8856	24	25	2026-07-10 08:00:00+00	8
8857	24	25	2026-07-10 10:00:00+00	8
8858	24	25	2026-07-10 13:00:00+00	8
8859	24	25	2026-07-13 08:00:00+00	8
8860	24	25	2026-07-13 10:00:00+00	8
8861	24	25	2026-07-13 13:00:00+00	8
8862	24	25	2026-07-14 08:00:00+00	8
8863	24	25	2026-07-14 10:00:00+00	8
8864	24	25	2026-07-14 13:00:00+00	8
8865	24	25	2026-07-15 08:00:00+00	8
8866	24	25	2026-07-15 10:00:00+00	8
8867	24	25	2026-07-15 13:00:00+00	8
8868	24	25	2026-07-16 08:00:00+00	8
8869	24	25	2026-07-16 10:00:00+00	8
8870	24	25	2026-07-16 13:00:00+00	8
8871	24	25	2026-07-17 08:00:00+00	8
8872	24	25	2026-07-17 10:00:00+00	8
8873	24	25	2026-07-17 13:00:00+00	8
8874	35	25	2026-06-29 08:00:00+00	8
8875	35	25	2026-06-29 10:00:00+00	8
8876	35	25	2026-06-29 13:00:00+00	8
8877	35	25	2026-06-30 08:00:00+00	8
8878	35	25	2026-06-30 10:00:00+00	8
8879	35	25	2026-06-30 13:00:00+00	8
8880	35	25	2026-07-01 08:00:00+00	8
8881	35	25	2026-07-01 10:00:00+00	8
8882	35	25	2026-07-01 13:00:00+00	8
8883	35	25	2026-07-02 08:00:00+00	8
8884	35	25	2026-07-02 10:00:00+00	8
8885	35	25	2026-07-02 13:00:00+00	8
8886	35	25	2026-07-03 08:00:00+00	8
8887	35	25	2026-07-03 10:00:00+00	8
8888	35	25	2026-07-03 13:00:00+00	8
8889	35	25	2026-07-06 08:00:00+00	8
8890	35	25	2026-07-06 10:00:00+00	8
8891	35	25	2026-07-06 13:00:00+00	8
8892	35	25	2026-07-07 08:00:00+00	8
8893	35	25	2026-07-07 10:00:00+00	8
8894	35	25	2026-07-07 13:00:00+00	8
8895	35	25	2026-07-08 08:00:00+00	8
8896	35	25	2026-07-08 10:00:00+00	8
8897	35	25	2026-07-08 13:00:00+00	8
8898	35	25	2026-07-09 08:00:00+00	8
8899	35	25	2026-07-09 10:00:00+00	8
8900	35	25	2026-07-09 13:00:00+00	8
8901	35	25	2026-07-10 08:00:00+00	8
8902	35	25	2026-07-10 10:00:00+00	8
8903	35	25	2026-07-10 13:00:00+00	8
8904	35	25	2026-07-13 08:00:00+00	8
8905	35	25	2026-07-13 10:00:00+00	8
8906	35	25	2026-07-13 13:00:00+00	8
8907	35	25	2026-07-14 08:00:00+00	8
8908	35	25	2026-07-14 10:00:00+00	8
8909	35	25	2026-07-14 13:00:00+00	8
8910	35	25	2026-07-15 08:00:00+00	8
8911	35	25	2026-07-15 10:00:00+00	8
8912	35	25	2026-07-15 13:00:00+00	8
8913	35	25	2026-07-16 08:00:00+00	8
8914	35	25	2026-07-16 10:00:00+00	8
8915	35	25	2026-07-16 13:00:00+00	8
8916	35	25	2026-07-17 08:00:00+00	8
8917	35	25	2026-07-17 10:00:00+00	8
8918	35	25	2026-07-17 13:00:00+00	8
8919	36	25	2026-06-29 08:00:00+00	8
8920	36	25	2026-06-29 10:00:00+00	8
8921	36	25	2026-06-29 13:00:00+00	8
8922	36	25	2026-06-30 08:00:00+00	8
8923	36	25	2026-06-30 10:00:00+00	8
8924	36	25	2026-06-30 13:00:00+00	8
8925	36	25	2026-07-01 08:00:00+00	8
8926	36	25	2026-07-01 10:00:00+00	8
8927	36	25	2026-07-01 13:00:00+00	8
8928	36	25	2026-07-02 08:00:00+00	8
8929	36	25	2026-07-02 10:00:00+00	8
8930	36	25	2026-07-02 13:00:00+00	8
8931	36	25	2026-07-03 08:00:00+00	8
8932	36	25	2026-07-03 10:00:00+00	8
8933	36	25	2026-07-03 13:00:00+00	8
8934	36	25	2026-07-06 08:00:00+00	8
8935	36	25	2026-07-06 10:00:00+00	8
8936	36	25	2026-07-06 13:00:00+00	8
8937	36	25	2026-07-07 08:00:00+00	8
8938	36	25	2026-07-07 10:00:00+00	8
8939	36	25	2026-07-07 13:00:00+00	8
8940	36	25	2026-07-08 08:00:00+00	8
8941	36	25	2026-07-08 10:00:00+00	8
8942	36	25	2026-07-08 13:00:00+00	8
8943	36	25	2026-07-09 08:00:00+00	8
8944	36	25	2026-07-09 10:00:00+00	8
8945	36	25	2026-07-09 13:00:00+00	8
8946	36	25	2026-07-10 08:00:00+00	8
8947	36	25	2026-07-10 10:00:00+00	8
8948	36	25	2026-07-10 13:00:00+00	8
8949	36	25	2026-07-13 08:00:00+00	8
8950	36	25	2026-07-13 10:00:00+00	8
8951	36	25	2026-07-13 13:00:00+00	8
8952	36	25	2026-07-14 08:00:00+00	8
8953	36	25	2026-07-14 10:00:00+00	8
8954	36	25	2026-07-14 13:00:00+00	8
8955	36	25	2026-07-15 08:00:00+00	8
8956	36	25	2026-07-15 10:00:00+00	8
8957	36	25	2026-07-15 13:00:00+00	8
8958	36	25	2026-07-16 08:00:00+00	8
8959	36	25	2026-07-16 10:00:00+00	8
8960	36	25	2026-07-16 13:00:00+00	8
8961	36	25	2026-07-17 08:00:00+00	8
8962	36	25	2026-07-17 10:00:00+00	8
8963	36	25	2026-07-17 13:00:00+00	8
8964	43	25	2026-06-29 08:00:00+00	8
8965	43	25	2026-06-29 10:00:00+00	8
8966	43	25	2026-06-29 13:00:00+00	8
8967	43	25	2026-06-30 08:00:00+00	8
8968	43	25	2026-06-30 10:00:00+00	8
8969	43	25	2026-06-30 13:00:00+00	8
8970	43	25	2026-07-01 08:00:00+00	8
8971	43	25	2026-07-01 10:00:00+00	8
8972	43	25	2026-07-01 13:00:00+00	8
8973	43	25	2026-07-02 08:00:00+00	8
8974	43	25	2026-07-02 10:00:00+00	8
8975	43	25	2026-07-02 13:00:00+00	8
8976	43	25	2026-07-03 08:00:00+00	8
8977	43	25	2026-07-03 10:00:00+00	8
8978	43	25	2026-07-03 13:00:00+00	8
8979	43	25	2026-07-06 08:00:00+00	8
8980	43	25	2026-07-06 10:00:00+00	8
8981	43	25	2026-07-06 13:00:00+00	8
8982	43	25	2026-07-07 08:00:00+00	8
8983	43	25	2026-07-07 10:00:00+00	8
8984	43	25	2026-07-07 13:00:00+00	8
8985	43	25	2026-07-08 08:00:00+00	8
8986	43	25	2026-07-08 10:00:00+00	8
8987	43	25	2026-07-08 13:00:00+00	8
8988	43	25	2026-07-09 08:00:00+00	8
8989	43	25	2026-07-09 10:00:00+00	8
8990	43	25	2026-07-09 13:00:00+00	8
8991	43	25	2026-07-10 08:00:00+00	8
8992	43	25	2026-07-10 10:00:00+00	8
8993	43	25	2026-07-10 13:00:00+00	8
8994	43	25	2026-07-13 08:00:00+00	8
8995	43	25	2026-07-13 10:00:00+00	8
8996	43	25	2026-07-13 13:00:00+00	8
8997	43	25	2026-07-14 08:00:00+00	8
8998	43	25	2026-07-14 10:00:00+00	8
8999	43	25	2026-07-14 13:00:00+00	8
9000	43	25	2026-07-15 08:00:00+00	8
9001	43	25	2026-07-15 10:00:00+00	8
9002	43	25	2026-07-15 13:00:00+00	8
9003	43	25	2026-07-16 08:00:00+00	8
9004	43	25	2026-07-16 10:00:00+00	8
9005	43	25	2026-07-16 13:00:00+00	8
9006	43	25	2026-07-17 08:00:00+00	8
9007	43	25	2026-07-17 10:00:00+00	8
9008	43	25	2026-07-17 13:00:00+00	8
9009	46	25	2026-06-29 08:00:00+00	8
9010	46	25	2026-06-29 10:00:00+00	8
9011	46	25	2026-06-29 13:00:00+00	8
9012	46	25	2026-06-30 08:00:00+00	8
9013	46	25	2026-06-30 10:00:00+00	8
9014	46	25	2026-06-30 13:00:00+00	8
9015	46	25	2026-07-01 08:00:00+00	8
9016	46	25	2026-07-01 10:00:00+00	8
9017	46	25	2026-07-01 13:00:00+00	8
9018	46	25	2026-07-02 08:00:00+00	8
9019	46	25	2026-07-02 10:00:00+00	8
9020	46	25	2026-07-02 13:00:00+00	8
9021	46	25	2026-07-03 08:00:00+00	8
9022	46	25	2026-07-03 10:00:00+00	8
9023	46	25	2026-07-03 13:00:00+00	8
9024	46	25	2026-07-06 08:00:00+00	8
9025	46	25	2026-07-06 10:00:00+00	8
9026	46	25	2026-07-06 13:00:00+00	8
9027	46	25	2026-07-07 08:00:00+00	8
9028	46	25	2026-07-07 10:00:00+00	8
9029	46	25	2026-07-07 13:00:00+00	8
9030	46	25	2026-07-08 08:00:00+00	8
9031	46	25	2026-07-08 10:00:00+00	8
9032	46	25	2026-07-08 13:00:00+00	8
9033	46	25	2026-07-09 08:00:00+00	8
9034	46	25	2026-07-09 10:00:00+00	8
9035	46	25	2026-07-09 13:00:00+00	8
9036	46	25	2026-07-10 08:00:00+00	8
9037	46	25	2026-07-10 10:00:00+00	8
9038	46	25	2026-07-10 13:00:00+00	8
9039	46	25	2026-07-13 08:00:00+00	8
9040	46	25	2026-07-13 10:00:00+00	8
9041	46	25	2026-07-13 13:00:00+00	8
9042	46	25	2026-07-14 08:00:00+00	8
9043	46	25	2026-07-14 10:00:00+00	8
9044	46	25	2026-07-14 13:00:00+00	8
9045	46	25	2026-07-15 08:00:00+00	8
9046	46	25	2026-07-15 10:00:00+00	8
9047	46	25	2026-07-15 13:00:00+00	8
9048	46	25	2026-07-16 08:00:00+00	8
9049	46	25	2026-07-16 10:00:00+00	8
9050	46	25	2026-07-16 13:00:00+00	8
9051	46	25	2026-07-17 08:00:00+00	8
9052	46	25	2026-07-17 10:00:00+00	8
9053	46	25	2026-07-17 13:00:00+00	8
9054	50	25	2026-06-29 08:00:00+00	8
9055	50	25	2026-06-29 10:00:00+00	8
9056	50	25	2026-06-29 13:00:00+00	8
9057	50	25	2026-06-30 08:00:00+00	8
9058	50	25	2026-06-30 10:00:00+00	8
9059	50	25	2026-06-30 13:00:00+00	8
9060	50	25	2026-07-01 08:00:00+00	8
9061	50	25	2026-07-01 10:00:00+00	8
9062	50	25	2026-07-01 13:00:00+00	8
9063	50	25	2026-07-02 08:00:00+00	8
9064	50	25	2026-07-02 10:00:00+00	8
9065	50	25	2026-07-02 13:00:00+00	8
9066	50	25	2026-07-03 08:00:00+00	8
9067	50	25	2026-07-03 10:00:00+00	8
9068	50	25	2026-07-03 13:00:00+00	8
9069	50	25	2026-07-06 08:00:00+00	8
9070	50	25	2026-07-06 10:00:00+00	8
9071	50	25	2026-07-06 13:00:00+00	8
9072	50	25	2026-07-07 08:00:00+00	8
9073	50	25	2026-07-07 10:00:00+00	8
9074	50	25	2026-07-07 13:00:00+00	8
9075	50	25	2026-07-08 08:00:00+00	8
9076	50	25	2026-07-08 10:00:00+00	8
9077	50	25	2026-07-08 13:00:00+00	8
9078	50	25	2026-07-09 08:00:00+00	8
9079	50	25	2026-07-09 10:00:00+00	8
9080	50	25	2026-07-09 13:00:00+00	8
9081	50	25	2026-07-10 08:00:00+00	8
9082	50	25	2026-07-10 10:00:00+00	8
9083	50	25	2026-07-10 13:00:00+00	8
9084	50	25	2026-07-13 08:00:00+00	8
9085	50	25	2026-07-13 10:00:00+00	8
9086	50	25	2026-07-13 13:00:00+00	8
9087	50	25	2026-07-14 08:00:00+00	8
9088	50	25	2026-07-14 10:00:00+00	8
9089	50	25	2026-07-14 13:00:00+00	8
9090	50	25	2026-07-15 08:00:00+00	8
9091	50	25	2026-07-15 10:00:00+00	8
9092	50	25	2026-07-15 13:00:00+00	8
9093	50	25	2026-07-16 08:00:00+00	8
9094	50	25	2026-07-16 10:00:00+00	8
9095	50	25	2026-07-16 13:00:00+00	8
9096	50	25	2026-07-17 08:00:00+00	8
9097	50	25	2026-07-17 10:00:00+00	8
9098	50	25	2026-07-17 13:00:00+00	8
9099	3	17	2026-06-29 09:00:00+00	8
9100	3	17	2026-06-29 14:00:00+00	8
9101	3	17	2026-06-30 09:00:00+00	8
9102	3	17	2026-06-30 14:00:00+00	8
9103	3	17	2026-07-01 09:00:00+00	8
9104	3	17	2026-07-01 14:00:00+00	8
9105	3	17	2026-07-02 09:00:00+00	8
9106	3	17	2026-07-02 14:00:00+00	8
9107	3	17	2026-07-03 09:00:00+00	8
9108	3	17	2026-07-03 14:00:00+00	8
9109	3	17	2026-07-06 09:00:00+00	8
9110	3	17	2026-07-06 14:00:00+00	8
9111	3	17	2026-07-07 09:00:00+00	8
9112	3	17	2026-07-07 14:00:00+00	8
9113	3	17	2026-07-08 09:00:00+00	8
9114	3	17	2026-07-08 14:00:00+00	8
9115	3	17	2026-07-09 09:00:00+00	8
9116	3	17	2026-07-09 14:00:00+00	8
9117	3	17	2026-07-10 09:00:00+00	8
9118	3	17	2026-07-10 14:00:00+00	8
9119	4	17	2026-06-29 09:00:00+00	8
9120	4	17	2026-06-29 14:00:00+00	8
9121	4	17	2026-06-30 09:00:00+00	8
9122	4	17	2026-06-30 14:00:00+00	8
9123	4	17	2026-07-01 09:00:00+00	8
9124	4	17	2026-07-01 14:00:00+00	8
9125	4	17	2026-07-02 09:00:00+00	8
9126	4	17	2026-07-02 14:00:00+00	8
9127	4	17	2026-07-03 09:00:00+00	8
9128	4	17	2026-07-03 14:00:00+00	8
9129	4	17	2026-07-06 09:00:00+00	8
9130	4	17	2026-07-06 14:00:00+00	8
9131	4	17	2026-07-07 09:00:00+00	8
9132	4	17	2026-07-07 14:00:00+00	8
9133	4	17	2026-07-08 09:00:00+00	8
9134	4	17	2026-07-08 14:00:00+00	8
9135	4	17	2026-07-09 09:00:00+00	8
9136	4	17	2026-07-09 14:00:00+00	8
9137	4	17	2026-07-10 09:00:00+00	8
9138	4	17	2026-07-10 14:00:00+00	8
9139	6	17	2026-06-29 09:00:00+00	8
9140	6	17	2026-06-29 14:00:00+00	8
9141	6	17	2026-06-30 09:00:00+00	8
9142	6	17	2026-06-30 14:00:00+00	8
9143	6	17	2026-07-01 09:00:00+00	8
9144	6	17	2026-07-01 14:00:00+00	8
9145	6	17	2026-07-02 09:00:00+00	8
9146	6	17	2026-07-02 14:00:00+00	8
9147	6	17	2026-07-03 09:00:00+00	8
9148	6	17	2026-07-03 14:00:00+00	8
9149	6	17	2026-07-06 09:00:00+00	8
9150	6	17	2026-07-06 14:00:00+00	8
9151	6	17	2026-07-07 09:00:00+00	8
9152	6	17	2026-07-07 14:00:00+00	8
9153	6	17	2026-07-08 09:00:00+00	8
9154	6	17	2026-07-08 14:00:00+00	8
9155	6	17	2026-07-09 09:00:00+00	8
9156	6	17	2026-07-09 14:00:00+00	8
9157	6	17	2026-07-10 09:00:00+00	8
9158	6	17	2026-07-10 14:00:00+00	8
9159	8	17	2026-06-29 09:00:00+00	8
9160	8	17	2026-06-29 14:00:00+00	8
9161	8	17	2026-06-30 09:00:00+00	8
9162	8	17	2026-06-30 14:00:00+00	8
9163	8	17	2026-07-01 09:00:00+00	8
9164	8	17	2026-07-01 14:00:00+00	8
9165	8	17	2026-07-02 09:00:00+00	8
9166	8	17	2026-07-02 14:00:00+00	8
9167	8	17	2026-07-03 09:00:00+00	8
9168	8	17	2026-07-03 14:00:00+00	8
9169	8	17	2026-07-06 09:00:00+00	8
9170	8	17	2026-07-06 14:00:00+00	8
9171	8	17	2026-07-07 09:00:00+00	8
9172	8	17	2026-07-07 14:00:00+00	8
9173	8	17	2026-07-08 09:00:00+00	8
9174	8	17	2026-07-08 14:00:00+00	8
9175	8	17	2026-07-09 09:00:00+00	8
9176	8	17	2026-07-09 14:00:00+00	8
9177	8	17	2026-07-10 09:00:00+00	8
9178	8	17	2026-07-10 14:00:00+00	8
9179	10	17	2026-06-29 09:00:00+00	8
9180	10	17	2026-06-29 14:00:00+00	8
9181	10	17	2026-06-30 09:00:00+00	8
9182	10	17	2026-06-30 14:00:00+00	8
9183	10	17	2026-07-01 09:00:00+00	8
9184	10	17	2026-07-01 14:00:00+00	8
9185	10	17	2026-07-02 09:00:00+00	8
9186	10	17	2026-07-02 14:00:00+00	8
9187	10	17	2026-07-03 09:00:00+00	8
9188	10	17	2026-07-03 14:00:00+00	8
9189	10	17	2026-07-06 09:00:00+00	8
9190	10	17	2026-07-06 14:00:00+00	8
9191	10	17	2026-07-07 09:00:00+00	8
9192	10	17	2026-07-07 14:00:00+00	8
9193	10	17	2026-07-08 09:00:00+00	8
9194	10	17	2026-07-08 14:00:00+00	8
9195	10	17	2026-07-09 09:00:00+00	8
9196	10	17	2026-07-09 14:00:00+00	8
9197	10	17	2026-07-10 09:00:00+00	8
9198	10	17	2026-07-10 14:00:00+00	8
9199	11	17	2026-06-29 09:00:00+00	8
9200	11	17	2026-06-29 14:00:00+00	8
9201	11	17	2026-06-30 09:00:00+00	8
9202	11	17	2026-06-30 14:00:00+00	8
9203	11	17	2026-07-01 09:00:00+00	8
9204	11	17	2026-07-01 14:00:00+00	8
9205	11	17	2026-07-02 09:00:00+00	8
9206	11	17	2026-07-02 14:00:00+00	8
9207	11	17	2026-07-03 09:00:00+00	8
9208	11	17	2026-07-03 14:00:00+00	8
9209	11	17	2026-07-06 09:00:00+00	8
9210	11	17	2026-07-06 14:00:00+00	8
9211	11	17	2026-07-07 09:00:00+00	8
9212	11	17	2026-07-07 14:00:00+00	8
9213	11	17	2026-07-08 09:00:00+00	8
9214	11	17	2026-07-08 14:00:00+00	8
9215	11	17	2026-07-09 09:00:00+00	8
9216	11	17	2026-07-09 14:00:00+00	8
9217	11	17	2026-07-10 09:00:00+00	8
9218	11	17	2026-07-10 14:00:00+00	8
9219	12	17	2026-06-29 09:00:00+00	8
9220	12	17	2026-06-29 14:00:00+00	8
9221	12	17	2026-06-30 09:00:00+00	8
9222	12	17	2026-06-30 14:00:00+00	8
9223	12	17	2026-07-01 09:00:00+00	8
9224	12	17	2026-07-01 14:00:00+00	8
9225	12	17	2026-07-02 09:00:00+00	8
9226	12	17	2026-07-02 14:00:00+00	8
9227	12	17	2026-07-03 09:00:00+00	8
9228	12	17	2026-07-03 14:00:00+00	8
9229	12	17	2026-07-06 09:00:00+00	8
9230	12	17	2026-07-06 14:00:00+00	8
9231	12	17	2026-07-07 09:00:00+00	8
9232	12	17	2026-07-07 14:00:00+00	8
9233	12	17	2026-07-08 09:00:00+00	8
9234	12	17	2026-07-08 14:00:00+00	8
9235	12	17	2026-07-09 09:00:00+00	8
9236	12	17	2026-07-09 14:00:00+00	8
9237	12	17	2026-07-10 09:00:00+00	8
9238	12	17	2026-07-10 14:00:00+00	8
9239	13	17	2026-06-29 09:00:00+00	8
9240	13	17	2026-06-29 14:00:00+00	8
9241	13	17	2026-06-30 09:00:00+00	8
9242	13	17	2026-06-30 14:00:00+00	8
9243	13	17	2026-07-01 09:00:00+00	8
9244	13	17	2026-07-01 14:00:00+00	8
9245	13	17	2026-07-02 09:00:00+00	8
9246	13	17	2026-07-02 14:00:00+00	8
9247	13	17	2026-07-03 09:00:00+00	8
9248	13	17	2026-07-03 14:00:00+00	8
9249	13	17	2026-07-06 09:00:00+00	8
9250	13	17	2026-07-06 14:00:00+00	8
9251	13	17	2026-07-07 09:00:00+00	8
9252	13	17	2026-07-07 14:00:00+00	8
9253	13	17	2026-07-08 09:00:00+00	8
9254	13	17	2026-07-08 14:00:00+00	8
9255	13	17	2026-07-09 09:00:00+00	8
9256	13	17	2026-07-09 14:00:00+00	8
9257	13	17	2026-07-10 09:00:00+00	8
9258	13	17	2026-07-10 14:00:00+00	8
9259	15	17	2026-06-29 09:00:00+00	8
9260	15	17	2026-06-29 14:00:00+00	8
9261	15	17	2026-06-30 09:00:00+00	8
9262	15	17	2026-06-30 14:00:00+00	8
9263	15	17	2026-07-01 09:00:00+00	8
9264	15	17	2026-07-01 14:00:00+00	8
9265	15	17	2026-07-02 09:00:00+00	8
9266	15	17	2026-07-02 14:00:00+00	8
9267	15	17	2026-07-03 09:00:00+00	8
9268	15	17	2026-07-03 14:00:00+00	8
9269	15	17	2026-07-06 09:00:00+00	8
9270	15	17	2026-07-06 14:00:00+00	8
9271	15	17	2026-07-07 09:00:00+00	8
9272	15	17	2026-07-07 14:00:00+00	8
9273	15	17	2026-07-08 09:00:00+00	8
9274	15	17	2026-07-08 14:00:00+00	8
9275	15	17	2026-07-09 09:00:00+00	8
9276	15	17	2026-07-09 14:00:00+00	8
9277	15	17	2026-07-10 09:00:00+00	8
9278	15	17	2026-07-10 14:00:00+00	8
9279	16	17	2026-06-29 09:00:00+00	8
9280	16	17	2026-06-29 14:00:00+00	8
9281	16	17	2026-06-30 09:00:00+00	8
9282	16	17	2026-06-30 14:00:00+00	8
9283	16	17	2026-07-01 09:00:00+00	8
9284	16	17	2026-07-01 14:00:00+00	8
9285	16	17	2026-07-02 09:00:00+00	8
9286	16	17	2026-07-02 14:00:00+00	8
9287	16	17	2026-07-03 09:00:00+00	8
9288	16	17	2026-07-03 14:00:00+00	8
9289	16	17	2026-07-06 09:00:00+00	8
9290	16	17	2026-07-06 14:00:00+00	8
9291	16	17	2026-07-07 09:00:00+00	8
9292	16	17	2026-07-07 14:00:00+00	8
9293	16	17	2026-07-08 09:00:00+00	8
9294	16	17	2026-07-08 14:00:00+00	8
9295	16	17	2026-07-09 09:00:00+00	8
9296	16	17	2026-07-09 14:00:00+00	8
9297	16	17	2026-07-10 09:00:00+00	8
9298	16	17	2026-07-10 14:00:00+00	8
9299	17	17	2026-06-29 09:00:00+00	8
9300	17	17	2026-06-29 14:00:00+00	8
9301	17	17	2026-06-30 09:00:00+00	8
9302	17	17	2026-06-30 14:00:00+00	8
9303	17	17	2026-07-01 09:00:00+00	8
9304	17	17	2026-07-01 14:00:00+00	8
9305	17	17	2026-07-02 09:00:00+00	8
9306	17	17	2026-07-02 14:00:00+00	8
9307	17	17	2026-07-03 09:00:00+00	8
9308	17	17	2026-07-03 14:00:00+00	8
9309	17	17	2026-07-06 09:00:00+00	8
9310	17	17	2026-07-06 14:00:00+00	8
9311	17	17	2026-07-07 09:00:00+00	8
9312	17	17	2026-07-07 14:00:00+00	8
9313	17	17	2026-07-08 09:00:00+00	8
9314	17	17	2026-07-08 14:00:00+00	8
9315	17	17	2026-07-09 09:00:00+00	8
9316	17	17	2026-07-09 14:00:00+00	8
9317	17	17	2026-07-10 09:00:00+00	8
9318	17	17	2026-07-10 14:00:00+00	8
9319	18	17	2026-06-29 09:00:00+00	8
9320	18	17	2026-06-29 14:00:00+00	8
9321	18	17	2026-06-30 09:00:00+00	8
9322	18	17	2026-06-30 14:00:00+00	8
9323	18	17	2026-07-01 09:00:00+00	8
9324	18	17	2026-07-01 14:00:00+00	8
9325	18	17	2026-07-02 09:00:00+00	8
9326	18	17	2026-07-02 14:00:00+00	8
9327	18	17	2026-07-03 09:00:00+00	8
9328	18	17	2026-07-03 14:00:00+00	8
9329	18	17	2026-07-06 09:00:00+00	8
9330	18	17	2026-07-06 14:00:00+00	8
9331	18	17	2026-07-07 09:00:00+00	8
9332	18	17	2026-07-07 14:00:00+00	8
9333	18	17	2026-07-08 09:00:00+00	8
9334	18	17	2026-07-08 14:00:00+00	8
9335	18	17	2026-07-09 09:00:00+00	8
9336	18	17	2026-07-09 14:00:00+00	8
9337	18	17	2026-07-10 09:00:00+00	8
9338	18	17	2026-07-10 14:00:00+00	8
9339	19	17	2026-06-29 09:00:00+00	8
9340	19	17	2026-06-29 14:00:00+00	8
9341	19	17	2026-06-30 09:00:00+00	8
9342	19	17	2026-06-30 14:00:00+00	8
9343	19	17	2026-07-01 09:00:00+00	8
9344	19	17	2026-07-01 14:00:00+00	8
9345	19	17	2026-07-02 09:00:00+00	8
9346	19	17	2026-07-02 14:00:00+00	8
9347	19	17	2026-07-03 09:00:00+00	8
9348	19	17	2026-07-03 14:00:00+00	8
9349	19	17	2026-07-06 09:00:00+00	8
9350	19	17	2026-07-06 14:00:00+00	8
9351	19	17	2026-07-07 09:00:00+00	8
9352	19	17	2026-07-07 14:00:00+00	8
9353	19	17	2026-07-08 09:00:00+00	8
9354	19	17	2026-07-08 14:00:00+00	8
9355	19	17	2026-07-09 09:00:00+00	8
9356	19	17	2026-07-09 14:00:00+00	8
9357	19	17	2026-07-10 09:00:00+00	8
9358	19	17	2026-07-10 14:00:00+00	8
9359	20	17	2026-06-29 09:00:00+00	8
9360	20	17	2026-06-29 14:00:00+00	8
9361	20	17	2026-06-30 09:00:00+00	8
9362	20	17	2026-06-30 14:00:00+00	8
9363	20	17	2026-07-01 09:00:00+00	8
9364	20	17	2026-07-01 14:00:00+00	8
9365	20	17	2026-07-02 09:00:00+00	8
9366	20	17	2026-07-02 14:00:00+00	8
9367	20	17	2026-07-03 09:00:00+00	8
9368	20	17	2026-07-03 14:00:00+00	8
9369	20	17	2026-07-06 09:00:00+00	8
9370	20	17	2026-07-06 14:00:00+00	8
9371	20	17	2026-07-07 09:00:00+00	8
9372	20	17	2026-07-07 14:00:00+00	8
9373	20	17	2026-07-08 09:00:00+00	8
9374	20	17	2026-07-08 14:00:00+00	8
9375	20	17	2026-07-09 09:00:00+00	8
9376	20	17	2026-07-09 14:00:00+00	8
9377	20	17	2026-07-10 09:00:00+00	8
9378	20	17	2026-07-10 14:00:00+00	8
9379	22	17	2026-06-29 09:00:00+00	8
9380	22	17	2026-06-29 14:00:00+00	8
9381	22	17	2026-06-30 09:00:00+00	8
9382	22	17	2026-06-30 14:00:00+00	8
9383	22	17	2026-07-01 09:00:00+00	8
9384	22	17	2026-07-01 14:00:00+00	8
9385	22	17	2026-07-02 09:00:00+00	8
9386	22	17	2026-07-02 14:00:00+00	8
9387	22	17	2026-07-03 09:00:00+00	8
9388	22	17	2026-07-03 14:00:00+00	8
9389	22	17	2026-07-06 09:00:00+00	8
9390	22	17	2026-07-06 14:00:00+00	8
9391	22	17	2026-07-07 09:00:00+00	8
9392	22	17	2026-07-07 14:00:00+00	8
9393	22	17	2026-07-08 09:00:00+00	8
9394	22	17	2026-07-08 14:00:00+00	8
9395	22	17	2026-07-09 09:00:00+00	8
9396	22	17	2026-07-09 14:00:00+00	8
9397	22	17	2026-07-10 09:00:00+00	8
9398	22	17	2026-07-10 14:00:00+00	8
9399	23	17	2026-06-29 09:00:00+00	8
9400	23	17	2026-06-29 14:00:00+00	8
9401	23	17	2026-06-30 09:00:00+00	8
9402	23	17	2026-06-30 14:00:00+00	8
9403	23	17	2026-07-01 09:00:00+00	8
9404	23	17	2026-07-01 14:00:00+00	8
9405	23	17	2026-07-02 09:00:00+00	8
9406	23	17	2026-07-02 14:00:00+00	8
9407	23	17	2026-07-03 09:00:00+00	8
9408	23	17	2026-07-03 14:00:00+00	8
9409	23	17	2026-07-06 09:00:00+00	8
9410	23	17	2026-07-06 14:00:00+00	8
9411	23	17	2026-07-07 09:00:00+00	8
9412	23	17	2026-07-07 14:00:00+00	8
9413	23	17	2026-07-08 09:00:00+00	8
9414	23	17	2026-07-08 14:00:00+00	8
9415	23	17	2026-07-09 09:00:00+00	8
9416	23	17	2026-07-09 14:00:00+00	8
9417	23	17	2026-07-10 09:00:00+00	8
9418	23	17	2026-07-10 14:00:00+00	8
9419	25	17	2026-06-29 09:00:00+00	8
9420	25	17	2026-06-29 14:00:00+00	8
9421	25	17	2026-06-30 09:00:00+00	8
9422	25	17	2026-06-30 14:00:00+00	8
9423	25	17	2026-07-01 09:00:00+00	8
9424	25	17	2026-07-01 14:00:00+00	8
9425	25	17	2026-07-02 09:00:00+00	8
9426	25	17	2026-07-02 14:00:00+00	8
9427	25	17	2026-07-03 09:00:00+00	8
9428	25	17	2026-07-03 14:00:00+00	8
9429	25	17	2026-07-06 09:00:00+00	8
9430	25	17	2026-07-06 14:00:00+00	8
9431	25	17	2026-07-07 09:00:00+00	8
9432	25	17	2026-07-07 14:00:00+00	8
9433	25	17	2026-07-08 09:00:00+00	8
9434	25	17	2026-07-08 14:00:00+00	8
9435	25	17	2026-07-09 09:00:00+00	8
9436	25	17	2026-07-09 14:00:00+00	8
9437	25	17	2026-07-10 09:00:00+00	8
9438	25	17	2026-07-10 14:00:00+00	8
9439	26	17	2026-06-29 09:00:00+00	8
9440	26	17	2026-06-29 14:00:00+00	8
9441	26	17	2026-06-30 09:00:00+00	8
9442	26	17	2026-06-30 14:00:00+00	8
9443	26	17	2026-07-01 09:00:00+00	8
9444	26	17	2026-07-01 14:00:00+00	8
9445	26	17	2026-07-02 09:00:00+00	8
9446	26	17	2026-07-02 14:00:00+00	8
9447	26	17	2026-07-03 09:00:00+00	8
9448	26	17	2026-07-03 14:00:00+00	8
9449	26	17	2026-07-06 09:00:00+00	8
9450	26	17	2026-07-06 14:00:00+00	8
9451	26	17	2026-07-07 09:00:00+00	8
9452	26	17	2026-07-07 14:00:00+00	8
9453	26	17	2026-07-08 09:00:00+00	8
9454	26	17	2026-07-08 14:00:00+00	8
9455	26	17	2026-07-09 09:00:00+00	8
9456	26	17	2026-07-09 14:00:00+00	8
9457	26	17	2026-07-10 09:00:00+00	8
9458	26	17	2026-07-10 14:00:00+00	8
9459	27	17	2026-06-29 09:00:00+00	8
9460	27	17	2026-06-29 14:00:00+00	8
9461	27	17	2026-06-30 09:00:00+00	8
9462	27	17	2026-06-30 14:00:00+00	8
9463	27	17	2026-07-01 09:00:00+00	8
9464	27	17	2026-07-01 14:00:00+00	8
9465	27	17	2026-07-02 09:00:00+00	8
9466	27	17	2026-07-02 14:00:00+00	8
9467	27	17	2026-07-03 09:00:00+00	8
9468	27	17	2026-07-03 14:00:00+00	8
9469	27	17	2026-07-06 09:00:00+00	8
9470	27	17	2026-07-06 14:00:00+00	8
9471	27	17	2026-07-07 09:00:00+00	8
9472	27	17	2026-07-07 14:00:00+00	8
9473	27	17	2026-07-08 09:00:00+00	8
9474	27	17	2026-07-08 14:00:00+00	8
9475	27	17	2026-07-09 09:00:00+00	8
9476	27	17	2026-07-09 14:00:00+00	8
9477	27	17	2026-07-10 09:00:00+00	8
9478	27	17	2026-07-10 14:00:00+00	8
9479	28	17	2026-06-29 09:00:00+00	8
9480	28	17	2026-06-29 14:00:00+00	8
9481	28	17	2026-06-30 09:00:00+00	8
9482	28	17	2026-06-30 14:00:00+00	8
9483	28	17	2026-07-01 09:00:00+00	8
9484	28	17	2026-07-01 14:00:00+00	8
9485	28	17	2026-07-02 09:00:00+00	8
9486	28	17	2026-07-02 14:00:00+00	8
9487	28	17	2026-07-03 09:00:00+00	8
9488	28	17	2026-07-03 14:00:00+00	8
9489	28	17	2026-07-06 09:00:00+00	8
9490	28	17	2026-07-06 14:00:00+00	8
9491	28	17	2026-07-07 09:00:00+00	8
9492	28	17	2026-07-07 14:00:00+00	8
9493	28	17	2026-07-08 09:00:00+00	8
9494	28	17	2026-07-08 14:00:00+00	8
9495	28	17	2026-07-09 09:00:00+00	8
9496	28	17	2026-07-09 14:00:00+00	8
9497	28	17	2026-07-10 09:00:00+00	8
9498	28	17	2026-07-10 14:00:00+00	8
9499	29	17	2026-06-29 09:00:00+00	8
9500	29	17	2026-06-29 14:00:00+00	8
9501	29	17	2026-06-30 09:00:00+00	8
9502	29	17	2026-06-30 14:00:00+00	8
9503	29	17	2026-07-01 09:00:00+00	8
9504	29	17	2026-07-01 14:00:00+00	8
9505	29	17	2026-07-02 09:00:00+00	8
9506	29	17	2026-07-02 14:00:00+00	8
9507	29	17	2026-07-03 09:00:00+00	8
9508	29	17	2026-07-03 14:00:00+00	8
9509	29	17	2026-07-06 09:00:00+00	8
9510	29	17	2026-07-06 14:00:00+00	8
9511	29	17	2026-07-07 09:00:00+00	8
9512	29	17	2026-07-07 14:00:00+00	8
9513	29	17	2026-07-08 09:00:00+00	8
9514	29	17	2026-07-08 14:00:00+00	8
9515	29	17	2026-07-09 09:00:00+00	8
9516	29	17	2026-07-09 14:00:00+00	8
9517	29	17	2026-07-10 09:00:00+00	8
9518	29	17	2026-07-10 14:00:00+00	8
9519	30	17	2026-06-29 09:00:00+00	8
9520	30	17	2026-06-29 14:00:00+00	8
9521	30	17	2026-06-30 09:00:00+00	8
9522	30	17	2026-06-30 14:00:00+00	8
9523	30	17	2026-07-01 09:00:00+00	8
9524	30	17	2026-07-01 14:00:00+00	8
9525	30	17	2026-07-02 09:00:00+00	8
9526	30	17	2026-07-02 14:00:00+00	8
9527	30	17	2026-07-03 09:00:00+00	8
9528	30	17	2026-07-03 14:00:00+00	8
9529	30	17	2026-07-06 09:00:00+00	8
9530	30	17	2026-07-06 14:00:00+00	8
9531	30	17	2026-07-07 09:00:00+00	8
9532	30	17	2026-07-07 14:00:00+00	8
9533	30	17	2026-07-08 09:00:00+00	8
9534	30	17	2026-07-08 14:00:00+00	8
9535	30	17	2026-07-09 09:00:00+00	8
9536	30	17	2026-07-09 14:00:00+00	8
9537	30	17	2026-07-10 09:00:00+00	8
9538	30	17	2026-07-10 14:00:00+00	8
9539	31	17	2026-06-29 09:00:00+00	8
9540	31	17	2026-06-29 14:00:00+00	8
9541	31	17	2026-06-30 09:00:00+00	8
9542	31	17	2026-06-30 14:00:00+00	8
9543	31	17	2026-07-01 09:00:00+00	8
9544	31	17	2026-07-01 14:00:00+00	8
9545	31	17	2026-07-02 09:00:00+00	8
9546	31	17	2026-07-02 14:00:00+00	8
9547	31	17	2026-07-03 09:00:00+00	8
9548	31	17	2026-07-03 14:00:00+00	8
9549	31	17	2026-07-06 09:00:00+00	8
9550	31	17	2026-07-06 14:00:00+00	8
9551	31	17	2026-07-07 09:00:00+00	8
9552	31	17	2026-07-07 14:00:00+00	8
9553	31	17	2026-07-08 09:00:00+00	8
9554	31	17	2026-07-08 14:00:00+00	8
9555	31	17	2026-07-09 09:00:00+00	8
9556	31	17	2026-07-09 14:00:00+00	8
9557	31	17	2026-07-10 09:00:00+00	8
9558	31	17	2026-07-10 14:00:00+00	8
9559	32	17	2026-06-29 09:00:00+00	8
9560	32	17	2026-06-29 14:00:00+00	8
9561	32	17	2026-06-30 09:00:00+00	8
9562	32	17	2026-06-30 14:00:00+00	8
9563	32	17	2026-07-01 09:00:00+00	8
9564	32	17	2026-07-01 14:00:00+00	8
9565	32	17	2026-07-02 09:00:00+00	8
9566	32	17	2026-07-02 14:00:00+00	8
9567	32	17	2026-07-03 09:00:00+00	8
9568	32	17	2026-07-03 14:00:00+00	8
9569	32	17	2026-07-06 09:00:00+00	8
9570	32	17	2026-07-06 14:00:00+00	8
9571	32	17	2026-07-07 09:00:00+00	8
9572	32	17	2026-07-07 14:00:00+00	8
9573	32	17	2026-07-08 09:00:00+00	8
9574	32	17	2026-07-08 14:00:00+00	8
9575	32	17	2026-07-09 09:00:00+00	8
9576	32	17	2026-07-09 14:00:00+00	8
9577	32	17	2026-07-10 09:00:00+00	8
9578	32	17	2026-07-10 14:00:00+00	8
9579	33	17	2026-06-29 09:00:00+00	8
9580	33	17	2026-06-29 14:00:00+00	8
9581	33	17	2026-06-30 09:00:00+00	8
9582	33	17	2026-06-30 14:00:00+00	8
9583	33	17	2026-07-01 09:00:00+00	8
9584	33	17	2026-07-01 14:00:00+00	8
9585	33	17	2026-07-02 09:00:00+00	8
9586	33	17	2026-07-02 14:00:00+00	8
9587	33	17	2026-07-03 09:00:00+00	8
9588	33	17	2026-07-03 14:00:00+00	8
9589	33	17	2026-07-06 09:00:00+00	8
9590	33	17	2026-07-06 14:00:00+00	8
9591	33	17	2026-07-07 09:00:00+00	8
9592	33	17	2026-07-07 14:00:00+00	8
9593	33	17	2026-07-08 09:00:00+00	8
9594	33	17	2026-07-08 14:00:00+00	8
9595	33	17	2026-07-09 09:00:00+00	8
9596	33	17	2026-07-09 14:00:00+00	8
9597	33	17	2026-07-10 09:00:00+00	8
9598	33	17	2026-07-10 14:00:00+00	8
9599	34	17	2026-06-29 09:00:00+00	8
9600	34	17	2026-06-29 14:00:00+00	8
9601	34	17	2026-06-30 09:00:00+00	8
9602	34	17	2026-06-30 14:00:00+00	8
9603	34	17	2026-07-01 09:00:00+00	8
9604	34	17	2026-07-01 14:00:00+00	8
9605	34	17	2026-07-02 09:00:00+00	8
9606	34	17	2026-07-02 14:00:00+00	8
9607	34	17	2026-07-03 09:00:00+00	8
9608	34	17	2026-07-03 14:00:00+00	8
9609	34	17	2026-07-06 09:00:00+00	8
9610	34	17	2026-07-06 14:00:00+00	8
9611	34	17	2026-07-07 09:00:00+00	8
9612	34	17	2026-07-07 14:00:00+00	8
9613	34	17	2026-07-08 09:00:00+00	8
9614	34	17	2026-07-08 14:00:00+00	8
9615	34	17	2026-07-09 09:00:00+00	8
9616	34	17	2026-07-09 14:00:00+00	8
9617	34	17	2026-07-10 09:00:00+00	8
9618	34	17	2026-07-10 14:00:00+00	8
9619	37	17	2026-06-29 09:00:00+00	8
9620	37	17	2026-06-29 14:00:00+00	8
9621	37	17	2026-06-30 09:00:00+00	8
9622	37	17	2026-06-30 14:00:00+00	8
9623	37	17	2026-07-01 09:00:00+00	8
9624	37	17	2026-07-01 14:00:00+00	8
9625	37	17	2026-07-02 09:00:00+00	8
9626	37	17	2026-07-02 14:00:00+00	8
9627	37	17	2026-07-03 09:00:00+00	8
9628	37	17	2026-07-03 14:00:00+00	8
9629	37	17	2026-07-06 09:00:00+00	8
9630	37	17	2026-07-06 14:00:00+00	8
9631	37	17	2026-07-07 09:00:00+00	8
9632	37	17	2026-07-07 14:00:00+00	8
9633	37	17	2026-07-08 09:00:00+00	8
9634	37	17	2026-07-08 14:00:00+00	8
9635	37	17	2026-07-09 09:00:00+00	8
9636	37	17	2026-07-09 14:00:00+00	8
9637	37	17	2026-07-10 09:00:00+00	8
9638	37	17	2026-07-10 14:00:00+00	8
9639	38	17	2026-06-29 09:00:00+00	8
9640	38	17	2026-06-29 14:00:00+00	8
9641	38	17	2026-06-30 09:00:00+00	8
9642	38	17	2026-06-30 14:00:00+00	8
9643	38	17	2026-07-01 09:00:00+00	8
9644	38	17	2026-07-01 14:00:00+00	8
9645	38	17	2026-07-02 09:00:00+00	8
9646	38	17	2026-07-02 14:00:00+00	8
9647	38	17	2026-07-03 09:00:00+00	8
9648	38	17	2026-07-03 14:00:00+00	8
9649	38	17	2026-07-06 09:00:00+00	8
9650	38	17	2026-07-06 14:00:00+00	8
9651	38	17	2026-07-07 09:00:00+00	8
9652	38	17	2026-07-07 14:00:00+00	8
9653	38	17	2026-07-08 09:00:00+00	8
9654	38	17	2026-07-08 14:00:00+00	8
9655	38	17	2026-07-09 09:00:00+00	8
9656	38	17	2026-07-09 14:00:00+00	8
9657	38	17	2026-07-10 09:00:00+00	8
9658	38	17	2026-07-10 14:00:00+00	8
9659	39	17	2026-06-29 09:00:00+00	8
9660	39	17	2026-06-29 14:00:00+00	8
9661	39	17	2026-06-30 09:00:00+00	8
9662	39	17	2026-06-30 14:00:00+00	8
9663	39	17	2026-07-01 09:00:00+00	8
9664	39	17	2026-07-01 14:00:00+00	8
9665	39	17	2026-07-02 09:00:00+00	8
9666	39	17	2026-07-02 14:00:00+00	8
9667	39	17	2026-07-03 09:00:00+00	8
9668	39	17	2026-07-03 14:00:00+00	8
9669	39	17	2026-07-06 09:00:00+00	8
9670	39	17	2026-07-06 14:00:00+00	8
9671	39	17	2026-07-07 09:00:00+00	8
9672	39	17	2026-07-07 14:00:00+00	8
9673	39	17	2026-07-08 09:00:00+00	8
9674	39	17	2026-07-08 14:00:00+00	8
9675	39	17	2026-07-09 09:00:00+00	8
9676	39	17	2026-07-09 14:00:00+00	8
9677	39	17	2026-07-10 09:00:00+00	8
9678	39	17	2026-07-10 14:00:00+00	8
9679	40	17	2026-06-29 09:00:00+00	8
9680	40	17	2026-06-29 14:00:00+00	8
9681	40	17	2026-06-30 09:00:00+00	8
9682	40	17	2026-06-30 14:00:00+00	8
9683	40	17	2026-07-01 09:00:00+00	8
9684	40	17	2026-07-01 14:00:00+00	8
9685	40	17	2026-07-02 09:00:00+00	8
9686	40	17	2026-07-02 14:00:00+00	8
9687	40	17	2026-07-03 09:00:00+00	8
9688	40	17	2026-07-03 14:00:00+00	8
9689	40	17	2026-07-06 09:00:00+00	8
9690	40	17	2026-07-06 14:00:00+00	8
9691	40	17	2026-07-07 09:00:00+00	8
9692	40	17	2026-07-07 14:00:00+00	8
9693	40	17	2026-07-08 09:00:00+00	8
9694	40	17	2026-07-08 14:00:00+00	8
9695	40	17	2026-07-09 09:00:00+00	8
9696	40	17	2026-07-09 14:00:00+00	8
9697	40	17	2026-07-10 09:00:00+00	8
9698	40	17	2026-07-10 14:00:00+00	8
9699	41	17	2026-06-29 09:00:00+00	8
9700	41	17	2026-06-29 14:00:00+00	8
9701	41	17	2026-06-30 09:00:00+00	8
9702	41	17	2026-06-30 14:00:00+00	8
9703	41	17	2026-07-01 09:00:00+00	8
9704	41	17	2026-07-01 14:00:00+00	8
9705	41	17	2026-07-02 09:00:00+00	8
9706	41	17	2026-07-02 14:00:00+00	8
9707	41	17	2026-07-03 09:00:00+00	8
9708	41	17	2026-07-03 14:00:00+00	8
9709	41	17	2026-07-06 09:00:00+00	8
9710	41	17	2026-07-06 14:00:00+00	8
9711	41	17	2026-07-07 09:00:00+00	8
9712	41	17	2026-07-07 14:00:00+00	8
9713	41	17	2026-07-08 09:00:00+00	8
9714	41	17	2026-07-08 14:00:00+00	8
9715	41	17	2026-07-09 09:00:00+00	8
9716	41	17	2026-07-09 14:00:00+00	8
9717	41	17	2026-07-10 09:00:00+00	8
9718	41	17	2026-07-10 14:00:00+00	8
9719	42	17	2026-06-29 09:00:00+00	8
9720	42	17	2026-06-29 14:00:00+00	8
9721	42	17	2026-06-30 09:00:00+00	8
9722	42	17	2026-06-30 14:00:00+00	8
9723	42	17	2026-07-01 09:00:00+00	8
9724	42	17	2026-07-01 14:00:00+00	8
9725	42	17	2026-07-02 09:00:00+00	8
9726	42	17	2026-07-02 14:00:00+00	8
9727	42	17	2026-07-03 09:00:00+00	8
9728	42	17	2026-07-03 14:00:00+00	8
9729	42	17	2026-07-06 09:00:00+00	8
9730	42	17	2026-07-06 14:00:00+00	8
9731	42	17	2026-07-07 09:00:00+00	8
9732	42	17	2026-07-07 14:00:00+00	8
9733	42	17	2026-07-08 09:00:00+00	8
9734	42	17	2026-07-08 14:00:00+00	8
9735	42	17	2026-07-09 09:00:00+00	8
9736	42	17	2026-07-09 14:00:00+00	8
9737	42	17	2026-07-10 09:00:00+00	8
9738	42	17	2026-07-10 14:00:00+00	8
9739	44	17	2026-06-29 09:00:00+00	8
9740	44	17	2026-06-29 14:00:00+00	8
9741	44	17	2026-06-30 09:00:00+00	8
9742	44	17	2026-06-30 14:00:00+00	8
9743	44	17	2026-07-01 09:00:00+00	8
9744	44	17	2026-07-01 14:00:00+00	8
9745	44	17	2026-07-02 09:00:00+00	8
9746	44	17	2026-07-02 14:00:00+00	8
9747	44	17	2026-07-03 09:00:00+00	8
9748	44	17	2026-07-03 14:00:00+00	8
9749	44	17	2026-07-06 09:00:00+00	8
9750	44	17	2026-07-06 14:00:00+00	8
9751	44	17	2026-07-07 09:00:00+00	8
9752	44	17	2026-07-07 14:00:00+00	8
9753	44	17	2026-07-08 09:00:00+00	8
9754	44	17	2026-07-08 14:00:00+00	8
9755	44	17	2026-07-09 09:00:00+00	8
9756	44	17	2026-07-09 14:00:00+00	8
9757	44	17	2026-07-10 09:00:00+00	8
9758	44	17	2026-07-10 14:00:00+00	8
9759	45	17	2026-06-29 09:00:00+00	8
9760	45	17	2026-06-29 14:00:00+00	8
9761	45	17	2026-06-30 09:00:00+00	8
9762	45	17	2026-06-30 14:00:00+00	8
9763	45	17	2026-07-01 09:00:00+00	8
9764	45	17	2026-07-01 14:00:00+00	8
9765	45	17	2026-07-02 09:00:00+00	8
9766	45	17	2026-07-02 14:00:00+00	8
9767	45	17	2026-07-03 09:00:00+00	8
9768	45	17	2026-07-03 14:00:00+00	8
9769	45	17	2026-07-06 09:00:00+00	8
9770	45	17	2026-07-06 14:00:00+00	8
9771	45	17	2026-07-07 09:00:00+00	8
9772	45	17	2026-07-07 14:00:00+00	8
9773	45	17	2026-07-08 09:00:00+00	8
9774	45	17	2026-07-08 14:00:00+00	8
9775	45	17	2026-07-09 09:00:00+00	8
9776	45	17	2026-07-09 14:00:00+00	8
9777	45	17	2026-07-10 09:00:00+00	8
9778	45	17	2026-07-10 14:00:00+00	8
9779	47	17	2026-06-29 09:00:00+00	8
9780	47	17	2026-06-29 14:00:00+00	8
9781	47	17	2026-06-30 09:00:00+00	8
9782	47	17	2026-06-30 14:00:00+00	8
9783	47	17	2026-07-01 09:00:00+00	8
9784	47	17	2026-07-01 14:00:00+00	8
9785	47	17	2026-07-02 09:00:00+00	8
9786	47	17	2026-07-02 14:00:00+00	8
9787	47	17	2026-07-03 09:00:00+00	8
9788	47	17	2026-07-03 14:00:00+00	8
9789	47	17	2026-07-06 09:00:00+00	8
9790	47	17	2026-07-06 14:00:00+00	8
9791	47	17	2026-07-07 09:00:00+00	8
9792	47	17	2026-07-07 14:00:00+00	8
9793	47	17	2026-07-08 09:00:00+00	8
9794	47	17	2026-07-08 14:00:00+00	8
9795	47	17	2026-07-09 09:00:00+00	8
9796	47	17	2026-07-09 14:00:00+00	8
9797	47	17	2026-07-10 09:00:00+00	8
9798	47	17	2026-07-10 14:00:00+00	8
9799	48	17	2026-06-29 09:00:00+00	8
9800	48	17	2026-06-29 14:00:00+00	8
9801	48	17	2026-06-30 09:00:00+00	8
9802	48	17	2026-06-30 14:00:00+00	8
9803	48	17	2026-07-01 09:00:00+00	8
9804	48	17	2026-07-01 14:00:00+00	8
9805	48	17	2026-07-02 09:00:00+00	8
9806	48	17	2026-07-02 14:00:00+00	8
9807	48	17	2026-07-03 09:00:00+00	8
9808	48	17	2026-07-03 14:00:00+00	8
9809	48	17	2026-07-06 09:00:00+00	8
9810	48	17	2026-07-06 14:00:00+00	8
9811	48	17	2026-07-07 09:00:00+00	8
9812	48	17	2026-07-07 14:00:00+00	8
9813	48	17	2026-07-08 09:00:00+00	8
9814	48	17	2026-07-08 14:00:00+00	8
9815	48	17	2026-07-09 09:00:00+00	8
9816	48	17	2026-07-09 14:00:00+00	8
9817	48	17	2026-07-10 09:00:00+00	8
9818	48	17	2026-07-10 14:00:00+00	8
9819	49	17	2026-06-29 09:00:00+00	8
9820	49	17	2026-06-29 14:00:00+00	8
9821	49	17	2026-06-30 09:00:00+00	8
9822	49	17	2026-06-30 14:00:00+00	8
9823	49	17	2026-07-01 09:00:00+00	8
9824	49	17	2026-07-01 14:00:00+00	8
9825	49	17	2026-07-02 09:00:00+00	8
9826	49	17	2026-07-02 14:00:00+00	8
9827	49	17	2026-07-03 09:00:00+00	8
9828	49	17	2026-07-03 14:00:00+00	8
9829	49	17	2026-07-06 09:00:00+00	8
9830	49	17	2026-07-06 14:00:00+00	8
9831	49	17	2026-07-07 09:00:00+00	8
9832	49	17	2026-07-07 14:00:00+00	8
9833	49	17	2026-07-08 09:00:00+00	8
9834	49	17	2026-07-08 14:00:00+00	8
9835	49	17	2026-07-09 09:00:00+00	8
9836	49	17	2026-07-09 14:00:00+00	8
9837	49	17	2026-07-10 09:00:00+00	8
9838	49	17	2026-07-10 14:00:00+00	8
9839	51	17	2026-06-29 09:00:00+00	8
9840	51	17	2026-06-29 14:00:00+00	8
9841	51	17	2026-06-30 09:00:00+00	8
9842	51	17	2026-06-30 14:00:00+00	8
9843	51	17	2026-07-01 09:00:00+00	8
9844	51	17	2026-07-01 14:00:00+00	8
9845	51	17	2026-07-02 09:00:00+00	8
9846	51	17	2026-07-02 14:00:00+00	8
9847	51	17	2026-07-03 09:00:00+00	8
9848	51	17	2026-07-03 14:00:00+00	8
9849	51	17	2026-07-06 09:00:00+00	8
9850	51	17	2026-07-06 14:00:00+00	8
9851	51	17	2026-07-07 09:00:00+00	8
9852	51	17	2026-07-07 14:00:00+00	8
9853	51	17	2026-07-08 09:00:00+00	8
9854	51	17	2026-07-08 14:00:00+00	8
9855	51	17	2026-07-09 09:00:00+00	8
9856	51	17	2026-07-09 14:00:00+00	8
9857	51	17	2026-07-10 09:00:00+00	8
9858	51	17	2026-07-10 14:00:00+00	8
9859	52	17	2026-06-29 09:00:00+00	8
9860	52	17	2026-06-29 14:00:00+00	8
9861	52	17	2026-06-30 09:00:00+00	8
9862	52	17	2026-06-30 14:00:00+00	8
9863	52	17	2026-07-01 09:00:00+00	8
9864	52	17	2026-07-01 14:00:00+00	8
9865	52	17	2026-07-02 09:00:00+00	8
9866	52	17	2026-07-02 14:00:00+00	8
9867	52	17	2026-07-03 09:00:00+00	8
9868	52	17	2026-07-03 14:00:00+00	8
9869	52	17	2026-07-06 09:00:00+00	8
9870	52	17	2026-07-06 14:00:00+00	8
9871	52	17	2026-07-07 09:00:00+00	8
9872	52	17	2026-07-07 14:00:00+00	8
9873	52	17	2026-07-08 09:00:00+00	8
9874	52	17	2026-07-08 14:00:00+00	8
9875	52	17	2026-07-09 09:00:00+00	8
9876	52	17	2026-07-09 14:00:00+00	8
9877	52	17	2026-07-10 09:00:00+00	8
9878	52	17	2026-07-10 14:00:00+00	8
9879	53	17	2026-06-29 09:00:00+00	8
9880	53	17	2026-06-29 14:00:00+00	8
9881	53	17	2026-06-30 09:00:00+00	8
9882	53	17	2026-06-30 14:00:00+00	8
9883	53	17	2026-07-01 09:00:00+00	8
9884	53	17	2026-07-01 14:00:00+00	8
9885	53	17	2026-07-02 09:00:00+00	8
9886	53	17	2026-07-02 14:00:00+00	8
9887	53	17	2026-07-03 09:00:00+00	8
9888	53	17	2026-07-03 14:00:00+00	8
9889	53	17	2026-07-06 09:00:00+00	8
9890	53	17	2026-07-06 14:00:00+00	8
9891	53	17	2026-07-07 09:00:00+00	8
9892	53	17	2026-07-07 14:00:00+00	8
9893	53	17	2026-07-08 09:00:00+00	8
9894	53	17	2026-07-08 14:00:00+00	8
9895	53	17	2026-07-09 09:00:00+00	8
9896	53	17	2026-07-09 14:00:00+00	8
9897	53	17	2026-07-10 09:00:00+00	8
9898	53	17	2026-07-10 14:00:00+00	8
9899	54	17	2026-06-29 09:00:00+00	8
9900	54	17	2026-06-29 14:00:00+00	8
9901	54	17	2026-06-30 09:00:00+00	8
9902	54	17	2026-06-30 14:00:00+00	8
9903	54	17	2026-07-01 09:00:00+00	8
9904	54	17	2026-07-01 14:00:00+00	8
9905	54	17	2026-07-02 09:00:00+00	8
9906	54	17	2026-07-02 14:00:00+00	8
9907	54	17	2026-07-03 09:00:00+00	8
9908	54	17	2026-07-03 14:00:00+00	8
9909	54	17	2026-07-06 09:00:00+00	8
9910	54	17	2026-07-06 14:00:00+00	8
9911	54	17	2026-07-07 09:00:00+00	8
9912	54	17	2026-07-07 14:00:00+00	8
9913	54	17	2026-07-08 09:00:00+00	8
9914	54	17	2026-07-08 14:00:00+00	8
9915	54	17	2026-07-09 09:00:00+00	8
9916	54	17	2026-07-09 14:00:00+00	8
9917	54	17	2026-07-10 09:00:00+00	8
9918	54	17	2026-07-10 14:00:00+00	8
9919	55	17	2026-06-29 09:00:00+00	8
9920	55	17	2026-06-29 14:00:00+00	8
9921	55	17	2026-06-30 09:00:00+00	8
9922	55	17	2026-06-30 14:00:00+00	8
9923	55	17	2026-07-01 09:00:00+00	8
9924	55	17	2026-07-01 14:00:00+00	8
9925	55	17	2026-07-02 09:00:00+00	8
9926	55	17	2026-07-02 14:00:00+00	8
9927	55	17	2026-07-03 09:00:00+00	8
9928	55	17	2026-07-03 14:00:00+00	8
9929	55	17	2026-07-06 09:00:00+00	8
9930	55	17	2026-07-06 14:00:00+00	8
9931	55	17	2026-07-07 09:00:00+00	8
9932	55	17	2026-07-07 14:00:00+00	8
9933	55	17	2026-07-08 09:00:00+00	8
9934	55	17	2026-07-08 14:00:00+00	8
9935	55	17	2026-07-09 09:00:00+00	8
9936	55	17	2026-07-09 14:00:00+00	8
9937	55	17	2026-07-10 09:00:00+00	8
9938	55	17	2026-07-10 14:00:00+00	8
9939	56	17	2026-06-29 09:00:00+00	8
9940	56	17	2026-06-29 14:00:00+00	8
9941	56	17	2026-06-30 09:00:00+00	8
9942	56	17	2026-06-30 14:00:00+00	8
9943	56	17	2026-07-01 09:00:00+00	8
9944	56	17	2026-07-01 14:00:00+00	8
9945	56	17	2026-07-02 09:00:00+00	8
9946	56	17	2026-07-02 14:00:00+00	8
9947	56	17	2026-07-03 09:00:00+00	8
9948	56	17	2026-07-03 14:00:00+00	8
9949	56	17	2026-07-06 09:00:00+00	8
9950	56	17	2026-07-06 14:00:00+00	8
9951	56	17	2026-07-07 09:00:00+00	8
9952	56	17	2026-07-07 14:00:00+00	8
9953	56	17	2026-07-08 09:00:00+00	8
9954	56	17	2026-07-08 14:00:00+00	8
9955	56	17	2026-07-09 09:00:00+00	8
9956	56	17	2026-07-09 14:00:00+00	8
9957	56	17	2026-07-10 09:00:00+00	8
9958	56	17	2026-07-10 14:00:00+00	8
9959	57	17	2026-06-29 09:00:00+00	8
9960	57	17	2026-06-29 14:00:00+00	8
9961	57	17	2026-06-30 09:00:00+00	8
9962	57	17	2026-06-30 14:00:00+00	8
9963	57	17	2026-07-01 09:00:00+00	8
9964	57	17	2026-07-01 14:00:00+00	8
9965	57	17	2026-07-02 09:00:00+00	8
9966	57	17	2026-07-02 14:00:00+00	8
9967	57	17	2026-07-03 09:00:00+00	8
9968	57	17	2026-07-03 14:00:00+00	8
9969	57	17	2026-07-06 09:00:00+00	8
9970	57	17	2026-07-06 14:00:00+00	8
9971	57	17	2026-07-07 09:00:00+00	8
9972	57	17	2026-07-07 14:00:00+00	8
9973	57	17	2026-07-08 09:00:00+00	8
9974	57	17	2026-07-08 14:00:00+00	8
9975	57	17	2026-07-09 09:00:00+00	8
9976	57	17	2026-07-09 14:00:00+00	8
9977	57	17	2026-07-10 09:00:00+00	8
9978	57	17	2026-07-10 14:00:00+00	8
9979	3	18	2026-06-29 09:00:00+00	8
9980	3	18	2026-06-29 14:00:00+00	8
9981	3	18	2026-06-30 09:00:00+00	8
9982	3	18	2026-06-30 14:00:00+00	8
9983	3	18	2026-07-01 09:00:00+00	8
9984	3	18	2026-07-01 14:00:00+00	8
9985	3	18	2026-07-02 09:00:00+00	8
9986	3	18	2026-07-02 14:00:00+00	8
9987	3	18	2026-07-03 09:00:00+00	8
9988	3	18	2026-07-03 14:00:00+00	8
9989	3	18	2026-07-06 09:00:00+00	8
9990	3	18	2026-07-06 14:00:00+00	8
9991	3	18	2026-07-07 09:00:00+00	8
9992	3	18	2026-07-07 14:00:00+00	8
9993	3	18	2026-07-08 09:00:00+00	8
9994	3	18	2026-07-08 14:00:00+00	8
9995	3	18	2026-07-09 09:00:00+00	8
9996	3	18	2026-07-09 14:00:00+00	8
9997	3	18	2026-07-10 09:00:00+00	8
9998	3	18	2026-07-10 14:00:00+00	8
9999	4	18	2026-06-29 09:00:00+00	8
10000	4	18	2026-06-29 14:00:00+00	8
10001	4	18	2026-06-30 09:00:00+00	8
10002	4	18	2026-06-30 14:00:00+00	8
10003	4	18	2026-07-01 09:00:00+00	8
10004	4	18	2026-07-01 14:00:00+00	8
10005	4	18	2026-07-02 09:00:00+00	8
10006	4	18	2026-07-02 14:00:00+00	8
10007	4	18	2026-07-03 09:00:00+00	8
10008	4	18	2026-07-03 14:00:00+00	8
10009	4	18	2026-07-06 09:00:00+00	8
10010	4	18	2026-07-06 14:00:00+00	8
10011	4	18	2026-07-07 09:00:00+00	8
10012	4	18	2026-07-07 14:00:00+00	8
10013	4	18	2026-07-08 09:00:00+00	8
10014	4	18	2026-07-08 14:00:00+00	8
10015	4	18	2026-07-09 09:00:00+00	8
10016	4	18	2026-07-09 14:00:00+00	8
10017	4	18	2026-07-10 09:00:00+00	8
10018	4	18	2026-07-10 14:00:00+00	8
10019	6	18	2026-06-29 09:00:00+00	8
10020	6	18	2026-06-29 14:00:00+00	8
10021	6	18	2026-06-30 09:00:00+00	8
10022	6	18	2026-06-30 14:00:00+00	8
10023	6	18	2026-07-01 09:00:00+00	8
10024	6	18	2026-07-01 14:00:00+00	8
10025	6	18	2026-07-02 09:00:00+00	8
10026	6	18	2026-07-02 14:00:00+00	8
10027	6	18	2026-07-03 09:00:00+00	8
10028	6	18	2026-07-03 14:00:00+00	8
10029	6	18	2026-07-06 09:00:00+00	8
10030	6	18	2026-07-06 14:00:00+00	8
10031	6	18	2026-07-07 09:00:00+00	8
10032	6	18	2026-07-07 14:00:00+00	8
10033	6	18	2026-07-08 09:00:00+00	8
10034	6	18	2026-07-08 14:00:00+00	8
10035	6	18	2026-07-09 09:00:00+00	8
10036	6	18	2026-07-09 14:00:00+00	8
10037	6	18	2026-07-10 09:00:00+00	8
10038	6	18	2026-07-10 14:00:00+00	8
10039	8	18	2026-06-29 09:00:00+00	8
10040	8	18	2026-06-29 14:00:00+00	8
10041	8	18	2026-06-30 09:00:00+00	8
10042	8	18	2026-06-30 14:00:00+00	8
10043	8	18	2026-07-01 09:00:00+00	8
10044	8	18	2026-07-01 14:00:00+00	8
10045	8	18	2026-07-02 09:00:00+00	8
10046	8	18	2026-07-02 14:00:00+00	8
10047	8	18	2026-07-03 09:00:00+00	8
10048	8	18	2026-07-03 14:00:00+00	8
10049	8	18	2026-07-06 09:00:00+00	8
10050	8	18	2026-07-06 14:00:00+00	8
10051	8	18	2026-07-07 09:00:00+00	8
10052	8	18	2026-07-07 14:00:00+00	8
10053	8	18	2026-07-08 09:00:00+00	8
10054	8	18	2026-07-08 14:00:00+00	8
10055	8	18	2026-07-09 09:00:00+00	8
10056	8	18	2026-07-09 14:00:00+00	8
10057	8	18	2026-07-10 09:00:00+00	8
10058	8	18	2026-07-10 14:00:00+00	8
10059	10	18	2026-06-29 09:00:00+00	8
10060	10	18	2026-06-29 14:00:00+00	8
10061	10	18	2026-06-30 09:00:00+00	8
10062	10	18	2026-06-30 14:00:00+00	8
10063	10	18	2026-07-01 09:00:00+00	8
10064	10	18	2026-07-01 14:00:00+00	8
10065	10	18	2026-07-02 09:00:00+00	8
10066	10	18	2026-07-02 14:00:00+00	8
10067	10	18	2026-07-03 09:00:00+00	8
10068	10	18	2026-07-03 14:00:00+00	8
10069	10	18	2026-07-06 09:00:00+00	8
10070	10	18	2026-07-06 14:00:00+00	8
10071	10	18	2026-07-07 09:00:00+00	8
10072	10	18	2026-07-07 14:00:00+00	8
10073	10	18	2026-07-08 09:00:00+00	8
10074	10	18	2026-07-08 14:00:00+00	8
10075	10	18	2026-07-09 09:00:00+00	8
10076	10	18	2026-07-09 14:00:00+00	8
10077	10	18	2026-07-10 09:00:00+00	8
10078	10	18	2026-07-10 14:00:00+00	8
10079	11	18	2026-06-29 09:00:00+00	8
10080	11	18	2026-06-29 14:00:00+00	8
10081	11	18	2026-06-30 09:00:00+00	8
10082	11	18	2026-06-30 14:00:00+00	8
10083	11	18	2026-07-01 09:00:00+00	8
10084	11	18	2026-07-01 14:00:00+00	8
10085	11	18	2026-07-02 09:00:00+00	8
10086	11	18	2026-07-02 14:00:00+00	8
10087	11	18	2026-07-03 09:00:00+00	8
10088	11	18	2026-07-03 14:00:00+00	8
10089	11	18	2026-07-06 09:00:00+00	8
10090	11	18	2026-07-06 14:00:00+00	8
10091	11	18	2026-07-07 09:00:00+00	8
10092	11	18	2026-07-07 14:00:00+00	8
10093	11	18	2026-07-08 09:00:00+00	8
10094	11	18	2026-07-08 14:00:00+00	8
10095	11	18	2026-07-09 09:00:00+00	8
10096	11	18	2026-07-09 14:00:00+00	8
10097	11	18	2026-07-10 09:00:00+00	8
10098	11	18	2026-07-10 14:00:00+00	8
10099	12	18	2026-06-29 09:00:00+00	8
10100	12	18	2026-06-29 14:00:00+00	8
10101	12	18	2026-06-30 09:00:00+00	8
10102	12	18	2026-06-30 14:00:00+00	8
10103	12	18	2026-07-01 09:00:00+00	8
10104	12	18	2026-07-01 14:00:00+00	8
10105	12	18	2026-07-02 09:00:00+00	8
10106	12	18	2026-07-02 14:00:00+00	8
10107	12	18	2026-07-03 09:00:00+00	8
10108	12	18	2026-07-03 14:00:00+00	8
10109	12	18	2026-07-06 09:00:00+00	8
10110	12	18	2026-07-06 14:00:00+00	8
10111	12	18	2026-07-07 09:00:00+00	8
10112	12	18	2026-07-07 14:00:00+00	8
10113	12	18	2026-07-08 09:00:00+00	8
10114	12	18	2026-07-08 14:00:00+00	8
10115	12	18	2026-07-09 09:00:00+00	8
10116	12	18	2026-07-09 14:00:00+00	8
10117	12	18	2026-07-10 09:00:00+00	8
10118	12	18	2026-07-10 14:00:00+00	8
10119	13	18	2026-06-29 09:00:00+00	8
10120	13	18	2026-06-29 14:00:00+00	8
10121	13	18	2026-06-30 09:00:00+00	8
10122	13	18	2026-06-30 14:00:00+00	8
10123	13	18	2026-07-01 09:00:00+00	8
10124	13	18	2026-07-01 14:00:00+00	8
10125	13	18	2026-07-02 09:00:00+00	8
10126	13	18	2026-07-02 14:00:00+00	8
10127	13	18	2026-07-03 09:00:00+00	8
10128	13	18	2026-07-03 14:00:00+00	8
10129	13	18	2026-07-06 09:00:00+00	8
10130	13	18	2026-07-06 14:00:00+00	8
10131	13	18	2026-07-07 09:00:00+00	8
10132	13	18	2026-07-07 14:00:00+00	8
10133	13	18	2026-07-08 09:00:00+00	8
10134	13	18	2026-07-08 14:00:00+00	8
10135	13	18	2026-07-09 09:00:00+00	8
10136	13	18	2026-07-09 14:00:00+00	8
10137	13	18	2026-07-10 09:00:00+00	8
10138	13	18	2026-07-10 14:00:00+00	8
10139	15	18	2026-06-29 09:00:00+00	8
10140	15	18	2026-06-29 14:00:00+00	8
10141	15	18	2026-06-30 09:00:00+00	8
10142	15	18	2026-06-30 14:00:00+00	8
10143	15	18	2026-07-01 09:00:00+00	8
10144	15	18	2026-07-01 14:00:00+00	8
10145	15	18	2026-07-02 09:00:00+00	8
10146	15	18	2026-07-02 14:00:00+00	8
10147	15	18	2026-07-03 09:00:00+00	8
10148	15	18	2026-07-03 14:00:00+00	8
10149	15	18	2026-07-06 09:00:00+00	8
10150	15	18	2026-07-06 14:00:00+00	8
10151	15	18	2026-07-07 09:00:00+00	8
10152	15	18	2026-07-07 14:00:00+00	8
10153	15	18	2026-07-08 09:00:00+00	8
10154	15	18	2026-07-08 14:00:00+00	8
10155	15	18	2026-07-09 09:00:00+00	8
10156	15	18	2026-07-09 14:00:00+00	8
10157	15	18	2026-07-10 09:00:00+00	8
10158	15	18	2026-07-10 14:00:00+00	8
10159	16	18	2026-06-29 09:00:00+00	8
10160	16	18	2026-06-29 14:00:00+00	8
10161	16	18	2026-06-30 09:00:00+00	8
10162	16	18	2026-06-30 14:00:00+00	8
10163	16	18	2026-07-01 09:00:00+00	8
10164	16	18	2026-07-01 14:00:00+00	8
10165	16	18	2026-07-02 09:00:00+00	8
10166	16	18	2026-07-02 14:00:00+00	8
10167	16	18	2026-07-03 09:00:00+00	8
10168	16	18	2026-07-03 14:00:00+00	8
10169	16	18	2026-07-06 09:00:00+00	8
10170	16	18	2026-07-06 14:00:00+00	8
10171	16	18	2026-07-07 09:00:00+00	8
10172	16	18	2026-07-07 14:00:00+00	8
10173	16	18	2026-07-08 09:00:00+00	8
10174	16	18	2026-07-08 14:00:00+00	8
10175	16	18	2026-07-09 09:00:00+00	8
10176	16	18	2026-07-09 14:00:00+00	8
10177	16	18	2026-07-10 09:00:00+00	8
10178	16	18	2026-07-10 14:00:00+00	8
10179	17	18	2026-06-29 09:00:00+00	8
10180	17	18	2026-06-29 14:00:00+00	8
10181	17	18	2026-06-30 09:00:00+00	8
10182	17	18	2026-06-30 14:00:00+00	8
10183	17	18	2026-07-01 09:00:00+00	8
10184	17	18	2026-07-01 14:00:00+00	8
10185	17	18	2026-07-02 09:00:00+00	8
10186	17	18	2026-07-02 14:00:00+00	8
10187	17	18	2026-07-03 09:00:00+00	8
10188	17	18	2026-07-03 14:00:00+00	8
10189	17	18	2026-07-06 09:00:00+00	8
10190	17	18	2026-07-06 14:00:00+00	8
10191	17	18	2026-07-07 09:00:00+00	8
10192	17	18	2026-07-07 14:00:00+00	8
10193	17	18	2026-07-08 09:00:00+00	8
10194	17	18	2026-07-08 14:00:00+00	8
10195	17	18	2026-07-09 09:00:00+00	8
10196	17	18	2026-07-09 14:00:00+00	8
10197	17	18	2026-07-10 09:00:00+00	8
10198	17	18	2026-07-10 14:00:00+00	8
10199	18	18	2026-06-29 09:00:00+00	8
10200	18	18	2026-06-29 14:00:00+00	8
10201	18	18	2026-06-30 09:00:00+00	8
10202	18	18	2026-06-30 14:00:00+00	8
10203	18	18	2026-07-01 09:00:00+00	8
10204	18	18	2026-07-01 14:00:00+00	8
10205	18	18	2026-07-02 09:00:00+00	8
10206	18	18	2026-07-02 14:00:00+00	8
10207	18	18	2026-07-03 09:00:00+00	8
10208	18	18	2026-07-03 14:00:00+00	8
10209	18	18	2026-07-06 09:00:00+00	8
10210	18	18	2026-07-06 14:00:00+00	8
10211	18	18	2026-07-07 09:00:00+00	8
10212	18	18	2026-07-07 14:00:00+00	8
10213	18	18	2026-07-08 09:00:00+00	8
10214	18	18	2026-07-08 14:00:00+00	8
10215	18	18	2026-07-09 09:00:00+00	8
10216	18	18	2026-07-09 14:00:00+00	8
10217	18	18	2026-07-10 09:00:00+00	8
10218	18	18	2026-07-10 14:00:00+00	8
10219	19	18	2026-06-29 09:00:00+00	8
10220	19	18	2026-06-29 14:00:00+00	8
10221	19	18	2026-06-30 09:00:00+00	8
10222	19	18	2026-06-30 14:00:00+00	8
10223	19	18	2026-07-01 09:00:00+00	8
10224	19	18	2026-07-01 14:00:00+00	8
10225	19	18	2026-07-02 09:00:00+00	8
10226	19	18	2026-07-02 14:00:00+00	8
10227	19	18	2026-07-03 09:00:00+00	8
10228	19	18	2026-07-03 14:00:00+00	8
10229	19	18	2026-07-06 09:00:00+00	8
10230	19	18	2026-07-06 14:00:00+00	8
10231	19	18	2026-07-07 09:00:00+00	8
10232	19	18	2026-07-07 14:00:00+00	8
10233	19	18	2026-07-08 09:00:00+00	8
10234	19	18	2026-07-08 14:00:00+00	8
10235	19	18	2026-07-09 09:00:00+00	8
10236	19	18	2026-07-09 14:00:00+00	8
10237	19	18	2026-07-10 09:00:00+00	8
10238	19	18	2026-07-10 14:00:00+00	8
10239	20	18	2026-06-29 09:00:00+00	8
10240	20	18	2026-06-29 14:00:00+00	8
10241	20	18	2026-06-30 09:00:00+00	8
10242	20	18	2026-06-30 14:00:00+00	8
10243	20	18	2026-07-01 09:00:00+00	8
10244	20	18	2026-07-01 14:00:00+00	8
10245	20	18	2026-07-02 09:00:00+00	8
10246	20	18	2026-07-02 14:00:00+00	8
10247	20	18	2026-07-03 09:00:00+00	8
10248	20	18	2026-07-03 14:00:00+00	8
10249	20	18	2026-07-06 09:00:00+00	8
10250	20	18	2026-07-06 14:00:00+00	8
10251	20	18	2026-07-07 09:00:00+00	8
10252	20	18	2026-07-07 14:00:00+00	8
10253	20	18	2026-07-08 09:00:00+00	8
10254	20	18	2026-07-08 14:00:00+00	8
10255	20	18	2026-07-09 09:00:00+00	8
10256	20	18	2026-07-09 14:00:00+00	8
10257	20	18	2026-07-10 09:00:00+00	8
10258	20	18	2026-07-10 14:00:00+00	8
10259	22	18	2026-06-29 09:00:00+00	8
10260	22	18	2026-06-29 14:00:00+00	8
10261	22	18	2026-06-30 09:00:00+00	8
10262	22	18	2026-06-30 14:00:00+00	8
10263	22	18	2026-07-01 09:00:00+00	8
10264	22	18	2026-07-01 14:00:00+00	8
10265	22	18	2026-07-02 09:00:00+00	8
10266	22	18	2026-07-02 14:00:00+00	8
10267	22	18	2026-07-03 09:00:00+00	8
10268	22	18	2026-07-03 14:00:00+00	8
10269	22	18	2026-07-06 09:00:00+00	8
10270	22	18	2026-07-06 14:00:00+00	8
10271	22	18	2026-07-07 09:00:00+00	8
10272	22	18	2026-07-07 14:00:00+00	8
10273	22	18	2026-07-08 09:00:00+00	8
10274	22	18	2026-07-08 14:00:00+00	8
10275	22	18	2026-07-09 09:00:00+00	8
10276	22	18	2026-07-09 14:00:00+00	8
10277	22	18	2026-07-10 09:00:00+00	8
10278	22	18	2026-07-10 14:00:00+00	8
10279	23	18	2026-06-29 09:00:00+00	8
10280	23	18	2026-06-29 14:00:00+00	8
10281	23	18	2026-06-30 09:00:00+00	8
10282	23	18	2026-06-30 14:00:00+00	8
10283	23	18	2026-07-01 09:00:00+00	8
10284	23	18	2026-07-01 14:00:00+00	8
10285	23	18	2026-07-02 09:00:00+00	8
10286	23	18	2026-07-02 14:00:00+00	8
10287	23	18	2026-07-03 09:00:00+00	8
10288	23	18	2026-07-03 14:00:00+00	8
10289	23	18	2026-07-06 09:00:00+00	8
10290	23	18	2026-07-06 14:00:00+00	8
10291	23	18	2026-07-07 09:00:00+00	8
10292	23	18	2026-07-07 14:00:00+00	8
10293	23	18	2026-07-08 09:00:00+00	8
10294	23	18	2026-07-08 14:00:00+00	8
10295	23	18	2026-07-09 09:00:00+00	8
10296	23	18	2026-07-09 14:00:00+00	8
10297	23	18	2026-07-10 09:00:00+00	8
10298	23	18	2026-07-10 14:00:00+00	8
10299	25	18	2026-06-29 09:00:00+00	8
10300	25	18	2026-06-29 14:00:00+00	8
10301	25	18	2026-06-30 09:00:00+00	8
10302	25	18	2026-06-30 14:00:00+00	8
10303	25	18	2026-07-01 09:00:00+00	8
10304	25	18	2026-07-01 14:00:00+00	8
10305	25	18	2026-07-02 09:00:00+00	8
10306	25	18	2026-07-02 14:00:00+00	8
10307	25	18	2026-07-03 09:00:00+00	8
10308	25	18	2026-07-03 14:00:00+00	8
10309	25	18	2026-07-06 09:00:00+00	8
10310	25	18	2026-07-06 14:00:00+00	8
10311	25	18	2026-07-07 09:00:00+00	8
10312	25	18	2026-07-07 14:00:00+00	8
10313	25	18	2026-07-08 09:00:00+00	8
10314	25	18	2026-07-08 14:00:00+00	8
10315	25	18	2026-07-09 09:00:00+00	8
10316	25	18	2026-07-09 14:00:00+00	8
10317	25	18	2026-07-10 09:00:00+00	8
10318	25	18	2026-07-10 14:00:00+00	8
10319	26	18	2026-06-29 09:00:00+00	8
10320	26	18	2026-06-29 14:00:00+00	8
10321	26	18	2026-06-30 09:00:00+00	8
10322	26	18	2026-06-30 14:00:00+00	8
10323	26	18	2026-07-01 09:00:00+00	8
10324	26	18	2026-07-01 14:00:00+00	8
10325	26	18	2026-07-02 09:00:00+00	8
10326	26	18	2026-07-02 14:00:00+00	8
10327	26	18	2026-07-03 09:00:00+00	8
10328	26	18	2026-07-03 14:00:00+00	8
10329	26	18	2026-07-06 09:00:00+00	8
10330	26	18	2026-07-06 14:00:00+00	8
10331	26	18	2026-07-07 09:00:00+00	8
10332	26	18	2026-07-07 14:00:00+00	8
10333	26	18	2026-07-08 09:00:00+00	8
10334	26	18	2026-07-08 14:00:00+00	8
10335	26	18	2026-07-09 09:00:00+00	8
10336	26	18	2026-07-09 14:00:00+00	8
10337	26	18	2026-07-10 09:00:00+00	8
10338	26	18	2026-07-10 14:00:00+00	8
10339	27	18	2026-06-29 09:00:00+00	8
10340	27	18	2026-06-29 14:00:00+00	8
10341	27	18	2026-06-30 09:00:00+00	8
10342	27	18	2026-06-30 14:00:00+00	8
10343	27	18	2026-07-01 09:00:00+00	8
10344	27	18	2026-07-01 14:00:00+00	8
10345	27	18	2026-07-02 09:00:00+00	8
10346	27	18	2026-07-02 14:00:00+00	8
10347	27	18	2026-07-03 09:00:00+00	8
10348	27	18	2026-07-03 14:00:00+00	8
10349	27	18	2026-07-06 09:00:00+00	8
10350	27	18	2026-07-06 14:00:00+00	8
10351	27	18	2026-07-07 09:00:00+00	8
10352	27	18	2026-07-07 14:00:00+00	8
10353	27	18	2026-07-08 09:00:00+00	8
10354	27	18	2026-07-08 14:00:00+00	8
10355	27	18	2026-07-09 09:00:00+00	8
10356	27	18	2026-07-09 14:00:00+00	8
10357	27	18	2026-07-10 09:00:00+00	8
10358	27	18	2026-07-10 14:00:00+00	8
10359	28	18	2026-06-29 09:00:00+00	8
10360	28	18	2026-06-29 14:00:00+00	8
10361	28	18	2026-06-30 09:00:00+00	8
10362	28	18	2026-06-30 14:00:00+00	8
10363	28	18	2026-07-01 09:00:00+00	8
10364	28	18	2026-07-01 14:00:00+00	8
10365	28	18	2026-07-02 09:00:00+00	8
10366	28	18	2026-07-02 14:00:00+00	8
10367	28	18	2026-07-03 09:00:00+00	8
10368	28	18	2026-07-03 14:00:00+00	8
10369	28	18	2026-07-06 09:00:00+00	8
10370	28	18	2026-07-06 14:00:00+00	8
10371	28	18	2026-07-07 09:00:00+00	8
10372	28	18	2026-07-07 14:00:00+00	8
10373	28	18	2026-07-08 09:00:00+00	8
10374	28	18	2026-07-08 14:00:00+00	8
10375	28	18	2026-07-09 09:00:00+00	8
10376	28	18	2026-07-09 14:00:00+00	8
10377	28	18	2026-07-10 09:00:00+00	8
10378	28	18	2026-07-10 14:00:00+00	8
10379	29	18	2026-06-29 09:00:00+00	8
10380	29	18	2026-06-29 14:00:00+00	8
10381	29	18	2026-06-30 09:00:00+00	8
10382	29	18	2026-06-30 14:00:00+00	8
10383	29	18	2026-07-01 09:00:00+00	8
10384	29	18	2026-07-01 14:00:00+00	8
10385	29	18	2026-07-02 09:00:00+00	8
10386	29	18	2026-07-02 14:00:00+00	8
10387	29	18	2026-07-03 09:00:00+00	8
10388	29	18	2026-07-03 14:00:00+00	8
10389	29	18	2026-07-06 09:00:00+00	8
10390	29	18	2026-07-06 14:00:00+00	8
10391	29	18	2026-07-07 09:00:00+00	8
10392	29	18	2026-07-07 14:00:00+00	8
10393	29	18	2026-07-08 09:00:00+00	8
10394	29	18	2026-07-08 14:00:00+00	8
10395	29	18	2026-07-09 09:00:00+00	8
10396	29	18	2026-07-09 14:00:00+00	8
10397	29	18	2026-07-10 09:00:00+00	8
10398	29	18	2026-07-10 14:00:00+00	8
10399	30	18	2026-06-29 09:00:00+00	8
10400	30	18	2026-06-29 14:00:00+00	8
10401	30	18	2026-06-30 09:00:00+00	8
10402	30	18	2026-06-30 14:00:00+00	8
10403	30	18	2026-07-01 09:00:00+00	8
10404	30	18	2026-07-01 14:00:00+00	8
10405	30	18	2026-07-02 09:00:00+00	8
10406	30	18	2026-07-02 14:00:00+00	8
10407	30	18	2026-07-03 09:00:00+00	8
10408	30	18	2026-07-03 14:00:00+00	8
10409	30	18	2026-07-06 09:00:00+00	8
10410	30	18	2026-07-06 14:00:00+00	8
10411	30	18	2026-07-07 09:00:00+00	8
10412	30	18	2026-07-07 14:00:00+00	8
10413	30	18	2026-07-08 09:00:00+00	8
10414	30	18	2026-07-08 14:00:00+00	8
10415	30	18	2026-07-09 09:00:00+00	8
10416	30	18	2026-07-09 14:00:00+00	8
10417	30	18	2026-07-10 09:00:00+00	8
10418	30	18	2026-07-10 14:00:00+00	8
10419	31	18	2026-06-29 09:00:00+00	8
10420	31	18	2026-06-29 14:00:00+00	8
10421	31	18	2026-06-30 09:00:00+00	8
10422	31	18	2026-06-30 14:00:00+00	8
10423	31	18	2026-07-01 09:00:00+00	8
10424	31	18	2026-07-01 14:00:00+00	8
10425	31	18	2026-07-02 09:00:00+00	8
10426	31	18	2026-07-02 14:00:00+00	8
10427	31	18	2026-07-03 09:00:00+00	8
10428	31	18	2026-07-03 14:00:00+00	8
10429	31	18	2026-07-06 09:00:00+00	8
10430	31	18	2026-07-06 14:00:00+00	8
10431	31	18	2026-07-07 09:00:00+00	8
10432	31	18	2026-07-07 14:00:00+00	8
10433	31	18	2026-07-08 09:00:00+00	8
10434	31	18	2026-07-08 14:00:00+00	8
10435	31	18	2026-07-09 09:00:00+00	8
10436	31	18	2026-07-09 14:00:00+00	8
10437	31	18	2026-07-10 09:00:00+00	8
10438	31	18	2026-07-10 14:00:00+00	8
10439	32	18	2026-06-29 09:00:00+00	8
10440	32	18	2026-06-29 14:00:00+00	8
10441	32	18	2026-06-30 09:00:00+00	8
10442	32	18	2026-06-30 14:00:00+00	8
10443	32	18	2026-07-01 09:00:00+00	8
10444	32	18	2026-07-01 14:00:00+00	8
10445	32	18	2026-07-02 09:00:00+00	8
10446	32	18	2026-07-02 14:00:00+00	8
10447	32	18	2026-07-03 09:00:00+00	8
10448	32	18	2026-07-03 14:00:00+00	8
10449	32	18	2026-07-06 09:00:00+00	8
10450	32	18	2026-07-06 14:00:00+00	8
10451	32	18	2026-07-07 09:00:00+00	8
10452	32	18	2026-07-07 14:00:00+00	8
10453	32	18	2026-07-08 09:00:00+00	8
10454	32	18	2026-07-08 14:00:00+00	8
10455	32	18	2026-07-09 09:00:00+00	8
10456	32	18	2026-07-09 14:00:00+00	8
10457	32	18	2026-07-10 09:00:00+00	8
10458	32	18	2026-07-10 14:00:00+00	8
10459	33	18	2026-06-29 09:00:00+00	8
10460	33	18	2026-06-29 14:00:00+00	8
10461	33	18	2026-06-30 09:00:00+00	8
10462	33	18	2026-06-30 14:00:00+00	8
10463	33	18	2026-07-01 09:00:00+00	8
10464	33	18	2026-07-01 14:00:00+00	8
10465	33	18	2026-07-02 09:00:00+00	8
10466	33	18	2026-07-02 14:00:00+00	8
10467	33	18	2026-07-03 09:00:00+00	8
10468	33	18	2026-07-03 14:00:00+00	8
10469	33	18	2026-07-06 09:00:00+00	8
10470	33	18	2026-07-06 14:00:00+00	8
10471	33	18	2026-07-07 09:00:00+00	8
10472	33	18	2026-07-07 14:00:00+00	8
10473	33	18	2026-07-08 09:00:00+00	8
10474	33	18	2026-07-08 14:00:00+00	8
10475	33	18	2026-07-09 09:00:00+00	8
10476	33	18	2026-07-09 14:00:00+00	8
10477	33	18	2026-07-10 09:00:00+00	8
10478	33	18	2026-07-10 14:00:00+00	8
10479	34	18	2026-06-29 09:00:00+00	8
10480	34	18	2026-06-29 14:00:00+00	8
10481	34	18	2026-06-30 09:00:00+00	8
10482	34	18	2026-06-30 14:00:00+00	8
10483	34	18	2026-07-01 09:00:00+00	8
10484	34	18	2026-07-01 14:00:00+00	8
10485	34	18	2026-07-02 09:00:00+00	8
10486	34	18	2026-07-02 14:00:00+00	8
10487	34	18	2026-07-03 09:00:00+00	8
10488	34	18	2026-07-03 14:00:00+00	8
10489	34	18	2026-07-06 09:00:00+00	8
10490	34	18	2026-07-06 14:00:00+00	8
10491	34	18	2026-07-07 09:00:00+00	8
10492	34	18	2026-07-07 14:00:00+00	8
10493	34	18	2026-07-08 09:00:00+00	8
10494	34	18	2026-07-08 14:00:00+00	8
10495	34	18	2026-07-09 09:00:00+00	8
10496	34	18	2026-07-09 14:00:00+00	8
10497	34	18	2026-07-10 09:00:00+00	8
10498	34	18	2026-07-10 14:00:00+00	8
10499	37	18	2026-06-29 09:00:00+00	8
10500	37	18	2026-06-29 14:00:00+00	8
10501	37	18	2026-06-30 09:00:00+00	8
10502	37	18	2026-06-30 14:00:00+00	8
10503	37	18	2026-07-01 09:00:00+00	8
10504	37	18	2026-07-01 14:00:00+00	8
10505	37	18	2026-07-02 09:00:00+00	8
10506	37	18	2026-07-02 14:00:00+00	8
10507	37	18	2026-07-03 09:00:00+00	8
10508	37	18	2026-07-03 14:00:00+00	8
10509	37	18	2026-07-06 09:00:00+00	8
10510	37	18	2026-07-06 14:00:00+00	8
10511	37	18	2026-07-07 09:00:00+00	8
10512	37	18	2026-07-07 14:00:00+00	8
10513	37	18	2026-07-08 09:00:00+00	8
10514	37	18	2026-07-08 14:00:00+00	8
10515	37	18	2026-07-09 09:00:00+00	8
10516	37	18	2026-07-09 14:00:00+00	8
10517	37	18	2026-07-10 09:00:00+00	8
10518	37	18	2026-07-10 14:00:00+00	8
10519	38	18	2026-06-29 09:00:00+00	8
10520	38	18	2026-06-29 14:00:00+00	8
10521	38	18	2026-06-30 09:00:00+00	8
10522	38	18	2026-06-30 14:00:00+00	8
10523	38	18	2026-07-01 09:00:00+00	8
10524	38	18	2026-07-01 14:00:00+00	8
10525	38	18	2026-07-02 09:00:00+00	8
10526	38	18	2026-07-02 14:00:00+00	8
10527	38	18	2026-07-03 09:00:00+00	8
10528	38	18	2026-07-03 14:00:00+00	8
10529	38	18	2026-07-06 09:00:00+00	8
10530	38	18	2026-07-06 14:00:00+00	8
10531	38	18	2026-07-07 09:00:00+00	8
10532	38	18	2026-07-07 14:00:00+00	8
10533	38	18	2026-07-08 09:00:00+00	8
10534	38	18	2026-07-08 14:00:00+00	8
10535	38	18	2026-07-09 09:00:00+00	8
10536	38	18	2026-07-09 14:00:00+00	8
10537	38	18	2026-07-10 09:00:00+00	8
10538	38	18	2026-07-10 14:00:00+00	8
10539	39	18	2026-06-29 09:00:00+00	8
10540	39	18	2026-06-29 14:00:00+00	8
10541	39	18	2026-06-30 09:00:00+00	8
10542	39	18	2026-06-30 14:00:00+00	8
10543	39	18	2026-07-01 09:00:00+00	8
10544	39	18	2026-07-01 14:00:00+00	8
10545	39	18	2026-07-02 09:00:00+00	8
10546	39	18	2026-07-02 14:00:00+00	8
10547	39	18	2026-07-03 09:00:00+00	8
10548	39	18	2026-07-03 14:00:00+00	8
10549	39	18	2026-07-06 09:00:00+00	8
10550	39	18	2026-07-06 14:00:00+00	8
10551	39	18	2026-07-07 09:00:00+00	8
10552	39	18	2026-07-07 14:00:00+00	8
10553	39	18	2026-07-08 09:00:00+00	8
10554	39	18	2026-07-08 14:00:00+00	8
10555	39	18	2026-07-09 09:00:00+00	8
10556	39	18	2026-07-09 14:00:00+00	8
10557	39	18	2026-07-10 09:00:00+00	8
10558	39	18	2026-07-10 14:00:00+00	8
10559	40	18	2026-06-29 09:00:00+00	8
10560	40	18	2026-06-29 14:00:00+00	8
10561	40	18	2026-06-30 09:00:00+00	8
10562	40	18	2026-06-30 14:00:00+00	8
10563	40	18	2026-07-01 09:00:00+00	8
10564	40	18	2026-07-01 14:00:00+00	8
10565	40	18	2026-07-02 09:00:00+00	8
10566	40	18	2026-07-02 14:00:00+00	8
10567	40	18	2026-07-03 09:00:00+00	8
10568	40	18	2026-07-03 14:00:00+00	8
10569	40	18	2026-07-06 09:00:00+00	8
10570	40	18	2026-07-06 14:00:00+00	8
10571	40	18	2026-07-07 09:00:00+00	8
10572	40	18	2026-07-07 14:00:00+00	8
10573	40	18	2026-07-08 09:00:00+00	8
10574	40	18	2026-07-08 14:00:00+00	8
10575	40	18	2026-07-09 09:00:00+00	8
10576	40	18	2026-07-09 14:00:00+00	8
10577	40	18	2026-07-10 09:00:00+00	8
10578	40	18	2026-07-10 14:00:00+00	8
10579	41	18	2026-06-29 09:00:00+00	8
10580	41	18	2026-06-29 14:00:00+00	8
10581	41	18	2026-06-30 09:00:00+00	8
10582	41	18	2026-06-30 14:00:00+00	8
10583	41	18	2026-07-01 09:00:00+00	8
10584	41	18	2026-07-01 14:00:00+00	8
10585	41	18	2026-07-02 09:00:00+00	8
10586	41	18	2026-07-02 14:00:00+00	8
10587	41	18	2026-07-03 09:00:00+00	8
10588	41	18	2026-07-03 14:00:00+00	8
10589	41	18	2026-07-06 09:00:00+00	8
10590	41	18	2026-07-06 14:00:00+00	8
10591	41	18	2026-07-07 09:00:00+00	8
10592	41	18	2026-07-07 14:00:00+00	8
10593	41	18	2026-07-08 09:00:00+00	8
10594	41	18	2026-07-08 14:00:00+00	8
10595	41	18	2026-07-09 09:00:00+00	8
10596	41	18	2026-07-09 14:00:00+00	8
10597	41	18	2026-07-10 09:00:00+00	8
10598	41	18	2026-07-10 14:00:00+00	8
10599	42	18	2026-06-29 09:00:00+00	8
10600	42	18	2026-06-29 14:00:00+00	8
10601	42	18	2026-06-30 09:00:00+00	8
10602	42	18	2026-06-30 14:00:00+00	8
10603	42	18	2026-07-01 09:00:00+00	8
10604	42	18	2026-07-01 14:00:00+00	8
10605	42	18	2026-07-02 09:00:00+00	8
10606	42	18	2026-07-02 14:00:00+00	8
10607	42	18	2026-07-03 09:00:00+00	8
10608	42	18	2026-07-03 14:00:00+00	8
10609	42	18	2026-07-06 09:00:00+00	8
10610	42	18	2026-07-06 14:00:00+00	8
10611	42	18	2026-07-07 09:00:00+00	8
10612	42	18	2026-07-07 14:00:00+00	8
10613	42	18	2026-07-08 09:00:00+00	8
10614	42	18	2026-07-08 14:00:00+00	8
10615	42	18	2026-07-09 09:00:00+00	8
10616	42	18	2026-07-09 14:00:00+00	8
10617	42	18	2026-07-10 09:00:00+00	8
10618	42	18	2026-07-10 14:00:00+00	8
10619	44	18	2026-06-29 09:00:00+00	8
10620	44	18	2026-06-29 14:00:00+00	8
10621	44	18	2026-06-30 09:00:00+00	8
10622	44	18	2026-06-30 14:00:00+00	8
10623	44	18	2026-07-01 09:00:00+00	8
10624	44	18	2026-07-01 14:00:00+00	8
10625	44	18	2026-07-02 09:00:00+00	8
10626	44	18	2026-07-02 14:00:00+00	8
10627	44	18	2026-07-03 09:00:00+00	8
10628	44	18	2026-07-03 14:00:00+00	8
10629	44	18	2026-07-06 09:00:00+00	8
10630	44	18	2026-07-06 14:00:00+00	8
10631	44	18	2026-07-07 09:00:00+00	8
10632	44	18	2026-07-07 14:00:00+00	8
10633	44	18	2026-07-08 09:00:00+00	8
10634	44	18	2026-07-08 14:00:00+00	8
10635	44	18	2026-07-09 09:00:00+00	8
10636	44	18	2026-07-09 14:00:00+00	8
10637	44	18	2026-07-10 09:00:00+00	8
10638	44	18	2026-07-10 14:00:00+00	8
10639	45	18	2026-06-29 09:00:00+00	8
10640	45	18	2026-06-29 14:00:00+00	8
10641	45	18	2026-06-30 09:00:00+00	8
10642	45	18	2026-06-30 14:00:00+00	8
10643	45	18	2026-07-01 09:00:00+00	8
10644	45	18	2026-07-01 14:00:00+00	8
10645	45	18	2026-07-02 09:00:00+00	8
10646	45	18	2026-07-02 14:00:00+00	8
10647	45	18	2026-07-03 09:00:00+00	8
10648	45	18	2026-07-03 14:00:00+00	8
10649	45	18	2026-07-06 09:00:00+00	8
10650	45	18	2026-07-06 14:00:00+00	8
10651	45	18	2026-07-07 09:00:00+00	8
10652	45	18	2026-07-07 14:00:00+00	8
10653	45	18	2026-07-08 09:00:00+00	8
10654	45	18	2026-07-08 14:00:00+00	8
10655	45	18	2026-07-09 09:00:00+00	8
10656	45	18	2026-07-09 14:00:00+00	8
10657	45	18	2026-07-10 09:00:00+00	8
10658	45	18	2026-07-10 14:00:00+00	8
10659	47	18	2026-06-29 09:00:00+00	8
10660	47	18	2026-06-29 14:00:00+00	8
10661	47	18	2026-06-30 09:00:00+00	8
10662	47	18	2026-06-30 14:00:00+00	8
10663	47	18	2026-07-01 09:00:00+00	8
10664	47	18	2026-07-01 14:00:00+00	8
10665	47	18	2026-07-02 09:00:00+00	8
10666	47	18	2026-07-02 14:00:00+00	8
10667	47	18	2026-07-03 09:00:00+00	8
10668	47	18	2026-07-03 14:00:00+00	8
10669	47	18	2026-07-06 09:00:00+00	8
10670	47	18	2026-07-06 14:00:00+00	8
10671	47	18	2026-07-07 09:00:00+00	8
10672	47	18	2026-07-07 14:00:00+00	8
10673	47	18	2026-07-08 09:00:00+00	8
10674	47	18	2026-07-08 14:00:00+00	8
10675	47	18	2026-07-09 09:00:00+00	8
10676	47	18	2026-07-09 14:00:00+00	8
10677	47	18	2026-07-10 09:00:00+00	8
10678	47	18	2026-07-10 14:00:00+00	8
10679	48	18	2026-06-29 09:00:00+00	8
10680	48	18	2026-06-29 14:00:00+00	8
10681	48	18	2026-06-30 09:00:00+00	8
10682	48	18	2026-06-30 14:00:00+00	8
10683	48	18	2026-07-01 09:00:00+00	8
10684	48	18	2026-07-01 14:00:00+00	8
10685	48	18	2026-07-02 09:00:00+00	8
10686	48	18	2026-07-02 14:00:00+00	8
10687	48	18	2026-07-03 09:00:00+00	8
10688	48	18	2026-07-03 14:00:00+00	8
10689	48	18	2026-07-06 09:00:00+00	8
10690	48	18	2026-07-06 14:00:00+00	8
10691	48	18	2026-07-07 09:00:00+00	8
10692	48	18	2026-07-07 14:00:00+00	8
10693	48	18	2026-07-08 09:00:00+00	8
10694	48	18	2026-07-08 14:00:00+00	8
10695	48	18	2026-07-09 09:00:00+00	8
10696	48	18	2026-07-09 14:00:00+00	8
10697	48	18	2026-07-10 09:00:00+00	8
10698	48	18	2026-07-10 14:00:00+00	8
10699	49	18	2026-06-29 09:00:00+00	8
10700	49	18	2026-06-29 14:00:00+00	8
10701	49	18	2026-06-30 09:00:00+00	8
10702	49	18	2026-06-30 14:00:00+00	8
10703	49	18	2026-07-01 09:00:00+00	8
10704	49	18	2026-07-01 14:00:00+00	8
10705	49	18	2026-07-02 09:00:00+00	8
10706	49	18	2026-07-02 14:00:00+00	8
10707	49	18	2026-07-03 09:00:00+00	8
10708	49	18	2026-07-03 14:00:00+00	8
10709	49	18	2026-07-06 09:00:00+00	8
10710	49	18	2026-07-06 14:00:00+00	8
10711	49	18	2026-07-07 09:00:00+00	8
10712	49	18	2026-07-07 14:00:00+00	8
10713	49	18	2026-07-08 09:00:00+00	8
10714	49	18	2026-07-08 14:00:00+00	8
10715	49	18	2026-07-09 09:00:00+00	8
10716	49	18	2026-07-09 14:00:00+00	8
10717	49	18	2026-07-10 09:00:00+00	8
10718	49	18	2026-07-10 14:00:00+00	8
10719	51	18	2026-06-29 09:00:00+00	8
10720	51	18	2026-06-29 14:00:00+00	8
10721	51	18	2026-06-30 09:00:00+00	8
10722	51	18	2026-06-30 14:00:00+00	8
10723	51	18	2026-07-01 09:00:00+00	8
10724	51	18	2026-07-01 14:00:00+00	8
10725	51	18	2026-07-02 09:00:00+00	8
10726	51	18	2026-07-02 14:00:00+00	8
10727	51	18	2026-07-03 09:00:00+00	8
10728	51	18	2026-07-03 14:00:00+00	8
10729	51	18	2026-07-06 09:00:00+00	8
10730	51	18	2026-07-06 14:00:00+00	8
10731	51	18	2026-07-07 09:00:00+00	8
10732	51	18	2026-07-07 14:00:00+00	8
10733	51	18	2026-07-08 09:00:00+00	8
10734	51	18	2026-07-08 14:00:00+00	8
10735	51	18	2026-07-09 09:00:00+00	8
10736	51	18	2026-07-09 14:00:00+00	8
10737	51	18	2026-07-10 09:00:00+00	8
10738	51	18	2026-07-10 14:00:00+00	8
10739	52	18	2026-06-29 09:00:00+00	8
10740	52	18	2026-06-29 14:00:00+00	8
10741	52	18	2026-06-30 09:00:00+00	8
10742	52	18	2026-06-30 14:00:00+00	8
10743	52	18	2026-07-01 09:00:00+00	8
10744	52	18	2026-07-01 14:00:00+00	8
10745	52	18	2026-07-02 09:00:00+00	8
10746	52	18	2026-07-02 14:00:00+00	8
10747	52	18	2026-07-03 09:00:00+00	8
10748	52	18	2026-07-03 14:00:00+00	8
10749	52	18	2026-07-06 09:00:00+00	8
10750	52	18	2026-07-06 14:00:00+00	8
10751	52	18	2026-07-07 09:00:00+00	8
10752	52	18	2026-07-07 14:00:00+00	8
10753	52	18	2026-07-08 09:00:00+00	8
10754	52	18	2026-07-08 14:00:00+00	8
10755	52	18	2026-07-09 09:00:00+00	8
10756	52	18	2026-07-09 14:00:00+00	8
10757	52	18	2026-07-10 09:00:00+00	8
10758	52	18	2026-07-10 14:00:00+00	8
10759	53	18	2026-06-29 09:00:00+00	8
10760	53	18	2026-06-29 14:00:00+00	8
10761	53	18	2026-06-30 09:00:00+00	8
10762	53	18	2026-06-30 14:00:00+00	8
10763	53	18	2026-07-01 09:00:00+00	8
10764	53	18	2026-07-01 14:00:00+00	8
10765	53	18	2026-07-02 09:00:00+00	8
10766	53	18	2026-07-02 14:00:00+00	8
10767	53	18	2026-07-03 09:00:00+00	8
10768	53	18	2026-07-03 14:00:00+00	8
10769	53	18	2026-07-06 09:00:00+00	8
10770	53	18	2026-07-06 14:00:00+00	8
10771	53	18	2026-07-07 09:00:00+00	8
10772	53	18	2026-07-07 14:00:00+00	8
10773	53	18	2026-07-08 09:00:00+00	8
10774	53	18	2026-07-08 14:00:00+00	8
10775	53	18	2026-07-09 09:00:00+00	8
10776	53	18	2026-07-09 14:00:00+00	8
10777	53	18	2026-07-10 09:00:00+00	8
10778	53	18	2026-07-10 14:00:00+00	8
10779	54	18	2026-06-29 09:00:00+00	8
10780	54	18	2026-06-29 14:00:00+00	8
10781	54	18	2026-06-30 09:00:00+00	8
10782	54	18	2026-06-30 14:00:00+00	8
10783	54	18	2026-07-01 09:00:00+00	8
10784	54	18	2026-07-01 14:00:00+00	8
10785	54	18	2026-07-02 09:00:00+00	8
10786	54	18	2026-07-02 14:00:00+00	8
10787	54	18	2026-07-03 09:00:00+00	8
10788	54	18	2026-07-03 14:00:00+00	8
10789	54	18	2026-07-06 09:00:00+00	8
10790	54	18	2026-07-06 14:00:00+00	8
10791	54	18	2026-07-07 09:00:00+00	8
10792	54	18	2026-07-07 14:00:00+00	8
10793	54	18	2026-07-08 09:00:00+00	8
10794	54	18	2026-07-08 14:00:00+00	8
10795	54	18	2026-07-09 09:00:00+00	8
10796	54	18	2026-07-09 14:00:00+00	8
10797	54	18	2026-07-10 09:00:00+00	8
10798	54	18	2026-07-10 14:00:00+00	8
10799	55	18	2026-06-29 09:00:00+00	8
10800	55	18	2026-06-29 14:00:00+00	8
10801	55	18	2026-06-30 09:00:00+00	8
10802	55	18	2026-06-30 14:00:00+00	8
10803	55	18	2026-07-01 09:00:00+00	8
10804	55	18	2026-07-01 14:00:00+00	8
10805	55	18	2026-07-02 09:00:00+00	8
10806	55	18	2026-07-02 14:00:00+00	8
10807	55	18	2026-07-03 09:00:00+00	8
10808	55	18	2026-07-03 14:00:00+00	8
10809	55	18	2026-07-06 09:00:00+00	8
10810	55	18	2026-07-06 14:00:00+00	8
10811	55	18	2026-07-07 09:00:00+00	8
10812	55	18	2026-07-07 14:00:00+00	8
10813	55	18	2026-07-08 09:00:00+00	8
10814	55	18	2026-07-08 14:00:00+00	8
10815	55	18	2026-07-09 09:00:00+00	8
10816	55	18	2026-07-09 14:00:00+00	8
10817	55	18	2026-07-10 09:00:00+00	8
10818	55	18	2026-07-10 14:00:00+00	8
10819	56	18	2026-06-29 09:00:00+00	8
10820	56	18	2026-06-29 14:00:00+00	8
10821	56	18	2026-06-30 09:00:00+00	8
10822	56	18	2026-06-30 14:00:00+00	8
10823	56	18	2026-07-01 09:00:00+00	8
10824	56	18	2026-07-01 14:00:00+00	8
10825	56	18	2026-07-02 09:00:00+00	8
10826	56	18	2026-07-02 14:00:00+00	8
10827	56	18	2026-07-03 09:00:00+00	8
10828	56	18	2026-07-03 14:00:00+00	8
10829	56	18	2026-07-06 09:00:00+00	8
10830	56	18	2026-07-06 14:00:00+00	8
10831	56	18	2026-07-07 09:00:00+00	8
10832	56	18	2026-07-07 14:00:00+00	8
10833	56	18	2026-07-08 09:00:00+00	8
10834	56	18	2026-07-08 14:00:00+00	8
10835	56	18	2026-07-09 09:00:00+00	8
10836	56	18	2026-07-09 14:00:00+00	8
10837	56	18	2026-07-10 09:00:00+00	8
10838	56	18	2026-07-10 14:00:00+00	8
10839	57	18	2026-06-29 09:00:00+00	8
10840	57	18	2026-06-29 14:00:00+00	8
10841	57	18	2026-06-30 09:00:00+00	8
10842	57	18	2026-06-30 14:00:00+00	8
10843	57	18	2026-07-01 09:00:00+00	8
10844	57	18	2026-07-01 14:00:00+00	8
10845	57	18	2026-07-02 09:00:00+00	8
10846	57	18	2026-07-02 14:00:00+00	8
10847	57	18	2026-07-03 09:00:00+00	8
10848	57	18	2026-07-03 14:00:00+00	8
10849	57	18	2026-07-06 09:00:00+00	8
10850	57	18	2026-07-06 14:00:00+00	8
10851	57	18	2026-07-07 09:00:00+00	8
10852	57	18	2026-07-07 14:00:00+00	8
10853	57	18	2026-07-08 09:00:00+00	8
10854	57	18	2026-07-08 14:00:00+00	8
10855	57	18	2026-07-09 09:00:00+00	8
10856	57	18	2026-07-09 14:00:00+00	8
10857	57	18	2026-07-10 09:00:00+00	8
10858	57	18	2026-07-10 14:00:00+00	8
10859	3	19	2026-06-29 09:00:00+00	8
10860	3	19	2026-06-29 14:00:00+00	8
10861	3	19	2026-06-30 09:00:00+00	8
10862	3	19	2026-06-30 14:00:00+00	8
10863	3	19	2026-07-01 09:00:00+00	8
10864	3	19	2026-07-01 14:00:00+00	8
10865	3	19	2026-07-02 09:00:00+00	8
10866	3	19	2026-07-02 14:00:00+00	8
10867	3	19	2026-07-03 09:00:00+00	8
10868	3	19	2026-07-03 14:00:00+00	8
10869	3	19	2026-07-06 09:00:00+00	8
10870	3	19	2026-07-06 14:00:00+00	8
10871	3	19	2026-07-07 09:00:00+00	8
10872	3	19	2026-07-07 14:00:00+00	8
10873	3	19	2026-07-08 09:00:00+00	8
10874	3	19	2026-07-08 14:00:00+00	8
10875	3	19	2026-07-09 09:00:00+00	8
10876	3	19	2026-07-09 14:00:00+00	8
10877	3	19	2026-07-10 09:00:00+00	8
10878	3	19	2026-07-10 14:00:00+00	8
10879	4	19	2026-06-29 09:00:00+00	8
10880	4	19	2026-06-29 14:00:00+00	8
10881	4	19	2026-06-30 09:00:00+00	8
10882	4	19	2026-06-30 14:00:00+00	8
10883	4	19	2026-07-01 09:00:00+00	8
10884	4	19	2026-07-01 14:00:00+00	8
10885	4	19	2026-07-02 09:00:00+00	8
10886	4	19	2026-07-02 14:00:00+00	8
10887	4	19	2026-07-03 09:00:00+00	8
10888	4	19	2026-07-03 14:00:00+00	8
10889	4	19	2026-07-06 09:00:00+00	8
10890	4	19	2026-07-06 14:00:00+00	8
10891	4	19	2026-07-07 09:00:00+00	8
10892	4	19	2026-07-07 14:00:00+00	8
10893	4	19	2026-07-08 09:00:00+00	8
10894	4	19	2026-07-08 14:00:00+00	8
10895	4	19	2026-07-09 09:00:00+00	8
10896	4	19	2026-07-09 14:00:00+00	8
10897	4	19	2026-07-10 09:00:00+00	8
10898	4	19	2026-07-10 14:00:00+00	8
10899	6	19	2026-06-29 09:00:00+00	8
10900	6	19	2026-06-29 14:00:00+00	8
10901	6	19	2026-06-30 09:00:00+00	8
10902	6	19	2026-06-30 14:00:00+00	8
10903	6	19	2026-07-01 09:00:00+00	8
10904	6	19	2026-07-01 14:00:00+00	8
10905	6	19	2026-07-02 09:00:00+00	8
10906	6	19	2026-07-02 14:00:00+00	8
10907	6	19	2026-07-03 09:00:00+00	8
10908	6	19	2026-07-03 14:00:00+00	8
10909	6	19	2026-07-06 09:00:00+00	8
10910	6	19	2026-07-06 14:00:00+00	8
10911	6	19	2026-07-07 09:00:00+00	8
10912	6	19	2026-07-07 14:00:00+00	8
10913	6	19	2026-07-08 09:00:00+00	8
10914	6	19	2026-07-08 14:00:00+00	8
10915	6	19	2026-07-09 09:00:00+00	8
10916	6	19	2026-07-09 14:00:00+00	8
10917	6	19	2026-07-10 09:00:00+00	8
10918	6	19	2026-07-10 14:00:00+00	8
10919	8	19	2026-06-29 09:00:00+00	8
10920	8	19	2026-06-29 14:00:00+00	8
10921	8	19	2026-06-30 09:00:00+00	8
10922	8	19	2026-06-30 14:00:00+00	8
10923	8	19	2026-07-01 09:00:00+00	8
10924	8	19	2026-07-01 14:00:00+00	8
10925	8	19	2026-07-02 09:00:00+00	8
10926	8	19	2026-07-02 14:00:00+00	8
10927	8	19	2026-07-03 09:00:00+00	8
10928	8	19	2026-07-03 14:00:00+00	8
10929	8	19	2026-07-06 09:00:00+00	8
10930	8	19	2026-07-06 14:00:00+00	8
10931	8	19	2026-07-07 09:00:00+00	8
10932	8	19	2026-07-07 14:00:00+00	8
10933	8	19	2026-07-08 09:00:00+00	8
10934	8	19	2026-07-08 14:00:00+00	8
10935	8	19	2026-07-09 09:00:00+00	8
10936	8	19	2026-07-09 14:00:00+00	8
10937	8	19	2026-07-10 09:00:00+00	8
10938	8	19	2026-07-10 14:00:00+00	8
10939	10	19	2026-06-29 09:00:00+00	8
10940	10	19	2026-06-29 14:00:00+00	8
10941	10	19	2026-06-30 09:00:00+00	8
10942	10	19	2026-06-30 14:00:00+00	8
10943	10	19	2026-07-01 09:00:00+00	8
10944	10	19	2026-07-01 14:00:00+00	8
10945	10	19	2026-07-02 09:00:00+00	8
10946	10	19	2026-07-02 14:00:00+00	8
10947	10	19	2026-07-03 09:00:00+00	8
10948	10	19	2026-07-03 14:00:00+00	8
10949	10	19	2026-07-06 09:00:00+00	8
10950	10	19	2026-07-06 14:00:00+00	8
10951	10	19	2026-07-07 09:00:00+00	8
10952	10	19	2026-07-07 14:00:00+00	8
10953	10	19	2026-07-08 09:00:00+00	8
10954	10	19	2026-07-08 14:00:00+00	8
10955	10	19	2026-07-09 09:00:00+00	8
10956	10	19	2026-07-09 14:00:00+00	8
10957	10	19	2026-07-10 09:00:00+00	8
10958	10	19	2026-07-10 14:00:00+00	8
10959	11	19	2026-06-29 09:00:00+00	8
10960	11	19	2026-06-29 14:00:00+00	8
10961	11	19	2026-06-30 09:00:00+00	8
10962	11	19	2026-06-30 14:00:00+00	8
10963	11	19	2026-07-01 09:00:00+00	8
10964	11	19	2026-07-01 14:00:00+00	8
10965	11	19	2026-07-02 09:00:00+00	8
10966	11	19	2026-07-02 14:00:00+00	8
10967	11	19	2026-07-03 09:00:00+00	8
10968	11	19	2026-07-03 14:00:00+00	8
10969	11	19	2026-07-06 09:00:00+00	8
10970	11	19	2026-07-06 14:00:00+00	8
10971	11	19	2026-07-07 09:00:00+00	8
10972	11	19	2026-07-07 14:00:00+00	8
10973	11	19	2026-07-08 09:00:00+00	8
10974	11	19	2026-07-08 14:00:00+00	8
10975	11	19	2026-07-09 09:00:00+00	8
10976	11	19	2026-07-09 14:00:00+00	8
10977	11	19	2026-07-10 09:00:00+00	8
10978	11	19	2026-07-10 14:00:00+00	8
10979	12	19	2026-06-29 09:00:00+00	8
10980	12	19	2026-06-29 14:00:00+00	8
10981	12	19	2026-06-30 09:00:00+00	8
10982	12	19	2026-06-30 14:00:00+00	8
10983	12	19	2026-07-01 09:00:00+00	8
10984	12	19	2026-07-01 14:00:00+00	8
10985	12	19	2026-07-02 09:00:00+00	8
10986	12	19	2026-07-02 14:00:00+00	8
10987	12	19	2026-07-03 09:00:00+00	8
10988	12	19	2026-07-03 14:00:00+00	8
10989	12	19	2026-07-06 09:00:00+00	8
10990	12	19	2026-07-06 14:00:00+00	8
10991	12	19	2026-07-07 09:00:00+00	8
10992	12	19	2026-07-07 14:00:00+00	8
10993	12	19	2026-07-08 09:00:00+00	8
10994	12	19	2026-07-08 14:00:00+00	8
10995	12	19	2026-07-09 09:00:00+00	8
10996	12	19	2026-07-09 14:00:00+00	8
10997	12	19	2026-07-10 09:00:00+00	8
10998	12	19	2026-07-10 14:00:00+00	8
10999	13	19	2026-06-29 09:00:00+00	8
11000	13	19	2026-06-29 14:00:00+00	8
11001	13	19	2026-06-30 09:00:00+00	8
11002	13	19	2026-06-30 14:00:00+00	8
11003	13	19	2026-07-01 09:00:00+00	8
11004	13	19	2026-07-01 14:00:00+00	8
11005	13	19	2026-07-02 09:00:00+00	8
11006	13	19	2026-07-02 14:00:00+00	8
11007	13	19	2026-07-03 09:00:00+00	8
11008	13	19	2026-07-03 14:00:00+00	8
11009	13	19	2026-07-06 09:00:00+00	8
11010	13	19	2026-07-06 14:00:00+00	8
11011	13	19	2026-07-07 09:00:00+00	8
11012	13	19	2026-07-07 14:00:00+00	8
11013	13	19	2026-07-08 09:00:00+00	8
11014	13	19	2026-07-08 14:00:00+00	8
11015	13	19	2026-07-09 09:00:00+00	8
11016	13	19	2026-07-09 14:00:00+00	8
11017	13	19	2026-07-10 09:00:00+00	8
11018	13	19	2026-07-10 14:00:00+00	8
11019	15	19	2026-06-29 09:00:00+00	8
11020	15	19	2026-06-29 14:00:00+00	8
11021	15	19	2026-06-30 09:00:00+00	8
11022	15	19	2026-06-30 14:00:00+00	8
11023	15	19	2026-07-01 09:00:00+00	8
11024	15	19	2026-07-01 14:00:00+00	8
11025	15	19	2026-07-02 09:00:00+00	8
11026	15	19	2026-07-02 14:00:00+00	8
11027	15	19	2026-07-03 09:00:00+00	8
11028	15	19	2026-07-03 14:00:00+00	8
11029	15	19	2026-07-06 09:00:00+00	8
11030	15	19	2026-07-06 14:00:00+00	8
11031	15	19	2026-07-07 09:00:00+00	8
11032	15	19	2026-07-07 14:00:00+00	8
11033	15	19	2026-07-08 09:00:00+00	8
11034	15	19	2026-07-08 14:00:00+00	8
11035	15	19	2026-07-09 09:00:00+00	8
11036	15	19	2026-07-09 14:00:00+00	8
11037	15	19	2026-07-10 09:00:00+00	8
11038	15	19	2026-07-10 14:00:00+00	8
11039	16	19	2026-06-29 09:00:00+00	8
11040	16	19	2026-06-29 14:00:00+00	8
11041	16	19	2026-06-30 09:00:00+00	8
11042	16	19	2026-06-30 14:00:00+00	8
11043	16	19	2026-07-01 09:00:00+00	8
11044	16	19	2026-07-01 14:00:00+00	8
11045	16	19	2026-07-02 09:00:00+00	8
11046	16	19	2026-07-02 14:00:00+00	8
11047	16	19	2026-07-03 09:00:00+00	8
11048	16	19	2026-07-03 14:00:00+00	8
11049	16	19	2026-07-06 09:00:00+00	8
11050	16	19	2026-07-06 14:00:00+00	8
11051	16	19	2026-07-07 09:00:00+00	8
11052	16	19	2026-07-07 14:00:00+00	8
11053	16	19	2026-07-08 09:00:00+00	8
11054	16	19	2026-07-08 14:00:00+00	8
11055	16	19	2026-07-09 09:00:00+00	8
11056	16	19	2026-07-09 14:00:00+00	8
11057	16	19	2026-07-10 09:00:00+00	8
11058	16	19	2026-07-10 14:00:00+00	8
11059	17	19	2026-06-29 09:00:00+00	8
11060	17	19	2026-06-29 14:00:00+00	8
11061	17	19	2026-06-30 09:00:00+00	8
11062	17	19	2026-06-30 14:00:00+00	8
11063	17	19	2026-07-01 09:00:00+00	8
11064	17	19	2026-07-01 14:00:00+00	8
11065	17	19	2026-07-02 09:00:00+00	8
11066	17	19	2026-07-02 14:00:00+00	8
11067	17	19	2026-07-03 09:00:00+00	8
11068	17	19	2026-07-03 14:00:00+00	8
11069	17	19	2026-07-06 09:00:00+00	8
11070	17	19	2026-07-06 14:00:00+00	8
11071	17	19	2026-07-07 09:00:00+00	8
11072	17	19	2026-07-07 14:00:00+00	8
11073	17	19	2026-07-08 09:00:00+00	8
11074	17	19	2026-07-08 14:00:00+00	8
11075	17	19	2026-07-09 09:00:00+00	8
11076	17	19	2026-07-09 14:00:00+00	8
11077	17	19	2026-07-10 09:00:00+00	8
11078	17	19	2026-07-10 14:00:00+00	8
11079	18	19	2026-06-29 09:00:00+00	8
11080	18	19	2026-06-29 14:00:00+00	8
11081	18	19	2026-06-30 09:00:00+00	8
11082	18	19	2026-06-30 14:00:00+00	8
11083	18	19	2026-07-01 09:00:00+00	8
11084	18	19	2026-07-01 14:00:00+00	8
11085	18	19	2026-07-02 09:00:00+00	8
11086	18	19	2026-07-02 14:00:00+00	8
11087	18	19	2026-07-03 09:00:00+00	8
11088	18	19	2026-07-03 14:00:00+00	8
11089	18	19	2026-07-06 09:00:00+00	8
11090	18	19	2026-07-06 14:00:00+00	8
11091	18	19	2026-07-07 09:00:00+00	8
11092	18	19	2026-07-07 14:00:00+00	8
11093	18	19	2026-07-08 09:00:00+00	8
11094	18	19	2026-07-08 14:00:00+00	8
11095	18	19	2026-07-09 09:00:00+00	8
11096	18	19	2026-07-09 14:00:00+00	8
11097	18	19	2026-07-10 09:00:00+00	8
11098	18	19	2026-07-10 14:00:00+00	8
11099	19	19	2026-06-29 09:00:00+00	8
11100	19	19	2026-06-29 14:00:00+00	8
11101	19	19	2026-06-30 09:00:00+00	8
11102	19	19	2026-06-30 14:00:00+00	8
11103	19	19	2026-07-01 09:00:00+00	8
11104	19	19	2026-07-01 14:00:00+00	8
11105	19	19	2026-07-02 09:00:00+00	8
11106	19	19	2026-07-02 14:00:00+00	8
11107	19	19	2026-07-03 09:00:00+00	8
11108	19	19	2026-07-03 14:00:00+00	8
11109	19	19	2026-07-06 09:00:00+00	8
11110	19	19	2026-07-06 14:00:00+00	8
11111	19	19	2026-07-07 09:00:00+00	8
11112	19	19	2026-07-07 14:00:00+00	8
11113	19	19	2026-07-08 09:00:00+00	8
11114	19	19	2026-07-08 14:00:00+00	8
11115	19	19	2026-07-09 09:00:00+00	8
11116	19	19	2026-07-09 14:00:00+00	8
11117	19	19	2026-07-10 09:00:00+00	8
11118	19	19	2026-07-10 14:00:00+00	8
11119	20	19	2026-06-29 09:00:00+00	8
11120	20	19	2026-06-29 14:00:00+00	8
11121	20	19	2026-06-30 09:00:00+00	8
11122	20	19	2026-06-30 14:00:00+00	8
11123	20	19	2026-07-01 09:00:00+00	8
11124	20	19	2026-07-01 14:00:00+00	8
11125	20	19	2026-07-02 09:00:00+00	8
11126	20	19	2026-07-02 14:00:00+00	8
11127	20	19	2026-07-03 09:00:00+00	8
11128	20	19	2026-07-03 14:00:00+00	8
11129	20	19	2026-07-06 09:00:00+00	8
11130	20	19	2026-07-06 14:00:00+00	8
11131	20	19	2026-07-07 09:00:00+00	8
11132	20	19	2026-07-07 14:00:00+00	8
11133	20	19	2026-07-08 09:00:00+00	8
11134	20	19	2026-07-08 14:00:00+00	8
11135	20	19	2026-07-09 09:00:00+00	8
11136	20	19	2026-07-09 14:00:00+00	8
11137	20	19	2026-07-10 09:00:00+00	8
11138	20	19	2026-07-10 14:00:00+00	8
11139	22	19	2026-06-29 09:00:00+00	8
11140	22	19	2026-06-29 14:00:00+00	8
11141	22	19	2026-06-30 09:00:00+00	8
11142	22	19	2026-06-30 14:00:00+00	8
11143	22	19	2026-07-01 09:00:00+00	8
11144	22	19	2026-07-01 14:00:00+00	8
11145	22	19	2026-07-02 09:00:00+00	8
11146	22	19	2026-07-02 14:00:00+00	8
11147	22	19	2026-07-03 09:00:00+00	8
11148	22	19	2026-07-03 14:00:00+00	8
11149	22	19	2026-07-06 09:00:00+00	8
11150	22	19	2026-07-06 14:00:00+00	8
11151	22	19	2026-07-07 09:00:00+00	8
11152	22	19	2026-07-07 14:00:00+00	8
11153	22	19	2026-07-08 09:00:00+00	8
11154	22	19	2026-07-08 14:00:00+00	8
11155	22	19	2026-07-09 09:00:00+00	8
11156	22	19	2026-07-09 14:00:00+00	8
11157	22	19	2026-07-10 09:00:00+00	8
11158	22	19	2026-07-10 14:00:00+00	8
11159	23	19	2026-06-29 09:00:00+00	8
11160	23	19	2026-06-29 14:00:00+00	8
11161	23	19	2026-06-30 09:00:00+00	8
11162	23	19	2026-06-30 14:00:00+00	8
11163	23	19	2026-07-01 09:00:00+00	8
11164	23	19	2026-07-01 14:00:00+00	8
11165	23	19	2026-07-02 09:00:00+00	8
11166	23	19	2026-07-02 14:00:00+00	8
11167	23	19	2026-07-03 09:00:00+00	8
11168	23	19	2026-07-03 14:00:00+00	8
11169	23	19	2026-07-06 09:00:00+00	8
11170	23	19	2026-07-06 14:00:00+00	8
11171	23	19	2026-07-07 09:00:00+00	8
11172	23	19	2026-07-07 14:00:00+00	8
11173	23	19	2026-07-08 09:00:00+00	8
11174	23	19	2026-07-08 14:00:00+00	8
11175	23	19	2026-07-09 09:00:00+00	8
11176	23	19	2026-07-09 14:00:00+00	8
11177	23	19	2026-07-10 09:00:00+00	8
11178	23	19	2026-07-10 14:00:00+00	8
11179	25	19	2026-06-29 09:00:00+00	8
11180	25	19	2026-06-29 14:00:00+00	8
11181	25	19	2026-06-30 09:00:00+00	8
11182	25	19	2026-06-30 14:00:00+00	8
11183	25	19	2026-07-01 09:00:00+00	8
11184	25	19	2026-07-01 14:00:00+00	8
11185	25	19	2026-07-02 09:00:00+00	8
11186	25	19	2026-07-02 14:00:00+00	8
11187	25	19	2026-07-03 09:00:00+00	8
11188	25	19	2026-07-03 14:00:00+00	8
11189	25	19	2026-07-06 09:00:00+00	8
11190	25	19	2026-07-06 14:00:00+00	8
11191	25	19	2026-07-07 09:00:00+00	8
11192	25	19	2026-07-07 14:00:00+00	8
11193	25	19	2026-07-08 09:00:00+00	8
11194	25	19	2026-07-08 14:00:00+00	8
11195	25	19	2026-07-09 09:00:00+00	8
11196	25	19	2026-07-09 14:00:00+00	8
11197	25	19	2026-07-10 09:00:00+00	8
11198	25	19	2026-07-10 14:00:00+00	8
11199	26	19	2026-06-29 09:00:00+00	8
11200	26	19	2026-06-29 14:00:00+00	8
11201	26	19	2026-06-30 09:00:00+00	8
11202	26	19	2026-06-30 14:00:00+00	8
11203	26	19	2026-07-01 09:00:00+00	8
11204	26	19	2026-07-01 14:00:00+00	8
11205	26	19	2026-07-02 09:00:00+00	8
11206	26	19	2026-07-02 14:00:00+00	8
11207	26	19	2026-07-03 09:00:00+00	8
11208	26	19	2026-07-03 14:00:00+00	8
11209	26	19	2026-07-06 09:00:00+00	8
11210	26	19	2026-07-06 14:00:00+00	8
11211	26	19	2026-07-07 09:00:00+00	8
11212	26	19	2026-07-07 14:00:00+00	8
11213	26	19	2026-07-08 09:00:00+00	8
11214	26	19	2026-07-08 14:00:00+00	8
11215	26	19	2026-07-09 09:00:00+00	8
11216	26	19	2026-07-09 14:00:00+00	8
11217	26	19	2026-07-10 09:00:00+00	8
11218	26	19	2026-07-10 14:00:00+00	8
11219	27	19	2026-06-29 09:00:00+00	8
11220	27	19	2026-06-29 14:00:00+00	8
11221	27	19	2026-06-30 09:00:00+00	8
11222	27	19	2026-06-30 14:00:00+00	8
11223	27	19	2026-07-01 09:00:00+00	8
11224	27	19	2026-07-01 14:00:00+00	8
11225	27	19	2026-07-02 09:00:00+00	8
11226	27	19	2026-07-02 14:00:00+00	8
11227	27	19	2026-07-03 09:00:00+00	8
11228	27	19	2026-07-03 14:00:00+00	8
11229	27	19	2026-07-06 09:00:00+00	8
11230	27	19	2026-07-06 14:00:00+00	8
11231	27	19	2026-07-07 09:00:00+00	8
11232	27	19	2026-07-07 14:00:00+00	8
11233	27	19	2026-07-08 09:00:00+00	8
11234	27	19	2026-07-08 14:00:00+00	8
11235	27	19	2026-07-09 09:00:00+00	8
11236	27	19	2026-07-09 14:00:00+00	8
11237	27	19	2026-07-10 09:00:00+00	8
11238	27	19	2026-07-10 14:00:00+00	8
11239	28	19	2026-06-29 09:00:00+00	8
11240	28	19	2026-06-29 14:00:00+00	8
11241	28	19	2026-06-30 09:00:00+00	8
11242	28	19	2026-06-30 14:00:00+00	8
11243	28	19	2026-07-01 09:00:00+00	8
11244	28	19	2026-07-01 14:00:00+00	8
11245	28	19	2026-07-02 09:00:00+00	8
11246	28	19	2026-07-02 14:00:00+00	8
11247	28	19	2026-07-03 09:00:00+00	8
11248	28	19	2026-07-03 14:00:00+00	8
11249	28	19	2026-07-06 09:00:00+00	8
11250	28	19	2026-07-06 14:00:00+00	8
11251	28	19	2026-07-07 09:00:00+00	8
11252	28	19	2026-07-07 14:00:00+00	8
11253	28	19	2026-07-08 09:00:00+00	8
11254	28	19	2026-07-08 14:00:00+00	8
11255	28	19	2026-07-09 09:00:00+00	8
11256	28	19	2026-07-09 14:00:00+00	8
11257	28	19	2026-07-10 09:00:00+00	8
11258	28	19	2026-07-10 14:00:00+00	8
11259	29	19	2026-06-29 09:00:00+00	8
11260	29	19	2026-06-29 14:00:00+00	8
11261	29	19	2026-06-30 09:00:00+00	8
11262	29	19	2026-06-30 14:00:00+00	8
11263	29	19	2026-07-01 09:00:00+00	8
11264	29	19	2026-07-01 14:00:00+00	8
11265	29	19	2026-07-02 09:00:00+00	8
11266	29	19	2026-07-02 14:00:00+00	8
11267	29	19	2026-07-03 09:00:00+00	8
11268	29	19	2026-07-03 14:00:00+00	8
11269	29	19	2026-07-06 09:00:00+00	8
11270	29	19	2026-07-06 14:00:00+00	8
11271	29	19	2026-07-07 09:00:00+00	8
11272	29	19	2026-07-07 14:00:00+00	8
11273	29	19	2026-07-08 09:00:00+00	8
11274	29	19	2026-07-08 14:00:00+00	8
11275	29	19	2026-07-09 09:00:00+00	8
11276	29	19	2026-07-09 14:00:00+00	8
11277	29	19	2026-07-10 09:00:00+00	8
11278	29	19	2026-07-10 14:00:00+00	8
11279	30	19	2026-06-29 09:00:00+00	8
11280	30	19	2026-06-29 14:00:00+00	8
11281	30	19	2026-06-30 09:00:00+00	8
11282	30	19	2026-06-30 14:00:00+00	8
11283	30	19	2026-07-01 09:00:00+00	8
11284	30	19	2026-07-01 14:00:00+00	8
11285	30	19	2026-07-02 09:00:00+00	8
11286	30	19	2026-07-02 14:00:00+00	8
11287	30	19	2026-07-03 09:00:00+00	8
11288	30	19	2026-07-03 14:00:00+00	8
11289	30	19	2026-07-06 09:00:00+00	8
11290	30	19	2026-07-06 14:00:00+00	8
11291	30	19	2026-07-07 09:00:00+00	8
11292	30	19	2026-07-07 14:00:00+00	8
11293	30	19	2026-07-08 09:00:00+00	8
11294	30	19	2026-07-08 14:00:00+00	8
11295	30	19	2026-07-09 09:00:00+00	8
11296	30	19	2026-07-09 14:00:00+00	8
11297	30	19	2026-07-10 09:00:00+00	8
11298	30	19	2026-07-10 14:00:00+00	8
11299	31	19	2026-06-29 09:00:00+00	8
11300	31	19	2026-06-29 14:00:00+00	8
11301	31	19	2026-06-30 09:00:00+00	8
11302	31	19	2026-06-30 14:00:00+00	8
11303	31	19	2026-07-01 09:00:00+00	8
11304	31	19	2026-07-01 14:00:00+00	8
11305	31	19	2026-07-02 09:00:00+00	8
11306	31	19	2026-07-02 14:00:00+00	8
11307	31	19	2026-07-03 09:00:00+00	8
11308	31	19	2026-07-03 14:00:00+00	8
11309	31	19	2026-07-06 09:00:00+00	8
11310	31	19	2026-07-06 14:00:00+00	8
11311	31	19	2026-07-07 09:00:00+00	8
11312	31	19	2026-07-07 14:00:00+00	8
11313	31	19	2026-07-08 09:00:00+00	8
11314	31	19	2026-07-08 14:00:00+00	8
11315	31	19	2026-07-09 09:00:00+00	8
11316	31	19	2026-07-09 14:00:00+00	8
11317	31	19	2026-07-10 09:00:00+00	8
11318	31	19	2026-07-10 14:00:00+00	8
11319	32	19	2026-06-29 09:00:00+00	8
11320	32	19	2026-06-29 14:00:00+00	8
11321	32	19	2026-06-30 09:00:00+00	8
11322	32	19	2026-06-30 14:00:00+00	8
11323	32	19	2026-07-01 09:00:00+00	8
11324	32	19	2026-07-01 14:00:00+00	8
11325	32	19	2026-07-02 09:00:00+00	8
11326	32	19	2026-07-02 14:00:00+00	8
11327	32	19	2026-07-03 09:00:00+00	8
11328	32	19	2026-07-03 14:00:00+00	8
11329	32	19	2026-07-06 09:00:00+00	8
11330	32	19	2026-07-06 14:00:00+00	8
11331	32	19	2026-07-07 09:00:00+00	8
11332	32	19	2026-07-07 14:00:00+00	8
11333	32	19	2026-07-08 09:00:00+00	8
11334	32	19	2026-07-08 14:00:00+00	8
11335	32	19	2026-07-09 09:00:00+00	8
11336	32	19	2026-07-09 14:00:00+00	8
11337	32	19	2026-07-10 09:00:00+00	8
11338	32	19	2026-07-10 14:00:00+00	8
11339	33	19	2026-06-29 09:00:00+00	8
11340	33	19	2026-06-29 14:00:00+00	8
11341	33	19	2026-06-30 09:00:00+00	8
11342	33	19	2026-06-30 14:00:00+00	8
11343	33	19	2026-07-01 09:00:00+00	8
11344	33	19	2026-07-01 14:00:00+00	8
11345	33	19	2026-07-02 09:00:00+00	8
11346	33	19	2026-07-02 14:00:00+00	8
11347	33	19	2026-07-03 09:00:00+00	8
11348	33	19	2026-07-03 14:00:00+00	8
11349	33	19	2026-07-06 09:00:00+00	8
11350	33	19	2026-07-06 14:00:00+00	8
11351	33	19	2026-07-07 09:00:00+00	8
11352	33	19	2026-07-07 14:00:00+00	8
11353	33	19	2026-07-08 09:00:00+00	8
11354	33	19	2026-07-08 14:00:00+00	8
11355	33	19	2026-07-09 09:00:00+00	8
11356	33	19	2026-07-09 14:00:00+00	8
11357	33	19	2026-07-10 09:00:00+00	8
11358	33	19	2026-07-10 14:00:00+00	8
11359	34	19	2026-06-29 09:00:00+00	8
11360	34	19	2026-06-29 14:00:00+00	8
11361	34	19	2026-06-30 09:00:00+00	8
11362	34	19	2026-06-30 14:00:00+00	8
11363	34	19	2026-07-01 09:00:00+00	8
11364	34	19	2026-07-01 14:00:00+00	8
11365	34	19	2026-07-02 09:00:00+00	8
11366	34	19	2026-07-02 14:00:00+00	8
11367	34	19	2026-07-03 09:00:00+00	8
11368	34	19	2026-07-03 14:00:00+00	8
11369	34	19	2026-07-06 09:00:00+00	8
11370	34	19	2026-07-06 14:00:00+00	8
11371	34	19	2026-07-07 09:00:00+00	8
11372	34	19	2026-07-07 14:00:00+00	8
11373	34	19	2026-07-08 09:00:00+00	8
11374	34	19	2026-07-08 14:00:00+00	8
11375	34	19	2026-07-09 09:00:00+00	8
11376	34	19	2026-07-09 14:00:00+00	8
11377	34	19	2026-07-10 09:00:00+00	8
11378	34	19	2026-07-10 14:00:00+00	8
11379	37	19	2026-06-29 09:00:00+00	8
11380	37	19	2026-06-29 14:00:00+00	8
11381	37	19	2026-06-30 09:00:00+00	8
11382	37	19	2026-06-30 14:00:00+00	8
11383	37	19	2026-07-01 09:00:00+00	8
11384	37	19	2026-07-01 14:00:00+00	8
11385	37	19	2026-07-02 09:00:00+00	8
11386	37	19	2026-07-02 14:00:00+00	8
11387	37	19	2026-07-03 09:00:00+00	8
11388	37	19	2026-07-03 14:00:00+00	8
11389	37	19	2026-07-06 09:00:00+00	8
11390	37	19	2026-07-06 14:00:00+00	8
11391	37	19	2026-07-07 09:00:00+00	8
11392	37	19	2026-07-07 14:00:00+00	8
11393	37	19	2026-07-08 09:00:00+00	8
11394	37	19	2026-07-08 14:00:00+00	8
11395	37	19	2026-07-09 09:00:00+00	8
11396	37	19	2026-07-09 14:00:00+00	8
11397	37	19	2026-07-10 09:00:00+00	8
11398	37	19	2026-07-10 14:00:00+00	8
11399	38	19	2026-06-29 09:00:00+00	8
11400	38	19	2026-06-29 14:00:00+00	8
11401	38	19	2026-06-30 09:00:00+00	8
11402	38	19	2026-06-30 14:00:00+00	8
11403	38	19	2026-07-01 09:00:00+00	8
11404	38	19	2026-07-01 14:00:00+00	8
11405	38	19	2026-07-02 09:00:00+00	8
11406	38	19	2026-07-02 14:00:00+00	8
11407	38	19	2026-07-03 09:00:00+00	8
11408	38	19	2026-07-03 14:00:00+00	8
11409	38	19	2026-07-06 09:00:00+00	8
11410	38	19	2026-07-06 14:00:00+00	8
11411	38	19	2026-07-07 09:00:00+00	8
11412	38	19	2026-07-07 14:00:00+00	8
11413	38	19	2026-07-08 09:00:00+00	8
11414	38	19	2026-07-08 14:00:00+00	8
11415	38	19	2026-07-09 09:00:00+00	8
11416	38	19	2026-07-09 14:00:00+00	8
11417	38	19	2026-07-10 09:00:00+00	8
11418	38	19	2026-07-10 14:00:00+00	8
11419	39	19	2026-06-29 09:00:00+00	8
11420	39	19	2026-06-29 14:00:00+00	8
11421	39	19	2026-06-30 09:00:00+00	8
11422	39	19	2026-06-30 14:00:00+00	8
11423	39	19	2026-07-01 09:00:00+00	8
11424	39	19	2026-07-01 14:00:00+00	8
11425	39	19	2026-07-02 09:00:00+00	8
11426	39	19	2026-07-02 14:00:00+00	8
11427	39	19	2026-07-03 09:00:00+00	8
11428	39	19	2026-07-03 14:00:00+00	8
11429	39	19	2026-07-06 09:00:00+00	8
11430	39	19	2026-07-06 14:00:00+00	8
11431	39	19	2026-07-07 09:00:00+00	8
11432	39	19	2026-07-07 14:00:00+00	8
11433	39	19	2026-07-08 09:00:00+00	8
11434	39	19	2026-07-08 14:00:00+00	8
11435	39	19	2026-07-09 09:00:00+00	8
11436	39	19	2026-07-09 14:00:00+00	8
11437	39	19	2026-07-10 09:00:00+00	8
11438	39	19	2026-07-10 14:00:00+00	8
11439	40	19	2026-06-29 09:00:00+00	8
11440	40	19	2026-06-29 14:00:00+00	8
11441	40	19	2026-06-30 09:00:00+00	8
11442	40	19	2026-06-30 14:00:00+00	8
11443	40	19	2026-07-01 09:00:00+00	8
11444	40	19	2026-07-01 14:00:00+00	8
11445	40	19	2026-07-02 09:00:00+00	8
11446	40	19	2026-07-02 14:00:00+00	8
11447	40	19	2026-07-03 09:00:00+00	8
11448	40	19	2026-07-03 14:00:00+00	8
11449	40	19	2026-07-06 09:00:00+00	8
11450	40	19	2026-07-06 14:00:00+00	8
11451	40	19	2026-07-07 09:00:00+00	8
11452	40	19	2026-07-07 14:00:00+00	8
11453	40	19	2026-07-08 09:00:00+00	8
11454	40	19	2026-07-08 14:00:00+00	8
11455	40	19	2026-07-09 09:00:00+00	8
11456	40	19	2026-07-09 14:00:00+00	8
11457	40	19	2026-07-10 09:00:00+00	8
11458	40	19	2026-07-10 14:00:00+00	8
11459	41	19	2026-06-29 09:00:00+00	8
11460	41	19	2026-06-29 14:00:00+00	8
11461	41	19	2026-06-30 09:00:00+00	8
11462	41	19	2026-06-30 14:00:00+00	8
11463	41	19	2026-07-01 09:00:00+00	8
11464	41	19	2026-07-01 14:00:00+00	8
11465	41	19	2026-07-02 09:00:00+00	8
11466	41	19	2026-07-02 14:00:00+00	8
11467	41	19	2026-07-03 09:00:00+00	8
11468	41	19	2026-07-03 14:00:00+00	8
11469	41	19	2026-07-06 09:00:00+00	8
11470	41	19	2026-07-06 14:00:00+00	8
11471	41	19	2026-07-07 09:00:00+00	8
11472	41	19	2026-07-07 14:00:00+00	8
11473	41	19	2026-07-08 09:00:00+00	8
11474	41	19	2026-07-08 14:00:00+00	8
11475	41	19	2026-07-09 09:00:00+00	8
11476	41	19	2026-07-09 14:00:00+00	8
11477	41	19	2026-07-10 09:00:00+00	8
11478	41	19	2026-07-10 14:00:00+00	8
11479	42	19	2026-06-29 09:00:00+00	8
11480	42	19	2026-06-29 14:00:00+00	8
11481	42	19	2026-06-30 09:00:00+00	8
11482	42	19	2026-06-30 14:00:00+00	8
11483	42	19	2026-07-01 09:00:00+00	8
11484	42	19	2026-07-01 14:00:00+00	8
11485	42	19	2026-07-02 09:00:00+00	8
11486	42	19	2026-07-02 14:00:00+00	8
11487	42	19	2026-07-03 09:00:00+00	8
11488	42	19	2026-07-03 14:00:00+00	8
11489	42	19	2026-07-06 09:00:00+00	8
11490	42	19	2026-07-06 14:00:00+00	8
11491	42	19	2026-07-07 09:00:00+00	8
11492	42	19	2026-07-07 14:00:00+00	8
11493	42	19	2026-07-08 09:00:00+00	8
11494	42	19	2026-07-08 14:00:00+00	8
11495	42	19	2026-07-09 09:00:00+00	8
11496	42	19	2026-07-09 14:00:00+00	8
11497	42	19	2026-07-10 09:00:00+00	8
11498	42	19	2026-07-10 14:00:00+00	8
11499	44	19	2026-06-29 09:00:00+00	8
11500	44	19	2026-06-29 14:00:00+00	8
11501	44	19	2026-06-30 09:00:00+00	8
11502	44	19	2026-06-30 14:00:00+00	8
11503	44	19	2026-07-01 09:00:00+00	8
11504	44	19	2026-07-01 14:00:00+00	8
11505	44	19	2026-07-02 09:00:00+00	8
11506	44	19	2026-07-02 14:00:00+00	8
11507	44	19	2026-07-03 09:00:00+00	8
11508	44	19	2026-07-03 14:00:00+00	8
11509	44	19	2026-07-06 09:00:00+00	8
11510	44	19	2026-07-06 14:00:00+00	8
11511	44	19	2026-07-07 09:00:00+00	8
11512	44	19	2026-07-07 14:00:00+00	8
11513	44	19	2026-07-08 09:00:00+00	8
11514	44	19	2026-07-08 14:00:00+00	8
11515	44	19	2026-07-09 09:00:00+00	8
11516	44	19	2026-07-09 14:00:00+00	8
11517	44	19	2026-07-10 09:00:00+00	8
11518	44	19	2026-07-10 14:00:00+00	8
11519	45	19	2026-06-29 09:00:00+00	8
11520	45	19	2026-06-29 14:00:00+00	8
11521	45	19	2026-06-30 09:00:00+00	8
11522	45	19	2026-06-30 14:00:00+00	8
11523	45	19	2026-07-01 09:00:00+00	8
11524	45	19	2026-07-01 14:00:00+00	8
11525	45	19	2026-07-02 09:00:00+00	8
11526	45	19	2026-07-02 14:00:00+00	8
11527	45	19	2026-07-03 09:00:00+00	8
11528	45	19	2026-07-03 14:00:00+00	8
11529	45	19	2026-07-06 09:00:00+00	8
11530	45	19	2026-07-06 14:00:00+00	8
11531	45	19	2026-07-07 09:00:00+00	8
11532	45	19	2026-07-07 14:00:00+00	8
11533	45	19	2026-07-08 09:00:00+00	8
11534	45	19	2026-07-08 14:00:00+00	8
11535	45	19	2026-07-09 09:00:00+00	8
11536	45	19	2026-07-09 14:00:00+00	8
11537	45	19	2026-07-10 09:00:00+00	8
11538	45	19	2026-07-10 14:00:00+00	8
11539	47	19	2026-06-29 09:00:00+00	8
11540	47	19	2026-06-29 14:00:00+00	8
11541	47	19	2026-06-30 09:00:00+00	8
11542	47	19	2026-06-30 14:00:00+00	8
11543	47	19	2026-07-01 09:00:00+00	8
11544	47	19	2026-07-01 14:00:00+00	8
11545	47	19	2026-07-02 09:00:00+00	8
11546	47	19	2026-07-02 14:00:00+00	8
11547	47	19	2026-07-03 09:00:00+00	8
11548	47	19	2026-07-03 14:00:00+00	8
11549	47	19	2026-07-06 09:00:00+00	8
11550	47	19	2026-07-06 14:00:00+00	8
11551	47	19	2026-07-07 09:00:00+00	8
11552	47	19	2026-07-07 14:00:00+00	8
11553	47	19	2026-07-08 09:00:00+00	8
11554	47	19	2026-07-08 14:00:00+00	8
11555	47	19	2026-07-09 09:00:00+00	8
11556	47	19	2026-07-09 14:00:00+00	8
11557	47	19	2026-07-10 09:00:00+00	8
11558	47	19	2026-07-10 14:00:00+00	8
11559	48	19	2026-06-29 09:00:00+00	8
11560	48	19	2026-06-29 14:00:00+00	8
11561	48	19	2026-06-30 09:00:00+00	8
11562	48	19	2026-06-30 14:00:00+00	8
11563	48	19	2026-07-01 09:00:00+00	8
11564	48	19	2026-07-01 14:00:00+00	8
11565	48	19	2026-07-02 09:00:00+00	8
11566	48	19	2026-07-02 14:00:00+00	8
11567	48	19	2026-07-03 09:00:00+00	8
11568	48	19	2026-07-03 14:00:00+00	8
11569	48	19	2026-07-06 09:00:00+00	8
11570	48	19	2026-07-06 14:00:00+00	8
11571	48	19	2026-07-07 09:00:00+00	8
11572	48	19	2026-07-07 14:00:00+00	8
11573	48	19	2026-07-08 09:00:00+00	8
11574	48	19	2026-07-08 14:00:00+00	8
11575	48	19	2026-07-09 09:00:00+00	8
11576	48	19	2026-07-09 14:00:00+00	8
11577	48	19	2026-07-10 09:00:00+00	8
11578	48	19	2026-07-10 14:00:00+00	8
11579	49	19	2026-06-29 09:00:00+00	8
11580	49	19	2026-06-29 14:00:00+00	8
11581	49	19	2026-06-30 09:00:00+00	8
11582	49	19	2026-06-30 14:00:00+00	8
11583	49	19	2026-07-01 09:00:00+00	8
11584	49	19	2026-07-01 14:00:00+00	8
11585	49	19	2026-07-02 09:00:00+00	8
11586	49	19	2026-07-02 14:00:00+00	8
11587	49	19	2026-07-03 09:00:00+00	8
11588	49	19	2026-07-03 14:00:00+00	8
11589	49	19	2026-07-06 09:00:00+00	8
11590	49	19	2026-07-06 14:00:00+00	8
11591	49	19	2026-07-07 09:00:00+00	8
11592	49	19	2026-07-07 14:00:00+00	8
11593	49	19	2026-07-08 09:00:00+00	8
11594	49	19	2026-07-08 14:00:00+00	8
11595	49	19	2026-07-09 09:00:00+00	8
11596	49	19	2026-07-09 14:00:00+00	8
11597	49	19	2026-07-10 09:00:00+00	8
11598	49	19	2026-07-10 14:00:00+00	8
11599	51	19	2026-06-29 09:00:00+00	8
11600	51	19	2026-06-29 14:00:00+00	8
11601	51	19	2026-06-30 09:00:00+00	8
11602	51	19	2026-06-30 14:00:00+00	8
11603	51	19	2026-07-01 09:00:00+00	8
11604	51	19	2026-07-01 14:00:00+00	8
11605	51	19	2026-07-02 09:00:00+00	8
11606	51	19	2026-07-02 14:00:00+00	8
11607	51	19	2026-07-03 09:00:00+00	8
11608	51	19	2026-07-03 14:00:00+00	8
11609	51	19	2026-07-06 09:00:00+00	8
11610	51	19	2026-07-06 14:00:00+00	8
11611	51	19	2026-07-07 09:00:00+00	8
11612	51	19	2026-07-07 14:00:00+00	8
11613	51	19	2026-07-08 09:00:00+00	8
11614	51	19	2026-07-08 14:00:00+00	8
11615	51	19	2026-07-09 09:00:00+00	8
11616	51	19	2026-07-09 14:00:00+00	8
11617	51	19	2026-07-10 09:00:00+00	8
11618	51	19	2026-07-10 14:00:00+00	8
11619	52	19	2026-06-29 09:00:00+00	8
11620	52	19	2026-06-29 14:00:00+00	8
11621	52	19	2026-06-30 09:00:00+00	8
11622	52	19	2026-06-30 14:00:00+00	8
11623	52	19	2026-07-01 09:00:00+00	8
11624	52	19	2026-07-01 14:00:00+00	8
11625	52	19	2026-07-02 09:00:00+00	8
11626	52	19	2026-07-02 14:00:00+00	8
11627	52	19	2026-07-03 09:00:00+00	8
11628	52	19	2026-07-03 14:00:00+00	8
11629	52	19	2026-07-06 09:00:00+00	8
11630	52	19	2026-07-06 14:00:00+00	8
11631	52	19	2026-07-07 09:00:00+00	8
11632	52	19	2026-07-07 14:00:00+00	8
11633	52	19	2026-07-08 09:00:00+00	8
11634	52	19	2026-07-08 14:00:00+00	8
11635	52	19	2026-07-09 09:00:00+00	8
11636	52	19	2026-07-09 14:00:00+00	8
11637	52	19	2026-07-10 09:00:00+00	8
11638	52	19	2026-07-10 14:00:00+00	8
11639	53	19	2026-06-29 09:00:00+00	8
11640	53	19	2026-06-29 14:00:00+00	8
11641	53	19	2026-06-30 09:00:00+00	8
11642	53	19	2026-06-30 14:00:00+00	8
11643	53	19	2026-07-01 09:00:00+00	8
11644	53	19	2026-07-01 14:00:00+00	8
11645	53	19	2026-07-02 09:00:00+00	8
11646	53	19	2026-07-02 14:00:00+00	8
11647	53	19	2026-07-03 09:00:00+00	8
11648	53	19	2026-07-03 14:00:00+00	8
11649	53	19	2026-07-06 09:00:00+00	8
11650	53	19	2026-07-06 14:00:00+00	8
11651	53	19	2026-07-07 09:00:00+00	8
11652	53	19	2026-07-07 14:00:00+00	8
11653	53	19	2026-07-08 09:00:00+00	8
11654	53	19	2026-07-08 14:00:00+00	8
11655	53	19	2026-07-09 09:00:00+00	8
11656	53	19	2026-07-09 14:00:00+00	8
11657	53	19	2026-07-10 09:00:00+00	8
11658	53	19	2026-07-10 14:00:00+00	8
11659	54	19	2026-06-29 09:00:00+00	8
11660	54	19	2026-06-29 14:00:00+00	8
11661	54	19	2026-06-30 09:00:00+00	8
11662	54	19	2026-06-30 14:00:00+00	8
11663	54	19	2026-07-01 09:00:00+00	8
11664	54	19	2026-07-01 14:00:00+00	8
11665	54	19	2026-07-02 09:00:00+00	8
11666	54	19	2026-07-02 14:00:00+00	8
11667	54	19	2026-07-03 09:00:00+00	8
11668	54	19	2026-07-03 14:00:00+00	8
11669	54	19	2026-07-06 09:00:00+00	8
11670	54	19	2026-07-06 14:00:00+00	8
11671	54	19	2026-07-07 09:00:00+00	8
11672	54	19	2026-07-07 14:00:00+00	8
11673	54	19	2026-07-08 09:00:00+00	8
11674	54	19	2026-07-08 14:00:00+00	8
11675	54	19	2026-07-09 09:00:00+00	8
11676	54	19	2026-07-09 14:00:00+00	8
11677	54	19	2026-07-10 09:00:00+00	8
11678	54	19	2026-07-10 14:00:00+00	8
11679	55	19	2026-06-29 09:00:00+00	8
11680	55	19	2026-06-29 14:00:00+00	8
11681	55	19	2026-06-30 09:00:00+00	8
11682	55	19	2026-06-30 14:00:00+00	8
11683	55	19	2026-07-01 09:00:00+00	8
11684	55	19	2026-07-01 14:00:00+00	8
11685	55	19	2026-07-02 09:00:00+00	8
11686	55	19	2026-07-02 14:00:00+00	8
11687	55	19	2026-07-03 09:00:00+00	8
11688	55	19	2026-07-03 14:00:00+00	8
11689	55	19	2026-07-06 09:00:00+00	8
11690	55	19	2026-07-06 14:00:00+00	8
11691	55	19	2026-07-07 09:00:00+00	8
11692	55	19	2026-07-07 14:00:00+00	8
11693	55	19	2026-07-08 09:00:00+00	8
11694	55	19	2026-07-08 14:00:00+00	8
11695	55	19	2026-07-09 09:00:00+00	8
11696	55	19	2026-07-09 14:00:00+00	8
11697	55	19	2026-07-10 09:00:00+00	8
11698	55	19	2026-07-10 14:00:00+00	8
11699	56	19	2026-06-29 09:00:00+00	8
11700	56	19	2026-06-29 14:00:00+00	8
11701	56	19	2026-06-30 09:00:00+00	8
11702	56	19	2026-06-30 14:00:00+00	8
11703	56	19	2026-07-01 09:00:00+00	8
11704	56	19	2026-07-01 14:00:00+00	8
11705	56	19	2026-07-02 09:00:00+00	8
11706	56	19	2026-07-02 14:00:00+00	8
11707	56	19	2026-07-03 09:00:00+00	8
11708	56	19	2026-07-03 14:00:00+00	8
11709	56	19	2026-07-06 09:00:00+00	8
11710	56	19	2026-07-06 14:00:00+00	8
11711	56	19	2026-07-07 09:00:00+00	8
11712	56	19	2026-07-07 14:00:00+00	8
11713	56	19	2026-07-08 09:00:00+00	8
11714	56	19	2026-07-08 14:00:00+00	8
11715	56	19	2026-07-09 09:00:00+00	8
11716	56	19	2026-07-09 14:00:00+00	8
11717	56	19	2026-07-10 09:00:00+00	8
11718	56	19	2026-07-10 14:00:00+00	8
11719	57	19	2026-06-29 09:00:00+00	8
11720	57	19	2026-06-29 14:00:00+00	8
11721	57	19	2026-06-30 09:00:00+00	8
11722	57	19	2026-06-30 14:00:00+00	8
11723	57	19	2026-07-01 09:00:00+00	8
11724	57	19	2026-07-01 14:00:00+00	8
11725	57	19	2026-07-02 09:00:00+00	8
11726	57	19	2026-07-02 14:00:00+00	8
11727	57	19	2026-07-03 09:00:00+00	8
11728	57	19	2026-07-03 14:00:00+00	8
11729	57	19	2026-07-06 09:00:00+00	8
11730	57	19	2026-07-06 14:00:00+00	8
11731	57	19	2026-07-07 09:00:00+00	8
11732	57	19	2026-07-07 14:00:00+00	8
11733	57	19	2026-07-08 09:00:00+00	8
11734	57	19	2026-07-08 14:00:00+00	8
11735	57	19	2026-07-09 09:00:00+00	8
11736	57	19	2026-07-09 14:00:00+00	8
11737	57	19	2026-07-10 09:00:00+00	8
11738	57	19	2026-07-10 14:00:00+00	8
11739	3	20	2026-06-29 09:00:00+00	8
11740	3	20	2026-06-29 14:00:00+00	8
11741	3	20	2026-06-30 09:00:00+00	8
11742	3	20	2026-06-30 14:00:00+00	8
11743	3	20	2026-07-01 09:00:00+00	8
11744	3	20	2026-07-01 14:00:00+00	8
11745	3	20	2026-07-02 09:00:00+00	8
11746	3	20	2026-07-02 14:00:00+00	8
11747	3	20	2026-07-03 09:00:00+00	8
11748	3	20	2026-07-03 14:00:00+00	8
11749	3	20	2026-07-06 09:00:00+00	8
11750	3	20	2026-07-06 14:00:00+00	8
11751	3	20	2026-07-07 09:00:00+00	8
11752	3	20	2026-07-07 14:00:00+00	8
11753	3	20	2026-07-08 09:00:00+00	8
11754	3	20	2026-07-08 14:00:00+00	8
11755	3	20	2026-07-09 09:00:00+00	8
11756	3	20	2026-07-09 14:00:00+00	8
11757	3	20	2026-07-10 09:00:00+00	8
11758	3	20	2026-07-10 14:00:00+00	8
11759	4	20	2026-06-29 09:00:00+00	8
11760	4	20	2026-06-29 14:00:00+00	8
11761	4	20	2026-06-30 09:00:00+00	8
11762	4	20	2026-06-30 14:00:00+00	8
11763	4	20	2026-07-01 09:00:00+00	8
11764	4	20	2026-07-01 14:00:00+00	8
11765	4	20	2026-07-02 09:00:00+00	8
11766	4	20	2026-07-02 14:00:00+00	8
11767	4	20	2026-07-03 09:00:00+00	8
11768	4	20	2026-07-03 14:00:00+00	8
11769	4	20	2026-07-06 09:00:00+00	8
11770	4	20	2026-07-06 14:00:00+00	8
11771	4	20	2026-07-07 09:00:00+00	8
11772	4	20	2026-07-07 14:00:00+00	8
11773	4	20	2026-07-08 09:00:00+00	8
11774	4	20	2026-07-08 14:00:00+00	8
11775	4	20	2026-07-09 09:00:00+00	8
11776	4	20	2026-07-09 14:00:00+00	8
11777	4	20	2026-07-10 09:00:00+00	8
11778	4	20	2026-07-10 14:00:00+00	8
11779	6	20	2026-06-29 09:00:00+00	8
11780	6	20	2026-06-29 14:00:00+00	8
11781	6	20	2026-06-30 09:00:00+00	8
11782	6	20	2026-06-30 14:00:00+00	8
11783	6	20	2026-07-01 09:00:00+00	8
11784	6	20	2026-07-01 14:00:00+00	8
11785	6	20	2026-07-02 09:00:00+00	8
11786	6	20	2026-07-02 14:00:00+00	8
11787	6	20	2026-07-03 09:00:00+00	8
11788	6	20	2026-07-03 14:00:00+00	8
11789	6	20	2026-07-06 09:00:00+00	8
11790	6	20	2026-07-06 14:00:00+00	8
11791	6	20	2026-07-07 09:00:00+00	8
11792	6	20	2026-07-07 14:00:00+00	8
11793	6	20	2026-07-08 09:00:00+00	8
11794	6	20	2026-07-08 14:00:00+00	8
11795	6	20	2026-07-09 09:00:00+00	8
11796	6	20	2026-07-09 14:00:00+00	8
11797	6	20	2026-07-10 09:00:00+00	8
11798	6	20	2026-07-10 14:00:00+00	8
11799	8	20	2026-06-29 09:00:00+00	8
11800	8	20	2026-06-29 14:00:00+00	8
11801	8	20	2026-06-30 09:00:00+00	8
11802	8	20	2026-06-30 14:00:00+00	8
11803	8	20	2026-07-01 09:00:00+00	8
11804	8	20	2026-07-01 14:00:00+00	8
11805	8	20	2026-07-02 09:00:00+00	8
11806	8	20	2026-07-02 14:00:00+00	8
11807	8	20	2026-07-03 09:00:00+00	8
11808	8	20	2026-07-03 14:00:00+00	8
11809	8	20	2026-07-06 09:00:00+00	8
11810	8	20	2026-07-06 14:00:00+00	8
11811	8	20	2026-07-07 09:00:00+00	8
11812	8	20	2026-07-07 14:00:00+00	8
11813	8	20	2026-07-08 09:00:00+00	8
11814	8	20	2026-07-08 14:00:00+00	8
11815	8	20	2026-07-09 09:00:00+00	8
11816	8	20	2026-07-09 14:00:00+00	8
11817	8	20	2026-07-10 09:00:00+00	8
11818	8	20	2026-07-10 14:00:00+00	8
11819	10	20	2026-06-29 09:00:00+00	8
11820	10	20	2026-06-29 14:00:00+00	8
11821	10	20	2026-06-30 09:00:00+00	8
11822	10	20	2026-06-30 14:00:00+00	8
11823	10	20	2026-07-01 09:00:00+00	8
11824	10	20	2026-07-01 14:00:00+00	8
11825	10	20	2026-07-02 09:00:00+00	8
11826	10	20	2026-07-02 14:00:00+00	8
11827	10	20	2026-07-03 09:00:00+00	8
11828	10	20	2026-07-03 14:00:00+00	8
11829	10	20	2026-07-06 09:00:00+00	8
11830	10	20	2026-07-06 14:00:00+00	8
11831	10	20	2026-07-07 09:00:00+00	8
11832	10	20	2026-07-07 14:00:00+00	8
11833	10	20	2026-07-08 09:00:00+00	8
11834	10	20	2026-07-08 14:00:00+00	8
11835	10	20	2026-07-09 09:00:00+00	8
11836	10	20	2026-07-09 14:00:00+00	8
11837	10	20	2026-07-10 09:00:00+00	8
11838	10	20	2026-07-10 14:00:00+00	8
11839	11	20	2026-06-29 09:00:00+00	8
11840	11	20	2026-06-29 14:00:00+00	8
11841	11	20	2026-06-30 09:00:00+00	8
11842	11	20	2026-06-30 14:00:00+00	8
11843	11	20	2026-07-01 09:00:00+00	8
11844	11	20	2026-07-01 14:00:00+00	8
11845	11	20	2026-07-02 09:00:00+00	8
11846	11	20	2026-07-02 14:00:00+00	8
11847	11	20	2026-07-03 09:00:00+00	8
11848	11	20	2026-07-03 14:00:00+00	8
11849	11	20	2026-07-06 09:00:00+00	8
11850	11	20	2026-07-06 14:00:00+00	8
11851	11	20	2026-07-07 09:00:00+00	8
11852	11	20	2026-07-07 14:00:00+00	8
11853	11	20	2026-07-08 09:00:00+00	8
11854	11	20	2026-07-08 14:00:00+00	8
11855	11	20	2026-07-09 09:00:00+00	8
11856	11	20	2026-07-09 14:00:00+00	8
11857	11	20	2026-07-10 09:00:00+00	8
11858	11	20	2026-07-10 14:00:00+00	8
11859	12	20	2026-06-29 09:00:00+00	8
11860	12	20	2026-06-29 14:00:00+00	8
11861	12	20	2026-06-30 09:00:00+00	8
11862	12	20	2026-06-30 14:00:00+00	8
11863	12	20	2026-07-01 09:00:00+00	8
11864	12	20	2026-07-01 14:00:00+00	8
11865	12	20	2026-07-02 09:00:00+00	8
11866	12	20	2026-07-02 14:00:00+00	8
11867	12	20	2026-07-03 09:00:00+00	8
11868	12	20	2026-07-03 14:00:00+00	8
11869	12	20	2026-07-06 09:00:00+00	8
11870	12	20	2026-07-06 14:00:00+00	8
11871	12	20	2026-07-07 09:00:00+00	8
11872	12	20	2026-07-07 14:00:00+00	8
11873	12	20	2026-07-08 09:00:00+00	8
11874	12	20	2026-07-08 14:00:00+00	8
11875	12	20	2026-07-09 09:00:00+00	8
11876	12	20	2026-07-09 14:00:00+00	8
11877	12	20	2026-07-10 09:00:00+00	8
11878	12	20	2026-07-10 14:00:00+00	8
11879	13	20	2026-06-29 09:00:00+00	8
11880	13	20	2026-06-29 14:00:00+00	8
11881	13	20	2026-06-30 09:00:00+00	8
11882	13	20	2026-06-30 14:00:00+00	8
11883	13	20	2026-07-01 09:00:00+00	8
11884	13	20	2026-07-01 14:00:00+00	8
11885	13	20	2026-07-02 09:00:00+00	8
11886	13	20	2026-07-02 14:00:00+00	8
11887	13	20	2026-07-03 09:00:00+00	8
11888	13	20	2026-07-03 14:00:00+00	8
11889	13	20	2026-07-06 09:00:00+00	8
11890	13	20	2026-07-06 14:00:00+00	8
11891	13	20	2026-07-07 09:00:00+00	8
11892	13	20	2026-07-07 14:00:00+00	8
11893	13	20	2026-07-08 09:00:00+00	8
11894	13	20	2026-07-08 14:00:00+00	8
11895	13	20	2026-07-09 09:00:00+00	8
11896	13	20	2026-07-09 14:00:00+00	8
11897	13	20	2026-07-10 09:00:00+00	8
11898	13	20	2026-07-10 14:00:00+00	8
11899	15	20	2026-06-29 09:00:00+00	8
11900	15	20	2026-06-29 14:00:00+00	8
11901	15	20	2026-06-30 09:00:00+00	8
11902	15	20	2026-06-30 14:00:00+00	8
11903	15	20	2026-07-01 09:00:00+00	8
11904	15	20	2026-07-01 14:00:00+00	8
11905	15	20	2026-07-02 09:00:00+00	8
11906	15	20	2026-07-02 14:00:00+00	8
11907	15	20	2026-07-03 09:00:00+00	8
11908	15	20	2026-07-03 14:00:00+00	8
11909	15	20	2026-07-06 09:00:00+00	8
11910	15	20	2026-07-06 14:00:00+00	8
11911	15	20	2026-07-07 09:00:00+00	8
11912	15	20	2026-07-07 14:00:00+00	8
11913	15	20	2026-07-08 09:00:00+00	8
11914	15	20	2026-07-08 14:00:00+00	8
11915	15	20	2026-07-09 09:00:00+00	8
11916	15	20	2026-07-09 14:00:00+00	8
11917	15	20	2026-07-10 09:00:00+00	8
11918	15	20	2026-07-10 14:00:00+00	8
11919	16	20	2026-06-29 09:00:00+00	8
11920	16	20	2026-06-29 14:00:00+00	8
11921	16	20	2026-06-30 09:00:00+00	8
11922	16	20	2026-06-30 14:00:00+00	8
11923	16	20	2026-07-01 09:00:00+00	8
11924	16	20	2026-07-01 14:00:00+00	8
11925	16	20	2026-07-02 09:00:00+00	8
11926	16	20	2026-07-02 14:00:00+00	8
11927	16	20	2026-07-03 09:00:00+00	8
11928	16	20	2026-07-03 14:00:00+00	8
11929	16	20	2026-07-06 09:00:00+00	8
11930	16	20	2026-07-06 14:00:00+00	8
11931	16	20	2026-07-07 09:00:00+00	8
11932	16	20	2026-07-07 14:00:00+00	8
11933	16	20	2026-07-08 09:00:00+00	8
11934	16	20	2026-07-08 14:00:00+00	8
11935	16	20	2026-07-09 09:00:00+00	8
11936	16	20	2026-07-09 14:00:00+00	8
11937	16	20	2026-07-10 09:00:00+00	8
11938	16	20	2026-07-10 14:00:00+00	8
11939	17	20	2026-06-29 09:00:00+00	8
11940	17	20	2026-06-29 14:00:00+00	8
11941	17	20	2026-06-30 09:00:00+00	8
11942	17	20	2026-06-30 14:00:00+00	8
11943	17	20	2026-07-01 09:00:00+00	8
11944	17	20	2026-07-01 14:00:00+00	8
11945	17	20	2026-07-02 09:00:00+00	8
11946	17	20	2026-07-02 14:00:00+00	8
11947	17	20	2026-07-03 09:00:00+00	8
11948	17	20	2026-07-03 14:00:00+00	8
11949	17	20	2026-07-06 09:00:00+00	8
11950	17	20	2026-07-06 14:00:00+00	8
11951	17	20	2026-07-07 09:00:00+00	8
11952	17	20	2026-07-07 14:00:00+00	8
11953	17	20	2026-07-08 09:00:00+00	8
11954	17	20	2026-07-08 14:00:00+00	8
11955	17	20	2026-07-09 09:00:00+00	8
11956	17	20	2026-07-09 14:00:00+00	8
11957	17	20	2026-07-10 09:00:00+00	8
11958	17	20	2026-07-10 14:00:00+00	8
11959	18	20	2026-06-29 09:00:00+00	8
11960	18	20	2026-06-29 14:00:00+00	8
11961	18	20	2026-06-30 09:00:00+00	8
11962	18	20	2026-06-30 14:00:00+00	8
11963	18	20	2026-07-01 09:00:00+00	8
11964	18	20	2026-07-01 14:00:00+00	8
11965	18	20	2026-07-02 09:00:00+00	8
11966	18	20	2026-07-02 14:00:00+00	8
11967	18	20	2026-07-03 09:00:00+00	8
11968	18	20	2026-07-03 14:00:00+00	8
11969	18	20	2026-07-06 09:00:00+00	8
11970	18	20	2026-07-06 14:00:00+00	8
11971	18	20	2026-07-07 09:00:00+00	8
11972	18	20	2026-07-07 14:00:00+00	8
11973	18	20	2026-07-08 09:00:00+00	8
11974	18	20	2026-07-08 14:00:00+00	8
11975	18	20	2026-07-09 09:00:00+00	8
11976	18	20	2026-07-09 14:00:00+00	8
11977	18	20	2026-07-10 09:00:00+00	8
11978	18	20	2026-07-10 14:00:00+00	8
11979	19	20	2026-06-29 09:00:00+00	8
11980	19	20	2026-06-29 14:00:00+00	8
11981	19	20	2026-06-30 09:00:00+00	8
11982	19	20	2026-06-30 14:00:00+00	8
11983	19	20	2026-07-01 09:00:00+00	8
11984	19	20	2026-07-01 14:00:00+00	8
11985	19	20	2026-07-02 09:00:00+00	8
11986	19	20	2026-07-02 14:00:00+00	8
11987	19	20	2026-07-03 09:00:00+00	8
11988	19	20	2026-07-03 14:00:00+00	8
11989	19	20	2026-07-06 09:00:00+00	8
11990	19	20	2026-07-06 14:00:00+00	8
11991	19	20	2026-07-07 09:00:00+00	8
11992	19	20	2026-07-07 14:00:00+00	8
11993	19	20	2026-07-08 09:00:00+00	8
11994	19	20	2026-07-08 14:00:00+00	8
11995	19	20	2026-07-09 09:00:00+00	8
11996	19	20	2026-07-09 14:00:00+00	8
11997	19	20	2026-07-10 09:00:00+00	8
11998	19	20	2026-07-10 14:00:00+00	8
11999	20	20	2026-06-29 09:00:00+00	8
12000	20	20	2026-06-29 14:00:00+00	8
12001	20	20	2026-06-30 09:00:00+00	8
12002	20	20	2026-06-30 14:00:00+00	8
12003	20	20	2026-07-01 09:00:00+00	8
12004	20	20	2026-07-01 14:00:00+00	8
12005	20	20	2026-07-02 09:00:00+00	8
12006	20	20	2026-07-02 14:00:00+00	8
12007	20	20	2026-07-03 09:00:00+00	8
12008	20	20	2026-07-03 14:00:00+00	8
12009	20	20	2026-07-06 09:00:00+00	8
12010	20	20	2026-07-06 14:00:00+00	8
12011	20	20	2026-07-07 09:00:00+00	8
12012	20	20	2026-07-07 14:00:00+00	8
12013	20	20	2026-07-08 09:00:00+00	8
12014	20	20	2026-07-08 14:00:00+00	8
12015	20	20	2026-07-09 09:00:00+00	8
12016	20	20	2026-07-09 14:00:00+00	8
12017	20	20	2026-07-10 09:00:00+00	8
12018	20	20	2026-07-10 14:00:00+00	8
12019	22	20	2026-06-29 09:00:00+00	8
12020	22	20	2026-06-29 14:00:00+00	8
12021	22	20	2026-06-30 09:00:00+00	8
12022	22	20	2026-06-30 14:00:00+00	8
12023	22	20	2026-07-01 09:00:00+00	8
12024	22	20	2026-07-01 14:00:00+00	8
12025	22	20	2026-07-02 09:00:00+00	8
12026	22	20	2026-07-02 14:00:00+00	8
12027	22	20	2026-07-03 09:00:00+00	8
12028	22	20	2026-07-03 14:00:00+00	8
12029	22	20	2026-07-06 09:00:00+00	8
12030	22	20	2026-07-06 14:00:00+00	8
12031	22	20	2026-07-07 09:00:00+00	8
12032	22	20	2026-07-07 14:00:00+00	8
12033	22	20	2026-07-08 09:00:00+00	8
12034	22	20	2026-07-08 14:00:00+00	8
12035	22	20	2026-07-09 09:00:00+00	8
12036	22	20	2026-07-09 14:00:00+00	8
12037	22	20	2026-07-10 09:00:00+00	8
12038	22	20	2026-07-10 14:00:00+00	8
12039	23	20	2026-06-29 09:00:00+00	8
12040	23	20	2026-06-29 14:00:00+00	8
12041	23	20	2026-06-30 09:00:00+00	8
12042	23	20	2026-06-30 14:00:00+00	8
12043	23	20	2026-07-01 09:00:00+00	8
12044	23	20	2026-07-01 14:00:00+00	8
12045	23	20	2026-07-02 09:00:00+00	8
12046	23	20	2026-07-02 14:00:00+00	8
12047	23	20	2026-07-03 09:00:00+00	8
12048	23	20	2026-07-03 14:00:00+00	8
12049	23	20	2026-07-06 09:00:00+00	8
12050	23	20	2026-07-06 14:00:00+00	8
12051	23	20	2026-07-07 09:00:00+00	8
12052	23	20	2026-07-07 14:00:00+00	8
12053	23	20	2026-07-08 09:00:00+00	8
12054	23	20	2026-07-08 14:00:00+00	8
12055	23	20	2026-07-09 09:00:00+00	8
12056	23	20	2026-07-09 14:00:00+00	8
12057	23	20	2026-07-10 09:00:00+00	8
12058	23	20	2026-07-10 14:00:00+00	8
12059	25	20	2026-06-29 09:00:00+00	8
12060	25	20	2026-06-29 14:00:00+00	8
12061	25	20	2026-06-30 09:00:00+00	8
12062	25	20	2026-06-30 14:00:00+00	8
12063	25	20	2026-07-01 09:00:00+00	8
12064	25	20	2026-07-01 14:00:00+00	8
12065	25	20	2026-07-02 09:00:00+00	8
12066	25	20	2026-07-02 14:00:00+00	8
12067	25	20	2026-07-03 09:00:00+00	8
12068	25	20	2026-07-03 14:00:00+00	8
12069	25	20	2026-07-06 09:00:00+00	8
12070	25	20	2026-07-06 14:00:00+00	8
12071	25	20	2026-07-07 09:00:00+00	8
12072	25	20	2026-07-07 14:00:00+00	8
12073	25	20	2026-07-08 09:00:00+00	8
12074	25	20	2026-07-08 14:00:00+00	8
12075	25	20	2026-07-09 09:00:00+00	8
12076	25	20	2026-07-09 14:00:00+00	8
12077	25	20	2026-07-10 09:00:00+00	8
12078	25	20	2026-07-10 14:00:00+00	8
12079	26	20	2026-06-29 09:00:00+00	8
12080	26	20	2026-06-29 14:00:00+00	8
12081	26	20	2026-06-30 09:00:00+00	8
12082	26	20	2026-06-30 14:00:00+00	8
12083	26	20	2026-07-01 09:00:00+00	8
12084	26	20	2026-07-01 14:00:00+00	8
12085	26	20	2026-07-02 09:00:00+00	8
12086	26	20	2026-07-02 14:00:00+00	8
12087	26	20	2026-07-03 09:00:00+00	8
12088	26	20	2026-07-03 14:00:00+00	8
12089	26	20	2026-07-06 09:00:00+00	8
12090	26	20	2026-07-06 14:00:00+00	8
12091	26	20	2026-07-07 09:00:00+00	8
12092	26	20	2026-07-07 14:00:00+00	8
12093	26	20	2026-07-08 09:00:00+00	8
12094	26	20	2026-07-08 14:00:00+00	8
12095	26	20	2026-07-09 09:00:00+00	8
12096	26	20	2026-07-09 14:00:00+00	8
12097	26	20	2026-07-10 09:00:00+00	8
12098	26	20	2026-07-10 14:00:00+00	8
12099	27	20	2026-06-29 09:00:00+00	8
12100	27	20	2026-06-29 14:00:00+00	8
12101	27	20	2026-06-30 09:00:00+00	8
12102	27	20	2026-06-30 14:00:00+00	8
12103	27	20	2026-07-01 09:00:00+00	8
12104	27	20	2026-07-01 14:00:00+00	8
12105	27	20	2026-07-02 09:00:00+00	8
12106	27	20	2026-07-02 14:00:00+00	8
12107	27	20	2026-07-03 09:00:00+00	8
12108	27	20	2026-07-03 14:00:00+00	8
12109	27	20	2026-07-06 09:00:00+00	8
12110	27	20	2026-07-06 14:00:00+00	8
12111	27	20	2026-07-07 09:00:00+00	8
12112	27	20	2026-07-07 14:00:00+00	8
12113	27	20	2026-07-08 09:00:00+00	8
12114	27	20	2026-07-08 14:00:00+00	8
12115	27	20	2026-07-09 09:00:00+00	8
12116	27	20	2026-07-09 14:00:00+00	8
12117	27	20	2026-07-10 09:00:00+00	8
12118	27	20	2026-07-10 14:00:00+00	8
12119	28	20	2026-06-29 09:00:00+00	8
12120	28	20	2026-06-29 14:00:00+00	8
12121	28	20	2026-06-30 09:00:00+00	8
12122	28	20	2026-06-30 14:00:00+00	8
12123	28	20	2026-07-01 09:00:00+00	8
12124	28	20	2026-07-01 14:00:00+00	8
12125	28	20	2026-07-02 09:00:00+00	8
12126	28	20	2026-07-02 14:00:00+00	8
12127	28	20	2026-07-03 09:00:00+00	8
12128	28	20	2026-07-03 14:00:00+00	8
12129	28	20	2026-07-06 09:00:00+00	8
12130	28	20	2026-07-06 14:00:00+00	8
12131	28	20	2026-07-07 09:00:00+00	8
12132	28	20	2026-07-07 14:00:00+00	8
12133	28	20	2026-07-08 09:00:00+00	8
12134	28	20	2026-07-08 14:00:00+00	8
12135	28	20	2026-07-09 09:00:00+00	8
12136	28	20	2026-07-09 14:00:00+00	8
12137	28	20	2026-07-10 09:00:00+00	8
12138	28	20	2026-07-10 14:00:00+00	8
12139	29	20	2026-06-29 09:00:00+00	8
12140	29	20	2026-06-29 14:00:00+00	8
12141	29	20	2026-06-30 09:00:00+00	8
12142	29	20	2026-06-30 14:00:00+00	8
12143	29	20	2026-07-01 09:00:00+00	8
12144	29	20	2026-07-01 14:00:00+00	8
12145	29	20	2026-07-02 09:00:00+00	8
12146	29	20	2026-07-02 14:00:00+00	8
12147	29	20	2026-07-03 09:00:00+00	8
12148	29	20	2026-07-03 14:00:00+00	8
12149	29	20	2026-07-06 09:00:00+00	8
12150	29	20	2026-07-06 14:00:00+00	8
12151	29	20	2026-07-07 09:00:00+00	8
12152	29	20	2026-07-07 14:00:00+00	8
12153	29	20	2026-07-08 09:00:00+00	8
12154	29	20	2026-07-08 14:00:00+00	8
12155	29	20	2026-07-09 09:00:00+00	8
12156	29	20	2026-07-09 14:00:00+00	8
12157	29	20	2026-07-10 09:00:00+00	8
12158	29	20	2026-07-10 14:00:00+00	8
12159	30	20	2026-06-29 09:00:00+00	8
12160	30	20	2026-06-29 14:00:00+00	8
12161	30	20	2026-06-30 09:00:00+00	8
12162	30	20	2026-06-30 14:00:00+00	8
12163	30	20	2026-07-01 09:00:00+00	8
12164	30	20	2026-07-01 14:00:00+00	8
12165	30	20	2026-07-02 09:00:00+00	8
12166	30	20	2026-07-02 14:00:00+00	8
12167	30	20	2026-07-03 09:00:00+00	8
12168	30	20	2026-07-03 14:00:00+00	8
12169	30	20	2026-07-06 09:00:00+00	8
12170	30	20	2026-07-06 14:00:00+00	8
12171	30	20	2026-07-07 09:00:00+00	8
12172	30	20	2026-07-07 14:00:00+00	8
12173	30	20	2026-07-08 09:00:00+00	8
12174	30	20	2026-07-08 14:00:00+00	8
12175	30	20	2026-07-09 09:00:00+00	8
12176	30	20	2026-07-09 14:00:00+00	8
12177	30	20	2026-07-10 09:00:00+00	8
12178	30	20	2026-07-10 14:00:00+00	8
12179	31	20	2026-06-29 09:00:00+00	8
12180	31	20	2026-06-29 14:00:00+00	8
12181	31	20	2026-06-30 09:00:00+00	8
12182	31	20	2026-06-30 14:00:00+00	8
12183	31	20	2026-07-01 09:00:00+00	8
12184	31	20	2026-07-01 14:00:00+00	8
12185	31	20	2026-07-02 09:00:00+00	8
12186	31	20	2026-07-02 14:00:00+00	8
12187	31	20	2026-07-03 09:00:00+00	8
12188	31	20	2026-07-03 14:00:00+00	8
12189	31	20	2026-07-06 09:00:00+00	8
12190	31	20	2026-07-06 14:00:00+00	8
12191	31	20	2026-07-07 09:00:00+00	8
12192	31	20	2026-07-07 14:00:00+00	8
12193	31	20	2026-07-08 09:00:00+00	8
12194	31	20	2026-07-08 14:00:00+00	8
12195	31	20	2026-07-09 09:00:00+00	8
12196	31	20	2026-07-09 14:00:00+00	8
12197	31	20	2026-07-10 09:00:00+00	8
12198	31	20	2026-07-10 14:00:00+00	8
12199	32	20	2026-06-29 09:00:00+00	8
12200	32	20	2026-06-29 14:00:00+00	8
12201	32	20	2026-06-30 09:00:00+00	8
12202	32	20	2026-06-30 14:00:00+00	8
12203	32	20	2026-07-01 09:00:00+00	8
12204	32	20	2026-07-01 14:00:00+00	8
12205	32	20	2026-07-02 09:00:00+00	8
12206	32	20	2026-07-02 14:00:00+00	8
12207	32	20	2026-07-03 09:00:00+00	8
12208	32	20	2026-07-03 14:00:00+00	8
12209	32	20	2026-07-06 09:00:00+00	8
12210	32	20	2026-07-06 14:00:00+00	8
12211	32	20	2026-07-07 09:00:00+00	8
12212	32	20	2026-07-07 14:00:00+00	8
12213	32	20	2026-07-08 09:00:00+00	8
12214	32	20	2026-07-08 14:00:00+00	8
12215	32	20	2026-07-09 09:00:00+00	8
12216	32	20	2026-07-09 14:00:00+00	8
12217	32	20	2026-07-10 09:00:00+00	8
12218	32	20	2026-07-10 14:00:00+00	8
12219	33	20	2026-06-29 09:00:00+00	8
12220	33	20	2026-06-29 14:00:00+00	8
12221	33	20	2026-06-30 09:00:00+00	8
12222	33	20	2026-06-30 14:00:00+00	8
12223	33	20	2026-07-01 09:00:00+00	8
12224	33	20	2026-07-01 14:00:00+00	8
12225	33	20	2026-07-02 09:00:00+00	8
12226	33	20	2026-07-02 14:00:00+00	8
12227	33	20	2026-07-03 09:00:00+00	8
12228	33	20	2026-07-03 14:00:00+00	8
12229	33	20	2026-07-06 09:00:00+00	8
12230	33	20	2026-07-06 14:00:00+00	8
12231	33	20	2026-07-07 09:00:00+00	8
12232	33	20	2026-07-07 14:00:00+00	8
12233	33	20	2026-07-08 09:00:00+00	8
12234	33	20	2026-07-08 14:00:00+00	8
12235	33	20	2026-07-09 09:00:00+00	8
12236	33	20	2026-07-09 14:00:00+00	8
12237	33	20	2026-07-10 09:00:00+00	8
12238	33	20	2026-07-10 14:00:00+00	8
12239	34	20	2026-06-29 09:00:00+00	8
12240	34	20	2026-06-29 14:00:00+00	8
12241	34	20	2026-06-30 09:00:00+00	8
12242	34	20	2026-06-30 14:00:00+00	8
12243	34	20	2026-07-01 09:00:00+00	8
12244	34	20	2026-07-01 14:00:00+00	8
12245	34	20	2026-07-02 09:00:00+00	8
12246	34	20	2026-07-02 14:00:00+00	8
12247	34	20	2026-07-03 09:00:00+00	8
12248	34	20	2026-07-03 14:00:00+00	8
12249	34	20	2026-07-06 09:00:00+00	8
12250	34	20	2026-07-06 14:00:00+00	8
12251	34	20	2026-07-07 09:00:00+00	8
12252	34	20	2026-07-07 14:00:00+00	8
12253	34	20	2026-07-08 09:00:00+00	8
12254	34	20	2026-07-08 14:00:00+00	8
12255	34	20	2026-07-09 09:00:00+00	8
12256	34	20	2026-07-09 14:00:00+00	8
12257	34	20	2026-07-10 09:00:00+00	8
12258	34	20	2026-07-10 14:00:00+00	8
12259	37	20	2026-06-29 09:00:00+00	8
12260	37	20	2026-06-29 14:00:00+00	8
12261	37	20	2026-06-30 09:00:00+00	8
12262	37	20	2026-06-30 14:00:00+00	8
12263	37	20	2026-07-01 09:00:00+00	8
12264	37	20	2026-07-01 14:00:00+00	8
12265	37	20	2026-07-02 09:00:00+00	8
12266	37	20	2026-07-02 14:00:00+00	8
12267	37	20	2026-07-03 09:00:00+00	8
12268	37	20	2026-07-03 14:00:00+00	8
12269	37	20	2026-07-06 09:00:00+00	8
12270	37	20	2026-07-06 14:00:00+00	8
12271	37	20	2026-07-07 09:00:00+00	8
12272	37	20	2026-07-07 14:00:00+00	8
12273	37	20	2026-07-08 09:00:00+00	8
12274	37	20	2026-07-08 14:00:00+00	8
12275	37	20	2026-07-09 09:00:00+00	8
12276	37	20	2026-07-09 14:00:00+00	8
12277	37	20	2026-07-10 09:00:00+00	8
12278	37	20	2026-07-10 14:00:00+00	8
12279	38	20	2026-06-29 09:00:00+00	8
12280	38	20	2026-06-29 14:00:00+00	8
12281	38	20	2026-06-30 09:00:00+00	8
12282	38	20	2026-06-30 14:00:00+00	8
12283	38	20	2026-07-01 09:00:00+00	8
12284	38	20	2026-07-01 14:00:00+00	8
12285	38	20	2026-07-02 09:00:00+00	8
12286	38	20	2026-07-02 14:00:00+00	8
12287	38	20	2026-07-03 09:00:00+00	8
12288	38	20	2026-07-03 14:00:00+00	8
12289	38	20	2026-07-06 09:00:00+00	8
12290	38	20	2026-07-06 14:00:00+00	8
12291	38	20	2026-07-07 09:00:00+00	8
12292	38	20	2026-07-07 14:00:00+00	8
12293	38	20	2026-07-08 09:00:00+00	8
12294	38	20	2026-07-08 14:00:00+00	8
12295	38	20	2026-07-09 09:00:00+00	8
12296	38	20	2026-07-09 14:00:00+00	8
12297	38	20	2026-07-10 09:00:00+00	8
12298	38	20	2026-07-10 14:00:00+00	8
12299	39	20	2026-06-29 09:00:00+00	8
12300	39	20	2026-06-29 14:00:00+00	8
12301	39	20	2026-06-30 09:00:00+00	8
12302	39	20	2026-06-30 14:00:00+00	8
12303	39	20	2026-07-01 09:00:00+00	8
12304	39	20	2026-07-01 14:00:00+00	8
12305	39	20	2026-07-02 09:00:00+00	8
12306	39	20	2026-07-02 14:00:00+00	8
12307	39	20	2026-07-03 09:00:00+00	8
12308	39	20	2026-07-03 14:00:00+00	8
12309	39	20	2026-07-06 09:00:00+00	8
12310	39	20	2026-07-06 14:00:00+00	8
12311	39	20	2026-07-07 09:00:00+00	8
12312	39	20	2026-07-07 14:00:00+00	8
12313	39	20	2026-07-08 09:00:00+00	8
12314	39	20	2026-07-08 14:00:00+00	8
12315	39	20	2026-07-09 09:00:00+00	8
12316	39	20	2026-07-09 14:00:00+00	8
12317	39	20	2026-07-10 09:00:00+00	8
12318	39	20	2026-07-10 14:00:00+00	8
12319	40	20	2026-06-29 09:00:00+00	8
12320	40	20	2026-06-29 14:00:00+00	8
12321	40	20	2026-06-30 09:00:00+00	8
12322	40	20	2026-06-30 14:00:00+00	8
12323	40	20	2026-07-01 09:00:00+00	8
12324	40	20	2026-07-01 14:00:00+00	8
12325	40	20	2026-07-02 09:00:00+00	8
12326	40	20	2026-07-02 14:00:00+00	8
12327	40	20	2026-07-03 09:00:00+00	8
12328	40	20	2026-07-03 14:00:00+00	8
12329	40	20	2026-07-06 09:00:00+00	8
12330	40	20	2026-07-06 14:00:00+00	8
12331	40	20	2026-07-07 09:00:00+00	8
12332	40	20	2026-07-07 14:00:00+00	8
12333	40	20	2026-07-08 09:00:00+00	8
12334	40	20	2026-07-08 14:00:00+00	8
12335	40	20	2026-07-09 09:00:00+00	8
12336	40	20	2026-07-09 14:00:00+00	8
12337	40	20	2026-07-10 09:00:00+00	8
12338	40	20	2026-07-10 14:00:00+00	8
12339	41	20	2026-06-29 09:00:00+00	8
12340	41	20	2026-06-29 14:00:00+00	8
12341	41	20	2026-06-30 09:00:00+00	8
12342	41	20	2026-06-30 14:00:00+00	8
12343	41	20	2026-07-01 09:00:00+00	8
12344	41	20	2026-07-01 14:00:00+00	8
12345	41	20	2026-07-02 09:00:00+00	8
12346	41	20	2026-07-02 14:00:00+00	8
12347	41	20	2026-07-03 09:00:00+00	8
12348	41	20	2026-07-03 14:00:00+00	8
12349	41	20	2026-07-06 09:00:00+00	8
12350	41	20	2026-07-06 14:00:00+00	8
12351	41	20	2026-07-07 09:00:00+00	8
12352	41	20	2026-07-07 14:00:00+00	8
12353	41	20	2026-07-08 09:00:00+00	8
12354	41	20	2026-07-08 14:00:00+00	8
12355	41	20	2026-07-09 09:00:00+00	8
12356	41	20	2026-07-09 14:00:00+00	8
12357	41	20	2026-07-10 09:00:00+00	8
12358	41	20	2026-07-10 14:00:00+00	8
12359	42	20	2026-06-29 09:00:00+00	8
12360	42	20	2026-06-29 14:00:00+00	8
12361	42	20	2026-06-30 09:00:00+00	8
12362	42	20	2026-06-30 14:00:00+00	8
12363	42	20	2026-07-01 09:00:00+00	8
12364	42	20	2026-07-01 14:00:00+00	8
12365	42	20	2026-07-02 09:00:00+00	8
12366	42	20	2026-07-02 14:00:00+00	8
12367	42	20	2026-07-03 09:00:00+00	8
12368	42	20	2026-07-03 14:00:00+00	8
12369	42	20	2026-07-06 09:00:00+00	8
12370	42	20	2026-07-06 14:00:00+00	8
12371	42	20	2026-07-07 09:00:00+00	8
12372	42	20	2026-07-07 14:00:00+00	8
12373	42	20	2026-07-08 09:00:00+00	8
12374	42	20	2026-07-08 14:00:00+00	8
12375	42	20	2026-07-09 09:00:00+00	8
12376	42	20	2026-07-09 14:00:00+00	8
12377	42	20	2026-07-10 09:00:00+00	8
12378	42	20	2026-07-10 14:00:00+00	8
12379	44	20	2026-06-29 09:00:00+00	8
12380	44	20	2026-06-29 14:00:00+00	8
12381	44	20	2026-06-30 09:00:00+00	8
12382	44	20	2026-06-30 14:00:00+00	8
12383	44	20	2026-07-01 09:00:00+00	8
12384	44	20	2026-07-01 14:00:00+00	8
12385	44	20	2026-07-02 09:00:00+00	8
12386	44	20	2026-07-02 14:00:00+00	8
12387	44	20	2026-07-03 09:00:00+00	8
12388	44	20	2026-07-03 14:00:00+00	8
12389	44	20	2026-07-06 09:00:00+00	8
12390	44	20	2026-07-06 14:00:00+00	8
12391	44	20	2026-07-07 09:00:00+00	8
12392	44	20	2026-07-07 14:00:00+00	8
12393	44	20	2026-07-08 09:00:00+00	8
12394	44	20	2026-07-08 14:00:00+00	8
12395	44	20	2026-07-09 09:00:00+00	8
12396	44	20	2026-07-09 14:00:00+00	8
12397	44	20	2026-07-10 09:00:00+00	8
12398	44	20	2026-07-10 14:00:00+00	8
12399	45	20	2026-06-29 09:00:00+00	8
12400	45	20	2026-06-29 14:00:00+00	8
12401	45	20	2026-06-30 09:00:00+00	8
12402	45	20	2026-06-30 14:00:00+00	8
12403	45	20	2026-07-01 09:00:00+00	8
12404	45	20	2026-07-01 14:00:00+00	8
12405	45	20	2026-07-02 09:00:00+00	8
12406	45	20	2026-07-02 14:00:00+00	8
12407	45	20	2026-07-03 09:00:00+00	8
12408	45	20	2026-07-03 14:00:00+00	8
12409	45	20	2026-07-06 09:00:00+00	8
12410	45	20	2026-07-06 14:00:00+00	8
12411	45	20	2026-07-07 09:00:00+00	8
12412	45	20	2026-07-07 14:00:00+00	8
12413	45	20	2026-07-08 09:00:00+00	8
12414	45	20	2026-07-08 14:00:00+00	8
12415	45	20	2026-07-09 09:00:00+00	8
12416	45	20	2026-07-09 14:00:00+00	8
12417	45	20	2026-07-10 09:00:00+00	8
12418	45	20	2026-07-10 14:00:00+00	8
12419	47	20	2026-06-29 09:00:00+00	8
12420	47	20	2026-06-29 14:00:00+00	8
12421	47	20	2026-06-30 09:00:00+00	8
12422	47	20	2026-06-30 14:00:00+00	8
12423	47	20	2026-07-01 09:00:00+00	8
12424	47	20	2026-07-01 14:00:00+00	8
12425	47	20	2026-07-02 09:00:00+00	8
12426	47	20	2026-07-02 14:00:00+00	8
12427	47	20	2026-07-03 09:00:00+00	8
12428	47	20	2026-07-03 14:00:00+00	8
12429	47	20	2026-07-06 09:00:00+00	8
12430	47	20	2026-07-06 14:00:00+00	8
12431	47	20	2026-07-07 09:00:00+00	8
12432	47	20	2026-07-07 14:00:00+00	8
12433	47	20	2026-07-08 09:00:00+00	8
12434	47	20	2026-07-08 14:00:00+00	8
12435	47	20	2026-07-09 09:00:00+00	8
12436	47	20	2026-07-09 14:00:00+00	8
12437	47	20	2026-07-10 09:00:00+00	8
12438	47	20	2026-07-10 14:00:00+00	8
12439	48	20	2026-06-29 09:00:00+00	8
12440	48	20	2026-06-29 14:00:00+00	8
12441	48	20	2026-06-30 09:00:00+00	8
12442	48	20	2026-06-30 14:00:00+00	8
12443	48	20	2026-07-01 09:00:00+00	8
12444	48	20	2026-07-01 14:00:00+00	8
12445	48	20	2026-07-02 09:00:00+00	8
12446	48	20	2026-07-02 14:00:00+00	8
12447	48	20	2026-07-03 09:00:00+00	8
12448	48	20	2026-07-03 14:00:00+00	8
12449	48	20	2026-07-06 09:00:00+00	8
12450	48	20	2026-07-06 14:00:00+00	8
12451	48	20	2026-07-07 09:00:00+00	8
12452	48	20	2026-07-07 14:00:00+00	8
12453	48	20	2026-07-08 09:00:00+00	8
12454	48	20	2026-07-08 14:00:00+00	8
12455	48	20	2026-07-09 09:00:00+00	8
12456	48	20	2026-07-09 14:00:00+00	8
12457	48	20	2026-07-10 09:00:00+00	8
12458	48	20	2026-07-10 14:00:00+00	8
12459	49	20	2026-06-29 09:00:00+00	8
12460	49	20	2026-06-29 14:00:00+00	8
12461	49	20	2026-06-30 09:00:00+00	8
12462	49	20	2026-06-30 14:00:00+00	8
12463	49	20	2026-07-01 09:00:00+00	8
12464	49	20	2026-07-01 14:00:00+00	8
12465	49	20	2026-07-02 09:00:00+00	8
12466	49	20	2026-07-02 14:00:00+00	8
12467	49	20	2026-07-03 09:00:00+00	8
12468	49	20	2026-07-03 14:00:00+00	8
12469	49	20	2026-07-06 09:00:00+00	8
12470	49	20	2026-07-06 14:00:00+00	8
12471	49	20	2026-07-07 09:00:00+00	8
12472	49	20	2026-07-07 14:00:00+00	8
12473	49	20	2026-07-08 09:00:00+00	8
12474	49	20	2026-07-08 14:00:00+00	8
12475	49	20	2026-07-09 09:00:00+00	8
12476	49	20	2026-07-09 14:00:00+00	8
12477	49	20	2026-07-10 09:00:00+00	8
12478	49	20	2026-07-10 14:00:00+00	8
12479	51	20	2026-06-29 09:00:00+00	8
12480	51	20	2026-06-29 14:00:00+00	8
12481	51	20	2026-06-30 09:00:00+00	8
12482	51	20	2026-06-30 14:00:00+00	8
12483	51	20	2026-07-01 09:00:00+00	8
12484	51	20	2026-07-01 14:00:00+00	8
12485	51	20	2026-07-02 09:00:00+00	8
12486	51	20	2026-07-02 14:00:00+00	8
12487	51	20	2026-07-03 09:00:00+00	8
12488	51	20	2026-07-03 14:00:00+00	8
12489	51	20	2026-07-06 09:00:00+00	8
12490	51	20	2026-07-06 14:00:00+00	8
12491	51	20	2026-07-07 09:00:00+00	8
12492	51	20	2026-07-07 14:00:00+00	8
12493	51	20	2026-07-08 09:00:00+00	8
12494	51	20	2026-07-08 14:00:00+00	8
12495	51	20	2026-07-09 09:00:00+00	8
12496	51	20	2026-07-09 14:00:00+00	8
12497	51	20	2026-07-10 09:00:00+00	8
12498	51	20	2026-07-10 14:00:00+00	8
12499	52	20	2026-06-29 09:00:00+00	8
12500	52	20	2026-06-29 14:00:00+00	8
12501	52	20	2026-06-30 09:00:00+00	8
12502	52	20	2026-06-30 14:00:00+00	8
12503	52	20	2026-07-01 09:00:00+00	8
12504	52	20	2026-07-01 14:00:00+00	8
12505	52	20	2026-07-02 09:00:00+00	8
12506	52	20	2026-07-02 14:00:00+00	8
12507	52	20	2026-07-03 09:00:00+00	8
12508	52	20	2026-07-03 14:00:00+00	8
12509	52	20	2026-07-06 09:00:00+00	8
12510	52	20	2026-07-06 14:00:00+00	8
12511	52	20	2026-07-07 09:00:00+00	8
12512	52	20	2026-07-07 14:00:00+00	8
12513	52	20	2026-07-08 09:00:00+00	8
12514	52	20	2026-07-08 14:00:00+00	8
12515	52	20	2026-07-09 09:00:00+00	8
12516	52	20	2026-07-09 14:00:00+00	8
12517	52	20	2026-07-10 09:00:00+00	8
12518	52	20	2026-07-10 14:00:00+00	8
12519	53	20	2026-06-29 09:00:00+00	8
12520	53	20	2026-06-29 14:00:00+00	8
12521	53	20	2026-06-30 09:00:00+00	8
12522	53	20	2026-06-30 14:00:00+00	8
12523	53	20	2026-07-01 09:00:00+00	8
12524	53	20	2026-07-01 14:00:00+00	8
12525	53	20	2026-07-02 09:00:00+00	8
12526	53	20	2026-07-02 14:00:00+00	8
12527	53	20	2026-07-03 09:00:00+00	8
12528	53	20	2026-07-03 14:00:00+00	8
12529	53	20	2026-07-06 09:00:00+00	8
12530	53	20	2026-07-06 14:00:00+00	8
12531	53	20	2026-07-07 09:00:00+00	8
12532	53	20	2026-07-07 14:00:00+00	8
12533	53	20	2026-07-08 09:00:00+00	8
12534	53	20	2026-07-08 14:00:00+00	8
12535	53	20	2026-07-09 09:00:00+00	8
12536	53	20	2026-07-09 14:00:00+00	8
12537	53	20	2026-07-10 09:00:00+00	8
12538	53	20	2026-07-10 14:00:00+00	8
12539	54	20	2026-06-29 09:00:00+00	8
12540	54	20	2026-06-29 14:00:00+00	8
12541	54	20	2026-06-30 09:00:00+00	8
12542	54	20	2026-06-30 14:00:00+00	8
12543	54	20	2026-07-01 09:00:00+00	8
12544	54	20	2026-07-01 14:00:00+00	8
12545	54	20	2026-07-02 09:00:00+00	8
12546	54	20	2026-07-02 14:00:00+00	8
12547	54	20	2026-07-03 09:00:00+00	8
12548	54	20	2026-07-03 14:00:00+00	8
12549	54	20	2026-07-06 09:00:00+00	8
12550	54	20	2026-07-06 14:00:00+00	8
12551	54	20	2026-07-07 09:00:00+00	8
12552	54	20	2026-07-07 14:00:00+00	8
12553	54	20	2026-07-08 09:00:00+00	8
12554	54	20	2026-07-08 14:00:00+00	8
12555	54	20	2026-07-09 09:00:00+00	8
12556	54	20	2026-07-09 14:00:00+00	8
12557	54	20	2026-07-10 09:00:00+00	8
12558	54	20	2026-07-10 14:00:00+00	8
12559	55	20	2026-06-29 09:00:00+00	8
12560	55	20	2026-06-29 14:00:00+00	8
12561	55	20	2026-06-30 09:00:00+00	8
12562	55	20	2026-06-30 14:00:00+00	8
12563	55	20	2026-07-01 09:00:00+00	8
12564	55	20	2026-07-01 14:00:00+00	8
12565	55	20	2026-07-02 09:00:00+00	8
12566	55	20	2026-07-02 14:00:00+00	8
12567	55	20	2026-07-03 09:00:00+00	8
12568	55	20	2026-07-03 14:00:00+00	8
12569	55	20	2026-07-06 09:00:00+00	8
12570	55	20	2026-07-06 14:00:00+00	8
12571	55	20	2026-07-07 09:00:00+00	8
12572	55	20	2026-07-07 14:00:00+00	8
12573	55	20	2026-07-08 09:00:00+00	8
12574	55	20	2026-07-08 14:00:00+00	8
12575	55	20	2026-07-09 09:00:00+00	8
12576	55	20	2026-07-09 14:00:00+00	8
12577	55	20	2026-07-10 09:00:00+00	8
12578	55	20	2026-07-10 14:00:00+00	8
12579	56	20	2026-06-29 09:00:00+00	8
12580	56	20	2026-06-29 14:00:00+00	8
12581	56	20	2026-06-30 09:00:00+00	8
12582	56	20	2026-06-30 14:00:00+00	8
12583	56	20	2026-07-01 09:00:00+00	8
12584	56	20	2026-07-01 14:00:00+00	8
12585	56	20	2026-07-02 09:00:00+00	8
12586	56	20	2026-07-02 14:00:00+00	8
12587	56	20	2026-07-03 09:00:00+00	8
12588	56	20	2026-07-03 14:00:00+00	8
12589	56	20	2026-07-06 09:00:00+00	8
12590	56	20	2026-07-06 14:00:00+00	8
12591	56	20	2026-07-07 09:00:00+00	8
12592	56	20	2026-07-07 14:00:00+00	8
12593	56	20	2026-07-08 09:00:00+00	8
12594	56	20	2026-07-08 14:00:00+00	8
12595	56	20	2026-07-09 09:00:00+00	8
12596	56	20	2026-07-09 14:00:00+00	8
12597	56	20	2026-07-10 09:00:00+00	8
12598	56	20	2026-07-10 14:00:00+00	8
12599	57	20	2026-06-29 09:00:00+00	8
12600	57	20	2026-06-29 14:00:00+00	8
12601	57	20	2026-06-30 09:00:00+00	8
12602	57	20	2026-06-30 14:00:00+00	8
12603	57	20	2026-07-01 09:00:00+00	8
12604	57	20	2026-07-01 14:00:00+00	8
12605	57	20	2026-07-02 09:00:00+00	8
12606	57	20	2026-07-02 14:00:00+00	8
12607	57	20	2026-07-03 09:00:00+00	8
12608	57	20	2026-07-03 14:00:00+00	8
12609	57	20	2026-07-06 09:00:00+00	8
12610	57	20	2026-07-06 14:00:00+00	8
12611	57	20	2026-07-07 09:00:00+00	8
12612	57	20	2026-07-07 14:00:00+00	8
12613	57	20	2026-07-08 09:00:00+00	8
12614	57	20	2026-07-08 14:00:00+00	8
12615	57	20	2026-07-09 09:00:00+00	8
12616	57	20	2026-07-09 14:00:00+00	8
12617	57	20	2026-07-10 09:00:00+00	8
12618	57	20	2026-07-10 14:00:00+00	8
12619	3	21	2026-06-29 09:00:00+00	8
12620	3	21	2026-06-29 14:00:00+00	8
12621	3	21	2026-06-30 09:00:00+00	8
12622	3	21	2026-06-30 14:00:00+00	8
12623	3	21	2026-07-01 09:00:00+00	8
12624	3	21	2026-07-01 14:00:00+00	8
12625	3	21	2026-07-02 09:00:00+00	8
12626	3	21	2026-07-02 14:00:00+00	8
12627	3	21	2026-07-03 09:00:00+00	8
12628	3	21	2026-07-03 14:00:00+00	8
12629	3	21	2026-07-06 09:00:00+00	8
12630	3	21	2026-07-06 14:00:00+00	8
12631	3	21	2026-07-07 09:00:00+00	8
12632	3	21	2026-07-07 14:00:00+00	8
12633	3	21	2026-07-08 09:00:00+00	8
12634	3	21	2026-07-08 14:00:00+00	8
12635	3	21	2026-07-09 09:00:00+00	8
12636	3	21	2026-07-09 14:00:00+00	8
12637	3	21	2026-07-10 09:00:00+00	8
12638	3	21	2026-07-10 14:00:00+00	8
12639	4	21	2026-06-29 09:00:00+00	8
12640	4	21	2026-06-29 14:00:00+00	8
12641	4	21	2026-06-30 09:00:00+00	8
12642	4	21	2026-06-30 14:00:00+00	8
12643	4	21	2026-07-01 09:00:00+00	8
12644	4	21	2026-07-01 14:00:00+00	8
12645	4	21	2026-07-02 09:00:00+00	8
12646	4	21	2026-07-02 14:00:00+00	8
12647	4	21	2026-07-03 09:00:00+00	8
12648	4	21	2026-07-03 14:00:00+00	8
12649	4	21	2026-07-06 09:00:00+00	8
12650	4	21	2026-07-06 14:00:00+00	8
12651	4	21	2026-07-07 09:00:00+00	8
12652	4	21	2026-07-07 14:00:00+00	8
12653	4	21	2026-07-08 09:00:00+00	8
12654	4	21	2026-07-08 14:00:00+00	8
12655	4	21	2026-07-09 09:00:00+00	8
12656	4	21	2026-07-09 14:00:00+00	8
12657	4	21	2026-07-10 09:00:00+00	8
12658	4	21	2026-07-10 14:00:00+00	8
12659	6	21	2026-06-29 09:00:00+00	8
12660	6	21	2026-06-29 14:00:00+00	8
12661	6	21	2026-06-30 09:00:00+00	8
12662	6	21	2026-06-30 14:00:00+00	8
12663	6	21	2026-07-01 09:00:00+00	8
12664	6	21	2026-07-01 14:00:00+00	8
12665	6	21	2026-07-02 09:00:00+00	8
12666	6	21	2026-07-02 14:00:00+00	8
12667	6	21	2026-07-03 09:00:00+00	8
12668	6	21	2026-07-03 14:00:00+00	8
12669	6	21	2026-07-06 09:00:00+00	8
12670	6	21	2026-07-06 14:00:00+00	8
12671	6	21	2026-07-07 09:00:00+00	8
12672	6	21	2026-07-07 14:00:00+00	8
12673	6	21	2026-07-08 09:00:00+00	8
12674	6	21	2026-07-08 14:00:00+00	8
12675	6	21	2026-07-09 09:00:00+00	8
12676	6	21	2026-07-09 14:00:00+00	8
12677	6	21	2026-07-10 09:00:00+00	8
12678	6	21	2026-07-10 14:00:00+00	8
12679	8	21	2026-06-29 09:00:00+00	8
12680	8	21	2026-06-29 14:00:00+00	8
12681	8	21	2026-06-30 09:00:00+00	8
12682	8	21	2026-06-30 14:00:00+00	8
12683	8	21	2026-07-01 09:00:00+00	8
12684	8	21	2026-07-01 14:00:00+00	8
12685	8	21	2026-07-02 09:00:00+00	8
12686	8	21	2026-07-02 14:00:00+00	8
12687	8	21	2026-07-03 09:00:00+00	8
12688	8	21	2026-07-03 14:00:00+00	8
12689	8	21	2026-07-06 09:00:00+00	8
12690	8	21	2026-07-06 14:00:00+00	8
12691	8	21	2026-07-07 09:00:00+00	8
12692	8	21	2026-07-07 14:00:00+00	8
12693	8	21	2026-07-08 09:00:00+00	8
12694	8	21	2026-07-08 14:00:00+00	8
12695	8	21	2026-07-09 09:00:00+00	8
12696	8	21	2026-07-09 14:00:00+00	8
12697	8	21	2026-07-10 09:00:00+00	8
12698	8	21	2026-07-10 14:00:00+00	8
12699	10	21	2026-06-29 09:00:00+00	8
12700	10	21	2026-06-29 14:00:00+00	8
12701	10	21	2026-06-30 09:00:00+00	8
12702	10	21	2026-06-30 14:00:00+00	8
12703	10	21	2026-07-01 09:00:00+00	8
12704	10	21	2026-07-01 14:00:00+00	8
12705	10	21	2026-07-02 09:00:00+00	8
12706	10	21	2026-07-02 14:00:00+00	8
12707	10	21	2026-07-03 09:00:00+00	8
12708	10	21	2026-07-03 14:00:00+00	8
12709	10	21	2026-07-06 09:00:00+00	8
12710	10	21	2026-07-06 14:00:00+00	8
12711	10	21	2026-07-07 09:00:00+00	8
12712	10	21	2026-07-07 14:00:00+00	8
12713	10	21	2026-07-08 09:00:00+00	8
12714	10	21	2026-07-08 14:00:00+00	8
12715	10	21	2026-07-09 09:00:00+00	8
12716	10	21	2026-07-09 14:00:00+00	8
12717	10	21	2026-07-10 09:00:00+00	8
12718	10	21	2026-07-10 14:00:00+00	8
12719	11	21	2026-06-29 09:00:00+00	8
12720	11	21	2026-06-29 14:00:00+00	8
12721	11	21	2026-06-30 09:00:00+00	8
12722	11	21	2026-06-30 14:00:00+00	8
12723	11	21	2026-07-01 09:00:00+00	8
12724	11	21	2026-07-01 14:00:00+00	8
12725	11	21	2026-07-02 09:00:00+00	8
12726	11	21	2026-07-02 14:00:00+00	8
12727	11	21	2026-07-03 09:00:00+00	8
12728	11	21	2026-07-03 14:00:00+00	8
12729	11	21	2026-07-06 09:00:00+00	8
12730	11	21	2026-07-06 14:00:00+00	8
12731	11	21	2026-07-07 09:00:00+00	8
12732	11	21	2026-07-07 14:00:00+00	8
12733	11	21	2026-07-08 09:00:00+00	8
12734	11	21	2026-07-08 14:00:00+00	8
12735	11	21	2026-07-09 09:00:00+00	8
12736	11	21	2026-07-09 14:00:00+00	8
12737	11	21	2026-07-10 09:00:00+00	8
12738	11	21	2026-07-10 14:00:00+00	8
12739	12	21	2026-06-29 09:00:00+00	8
12740	12	21	2026-06-29 14:00:00+00	8
12741	12	21	2026-06-30 09:00:00+00	8
12742	12	21	2026-06-30 14:00:00+00	8
12743	12	21	2026-07-01 09:00:00+00	8
12744	12	21	2026-07-01 14:00:00+00	8
12745	12	21	2026-07-02 09:00:00+00	8
12746	12	21	2026-07-02 14:00:00+00	8
12747	12	21	2026-07-03 09:00:00+00	8
12748	12	21	2026-07-03 14:00:00+00	8
12749	12	21	2026-07-06 09:00:00+00	8
12750	12	21	2026-07-06 14:00:00+00	8
12751	12	21	2026-07-07 09:00:00+00	8
12752	12	21	2026-07-07 14:00:00+00	8
12753	12	21	2026-07-08 09:00:00+00	8
12754	12	21	2026-07-08 14:00:00+00	8
12755	12	21	2026-07-09 09:00:00+00	8
12756	12	21	2026-07-09 14:00:00+00	8
12757	12	21	2026-07-10 09:00:00+00	8
12758	12	21	2026-07-10 14:00:00+00	8
12759	13	21	2026-06-29 09:00:00+00	8
12760	13	21	2026-06-29 14:00:00+00	8
12761	13	21	2026-06-30 09:00:00+00	8
12762	13	21	2026-06-30 14:00:00+00	8
12763	13	21	2026-07-01 09:00:00+00	8
12764	13	21	2026-07-01 14:00:00+00	8
12765	13	21	2026-07-02 09:00:00+00	8
12766	13	21	2026-07-02 14:00:00+00	8
12767	13	21	2026-07-03 09:00:00+00	8
12768	13	21	2026-07-03 14:00:00+00	8
12769	13	21	2026-07-06 09:00:00+00	8
12770	13	21	2026-07-06 14:00:00+00	8
12771	13	21	2026-07-07 09:00:00+00	8
12772	13	21	2026-07-07 14:00:00+00	8
12773	13	21	2026-07-08 09:00:00+00	8
12774	13	21	2026-07-08 14:00:00+00	8
12775	13	21	2026-07-09 09:00:00+00	8
12776	13	21	2026-07-09 14:00:00+00	8
12777	13	21	2026-07-10 09:00:00+00	8
12778	13	21	2026-07-10 14:00:00+00	8
12779	15	21	2026-06-29 09:00:00+00	8
12780	15	21	2026-06-29 14:00:00+00	8
12781	15	21	2026-06-30 09:00:00+00	8
12782	15	21	2026-06-30 14:00:00+00	8
12783	15	21	2026-07-01 09:00:00+00	8
12784	15	21	2026-07-01 14:00:00+00	8
12785	15	21	2026-07-02 09:00:00+00	8
12786	15	21	2026-07-02 14:00:00+00	8
12787	15	21	2026-07-03 09:00:00+00	8
12788	15	21	2026-07-03 14:00:00+00	8
12789	15	21	2026-07-06 09:00:00+00	8
12790	15	21	2026-07-06 14:00:00+00	8
12791	15	21	2026-07-07 09:00:00+00	8
12792	15	21	2026-07-07 14:00:00+00	8
12793	15	21	2026-07-08 09:00:00+00	8
12794	15	21	2026-07-08 14:00:00+00	8
12795	15	21	2026-07-09 09:00:00+00	8
12796	15	21	2026-07-09 14:00:00+00	8
12797	15	21	2026-07-10 09:00:00+00	8
12798	15	21	2026-07-10 14:00:00+00	8
12799	16	21	2026-06-29 09:00:00+00	8
12800	16	21	2026-06-29 14:00:00+00	8
12801	16	21	2026-06-30 09:00:00+00	8
12802	16	21	2026-06-30 14:00:00+00	8
12803	16	21	2026-07-01 09:00:00+00	8
12804	16	21	2026-07-01 14:00:00+00	8
12805	16	21	2026-07-02 09:00:00+00	8
12806	16	21	2026-07-02 14:00:00+00	8
12807	16	21	2026-07-03 09:00:00+00	8
12808	16	21	2026-07-03 14:00:00+00	8
12809	16	21	2026-07-06 09:00:00+00	8
12810	16	21	2026-07-06 14:00:00+00	8
12811	16	21	2026-07-07 09:00:00+00	8
12812	16	21	2026-07-07 14:00:00+00	8
12813	16	21	2026-07-08 09:00:00+00	8
12814	16	21	2026-07-08 14:00:00+00	8
12815	16	21	2026-07-09 09:00:00+00	8
12816	16	21	2026-07-09 14:00:00+00	8
12817	16	21	2026-07-10 09:00:00+00	8
12818	16	21	2026-07-10 14:00:00+00	8
12819	17	21	2026-06-29 09:00:00+00	8
12820	17	21	2026-06-29 14:00:00+00	8
12821	17	21	2026-06-30 09:00:00+00	8
12822	17	21	2026-06-30 14:00:00+00	8
12823	17	21	2026-07-01 09:00:00+00	8
12824	17	21	2026-07-01 14:00:00+00	8
12825	17	21	2026-07-02 09:00:00+00	8
12826	17	21	2026-07-02 14:00:00+00	8
12827	17	21	2026-07-03 09:00:00+00	8
12828	17	21	2026-07-03 14:00:00+00	8
12829	17	21	2026-07-06 09:00:00+00	8
12830	17	21	2026-07-06 14:00:00+00	8
12831	17	21	2026-07-07 09:00:00+00	8
12832	17	21	2026-07-07 14:00:00+00	8
12833	17	21	2026-07-08 09:00:00+00	8
12834	17	21	2026-07-08 14:00:00+00	8
12835	17	21	2026-07-09 09:00:00+00	8
12836	17	21	2026-07-09 14:00:00+00	8
12837	17	21	2026-07-10 09:00:00+00	8
12838	17	21	2026-07-10 14:00:00+00	8
12839	18	21	2026-06-29 09:00:00+00	8
12840	18	21	2026-06-29 14:00:00+00	8
12841	18	21	2026-06-30 09:00:00+00	8
12842	18	21	2026-06-30 14:00:00+00	8
12843	18	21	2026-07-01 09:00:00+00	8
12844	18	21	2026-07-01 14:00:00+00	8
12845	18	21	2026-07-02 09:00:00+00	8
12846	18	21	2026-07-02 14:00:00+00	8
12847	18	21	2026-07-03 09:00:00+00	8
12848	18	21	2026-07-03 14:00:00+00	8
12849	18	21	2026-07-06 09:00:00+00	8
12850	18	21	2026-07-06 14:00:00+00	8
12851	18	21	2026-07-07 09:00:00+00	8
12852	18	21	2026-07-07 14:00:00+00	8
12853	18	21	2026-07-08 09:00:00+00	8
12854	18	21	2026-07-08 14:00:00+00	8
12855	18	21	2026-07-09 09:00:00+00	8
12856	18	21	2026-07-09 14:00:00+00	8
12857	18	21	2026-07-10 09:00:00+00	8
12858	18	21	2026-07-10 14:00:00+00	8
12859	19	21	2026-06-29 09:00:00+00	8
12860	19	21	2026-06-29 14:00:00+00	8
12861	19	21	2026-06-30 09:00:00+00	8
12862	19	21	2026-06-30 14:00:00+00	8
12863	19	21	2026-07-01 09:00:00+00	8
12864	19	21	2026-07-01 14:00:00+00	8
12865	19	21	2026-07-02 09:00:00+00	8
12866	19	21	2026-07-02 14:00:00+00	8
12867	19	21	2026-07-03 09:00:00+00	8
12868	19	21	2026-07-03 14:00:00+00	8
12869	19	21	2026-07-06 09:00:00+00	8
12870	19	21	2026-07-06 14:00:00+00	8
12871	19	21	2026-07-07 09:00:00+00	8
12872	19	21	2026-07-07 14:00:00+00	8
12873	19	21	2026-07-08 09:00:00+00	8
12874	19	21	2026-07-08 14:00:00+00	8
12875	19	21	2026-07-09 09:00:00+00	8
12876	19	21	2026-07-09 14:00:00+00	8
12877	19	21	2026-07-10 09:00:00+00	8
12878	19	21	2026-07-10 14:00:00+00	8
12879	20	21	2026-06-29 09:00:00+00	8
12880	20	21	2026-06-29 14:00:00+00	8
12881	20	21	2026-06-30 09:00:00+00	8
12882	20	21	2026-06-30 14:00:00+00	8
12883	20	21	2026-07-01 09:00:00+00	8
12884	20	21	2026-07-01 14:00:00+00	8
12885	20	21	2026-07-02 09:00:00+00	8
12886	20	21	2026-07-02 14:00:00+00	8
12887	20	21	2026-07-03 09:00:00+00	8
12888	20	21	2026-07-03 14:00:00+00	8
12889	20	21	2026-07-06 09:00:00+00	8
12890	20	21	2026-07-06 14:00:00+00	8
12891	20	21	2026-07-07 09:00:00+00	8
12892	20	21	2026-07-07 14:00:00+00	8
12893	20	21	2026-07-08 09:00:00+00	8
12894	20	21	2026-07-08 14:00:00+00	8
12895	20	21	2026-07-09 09:00:00+00	8
12896	20	21	2026-07-09 14:00:00+00	8
12897	20	21	2026-07-10 09:00:00+00	8
12898	20	21	2026-07-10 14:00:00+00	8
12899	22	21	2026-06-29 09:00:00+00	8
12900	22	21	2026-06-29 14:00:00+00	8
12901	22	21	2026-06-30 09:00:00+00	8
12902	22	21	2026-06-30 14:00:00+00	8
12903	22	21	2026-07-01 09:00:00+00	8
12904	22	21	2026-07-01 14:00:00+00	8
12905	22	21	2026-07-02 09:00:00+00	8
12906	22	21	2026-07-02 14:00:00+00	8
12907	22	21	2026-07-03 09:00:00+00	8
12908	22	21	2026-07-03 14:00:00+00	8
12909	22	21	2026-07-06 09:00:00+00	8
12910	22	21	2026-07-06 14:00:00+00	8
12911	22	21	2026-07-07 09:00:00+00	8
12912	22	21	2026-07-07 14:00:00+00	8
12913	22	21	2026-07-08 09:00:00+00	8
12914	22	21	2026-07-08 14:00:00+00	8
12915	22	21	2026-07-09 09:00:00+00	8
12916	22	21	2026-07-09 14:00:00+00	8
12917	22	21	2026-07-10 09:00:00+00	8
12918	22	21	2026-07-10 14:00:00+00	8
12919	23	21	2026-06-29 09:00:00+00	8
12920	23	21	2026-06-29 14:00:00+00	8
12921	23	21	2026-06-30 09:00:00+00	8
12922	23	21	2026-06-30 14:00:00+00	8
12923	23	21	2026-07-01 09:00:00+00	8
12924	23	21	2026-07-01 14:00:00+00	8
12925	23	21	2026-07-02 09:00:00+00	8
12926	23	21	2026-07-02 14:00:00+00	8
12927	23	21	2026-07-03 09:00:00+00	8
12928	23	21	2026-07-03 14:00:00+00	8
12929	23	21	2026-07-06 09:00:00+00	8
12930	23	21	2026-07-06 14:00:00+00	8
12931	23	21	2026-07-07 09:00:00+00	8
12932	23	21	2026-07-07 14:00:00+00	8
12933	23	21	2026-07-08 09:00:00+00	8
12934	23	21	2026-07-08 14:00:00+00	8
12935	23	21	2026-07-09 09:00:00+00	8
12936	23	21	2026-07-09 14:00:00+00	8
12937	23	21	2026-07-10 09:00:00+00	8
12938	23	21	2026-07-10 14:00:00+00	8
12939	25	21	2026-06-29 09:00:00+00	8
12940	25	21	2026-06-29 14:00:00+00	8
12941	25	21	2026-06-30 09:00:00+00	8
12942	25	21	2026-06-30 14:00:00+00	8
12943	25	21	2026-07-01 09:00:00+00	8
12944	25	21	2026-07-01 14:00:00+00	8
12945	25	21	2026-07-02 09:00:00+00	8
12946	25	21	2026-07-02 14:00:00+00	8
12947	25	21	2026-07-03 09:00:00+00	8
12948	25	21	2026-07-03 14:00:00+00	8
12949	25	21	2026-07-06 09:00:00+00	8
12950	25	21	2026-07-06 14:00:00+00	8
12951	25	21	2026-07-07 09:00:00+00	8
12952	25	21	2026-07-07 14:00:00+00	8
12953	25	21	2026-07-08 09:00:00+00	8
12954	25	21	2026-07-08 14:00:00+00	8
12955	25	21	2026-07-09 09:00:00+00	8
12956	25	21	2026-07-09 14:00:00+00	8
12957	25	21	2026-07-10 09:00:00+00	8
12958	25	21	2026-07-10 14:00:00+00	8
12959	26	21	2026-06-29 09:00:00+00	8
12960	26	21	2026-06-29 14:00:00+00	8
12961	26	21	2026-06-30 09:00:00+00	8
12962	26	21	2026-06-30 14:00:00+00	8
12963	26	21	2026-07-01 09:00:00+00	8
12964	26	21	2026-07-01 14:00:00+00	8
12965	26	21	2026-07-02 09:00:00+00	8
12966	26	21	2026-07-02 14:00:00+00	8
12967	26	21	2026-07-03 09:00:00+00	8
12968	26	21	2026-07-03 14:00:00+00	8
12969	26	21	2026-07-06 09:00:00+00	8
12970	26	21	2026-07-06 14:00:00+00	8
12971	26	21	2026-07-07 09:00:00+00	8
12972	26	21	2026-07-07 14:00:00+00	8
12973	26	21	2026-07-08 09:00:00+00	8
12974	26	21	2026-07-08 14:00:00+00	8
12975	26	21	2026-07-09 09:00:00+00	8
12976	26	21	2026-07-09 14:00:00+00	8
12977	26	21	2026-07-10 09:00:00+00	8
12978	26	21	2026-07-10 14:00:00+00	8
12979	27	21	2026-06-29 09:00:00+00	8
12980	27	21	2026-06-29 14:00:00+00	8
12981	27	21	2026-06-30 09:00:00+00	8
12982	27	21	2026-06-30 14:00:00+00	8
12983	27	21	2026-07-01 09:00:00+00	8
12984	27	21	2026-07-01 14:00:00+00	8
12985	27	21	2026-07-02 09:00:00+00	8
12986	27	21	2026-07-02 14:00:00+00	8
12987	27	21	2026-07-03 09:00:00+00	8
12988	27	21	2026-07-03 14:00:00+00	8
12989	27	21	2026-07-06 09:00:00+00	8
12990	27	21	2026-07-06 14:00:00+00	8
12991	27	21	2026-07-07 09:00:00+00	8
12992	27	21	2026-07-07 14:00:00+00	8
12993	27	21	2026-07-08 09:00:00+00	8
12994	27	21	2026-07-08 14:00:00+00	8
12995	27	21	2026-07-09 09:00:00+00	8
12996	27	21	2026-07-09 14:00:00+00	8
12997	27	21	2026-07-10 09:00:00+00	8
12998	27	21	2026-07-10 14:00:00+00	8
12999	28	21	2026-06-29 09:00:00+00	8
13000	28	21	2026-06-29 14:00:00+00	8
13001	28	21	2026-06-30 09:00:00+00	8
13002	28	21	2026-06-30 14:00:00+00	8
13003	28	21	2026-07-01 09:00:00+00	8
13004	28	21	2026-07-01 14:00:00+00	8
13005	28	21	2026-07-02 09:00:00+00	8
13006	28	21	2026-07-02 14:00:00+00	8
13007	28	21	2026-07-03 09:00:00+00	8
13008	28	21	2026-07-03 14:00:00+00	8
13009	28	21	2026-07-06 09:00:00+00	8
13010	28	21	2026-07-06 14:00:00+00	8
13011	28	21	2026-07-07 09:00:00+00	8
13012	28	21	2026-07-07 14:00:00+00	8
13013	28	21	2026-07-08 09:00:00+00	8
13014	28	21	2026-07-08 14:00:00+00	8
13015	28	21	2026-07-09 09:00:00+00	8
13016	28	21	2026-07-09 14:00:00+00	8
13017	28	21	2026-07-10 09:00:00+00	8
13018	28	21	2026-07-10 14:00:00+00	8
13019	29	21	2026-06-29 09:00:00+00	8
13020	29	21	2026-06-29 14:00:00+00	8
13021	29	21	2026-06-30 09:00:00+00	8
13022	29	21	2026-06-30 14:00:00+00	8
13023	29	21	2026-07-01 09:00:00+00	8
13024	29	21	2026-07-01 14:00:00+00	8
13025	29	21	2026-07-02 09:00:00+00	8
13026	29	21	2026-07-02 14:00:00+00	8
13027	29	21	2026-07-03 09:00:00+00	8
13028	29	21	2026-07-03 14:00:00+00	8
13029	29	21	2026-07-06 09:00:00+00	8
13030	29	21	2026-07-06 14:00:00+00	8
13031	29	21	2026-07-07 09:00:00+00	8
13032	29	21	2026-07-07 14:00:00+00	8
13033	29	21	2026-07-08 09:00:00+00	8
13034	29	21	2026-07-08 14:00:00+00	8
13035	29	21	2026-07-09 09:00:00+00	8
13036	29	21	2026-07-09 14:00:00+00	8
13037	29	21	2026-07-10 09:00:00+00	8
13038	29	21	2026-07-10 14:00:00+00	8
13039	30	21	2026-06-29 09:00:00+00	8
13040	30	21	2026-06-29 14:00:00+00	8
13041	30	21	2026-06-30 09:00:00+00	8
13042	30	21	2026-06-30 14:00:00+00	8
13043	30	21	2026-07-01 09:00:00+00	8
13044	30	21	2026-07-01 14:00:00+00	8
13045	30	21	2026-07-02 09:00:00+00	8
13046	30	21	2026-07-02 14:00:00+00	8
13047	30	21	2026-07-03 09:00:00+00	8
13048	30	21	2026-07-03 14:00:00+00	8
13049	30	21	2026-07-06 09:00:00+00	8
13050	30	21	2026-07-06 14:00:00+00	8
13051	30	21	2026-07-07 09:00:00+00	8
13052	30	21	2026-07-07 14:00:00+00	8
13053	30	21	2026-07-08 09:00:00+00	8
13054	30	21	2026-07-08 14:00:00+00	8
13055	30	21	2026-07-09 09:00:00+00	8
13056	30	21	2026-07-09 14:00:00+00	8
13057	30	21	2026-07-10 09:00:00+00	8
13058	30	21	2026-07-10 14:00:00+00	8
13059	31	21	2026-06-29 09:00:00+00	8
13060	31	21	2026-06-29 14:00:00+00	8
13061	31	21	2026-06-30 09:00:00+00	8
13062	31	21	2026-06-30 14:00:00+00	8
13063	31	21	2026-07-01 09:00:00+00	8
13064	31	21	2026-07-01 14:00:00+00	8
13065	31	21	2026-07-02 09:00:00+00	8
13066	31	21	2026-07-02 14:00:00+00	8
13067	31	21	2026-07-03 09:00:00+00	8
13068	31	21	2026-07-03 14:00:00+00	8
13069	31	21	2026-07-06 09:00:00+00	8
13070	31	21	2026-07-06 14:00:00+00	8
13071	31	21	2026-07-07 09:00:00+00	8
13072	31	21	2026-07-07 14:00:00+00	8
13073	31	21	2026-07-08 09:00:00+00	8
13074	31	21	2026-07-08 14:00:00+00	8
13075	31	21	2026-07-09 09:00:00+00	8
13076	31	21	2026-07-09 14:00:00+00	8
13077	31	21	2026-07-10 09:00:00+00	8
13078	31	21	2026-07-10 14:00:00+00	8
13079	32	21	2026-06-29 09:00:00+00	8
13080	32	21	2026-06-29 14:00:00+00	8
13081	32	21	2026-06-30 09:00:00+00	8
13082	32	21	2026-06-30 14:00:00+00	8
13083	32	21	2026-07-01 09:00:00+00	8
13084	32	21	2026-07-01 14:00:00+00	8
13085	32	21	2026-07-02 09:00:00+00	8
13086	32	21	2026-07-02 14:00:00+00	8
13087	32	21	2026-07-03 09:00:00+00	8
13088	32	21	2026-07-03 14:00:00+00	8
13089	32	21	2026-07-06 09:00:00+00	8
13090	32	21	2026-07-06 14:00:00+00	8
13091	32	21	2026-07-07 09:00:00+00	8
13092	32	21	2026-07-07 14:00:00+00	8
13093	32	21	2026-07-08 09:00:00+00	8
13094	32	21	2026-07-08 14:00:00+00	8
13095	32	21	2026-07-09 09:00:00+00	8
13096	32	21	2026-07-09 14:00:00+00	8
13097	32	21	2026-07-10 09:00:00+00	8
13098	32	21	2026-07-10 14:00:00+00	8
13099	33	21	2026-06-29 09:00:00+00	8
13100	33	21	2026-06-29 14:00:00+00	8
13101	33	21	2026-06-30 09:00:00+00	8
13102	33	21	2026-06-30 14:00:00+00	8
13103	33	21	2026-07-01 09:00:00+00	8
13104	33	21	2026-07-01 14:00:00+00	8
13105	33	21	2026-07-02 09:00:00+00	8
13106	33	21	2026-07-02 14:00:00+00	8
13107	33	21	2026-07-03 09:00:00+00	8
13108	33	21	2026-07-03 14:00:00+00	8
13109	33	21	2026-07-06 09:00:00+00	8
13110	33	21	2026-07-06 14:00:00+00	8
13111	33	21	2026-07-07 09:00:00+00	8
13112	33	21	2026-07-07 14:00:00+00	8
13113	33	21	2026-07-08 09:00:00+00	8
13114	33	21	2026-07-08 14:00:00+00	8
13115	33	21	2026-07-09 09:00:00+00	8
13116	33	21	2026-07-09 14:00:00+00	8
13117	33	21	2026-07-10 09:00:00+00	8
13118	33	21	2026-07-10 14:00:00+00	8
13119	34	21	2026-06-29 09:00:00+00	8
13120	34	21	2026-06-29 14:00:00+00	8
13121	34	21	2026-06-30 09:00:00+00	8
13122	34	21	2026-06-30 14:00:00+00	8
13123	34	21	2026-07-01 09:00:00+00	8
13124	34	21	2026-07-01 14:00:00+00	8
13125	34	21	2026-07-02 09:00:00+00	8
13126	34	21	2026-07-02 14:00:00+00	8
13127	34	21	2026-07-03 09:00:00+00	8
13128	34	21	2026-07-03 14:00:00+00	8
13129	34	21	2026-07-06 09:00:00+00	8
13130	34	21	2026-07-06 14:00:00+00	8
13131	34	21	2026-07-07 09:00:00+00	8
13132	34	21	2026-07-07 14:00:00+00	8
13133	34	21	2026-07-08 09:00:00+00	8
13134	34	21	2026-07-08 14:00:00+00	8
13135	34	21	2026-07-09 09:00:00+00	8
13136	34	21	2026-07-09 14:00:00+00	8
13137	34	21	2026-07-10 09:00:00+00	8
13138	34	21	2026-07-10 14:00:00+00	8
13139	37	21	2026-06-29 09:00:00+00	8
13140	37	21	2026-06-29 14:00:00+00	8
13141	37	21	2026-06-30 09:00:00+00	8
13142	37	21	2026-06-30 14:00:00+00	8
13143	37	21	2026-07-01 09:00:00+00	8
13144	37	21	2026-07-01 14:00:00+00	8
13145	37	21	2026-07-02 09:00:00+00	8
13146	37	21	2026-07-02 14:00:00+00	8
13147	37	21	2026-07-03 09:00:00+00	8
13148	37	21	2026-07-03 14:00:00+00	8
13149	37	21	2026-07-06 09:00:00+00	8
13150	37	21	2026-07-06 14:00:00+00	8
13151	37	21	2026-07-07 09:00:00+00	8
13152	37	21	2026-07-07 14:00:00+00	8
13153	37	21	2026-07-08 09:00:00+00	8
13154	37	21	2026-07-08 14:00:00+00	8
13155	37	21	2026-07-09 09:00:00+00	8
13156	37	21	2026-07-09 14:00:00+00	8
13157	37	21	2026-07-10 09:00:00+00	8
13158	37	21	2026-07-10 14:00:00+00	8
13159	38	21	2026-06-29 09:00:00+00	8
13160	38	21	2026-06-29 14:00:00+00	8
13161	38	21	2026-06-30 09:00:00+00	8
13162	38	21	2026-06-30 14:00:00+00	8
13163	38	21	2026-07-01 09:00:00+00	8
13164	38	21	2026-07-01 14:00:00+00	8
13165	38	21	2026-07-02 09:00:00+00	8
13166	38	21	2026-07-02 14:00:00+00	8
13167	38	21	2026-07-03 09:00:00+00	8
13168	38	21	2026-07-03 14:00:00+00	8
13169	38	21	2026-07-06 09:00:00+00	8
13170	38	21	2026-07-06 14:00:00+00	8
13171	38	21	2026-07-07 09:00:00+00	8
13172	38	21	2026-07-07 14:00:00+00	8
13173	38	21	2026-07-08 09:00:00+00	8
13174	38	21	2026-07-08 14:00:00+00	8
13175	38	21	2026-07-09 09:00:00+00	8
13176	38	21	2026-07-09 14:00:00+00	8
13177	38	21	2026-07-10 09:00:00+00	8
13178	38	21	2026-07-10 14:00:00+00	8
13179	39	21	2026-06-29 09:00:00+00	8
13180	39	21	2026-06-29 14:00:00+00	8
13181	39	21	2026-06-30 09:00:00+00	8
13182	39	21	2026-06-30 14:00:00+00	8
13183	39	21	2026-07-01 09:00:00+00	8
13184	39	21	2026-07-01 14:00:00+00	8
13185	39	21	2026-07-02 09:00:00+00	8
13186	39	21	2026-07-02 14:00:00+00	8
13187	39	21	2026-07-03 09:00:00+00	8
13188	39	21	2026-07-03 14:00:00+00	8
13189	39	21	2026-07-06 09:00:00+00	8
13190	39	21	2026-07-06 14:00:00+00	8
13191	39	21	2026-07-07 09:00:00+00	8
13192	39	21	2026-07-07 14:00:00+00	8
13193	39	21	2026-07-08 09:00:00+00	8
13194	39	21	2026-07-08 14:00:00+00	8
13195	39	21	2026-07-09 09:00:00+00	8
13196	39	21	2026-07-09 14:00:00+00	8
13197	39	21	2026-07-10 09:00:00+00	8
13198	39	21	2026-07-10 14:00:00+00	8
13199	40	21	2026-06-29 09:00:00+00	8
13200	40	21	2026-06-29 14:00:00+00	8
13201	40	21	2026-06-30 09:00:00+00	8
13202	40	21	2026-06-30 14:00:00+00	8
13203	40	21	2026-07-01 09:00:00+00	8
13204	40	21	2026-07-01 14:00:00+00	8
13205	40	21	2026-07-02 09:00:00+00	8
13206	40	21	2026-07-02 14:00:00+00	8
13207	40	21	2026-07-03 09:00:00+00	8
13208	40	21	2026-07-03 14:00:00+00	8
13209	40	21	2026-07-06 09:00:00+00	8
13210	40	21	2026-07-06 14:00:00+00	8
13211	40	21	2026-07-07 09:00:00+00	8
13212	40	21	2026-07-07 14:00:00+00	8
13213	40	21	2026-07-08 09:00:00+00	8
13214	40	21	2026-07-08 14:00:00+00	8
13215	40	21	2026-07-09 09:00:00+00	8
13216	40	21	2026-07-09 14:00:00+00	8
13217	40	21	2026-07-10 09:00:00+00	8
13218	40	21	2026-07-10 14:00:00+00	8
13219	41	21	2026-06-29 09:00:00+00	8
13220	41	21	2026-06-29 14:00:00+00	8
13221	41	21	2026-06-30 09:00:00+00	8
13222	41	21	2026-06-30 14:00:00+00	8
13223	41	21	2026-07-01 09:00:00+00	8
13224	41	21	2026-07-01 14:00:00+00	8
13225	41	21	2026-07-02 09:00:00+00	8
13226	41	21	2026-07-02 14:00:00+00	8
13227	41	21	2026-07-03 09:00:00+00	8
13228	41	21	2026-07-03 14:00:00+00	8
13229	41	21	2026-07-06 09:00:00+00	8
13230	41	21	2026-07-06 14:00:00+00	8
13231	41	21	2026-07-07 09:00:00+00	8
13232	41	21	2026-07-07 14:00:00+00	8
13233	41	21	2026-07-08 09:00:00+00	8
13234	41	21	2026-07-08 14:00:00+00	8
13235	41	21	2026-07-09 09:00:00+00	8
13236	41	21	2026-07-09 14:00:00+00	8
13237	41	21	2026-07-10 09:00:00+00	8
13238	41	21	2026-07-10 14:00:00+00	8
13239	42	21	2026-06-29 09:00:00+00	8
13240	42	21	2026-06-29 14:00:00+00	8
13241	42	21	2026-06-30 09:00:00+00	8
13242	42	21	2026-06-30 14:00:00+00	8
13243	42	21	2026-07-01 09:00:00+00	8
13244	42	21	2026-07-01 14:00:00+00	8
13245	42	21	2026-07-02 09:00:00+00	8
13246	42	21	2026-07-02 14:00:00+00	8
13247	42	21	2026-07-03 09:00:00+00	8
13248	42	21	2026-07-03 14:00:00+00	8
13249	42	21	2026-07-06 09:00:00+00	8
13250	42	21	2026-07-06 14:00:00+00	8
13251	42	21	2026-07-07 09:00:00+00	8
13252	42	21	2026-07-07 14:00:00+00	8
13253	42	21	2026-07-08 09:00:00+00	8
13254	42	21	2026-07-08 14:00:00+00	8
13255	42	21	2026-07-09 09:00:00+00	8
13256	42	21	2026-07-09 14:00:00+00	8
13257	42	21	2026-07-10 09:00:00+00	8
13258	42	21	2026-07-10 14:00:00+00	8
13259	44	21	2026-06-29 09:00:00+00	8
13260	44	21	2026-06-29 14:00:00+00	8
13261	44	21	2026-06-30 09:00:00+00	8
13262	44	21	2026-06-30 14:00:00+00	8
13263	44	21	2026-07-01 09:00:00+00	8
13264	44	21	2026-07-01 14:00:00+00	8
13265	44	21	2026-07-02 09:00:00+00	8
13266	44	21	2026-07-02 14:00:00+00	8
13267	44	21	2026-07-03 09:00:00+00	8
13268	44	21	2026-07-03 14:00:00+00	8
13269	44	21	2026-07-06 09:00:00+00	8
13270	44	21	2026-07-06 14:00:00+00	8
13271	44	21	2026-07-07 09:00:00+00	8
13272	44	21	2026-07-07 14:00:00+00	8
13273	44	21	2026-07-08 09:00:00+00	8
13274	44	21	2026-07-08 14:00:00+00	8
13275	44	21	2026-07-09 09:00:00+00	8
13276	44	21	2026-07-09 14:00:00+00	8
13277	44	21	2026-07-10 09:00:00+00	8
13278	44	21	2026-07-10 14:00:00+00	8
13279	45	21	2026-06-29 09:00:00+00	8
13280	45	21	2026-06-29 14:00:00+00	8
13281	45	21	2026-06-30 09:00:00+00	8
13282	45	21	2026-06-30 14:00:00+00	8
13283	45	21	2026-07-01 09:00:00+00	8
13284	45	21	2026-07-01 14:00:00+00	8
13285	45	21	2026-07-02 09:00:00+00	8
13286	45	21	2026-07-02 14:00:00+00	8
13287	45	21	2026-07-03 09:00:00+00	8
13288	45	21	2026-07-03 14:00:00+00	8
13289	45	21	2026-07-06 09:00:00+00	8
13290	45	21	2026-07-06 14:00:00+00	8
13291	45	21	2026-07-07 09:00:00+00	8
13292	45	21	2026-07-07 14:00:00+00	8
13293	45	21	2026-07-08 09:00:00+00	8
13294	45	21	2026-07-08 14:00:00+00	8
13295	45	21	2026-07-09 09:00:00+00	8
13296	45	21	2026-07-09 14:00:00+00	8
13297	45	21	2026-07-10 09:00:00+00	8
13298	45	21	2026-07-10 14:00:00+00	8
13299	47	21	2026-06-29 09:00:00+00	8
13300	47	21	2026-06-29 14:00:00+00	8
13301	47	21	2026-06-30 09:00:00+00	8
13302	47	21	2026-06-30 14:00:00+00	8
13303	47	21	2026-07-01 09:00:00+00	8
13304	47	21	2026-07-01 14:00:00+00	8
13305	47	21	2026-07-02 09:00:00+00	8
13306	47	21	2026-07-02 14:00:00+00	8
13307	47	21	2026-07-03 09:00:00+00	8
13308	47	21	2026-07-03 14:00:00+00	8
13309	47	21	2026-07-06 09:00:00+00	8
13310	47	21	2026-07-06 14:00:00+00	8
13311	47	21	2026-07-07 09:00:00+00	8
13312	47	21	2026-07-07 14:00:00+00	8
13313	47	21	2026-07-08 09:00:00+00	8
13314	47	21	2026-07-08 14:00:00+00	8
13315	47	21	2026-07-09 09:00:00+00	8
13316	47	21	2026-07-09 14:00:00+00	8
13317	47	21	2026-07-10 09:00:00+00	8
13318	47	21	2026-07-10 14:00:00+00	8
13319	48	21	2026-06-29 09:00:00+00	8
13320	48	21	2026-06-29 14:00:00+00	8
13321	48	21	2026-06-30 09:00:00+00	8
13322	48	21	2026-06-30 14:00:00+00	8
13323	48	21	2026-07-01 09:00:00+00	8
13324	48	21	2026-07-01 14:00:00+00	8
13325	48	21	2026-07-02 09:00:00+00	8
13326	48	21	2026-07-02 14:00:00+00	8
13327	48	21	2026-07-03 09:00:00+00	8
13328	48	21	2026-07-03 14:00:00+00	8
13329	48	21	2026-07-06 09:00:00+00	8
13330	48	21	2026-07-06 14:00:00+00	8
13331	48	21	2026-07-07 09:00:00+00	8
13332	48	21	2026-07-07 14:00:00+00	8
13333	48	21	2026-07-08 09:00:00+00	8
13334	48	21	2026-07-08 14:00:00+00	8
13335	48	21	2026-07-09 09:00:00+00	8
13336	48	21	2026-07-09 14:00:00+00	8
13337	48	21	2026-07-10 09:00:00+00	8
13338	48	21	2026-07-10 14:00:00+00	8
13339	49	21	2026-06-29 09:00:00+00	8
13340	49	21	2026-06-29 14:00:00+00	8
13341	49	21	2026-06-30 09:00:00+00	8
13342	49	21	2026-06-30 14:00:00+00	8
13343	49	21	2026-07-01 09:00:00+00	8
13344	49	21	2026-07-01 14:00:00+00	8
13345	49	21	2026-07-02 09:00:00+00	8
13346	49	21	2026-07-02 14:00:00+00	8
13347	49	21	2026-07-03 09:00:00+00	8
13348	49	21	2026-07-03 14:00:00+00	8
13349	49	21	2026-07-06 09:00:00+00	8
13350	49	21	2026-07-06 14:00:00+00	8
13351	49	21	2026-07-07 09:00:00+00	8
13352	49	21	2026-07-07 14:00:00+00	8
13353	49	21	2026-07-08 09:00:00+00	8
13354	49	21	2026-07-08 14:00:00+00	8
13355	49	21	2026-07-09 09:00:00+00	8
13356	49	21	2026-07-09 14:00:00+00	8
13357	49	21	2026-07-10 09:00:00+00	8
13358	49	21	2026-07-10 14:00:00+00	8
13359	51	21	2026-06-29 09:00:00+00	8
13360	51	21	2026-06-29 14:00:00+00	8
13361	51	21	2026-06-30 09:00:00+00	8
13362	51	21	2026-06-30 14:00:00+00	8
13363	51	21	2026-07-01 09:00:00+00	8
13364	51	21	2026-07-01 14:00:00+00	8
13365	51	21	2026-07-02 09:00:00+00	8
13366	51	21	2026-07-02 14:00:00+00	8
13367	51	21	2026-07-03 09:00:00+00	8
13368	51	21	2026-07-03 14:00:00+00	8
13369	51	21	2026-07-06 09:00:00+00	8
13370	51	21	2026-07-06 14:00:00+00	8
13371	51	21	2026-07-07 09:00:00+00	8
13372	51	21	2026-07-07 14:00:00+00	8
13373	51	21	2026-07-08 09:00:00+00	8
13374	51	21	2026-07-08 14:00:00+00	8
13375	51	21	2026-07-09 09:00:00+00	8
13376	51	21	2026-07-09 14:00:00+00	8
13377	51	21	2026-07-10 09:00:00+00	8
13378	51	21	2026-07-10 14:00:00+00	8
13379	52	21	2026-06-29 09:00:00+00	8
13380	52	21	2026-06-29 14:00:00+00	8
13381	52	21	2026-06-30 09:00:00+00	8
13382	52	21	2026-06-30 14:00:00+00	8
13383	52	21	2026-07-01 09:00:00+00	8
13384	52	21	2026-07-01 14:00:00+00	8
13385	52	21	2026-07-02 09:00:00+00	8
13386	52	21	2026-07-02 14:00:00+00	8
13387	52	21	2026-07-03 09:00:00+00	8
13388	52	21	2026-07-03 14:00:00+00	8
13389	52	21	2026-07-06 09:00:00+00	8
13390	52	21	2026-07-06 14:00:00+00	8
13391	52	21	2026-07-07 09:00:00+00	8
13392	52	21	2026-07-07 14:00:00+00	8
13393	52	21	2026-07-08 09:00:00+00	8
13394	52	21	2026-07-08 14:00:00+00	8
13395	52	21	2026-07-09 09:00:00+00	8
13396	52	21	2026-07-09 14:00:00+00	8
13397	52	21	2026-07-10 09:00:00+00	8
13398	52	21	2026-07-10 14:00:00+00	8
13399	53	21	2026-06-29 09:00:00+00	8
13400	53	21	2026-06-29 14:00:00+00	8
13401	53	21	2026-06-30 09:00:00+00	8
13402	53	21	2026-06-30 14:00:00+00	8
13403	53	21	2026-07-01 09:00:00+00	8
13404	53	21	2026-07-01 14:00:00+00	8
13405	53	21	2026-07-02 09:00:00+00	8
13406	53	21	2026-07-02 14:00:00+00	8
13407	53	21	2026-07-03 09:00:00+00	8
13408	53	21	2026-07-03 14:00:00+00	8
13409	53	21	2026-07-06 09:00:00+00	8
13410	53	21	2026-07-06 14:00:00+00	8
13411	53	21	2026-07-07 09:00:00+00	8
13412	53	21	2026-07-07 14:00:00+00	8
13413	53	21	2026-07-08 09:00:00+00	8
13414	53	21	2026-07-08 14:00:00+00	8
13415	53	21	2026-07-09 09:00:00+00	8
13416	53	21	2026-07-09 14:00:00+00	8
13417	53	21	2026-07-10 09:00:00+00	8
13418	53	21	2026-07-10 14:00:00+00	8
13419	54	21	2026-06-29 09:00:00+00	8
13420	54	21	2026-06-29 14:00:00+00	8
13421	54	21	2026-06-30 09:00:00+00	8
13422	54	21	2026-06-30 14:00:00+00	8
13423	54	21	2026-07-01 09:00:00+00	8
13424	54	21	2026-07-01 14:00:00+00	8
13425	54	21	2026-07-02 09:00:00+00	8
13426	54	21	2026-07-02 14:00:00+00	8
13427	54	21	2026-07-03 09:00:00+00	8
13428	54	21	2026-07-03 14:00:00+00	8
13429	54	21	2026-07-06 09:00:00+00	8
13430	54	21	2026-07-06 14:00:00+00	8
13431	54	21	2026-07-07 09:00:00+00	8
13432	54	21	2026-07-07 14:00:00+00	8
13433	54	21	2026-07-08 09:00:00+00	8
13434	54	21	2026-07-08 14:00:00+00	8
13435	54	21	2026-07-09 09:00:00+00	8
13436	54	21	2026-07-09 14:00:00+00	8
13437	54	21	2026-07-10 09:00:00+00	8
13438	54	21	2026-07-10 14:00:00+00	8
13439	55	21	2026-06-29 09:00:00+00	8
13440	55	21	2026-06-29 14:00:00+00	8
13441	55	21	2026-06-30 09:00:00+00	8
13442	55	21	2026-06-30 14:00:00+00	8
13443	55	21	2026-07-01 09:00:00+00	8
13444	55	21	2026-07-01 14:00:00+00	8
13445	55	21	2026-07-02 09:00:00+00	8
13446	55	21	2026-07-02 14:00:00+00	8
13447	55	21	2026-07-03 09:00:00+00	8
13448	55	21	2026-07-03 14:00:00+00	8
13449	55	21	2026-07-06 09:00:00+00	8
13450	55	21	2026-07-06 14:00:00+00	8
13451	55	21	2026-07-07 09:00:00+00	8
13452	55	21	2026-07-07 14:00:00+00	8
13453	55	21	2026-07-08 09:00:00+00	8
13454	55	21	2026-07-08 14:00:00+00	8
13455	55	21	2026-07-09 09:00:00+00	8
13456	55	21	2026-07-09 14:00:00+00	8
13457	55	21	2026-07-10 09:00:00+00	8
13458	55	21	2026-07-10 14:00:00+00	8
13459	56	21	2026-06-29 09:00:00+00	8
13460	56	21	2026-06-29 14:00:00+00	8
13461	56	21	2026-06-30 09:00:00+00	8
13462	56	21	2026-06-30 14:00:00+00	8
13463	56	21	2026-07-01 09:00:00+00	8
13464	56	21	2026-07-01 14:00:00+00	8
13465	56	21	2026-07-02 09:00:00+00	8
13466	56	21	2026-07-02 14:00:00+00	8
13467	56	21	2026-07-03 09:00:00+00	8
13468	56	21	2026-07-03 14:00:00+00	8
13469	56	21	2026-07-06 09:00:00+00	8
13470	56	21	2026-07-06 14:00:00+00	8
13471	56	21	2026-07-07 09:00:00+00	8
13472	56	21	2026-07-07 14:00:00+00	8
13473	56	21	2026-07-08 09:00:00+00	8
13474	56	21	2026-07-08 14:00:00+00	8
13475	56	21	2026-07-09 09:00:00+00	8
13476	56	21	2026-07-09 14:00:00+00	8
13477	56	21	2026-07-10 09:00:00+00	8
13478	56	21	2026-07-10 14:00:00+00	8
13479	57	21	2026-06-29 09:00:00+00	8
13480	57	21	2026-06-29 14:00:00+00	8
13481	57	21	2026-06-30 09:00:00+00	8
13482	57	21	2026-06-30 14:00:00+00	8
13483	57	21	2026-07-01 09:00:00+00	8
13484	57	21	2026-07-01 14:00:00+00	8
13485	57	21	2026-07-02 09:00:00+00	8
13486	57	21	2026-07-02 14:00:00+00	8
13487	57	21	2026-07-03 09:00:00+00	8
13488	57	21	2026-07-03 14:00:00+00	8
13489	57	21	2026-07-06 09:00:00+00	8
13490	57	21	2026-07-06 14:00:00+00	8
13491	57	21	2026-07-07 09:00:00+00	8
13492	57	21	2026-07-07 14:00:00+00	8
13493	57	21	2026-07-08 09:00:00+00	8
13494	57	21	2026-07-08 14:00:00+00	8
13495	57	21	2026-07-09 09:00:00+00	8
13496	57	21	2026-07-09 14:00:00+00	8
13497	57	21	2026-07-10 09:00:00+00	8
13498	57	21	2026-07-10 14:00:00+00	8
13499	3	22	2026-06-29 09:00:00+00	8
13500	3	22	2026-06-29 14:00:00+00	8
13501	3	22	2026-06-30 09:00:00+00	8
13502	3	22	2026-06-30 14:00:00+00	8
13503	3	22	2026-07-01 09:00:00+00	8
13504	3	22	2026-07-01 14:00:00+00	8
13505	3	22	2026-07-02 09:00:00+00	8
13506	3	22	2026-07-02 14:00:00+00	8
13507	3	22	2026-07-03 09:00:00+00	8
13508	3	22	2026-07-03 14:00:00+00	8
13509	3	22	2026-07-06 09:00:00+00	8
13510	3	22	2026-07-06 14:00:00+00	8
13511	3	22	2026-07-07 09:00:00+00	8
13512	3	22	2026-07-07 14:00:00+00	8
13513	3	22	2026-07-08 09:00:00+00	8
13514	3	22	2026-07-08 14:00:00+00	8
13515	3	22	2026-07-09 09:00:00+00	8
13516	3	22	2026-07-09 14:00:00+00	8
13517	3	22	2026-07-10 09:00:00+00	8
13518	3	22	2026-07-10 14:00:00+00	8
13519	4	22	2026-06-29 09:00:00+00	8
13520	4	22	2026-06-29 14:00:00+00	8
13521	4	22	2026-06-30 09:00:00+00	8
13522	4	22	2026-06-30 14:00:00+00	8
13523	4	22	2026-07-01 09:00:00+00	8
13524	4	22	2026-07-01 14:00:00+00	8
13525	4	22	2026-07-02 09:00:00+00	8
13526	4	22	2026-07-02 14:00:00+00	8
13527	4	22	2026-07-03 09:00:00+00	8
13528	4	22	2026-07-03 14:00:00+00	8
13529	4	22	2026-07-06 09:00:00+00	8
13530	4	22	2026-07-06 14:00:00+00	8
13531	4	22	2026-07-07 09:00:00+00	8
13532	4	22	2026-07-07 14:00:00+00	8
13533	4	22	2026-07-08 09:00:00+00	8
13534	4	22	2026-07-08 14:00:00+00	8
13535	4	22	2026-07-09 09:00:00+00	8
13536	4	22	2026-07-09 14:00:00+00	8
13537	4	22	2026-07-10 09:00:00+00	8
13538	4	22	2026-07-10 14:00:00+00	8
13539	6	22	2026-06-29 09:00:00+00	8
13540	6	22	2026-06-29 14:00:00+00	8
13541	6	22	2026-06-30 09:00:00+00	8
13542	6	22	2026-06-30 14:00:00+00	8
13543	6	22	2026-07-01 09:00:00+00	8
13544	6	22	2026-07-01 14:00:00+00	8
13545	6	22	2026-07-02 09:00:00+00	8
13546	6	22	2026-07-02 14:00:00+00	8
13547	6	22	2026-07-03 09:00:00+00	8
13548	6	22	2026-07-03 14:00:00+00	8
13549	6	22	2026-07-06 09:00:00+00	8
13550	6	22	2026-07-06 14:00:00+00	8
13551	6	22	2026-07-07 09:00:00+00	8
13552	6	22	2026-07-07 14:00:00+00	8
13553	6	22	2026-07-08 09:00:00+00	8
13554	6	22	2026-07-08 14:00:00+00	8
13555	6	22	2026-07-09 09:00:00+00	8
13556	6	22	2026-07-09 14:00:00+00	8
13557	6	22	2026-07-10 09:00:00+00	8
13558	6	22	2026-07-10 14:00:00+00	8
13559	8	22	2026-06-29 09:00:00+00	8
13560	8	22	2026-06-29 14:00:00+00	8
13561	8	22	2026-06-30 09:00:00+00	8
13562	8	22	2026-06-30 14:00:00+00	8
13563	8	22	2026-07-01 09:00:00+00	8
13564	8	22	2026-07-01 14:00:00+00	8
13565	8	22	2026-07-02 09:00:00+00	8
13566	8	22	2026-07-02 14:00:00+00	8
13567	8	22	2026-07-03 09:00:00+00	8
13568	8	22	2026-07-03 14:00:00+00	8
13569	8	22	2026-07-06 09:00:00+00	8
13570	8	22	2026-07-06 14:00:00+00	8
13571	8	22	2026-07-07 09:00:00+00	8
13572	8	22	2026-07-07 14:00:00+00	8
13573	8	22	2026-07-08 09:00:00+00	8
13574	8	22	2026-07-08 14:00:00+00	8
13575	8	22	2026-07-09 09:00:00+00	8
13576	8	22	2026-07-09 14:00:00+00	8
13577	8	22	2026-07-10 09:00:00+00	8
13578	8	22	2026-07-10 14:00:00+00	8
13579	10	22	2026-06-29 09:00:00+00	8
13580	10	22	2026-06-29 14:00:00+00	8
13581	10	22	2026-06-30 09:00:00+00	8
13582	10	22	2026-06-30 14:00:00+00	8
13583	10	22	2026-07-01 09:00:00+00	8
13584	10	22	2026-07-01 14:00:00+00	8
13585	10	22	2026-07-02 09:00:00+00	8
13586	10	22	2026-07-02 14:00:00+00	8
13587	10	22	2026-07-03 09:00:00+00	8
13588	10	22	2026-07-03 14:00:00+00	8
13589	10	22	2026-07-06 09:00:00+00	8
13590	10	22	2026-07-06 14:00:00+00	8
13591	10	22	2026-07-07 09:00:00+00	8
13592	10	22	2026-07-07 14:00:00+00	8
13593	10	22	2026-07-08 09:00:00+00	8
13594	10	22	2026-07-08 14:00:00+00	8
13595	10	22	2026-07-09 09:00:00+00	8
13596	10	22	2026-07-09 14:00:00+00	8
13597	10	22	2026-07-10 09:00:00+00	8
13598	10	22	2026-07-10 14:00:00+00	8
13599	11	22	2026-06-29 09:00:00+00	8
13600	11	22	2026-06-29 14:00:00+00	8
13601	11	22	2026-06-30 09:00:00+00	8
13602	11	22	2026-06-30 14:00:00+00	8
13603	11	22	2026-07-01 09:00:00+00	8
13604	11	22	2026-07-01 14:00:00+00	8
13605	11	22	2026-07-02 09:00:00+00	8
13606	11	22	2026-07-02 14:00:00+00	8
13607	11	22	2026-07-03 09:00:00+00	8
13608	11	22	2026-07-03 14:00:00+00	8
13609	11	22	2026-07-06 09:00:00+00	8
13610	11	22	2026-07-06 14:00:00+00	8
13611	11	22	2026-07-07 09:00:00+00	8
13612	11	22	2026-07-07 14:00:00+00	8
13613	11	22	2026-07-08 09:00:00+00	8
13614	11	22	2026-07-08 14:00:00+00	8
13615	11	22	2026-07-09 09:00:00+00	8
13616	11	22	2026-07-09 14:00:00+00	8
13617	11	22	2026-07-10 09:00:00+00	8
13618	11	22	2026-07-10 14:00:00+00	8
13619	12	22	2026-06-29 09:00:00+00	8
13620	12	22	2026-06-29 14:00:00+00	8
13621	12	22	2026-06-30 09:00:00+00	8
13622	12	22	2026-06-30 14:00:00+00	8
13623	12	22	2026-07-01 09:00:00+00	8
13624	12	22	2026-07-01 14:00:00+00	8
13625	12	22	2026-07-02 09:00:00+00	8
13626	12	22	2026-07-02 14:00:00+00	8
13627	12	22	2026-07-03 09:00:00+00	8
13628	12	22	2026-07-03 14:00:00+00	8
13629	12	22	2026-07-06 09:00:00+00	8
13630	12	22	2026-07-06 14:00:00+00	8
13631	12	22	2026-07-07 09:00:00+00	8
13632	12	22	2026-07-07 14:00:00+00	8
13633	12	22	2026-07-08 09:00:00+00	8
13634	12	22	2026-07-08 14:00:00+00	8
13635	12	22	2026-07-09 09:00:00+00	8
13636	12	22	2026-07-09 14:00:00+00	8
13637	12	22	2026-07-10 09:00:00+00	8
13638	12	22	2026-07-10 14:00:00+00	8
13639	13	22	2026-06-29 09:00:00+00	8
13640	13	22	2026-06-29 14:00:00+00	8
13641	13	22	2026-06-30 09:00:00+00	8
13642	13	22	2026-06-30 14:00:00+00	8
13643	13	22	2026-07-01 09:00:00+00	8
13644	13	22	2026-07-01 14:00:00+00	8
13645	13	22	2026-07-02 09:00:00+00	8
13646	13	22	2026-07-02 14:00:00+00	8
13647	13	22	2026-07-03 09:00:00+00	8
13648	13	22	2026-07-03 14:00:00+00	8
13649	13	22	2026-07-06 09:00:00+00	8
13650	13	22	2026-07-06 14:00:00+00	8
13651	13	22	2026-07-07 09:00:00+00	8
13652	13	22	2026-07-07 14:00:00+00	8
13653	13	22	2026-07-08 09:00:00+00	8
13654	13	22	2026-07-08 14:00:00+00	8
13655	13	22	2026-07-09 09:00:00+00	8
13656	13	22	2026-07-09 14:00:00+00	8
13657	13	22	2026-07-10 09:00:00+00	8
13658	13	22	2026-07-10 14:00:00+00	8
13659	15	22	2026-06-29 09:00:00+00	8
13660	15	22	2026-06-29 14:00:00+00	8
13661	15	22	2026-06-30 09:00:00+00	8
13662	15	22	2026-06-30 14:00:00+00	8
13663	15	22	2026-07-01 09:00:00+00	8
13664	15	22	2026-07-01 14:00:00+00	8
13665	15	22	2026-07-02 09:00:00+00	8
13666	15	22	2026-07-02 14:00:00+00	8
13667	15	22	2026-07-03 09:00:00+00	8
13668	15	22	2026-07-03 14:00:00+00	8
13669	15	22	2026-07-06 09:00:00+00	8
13670	15	22	2026-07-06 14:00:00+00	8
13671	15	22	2026-07-07 09:00:00+00	8
13672	15	22	2026-07-07 14:00:00+00	8
13673	15	22	2026-07-08 09:00:00+00	8
13674	15	22	2026-07-08 14:00:00+00	8
13675	15	22	2026-07-09 09:00:00+00	8
13676	15	22	2026-07-09 14:00:00+00	8
13677	15	22	2026-07-10 09:00:00+00	8
13678	15	22	2026-07-10 14:00:00+00	8
13679	16	22	2026-06-29 09:00:00+00	8
13680	16	22	2026-06-29 14:00:00+00	8
13681	16	22	2026-06-30 09:00:00+00	8
13682	16	22	2026-06-30 14:00:00+00	8
13683	16	22	2026-07-01 09:00:00+00	8
13684	16	22	2026-07-01 14:00:00+00	8
13685	16	22	2026-07-02 09:00:00+00	8
13686	16	22	2026-07-02 14:00:00+00	8
13687	16	22	2026-07-03 09:00:00+00	8
13688	16	22	2026-07-03 14:00:00+00	8
13689	16	22	2026-07-06 09:00:00+00	8
13690	16	22	2026-07-06 14:00:00+00	8
13691	16	22	2026-07-07 09:00:00+00	8
13692	16	22	2026-07-07 14:00:00+00	8
13693	16	22	2026-07-08 09:00:00+00	8
13694	16	22	2026-07-08 14:00:00+00	8
13695	16	22	2026-07-09 09:00:00+00	8
13696	16	22	2026-07-09 14:00:00+00	8
13697	16	22	2026-07-10 09:00:00+00	8
13698	16	22	2026-07-10 14:00:00+00	8
13699	17	22	2026-06-29 09:00:00+00	8
13700	17	22	2026-06-29 14:00:00+00	8
13701	17	22	2026-06-30 09:00:00+00	8
13702	17	22	2026-06-30 14:00:00+00	8
13703	17	22	2026-07-01 09:00:00+00	8
13704	17	22	2026-07-01 14:00:00+00	8
13705	17	22	2026-07-02 09:00:00+00	8
13706	17	22	2026-07-02 14:00:00+00	8
13707	17	22	2026-07-03 09:00:00+00	8
13708	17	22	2026-07-03 14:00:00+00	8
13709	17	22	2026-07-06 09:00:00+00	8
13710	17	22	2026-07-06 14:00:00+00	8
13711	17	22	2026-07-07 09:00:00+00	8
13712	17	22	2026-07-07 14:00:00+00	8
13713	17	22	2026-07-08 09:00:00+00	8
13714	17	22	2026-07-08 14:00:00+00	8
13715	17	22	2026-07-09 09:00:00+00	8
13716	17	22	2026-07-09 14:00:00+00	8
13717	17	22	2026-07-10 09:00:00+00	8
13718	17	22	2026-07-10 14:00:00+00	8
13719	18	22	2026-06-29 09:00:00+00	8
13720	18	22	2026-06-29 14:00:00+00	8
13721	18	22	2026-06-30 09:00:00+00	8
13722	18	22	2026-06-30 14:00:00+00	8
13723	18	22	2026-07-01 09:00:00+00	8
13724	18	22	2026-07-01 14:00:00+00	8
13725	18	22	2026-07-02 09:00:00+00	8
13726	18	22	2026-07-02 14:00:00+00	8
13727	18	22	2026-07-03 09:00:00+00	8
13728	18	22	2026-07-03 14:00:00+00	8
13729	18	22	2026-07-06 09:00:00+00	8
13730	18	22	2026-07-06 14:00:00+00	8
13731	18	22	2026-07-07 09:00:00+00	8
13732	18	22	2026-07-07 14:00:00+00	8
13733	18	22	2026-07-08 09:00:00+00	8
13734	18	22	2026-07-08 14:00:00+00	8
13735	18	22	2026-07-09 09:00:00+00	8
13736	18	22	2026-07-09 14:00:00+00	8
13737	18	22	2026-07-10 09:00:00+00	8
13738	18	22	2026-07-10 14:00:00+00	8
13739	19	22	2026-06-29 09:00:00+00	8
13740	19	22	2026-06-29 14:00:00+00	8
13741	19	22	2026-06-30 09:00:00+00	8
13742	19	22	2026-06-30 14:00:00+00	8
13743	19	22	2026-07-01 09:00:00+00	8
13744	19	22	2026-07-01 14:00:00+00	8
13745	19	22	2026-07-02 09:00:00+00	8
13746	19	22	2026-07-02 14:00:00+00	8
13747	19	22	2026-07-03 09:00:00+00	8
13748	19	22	2026-07-03 14:00:00+00	8
13749	19	22	2026-07-06 09:00:00+00	8
13750	19	22	2026-07-06 14:00:00+00	8
13751	19	22	2026-07-07 09:00:00+00	8
13752	19	22	2026-07-07 14:00:00+00	8
13753	19	22	2026-07-08 09:00:00+00	8
13754	19	22	2026-07-08 14:00:00+00	8
13755	19	22	2026-07-09 09:00:00+00	8
13756	19	22	2026-07-09 14:00:00+00	8
13757	19	22	2026-07-10 09:00:00+00	8
13758	19	22	2026-07-10 14:00:00+00	8
13759	20	22	2026-06-29 09:00:00+00	8
13760	20	22	2026-06-29 14:00:00+00	8
13761	20	22	2026-06-30 09:00:00+00	8
13762	20	22	2026-06-30 14:00:00+00	8
13763	20	22	2026-07-01 09:00:00+00	8
13764	20	22	2026-07-01 14:00:00+00	8
13765	20	22	2026-07-02 09:00:00+00	8
13766	20	22	2026-07-02 14:00:00+00	8
13767	20	22	2026-07-03 09:00:00+00	8
13768	20	22	2026-07-03 14:00:00+00	8
13769	20	22	2026-07-06 09:00:00+00	8
13770	20	22	2026-07-06 14:00:00+00	8
13771	20	22	2026-07-07 09:00:00+00	8
13772	20	22	2026-07-07 14:00:00+00	8
13773	20	22	2026-07-08 09:00:00+00	8
13774	20	22	2026-07-08 14:00:00+00	8
13775	20	22	2026-07-09 09:00:00+00	8
13776	20	22	2026-07-09 14:00:00+00	8
13777	20	22	2026-07-10 09:00:00+00	8
13778	20	22	2026-07-10 14:00:00+00	8
13779	22	22	2026-06-29 09:00:00+00	8
13780	22	22	2026-06-29 14:00:00+00	8
13781	22	22	2026-06-30 09:00:00+00	8
13782	22	22	2026-06-30 14:00:00+00	8
13783	22	22	2026-07-01 09:00:00+00	8
13784	22	22	2026-07-01 14:00:00+00	8
13785	22	22	2026-07-02 09:00:00+00	8
13786	22	22	2026-07-02 14:00:00+00	8
13787	22	22	2026-07-03 09:00:00+00	8
13788	22	22	2026-07-03 14:00:00+00	8
13789	22	22	2026-07-06 09:00:00+00	8
13790	22	22	2026-07-06 14:00:00+00	8
13791	22	22	2026-07-07 09:00:00+00	8
13792	22	22	2026-07-07 14:00:00+00	8
13793	22	22	2026-07-08 09:00:00+00	8
13794	22	22	2026-07-08 14:00:00+00	8
13795	22	22	2026-07-09 09:00:00+00	8
13796	22	22	2026-07-09 14:00:00+00	8
13797	22	22	2026-07-10 09:00:00+00	8
13798	22	22	2026-07-10 14:00:00+00	8
13799	23	22	2026-06-29 09:00:00+00	8
13800	23	22	2026-06-29 14:00:00+00	8
13801	23	22	2026-06-30 09:00:00+00	8
13802	23	22	2026-06-30 14:00:00+00	8
13803	23	22	2026-07-01 09:00:00+00	8
13804	23	22	2026-07-01 14:00:00+00	8
13805	23	22	2026-07-02 09:00:00+00	8
13806	23	22	2026-07-02 14:00:00+00	8
13807	23	22	2026-07-03 09:00:00+00	8
13808	23	22	2026-07-03 14:00:00+00	8
13809	23	22	2026-07-06 09:00:00+00	8
13810	23	22	2026-07-06 14:00:00+00	8
13811	23	22	2026-07-07 09:00:00+00	8
13812	23	22	2026-07-07 14:00:00+00	8
13813	23	22	2026-07-08 09:00:00+00	8
13814	23	22	2026-07-08 14:00:00+00	8
13815	23	22	2026-07-09 09:00:00+00	8
13816	23	22	2026-07-09 14:00:00+00	8
13817	23	22	2026-07-10 09:00:00+00	8
13818	23	22	2026-07-10 14:00:00+00	8
13819	25	22	2026-06-29 09:00:00+00	8
13820	25	22	2026-06-29 14:00:00+00	8
13821	25	22	2026-06-30 09:00:00+00	8
13822	25	22	2026-06-30 14:00:00+00	8
13823	25	22	2026-07-01 09:00:00+00	8
13824	25	22	2026-07-01 14:00:00+00	8
13825	25	22	2026-07-02 09:00:00+00	8
13826	25	22	2026-07-02 14:00:00+00	8
13827	25	22	2026-07-03 09:00:00+00	8
13828	25	22	2026-07-03 14:00:00+00	8
13829	25	22	2026-07-06 09:00:00+00	8
13830	25	22	2026-07-06 14:00:00+00	8
13831	25	22	2026-07-07 09:00:00+00	8
13832	25	22	2026-07-07 14:00:00+00	8
13833	25	22	2026-07-08 09:00:00+00	8
13834	25	22	2026-07-08 14:00:00+00	8
13835	25	22	2026-07-09 09:00:00+00	8
13836	25	22	2026-07-09 14:00:00+00	8
13837	25	22	2026-07-10 09:00:00+00	8
13838	25	22	2026-07-10 14:00:00+00	8
13839	26	22	2026-06-29 09:00:00+00	8
13840	26	22	2026-06-29 14:00:00+00	8
13841	26	22	2026-06-30 09:00:00+00	8
13842	26	22	2026-06-30 14:00:00+00	8
13843	26	22	2026-07-01 09:00:00+00	8
13844	26	22	2026-07-01 14:00:00+00	8
13845	26	22	2026-07-02 09:00:00+00	8
13846	26	22	2026-07-02 14:00:00+00	8
13847	26	22	2026-07-03 09:00:00+00	8
13848	26	22	2026-07-03 14:00:00+00	8
13849	26	22	2026-07-06 09:00:00+00	8
13850	26	22	2026-07-06 14:00:00+00	8
13851	26	22	2026-07-07 09:00:00+00	8
13852	26	22	2026-07-07 14:00:00+00	8
13853	26	22	2026-07-08 09:00:00+00	8
13854	26	22	2026-07-08 14:00:00+00	8
13855	26	22	2026-07-09 09:00:00+00	8
13856	26	22	2026-07-09 14:00:00+00	8
13857	26	22	2026-07-10 09:00:00+00	8
13858	26	22	2026-07-10 14:00:00+00	8
13859	27	22	2026-06-29 09:00:00+00	8
13860	27	22	2026-06-29 14:00:00+00	8
13861	27	22	2026-06-30 09:00:00+00	8
13862	27	22	2026-06-30 14:00:00+00	8
13863	27	22	2026-07-01 09:00:00+00	8
13864	27	22	2026-07-01 14:00:00+00	8
13865	27	22	2026-07-02 09:00:00+00	8
13866	27	22	2026-07-02 14:00:00+00	8
13867	27	22	2026-07-03 09:00:00+00	8
13868	27	22	2026-07-03 14:00:00+00	8
13869	27	22	2026-07-06 09:00:00+00	8
13870	27	22	2026-07-06 14:00:00+00	8
13871	27	22	2026-07-07 09:00:00+00	8
13872	27	22	2026-07-07 14:00:00+00	8
13873	27	22	2026-07-08 09:00:00+00	8
13874	27	22	2026-07-08 14:00:00+00	8
13875	27	22	2026-07-09 09:00:00+00	8
13876	27	22	2026-07-09 14:00:00+00	8
13877	27	22	2026-07-10 09:00:00+00	8
13878	27	22	2026-07-10 14:00:00+00	8
13879	28	22	2026-06-29 09:00:00+00	8
13880	28	22	2026-06-29 14:00:00+00	8
13881	28	22	2026-06-30 09:00:00+00	8
13882	28	22	2026-06-30 14:00:00+00	8
13883	28	22	2026-07-01 09:00:00+00	8
13884	28	22	2026-07-01 14:00:00+00	8
13885	28	22	2026-07-02 09:00:00+00	8
13886	28	22	2026-07-02 14:00:00+00	8
13887	28	22	2026-07-03 09:00:00+00	8
13888	28	22	2026-07-03 14:00:00+00	8
13889	28	22	2026-07-06 09:00:00+00	8
13890	28	22	2026-07-06 14:00:00+00	8
13891	28	22	2026-07-07 09:00:00+00	8
13892	28	22	2026-07-07 14:00:00+00	8
13893	28	22	2026-07-08 09:00:00+00	8
13894	28	22	2026-07-08 14:00:00+00	8
13895	28	22	2026-07-09 09:00:00+00	8
13896	28	22	2026-07-09 14:00:00+00	8
13897	28	22	2026-07-10 09:00:00+00	8
13898	28	22	2026-07-10 14:00:00+00	8
13899	29	22	2026-06-29 09:00:00+00	8
13900	29	22	2026-06-29 14:00:00+00	8
13901	29	22	2026-06-30 09:00:00+00	8
13902	29	22	2026-06-30 14:00:00+00	8
13903	29	22	2026-07-01 09:00:00+00	8
13904	29	22	2026-07-01 14:00:00+00	8
13905	29	22	2026-07-02 09:00:00+00	8
13906	29	22	2026-07-02 14:00:00+00	8
13907	29	22	2026-07-03 09:00:00+00	8
13908	29	22	2026-07-03 14:00:00+00	8
13909	29	22	2026-07-06 09:00:00+00	8
13910	29	22	2026-07-06 14:00:00+00	8
13911	29	22	2026-07-07 09:00:00+00	8
13912	29	22	2026-07-07 14:00:00+00	8
13913	29	22	2026-07-08 09:00:00+00	8
13914	29	22	2026-07-08 14:00:00+00	8
13915	29	22	2026-07-09 09:00:00+00	8
13916	29	22	2026-07-09 14:00:00+00	8
13917	29	22	2026-07-10 09:00:00+00	8
13918	29	22	2026-07-10 14:00:00+00	8
13919	30	22	2026-06-29 09:00:00+00	8
13920	30	22	2026-06-29 14:00:00+00	8
13921	30	22	2026-06-30 09:00:00+00	8
13922	30	22	2026-06-30 14:00:00+00	8
13923	30	22	2026-07-01 09:00:00+00	8
13924	30	22	2026-07-01 14:00:00+00	8
13925	30	22	2026-07-02 09:00:00+00	8
13926	30	22	2026-07-02 14:00:00+00	8
13927	30	22	2026-07-03 09:00:00+00	8
13928	30	22	2026-07-03 14:00:00+00	8
13929	30	22	2026-07-06 09:00:00+00	8
13930	30	22	2026-07-06 14:00:00+00	8
13931	30	22	2026-07-07 09:00:00+00	8
13932	30	22	2026-07-07 14:00:00+00	8
13933	30	22	2026-07-08 09:00:00+00	8
13934	30	22	2026-07-08 14:00:00+00	8
13935	30	22	2026-07-09 09:00:00+00	8
13936	30	22	2026-07-09 14:00:00+00	8
13937	30	22	2026-07-10 09:00:00+00	8
13938	30	22	2026-07-10 14:00:00+00	8
13939	31	22	2026-06-29 09:00:00+00	8
13940	31	22	2026-06-29 14:00:00+00	8
13941	31	22	2026-06-30 09:00:00+00	8
13942	31	22	2026-06-30 14:00:00+00	8
13943	31	22	2026-07-01 09:00:00+00	8
13944	31	22	2026-07-01 14:00:00+00	8
13945	31	22	2026-07-02 09:00:00+00	8
13946	31	22	2026-07-02 14:00:00+00	8
13947	31	22	2026-07-03 09:00:00+00	8
13948	31	22	2026-07-03 14:00:00+00	8
13949	31	22	2026-07-06 09:00:00+00	8
13950	31	22	2026-07-06 14:00:00+00	8
13951	31	22	2026-07-07 09:00:00+00	8
13952	31	22	2026-07-07 14:00:00+00	8
13953	31	22	2026-07-08 09:00:00+00	8
13954	31	22	2026-07-08 14:00:00+00	8
13955	31	22	2026-07-09 09:00:00+00	8
13956	31	22	2026-07-09 14:00:00+00	8
13957	31	22	2026-07-10 09:00:00+00	8
13958	31	22	2026-07-10 14:00:00+00	8
13959	32	22	2026-06-29 09:00:00+00	8
13960	32	22	2026-06-29 14:00:00+00	8
13961	32	22	2026-06-30 09:00:00+00	8
13962	32	22	2026-06-30 14:00:00+00	8
13963	32	22	2026-07-01 09:00:00+00	8
13964	32	22	2026-07-01 14:00:00+00	8
13965	32	22	2026-07-02 09:00:00+00	8
13966	32	22	2026-07-02 14:00:00+00	8
13967	32	22	2026-07-03 09:00:00+00	8
13968	32	22	2026-07-03 14:00:00+00	8
13969	32	22	2026-07-06 09:00:00+00	8
13970	32	22	2026-07-06 14:00:00+00	8
13971	32	22	2026-07-07 09:00:00+00	8
13972	32	22	2026-07-07 14:00:00+00	8
13973	32	22	2026-07-08 09:00:00+00	8
13974	32	22	2026-07-08 14:00:00+00	8
13975	32	22	2026-07-09 09:00:00+00	8
13976	32	22	2026-07-09 14:00:00+00	8
13977	32	22	2026-07-10 09:00:00+00	8
13978	32	22	2026-07-10 14:00:00+00	8
13979	33	22	2026-06-29 09:00:00+00	8
13980	33	22	2026-06-29 14:00:00+00	8
13981	33	22	2026-06-30 09:00:00+00	8
13982	33	22	2026-06-30 14:00:00+00	8
13983	33	22	2026-07-01 09:00:00+00	8
13984	33	22	2026-07-01 14:00:00+00	8
13985	33	22	2026-07-02 09:00:00+00	8
13986	33	22	2026-07-02 14:00:00+00	8
13987	33	22	2026-07-03 09:00:00+00	8
13988	33	22	2026-07-03 14:00:00+00	8
13989	33	22	2026-07-06 09:00:00+00	8
13990	33	22	2026-07-06 14:00:00+00	8
13991	33	22	2026-07-07 09:00:00+00	8
13992	33	22	2026-07-07 14:00:00+00	8
13993	33	22	2026-07-08 09:00:00+00	8
13994	33	22	2026-07-08 14:00:00+00	8
13995	33	22	2026-07-09 09:00:00+00	8
13996	33	22	2026-07-09 14:00:00+00	8
13997	33	22	2026-07-10 09:00:00+00	8
13998	33	22	2026-07-10 14:00:00+00	8
13999	34	22	2026-06-29 09:00:00+00	8
14000	34	22	2026-06-29 14:00:00+00	8
14001	34	22	2026-06-30 09:00:00+00	8
14002	34	22	2026-06-30 14:00:00+00	8
14003	34	22	2026-07-01 09:00:00+00	8
14004	34	22	2026-07-01 14:00:00+00	8
14005	34	22	2026-07-02 09:00:00+00	8
14006	34	22	2026-07-02 14:00:00+00	8
14007	34	22	2026-07-03 09:00:00+00	8
14008	34	22	2026-07-03 14:00:00+00	8
14009	34	22	2026-07-06 09:00:00+00	8
14010	34	22	2026-07-06 14:00:00+00	8
14011	34	22	2026-07-07 09:00:00+00	8
14012	34	22	2026-07-07 14:00:00+00	8
14013	34	22	2026-07-08 09:00:00+00	8
14014	34	22	2026-07-08 14:00:00+00	8
14015	34	22	2026-07-09 09:00:00+00	8
14016	34	22	2026-07-09 14:00:00+00	8
14017	34	22	2026-07-10 09:00:00+00	8
14018	34	22	2026-07-10 14:00:00+00	8
14019	37	22	2026-06-29 09:00:00+00	8
14020	37	22	2026-06-29 14:00:00+00	8
14021	37	22	2026-06-30 09:00:00+00	8
14022	37	22	2026-06-30 14:00:00+00	8
14023	37	22	2026-07-01 09:00:00+00	8
14024	37	22	2026-07-01 14:00:00+00	8
14025	37	22	2026-07-02 09:00:00+00	8
14026	37	22	2026-07-02 14:00:00+00	8
14027	37	22	2026-07-03 09:00:00+00	8
14028	37	22	2026-07-03 14:00:00+00	8
14029	37	22	2026-07-06 09:00:00+00	8
14030	37	22	2026-07-06 14:00:00+00	8
14031	37	22	2026-07-07 09:00:00+00	8
14032	37	22	2026-07-07 14:00:00+00	8
14033	37	22	2026-07-08 09:00:00+00	8
14034	37	22	2026-07-08 14:00:00+00	8
14035	37	22	2026-07-09 09:00:00+00	8
14036	37	22	2026-07-09 14:00:00+00	8
14037	37	22	2026-07-10 09:00:00+00	8
14038	37	22	2026-07-10 14:00:00+00	8
14039	38	22	2026-06-29 09:00:00+00	8
14040	38	22	2026-06-29 14:00:00+00	8
14041	38	22	2026-06-30 09:00:00+00	8
14042	38	22	2026-06-30 14:00:00+00	8
14043	38	22	2026-07-01 09:00:00+00	8
14044	38	22	2026-07-01 14:00:00+00	8
14045	38	22	2026-07-02 09:00:00+00	8
14046	38	22	2026-07-02 14:00:00+00	8
14047	38	22	2026-07-03 09:00:00+00	8
14048	38	22	2026-07-03 14:00:00+00	8
14049	38	22	2026-07-06 09:00:00+00	8
14050	38	22	2026-07-06 14:00:00+00	8
14051	38	22	2026-07-07 09:00:00+00	8
14052	38	22	2026-07-07 14:00:00+00	8
14053	38	22	2026-07-08 09:00:00+00	8
14054	38	22	2026-07-08 14:00:00+00	8
14055	38	22	2026-07-09 09:00:00+00	8
14056	38	22	2026-07-09 14:00:00+00	8
14057	38	22	2026-07-10 09:00:00+00	8
14058	38	22	2026-07-10 14:00:00+00	8
14059	39	22	2026-06-29 09:00:00+00	8
14060	39	22	2026-06-29 14:00:00+00	8
14061	39	22	2026-06-30 09:00:00+00	8
14062	39	22	2026-06-30 14:00:00+00	8
14063	39	22	2026-07-01 09:00:00+00	8
14064	39	22	2026-07-01 14:00:00+00	8
14065	39	22	2026-07-02 09:00:00+00	8
14066	39	22	2026-07-02 14:00:00+00	8
14067	39	22	2026-07-03 09:00:00+00	8
14068	39	22	2026-07-03 14:00:00+00	8
14069	39	22	2026-07-06 09:00:00+00	8
14070	39	22	2026-07-06 14:00:00+00	8
14071	39	22	2026-07-07 09:00:00+00	8
14072	39	22	2026-07-07 14:00:00+00	8
14073	39	22	2026-07-08 09:00:00+00	8
14074	39	22	2026-07-08 14:00:00+00	8
14075	39	22	2026-07-09 09:00:00+00	8
14076	39	22	2026-07-09 14:00:00+00	8
14077	39	22	2026-07-10 09:00:00+00	8
14078	39	22	2026-07-10 14:00:00+00	8
14079	40	22	2026-06-29 09:00:00+00	8
14080	40	22	2026-06-29 14:00:00+00	8
14081	40	22	2026-06-30 09:00:00+00	8
14082	40	22	2026-06-30 14:00:00+00	8
14083	40	22	2026-07-01 09:00:00+00	8
14084	40	22	2026-07-01 14:00:00+00	8
14085	40	22	2026-07-02 09:00:00+00	8
14086	40	22	2026-07-02 14:00:00+00	8
14087	40	22	2026-07-03 09:00:00+00	8
14088	40	22	2026-07-03 14:00:00+00	8
14089	40	22	2026-07-06 09:00:00+00	8
14090	40	22	2026-07-06 14:00:00+00	8
14091	40	22	2026-07-07 09:00:00+00	8
14092	40	22	2026-07-07 14:00:00+00	8
14093	40	22	2026-07-08 09:00:00+00	8
14094	40	22	2026-07-08 14:00:00+00	8
14095	40	22	2026-07-09 09:00:00+00	8
14096	40	22	2026-07-09 14:00:00+00	8
14097	40	22	2026-07-10 09:00:00+00	8
14098	40	22	2026-07-10 14:00:00+00	8
14099	41	22	2026-06-29 09:00:00+00	8
14100	41	22	2026-06-29 14:00:00+00	8
14101	41	22	2026-06-30 09:00:00+00	8
14102	41	22	2026-06-30 14:00:00+00	8
14103	41	22	2026-07-01 09:00:00+00	8
14104	41	22	2026-07-01 14:00:00+00	8
14105	41	22	2026-07-02 09:00:00+00	8
14106	41	22	2026-07-02 14:00:00+00	8
14107	41	22	2026-07-03 09:00:00+00	8
14108	41	22	2026-07-03 14:00:00+00	8
14109	41	22	2026-07-06 09:00:00+00	8
14110	41	22	2026-07-06 14:00:00+00	8
14111	41	22	2026-07-07 09:00:00+00	8
14112	41	22	2026-07-07 14:00:00+00	8
14113	41	22	2026-07-08 09:00:00+00	8
14114	41	22	2026-07-08 14:00:00+00	8
14115	41	22	2026-07-09 09:00:00+00	8
14116	41	22	2026-07-09 14:00:00+00	8
14117	41	22	2026-07-10 09:00:00+00	8
14118	41	22	2026-07-10 14:00:00+00	8
14119	42	22	2026-06-29 09:00:00+00	8
14120	42	22	2026-06-29 14:00:00+00	8
14121	42	22	2026-06-30 09:00:00+00	8
14122	42	22	2026-06-30 14:00:00+00	8
14123	42	22	2026-07-01 09:00:00+00	8
14124	42	22	2026-07-01 14:00:00+00	8
14125	42	22	2026-07-02 09:00:00+00	8
14126	42	22	2026-07-02 14:00:00+00	8
14127	42	22	2026-07-03 09:00:00+00	8
14128	42	22	2026-07-03 14:00:00+00	8
14129	42	22	2026-07-06 09:00:00+00	8
14130	42	22	2026-07-06 14:00:00+00	8
14131	42	22	2026-07-07 09:00:00+00	8
14132	42	22	2026-07-07 14:00:00+00	8
14133	42	22	2026-07-08 09:00:00+00	8
14134	42	22	2026-07-08 14:00:00+00	8
14135	42	22	2026-07-09 09:00:00+00	8
14136	42	22	2026-07-09 14:00:00+00	8
14137	42	22	2026-07-10 09:00:00+00	8
14138	42	22	2026-07-10 14:00:00+00	8
14139	44	22	2026-06-29 09:00:00+00	8
14140	44	22	2026-06-29 14:00:00+00	8
14141	44	22	2026-06-30 09:00:00+00	8
14142	44	22	2026-06-30 14:00:00+00	8
14143	44	22	2026-07-01 09:00:00+00	8
14144	44	22	2026-07-01 14:00:00+00	8
14145	44	22	2026-07-02 09:00:00+00	8
14146	44	22	2026-07-02 14:00:00+00	8
14147	44	22	2026-07-03 09:00:00+00	8
14148	44	22	2026-07-03 14:00:00+00	8
14149	44	22	2026-07-06 09:00:00+00	8
14150	44	22	2026-07-06 14:00:00+00	8
14151	44	22	2026-07-07 09:00:00+00	8
14152	44	22	2026-07-07 14:00:00+00	8
14153	44	22	2026-07-08 09:00:00+00	8
14154	44	22	2026-07-08 14:00:00+00	8
14155	44	22	2026-07-09 09:00:00+00	8
14156	44	22	2026-07-09 14:00:00+00	8
14157	44	22	2026-07-10 09:00:00+00	8
14158	44	22	2026-07-10 14:00:00+00	8
14159	45	22	2026-06-29 09:00:00+00	8
14160	45	22	2026-06-29 14:00:00+00	8
14161	45	22	2026-06-30 09:00:00+00	8
14162	45	22	2026-06-30 14:00:00+00	8
14163	45	22	2026-07-01 09:00:00+00	8
14164	45	22	2026-07-01 14:00:00+00	8
14165	45	22	2026-07-02 09:00:00+00	8
14166	45	22	2026-07-02 14:00:00+00	8
14167	45	22	2026-07-03 09:00:00+00	8
14168	45	22	2026-07-03 14:00:00+00	8
14169	45	22	2026-07-06 09:00:00+00	8
14170	45	22	2026-07-06 14:00:00+00	8
14171	45	22	2026-07-07 09:00:00+00	8
14172	45	22	2026-07-07 14:00:00+00	8
14173	45	22	2026-07-08 09:00:00+00	8
14174	45	22	2026-07-08 14:00:00+00	8
14175	45	22	2026-07-09 09:00:00+00	8
14176	45	22	2026-07-09 14:00:00+00	8
14177	45	22	2026-07-10 09:00:00+00	8
14178	45	22	2026-07-10 14:00:00+00	8
14179	47	22	2026-06-29 09:00:00+00	8
14180	47	22	2026-06-29 14:00:00+00	8
14181	47	22	2026-06-30 09:00:00+00	8
14182	47	22	2026-06-30 14:00:00+00	8
14183	47	22	2026-07-01 09:00:00+00	8
14184	47	22	2026-07-01 14:00:00+00	8
14185	47	22	2026-07-02 09:00:00+00	8
14186	47	22	2026-07-02 14:00:00+00	8
14187	47	22	2026-07-03 09:00:00+00	8
14188	47	22	2026-07-03 14:00:00+00	8
14189	47	22	2026-07-06 09:00:00+00	8
14190	47	22	2026-07-06 14:00:00+00	8
14191	47	22	2026-07-07 09:00:00+00	8
14192	47	22	2026-07-07 14:00:00+00	8
14193	47	22	2026-07-08 09:00:00+00	8
14194	47	22	2026-07-08 14:00:00+00	8
14195	47	22	2026-07-09 09:00:00+00	8
14196	47	22	2026-07-09 14:00:00+00	8
14197	47	22	2026-07-10 09:00:00+00	8
14198	47	22	2026-07-10 14:00:00+00	8
14199	48	22	2026-06-29 09:00:00+00	8
14200	48	22	2026-06-29 14:00:00+00	8
14201	48	22	2026-06-30 09:00:00+00	8
14202	48	22	2026-06-30 14:00:00+00	8
14203	48	22	2026-07-01 09:00:00+00	8
14204	48	22	2026-07-01 14:00:00+00	8
14205	48	22	2026-07-02 09:00:00+00	8
14206	48	22	2026-07-02 14:00:00+00	8
14207	48	22	2026-07-03 09:00:00+00	8
14208	48	22	2026-07-03 14:00:00+00	8
14209	48	22	2026-07-06 09:00:00+00	8
14210	48	22	2026-07-06 14:00:00+00	8
14211	48	22	2026-07-07 09:00:00+00	8
14212	48	22	2026-07-07 14:00:00+00	8
14213	48	22	2026-07-08 09:00:00+00	8
14214	48	22	2026-07-08 14:00:00+00	8
14215	48	22	2026-07-09 09:00:00+00	8
14216	48	22	2026-07-09 14:00:00+00	8
14217	48	22	2026-07-10 09:00:00+00	8
14218	48	22	2026-07-10 14:00:00+00	8
14219	49	22	2026-06-29 09:00:00+00	8
14220	49	22	2026-06-29 14:00:00+00	8
14221	49	22	2026-06-30 09:00:00+00	8
14222	49	22	2026-06-30 14:00:00+00	8
14223	49	22	2026-07-01 09:00:00+00	8
14224	49	22	2026-07-01 14:00:00+00	8
14225	49	22	2026-07-02 09:00:00+00	8
14226	49	22	2026-07-02 14:00:00+00	8
14227	49	22	2026-07-03 09:00:00+00	8
14228	49	22	2026-07-03 14:00:00+00	8
14229	49	22	2026-07-06 09:00:00+00	8
14230	49	22	2026-07-06 14:00:00+00	8
14231	49	22	2026-07-07 09:00:00+00	8
14232	49	22	2026-07-07 14:00:00+00	8
14233	49	22	2026-07-08 09:00:00+00	8
14234	49	22	2026-07-08 14:00:00+00	8
14235	49	22	2026-07-09 09:00:00+00	8
14236	49	22	2026-07-09 14:00:00+00	8
14237	49	22	2026-07-10 09:00:00+00	8
14238	49	22	2026-07-10 14:00:00+00	8
14239	51	22	2026-06-29 09:00:00+00	8
14240	51	22	2026-06-29 14:00:00+00	8
14241	51	22	2026-06-30 09:00:00+00	8
14242	51	22	2026-06-30 14:00:00+00	8
14243	51	22	2026-07-01 09:00:00+00	8
14244	51	22	2026-07-01 14:00:00+00	8
14245	51	22	2026-07-02 09:00:00+00	8
14246	51	22	2026-07-02 14:00:00+00	8
14247	51	22	2026-07-03 09:00:00+00	8
14248	51	22	2026-07-03 14:00:00+00	8
14249	51	22	2026-07-06 09:00:00+00	8
14250	51	22	2026-07-06 14:00:00+00	8
14251	51	22	2026-07-07 09:00:00+00	8
14252	51	22	2026-07-07 14:00:00+00	8
14253	51	22	2026-07-08 09:00:00+00	8
14254	51	22	2026-07-08 14:00:00+00	8
14255	51	22	2026-07-09 09:00:00+00	8
14256	51	22	2026-07-09 14:00:00+00	8
14257	51	22	2026-07-10 09:00:00+00	8
14258	51	22	2026-07-10 14:00:00+00	8
14259	52	22	2026-06-29 09:00:00+00	8
14260	52	22	2026-06-29 14:00:00+00	8
14261	52	22	2026-06-30 09:00:00+00	8
14262	52	22	2026-06-30 14:00:00+00	8
14263	52	22	2026-07-01 09:00:00+00	8
14264	52	22	2026-07-01 14:00:00+00	8
14265	52	22	2026-07-02 09:00:00+00	8
14266	52	22	2026-07-02 14:00:00+00	8
14267	52	22	2026-07-03 09:00:00+00	8
14268	52	22	2026-07-03 14:00:00+00	8
14269	52	22	2026-07-06 09:00:00+00	8
14270	52	22	2026-07-06 14:00:00+00	8
14271	52	22	2026-07-07 09:00:00+00	8
14272	52	22	2026-07-07 14:00:00+00	8
14273	52	22	2026-07-08 09:00:00+00	8
14274	52	22	2026-07-08 14:00:00+00	8
14275	52	22	2026-07-09 09:00:00+00	8
14276	52	22	2026-07-09 14:00:00+00	8
14277	52	22	2026-07-10 09:00:00+00	8
14278	52	22	2026-07-10 14:00:00+00	8
14279	53	22	2026-06-29 09:00:00+00	8
14280	53	22	2026-06-29 14:00:00+00	8
14281	53	22	2026-06-30 09:00:00+00	8
14282	53	22	2026-06-30 14:00:00+00	8
14283	53	22	2026-07-01 09:00:00+00	8
14284	53	22	2026-07-01 14:00:00+00	8
14285	53	22	2026-07-02 09:00:00+00	8
14286	53	22	2026-07-02 14:00:00+00	8
14287	53	22	2026-07-03 09:00:00+00	8
14288	53	22	2026-07-03 14:00:00+00	8
14289	53	22	2026-07-06 09:00:00+00	8
14290	53	22	2026-07-06 14:00:00+00	8
14291	53	22	2026-07-07 09:00:00+00	8
14292	53	22	2026-07-07 14:00:00+00	8
14293	53	22	2026-07-08 09:00:00+00	8
14294	53	22	2026-07-08 14:00:00+00	8
14295	53	22	2026-07-09 09:00:00+00	8
14296	53	22	2026-07-09 14:00:00+00	8
14297	53	22	2026-07-10 09:00:00+00	8
14298	53	22	2026-07-10 14:00:00+00	8
14299	54	22	2026-06-29 09:00:00+00	8
14300	54	22	2026-06-29 14:00:00+00	8
14301	54	22	2026-06-30 09:00:00+00	8
14302	54	22	2026-06-30 14:00:00+00	8
14303	54	22	2026-07-01 09:00:00+00	8
14304	54	22	2026-07-01 14:00:00+00	8
14305	54	22	2026-07-02 09:00:00+00	8
14306	54	22	2026-07-02 14:00:00+00	8
14307	54	22	2026-07-03 09:00:00+00	8
14308	54	22	2026-07-03 14:00:00+00	8
14309	54	22	2026-07-06 09:00:00+00	8
14310	54	22	2026-07-06 14:00:00+00	8
14311	54	22	2026-07-07 09:00:00+00	8
14312	54	22	2026-07-07 14:00:00+00	8
14313	54	22	2026-07-08 09:00:00+00	8
14314	54	22	2026-07-08 14:00:00+00	8
14315	54	22	2026-07-09 09:00:00+00	8
14316	54	22	2026-07-09 14:00:00+00	8
14317	54	22	2026-07-10 09:00:00+00	8
14318	54	22	2026-07-10 14:00:00+00	8
14319	55	22	2026-06-29 09:00:00+00	8
14320	55	22	2026-06-29 14:00:00+00	8
14321	55	22	2026-06-30 09:00:00+00	8
14322	55	22	2026-06-30 14:00:00+00	8
14323	55	22	2026-07-01 09:00:00+00	8
14324	55	22	2026-07-01 14:00:00+00	8
14325	55	22	2026-07-02 09:00:00+00	8
14326	55	22	2026-07-02 14:00:00+00	8
14327	55	22	2026-07-03 09:00:00+00	8
14328	55	22	2026-07-03 14:00:00+00	8
14329	55	22	2026-07-06 09:00:00+00	8
14330	55	22	2026-07-06 14:00:00+00	8
14331	55	22	2026-07-07 09:00:00+00	8
14332	55	22	2026-07-07 14:00:00+00	8
14333	55	22	2026-07-08 09:00:00+00	8
14334	55	22	2026-07-08 14:00:00+00	8
14335	55	22	2026-07-09 09:00:00+00	8
14336	55	22	2026-07-09 14:00:00+00	8
14337	55	22	2026-07-10 09:00:00+00	8
14338	55	22	2026-07-10 14:00:00+00	8
14339	56	22	2026-06-29 09:00:00+00	8
14340	56	22	2026-06-29 14:00:00+00	8
14341	56	22	2026-06-30 09:00:00+00	8
14342	56	22	2026-06-30 14:00:00+00	8
14343	56	22	2026-07-01 09:00:00+00	8
14344	56	22	2026-07-01 14:00:00+00	8
14345	56	22	2026-07-02 09:00:00+00	8
14346	56	22	2026-07-02 14:00:00+00	8
14347	56	22	2026-07-03 09:00:00+00	8
14348	56	22	2026-07-03 14:00:00+00	8
14349	56	22	2026-07-06 09:00:00+00	8
14350	56	22	2026-07-06 14:00:00+00	8
14351	56	22	2026-07-07 09:00:00+00	8
14352	56	22	2026-07-07 14:00:00+00	8
14353	56	22	2026-07-08 09:00:00+00	8
14354	56	22	2026-07-08 14:00:00+00	8
14355	56	22	2026-07-09 09:00:00+00	8
14356	56	22	2026-07-09 14:00:00+00	8
14357	56	22	2026-07-10 09:00:00+00	8
14358	56	22	2026-07-10 14:00:00+00	8
14359	57	22	2026-06-29 09:00:00+00	8
14360	57	22	2026-06-29 14:00:00+00	8
14361	57	22	2026-06-30 09:00:00+00	8
14362	57	22	2026-06-30 14:00:00+00	8
14363	57	22	2026-07-01 09:00:00+00	8
14364	57	22	2026-07-01 14:00:00+00	8
14365	57	22	2026-07-02 09:00:00+00	8
14366	57	22	2026-07-02 14:00:00+00	8
14367	57	22	2026-07-03 09:00:00+00	8
14368	57	22	2026-07-03 14:00:00+00	8
14369	57	22	2026-07-06 09:00:00+00	8
14370	57	22	2026-07-06 14:00:00+00	8
14371	57	22	2026-07-07 09:00:00+00	8
14372	57	22	2026-07-07 14:00:00+00	8
14373	57	22	2026-07-08 09:00:00+00	8
14374	57	22	2026-07-08 14:00:00+00	8
14375	57	22	2026-07-09 09:00:00+00	8
14376	57	22	2026-07-09 14:00:00+00	8
14377	57	22	2026-07-10 09:00:00+00	8
14378	57	22	2026-07-10 14:00:00+00	8
14379	3	23	2026-06-29 09:00:00+00	8
14380	3	23	2026-06-29 14:00:00+00	8
14381	3	23	2026-06-30 09:00:00+00	8
14382	3	23	2026-06-30 14:00:00+00	8
14383	3	23	2026-07-01 09:00:00+00	8
14384	3	23	2026-07-01 14:00:00+00	8
14385	3	23	2026-07-02 09:00:00+00	8
14386	3	23	2026-07-02 14:00:00+00	8
14387	3	23	2026-07-03 09:00:00+00	8
14388	3	23	2026-07-03 14:00:00+00	8
14389	3	23	2026-07-06 09:00:00+00	8
14390	3	23	2026-07-06 14:00:00+00	8
14391	3	23	2026-07-07 09:00:00+00	8
14392	3	23	2026-07-07 14:00:00+00	8
14393	3	23	2026-07-08 09:00:00+00	8
14394	3	23	2026-07-08 14:00:00+00	8
14395	3	23	2026-07-09 09:00:00+00	8
14396	3	23	2026-07-09 14:00:00+00	8
14397	3	23	2026-07-10 09:00:00+00	8
14398	3	23	2026-07-10 14:00:00+00	8
14399	4	23	2026-06-29 09:00:00+00	8
14400	4	23	2026-06-29 14:00:00+00	8
14401	4	23	2026-06-30 09:00:00+00	8
14402	4	23	2026-06-30 14:00:00+00	8
14403	4	23	2026-07-01 09:00:00+00	8
14404	4	23	2026-07-01 14:00:00+00	8
14405	4	23	2026-07-02 09:00:00+00	8
14406	4	23	2026-07-02 14:00:00+00	8
14407	4	23	2026-07-03 09:00:00+00	8
14408	4	23	2026-07-03 14:00:00+00	8
14409	4	23	2026-07-06 09:00:00+00	8
14410	4	23	2026-07-06 14:00:00+00	8
14411	4	23	2026-07-07 09:00:00+00	8
14412	4	23	2026-07-07 14:00:00+00	8
14413	4	23	2026-07-08 09:00:00+00	8
14414	4	23	2026-07-08 14:00:00+00	8
14415	4	23	2026-07-09 09:00:00+00	8
14416	4	23	2026-07-09 14:00:00+00	8
14417	4	23	2026-07-10 09:00:00+00	8
14418	4	23	2026-07-10 14:00:00+00	8
14419	6	23	2026-06-29 09:00:00+00	8
14420	6	23	2026-06-29 14:00:00+00	8
14421	6	23	2026-06-30 09:00:00+00	8
14422	6	23	2026-06-30 14:00:00+00	8
14423	6	23	2026-07-01 09:00:00+00	8
14424	6	23	2026-07-01 14:00:00+00	8
14425	6	23	2026-07-02 09:00:00+00	8
14426	6	23	2026-07-02 14:00:00+00	8
14427	6	23	2026-07-03 09:00:00+00	8
14428	6	23	2026-07-03 14:00:00+00	8
14429	6	23	2026-07-06 09:00:00+00	8
14430	6	23	2026-07-06 14:00:00+00	8
14431	6	23	2026-07-07 09:00:00+00	8
14432	6	23	2026-07-07 14:00:00+00	8
14433	6	23	2026-07-08 09:00:00+00	8
14434	6	23	2026-07-08 14:00:00+00	8
14435	6	23	2026-07-09 09:00:00+00	8
14436	6	23	2026-07-09 14:00:00+00	8
14437	6	23	2026-07-10 09:00:00+00	8
14438	6	23	2026-07-10 14:00:00+00	8
14439	8	23	2026-06-29 09:00:00+00	8
14440	8	23	2026-06-29 14:00:00+00	8
14441	8	23	2026-06-30 09:00:00+00	8
14442	8	23	2026-06-30 14:00:00+00	8
14443	8	23	2026-07-01 09:00:00+00	8
14444	8	23	2026-07-01 14:00:00+00	8
14445	8	23	2026-07-02 09:00:00+00	8
14446	8	23	2026-07-02 14:00:00+00	8
14447	8	23	2026-07-03 09:00:00+00	8
14448	8	23	2026-07-03 14:00:00+00	8
14449	8	23	2026-07-06 09:00:00+00	8
14450	8	23	2026-07-06 14:00:00+00	8
14451	8	23	2026-07-07 09:00:00+00	8
14452	8	23	2026-07-07 14:00:00+00	8
14453	8	23	2026-07-08 09:00:00+00	8
14454	8	23	2026-07-08 14:00:00+00	8
14455	8	23	2026-07-09 09:00:00+00	8
14456	8	23	2026-07-09 14:00:00+00	8
14457	8	23	2026-07-10 09:00:00+00	8
14458	8	23	2026-07-10 14:00:00+00	8
14459	10	23	2026-06-29 09:00:00+00	8
14460	10	23	2026-06-29 14:00:00+00	8
14461	10	23	2026-06-30 09:00:00+00	8
14462	10	23	2026-06-30 14:00:00+00	8
14463	10	23	2026-07-01 09:00:00+00	8
14464	10	23	2026-07-01 14:00:00+00	8
14465	10	23	2026-07-02 09:00:00+00	8
14466	10	23	2026-07-02 14:00:00+00	8
14467	10	23	2026-07-03 09:00:00+00	8
14468	10	23	2026-07-03 14:00:00+00	8
14469	10	23	2026-07-06 09:00:00+00	8
14470	10	23	2026-07-06 14:00:00+00	8
14471	10	23	2026-07-07 09:00:00+00	8
14472	10	23	2026-07-07 14:00:00+00	8
14473	10	23	2026-07-08 09:00:00+00	8
14474	10	23	2026-07-08 14:00:00+00	8
14475	10	23	2026-07-09 09:00:00+00	8
14476	10	23	2026-07-09 14:00:00+00	8
14477	10	23	2026-07-10 09:00:00+00	8
14478	10	23	2026-07-10 14:00:00+00	8
14479	11	23	2026-06-29 09:00:00+00	8
14480	11	23	2026-06-29 14:00:00+00	8
14481	11	23	2026-06-30 09:00:00+00	8
14482	11	23	2026-06-30 14:00:00+00	8
14483	11	23	2026-07-01 09:00:00+00	8
14484	11	23	2026-07-01 14:00:00+00	8
14485	11	23	2026-07-02 09:00:00+00	8
14486	11	23	2026-07-02 14:00:00+00	8
14487	11	23	2026-07-03 09:00:00+00	8
14488	11	23	2026-07-03 14:00:00+00	8
14489	11	23	2026-07-06 09:00:00+00	8
14490	11	23	2026-07-06 14:00:00+00	8
14491	11	23	2026-07-07 09:00:00+00	8
14492	11	23	2026-07-07 14:00:00+00	8
14493	11	23	2026-07-08 09:00:00+00	8
14494	11	23	2026-07-08 14:00:00+00	8
14495	11	23	2026-07-09 09:00:00+00	8
14496	11	23	2026-07-09 14:00:00+00	8
14497	11	23	2026-07-10 09:00:00+00	8
14498	11	23	2026-07-10 14:00:00+00	8
14499	12	23	2026-06-29 09:00:00+00	8
14500	12	23	2026-06-29 14:00:00+00	8
14501	12	23	2026-06-30 09:00:00+00	8
14502	12	23	2026-06-30 14:00:00+00	8
14503	12	23	2026-07-01 09:00:00+00	8
14504	12	23	2026-07-01 14:00:00+00	8
14505	12	23	2026-07-02 09:00:00+00	8
14506	12	23	2026-07-02 14:00:00+00	8
14507	12	23	2026-07-03 09:00:00+00	8
14508	12	23	2026-07-03 14:00:00+00	8
14509	12	23	2026-07-06 09:00:00+00	8
14510	12	23	2026-07-06 14:00:00+00	8
14511	12	23	2026-07-07 09:00:00+00	8
14512	12	23	2026-07-07 14:00:00+00	8
14513	12	23	2026-07-08 09:00:00+00	8
14514	12	23	2026-07-08 14:00:00+00	8
14515	12	23	2026-07-09 09:00:00+00	8
14516	12	23	2026-07-09 14:00:00+00	8
14517	12	23	2026-07-10 09:00:00+00	8
14518	12	23	2026-07-10 14:00:00+00	8
14519	13	23	2026-06-29 09:00:00+00	8
14520	13	23	2026-06-29 14:00:00+00	8
14521	13	23	2026-06-30 09:00:00+00	8
14522	13	23	2026-06-30 14:00:00+00	8
14523	13	23	2026-07-01 09:00:00+00	8
14524	13	23	2026-07-01 14:00:00+00	8
14525	13	23	2026-07-02 09:00:00+00	8
14526	13	23	2026-07-02 14:00:00+00	8
14527	13	23	2026-07-03 09:00:00+00	8
14528	13	23	2026-07-03 14:00:00+00	8
14529	13	23	2026-07-06 09:00:00+00	8
14530	13	23	2026-07-06 14:00:00+00	8
14531	13	23	2026-07-07 09:00:00+00	8
14532	13	23	2026-07-07 14:00:00+00	8
14533	13	23	2026-07-08 09:00:00+00	8
14534	13	23	2026-07-08 14:00:00+00	8
14535	13	23	2026-07-09 09:00:00+00	8
14536	13	23	2026-07-09 14:00:00+00	8
14537	13	23	2026-07-10 09:00:00+00	8
14538	13	23	2026-07-10 14:00:00+00	8
14539	15	23	2026-06-29 09:00:00+00	8
14540	15	23	2026-06-29 14:00:00+00	8
14541	15	23	2026-06-30 09:00:00+00	8
14542	15	23	2026-06-30 14:00:00+00	8
14543	15	23	2026-07-01 09:00:00+00	8
14544	15	23	2026-07-01 14:00:00+00	8
14545	15	23	2026-07-02 09:00:00+00	8
14546	15	23	2026-07-02 14:00:00+00	8
14547	15	23	2026-07-03 09:00:00+00	8
14548	15	23	2026-07-03 14:00:00+00	8
14549	15	23	2026-07-06 09:00:00+00	8
14550	15	23	2026-07-06 14:00:00+00	8
14551	15	23	2026-07-07 09:00:00+00	8
14552	15	23	2026-07-07 14:00:00+00	8
14553	15	23	2026-07-08 09:00:00+00	8
14554	15	23	2026-07-08 14:00:00+00	8
14555	15	23	2026-07-09 09:00:00+00	8
14556	15	23	2026-07-09 14:00:00+00	8
14557	15	23	2026-07-10 09:00:00+00	8
14558	15	23	2026-07-10 14:00:00+00	8
14559	16	23	2026-06-29 09:00:00+00	8
14560	16	23	2026-06-29 14:00:00+00	8
14561	16	23	2026-06-30 09:00:00+00	8
14562	16	23	2026-06-30 14:00:00+00	8
14563	16	23	2026-07-01 09:00:00+00	8
14564	16	23	2026-07-01 14:00:00+00	8
14565	16	23	2026-07-02 09:00:00+00	8
14566	16	23	2026-07-02 14:00:00+00	8
14567	16	23	2026-07-03 09:00:00+00	8
14568	16	23	2026-07-03 14:00:00+00	8
14569	16	23	2026-07-06 09:00:00+00	8
14570	16	23	2026-07-06 14:00:00+00	8
14571	16	23	2026-07-07 09:00:00+00	8
14572	16	23	2026-07-07 14:00:00+00	8
14573	16	23	2026-07-08 09:00:00+00	8
14574	16	23	2026-07-08 14:00:00+00	8
14575	16	23	2026-07-09 09:00:00+00	8
14576	16	23	2026-07-09 14:00:00+00	8
14577	16	23	2026-07-10 09:00:00+00	8
14578	16	23	2026-07-10 14:00:00+00	8
14579	17	23	2026-06-29 09:00:00+00	8
14580	17	23	2026-06-29 14:00:00+00	8
14581	17	23	2026-06-30 09:00:00+00	8
14582	17	23	2026-06-30 14:00:00+00	8
14583	17	23	2026-07-01 09:00:00+00	8
14584	17	23	2026-07-01 14:00:00+00	8
14585	17	23	2026-07-02 09:00:00+00	8
14586	17	23	2026-07-02 14:00:00+00	8
14587	17	23	2026-07-03 09:00:00+00	8
14588	17	23	2026-07-03 14:00:00+00	8
14589	17	23	2026-07-06 09:00:00+00	8
14590	17	23	2026-07-06 14:00:00+00	8
14591	17	23	2026-07-07 09:00:00+00	8
14592	17	23	2026-07-07 14:00:00+00	8
14593	17	23	2026-07-08 09:00:00+00	8
14594	17	23	2026-07-08 14:00:00+00	8
14595	17	23	2026-07-09 09:00:00+00	8
14596	17	23	2026-07-09 14:00:00+00	8
14597	17	23	2026-07-10 09:00:00+00	8
14598	17	23	2026-07-10 14:00:00+00	8
14599	18	23	2026-06-29 09:00:00+00	8
14600	18	23	2026-06-29 14:00:00+00	8
14601	18	23	2026-06-30 09:00:00+00	8
14602	18	23	2026-06-30 14:00:00+00	8
14603	18	23	2026-07-01 09:00:00+00	8
14604	18	23	2026-07-01 14:00:00+00	8
14605	18	23	2026-07-02 09:00:00+00	8
14606	18	23	2026-07-02 14:00:00+00	8
14607	18	23	2026-07-03 09:00:00+00	8
14608	18	23	2026-07-03 14:00:00+00	8
14609	18	23	2026-07-06 09:00:00+00	8
14610	18	23	2026-07-06 14:00:00+00	8
14611	18	23	2026-07-07 09:00:00+00	8
14612	18	23	2026-07-07 14:00:00+00	8
14613	18	23	2026-07-08 09:00:00+00	8
14614	18	23	2026-07-08 14:00:00+00	8
14615	18	23	2026-07-09 09:00:00+00	8
14616	18	23	2026-07-09 14:00:00+00	8
14617	18	23	2026-07-10 09:00:00+00	8
14618	18	23	2026-07-10 14:00:00+00	8
14619	19	23	2026-06-29 09:00:00+00	8
14620	19	23	2026-06-29 14:00:00+00	8
14621	19	23	2026-06-30 09:00:00+00	8
14622	19	23	2026-06-30 14:00:00+00	8
14623	19	23	2026-07-01 09:00:00+00	8
14624	19	23	2026-07-01 14:00:00+00	8
14625	19	23	2026-07-02 09:00:00+00	8
14626	19	23	2026-07-02 14:00:00+00	8
14627	19	23	2026-07-03 09:00:00+00	8
14628	19	23	2026-07-03 14:00:00+00	8
14629	19	23	2026-07-06 09:00:00+00	8
14630	19	23	2026-07-06 14:00:00+00	8
14631	19	23	2026-07-07 09:00:00+00	8
14632	19	23	2026-07-07 14:00:00+00	8
14633	19	23	2026-07-08 09:00:00+00	8
14634	19	23	2026-07-08 14:00:00+00	8
14635	19	23	2026-07-09 09:00:00+00	8
14636	19	23	2026-07-09 14:00:00+00	8
14637	19	23	2026-07-10 09:00:00+00	8
14638	19	23	2026-07-10 14:00:00+00	8
14639	20	23	2026-06-29 09:00:00+00	8
14640	20	23	2026-06-29 14:00:00+00	8
14641	20	23	2026-06-30 09:00:00+00	8
14642	20	23	2026-06-30 14:00:00+00	8
14643	20	23	2026-07-01 09:00:00+00	8
14644	20	23	2026-07-01 14:00:00+00	8
14645	20	23	2026-07-02 09:00:00+00	8
14646	20	23	2026-07-02 14:00:00+00	8
14647	20	23	2026-07-03 09:00:00+00	8
14648	20	23	2026-07-03 14:00:00+00	8
14649	20	23	2026-07-06 09:00:00+00	8
14650	20	23	2026-07-06 14:00:00+00	8
14651	20	23	2026-07-07 09:00:00+00	8
14652	20	23	2026-07-07 14:00:00+00	8
14653	20	23	2026-07-08 09:00:00+00	8
14654	20	23	2026-07-08 14:00:00+00	8
14655	20	23	2026-07-09 09:00:00+00	8
14656	20	23	2026-07-09 14:00:00+00	8
14657	20	23	2026-07-10 09:00:00+00	8
14658	20	23	2026-07-10 14:00:00+00	8
14659	22	23	2026-06-29 09:00:00+00	8
14660	22	23	2026-06-29 14:00:00+00	8
14661	22	23	2026-06-30 09:00:00+00	8
14662	22	23	2026-06-30 14:00:00+00	8
14663	22	23	2026-07-01 09:00:00+00	8
14664	22	23	2026-07-01 14:00:00+00	8
14665	22	23	2026-07-02 09:00:00+00	8
14666	22	23	2026-07-02 14:00:00+00	8
14667	22	23	2026-07-03 09:00:00+00	8
14668	22	23	2026-07-03 14:00:00+00	8
14669	22	23	2026-07-06 09:00:00+00	8
14670	22	23	2026-07-06 14:00:00+00	8
14671	22	23	2026-07-07 09:00:00+00	8
14672	22	23	2026-07-07 14:00:00+00	8
14673	22	23	2026-07-08 09:00:00+00	8
14674	22	23	2026-07-08 14:00:00+00	8
14675	22	23	2026-07-09 09:00:00+00	8
14676	22	23	2026-07-09 14:00:00+00	8
14677	22	23	2026-07-10 09:00:00+00	8
14678	22	23	2026-07-10 14:00:00+00	8
14679	23	23	2026-06-29 09:00:00+00	8
14680	23	23	2026-06-29 14:00:00+00	8
14681	23	23	2026-06-30 09:00:00+00	8
14682	23	23	2026-06-30 14:00:00+00	8
14683	23	23	2026-07-01 09:00:00+00	8
14684	23	23	2026-07-01 14:00:00+00	8
14685	23	23	2026-07-02 09:00:00+00	8
14686	23	23	2026-07-02 14:00:00+00	8
14687	23	23	2026-07-03 09:00:00+00	8
14688	23	23	2026-07-03 14:00:00+00	8
14689	23	23	2026-07-06 09:00:00+00	8
14690	23	23	2026-07-06 14:00:00+00	8
14691	23	23	2026-07-07 09:00:00+00	8
14692	23	23	2026-07-07 14:00:00+00	8
14693	23	23	2026-07-08 09:00:00+00	8
14694	23	23	2026-07-08 14:00:00+00	8
14695	23	23	2026-07-09 09:00:00+00	8
14696	23	23	2026-07-09 14:00:00+00	8
14697	23	23	2026-07-10 09:00:00+00	8
14698	23	23	2026-07-10 14:00:00+00	8
14699	25	23	2026-06-29 09:00:00+00	8
14700	25	23	2026-06-29 14:00:00+00	8
14701	25	23	2026-06-30 09:00:00+00	8
14702	25	23	2026-06-30 14:00:00+00	8
14703	25	23	2026-07-01 09:00:00+00	8
14704	25	23	2026-07-01 14:00:00+00	8
14705	25	23	2026-07-02 09:00:00+00	8
14706	25	23	2026-07-02 14:00:00+00	8
14707	25	23	2026-07-03 09:00:00+00	8
14708	25	23	2026-07-03 14:00:00+00	8
14709	25	23	2026-07-06 09:00:00+00	8
14710	25	23	2026-07-06 14:00:00+00	8
14711	25	23	2026-07-07 09:00:00+00	8
14712	25	23	2026-07-07 14:00:00+00	8
14713	25	23	2026-07-08 09:00:00+00	8
14714	25	23	2026-07-08 14:00:00+00	8
14715	25	23	2026-07-09 09:00:00+00	8
14716	25	23	2026-07-09 14:00:00+00	8
14717	25	23	2026-07-10 09:00:00+00	8
14718	25	23	2026-07-10 14:00:00+00	8
14719	26	23	2026-06-29 09:00:00+00	8
14720	26	23	2026-06-29 14:00:00+00	8
14721	26	23	2026-06-30 09:00:00+00	8
14722	26	23	2026-06-30 14:00:00+00	8
14723	26	23	2026-07-01 09:00:00+00	8
14724	26	23	2026-07-01 14:00:00+00	8
14725	26	23	2026-07-02 09:00:00+00	8
14726	26	23	2026-07-02 14:00:00+00	8
14727	26	23	2026-07-03 09:00:00+00	8
14728	26	23	2026-07-03 14:00:00+00	8
14729	26	23	2026-07-06 09:00:00+00	8
14730	26	23	2026-07-06 14:00:00+00	8
14731	26	23	2026-07-07 09:00:00+00	8
14732	26	23	2026-07-07 14:00:00+00	8
14733	26	23	2026-07-08 09:00:00+00	8
14734	26	23	2026-07-08 14:00:00+00	8
14735	26	23	2026-07-09 09:00:00+00	8
14736	26	23	2026-07-09 14:00:00+00	8
14737	26	23	2026-07-10 09:00:00+00	8
14738	26	23	2026-07-10 14:00:00+00	8
14739	27	23	2026-06-29 09:00:00+00	8
14740	27	23	2026-06-29 14:00:00+00	8
14741	27	23	2026-06-30 09:00:00+00	8
14742	27	23	2026-06-30 14:00:00+00	8
14743	27	23	2026-07-01 09:00:00+00	8
14744	27	23	2026-07-01 14:00:00+00	8
14745	27	23	2026-07-02 09:00:00+00	8
14746	27	23	2026-07-02 14:00:00+00	8
14747	27	23	2026-07-03 09:00:00+00	8
14748	27	23	2026-07-03 14:00:00+00	8
14749	27	23	2026-07-06 09:00:00+00	8
14750	27	23	2026-07-06 14:00:00+00	8
14751	27	23	2026-07-07 09:00:00+00	8
14752	27	23	2026-07-07 14:00:00+00	8
14753	27	23	2026-07-08 09:00:00+00	8
14754	27	23	2026-07-08 14:00:00+00	8
14755	27	23	2026-07-09 09:00:00+00	8
14756	27	23	2026-07-09 14:00:00+00	8
14757	27	23	2026-07-10 09:00:00+00	8
14758	27	23	2026-07-10 14:00:00+00	8
14759	28	23	2026-06-29 09:00:00+00	8
14760	28	23	2026-06-29 14:00:00+00	8
14761	28	23	2026-06-30 09:00:00+00	8
14762	28	23	2026-06-30 14:00:00+00	8
14763	28	23	2026-07-01 09:00:00+00	8
14764	28	23	2026-07-01 14:00:00+00	8
14765	28	23	2026-07-02 09:00:00+00	8
14766	28	23	2026-07-02 14:00:00+00	8
14767	28	23	2026-07-03 09:00:00+00	8
14768	28	23	2026-07-03 14:00:00+00	8
14769	28	23	2026-07-06 09:00:00+00	8
14770	28	23	2026-07-06 14:00:00+00	8
14771	28	23	2026-07-07 09:00:00+00	8
14772	28	23	2026-07-07 14:00:00+00	8
14773	28	23	2026-07-08 09:00:00+00	8
14774	28	23	2026-07-08 14:00:00+00	8
14775	28	23	2026-07-09 09:00:00+00	8
14776	28	23	2026-07-09 14:00:00+00	8
14777	28	23	2026-07-10 09:00:00+00	8
14778	28	23	2026-07-10 14:00:00+00	8
14779	29	23	2026-06-29 09:00:00+00	8
14780	29	23	2026-06-29 14:00:00+00	8
14781	29	23	2026-06-30 09:00:00+00	8
14782	29	23	2026-06-30 14:00:00+00	8
14783	29	23	2026-07-01 09:00:00+00	8
14784	29	23	2026-07-01 14:00:00+00	8
14785	29	23	2026-07-02 09:00:00+00	8
14786	29	23	2026-07-02 14:00:00+00	8
14787	29	23	2026-07-03 09:00:00+00	8
14788	29	23	2026-07-03 14:00:00+00	8
14789	29	23	2026-07-06 09:00:00+00	8
14790	29	23	2026-07-06 14:00:00+00	8
14791	29	23	2026-07-07 09:00:00+00	8
14792	29	23	2026-07-07 14:00:00+00	8
14793	29	23	2026-07-08 09:00:00+00	8
14794	29	23	2026-07-08 14:00:00+00	8
14795	29	23	2026-07-09 09:00:00+00	8
14796	29	23	2026-07-09 14:00:00+00	8
14797	29	23	2026-07-10 09:00:00+00	8
14798	29	23	2026-07-10 14:00:00+00	8
14799	30	23	2026-06-29 09:00:00+00	8
14800	30	23	2026-06-29 14:00:00+00	8
14801	30	23	2026-06-30 09:00:00+00	8
14802	30	23	2026-06-30 14:00:00+00	8
14803	30	23	2026-07-01 09:00:00+00	8
14804	30	23	2026-07-01 14:00:00+00	8
14805	30	23	2026-07-02 09:00:00+00	8
14806	30	23	2026-07-02 14:00:00+00	8
14807	30	23	2026-07-03 09:00:00+00	8
14808	30	23	2026-07-03 14:00:00+00	8
14809	30	23	2026-07-06 09:00:00+00	8
14810	30	23	2026-07-06 14:00:00+00	8
14811	30	23	2026-07-07 09:00:00+00	8
14812	30	23	2026-07-07 14:00:00+00	8
14813	30	23	2026-07-08 09:00:00+00	8
14814	30	23	2026-07-08 14:00:00+00	8
14815	30	23	2026-07-09 09:00:00+00	8
14816	30	23	2026-07-09 14:00:00+00	8
14817	30	23	2026-07-10 09:00:00+00	8
14818	30	23	2026-07-10 14:00:00+00	8
14819	31	23	2026-06-29 09:00:00+00	8
14820	31	23	2026-06-29 14:00:00+00	8
14821	31	23	2026-06-30 09:00:00+00	8
14822	31	23	2026-06-30 14:00:00+00	8
14823	31	23	2026-07-01 09:00:00+00	8
14824	31	23	2026-07-01 14:00:00+00	8
14825	31	23	2026-07-02 09:00:00+00	8
14826	31	23	2026-07-02 14:00:00+00	8
14827	31	23	2026-07-03 09:00:00+00	8
14828	31	23	2026-07-03 14:00:00+00	8
14829	31	23	2026-07-06 09:00:00+00	8
14830	31	23	2026-07-06 14:00:00+00	8
14831	31	23	2026-07-07 09:00:00+00	8
14832	31	23	2026-07-07 14:00:00+00	8
14833	31	23	2026-07-08 09:00:00+00	8
14834	31	23	2026-07-08 14:00:00+00	8
14835	31	23	2026-07-09 09:00:00+00	8
14836	31	23	2026-07-09 14:00:00+00	8
14837	31	23	2026-07-10 09:00:00+00	8
14838	31	23	2026-07-10 14:00:00+00	8
14839	32	23	2026-06-29 09:00:00+00	8
14840	32	23	2026-06-29 14:00:00+00	8
14841	32	23	2026-06-30 09:00:00+00	8
14842	32	23	2026-06-30 14:00:00+00	8
14843	32	23	2026-07-01 09:00:00+00	8
14844	32	23	2026-07-01 14:00:00+00	8
14845	32	23	2026-07-02 09:00:00+00	8
14846	32	23	2026-07-02 14:00:00+00	8
14847	32	23	2026-07-03 09:00:00+00	8
14848	32	23	2026-07-03 14:00:00+00	8
14849	32	23	2026-07-06 09:00:00+00	8
14850	32	23	2026-07-06 14:00:00+00	8
14851	32	23	2026-07-07 09:00:00+00	8
14852	32	23	2026-07-07 14:00:00+00	8
14853	32	23	2026-07-08 09:00:00+00	8
14854	32	23	2026-07-08 14:00:00+00	8
14855	32	23	2026-07-09 09:00:00+00	8
14856	32	23	2026-07-09 14:00:00+00	8
14857	32	23	2026-07-10 09:00:00+00	8
14858	32	23	2026-07-10 14:00:00+00	8
14859	33	23	2026-06-29 09:00:00+00	8
14860	33	23	2026-06-29 14:00:00+00	8
14861	33	23	2026-06-30 09:00:00+00	8
14862	33	23	2026-06-30 14:00:00+00	8
14863	33	23	2026-07-01 09:00:00+00	8
14864	33	23	2026-07-01 14:00:00+00	8
14865	33	23	2026-07-02 09:00:00+00	8
14866	33	23	2026-07-02 14:00:00+00	8
14867	33	23	2026-07-03 09:00:00+00	8
14868	33	23	2026-07-03 14:00:00+00	8
14869	33	23	2026-07-06 09:00:00+00	8
14870	33	23	2026-07-06 14:00:00+00	8
14871	33	23	2026-07-07 09:00:00+00	8
14872	33	23	2026-07-07 14:00:00+00	8
14873	33	23	2026-07-08 09:00:00+00	8
14874	33	23	2026-07-08 14:00:00+00	8
14875	33	23	2026-07-09 09:00:00+00	8
14876	33	23	2026-07-09 14:00:00+00	8
14877	33	23	2026-07-10 09:00:00+00	8
14878	33	23	2026-07-10 14:00:00+00	8
14879	34	23	2026-06-29 09:00:00+00	8
14880	34	23	2026-06-29 14:00:00+00	8
14881	34	23	2026-06-30 09:00:00+00	8
14882	34	23	2026-06-30 14:00:00+00	8
14883	34	23	2026-07-01 09:00:00+00	8
14884	34	23	2026-07-01 14:00:00+00	8
14885	34	23	2026-07-02 09:00:00+00	8
14886	34	23	2026-07-02 14:00:00+00	8
14887	34	23	2026-07-03 09:00:00+00	8
14888	34	23	2026-07-03 14:00:00+00	8
14889	34	23	2026-07-06 09:00:00+00	8
14890	34	23	2026-07-06 14:00:00+00	8
14891	34	23	2026-07-07 09:00:00+00	8
14892	34	23	2026-07-07 14:00:00+00	8
14893	34	23	2026-07-08 09:00:00+00	8
14894	34	23	2026-07-08 14:00:00+00	8
14895	34	23	2026-07-09 09:00:00+00	8
14896	34	23	2026-07-09 14:00:00+00	8
14897	34	23	2026-07-10 09:00:00+00	8
14898	34	23	2026-07-10 14:00:00+00	8
14899	37	23	2026-06-29 09:00:00+00	8
14900	37	23	2026-06-29 14:00:00+00	8
14901	37	23	2026-06-30 09:00:00+00	8
14902	37	23	2026-06-30 14:00:00+00	8
14903	37	23	2026-07-01 09:00:00+00	8
14904	37	23	2026-07-01 14:00:00+00	8
14905	37	23	2026-07-02 09:00:00+00	8
14906	37	23	2026-07-02 14:00:00+00	8
14907	37	23	2026-07-03 09:00:00+00	8
14908	37	23	2026-07-03 14:00:00+00	8
14909	37	23	2026-07-06 09:00:00+00	8
14910	37	23	2026-07-06 14:00:00+00	8
14911	37	23	2026-07-07 09:00:00+00	8
14912	37	23	2026-07-07 14:00:00+00	8
14913	37	23	2026-07-08 09:00:00+00	8
14914	37	23	2026-07-08 14:00:00+00	8
14915	37	23	2026-07-09 09:00:00+00	8
14916	37	23	2026-07-09 14:00:00+00	8
14917	37	23	2026-07-10 09:00:00+00	8
14918	37	23	2026-07-10 14:00:00+00	8
14919	38	23	2026-06-29 09:00:00+00	8
14920	38	23	2026-06-29 14:00:00+00	8
14921	38	23	2026-06-30 09:00:00+00	8
14922	38	23	2026-06-30 14:00:00+00	8
14923	38	23	2026-07-01 09:00:00+00	8
14924	38	23	2026-07-01 14:00:00+00	8
14925	38	23	2026-07-02 09:00:00+00	8
14926	38	23	2026-07-02 14:00:00+00	8
14927	38	23	2026-07-03 09:00:00+00	8
14928	38	23	2026-07-03 14:00:00+00	8
14929	38	23	2026-07-06 09:00:00+00	8
14930	38	23	2026-07-06 14:00:00+00	8
14931	38	23	2026-07-07 09:00:00+00	8
14932	38	23	2026-07-07 14:00:00+00	8
14933	38	23	2026-07-08 09:00:00+00	8
14934	38	23	2026-07-08 14:00:00+00	8
14935	38	23	2026-07-09 09:00:00+00	8
14936	38	23	2026-07-09 14:00:00+00	8
14937	38	23	2026-07-10 09:00:00+00	8
14938	38	23	2026-07-10 14:00:00+00	8
14939	39	23	2026-06-29 09:00:00+00	8
14940	39	23	2026-06-29 14:00:00+00	8
14941	39	23	2026-06-30 09:00:00+00	8
14942	39	23	2026-06-30 14:00:00+00	8
14943	39	23	2026-07-01 09:00:00+00	8
14944	39	23	2026-07-01 14:00:00+00	8
14945	39	23	2026-07-02 09:00:00+00	8
14946	39	23	2026-07-02 14:00:00+00	8
14947	39	23	2026-07-03 09:00:00+00	8
14948	39	23	2026-07-03 14:00:00+00	8
14949	39	23	2026-07-06 09:00:00+00	8
14950	39	23	2026-07-06 14:00:00+00	8
14951	39	23	2026-07-07 09:00:00+00	8
14952	39	23	2026-07-07 14:00:00+00	8
14953	39	23	2026-07-08 09:00:00+00	8
14954	39	23	2026-07-08 14:00:00+00	8
14955	39	23	2026-07-09 09:00:00+00	8
14956	39	23	2026-07-09 14:00:00+00	8
14957	39	23	2026-07-10 09:00:00+00	8
14958	39	23	2026-07-10 14:00:00+00	8
14959	40	23	2026-06-29 09:00:00+00	8
14960	40	23	2026-06-29 14:00:00+00	8
14961	40	23	2026-06-30 09:00:00+00	8
14962	40	23	2026-06-30 14:00:00+00	8
14963	40	23	2026-07-01 09:00:00+00	8
14964	40	23	2026-07-01 14:00:00+00	8
14965	40	23	2026-07-02 09:00:00+00	8
14966	40	23	2026-07-02 14:00:00+00	8
14967	40	23	2026-07-03 09:00:00+00	8
14968	40	23	2026-07-03 14:00:00+00	8
14969	40	23	2026-07-06 09:00:00+00	8
14970	40	23	2026-07-06 14:00:00+00	8
14971	40	23	2026-07-07 09:00:00+00	8
14972	40	23	2026-07-07 14:00:00+00	8
14973	40	23	2026-07-08 09:00:00+00	8
14974	40	23	2026-07-08 14:00:00+00	8
14975	40	23	2026-07-09 09:00:00+00	8
14976	40	23	2026-07-09 14:00:00+00	8
14977	40	23	2026-07-10 09:00:00+00	8
14978	40	23	2026-07-10 14:00:00+00	8
14979	41	23	2026-06-29 09:00:00+00	8
14980	41	23	2026-06-29 14:00:00+00	8
14981	41	23	2026-06-30 09:00:00+00	8
14982	41	23	2026-06-30 14:00:00+00	8
14983	41	23	2026-07-01 09:00:00+00	8
14984	41	23	2026-07-01 14:00:00+00	8
14985	41	23	2026-07-02 09:00:00+00	8
14986	41	23	2026-07-02 14:00:00+00	8
14987	41	23	2026-07-03 09:00:00+00	8
14988	41	23	2026-07-03 14:00:00+00	8
14989	41	23	2026-07-06 09:00:00+00	8
14990	41	23	2026-07-06 14:00:00+00	8
14991	41	23	2026-07-07 09:00:00+00	8
14992	41	23	2026-07-07 14:00:00+00	8
14993	41	23	2026-07-08 09:00:00+00	8
14994	41	23	2026-07-08 14:00:00+00	8
14995	41	23	2026-07-09 09:00:00+00	8
14996	41	23	2026-07-09 14:00:00+00	8
14997	41	23	2026-07-10 09:00:00+00	8
14998	41	23	2026-07-10 14:00:00+00	8
14999	42	23	2026-06-29 09:00:00+00	8
15000	42	23	2026-06-29 14:00:00+00	8
15001	42	23	2026-06-30 09:00:00+00	8
15002	42	23	2026-06-30 14:00:00+00	8
15003	42	23	2026-07-01 09:00:00+00	8
15004	42	23	2026-07-01 14:00:00+00	8
15005	42	23	2026-07-02 09:00:00+00	8
15006	42	23	2026-07-02 14:00:00+00	8
15007	42	23	2026-07-03 09:00:00+00	8
15008	42	23	2026-07-03 14:00:00+00	8
15009	42	23	2026-07-06 09:00:00+00	8
15010	42	23	2026-07-06 14:00:00+00	8
15011	42	23	2026-07-07 09:00:00+00	8
15012	42	23	2026-07-07 14:00:00+00	8
15013	42	23	2026-07-08 09:00:00+00	8
15014	42	23	2026-07-08 14:00:00+00	8
15015	42	23	2026-07-09 09:00:00+00	8
15016	42	23	2026-07-09 14:00:00+00	8
15017	42	23	2026-07-10 09:00:00+00	8
15018	42	23	2026-07-10 14:00:00+00	8
15019	44	23	2026-06-29 09:00:00+00	8
15020	44	23	2026-06-29 14:00:00+00	8
15021	44	23	2026-06-30 09:00:00+00	8
15022	44	23	2026-06-30 14:00:00+00	8
15023	44	23	2026-07-01 09:00:00+00	8
15024	44	23	2026-07-01 14:00:00+00	8
15025	44	23	2026-07-02 09:00:00+00	8
15026	44	23	2026-07-02 14:00:00+00	8
15027	44	23	2026-07-03 09:00:00+00	8
15028	44	23	2026-07-03 14:00:00+00	8
15029	44	23	2026-07-06 09:00:00+00	8
15030	44	23	2026-07-06 14:00:00+00	8
15031	44	23	2026-07-07 09:00:00+00	8
15032	44	23	2026-07-07 14:00:00+00	8
15033	44	23	2026-07-08 09:00:00+00	8
15034	44	23	2026-07-08 14:00:00+00	8
15035	44	23	2026-07-09 09:00:00+00	8
15036	44	23	2026-07-09 14:00:00+00	8
15037	44	23	2026-07-10 09:00:00+00	8
15038	44	23	2026-07-10 14:00:00+00	8
15039	45	23	2026-06-29 09:00:00+00	8
15040	45	23	2026-06-29 14:00:00+00	8
15041	45	23	2026-06-30 09:00:00+00	8
15042	45	23	2026-06-30 14:00:00+00	8
15043	45	23	2026-07-01 09:00:00+00	8
15044	45	23	2026-07-01 14:00:00+00	8
15045	45	23	2026-07-02 09:00:00+00	8
15046	45	23	2026-07-02 14:00:00+00	8
15047	45	23	2026-07-03 09:00:00+00	8
15048	45	23	2026-07-03 14:00:00+00	8
15049	45	23	2026-07-06 09:00:00+00	8
15050	45	23	2026-07-06 14:00:00+00	8
15051	45	23	2026-07-07 09:00:00+00	8
15052	45	23	2026-07-07 14:00:00+00	8
15053	45	23	2026-07-08 09:00:00+00	8
15054	45	23	2026-07-08 14:00:00+00	8
15055	45	23	2026-07-09 09:00:00+00	8
15056	45	23	2026-07-09 14:00:00+00	8
15057	45	23	2026-07-10 09:00:00+00	8
15058	45	23	2026-07-10 14:00:00+00	8
15059	47	23	2026-06-29 09:00:00+00	8
15060	47	23	2026-06-29 14:00:00+00	8
15061	47	23	2026-06-30 09:00:00+00	8
15062	47	23	2026-06-30 14:00:00+00	8
15063	47	23	2026-07-01 09:00:00+00	8
15064	47	23	2026-07-01 14:00:00+00	8
15065	47	23	2026-07-02 09:00:00+00	8
15066	47	23	2026-07-02 14:00:00+00	8
15067	47	23	2026-07-03 09:00:00+00	8
15068	47	23	2026-07-03 14:00:00+00	8
15069	47	23	2026-07-06 09:00:00+00	8
15070	47	23	2026-07-06 14:00:00+00	8
15071	47	23	2026-07-07 09:00:00+00	8
15072	47	23	2026-07-07 14:00:00+00	8
15073	47	23	2026-07-08 09:00:00+00	8
15074	47	23	2026-07-08 14:00:00+00	8
15075	47	23	2026-07-09 09:00:00+00	8
15076	47	23	2026-07-09 14:00:00+00	8
15077	47	23	2026-07-10 09:00:00+00	8
15078	47	23	2026-07-10 14:00:00+00	8
15079	48	23	2026-06-29 09:00:00+00	8
15080	48	23	2026-06-29 14:00:00+00	8
15081	48	23	2026-06-30 09:00:00+00	8
15082	48	23	2026-06-30 14:00:00+00	8
15083	48	23	2026-07-01 09:00:00+00	8
15084	48	23	2026-07-01 14:00:00+00	8
15085	48	23	2026-07-02 09:00:00+00	8
15086	48	23	2026-07-02 14:00:00+00	8
15087	48	23	2026-07-03 09:00:00+00	8
15088	48	23	2026-07-03 14:00:00+00	8
15089	48	23	2026-07-06 09:00:00+00	8
15090	48	23	2026-07-06 14:00:00+00	8
15091	48	23	2026-07-07 09:00:00+00	8
15092	48	23	2026-07-07 14:00:00+00	8
15093	48	23	2026-07-08 09:00:00+00	8
15094	48	23	2026-07-08 14:00:00+00	8
15095	48	23	2026-07-09 09:00:00+00	8
15096	48	23	2026-07-09 14:00:00+00	8
15097	48	23	2026-07-10 09:00:00+00	8
15098	48	23	2026-07-10 14:00:00+00	8
15099	49	23	2026-06-29 09:00:00+00	8
15100	49	23	2026-06-29 14:00:00+00	8
15101	49	23	2026-06-30 09:00:00+00	8
15102	49	23	2026-06-30 14:00:00+00	8
15103	49	23	2026-07-01 09:00:00+00	8
15104	49	23	2026-07-01 14:00:00+00	8
15105	49	23	2026-07-02 09:00:00+00	8
15106	49	23	2026-07-02 14:00:00+00	8
15107	49	23	2026-07-03 09:00:00+00	8
15108	49	23	2026-07-03 14:00:00+00	8
15109	49	23	2026-07-06 09:00:00+00	8
15110	49	23	2026-07-06 14:00:00+00	8
15111	49	23	2026-07-07 09:00:00+00	8
15112	49	23	2026-07-07 14:00:00+00	8
15113	49	23	2026-07-08 09:00:00+00	8
15114	49	23	2026-07-08 14:00:00+00	8
15115	49	23	2026-07-09 09:00:00+00	8
15116	49	23	2026-07-09 14:00:00+00	8
15117	49	23	2026-07-10 09:00:00+00	8
15118	49	23	2026-07-10 14:00:00+00	8
15119	51	23	2026-06-29 09:00:00+00	8
15120	51	23	2026-06-29 14:00:00+00	8
15121	51	23	2026-06-30 09:00:00+00	8
15122	51	23	2026-06-30 14:00:00+00	8
15123	51	23	2026-07-01 09:00:00+00	8
15124	51	23	2026-07-01 14:00:00+00	8
15125	51	23	2026-07-02 09:00:00+00	8
15126	51	23	2026-07-02 14:00:00+00	8
15127	51	23	2026-07-03 09:00:00+00	8
15128	51	23	2026-07-03 14:00:00+00	8
15129	51	23	2026-07-06 09:00:00+00	8
15130	51	23	2026-07-06 14:00:00+00	8
15131	51	23	2026-07-07 09:00:00+00	8
15132	51	23	2026-07-07 14:00:00+00	8
15133	51	23	2026-07-08 09:00:00+00	8
15134	51	23	2026-07-08 14:00:00+00	8
15135	51	23	2026-07-09 09:00:00+00	8
15136	51	23	2026-07-09 14:00:00+00	8
15137	51	23	2026-07-10 09:00:00+00	8
15138	51	23	2026-07-10 14:00:00+00	8
15139	52	23	2026-06-29 09:00:00+00	8
15140	52	23	2026-06-29 14:00:00+00	8
15141	52	23	2026-06-30 09:00:00+00	8
15142	52	23	2026-06-30 14:00:00+00	8
15143	52	23	2026-07-01 09:00:00+00	8
15144	52	23	2026-07-01 14:00:00+00	8
15145	52	23	2026-07-02 09:00:00+00	8
15146	52	23	2026-07-02 14:00:00+00	8
15147	52	23	2026-07-03 09:00:00+00	8
15148	52	23	2026-07-03 14:00:00+00	8
15149	52	23	2026-07-06 09:00:00+00	8
15150	52	23	2026-07-06 14:00:00+00	8
15151	52	23	2026-07-07 09:00:00+00	8
15152	52	23	2026-07-07 14:00:00+00	8
15153	52	23	2026-07-08 09:00:00+00	8
15154	52	23	2026-07-08 14:00:00+00	8
15155	52	23	2026-07-09 09:00:00+00	8
15156	52	23	2026-07-09 14:00:00+00	8
15157	52	23	2026-07-10 09:00:00+00	8
15158	52	23	2026-07-10 14:00:00+00	8
15159	53	23	2026-06-29 09:00:00+00	8
15160	53	23	2026-06-29 14:00:00+00	8
15161	53	23	2026-06-30 09:00:00+00	8
15162	53	23	2026-06-30 14:00:00+00	8
15163	53	23	2026-07-01 09:00:00+00	8
15164	53	23	2026-07-01 14:00:00+00	8
15165	53	23	2026-07-02 09:00:00+00	8
15166	53	23	2026-07-02 14:00:00+00	8
15167	53	23	2026-07-03 09:00:00+00	8
15168	53	23	2026-07-03 14:00:00+00	8
15169	53	23	2026-07-06 09:00:00+00	8
15170	53	23	2026-07-06 14:00:00+00	8
15171	53	23	2026-07-07 09:00:00+00	8
15172	53	23	2026-07-07 14:00:00+00	8
15173	53	23	2026-07-08 09:00:00+00	8
15174	53	23	2026-07-08 14:00:00+00	8
15175	53	23	2026-07-09 09:00:00+00	8
15176	53	23	2026-07-09 14:00:00+00	8
15177	53	23	2026-07-10 09:00:00+00	8
15178	53	23	2026-07-10 14:00:00+00	8
15179	54	23	2026-06-29 09:00:00+00	8
15180	54	23	2026-06-29 14:00:00+00	8
15181	54	23	2026-06-30 09:00:00+00	8
15182	54	23	2026-06-30 14:00:00+00	8
15183	54	23	2026-07-01 09:00:00+00	8
15184	54	23	2026-07-01 14:00:00+00	8
15185	54	23	2026-07-02 09:00:00+00	8
15186	54	23	2026-07-02 14:00:00+00	8
15187	54	23	2026-07-03 09:00:00+00	8
15188	54	23	2026-07-03 14:00:00+00	8
15189	54	23	2026-07-06 09:00:00+00	8
15190	54	23	2026-07-06 14:00:00+00	8
15191	54	23	2026-07-07 09:00:00+00	8
15192	54	23	2026-07-07 14:00:00+00	8
15193	54	23	2026-07-08 09:00:00+00	8
15194	54	23	2026-07-08 14:00:00+00	8
15195	54	23	2026-07-09 09:00:00+00	8
15196	54	23	2026-07-09 14:00:00+00	8
15197	54	23	2026-07-10 09:00:00+00	8
15198	54	23	2026-07-10 14:00:00+00	8
15199	55	23	2026-06-29 09:00:00+00	8
15200	55	23	2026-06-29 14:00:00+00	8
15201	55	23	2026-06-30 09:00:00+00	8
15202	55	23	2026-06-30 14:00:00+00	8
15203	55	23	2026-07-01 09:00:00+00	8
15204	55	23	2026-07-01 14:00:00+00	8
15205	55	23	2026-07-02 09:00:00+00	8
15206	55	23	2026-07-02 14:00:00+00	8
15207	55	23	2026-07-03 09:00:00+00	8
15208	55	23	2026-07-03 14:00:00+00	8
15209	55	23	2026-07-06 09:00:00+00	8
15210	55	23	2026-07-06 14:00:00+00	8
15211	55	23	2026-07-07 09:00:00+00	8
15212	55	23	2026-07-07 14:00:00+00	8
15213	55	23	2026-07-08 09:00:00+00	8
15214	55	23	2026-07-08 14:00:00+00	8
15215	55	23	2026-07-09 09:00:00+00	8
15216	55	23	2026-07-09 14:00:00+00	8
15217	55	23	2026-07-10 09:00:00+00	8
15218	55	23	2026-07-10 14:00:00+00	8
15219	56	23	2026-06-29 09:00:00+00	8
15220	56	23	2026-06-29 14:00:00+00	8
15221	56	23	2026-06-30 09:00:00+00	8
15222	56	23	2026-06-30 14:00:00+00	8
15223	56	23	2026-07-01 09:00:00+00	8
15224	56	23	2026-07-01 14:00:00+00	8
15225	56	23	2026-07-02 09:00:00+00	8
15226	56	23	2026-07-02 14:00:00+00	8
15227	56	23	2026-07-03 09:00:00+00	8
15228	56	23	2026-07-03 14:00:00+00	8
15229	56	23	2026-07-06 09:00:00+00	8
15230	56	23	2026-07-06 14:00:00+00	8
15231	56	23	2026-07-07 09:00:00+00	8
15232	56	23	2026-07-07 14:00:00+00	8
15233	56	23	2026-07-08 09:00:00+00	8
15234	56	23	2026-07-08 14:00:00+00	8
15235	56	23	2026-07-09 09:00:00+00	8
15236	56	23	2026-07-09 14:00:00+00	8
15237	56	23	2026-07-10 09:00:00+00	8
15238	56	23	2026-07-10 14:00:00+00	8
15239	57	23	2026-06-29 09:00:00+00	8
15240	57	23	2026-06-29 14:00:00+00	8
15241	57	23	2026-06-30 09:00:00+00	8
15242	57	23	2026-06-30 14:00:00+00	8
15243	57	23	2026-07-01 09:00:00+00	8
15244	57	23	2026-07-01 14:00:00+00	8
15245	57	23	2026-07-02 09:00:00+00	8
15246	57	23	2026-07-02 14:00:00+00	8
15247	57	23	2026-07-03 09:00:00+00	8
15248	57	23	2026-07-03 14:00:00+00	8
15249	57	23	2026-07-06 09:00:00+00	8
15250	57	23	2026-07-06 14:00:00+00	8
15251	57	23	2026-07-07 09:00:00+00	8
15252	57	23	2026-07-07 14:00:00+00	8
15253	57	23	2026-07-08 09:00:00+00	8
15254	57	23	2026-07-08 14:00:00+00	8
15255	57	23	2026-07-09 09:00:00+00	8
15256	57	23	2026-07-09 14:00:00+00	8
15257	57	23	2026-07-10 09:00:00+00	8
15258	57	23	2026-07-10 14:00:00+00	8
15259	3	24	2026-06-29 09:00:00+00	8
15260	3	24	2026-06-29 14:00:00+00	8
15261	3	24	2026-06-30 09:00:00+00	8
15262	3	24	2026-06-30 14:00:00+00	8
15263	3	24	2026-07-01 09:00:00+00	8
15264	3	24	2026-07-01 14:00:00+00	8
15265	3	24	2026-07-02 09:00:00+00	8
15266	3	24	2026-07-02 14:00:00+00	8
15267	3	24	2026-07-03 09:00:00+00	8
15268	3	24	2026-07-03 14:00:00+00	8
15269	3	24	2026-07-06 09:00:00+00	8
15270	3	24	2026-07-06 14:00:00+00	8
15271	3	24	2026-07-07 09:00:00+00	8
15272	3	24	2026-07-07 14:00:00+00	8
15273	3	24	2026-07-08 09:00:00+00	8
15274	3	24	2026-07-08 14:00:00+00	8
15275	3	24	2026-07-09 09:00:00+00	8
15276	3	24	2026-07-09 14:00:00+00	8
15277	3	24	2026-07-10 09:00:00+00	8
15278	3	24	2026-07-10 14:00:00+00	8
15279	4	24	2026-06-29 09:00:00+00	8
15280	4	24	2026-06-29 14:00:00+00	8
15281	4	24	2026-06-30 09:00:00+00	8
15282	4	24	2026-06-30 14:00:00+00	8
15283	4	24	2026-07-01 09:00:00+00	8
15284	4	24	2026-07-01 14:00:00+00	8
15285	4	24	2026-07-02 09:00:00+00	8
15286	4	24	2026-07-02 14:00:00+00	8
15287	4	24	2026-07-03 09:00:00+00	8
15288	4	24	2026-07-03 14:00:00+00	8
15289	4	24	2026-07-06 09:00:00+00	8
15290	4	24	2026-07-06 14:00:00+00	8
15291	4	24	2026-07-07 09:00:00+00	8
15292	4	24	2026-07-07 14:00:00+00	8
15293	4	24	2026-07-08 09:00:00+00	8
15294	4	24	2026-07-08 14:00:00+00	8
15295	4	24	2026-07-09 09:00:00+00	8
15296	4	24	2026-07-09 14:00:00+00	8
15297	4	24	2026-07-10 09:00:00+00	8
15298	4	24	2026-07-10 14:00:00+00	8
15299	6	24	2026-06-29 09:00:00+00	8
15300	6	24	2026-06-29 14:00:00+00	8
15301	6	24	2026-06-30 09:00:00+00	8
15302	6	24	2026-06-30 14:00:00+00	8
15303	6	24	2026-07-01 09:00:00+00	8
15304	6	24	2026-07-01 14:00:00+00	8
15305	6	24	2026-07-02 09:00:00+00	8
15306	6	24	2026-07-02 14:00:00+00	8
15307	6	24	2026-07-03 09:00:00+00	8
15308	6	24	2026-07-03 14:00:00+00	8
15309	6	24	2026-07-06 09:00:00+00	8
15310	6	24	2026-07-06 14:00:00+00	8
15311	6	24	2026-07-07 09:00:00+00	8
15312	6	24	2026-07-07 14:00:00+00	8
15313	6	24	2026-07-08 09:00:00+00	8
15314	6	24	2026-07-08 14:00:00+00	8
15315	6	24	2026-07-09 09:00:00+00	8
15316	6	24	2026-07-09 14:00:00+00	8
15317	6	24	2026-07-10 09:00:00+00	8
15318	6	24	2026-07-10 14:00:00+00	8
15319	8	24	2026-06-29 09:00:00+00	8
15320	8	24	2026-06-29 14:00:00+00	8
15321	8	24	2026-06-30 09:00:00+00	8
15322	8	24	2026-06-30 14:00:00+00	8
15323	8	24	2026-07-01 09:00:00+00	8
15324	8	24	2026-07-01 14:00:00+00	8
15325	8	24	2026-07-02 09:00:00+00	8
15326	8	24	2026-07-02 14:00:00+00	8
15327	8	24	2026-07-03 09:00:00+00	8
15328	8	24	2026-07-03 14:00:00+00	8
15329	8	24	2026-07-06 09:00:00+00	8
15330	8	24	2026-07-06 14:00:00+00	8
15331	8	24	2026-07-07 09:00:00+00	8
15332	8	24	2026-07-07 14:00:00+00	8
15333	8	24	2026-07-08 09:00:00+00	8
15334	8	24	2026-07-08 14:00:00+00	8
15335	8	24	2026-07-09 09:00:00+00	8
15336	8	24	2026-07-09 14:00:00+00	8
15337	8	24	2026-07-10 09:00:00+00	8
15338	8	24	2026-07-10 14:00:00+00	8
15339	10	24	2026-06-29 09:00:00+00	8
15340	10	24	2026-06-29 14:00:00+00	8
15341	10	24	2026-06-30 09:00:00+00	8
15342	10	24	2026-06-30 14:00:00+00	8
15343	10	24	2026-07-01 09:00:00+00	8
15344	10	24	2026-07-01 14:00:00+00	8
15345	10	24	2026-07-02 09:00:00+00	8
15346	10	24	2026-07-02 14:00:00+00	8
15347	10	24	2026-07-03 09:00:00+00	8
15348	10	24	2026-07-03 14:00:00+00	8
15349	10	24	2026-07-06 09:00:00+00	8
15350	10	24	2026-07-06 14:00:00+00	8
15351	10	24	2026-07-07 09:00:00+00	8
15352	10	24	2026-07-07 14:00:00+00	8
15353	10	24	2026-07-08 09:00:00+00	8
15354	10	24	2026-07-08 14:00:00+00	8
15355	10	24	2026-07-09 09:00:00+00	8
15356	10	24	2026-07-09 14:00:00+00	8
15357	10	24	2026-07-10 09:00:00+00	8
15358	10	24	2026-07-10 14:00:00+00	8
15359	11	24	2026-06-29 09:00:00+00	8
15360	11	24	2026-06-29 14:00:00+00	8
15361	11	24	2026-06-30 09:00:00+00	8
15362	11	24	2026-06-30 14:00:00+00	8
15363	11	24	2026-07-01 09:00:00+00	8
15364	11	24	2026-07-01 14:00:00+00	8
15365	11	24	2026-07-02 09:00:00+00	8
15366	11	24	2026-07-02 14:00:00+00	8
15367	11	24	2026-07-03 09:00:00+00	8
15368	11	24	2026-07-03 14:00:00+00	8
15369	11	24	2026-07-06 09:00:00+00	8
15370	11	24	2026-07-06 14:00:00+00	8
15371	11	24	2026-07-07 09:00:00+00	8
15372	11	24	2026-07-07 14:00:00+00	8
15373	11	24	2026-07-08 09:00:00+00	8
15374	11	24	2026-07-08 14:00:00+00	8
15375	11	24	2026-07-09 09:00:00+00	8
15376	11	24	2026-07-09 14:00:00+00	8
15377	11	24	2026-07-10 09:00:00+00	8
15378	11	24	2026-07-10 14:00:00+00	8
15379	12	24	2026-06-29 09:00:00+00	8
15380	12	24	2026-06-29 14:00:00+00	8
15381	12	24	2026-06-30 09:00:00+00	8
15382	12	24	2026-06-30 14:00:00+00	8
15383	12	24	2026-07-01 09:00:00+00	8
15384	12	24	2026-07-01 14:00:00+00	8
15385	12	24	2026-07-02 09:00:00+00	8
15386	12	24	2026-07-02 14:00:00+00	8
15387	12	24	2026-07-03 09:00:00+00	8
15388	12	24	2026-07-03 14:00:00+00	8
15389	12	24	2026-07-06 09:00:00+00	8
15390	12	24	2026-07-06 14:00:00+00	8
15391	12	24	2026-07-07 09:00:00+00	8
15392	12	24	2026-07-07 14:00:00+00	8
15393	12	24	2026-07-08 09:00:00+00	8
15394	12	24	2026-07-08 14:00:00+00	8
15395	12	24	2026-07-09 09:00:00+00	8
15396	12	24	2026-07-09 14:00:00+00	8
15397	12	24	2026-07-10 09:00:00+00	8
15398	12	24	2026-07-10 14:00:00+00	8
15399	13	24	2026-06-29 09:00:00+00	8
15400	13	24	2026-06-29 14:00:00+00	8
15401	13	24	2026-06-30 09:00:00+00	8
15402	13	24	2026-06-30 14:00:00+00	8
15403	13	24	2026-07-01 09:00:00+00	8
15404	13	24	2026-07-01 14:00:00+00	8
15405	13	24	2026-07-02 09:00:00+00	8
15406	13	24	2026-07-02 14:00:00+00	8
15407	13	24	2026-07-03 09:00:00+00	8
15408	13	24	2026-07-03 14:00:00+00	8
15409	13	24	2026-07-06 09:00:00+00	8
15410	13	24	2026-07-06 14:00:00+00	8
15411	13	24	2026-07-07 09:00:00+00	8
15412	13	24	2026-07-07 14:00:00+00	8
15413	13	24	2026-07-08 09:00:00+00	8
15414	13	24	2026-07-08 14:00:00+00	8
15415	13	24	2026-07-09 09:00:00+00	8
15416	13	24	2026-07-09 14:00:00+00	8
15417	13	24	2026-07-10 09:00:00+00	8
15418	13	24	2026-07-10 14:00:00+00	8
15419	15	24	2026-06-29 09:00:00+00	8
15420	15	24	2026-06-29 14:00:00+00	8
15421	15	24	2026-06-30 09:00:00+00	8
15422	15	24	2026-06-30 14:00:00+00	8
15423	15	24	2026-07-01 09:00:00+00	8
15424	15	24	2026-07-01 14:00:00+00	8
15425	15	24	2026-07-02 09:00:00+00	8
15426	15	24	2026-07-02 14:00:00+00	8
15427	15	24	2026-07-03 09:00:00+00	8
15428	15	24	2026-07-03 14:00:00+00	8
15429	15	24	2026-07-06 09:00:00+00	8
15430	15	24	2026-07-06 14:00:00+00	8
15431	15	24	2026-07-07 09:00:00+00	8
15432	15	24	2026-07-07 14:00:00+00	8
15433	15	24	2026-07-08 09:00:00+00	8
15434	15	24	2026-07-08 14:00:00+00	8
15435	15	24	2026-07-09 09:00:00+00	8
15436	15	24	2026-07-09 14:00:00+00	8
15437	15	24	2026-07-10 09:00:00+00	8
15438	15	24	2026-07-10 14:00:00+00	8
15439	16	24	2026-06-29 09:00:00+00	8
15440	16	24	2026-06-29 14:00:00+00	8
15441	16	24	2026-06-30 09:00:00+00	8
15442	16	24	2026-06-30 14:00:00+00	8
15443	16	24	2026-07-01 09:00:00+00	8
15444	16	24	2026-07-01 14:00:00+00	8
15445	16	24	2026-07-02 09:00:00+00	8
15446	16	24	2026-07-02 14:00:00+00	8
15447	16	24	2026-07-03 09:00:00+00	8
15448	16	24	2026-07-03 14:00:00+00	8
15449	16	24	2026-07-06 09:00:00+00	8
15450	16	24	2026-07-06 14:00:00+00	8
15451	16	24	2026-07-07 09:00:00+00	8
15452	16	24	2026-07-07 14:00:00+00	8
15453	16	24	2026-07-08 09:00:00+00	8
15454	16	24	2026-07-08 14:00:00+00	8
15455	16	24	2026-07-09 09:00:00+00	8
15456	16	24	2026-07-09 14:00:00+00	8
15457	16	24	2026-07-10 09:00:00+00	8
15458	16	24	2026-07-10 14:00:00+00	8
15459	17	24	2026-06-29 09:00:00+00	8
15460	17	24	2026-06-29 14:00:00+00	8
15461	17	24	2026-06-30 09:00:00+00	8
15462	17	24	2026-06-30 14:00:00+00	8
15463	17	24	2026-07-01 09:00:00+00	8
15464	17	24	2026-07-01 14:00:00+00	8
15465	17	24	2026-07-02 09:00:00+00	8
15466	17	24	2026-07-02 14:00:00+00	8
15467	17	24	2026-07-03 09:00:00+00	8
15468	17	24	2026-07-03 14:00:00+00	8
15469	17	24	2026-07-06 09:00:00+00	8
15470	17	24	2026-07-06 14:00:00+00	8
15471	17	24	2026-07-07 09:00:00+00	8
15472	17	24	2026-07-07 14:00:00+00	8
15473	17	24	2026-07-08 09:00:00+00	8
15474	17	24	2026-07-08 14:00:00+00	8
15475	17	24	2026-07-09 09:00:00+00	8
15476	17	24	2026-07-09 14:00:00+00	8
15477	17	24	2026-07-10 09:00:00+00	8
15478	17	24	2026-07-10 14:00:00+00	8
15479	18	24	2026-06-29 09:00:00+00	8
15480	18	24	2026-06-29 14:00:00+00	8
15481	18	24	2026-06-30 09:00:00+00	8
15482	18	24	2026-06-30 14:00:00+00	8
15483	18	24	2026-07-01 09:00:00+00	8
15484	18	24	2026-07-01 14:00:00+00	8
15485	18	24	2026-07-02 09:00:00+00	8
15486	18	24	2026-07-02 14:00:00+00	8
15487	18	24	2026-07-03 09:00:00+00	8
15488	18	24	2026-07-03 14:00:00+00	8
15489	18	24	2026-07-06 09:00:00+00	8
15490	18	24	2026-07-06 14:00:00+00	8
15491	18	24	2026-07-07 09:00:00+00	8
15492	18	24	2026-07-07 14:00:00+00	8
15493	18	24	2026-07-08 09:00:00+00	8
15494	18	24	2026-07-08 14:00:00+00	8
15495	18	24	2026-07-09 09:00:00+00	8
15496	18	24	2026-07-09 14:00:00+00	8
15497	18	24	2026-07-10 09:00:00+00	8
15498	18	24	2026-07-10 14:00:00+00	8
15499	19	24	2026-06-29 09:00:00+00	8
15500	19	24	2026-06-29 14:00:00+00	8
15501	19	24	2026-06-30 09:00:00+00	8
15502	19	24	2026-06-30 14:00:00+00	8
15503	19	24	2026-07-01 09:00:00+00	8
15504	19	24	2026-07-01 14:00:00+00	8
15505	19	24	2026-07-02 09:00:00+00	8
15506	19	24	2026-07-02 14:00:00+00	8
15507	19	24	2026-07-03 09:00:00+00	8
15508	19	24	2026-07-03 14:00:00+00	8
15509	19	24	2026-07-06 09:00:00+00	8
15510	19	24	2026-07-06 14:00:00+00	8
15511	19	24	2026-07-07 09:00:00+00	8
15512	19	24	2026-07-07 14:00:00+00	8
15513	19	24	2026-07-08 09:00:00+00	8
15514	19	24	2026-07-08 14:00:00+00	8
15515	19	24	2026-07-09 09:00:00+00	8
15516	19	24	2026-07-09 14:00:00+00	8
15517	19	24	2026-07-10 09:00:00+00	8
15518	19	24	2026-07-10 14:00:00+00	8
15519	20	24	2026-06-29 09:00:00+00	8
15520	20	24	2026-06-29 14:00:00+00	8
15521	20	24	2026-06-30 09:00:00+00	8
15522	20	24	2026-06-30 14:00:00+00	8
15523	20	24	2026-07-01 09:00:00+00	8
15524	20	24	2026-07-01 14:00:00+00	8
15525	20	24	2026-07-02 09:00:00+00	8
15526	20	24	2026-07-02 14:00:00+00	8
15527	20	24	2026-07-03 09:00:00+00	8
15528	20	24	2026-07-03 14:00:00+00	8
15529	20	24	2026-07-06 09:00:00+00	8
15530	20	24	2026-07-06 14:00:00+00	8
15531	20	24	2026-07-07 09:00:00+00	8
15532	20	24	2026-07-07 14:00:00+00	8
15533	20	24	2026-07-08 09:00:00+00	8
15534	20	24	2026-07-08 14:00:00+00	8
15535	20	24	2026-07-09 09:00:00+00	8
15536	20	24	2026-07-09 14:00:00+00	8
15537	20	24	2026-07-10 09:00:00+00	8
15538	20	24	2026-07-10 14:00:00+00	8
15539	22	24	2026-06-29 09:00:00+00	8
15540	22	24	2026-06-29 14:00:00+00	8
15541	22	24	2026-06-30 09:00:00+00	8
15542	22	24	2026-06-30 14:00:00+00	8
15543	22	24	2026-07-01 09:00:00+00	8
15544	22	24	2026-07-01 14:00:00+00	8
15545	22	24	2026-07-02 09:00:00+00	8
15546	22	24	2026-07-02 14:00:00+00	8
15547	22	24	2026-07-03 09:00:00+00	8
15548	22	24	2026-07-03 14:00:00+00	8
15549	22	24	2026-07-06 09:00:00+00	8
15550	22	24	2026-07-06 14:00:00+00	8
15551	22	24	2026-07-07 09:00:00+00	8
15552	22	24	2026-07-07 14:00:00+00	8
15553	22	24	2026-07-08 09:00:00+00	8
15554	22	24	2026-07-08 14:00:00+00	8
15555	22	24	2026-07-09 09:00:00+00	8
15556	22	24	2026-07-09 14:00:00+00	8
15557	22	24	2026-07-10 09:00:00+00	8
15558	22	24	2026-07-10 14:00:00+00	8
15559	23	24	2026-06-29 09:00:00+00	8
15560	23	24	2026-06-29 14:00:00+00	8
15561	23	24	2026-06-30 09:00:00+00	8
15562	23	24	2026-06-30 14:00:00+00	8
15563	23	24	2026-07-01 09:00:00+00	8
15564	23	24	2026-07-01 14:00:00+00	8
15565	23	24	2026-07-02 09:00:00+00	8
15566	23	24	2026-07-02 14:00:00+00	8
15567	23	24	2026-07-03 09:00:00+00	8
15568	23	24	2026-07-03 14:00:00+00	8
15569	23	24	2026-07-06 09:00:00+00	8
15570	23	24	2026-07-06 14:00:00+00	8
15571	23	24	2026-07-07 09:00:00+00	8
15572	23	24	2026-07-07 14:00:00+00	8
15573	23	24	2026-07-08 09:00:00+00	8
15574	23	24	2026-07-08 14:00:00+00	8
15575	23	24	2026-07-09 09:00:00+00	8
15576	23	24	2026-07-09 14:00:00+00	8
15577	23	24	2026-07-10 09:00:00+00	8
15578	23	24	2026-07-10 14:00:00+00	8
15579	25	24	2026-06-29 09:00:00+00	8
15580	25	24	2026-06-29 14:00:00+00	8
15581	25	24	2026-06-30 09:00:00+00	8
15582	25	24	2026-06-30 14:00:00+00	8
15583	25	24	2026-07-01 09:00:00+00	8
15584	25	24	2026-07-01 14:00:00+00	8
15585	25	24	2026-07-02 09:00:00+00	8
15586	25	24	2026-07-02 14:00:00+00	8
15587	25	24	2026-07-03 09:00:00+00	8
15588	25	24	2026-07-03 14:00:00+00	8
15589	25	24	2026-07-06 09:00:00+00	8
15590	25	24	2026-07-06 14:00:00+00	8
15591	25	24	2026-07-07 09:00:00+00	8
15592	25	24	2026-07-07 14:00:00+00	8
15593	25	24	2026-07-08 09:00:00+00	8
15594	25	24	2026-07-08 14:00:00+00	8
15595	25	24	2026-07-09 09:00:00+00	8
15596	25	24	2026-07-09 14:00:00+00	8
15597	25	24	2026-07-10 09:00:00+00	8
15598	25	24	2026-07-10 14:00:00+00	8
15599	26	24	2026-06-29 09:00:00+00	8
15600	26	24	2026-06-29 14:00:00+00	8
15601	26	24	2026-06-30 09:00:00+00	8
15602	26	24	2026-06-30 14:00:00+00	8
15603	26	24	2026-07-01 09:00:00+00	8
15604	26	24	2026-07-01 14:00:00+00	8
15605	26	24	2026-07-02 09:00:00+00	8
15606	26	24	2026-07-02 14:00:00+00	8
15607	26	24	2026-07-03 09:00:00+00	8
15608	26	24	2026-07-03 14:00:00+00	8
15609	26	24	2026-07-06 09:00:00+00	8
15610	26	24	2026-07-06 14:00:00+00	8
15611	26	24	2026-07-07 09:00:00+00	8
15612	26	24	2026-07-07 14:00:00+00	8
15613	26	24	2026-07-08 09:00:00+00	8
15614	26	24	2026-07-08 14:00:00+00	8
15615	26	24	2026-07-09 09:00:00+00	8
15616	26	24	2026-07-09 14:00:00+00	8
15617	26	24	2026-07-10 09:00:00+00	8
15618	26	24	2026-07-10 14:00:00+00	8
15619	27	24	2026-06-29 09:00:00+00	8
15620	27	24	2026-06-29 14:00:00+00	8
15621	27	24	2026-06-30 09:00:00+00	8
15622	27	24	2026-06-30 14:00:00+00	8
15623	27	24	2026-07-01 09:00:00+00	8
15624	27	24	2026-07-01 14:00:00+00	8
15625	27	24	2026-07-02 09:00:00+00	8
15626	27	24	2026-07-02 14:00:00+00	8
15627	27	24	2026-07-03 09:00:00+00	8
15628	27	24	2026-07-03 14:00:00+00	8
15629	27	24	2026-07-06 09:00:00+00	8
15630	27	24	2026-07-06 14:00:00+00	8
15631	27	24	2026-07-07 09:00:00+00	8
15632	27	24	2026-07-07 14:00:00+00	8
15633	27	24	2026-07-08 09:00:00+00	8
15634	27	24	2026-07-08 14:00:00+00	8
15635	27	24	2026-07-09 09:00:00+00	8
15636	27	24	2026-07-09 14:00:00+00	8
15637	27	24	2026-07-10 09:00:00+00	8
15638	27	24	2026-07-10 14:00:00+00	8
15639	28	24	2026-06-29 09:00:00+00	8
15640	28	24	2026-06-29 14:00:00+00	8
15641	28	24	2026-06-30 09:00:00+00	8
15642	28	24	2026-06-30 14:00:00+00	8
15643	28	24	2026-07-01 09:00:00+00	8
15644	28	24	2026-07-01 14:00:00+00	8
15645	28	24	2026-07-02 09:00:00+00	8
15646	28	24	2026-07-02 14:00:00+00	8
15647	28	24	2026-07-03 09:00:00+00	8
15648	28	24	2026-07-03 14:00:00+00	8
15649	28	24	2026-07-06 09:00:00+00	8
15650	28	24	2026-07-06 14:00:00+00	8
15651	28	24	2026-07-07 09:00:00+00	8
15652	28	24	2026-07-07 14:00:00+00	8
15653	28	24	2026-07-08 09:00:00+00	8
15654	28	24	2026-07-08 14:00:00+00	8
15655	28	24	2026-07-09 09:00:00+00	8
15656	28	24	2026-07-09 14:00:00+00	8
15657	28	24	2026-07-10 09:00:00+00	8
15658	28	24	2026-07-10 14:00:00+00	8
15659	29	24	2026-06-29 09:00:00+00	8
15660	29	24	2026-06-29 14:00:00+00	8
15661	29	24	2026-06-30 09:00:00+00	8
15662	29	24	2026-06-30 14:00:00+00	8
15663	29	24	2026-07-01 09:00:00+00	8
15664	29	24	2026-07-01 14:00:00+00	8
15665	29	24	2026-07-02 09:00:00+00	8
15666	29	24	2026-07-02 14:00:00+00	8
15667	29	24	2026-07-03 09:00:00+00	8
15668	29	24	2026-07-03 14:00:00+00	8
15669	29	24	2026-07-06 09:00:00+00	8
15670	29	24	2026-07-06 14:00:00+00	8
15671	29	24	2026-07-07 09:00:00+00	8
15672	29	24	2026-07-07 14:00:00+00	8
15673	29	24	2026-07-08 09:00:00+00	8
15674	29	24	2026-07-08 14:00:00+00	8
15675	29	24	2026-07-09 09:00:00+00	8
15676	29	24	2026-07-09 14:00:00+00	8
15677	29	24	2026-07-10 09:00:00+00	8
15678	29	24	2026-07-10 14:00:00+00	8
15679	30	24	2026-06-29 09:00:00+00	8
15680	30	24	2026-06-29 14:00:00+00	8
15681	30	24	2026-06-30 09:00:00+00	8
15682	30	24	2026-06-30 14:00:00+00	8
15683	30	24	2026-07-01 09:00:00+00	8
15684	30	24	2026-07-01 14:00:00+00	8
15685	30	24	2026-07-02 09:00:00+00	8
15686	30	24	2026-07-02 14:00:00+00	8
15687	30	24	2026-07-03 09:00:00+00	8
15688	30	24	2026-07-03 14:00:00+00	8
15689	30	24	2026-07-06 09:00:00+00	8
15690	30	24	2026-07-06 14:00:00+00	8
15691	30	24	2026-07-07 09:00:00+00	8
15692	30	24	2026-07-07 14:00:00+00	8
15693	30	24	2026-07-08 09:00:00+00	8
15694	30	24	2026-07-08 14:00:00+00	8
15695	30	24	2026-07-09 09:00:00+00	8
15696	30	24	2026-07-09 14:00:00+00	8
15697	30	24	2026-07-10 09:00:00+00	8
15698	30	24	2026-07-10 14:00:00+00	8
15699	31	24	2026-06-29 09:00:00+00	8
15700	31	24	2026-06-29 14:00:00+00	8
15701	31	24	2026-06-30 09:00:00+00	8
15702	31	24	2026-06-30 14:00:00+00	8
15703	31	24	2026-07-01 09:00:00+00	8
15704	31	24	2026-07-01 14:00:00+00	8
15705	31	24	2026-07-02 09:00:00+00	8
15706	31	24	2026-07-02 14:00:00+00	8
15707	31	24	2026-07-03 09:00:00+00	8
15708	31	24	2026-07-03 14:00:00+00	8
15709	31	24	2026-07-06 09:00:00+00	8
15710	31	24	2026-07-06 14:00:00+00	8
15711	31	24	2026-07-07 09:00:00+00	8
15712	31	24	2026-07-07 14:00:00+00	8
15713	31	24	2026-07-08 09:00:00+00	8
15714	31	24	2026-07-08 14:00:00+00	8
15715	31	24	2026-07-09 09:00:00+00	8
15716	31	24	2026-07-09 14:00:00+00	8
15717	31	24	2026-07-10 09:00:00+00	8
15718	31	24	2026-07-10 14:00:00+00	8
15719	32	24	2026-06-29 09:00:00+00	8
15720	32	24	2026-06-29 14:00:00+00	8
15721	32	24	2026-06-30 09:00:00+00	8
15722	32	24	2026-06-30 14:00:00+00	8
15723	32	24	2026-07-01 09:00:00+00	8
15724	32	24	2026-07-01 14:00:00+00	8
15725	32	24	2026-07-02 09:00:00+00	8
15726	32	24	2026-07-02 14:00:00+00	8
15727	32	24	2026-07-03 09:00:00+00	8
15728	32	24	2026-07-03 14:00:00+00	8
15729	32	24	2026-07-06 09:00:00+00	8
15730	32	24	2026-07-06 14:00:00+00	8
15731	32	24	2026-07-07 09:00:00+00	8
15732	32	24	2026-07-07 14:00:00+00	8
15733	32	24	2026-07-08 09:00:00+00	8
15734	32	24	2026-07-08 14:00:00+00	8
15735	32	24	2026-07-09 09:00:00+00	8
15736	32	24	2026-07-09 14:00:00+00	8
15737	32	24	2026-07-10 09:00:00+00	8
15738	32	24	2026-07-10 14:00:00+00	8
15739	33	24	2026-06-29 09:00:00+00	8
15740	33	24	2026-06-29 14:00:00+00	8
15741	33	24	2026-06-30 09:00:00+00	8
15742	33	24	2026-06-30 14:00:00+00	8
15743	33	24	2026-07-01 09:00:00+00	8
15744	33	24	2026-07-01 14:00:00+00	8
15745	33	24	2026-07-02 09:00:00+00	8
15746	33	24	2026-07-02 14:00:00+00	8
15747	33	24	2026-07-03 09:00:00+00	8
15748	33	24	2026-07-03 14:00:00+00	8
15749	33	24	2026-07-06 09:00:00+00	8
15750	33	24	2026-07-06 14:00:00+00	8
15751	33	24	2026-07-07 09:00:00+00	8
15752	33	24	2026-07-07 14:00:00+00	8
15753	33	24	2026-07-08 09:00:00+00	8
15754	33	24	2026-07-08 14:00:00+00	8
15755	33	24	2026-07-09 09:00:00+00	8
15756	33	24	2026-07-09 14:00:00+00	8
15757	33	24	2026-07-10 09:00:00+00	8
15758	33	24	2026-07-10 14:00:00+00	8
15759	34	24	2026-06-29 09:00:00+00	8
15760	34	24	2026-06-29 14:00:00+00	8
15761	34	24	2026-06-30 09:00:00+00	8
15762	34	24	2026-06-30 14:00:00+00	8
15763	34	24	2026-07-01 09:00:00+00	8
15764	34	24	2026-07-01 14:00:00+00	8
15765	34	24	2026-07-02 09:00:00+00	8
15766	34	24	2026-07-02 14:00:00+00	8
15767	34	24	2026-07-03 09:00:00+00	8
15768	34	24	2026-07-03 14:00:00+00	8
15769	34	24	2026-07-06 09:00:00+00	8
15770	34	24	2026-07-06 14:00:00+00	8
15771	34	24	2026-07-07 09:00:00+00	8
15772	34	24	2026-07-07 14:00:00+00	8
15773	34	24	2026-07-08 09:00:00+00	8
15774	34	24	2026-07-08 14:00:00+00	8
15775	34	24	2026-07-09 09:00:00+00	8
15776	34	24	2026-07-09 14:00:00+00	8
15777	34	24	2026-07-10 09:00:00+00	8
15778	34	24	2026-07-10 14:00:00+00	8
15779	37	24	2026-06-29 09:00:00+00	8
15780	37	24	2026-06-29 14:00:00+00	8
15781	37	24	2026-06-30 09:00:00+00	8
15782	37	24	2026-06-30 14:00:00+00	8
15783	37	24	2026-07-01 09:00:00+00	8
15784	37	24	2026-07-01 14:00:00+00	8
15785	37	24	2026-07-02 09:00:00+00	8
15786	37	24	2026-07-02 14:00:00+00	8
15787	37	24	2026-07-03 09:00:00+00	8
15788	37	24	2026-07-03 14:00:00+00	8
15789	37	24	2026-07-06 09:00:00+00	8
15790	37	24	2026-07-06 14:00:00+00	8
15791	37	24	2026-07-07 09:00:00+00	8
15792	37	24	2026-07-07 14:00:00+00	8
15793	37	24	2026-07-08 09:00:00+00	8
15794	37	24	2026-07-08 14:00:00+00	8
15795	37	24	2026-07-09 09:00:00+00	8
15796	37	24	2026-07-09 14:00:00+00	8
15797	37	24	2026-07-10 09:00:00+00	8
15798	37	24	2026-07-10 14:00:00+00	8
15799	38	24	2026-06-29 09:00:00+00	8
15800	38	24	2026-06-29 14:00:00+00	8
15801	38	24	2026-06-30 09:00:00+00	8
15802	38	24	2026-06-30 14:00:00+00	8
15803	38	24	2026-07-01 09:00:00+00	8
15804	38	24	2026-07-01 14:00:00+00	8
15805	38	24	2026-07-02 09:00:00+00	8
15806	38	24	2026-07-02 14:00:00+00	8
15807	38	24	2026-07-03 09:00:00+00	8
15808	38	24	2026-07-03 14:00:00+00	8
15809	38	24	2026-07-06 09:00:00+00	8
15810	38	24	2026-07-06 14:00:00+00	8
15811	38	24	2026-07-07 09:00:00+00	8
15812	38	24	2026-07-07 14:00:00+00	8
15813	38	24	2026-07-08 09:00:00+00	8
15814	38	24	2026-07-08 14:00:00+00	8
15815	38	24	2026-07-09 09:00:00+00	8
15816	38	24	2026-07-09 14:00:00+00	8
15817	38	24	2026-07-10 09:00:00+00	8
15818	38	24	2026-07-10 14:00:00+00	8
15819	39	24	2026-06-29 09:00:00+00	8
15820	39	24	2026-06-29 14:00:00+00	8
15821	39	24	2026-06-30 09:00:00+00	8
15822	39	24	2026-06-30 14:00:00+00	8
15823	39	24	2026-07-01 09:00:00+00	8
15824	39	24	2026-07-01 14:00:00+00	8
15825	39	24	2026-07-02 09:00:00+00	8
15826	39	24	2026-07-02 14:00:00+00	8
15827	39	24	2026-07-03 09:00:00+00	8
15828	39	24	2026-07-03 14:00:00+00	8
15829	39	24	2026-07-06 09:00:00+00	8
15830	39	24	2026-07-06 14:00:00+00	8
15831	39	24	2026-07-07 09:00:00+00	8
15832	39	24	2026-07-07 14:00:00+00	8
15833	39	24	2026-07-08 09:00:00+00	8
15834	39	24	2026-07-08 14:00:00+00	8
15835	39	24	2026-07-09 09:00:00+00	8
15836	39	24	2026-07-09 14:00:00+00	8
15837	39	24	2026-07-10 09:00:00+00	8
15838	39	24	2026-07-10 14:00:00+00	8
15839	40	24	2026-06-29 09:00:00+00	8
15840	40	24	2026-06-29 14:00:00+00	8
15841	40	24	2026-06-30 09:00:00+00	8
15842	40	24	2026-06-30 14:00:00+00	8
15843	40	24	2026-07-01 09:00:00+00	8
15844	40	24	2026-07-01 14:00:00+00	8
15845	40	24	2026-07-02 09:00:00+00	8
15846	40	24	2026-07-02 14:00:00+00	8
15847	40	24	2026-07-03 09:00:00+00	8
15848	40	24	2026-07-03 14:00:00+00	8
15849	40	24	2026-07-06 09:00:00+00	8
15850	40	24	2026-07-06 14:00:00+00	8
15851	40	24	2026-07-07 09:00:00+00	8
15852	40	24	2026-07-07 14:00:00+00	8
15853	40	24	2026-07-08 09:00:00+00	8
15854	40	24	2026-07-08 14:00:00+00	8
15855	40	24	2026-07-09 09:00:00+00	8
15856	40	24	2026-07-09 14:00:00+00	8
15857	40	24	2026-07-10 09:00:00+00	8
15858	40	24	2026-07-10 14:00:00+00	8
15859	41	24	2026-06-29 09:00:00+00	8
15860	41	24	2026-06-29 14:00:00+00	8
15861	41	24	2026-06-30 09:00:00+00	8
15862	41	24	2026-06-30 14:00:00+00	8
15863	41	24	2026-07-01 09:00:00+00	8
15864	41	24	2026-07-01 14:00:00+00	8
15865	41	24	2026-07-02 09:00:00+00	8
15866	41	24	2026-07-02 14:00:00+00	8
15867	41	24	2026-07-03 09:00:00+00	8
15868	41	24	2026-07-03 14:00:00+00	8
15869	41	24	2026-07-06 09:00:00+00	8
15870	41	24	2026-07-06 14:00:00+00	8
15871	41	24	2026-07-07 09:00:00+00	8
15872	41	24	2026-07-07 14:00:00+00	8
15873	41	24	2026-07-08 09:00:00+00	8
15874	41	24	2026-07-08 14:00:00+00	8
15875	41	24	2026-07-09 09:00:00+00	8
15876	41	24	2026-07-09 14:00:00+00	8
15877	41	24	2026-07-10 09:00:00+00	8
15878	41	24	2026-07-10 14:00:00+00	8
15879	42	24	2026-06-29 09:00:00+00	8
15880	42	24	2026-06-29 14:00:00+00	8
15881	42	24	2026-06-30 09:00:00+00	8
15882	42	24	2026-06-30 14:00:00+00	8
15883	42	24	2026-07-01 09:00:00+00	8
15884	42	24	2026-07-01 14:00:00+00	8
15885	42	24	2026-07-02 09:00:00+00	8
15886	42	24	2026-07-02 14:00:00+00	8
15887	42	24	2026-07-03 09:00:00+00	8
15888	42	24	2026-07-03 14:00:00+00	8
15889	42	24	2026-07-06 09:00:00+00	8
15890	42	24	2026-07-06 14:00:00+00	8
15891	42	24	2026-07-07 09:00:00+00	8
15892	42	24	2026-07-07 14:00:00+00	8
15893	42	24	2026-07-08 09:00:00+00	8
15894	42	24	2026-07-08 14:00:00+00	8
15895	42	24	2026-07-09 09:00:00+00	8
15896	42	24	2026-07-09 14:00:00+00	8
15897	42	24	2026-07-10 09:00:00+00	8
15898	42	24	2026-07-10 14:00:00+00	8
15899	44	24	2026-06-29 09:00:00+00	8
15900	44	24	2026-06-29 14:00:00+00	8
15901	44	24	2026-06-30 09:00:00+00	8
15902	44	24	2026-06-30 14:00:00+00	8
15903	44	24	2026-07-01 09:00:00+00	8
15904	44	24	2026-07-01 14:00:00+00	8
15905	44	24	2026-07-02 09:00:00+00	8
15906	44	24	2026-07-02 14:00:00+00	8
15907	44	24	2026-07-03 09:00:00+00	8
15908	44	24	2026-07-03 14:00:00+00	8
15909	44	24	2026-07-06 09:00:00+00	8
15910	44	24	2026-07-06 14:00:00+00	8
15911	44	24	2026-07-07 09:00:00+00	8
15912	44	24	2026-07-07 14:00:00+00	8
15913	44	24	2026-07-08 09:00:00+00	8
15914	44	24	2026-07-08 14:00:00+00	8
15915	44	24	2026-07-09 09:00:00+00	8
15916	44	24	2026-07-09 14:00:00+00	8
15917	44	24	2026-07-10 09:00:00+00	8
15918	44	24	2026-07-10 14:00:00+00	8
15919	45	24	2026-06-29 09:00:00+00	8
15920	45	24	2026-06-29 14:00:00+00	8
15921	45	24	2026-06-30 09:00:00+00	8
15922	45	24	2026-06-30 14:00:00+00	8
15923	45	24	2026-07-01 09:00:00+00	8
15924	45	24	2026-07-01 14:00:00+00	8
15925	45	24	2026-07-02 09:00:00+00	8
15926	45	24	2026-07-02 14:00:00+00	8
15927	45	24	2026-07-03 09:00:00+00	8
15928	45	24	2026-07-03 14:00:00+00	8
15929	45	24	2026-07-06 09:00:00+00	8
15930	45	24	2026-07-06 14:00:00+00	8
15931	45	24	2026-07-07 09:00:00+00	8
15932	45	24	2026-07-07 14:00:00+00	8
15933	45	24	2026-07-08 09:00:00+00	8
15934	45	24	2026-07-08 14:00:00+00	8
15935	45	24	2026-07-09 09:00:00+00	8
15936	45	24	2026-07-09 14:00:00+00	8
15937	45	24	2026-07-10 09:00:00+00	8
15938	45	24	2026-07-10 14:00:00+00	8
15939	47	24	2026-06-29 09:00:00+00	8
15940	47	24	2026-06-29 14:00:00+00	8
15941	47	24	2026-06-30 09:00:00+00	8
15942	47	24	2026-06-30 14:00:00+00	8
15943	47	24	2026-07-01 09:00:00+00	8
15944	47	24	2026-07-01 14:00:00+00	8
15945	47	24	2026-07-02 09:00:00+00	8
15946	47	24	2026-07-02 14:00:00+00	8
15947	47	24	2026-07-03 09:00:00+00	8
15948	47	24	2026-07-03 14:00:00+00	8
15949	47	24	2026-07-06 09:00:00+00	8
15950	47	24	2026-07-06 14:00:00+00	8
15951	47	24	2026-07-07 09:00:00+00	8
15952	47	24	2026-07-07 14:00:00+00	8
15953	47	24	2026-07-08 09:00:00+00	8
15954	47	24	2026-07-08 14:00:00+00	8
15955	47	24	2026-07-09 09:00:00+00	8
15956	47	24	2026-07-09 14:00:00+00	8
15957	47	24	2026-07-10 09:00:00+00	8
15958	47	24	2026-07-10 14:00:00+00	8
15959	48	24	2026-06-29 09:00:00+00	8
15960	48	24	2026-06-29 14:00:00+00	8
15961	48	24	2026-06-30 09:00:00+00	8
15962	48	24	2026-06-30 14:00:00+00	8
15963	48	24	2026-07-01 09:00:00+00	8
15964	48	24	2026-07-01 14:00:00+00	8
15965	48	24	2026-07-02 09:00:00+00	8
15966	48	24	2026-07-02 14:00:00+00	8
15967	48	24	2026-07-03 09:00:00+00	8
15968	48	24	2026-07-03 14:00:00+00	8
15969	48	24	2026-07-06 09:00:00+00	8
15970	48	24	2026-07-06 14:00:00+00	8
15971	48	24	2026-07-07 09:00:00+00	8
15972	48	24	2026-07-07 14:00:00+00	8
15973	48	24	2026-07-08 09:00:00+00	8
15974	48	24	2026-07-08 14:00:00+00	8
15975	48	24	2026-07-09 09:00:00+00	8
15976	48	24	2026-07-09 14:00:00+00	8
15977	48	24	2026-07-10 09:00:00+00	8
15978	48	24	2026-07-10 14:00:00+00	8
15979	49	24	2026-06-29 09:00:00+00	8
15980	49	24	2026-06-29 14:00:00+00	8
15981	49	24	2026-06-30 09:00:00+00	8
15982	49	24	2026-06-30 14:00:00+00	8
15983	49	24	2026-07-01 09:00:00+00	8
15984	49	24	2026-07-01 14:00:00+00	8
15985	49	24	2026-07-02 09:00:00+00	8
15986	49	24	2026-07-02 14:00:00+00	8
15987	49	24	2026-07-03 09:00:00+00	8
15988	49	24	2026-07-03 14:00:00+00	8
15989	49	24	2026-07-06 09:00:00+00	8
15990	49	24	2026-07-06 14:00:00+00	8
15991	49	24	2026-07-07 09:00:00+00	8
15992	49	24	2026-07-07 14:00:00+00	8
15993	49	24	2026-07-08 09:00:00+00	8
15994	49	24	2026-07-08 14:00:00+00	8
15995	49	24	2026-07-09 09:00:00+00	8
15996	49	24	2026-07-09 14:00:00+00	8
15997	49	24	2026-07-10 09:00:00+00	8
15998	49	24	2026-07-10 14:00:00+00	8
15999	51	24	2026-06-29 09:00:00+00	8
16000	51	24	2026-06-29 14:00:00+00	8
16001	51	24	2026-06-30 09:00:00+00	8
16002	51	24	2026-06-30 14:00:00+00	8
16003	51	24	2026-07-01 09:00:00+00	8
16004	51	24	2026-07-01 14:00:00+00	8
16005	51	24	2026-07-02 09:00:00+00	8
16006	51	24	2026-07-02 14:00:00+00	8
16007	51	24	2026-07-03 09:00:00+00	8
16008	51	24	2026-07-03 14:00:00+00	8
16009	51	24	2026-07-06 09:00:00+00	8
16010	51	24	2026-07-06 14:00:00+00	8
16011	51	24	2026-07-07 09:00:00+00	8
16012	51	24	2026-07-07 14:00:00+00	8
16013	51	24	2026-07-08 09:00:00+00	8
16014	51	24	2026-07-08 14:00:00+00	8
16015	51	24	2026-07-09 09:00:00+00	8
16016	51	24	2026-07-09 14:00:00+00	8
16017	51	24	2026-07-10 09:00:00+00	8
16018	51	24	2026-07-10 14:00:00+00	8
16019	52	24	2026-06-29 09:00:00+00	8
16020	52	24	2026-06-29 14:00:00+00	8
16021	52	24	2026-06-30 09:00:00+00	8
16022	52	24	2026-06-30 14:00:00+00	8
16023	52	24	2026-07-01 09:00:00+00	8
16024	52	24	2026-07-01 14:00:00+00	8
16025	52	24	2026-07-02 09:00:00+00	8
16026	52	24	2026-07-02 14:00:00+00	8
16027	52	24	2026-07-03 09:00:00+00	8
16028	52	24	2026-07-03 14:00:00+00	8
16029	52	24	2026-07-06 09:00:00+00	8
16030	52	24	2026-07-06 14:00:00+00	8
16031	52	24	2026-07-07 09:00:00+00	8
16032	52	24	2026-07-07 14:00:00+00	8
16033	52	24	2026-07-08 09:00:00+00	8
16034	52	24	2026-07-08 14:00:00+00	8
16035	52	24	2026-07-09 09:00:00+00	8
16036	52	24	2026-07-09 14:00:00+00	8
16037	52	24	2026-07-10 09:00:00+00	8
16038	52	24	2026-07-10 14:00:00+00	8
16039	53	24	2026-06-29 09:00:00+00	8
16040	53	24	2026-06-29 14:00:00+00	8
16041	53	24	2026-06-30 09:00:00+00	8
16042	53	24	2026-06-30 14:00:00+00	8
16043	53	24	2026-07-01 09:00:00+00	8
16044	53	24	2026-07-01 14:00:00+00	8
16045	53	24	2026-07-02 09:00:00+00	8
16046	53	24	2026-07-02 14:00:00+00	8
16047	53	24	2026-07-03 09:00:00+00	8
16048	53	24	2026-07-03 14:00:00+00	8
16049	53	24	2026-07-06 09:00:00+00	8
16050	53	24	2026-07-06 14:00:00+00	8
16051	53	24	2026-07-07 09:00:00+00	8
16052	53	24	2026-07-07 14:00:00+00	8
16053	53	24	2026-07-08 09:00:00+00	8
16054	53	24	2026-07-08 14:00:00+00	8
16055	53	24	2026-07-09 09:00:00+00	8
16056	53	24	2026-07-09 14:00:00+00	8
16057	53	24	2026-07-10 09:00:00+00	8
16058	53	24	2026-07-10 14:00:00+00	8
16059	54	24	2026-06-29 09:00:00+00	8
16060	54	24	2026-06-29 14:00:00+00	8
16061	54	24	2026-06-30 09:00:00+00	8
16062	54	24	2026-06-30 14:00:00+00	8
16063	54	24	2026-07-01 09:00:00+00	8
16064	54	24	2026-07-01 14:00:00+00	8
16065	54	24	2026-07-02 09:00:00+00	8
16066	54	24	2026-07-02 14:00:00+00	8
16067	54	24	2026-07-03 09:00:00+00	8
16068	54	24	2026-07-03 14:00:00+00	8
16069	54	24	2026-07-06 09:00:00+00	8
16070	54	24	2026-07-06 14:00:00+00	8
16071	54	24	2026-07-07 09:00:00+00	8
16072	54	24	2026-07-07 14:00:00+00	8
16073	54	24	2026-07-08 09:00:00+00	8
16074	54	24	2026-07-08 14:00:00+00	8
16075	54	24	2026-07-09 09:00:00+00	8
16076	54	24	2026-07-09 14:00:00+00	8
16077	54	24	2026-07-10 09:00:00+00	8
16078	54	24	2026-07-10 14:00:00+00	8
16079	55	24	2026-06-29 09:00:00+00	8
16080	55	24	2026-06-29 14:00:00+00	8
16081	55	24	2026-06-30 09:00:00+00	8
16082	55	24	2026-06-30 14:00:00+00	8
16083	55	24	2026-07-01 09:00:00+00	8
16084	55	24	2026-07-01 14:00:00+00	8
16085	55	24	2026-07-02 09:00:00+00	8
16086	55	24	2026-07-02 14:00:00+00	8
16087	55	24	2026-07-03 09:00:00+00	8
16088	55	24	2026-07-03 14:00:00+00	8
16089	55	24	2026-07-06 09:00:00+00	8
16090	55	24	2026-07-06 14:00:00+00	8
16091	55	24	2026-07-07 09:00:00+00	8
16092	55	24	2026-07-07 14:00:00+00	8
16093	55	24	2026-07-08 09:00:00+00	8
16094	55	24	2026-07-08 14:00:00+00	8
16095	55	24	2026-07-09 09:00:00+00	8
16096	55	24	2026-07-09 14:00:00+00	8
16097	55	24	2026-07-10 09:00:00+00	8
16098	55	24	2026-07-10 14:00:00+00	8
16099	56	24	2026-06-29 09:00:00+00	8
16100	56	24	2026-06-29 14:00:00+00	8
16101	56	24	2026-06-30 09:00:00+00	8
16102	56	24	2026-06-30 14:00:00+00	8
16103	56	24	2026-07-01 09:00:00+00	8
16104	56	24	2026-07-01 14:00:00+00	8
16105	56	24	2026-07-02 09:00:00+00	8
16106	56	24	2026-07-02 14:00:00+00	8
16107	56	24	2026-07-03 09:00:00+00	8
16108	56	24	2026-07-03 14:00:00+00	8
16109	56	24	2026-07-06 09:00:00+00	8
16110	56	24	2026-07-06 14:00:00+00	8
16111	56	24	2026-07-07 09:00:00+00	8
16112	56	24	2026-07-07 14:00:00+00	8
16113	56	24	2026-07-08 09:00:00+00	8
16114	56	24	2026-07-08 14:00:00+00	8
16115	56	24	2026-07-09 09:00:00+00	8
16116	56	24	2026-07-09 14:00:00+00	8
16117	56	24	2026-07-10 09:00:00+00	8
16118	56	24	2026-07-10 14:00:00+00	8
16119	57	24	2026-06-29 09:00:00+00	8
16120	57	24	2026-06-29 14:00:00+00	8
16121	57	24	2026-06-30 09:00:00+00	8
16122	57	24	2026-06-30 14:00:00+00	8
16123	57	24	2026-07-01 09:00:00+00	8
16124	57	24	2026-07-01 14:00:00+00	8
16125	57	24	2026-07-02 09:00:00+00	8
16126	57	24	2026-07-02 14:00:00+00	8
16127	57	24	2026-07-03 09:00:00+00	8
16128	57	24	2026-07-03 14:00:00+00	8
16129	57	24	2026-07-06 09:00:00+00	8
16130	57	24	2026-07-06 14:00:00+00	8
16131	57	24	2026-07-07 09:00:00+00	8
16132	57	24	2026-07-07 14:00:00+00	8
16133	57	24	2026-07-08 09:00:00+00	8
16134	57	24	2026-07-08 14:00:00+00	8
16135	57	24	2026-07-09 09:00:00+00	8
16136	57	24	2026-07-09 14:00:00+00	8
16137	57	24	2026-07-10 09:00:00+00	8
16138	57	24	2026-07-10 14:00:00+00	8
16139	3	25	2026-06-29 09:00:00+00	8
16140	3	25	2026-06-29 14:00:00+00	8
16141	3	25	2026-06-30 09:00:00+00	8
16142	3	25	2026-06-30 14:00:00+00	8
16143	3	25	2026-07-01 09:00:00+00	8
16144	3	25	2026-07-01 14:00:00+00	8
16145	3	25	2026-07-02 09:00:00+00	8
16146	3	25	2026-07-02 14:00:00+00	8
16147	3	25	2026-07-03 09:00:00+00	8
16148	3	25	2026-07-03 14:00:00+00	8
16149	3	25	2026-07-06 09:00:00+00	8
16150	3	25	2026-07-06 14:00:00+00	8
16151	3	25	2026-07-07 09:00:00+00	8
16152	3	25	2026-07-07 14:00:00+00	8
16153	3	25	2026-07-08 09:00:00+00	8
16154	3	25	2026-07-08 14:00:00+00	8
16155	3	25	2026-07-09 09:00:00+00	8
16156	3	25	2026-07-09 14:00:00+00	8
16157	3	25	2026-07-10 09:00:00+00	8
16158	3	25	2026-07-10 14:00:00+00	8
16159	4	25	2026-06-29 09:00:00+00	8
16160	4	25	2026-06-29 14:00:00+00	8
16161	4	25	2026-06-30 09:00:00+00	8
16162	4	25	2026-06-30 14:00:00+00	8
16163	4	25	2026-07-01 09:00:00+00	8
16164	4	25	2026-07-01 14:00:00+00	8
16165	4	25	2026-07-02 09:00:00+00	8
16166	4	25	2026-07-02 14:00:00+00	8
16167	4	25	2026-07-03 09:00:00+00	8
16168	4	25	2026-07-03 14:00:00+00	8
16169	4	25	2026-07-06 09:00:00+00	8
16170	4	25	2026-07-06 14:00:00+00	8
16171	4	25	2026-07-07 09:00:00+00	8
16172	4	25	2026-07-07 14:00:00+00	8
16173	4	25	2026-07-08 09:00:00+00	8
16174	4	25	2026-07-08 14:00:00+00	8
16175	4	25	2026-07-09 09:00:00+00	8
16176	4	25	2026-07-09 14:00:00+00	8
16177	4	25	2026-07-10 09:00:00+00	8
16178	4	25	2026-07-10 14:00:00+00	8
16179	6	25	2026-06-29 09:00:00+00	8
16180	6	25	2026-06-29 14:00:00+00	8
16181	6	25	2026-06-30 09:00:00+00	8
16182	6	25	2026-06-30 14:00:00+00	8
16183	6	25	2026-07-01 09:00:00+00	8
16184	6	25	2026-07-01 14:00:00+00	8
16185	6	25	2026-07-02 09:00:00+00	8
16186	6	25	2026-07-02 14:00:00+00	8
16187	6	25	2026-07-03 09:00:00+00	8
16188	6	25	2026-07-03 14:00:00+00	8
16189	6	25	2026-07-06 09:00:00+00	8
16190	6	25	2026-07-06 14:00:00+00	8
16191	6	25	2026-07-07 09:00:00+00	8
16192	6	25	2026-07-07 14:00:00+00	8
16193	6	25	2026-07-08 09:00:00+00	8
16194	6	25	2026-07-08 14:00:00+00	8
16195	6	25	2026-07-09 09:00:00+00	8
16196	6	25	2026-07-09 14:00:00+00	8
16197	6	25	2026-07-10 09:00:00+00	8
16198	6	25	2026-07-10 14:00:00+00	8
16199	8	25	2026-06-29 09:00:00+00	8
16200	8	25	2026-06-29 14:00:00+00	8
16201	8	25	2026-06-30 09:00:00+00	8
16202	8	25	2026-06-30 14:00:00+00	8
16203	8	25	2026-07-01 09:00:00+00	8
16204	8	25	2026-07-01 14:00:00+00	8
16205	8	25	2026-07-02 09:00:00+00	8
16206	8	25	2026-07-02 14:00:00+00	8
16207	8	25	2026-07-03 09:00:00+00	8
16208	8	25	2026-07-03 14:00:00+00	8
16209	8	25	2026-07-06 09:00:00+00	8
16210	8	25	2026-07-06 14:00:00+00	8
16211	8	25	2026-07-07 09:00:00+00	8
16212	8	25	2026-07-07 14:00:00+00	8
16213	8	25	2026-07-08 09:00:00+00	8
16214	8	25	2026-07-08 14:00:00+00	8
16215	8	25	2026-07-09 09:00:00+00	8
16216	8	25	2026-07-09 14:00:00+00	8
16217	8	25	2026-07-10 09:00:00+00	8
16218	8	25	2026-07-10 14:00:00+00	8
16219	10	25	2026-06-29 09:00:00+00	8
16220	10	25	2026-06-29 14:00:00+00	8
16221	10	25	2026-06-30 09:00:00+00	8
16222	10	25	2026-06-30 14:00:00+00	8
16223	10	25	2026-07-01 09:00:00+00	8
16224	10	25	2026-07-01 14:00:00+00	8
16225	10	25	2026-07-02 09:00:00+00	8
16226	10	25	2026-07-02 14:00:00+00	8
16227	10	25	2026-07-03 09:00:00+00	8
16228	10	25	2026-07-03 14:00:00+00	8
16229	10	25	2026-07-06 09:00:00+00	8
16230	10	25	2026-07-06 14:00:00+00	8
16231	10	25	2026-07-07 09:00:00+00	8
16232	10	25	2026-07-07 14:00:00+00	8
16233	10	25	2026-07-08 09:00:00+00	8
16234	10	25	2026-07-08 14:00:00+00	8
16235	10	25	2026-07-09 09:00:00+00	8
16236	10	25	2026-07-09 14:00:00+00	8
16237	10	25	2026-07-10 09:00:00+00	8
16238	10	25	2026-07-10 14:00:00+00	8
16239	11	25	2026-06-29 09:00:00+00	8
16240	11	25	2026-06-29 14:00:00+00	8
16241	11	25	2026-06-30 09:00:00+00	8
16242	11	25	2026-06-30 14:00:00+00	8
16243	11	25	2026-07-01 09:00:00+00	8
16244	11	25	2026-07-01 14:00:00+00	8
16245	11	25	2026-07-02 09:00:00+00	8
16246	11	25	2026-07-02 14:00:00+00	8
16247	11	25	2026-07-03 09:00:00+00	8
16248	11	25	2026-07-03 14:00:00+00	8
16249	11	25	2026-07-06 09:00:00+00	8
16250	11	25	2026-07-06 14:00:00+00	8
16251	11	25	2026-07-07 09:00:00+00	8
16252	11	25	2026-07-07 14:00:00+00	8
16253	11	25	2026-07-08 09:00:00+00	8
16254	11	25	2026-07-08 14:00:00+00	8
16255	11	25	2026-07-09 09:00:00+00	8
16256	11	25	2026-07-09 14:00:00+00	8
16257	11	25	2026-07-10 09:00:00+00	8
16258	11	25	2026-07-10 14:00:00+00	8
16259	12	25	2026-06-29 09:00:00+00	8
16260	12	25	2026-06-29 14:00:00+00	8
16261	12	25	2026-06-30 09:00:00+00	8
16262	12	25	2026-06-30 14:00:00+00	8
16263	12	25	2026-07-01 09:00:00+00	8
16264	12	25	2026-07-01 14:00:00+00	8
16265	12	25	2026-07-02 09:00:00+00	8
16266	12	25	2026-07-02 14:00:00+00	8
16267	12	25	2026-07-03 09:00:00+00	8
16268	12	25	2026-07-03 14:00:00+00	8
16269	12	25	2026-07-06 09:00:00+00	8
16270	12	25	2026-07-06 14:00:00+00	8
16271	12	25	2026-07-07 09:00:00+00	8
16272	12	25	2026-07-07 14:00:00+00	8
16273	12	25	2026-07-08 09:00:00+00	8
16274	12	25	2026-07-08 14:00:00+00	8
16275	12	25	2026-07-09 09:00:00+00	8
16276	12	25	2026-07-09 14:00:00+00	8
16277	12	25	2026-07-10 09:00:00+00	8
16278	12	25	2026-07-10 14:00:00+00	8
16279	13	25	2026-06-29 09:00:00+00	8
16280	13	25	2026-06-29 14:00:00+00	8
16281	13	25	2026-06-30 09:00:00+00	8
16282	13	25	2026-06-30 14:00:00+00	8
16283	13	25	2026-07-01 09:00:00+00	8
16284	13	25	2026-07-01 14:00:00+00	8
16285	13	25	2026-07-02 09:00:00+00	8
16286	13	25	2026-07-02 14:00:00+00	8
16287	13	25	2026-07-03 09:00:00+00	8
16288	13	25	2026-07-03 14:00:00+00	8
16289	13	25	2026-07-06 09:00:00+00	8
16290	13	25	2026-07-06 14:00:00+00	8
16291	13	25	2026-07-07 09:00:00+00	8
16292	13	25	2026-07-07 14:00:00+00	8
16293	13	25	2026-07-08 09:00:00+00	8
16294	13	25	2026-07-08 14:00:00+00	8
16295	13	25	2026-07-09 09:00:00+00	8
16296	13	25	2026-07-09 14:00:00+00	8
16297	13	25	2026-07-10 09:00:00+00	8
16298	13	25	2026-07-10 14:00:00+00	8
16299	15	25	2026-06-29 09:00:00+00	8
16300	15	25	2026-06-29 14:00:00+00	8
16301	15	25	2026-06-30 09:00:00+00	8
16302	15	25	2026-06-30 14:00:00+00	8
16303	15	25	2026-07-01 09:00:00+00	8
16304	15	25	2026-07-01 14:00:00+00	8
16305	15	25	2026-07-02 09:00:00+00	8
16306	15	25	2026-07-02 14:00:00+00	8
16307	15	25	2026-07-03 09:00:00+00	8
16308	15	25	2026-07-03 14:00:00+00	8
16309	15	25	2026-07-06 09:00:00+00	8
16310	15	25	2026-07-06 14:00:00+00	8
16311	15	25	2026-07-07 09:00:00+00	8
16312	15	25	2026-07-07 14:00:00+00	8
16313	15	25	2026-07-08 09:00:00+00	8
16314	15	25	2026-07-08 14:00:00+00	8
16315	15	25	2026-07-09 09:00:00+00	8
16316	15	25	2026-07-09 14:00:00+00	8
16317	15	25	2026-07-10 09:00:00+00	8
16318	15	25	2026-07-10 14:00:00+00	8
16319	16	25	2026-06-29 09:00:00+00	8
16320	16	25	2026-06-29 14:00:00+00	8
16321	16	25	2026-06-30 09:00:00+00	8
16322	16	25	2026-06-30 14:00:00+00	8
16323	16	25	2026-07-01 09:00:00+00	8
16324	16	25	2026-07-01 14:00:00+00	8
16325	16	25	2026-07-02 09:00:00+00	8
16326	16	25	2026-07-02 14:00:00+00	8
16327	16	25	2026-07-03 09:00:00+00	8
16328	16	25	2026-07-03 14:00:00+00	8
16329	16	25	2026-07-06 09:00:00+00	8
16330	16	25	2026-07-06 14:00:00+00	8
16331	16	25	2026-07-07 09:00:00+00	8
16332	16	25	2026-07-07 14:00:00+00	8
16333	16	25	2026-07-08 09:00:00+00	8
16334	16	25	2026-07-08 14:00:00+00	8
16335	16	25	2026-07-09 09:00:00+00	8
16336	16	25	2026-07-09 14:00:00+00	8
16337	16	25	2026-07-10 09:00:00+00	8
16338	16	25	2026-07-10 14:00:00+00	8
16339	17	25	2026-06-29 09:00:00+00	8
16340	17	25	2026-06-29 14:00:00+00	8
16341	17	25	2026-06-30 09:00:00+00	8
16342	17	25	2026-06-30 14:00:00+00	8
16343	17	25	2026-07-01 09:00:00+00	8
16344	17	25	2026-07-01 14:00:00+00	8
16345	17	25	2026-07-02 09:00:00+00	8
16346	17	25	2026-07-02 14:00:00+00	8
16347	17	25	2026-07-03 09:00:00+00	8
16348	17	25	2026-07-03 14:00:00+00	8
16349	17	25	2026-07-06 09:00:00+00	8
16350	17	25	2026-07-06 14:00:00+00	8
16351	17	25	2026-07-07 09:00:00+00	8
16352	17	25	2026-07-07 14:00:00+00	8
16353	17	25	2026-07-08 09:00:00+00	8
16354	17	25	2026-07-08 14:00:00+00	8
16355	17	25	2026-07-09 09:00:00+00	8
16356	17	25	2026-07-09 14:00:00+00	8
16357	17	25	2026-07-10 09:00:00+00	8
16358	17	25	2026-07-10 14:00:00+00	8
16359	18	25	2026-06-29 09:00:00+00	8
16360	18	25	2026-06-29 14:00:00+00	8
16361	18	25	2026-06-30 09:00:00+00	8
16362	18	25	2026-06-30 14:00:00+00	8
16363	18	25	2026-07-01 09:00:00+00	8
16364	18	25	2026-07-01 14:00:00+00	8
16365	18	25	2026-07-02 09:00:00+00	8
16366	18	25	2026-07-02 14:00:00+00	8
16367	18	25	2026-07-03 09:00:00+00	8
16368	18	25	2026-07-03 14:00:00+00	8
16369	18	25	2026-07-06 09:00:00+00	8
16370	18	25	2026-07-06 14:00:00+00	8
16371	18	25	2026-07-07 09:00:00+00	8
16372	18	25	2026-07-07 14:00:00+00	8
16373	18	25	2026-07-08 09:00:00+00	8
16374	18	25	2026-07-08 14:00:00+00	8
16375	18	25	2026-07-09 09:00:00+00	8
16376	18	25	2026-07-09 14:00:00+00	8
16377	18	25	2026-07-10 09:00:00+00	8
16378	18	25	2026-07-10 14:00:00+00	8
16379	19	25	2026-06-29 09:00:00+00	8
16380	19	25	2026-06-29 14:00:00+00	8
16381	19	25	2026-06-30 09:00:00+00	8
16382	19	25	2026-06-30 14:00:00+00	8
16383	19	25	2026-07-01 09:00:00+00	8
16384	19	25	2026-07-01 14:00:00+00	8
16385	19	25	2026-07-02 09:00:00+00	8
16386	19	25	2026-07-02 14:00:00+00	8
16387	19	25	2026-07-03 09:00:00+00	8
16388	19	25	2026-07-03 14:00:00+00	8
16389	19	25	2026-07-06 09:00:00+00	8
16390	19	25	2026-07-06 14:00:00+00	8
16391	19	25	2026-07-07 09:00:00+00	8
16392	19	25	2026-07-07 14:00:00+00	8
16393	19	25	2026-07-08 09:00:00+00	8
16394	19	25	2026-07-08 14:00:00+00	8
16395	19	25	2026-07-09 09:00:00+00	8
16396	19	25	2026-07-09 14:00:00+00	8
16397	19	25	2026-07-10 09:00:00+00	8
16398	19	25	2026-07-10 14:00:00+00	8
16399	20	25	2026-06-29 09:00:00+00	8
16400	20	25	2026-06-29 14:00:00+00	8
16401	20	25	2026-06-30 09:00:00+00	8
16402	20	25	2026-06-30 14:00:00+00	8
16403	20	25	2026-07-01 09:00:00+00	8
16404	20	25	2026-07-01 14:00:00+00	8
16405	20	25	2026-07-02 09:00:00+00	8
16406	20	25	2026-07-02 14:00:00+00	8
16407	20	25	2026-07-03 09:00:00+00	8
16408	20	25	2026-07-03 14:00:00+00	8
16409	20	25	2026-07-06 09:00:00+00	8
16410	20	25	2026-07-06 14:00:00+00	8
16411	20	25	2026-07-07 09:00:00+00	8
16412	20	25	2026-07-07 14:00:00+00	8
16413	20	25	2026-07-08 09:00:00+00	8
16414	20	25	2026-07-08 14:00:00+00	8
16415	20	25	2026-07-09 09:00:00+00	8
16416	20	25	2026-07-09 14:00:00+00	8
16417	20	25	2026-07-10 09:00:00+00	8
16418	20	25	2026-07-10 14:00:00+00	8
16419	22	25	2026-06-29 09:00:00+00	8
16420	22	25	2026-06-29 14:00:00+00	8
16421	22	25	2026-06-30 09:00:00+00	8
16422	22	25	2026-06-30 14:00:00+00	8
16423	22	25	2026-07-01 09:00:00+00	8
16424	22	25	2026-07-01 14:00:00+00	8
16425	22	25	2026-07-02 09:00:00+00	8
16426	22	25	2026-07-02 14:00:00+00	8
16427	22	25	2026-07-03 09:00:00+00	8
16428	22	25	2026-07-03 14:00:00+00	8
16429	22	25	2026-07-06 09:00:00+00	8
16430	22	25	2026-07-06 14:00:00+00	8
16431	22	25	2026-07-07 09:00:00+00	8
16432	22	25	2026-07-07 14:00:00+00	8
16433	22	25	2026-07-08 09:00:00+00	8
16434	22	25	2026-07-08 14:00:00+00	8
16435	22	25	2026-07-09 09:00:00+00	8
16436	22	25	2026-07-09 14:00:00+00	8
16437	22	25	2026-07-10 09:00:00+00	8
16438	22	25	2026-07-10 14:00:00+00	8
16439	23	25	2026-06-29 09:00:00+00	8
16440	23	25	2026-06-29 14:00:00+00	8
16441	23	25	2026-06-30 09:00:00+00	8
16442	23	25	2026-06-30 14:00:00+00	8
16443	23	25	2026-07-01 09:00:00+00	8
16444	23	25	2026-07-01 14:00:00+00	8
16445	23	25	2026-07-02 09:00:00+00	8
16446	23	25	2026-07-02 14:00:00+00	8
16447	23	25	2026-07-03 09:00:00+00	8
16448	23	25	2026-07-03 14:00:00+00	8
16449	23	25	2026-07-06 09:00:00+00	8
16450	23	25	2026-07-06 14:00:00+00	8
16451	23	25	2026-07-07 09:00:00+00	8
16452	23	25	2026-07-07 14:00:00+00	8
16453	23	25	2026-07-08 09:00:00+00	8
16454	23	25	2026-07-08 14:00:00+00	8
16455	23	25	2026-07-09 09:00:00+00	8
16456	23	25	2026-07-09 14:00:00+00	8
16457	23	25	2026-07-10 09:00:00+00	8
16458	23	25	2026-07-10 14:00:00+00	8
16459	25	25	2026-06-29 09:00:00+00	8
16460	25	25	2026-06-29 14:00:00+00	8
16461	25	25	2026-06-30 09:00:00+00	8
16462	25	25	2026-06-30 14:00:00+00	8
16463	25	25	2026-07-01 09:00:00+00	8
16464	25	25	2026-07-01 14:00:00+00	8
16465	25	25	2026-07-02 09:00:00+00	8
16466	25	25	2026-07-02 14:00:00+00	8
16467	25	25	2026-07-03 09:00:00+00	8
16468	25	25	2026-07-03 14:00:00+00	8
16469	25	25	2026-07-06 09:00:00+00	8
16470	25	25	2026-07-06 14:00:00+00	8
16471	25	25	2026-07-07 09:00:00+00	8
16472	25	25	2026-07-07 14:00:00+00	8
16473	25	25	2026-07-08 09:00:00+00	8
16474	25	25	2026-07-08 14:00:00+00	8
16475	25	25	2026-07-09 09:00:00+00	8
16476	25	25	2026-07-09 14:00:00+00	8
16477	25	25	2026-07-10 09:00:00+00	8
16478	25	25	2026-07-10 14:00:00+00	8
16479	26	25	2026-06-29 09:00:00+00	8
16480	26	25	2026-06-29 14:00:00+00	8
16481	26	25	2026-06-30 09:00:00+00	8
16482	26	25	2026-06-30 14:00:00+00	8
16483	26	25	2026-07-01 09:00:00+00	8
16484	26	25	2026-07-01 14:00:00+00	8
16485	26	25	2026-07-02 09:00:00+00	8
16486	26	25	2026-07-02 14:00:00+00	8
16487	26	25	2026-07-03 09:00:00+00	8
16488	26	25	2026-07-03 14:00:00+00	8
16489	26	25	2026-07-06 09:00:00+00	8
16490	26	25	2026-07-06 14:00:00+00	8
16491	26	25	2026-07-07 09:00:00+00	8
16492	26	25	2026-07-07 14:00:00+00	8
16493	26	25	2026-07-08 09:00:00+00	8
16494	26	25	2026-07-08 14:00:00+00	8
16495	26	25	2026-07-09 09:00:00+00	8
16496	26	25	2026-07-09 14:00:00+00	8
16497	26	25	2026-07-10 09:00:00+00	8
16498	26	25	2026-07-10 14:00:00+00	8
16499	27	25	2026-06-29 09:00:00+00	8
16500	27	25	2026-06-29 14:00:00+00	8
16501	27	25	2026-06-30 09:00:00+00	8
16502	27	25	2026-06-30 14:00:00+00	8
16503	27	25	2026-07-01 09:00:00+00	8
16504	27	25	2026-07-01 14:00:00+00	8
16505	27	25	2026-07-02 09:00:00+00	8
16506	27	25	2026-07-02 14:00:00+00	8
16507	27	25	2026-07-03 09:00:00+00	8
16508	27	25	2026-07-03 14:00:00+00	8
16509	27	25	2026-07-06 09:00:00+00	8
16510	27	25	2026-07-06 14:00:00+00	8
16511	27	25	2026-07-07 09:00:00+00	8
16512	27	25	2026-07-07 14:00:00+00	8
16513	27	25	2026-07-08 09:00:00+00	8
16514	27	25	2026-07-08 14:00:00+00	8
16515	27	25	2026-07-09 09:00:00+00	8
16516	27	25	2026-07-09 14:00:00+00	8
16517	27	25	2026-07-10 09:00:00+00	8
16518	27	25	2026-07-10 14:00:00+00	8
16519	28	25	2026-06-29 09:00:00+00	8
16520	28	25	2026-06-29 14:00:00+00	8
16521	28	25	2026-06-30 09:00:00+00	8
16522	28	25	2026-06-30 14:00:00+00	8
16523	28	25	2026-07-01 09:00:00+00	8
16524	28	25	2026-07-01 14:00:00+00	8
16525	28	25	2026-07-02 09:00:00+00	8
16526	28	25	2026-07-02 14:00:00+00	8
16527	28	25	2026-07-03 09:00:00+00	8
16528	28	25	2026-07-03 14:00:00+00	8
16529	28	25	2026-07-06 09:00:00+00	8
16530	28	25	2026-07-06 14:00:00+00	8
16531	28	25	2026-07-07 09:00:00+00	8
16532	28	25	2026-07-07 14:00:00+00	8
16533	28	25	2026-07-08 09:00:00+00	8
16534	28	25	2026-07-08 14:00:00+00	8
16535	28	25	2026-07-09 09:00:00+00	8
16536	28	25	2026-07-09 14:00:00+00	8
16537	28	25	2026-07-10 09:00:00+00	8
16538	28	25	2026-07-10 14:00:00+00	8
16539	29	25	2026-06-29 09:00:00+00	8
16540	29	25	2026-06-29 14:00:00+00	8
16541	29	25	2026-06-30 09:00:00+00	8
16542	29	25	2026-06-30 14:00:00+00	8
16543	29	25	2026-07-01 09:00:00+00	8
16544	29	25	2026-07-01 14:00:00+00	8
16545	29	25	2026-07-02 09:00:00+00	8
16546	29	25	2026-07-02 14:00:00+00	8
16547	29	25	2026-07-03 09:00:00+00	8
16548	29	25	2026-07-03 14:00:00+00	8
16549	29	25	2026-07-06 09:00:00+00	8
16550	29	25	2026-07-06 14:00:00+00	8
16551	29	25	2026-07-07 09:00:00+00	8
16552	29	25	2026-07-07 14:00:00+00	8
16553	29	25	2026-07-08 09:00:00+00	8
16554	29	25	2026-07-08 14:00:00+00	8
16555	29	25	2026-07-09 09:00:00+00	8
16556	29	25	2026-07-09 14:00:00+00	8
16557	29	25	2026-07-10 09:00:00+00	8
16558	29	25	2026-07-10 14:00:00+00	8
16559	30	25	2026-06-29 09:00:00+00	8
16560	30	25	2026-06-29 14:00:00+00	8
16561	30	25	2026-06-30 09:00:00+00	8
16562	30	25	2026-06-30 14:00:00+00	8
16563	30	25	2026-07-01 09:00:00+00	8
16564	30	25	2026-07-01 14:00:00+00	8
16565	30	25	2026-07-02 09:00:00+00	8
16566	30	25	2026-07-02 14:00:00+00	8
16567	30	25	2026-07-03 09:00:00+00	8
16568	30	25	2026-07-03 14:00:00+00	8
16569	30	25	2026-07-06 09:00:00+00	8
16570	30	25	2026-07-06 14:00:00+00	8
16571	30	25	2026-07-07 09:00:00+00	8
16572	30	25	2026-07-07 14:00:00+00	8
16573	30	25	2026-07-08 09:00:00+00	8
16574	30	25	2026-07-08 14:00:00+00	8
16575	30	25	2026-07-09 09:00:00+00	8
16576	30	25	2026-07-09 14:00:00+00	8
16577	30	25	2026-07-10 09:00:00+00	8
16578	30	25	2026-07-10 14:00:00+00	8
16579	31	25	2026-06-29 09:00:00+00	8
16580	31	25	2026-06-29 14:00:00+00	8
16581	31	25	2026-06-30 09:00:00+00	8
16582	31	25	2026-06-30 14:00:00+00	8
16583	31	25	2026-07-01 09:00:00+00	8
16584	31	25	2026-07-01 14:00:00+00	8
16585	31	25	2026-07-02 09:00:00+00	8
16586	31	25	2026-07-02 14:00:00+00	8
16587	31	25	2026-07-03 09:00:00+00	8
16588	31	25	2026-07-03 14:00:00+00	8
16589	31	25	2026-07-06 09:00:00+00	8
16590	31	25	2026-07-06 14:00:00+00	8
16591	31	25	2026-07-07 09:00:00+00	8
16592	31	25	2026-07-07 14:00:00+00	8
16593	31	25	2026-07-08 09:00:00+00	8
16594	31	25	2026-07-08 14:00:00+00	8
16595	31	25	2026-07-09 09:00:00+00	8
16596	31	25	2026-07-09 14:00:00+00	8
16597	31	25	2026-07-10 09:00:00+00	8
16598	31	25	2026-07-10 14:00:00+00	8
16599	32	25	2026-06-29 09:00:00+00	8
16600	32	25	2026-06-29 14:00:00+00	8
16601	32	25	2026-06-30 09:00:00+00	8
16602	32	25	2026-06-30 14:00:00+00	8
16603	32	25	2026-07-01 09:00:00+00	8
16604	32	25	2026-07-01 14:00:00+00	8
16605	32	25	2026-07-02 09:00:00+00	8
16606	32	25	2026-07-02 14:00:00+00	8
16607	32	25	2026-07-03 09:00:00+00	8
16608	32	25	2026-07-03 14:00:00+00	8
16609	32	25	2026-07-06 09:00:00+00	8
16610	32	25	2026-07-06 14:00:00+00	8
16611	32	25	2026-07-07 09:00:00+00	8
16612	32	25	2026-07-07 14:00:00+00	8
16613	32	25	2026-07-08 09:00:00+00	8
16614	32	25	2026-07-08 14:00:00+00	8
16615	32	25	2026-07-09 09:00:00+00	8
16616	32	25	2026-07-09 14:00:00+00	8
16617	32	25	2026-07-10 09:00:00+00	8
16618	32	25	2026-07-10 14:00:00+00	8
16619	33	25	2026-06-29 09:00:00+00	8
16620	33	25	2026-06-29 14:00:00+00	8
16621	33	25	2026-06-30 09:00:00+00	8
16622	33	25	2026-06-30 14:00:00+00	8
16623	33	25	2026-07-01 09:00:00+00	8
16624	33	25	2026-07-01 14:00:00+00	8
16625	33	25	2026-07-02 09:00:00+00	8
16626	33	25	2026-07-02 14:00:00+00	8
16627	33	25	2026-07-03 09:00:00+00	8
16628	33	25	2026-07-03 14:00:00+00	8
16629	33	25	2026-07-06 09:00:00+00	8
16630	33	25	2026-07-06 14:00:00+00	8
16631	33	25	2026-07-07 09:00:00+00	8
16632	33	25	2026-07-07 14:00:00+00	8
16633	33	25	2026-07-08 09:00:00+00	8
16634	33	25	2026-07-08 14:00:00+00	8
16635	33	25	2026-07-09 09:00:00+00	8
16636	33	25	2026-07-09 14:00:00+00	8
16637	33	25	2026-07-10 09:00:00+00	8
16638	33	25	2026-07-10 14:00:00+00	8
16639	34	25	2026-06-29 09:00:00+00	8
16640	34	25	2026-06-29 14:00:00+00	8
16641	34	25	2026-06-30 09:00:00+00	8
16642	34	25	2026-06-30 14:00:00+00	8
16643	34	25	2026-07-01 09:00:00+00	8
16644	34	25	2026-07-01 14:00:00+00	8
16645	34	25	2026-07-02 09:00:00+00	8
16646	34	25	2026-07-02 14:00:00+00	8
16647	34	25	2026-07-03 09:00:00+00	8
16648	34	25	2026-07-03 14:00:00+00	8
16649	34	25	2026-07-06 09:00:00+00	8
16650	34	25	2026-07-06 14:00:00+00	8
16651	34	25	2026-07-07 09:00:00+00	8
16652	34	25	2026-07-07 14:00:00+00	8
16653	34	25	2026-07-08 09:00:00+00	8
16654	34	25	2026-07-08 14:00:00+00	8
16655	34	25	2026-07-09 09:00:00+00	8
16656	34	25	2026-07-09 14:00:00+00	8
16657	34	25	2026-07-10 09:00:00+00	8
16658	34	25	2026-07-10 14:00:00+00	8
16659	37	25	2026-06-29 09:00:00+00	8
16660	37	25	2026-06-29 14:00:00+00	8
16661	37	25	2026-06-30 09:00:00+00	8
16662	37	25	2026-06-30 14:00:00+00	8
16663	37	25	2026-07-01 09:00:00+00	8
16664	37	25	2026-07-01 14:00:00+00	8
16665	37	25	2026-07-02 09:00:00+00	8
16666	37	25	2026-07-02 14:00:00+00	8
16667	37	25	2026-07-03 09:00:00+00	8
16668	37	25	2026-07-03 14:00:00+00	8
16669	37	25	2026-07-06 09:00:00+00	8
16670	37	25	2026-07-06 14:00:00+00	8
16671	37	25	2026-07-07 09:00:00+00	8
16672	37	25	2026-07-07 14:00:00+00	8
16673	37	25	2026-07-08 09:00:00+00	8
16674	37	25	2026-07-08 14:00:00+00	8
16675	37	25	2026-07-09 09:00:00+00	8
16676	37	25	2026-07-09 14:00:00+00	8
16677	37	25	2026-07-10 09:00:00+00	8
16678	37	25	2026-07-10 14:00:00+00	8
16679	38	25	2026-06-29 09:00:00+00	8
16680	38	25	2026-06-29 14:00:00+00	8
16681	38	25	2026-06-30 09:00:00+00	8
16682	38	25	2026-06-30 14:00:00+00	8
16683	38	25	2026-07-01 09:00:00+00	8
16684	38	25	2026-07-01 14:00:00+00	8
16685	38	25	2026-07-02 09:00:00+00	8
16686	38	25	2026-07-02 14:00:00+00	8
16687	38	25	2026-07-03 09:00:00+00	8
16688	38	25	2026-07-03 14:00:00+00	8
16689	38	25	2026-07-06 09:00:00+00	8
16690	38	25	2026-07-06 14:00:00+00	8
16691	38	25	2026-07-07 09:00:00+00	8
16692	38	25	2026-07-07 14:00:00+00	8
16693	38	25	2026-07-08 09:00:00+00	8
16694	38	25	2026-07-08 14:00:00+00	8
16695	38	25	2026-07-09 09:00:00+00	8
16696	38	25	2026-07-09 14:00:00+00	8
16697	38	25	2026-07-10 09:00:00+00	8
16698	38	25	2026-07-10 14:00:00+00	8
16699	39	25	2026-06-29 09:00:00+00	8
16700	39	25	2026-06-29 14:00:00+00	8
16701	39	25	2026-06-30 09:00:00+00	8
16702	39	25	2026-06-30 14:00:00+00	8
16703	39	25	2026-07-01 09:00:00+00	8
16704	39	25	2026-07-01 14:00:00+00	8
16705	39	25	2026-07-02 09:00:00+00	8
16706	39	25	2026-07-02 14:00:00+00	8
16707	39	25	2026-07-03 09:00:00+00	8
16708	39	25	2026-07-03 14:00:00+00	8
16709	39	25	2026-07-06 09:00:00+00	8
16710	39	25	2026-07-06 14:00:00+00	8
16711	39	25	2026-07-07 09:00:00+00	8
16712	39	25	2026-07-07 14:00:00+00	8
16713	39	25	2026-07-08 09:00:00+00	8
16714	39	25	2026-07-08 14:00:00+00	8
16715	39	25	2026-07-09 09:00:00+00	8
16716	39	25	2026-07-09 14:00:00+00	8
16717	39	25	2026-07-10 09:00:00+00	8
16718	39	25	2026-07-10 14:00:00+00	8
16719	40	25	2026-06-29 09:00:00+00	8
16720	40	25	2026-06-29 14:00:00+00	8
16721	40	25	2026-06-30 09:00:00+00	8
16722	40	25	2026-06-30 14:00:00+00	8
16723	40	25	2026-07-01 09:00:00+00	8
16724	40	25	2026-07-01 14:00:00+00	8
16725	40	25	2026-07-02 09:00:00+00	8
16726	40	25	2026-07-02 14:00:00+00	8
16727	40	25	2026-07-03 09:00:00+00	8
16728	40	25	2026-07-03 14:00:00+00	8
16729	40	25	2026-07-06 09:00:00+00	8
16730	40	25	2026-07-06 14:00:00+00	8
16731	40	25	2026-07-07 09:00:00+00	8
16732	40	25	2026-07-07 14:00:00+00	8
16733	40	25	2026-07-08 09:00:00+00	8
16734	40	25	2026-07-08 14:00:00+00	8
16735	40	25	2026-07-09 09:00:00+00	8
16736	40	25	2026-07-09 14:00:00+00	8
16737	40	25	2026-07-10 09:00:00+00	8
16738	40	25	2026-07-10 14:00:00+00	8
16739	41	25	2026-06-29 09:00:00+00	8
16740	41	25	2026-06-29 14:00:00+00	8
16741	41	25	2026-06-30 09:00:00+00	8
16742	41	25	2026-06-30 14:00:00+00	8
16743	41	25	2026-07-01 09:00:00+00	8
16744	41	25	2026-07-01 14:00:00+00	8
16745	41	25	2026-07-02 09:00:00+00	8
16746	41	25	2026-07-02 14:00:00+00	8
16747	41	25	2026-07-03 09:00:00+00	8
16748	41	25	2026-07-03 14:00:00+00	8
16749	41	25	2026-07-06 09:00:00+00	8
16750	41	25	2026-07-06 14:00:00+00	8
16751	41	25	2026-07-07 09:00:00+00	8
16752	41	25	2026-07-07 14:00:00+00	8
16753	41	25	2026-07-08 09:00:00+00	8
16754	41	25	2026-07-08 14:00:00+00	8
16755	41	25	2026-07-09 09:00:00+00	8
16756	41	25	2026-07-09 14:00:00+00	8
16757	41	25	2026-07-10 09:00:00+00	8
16758	41	25	2026-07-10 14:00:00+00	8
16759	42	25	2026-06-29 09:00:00+00	8
16760	42	25	2026-06-29 14:00:00+00	8
16761	42	25	2026-06-30 09:00:00+00	8
16762	42	25	2026-06-30 14:00:00+00	8
16763	42	25	2026-07-01 09:00:00+00	8
16764	42	25	2026-07-01 14:00:00+00	8
16765	42	25	2026-07-02 09:00:00+00	8
16766	42	25	2026-07-02 14:00:00+00	8
16767	42	25	2026-07-03 09:00:00+00	8
16768	42	25	2026-07-03 14:00:00+00	8
16769	42	25	2026-07-06 09:00:00+00	8
16770	42	25	2026-07-06 14:00:00+00	8
16771	42	25	2026-07-07 09:00:00+00	8
16772	42	25	2026-07-07 14:00:00+00	8
16773	42	25	2026-07-08 09:00:00+00	8
16774	42	25	2026-07-08 14:00:00+00	8
16775	42	25	2026-07-09 09:00:00+00	8
16776	42	25	2026-07-09 14:00:00+00	8
16777	42	25	2026-07-10 09:00:00+00	8
16778	42	25	2026-07-10 14:00:00+00	8
16779	44	25	2026-06-29 09:00:00+00	8
16780	44	25	2026-06-29 14:00:00+00	8
16781	44	25	2026-06-30 09:00:00+00	8
16782	44	25	2026-06-30 14:00:00+00	8
16783	44	25	2026-07-01 09:00:00+00	8
16784	44	25	2026-07-01 14:00:00+00	8
16785	44	25	2026-07-02 09:00:00+00	8
16786	44	25	2026-07-02 14:00:00+00	8
16787	44	25	2026-07-03 09:00:00+00	8
16788	44	25	2026-07-03 14:00:00+00	8
16789	44	25	2026-07-06 09:00:00+00	8
16790	44	25	2026-07-06 14:00:00+00	8
16791	44	25	2026-07-07 09:00:00+00	8
16792	44	25	2026-07-07 14:00:00+00	8
16793	44	25	2026-07-08 09:00:00+00	8
16794	44	25	2026-07-08 14:00:00+00	8
16795	44	25	2026-07-09 09:00:00+00	8
16796	44	25	2026-07-09 14:00:00+00	8
16797	44	25	2026-07-10 09:00:00+00	8
16798	44	25	2026-07-10 14:00:00+00	8
16799	45	25	2026-06-29 09:00:00+00	8
16800	45	25	2026-06-29 14:00:00+00	8
16801	45	25	2026-06-30 09:00:00+00	8
16802	45	25	2026-06-30 14:00:00+00	8
16803	45	25	2026-07-01 09:00:00+00	8
16804	45	25	2026-07-01 14:00:00+00	8
16805	45	25	2026-07-02 09:00:00+00	8
16806	45	25	2026-07-02 14:00:00+00	8
16807	45	25	2026-07-03 09:00:00+00	8
16808	45	25	2026-07-03 14:00:00+00	8
16809	45	25	2026-07-06 09:00:00+00	8
16810	45	25	2026-07-06 14:00:00+00	8
16811	45	25	2026-07-07 09:00:00+00	8
16812	45	25	2026-07-07 14:00:00+00	8
16813	45	25	2026-07-08 09:00:00+00	8
16814	45	25	2026-07-08 14:00:00+00	8
16815	45	25	2026-07-09 09:00:00+00	8
16816	45	25	2026-07-09 14:00:00+00	8
16817	45	25	2026-07-10 09:00:00+00	8
16818	45	25	2026-07-10 14:00:00+00	8
16819	47	25	2026-06-29 09:00:00+00	8
16820	47	25	2026-06-29 14:00:00+00	8
16821	47	25	2026-06-30 09:00:00+00	8
16822	47	25	2026-06-30 14:00:00+00	8
16823	47	25	2026-07-01 09:00:00+00	8
16824	47	25	2026-07-01 14:00:00+00	8
16825	47	25	2026-07-02 09:00:00+00	8
16826	47	25	2026-07-02 14:00:00+00	8
16827	47	25	2026-07-03 09:00:00+00	8
16828	47	25	2026-07-03 14:00:00+00	8
16829	47	25	2026-07-06 09:00:00+00	8
16830	47	25	2026-07-06 14:00:00+00	8
16831	47	25	2026-07-07 09:00:00+00	8
16832	47	25	2026-07-07 14:00:00+00	8
16833	47	25	2026-07-08 09:00:00+00	8
16834	47	25	2026-07-08 14:00:00+00	8
16835	47	25	2026-07-09 09:00:00+00	8
16836	47	25	2026-07-09 14:00:00+00	8
16837	47	25	2026-07-10 09:00:00+00	8
16838	47	25	2026-07-10 14:00:00+00	8
16839	48	25	2026-06-29 09:00:00+00	8
16840	48	25	2026-06-29 14:00:00+00	8
16841	48	25	2026-06-30 09:00:00+00	8
16842	48	25	2026-06-30 14:00:00+00	8
16843	48	25	2026-07-01 09:00:00+00	8
16844	48	25	2026-07-01 14:00:00+00	8
16845	48	25	2026-07-02 09:00:00+00	8
16846	48	25	2026-07-02 14:00:00+00	8
16847	48	25	2026-07-03 09:00:00+00	8
16848	48	25	2026-07-03 14:00:00+00	8
16849	48	25	2026-07-06 09:00:00+00	8
16850	48	25	2026-07-06 14:00:00+00	8
16851	48	25	2026-07-07 09:00:00+00	8
16852	48	25	2026-07-07 14:00:00+00	8
16853	48	25	2026-07-08 09:00:00+00	8
16854	48	25	2026-07-08 14:00:00+00	8
16855	48	25	2026-07-09 09:00:00+00	8
16856	48	25	2026-07-09 14:00:00+00	8
16857	48	25	2026-07-10 09:00:00+00	8
16858	48	25	2026-07-10 14:00:00+00	8
16859	49	25	2026-06-29 09:00:00+00	8
16860	49	25	2026-06-29 14:00:00+00	8
16861	49	25	2026-06-30 09:00:00+00	8
16862	49	25	2026-06-30 14:00:00+00	8
16863	49	25	2026-07-01 09:00:00+00	8
16864	49	25	2026-07-01 14:00:00+00	8
16865	49	25	2026-07-02 09:00:00+00	8
16866	49	25	2026-07-02 14:00:00+00	8
16867	49	25	2026-07-03 09:00:00+00	8
16868	49	25	2026-07-03 14:00:00+00	8
16869	49	25	2026-07-06 09:00:00+00	8
16870	49	25	2026-07-06 14:00:00+00	8
16871	49	25	2026-07-07 09:00:00+00	8
16872	49	25	2026-07-07 14:00:00+00	8
16873	49	25	2026-07-08 09:00:00+00	8
16874	49	25	2026-07-08 14:00:00+00	8
16875	49	25	2026-07-09 09:00:00+00	8
16876	49	25	2026-07-09 14:00:00+00	8
16877	49	25	2026-07-10 09:00:00+00	8
16878	49	25	2026-07-10 14:00:00+00	8
16879	51	25	2026-06-29 09:00:00+00	8
16880	51	25	2026-06-29 14:00:00+00	8
16881	51	25	2026-06-30 09:00:00+00	8
16882	51	25	2026-06-30 14:00:00+00	8
16883	51	25	2026-07-01 09:00:00+00	8
16884	51	25	2026-07-01 14:00:00+00	8
16885	51	25	2026-07-02 09:00:00+00	8
16886	51	25	2026-07-02 14:00:00+00	8
16887	51	25	2026-07-03 09:00:00+00	8
16888	51	25	2026-07-03 14:00:00+00	8
16889	51	25	2026-07-06 09:00:00+00	8
16890	51	25	2026-07-06 14:00:00+00	8
16891	51	25	2026-07-07 09:00:00+00	8
16892	51	25	2026-07-07 14:00:00+00	8
16893	51	25	2026-07-08 09:00:00+00	8
16894	51	25	2026-07-08 14:00:00+00	8
16895	51	25	2026-07-09 09:00:00+00	8
16896	51	25	2026-07-09 14:00:00+00	8
16897	51	25	2026-07-10 09:00:00+00	8
16898	51	25	2026-07-10 14:00:00+00	8
16899	52	25	2026-06-29 09:00:00+00	8
16900	52	25	2026-06-29 14:00:00+00	8
16901	52	25	2026-06-30 09:00:00+00	8
16902	52	25	2026-06-30 14:00:00+00	8
16903	52	25	2026-07-01 09:00:00+00	8
16904	52	25	2026-07-01 14:00:00+00	8
16905	52	25	2026-07-02 09:00:00+00	8
16906	52	25	2026-07-02 14:00:00+00	8
16907	52	25	2026-07-03 09:00:00+00	8
16908	52	25	2026-07-03 14:00:00+00	8
16909	52	25	2026-07-06 09:00:00+00	8
16910	52	25	2026-07-06 14:00:00+00	8
16911	52	25	2026-07-07 09:00:00+00	8
16912	52	25	2026-07-07 14:00:00+00	8
16913	52	25	2026-07-08 09:00:00+00	8
16914	52	25	2026-07-08 14:00:00+00	8
16915	52	25	2026-07-09 09:00:00+00	8
16916	52	25	2026-07-09 14:00:00+00	8
16917	52	25	2026-07-10 09:00:00+00	8
16918	52	25	2026-07-10 14:00:00+00	8
16919	53	25	2026-06-29 09:00:00+00	8
16920	53	25	2026-06-29 14:00:00+00	8
16921	53	25	2026-06-30 09:00:00+00	8
16922	53	25	2026-06-30 14:00:00+00	8
16923	53	25	2026-07-01 09:00:00+00	8
16924	53	25	2026-07-01 14:00:00+00	8
16925	53	25	2026-07-02 09:00:00+00	8
16926	53	25	2026-07-02 14:00:00+00	8
16927	53	25	2026-07-03 09:00:00+00	8
16928	53	25	2026-07-03 14:00:00+00	8
16929	53	25	2026-07-06 09:00:00+00	8
16930	53	25	2026-07-06 14:00:00+00	8
16931	53	25	2026-07-07 09:00:00+00	8
16932	53	25	2026-07-07 14:00:00+00	8
16933	53	25	2026-07-08 09:00:00+00	8
16934	53	25	2026-07-08 14:00:00+00	8
16935	53	25	2026-07-09 09:00:00+00	8
16936	53	25	2026-07-09 14:00:00+00	8
16937	53	25	2026-07-10 09:00:00+00	8
16938	53	25	2026-07-10 14:00:00+00	8
16939	54	25	2026-06-29 09:00:00+00	8
16940	54	25	2026-06-29 14:00:00+00	8
16941	54	25	2026-06-30 09:00:00+00	8
16942	54	25	2026-06-30 14:00:00+00	8
16943	54	25	2026-07-01 09:00:00+00	8
16944	54	25	2026-07-01 14:00:00+00	8
16945	54	25	2026-07-02 09:00:00+00	8
16946	54	25	2026-07-02 14:00:00+00	8
16947	54	25	2026-07-03 09:00:00+00	8
16948	54	25	2026-07-03 14:00:00+00	8
16949	54	25	2026-07-06 09:00:00+00	8
16950	54	25	2026-07-06 14:00:00+00	8
16951	54	25	2026-07-07 09:00:00+00	8
16952	54	25	2026-07-07 14:00:00+00	8
16953	54	25	2026-07-08 09:00:00+00	8
16954	54	25	2026-07-08 14:00:00+00	8
16955	54	25	2026-07-09 09:00:00+00	8
16956	54	25	2026-07-09 14:00:00+00	8
16957	54	25	2026-07-10 09:00:00+00	8
16958	54	25	2026-07-10 14:00:00+00	8
16959	55	25	2026-06-29 09:00:00+00	8
16960	55	25	2026-06-29 14:00:00+00	8
16961	55	25	2026-06-30 09:00:00+00	8
16962	55	25	2026-06-30 14:00:00+00	8
16963	55	25	2026-07-01 09:00:00+00	8
16964	55	25	2026-07-01 14:00:00+00	8
16965	55	25	2026-07-02 09:00:00+00	8
16966	55	25	2026-07-02 14:00:00+00	8
16967	55	25	2026-07-03 09:00:00+00	8
16968	55	25	2026-07-03 14:00:00+00	8
16969	55	25	2026-07-06 09:00:00+00	8
16970	55	25	2026-07-06 14:00:00+00	8
16971	55	25	2026-07-07 09:00:00+00	8
16972	55	25	2026-07-07 14:00:00+00	8
16973	55	25	2026-07-08 09:00:00+00	8
16974	55	25	2026-07-08 14:00:00+00	8
16975	55	25	2026-07-09 09:00:00+00	8
16976	55	25	2026-07-09 14:00:00+00	8
16977	55	25	2026-07-10 09:00:00+00	8
16978	55	25	2026-07-10 14:00:00+00	8
16979	56	25	2026-06-29 09:00:00+00	8
16980	56	25	2026-06-29 14:00:00+00	8
16981	56	25	2026-06-30 09:00:00+00	8
16982	56	25	2026-06-30 14:00:00+00	8
16983	56	25	2026-07-01 09:00:00+00	8
16984	56	25	2026-07-01 14:00:00+00	8
16985	56	25	2026-07-02 09:00:00+00	8
16986	56	25	2026-07-02 14:00:00+00	8
16987	56	25	2026-07-03 09:00:00+00	8
16988	56	25	2026-07-03 14:00:00+00	8
16989	56	25	2026-07-06 09:00:00+00	8
16990	56	25	2026-07-06 14:00:00+00	8
16991	56	25	2026-07-07 09:00:00+00	8
16992	56	25	2026-07-07 14:00:00+00	8
16993	56	25	2026-07-08 09:00:00+00	8
16994	56	25	2026-07-08 14:00:00+00	8
16995	56	25	2026-07-09 09:00:00+00	8
16996	56	25	2026-07-09 14:00:00+00	8
16997	56	25	2026-07-10 09:00:00+00	8
16998	56	25	2026-07-10 14:00:00+00	8
16999	57	25	2026-06-29 09:00:00+00	8
17000	57	25	2026-06-29 14:00:00+00	8
17001	57	25	2026-06-30 09:00:00+00	8
17002	57	25	2026-06-30 14:00:00+00	8
17003	57	25	2026-07-01 09:00:00+00	8
17004	57	25	2026-07-01 14:00:00+00	8
17005	57	25	2026-07-02 09:00:00+00	8
17006	57	25	2026-07-02 14:00:00+00	8
17007	57	25	2026-07-03 09:00:00+00	8
17008	57	25	2026-07-03 14:00:00+00	8
17009	57	25	2026-07-06 09:00:00+00	8
17010	57	25	2026-07-06 14:00:00+00	8
17011	57	25	2026-07-07 09:00:00+00	8
17012	57	25	2026-07-07 14:00:00+00	8
17013	57	25	2026-07-08 09:00:00+00	8
17014	57	25	2026-07-08 14:00:00+00	8
17015	57	25	2026-07-09 09:00:00+00	8
17016	57	25	2026-07-09 14:00:00+00	8
17017	57	25	2026-07-10 09:00:00+00	8
17018	57	25	2026-07-10 14:00:00+00	8
\.


--
-- Data for Name: epic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.epic (id, sigle, nom, categorie, type, description, actif, cree_le) FROM stdin;
4	ECOLOH	Établissement de Gestion de l'Oued El Harrach	environnement_nettoiement	local	Gestion, aménagement et promotion du cours d'eau de l'Oued El Harrach	f	2026-06-25 17:35:13.005141+00
5	HURBAL	Établissement d'Hygiène Urbaine d'Alger	environnement_nettoiement	local	Dératisation, désinfection et démoustication sur le territoire de la Wilaya	f	2026-06-25 17:35:13.005141+00
6	AND	Agence Nationale des Déchets	environnement_nettoiement	national	Planification et traitement des déchets à l'échelle nationale	f	2026-06-25 17:35:13.005141+00
7	ASROUT	Établissement de Maintenance de la Voirie Urbaine d'Alger	voirie_eclairage_urbanisme	local	Maintenance des routes, bitumage, curage des avaloirs et réseaux pluviaux	f	2026-06-25 17:35:13.005141+00
9	RFVA	Régie Foncière de la Ville d'Alger	voirie_eclairage_urbanisme	local	Gestion du patrimoine immobilier de la wilaya, marchés publics et parkings	f	2026-06-25 17:35:13.005141+00
10	ANRU	Agence Nationale de la Rénovation Urbaine	voirie_eclairage_urbanisme	national	Réhabilitation du vieux bâti et rénovation des quartiers dégradés	f	2026-06-25 17:35:13.005141+00
11	AADL	Agence Nationale de l'Amélioration et du Développement du Logement	logement_infrastructure	national	Programme de logement Location-Vente	f	2026-06-25 17:35:13.005141+00
12	OPGI-HD	Office de Promotion et de Gestion Immobilière — Hussein Dey	logement_infrastructure	local	Logement social — périmètre nord-est d'Alger	f	2026-06-25 17:35:13.005141+00
13	OPGI-BMR	Office de Promotion et de Gestion Immobilière — Bir Mourad Raïs	logement_infrastructure	local	Logement social — périmètre centre-sud d'Alger	f	2026-06-25 17:35:13.005141+00
14	OPGI-DEB	Office de Promotion et de Gestion Immobilière — Dar El Beïda	logement_infrastructure	local	Logement social — périmètre est d'Alger	f	2026-06-25 17:35:13.005141+00
15	ANESRIF	Agence Nationale d'Études et de Suivi des Investissements Ferroviaires	logement_infrastructure	national	Maîtrise d'ouvrage déléguée pour les projets ferroviaires	f	2026-06-25 17:35:13.005141+00
16	ADA	Algérienne des Autoroutes	logement_infrastructure	national	Exploitation et maintenance du réseau autoroutier national	f	2026-06-25 17:35:13.005141+00
17	SEAAL	Société des Eaux et de l'Assainissement d'Alger	eau_energie	local	Distribution d'eau potable et traitement des eaux usées — Alger et Tipaza	f	2026-06-25 17:35:13.005141+00
1	NETCOM	EPIC de Nettoiement — Propreté Centre	environnement_nettoiement	local	Collecte des déchets ménagers et nettoiement — zones Centre d'Alger	t	2026-06-25 17:35:13.005141+00
2	EXTRANET	EPIC de Gestion des Déchets — Propreté Périphérie	environnement_nettoiement	local	Gestion des déchets ménagers — zones périphériques d'Alger	t	2026-06-25 17:35:13.005141+00
3	EDEVAL	EPIC de Développement des Espaces Verts d'Alger	environnement_nettoiement	local	Aménagement, entretien et gestion des espaces verts de la Wilaya	t	2026-06-25 17:35:13.005141+00
8	ERMA	EPIC du Réseau d'Éclairage Public et des Feux Tricolores	voirie_eclairage_urbanisme	local	Entretien et modernisation de l'éclairage public et signalisation lumineuse	t	2026-06-25 17:35:13.005141+00
18	ANTB	Agence Nationale des Barrages et Transferts	eau_energie	national	Coordination hydraulique nationale — barrages et transferts interrégionaux	f	2026-06-25 17:35:13.005141+00
19	ALNAFT	Agence Nationale pour la Valorisation des Ressources en Hydrocarbures	eau_energie	national	Régulation et valorisation des ressources en hydrocarbures	f	2026-06-25 17:35:13.005141+00
20	ALGPOST	Algérie Poste	services_transports	national	Gestion des services postaux et réseau de comptes courants CCP	f	2026-06-25 17:35:13.005141+00
21	EMA	Entreprise du Métro d'Alger	services_transports	local	Exploitation des lignes de métro, tramway et téléphériques d'Alger	f	2026-06-25 17:35:13.005141+00
22	SNTF	Société Nationale des Transports Ferroviaires	services_transports	national	Transport ferroviaire de voyageurs et de marchandises	f	2026-06-25 17:35:13.005141+00
23	SOGRAL	Société de Gestion de la Gare Routière d'Alger	services_transports	local	Gestion de la gare routière du Caroubier et des gares nationales	f	2026-06-25 17:35:13.005141+00
24	PRESCO	Établissement de Gestion des Jardins d'Enfants et Crèches Publiques	social_artisanat	local	Gestion des structures d'accueil de la petite enfance de la Wilaya	f	2026-06-25 17:35:13.005141+00
25	CACVA	Centre d'Apprentissage Coupe, Couture et Broderie d'Art	social_artisanat	local	Formation et insertion professionnelle — artisanat textile	f	2026-06-25 17:35:13.005141+00
26	OGEBC	Office National de Gestion des Biens Culturels Protégés	culture_medias_tourisme	national	Gestion de la Casbah d'Alger et des monuments historiques classés	f	2026-06-25 17:35:13.005141+00
27	ONCI	Office National de la Culture et de l'Information	culture_medias_tourisme	national	Organisation des événements culturels et gestion des infrastructures	f	2026-06-25 17:35:13.005141+00
28	ANEP	Agence Nationale d'Édition et de Publicité	culture_medias_tourisme	national	Gestion publicitaire étatique et édition officielle	f	2026-06-25 17:35:13.005141+00
29	APS	Algérie Presse Service	culture_medias_tourisme	national	Agence de presse officielle nationale	f	2026-06-25 17:35:13.005141+00
30	EGCTU	EPIC de Gestion de la Circulation et des Transports Urbains	voirie_eclairage_urbanisme	local	Gestion de la circulation routière, feux tricolores et signalisation — Wilaya d'Alger	t	2026-06-26 14:03:22.91926+00
31	EPIC-PARKINGS	EPIC de Gestion des Parkings et Stationnement	voirie_eclairage_urbanisme	local	Gestion du stationnement public et des parkings de la Wilaya d'Alger	t	2026-06-26 14:03:22.927569+00
32	CET	EPIC de Gestion des Centres d'Enfouissement Technique	environnement_nettoiement	local	Gestion des centres d'enfouissement technique et traitement final des déchets	t	2026-06-26 14:03:22.935855+00
\.


--
-- Data for Name: icua_snapshot; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.icua_snapshot (id, commune_id, date_calcul, proprete, reactivite, vivre_ensemble, fluidite, engagement, icua_global) FROM stdin;
\.


--
-- Data for Name: iqep; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.iqep (parc_id, note_auto, note_manuelle, sc_espaces_verts, sc_equipements, sc_proprete, sc_eclairage, sc_securite, sc_satisfaction, maj_le, maj_par) FROM stdin;
3	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.333265+00	\N
4	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.362885+00	\N
5	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.371087+00	\N
6	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.378965+00	\N
7	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.387024+00	\N
2	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.395286+00	\N
8	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.403346+00	\N
1	100	\N	\N	\N	\N	\N	\N	\N	2026-06-27 13:11:30.41192+00	\N
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
7	1
7	2
7	3
7	4
7	5
7	6
7	7
7	8
7	9
7	10
7	11
7	12
7	13
8	14
8	15
8	16
8	17
8	18
8	19
8	20
8	21
8	22
8	23
8	24
8	25
8	26
8	27
8	28
8	29
8	30
8	31
8	32
8	33
8	34
8	35
8	36
8	37
8	38
8	39
8	40
8	41
8	42
8	43
8	44
8	45
8	46
8	47
8	48
8	49
8	50
8	51
8	52
8	53
8	54
8	55
8	56
8	57
9	56
9	57
\.


--
-- Data for Name: parc; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.parc (id, nom, commune_id, lat, lng, superficie, actif, cree_le) FROM stdin;
3	Parc Dounia	50	36.714	3.216	15	t	2026-06-26 16:15:17.302523+00
4	Bois des Arcades	9	36.775	2.98	12	t	2026-06-26 16:15:17.302523+00
5	Parc Zoologique de Ben Aknoun	17	36.76	3.01	10	t	2026-06-26 16:15:17.302523+00
6	Jardin public de Bir Mourad Raïs	9	36.737	3.035	3	t	2026-06-26 16:15:17.302523+00
7	Parc des Grands Vents	16	36.753	2.974	6	t	2026-06-26 16:15:17.302523+00
2	Parc de la Liberté (Galland)	10	36.7565	3.0432	8	t	2026-06-26 16:15:17.302523+00
8	Square Port-Saïd	1	36.761	3.056	2	t	2026-06-26 16:15:17.302523+00
1	Jardin d'Essai du Hamma	5	36.7468	3.0698	32	t	2026-06-26 16:15:17.302523+00
\.


--
-- Data for Name: parking_encaissement; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.parking_encaissement (id, parking_zone_id, montant, duree_minutes, date_heure, type_encaisseur, encaisseur_ref, justificatif_type, justificatif_numero, numero_sequence, plaque, citoyen_id, cree_le) FROM stdin;
\.


--
-- Data for Name: parking_extension; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.parking_extension (id, parking_zone_id, type_extension, identifiant, actif, config_json, cree_le) FROM stdin;
\.


--
-- Data for Name: parking_zone; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.parking_zone (id, nom, commune_id, type, lat, lng, places_total, tarif_horaire, places_resident, places_pmr, places_livraison, places_transit, actif, cree_le) FROM stdin;
1	Rue Didouche Mourad	1	bleue	36.7623	3.058	40	50.00	\N	2	\N	38	t	2026-06-26 22:01:28.854302+00
2	Place des Martyrs	1	rouge	36.7867	3.0607	0	\N	\N	0	\N	0	t	2026-06-26 22:01:28.854302+00
3	Bd Amirouche	1	bleue	36.77	3.0575	30	50.00	\N	2	\N	28	t	2026-06-26 22:01:28.854302+00
4	Rue Hassiba Ben Bouali	1	jaune	36.758	3.054	10	30.00	\N	0	\N	0	t	2026-06-26 22:01:28.854302+00
5	Stade 20 Août — abords	5	blanche	36.744	3.073	60	\N	\N	3	\N	57	t	2026-06-26 22:01:28.854302+00
6	Gare Hussein Dey	5	bleue	36.741	3.077	25	40.00	\N	2	\N	23	t	2026-06-26 22:01:28.854302+00
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
8	16501501-e6cf-4cf0-8774-b71c2700ee4a	10	Signalement créé	signalement	d574932e-da13-4786-8d78-03cacff43551	2026-06-26 14:26:40.853695+00
9	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	10	Signalement créé	signalement	08dc3504-a19d-4a16-b70a-d696c1f0f1b1	2026-06-26 14:26:40.853695+00
10	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	Signalement créé	signalement	ce17aad3-47b0-4dcc-80f0-0affdf8e0620	2026-06-26 14:26:40.853695+00
11	a3b964e8-3134-4363-9215-018cad658683	10	Signalement créé	signalement	05688d38-d801-4b3e-8cb2-748d4c2403e2	2026-06-26 14:26:40.853695+00
12	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	Signalement créé	signalement	f3e5d50a-8ae8-4ae6-bf79-9e3f371f7ab1	2026-06-26 14:26:40.853695+00
13	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	10	Signalement créé	signalement	d4406aed-aac7-4d46-b26b-54ca019b6b77	2026-06-26 14:26:40.853695+00
14	1404babd-7cd2-496c-9a8b-9053c6281e08	10	Signalement créé	signalement	f8bb0cfa-e2ed-4fa2-94d3-0d2a61129a01	2026-06-26 14:26:40.853695+00
15	7d4728bf-a385-42aa-8759-83c2778003b9	10	Signalement créé	signalement	590b840e-71af-452c-889d-ce3d11af5134	2026-06-26 14:26:40.853695+00
16	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	Signalement créé	signalement	27cb76bd-4333-4991-a65c-15ad3e0c8ab3	2026-06-26 14:26:40.853695+00
17	4b362ddd-aa53-4f20-bf93-dc342b618846	10	Signalement créé	signalement	9a66f502-d6d3-4f62-9b74-f76ec1497f87	2026-06-26 14:26:40.853695+00
18	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement créé	signalement	d5cb784e-fd95-4362-bbd9-73c9ed7cb97d	2026-06-26 14:26:40.853695+00
19	16501501-e6cf-4cf0-8774-b71c2700ee4a	10	Signalement créé	signalement	82ad7c72-e5ba-4682-8f67-96ba6b4b62bc	2026-06-26 14:26:40.853695+00
20	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	10	Signalement créé	signalement	d05d0159-6aee-48ea-bd91-017619a2c00d	2026-06-26 14:26:40.853695+00
21	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	Signalement créé	signalement	ff27f113-d9ac-48bb-83f8-cc0359abc114	2026-06-26 14:26:40.853695+00
22	a3b964e8-3134-4363-9215-018cad658683	10	Signalement créé	signalement	ba783f97-4c78-4e82-a9d3-2249b5154c2c	2026-06-26 14:26:40.853695+00
23	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	Signalement créé	signalement	2067fc09-ac7e-4606-98c9-9aaaf894cc3a	2026-06-26 14:26:40.853695+00
24	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	10	Signalement créé	signalement	877a4798-cacf-4a34-be98-9e4d6c4795eb	2026-06-26 14:26:40.853695+00
25	1404babd-7cd2-496c-9a8b-9053c6281e08	10	Signalement créé	signalement	fbe4dfd7-9e2a-4bbe-ab52-96b611940492	2026-06-26 14:26:40.853695+00
26	7d4728bf-a385-42aa-8759-83c2778003b9	10	Signalement créé	signalement	ec59954b-f706-476e-a370-35cee940045f	2026-06-26 14:26:40.853695+00
27	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	Signalement créé	signalement	f4017312-776f-4ecd-84f6-687d8de17982	2026-06-26 14:26:40.853695+00
28	4b362ddd-aa53-4f20-bf93-dc342b618846	10	Signalement créé	signalement	43515d41-03f2-4655-b8d9-c21b8311c2f3	2026-06-26 14:26:40.853695+00
29	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement créé	signalement	f1587a35-f380-4676-8235-6403dd79a1a5	2026-06-26 14:26:40.853695+00
30	16501501-e6cf-4cf0-8774-b71c2700ee4a	10	Signalement créé	signalement	34427d79-6eb1-4a61-823e-c98c40019944	2026-06-26 14:26:40.853695+00
31	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	10	Signalement créé	signalement	01b95aa3-054f-4a6d-843d-d9755a6a8feb	2026-06-26 14:26:40.853695+00
32	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	Signalement créé	signalement	c5318610-17ae-42ec-9b01-4d62cc0e20a5	2026-06-26 14:26:40.853695+00
33	a3b964e8-3134-4363-9215-018cad658683	10	Signalement créé	signalement	6648c60e-4006-4fac-a342-f7a570b3bd12	2026-06-26 14:26:40.853695+00
34	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	Signalement créé	signalement	9198865b-ee30-426c-b598-3d140ea436c0	2026-06-26 14:26:40.853695+00
35	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	10	Signalement créé	signalement	fb13e7dc-c9b0-42fc-b04a-1792cb768f6b	2026-06-26 14:26:40.853695+00
36	1404babd-7cd2-496c-9a8b-9053c6281e08	10	Signalement créé	signalement	d4ff86e1-4fc1-4f28-ba81-fb022ac52b54	2026-06-26 14:26:40.853695+00
37	7d4728bf-a385-42aa-8759-83c2778003b9	10	Signalement créé	signalement	58de83c1-1804-474e-8aea-a9d7d3fd4278	2026-06-26 14:26:40.853695+00
38	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	Signalement créé	signalement	c919c77e-a962-4f84-b809-f9d268162e4d	2026-06-26 14:26:40.853695+00
39	4b362ddd-aa53-4f20-bf93-dc342b618846	10	Signalement créé	signalement	6e75f21d-d41e-4b09-b466-85f9c2621ffc	2026-06-26 14:26:40.853695+00
40	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement créé	signalement	18b343b3-5efc-4a5f-aa0e-770a44f90c2b	2026-06-26 14:26:40.853695+00
41	16501501-e6cf-4cf0-8774-b71c2700ee4a	10	Signalement créé	signalement	332bdba4-097f-4d30-830e-884173d78f25	2026-06-26 14:26:40.853695+00
42	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	10	Signalement créé	signalement	b6e8c4ea-14c7-45f1-a938-c144c2a39881	2026-06-26 14:26:40.853695+00
43	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	Signalement créé	signalement	3b089cbf-fc73-4b06-bfa0-fd5ec57ae680	2026-06-26 14:26:40.853695+00
44	a3b964e8-3134-4363-9215-018cad658683	10	Signalement créé	signalement	1822db1d-c70f-422b-9407-b399744d2cc2	2026-06-26 14:26:40.853695+00
45	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	Signalement créé	signalement	0877089b-94ee-420b-a0c5-6cb758e375a1	2026-06-26 14:26:40.853695+00
46	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	10	Signalement créé	signalement	a4c924ac-658d-4a84-9f12-ff5e0094c776	2026-06-26 14:26:40.853695+00
47	1404babd-7cd2-496c-9a8b-9053c6281e08	10	Signalement créé	signalement	4ce53251-9f0a-4730-9eb5-336fd3174bf7	2026-06-26 14:26:40.853695+00
48	16501501-e6cf-4cf0-8774-b71c2700ee4a	10	Signalement créé	signalement	6f0a3d6e-791b-4796-b870-785fe5794e2b	2026-06-26 14:26:40.853695+00
49	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	10	Signalement créé	signalement	ae632668-f84e-4fc9-9d66-997c18e9cac8	2026-06-26 14:26:40.853695+00
50	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	Signalement créé	signalement	201c38d0-8392-426f-a7ab-362b39b11c27	2026-06-26 14:26:40.853695+00
51	a3b964e8-3134-4363-9215-018cad658683	10	Signalement créé	signalement	3f06abe3-cc40-4207-a4c7-0f5978534a74	2026-06-26 14:26:40.853695+00
52	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	Signalement créé	signalement	3db6ae7e-9ca1-4868-aaef-d7117cf574f5	2026-06-26 14:26:40.853695+00
53	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	10	Signalement créé	signalement	8e2e604c-48cf-40ad-bca5-10a91a0f102b	2026-06-26 14:26:40.853695+00
54	1404babd-7cd2-496c-9a8b-9053c6281e08	10	Signalement créé	signalement	9b9c0fda-b68c-49d6-b3ba-459bbdbe9283	2026-06-26 14:26:40.853695+00
55	7d4728bf-a385-42aa-8759-83c2778003b9	10	Signalement créé	signalement	959fb220-d3f2-43f3-a473-1c47ce1f23d4	2026-06-26 14:26:40.853695+00
56	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	Signalement créé	signalement	4dd221bc-e162-4aa3-a70b-f8d6189bb654	2026-06-26 14:26:40.853695+00
57	4b362ddd-aa53-4f20-bf93-dc342b618846	10	Signalement créé	signalement	c072b7da-1c31-4196-b821-0cb6b8921866	2026-06-26 14:26:40.853695+00
58	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement créé	signalement	28ad282a-b222-431e-8d2f-658a6e12d0f0	2026-06-26 14:26:40.853695+00
59	16501501-e6cf-4cf0-8774-b71c2700ee4a	10	Signalement créé	signalement	38e7aaf3-7be3-4866-b70a-3dc07370828f	2026-06-26 14:26:40.853695+00
60	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	10	Signalement créé	signalement	b7a24839-87b6-416e-9ad5-5ef2dcb8c1d6	2026-06-26 14:26:40.853695+00
61	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	Signalement créé	signalement	090f53e7-eacd-4e3c-98aa-8f43bd36109f	2026-06-26 14:26:40.853695+00
62	a3b964e8-3134-4363-9215-018cad658683	10	Signalement créé	signalement	a5a77be5-64fa-4c15-8496-ce271ee83daf	2026-06-26 14:26:40.853695+00
63	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	Signalement créé	signalement	10964b1a-6695-4470-b7a1-9ce9c360db74	2026-06-26 14:26:40.853695+00
64	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	10	Signalement créé	signalement	325d9865-1131-438a-b455-c4a65cc825c3	2026-06-26 14:26:40.853695+00
65	1404babd-7cd2-496c-9a8b-9053c6281e08	10	Signalement créé	signalement	f68ae9c9-c6e0-4f1c-ad84-3acde065546e	2026-06-26 14:26:40.853695+00
66	7d4728bf-a385-42aa-8759-83c2778003b9	10	Signalement créé	signalement	fbf04730-5f24-4f47-ba86-4524961effc2	2026-06-26 14:26:40.853695+00
67	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	Signalement créé	signalement	e84ae023-6a3a-4e75-a085-c42131b20b65	2026-06-26 14:26:40.853695+00
72	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	10	Signalement créé	signalement	99198fae-d96f-4923-be9f-b8bf916ce975	2026-06-27 12:03:51.533351+00
\.


--
-- Data for Name: rdv; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.rdv (id, creneau_id, citoyen_id, numero_ticket, statut, cree_le, maj_le, public_prioritaire, note_satisfaction, rdv_honore, delai_respecte, commentaire_eval, evalue_le) FROM stdin;
8f48f01e-e031-46b9-967c-25efd2848674	184	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
c8513b2e-c385-4618-abb3-0a8d405ff5b4	252	a3b964e8-3134-4363-9215-018cad658683	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
47f34490-71aa-40d8-b13b-f885889ef432	147	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
d773c041-ffef-4d17-aa7e-84d86a46cbe0	183	16501501-e6cf-4cf0-8774-b71c2700ee4a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
a3719338-1099-40de-8b1b-34dd7f29cbd8	217	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
7abfd137-21a1-408a-8c3c-da4dd2f227ab	220	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
4ce6854f-cd0d-4011-8bb5-ce3829ff7171	79	1404babd-7cd2-496c-9a8b-9053c6281e08	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
f2412a7c-8b8d-4221-a67b-e3c674b14f1c	113	7d4728bf-a385-42aa-8759-83c2778003b9	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
77d480b3-f3da-4b15-95ad-13a91878b41c	148	4b362ddd-aa53-4f20-bf93-dc342b618846	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
d890f4c1-3a32-413b-8d0b-d274440fc56e	182	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
06cd344b-a2f6-4600-9689-87489573ffd9	114	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
1587f7c5-4c9f-4eda-b9ef-eb065041d657	185	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
81dee67b-9c7b-43ee-9a5e-1fe1b809d1b5	218	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
f1c845c5-da6b-4f09-ab67-971e2a910786	219	a3b964e8-3134-4363-9215-018cad658683	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
2f517904-1799-4176-a760-61345a7f2161	10	a3b964e8-3134-4363-9215-018cad658683	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
f56273d8-3587-4f8c-9e25-10cd1e58dde0	78	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
9f130177-e220-4408-a1ce-8b0fe3cd7600	7	16501501-e6cf-4cf0-8774-b71c2700ee4a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
5ac8300a-4e02-47d2-9d6e-d6387e91a43d	77	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
4a03a2ad-6e02-47ae-b770-ccb3138af465	8	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
ac16b03e-e809-4802-b181-1a0f7093d0e3	112	1404babd-7cd2-496c-9a8b-9053c6281e08	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
139038cc-d34a-4b88-9548-a97d0a776eef	149	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
2214b45e-820f-47ba-9c7c-cd20f882ae8c	150	16501501-e6cf-4cf0-8774-b71c2700ee4a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
16cca1c6-733a-492c-b2e3-a52dc6f06ca5	9	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
1395fa07-765c-45c7-b273-ad84313ff119	42	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
47204860-e121-41ed-9e82-4488a13389c6	43	a3b964e8-3134-4363-9215-018cad658683	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
7b390f3c-b2d8-4d31-af5a-5539973088bb	44	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
ec1b3711-750b-4c5c-be03-e29355464f85	45	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
40a27708-64fe-4f57-b255-f2c761e65f7b	115	4b362ddd-aa53-4f20-bf93-dc342b618846	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
4dba76a2-33eb-4a43-a2e7-ad20913fdd76	80	7d4728bf-a385-42aa-8759-83c2778003b9	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
625fd37b-d60a-461b-9979-573cdec14cac	253	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.service (id, nom, famille, duree_min, categorie, description, pieces_requises, formulaires, frais, delai_reel, assistant_questions) FROM stdin;
13	Permis de construire	B	60	urbanisme	Demande de permis de construire auprès de l'APC	["Demande manuscrite adressée au P/APC", "Acte de propriété ou certificat de possession", "Plan de situation et plan de masse", "Plans architecturaux (façades, coupes, niveaux)", "Certificat d'urbanisme (CU) en cours de validité", "Étude de sol (si exigée)", "Photos du terrain", "Copie de la carte nationale d'identité"]	["Formulaire CERFA permis de construire (à retirer à l'APC)"]	Variable selon surface — à vérifier au guichet	2 à 6 mois (instruction + commissions techniques)	[{"q": "Êtes-vous propriétaire du terrain ?", "non": "Vous devez d'abord obtenir un acte de propriété ou un certificat de possession.", "oui": "next"}, {"q": "Avez-vous un certificat d'urbanisme (CU) en cours de validité ?", "non": "Demandez d'abord un certificat d'urbanisme — démarche disponible ci-dessous.", "oui": "next"}, {"q": "Avez-vous fait réaliser les plans par un architecte agréé ?", "non": "Les plans architecturaux sont obligatoires. Consultez un architecte agréé.", "oui": "next"}]
17	Certificat d'urbanisme	B	30	urbanisme	Renseigne sur les règles d'urbanisme applicables à un terrain	["Demande manuscrite", "Plan de situation du terrain", "Copie de l'acte de propriété", "Copie CNI"]	["Formulaire de demande CU (APC)"]	Gratuit	1 à 3 mois	[{"q": "Êtes-vous propriétaire ou mandataire du propriétaire ?", "non": "Procuration ou mandat nécessaire.", "oui": "next"}]
18	Certificat de conformité	B	30	urbanisme	Atteste la conformité d'une construction au permis de construire délivré	["Demande manuscrite", "Copie du permis de construire", "PV de réception des travaux", "Plans de récolement", "Copie CNI"]	["Formulaire de demande (APC)"]	Variable selon surface	2 à 4 mois (visite de conformité incluse)	[{"q": "Avez-vous un permis de construire valide pour cette construction ?", "non": "Le permis de construire est un pré-requis.", "oui": "next"}]
19	Livret foncier	B	45	urbanisme	Document officiel attestant la propriété d'un bien immobilier	["Acte de propriété (notarié ou administratif)", "Copie CNI", "Extrait de naissance", "Plan cadastral", "Certificat négatif d'hypothèque"]	["Formulaire de demande (Conservation foncière)"]	Timbres fiscaux + frais Conservation foncière	3 à 12 mois (selon charge Conservation foncière)	[{"q": "Disposez-vous d'un acte de propriété notarié ?", "non": "Vous devez d'abord faire établir un acte par un notaire.", "oui": "next"}]
20	Suivi dossier AADL	B	30	logement	Consultation et suivi de dossier programme AADL auprès de l'APC	["Récépissé de dépôt AADL", "Copie CNI", "Attestation de non-propriété"]	[]	Gratuit	Réponse immédiate (consultation) — décision AADL : délais variables	[{"q": "Avez-vous déjà déposé un dossier AADL ?", "non": "Déposez d'abord votre dossier sur le portail AADL (aadl.com.dz).", "oui": "next"}]
21	Recours logement social	B	30	logement	Dépôt de recours ou réclamation concernant l'attribution de logement social	["Demande manuscrite motivée", "Copie CNI", "Attestation de résidence", "Justificatifs de situation (revenus, famille)", "Copies des courriers précédents"]	["Formulaire de recours (APC)"]	Gratuit	1 à 6 mois (commission daïra)	[]
22	Certificat de bonne vie et mœurs	B	15	certificats	Certificat délivré par l'APC attestant l'absence de condamnation	["Copie CNI", "Extrait de naissance", "2 photos d'identité", "Timbre fiscal"]	[]	Timbre fiscal 100 DA	Délivrance immédiate ou sous 48h	[]
23	Attestation de changement de résidence	B	20	certificats	Attestation officielle pour changement de domicile entre communes	["Copie CNI", "Ancien certificat de résidence", "Nouveau justificatif de domicile (quittance/contrat)", "Extrait de naissance"]	[]	Gratuit	Sous 48h à 1 semaine	[]
24	Enrôlement biométrique CNI	B	30	biometrique	RDV pour enrôlement biométrique (prise d'empreintes et photo) — carte nationale d'identité	["Extrait de naissance spécial (S12)", "Certificat de résidence de moins de 3 mois", "Ancien document d'identité (si renouvellement)", "2 photos biométriques", "Timbre fiscal"]	[]	Timbre fiscal 2000 DA (première) / 4000 DA (renouvellement)	15 à 45 jours après enrôlement	[{"q": "Est-ce une première demande ou un renouvellement ?", "non": "next", "oui": "Si renouvellement, munissez-vous de votre ancien document."}]
25	Enrôlement biométrique Passeport	B	30	biometrique	RDV pour enrôlement biométrique — passeport biométrique	["Extrait de naissance spécial (S12)", "Certificat de résidence", "CNI biométrique en cours de validité", "2 photos biométriques", "Timbre fiscal", "Ancien passeport (si renouvellement)"]	[]	Timbre fiscal 6000 DA (28 pages) / 12000 DA (48 pages)	15 à 30 jours après enrôlement	[]
12	Passeport	B	45	biometrique	RDV pour démarches passeport (enrôlement déjà couvert par service dédié)	["Voir Enrôlement biométrique Passeport"]	[]	\N	15 à 30 jours	[]
14	Légalisation de signature	B	15	certificats	Légalisation de signature de documents officiels	["Document à légaliser", "Copie CNI", "Présence physique obligatoire"]	[]	Gratuit	Immédiat	[]
15	Carte d'invalidité	B	30	certificats	Démarche pour obtention de la carte d'invalidité	["Certificat médical", "Copie CNI", "Photos d'identité", "Dossier médical"]	[]	Gratuit	1 à 3 mois (commission médicale)	[]
9	Extrait de naissance	A	0	etat_civil	Disponible en ligne sur le portail national	[]	[]	\N	Immédiat (en ligne)	[]
10	Certificat de résidence	A	0	etat_civil	Disponible en ligne sur le portail national	[]	[]	\N	Immédiat (en ligne)	[]
11	Carte nationale d'identité	A	0	identite	Demande via portail national CNIEC	[]	[]	\N	15 à 45 jours	[]
16	Fiche familiale	A	0	etat_civil	Disponible en ligne sur le portail national	[]	[]	\N	Immédiat (en ligne)	[]
\.


--
-- Data for Name: signalement; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.signalement (id, reference, domaine, categorie_id, citoyen_id, commune_id, operateur_id, lat, lng, description, photo_path, etat, preuve_path, cree_le, resolu_le, epic_id, parc_id, gravite, nb_confirmations) FROM stdin;
99198fae-d96f-4923-be9f-b8bf916ce975	PRO-AFZHTSK4	proprete	15	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	1	7	36.755235	3.065271	Un arbre risque de s'effondrer? urgence. voir la photo	\N	recu	\N	2026-06-27 12:03:51.533351+00	\N	\N	\N	degradation	0
56ca7610-fd09-462a-88a9-e3cb240f231e	PRO-ALG003	proprete	5	\N	2	7	36.7358	3.068	Nid de poule dangereux avenue de la Bouzareah	\N	transmis	\N	2026-06-17 17:41:06.880348+00	\N	\N	\N	degradation	0
368327c4-9935-43eb-acae-c53c09692116	PRO-ALG004	proprete	6	\N	4	7	36.784	3.06	Éclairage défaillant ruelle de la Casbah	\N	recu	\N	2026-06-23 17:41:06.880348+00	\N	\N	\N	degradation	0
c5b5c3dd-c8d2-4728-9c35-4348dab9e842	PRO-ALG005	proprete	3	\N	7	8	36.772	3.0441	Encombrants abandonnés rue Tripoli Bab El Oued	\N	resolu	\N	2026-06-05 17:41:06.880348+00	2026-06-11 17:41:06.880348+00	\N	\N	degradation	0
5659229c-7ff6-4559-b642-1e326d905f45	PRO-ALG006	proprete	4	\N	3	7	36.721	3.055	Graffitis sur le mur de l'école El Madania	\N	transmis	\N	2026-06-19 17:41:06.880348+00	\N	\N	\N	degradation	0
4a9b3e88-bf06-4f5c-988b-afe1c6b2e7a0	PRO-ALG007	proprete	1	\N	9	8	36.6985	3.078	Dépôt sauvage carrefour Bir Mourad Raïs	\N	en_intervention	\N	2026-06-22 17:41:06.880348+00	\N	\N	\N	degradation	0
f4dd1d58-d50d-48e7-b6d1-daddfb82fe97	PRO-ALG008	proprete	2	\N	5	7	36.741	3.109	Benne saturée avenue des Frères Bouadou Hussein Dey	\N	recu	\N	2026-06-24 17:41:06.880348+00	\N	\N	\N	degradation	0
52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	PRO-ALG009	proprete	5	\N	12	8	36.755	3.042	Voirie dégradée El Mouradia près de la wilaya	\N	resolu	\N	2026-05-26 17:41:06.880348+00	2026-06-03 17:41:06.880348+00	\N	\N	degradation	0
a44c1b61-3670-439d-8dca-f4c4b6ebb8b5	PRO-ALG010	proprete	6	\N	11	7	36.763	3.035	Lampadaires éteints boulevard El Biar	\N	transmis	\N	2026-06-21 17:41:06.880348+00	\N	\N	\N	degradation	0
039da10a-dd9d-41e1-ad11-65fefc489239	EAU-ALG002	eau	9	\N	4	9	36.785	3.061	Coupure d'eau totale quartier haute Casbah depuis 48h	\N	en_intervention	\N	2026-06-23 17:41:06.916554+00	\N	\N	\N	degradation	0
989eadf9-0ac7-4d6c-a88b-596f220d5102	EAU-ALG003	eau	12	\N	7	9	36.77	3.046	Pression insuffisante rue Montaigne Bab El Oued	\N	recu	\N	2026-06-24 17:41:06.916554+00	\N	\N	\N	degradation	0
8f9ffe38-5cbc-4c0f-b309-8a76c8ebf159	EAU-ALG004	eau	13	\N	2	9	36.734	3.07	Refoulement égout avenue Belouizdad	\N	transmis	\N	2026-06-18 17:41:06.916554+00	\N	\N	\N	degradation	0
943071a6-f3dc-4b79-a568-8ca8d6f828aa	EAU-ALG005	eau	11	\N	5	9	36.746	3.11	Fuite compteur résidence El Amel Hussein Dey	\N	resolu	\N	2026-06-07 17:41:06.916554+00	2026-06-12 17:41:06.916554+00	\N	\N	degradation	0
27cb76bd-4333-4991-a65c-15ad3e0c8ab3	PRO-45C48C	proprete	7	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	7	36.732069244892394	2.999829053768561	Poubelle cassée non remplacée	\N	transmis	\N	2026-06-07 21:44:23.536015+00	\N	\N	\N	degradation	0
98556087-87ee-4ad2-8f74-935bc6c99e7e	PRO-5ITYJ5A2	proprete	1	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	13	7	36.705392726453006	3.0521887923802127	Poubelle sauvage depuis 3 jours	uploads/4199f5244f30ff5caaec6bebe292fc65	recu	\N	2026-06-25 15:12:38.806835+00	\N	\N	\N	degradation	0
73d2c9e7-02ff-4666-98d7-b54f8be86a75	PRO-ALG001	proprete	1	\N	1	7	36.73052934796413	3.0832909087693823	Dépôt sauvage de déchets devant le marché Clauzel	\N	resolu	\N	2026-06-10 17:41:06.880348+00	2026-06-15 17:41:06.880348+00	\N	\N	degradation	0
5b73dc8c-9ca1-464a-bf7e-cb9bd0b8eeb2	PRO-ALG002	proprete	2	\N	1	7	36.73928377881564	3.084123007854906	Benne débordante rue Didouche Mourad	\N	en_intervention	\N	2026-06-20 17:41:06.880348+00	\N	\N	\N	degradation	0
f6296867-9b42-4f8d-9063-ce76413732b2	EAU-ALG001	eau	8	\N	1	9	36.73418837045436	3.092639065890945	Fuite importante rue Ben M'hidi centre	\N	resolu	\N	2026-06-13 17:41:06.916554+00	2026-06-17 17:41:06.916554+00	\N	\N	degradation	0
8d7eea34-6238-4d42-8623-a95f8f3107c6	EAU-ALG006	eau	10	\N	3	9	36.74840744291138	3.067500714156479	Eau jaunâtre signalée dans la cité El Madania	\N	en_intervention	\N	2026-06-22 17:41:06.916554+00	\N	\N	\N	degradation	0
6a52fe9f-0956-4ca9-9ffa-f64e23c25e1d	EAU-ALG007	eau	8	\N	9	13	36.727112311015475	3.063100962379256	Fuite conduite principale Bir Mourad Raïs carrefour RN1	\N	recu	\N	2026-06-25 11:41:06.916554+00	\N	\N	\N	degradation	0
7229529b-bc13-4216-b2b7-e54aa78c5a09	PRO-PX4N2EDO	proprete	2	6a66fe3a-b531-409d-a02b-d8128f581a27	34	7	36.68517829173049	2.9745713032411074	buhuhu	\N	recu	\N	2026-06-25 18:16:28.151191+00	\N	\N	\N	degradation	0
d574932e-da13-4786-8d78-03cacff43551	PRO-C4CA42	proprete	1	16501501-e6cf-4cf0-8774-b71c2700ee4a	2	7	36.749984844012445	3.0913540862409796	Benne débordante rue principale depuis 3 jours	\N	transmis	\N	2026-06-21 12:40:34.579956+00	\N	\N	\N	degradation	0
08dc3504-a19d-4a16-b70a-d696c1f0f1b1	PRO-C81E72	proprete	1	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	3	7	36.74062481162295	3.0683599173579856	Encombrants abandonnés devant immeuble	\N	en_intervention	\N	2026-06-17 03:46:07.985968+00	\N	\N	\N	degradation	0
ce17aad3-47b0-4dcc-80f0-0affdf8e0620	PRO-ECCBC8	proprete	2	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	4	7	36.787271481730514	3.0602485032664286	Tags sur la façade de école primaire	\N	resolu	\N	2026-06-03 03:32:43.775083+00	2026-06-21 23:03:22.326442+00	\N	\N	degradation	0
58de83c1-1804-474e-8aea-a9d7d3fd4278	PRO-34173C	proprete	2	7d4728bf-a385-42aa-8759-83c2778003b9	24	8	36.724782141503404	2.8277919519163963	Nid de poule dangereux sur la chaussée	\N	en_intervention	\N	2026-06-04 17:10:16.669879+00	\N	\N	\N	degradation	0
c919c77e-a962-4f84-b809-f9d268162e4d	PRO-C16A53	proprete	3	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	35	8	36.71651027780113	3.1257717006825323	Lampadaire éteint depuis une semaine	\N	resolu	\N	2026-05-31 23:00:21.022258+00	2026-06-24 16:02:37.597508+00	\N	\N	degradation	0
6e75f21d-d41e-4b09-b466-85f9c2621ffc	PRO-6364D3	proprete	4	4b362ddd-aa53-4f20-bf93-dc342b618846	36	8	36.730333501611845	3.0913070364264796	Déchets verts non ramassés	\N	recu	\N	2026-05-31 09:29:27.220062+00	\N	\N	\N	degradation	0
18b343b3-5efc-4a5f-aa0e-770a44f90c2b	PRO-182BE0	proprete	5	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	43	8	36.676599313025974	3.0961659800944283	Conteneur renversé après passage camion	\N	transmis	\N	2026-06-01 17:31:43.115801+00	\N	\N	\N	degradation	0
332bdba4-097f-4d30-830e-884173d78f25	PRO-E36985	proprete	6	16501501-e6cf-4cf0-8774-b71c2700ee4a	46	8	36.72114504709508	3.185931674451101	Matelas et meubles jetés sur le trottoir	\N	en_intervention	\N	2026-05-29 06:22:30.606217+00	\N	\N	\N	degradation	0
b6e8c4ea-14c7-45f1-a938-c144c2a39881	PRO-1C383C	proprete	7	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	50	8	36.72043693596692	3.222890497515575	Poubelle cassée non remplacée	\N	resolu	\N	2026-05-29 14:01:57.728601+00	2026-06-25 14:37:46.896332+00	\N	\N	degradation	0
05688d38-d801-4b3e-8cb2-748d4c2403e2	PRO-A87FF6	proprete	2	a3b964e8-3134-4363-9215-018cad658683	5	7	36.737060655875254	3.11350641406296	Nid de poule dangereux sur la chaussée	\N	recu	\N	2026-06-22 13:30:12.959588+00	\N	\N	\N	degradation	0
f3e5d50a-8ae8-4ae6-bf79-9e3f371f7ab1	PRO-E4DA3B	proprete	3	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	6	7	36.7747541067464	3.0396173683354992	Lampadaire éteint depuis une semaine	\N	transmis	\N	2026-06-22 21:45:29.587221+00	\N	\N	\N	degradation	0
d4406aed-aac7-4d46-b26b-54ca019b6b77	PRO-167909	proprete	4	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	7	7	36.79100716386085	3.045996746517255	Déchets verts non ramassés	\N	en_intervention	\N	2026-06-11 21:33:28.029659+00	\N	\N	\N	degradation	0
f8bb0cfa-e2ed-4fa2-94d3-0d2a61129a01	PRO-8F14E4	proprete	5	1404babd-7cd2-496c-9a8b-9053c6281e08	8	7	36.79718825768113	3.036374171543005	Conteneur renversé après passage camion	\N	resolu	\N	2026-06-08 12:47:38.446101+00	2026-06-26 12:43:18.064499+00	\N	\N	degradation	0
590b840e-71af-452c-889d-ce3d11af5134	PRO-C9F0F8	proprete	6	7d4728bf-a385-42aa-8759-83c2778003b9	9	7	36.719353642498604	3.0543426375198073	Matelas et meubles jetés sur le trottoir	\N	recu	\N	2026-05-27 15:31:37.045301+00	\N	\N	\N	degradation	0
9a66f502-d6d3-4f62-9b74-f76ec1497f87	PRO-D3D944	proprete	15	4b362ddd-aa53-4f20-bf93-dc342b618846	14	8	36.778296966094736	2.9993127843594998	Arbre mort menaçant de tomber	\N	en_intervention	\N	2026-05-27 20:44:06.299096+00	\N	\N	\N	degradation	0
d5cb784e-fd95-4362-bbd9-73c9ed7cb97d	PRO-6512BD	proprete	16	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	21	8	36.77152644044546	2.9604233480849595	Voitures garées sur le trottoir	\N	resolu	\N	2026-06-05 06:09:54.691187+00	2026-06-22 05:36:52.5232+00	\N	\N	degradation	0
82ad7c72-e5ba-4682-8f67-96ba6b4b62bc	PRO-C20AD4	proprete	17	16501501-e6cf-4cf0-8774-b71c2700ee4a	24	8	36.72569722988023	2.837089469188162	Décharge illicite en bordure de terrain	\N	recu	\N	2026-05-27 20:19:27.869823+00	\N	\N	\N	degradation	0
d05d0159-6aee-48ea-bd91-017619a2c00d	PRO-C51CE4	proprete	1	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	35	8	36.718734293203156	3.125859896553069	Dépôt sauvage derrière le marché couvert	\N	transmis	\N	2026-06-01 15:57:15.81257+00	\N	\N	\N	degradation	0
ff27f113-d9ac-48bb-83f8-cc0359abc114	PRO-AAB323	proprete	1	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	36	8	36.73178847267493	3.096785559135387	Benne débordante rue principale depuis 3 jours	\N	en_intervention	\N	2026-06-03 10:15:42.803948+00	\N	\N	\N	degradation	0
ba783f97-4c78-4e82-a9d3-2249b5154c2c	PRO-9BF31C	proprete	1	a3b964e8-3134-4363-9215-018cad658683	43	8	36.67680640413534	3.1047753972098584	Encombrants abandonnés devant immeuble	\N	resolu	\N	2026-06-18 05:19:41.748253+00	2026-06-22 01:15:42.893711+00	\N	\N	degradation	0
2067fc09-ac7e-4606-98c9-9aaaf894cc3a	PRO-C74D97	proprete	2	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	46	8	36.72408220452935	3.1841786285822327	Tags sur la façade de école primaire	\N	recu	\N	2026-05-30 08:43:40.295019+00	\N	\N	\N	degradation	0
877a4798-cacf-4a34-be98-9e4d6c4795eb	PRO-70EFDF	proprete	2	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	50	8	36.72683187727039	3.2166833831911217	Nid de poule dangereux sur la chaussée	\N	transmis	\N	2026-06-21 01:15:59.273501+00	\N	\N	\N	degradation	0
fbe4dfd7-9e2a-4bbe-ab52-96b611940492	PRO-6F4922	proprete	3	1404babd-7cd2-496c-9a8b-9053c6281e08	1	7	36.732834191359615	3.0920917842259126	Lampadaire éteint depuis une semaine	\N	en_intervention	\N	2026-06-08 22:53:18.477602+00	\N	\N	\N	degradation	0
ec59954b-f706-476e-a370-35cee940045f	PRO-1F0E3D	proprete	4	7d4728bf-a385-42aa-8759-83c2778003b9	2	7	36.74998505770654	3.09536718206268	Déchets verts non ramassés	\N	resolu	\N	2026-06-25 22:56:18.224569+00	2026-06-23 00:23:35.947085+00	\N	\N	degradation	0
f4017312-776f-4ecd-84f6-687d8de17982	PRO-98F137	proprete	5	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	3	7	36.742520384556286	3.0740983356550564	Conteneur renversé après passage camion	\N	recu	\N	2026-06-02 01:13:49.195437+00	\N	\N	\N	degradation	0
43515d41-03f2-4655-b8d9-c21b8311c2f3	PRO-3C59DC	proprete	6	4b362ddd-aa53-4f20-bf93-dc342b618846	4	7	36.78347168943979	3.0650457488912504	Matelas et meubles jetés sur le trottoir	\N	transmis	\N	2026-06-23 18:15:13.723687+00	\N	\N	\N	degradation	0
f1587a35-f380-4676-8235-6403dd79a1a5	PRO-B6D767	proprete	7	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	5	7	36.72919128253347	3.117435679229493	Poubelle cassée non remplacée	\N	en_intervention	\N	2026-06-16 09:39:51.478568+00	\N	\N	\N	degradation	0
34427d79-6eb1-4a61-823e-c98c40019944	PRO-37693C	proprete	15	16501501-e6cf-4cf0-8774-b71c2700ee4a	6	7	36.78129619350178	3.033292955860202	Arbre mort menaçant de tomber	\N	resolu	\N	2026-06-04 18:48:28.321526+00	2026-06-22 03:05:23.793087+00	\N	\N	degradation	0
01b95aa3-054f-4a6d-843d-d9755a6a8feb	PRO-1FF1DE	proprete	16	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	7	7	36.79091191797398	3.04808087405483	Voitures garées sur le trottoir	\N	recu	\N	2026-06-09 22:38:48.165007+00	\N	\N	\N	degradation	0
c5318610-17ae-42ec-9b01-4d62cc0e20a5	PRO-8E296A	proprete	17	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	8	7	36.80792142642324	3.033666314534914	Décharge illicite en bordure de terrain	\N	transmis	\N	2026-06-23 10:56:04.553747+00	\N	\N	\N	degradation	0
6648c60e-4006-4fac-a342-f7a570b3bd12	PRO-4E732C	proprete	1	a3b964e8-3134-4363-9215-018cad658683	9	7	36.72736191306198	3.06726422917416	Dépôt sauvage derrière le marché couvert	\N	en_intervention	\N	2026-06-18 00:05:14.58819+00	\N	\N	\N	degradation	0
9198865b-ee30-426c-b598-3d140ea436c0	PRO-02E74F	proprete	1	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	7	36.746509625230495	3.0216355917457727	Benne débordante rue principale depuis 3 jours	\N	resolu	\N	2026-06-21 07:37:58.028876+00	2026-06-26 10:27:04.973569+00	\N	\N	degradation	0
fb13e7dc-c9b0-42fc-b04a-1792cb768f6b	PRO-33E75F	proprete	1	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	14	8	36.77709764509202	3.0061993817437194	Encombrants abandonnés devant immeuble	\N	recu	\N	2026-06-09 20:25:51.417973+00	\N	\N	\N	degradation	0
d4ff86e1-4fc1-4f28-ba81-fb022ac52b54	PRO-6EA9AB	proprete	2	1404babd-7cd2-496c-9a8b-9053c6281e08	21	8	36.76968750543608	2.957159897732589	Tags sur la façade de école primaire	\N	transmis	\N	2026-06-14 13:56:29.567834+00	\N	\N	\N	degradation	0
3b089cbf-fc73-4b06-bfa0-fd5ec57ae680	PRO-19CA14	proprete	15	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	7	36.72975565963707	3.086815111218332	Arbre mort menaçant de tomber	\N	recu	\N	2026-06-06 09:18:03.637986+00	\N	\N	\N	degradation	0
1822db1d-c70f-422b-9407-b399744d2cc2	PRO-A5BFC9	proprete	16	a3b964e8-3134-4363-9215-018cad658683	2	7	36.742409997480934	3.1011670621229923	Voitures garées sur le trottoir	\N	transmis	\N	2026-05-30 22:28:22.93251+00	\N	\N	\N	degradation	0
0877089b-94ee-420b-a0c5-6cb758e375a1	PRO-A5771B	proprete	17	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	3	7	36.74541249704553	3.0794103220389415	Décharge illicite en bordure de terrain	\N	en_intervention	\N	2026-06-18 10:25:45.318644+00	\N	\N	\N	degradation	0
a4c924ac-658d-4a84-9f12-ff5e0094c776	PRO-D67D8A	proprete	1	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	4	7	36.78954207756645	3.0577718253593114	Dépôt sauvage derrière le marché couvert	\N	resolu	\N	2026-06-22 18:59:56.479522+00	2026-06-22 09:02:53.216198+00	\N	\N	degradation	0
4ce53251-9f0a-4730-9eb5-336fd3174bf7	PRO-D64592	proprete	1	1404babd-7cd2-496c-9a8b-9053c6281e08	5	7	36.73173611363002	3.1179279669583493	Benne débordante rue principale depuis 3 jours	\N	recu	\N	2026-06-05 16:33:04.368399+00	\N	\N	\N	degradation	0
6f0a3d6e-791b-4796-b870-785fe5794e2b	EAU-38B3EF	eau	8	16501501-e6cf-4cf0-8774-b71c2700ee4a	2	9	36.74693304309761	3.098043178384299	Coupure eau depuis ce matin sans préavis	\N	transmis	\N	2026-06-21 01:41:14.538702+00	\N	\N	\N	degradation	0
ae632668-f84e-4fc9-9d66-997c18e9cac8	EAU-EC8956	eau	9	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	5	9	36.7402855716633	3.1215518490573344	Eau marron au robinet depuis 2 jours	\N	en_intervention	\N	2026-06-06 05:16:39.404662+00	\N	\N	\N	degradation	0
201c38d0-8392-426f-a7ab-362b39b11c27	EAU-6974CE	eau	9	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	7	9	36.79137484214009	3.0492968734662695	Fuite au compteur eau coule dans la cave	\N	resolu	\N	2026-06-17 06:13:27.360193+00	2026-06-23 21:50:18.862706+00	\N	\N	degradation	0
3f06abe3-cc40-4207-a4c7-0f5978534a74	EAU-C9E107	eau	10	a3b964e8-3134-4363-9215-018cad658683	10	9	36.73949404334586	3.0147061725745985	Pression très faible au 5ème étage	\N	recu	\N	2026-06-23 14:51:31.66497+00	\N	\N	\N	degradation	0
3db6ae7e-9ca1-4868-aaef-d7117cf574f5	EAU-65B9EE	eau	11	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	14	9	36.78332448959131	3.001787670613447	Refoulement eaux usées dans la cour	\N	transmis	\N	2026-06-18 03:42:08.64449+00	\N	\N	\N	degradation	0
8e2e604c-48cf-40ad-bca5-10a91a0f102b	EAU-F0935E	eau	12	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	21	9	36.76631929185417	2.957312565481311	Avaloir bouché eau stagnante sur chaussée	\N	en_intervention	\N	2026-06-08 23:43:59.361864+00	\N	\N	\N	degradation	0
9b9c0fda-b68c-49d6-b3ba-459bbdbe9283	EAU-A97DA6	eau	13	1404babd-7cd2-496c-9a8b-9053c6281e08	35	9	36.712729810703685	3.1263932487335997	Fuite sur bouche incendie gaspillage eau	\N	resolu	\N	2026-06-23 08:12:46.35852+00	2026-06-24 00:30:14.639106+00	\N	\N	degradation	0
959fb220-d3f2-43f3-a473-1c47ce1f23d4	EAU-A3C65C	eau	14	7d4728bf-a385-42aa-8759-83c2778003b9	43	9	36.67709391077551	3.092182069907291	Affaissement suspect chaussée après pluie	\N	recu	\N	2026-06-17 18:02:53.63647+00	\N	\N	\N	degradation	0
4dd221bc-e162-4aa3-a70b-f8d6189bb654	EAU-2723D0	eau	8	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	50	9	36.71451128492868	3.215987441411057	Fuite importante au croisement rue principale	\N	transmis	\N	2026-06-14 01:47:50.366876+00	\N	\N	\N	degradation	0
c072b7da-1c31-4196-b821-0cb6b8921866	EAU-5F93F9	eau	8	4b362ddd-aa53-4f20-bf93-dc342b618846	1	9	36.736682918517566	3.094657237900517	Coupure eau depuis ce matin sans préavis	\N	en_intervention	\N	2026-06-23 01:44:05.691112+00	\N	\N	\N	degradation	0
28ad282a-b222-431e-8d2f-658a6e12d0f0	EAU-698D51	eau	9	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2	9	36.75464489746083	3.088344186003516	Eau marron au robinet depuis 2 jours	\N	resolu	\N	2026-06-11 16:31:12.266899+00	2026-06-24 17:23:28.394418+00	\N	\N	degradation	0
38e7aaf3-7be3-4866-b70a-3dc07370828f	EAU-7F6FFA	eau	9	16501501-e6cf-4cf0-8774-b71c2700ee4a	5	9	36.727126873128555	3.11110522439619	Fuite au compteur eau coule dans la cave	\N	recu	\N	2026-06-06 01:37:29.243991+00	\N	\N	\N	degradation	0
b7a24839-87b6-416e-9ad5-5ef2dcb8c1d6	EAU-73278A	eau	10	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	7	9	36.791656884864736	3.0439490361867825	Pression très faible au 5ème étage	\N	transmis	\N	2026-06-09 02:19:15.236868+00	\N	\N	\N	degradation	0
090f53e7-eacd-4e3c-98aa-8f43bd36109f	EAU-5FD0B3	eau	11	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	9	36.74148271837381	3.022567468978592	Refoulement eaux usées dans la cour	\N	en_intervention	\N	2026-05-29 14:42:50.053204+00	\N	\N	\N	degradation	0
a5a77be5-64fa-4c15-8496-ce271ee83daf	EAU-2B4492	eau	12	a3b964e8-3134-4363-9215-018cad658683	14	9	36.7850722792347	3.0071198073139396	Avaloir bouché eau stagnante sur chaussée	\N	resolu	\N	2026-06-19 21:31:53.801019+00	2026-06-24 21:18:23.320809+00	\N	\N	degradation	0
10964b1a-6695-4470-b7a1-9ce9c360db74	EAU-C45147	eau	13	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	21	9	36.7655377188875	2.9627483280385305	Fuite sur bouche incendie gaspillage eau	\N	recu	\N	2026-05-30 15:43:48.728494+00	\N	\N	\N	degradation	0
325d9865-1131-438a-b455-c4a65cc825c3	EAU-EB160D	eau	14	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	35	9	36.716645837465	3.1374300260061423	Affaissement suspect chaussée après pluie	\N	transmis	\N	2026-06-19 19:04:45.534856+00	\N	\N	\N	degradation	0
f68ae9c9-c6e0-4f1c-ad84-3acde065546e	EAU-5EF059	eau	8	1404babd-7cd2-496c-9a8b-9053c6281e08	43	9	36.677579715753176	3.1024769842611843	Fuite importante au croisement rue principale	\N	en_intervention	\N	2026-06-16 19:55:39.634325+00	\N	\N	\N	degradation	0
fbf04730-5f24-4f47-ba86-4524961effc2	EAU-07E1CD	eau	8	7d4728bf-a385-42aa-8759-83c2778003b9	50	9	36.72568691340099	3.213416465255584	Coupure eau depuis ce matin sans préavis	\N	resolu	\N	2026-05-30 13:29:15.916665+00	2026-06-23 19:54:04.662913+00	\N	\N	degradation	0
e84ae023-6a3a-4e75-a085-c42131b20b65	EAU-DA4FB5	eau	9	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	1	9	36.73952515896455	3.0822572460236892	Eau marron au robinet depuis 2 jours	\N	recu	\N	2026-06-19 10:37:14.803798+00	\N	\N	\N	degradation	0
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
47	d574932e-da13-4786-8d78-03cacff43551	recu	16501501-e6cf-4cf0-8774-b71c2700ee4a	2026-06-24 20:05:04.225741+00
48	08dc3504-a19d-4a16-b70a-d696c1f0f1b1	recu	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	2026-06-10 08:53:34.722169+00
49	ce17aad3-47b0-4dcc-80f0-0affdf8e0620	recu	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	2026-06-10 07:32:11.041558+00
50	05688d38-d801-4b3e-8cb2-748d4c2403e2	recu	a3b964e8-3134-4363-9215-018cad658683	2026-06-08 22:38:16.644296+00
51	f3e5d50a-8ae8-4ae6-bf79-9e3f371f7ab1	recu	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	2026-06-14 20:09:21.161961+00
52	d4406aed-aac7-4d46-b26b-54ca019b6b77	recu	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	2026-05-31 23:35:04.643432+00
53	f8bb0cfa-e2ed-4fa2-94d3-0d2a61129a01	recu	1404babd-7cd2-496c-9a8b-9053c6281e08	2026-06-01 22:22:01.986404+00
54	590b840e-71af-452c-889d-ce3d11af5134	recu	7d4728bf-a385-42aa-8759-83c2778003b9	2026-06-14 09:30:46.695897+00
55	27cb76bd-4333-4991-a65c-15ad3e0c8ab3	recu	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	2026-06-21 02:43:22.477173+00
56	9a66f502-d6d3-4f62-9b74-f76ec1497f87	recu	4b362ddd-aa53-4f20-bf93-dc342b618846	2026-05-30 11:04:18.820392+00
57	d5cb784e-fd95-4362-bbd9-73c9ed7cb97d	recu	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2026-06-03 11:36:57.370433+00
58	82ad7c72-e5ba-4682-8f67-96ba6b4b62bc	recu	16501501-e6cf-4cf0-8774-b71c2700ee4a	2026-06-03 18:31:06.980867+00
59	d05d0159-6aee-48ea-bd91-017619a2c00d	recu	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	2026-06-25 10:42:40.340164+00
60	ff27f113-d9ac-48bb-83f8-cc0359abc114	recu	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	2026-06-10 09:17:12.971314+00
61	ba783f97-4c78-4e82-a9d3-2249b5154c2c	recu	a3b964e8-3134-4363-9215-018cad658683	2026-06-22 06:23:42.971043+00
62	2067fc09-ac7e-4606-98c9-9aaaf894cc3a	recu	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	2026-06-03 21:34:53.831069+00
63	877a4798-cacf-4a34-be98-9e4d6c4795eb	recu	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	2026-05-28 22:18:31.06597+00
64	fbe4dfd7-9e2a-4bbe-ab52-96b611940492	recu	1404babd-7cd2-496c-9a8b-9053c6281e08	2026-06-20 23:54:53.341166+00
65	ec59954b-f706-476e-a370-35cee940045f	recu	7d4728bf-a385-42aa-8759-83c2778003b9	2026-06-05 15:04:22.951005+00
66	f4017312-776f-4ecd-84f6-687d8de17982	recu	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	2026-06-21 05:55:15.079015+00
67	43515d41-03f2-4655-b8d9-c21b8311c2f3	recu	4b362ddd-aa53-4f20-bf93-dc342b618846	2026-06-03 12:58:04.063609+00
68	f1587a35-f380-4676-8235-6403dd79a1a5	recu	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2026-05-28 02:45:24.736393+00
69	34427d79-6eb1-4a61-823e-c98c40019944	recu	16501501-e6cf-4cf0-8774-b71c2700ee4a	2026-06-11 15:49:05.456906+00
70	01b95aa3-054f-4a6d-843d-d9755a6a8feb	recu	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	2026-06-06 10:11:09.537886+00
71	c5318610-17ae-42ec-9b01-4d62cc0e20a5	recu	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	2026-06-21 04:51:58.265504+00
72	6648c60e-4006-4fac-a342-f7a570b3bd12	recu	a3b964e8-3134-4363-9215-018cad658683	2026-06-17 03:17:01.64898+00
73	9198865b-ee30-426c-b598-3d140ea436c0	recu	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	2026-06-12 22:37:55.042904+00
74	fb13e7dc-c9b0-42fc-b04a-1792cb768f6b	recu	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	2026-05-28 01:44:20.794691+00
75	d4ff86e1-4fc1-4f28-ba81-fb022ac52b54	recu	1404babd-7cd2-496c-9a8b-9053c6281e08	2026-06-18 02:18:30.584126+00
76	58de83c1-1804-474e-8aea-a9d7d3fd4278	recu	7d4728bf-a385-42aa-8759-83c2778003b9	2026-06-18 09:25:27.358326+00
77	c919c77e-a962-4f84-b809-f9d268162e4d	recu	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	2026-06-12 03:28:55.919684+00
78	6e75f21d-d41e-4b09-b466-85f9c2621ffc	recu	4b362ddd-aa53-4f20-bf93-dc342b618846	2026-06-23 16:57:46.311995+00
79	18b343b3-5efc-4a5f-aa0e-770a44f90c2b	recu	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2026-06-02 01:38:18.887468+00
80	332bdba4-097f-4d30-830e-884173d78f25	recu	16501501-e6cf-4cf0-8774-b71c2700ee4a	2026-06-22 23:58:44.940352+00
81	b6e8c4ea-14c7-45f1-a938-c144c2a39881	recu	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	2026-05-30 17:07:37.09749+00
82	3b089cbf-fc73-4b06-bfa0-fd5ec57ae680	recu	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	2026-06-22 18:06:56.768721+00
83	1822db1d-c70f-422b-9407-b399744d2cc2	recu	a3b964e8-3134-4363-9215-018cad658683	2026-06-16 04:12:08.8906+00
84	0877089b-94ee-420b-a0c5-6cb758e375a1	recu	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	2026-06-01 12:21:35.77984+00
85	a4c924ac-658d-4a84-9f12-ff5e0094c776	recu	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	2026-06-16 19:27:43.382399+00
86	4ce53251-9f0a-4730-9eb5-336fd3174bf7	recu	1404babd-7cd2-496c-9a8b-9053c6281e08	2026-06-03 22:21:47.720976+00
87	6f0a3d6e-791b-4796-b870-785fe5794e2b	recu	16501501-e6cf-4cf0-8774-b71c2700ee4a	2026-06-19 22:59:45.049436+00
88	ae632668-f84e-4fc9-9d66-997c18e9cac8	recu	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	2026-06-23 20:29:03.084281+00
89	201c38d0-8392-426f-a7ab-362b39b11c27	recu	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	2026-06-01 00:47:18.746588+00
90	3f06abe3-cc40-4207-a4c7-0f5978534a74	recu	a3b964e8-3134-4363-9215-018cad658683	2026-06-24 08:59:09.604887+00
91	3db6ae7e-9ca1-4868-aaef-d7117cf574f5	recu	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	2026-06-10 07:29:56.342001+00
92	8e2e604c-48cf-40ad-bca5-10a91a0f102b	recu	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	2026-06-07 02:54:38.152564+00
93	9b9c0fda-b68c-49d6-b3ba-459bbdbe9283	recu	1404babd-7cd2-496c-9a8b-9053c6281e08	2026-06-20 13:22:16.757452+00
94	959fb220-d3f2-43f3-a473-1c47ce1f23d4	recu	7d4728bf-a385-42aa-8759-83c2778003b9	2026-06-25 10:10:56.452892+00
95	4dd221bc-e162-4aa3-a70b-f8d6189bb654	recu	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	2026-06-15 04:22:41.605163+00
96	c072b7da-1c31-4196-b821-0cb6b8921866	recu	4b362ddd-aa53-4f20-bf93-dc342b618846	2026-05-31 14:49:15.564474+00
97	28ad282a-b222-431e-8d2f-658a6e12d0f0	recu	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2026-06-23 23:18:18.157003+00
98	38e7aaf3-7be3-4866-b70a-3dc07370828f	recu	16501501-e6cf-4cf0-8774-b71c2700ee4a	2026-06-14 11:10:28.434148+00
99	b7a24839-87b6-416e-9ad5-5ef2dcb8c1d6	recu	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	2026-06-06 02:16:40.576961+00
100	090f53e7-eacd-4e3c-98aa-8f43bd36109f	recu	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	2026-06-06 18:12:53.875047+00
101	a5a77be5-64fa-4c15-8496-ce271ee83daf	recu	a3b964e8-3134-4363-9215-018cad658683	2026-06-09 23:10:59.621558+00
102	10964b1a-6695-4470-b7a1-9ce9c360db74	recu	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	2026-05-28 21:47:30.573188+00
103	325d9865-1131-438a-b455-c4a65cc825c3	recu	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	2026-06-17 15:51:13.548439+00
104	f68ae9c9-c6e0-4f1c-ad84-3acde065546e	recu	1404babd-7cd2-496c-9a8b-9053c6281e08	2026-06-17 18:30:49.239663+00
105	fbf04730-5f24-4f47-ba86-4524961effc2	recu	7d4728bf-a385-42aa-8759-83c2778003b9	2026-06-22 02:19:27.422036+00
106	e84ae023-6a3a-4e75-a085-c42131b20b65	recu	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	2026-06-20 16:11:07.489106+00
111	99198fae-d96f-4923-be9f-b8bf916ce975	recu	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2026-06-27 12:03:51.533351+00
\.


--
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.utilisateur (id, telephone, email, nom, prenom, mot_de_passe, role, commune_id, operateur_id, points, actif, cree_le) FROM stdin;
6a66fe3a-b531-409d-a02b-d8128f581a27	0550000003	rachid@test.dz	Mansouri	Rachid	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	admin_wilaya	1	\N	10	t	2026-06-24 17:17:41.378939+00
28497fb4-33a5-498a-9880-d5fa36bb4a8a	0550000002	youcef@test.dz	Kaci	Youcef	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	agent	2	\N	0	t	2026-06-24 17:17:41.378939+00
29e9c386-5cb1-45cf-8318-776c18dab7e5	0550000004	\N	Hadj	Mourad	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	admin_apc	1	\N	0	t	2026-06-25 15:57:51.479867+00
55c0591b-aeda-4d21-8c82-aa0a48b63643	0550000005	\N	Brahimi	Karim	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	operateur	1	7	0	t	2026-06-25 17:28:41.42864+00
61dbe80a-d290-438b-8fe6-20ea3c4e898f	0550000006	\N	Aissaoui	Nadia	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	operateur	1	9	0	t	2026-06-25 17:28:41.42864+00
4b362ddd-aa53-4f20-bf93-dc342b618846	0550100010	\N	Ferhat	Djamel	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	24	\N	40	t	2026-06-26 14:26:12.764089+00
16501501-e6cf-4cf0-8774-b71c2700ee4a	0550100001	\N	Belkacem	Fatima	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	1	\N	60	t	2026-06-26 14:26:12.764089+00
89d773e5-f2b3-4fd5-887f-c5f67732ef8b	0550100002	\N	Meziane	Kamel	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	7	\N	60	t	2026-06-26 14:26:12.764089+00
841bbd7c-7277-47cb-aabe-fa9fb82f94bc	0550100003	\N	Touati	Sara	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	10	\N	60	t	2026-06-26 14:26:12.764089+00
a3b964e8-3134-4363-9215-018cad658683	0550100004	\N	Djebbar	Mohamed	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	21	\N	60	t	2026-06-26 14:26:12.764089+00
fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	0550100005	\N	Hamidi	Yasmine	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	2	\N	60	t	2026-06-26 14:26:12.764089+00
480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	0550100006	\N	Benmoussa	Arezki	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	14	\N	60	t	2026-06-26 14:26:12.764089+00
1404babd-7cd2-496c-9a8b-9053c6281e08	0550100007	\N	Zeroual	Houria	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	35	\N	60	t	2026-06-26 14:26:12.764089+00
7d4728bf-a385-42aa-8759-83c2778003b9	0550100008	\N	Slimani	Redouane	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	50	\N	50	t	2026-06-26 14:26:12.764089+00
2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	0550100009	\N	Lahlou	Nassima	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	43	\N	50	t	2026-06-26 14:26:12.764089+00
624db3e9-3bcc-4087-8ce2-6acfc3f265a7	0550000001	amina@test.dz	Benali	Amina	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	citoyen	1	\N	200	t	2026-06-24 17:17:46.654089+00
\.


--
-- Data for Name: utilisateur_badge; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.utilisateur_badge (utilisateur_id, badge_id, obtenu_le) FROM stdin;
\.


--
-- Name: badge_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.badge_id_seq', 5, true);


--
-- Name: bien_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bien_historique_id_seq', 1, true);


--
-- Name: bien_immobilier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bien_immobilier_id_seq', 14, true);


--
-- Name: cap_agent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.cap_agent_id_seq', 1, false);


--
-- Name: cap_intervention_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.cap_intervention_id_seq', 1, false);


--
-- Name: carte_resident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.carte_resident_id_seq', 1, false);


--
-- Name: categorie_signal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.categorie_signal_id_seq', 36, true);


--
-- Name: commune_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.commune_id_seq', 57, true);


--
-- Name: contrat_occupation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contrat_occupation_id_seq', 5, true);


--
-- Name: creneau_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.creneau_id_seq', 17018, true);


--
-- Name: epic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.epic_id_seq', 32, true);


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
-- Name: parc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.parc_id_seq', 8, true);


--
-- Name: parking_encaissement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.parking_encaissement_id_seq', 1, false);


--
-- Name: parking_extension_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.parking_extension_id_seq', 1, false);


--
-- Name: parking_ticket_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.parking_ticket_seq', 1, false);


--
-- Name: parking_zone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.parking_zone_id_seq', 6, true);


--
-- Name: points_journal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.points_journal_id_seq', 72, true);


--
-- Name: service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.service_id_seq', 25, true);


--
-- Name: signalement_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.signalement_historique_id_seq', 111, true);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (nom);


--
-- Name: badge badge_code_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.badge
    ADD CONSTRAINT badge_code_key UNIQUE (code);


--
-- Name: badge badge_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.badge
    ADD CONSTRAINT badge_pkey PRIMARY KEY (id);


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
-- Name: cap_agent cap_agent_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_agent
    ADD CONSTRAINT cap_agent_pkey PRIMARY KEY (id);


--
-- Name: cap_agent cap_agent_utilisateur_id_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_agent
    ADD CONSTRAINT cap_agent_utilisateur_id_key UNIQUE (utilisateur_id);


--
-- Name: cap_intervention cap_intervention_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention
    ADD CONSTRAINT cap_intervention_pkey PRIMARY KEY (id);


--
-- Name: cap_intervention cap_intervention_reference_key; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention
    ADD CONSTRAINT cap_intervention_reference_key UNIQUE (reference);


--
-- Name: carte_resident carte_resident_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.carte_resident
    ADD CONSTRAINT carte_resident_pkey PRIMARY KEY (id);


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
-- Name: iqep iqep_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.iqep
    ADD CONSTRAINT iqep_pkey PRIMARY KEY (parc_id);


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
-- Name: parc parc_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parc
    ADD CONSTRAINT parc_pkey PRIMARY KEY (id);


--
-- Name: parking_encaissement parking_encaissement_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_encaissement
    ADD CONSTRAINT parking_encaissement_pkey PRIMARY KEY (id);


--
-- Name: parking_extension parking_extension_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_extension
    ADD CONSTRAINT parking_extension_pkey PRIMARY KEY (id);


--
-- Name: parking_zone parking_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_zone
    ADD CONSTRAINT parking_zone_pkey PRIMARY KEY (id);


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
-- Name: utilisateur_badge utilisateur_badge_pkey; Type: CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur_badge
    ADD CONSTRAINT utilisateur_badge_pkey PRIMARY KEY (utilisateur_id, badge_id);


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
-- Name: cap_agent cap_agent_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_agent
    ADD CONSTRAINT cap_agent_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: cap_agent cap_agent_parking_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_agent
    ADD CONSTRAINT cap_agent_parking_zone_id_fkey FOREIGN KEY (parking_zone_id) REFERENCES public.parking_zone(id);


--
-- Name: cap_agent cap_agent_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_agent
    ADD CONSTRAINT cap_agent_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateur(id) ON DELETE CASCADE;


--
-- Name: cap_intervention cap_intervention_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention
    ADD CONSTRAINT cap_intervention_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.cap_agent(id);


--
-- Name: cap_intervention cap_intervention_citoyen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention
    ADD CONSTRAINT cap_intervention_citoyen_id_fkey FOREIGN KEY (citoyen_id) REFERENCES public.utilisateur(id);


--
-- Name: cap_intervention cap_intervention_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention
    ADD CONSTRAINT cap_intervention_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: cap_intervention cap_intervention_signalement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.cap_intervention
    ADD CONSTRAINT cap_intervention_signalement_id_fkey FOREIGN KEY (signalement_id) REFERENCES public.signalement(id);


--
-- Name: carte_resident carte_resident_citoyen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.carte_resident
    ADD CONSTRAINT carte_resident_citoyen_id_fkey FOREIGN KEY (citoyen_id) REFERENCES public.utilisateur(id);


--
-- Name: carte_resident carte_resident_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.carte_resident
    ADD CONSTRAINT carte_resident_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: categorie_signal categorie_signal_epic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.categorie_signal
    ADD CONSTRAINT categorie_signal_epic_id_fkey FOREIGN KEY (epic_id) REFERENCES public.epic(id);


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
-- Name: iqep iqep_maj_par_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.iqep
    ADD CONSTRAINT iqep_maj_par_fkey FOREIGN KEY (maj_par) REFERENCES public.utilisateur(id);


--
-- Name: iqep iqep_parc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.iqep
    ADD CONSTRAINT iqep_parc_id_fkey FOREIGN KEY (parc_id) REFERENCES public.parc(id) ON DELETE CASCADE;


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
-- Name: parc parc_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parc
    ADD CONSTRAINT parc_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


--
-- Name: parking_encaissement parking_encaissement_citoyen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_encaissement
    ADD CONSTRAINT parking_encaissement_citoyen_id_fkey FOREIGN KEY (citoyen_id) REFERENCES public.utilisateur(id);


--
-- Name: parking_encaissement parking_encaissement_parking_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_encaissement
    ADD CONSTRAINT parking_encaissement_parking_zone_id_fkey FOREIGN KEY (parking_zone_id) REFERENCES public.parking_zone(id);


--
-- Name: parking_extension parking_extension_parking_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_extension
    ADD CONSTRAINT parking_extension_parking_zone_id_fkey FOREIGN KEY (parking_zone_id) REFERENCES public.parking_zone(id);


--
-- Name: parking_zone parking_zone_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.parking_zone
    ADD CONSTRAINT parking_zone_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.commune(id);


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
-- Name: signalement signalement_epic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_epic_id_fkey FOREIGN KEY (epic_id) REFERENCES public.epic(id);


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
-- Name: signalement signalement_parc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.signalement
    ADD CONSTRAINT signalement_parc_id_fkey FOREIGN KEY (parc_id) REFERENCES public.parc(id);


--
-- Name: utilisateur_badge utilisateur_badge_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur_badge
    ADD CONSTRAINT utilisateur_badge_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badge(id) ON DELETE CASCADE;


--
-- Name: utilisateur_badge utilisateur_badge_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: civismart
--

ALTER TABLE ONLY public.utilisateur_badge
    ADD CONSTRAINT utilisateur_badge_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateur(id) ON DELETE CASCADE;


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

\unrestrict AbhiaKe42yY9R0cZMMX2dYJqvJ4VqNEfo30jAOikvHbMPyaDzlnx2AZwXo79BEd

