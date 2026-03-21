export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que DIGITN (Digi TN)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DIGITN (Digi TN) est une agence web tunisienne spécialisée dans la création de sites web performants, e-commerce et solutions digitales. Nous avons livré plus de 50 projets avec 98% de satisfaction client.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels services propose DIGITN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DIGITN propose le développement web (sites vitrines, e-commerce, applications), le design UI/UX, le référencement SEO, le marketing digital et la maintenance de sites web.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien coûte la création d\'un site web en Tunisie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nos tarifs commencent à 499 DT pour un site vitrine Starter (5 pages), 999 DT pour un site Business (15 pages avec SEO complet), et 1999 DT pour un site e-commerce complet avec paiement en ligne.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel est le délai de livraison d\'un site web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le délai de livraison est de 2 à 4 semaines selon la complexité du projet. Nous fournissons un devis gratuit sous 24h et répondons rapidement à toutes vos questions.',
      },
    },
    {
      '@type': 'Question',
      name: 'DIGITN propose-t-il le référencement SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, tous nos sites incluent un SEO de base. Nos formules Business et E-commerce incluent un référencement SEO complet pour améliorer votre visibilité sur Google en Tunisie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment contacter DIGITN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vous pouvez nous contacter par WhatsApp au +216 52 335 899, par email à contact@digitn.tn, ou via notre formulaire de contact. Nous répondons sous 24h.',
      },
    },
  ],
}

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Création de sites web et solutions digitales',
  provider: {
    '@type': 'LocalBusiness',
    name: 'DIGITN',
    alternateName: ['Digi TN', 'Digi-TN'],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Tunisia',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services Web DIGITN',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Développement Web',
          description: 'Sites vitrines, e-commerce et applications web sur mesure',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Design UI/UX',
          description: 'Interfaces élégantes pensées pour convertir',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'SEO & Marketing',
          description: 'Référencement naturel et stratégies digitales',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Maintenance',
          description: 'Support technique et mises à jour régulières',
        },
      },
    ],
  },
}
