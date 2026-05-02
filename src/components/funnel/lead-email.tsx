import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { Lead } from './form-schema';

// Owner-facing notification: every submission lands here regardless of
// qualification. Layout is deliberately plain (no images, no buttons) so it
// renders identically across mail clients and so the owner can scan it on a
// phone in 5 seconds.
type Props = {
  lead: Lead;
  qualified: boolean;
  score: number;
};

export function LeadNotificationEmail({ lead, qualified, score }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`${qualified ? 'Qualified' : 'Exploratory'} lead: ${lead.name} (${lead.company})`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading as="h1" style={headingStyle}>
            {qualified ? 'Qualified lead' : 'Exploratory lead'} - score {score}
          </Heading>
          <Section>
            <Row label="Name" value={lead.name} />
            <Row label="Email" value={lead.email} />
            <Row label="Company" value={lead.company} />
            <Row label="Industry" value={lead.industry} />
            <Row label="Project type" value={lead.projectTypes.join(', ')} />
            <Row label="Hourly rate" value={`CAD $${lead.hourlyRate} / hr + HST`} />
            <Row label="Timeline" value={lead.timeline} />
          </Section>
          <Hr style={hrStyle} />
          <Heading as="h2" style={subheadingStyle}>
            Description
          </Heading>
          <Text style={descStyle}>{lead.description}</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Applicant-facing confirmation, qualified branch. Includes the direct phone
// line - per spec section 6.5, the phone number is only ever shown after a
// lead has cleared the budget + timeline gates.
export function QualifiedConfirmationEmail({ lead }: { lead: Lead }) {
  return (
    <Html>
      <Head />
      <Preview>Thanks {lead.name} - here is the next step</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading as="h1" style={headingStyle}>
            Thanks, {lead.name}.
          </Heading>
          <Text style={paragraphStyle}>
            I have your note about {lead.company}. The Calendly link on the contact page lets you
            grab a 30-minute slot directly on my calendar. I aim to respond within one business day.
          </Text>
          <Text style={paragraphStyle}>
            If your situation is time-sensitive, the fastest route is the direct line:
          </Text>
          <Text style={phoneStyle}>+1 (438) 451-6007</Text>
          <Hr style={hrStyle} />
          <Text style={signatureStyle}>Sa&iuml;d A&iuml;ssani - Unbounded Technologies Inc.</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Applicant-facing confirmation, exploratory branch. Same warmth, no phone
// line, no Calendly nudge - keeps the funnel honest.
export function ExploratoryConfirmationEmail({ lead }: { lead: Lead }) {
  return (
    <Html>
      <Head />
      <Preview>Thanks {lead.name} - I will be in touch</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading as="h1" style={headingStyle}>
            Thanks, {lead.name}.
          </Heading>
          <Text style={paragraphStyle}>
            I have your note about {lead.company} and will reach out by email within a few business
            days once I have had a chance to review it properly.
          </Text>
          <Hr style={hrStyle} />
          <Text style={signatureStyle}>Sa&iuml;d A&iuml;ssani - Unbounded Technologies Inc.</Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={rowStyle}>
      <strong style={labelStyle}>{label}:</strong> {value}
    </Text>
  );
}

const bodyStyle = {
  backgroundColor: '#07060d',
  color: '#f4f5fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  margin: 0,
  padding: '32px 0',
};
const containerStyle = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px',
  backgroundColor: '#0d0c16',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
};
const headingStyle = { fontSize: '20px', fontWeight: 600, margin: '0 0 16px', color: '#f4f5fa' };
const subheadingStyle = {
  fontSize: '14px',
  fontWeight: 600,
  margin: '8px 0',
  color: '#bcbed0',
};
const paragraphStyle = {
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '12px 0',
  color: '#bcbed0',
};
const rowStyle = { fontSize: '14px', margin: '6px 0', color: '#f4f5fa' };
const labelStyle = { color: '#bcbed0', display: 'inline-block', minWidth: '110px' };
const descStyle = {
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0',
  color: '#bcbed0',
  whiteSpace: 'pre-wrap' as const,
};
const phoneStyle = {
  fontSize: '20px',
  fontWeight: 600,
  margin: '12px 0 16px',
  color: '#5dc7ff',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};
const hrStyle = { borderColor: 'rgba(255,255,255,0.08)', margin: '24px 0' };
const signatureStyle = {
  fontSize: '13px',
  color: '#bcbed0',
  margin: '8px 0 0',
};
