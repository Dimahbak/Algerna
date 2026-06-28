--
-- PostgreSQL database dump
--

\restrict TDTnAJWCaPY9ET144Am5AlbYPwOFZwX8of0MtXPwyHAnfDhayDFJi7V7HSqZAxe

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
    resolu_le timestamp with time zone,
    epic_id integer,
    parc_id integer
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
1	proprete	Dépôt sauvage de déchets	haute	\N	proprete
2	proprete	Benne pleine / débordante	moyenne	\N	proprete
3	proprete	Déchets encombrants	basse	\N	proprete
4	proprete	Graffiti / tags	basse	\N	proprete
7	proprete	Autre propreté	basse	\N	proprete
5	proprete	Nid de poule / voirie	haute	30	voirie
6	proprete	Éclairage public défaillant	moyenne	8	eclairage
15	proprete	Espace vert dégradé / arbre dangereux	moyenne	3	espaces_verts
16	proprete	Stationnement anarchique / gênant	moyenne	31	stationnement
17	proprete	Décharge sauvage / enfouissement illicite	haute	32	proprete
8	eau	Fuite sur conduite principale	haute	\N	eau
9	eau	Coupure d'eau	haute	\N	eau
10	eau	Eau non potable / colorée	haute	\N	eau
11	eau	Fuite sur compteur	moyenne	\N	eau
12	eau	Pression insuffisante	moyenne	\N	eau
13	eau	Inondation / refoulement	haute	\N	eau
14	eau	Autre eau	basse	\N	eau
18	general	Arrosage défectueux / fuite	moyenne	3	espaces_verts
19	general	Mobilier urbain / banc dégradé	basse	3	espaces_verts
20	general	Aire de jeux endommagée	moyenne	3	espaces_verts
21	general	Fleurissement / plantation	basse	3	espaces_verts
22	general	Autre espaces verts	basse	3	espaces_verts
23	general	Lampadaire éteint	moyenne	8	eclairage
24	general	Lampadaire défectueux / clignotant	moyenne	8	eclairage
25	general	Câble électrique apparent	haute	8	eclairage
26	general	Autre éclairage	basse	8	eclairage
27	general	Nid-de-poule	haute	30	voirie
28	general	Trottoir dégradé	moyenne	30	voirie
29	general	Signalisation manquante / endommagée	moyenne	30	voirie
30	general	Feu tricolore en panne	haute	30	voirie
31	general	Autre voirie	basse	30	voirie
32	general	Stationnement gênant	moyenne	31	stationnement
33	general	Place non respectée / PMR	moyenne	31	stationnement
34	general	Zone à réguler	basse	31	stationnement
35	general	Autre stationnement	basse	31	stationnement
36	general	Autre problème	basse	\N	autre
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
3	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.482024+00	\N
4	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.532534+00	\N
5	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.570678+00	\N
6	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.58653+00	\N
7	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.603371+00	\N
2	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.620093+00	\N
8	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.636497+00	\N
1	100	\N	\N	\N	\N	\N	\N	\N	2026-06-26 21:38:21.653239+00	\N
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
\.


--
-- Data for Name: rdv; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.rdv (id, creneau_id, citoyen_id, numero_ticket, statut, cree_le, maj_le) FROM stdin;
8f48f01e-e031-46b9-967c-25efd2848674	184	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
c8513b2e-c385-4618-abb3-0a8d405ff5b4	252	a3b964e8-3134-4363-9215-018cad658683	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
47f34490-71aa-40d8-b13b-f885889ef432	147	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
d773c041-ffef-4d17-aa7e-84d86a46cbe0	183	16501501-e6cf-4cf0-8774-b71c2700ee4a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
a3719338-1099-40de-8b1b-34dd7f29cbd8	217	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
7abfd137-21a1-408a-8c3c-da4dd2f227ab	220	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
4ce6854f-cd0d-4011-8bb5-ce3829ff7171	79	1404babd-7cd2-496c-9a8b-9053c6281e08	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
f2412a7c-8b8d-4221-a67b-e3c674b14f1c	113	7d4728bf-a385-42aa-8759-83c2778003b9	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
77d480b3-f3da-4b15-95ad-13a91878b41c	148	4b362ddd-aa53-4f20-bf93-dc342b618846	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
d890f4c1-3a32-413b-8d0b-d274440fc56e	182	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
06cd344b-a2f6-4600-9689-87489573ffd9	114	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
1587f7c5-4c9f-4eda-b9ef-eb065041d657	185	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
81dee67b-9c7b-43ee-9a5e-1fe1b809d1b5	218	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
f1c845c5-da6b-4f09-ab67-971e2a910786	219	a3b964e8-3134-4363-9215-018cad658683	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
2f517904-1799-4176-a760-61345a7f2161	10	a3b964e8-3134-4363-9215-018cad658683	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
f56273d8-3587-4f8c-9e25-10cd1e58dde0	78	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
9f130177-e220-4408-a1ce-8b0fe3cd7600	7	16501501-e6cf-4cf0-8774-b71c2700ee4a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
5ac8300a-4e02-47d2-9d6e-d6387e91a43d	77	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
4a03a2ad-6e02-47ae-b770-ccb3138af465	8	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
ac16b03e-e809-4802-b181-1a0f7093d0e3	112	1404babd-7cd2-496c-9a8b-9053c6281e08	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
139038cc-d34a-4b88-9548-a97d0a776eef	149	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	1	traite	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
2214b45e-820f-47ba-9c7c-cd20f882ae8c	150	16501501-e6cf-4cf0-8774-b71c2700ee4a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
16cca1c6-733a-492c-b2e3-a52dc6f06ca5	9	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
1395fa07-765c-45c7-b273-ad84313ff119	42	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
47204860-e121-41ed-9e82-4488a13389c6	43	a3b964e8-3134-4363-9215-018cad658683	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
7b390f3c-b2d8-4d31-af5a-5539973088bb	44	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
ec1b3711-750b-4c5c-be03-e29355464f85	45	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	1	present	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
40a27708-64fe-4f57-b255-f2c761e65f7b	115	4b362ddd-aa53-4f20-bf93-dc342b618846	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
4dba76a2-33eb-4a43-a2e7-ad20913fdd76	80	7d4728bf-a385-42aa-8759-83c2778003b9	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
625fd37b-d60a-461b-9979-573cdec14cac	253	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	1	reserve	2026-06-26 14:26:52.579662+00	2026-06-26 14:26:52.579662+00
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.service (id, nom, famille, duree_min) FROM stdin;
9	Extrait de naissance	A	0
10	Certificat de résidence	A	0
12	Passeport	B	45
13	Permis de construire	B	60
14	Légalisation de signature	B	15
15	Carte d'invalidité	B	30
16	Fiche familiale	A	0
11	Carte nationale d'identité	A	0
\.


--
-- Data for Name: signalement; Type: TABLE DATA; Schema: public; Owner: civismart
--

COPY public.signalement (id, reference, domaine, categorie_id, citoyen_id, commune_id, operateur_id, lat, lng, description, photo_path, etat, preuve_path, cree_le, resolu_le, epic_id, parc_id) FROM stdin;
98556087-87ee-4ad2-8f74-935bc6c99e7e	PRO-5ITYJ5A2	proprete	1	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	13	7	41.893984	-1.408013	Poubelle sauvage depuis 3 jours	uploads/4199f5244f30ff5caaec6bebe292fc65	recu	\N	2026-06-25 15:12:38.806835+00	\N	\N	\N
73d2c9e7-02ff-4666-98d7-b54f8be86a75	PRO-ALG001	proprete	1	\N	1	7	36.7372	3.0465	Dépôt sauvage de déchets devant le marché Clauzel	\N	resolu	\N	2026-06-10 17:41:06.880348+00	2026-06-15 17:41:06.880348+00	\N	\N
5b73dc8c-9ca1-464a-bf7e-cb9bd0b8eeb2	PRO-ALG002	proprete	2	\N	1	7	36.749	3.0591	Benne débordante rue Didouche Mourad	\N	en_intervention	\N	2026-06-20 17:41:06.880348+00	\N	\N	\N
56ca7610-fd09-462a-88a9-e3cb240f231e	PRO-ALG003	proprete	5	\N	2	7	36.7358	3.068	Nid de poule dangereux avenue de la Bouzareah	\N	transmis	\N	2026-06-17 17:41:06.880348+00	\N	\N	\N
368327c4-9935-43eb-acae-c53c09692116	PRO-ALG004	proprete	6	\N	4	7	36.784	3.06	Éclairage défaillant ruelle de la Casbah	\N	recu	\N	2026-06-23 17:41:06.880348+00	\N	\N	\N
c5b5c3dd-c8d2-4728-9c35-4348dab9e842	PRO-ALG005	proprete	3	\N	7	8	36.772	3.0441	Encombrants abandonnés rue Tripoli Bab El Oued	\N	resolu	\N	2026-06-05 17:41:06.880348+00	2026-06-11 17:41:06.880348+00	\N	\N
5659229c-7ff6-4559-b642-1e326d905f45	PRO-ALG006	proprete	4	\N	3	7	36.721	3.055	Graffitis sur le mur de l'école El Madania	\N	transmis	\N	2026-06-19 17:41:06.880348+00	\N	\N	\N
4a9b3e88-bf06-4f5c-988b-afe1c6b2e7a0	PRO-ALG007	proprete	1	\N	9	8	36.6985	3.078	Dépôt sauvage carrefour Bir Mourad Raïs	\N	en_intervention	\N	2026-06-22 17:41:06.880348+00	\N	\N	\N
f4dd1d58-d50d-48e7-b6d1-daddfb82fe97	PRO-ALG008	proprete	2	\N	5	7	36.741	3.109	Benne saturée avenue des Frères Bouadou Hussein Dey	\N	recu	\N	2026-06-24 17:41:06.880348+00	\N	\N	\N
52aeee94-77e6-4fa7-acf9-7b8c7b9ee0da	PRO-ALG009	proprete	5	\N	12	8	36.755	3.042	Voirie dégradée El Mouradia près de la wilaya	\N	resolu	\N	2026-05-26 17:41:06.880348+00	2026-06-03 17:41:06.880348+00	\N	\N
a44c1b61-3670-439d-8dca-f4c4b6ebb8b5	PRO-ALG010	proprete	6	\N	11	7	36.763	3.035	Lampadaires éteints boulevard El Biar	\N	transmis	\N	2026-06-21 17:41:06.880348+00	\N	\N	\N
f6296867-9b42-4f8d-9063-ce76413732b2	EAU-ALG001	eau	8	\N	1	9	36.738	3.048	Fuite importante rue Ben M'hidi centre	\N	resolu	\N	2026-06-13 17:41:06.916554+00	2026-06-17 17:41:06.916554+00	\N	\N
039da10a-dd9d-41e1-ad11-65fefc489239	EAU-ALG002	eau	9	\N	4	9	36.785	3.061	Coupure d'eau totale quartier haute Casbah depuis 48h	\N	en_intervention	\N	2026-06-23 17:41:06.916554+00	\N	\N	\N
989eadf9-0ac7-4d6c-a88b-596f220d5102	EAU-ALG003	eau	12	\N	7	9	36.77	3.046	Pression insuffisante rue Montaigne Bab El Oued	\N	recu	\N	2026-06-24 17:41:06.916554+00	\N	\N	\N
8f9ffe38-5cbc-4c0f-b309-8a76c8ebf159	EAU-ALG004	eau	13	\N	2	9	36.734	3.07	Refoulement égout avenue Belouizdad	\N	transmis	\N	2026-06-18 17:41:06.916554+00	\N	\N	\N
943071a6-f3dc-4b79-a568-8ca8d6f828aa	EAU-ALG005	eau	11	\N	5	9	36.746	3.11	Fuite compteur résidence El Amel Hussein Dey	\N	resolu	\N	2026-06-07 17:41:06.916554+00	2026-06-12 17:41:06.916554+00	\N	\N
8d7eea34-6238-4d42-8623-a95f8f3107c6	EAU-ALG006	eau	10	\N	3	9	36.718	3.053	Eau jaunâtre signalée dans la cité El Madania	\N	en_intervention	\N	2026-06-22 17:41:06.916554+00	\N	\N	\N
6a52fe9f-0956-4ca9-9ffa-f64e23c25e1d	EAU-ALG007	eau	8	\N	9	13	36.696	3.08	Fuite conduite principale Bir Mourad Raïs carrefour RN1	\N	recu	\N	2026-06-25 11:41:06.916554+00	\N	\N	\N
7229529b-bc13-4216-b2b7-e54aa78c5a09	PRO-PX4N2EDO	proprete	2	6a66fe3a-b531-409d-a02b-d8128f581a27	34	7	36.782822	2.959902	buhuhu	\N	recu	\N	2026-06-25 18:16:28.151191+00	\N	\N	\N
d574932e-da13-4786-8d78-03cacff43551	PRO-C4CA42	proprete	1	16501501-e6cf-4cf0-8774-b71c2700ee4a	2	7	36.792701169515	3.2467030063606033	Benne débordante rue principale depuis 3 jours	\N	transmis	\N	2026-06-21 12:40:34.579956+00	\N	\N	\N
08dc3504-a19d-4a16-b70a-d696c1f0f1b1	PRO-C81E72	proprete	1	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	3	7	36.803737747450505	3.312379354059941	Encombrants abandonnés devant immeuble	\N	en_intervention	\N	2026-06-17 03:46:07.985968+00	\N	\N	\N
ce17aad3-47b0-4dcc-80f0-0affdf8e0620	PRO-ECCBC8	proprete	2	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	4	7	36.760867188087744	3.311533950425512	Tags sur la façade de école primaire	\N	resolu	\N	2026-06-03 03:32:43.775083+00	2026-06-21 23:03:22.326442+00	\N	\N
05688d38-d801-4b3e-8cb2-748d4c2403e2	PRO-A87FF6	proprete	2	a3b964e8-3134-4363-9215-018cad658683	5	7	36.777368939412966	3.0223348195201396	Nid de poule dangereux sur la chaussée	\N	recu	\N	2026-06-22 13:30:12.959588+00	\N	\N	\N
f3e5d50a-8ae8-4ae6-bf79-9e3f371f7ab1	PRO-E4DA3B	proprete	3	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	6	7	36.77099269739696	3.0825310543101554	Lampadaire éteint depuis une semaine	\N	transmis	\N	2026-06-22 21:45:29.587221+00	\N	\N	\N
d4406aed-aac7-4d46-b26b-54ca019b6b77	PRO-167909	proprete	4	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	7	7	36.796983923348094	3.2536095432525003	Déchets verts non ramassés	\N	en_intervention	\N	2026-06-11 21:33:28.029659+00	\N	\N	\N
f8bb0cfa-e2ed-4fa2-94d3-0d2a61129a01	PRO-8F14E4	proprete	5	1404babd-7cd2-496c-9a8b-9053c6281e08	8	7	36.77521233653634	3.3379198479295527	Conteneur renversé après passage camion	\N	resolu	\N	2026-06-08 12:47:38.446101+00	2026-06-26 12:43:18.064499+00	\N	\N
590b840e-71af-452c-889d-ce3d11af5134	PRO-C9F0F8	proprete	6	7d4728bf-a385-42aa-8759-83c2778003b9	9	7	36.72056187336647	3.1465071058097025	Matelas et meubles jetés sur le trottoir	\N	recu	\N	2026-05-27 15:31:37.045301+00	\N	\N	\N
27cb76bd-4333-4991-a65c-15ad3e0c8ab3	PRO-45C48C	proprete	7	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	10	7	36.732069244892394	2.999829053768561	Poubelle cassée non remplacée	\N	transmis	\N	2026-06-07 21:44:23.536015+00	\N	\N	\N
9a66f502-d6d3-4f62-9b74-f76ec1497f87	PRO-D3D944	proprete	15	4b362ddd-aa53-4f20-bf93-dc342b618846	14	8	36.76396799025033	3.2924446371883636	Arbre mort menaçant de tomber	\N	en_intervention	\N	2026-05-27 20:44:06.299096+00	\N	\N	\N
d5cb784e-fd95-4362-bbd9-73c9ed7cb97d	PRO-6512BD	proprete	16	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	21	8	36.780623823539315	3.049887633225781	Voitures garées sur le trottoir	\N	resolu	\N	2026-06-05 06:09:54.691187+00	2026-06-22 05:36:52.5232+00	\N	\N
82ad7c72-e5ba-4682-8f67-96ba6b4b62bc	PRO-C20AD4	proprete	17	16501501-e6cf-4cf0-8774-b71c2700ee4a	24	8	36.75411409009438	3.13329067561034	Décharge illicite en bordure de terrain	\N	recu	\N	2026-05-27 20:19:27.869823+00	\N	\N	\N
d05d0159-6aee-48ea-bd91-017619a2c00d	PRO-C51CE4	proprete	1	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	35	8	36.73035978557573	3.3212000415128333	Dépôt sauvage derrière le marché couvert	\N	transmis	\N	2026-06-01 15:57:15.81257+00	\N	\N	\N
ff27f113-d9ac-48bb-83f8-cc0359abc114	PRO-AAB323	proprete	1	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	36	8	36.72871211234181	3.0018660073032155	Benne débordante rue principale depuis 3 jours	\N	en_intervention	\N	2026-06-03 10:15:42.803948+00	\N	\N	\N
ba783f97-4c78-4e82-a9d3-2249b5154c2c	PRO-9BF31C	proprete	1	a3b964e8-3134-4363-9215-018cad658683	43	8	36.73669555918395	3.2053995412598	Encombrants abandonnés devant immeuble	\N	resolu	\N	2026-06-18 05:19:41.748253+00	2026-06-22 01:15:42.893711+00	\N	\N
2067fc09-ac7e-4606-98c9-9aaaf894cc3a	PRO-C74D97	proprete	2	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	46	8	36.77042318963831	3.0248063416530204	Tags sur la façade de école primaire	\N	recu	\N	2026-05-30 08:43:40.295019+00	\N	\N	\N
877a4798-cacf-4a34-be98-9e4d6c4795eb	PRO-70EFDF	proprete	2	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	50	8	36.81895612207786	3.318765440339631	Nid de poule dangereux sur la chaussée	\N	transmis	\N	2026-06-21 01:15:59.273501+00	\N	\N	\N
fbe4dfd7-9e2a-4bbe-ab52-96b611940492	PRO-6F4922	proprete	3	1404babd-7cd2-496c-9a8b-9053c6281e08	1	7	36.72594878759658	3.2313394412918046	Lampadaire éteint depuis une semaine	\N	en_intervention	\N	2026-06-08 22:53:18.477602+00	\N	\N	\N
ec59954b-f706-476e-a370-35cee940045f	PRO-1F0E3D	proprete	4	7d4728bf-a385-42aa-8759-83c2778003b9	2	7	36.7587148369342	3.182993743341125	Déchets verts non ramassés	\N	resolu	\N	2026-06-25 22:56:18.224569+00	2026-06-23 00:23:35.947085+00	\N	\N
f4017312-776f-4ecd-84f6-687d8de17982	PRO-98F137	proprete	5	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	3	7	36.73765659745629	3.1960116954617916	Conteneur renversé après passage camion	\N	recu	\N	2026-06-02 01:13:49.195437+00	\N	\N	\N
43515d41-03f2-4655-b8d9-c21b8311c2f3	PRO-3C59DC	proprete	6	4b362ddd-aa53-4f20-bf93-dc342b618846	4	7	36.809056696931194	3.2918245871096445	Matelas et meubles jetés sur le trottoir	\N	transmis	\N	2026-06-23 18:15:13.723687+00	\N	\N	\N
f1587a35-f380-4676-8235-6403dd79a1a5	PRO-B6D767	proprete	7	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	5	7	36.76670954903788	3.3356680932255958	Poubelle cassée non remplacée	\N	en_intervention	\N	2026-06-16 09:39:51.478568+00	\N	\N	\N
34427d79-6eb1-4a61-823e-c98c40019944	PRO-37693C	proprete	15	16501501-e6cf-4cf0-8774-b71c2700ee4a	6	7	36.79569809676187	3.1511249159062547	Arbre mort menaçant de tomber	\N	resolu	\N	2026-06-04 18:48:28.321526+00	2026-06-22 03:05:23.793087+00	\N	\N
01b95aa3-054f-4a6d-843d-d9755a6a8feb	PRO-1FF1DE	proprete	16	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	7	7	36.81682181048564	3.2118451640170935	Voitures garées sur le trottoir	\N	recu	\N	2026-06-09 22:38:48.165007+00	\N	\N	\N
c5318610-17ae-42ec-9b01-4d62cc0e20a5	PRO-8E296A	proprete	17	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	8	7	36.76914962026469	3.074848085767225	Décharge illicite en bordure de terrain	\N	transmis	\N	2026-06-23 10:56:04.553747+00	\N	\N	\N
6648c60e-4006-4fac-a342-f7a570b3bd12	PRO-4E732C	proprete	1	a3b964e8-3134-4363-9215-018cad658683	9	7	36.733476188879706	3.2264338799250893	Dépôt sauvage derrière le marché couvert	\N	en_intervention	\N	2026-06-18 00:05:14.58819+00	\N	\N	\N
9198865b-ee30-426c-b598-3d140ea436c0	PRO-02E74F	proprete	1	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	10	7	36.739228230564756	3.2868306200343813	Benne débordante rue principale depuis 3 jours	\N	resolu	\N	2026-06-21 07:37:58.028876+00	2026-06-26 10:27:04.973569+00	\N	\N
fb13e7dc-c9b0-42fc-b04a-1792cb768f6b	PRO-33E75F	proprete	1	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	14	8	36.750825637864935	3.1282940323318997	Encombrants abandonnés devant immeuble	\N	recu	\N	2026-06-09 20:25:51.417973+00	\N	\N	\N
d4ff86e1-4fc1-4f28-ba81-fb022ac52b54	PRO-6EA9AB	proprete	2	1404babd-7cd2-496c-9a8b-9053c6281e08	21	8	36.79370838294722	3.3169607791732236	Tags sur la façade de école primaire	\N	transmis	\N	2026-06-14 13:56:29.567834+00	\N	\N	\N
58de83c1-1804-474e-8aea-a9d7d3fd4278	PRO-34173C	proprete	2	7d4728bf-a385-42aa-8759-83c2778003b9	24	8	36.74139367292775	2.9698605837539676	Nid de poule dangereux sur la chaussée	\N	en_intervention	\N	2026-06-04 17:10:16.669879+00	\N	\N	\N
c919c77e-a962-4f84-b809-f9d268162e4d	PRO-C16A53	proprete	3	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	35	8	36.739765830992475	3.0096846881231727	Lampadaire éteint depuis une semaine	\N	resolu	\N	2026-05-31 23:00:21.022258+00	2026-06-24 16:02:37.597508+00	\N	\N
6e75f21d-d41e-4b09-b466-85f9c2621ffc	PRO-6364D3	proprete	4	4b362ddd-aa53-4f20-bf93-dc342b618846	36	8	36.80127330732791	3.3107326429277792	Déchets verts non ramassés	\N	recu	\N	2026-05-31 09:29:27.220062+00	\N	\N	\N
18b343b3-5efc-4a5f-aa0e-770a44f90c2b	PRO-182BE0	proprete	5	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	43	8	36.76657375739537	3.2620086150884546	Conteneur renversé après passage camion	\N	transmis	\N	2026-06-01 17:31:43.115801+00	\N	\N	\N
332bdba4-097f-4d30-830e-884173d78f25	PRO-E36985	proprete	6	16501501-e6cf-4cf0-8774-b71c2700ee4a	46	8	36.81700990411296	2.972539132881433	Matelas et meubles jetés sur le trottoir	\N	en_intervention	\N	2026-05-29 06:22:30.606217+00	\N	\N	\N
b6e8c4ea-14c7-45f1-a938-c144c2a39881	PRO-1C383C	proprete	7	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	50	8	36.7678082026361	3.004562784300201	Poubelle cassée non remplacée	\N	resolu	\N	2026-05-29 14:01:57.728601+00	2026-06-25 14:37:46.896332+00	\N	\N
3b089cbf-fc73-4b06-bfa0-fd5ec57ae680	PRO-19CA14	proprete	15	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	1	7	36.74019384029454	3.1181139260265667	Arbre mort menaçant de tomber	\N	recu	\N	2026-06-06 09:18:03.637986+00	\N	\N	\N
1822db1d-c70f-422b-9407-b399744d2cc2	PRO-A5BFC9	proprete	16	a3b964e8-3134-4363-9215-018cad658683	2	7	36.72957921809117	3.2251902376307413	Voitures garées sur le trottoir	\N	transmis	\N	2026-05-30 22:28:22.93251+00	\N	\N	\N
0877089b-94ee-420b-a0c5-6cb758e375a1	PRO-A5771B	proprete	17	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	3	7	36.81171588845521	3.1918329546279867	Décharge illicite en bordure de terrain	\N	en_intervention	\N	2026-06-18 10:25:45.318644+00	\N	\N	\N
a4c924ac-658d-4a84-9f12-ff5e0094c776	PRO-D67D8A	proprete	1	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	4	7	36.77836685294954	3.190934410761523	Dépôt sauvage derrière le marché couvert	\N	resolu	\N	2026-06-22 18:59:56.479522+00	2026-06-22 09:02:53.216198+00	\N	\N
4ce53251-9f0a-4730-9eb5-336fd3174bf7	PRO-D64592	proprete	1	1404babd-7cd2-496c-9a8b-9053c6281e08	5	7	36.76145340298403	3.250175688267281	Benne débordante rue principale depuis 3 jours	\N	recu	\N	2026-06-05 16:33:04.368399+00	\N	\N	\N
6f0a3d6e-791b-4796-b870-785fe5794e2b	EAU-38B3EF	eau	8	16501501-e6cf-4cf0-8774-b71c2700ee4a	2	9	36.7423969113527	3.333996675091267	Coupure eau depuis ce matin sans préavis	\N	transmis	\N	2026-06-21 01:41:14.538702+00	\N	\N	\N
ae632668-f84e-4fc9-9d66-997c18e9cac8	EAU-EC8956	eau	9	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	5	9	36.77662816770849	3.211011079984111	Eau marron au robinet depuis 2 jours	\N	en_intervention	\N	2026-06-06 05:16:39.404662+00	\N	\N	\N
201c38d0-8392-426f-a7ab-362b39b11c27	EAU-6974CE	eau	9	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	7	9	36.740431427578585	3.2748497446068843	Fuite au compteur eau coule dans la cave	\N	resolu	\N	2026-06-17 06:13:27.360193+00	2026-06-23 21:50:18.862706+00	\N	\N
3f06abe3-cc40-4207-a4c7-0f5978534a74	EAU-C9E107	eau	10	a3b964e8-3134-4363-9215-018cad658683	10	9	36.77807885912633	3.267734559878227	Pression très faible au 5ème étage	\N	recu	\N	2026-06-23 14:51:31.66497+00	\N	\N	\N
3db6ae7e-9ca1-4868-aaef-d7117cf574f5	EAU-65B9EE	eau	11	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	14	9	36.75719331952127	3.282356469701341	Refoulement eaux usées dans la cour	\N	transmis	\N	2026-06-18 03:42:08.64449+00	\N	\N	\N
8e2e604c-48cf-40ad-bca5-10a91a0f102b	EAU-F0935E	eau	12	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	21	9	36.73212920260005	3.1504202832923625	Avaloir bouché eau stagnante sur chaussée	\N	en_intervention	\N	2026-06-08 23:43:59.361864+00	\N	\N	\N
9b9c0fda-b68c-49d6-b3ba-459bbdbe9283	EAU-A97DA6	eau	13	1404babd-7cd2-496c-9a8b-9053c6281e08	35	9	36.749524002108984	3.0436594232766936	Fuite sur bouche incendie gaspillage eau	\N	resolu	\N	2026-06-23 08:12:46.35852+00	2026-06-24 00:30:14.639106+00	\N	\N
959fb220-d3f2-43f3-a473-1c47ce1f23d4	EAU-A3C65C	eau	14	7d4728bf-a385-42aa-8759-83c2778003b9	43	9	36.73943804900553	2.983166154480334	Affaissement suspect chaussée après pluie	\N	recu	\N	2026-06-17 18:02:53.63647+00	\N	\N	\N
4dd221bc-e162-4aa3-a70b-f8d6189bb654	EAU-2723D0	eau	8	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	50	9	36.77222206959248	3.03495144124356	Fuite importante au croisement rue principale	\N	transmis	\N	2026-06-14 01:47:50.366876+00	\N	\N	\N
c072b7da-1c31-4196-b821-0cb6b8921866	EAU-5F93F9	eau	8	4b362ddd-aa53-4f20-bf93-dc342b618846	1	9	36.7680451282271	3.0549933168717005	Coupure eau depuis ce matin sans préavis	\N	en_intervention	\N	2026-06-23 01:44:05.691112+00	\N	\N	\N
28ad282a-b222-431e-8d2f-658a6e12d0f0	EAU-698D51	eau	9	624db3e9-3bcc-4087-8ce2-6acfc3f265a7	2	9	36.74788454900577	3.1476684033936966	Eau marron au robinet depuis 2 jours	\N	resolu	\N	2026-06-11 16:31:12.266899+00	2026-06-24 17:23:28.394418+00	\N	\N
38e7aaf3-7be3-4866-b70a-3dc07370828f	EAU-7F6FFA	eau	9	16501501-e6cf-4cf0-8774-b71c2700ee4a	5	9	36.73757244310389	3.156835618007554	Fuite au compteur eau coule dans la cave	\N	recu	\N	2026-06-06 01:37:29.243991+00	\N	\N	\N
b7a24839-87b6-416e-9ad5-5ef2dcb8c1d6	EAU-73278A	eau	10	89d773e5-f2b3-4fd5-887f-c5f67732ef8b	7	9	36.79602701560612	2.9683703338532696	Pression très faible au 5ème étage	\N	transmis	\N	2026-06-09 02:19:15.236868+00	\N	\N	\N
090f53e7-eacd-4e3c-98aa-8f43bd36109f	EAU-5FD0B3	eau	11	841bbd7c-7277-47cb-aabe-fa9fb82f94bc	10	9	36.78577328729875	3.123357381299641	Refoulement eaux usées dans la cour	\N	en_intervention	\N	2026-05-29 14:42:50.053204+00	\N	\N	\N
a5a77be5-64fa-4c15-8496-ce271ee83daf	EAU-2B4492	eau	12	a3b964e8-3134-4363-9215-018cad658683	14	9	36.76161854289373	3.073999117711546	Avaloir bouché eau stagnante sur chaussée	\N	resolu	\N	2026-06-19 21:31:53.801019+00	2026-06-24 21:18:23.320809+00	\N	\N
10964b1a-6695-4470-b7a1-9ce9c360db74	EAU-C45147	eau	13	fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	21	9	36.725355958383176	3.0113972212408684	Fuite sur bouche incendie gaspillage eau	\N	recu	\N	2026-05-30 15:43:48.728494+00	\N	\N	\N
325d9865-1131-438a-b455-c4a65cc825c3	EAU-EB160D	eau	14	480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	35	9	36.72990345344649	3.349040885644901	Affaissement suspect chaussée après pluie	\N	transmis	\N	2026-06-19 19:04:45.534856+00	\N	\N	\N
f68ae9c9-c6e0-4f1c-ad84-3acde065546e	EAU-5EF059	eau	8	1404babd-7cd2-496c-9a8b-9053c6281e08	43	9	36.79042025924706	3.0495482636774187	Fuite importante au croisement rue principale	\N	en_intervention	\N	2026-06-16 19:55:39.634325+00	\N	\N	\N
fbf04730-5f24-4f47-ba86-4524961effc2	EAU-07E1CD	eau	8	7d4728bf-a385-42aa-8759-83c2778003b9	50	9	36.79757053531801	3.0852996883902635	Coupure eau depuis ce matin sans préavis	\N	resolu	\N	2026-05-30 13:29:15.916665+00	2026-06-23 19:54:04.662913+00	\N	\N
e84ae023-6a3a-4e75-a085-c42131b20b65	EAU-DA4FB5	eau	9	2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	1	9	36.78756858697768	3.148235935149666	Eau marron au robinet depuis 2 jours	\N	recu	\N	2026-06-19 10:37:14.803798+00	\N	\N	\N
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
624db3e9-3bcc-4087-8ce2-6acfc3f265a7	0550000001	amina@test.dz	Benali	Amina	$2a$12$HOahEwOuBpeJW4KuZ/lyQegrXFvjDE7IdZsXH94p4irpwiM8jRSeK	citoyen	1	\N	190	t	2026-06-24 17:17:46.654089+00
16501501-e6cf-4cf0-8774-b71c2700ee4a	0550100001	\N	Belkacem	Fatima	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	1	\N	60	t	2026-06-26 14:26:12.764089+00
89d773e5-f2b3-4fd5-887f-c5f67732ef8b	0550100002	\N	Meziane	Kamel	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	7	\N	60	t	2026-06-26 14:26:12.764089+00
841bbd7c-7277-47cb-aabe-fa9fb82f94bc	0550100003	\N	Touati	Sara	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	10	\N	60	t	2026-06-26 14:26:12.764089+00
a3b964e8-3134-4363-9215-018cad658683	0550100004	\N	Djebbar	Mohamed	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	21	\N	60	t	2026-06-26 14:26:12.764089+00
fb700eb6-7eb7-4bbb-bd49-0a040c539f2a	0550100005	\N	Hamidi	Yasmine	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	2	\N	60	t	2026-06-26 14:26:12.764089+00
480138e0-6d3b-4fc9-8c61-ab6709fc2dcf	0550100006	\N	Benmoussa	Arezki	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	14	\N	60	t	2026-06-26 14:26:12.764089+00
1404babd-7cd2-496c-9a8b-9053c6281e08	0550100007	\N	Zeroual	Houria	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	35	\N	60	t	2026-06-26 14:26:12.764089+00
7d4728bf-a385-42aa-8759-83c2778003b9	0550100008	\N	Slimani	Redouane	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	50	\N	50	t	2026-06-26 14:26:12.764089+00
2b7c09c1-75b7-4ee2-a5fc-4c415d12dfec	0550100009	\N	Lahlou	Nassima	$2a$12$HVRL0oNQb554T6S9NvsAt.npQ88LZM3e4ZiHiMaQ5ypUt4E4ZF34u	citoyen	43	\N	50	t	2026-06-26 14:26:12.764089+00
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

SELECT pg_catalog.setval('public.creneau_id_seq', 3833, true);


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

SELECT pg_catalog.setval('public.points_journal_id_seq', 71, true);


--
-- Name: service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.service_id_seq', 16, true);


--
-- Name: signalement_historique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: civismart
--

SELECT pg_catalog.setval('public.signalement_historique_id_seq', 110, true);


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

\unrestrict TDTnAJWCaPY9ET144Am5AlbYPwOFZwX8of0MtXPwyHAnfDhayDFJi7V7HSqZAxe

