/* ============================================================
   GRUPO — interactions + WebGL hero scene
   ============================================================ */

(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- nav ---------------- */

  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  });

  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.style.display === "flex";
    navLinks.style.display = open ? "none" : "flex";
    navLinks.style.cssText = open
      ? "display:none;"
      : "display:flex; position:fixed; top:64px; left:0; right:0; background:rgba(5,7,12,0.96); flex-direction:column; padding:24px 32px; gap:20px; border-bottom:1px solid var(--line);";
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      if (window.innerWidth <= 720) navLinks.style.display = "none";
    })
  );

  /* ---------------- scroll reveal ---------------- */

  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------------- animated stat counters ---------------- */

  function formatNum(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  const statEls = document.querySelectorAll(".stat-num");
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const duration = 1800;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + formatNum(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statIo.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => statIo.observe(el));

  /* ---------------- HUD readouts ---------------- */

  const hudNodes = document.getElementById("hudNodes");
  const hudBuild = document.getElementById("hudBuild");
  const hudCoord = document.getElementById("hudCoord");
  const hudRev = document.getElementById("hudRev");

  let nodeCount = 0;
  setInterval(() => {
    nodeCount = (nodeCount + Math.floor(Math.random() * 7) + 1) % 999;
    if (hudNodes) hudNodes.textContent = String(nodeCount).padStart(3, "0");
    if (hudBuild) hudBuild.textContent = (30 + Math.floor(Math.random() * 60)) + "%";
    if (hudRev) hudRev.textContent = "$" + (Math.floor(Math.random() * 900) + 100) + "/s";
  }, 1400);

  if (hudCoord) {
    let lat = 51.5, lon = -0.1;
    setInterval(() => {
      lat += (Math.random() - 0.5) * 0.4;
      lon += (Math.random() - 0.5) * 0.4;
      hudCoord.textContent = `${lat.toFixed(1)}N / ${Math.abs(lon).toFixed(1)}${lon < 0 ? "W" : "E"}`;
    }, 2200);
  }

  /* ---------------- split simulator ---------------- */

  const simRevenue = document.getElementById("simRevenue");
  const simRevenueVal = document.getElementById("simRevenueVal");
  const simRolesEl = document.getElementById("simRoles");
  const simFee = document.getElementById("simFee");
  const simDistributed = document.getElementById("simDistributed");
  const simWarning = document.getElementById("simWarning");

  const FEE_RATE = 0.05;

  let roles = [
    { name: "Founder / Idea", pct: 40 },
    { name: "Growth Marketer", pct: 25 },
    { name: "Video Editor", pct: 20 },
    { name: "Backend Dev", pct: 15 },
  ];

  function currency(n) {
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function renderSim() {
    const revenue = parseFloat(simRevenue.value);
    simRevenueVal.textContent = Math.round(revenue).toLocaleString("en-US");

    const fee = revenue * FEE_RATE;
    const distributable = revenue - fee;

    simRolesEl.innerHTML = "";
    let pctSum = 0;

    roles.forEach((role, i) => {
      pctSum += role.pct;
      const row = document.createElement("div");
      row.className = "sim-role-row";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = role.name;
      nameInput.setAttribute("aria-label", "Role name");
      nameInput.addEventListener("input", (e) => {
        roles[i].name = e.target.value;
      });

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = role.pct;
      slider.setAttribute("aria-label", "Split percentage");
      slider.addEventListener("input", (e) => {
        roles[i].pct = parseFloat(e.target.value);
        renderSim();
      });

      const pctLabel = document.createElement("div");
      pctLabel.className = "sim-role-pct";
      pctLabel.textContent = role.pct + "%";

      const payoutLabel = document.createElement("div");
      payoutLabel.className = "sim-role-payout";
      payoutLabel.textContent = currency(distributable * (role.pct / 100));

      row.appendChild(nameInput);
      row.appendChild(slider);
      row.appendChild(pctLabel);
      row.appendChild(payoutLabel);
      simRolesEl.appendChild(row);
    });

    simFee.textContent = currency(fee);
    simDistributed.textContent = currency(distributable);

    if (pctSum !== 100) {
      simWarning.textContent = `Roles currently total ${pctSum}% — adjust so the split sheet sums to 100%.`;
    } else {
      simWarning.textContent = "";
    }
  }

  if (simRevenue) {
    simRevenue.addEventListener("input", renderSim);
    renderSim();
  }

  /* ============================================================
     THREE.js hero scene — constellation sphere + hud grid floor
     ============================================================ */

  const canvas = document.getElementById("scene");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070c, 0.045);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.6, 8.5);

  // soft glow sprite texture generated on a canvas
  function makeGlowTexture() {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(120,220,255,0.7)");
    grd.addColorStop(1, "rgba(120,220,255,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }
  const glowTexture = makeGlowTexture();

  // --- constellation sphere: fibonacci-distributed points + nearest-neighbor lines ---
  const group = new THREE.Group();
  scene.add(group);

  const NODE_COUNT = 220;
  const RADIUS = 3.4;
  const positions = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    positions.push(new THREE.Vector3(x, y, z).multiplyScalar(RADIUS));
  }

  const pointsGeo = new THREE.BufferGeometry().setFromPoints(positions);
  const pointsMat = new THREE.PointsMaterial({
    size: 0.16,
    map: glowTexture,
    transparent: true,
    depthWrite: false,
    color: 0x8fe9ff,
    blending: THREE.AdditiveBlending,
  });
  const pointCloud = new THREE.Points(pointsGeo, pointsMat);
  group.add(pointCloud);

  // connect points within a distance threshold (computed once, geometry is static)
  const lineVerts = [];
  const THRESH = 1.15;
  for (let i = 0; i < positions.length; i++) {
    let connections = 0;
    for (let j = i + 1; j < positions.length && connections < 3; j++) {
      if (positions[i].distanceTo(positions[j]) < THRESH) {
        lineVerts.push(positions[i].x, positions[i].y, positions[i].z);
        lineVerts.push(positions[j].x, positions[j].y, positions[j].z);
        connections++;
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineVerts, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x2c6f8a,
    transparent: true,
    opacity: 0.35,
  });
  const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lineMesh);

  // outer wireframe shell for structure
  const shellGeo = new THREE.IcosahedronGeometry(RADIUS + 0.55, 1);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0xf2c14e,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  group.add(shell);

  // grid floor, tron-style, fading with fog
  const gridHelper = new THREE.GridHelper(60, 60, 0x1c5b73, 0x0f2e3b);
  gridHelper.position.y = -3.6;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.35;
  scene.add(gridHelper);

  // ambient particle dust
  const dustCount = 400;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 30;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.03,
    color: 0x4fe3ff,
    transparent: true,
    opacity: 0.4,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // mouse parallax
  let mouseX = 0,
    mouseY = 0,
    targetRotX = 0,
    targetRotY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      group.rotation.y = t * 0.06;
      shell.rotation.y = -t * 0.03;
      shell.rotation.x = t * 0.015;
      dust.rotation.y = t * 0.01;

      targetRotY += (mouseX * 0.25 - targetRotY) * 0.03;
      targetRotX += (mouseY * 0.15 - targetRotX) * 0.03;
      group.rotation.x = targetRotX;
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (0.6 - mouseY * 0.4 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }
  animate();
})();
