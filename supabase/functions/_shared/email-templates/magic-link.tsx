/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>رابط تسجيل الدخول - LeadHunter</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>رابط تسجيل الدخول</Heading>
        <Text style={text}>
          اضغط على الزر أدناه لتسجيل الدخول إلى {siteName}. الرابط صالح لفترة محدودة.
        </Text>
        <Button style={button} href={confirmationUrl}>
          تسجيل الدخول
        </Button>
        <Text style={footer}>
          إذا لم تطلب هذا الرابط، تجاهل هذا الإيميل.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Tajawal', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0f14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.8', margin: '0 0 25px' }
const button = { backgroundColor: '#22c55e', color: '#0a0f14', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
