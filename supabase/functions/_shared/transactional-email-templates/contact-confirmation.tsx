/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'LeadHunter'

interface ContactConfirmationProps {
  name?: string
}

const ContactConfirmationEmail = ({ name }: ContactConfirmationProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>شكرًا لتواصلك مع {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `شكرًا لك، ${name}!` : 'شكرًا لتواصلك معنا!'}
        </Heading>
        <Text style={text}>
          وصلنا طلبك بنجاح وسنتواصل معك في أقرب وقت ممكن.
        </Text>
        <Text style={text}>
          فريق {SITE_NAME} يقدّر اهتمامك ونتطلع للعمل معك 🚀
        </Text>
        <Text style={footer}>
          مع أطيب التحيات، فريق {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: 'شكرًا لتواصلك مع LeadHunter',
  displayName: 'تأكيد طلب التواصل',
  previewData: { name: 'محمد' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Tajawal', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0f14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.8', margin: '0 0 25px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
