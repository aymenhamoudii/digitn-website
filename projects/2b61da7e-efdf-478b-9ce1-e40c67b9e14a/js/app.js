// Global application logic
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize Views Data
    populateMetrics();
    renderPerformanceChart();
    renderDirectory();
    renderActivities();

    // 2. Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const textElements = document.querySelectorAll('.nav-text, .brand-text');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');

            textElements.forEach(el => {
                // Fade out text when collapsed, show when expanded
                if (isCollapsed) {
                    el.style.display = 'none';
                } else {
                    el.style.display = 'block';
                }
            });
        });
    }

    // 3. Navigation Routing Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Handle active state on navigation items
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Handle View Switching
            const targetId = link.getAttribute('data-view');
            const newTitle = link.querySelector('.nav-text').textContent;
            
            if (pageTitle) {
                pageTitle.textContent = `${newTitle} Overview`;
            }

            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetId) {
                    view.classList.add('active');
                }
            });

            // Re-render chart if navigating back to dashboard to trigger animations
            if (targetId === 'dashboard-view') {
                renderPerformanceChart();
            }
        });
    });

    // 4. Directory Search Filter (Basic implementation)
    const searchInput = document.getElementById('directory-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.employee-card');
            
            cards.forEach(card => {
                const name = card.querySelector('.emp-name').textContent.toLowerCase();
                const role = card.querySelector('.emp-role').textContent.toLowerCase();
                
                if (name.includes(query) || role.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});