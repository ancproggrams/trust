

/**
 * Legal Document Templates for Trust.io
 * Nederlandse juridische documenten conform GDPR/AVG en Nederlandse wetgeving
 */

export interface LegalDocumentTemplate {
  type: string;
  title: string;
  description: string;
  language: string;
  jurisdiction: string;
  legalBasis: string;
  content: string;
  complianceStandard: string[];
  templateVariables: string[];
}

/**
 * Algemene Voorwaarden Template
 */
export const TERMS_CONDITIONS_NL: LegalDocumentTemplate = {
  type: 'TERMS_CONDITIONS',
  title: 'Algemene Voorwaarden Trust.io',
  description: 'Algemene voorwaarden voor het gebruik van Trust.io diensten',
  language: 'nl',
  jurisdiction: 'Netherlands',
  legalBasis: 'Burgerlijk Wetboek artikel 6:231',
  complianceStandard: ['Dutch Civil Code', 'Consumer Protection Act'],
  templateVariables: ['companyName', 'kvkNumber', 'address', 'email', 'phone'],
  content: `
# Algemene Voorwaarden Trust.io

**Laatst bijgewerkt:** {{lastUpdated}}

## Artikel 1 - Definities

In deze algemene voorwaarden wordt verstaan onder:

1. **Onderneming:** {{companyName}}, gevestigd te {{address}}, ingeschreven bij de Kamer van Koophandel onder nummer {{kvkNumber}};
2. **Klant:** de natuurlijke of rechtspersoon die een overeenkomst aangaat met de onderneming;
3. **Diensten:** alle diensten die door Trust.io worden aangeboden, waaronder maar niet beperkt tot:
   - Financiële administratie en boekhouding
   - Facturatiebeheer
   - Crediteuren- en debiteurenbeheer
   - BTW-aangiften en belastingadvisering
   - Compliance monitoring

## Artikel 2 - Toepasselijkheid

1. Deze voorwaarden zijn van toepassing op alle aanbiedingen, offertes en overeenkomsten tussen de onderneming en klant.
2. Afwijkingen van deze voorwaarden zijn slechts geldig indien deze uitdrukkelijk en schriftelijk zijn overeengekomen.
3. Eventuele inkoop- of andere voorwaarden van klant worden uitdrukkelijk van de hand gewezen.

## Artikel 3 - Aanbiedingen en Totstandkoming Overeenkomst

1. Alle aanbiedingen zijn vrijblijvend, tenzij anders aangegeven.
2. Een overeenkomst komt tot stand door schriftelijke bevestiging door de onderneming of door aanvang van de werkzaamheden.
3. Wijzigingen in de overeenkomst zijn slechts geldig indien deze schriftelijk zijn overeengekomen.

## Artikel 4 - Uitvoering van de Overeenkomst

1. De onderneming zal de overeenkomst naar beste weten en kunnen uitvoeren.
2. De onderneming heeft het recht werkzaamheden te laten uitvoeren door derden.
3. Klant verplicht zich om alle informatie die noodzakelijk is voor een goede uitvoering tijdig aan te leveren.

## Artikel 5 - Geheimhouding en Privacy

1. De onderneming verplicht zich tot geheimhouding van alle vertrouwelijke informatie.
2. Persoonsgerechtens worden verwerkt conform onze Privacy Policy.
3. De onderneming neemt passende technische en organisatorische maatregelen ter beveiliging van persoonsgegevens.

## Artikel 6 - Tarieven en Betaling

1. Alle prijzen zijn exclusief BTW, tenzij anders vermeld.
2. Facturen dienen binnen {{paymentTerms}} dagen na factuurdatum te worden betaald.
3. Bij overschrijding van de betalingstermijn is klant van rechtswege in verzuim.

## Artikel 7 - Aansprakelijkheid

1. De aansprakelijkheid van de onderneming is beperkt tot het factuurbedrag van de betreffende opdracht.
2. De onderneming is niet aansprakelijk voor indirecte schade.
3. Deze beperking geldt niet indien sprake is van opzet of grove schuld.

## Artikel 8 - Beëindiging

1. De overeenkomst kan door beide partijen worden opgezegd met inachtneming van een opzegtermijn van één maand.
2. Bij beëindiging zullen alle documenten en gegevens worden geretourneerd of vernietigd.

## Artikel 9 - Geschillen en Toepasselijk Recht

1. Op alle overeenkomsten is Nederlands recht van toepassing.
2. Geschillen worden voorgelegd aan de bevoegde rechter te {{jurisdiction}}.

## Artikel 10 - Slotbepalingen

Deze voorwaarden kunnen worden gewijzigd. Wijzigingen worden tijdig gecommuniceerd en treden in werking na akkoord van klant.

---

**Contact:**  
{{companyName}}  
{{address}}  
E-mail: {{email}}  
Telefoon: {{phone}}  
KvK: {{kvkNumber}}
`
};

/**
 * Privacy Policy Template (GDPR/AVG Compliant)
 */
export const PRIVACY_POLICY_NL: LegalDocumentTemplate = {
  type: 'PRIVACY_POLICY',
  title: 'Privacy Policy Trust.io',
  description: 'Privacy beleid conform AVG/GDPR wetgeving',
  language: 'nl',
  jurisdiction: 'Netherlands',
  legalBasis: 'AVG/GDPR Artikel 13 en 14',
  complianceStandard: ['GDPR', 'AVG', 'Dutch DPA Guidelines'],
  templateVariables: ['companyName', 'kvkNumber', 'address', 'email', 'dpoEmail'],
  content: `
# Privacy Policy Trust.io

**Laatst bijgewerkt:** {{lastUpdated}}

## 1. Wie zijn wij?

{{companyName}} ("wij", "ons", "Trust.io") is een onderneming geregistreerd bij de Nederlandse Kamer van Koophandel onder nummer {{kvkNumber}}, gevestigd te {{address}}.

Voor vragen over privacy kunt u contact opnemen via {{email}} of {{dpoEmail}}.

## 2. Welke persoonsgegevens verwerken wij?

Wij verwerken de volgende categorieën persoonsgegevens:

### Klantgegevens:
- Naam en contactgegevens
- KvK-nummer en BTW-nummer
- IBAN en bankgegevens
- Communicatiegegevens (e-mail, telefoon)

### Financiële gegevens:
- Factuurgegevens
- Betalingsinformatie
- Boekhoudkundige gegevens

### Technische gegevens:
- IP-adres
- Browserinformatie
- Logbestanden

## 3. Waarom verwerken wij uw gegevens?

Wij verwerken uw persoonsgegevens voor de volgende doeleinden:

### Contractuele verplichtingen (artikel 6 lid 1 sub b AVG):
- Uitvoering van onze dienstverlening
- Communicatie over uw opdracht
- Facturatie en betalingsverwerking

### Wettelijke verplichtingen (artikel 6 lid 1 sub c AVG):
- Boekhoudkundige verplichtingen
- Belastingverplichtingen
- Anti-witwasregeling (Wwft)

### Gerechtvaardigd belang (artikel 6 lid 1 sub f AVG):
- Fraudepreventie
- Systeembeveiliging
- Bedrijfsvoering

## 4. Met wie delen wij uw gegevens?

Wij kunnen uw gegevens delen met:

- **Belastingdienst:** Voor BTW-aangiften en andere belastingverplichtingen
- **Accountants:** Voor controlewerkzaamheden
- **IT-leveranciers:** Voor systeemonderhoud (onder verwerkersovereenkomst)
- **Banken:** Voor betalingsverwerking

## 5. Beveiliging van uw gegevens

Wij nemen de volgende beveiligingsmaatregelen:

- SSL-encryptie voor alle datatransmissie
- Regelmatige back-ups met encryptie
- Toegangscontrole en autorisatie
- Regelmatige security audits
- Medewerkerstraining over privacy

## 6. Bewaartermijnen

Wij bewaren uw gegevens zo lang als noodzakelijk:

- **Klantgegevens:** 7 jaar na beëindiging contract
- **Financiële gegevens:** 7 jaar (conform Boekhoudwet)
- **Communicatie:** 2 jaar na laatste contact
- **Technische logs:** 12 maanden

## 7. Uw rechten

U heeft de volgende rechten:

### Inzage (artikel 15 AVG):
U kunt een overzicht opvragen van uw persoonsgegevens.

### Rectificatie (artikel 16 AVG):
U kunt onjuiste gegevens laten corrigeren.

### Wissing (artikel 17 AVG):
U kunt uw gegevens laten verwijderen, behoudens wettelijke bewaarplichten.

### Beperking (artikel 18 AVG):
U kunt de verwerking laten beperken in bepaalde gevallen.

### Overdraagbaarheid (artikel 20 AVG):
U kunt uw gegevens in een gestructureerd formaat opvragen.

### Bezwaar (artikel 21 AVG):
U kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.

## 8. Klachten

Voor klachten over onze gegevensverwerking kunt u contact opnemen via {{email}}.

U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens:
- Website: www.autoriteitpersoonsgegevens.nl
- Telefoon: 088 - 1805 250

## 9. Cookies

Wij gebruiken cookies voor:
- Functionele werking van de website
- Analyse van websitegebruik
- Beveiliging

Meer informatie vindt u in onze Cookie Policy.

## 10. Wijzigingen

Wij kunnen deze privacy policy wijzigen. Wijzigingen worden via e-mail gecommuniceerd.

## 11. Contact

Voor vragen over privacy:

{{companyName}}  
{{address}}  
E-mail: {{email}}  
DPO: {{dpoEmail}}  
KvK: {{kvkNumber}}
`
};

/**
 * Machtigingsovereenkomst Template
 */
export const AUTHORIZATION_AGREEMENT_NL: LegalDocumentTemplate = {
  type: 'AUTHORIZATION_AGREEMENT',
  title: 'Machtigingsovereenkomst Financiële Dienstverlening',
  description: 'Machtiging voor financiële dienstverlening en vertegenwoordiging',
  language: 'nl',
  jurisdiction: 'Netherlands',
  legalBasis: 'Burgerlijk Wetboek artikel 3:60',
  complianceStandard: ['Dutch Civil Code', 'Tax Law'],
  templateVariables: ['companyName', 'clientName', 'kvkNumber', 'clientKvkNumber'],
  content: `
# Machtigingsovereenkomst Financiële Dienstverlening

**Laatst bijgewerkt:** {{lastUpdated}}

## Partijen

**Machtiggever:**  
{{clientName}}  
KvK-nummer: {{clientKvkNumber}}

**Gemachtigde:**  
{{companyName}}  
KvK-nummer: {{kvkNumber}}

## Artikel 1 - Machtiging

Machtiggever verleent hierbij aan gemachtigde de volgende machtigingen:

### 1.1 Belastingzaken
- Het indienen van BTW-aangiften
- Communicatie met de Belastingdienst
- Het aanvragen van uitstel van betaling
- Bezwaar- en beroepsprocedures

### 1.2 Financiële administratie
- Bijhouden van de boekhouding
- Opstellen van jaarrekeningen
- Crediteuren- en debiteurenbeheer
- Facturatiebeheer

### 1.3 Wettelijke verplichtingen
- Wwft-compliance monitoring
- Rapportages aan toezichthouders
- Archivering van documenten

## Artikel 2 - Bevoegdheden

De gemachtigde is bevoegd om:

1. Namens machtiggever te handelen in bovengenoemde zaken
2. Documenten te ondertekenen die verband houden met de machtiging
3. Derden in te schakelen voor uitvoering van werkzaamheden
4. Kopieën te maken van relevante documenten

## Artikel 3 - Verplichtingen Gemachtigde

De gemachtigde verplicht zich om:

1. Zorgvuldig en deskundig te handelen
2. Geheimhouding in acht te nemen
3. Machtiggever tijdig te informeren over belangrijke ontwikkelingen
4. Verantwoording af te leggen over uitgevoerde werkzaamheden

## Artikel 4 - Verplichtingen Machtiggever

De machtiggever verplicht zich om:

1. Alle benodigde informatie tijdig te verstrekken
2. Wijzigingen in de bedrijfsvoering te melden
3. Toegang te verlenen tot relevante systemen
4. Facturen tijdig te betalen

## Artikel 5 - Duur en Beëindiging

1. Deze machtiging geldt voor onbepaalde tijd
2. Beide partijen kunnen de machtiging schriftelijk beëindigen met een opzegtermijn van één maand
3. Bij beëindiging vervallen alle verstrekte machtigingen

## Artikel 6 - Aansprakelijkheid

1. Gemachtigde is alleen aansprakelijk bij opzet of grove schuld
2. Aansprakelijkheid is beperkt tot directe schade
3. Deze beperking geldt niet voor schade door niet-nakoming van wettelijke verplichtingen

## Artikel 7 - Geheimhouding

Beide partijen verplichten zich tot geheimhouding van alle vertrouwelijke informatie die in het kader van deze machtiging wordt uitgewisseld.

## Artikel 8 - Toepasselijk Recht

Op deze machtigingsovereenkomst is Nederlands recht van toepassing.

## Ondertekening

Door digitale ondertekening van deze overeenkomst bevestigen beide partijen akkoord te gaan met bovenstaande voorwaarden.

**Machtiggever:** {{clientName}}  
**Datum:** {{signatureDate}}  
**Handtekening:** [Digitale handtekening]

**Gemachtigde:** {{companyName}}  
**Datum:** {{signatureDate}}  
**Handtekening:** [Digitale handtekening]
`
};

/**
 * Cookie Policy Template
 */
export const COOKIE_POLICY_NL: LegalDocumentTemplate = {
  type: 'COOKIE_POLICY',
  title: 'Cookie Policy Trust.io',
  description: 'Beleid voor het gebruik van cookies en tracking technologieën',
  language: 'nl',
  jurisdiction: 'Netherlands',
  legalBasis: 'Telecommunicatiewet artikel 11.7a',
  complianceStandard: ['ePrivacy Directive', 'GDPR', 'Dutch Telecom Act'],
  templateVariables: ['companyName', 'websiteUrl', 'email'],
  content: `
# Cookie Policy Trust.io

**Laatst bijgewerkt:** {{lastUpdated}}

## 1. Wat zijn cookies?

Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u onze website {{websiteUrl}} bezoekt. Cookies helpen ons de website te laten functioneren en uw gebruikervaring te verbeteren.

## 2. Welke cookies gebruiken wij?

### Functionele cookies (noodzakelijk)
Deze cookies zijn essentieel voor het functioneren van onze website:

- **Sessie cookies:** Voor inloggen en navigatie
- **Beveiligingscookies:** Voor beveiliging en fraudepreventie
- **Voorkeuren cookies:** Voor uw taalinstellingen

*Rechtsgrond:* Gerechtvaardigd belang (artikel 6 lid 1 sub f AVG)

### Analytische cookies
Voor het analyseren van websitegebruik:

- **Google Analytics:** Voor bezoekersstatistieken (geanonimiseerd)
- **Performance cookies:** Voor prestatiemonitoring

*Rechtsgrond:* Toestemming (artikel 6 lid 1 sub a AVG)

### Marketing cookies (optioneel)
Voor gerichte advertenties en communicatie:

- **Remarketing cookies:** Voor gerichte advertenties
- **Social media cookies:** Voor integratie met sociale media

*Rechtsgrond:* Toestemming (artikel 6 lid 1 sub a AVG)

## 3. Bewaartermijnen

- **Sessie cookies:** Worden verwijderd na sluiten browser
- **Analytische cookies:** 26 maanden
- **Marketing cookies:** 12 maanden
- **Voorkeuren cookies:** 12 maanden

## 4. Uw keuzes

### Toestemming beheren
U kunt uw cookie-voorkeuren aanpassen via:
- Cookie-instellingen op onze website
- Uw browserinstellingen
- Opt-out links van derde partijen

### Cookies uitschakelen
U kunt cookies uitschakelen in uw browser:
- **Chrome:** Instellingen > Privacy en beveiliging > Cookies
- **Firefox:** Instellingen > Privacy en beveiliging
- **Safari:** Voorkeuren > Privacy
- **Edge:** Instellingen > Cookies en sitemachtigingen

**Let op:** Het uitschakelen van functionele cookies kan de werking van onze website beïnvloeden.

## 5. Derde partijen

Wij gebruiken cookies van de volgende derde partijen:

### Google Analytics
- **Doel:** Websiteanalyse
- **Privacy policy:** https://policies.google.com/privacy
- **Opt-out:** https://tools.google.com/dlpage/gaoptout

### Social Media Platforms
- **LinkedIn:** Zakelijke netwerking
- **Facebook:** Social media integratie

Deze partijen kunnen uw gegevens ook voor eigen doeleinden verwerken. Raadpleeg hun privacy policies voor meer informatie.

## 6. Wijzigingen

Wij kunnen deze cookie policy wijzigen. Wijzigingen worden gecommuniceerd via:
- Melding op onze website
- E-mail naar geregistreerde gebruikers
- Update van deze pagina

## 7. Contact

Voor vragen over cookies:

{{companyName}}  
E-mail: {{email}}  
Website: {{websiteUrl}}

## 8. Externe links

- [Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl/)
- [Google Privacy Policy](https://policies.google.com/privacy)
- [Your Online Choices](http://www.youronlinechoices.eu/)
`
};

/**
 * Get all default legal document templates
 */
export const DEFAULT_LEGAL_TEMPLATES: LegalDocumentTemplate[] = [
  TERMS_CONDITIONS_NL,
  PRIVACY_POLICY_NL,
  AUTHORIZATION_AGREEMENT_NL,
  COOKIE_POLICY_NL,
];

/**
 * Get template by type and language
 */
export function getLegalTemplate(
  type: string,
  language: string = 'nl'
): LegalDocumentTemplate | undefined {
  return DEFAULT_LEGAL_TEMPLATES.find(
    template => template.type === type && template.language === language
  );
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: LegalDocumentTemplate,
  variables: Record<string, string>
): string {
  let content = template.content;
  
  // Add default variables
  const defaultVars = {
    lastUpdated: new Date().toLocaleDateString('nl-NL'),
    currentYear: new Date().getFullYear().toString(),
    ...variables
  };

  // Replace template variables
  for (const [key, value] of Object.entries(defaultVars)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value || `[${key}]`);
  }

  return content;
}

