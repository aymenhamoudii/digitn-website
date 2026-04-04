// Helper to get initials
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Render the employee grid in the directory view
function renderDirectory() {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;

    const employees = JSON.parse(localStorage.getItem('team_employees') || '[]');
    grid.innerHTML = '';

    employees.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'employee-card';

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'avatar-large';
        avatar.style.backgroundColor = emp.color;
        avatar.textContent = getInitials(emp.name);

        // Name
        const name = document.createElement('h3');
        name.className = 'emp-name';
        name.textContent = emp.name;

        // Role
        const role = document.createElement('p');
        role.className = 'emp-role';
        role.textContent = emp.role;

        // Tags container
        const tags = document.createElement('div');
        tags.className = 'emp-tags';

        // Department tag
        const deptTag = document.createElement('span');
        deptTag.className = 'tag';
        deptTag.textContent = emp.dept;

        // Status tag
        const statusTag = document.createElement('span');
        statusTag.className = 'tag';
        statusTag.textContent = emp.status;
        
        // Dynamic status styling
        if (emp.status === 'Active') {
            statusTag.style.backgroundColor = 'rgba(167, 243, 208, 0.1)';
            statusTag.style.color = 'var(--pastel-mint)';
        } else if (emp.status === 'On Leave') {
            statusTag.style.backgroundColor = 'rgba(254, 205, 211, 0.1)';
            statusTag.style.color = 'var(--pastel-peach)';
        } else {
            statusTag.style.backgroundColor = 'rgba(221, 214, 254, 0.1)';
            statusTag.style.color = 'var(--pastel-lilac)';
        }

        tags.appendChild(deptTag);
        tags.appendChild(statusTag);

        card.appendChild(avatar);
        card.appendChild(name);
        card.appendChild(role);
        card.appendChild(tags);

        grid.appendChild(card);
    });
}

// Render recent activities in the dashboard view
function renderActivities() {
    const list = document.getElementById('activity-list');
    if (!list) return;

    const activities = JSON.parse(localStorage.getItem('team_activities') || '[]');
    list.innerHTML = '';

    activities.forEach(act => {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const iconWrap = document.createElement('div');
        iconWrap.className = 'activity-icon';
        iconWrap.style.backgroundColor = act.color;
        iconWrap.textContent = act.icon;

        const contentWrap = document.createElement('div');
        contentWrap.className = 'activity-content';

        const text = document.createElement('p');
        const boldName = document.createElement('strong');
        boldName.textContent = act.user;
        
        text.appendChild(boldName);
        text.appendChild(document.createTextNode(` ${act.action}`));

        const time = document.createElement('span');
        time.className = 'activity-time';
        time.textContent = act.time;

        contentWrap.appendChild(text);
        contentWrap.appendChild(time);

        item.appendChild(iconWrap);
        item.appendChild(contentWrap);
        list.appendChild(item);
    });
}

// Populate the top metric cards
function populateMetrics() {
    const metrics = JSON.parse(localStorage.getItem('team_metrics') || '{}');
    
    const activeEl = document.getElementById('metric-active');
    const pendingEl = document.getElementById('metric-pending');
    const deptsEl = document.getElementById('metric-depts');
    const perfEl = document.getElementById('metric-perf');

    if (activeEl && metrics.totalActive) activeEl.textContent = metrics.totalActive;
    if (pendingEl && metrics.pendingRequests) pendingEl.textContent = metrics.pendingRequests;
    if (deptsEl && metrics.departments) deptsEl.textContent = metrics.departments;
    if (perfEl && metrics.avgPerformance) perfEl.textContent = `${metrics.avgPerformance}%`;
}