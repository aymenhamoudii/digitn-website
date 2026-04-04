// Global function to build custom CSS bar chart without external libraries
function renderPerformanceChart() {
    const container = document.getElementById('performance-chart-container');
    if (!container) return;

    // Fetch data from local storage
    const data = JSON.parse(localStorage.getItem('team_performance') || '[]');
    container.innerHTML = '';

    if (data.length === 0) return;

    const maxScore = 100;
    const colors = [
        'var(--pastel-mint)', 
        'var(--pastel-peach)', 
        'var(--pastel-lilac)', 
        'var(--pastel-blue)', 
        'var(--pastel-yellow)'
    ];

    // Create Flex Wrapper
    const chartWrapper = document.createElement('div');
    chartWrapper.style.display = 'flex';
    chartWrapper.style.alignItems = 'flex-end';
    chartWrapper.style.justifyContent = 'space-between';
    chartWrapper.style.height = '100%';
    chartWrapper.style.padding = '20px 10px 0 10px';
    chartWrapper.style.gap = '15px';

    data.forEach((item, index) => {
        // Column Container
        const barCol = document.createElement('div');
        barCol.style.display = 'flex';
        barCol.style.flexDirection = 'column';
        barCol.style.alignItems = 'center';
        barCol.style.flex = '1';
        barCol.style.gap = '12px';
        barCol.style.height = '100%';

        // Bar Track
        const barContainer = document.createElement('div');
        barContainer.style.height = '100%';
        barContainer.style.width = '100%';
        barContainer.style.display = 'flex';
        barContainer.style.alignItems = 'flex-end';
        barContainer.style.justifyContent = 'center';
        barContainer.style.position = 'relative';
        barContainer.style.backgroundColor = 'var(--bg-elevated)';
        barContainer.style.borderRadius = 'var(--radius-sm)';

        // Actual Animated Bar
        const bar = document.createElement('div');
        bar.style.width = '100%';
        bar.style.maxWidth = '60px';
        const targetPercent = (item.score / maxScore) * 100;
        bar.style.height = '0%'; // Start at 0 for animation
        bar.style.backgroundColor = colors[index % colors.length];
        bar.style.borderRadius = 'var(--radius-sm)';
        bar.style.transition = 'height 1s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Trigger reflow & animate
        setTimeout(() => {
            bar.style.height = `${targetPercent}%`;
        }, 50);

        // Tooltip (Percentage)
        const tooltip = document.createElement('div');
        tooltip.textContent = `${item.score}%`;
        tooltip.style.position = 'absolute';
        tooltip.style.top = `calc(${100 - targetPercent}% - 25px)`;
        tooltip.style.fontSize = '0.75rem';
        tooltip.style.fontWeight = 'bold';
        tooltip.style.color = 'var(--text-primary)';
        tooltip.style.transition = 'top 1s cubic-bezier(0.16, 1, 0.3, 1)';

        // Department Label
        const label = document.createElement('span');
        label.textContent = item.dept;
        label.style.fontSize = '0.75rem';
        label.style.fontWeight = '600';
        label.style.color = 'var(--text-secondary)';
        label.style.textAlign = 'center';
        label.style.whiteSpace = 'nowrap';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
        label.style.maxWidth = '100%';

        barContainer.appendChild(bar);
        barContainer.appendChild(tooltip);

        barCol.appendChild(barContainer);
        barCol.appendChild(label);
        chartWrapper.appendChild(barCol);
    });

    container.appendChild(chartWrapper);
}
