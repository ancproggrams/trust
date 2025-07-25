# ZZP Trust

ZZP Trust is een platform voor zzp'ers en kleine ondernemers. Het biedt een volledige administratieve suite met focus op beveiliging en compliance.

## Functionaliteiten

- **Klantenbeheer** – onboarding en validatie met KVK-, btw- en IBAN-controles
- **Facturatie** – facturen aanmaken, PDF-generatie en e‑mailverzending met statustracking
- **Standaarddiensten** – opslaan van veelgebruikte diensten en tarieven
- **Crediteuren en betalingen** – registratie van leveranciers en betalingen met audittrail
- **Documentbeheer** – uploaden en digitaal ondertekenen van documenten
- **Afspraken** – agenda voor klantafspraken
- **Dashboard** – statistieken en compliance­meldingen
- **Meertalige interface** – ondersteuning voor NL, EN, DE en FR

## Technische stack

- **Next.js** met React en TypeScript
- Styling met Tailwind CSS en Radix UI
- **Prisma** met PostgreSQL voor dataopslag (zie `schema.prisma`)
- Authenticatie via **NextAuth** met Prisma-adapter
- Services voor e-mail, workflows en PDF in `lib/services`
- API-routes onder `app/api` maken gebruik van het `secureRoute` hulpprogramma
- Audit- en compliancegegevens worden opgeslagen in ImmuDB (mock in deze demo)

## Beveiliging

- `secureRoute` middleware voor rate limiting, CSRF-validatie, inputsanitatie en security headers
- Role-based access control via `PermissionService` en `requirePermissions`
- Uitgebreide audit logging van alle belangrijke acties
- NextAuth sessiebeheer met credential-based authenticatie
- Strikte inputvalidatie bij kritieke routes zoals klantaanmaak

## Ontwikkeling

1. Clone de repository
2. Voer `yarn` uit in de map `app`
3. Start de ontwikkelserver met `yarn dev`
