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

export const Game3D_Cartoon: React.FC<Game3DProps> = ({
  myCards,
  outCards = [],
  players = [],
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = 800, height = 500;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2efe6);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 250, 390);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setClearColor(0xf2efe6, 1);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLight.position.set(100, 260, 100);
    scene.add(dirLight);

    // 桌布材质
    const clothTexture = new THREE.TextureLoader().load('/textures/cloth.png', tex => { tex.repeat.set(3,3); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; });
    const tableMaterial = new THREE.MeshPhongMaterial({
      map: clothTexture,
      color: 0x44b96b,
      shininess: 80,
      specular: 0xffffff
    });

    // 牌桌主体
    const tableGeometry = new THREE.CylinderGeometry(170, 170, 18, 64);
    const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.position.y = -8;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // 桌沿金边
    const rimGeometry = new THREE.TorusGeometry(172, 4, 32, 128);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700, shininess: 95 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 1.5;
    rim.rotation.x = Math.PI / 2;
    scene.add(rim);

    // 桌面高光
    const spotLight = new THREE.SpotLight(0xffffff, 0.12, 400, Math.PI / 5, 0.8);
    spotLight.position.set(0, 300, 0);
    scene.add(spotLight);

    // 玩家座位和头像
    for (let i = 0; i < 3; i++) {
      const angle = i * (2 * Math.PI / 3);
      const x = 142 * Math.cos(angle);
      const z = 142 * Math.sin(angle);

      // 卡通座垫
      const seatGeom = new THREE.CircleGeometry(28, 32);
      const seatMat = new THREE.MeshBasicMaterial({ color: "#ffe78b" });
      const seat = new THREE.Mesh(seatGeom, seatMat);
      seat.position.set(x, 2.5, z);
      seat.rotation.x = -Math.PI / 2;
      scene.add(seat);

      // 卡通头像（带白描边）
      const avatarTex = new THREE.TextureLoader().load(players[i]?.avatarUrl || "/avatars/default.png");
      const avatarMat = new THREE.MeshBasicMaterial({ map: avatarTex });
      const avatarMesh = new THREE.Mesh(new THREE.CircleGeometry(23, 40), avatarMat);
      avatarMesh.position.set(x, 21, z);
      avatarMesh.rotation.y = -angle; // 始终朝向中心
      scene.add(avatarMesh);

      // 白色描边
      const borderMat = new THREE.MeshBasicMaterial({ color: "#fff" });
      const borderMesh = new THREE.Mesh(new THREE.RingGeometry(23, 26, 40), borderMat);
      borderMesh.position.set(x, 21.01, z);
      borderMesh.rotation.y = -angle;
      scene.add(borderMesh);

      // 卡通阴影
      const shadowMat = new THREE.MeshBasicMaterial({ color: "#c7be9b" });
      const shadowMesh = new THREE.Mesh(new THREE.EllipseGeometry(17, 7, 32), shadowMat);
      shadowMesh.position.set(x, 9, z);
      shadowMesh.rotation.x = -Math.PI/2;
      shadowMesh.material.transparent = true;
      shadowMesh.material.opacity = 0.24;
      scene.add(shadowMesh);

      // 玩家昵称
      const canvas = document.createElement("canvas");
      canvas.width = 80; canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#2d72fc";
      ctx.lineWidth = 3;
      ctx.roundRect(4, 4, 72, 24, 13);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2d72fc";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(players[i]?.name || (i === 0 ? "你" : `玩家${i+1}`), 40, 16);
      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMat = new THREE.SpriteMaterial({ map: labelTexture });
      const label = new THREE.Sprite(labelMat);
      label.position.set(x, 44, z);
      label.scale.set(49, 18, 1);
      scene.add(label);
    }

    // 手牌（卡通投影，hover高亮）
    const cardY = 17;
    const cardW = 48, cardH = 72, cardGap = 30;
    const startX = -((myCards.length - 1) * cardGap) / 2;
    myCards.forEach((card, idx) => {
      // 卡通投影
      const shadowMat = new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.15 });
      const shadowGeom = new THREE.EllipseGeometry(17, 7, 32);
      const shadow = new THREE.Mesh(shadowGeom, shadowMat);
      shadow.position.set(startX + idx * cardGap, cardY - 5, 138);
      shadow.rotation.x = -Math.PI/2;
      scene.add(shadow);

      // 牌
      const texture = new THREE.TextureLoader().load(getCardImageURL(card));
      const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const geom = new THREE.PlaneGeometry(cardW, cardH, 1, 1);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(startX + idx * cardGap, cardY, 140);
      mesh.rotation.x = -Math.PI / 8;
      scene.add(mesh);
    });

    // 出牌区（桌面中央，明亮高光）
    if (outCards.length > 0) {
      const outW = 42, outH = 64;
      const outGap = 22;
      const outStartX = -((outCards.length - 1) * outGap) / 2;
      // 卡通半透明区域
      const outZoneMat = new THREE.MeshBasicMaterial({ color: "#fff", transparent: true, opacity: 0.16 });
      const outZone = new THREE.Mesh(new THREE.CircleGeometry(54, 32), outZoneMat);
      outZone.position.set(0, 23.5, 0);
      outZone.rotation.x = -Math.PI/2;
      scene.add(outZone);

      outCards.forEach((card, idx) => {
        // 投影
        const shadowMat = new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.12 });
        const shadowGeom = new THREE.EllipseGeometry(14, 5, 32);
        const shadow = new THREE.Mesh(shadowGeom, shadowMat);
        shadow.position.set(outStartX + idx * outGap, 23.7, 0);
        shadow.rotation.x = -Math.PI/2;
        scene.add(shadow);

        // 牌
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

  return <div ref={mountRef} style={{
    width: 800, height: 500, margin: "18px auto 0 auto", 
    borderRadius: 28, 
    boxShadow: "0 8px 32px #c7be9b66,0 2px 0 #fff",
    background: "linear-gradient(160deg,#f9f6e7 60%,#fff8dc 100%)"
  }} />;
};
