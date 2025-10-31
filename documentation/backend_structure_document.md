# Backend Structure Document

This document outlines the backend architecture, database setup, hosting, infrastructure, and operational practices for the **react-supabase-digital-agreement** platform. It’s written in clear, everyday language so that anyone—technical or not—can grasp how the backend is organized and why each component was chosen.

## 1. Backend Architecture

Overall, the backend relies on **Supabase**, a Backend-as-a-Service (BaaS) built on PostgreSQL. The design follows a **client–server model** enhanced by **serverless edge functions** for specialized tasks.

Key design aspects:

•  **Client–Server Model**  
   The React frontend communicates with Supabase using RESTful APIs (via PostgREST) and custom edge function endpoints.

•  **Serverless Edge Functions**  
   Hosted by Supabase, these small, on-demand functions handle tasks like PDF generation and signing. They keep sensitive logic off the client and scale automatically.

•  **Design Patterns**  
   - **Modular Service Layers**: Authentication, storage, and database are decoupled.  
   - **Single Responsibility**: Each edge function or database policy enforces one clear rule or operation.  
   - **Event-Driven Updates**: When a document is generated or signed, triggers update the database and notify users.

How this supports project goals:

•  **Scalability**: Supabase auto-scales the database and edge functions as traffic grows.  
•  **Maintainability**: Clear separation between core services and custom functions eases updates.  
•  **Performance**: Edge functions run close to users, and PostgREST provides low-latency data access.

## 2. Database Management

We use a **PostgreSQL** database provided by Supabase, along with the following practices:

•  **SQL Database**  
   PostgreSQL stores structured data for users, templates, agreements, and signatures.

•  **JSONB Columns**  
   Agreement templates include a JSONB field for dynamic form definitions (field names, validation rules).

•  **Row-Level Security (RLS)**  
   Database policies ensure that each user can only read or modify their own data. For example, only the agreement creator or designated signer can view a document.

•  **Indexes and Performance**  
   Key columns (user ID, agreement status, creation date) are indexed to speed up common queries.

•  **Backups and Migrations**  
   Supabase automatically backs up the database, and migrations are managed via SQL scripts that can be versioned in source control.

## 3. Database Schema

### Human-Readable Overview

•  **profiles**: User accounts and metadata (name, email, role).  
•  **agreement_templates**: Records of reusable document blueprints. Includes a JSONB column for template fields and a version number.  
•  **agreements**: Individual agreement instances. Links to a template, stores filled-out data (JSONB), status (draft, pending, signed), and timestamps.  
•  **signatures**: Records each signature event. Stores the image URL, signing user, IP address, and timestamp.  

### SQL Schema (PostgreSQL)

```sql
-- Profiles table stores user details
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

-- Templates table stores reusable document definitions
CREATE TABLE agreement_templates (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  fields_json jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Agreements table stores individual agreements based on templates
CREATE TABLE agreements (
  id uuid PRIMARY KEY,
  template_id uuid REFERENCES agreement_templates(id),
  created_by uuid REFERENCES profiles(id),
  data_json jsonb NOT NULL,
  status text CHECK (status IN ('draft','pending','signed')) NOT NULL DEFAULT 'draft',
  pdf_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Signatures table records each signing event
CREATE TABLE signatures (
  id uuid PRIMARY KEY,
  agreement_id uuid REFERENCES agreements(id),
  signed_by uuid REFERENCES profiles(id),
  image_url text NOT NULL,
  ip_address text,
  signed_at timestamp with time zone DEFAULT now()
);
```

## 4. API Design and Endpoints

### RESTful Endpoints (via Supabase PostgREST)

•  **/rest/v1/profiles**  
   CRUD for user profiles (limited by RLS).  
•  **/rest/v1/agreement_templates**  
   List, create, update, and version templates.  
•  **/rest/v1/agreements**  
   Manage individual agreements: create drafts, fetch status, update data_json, attach PDF URL.  
•  **/rest/v1/signatures**  
   Record and retrieve signature events.

### Edge Function Endpoints

•  **/functions/v1/generate-pdf**  
   Accepts JSON payload of agreement data, returns a generated PDF URL.  
•  **/functions/v1/embed-signature**  
   Takes a PDF URL and signature image, merges them, and saves an updated PDF.

### Communication Flow

1.  User submits a filled form → Frontend calls `/functions/v1/generate-pdf`.  
2.  Edge function stores PDF in Supabase Storage and updates `agreements.pdf_url`.  
3.  Signing party calls `/functions/v1/embed-signature` with signature data.  
4.  Edge function updates PDF and inserts a record in `signatures`.

## 5. Hosting Solutions

•  **Supabase Cloud**  
   - **Database**: Managed PostgreSQL with automatic scaling, backups, and security patches.  
   - **Auth & Storage**: Built-in user management and file hosting for PDFs and signature images.  
   - **Edge Functions**: Hosted close to users for low latency.

Benefits:

•  **Reliability**: SLA-backed uptime and automated failover.  
•  **Cost-Effectiveness**: Pay only for what you use; tiers grow as you grow.  
•  **Simplicity**: Single console for all backend services.

## 6. Infrastructure Components

•  **Load Balancer**  
   Built-in to Supabase, distributes database queries and API calls across multiple instances.

•  **Caching**  
   Supabase CDN caches static assets (PDFs, images) for faster delivery.  

•  **Content Delivery Network (CDN)**  
   Serves storage files (final agreements, signature assets) from edge locations worldwide.

•  **Connection Pooling**  
   Supabase manages Postgres connection pools to keep performance high under load.

•  **CI/CD (Optional)**  
   You can integrate GitHub Actions or GitLab CI to run migrations, deploy edge functions, and run tests on each commit.

## 7. Security Measures

•  **Authentication & Authorization**  
   Supabase Auth provides JWT-based login, with tokens automatically verified on each request.  
•  **Row-Level Security (RLS)**  
   Enforces data access policies at the database level, ensuring users only see their own records.  
•  **Data Encryption**  
   - **At Rest**: PostgreSQL and storage files are encrypted by default.  
   - **In Transit**: All traffic uses HTTPS/TLS.
•  **Input Validation**  
   - **Client-Side**: Zod schemas prevent malformed data from reaching the API.  
   - **Server-Side**: Edge functions re-validate payloads before processing.
•  **Environment Variables**  
   Supabase keys and sensitive configuration are stored in environment variables, not in code.

## 8. Monitoring and Maintenance

•  **Built-in Metrics**  
   Supabase dashboard shows database performance, storage usage, and function invocations.

•  **Logging**  
   Edge function logs are available in the Supabase console for debugging and auditing.

•  **Alerts**  
   You can configure alerts for high error rates, slow queries, or low storage capacity.

•  **Maintenance Strategy**  
   - **Regular Backups**: Automated daily snapshots with point-in-time restore.  
   - **Schema Migrations**: Versioned SQL scripts run through Supabase CLI.  
   - **Dependency Updates**: Track Supabase SDK and library versions; schedule quarterly reviews.

## 9. Conclusion and Overall Backend Summary

The **react-supabase-digital-agreement** backend is built on Supabase’s managed PostgreSQL, storage, auth, and serverless functions. This setup:  
•  **Aligns with project goals** by providing secure user management, dynamic template storage, PDF generation, and e-signature workflows.  
•  **Ensures reliability and scalability** through managed services and edge functions.  
•  **Simplifies maintenance** with built-in backups, RLS policies, and a unified dashboard.  

Unique aspects:

•  **Edge-Driven PDF Generation** keeps sensitive logic on the server and scales automatically.  
•  **JSONB-Based Template Fields** allow dynamic form building without schema changes.  
•  **Comprehensive RLS Policies** ensure airtight data separation between users.

With this backend structure in place, teams can focus on refining the user experience and adding advanced features, knowing that the core services are secure, efficient, and scalable.