'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

const storyData = [
    { targetName: 'Tunis', quote: 'DigiTN a transformé notre présence en ligne. 3x plus de ventes en 2 mois.' },
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
    const modeRef = useRef<'story' | 'globe'>('story')

    // Initialize D3 globe
    useEffect(() => {
        if (!svgRef.current) return

        // Use a wide viewBox for full-screen coverage
        const width = 1400
        const height = 900
        const svg = d3.select(svgRef.current)
        const mapGroup = svg.select('#map-group')

        // Shift globe to the right side of the screen (width * 0.7)
        const projection = d3.geoOrthographic()
            .scale(2200) // Fixed consistent zoom
            .translate([width * 0.7, height / 2])
            .clipAngle(90)

        projRef.current = projection
        const pathGenerator = d3.geoPath().projection(projection)
        pathRef.current = pathGenerator

        async function loadData() {
            try {
                let worldTopo: any;
                let tnTopo: any;

                // ==========================================
                // 1. Load World Data (Local first, CDN fallback)
                // ==========================================
                try {
                    // Will throw in the Canvas preview environment, but work in your local Next.js app
                    const wRes = await fetch('/world-110m.json')
                    if (!wRes.ok) throw new Error('Local world file missing')
                    worldTopo = await wRes.json()
                } catch (e) {
                    // Fallback to external CDN so the Canvas preview still works seamlessly
                    const wResCDN = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
                    worldTopo = await wResCDN.json()
                }

                // ==========================================
                // 2. Load Tunisia Data (Local first, CDN fallback)
                // ==========================================
                try {
                    const tRes = await fetch('/tn-all.topo.json')
                    if (!tRes.ok) throw new Error('Local tn file missing')
                    tnTopo = await tRes.json()
                } catch (e) {
                    const targetUrl = 'https://code.highcharts.com/mapdata/countries/tn/tn-all.topo.json'
                    try {
                        const tResCDN = await fetch(targetUrl)
                        if (!tResCDN.ok) throw new Error('CDN fetch failed')
                        tnTopo = await tResCDN.json()
                    } catch (err) {
                        // Final fallback for strict CORS environments
                        const pRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`)
                        tnTopo = await pRes.json()
                    }
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const worldData = (topojson.feature(worldTopo, worldTopo.objects.countries) as any).features as any[]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tnGeoData = (topojson.feature(tnTopo, (Object.values(tnTopo.objects)[0] as any)) as any).features as any[]

                // Draw globe sphere (Background of the earth)
                mapGroup.append('path')
                    .datum({ type: 'Sphere' } as any)
                    .attr('class', 'globe-sphere')
                    .attr('d', pathGenerator as any)
                    .attr('fill', '#f1efe8') // Matches the background
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
                setLoaded(true)
            } catch (err) {
                console.error('Failed to load globe data:', err)
            }
        }

        loadData()
    }, [])

    // Smooth transition between locations
    const tweenProjection = useCallback((targetRotate: number[], targetScale: number, duration: number) => {
        return new Promise<void>(resolve => {
            const projection = projRef.current!
            const mapGroup = d3.select(svgRef.current!).select('#map-group')
            const pathGenerator = pathRef.current!

            d3.select({} as any).transition()
                .duration(duration)
                .ease(d3.easeCubicInOut)
                .tween('projection', function () {
                    const iRotate = d3.interpolate(projection.rotate(), targetRotate as [number, number, number])
                    const iScale = d3.interpolate(projection.scale(), targetScale)
                    return function (t: number) {
                        projection.rotate(iRotate(t)).scale(iScale(t))
                        mapGroup.selectAll('path').attr('d', pathGenerator as any)
                    }
                })
                .on('end', () => resolve())
        })
    }, [])

    // Animation loop
    useEffect(() => {
        if (!loaded) return

        let cancelled = false
        let idx = 0

        async function loop() {
            while (!cancelled && modeRef.current === 'story') {
                const story = storiesRef.current[idx]
                if (!story?.feature) {
                    idx = (idx + 1) % storiesRef.current.length
                    continue
                }

                setCurrentIndex(idx)
                setStateName('')
                setTypedText('')

                // Clear previously active states
                d3.select(svgRef.current!)
                    .selectAll('.state-path')
                    .attr('fill', '#e8e5dc')
                    .attr('stroke', '#a39e94')
                    .attr('stroke-width', '0.8px')

                // 1. Zoom OUT to global/country view
                if (!cancelled) await tweenProjection([-9.5, -34], 2200, 1200)
                if (cancelled) break
                await new Promise(r => setTimeout(r, 200)) // slight pause

                // Highlight current state
                d3.select(svgRef.current!)
                    .select(`#${story.id}`)
                    .attr('fill', 'rgba(229, 168, 64, 0.4)')
                    .attr('stroke', '#e5a840')
                    .attr('stroke-width', '2.5px')

                // 2. Zoom IN to the new state
                const [lon, lat] = story.centroid
                if (!cancelled) await tweenProjection([-lon, -lat], 6000, 1500)
                if (cancelled) break

                // Set state name and type quote
                setStateName(story.targetName)

                // Typing effect
                const full = story.quote
                for (let i = 0; i <= full.length; i++) {
                    if (cancelled) break
                    setTypedText(full.slice(0, i))
                    await new Promise(r => setTimeout(r, Math.max(15, 1200 / full.length)))
                }
                if (cancelled) break

                // Hold view for reading
                let waitTime = 0
                while (waitTime < 3500 && !cancelled) {
                    await new Promise(r => setTimeout(r, 100))
                    waitTime += 100
                }

                idx = (idx + 1) % storiesRef.current.length
            }
        }

        loop()
        return () => { cancelled = true }
    }, [loaded, tweenProjection])

    return (
        <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-[#f1efe8]">
            
            {/* Background Full-Page Globe */}
            <div className="absolute inset-0 w-full h-full">
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#191918]/10 border-l-[#191918] rounded-full animate-spin" />
                    </div>
                )}
                
                <svg
                    ref={svgRef}
                    viewBox="0 0 1400 900"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full select-none"
                    style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
                >
                    <g id="map-group" />
                </svg>
            </div>

            {/* Foreground Content (Left Aligned) */}
            <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 flex items-center pointer-events-none">
                <div className="w-full lg:w-5/12 pointer-events-auto bg-[#f1efe8]/40 backdrop-blur-sm p-8 rounded-2xl shadow-[0_0_40px_rgba(241,239,232,0.8)] border border-white/20">
                    
                    <div className="mb-10">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#191918]/50 mb-3 font-semibold">
                            Nos clients en Tunisie
                        </p>
                        <h2
                            className="text-4xl lg:text-5xl font-medium text-[#191918] tracking-tight mb-2"
                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                        >
                            Des projets partout
                        </h2>
                    </div>

                    {/* Pagination dots */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {storyData.map((_, i) => (
                            <div
                                key={i}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: i === currentIndex ? 28 : 8,
                                    height: 8,
                                    backgroundColor: i === currentIndex ? '#C96442' : 'rgba(25,25,24,0.15)',
                                }}
                            />
                        ))}
                    </div>

                    {/* State tag */}
                    <div className="h-8 mb-2">
                        {stateName && (
                            <span
                                className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-opacity duration-300"
                                style={{ backgroundColor: '#b5c7e3', color: '#1a1a1a' }}
                            >
                                {stateName}
                            </span>
                        )}
                    </div>

                    {/* Quote with typing */}
                    <div className="min-h-[180px]">
                        <p
                            className="text-2xl lg:text-3xl leading-snug"
                            style={{
                                fontFamily: 'var(--font-playfair), serif',
                                color: '#1a1a1a',
                            }}
                        >
                            &ldquo;{typedText}
                            <span
                                className="inline-block w-[3px] h-[1em] align-text-bottom ml-[2px]"
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    animation: 'blink 1s step-end infinite',
                                    opacity: typedText.length < (storiesRef.current[currentIndex]?.quote?.length || 0) ? 1 : 0,
                                }}
                            />
                            &rdquo;
                        </p>
                    </div>

                    {/* Author Footer */}
                    <div className="h-12 mt-4">
                        {stateName && (
                            <div className="flex items-center gap-3 animate-fade-in">
                                <div className="w-10 h-10 rounded-full bg-[#191918] flex items-center justify-center text-white text-sm font-medium shadow-md">
                                    {storyData[currentIndex]?.targetName?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#191918]">Client — {storyData[currentIndex]?.targetName}</p>
                                    <p className="text-xs text-[#191918]/60 font-medium">Gouvernorat</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}