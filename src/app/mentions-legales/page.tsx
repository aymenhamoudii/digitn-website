'use client'

import Link from 'next/link'
import { siteConfig } from '@/config/site'

export default function MentionsLegales() {
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
          Mentions Légales
        </h1>
        <p className="text-sm text-[#1A1A1A]/50 mb-12">Dernière mise à jour : 20 mars 2026</p>

        <div className="prose prose-lg max-w-none">
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              1. Informations légales
            </h2>
            <div className="bg-white/50 p-6 rounded-xl border border-[#1A1A1A]/5">
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Raison sociale :</strong> DIGITN
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Forme juridique :</strong> SUARL (Société Unipersonnelle à Responsabilité Limitée)
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Siège social :</strong> {siteConfig.address}
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Email :</strong> {siteConfig.email}
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Téléphone :</strong> {siteConfig.phone}
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Numéro d'immatriculation :</strong> En cours d'immatriculation
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed">
                <strong className="text-[#1A1A1A]">Directeur de publication :</strong> Gérant de DIGITN
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              2. Hébergement
            </h2>
            <div className="bg-white/50 p-6 rounded-xl border border-[#1A1A1A]/5">
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Hébergeur :</strong> Vercel Inc.
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                <strong className="text-[#1A1A1A]">Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed">
                <strong className="text-[#1A1A1A]">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#C96442] hover:underline">vercel.com</a>
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              3. Propriété intellectuelle
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, etc.) est la propriété exclusive de DIGITN, sauf mention contraire.
            </p>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord écrit de DIGITN.
            </p>
            <p className="text-[#1A1A1A]/70 leading-relaxed">
              L'exploitation non autorisée du site ou de l'un des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              4. Limitation de responsabilité
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              DIGITN s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site, dont elle se réserve le droit de corriger, à tout moment et sans préavis, le contenu.
            </p>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Toutefois, DIGITN ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
            </p>
            <p className="text-[#1A1A1A]/70 leading-relaxed">
              En conséquence, DIGITN décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              5. Liens hypertextes
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Le site peut contenir des liens hypertextes vers d'autres sites. DIGITN n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
            <p className="text-[#1A1A1A]/70 leading-relaxed">
              La création de liens hypertextes vers le site digitn.tn nécessite l'autorisation préalable écrite de DIGITN.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              6. Droit applicable
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed">
              Les présentes mentions légales sont régies par le droit tunisien. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux tunisiens conformément aux règles de compétence en vigueur.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              7. Contact
            </h2>
            <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
              Pour toute question concernant les mentions légales, vous pouvez nous contacter :
            </p>
            <div className="bg-[#EAE5D9] p-6 rounded-xl">
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-2">
                <strong className="text-[#1A1A1A]">Email :</strong> {siteConfig.email}
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-2">
                <strong className="text-[#1A1A1A]">Téléphone :</strong> {siteConfig.phone}
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
