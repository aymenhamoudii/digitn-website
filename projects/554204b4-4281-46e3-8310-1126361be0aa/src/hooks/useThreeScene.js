import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useThreeScene(containerRef) {
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#2D4A3E', 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Check if child already exists before appending (React StrictMode fix)
    if (containerRef.current.children.length === 0) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight('#F5EDD8', 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight('#C4622D', 2, 10);
    pointLight.position.set(-2, 2, 2);
    scene.add(pointLight);

    // Objects (Abstract ingredients/ceramics)
    const objects = [];
    const geometry1 = new THREE.TorusGeometry(1, 0.3, 16, 50);
    const material1 = new THREE.MeshStandardMaterial({ 
      color: '#F5EDD8', 
      roughness: 0.8,
      metalness: 0.1
    });
    const torus = new THREE.Mesh(geometry1, material1);
    torus.position.set(-2, 1, -2);
    scene.add(torus);
    objects.push({ mesh: torus, speed: 0.005, orbit: 0.002 });

    const geometry2 = new THREE.SphereGeometry(0.6, 32, 32);
    const material2 = new THREE.MeshStandardMaterial({ 
      color: '#C4622D',
      roughness: 0.4,
      metalness: 0.2
    });
    const sphere = new THREE.Mesh(geometry2, material2);
    sphere.position.set(2.5, -1.5, -1);
    scene.add(sphere);
    objects.push({ mesh: sphere, speed: 0.008, orbit: -0.003 });

    const geometry3 = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const material3 = new THREE.MeshStandardMaterial({ 
      color: '#9bb1a8',
      roughness: 0.9,
      metalness: 0.1
    });
    const disk = new THREE.Mesh(geometry3, material3);
    disk.position.set(1.5, 2, -3);
    disk.rotation.x = Math.PI / 4;
    scene.add(disk);
    objects.push({ mesh: disk, speed: 0.01, orbit: 0.004 });

    // Mouse Tracking Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.001;
      mouseY = (event.clientY - windowHalfY) * 0.001;
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Parallax easing
      targetX = mouseX * 2;
      targetY = mouseY * 2;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate objects
      objects.forEach((obj, idx) => {
        obj.mesh.rotation.x += obj.speed;
        obj.mesh.rotation.y += obj.speed;
        
        // Slight organic orbit
        obj.mesh.position.y += Math.sin(elapsedTime * 2 + idx) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [containerRef]);
}