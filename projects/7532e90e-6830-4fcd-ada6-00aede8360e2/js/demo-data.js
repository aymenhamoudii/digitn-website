/**
 * Artisan Studio Landing Page
 * Demo Data Initialization
 * Pre-seeds the application with realistic demo content
 */

function initDemoData() {
    'use strict';

    // Check if already seeded
    if (localStorage.getItem('artisanDemoSeeded')) {
        return;
    }

    // === Seed Contact Form with Demo Values ===
    var demoFormData = {
        name: 'Sarah Mitchell',
        email: 'sarah@techventures.io',
        projectType: 'full',
        message: 'We are looking to completely redesign our SaaS platform. Our current design is outdated and user testing shows significant drop-off at key conversion points. We need a partner who can help us from strategy through implementation. Budget is flexible for the right team. Timeline: ideally launching Q3 2025.',
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('contactFormDraft', JSON.stringify(demoFormData));

    // === Seed Form Field Values (for auto-fill demonstration) ===
    localStorage.setItem('demoUserName', demoFormData.name);
    localStorage.setItem('demoUserEmail', demoFormData.email);
    localStorage.setItem('demoProjectType', demoFormData.projectType);
    localStorage.setItem('demoMessage', demoFormData.message);

    // === Seed Analytics/Stats Data ===
    var analyticsData = {
        projectsCompleted: 147,
        clientsServed: 89,
        averageRating: 4.9,
        yearsInBusiness: 6,
        repeatClients: 73,
        lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('analyticsData', JSON.stringify(analyticsData));

    // === Seed Testimonial Interactions ===
    var testimonialInteractions = {
        viewed: ['testimonial-1', 'testimonial-2', 'testimonial-3'],
        lastViewed: 'testimonial-3',
        viewCount: 12
    };

    localStorage.setItem('testimonialInteractions', JSON.stringify(testimonialInteractions));

    // === Seed Project Views ===
    var projectViews = {
        'meridian-capital': { views: 234, lastViewed: new Date().toISOString() },
        'concord-health': { views: 412, lastViewed: new Date().toISOString() },
        'strommen-architects': { views: 189, lastViewed: new Date().toISOString() }
    };

    localStorage.setItem('projectViews', JSON.stringify(projectViews));

    // === Mark as seeded ===
    localStorage.setItem('artisanDemoSeeded', 'true');
    localStorage.setItem('artisanDemoSeededDate', new Date().toISOString());
}

// === Populate Form Fields Function ===
function populateDemoFormFields() {
    'use strict';

    // Only populate if demo data exists and form hasn't been submitted
    if (localStorage.getItem('formSubmitted')) {
        return;
    }

    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var projectTypeSelect = document.getElementById('projectType');
    var messageTextarea = document.getElementById('message');

    if (nameInput && localStorage.getItem('demoUserName')) {
        nameInput.value = localStorage.getItem('demoUserName');
        nameInput.dataset.touched = 'true';
    }

    if (emailInput && localStorage.getItem('demoUserEmail')) {
        emailInput.value = localStorage.getItem('demoUserEmail');
        emailInput.dataset.touched = 'true';
    }

    if (projectTypeSelect && localStorage.getItem('demoProjectType')) {
        projectTypeSelect.value = localStorage.getItem('demoProjectType');
        projectTypeSelect.dataset.touched = 'true';
    }

    if (messageTextarea && localStorage.getItem('demoMessage')) {
        messageTextarea.value = localStorage.getItem('demoMessage');
        messageTextarea.dataset.touched = 'true';
    }
}

// === Run form population after DOM ready ===
(function() {
    function tryPopulateForm() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', populateDemoFormFields);
        } else {
            populateDemoFormFields();
        }
    }

    // Delay slightly to ensure form is ready
    setTimeout(tryPopulateForm, 200);
})();
