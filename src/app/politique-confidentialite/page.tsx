'use client'

import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-[#F4F0EB]">
      {/* Simple Header */}
      <header className="border-b border-[#1A1A1A]/10 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-[#C96442] font-light text-2xl">|</span>
            <span className="font-bold text-xl tracking-[0.06em]">D</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-[#1A1A1A]/50 mb-12">Dernière mise à jour : 20 mars 2026</p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-[#C96442]/5 border-l-4 border-[#C96442] p-6 rounded-r-xl mb-8">
              <p className="text-[#1A1A1A]/80 leading-relaxed">
                DIGITN s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.
              </p>
            </div>
          </section>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              1. Données collectées
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Nous collectons les données suivantes lorsque vous utilisez notre site web :
            </p>

            <div className="space-y-4">
              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Données fournies directement</h3>
                <ul className="list-disc list-inside text-[#1A1A1A]/70 space-y-2">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Message de contact</li>
                  <li>Informations sur votre projet</li>
                </ul>
              </div>

              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Données collectées automatiquement</h3>
                <ul className="list-disc list-inside text-[#1A1A1A]/70 space-y-2">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Pages visitées</li>
                  <li>Durée de visite</li>
                  <li>Données de navigation (via cookies)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              2. Utilisation des données
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Vos données personnelles sont utilisées pour :
            </p>
            <div className="bg-white/50 p-6 rounded-xl border border-[#1A1A1A]/5">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-sm font-bold">1</span>
                  <span className="text-[#1A1A1A]/70">Répondre à vos demandes de contact et devis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-sm font-bold">2</span>
                  <span className="text-[#1A1A1A]/70">Améliorer nos services et notre site web</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-sm font-bold">3</span>
                  <span className="text-[#1A1A1A]/70">Analyser l'utilisation du site (via Google Analytics)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-sm font-bold">4</span>
                  <span className="text-[#1A1A1A]/70">Vous envoyer des informations sur nos services (avec votre consentement)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-sm font-bold">5</span>
                  <span className="text-[#1A1A1A]/70">Respecter nos obligations légales</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              3. Cookies et technologies similaires
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Notre site utilise des cookies pour améliorer votre expérience :
            </p>

            <div className="space-y-4">
              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Cookies essentiels</h3>
                <p className="text-[#1A1A1A]/70 text-sm">
                  Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.
                </p>
              </div>

              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Cookies analytiques</h3>
                <p className="text-[#1A1A1A]/70 text-sm">
                  Google Analytics - nous permettent de comprendre comment vous utilisez notre site.
                </p>
              </div>

              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Cookies marketing</h3>
                <p className="text-[#1A1A1A]/70 text-sm">
                  Meta Pixel - utilisés pour mesurer l'efficacité de nos campagnes publicitaires.
                </p>
              </div>
            </div>

            <p className="text-[#1A1A1A]/70 leading-relaxed mt-4 text-sm">
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              4. Partage des données
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec :
            </p>
            <div className="bg-white/50 p-6 rounded-xl border border-[#1A1A1A]/5">
              <ul className="list-disc list-inside text-[#1A1A1A]/70 space-y-2">
                <li>Nos prestataires de services (hébergement, email, analytics)</li>
                <li>Les autorités légales si requis par la loi</li>
                <li>Nos partenaires commerciaux (uniquement avec votre consentement explicite)</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              5. Sécurité des données
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <div className="flex items-center gap-3 mb-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C96442" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <h3 className="font-semibold text-[#1A1A1A]">Cryptage SSL</h3>
                </div>
                <p className="text-[#1A1A1A]/70 text-sm">Toutes les données sont transmises de manière sécurisée</p>
              </div>

              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <div className="flex items-center gap-3 mb-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C96442" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <h3 className="font-semibold text-[#1A1A1A]">Accès restreint</h3>
                </div>
                <p className="text-[#1A1A1A]/70 text-sm">Seul le personnel autorisé accède aux données</p>
              </div>

              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <div className="flex items-center gap-3 mb-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C96442" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                  <h3 className="font-semibold text-[#1A1A1A]">Sauvegardes</h3>
                </div>
                <p className="text-[#1A1A1A]/70 text-sm">Sauvegardes régulières et sécurisées</p>
              </div>

              <div className="bg-white/50 p-5 rounded-xl border border-[#1A1A1A]/5">
                <div className="flex items-center gap-3 mb-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C96442" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <h3 className="font-semibold text-[#1A1A1A]">Mises à jour</h3>
                </div>
                <p className="text-[#1A1A1A]/70 text-sm">Systèmes régulièrement mis à jour</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              6. Vos droits
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Conformément à la législation tunisienne sur la protection des données, vous disposez des droits suivants :
            </p>
            <div className="bg-[#EAE5D9] p-6 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#C96442] font-bold">→</span>
                <div>
                  <strong className="text-[#1A1A1A]">Droit d'accès :</strong>
                  <span className="text-[#1A1A1A]/70"> Consulter vos données personnelles</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C96442] font-bold">→</span>
                <div>
                  <strong className="text-[#1A1A1A]">Droit de rectification :</strong>
                  <span className="text-[#1A1A1A]/70"> Corriger vos données inexactes</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C96442] font-bold">→</span>
                <div>
                  <strong className="text-[#1A1A1A]">Droit à l'effacement :</strong>
                  <span className="text-[#1A1A1A]/70"> Supprimer vos données</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C96442] font-bold">→</span>
                <div>
                  <strong className="text-[#1A1A1A]">Droit d'opposition :</strong>
                  <span className="text-[#1A1A1A]/70"> Refuser le traitement de vos données</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C96442] font-bold">→</span>
                <div>
                  <strong className="text-[#1A1A1A]">Droit à la portabilité :</strong>
                  <span className="text-[#1A1A1A]/70"> Récupérer vos données dans un format structuré</span>
                </div>
              </div>
            </div>
            <p className="text-[#1A1A1A]/70 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <a href={`mailto:${siteConfig.email}`} className="text-[#C96442] hover:underline font-medium">{siteConfig.email}</a>
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              7. Conservation des données
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées :
            </p>
            <div className="bg-white/50 p-6 rounded-xl border border-[#1A1A1A]/5">
              <ul className="list-disc list-inside text-[#1A1A1A]/70 space-y-2">
                <li>Données de contact : 3 ans après le dernier contact</li>
                <li>Données de navigation : 13 mois (cookies)</li>
                <li>Données contractuelles : Durée légale de conservation</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              8. Modifications de la politique
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              9. Contact
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <div className="bg-[#EAE5D9] p-6 rounded-xl">
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-2">
                <strong className="text-[#1A1A1A]">Email :</strong> <a href={`mailto:${siteConfig.email}`} className="text-[#C96442] hover:underline">{siteConfig.email}</a>
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-2">
                <strong className="text-[#1A1A1A]">Téléphone :</strong> <a href={`tel:${siteConfig.phoneRaw}`} className="text-[#C96442] hover:underline">{siteConfig.phone}</a>
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed">
                <strong className="text-[#1A1A1A]">Adresse :</strong> {siteConfig.address}
              </p>
            </div>
          </section>
        </div>

        {/* Back to home button */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#1A1A1A]/85 transition-all duration-300"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M12 7H2m0 0l4-4M2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-[#1A1A1A]/10 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-[#1A1A1A]/40">&copy; 2026 DIGITN. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
