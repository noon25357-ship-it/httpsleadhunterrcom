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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>رمز التحقق الخاص بك</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>تأكيد الهوية</Heading>
        <Text style={text}>استخدم الرمز أدناه لتأكيد هويتك:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          الرمز صالح لفترة محدودة. إذا لم تطلب هذا، تجاهل الإيميل.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Tajawal', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a0f14', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.8', margin: '0 0 25px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#22c55e', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
