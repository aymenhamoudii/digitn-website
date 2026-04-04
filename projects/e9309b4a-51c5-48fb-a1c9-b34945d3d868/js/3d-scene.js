// 3D Scene Management
class BackgroundScene {
    constructor() {
        this.container = document.getElementById('canvas-container');
        if (!this.container || typeof THREE === 'undefined') return;

        this.scene = new THREE.Scene();
        // Fog to blend into background color
        this.scene.fog = new THREE.FogExp2(0xf4f1ea, 0.02);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.objects = [];
        this.mouseY = 0;
        this.scrollY = 0;

        this.init();
    }

    init() {
        this.createLighting();
        this.createParticles();
        this.createAbstractShapes();

        // Event Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('scroll', this.onScroll.bind(this));

        // Start animation loop
        this.animate();
    }

    createLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xd4a373, 0.8); // Warm accent light
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0x4a5d46, 1, 50); // Forest green tint
        pointLight.position.set(-10, -10, 10);
        this.scene.add(pointLight);
    }

    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            sizes[i] = Math.random() * 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Creating a simple circular sprite for particles
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.arc(8, 8, 8, 0, Math.PI * 2);
        context.fillStyle = '#d4a373';
        context.fill();
        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 0.5,
            map: texture,
            transparent: true,
            opacity: 0.4,
            alphaTest: 0.1,
            color: 0xd4a373
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createAbstractShapes() {
        // Create organic-looking shapes (Icosahedrons modified)
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 1),
            new THREE.OctahedronGeometry(1, 0)
        ];

        // Earthy, muted materials
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x4a5d46, roughness: 0.8, metalness: 0.2 }), // Green
            new THREE.MeshStandardMaterial({ color: 0x8b9986, roughness: 0.9, metalness: 0.1 }), // Sage
            new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7, metalness: 0.3 })  // Wood/Accent
        ];

        for (let i = 0; i < 20; i++) {
            const geom = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = materials[Math.floor(Math.random() * materials.length)];
            
            const mesh = new THREE.Mesh(geom, mat);
            
            mesh.position.x = (Math.random() - 0.5) * 60;
            mesh.position.y = (Math.random() - 0.5) * 60;
            mesh.position.z = (Math.random() - 0.5) * 40 - 10;
            
            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);
            
            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            // Store rotation speeds
            mesh.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.01,
                rotSpeedY: (Math.random() - 0.5) * 0.01,
                floatSpeed: Math.random() * 0.02 + 0.005,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y
            };

            this.scene.add(mesh);
            this.objects.push(mesh);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        // Normalized mouse coordinates
        this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }

    onScroll() {
        this.scrollY = window.scrollY;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = Date.now() * 0.001;

        // Animate objects
        this.objects.forEach(obj => {
            obj.rotation.x += obj.userData.rotSpeedX;
            obj.rotation.y += obj.userData.rotSpeedY;
            
            // Floating effect
            obj.position.y = obj.userData.originalY + Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 2;
        });

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
            this.particles.rotation.x = time * 0.02;
        }

        // Camera parallax based on scroll
        const targetCameraY = -(this.scrollY * 0.02);
        this.camera.position.y += (targetCameraY - this.camera.position.y) * 0.05;

        // Slight camera movement based on mouse
        this.camera.position.x += (this.mouseY * 2 - this.camera.position.x) * 0.05;

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bgScene = new BackgroundScene();
});