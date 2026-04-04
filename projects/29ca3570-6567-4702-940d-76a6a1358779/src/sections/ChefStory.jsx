import { ScrollReveal } from '../components/ScrollReveal';
import { Award, Leaf, Heart } from 'lucide-react';

export default function ChefStory() {
  const features = [
    {
      icon: Award,
      title: 'Award-Winning',
      description: 'Michelin-starred cuisine crafted with passion',
    },
    {
      icon: Leaf,
      title: 'Farm-to-Table',
      description: 'Sourced daily from local artisan producers',
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every dish tells a story of craftsmanship',
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-charcoal-950 overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
        <div className="absolute inset-0 border-l border-gold-500" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Image Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ScrollReveal direction="left">
              <div className="relative">
                {/* Main Image */}
                <div className="relative overflow-hidden rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1977&auto=format&fit=crop"
                    alt="Chef Jean-Claude preparing a dish"
                    className="w-full h-[500px] object-cover img-vintage"
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 to-transparent" />
                </div>

                {/* Floating Quote Card */}
                <div className="absolute -bottom-6 -right-6 bg-burgundy-900 p-6 max-w-xs shadow-2xl rounded-sm">
                  <p className="font-serif italic text-cream-100 text-lg leading-relaxed">
                    "The best ingredients speak for themselves. My role is merely to give them a voice."
                  </p>
                  <p className="text-gold-400 text-sm mt-4 font-medium tracking-wide">
                    — Chef Jean-Claude
                  </p>
                </div>

                {/* Gold Border Accent */}
                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-gold-600/30 rounded-sm pointer-events-none" />
              </div>
            </ScrollReveal>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7 order-1 lg:order-2 lg:pl-12">
            <ScrollReveal>
              <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-4 font-medium">
                Our Story
              </p>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-cream-50 font-semibold leading-tight mb-8">
                A Legacy of
                <span className="block text-gradient-gold">Culinary Excellence</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="space-y-6 text-cream-300 text-lg leading-relaxed">
                <p className="drop-cap">
                  For three decades, La Maison d'Or has stood as a beacon of fine dining 
                  in the heart of wine country. What began as a humble bistro has evolved 
                  into a sanctuary for those who appreciate the art of traditional French 
                  cuisine, elevated through modern techniques and local ingredients.
                </p>
                <p>
                  Executive Chef Jean-Claude Moreau brings over 40 years of culinary 
                  wisdom to our kitchen. Trained in Lyon under the legendary Paul Bocuse, 
                  he returned to his family's wine country roots to create something 
                  uniquely his own—a dining experience that honors the rustic traditions 
                  of his grandmother's kitchen while pushing the boundaries of contemporary 
                  gastronomy.
                </p>
                <p>
                  Our commitment extends beyond the plate. We partner exclusively with 
                  local farms and artisans who share our values of sustainability and 
                  uncompromising quality. From heritage breed meats to organic vegetables 
                  harvested at dawn, every ingredient has a provenance we're proud to share.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature List */}
            <ScrollReveal delay={400}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-12 border-t border-charcoal-800">
                {features.map((feature, index) => (
                  <div key={index} className="group">
                    <div className="mb-4 text-gold-500 group-hover:text-gold-400 transition-colors">
                      <feature.icon size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-xl text-cream-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-cream-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
