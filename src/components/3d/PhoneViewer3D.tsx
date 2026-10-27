import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCw, Sparkles, Smartphone, Eye, ShieldCheck } from 'lucide-react';

interface PhoneViewer3DProps {
  productId?: string;
  className?: string;
  onClick?: () => void;
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y, x + r, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  ctx.fill();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y, x + r, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  ctx.stroke();
}

/**
 * Generates an ultra-high-definition, neat, clean flagship AMOLED screen texture.
 * Features:
 * - Luxury Titanium Dark Obsidian wallpaper with warm copper/champagne flowing gradients
 * - Top system status bar (Time, 5G, Wi-Fi 7, battery pill, punch-hole selfie camera)
 * - Minimalist digital clock & date widget
 * - GeneaTrace Digital Product Passport HUD card (Merkle Root, Serial, Batch, Tamper Lock, micro QR)
 * - Quick action shortcuts & bottom gesture bar
 */
function createPhoneScreenTexture(): THREE.CanvasTexture {
  const width = 1080;
  const height = 2340;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    return fallbackTexture;
  }

  // 1. Wallpaper Background (Deep Luxury Obsidian with Copper / Bronze Radiance)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#060403');
  bgGrad.addColorStop(0.25, '#120a06');
  bgGrad.addColorStop(0.65, '#1a0e08');
  bgGrad.addColorStop(1, '#080504');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient radial glow orbs
  const radialGlow1 = ctx.createRadialGradient(width * 0.7, height * 0.35, 80, width * 0.7, height * 0.35, 680);
  radialGlow1.addColorStop(0, 'rgba(232, 157, 123, 0.28)');
  radialGlow1.addColorStop(0.5, 'rgba(217, 130, 91, 0.12)');
  radialGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow1;
  ctx.fillRect(0, 0, width, height);

  const radialGlow2 = ctx.createRadialGradient(width * 0.25, height * 0.75, 60, width * 0.25, height * 0.75, 600);
  radialGlow2.addColorStop(0, 'rgba(184, 93, 56, 0.22)');
  radialGlow2.addColorStop(0.6, 'rgba(138, 62, 34, 0.08)');
  radialGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow2;
  ctx.fillRect(0, 0, width, height);

  // Flowing silk ribbon wave (Titanium Champagne & Copper)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-150, 680);
  ctx.bezierCurveTo(340, 420, 820, 1120, width + 150, 780);
  ctx.bezierCurveTo(width + 50, 1260, 460, 1580, -150, 1240);
  ctx.closePath();
  const waveGrad = ctx.createLinearGradient(0, 500, width, 1400);
  waveGrad.addColorStop(0, 'rgba(232, 157, 123, 0.22)');
  waveGrad.addColorStop(0.4, 'rgba(217, 130, 91, 0.16)');
  waveGrad.addColorStop(0.8, 'rgba(184, 93, 56, 0.09)');
  waveGrad.addColorStop(1, 'rgba(10, 6, 4, 0)');
  ctx.fillStyle = waveGrad;
  ctx.fill();

  // Fine specular golden rim along the wave
  ctx.beginPath();
  ctx.moveTo(-100, 680);
  ctx.bezierCurveTo(340, 420, 820, 1120, width + 100, 780);
  ctx.strokeStyle = 'rgba(247, 213, 197, 0.38)';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // 2. Top System Status Bar (Y: 50 - 110)
  ctx.save();
  // Time on Top-Left
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 38px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('09:41', 72, 92);

  // Punch-Hole Front Selfie Camera at Top Center (x: 540, y: 76)
  ctx.beginPath();
  ctx.arc(540, 76, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#040202';
  ctx.fill();
  ctx.strokeStyle = 'rgba(217, 130, 91, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Camera lens inner reflection glint
  ctx.beginPath();
  ctx.arc(544, 72, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(80, 140, 220, 0.45)';
  ctx.fill();

  // Right Status Icons: 5G Pill, Wi-Fi Arcs, Battery Pill
  // 5G Pill
  ctx.strokeStyle = 'rgba(247, 213, 197, 0.6)';
  ctx.lineWidth = 2;
  strokeRoundRect(ctx, 810, 64, 52, 28, 6);
  ctx.fillStyle = '#f7d5c5';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('5G', 836, 85);

  // Wi-Fi Icon (concentric arcs at x: 890, y: 88)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(895, 88, 16, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(895, 88, 10, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(895, 88, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Battery Pill: x: 940, y: 65, w: 58, h: 26, r: 7
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  strokeRoundRect(ctx, 940, 65, 58, 26, 7);
  // Battery positive nub
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(1000, 73, 4, 10);
  // Battery filled level (98% - Emerald Green)
  ctx.fillStyle = '#34d399';
  fillRoundRect(ctx, 944, 69, 48, 18, 4);

  // Tiny hardware attestation shield dot
  ctx.beginPath();
  ctx.arc(1022, 78, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#34d399';
  ctx.fill();
  ctx.restore();

  // 3. Minimalist Flagship Clock & Date Widget (Y: 220 - 450)
  ctx.save();
  ctx.textAlign = 'center';

  // Large elegant numerals
  ctx.fillStyle = '#ffffff';
  ctx.font = '300 138px Arial, -apple-system, sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.fillText('09:41', width / 2, 350);
  ctx.shadowBlur = 0;

  // Date
  ctx.fillStyle = '#e8d5cc';
  ctx.font = '400 30px Arial, sans-serif';
  ctx.fillText('Wednesday, October 28', width / 2, 412);

  // Hardware Security Status Pill
  const pillText = 'GENEATRACE SECURITY OS  •  KNOX VAULT 3.0';
  ctx.font = 'bold 18px "JetBrains Mono", Consolas, monospace';
  const pillMetrics = ctx.measureText(pillText);
  const pillW = pillMetrics.width + 48;
  const pillX = (width - pillW) / 2;
  const pillY = 444;

  ctx.fillStyle = 'rgba(24, 16, 12, 0.75)';
  fillRoundRect(ctx, pillX, pillY, pillW, 36, 18);
  ctx.strokeStyle = 'rgba(217, 130, 91, 0.4)';
  ctx.lineWidth = 1.5;
  strokeRoundRect(ctx, pillX, pillY, pillW, 36, 18);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(pillX + 22, pillY + 18, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e89d7b';
  ctx.textAlign = 'left';
  ctx.fillText(pillText, pillX + 36, pillY + 24);
  ctx.restore();

  // 4. GeneaTrace Digital Product Passport HUD Card (Y: 530 - 1520)
  ctx.save();
  const cardX = 60;
  const cardY = 520;
  const cardW = width - 120;
  const cardH = 970;
  const cardR = 42;

  // Frosted dark glass container
  ctx.fillStyle = 'rgba(18, 12, 9, 0.88)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.shadowBlur = 0;

  // Glowing warm copper border
  ctx.strokeStyle = 'rgba(217, 130, 91, 0.38)';
  ctx.lineWidth = 2.5;
  strokeRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);

  // Inner card header
  const headerY = cardY + 68;

  // Shield Emblem
  ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
  fillRoundRect(ctx, cardX + 32, headerY - 32, 54, 54, 16);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.lineWidth = 1.5;
  strokeRoundRect(ctx, cardX + 32, headerY - 32, 54, 54, 16);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  // Draw mini shield path
  const sx = cardX + 59;
  const sy = headerY - 20;
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + 14, sy + 5);
  ctx.lineTo(sx + 14, sy + 18);
  ctx.quadraticCurveTo(sx + 14, sy + 28, sx, sy + 34);
  ctx.quadraticCurveTo(sx - 14, sy + 28, sx - 14, sy + 18);
  ctx.lineTo(sx - 14, sy + 5);
  ctx.closePath();
  ctx.fill();

  // Card Header Titles
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 27px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GENEATRACE DIGITAL PASSPORT', cardX + 104, headerY - 4);

  ctx.fillStyle = '#cbb5aa';
  ctx.font = '400 19px Arial, sans-serif';
  ctx.fillText('Cryptographic Genesis & Custody Container', cardX + 104, headerY + 22);

  // OEM Attested Pill on Right
  const badgeX = cardX + cardW - 190;
  const badgeY = headerY - 26;
  ctx.fillStyle = 'rgba(52, 211, 153, 0.14)';
  fillRoundRect(ctx, badgeX, badgeY, 158, 38, 19);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.lineWidth = 1.5;
  strokeRoundRect(ctx, badgeX, badgeY, 158, 38, 19);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(badgeX + 22, badgeY + 19, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 16px "JetBrains Mono", Consolas, monospace';
  ctx.fillText('OEM ATTESTED', badgeX + 36, badgeY + 25);

  // Horizontal divider
  const divY = cardY + 130;
  const divGrad = ctx.createLinearGradient(cardX + 30, divY, cardX + cardW - 30, divY);
  divGrad.addColorStop(0, 'rgba(217, 130, 91, 0.55)');
  divGrad.addColorStop(0.5, 'rgba(232, 157, 123, 0.25)');
  divGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 32, divY);
  ctx.lineTo(cardX + cardW - 32, divY);
  ctx.stroke();

  // Telemetry Rows (Labels and Values)
  const rows = [
    {
      label: 'HARDWARE MODEL',
      val: 'Samsung Galaxy S25 Ultra 512GB (Titanium)',
      color: '#ffffff',
      isMono: false
    },
    {
      label: 'CRYPTOGRAPHIC SERIAL (IMEI BOUND)',
      val: 'SM-S928-IND-00841',
      color: '#f7d5c5',
      isMono: true
    },
    {
      label: 'MANUFACTURING BATCH & LINEAGE',
      val: 'Batch AAA  •  Display Cleanroom Line 3 (AOI Passed)',
      color: '#ffffff',
      isMono: false
    },
    {
      label: 'BLOCKCHAIN MERKLE ROOT ANCHOR',
      val: '0x296d05ac8433afd4b24f262cf2a99e5c',
      color: '#e89d7b',
      isMono: true
    },
    {
      label: 'TAMPER ENCLAVE & LOCK STATUS',
      val: 'Sealed  •  Zero Unauthorized Part Replacements',
      color: '#34d399',
      isMono: false
    }
  ];

  let currentY = divY + 45;
  rows.forEach((r) => {
    // Label
    ctx.fillStyle = '#a69489';
    ctx.font = 'bold 15px "JetBrains Mono", Consolas, monospace';
    ctx.fillText(r.label, cardX + 36, currentY);

    // Value Box
    currentY += 28;
    ctx.fillStyle = 'rgba(25, 17, 13, 0.6)';
    fillRoundRect(ctx, cardX + 32, currentY - 20, cardW - 64, 48, 12);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    strokeRoundRect(ctx, cardX + 32, currentY - 20, cardW - 64, 48, 12);

    ctx.fillStyle = r.color;
    ctx.font = r.isMono
      ? 'bold 22px "JetBrains Mono", Consolas, monospace'
      : '600 21px Arial, sans-serif';
    ctx.fillText(r.val, cardX + 48, currentY + 12);

    currentY += 66;
  });

  // Micro QR Code and Certificate Footer inside Card
  const qrBoxY = cardY + cardH - 180;
  ctx.fillStyle = 'rgba(10, 6, 4, 0.65)';
  fillRoundRect(ctx, cardX + 32, qrBoxY, cardW - 64, 150, 18);
  ctx.strokeStyle = 'rgba(217, 130, 91, 0.22)';
  ctx.lineWidth = 1.5;
  strokeRoundRect(ctx, cardX + 32, qrBoxY, cardW - 64, 150, 18);

  // Left text inside footer
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('Container ID: GT-DEV-00000851', cardX + 54, qrBoxY + 42);

  ctx.fillStyle = '#cbb5aa';
  ctx.font = '400 16px Arial, sans-serif';
  ctx.fillText('Ed25519 Signed by GeneaTrace Root Authority', cardX + 54, qrBoxY + 74);
  ctx.fillText('Ethereum Sepolia Anchor Block #1849340', cardX + 54, qrBoxY + 104);

  // Mini QR code representation on right side of footer
  const qrX = cardX + cardW - 170;
  const qrY = qrBoxY + 15;
  const qrSize = 120;
  ctx.fillStyle = '#ffffff';
  fillRoundRect(ctx, qrX, qrY, qrSize, qrSize, 8);

  // Draw QR pattern simulation (Finder squares and data cells)
  ctx.fillStyle = '#0a0604';
  // Top-left finder
  ctx.fillRect(qrX + 10, qrY + 10, 32, 32);
  ctx.clearRect(qrX + 16, qrY + 16, 20, 20);
  ctx.fillRect(qrX + 21, qrY + 21, 10, 10);

  // Top-right finder
  ctx.fillRect(qrX + qrSize - 42, qrY + 10, 32, 32);
  ctx.clearRect(qrX + qrSize - 36, qrY + 16, 20, 20);
  ctx.fillRect(qrX + qrSize - 31, qrY + 21, 10, 10);

  // Bottom-left finder
  ctx.fillRect(qrX + 10, qrY + qrSize - 42, 32, 32);
  ctx.clearRect(qrX + 16, qrY + qrSize - 36, 20, 20);
  ctx.fillRect(qrX + 21, qrY + qrSize - 31, 10, 10);

  // Random deterministic data blocks
  for (let bx = 0; bx < 6; bx++) {
    for (let by = 0; by < 6; by++) {
      if ((bx + by * 3) % 2 === 0) {
        ctx.fillRect(qrX + 46 + bx * 6, qrY + 46 + by * 6, 4, 4);
      }
    }
  }
  ctx.restore();

  // 5. Bottom Controls, Shortcuts & Home Indicator (Y: 1980 - 2310)
  ctx.save();
  // Live Station Pipeline Breadcrumb Pill
  const statusPillY = 1960;
  ctx.fillStyle = 'rgba(25, 17, 13, 0.7)';
  fillRoundRect(ctx, width / 2 - 230, statusPillY, 460, 42, 21);
  ctx.strokeStyle = 'rgba(217, 130, 91, 0.3)';
  ctx.lineWidth = 1;
  strokeRoundRect(ctx, width / 2 - 230, statusPillY, 460, 42, 21);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(width / 2 - 200, statusPillY + 21, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f7d5c5';
  ctx.font = '600 17px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('6 OF 6 STAGES ATTESTED (GENESIS COMPLETE)', width / 2 + 10, statusPillY + 27);

  // Left Shortcut Circle (Flashlight)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(150, 2140, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(150, 2140, 12, 0, Math.PI * 2);
  ctx.fill();

  // Right Shortcut Circle (Camera)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(width - 150, 2140, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(width - 150, 2140, 14, 0, Math.PI * 2);
  ctx.fill();

  // Helper Text
  ctx.fillStyle = '#a69489';
  ctx.font = '500 23px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Swipe up to inspect Digital Passport', width / 2, 2240);

  // Bottom Swipe Indicator Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  fillRoundRect(ctx, width / 2 - 130, 2270, 260, 8, 4);
  ctx.restore();

  // Create CanvasTexture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const PhoneViewer3D: React.FC<PhoneViewer3DProps> = ({
  className = '',
  onClick
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [activePreset, setActivePreset] = useState<'360' | 'back' | 'front'>('360');
  const [loaded, setLoaded] = useState(false);

  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.6, 0.35, 4.2);

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (360 Degree Smooth Rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 2.8;
    controls.maxDistance = 6.0;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controls.minPolarAngle = Math.PI / 4.0;
    controlsRef.current = controls;

    // 5. Warm Amber/Copper Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd6, 1.8);
    scene.add(ambientLight);

    // Key Light (Warm Champagne)
    const keyLight = new THREE.DirectionalLight(0xf5c29f, 3.4);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Fill Light (Warm Roasted Copper)
    const fillLight = new THREE.DirectionalLight(0xd9825b, 2.2);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    // Top Rim Spotlight
    const spotLight = new THREE.SpotLight(0xffa87d, 4.2, 15, Math.PI / 4.5, 0.4, 1);
    spotLight.position.set(0, 5, 2);
    scene.add(spotLight);

    // Ground Uplight (Pedestal reflection)
    const groundLight = new THREE.PointLight(0xe89d7b, 3.0, 4, 1.2);
    groundLight.position.set(0, -1.1, 0);
    scene.add(groundLight);

    // 6. Glowing Circular Pedestal Stage
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.22, 0);
    scene.add(pedestalGroup);

    // Dark metallic cylinder stage
    const cylinderGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.14, 64);
    const cylinderMat = new THREE.MeshStandardMaterial({
      color: 0x140d09,
      metalness: 0.92,
      roughness: 0.25
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    pedestalGroup.add(cylinder);

    // Glowing Inner Ring 1
    const ring1Geo = new THREE.TorusGeometry(1.28, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xffa573,
      emissive: 0xe89d7b,
      emissiveIntensity: 2.4,
      roughness: 0.2
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.08;
    pedestalGroup.add(ring1);

    // Glowing Inner Ring 2
    const ring2Geo = new THREE.TorusGeometry(0.88, 0.016, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xfcb085,
      emissive: 0xd9825b,
      emissiveIntensity: 2.0,
      roughness: 0.2
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 0.08;
    pedestalGroup.add(ring2);

    // 7. Phone & S-Pen Model Group
    const modelGroup = new THREE.Group();
    modelGroup.position.set(0, 0.08, 0);
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Generate the crisp flagship screen texture
    const screenTexture = createPhoneScreenTexture();

    // 8. Load Blender-exported GLB
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      `/s25ultra.glb?t=${Date.now()}`,
      (gltf) => {
        const model = gltf.scene;

        // Auto-fit & normalize dimensions so it stands gracefully on the pedestal
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.0 / maxDim;
        model.scale.set(scale, scale, scale);

        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += 0.15;

        // Traverse mesh children: apply screen texture and hide blank 3D texts
        model.traverse((child) => {
          // Hide any extruded plain text (e.g. Front_Screen_GeneaTrace_Text)
          if (
            child.name.includes('Text') ||
            child.name.includes('GeneaTrace_Text') ||
            child.name.toLowerCase().includes('text')
          ) {
            child.visible = false;
          }

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const matName = (mesh.material as any)?.name || '';
            const isScreen =
              child.name === 'Front_Display_Panel' ||
              matName === 'M_Front_Screen' ||
              child.name.toLowerCase().includes('display') ||
              child.name.toLowerCase().includes('screen');

            if (isScreen) {
              // Apply vibrant 2600-nit AMOLED glowing screen material
              const screenMat = new THREE.MeshStandardMaterial({
                map: screenTexture,
                emissiveMap: screenTexture,
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 0.95,
                roughness: 0.06,
                metalness: 0.02,
                side: THREE.DoubleSide
              });
              mesh.material = screenMat;
              mesh.material.needsUpdate = true;
            } else if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.envMapIntensity = 1.3;
              mat.needsUpdate = true;
            }
          }
        });

        modelGroup.clear();
        modelGroup.add(model);
        setLoaded(true);
      },
      undefined,
      (err) => {
        console.error('Failed to load s25ultra.glb:', err);
      }
    );

    // Initial 3/4 angle showing back cameras & S-Pen
    modelGroup.rotation.y = Math.PI - 0.4;

    // 9. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Subtle breathing float animation
      if (modelGroupRef.current) {
        modelGroupRef.current.position.y = 0.08 + Math.sin(elapsed * 1.6) * 0.035;
      }

      // Pedestal pulse
      ring1.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.012);
      ring2.scale.setScalar(1 + Math.cos(elapsed * 2.2) * 0.012);

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      ro.disconnect();
      renderer.dispose();
      screenTexture.dispose();
      container.innerHTML = '';
    };
  }, []);

  const setAngle = (preset: '360' | 'back' | 'front') => {
    setActivePreset(preset);
    if (!controlsRef.current || !modelGroupRef.current) return;

    if (preset === '360') {
      controlsRef.current.autoRotate = true;
      setIsRotating(true);
    } else if (preset === 'back') {
      controlsRef.current.autoRotate = false;
      setIsRotating(false);
      controlsRef.current.reset();
      modelGroupRef.current.rotation.y = Math.PI; // Show rear camera optics & S-Pen
    } else if (preset === 'front') {
      controlsRef.current.autoRotate = false;
      setIsRotating(false);
      controlsRef.current.reset();
      modelGroupRef.current.rotation.y = 0; // Show front display
    }
  };

  const toggleRotate = () => {
    if (!controlsRef.current) return;
    const next = !isRotating;
    controlsRef.current.autoRotate = next;
    setIsRotating(next);
    if (next) setActivePreset('360');
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        onClick={onClick}
        className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing relative z-10"
        title="Click and drag to rotate the 3D model in 360°"
      />

      {/* Real-time Badge */}
      <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 pointer-events-none">
        <span className="px-2.5 py-0.5 rounded-full bg-[#1c120d]/85 backdrop-blur-md border border-[#d9825b]/30 text-[10px] font-mono font-semibold text-[#e89d7b] flex items-center gap-1.5 shadow-lg">
          <Sparkles size={11} className="text-[#f5a77f] animate-pulse" />
          <span>Real-time 3D WebGL</span>
        </span>
        <span className="text-[9px] text-[#cbb5aa]/75 font-mono tracking-wider">
          Drag to Orbit 360°
        </span>
      </div>

      {/* Preset View Switcher Under Pedestal */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 mt-1 bg-[#160e0a]/90 backdrop-blur-md p-1 rounded-xl border border-[#d9825b]/25 shadow-lg">
        <button
          onClick={() => toggleRotate()}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isRotating
              ? 'bg-gradient-to-r from-[#d9825b] to-[#b85d38] text-white shadow-sm font-bold'
              : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
          }`}
          title="Toggle 360° auto rotation"
        >
          <RotateCw size={11} className={isRotating ? 'animate-spin' : ''} />
          <span>360° Auto</span>
        </button>

        <button
          onClick={() => setAngle('back')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            activePreset === 'back' && !isRotating
              ? 'bg-gradient-to-r from-[#d9825b] to-[#b85d38] text-white shadow-sm font-bold'
              : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
          }`}
          title="Focus on rear camera optics and S-Pen"
        >
          <Eye size={11} />
          <span>Back Quad Optics</span>
        </button>

        <button
          onClick={() => setAngle('front')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            activePreset === 'front' && !isRotating
              ? 'bg-gradient-to-r from-[#d9825b] to-[#b85d38] text-white shadow-sm font-bold'
              : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
          }`}
          title="Focus on front display"
        >
          <Smartphone size={11} />
          <span>Front DPP HUD</span>
        </button>
      </div>
    </div>
  );
};

export default PhoneViewer3D;
