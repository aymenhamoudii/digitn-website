'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

const storyData = [
    { targetName: 'Tunis', quote: 'DIGITN a transformé notre présence en ligne. 3x plus de ventes en 2 mois.' },
    { targetName: 'Nabeul', quote: 'Tourisme et agriculture rencontrent les chaînes d\'approvisionnement modernes.' },
    { targetName: 'Sousse', quote: 'L\'innovation digitale remodèle notre économie côtière jour après jour.' },
    { targetName: 'Sfax', quote: 'Je pense que je peux même lancer une entreprise seul, avec l\'IA comme partenaire.' },
    { targetName: 'Kairouan', quote: 'Notre patrimoine historique est préservé grâce aux réalités numériques.' },
    { targetName: 'Gabes', quote: 'La tech verte résout nos plus anciens défis industriels.' },
    { targetName: 'Medenine', quote: 'Le travail à distance apporte des opportunités incroyables à Djerba.' },
    { targetName: 'Bizerte', quote: 'Les vents du nord alimentent nos nouveaux centres de données durables.' },
]

function normalizeString(str: string | undefined | null) {
    if (!str) return ''
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function sanitizeId(str: string | undefined | null) {
    if (!str) return 'unknown'
    return normalizeString(str).replace(/[^a-z0-9]/g, '-')
}

export default function GlobeMap() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [typedText, setTypedText] = useState('')
    const [stateName, setStateName] = useState('')
    const [loaded, setLoaded] = useState(false)

    const projRef = useRef<d3.GeoProjection | null>(null)
    const pathRef = useRef<d3.GeoPath | null>(null)
    const storiesRef = useRef<any[]>([])
    const cancelledRef = useRef(false)

    // Smooth transition between locations (using requestAnimationFrame instead of broken d3.select({}).transition())
    const tweenProjection = useCallback((targetRotate: number[], targetScale: number, duration: number) => {
        return new Promise<void>(resolve => {
            if (cancelledRef.current || !projRef.current || !svgRef.current) {
                resolve()
                return
            }

            const projection = projRef.current
            const mapGroup = d3.select(svgRef.current).select('#map-group')
            const pathGenerator = pathRef.current!

            const r0 = projection.rotate() as [number, number, number]
            const s0 = projection.scale()
            const interpRotate = d3.interpolate([r0[0], r0[1], r0[2]], targetRotate as [number, number, number])
            const interpScale = d3.interpolate(s0, targetScale)
            let start: number | null = null
            let frameCount = 0

            const step = (ts: number) => {
                if (cancelledRef.current) { resolve(); return }
                if (!start) start = ts
                const progress = Math.min((ts - start) / duration, 1)
                const eased = d3.easeCubicInOut(progress)

                projection.rotate(interpRotate(eased) as [number, number, number]).scale(interpScale(eased))

                // Only redraw paths every 2nd frame to reduce DOM work
                frameCount++
                if (frameCount % 2 === 0 || progress >= 1) {
                    mapGroup.selectAll('path').attr('d', pathGenerator as any)
                }

                if (progress < 1) {
                    requestAnimationFrame(step)
                } else {
                    // Final redraw to ensure accuracy
                    mapGroup.selectAll('path').attr('d', pathGenerator as any)
                    resolve()
                }
            }
            requestAnimationFrame(step)
        })
    }, [])

    // Initialize D3 globe
    useEffect(() => {
        if (!svgRef.current) return

        let stale = false // Prevent StrictMode double-render from appending duplicates

        // Use a wide viewBox for full-screen coverage
        const width = 1400
        const height = 900
        const svg = d3.select(svgRef.current)
        const mapGroup = svg.select('#map-group')
        mapGroup.selectAll('*').remove()

        // Shift globe to the right side of the screen (width * 0.7)
        const projection = d3.geoOrthographic()
            .scale(2200) // Fixed consistent zoom
            .translate([width * 0.7, height / 2])
            .clipAngle(90)

        projRef.current = projection
        const pathGenerator = d3.geoPath().projection(projection)
        pathRef.current = pathGenerator

        const loadData = async () => {
            try {
                let worldTopo: any;
                let tnTopo: any;

                // ==========================================
                // 1. Load World Data (Local first, CDN fallback)
                // ==========================================
                try {
                    const wRes = await fetch('/data/world-110m.json')
                    if (!wRes.ok) throw new Error('Local world file missing')
                    worldTopo = await wRes.json()
                } catch {
                    try {
                        const wRes2 = await fetch('/world-110m.json')
                        if (!wRes2.ok) throw new Error('Local world file missing')
                        worldTopo = await wRes2.json()
                    } catch {
                        // Fallback to external CDN
                        const wResCDN = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
                        worldTopo = await wResCDN.json()
                    }
                }

                // ==========================================
                // 2. Load Tunisia Data (Local first, CDN fallback)
                // ==========================================
                try {
                    const tRes = await fetch('/data/tn-all.topo.json')
                    if (!tRes.ok) throw new Error('Local tn file missing')
                    tnTopo = await tRes.json()
                } catch {
                    try {
                        const tRes2 = await fetch('/tn-all.topo.json')
                        if (!tRes2.ok) throw new Error('Local tn file missing')
                        tnTopo = await tRes2.json()
                    } catch {
                        const targetUrl = 'https://code.highcharts.com/mapdata/countries/tn/tn-all.topo.json'
                        try {
                            const tResCDN = await fetch(targetUrl)
                            if (!tResCDN.ok) throw new Error('CDN fetch failed')
                            tnTopo = await tResCDN.json()
                        } catch {
                            // Final fallback for strict CORS environments
                            const pRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`)
                            tnTopo = await pRes.json()
                        }
                    }
                }

                if (stale) return

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const worldData = (topojson.feature(worldTopo, worldTopo.objects.countries) as any).features as any[]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tnGeoData = (topojson.feature(tnTopo, (Object.values(tnTopo.objects)[0] as any)) as any).features as any[]

                if (stale) return
                mapGroup.selectAll('*').remove()

                // Draw globe sphere (Background of the earth)
                mapGroup.append('path')
                    .datum({ type: 'Sphere' } as any)
                    .attr('class', 'globe-sphere')
                    .attr('d', pathGenerator as any)
                    .attr('fill', '#F4F0EB') // Matches the background
                    .attr('stroke', '#d1cbc1')
                    .attr('stroke-width', '1px')

                // Graticules (Grid lines)
                mapGroup.append('path')
                    .datum(d3.geoGraticule()())
                    .attr('class', 'graticule')
                    .attr('d', pathGenerator as any)
                    .attr('fill', 'none')
                    .attr('stroke', 'rgba(0, 0, 0, 0.06)')
                    .attr('stroke-width', '0.5px')

                // World countries (Rest of the world)
                mapGroup.selectAll('.world-path')
                    .data(worldData)
                    .enter()
                    .append('path')
                    .attr('class', 'world-path')
                    .attr('d', pathGenerator as any)
                    .attr('fill', '#e8e5dc')
                    .attr('stroke', '#d1cbc1')
                    .attr('stroke-width', '0.4px')

                // Tunisia states
                mapGroup.selectAll('.state-path')
                    .data(tnGeoData)
                    .enter()
                    .append('path')
                    .attr('class', 'state-path')
                    .attr('d', pathGenerator as any)
                    .attr('id', (d: any) => `state-${sanitizeId(d?.properties?.name || d?.properties?.NAME_1)}`)
                    .attr('fill', '#e8e5dc')
                    .attr('stroke', '#a39e94')
                    .attr('stroke-width', '0.8px')
                    .style('transition', 'fill 0.5s ease, stroke-width 0.5s ease')

                // Map story features to geographic data
                const stories = storyData.map(story => {
                    const feature = tnGeoData.find((f: any) => {
                        const propName = f?.properties?.name || f?.properties?.NAME_1 || ''
                        return normalizeString(propName).includes(normalizeString(story.targetName))
                    })
                    if (feature) {
                        return {
                            ...story,
                            feature,
                            id: `state-${sanitizeId((feature as any).properties?.name || (feature as any).properties?.NAME_1)}`,
                            centroid: d3.geoCentroid(feature as any),
                        }
                    }
                    return { ...story, feature: null, id: '', centroid: [0, 0] as [number, number] }
                })

                storiesRef.current = stories
                if (!stale) setLoaded(true)
            } catch (err) {
                if (!stale) console.error('Failed to load globe data:', err)
            }
        }

        loadData()

        return () => {
            stale = true
            mapGroup.selectAll('*').remove()
        }
    }, [])

    // Animation loop
    useEffect(() => {
        if (!loaded) return

        cancelledRef.current = false
        let idx = 0

        const loop = async () => {
            await new Promise(r => setTimeout(r, 500))

            while (!cancelledRef.current) {
                const story = storiesRef.current[idx]
                if (!story?.feature) {
                    idx = (idx + 1) % storiesRef.current.length
                    continue
                }

                setCurrentIndex(idx)
                setStateName('')
                setTypedText('')

                // Clear previously active states (remove .active CSS class)
                if (svgRef.current) {
                    d3.select(svgRef.current)
                        .selectAll('.state-path')
                        .classed('active', false)
                }

                // 1. Zoom OUT to global/country view
                if (!cancelledRef.current) await tweenProjection([-9.5, -34], 2200, 1200)
                if (cancelledRef.current) break
                await new Promise(r => setTimeout(r, 200)) // slight pause

                // Highlight current state (add .active CSS class)
                if (svgRef.current) {
                    d3.select(svgRef.current)
                        .select(`#${story.id}`)
                        .classed('active', true)
                }

                // 2. Zoom IN to the new state
                const [lon, lat] = story.centroid
                if (!cancelledRef.current) await tweenProjection([-lon, -lat], 6000, 1500)
                if (cancelledRef.current) break

                // Set state name and type quote
                setStateName(story.targetName)

                // Typing effect
                const full = story.quote
                for (let i = 0; i <= full.length; i++) {
                    if (cancelledRef.current) break
                    setTypedText(full.slice(0, i))
                    await new Promise(r => setTimeout(r, Math.max(15, 1200 / full.length)))
                }
                if (cancelledRef.current) break

                // Hold view for reading
                let waitTime = 0
                while (waitTime < 3500 && !cancelledRef.current) {
                    await new Promise(r => setTimeout(r, 100))
                    waitTime += 100
                }

                idx = (idx + 1) % storiesRef.current.length
            }
        }

        loop()
        return () => { cancelledRef.current = true }
    }, [loaded, tweenProjection])

    return (
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#F4F0EB] via-[#EAE5D9] to-[#F4F0EB]">

            {/* Decorative elements for depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated gradient orbs */}
                <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-radial from-[#C96442]/8 to-transparent rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-radial from-[#C96442]/6 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                {/* Radial gradient overlay for focus */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#F4F0EB]/30" />
            </div>

            {/* Globe container with enhanced styling */}
            <div className="relative lg:absolute lg:inset-0 w-full h-[40vh] min-h-[250px] lg:h-full">
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Triple ring loader */}
                            <div className="w-20 h-20 border-[3px] border-[#C96442]/20 border-t-[#C96442] rounded-full animate-spin" />
                            <div className="absolute inset-0 w-20 h-20 border-[3px] border-transparent border-b-[#C96442]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            <div className="absolute inset-2 w-16 h-16 border-[3px] border-transparent border-l-[#C96442]/60 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                        </div>
                    </div>
                )}

                {/* Enhanced SVG with filters and effects */}
                <svg
                    ref={svgRef}
                    viewBox="0 0 1400 900"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full select-none"
                    style={{
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out',
                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.08))'
                    }}
                    aria-label="Carte interactive de la Tunisie"
                >
                    <defs>
                        {/* Enhanced gradient for map background */}
                        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C96442" stopOpacity="0.12" />
                            <stop offset="50%" stopColor="#C96442" stopOpacity="0.06" />
                            <stop offset="100%" stopColor="#C96442" stopOpacity="0.12" />
                        </linearGradient>

                        {/* Radial gradient for sphere */}
                        <radialGradient id="sphereGradient" cx="40%" cy="40%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#F4F0EB" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#E8E5DC" stopOpacity="0.05" />
                        </radialGradient>

                        {/* Enhanced glow effect for active regions */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feFlood floodColor="#C96442" floodOpacity="0.4" result="glowColor"/>
                            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow"/>
                            <feMerge>
                                <feMergeNode in="softGlow"/>
                                <feMergeNode in="softGlow"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>

                        {/* Subtle inner shadow for depth */}
                        <filter id="innerShadow">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                            <feOffset dx="0" dy="2" result="offsetblur"/>
                            <feFlood floodColor="#1A1A1A" floodOpacity="0.05"/>
                            <feComposite in2="offsetblur" operator="in"/>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>

                        {/* Animated pulse for active state */}
                        <filter id="pulse">
                            <feGaussianBlur stdDeviation="2" result="blur"/>
                            <feFlood floodColor="#C96442" floodOpacity="0.6" result="color"/>
                            <feComposite in="color" in2="blur" operator="in" result="glow"/>
                            <feMerge>
                                <feMergeNode in="glow"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>

                        {/* Pattern for Tunisia highlight */}
                        <pattern id="tunisiaPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#C96442" opacity="0.1"/>
                        </pattern>
                    </defs>
                    <g id="map-group" />
                </svg>

                {/* Decorative compass rose */}
                <div className="absolute bottom-8 right-8 hidden lg:block pointer-events-none">
                    <div className="relative w-16 h-16 opacity-20">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1A1A1A" strokeWidth="1"/>
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#1A1A1A" strokeWidth="0.5"/>
                            <path d="M50 5 L55 45 L50 50 L45 45 Z" fill="#C96442"/>
                            <path d="M50 95 L55 55 L50 50 L45 55 Z" fill="#1A1A1A" opacity="0.3"/>
                            <path d="M5 50 L45 55 L50 50 L45 45 Z" fill="#1A1A1A" opacity="0.3"/>
                            <path d="M95 50 L55 55 L50 50 L55 45 Z" fill="#1A1A1A" opacity="0.3"/>
                            <text x="50" y="15" textAnchor="middle" fontSize="12" fill="#1A1A1A" fontWeight="bold">N</text>
                        </svg>
                    </div>
                </div>

                {/* Scale indicator */}
                <div className="absolute bottom-8 left-8 hidden lg:flex items-center gap-2 pointer-events-none opacity-30">
                    <div className="flex flex-col gap-1">
                        <div className="h-[2px] w-20 bg-[#1A1A1A]"/>
                        <div className="flex justify-between text-[10px] text-[#1A1A1A] font-medium">
                            <span>0</span>
                            <span>100 km</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content card - ORIGINAL STYLE */}
            <div className="relative z-10 w-full lg:h-[80vh] lg:min-h-[600px] max-w-7xl mx-auto px-4 sm:px-6 flex items-start lg:items-center py-6 lg:py-0 pointer-events-none">
                <div className="w-full lg:w-5/12 pointer-events-auto bg-[#F4F0EB]/70 lg:bg-[#F4F0EB]/40 backdrop-blur-sm p-5 sm:p-8 rounded-2xl shadow-[0_0_40px_rgba(241,239,232,0.8)] border border-white/20">

                    <div className="mb-6 lg:mb-10">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-2 sm:mb-3 font-semibold">
                            Nos clients en Tunisie
                        </p>
                        <h2
                            className="text-2xl sm:text-4xl lg:text-5xl font-medium text-[#1A1A1A] tracking-tight mb-2"
                            style={{ fontFamily: 'var(--font-serif)' }}
                        >
                            Des projets partout
                        </h2>
                    </div>

                    {/* Pagination dots */}
                    <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
                        {storyData.map((_, i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: i === currentIndex ? 20 : 6,
                                    height: 6,
                                    backgroundColor: i === currentIndex ? '#C96442' : 'rgba(25,25,24,0.15)',
                                }}
                            />
                        ))}
                    </div>

                    {/* State tag */}
                    <div className="h-7 sm:h-8 mb-1 sm:mb-2">
                        {stateName && (
                            <span
                                className="inline-block px-2.5 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-opacity duration-300"
                                style={{ backgroundColor: '#C96442', color: '#FFFFFF' }}
                            >
                                {stateName}
                            </span>
                        )}
                    </div>

                    {/* Quote with typing */}
                    <div className="min-h-[100px] sm:min-h-[180px]">
                        <p
                            className="text-lg sm:text-2xl lg:text-3xl leading-snug"
                            style={{
                                fontFamily: 'var(--font-serif)',
                                color: '#1a1a1a',
                            }}
                        >
                            &ldquo;{typedText}
                            <span
                                className="inline-block w-[2px] sm:w-[3px] h-[1em] align-text-bottom ml-[2px]"
                                style={{
                                    backgroundColor: '#C96442',
                                    animation: 'blink 1s step-end infinite',
                                    opacity: typedText.length < (storiesRef.current[currentIndex]?.quote?.length || 0) ? 1 : 0,
                                }}
                            />
                            &rdquo;
                        </p>
                    </div>

                    {/* Author Footer */}
                    <div className="h-12 mt-3 sm:mt-4">
                        {stateName && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs sm:text-sm font-medium shadow-md">
                                    {storyData[currentIndex]?.targetName?.[0]}
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Client — {storyData[currentIndex]?.targetName}</p>
                                    <p className="text-[10px] sm:text-xs text-[#1A1A1A]/60 font-medium">Gouvernorat</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
