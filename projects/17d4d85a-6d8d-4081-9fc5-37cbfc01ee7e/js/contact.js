const contactDetails = {
    phone: '123-456-7890',
    email: 'info@restaurant.com',
    address: '123 Main St, Hometown, USA',
};

function renderContact() {
    const contactContainer = document.getElementById('contact-info');
    contactContainer.innerHTML = `<p>Phone: ${contactDetails.phone}</p>
                                    <p>Email: ${contactDetails.email}</p>
                                    <p>Address: ${contactDetails.address}</p>`;
}

document.addEventListener('DOMContentLoaded', renderContact);