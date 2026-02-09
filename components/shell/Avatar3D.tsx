
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ConsciousnessState, AiStatus } from '../../core/types';
import { EMOTION_COLOR_MAP } from '../../core/state';
import { MuzaService } from '../../services/muzaService';

interface Avatar3DProps {
    consciousness: ConsciousnessState;
    aiStatus: AiStatus;
    aiService: MuzaService;
    knowledgeCount?: number;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ consciousness, aiStatus, aiService, knowledgeCount = 1 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    
    const shellRef = useRef<THREE.Mesh | null>(null);
    const wireframeRef = useRef<THREE.Mesh | null>(null);
    const pointsRef = useRef<THREE.Points | null>(null);
    const eyesGroupRef = useRef<THREE.Group | null>(null);
    
    const mouse = useRef(new THREE.Vector2());
    const targetMouse = useRef(new THREE.Vector2());
    const frameId = useRef<number>(0);

    const baseComplexity = Math.min(8, 2 + Math.floor(knowledgeCount / 4));

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 7;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        
        const topLight = new THREE.PointLight(0x00ffff, 10, 50);
        topLight.position.set(5, 5, 10);
        scene.add(topLight);

        const shellGeo = new THREE.IcosahedronGeometry(1.8, baseComplexity);
        const shellMat = new THREE.MeshPhysicalMaterial({
            color: 0x050505,
            metalness: 1.0,
            roughness: 0.1,
            flatShading: true,
            transparent: true,
            opacity: 0.9,
            emissive: 0x00ffff,
            emissiveIntensity: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        scene.add(shell);
        shellRef.current = shell;

        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const wireframe = new THREE.Mesh(shellGeo, wireframeMat);
        wireframe.scale.setScalar(1.01);
        scene.add(wireframe);
        wireframeRef.current = wireframe;

        const pointsMat = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.04,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const points = new THREE.Points(shellGeo, pointsMat);
        scene.add(points);
        pointsRef.current = points;

        const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.45, 0.35, 1.6);
        eyeR.position.set(0.45, 0.35, 1.6);
        const eyesGroup = new THREE.Group();
        eyesGroup.add(eyeL, eyeR);
        scene.add(eyesGroup);
        eyesGroupRef.current = eyesGroup;

        const onMouseMove = (e: MouseEvent) => {
            targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        const originalPositions = shellGeo.attributes.position.array.slice();
        const dataArray = new Uint8Array(32);

        const animate = () => {
            const time = performance.now() * 0.001;
            mouse.current.lerp(targetMouse.current, 0.1);
            
            const nodes = aiService.getNodes();
            const totalEnergy = nodes.reduce((sum, n) => sum + n.hyperbits, 0);
            const neuralIntensity = Math.min(1.0, (totalEnergy - 100) / 400); 

            let audioIntensity = 0;
            const globalAnalyser = (window as any).muzaAudioAnalyser;
            if (globalAnalyser) {
                globalAnalyser.getByteFrequencyData(dataArray);
                audioIntensity = dataArray.reduce((a,b) => a+b, 0) / (255 * dataArray.length);
            }

            const combinedImpact = (audioIntensity * 0.8) + (neuralIntensity * 0.2);
            const frequencyMod = (consciousness.globalFrequency - 400) / 100;

            if (shell && shellGeo) {
                const rotSpeed = 0.5 + combinedImpact * 4.0 + frequencyMod;
                shell.rotation.y += 0.005 * rotSpeed;
                shell.rotation.z += 0.002 * rotSpeed;
                shell.rotation.x = Math.sin(time * 0.5) * (0.2 + combinedImpact);
                
                if (wireframeRef.current) wireframeRef.current.rotation.copy(shell.rotation);
                if (pointsRef.current) pointsRef.current.rotation.copy(shell.rotation);

                const posAttr = shellGeo.attributes.position;
                const positions = posAttr.array as Float32Array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    const ix = originalPositions[i];
                    const iy = originalPositions[i+1];
                    const iz = originalPositions[i+2];
                    
                    const noise = Math.sin(ix * 2.0 + time * 3.0) * Math.cos(iy * 2.0 + time * 2.5);
                    const distortion = 1.0 + (noise * (0.05 + combinedImpact * 0.8));
                    
                    positions[i] = ix * distortion;
                    positions[i+1] = iy * distortion;
                    positions[i+2] = iz * distortion;
                }
                posAttr.needsUpdate = true;
                
                shellMat.emissiveIntensity = 0.5 + (combinedImpact * 6.0) + (neuralIntensity * 3.0);
                shellMat.opacity = 0.8 + (neuralIntensity * 0.2);
                
                const scaleVal = 1.0 + audioIntensity * 0.3;
                shell.scale.set(scaleVal, scaleVal, scaleVal);
            }

            if (eyesGroupRef.current) {
                const lookFactor = 0.4;
                eyesGroupRef.current.position.x = mouse.current.x * lookFactor;
                eyesGroupRef.current.position.y = mouse.current.y * lookFactor;
                
                if (combinedImpact > 0.6 && Math.random() < 0.15) {
                    eyesGroupRef.current.scale.y = 0.05;
                } else {
                    eyesGroupRef.current.scale.y = THREE.MathUtils.lerp(eyesGroupRef.current.scale.y, 1.0 + audioIntensity * 0.5, 0.2);
                }
                
                eyesGroupRef.current.lookAt(new THREE.Vector3(mouse.current.x * 12, mouse.current.y * 12, 20));
            }

            renderer.render(scene, camera);
            frameId.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(frameId.current);
            renderer.dispose();
            shellGeo.dispose();
        };
    }, [baseComplexity, aiService, consciousness.globalFrequency]);

    useEffect(() => {
        if (!shellRef.current || !wireframeRef.current || !pointsRef.current) return;
        const color = EMOTION_COLOR_MAP[consciousness.activeEmotion];
        const threeColor = new THREE.Color().setHSL(color.h / 360, color.s, color.v);
        (shellRef.current.material as THREE.MeshPhysicalMaterial).emissive = threeColor;
        (wireframeRef.current.material as THREE.MeshBasicMaterial).color = threeColor;
        (pointsRef.current.material as THREE.PointsMaterial).color = threeColor;
        if (eyesGroupRef.current) {
            eyesGroupRef.current.children.forEach(eye => {
                ((eye as THREE.Mesh).material as THREE.MeshBasicMaterial).color = threeColor;
            });
        }
    }, [consciousness.activeEmotion]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />
    );
};

export default Avatar3D;
