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
  Hr,
  Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'LeadHunter'

interface NewContactNotificationProps {
  name?: string
  email?: string
  phone?: string
  message?: string
}

const NewContactNotificationEmail = ({ name, email, phone, message }: NewContactNotificationProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>طلب اشتراك جديد من {name || 'زائر'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={badge}>
          <Text style={badgeText}>🔔 طلب جديد</Text>
        </Section>
        <Heading style={h1}>وصلك طلب اشتراك جديد!</Heading>
        <Text style={text}>تم استلام طلب تواصل جديد عبر موقع {SITE_NAME}:</Text>
        <Hr style={hr} />
        <Section style={detailsBox}>
          <Text style={label}>الاسم</Text>
          <Text style={value}>{name || '—'}</Text>
          <Text style={label}>البريد الإلكتروني</Text>
          <Text style={value}>{email || '—'}</Text>
          {phone && (
            <>
              <Text style={label}>رقم الجوال</Text>
              <Text style={value}>{phone}</Text>
            </>
          )}
          {message && (
            <>
              <Text style={label}>الرسالة</Text>
              <Text style={value}>{message}</Text>
            </>
          )}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          يمكنك مراجعة جميع الطلبات من لوحة التحكم
        </Text>
      </Container>
    </Body>
  </Html>
)

const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'support@leadhunterr.com'

export const template = {
  component: NewContactNotificationEmail,
  subject: (data: Record<string, any>) => `طلب اشتراك جديد من ${data.name || 'زائر'}`,
  displayName: 'إشعار طلب اشتراك جديد',
  to: ADMIN_EMAIL,
  previewData: { name: 'محمد العتيبي', email: 'test@example.com', phone: '0512345678', message: 'مهتم بباقة Pro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Tajawal', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const badge = { backgroundColor: '#00e676', borderRadius: '8px', padding: '4px 12px', display: 'inline-block' as const, marginBottom: '16px' }
const badgeText = { color: '#0a0f14', fontSize: '13px', fontWeight: 'bold' as const, margin: '0' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0f14', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.8', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const detailsBox = { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px 20px' }
const label = { fontSize: '12px', color: '#999999', margin: '0 0 2px', fontWeight: 'bold' as const }
const value = { fontSize: '15px', color: '#0a0f14', margin: '0 0 14px' }
const footer = { fontSize: '12px', color: '#999999', margin: '16px 0 0' }
