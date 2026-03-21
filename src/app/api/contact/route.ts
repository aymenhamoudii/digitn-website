import { NextRequest, NextResponse } from 'next/server'
import { siteConfig } from '@/config/site'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, plan } = body

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Here you would integrate with your email service
    // Options: SendGrid, Resend, Nodemailer, etc.
    // For now, we'll just log and return success

    console.log('Contact form submission:', {
      name,
      email,
      message,
      plan,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrate with email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'contact@digitn.tn',
    //   to: siteConfig.email,
    //   subject: `Nouveau contact: ${name}`,
    //   html: `
    //     <h2>Nouveau message de contact</h2>
    //     <p><strong>Nom:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     ${plan ? `<p><strong>Plan:</strong> ${plan}</p>` : ''}
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `,
    // })

    return NextResponse.json(
      {
        success: true,
        message: 'Message envoyé avec succès',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
