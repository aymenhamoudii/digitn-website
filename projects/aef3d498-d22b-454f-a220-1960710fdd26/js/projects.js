/**
 * Project Data and Rendering Engine
 */

const projects = [
    {
        id: 1,
        title: "Nebula Dashboard",
        description: "A real-time analytics platform for distributed microservices. Featuring high-performance data visualization and predictive scaling insights.",
        tags: ["React", "Go", "Kubernetes", "Redis"],
        link: "#",
        image: "nebula"
    },
    {
        id: 2,
        title: "Aether Protocol",
        description: "An end-to-end encrypted communication protocol designed for low-latency IoT devices. Optimized for battery life and data integrity.",
        tags: ["Rust", "WASM", "WebRTC", "PostgreSQL"],
        link: "#",
        image: "aether"
    },
    {
        id: 3,
        title: "Flux Design System",
        description: "A production-ready component library used by 200+ engineers. Built with accessibility and developer experience as core priorities.",
        tags: ["TypeScript", "Tailwind", "Storybook", "Framer"],
        link: "#",
        image: "flux"
    },
    {
        id: 4,
        title: "Catalyst CRM",
        description: "Enterprise-grade CRM with automated lead scoring and integrated AI chat support. Streamlines sales workflows for large teams.",
        tags: ["Next.js", "Node.js", "OpenAI", "Prisma"],
        link: "#",
        image: "catalyst"
    },
    {
        id: 5,
        title: "Titan Infrastructure",
        description: "Infrastructure-as-code generator for complex multi-cloud environments. Simplifies deployment architecture and cost management.",
        tags: ["Terraform", "Python", "GCP", "Azure"],
        link: "#",
        image: "titan"
    },
    {
        id: 6,
        title: "Horizon Wallet",
        description: "Next-gen crypto wallet with hardware-level security and cross-chain swap capabilities. Focuses on intuitive user onboarding.",
        tags: ["React Native", "Solidity", "Ethers.js"],
        link: "#",
        image: "horizon"
    }
];

function renderProjects() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    grid.innerHTML = projects.map(project => `
        <article class="project-card glass-card">
            <div class="project-image">
                <div class="project-img-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>
            </div>
            <div class="project-content">
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
                <a href="${project.link}" class="project-link">
                    View Project 
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        </article>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderProjects);
