'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { DUNYA_NOKTALARI } from './dunyaNoktalari';

const YARICAP = 2;

function latLonToVec3(lat: number, lon: number, r: number = YARICAP) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}

// Çok merkezli küresel ticaret ağı — sadece Türkiye değil, ülkeler arası da rotalar var
const MERKEZLER = {
    turkiye: { lat: 39, lon: 35, ad: 'Türkiye' },
    almanya: { lat: 51.2, lon: 10.4, ad: 'Almanya' },
    abd: { lat: 40.7, lon: -74.0, ad: 'ABD' },
    ingiltere: { lat: 51.5, lon: -0.1, ad: 'Birleşik Krallık' },
    bae: { lat: 25.2, lon: 55.3, ad: 'BAE' },
    cin: { lat: 31.2, lon: 121.5, ad: 'Çin' },
    hindistan: { lat: 19.1, lon: 72.9, ad: 'Hindistan' },
    brezilya: { lat: -23.5, lon: -46.6, ad: 'Brezilya' },
    guneyAfrika: { lat: -26.2, lon: 28.0, ad: 'Güney Afrika' },
    avustralya: { lat: -33.9, lon: 151.2, ad: 'Avustralya' },
};

const ROTALAR: [keyof typeof MERKEZLER, keyof typeof MERKEZLER][] = [
    ['turkiye', 'almanya'],
    ['turkiye', 'bae'],
    ['turkiye', 'ingiltere'],
    ['turkiye', 'cin'],
    ['turkiye', 'hindistan'],
    ['almanya', 'abd'],
    ['almanya', 'cin'],
    ['abd', 'ingiltere'],
    ['abd', 'brezilya'],
    ['abd', 'cin'],
    ['ingiltere', 'hindistan'],
    ['bae', 'hindistan'],
    ['cin', 'avustralya'],
    ['hindistan', 'avustralya'],
    ['brezilya', 'guneyAfrika'],
    ['guneyAfrika', 'bae'],
    ['turkiye', 'abd'],
    ['turkiye', 'guneyAfrika'],
    ['almanya', 'ingiltere'],
    ['almanya', 'hindistan'],
    ['bae', 'cin'],
    ['brezilya', 'avustralya'],
];

function Rota({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
    const noktalar = useMemo(() => {
        const orta = from.clone().add(to).multiplyScalar(0.5);
        // Uzun mesafeli rotalarda kavis çok yükselip kamera görüş alanının dışına taşmasın diye üst sınır konuldu
        const yukseklik = Math.min(from.distanceTo(to) * 0.35, 0.55);
        orta.normalize().multiplyScalar(YARICAP + yukseklik);
        const egri = new THREE.QuadraticBezierCurve3(from, orta, to);
        return egri.getPoints(48);
    }, [from, to]);

    return <Line points={noktalar} color="#b2e630" lineWidth={1.5} transparent opacity={0.85} />;
}

function Nokta({ pos, buyuk }: { pos: THREE.Vector3; buyuk?: boolean }) {
    return (
        <mesh position={pos}>
            <sphereGeometry args={[buyuk ? 0.05 : 0.035, 12, 12]} />
            <meshBasicMaterial color="#e0e3e5" />
        </mesh>
    );
}

/** Kıtaların şeklini oluşturan beyaz/gri nokta bulutu — tek bir InstancedMesh ile performanslı çizim */
function KitaNoktalari() {
    const ref = useRef<THREE.InstancedMesh>(null);
    const sayi = DUNYA_NOKTALARI.length;

    useEffect(() => {
        if (!ref.current) return;
        const dummy = new THREE.Object3D();
        DUNYA_NOKTALARI.forEach(([lat, lon], i) => {
            const pos = latLonToVec3(lat, lon, YARICAP * 1.004);
            dummy.position.copy(pos);
            dummy.updateMatrix();
            ref.current!.setMatrixAt(i, dummy.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    }, [sayi]);

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, sayi]}>
            <sphereGeometry args={[0.014, 5, 5]} />
            <meshBasicMaterial color="#c1c8c4" transparent opacity={0.8} />
        </instancedMesh>
    );
}

interface KureProps {
    dragRef: React.MutableRefObject<number>;
    scrollRef: React.MutableRefObject<number>;
    otoRef: React.MutableRefObject<number>;
    suruklerkenRef: React.MutableRefObject<boolean>;
    azaltilmisHareket: boolean;
}

const OTO_DONUS_HIZI = 0.045; // radyan/saniye — yavaş, kendiliğinden dönüş

function Kure({ dragRef, scrollRef, otoRef, suruklerkenRef, azaltilmisHareket }: KureProps) {
    const grup = useRef<THREE.Group>(null);
    const merkezVekVektor = useMemo(() => {
        const kayit: Record<string, THREE.Vector3> = {};
        for (const key in MERKEZLER) {
            const m = MERKEZLER[key as keyof typeof MERKEZLER];
            kayit[key] = latLonToVec3(m.lat, m.lon);
        }
        return kayit;
    }, []);

    useFrame((_state, delta) => {
        // Sürüklenmiyorken (ve azaltılmış hareket tercih edilmemişse) küre kendiliğinden yavaşça dönmeye devam eder
        if (!suruklerkenRef.current && !azaltilmisHareket) {
            otoRef.current += delta * OTO_DONUS_HIZI;
        }
        if (grup.current) {
            grup.current.rotation.y = otoRef.current + scrollRef.current + dragRef.current;
        }
    });

    return (
        <group ref={grup}>
            {/* Ana küre */}
            <mesh>
                <sphereGeometry args={[YARICAP, 48, 48]} />
                <meshBasicMaterial color="#101415" transparent opacity={0.94} />
            </mesh>

            {/* Kıtaları oluşturan nokta bulutu */}
            <KitaNoktalari />

            {/* Şehir/ülke merkezleri */}
            {Object.entries(MERKEZLER).map(([key, m]) => (
                <Nokta key={key} pos={merkezVekVektor[key]} buyuk={key === 'turkiye'} />
            ))}

            {/* Ülkeler arası yeşil rotalar */}
            {ROTALAR.map(([a, b], i) => (
                <Rota key={i} from={merkezVekVektor[a]} to={merkezVekVektor[b]} />
            ))}
        </group>
    );
}

export default function GlobeSahnesi() {
    const dragRef = useRef(0);
    const scrollRef = useRef(0);
    const otoRef = useRef(0);
    const suruklerkenRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const azaltilmisHareket = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
    );

    useEffect(() => {
        let sonX = 0;
        let dragBaslangic = 0;

        const onScroll = () => {
            if (azaltilmisHareket) return;
            scrollRef.current = window.scrollY * 0.0025;
        };

        const onPointerDown = (e: PointerEvent) => {
            suruklerkenRef.current = true;
            sonX = e.clientX;
            dragBaslangic = dragRef.current;
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!suruklerkenRef.current) return;
            const delta = e.clientX - sonX;
            dragRef.current = dragBaslangic + delta * 0.01;
        };
        const onPointerUp = () => { suruklerkenRef.current = false; };

        window.addEventListener('scroll', onScroll, { passive: true });
        const el = containerRef.current;
        el?.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            window.removeEventListener('scroll', onScroll);
            el?.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [azaltilmisHareket]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '420px', cursor: 'grab', touchAction: 'none' }}>
            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]}>
                <Kure dragRef={dragRef} scrollRef={scrollRef} otoRef={otoRef} suruklerkenRef={suruklerkenRef} azaltilmisHareket={azaltilmisHareket} />
            </Canvas>
        </div>
    );
}
