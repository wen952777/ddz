import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type CardType = {
  suit: "spades" | "hearts" | "diamonds" | "clubs";
  rank: "ace" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "jack" | "queen" | "king";
};
export function getCardImageURL(card: CardType): string {
  return `/cards/${card.rank}_of_${card.suit}.svg`;
}

export interface PlayerInfo {
  name: string;
  avatarUrl?: string;
}

export interface Game3DProps {
  myCards: CardType[];
  outCards?: CardType[];
  players?: PlayerInfo[];
}

export const Game3D: React.FC<Game3DProps> = ({
  myCards,
  outCards = [],
  players = [],
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = 800, height = 480;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x228b22);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 260, 380);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    // Table (圆桌)
    const tableGeometry = new THREE.CylinderGeometry(170, 170, 16, 64);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x2c6e36 });
    const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.position.y = -8;
    scene.add(tableMesh);

    // 玩家座位和头像
    for (let i = 0; i < 3; i++) {
      const angle = i * (2 * Math.PI / 3);
      const x = 140 * Math.cos(angle);
      const z = 140 * Math.sin(angle);

      // 座位
      const seatGeom = new THREE.TorusGeometry(22, 4, 16, 32);
      const seatMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const seat = new THREE.Mesh(seatGeom, seatMat);
      seat.position.set(x, 0, z);
      seat.rotation.x = Math.PI / 2;
      scene.add(seat);

      // 3D头像
      let avatarMesh: THREE.Mesh;
      if (players[i]?.avatarUrl) {
        const tex = new THREE.TextureLoader().load(players[i].avatarUrl);
        const avatarMat = new THREE.MeshBasicMaterial({ map: tex });
        avatarMesh = new THREE.Mesh(new THREE.SphereGeometry(24, 32, 32), avatarMat);
      } else {
        const color = i === 0 ? 0x2d72fc : i === 1 ? 0xfcbf49 : 0xe63946;
        const avatarMat = new THREE.MeshPhongMaterial({ color });
        avatarMesh = new THREE.Mesh(new THREE.SphereGeometry(24, 32, 32), avatarMat);
      }
      avatarMesh.position.set(x, 24, z);
      scene.add(avatarMesh);

      // 玩家昵称标签
      const canvas = document.createElement("canvas");
      canvas.width = 80; canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 80, 32);
      ctx.fillStyle = "#333";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(players[i]?.name || (i === 0 ? "你" : `玩家${i+1}`), 40, 16);
      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.SpriteMaterial({ map: labelTexture });
      const label = new THREE.Sprite(labelMat);
      label.position.set(x, 54, z);
      label.scale.set(55, 20, 1);
      scene.add(label);
    }

    // 我的手牌
    const cardY = 17;
    const cardW = 48, cardH = 72, cardGap = 28;
    const startX = -((myCards.length - 1) * cardGap) / 2;
    myCards.forEach((card, idx) => {
      const texture = new THREE.TextureLoader().load(getCardImageURL(card));
      const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const geom = new THREE.PlaneGeometry(cardW, cardH);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(startX + idx * cardGap, cardY, 140);
      mesh.rotation.x = -Math.PI / 8;
      scene.add(mesh);
    });

    // 出牌区（桌面中央）
    if (outCards.length > 0) {
      const outW = 42, outH = 64;
      const outGap = 22;
      const outStartX = -((outCards.length - 1) * outGap) / 2;
      outCards.forEach((card, idx) => {
        const texture = new THREE.TextureLoader().load(getCardImageURL(card));
        const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(outW, outH), mat);
        mesh.position.set(outStartX + idx * outGap, 28, 0);
        mesh.rotation.x = -Math.PI / 12;
        scene.add(mesh);
      });
    }

    // 渲染循环
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [myCards, outCards, players]);

  return <div ref={mountRef} style={{ width: 800, height: 480, margin: "auto" }} />;
};
