document.addEventListener("DOMContentLoaded", () => {
    initVisionSimulator();
});

function initVisionSimulator() {
    const container = document.getElementById('sim-container');
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear loading text
    container.innerHTML = ''; 
    container.appendChild(renderer.domElement);
    
    // 2. UI OVERLAY (The HUD)
    const overlay = document.createElement('div');
    overlay.className = 'sim-overlay';
    overlay.innerHTML = `
        <div class="sim-pill top">STATUS: MONITORING</div>
        <div class="sim-pill bottom">AI CONFIDENCE: --</div>
        <div class="sim-scan-line"></div>
    `;
    container.appendChild(overlay);
    
    const statusPill = overlay.querySelector('.sim-pill.top');
    const confPill = overlay.querySelector('.sim-pill.bottom');
    const scanLine = overlay.querySelector('.sim-scan-line');

    // 3. OBJECTS (The "Part")
    // Cylinder representing a battery cell or machined part
    const geometry = new THREE.CylinderGeometry(1.2, 1.2, 3, 64);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xeef3ff,
        metalness: 0.9,
        roughness: 0.2,
    });
    const product = new THREE.Mesh(geometry, material);
    scene.add(product);

    // Defect Marker (Invisible by default)
    const defectGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const defectMat = new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0 });
    const defect = new THREE.Mesh(defectGeo, defectMat);
    defect.position.set(0.9, 0.5, 0.8); // Position on surface
    product.add(defect); // Attach to product so it spins with it

    // Wireframe Overlay (Digital Twin feel)
    const wireGeo = new THREE.CylinderGeometry(1.25, 1.25, 3.1, 32);
    const wireMat = new THREE.MeshBasicMaterial({ 
        color: 0x1764ff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.05 
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    // 4. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const blueRim = new THREE.PointLight(0x1764ff, 2, 10);
    blueRim.position.set(-3, 0, 4);
    scene.add(blueRim);

    // Strobe Light (Simulates Camera Flash)
    const strobe = new THREE.PointLight(0xffffff, 0, 20);
    strobe.position.set(0, 2, 5);
    scene.add(strobe);

    // 5. ANIMATION LOOP
    const clock = new THREE.Clock();
    let cycleTime = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        cycleTime += delta;

        // Rotate Part
        product.rotation.y += 0.01;
        product.rotation.z = Math.sin(time * 0.5) * 0.05;
        wireframe.rotation.copy(product.rotation);

        // Simulation Logic: Every 4 seconds, trigger a "Scan/Flash"
        if (cycleTime > 4) {
            triggerScan();
            cycleTime = 0;
        }

        // Fade out strobe
        if (strobe.intensity > 0) strobe.intensity -= 0.5;

        renderer.render(scene, camera);
    }

    function triggerScan() {
        // 1. Flash Light
        strobe.intensity = 8;
        
        // 2. Randomize Result (80% OK, 20% NG)
        const isDefect = Math.random() > 0.7;

        if (isDefect) {
            // DEFECT STATE
            statusPill.innerText = "DEFECT DETECTED";
            statusPill.style.background = "#ff0044";
            statusPill.style.color = "#fff";
            
            confPill.innerText = "CONFIDENCE: 99.2%";
            
            wireframe.material.color.setHex(0xff0044);
            wireframe.material.opacity = 0.4;
            
            defect.material.opacity = 1; // Show red spot
            
            scanLine.style.borderColor = "#ff0044";
        } else {
            // OK STATE
            statusPill.innerText = "STATUS: OK";
            statusPill.style.background = "rgba(255, 255, 255, 0.3)";
            statusPill.style.color = "#0b1a38";

            confPill.innerText = "CONFIDENCE: 99.9%";
            
            wireframe.material.color.setHex(0x1764ff);
            wireframe.material.opacity = 0.05;
            
            defect.material.opacity = 0; // Hide red spot

            scanLine.style.borderColor = "#1764ff";
        }
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        if(!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}
