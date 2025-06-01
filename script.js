// Datos de las estaciones con coordenadas de Guatemala
const stations = [
    {
        id: 1,
        name: "Raspaoil La Hoya",
        address: "Polígono Industrial La Hoya, Parcela E-6, La Hoya, Murcia",
        service: "24H servicio",
        lat: 37.9125,
        lng: -1.2488,
        city: "Murcia",
        services: ["24H", "Tienda", "Lavado", "ATM"],
        phone: "+34 968481751"
    },
    {
        id: 2,
        name: "Raspaoil Águilas",
        address: "Km 0, Carr. de Lorca, 9, 30880 Águilas, Murcia",
        service: "24H servicio",
        lat: 37.4135,
        lng: -1.5930,
        city: "Murcia",
        services: ["24H", "Restaurante", "WiFi", "Mecánica"],
        phone: "+34"
    },
    {
        id: 3,
        name: "Raspaoil Wash Park Mazarrón",
        address: "Av. de las Moreras, S/n, 30870 Mazarrón, Murcia",
        service: "Servicio diurno",
        lat: 37.591215,
        lng: -1.316381,
        city: "Murcia",
        services: ["Mecánica", "Llantas", "Tienda"],
        phone: "+34 968481751"
    },
    {
        id: 4,
        name: "Raspaoil Cartagena",
        address: "Pasaje los Blases, 35, 30205 Cartagena, Murcia",
        service: "24H servicio",
        lat: 37.614738,
        lng: -1.006531,
        city: "Murcia",
        services: ["24H", "Tienda", "Lavado", "Cafetería"],
        phone: "+34 968481751"
    },
    {
        id: 5,
        name: "Raspaoil Yecla",
        address: "Av. de la Paz, 225A, 30510 Yecla, Murcia",
        service: "24H servicio",
        lat: 38.6172,
        lng: -1.1166,
        city: "Murcia",
        services: ["24H", "Mecánica", "Tienda", "WiFi"],
        phone: "+34"
    },
    {
        id: 6,
        name: "Raspaoil Albox",
        address: "Carretera Lorca- Baza, Paraje Los Chorlitos, Parc. 426, Pol. 41 Km. 426, 04800 Albox, Almería",
        service: "24H servicio",
        lat: 37.369895,
        lng: -2.121267,
        city: "Almería",
        services: ["24H", "Lavado", "ATM", "Tienda"],
        phone: "+34 968481751"
    },
    {
        id: 7,
        name: "Raspaoil Aspe",
        address: "Ctra. Novelda, 2, 03680 Aspe, Alicante",
        service: "24H servicio",
        lat: 38.3486,
        lng: -0.8618,
        city: "Alicante",
        services: ["24H", "Tienda", "Mecánica", "Cafetería"],
        phone: "+34"
    }
];

// Variables globales
let map;
let markers = [];
let userMarker = null;
let selectedStationId = null;
let filteredStations = [...stations];

// Importación de Leaflet
const L = window.L;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    initializeMap();
    renderStationsList();
    renderStationsGrid();
    setupSearch();
    setupFilters();
    setupAnimations();
}

// Configuración de navegación
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href.substring(1));
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}

function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Inicialización del mapa
function initializeMap() {
    // Coordenadas centrales de Guatemala
    const mapCenter = [37.9922, -1.1307];
    
    map = L.map('map').setView(mapCenter, 8);

    // Añadir capa de teselas
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Crear icono personalizado
    const gasIcon = L.divIcon({
        className: 'custom-gas-icon',
        html: '<div class="gas-marker"><i class="fas fa-gas-pump"></i></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // Añadir marcadores
    stations.forEach(station => {
        const marker = L.marker([station.lat, station.lng], { icon: gasIcon })
            .addTo(map)
            .bindPopup(createPopupContent(station))
            .on('click', () => selectStation(station.id));

        markers.push({ id: station.id, marker: marker });
    });

    // Ajustar vista para mostrar todos los marcadores
    const group = new L.featureGroup(markers.map(m => m.marker));
    map.fitBounds(group.getBounds().pad(0.1));

    // Añadir estilos CSS para el icono personalizado
    addCustomIconStyles();
}

function addCustomIconStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-gas-icon {
            background: none;
            border: none;
        }
        .gas-marker {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--jade-maya) 0%, var(--emerald) 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            border: 3px solid white;
        }
        .gas-marker i {
            color: white;
            font-size: 16px;
            transform: rotate(45deg);
        }
        .gas-marker:hover {
            transform: rotate(-45deg) scale(1.1);
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

function createPopupContent(station) {
    const servicesHtml = station.services.map(service => 
        `<span class="popup-service">${service}</span>`
    ).join('');

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    const wazeUrl = `https://waze.com/ul?ll=${station.lat},${station.lng}&navigate=yes`;

    return `
        <div class="popup-content">
            <div class="popup-header">
                <div class="popup-icon">
                    <i class="fas fa-gas-pump"></i>
                </div>
                <h3 class="popup-title">${station.name}</h3>
            </div>
            <p class="popup-address">
                <i class="fas fa-map-marker-alt"></i>
                ${station.address}
            </p>
            <div class="popup-services">
                ${servicesHtml}
            </div>
            <div class="popup-actions">
                <a href="${googleMapsUrl}" target="_blank" class="popup-btn popup-btn-primary">
                    <i class="fas fa-directions"></i>
                    Google Maps
                </a>
                <a href="${wazeUrl}" target="_blank" class="popup-btn popup-btn-secondary">
                    <i class="fab fa-waze"></i>
                    Waze
                </a>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 0.875rem; color: #666;">
                    <i class="fas fa-phone"></i>
                    ${station.phone}
                </p>
            </div>
        </div>
    `;
}

// Renderizar lista de estaciones en sidebar
function renderStationsList() {
    const stationsList = document.getElementById('stationsList');
    
    stationsList.innerHTML = filteredStations.map(station => `
        <div class="station-item ${selectedStationId === station.id ? 'active' : ''}" 
             onclick="selectStation(${station.id})">
            <h4>${station.name}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${station.city}</p>
            <div class="station-badges">
                ${station.services.map(service => `<span class="badge">${service}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Renderizar grid de estaciones
function renderStationsGrid() {
    const stationsGrid = document.getElementById('stationsGrid');
    
    stationsGrid.innerHTML = stations.map(station => {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
        
        return `
            <div class="station-card">
                <div class="station-header">
                    <i class="fas fa-gas-pump"></i>
                    <h3>${station.name}</h3>
                </div>
                <p class="station-address">${station.address}</p>
                <div class="station-features">
                    ${station.services.map(service => `<span class="feature-tag">${service}</span>`).join('')}
                </div>
                <button class="btn btn-outline" onclick="window.open('${googleMapsUrl}', '_blank')">
                    <i class="fas fa-directions"></i>
                    Cómo llegar
                </button>
            </div>
        `;
    }).join('');
}

// Seleccionar estación
function selectStation(stationId) {
    selectedStationId = stationId;
    const station = stations.find(s => s.id === stationId);
    
    if (station) {
        // Centrar mapa en la estación
        map.setView([station.lat, station.lng], 15);
        
        // Abrir popup del marcador
        const markerObj = markers.find(m => m.id === stationId);
        if (markerObj) {
            markerObj.marker.openPopup();
        }
        
        // Actualizar lista
        renderStationsList();
        
        // Scroll al mapa si estamos en móvil
        if (window.innerWidth <= 768) {
            scrollToSection('mapa');
        }
    }
}

// Configurar búsqueda
function setupSearch() {
    const searchInput = document.getElementById('stationSearch');
    
    searchInput.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        filteredStations = stations.filter(station => 
            station.name.toLowerCase().includes(searchTerm) ||
            station.address.toLowerCase().includes(searchTerm) ||
            station.city.toLowerCase().includes(searchTerm) ||
            station.services.some(service => service.toLowerCase().includes(searchTerm))
        );
        
        renderStationsList();
        updateMapMarkers();
    }, 300));
}

// Configurar filtros
function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Actualizar tabs activos
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            applyFilter(filter);
        });
    });
}

function applyFilter(filter) {
    const searchTerm = document.getElementById('stationSearch').value.toLowerCase().trim();
    
    filteredStations = stations.filter(station => {
        const matchesSearch = !searchTerm || 
            station.name.toLowerCase().includes(searchTerm) ||
            station.address.toLowerCase().includes(searchTerm) ||
            station.city.toLowerCase().includes(searchTerm);
        
        switch(filter) {
            case '24h':
                return matchesSearch && station.service === '24H servicio';
            case 'services':
                return matchesSearch && station.services.length > 3;
            default:
                return matchesSearch;
        }
    });
    
    renderStationsList();
    updateMapMarkers();
}

function updateMapMarkers() {
    // Ocultar todos los marcadores
    markers.forEach(markerObj => {
        map.removeLayer(markerObj.marker);
    });
    
    // Mostrar solo los marcadores filtrados
    filteredStations.forEach(station => {
        const markerObj = markers.find(m => m.id === station.id);
        if (markerObj) {
            map.addLayer(markerObj.marker);
        }
    });
}

// Controles del mapa
function centerMap() {
    const group = new L.featureGroup(markers.map(m => m.marker));
    map.fitBounds(group.getBounds().pad(0.1));
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Remover marcador anterior del usuario
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                // Crear icono de usuario
                const userIcon = L.divIcon({
                    className: 'user-location-icon',
                    html: '<div class="user-marker"><i class="fas fa-user"></i></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                
                // Añadir marcador del usuario
                userMarker = L.marker([userLat, userLng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('Tu ubicación actual');
                
                // Centrar mapa en usuario
                map.setView([userLat, userLng], 12);
                
                // Añadir estilos para el marcador de usuario
                addUserMarkerStyles();
                
                showNotification('Ubicación encontrada');
            },
            error => {
                showNotification('No se pudo obtener tu ubicación', 'error');
            }
        );
    } else {
        showNotification('Geolocalización no soportada', 'error');
    }
}

function addUserMarkerStyles() {
    if (!document.getElementById('user-marker-styles')) {
        const style = document.createElement('style');
        style.id = 'user-marker-styles';
        style.textContent = `
            .user-location-icon {
                background: none;
                border: none;
            }
            .user-marker {
                width: 30px;
                height: 30px;
                background: var(--sunset-chapin);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                border: 3px solid white;
                animation: pulse 2s infinite;
            }
            .user-marker i {
                color: white;
                font-size: 12px;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
            }
        `;
        document.head.appendChild(style);
    }
}

function toggleFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().then(() => {
            setTimeout(() => map.invalidateSize(), 100);
        });
    } else {
        document.exitFullscreen().then(() => {
            setTimeout(() => map.invalidateSize(), 100);
        });
    }
}

// Scroll suave
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Configurar animaciones
function setupAnimations() {
    // Animación de contadores
    const counters = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'error' ? 'var(--sunset-chapin)' : 'var(--jade-maya)';
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bgColor,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Función debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Efectos de scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        header.style.background = 'rgba(248, 249, 250, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, var(--white) 0%, var(--light-gray) 100%)';
        header.style.backdropFilter = 'none';
    }
});

// Redimensionar mapa cuando cambia el tamaño de ventana
window.addEventListener('resize', debounce(() => {
    if (map) {
        map.invalidateSize();
    }
}, 250));