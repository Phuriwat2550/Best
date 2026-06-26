import React, { useEffect, useRef, useState } from 'react';
import { ControlsConfig, GameStats, GameState } from '../types';
import { audio } from './AudioEngine';
import { 
  Play, RotateCcw, Home, Award, Heart, ShieldAlert, Sparkles, 
  Sword, HelpCircle, Flame, Shield, Compass, Swords 
} from 'lucide-react';
import { motion } from 'motion/react';
import * as THREE from 'three';

interface GameCanvasProps {
  controls: ControlsConfig;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onGoToMenu: () => void;
  onStateChange: (state: GameState) => void;
}

// Interface for 3D game entities
interface Collectible3D {
  mesh: THREE.Object3D;
  type: 'rice' | 'mask';
  id: number;
  initialY: number;
  rotationSpeed: number;
  isCollected: boolean;
  isFalling?: boolean;
  fallSpeed?: number;
}

interface Obstacle3D {
  mesh: THREE.Object3D;
  type: 'rock' | 'spirit';
  id: number;
  initialY: number;
  floatSpeed?: number;
  isHit: boolean;
}

interface Particle3D {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

const ENDING_DIALOGUES = [
  {
    speaker: 'NPC',
    name: 'ชาวบ้านด่านซ้าย (Dan Sai Villager)',
    text: 'โอ้โห! ข้าไม่อยากจะเชื่อสายตาตัวเองเลย! ท่านปราบพญาผีตาโขนหลวงจอมเกเรลงได้แล้วจริง ๆ!',
    textEn: "Oh wow! I can't believe my eyes! You have actually defeated the Great Phi Ta Khon Boss!"
  },
  {
    speaker: 'PLAYER',
    name: 'ผู้กล้าผีตาโขน (Phi Ta Khon Hero)',
    text: 'มันคือหน้าที่ของพวกเราชาวด่านซ้ายครับที่ต้องร่วมใจกันปกป้องและรักษางานประเพณีนี้ไว้!',
    textEn: "It's the duty of all of us in Dan Sai to unite and protect our sacred tradition!"
  },
  {
    speaker: 'NPC',
    name: 'ชาวบ้านด่านซ้าย (Dan Sai Villager)',
    text: 'ดูนั่นสิ! วิญญาณเกเรทุกตนยอมสงบราบคาบแล้ว แสงสว่างพลังธรรมกำลังกลับมาส่องประกายสว่างไสว!',
    textEn: "Look! All the wild spirits have calmed down. The sacred light of virtue is shining once again!"
  },
  {
    speaker: 'PLAYER',
    name: 'ผู้กล้าผีตาโขน (Phi Ta Khon Hero)',
    text: 'เพราะพลังสามัคคีและจิตวิญญาณแห่งการทำความดีของทุกคนแท้ ๆ ที่นำทางให้พวกเราก้าวผ่านอุปสรรค!',
    textEn: "It's truly everyone's unity and pure spirit of goodness that guided us through the obstacles!"
  },
  {
    speaker: 'NPC',
    name: 'ชาวบ้านด่านซ้าย (Dan Sai Villager)',
    text: 'ท่านคือฮีโร่ตัวจริง! ความกล้าหาญของท่านจะได้รับการจดจำและเล่าขานสืบไปชั่วลูกชั่วหลาน!',
    textEn: "You are a true hero! Your bravery will be remembered and passed down for generations to come!"
  },
  {
    speaker: 'PLAYER',
    name: 'ผู้กล้าผีตาโขน (Phi Ta Khon Hero)',
    text: 'ขอบคุณมากครับ! ต่อจากนี้งานประเพณีบุญหลวงด่านซ้ายของเราจะเต็มเปี่ยมด้วยรอยยิ้มและเสียงกลองยาวแสนสุข!',
    textEn: "Thank you so much! From now on, our Bun Luang festival will be filled with smiles and joyous drumbeats!"
  },
  {
    speaker: 'NPC',
    name: 'ชาวบ้านด่านซ้าย (Dan Sai Villager)',
    text: 'ใช่แล้ว! มาเถอะ! พวกเราเข้าไปเริ่มงานสมโภชและฉลองอันยิ่งใหญ่ตระการตาที่วัดโพนชัยด้วยกันเถอะ!',
    textEn: "Yes! Come on! Let's enter and start our spectacular grand celebration at Wat Pon Chai together!"
  },
  {
    speaker: 'PLAYER',
    name: 'ผู้กล้าผีตาโขน (Phi Ta Khon Hero)',
    text: 'ไปกันเลยครับ! ขอให้ความสิริมงคลและความรื่นเริงอบอวลเคียงคู่ประเพณีผีตาโขนตลอดไป!',
    textEn: "Let's go! May blessings and joy stay with our beloved Phi Ta Khon festival forever!"
  }
];

export default function GameCanvas({
  controls,
  musicEnabled,
  sfxEnabled,
  onGoToMenu,
  onStateChange,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React State for HUD & statistics
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('dansai_highscore') || '0', 10)
  );
  const [riceCount, setRiceCount] = useState(0);
  const [lives, setLives] = useState(5);
  const [distancePercent, setDistancePercent] = useState(0); // Progress towards Wat Pon Chai (0 to 100)
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Boss & Kills system states
  const [defeatedKills, setDefeatedKills] = useState(0);
  const [bossActive, setBossActive] = useState(false);
  const [bossHealth, setBossHealth] = useState(15);
  const [bossMaxHealth] = useState(15);

  const [gamePlayState, setGamePlayState] = useState<'IDLE' | 'PLAYING' | 'OVER' | 'WIN' | 'ENDING'>('IDLE');
  const [danceCooldown, setDanceCooldown] = useState(0);
  const [isDanceActive, setIsDanceActive] = useState(false);
  const [isInvulnerable, setIsInvulnerable] = useState(false);

  // RPG Ending Dialogue & NPC Anim States
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [npcFrame, setNpcFrame] = useState(0);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // NPC sprite frame cycle during ENDING cinematic
  useEffect(() => {
    if (gamePlayState !== 'ENDING') return;
    setCurrentDialogueIndex(0);
    const interval = setInterval(() => {
      setNpcFrame((prev) => (prev + 1) % 4);
    }, 180);
    return () => clearInterval(interval);
  }, [gamePlayState]);

  // References for the Three.js loop to avoid re-renders during 60FPS updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Sprite | null>(null);
  const playerTextureRef = useRef<THREE.Texture | null>(null);
  const itemTextureRef = useRef<THREE.Texture | null>(null);
  const enemyTextureRef = useRef<THREE.Texture | null>(null);
  const grassList = useRef<{ mesh: THREE.Sprite; originalScaleY: number }[]>([]);
  
  // Boss & Warp Portal References
  const bossRef = useRef<THREE.Sprite | null>(null);
  const bossTextureRef = useRef<THREE.Texture | null>(null);
  const bossFireballsList = useRef<any[]>([]);
  const portalStateRef = useRef<{
    active: boolean;
    mesh: THREE.Mesh | null;
    animTimer: number;
  }>({
    active: false,
    mesh: null,
    animTimer: 0,
  });

  const bossStateRef = useRef<{
    active: boolean;
    spawned: boolean;
    health: number;
    maxHealth: number;
    pos: THREE.Vector3;
    targetPos: THREE.Vector3;
    state: 'IDLE' | 'DASH_NEAR' | 'DASH_FAR' | 'PRE_ATTACK' | 'ATTACK';
    stateTimer: number;
    xDir: number;
    animFrame: number;
    animTimer: number;
    flashTimer: number;
    isDying: boolean;
    deathAnimTimer: number;
  }>({
    active: false,
    spawned: false,
    health: 15,
    maxHealth: 15,
    pos: new THREE.Vector3(0, 4.5, -15),
    targetPos: new THREE.Vector3(0, 4.5, -15),
    state: 'IDLE',
    stateTimer: 0,
    xDir: 1,
    animFrame: 0,
    animTimer: 0,
    flashTimer: 0,
    isDying: false,
    deathAnimTimer: 0,
  });

  // Game simulation structures
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const collectiblesList = useRef<Collectible3D[]>([]);
  const obstaclesList = useRef<Obstacle3D[]>([]);
  const particlesList = useRef<Particle3D[]>([]);
  const templeMeshRef = useRef<THREE.Group | null>(null);
  const danceEffectRingRef = useRef<THREE.Mesh | null>(null);

  // Gameplay state values for physics loops
  const physicsRef = useRef({
    playerPos: new THREE.Vector3(0, 0.8, 20),
    playerVelocityY: 0,
    isGrounded: true,
    score: 0,
    rice: 0,
    lives: 5,
    invulnerableTimer: 0,
    animState: 'IDLE' as 'IDLE' | 'WALKING' | 'ATTACKING' | 'DANCING',
    animFrame: 0,
    animTimer: 0,
    facingLeft: false,
    attackTimer: 0,
    danceTimer: 0,
    danceCooldownTimer: 0,
  });

  // Track the component mounting state
  const isMounted = useRef(true);

  // Ensure highscore is updated dynamically
  const updateHighScoreIfNeeded = (currentScore: number) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('dansai_highscore', currentScore.toString());
    }
  };

  // Start the game!
  const handleStartGame = () => {
    audio.playMenuClick();
    setGamePlayState('PLAYING');
    
    // Reset simulation data
    setScore(0);
    setRiceCount(0);
    setLives(5);
    setDistancePercent(0);
    setIsPaused(false);

    physicsRef.current = {
      playerPos: new THREE.Vector3(0, 0.8, 20),
      playerVelocityY: 0,
      isGrounded: true,
      score: 0,
      rice: 0,
      lives: 5,
      invulnerableTimer: 0,
      animState: 'IDLE',
      animFrame: 0,
      animTimer: 0,
      facingLeft: false,
      attackTimer: 0,
      danceTimer: 0,
      danceCooldownTimer: 0,
    };

    if (playerRef.current) {
      playerRef.current.position.set(0, 0.8, 20);
      playerRef.current.visible = true;
    }

    // Regenerate collectibles & obstacles with fresh positions
    resetLevelEntities();

    if (musicEnabled) {
      audio.startMusic();
    }
  };

  // Setup/Reset level elements
  const resetLevelEntities = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old meshes
    collectiblesList.current.forEach(c => scene.remove(c.mesh));
    obstaclesList.current = obstaclesList.current.filter(o => {
      scene.remove(o.mesh);
      return false;
    });
    collectiblesList.current = [];
    grassList.current.forEach(g => scene.remove(g.mesh));
    grassList.current = [];

    // Clear Boss fireballs
    if (bossFireballsList.current) {
      bossFireballsList.current.forEach(fb => {
        scene.remove(fb.mesh);
        scene.remove(fb.reticleMesh);
      });
      bossFireballsList.current = [];
    }

    // Hide and deactivate Warp Portal
    if (portalStateRef.current) {
      portalStateRef.current.active = false;
      if (portalStateRef.current.mesh) {
        portalStateRef.current.mesh.visible = false;
      }
    }

    // Reset Boss State
    if (bossRef.current) {
      bossRef.current.visible = false;
      bossRef.current.rotation.z = 0;
      bossRef.current.scale.set(4.5, 4.5, 1.0);
    }

    bossStateRef.current = {
      active: false,
      spawned: false,
      health: 15,
      maxHealth: 15,
      pos: new THREE.Vector3(0, 4.5, -15),
      targetPos: new THREE.Vector3(0, 4.5, -15),
      state: 'IDLE',
      stateTimer: 0,
      xDir: 1,
      animFrame: 0,
      animTimer: 0,
      flashTimer: 0,
      isDying: false,
      deathAnimTimer: 0,
    };

    setDefeatedKills(0);
    setBossActive(false);
    setBossHealth(15);

    // 1. Generate 18x Floating Sticky Rice (🌾)
    const riceGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 6);
    const riceMat = new THREE.MeshPhongMaterial({ 
      color: 0xf59e0b, 
      emissive: 0x78350f, 
      shadowSide: THREE.DoubleSide,
      shininess: 100 
    });

    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(riceGeo, riceMat);
      // Position spread between start (z=18) and temple (z=-18)
      const x = (Math.random() - 0.5) * 16;
      const z = 16 - i * 2.0 - Math.random() * 0.8;
      mesh.position.set(x, 0.6, z);
      scene.add(mesh);

      // Add floating visual indicator
      const glowGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.6 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 0.25, 0);
      mesh.add(glow);

      collectiblesList.current.push({
        mesh,
        type: 'rice',
        id: i,
        initialY: 0.6,
        rotationSpeed: 0.02 + Math.random() * 0.02,
        isCollected: false
      });
    }

    // 2. Generate 6x Red Masks (🎭) using item.png sprite
    const itemTex = new THREE.TextureLoader().load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/item_a371ol.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
      }
    );
    const maskMat = new THREE.SpriteMaterial({ 
      map: itemTex,
      transparent: true,
    });

    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Sprite(maskMat);
      mesh.scale.set(1.2, 1.2, 1.0);
      const x = (Math.random() - 0.5) * 14;
      const isFalling = i % 2 === 0;
      const initialY = 0.9;
      const startY = isFalling ? 6.0 + Math.random() * 3.0 : 0.9;
      const z = 14 - i * 6.0;
      
      mesh.position.set(x, startY, z);
      scene.add(mesh);

      collectiblesList.current.push({
        mesh,
        type: 'mask',
        id: 100 + i,
        initialY,
        rotationSpeed: 0,
        isCollected: false,
        isFalling,
        fallSpeed: 0.04 + Math.random() * 0.04
      });
    }

    // 3. Generate 9x Forest Spirits/Enemies (👹) using enemy.png
    const enemyTexBase = enemyTextureRef.current || new THREE.TextureLoader().load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/enemy_mp1zhh.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.repeat.set(0.25, 0.5);
        tex.offset.set(0, 0.5);
      }
    );

    for (let i = 0; i < 9; i++) {
      const clonedTex = enemyTexBase.clone();
      clonedTex.needsUpdate = true;

      const spiritSpriteMat = new THREE.SpriteMaterial({
        map: clonedTex,
        transparent: true,
        color: 0xffffff
      });
      const sprite = new THREE.Sprite(spiritSpriteMat);
      sprite.scale.set(1.8, 1.8, 1.0);

      const x = (Math.random() - 0.5) * 16;
      const z = 12 - i * 4.5;
      sprite.position.set(x, 0.9, z);
      scene.add(sprite);

      obstaclesList.current.push({
        mesh: sprite,
        type: 'spirit',
        id: 200 + i,
        initialY: 0.9,
        floatSpeed: 0.03 + Math.random() * 0.02,
        isHit: false,
        
        // Enemy properties
        health: 2,
        knockbackVel: new THREE.Vector3(0, 0, 0),
        flashTimer: 0,
        flashColor: 'white',
        isDying: false,
        animFrame: 0,
        animTimer: 0,
        isWalking: true
      });
    }

    // 4. Generate 20x Interactive Grass patches (🌱) using grass_2_kjkske.png
    const grassTexture = new THREE.TextureLoader().load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/grass_2_kjkske.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
      }
    );

    const grassMat = new THREE.SpriteMaterial({
      map: grassTexture,
      transparent: true,
      color: 0xffffff
    });

    for (let i = 0; i < 20; i++) {
      const sprite = new THREE.Sprite(grassMat);
      const scaleX = 0.8 + Math.random() * 0.4;
      const scaleY = 0.8 + Math.random() * 0.4;
      sprite.scale.set(scaleX, scaleY, 1.0);
      
      const x = (Math.random() - 0.5) * 17;
      const z = (Math.random() - 0.5) * 44; // spread across entire parade path
      sprite.position.set(x, scaleY * 0.5, z);
      scene.add(sprite);

      grassList.current.push({
        mesh: sprite,
        originalScaleY: scaleY
      });
    }

    // 4. Generate 11x Ancient Stones (🪨)
    for (let i = 0; i < 11; i++) {
      const stoneGroup = new THREE.Group();
      
      // Build a cluster of jagged stone boxes
      const stoneMat = new THREE.MeshPhongMaterial({ color: 0x4b5563, flatShading: true });
      
      const baseStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), stoneMat);
      stoneGroup.add(baseStone);

      const sideStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), stoneMat);
      sideStone.position.set(0.4, -0.1, 0.1);
      stoneGroup.add(sideStone);

      const topStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3), stoneMat);
      topStone.position.set(-0.2, 0.3, -0.1);
      stoneGroup.add(topStone);

      const x = (Math.random() - 0.5) * 16;
      const z = 15 - i * 3.8;
      stoneGroup.position.set(x, 0.4, z);
      scene.add(stoneGroup);

      obstaclesList.current.push({
        mesh: stoneGroup,
        type: 'rock',
        id: 300 + i,
        initialY: 0.4,
        isHit: false
      });
    }
  };

  // Trigger burst of sparks particles in 3D
  const spawnExplosion = (position: THREE.Vector3, colorHex: number, count: number = 15) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const pGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const pMat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(position);
      scene.add(pMesh);

      // Random 3D direction vector
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        (Math.random() * 4) + 1,
        (Math.random() - 0.5) * 4.5
      );

      particlesList.current.push({
        mesh: pMesh,
        velocity,
        life: 0,
        maxLife: 30 + Math.floor(Math.random() * 20),
      });
    }
  };

  // Keyboard and key state mappings
  useEffect(() => {
    isMounted.current = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;

      // Handle Attack action
      if (e.key.toLowerCase() === 'p' && gamePlayState === 'PLAYING') {
        triggerAttack();
      }

      // Handle Escape key for Pause
      if (e.key === 'Escape' && gamePlayState === 'PLAYING') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        audio.playMenuClick();
      }

      // Handle Dance action
      if (e.key.toLowerCase() === 'o' && gamePlayState === 'PLAYING') {
        triggerDanceSkill();
      }

      // Handle Jump trigger via space or custom binding
      const isCustomJump = controls.jump && (e.key.toLowerCase() === controls.jump.toLowerCase() || e.code === controls.jump);
      if ((e.key === ' ' || isCustomJump) && gamePlayState === 'PLAYING') {
        triggerJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      isMounted.current = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePlayState, controls]);

  const triggerBossSpawn = () => {
    const bs = bossStateRef.current;
    if (bs.spawned) return;
    bs.spawned = true;
    bs.active = true;
    bs.health = 15;
    bs.state = 'IDLE';
    bs.stateTimer = 120; // 2 seconds introduction

    setBossActive(true);
    setBossHealth(15);

    const ph = physicsRef.current;
    if (bossRef.current) {
      // Position it ahead of the player on Z axis
      bossRef.current.position.set(0, 4.5, ph.playerPos.z - 11.0);
      bossRef.current.visible = true;
      bs.pos.copy(bossRef.current.position);
      bs.targetPos.copy(bossRef.current.position);

      // Flash effect
      bs.flashTimer = 45;

      // Big explosion at spawn point!
      spawnExplosion(bossRef.current.position, 0xef4444, 40);
    }

    // Play a heavy sound
    audio.playHit();
  };

  const damageBoss = (amount: number) => {
    const bs = bossStateRef.current;
    if (!bs.active || bs.isDying) return;

    bs.health = Math.max(0, bs.health - amount);
    setBossHealth(bs.health);
    bs.flashTimer = 15; // Flash red/white as visual feedback

    if (bossRef.current) {
      spawnExplosion(bossRef.current.position, 0xffa500, 18);
    }
    audio.playHit();

    if (bs.health <= 0) {
      bs.isDying = true;
      bs.active = false;
      bs.deathAnimTimer = 90; // 1.5 seconds death animation
      setBossActive(false);

      if (bossRef.current) {
        spawnExplosion(bossRef.current.position, 0xff0000, 40);
        setTimeout(() => {
          if (bossRef.current) {
            spawnExplosion(bossRef.current.position, 0xffd700, 45);
          }
        }, 300);
      }

      triggerBossDefeated();
    }
  };

  const triggerBossDefeated = () => {
    const portal = portalStateRef.current;
    portal.active = true;

    if (portal.mesh) {
      // Spawn at the temple gates (Z = -21)
      portal.mesh.position.set(0, 1.3, -21.0);
      portal.mesh.visible = true;

      // Spawn golden/blue spark explosion at portal location
      spawnExplosion(portal.mesh.position, 0x60a5fa, 30);
    }
  };

  // Jump action
  const triggerJump = () => {
    const ph = physicsRef.current;
    if (ph.isGrounded && ph.animState !== 'ATTACKING' && ph.animState !== 'DANCING') {
      ph.playerVelocityY = 0.22;
      ph.isGrounded = false;
      audio.playJump();
    }
  };

  // Attack action (P Key)
  const triggerAttack = () => {
    const ph = physicsRef.current;
    if (ph.attackTimer <= 0 && ph.danceTimer <= 0) {
      ph.animState = 'ATTACKING';
      ph.animFrame = 0;
      ph.attackTimer = 24; // 24 frames of game loop
      audio.playAttack();

      // Check collision arc in front of the player (facing directions)
      const attackRange = 2.4;
      const hitPosition = ph.playerPos.clone();
      
      // Offset hit target based on movement or default facing
      const attackDirX = ph.facingLeft ? -1.5 : 1.5;
      hitPosition.x += attackDirX;

      // Spark slash visual
      spawnExplosion(hitPosition, 0xfcd34d, 8);

      // Check hits on Boss
      const bs = bossStateRef.current;
      if (bs.active && !bs.isDying) {
        const distToBoss = ph.playerPos.distanceTo(bs.pos);
        if (distToBoss <= 3.8) {
          damageBoss(1);
        }
      }

      // Check hits on spirits
      obstaclesList.current.forEach(obs => {
        if (obs.type === 'spirit' && !obs.isHit && !obs.isDying) {
          const dist = ph.playerPos.distanceTo(obs.mesh.position);
          if (dist <= attackRange) {
            const currentHealth = obs.health !== undefined ? obs.health : 2;
            
            if (currentHealth > 1) {
              // First hit: Knockback and flash white
              obs.health = 1;
              obs.flashTimer = 20;
              obs.flashColor = 'white';
              
              // Knockback: opposite direction of player
              const dir = obs.mesh.position.clone().sub(ph.playerPos).normalize();
              dir.y = 0.3; // slight upward bounce
              dir.normalize();
              obs.knockbackVel = dir.multiplyScalar(0.2);
              
              spawnExplosion(obs.mesh.position, 0xffffff, 12);
              audio.playCollect();
            } else {
              // Second hit: Fly out of bounds, flash white rapidly, and die
              obs.health = 0;
              obs.isHit = true;
              obs.isDying = true;
              obs.flashTimer = 35;
              obs.flashColor = 'white';
              
              const dir = obs.mesh.position.clone().sub(ph.playerPos).normalize();
              dir.y = 0.55; // high fly out
              dir.z -= 0.15;
              dir.normalize();
              obs.knockbackVel = dir.multiplyScalar(0.25);
              
              spawnExplosion(obs.mesh.position, 0x818cf8, 25);
              
              // Add Score
              ph.score += 30;
              setScore(ph.score);
              updateHighScoreIfNeeded(ph.score);
              audio.playCollect();

              // Increment kills count
              setDefeatedKills((prev) => {
                const nextKills = prev + 1;
                if (nextKills >= 10 && !bossStateRef.current.spawned) {
                  triggerBossSpawn();
                }
                return nextKills;
              });
            }
          }
        }
      });
    }
  };

  // Sacred Dance Skill (O Key)
  const triggerDanceSkill = () => {
    const ph = physicsRef.current;
    if (ph.danceCooldownTimer <= 0 && ph.attackTimer <= 0) {
      ph.animState = 'DANCING';
      ph.animFrame = 0;
      ph.danceTimer = 45; // 45 frames
      ph.danceCooldownTimer = 180; // 3 seconds cooldown at 60fps
      setDanceCooldown(3);
      setIsDanceActive(true);

      // Special sound effect sequence
      audio.playJump();
      setTimeout(() => audio.playCollect(), 80);
      setTimeout(() => audio.playAttack(), 160);

      // Check hits on Boss
      const bs = bossStateRef.current;
      if (bs.active && !bs.isDying) {
        const distToBoss = ph.playerPos.distanceTo(bs.pos);
        if (distToBoss <= 5.5) {
          damageBoss(2); // Dance deals 2 damage!
        }
      }

      // Explode circular visual ring
      if (danceEffectRingRef.current) {
        danceEffectRingRef.current.scale.set(0.1, 0.1, 0.1);
        danceEffectRingRef.current.visible = true;
      }

      spawnExplosion(ph.playerPos, 0xf59e0b, 35);
    }
  };

  // Main ThreeJS Setup & Animation Loop
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.035);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      100
    );
    camera.position.set(0, 5.5, 26);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    // Clear old canvases
    if (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3e0, 0.95);
    dirLight.position.set(5, 12, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xef4444, 1.2, 12);
    pointLight.position.set(0, 2, 20);
    scene.add(pointLight);

    // 5. Ground Plane with Tiling Texture
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/ground_d1kjrx.png',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(12, 12);
        tex.needsUpdate = true;
      }
    );

    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshPhongMaterial({ 
      map: groundTexture, 
      side: THREE.DoubleSide,
      shininess: 10
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    scene.add(groundMesh);

    // Decorative side walls/fences to make it feel like a narrow parade street
    const fenceMat = new THREE.MeshPhongMaterial({ color: 0x1f2937 });
    const fenceGeo = new THREE.BoxGeometry(0.2, 0.8, 50);
    
    const leftFence = new THREE.Mesh(fenceGeo, fenceMat);
    leftFence.position.set(-10, 0.4, 0);
    scene.add(leftFence);

    const rightFence = new THREE.Mesh(fenceGeo, fenceMat);
    rightFence.position.set(10, 0.4, 0);
    scene.add(rightFence);

    // 6. Sacred Temple - **วัดโพนชัย** (Placed at z = -22)
    const templeGroup = new THREE.Group();
    templeGroup.position.set(0, 0, -22);
    
    // Golden gate columns
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.5, 8);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.2 });
    
    const leftPillar = new THREE.Mesh(pillarGeo, goldMat);
    leftPillar.position.set(-3.5, 1.75, 0);
    templeGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, goldMat);
    rightPillar.position.set(3.5, 1.75, 0);
    templeGroup.add(rightPillar);

    // Temple Main Roof Structure (Stacked orange roofs)
    const roofBaseGeo = new THREE.BoxGeometry(9, 0.6, 3);
    const redMat = new THREE.MeshPhongMaterial({ color: 0xdc2626 });
    const roofBase = new THREE.Mesh(roofBaseGeo, redMat);
    roofBase.position.set(0, 3.5, 0);
    templeGroup.add(roofBase);

    const roofMidGeo = new THREE.BoxGeometry(7, 0.5, 2.4);
    const roofMid = new THREE.Mesh(roofMidGeo, redMat);
    roofMid.position.set(0, 4.0, 0);
    templeGroup.add(roofMid);

    const pagodaGeo = new THREE.ConeGeometry(1.2, 2.5, 4);
    const pagoda = new THREE.Mesh(pagodaGeo, goldMat);
    pagoda.position.set(0, 5.2, 0);
    pagoda.rotation.y = Math.PI / 4;
    templeGroup.add(pagoda);

    // Temple Door Back Wall (Dark slate interior)
    const wallGeo = new THREE.BoxGeometry(6.6, 3.2, 0.4);
    const slateMat = new THREE.MeshPhongMaterial({ color: 0x111827 });
    const backWall = new THREE.Mesh(wallGeo, slateMat);
    backWall.position.set(0, 1.6, -0.4);
    templeGroup.add(backWall);

    // Glowing holy relic inside temple
    const relicGeo = new THREE.BoxGeometry(1.0, 1.4, 0.5);
    const relicMat = new THREE.MeshPhongMaterial({ color: 0xfacc15, emissive: 0xeab308, shininess: 150 });
    const relic = new THREE.Mesh(relicGeo, relicMat);
    relic.position.set(0, 0.7, 0);
    templeGroup.add(relic);

    scene.add(templeGroup);
    templeMeshRef.current = templeGroup;

    // 7. Player Sprite (Billboarding 2D)
    const playerTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/player_mask_fmn9yv.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.repeat.set(0.25, 0.25);
        tex.offset.set(0, 0.75); // Idle top-left
        tex.needsUpdate = true;
      }
    );
    playerTextureRef.current = playerTexture;

    // Load Enemy Texture
    const enemyTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/enemy_mp1zhh.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.repeat.set(0.25, 0.5);
        tex.offset.set(0, 0.5);
        tex.needsUpdate = true;
      }
    );
    enemyTextureRef.current = enemyTexture;

    // Load Item Texture
    const itemTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/item_a371ol.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
      }
    );
    itemTextureRef.current = itemTexture;

    const spriteMat = new THREE.SpriteMaterial({ 
      map: playerTexture,
      transparent: true,
      color: 0xffffff
    });
    const playerSprite = new THREE.Sprite(spriteMat);
    playerSprite.scale.set(1.8, 1.8, 1.0);
    playerSprite.position.set(0, 0.8, 20);
    scene.add(playerSprite);
    playerRef.current = playerSprite;

    // 8. Magical Expansion Ring for the Dance Skill (O Key)
    const ringGeo = new THREE.RingGeometry(0.1, 1.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xf59e0b, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.75 
    });
    const danceRing = new THREE.Mesh(ringGeo, ringMat);
    danceRing.rotation.x = -Math.PI / 2;
    danceRing.position.set(0, 0.1, 0);
    danceRing.visible = false;
    scene.add(danceRing);
    danceEffectRingRef.current = danceRing;

    // 9. Floating ambient fireflies
    const fireflyGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const firefliesGroup = new THREE.Group();
    const firefliesList: THREE.Mesh[] = [];

    for (let i = 0; i < 20; i++) {
      const fly = new THREE.Mesh(fireflyGeo, fireflyMat);
      fly.position.set(
        (Math.random() - 0.5) * 18,
        Math.random() * 3 + 0.3,
        (Math.random() - 0.5) * 40
      );
      firefliesGroup.add(fly);
      firefliesList.push(fly);
    }
    scene.add(firefliesGroup);

    // 9.5. Boss Sprite Initialization
    const bossTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/boss_pblkge.png',
      (tex) => {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.repeat.set(1.0, 0.5); // 1 column, 2 rows (2 frames total)
        tex.offset.set(0, 0.5); // Top frame
        tex.needsUpdate = true;
      }
    );
    bossTextureRef.current = bossTexture;

    const bossSpriteMat = new THREE.SpriteMaterial({
      map: bossTexture,
      transparent: true,
      color: 0xffffff,
    });
    const bossSprite = new THREE.Sprite(bossSpriteMat);
    bossSprite.scale.set(4.5, 4.5, 1.0);
    bossSprite.position.set(0, 4.5, -15);
    bossSprite.visible = false;
    scene.add(bossSprite);
    bossRef.current = bossSprite;

    // 9.6. Warp Portal Initialization
    const portalGeo = new THREE.TorusGeometry(1.2, 0.15, 16, 100);
    const portalMat = new THREE.MeshBasicMaterial({ 
      color: 0x3b82f6, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.9 
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    
    const portalInnerGeo = new THREE.CircleGeometry(1.2, 32);
    const portalInnerMat = new THREE.MeshBasicMaterial({ 
      color: 0x60a5fa, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.45 
    });
    const portalInnerMesh = new THREE.Mesh(portalInnerGeo, portalInnerMat);
    portalMesh.add(portalInnerMesh);
    
    portalMesh.position.set(0, 1.3, -21.0); // Place at Wat Pon Chai entrance
    portalMesh.visible = false;
    scene.add(portalMesh);
    portalStateRef.current.mesh = portalMesh;

    // Initial load of items
    resetLevelEntities();

    // 10. Handle window/container resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      for (const entry of entries) {
        const width = entry.contentRect.width || containerRef.current.clientWidth;
        const height = entry.contentRect.height || containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    });
    resizeObserver.observe(containerRef.current);

    // 11. Core Animation Tick Loop
    let lastTime = 0;
    let animFrameId = 0;
    let lastMaskSpawnTime = 0;
    let lastEnemySpawnTime = 0;
    let enemySpawnInterval = 1.0 + Math.random() * 2.0; // 1-3 seconds

    const animate = (time: number) => {
      if (!isMounted.current) return;
      animFrameId = requestAnimationFrame(animate);

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      const ph = physicsRef.current;
      
      // Update cooldown & active state timers
      if (ph.danceCooldownTimer > 0) {
        ph.danceCooldownTimer--;
        if (ph.danceCooldownTimer % 60 === 0) {
          setDanceCooldown(Math.ceil(ph.danceCooldownTimer / 60));
        }
      } else {
        setDanceCooldown(0);
      }

      // Read movement inputs (WASD & Arrow Keys)
      let moveX = 0;
      let moveZ = 0;

      if (gamePlayState === 'PLAYING') {
        // Horizontal Movement mapping
        if (keysPressed.current['a'] || keysPressed.current['arrowleft'] || keysPressed.current[controls.moveLeft.toLowerCase()]) {
          moveX = -1;
          ph.facingLeft = true;
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright'] || keysPressed.current[controls.moveRight.toLowerCase()]) {
          moveX = 1;
          ph.facingLeft = false;
        }

        // Vertical / Z-axis Movement mapping
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
          moveZ = -1;
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
          moveZ = 1;
        }
      }

      // Check current action priorities for animations
      if (ph.attackTimer > 0) {
        ph.attackTimer--;
        ph.animState = 'ATTACKING';
        if (ph.attackTimer <= 0) ph.animState = 'IDLE';
      } else if (ph.danceTimer > 0) {
        ph.danceTimer--;
        ph.animState = 'DANCING';
        if (ph.danceTimer <= 0) {
          ph.animState = 'IDLE';
          setIsDanceActive(false);
          if (danceEffectRingRef.current) danceEffectRingRef.current.visible = false;
        }
      } else if (Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01) {
        ph.animState = 'WALKING';
      } else {
        ph.animState = 'IDLE';
      }

      // Normalise movement vector
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      let speed = 0.095; // Walk speed constant
      
      // Slower speed during skills
      if (ph.animState === 'ATTACKING') speed = 0.02;
      if (ph.animState === 'DANCING') speed = 0.005;

      if (length > 0.001) {
        ph.playerPos.x += (moveX / length) * speed;
        ph.playerPos.z += (moveZ / length) * speed;
      }

      // Apply vertical jump physics
      if (!ph.isGrounded) {
        ph.playerVelocityY -= 0.011; // Gravity constant
        ph.playerPos.y += ph.playerVelocityY;
        
        // Ground ceiling collision
        if (ph.playerPos.y <= 0.8) {
          ph.playerPos.y = 0.8;
          ph.playerVelocityY = 0;
          ph.isGrounded = true;
        }
      }

      // Clamp player space coordinates within boundaries of parade
      ph.playerPos.x = Math.max(-9.0, Math.min(9.0, ph.playerPos.x));
      ph.playerPos.z = Math.max(-23.0, Math.min(23.5, ph.playerPos.z));

      // Synchronise visual 3D position
      if (playerSprite) {
        playerSprite.position.copy(ph.playerPos);
      }

      // Update active magic ring during dancing skill
      if (danceRing && danceRing.visible) {
        danceRing.position.copy(ph.playerPos);
        danceRing.position.y = 0.15; // float slightly above ground
        
        // Expanding and rotating animation
        const ringScale = 0.1 + (45 - ph.danceTimer) * 0.14;
        danceRing.scale.set(ringScale, ringScale, 1);
        danceRing.rotation.z += 0.05;
      }

      // Handle sprite sheet texture mapping offsets (4 rows, 4 columns)
      if (playerTexture) {
        // Animate frame indexes
        ph.animTimer++;
        const speedInterval = ph.animState === 'DANCING' ? 6 : 10;
        if (ph.animTimer >= speedInterval) {
          ph.animTimer = 0;
          ph.animFrame = (ph.animFrame + 1) % 4;
        }

        // Determine row offset Y
        let rowYOffset = 0.75; // IDLE row 1
        if (ph.animState === 'WALKING') rowYOffset = 0.50; // WALK row 2
        if (ph.animState === 'ATTACKING') rowYOffset = 0.25; // ATTACK row 3
        if (ph.animState === 'DANCING') rowYOffset = 0.00; // DANCE row 4

        playerTexture.offset.y = rowYOffset;

        // Apply horizonal flip if facing left
        const isFlipped = ph.facingLeft;
        playerTexture.repeat.set(isFlipped ? -0.25 : 0.25, 0.25);
        playerTexture.offset.x = isFlipped ? (ph.animFrame + 1) * 0.25 : ph.animFrame * 0.25;
      }

      // Animate fireflies
      firefliesList.forEach((fly, idx) => {
        fly.position.y += Math.sin(time * 0.001 + idx) * 0.004;
        fly.position.x += Math.cos(time * 0.0015 + idx) * 0.005;
      });

      // Periodically spawn a new red mask item falling from the sky (every 7 seconds)
      const currentTime = time / 1000;
      if (currentTime - lastMaskSpawnTime > 7.0 && gamePlayState === 'PLAYING') {
        lastMaskSpawnTime = currentTime;
        
        // Spawn a falling mask
        const x = (Math.random() - 0.5) * 16;
        const z = Math.max(-20, Math.min(22, ph.playerPos.z - 4.0 - Math.random() * 12.0));
        const startY = 8.0;
        const targetY = 0.9;
        
        const tex = itemTextureRef.current || new THREE.TextureLoader().load(
          'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/item_a371ol.png'
        );
        const sMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const itemSprite = new THREE.Sprite(sMat);
        itemSprite.scale.set(1.2, 1.2, 1.0);
        itemSprite.position.set(x, startY, z);
        scene.add(itemSprite);
        
        collectiblesList.current.push({
          mesh: itemSprite,
          type: 'mask',
          id: Date.now(),
          initialY: targetY,
          rotationSpeed: 0,
          isCollected: false,
          isFalling: true,
          fallSpeed: 0.05 + Math.random() * 0.04
        });
      }

      // Animate and collect Collectibles
      collectiblesList.current.forEach(c => {
        if (!c.isCollected) {
          if (c.isFalling) {
            c.mesh.position.y -= c.fallSpeed || 0.04;
            if (c.mesh.position.y <= c.initialY) {
              c.mesh.position.y = c.initialY;
              c.isFalling = false;
              spawnExplosion(c.mesh.position, 0xef4444, 4);
            }
          } else {
            // Float up and down gently
            c.mesh.position.y = c.initialY + Math.sin(time * 0.002 + c.id) * 0.08;
          }

          // Spin or Tilt
          if (c.type === 'rice') {
            c.mesh.rotation.y += c.rotationSpeed;
          } else {
            c.mesh.rotation.z = Math.sin(time * 0.004 + c.id) * 0.15;
          }

          // Pull magnets if sacred dancing skill is active
          if (isDanceActive) {
            const pullDist = ph.playerPos.distanceTo(c.mesh.position);
            if (pullDist <= 6.0) {
              // Smooth lerp pull to player
              c.mesh.position.lerp(ph.playerPos, 0.15);
            }
          }

          // Collide with player
          const d = ph.playerPos.distanceTo(c.mesh.position);
          if (d <= 1.25) {
            c.isCollected = true;
            c.mesh.visible = false;
            
            // Spawn points/sparks
            spawnExplosion(c.mesh.position, c.type === 'rice' ? 0xf59e0b : 0xef4444, 10);
            audio.playCollect();

            if (c.type === 'rice') {
              ph.rice += 1;
              ph.score += 10;
              setRiceCount(ph.rice);
            } else {
              ph.score += 50;
              // Restore health up to max of 5
              if (ph.lives < 5) {
                ph.lives += 1;
                setLives(ph.lives);
              }
            }

            setScore(ph.score);
            updateHighScoreIfNeeded(ph.score);
          }
        }
      });

      // Update interactive grass squishing
      grassList.current.forEach(g => {
        const playerXZ = new THREE.Vector2(ph.playerPos.x, ph.playerPos.z);
        const grassXZ = new THREE.Vector2(g.mesh.position.x, g.mesh.position.z);
        const distToPlayer = playerXZ.distanceTo(grassXZ);
        
        if (distToPlayer < 1.1) {
          // Flatten grass on Y-axis
          const targetScaleY = 0.15 * g.originalScaleY;
          g.mesh.scale.y = THREE.MathUtils.lerp(g.mesh.scale.y, targetScaleY, 0.22);
        } else {
          // Restore grass to original height
          g.mesh.scale.y = THREE.MathUtils.lerp(g.mesh.scale.y, g.originalScaleY, 0.14);
        }
        // Adjust Y coordinate so the bottom of the grass remains flat on the ground
        g.mesh.position.y = g.mesh.scale.y * 0.5;
      });

      // Update Obstacles float/rotations and collisions
      obstaclesList.current.forEach(obs => {
        if (obs.type === 'spirit') {
          const sprite = obs.mesh as THREE.Sprite;
          const spriteMat = sprite.material as THREE.SpriteMaterial;
          const clonedTex = spriteMat.map;

          if (obs.isDying) {
            // Dying knockback & flash white fly-out
            if (obs.knockbackVel) {
              sprite.position.add(obs.knockbackVel);
              obs.knockbackVel.y -= 0.008; // pull down by small gravity
            }
            if (obs.flashTimer && obs.flashTimer > 0) {
              obs.flashTimer--;
              // Rapid flashing
              sprite.visible = obs.flashTimer % 4 < 2;
              if (obs.flashTimer <= 0) {
                sprite.visible = false;
                obs.isDying = false;
                obs.isHit = true; // permanently dead/inactive
              }
            }
          } else if (!obs.isHit) {
            // Normal active enemy behavior
            const toPlayer = ph.playerPos.clone().sub(sprite.position);
            toPlayer.y = 0;
            const distance = toPlayer.length();

            // Handle active knockback from hits
            if (obs.knockbackVel && obs.knockbackVel.length() > 0.005) {
              sprite.position.add(obs.knockbackVel);
              obs.knockbackVel.multiplyScalar(0.88); // friction dampening
              obs.isWalking = false;
            } else {
              // Walk towards player
              if (distance > 1.1) {
                toPlayer.normalize();
                const enemySpeed = 0.024; // walking speed
                sprite.position.addScaledVector(toPlayer, enemySpeed);
                obs.isWalking = true;
                obs.facingRight = toPlayer.x > 0;
              } else {
                obs.isWalking = false;
                // Attack state - trigger red flash
                if (obs.flashTimer === undefined || obs.flashTimer <= 0) {
                  obs.flashTimer = 25;
                  obs.flashColor = 'red';
                }
              }
            }

            // Floating movement
            sprite.position.y = obs.initialY + Math.sin(time * 0.003 + obs.id) * 0.06;

            // Update anim frames
            obs.animTimer = (obs.animTimer || 0) + 1;
            const frameSpeed = obs.isWalking ? 8 : 12;
            if (obs.animTimer >= frameSpeed) {
              obs.animTimer = 0;
              obs.animFrame = ((obs.animFrame || 0) + 1) % 4;
            }

            if (clonedTex) {
              const isFlipped = obs.facingRight;
              clonedTex.repeat.set(isFlipped ? -0.25 : 0.25, 0.5);
              clonedTex.offset.x = isFlipped ? ((obs.animFrame || 0) + 1) * 0.25 : (obs.animFrame || 0) * 0.25;
              clonedTex.offset.y = obs.isWalking ? 0.0 : 0.5; // Row 2 for walking, Row 1 for idle
            }

            // Render flashing colors
            if (obs.flashTimer && obs.flashTimer > 0) {
              obs.flashTimer--;
              if (obs.flashColor === 'white') {
                spriteMat.color.setHex(obs.flashTimer % 6 < 3 ? 0x888888 : 0xffffff);
              } else if (obs.flashColor === 'red') {
                spriteMat.color.setHex(obs.flashTimer % 8 < 4 ? 0xef4444 : 0xffffff);
              }
            } else {
              spriteMat.color.setHex(0xffffff);
            }

            // Collision with player (deals damage if player is vulnerable)
            if (distance <= 1.25) {
              if (ph.invulnerableTimer <= 0) {
                // Take damage!
                ph.lives--;
                setLives(ph.lives);
                ph.invulnerableTimer = 90; // 1.5 seconds invulnerability
                setIsInvulnerable(true);
                audio.playHit();
                
                // Spark explosion
                spawnExplosion(ph.playerPos, 0xef4444, 25);

                // Game Over check
                if (ph.lives <= 0) {
                  setGamePlayState('OVER');
                  audio.playGameOver();
                }
              }
            }

            // Automatically hit by sacred dance skill
            if (isDanceActive) {
              const ringDist = ph.playerPos.distanceTo(sprite.position);
              if (ringDist <= 4.5) {
                // Instant defeat via dance skill
                obs.isHit = true;
                obs.isDying = true;
                obs.flashTimer = 35;
                obs.flashColor = 'white';
                obs.knockbackVel = new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.22, -0.1).normalize().multiplyScalar(0.18);
                spawnExplosion(sprite.position, 0x818cf8, 20);
                ph.score += 30;
                setScore(ph.score);
                updateHighScoreIfNeeded(ph.score);
                audio.playCollect();

                // Increment kills count
                setDefeatedKills((prev) => {
                  const nextKills = prev + 1;
                  if (nextKills >= 10 && !bossStateRef.current.spawned) {
                    triggerBossSpawn();
                  }
                  return nextKills;
                });
              }
            }
          }
        } else if (!obs.isHit) {
          // Rock/Other static obstacles collision
          const d = ph.playerPos.distanceTo(obs.mesh.position);
          if (d <= 1.25) {
            if (ph.invulnerableTimer <= 0) {
              // Take damage!
              ph.lives--;
              setLives(ph.lives);
              ph.invulnerableTimer = 90;
              setIsInvulnerable(true);
              audio.playHit();
              
              // Spark explosion
              spawnExplosion(ph.playerPos, 0xef4444, 25);

              // Game Over check
              if (ph.lives <= 0) {
                setGamePlayState('OVER');
                audio.playGameOver();
              }
            }
          }
        }
      });

      // Reduce invulnerable flashing timer
      if (ph.invulnerableTimer > 0) {
        ph.invulnerableTimer--;
        setIsInvulnerable(true);
        if (playerSprite) {
          // Flashing sprite visibility
          playerSprite.visible = ph.invulnerableTimer % 6 < 3;
        }
        if (ph.invulnerableTimer <= 0) {
          setIsInvulnerable(false);
          if (playerSprite) playerSprite.visible = true;
        }
      }

      // Update 3D particles life
      particlesList.current = particlesList.current.filter(p => {
        p.mesh.position.addScaledVector(p.velocity, 0.033);
        p.velocity.y -= 0.06; // small particle gravity
        p.life++;
        
        // fade size over time
        const scale = 1.0 - (p.life / p.maxLife);
        p.mesh.scale.set(scale, scale, scale);

        if (p.life >= p.maxLife) {
          scene.remove(p.mesh);
          return false;
        }
        return true;
      });

      // Update HUD progress percentage towards Temple (Z-axis coordinate tracking)
      // Player starts at Z = 20, goal is Z = -20 (Total travel span is 40 units)
      const progress = Math.max(0, Math.min(100, Math.round(((20 - ph.playerPos.z) / 40) * 100)));
      setDistancePercent(progress);

      // 1. SYSTEM SPONTANEOUS ENEMY SPAWNER
      // Randomly spawn an enemy from any direction every 1-3 seconds
      if (gamePlayState === 'PLAYING') {
        const elapsed = time / 1000;
        if (elapsed - lastEnemySpawnTime > enemySpawnInterval) {
          lastEnemySpawnTime = elapsed;
          enemySpawnInterval = 1.0 + Math.random() * 2.0; // random 1-3 seconds

          const enemyTexBase = enemyTextureRef.current || new THREE.TextureLoader().load(
            'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/enemy_mp1zhh.png',
            (tex) => {
              tex.generateMipmaps = false;
              tex.minFilter = THREE.NearestFilter;
              tex.magFilter = THREE.NearestFilter;
              tex.repeat.set(0.25, 0.5);
              tex.offset.set(0, 0.5);
            }
          );

          const clonedTex = enemyTexBase.clone();
          clonedTex.needsUpdate = true;

          const spiritSpriteMat = new THREE.SpriteMaterial({
            map: clonedTex,
            transparent: true,
            color: 0xffffff
          });
          const sprite = new THREE.Sprite(spiritSpriteMat);
          sprite.scale.set(1.8, 1.8, 1.0);

          // Spawn from a random direction relative to player position:
          // Front, back, left, or right
          const angle = Math.random() * Math.PI * 2;
          const spawnDist = 12.0 + Math.random() * 4.0;
          const x = ph.playerPos.x + Math.cos(angle) * spawnDist;
          const z = ph.playerPos.z + Math.sin(angle) * spawnDist;

          // Clamp so they stay on track
          const clampedX = Math.max(-9.0, Math.min(9.0, x));
          const clampedZ = Math.max(-23.0, Math.min(23.5, z));

          sprite.position.set(clampedX, 0.9, clampedZ);
          scene.add(sprite);

          obstaclesList.current.push({
            mesh: sprite,
            type: 'spirit',
            id: Date.now() + Math.random(),
            initialY: 0.9,
            floatSpeed: 0.03 + Math.random() * 0.02,
            isHit: false,
            health: 2,
            knockbackVel: new THREE.Vector3(0, 0, 0),
            flashTimer: 0,
            flashColor: 'white',
            isDying: false,
            animFrame: 0,
            animTimer: 0,
            isWalking: true
          });

          // Spark particle splash
          spawnExplosion(sprite.position, 0x818cf8, 10);
        }
      }

      // 2. BOSS STATE MACHINE & MOVEMENT UPDATES
      const bs = bossStateRef.current;
      const bossSprite = bossRef.current;

      if (bs.spawned && bossSprite) {
        // Handle Dying state
        if (bs.isDying) {
          bs.deathAnimTimer--;
          // Spin and fly up as death animation
          bossSprite.rotation.z += 0.12;
          bs.pos.y += 0.04;
          bossSprite.position.copy(bs.pos);

          // Spawn periodic explosions!
          if (bs.deathAnimTimer % 10 === 0) {
            spawnExplosion(bs.pos, 0xf59e0b, 15);
            audio.playCollect();
          }

          // Fade scale out
          const sc = Math.max(0.1, 4.5 * (bs.deathAnimTimer / 90));
          bossSprite.scale.set(sc, sc, 1.0);

          if (bs.deathAnimTimer <= 0) {
            bossSprite.visible = false;
            bs.spawned = false; // deactivate fully
          }
        } else if (bs.active && gamePlayState === 'PLAYING') {
          // Animate Boss frame (alternate between row offset 0.5 and 0.0)
          bs.animTimer++;
          if (bs.animTimer >= 15) { // every 15 frames
            bs.animTimer = 0;
            bs.animFrame = (bs.animFrame + 1) % 2;
            if (bossTextureRef.current) {
              bossTextureRef.current.offset.y = bs.animFrame === 0 ? 0.5 : 0.0;
            }
          }

          // Handle hit flash visual feedback
          if (bs.flashTimer > 0) {
            bs.flashTimer--;
            const isFlash = bs.flashTimer % 4 < 2;
            if (bs.state === 'PRE_ATTACK') {
              bossSprite.material.color.setHex(isFlash ? 0xef4444 : 0xffffff);
            } else {
              bossSprite.material.color.setHex(isFlash ? 0xffa500 : 0xffffff);
            }
          } else {
            bossSprite.material.color.setHex(0xffffff);
          }

          // State actions and transitions
          bs.stateTimer--;
          if (bs.stateTimer <= 0) {
            // Transition to next state
            const states: ('IDLE' | 'DASH_NEAR' | 'DASH_FAR' | 'PRE_ATTACK')[] = ['IDLE', 'DASH_NEAR', 'DASH_FAR', 'PRE_ATTACK'];
            const nextState = states[Math.floor(Math.random() * states.length)];
            bs.state = nextState;

            if (bs.state === 'IDLE') {
              bs.stateTimer = 60 + Math.random() * 60; // 1-2 seconds
              bs.targetPos.set(
                (Math.random() - 0.5) * 8.0,
                4.5 + Math.sin(time * 0.002) * 0.5,
                ph.playerPos.z - 10.0 - Math.random() * 4.0
              );
            } else if (bs.state === 'DASH_NEAR') {
              bs.stateTimer = 45;
              bs.targetPos.set(
                ph.playerPos.x + (Math.random() - 0.5) * 3.0,
                3.2,
                ph.playerPos.z - 5.5
              );
              audio.playJump();
            } else if (bs.state === 'DASH_FAR') {
              bs.stateTimer = 45;
              bs.targetPos.set(
                (Math.random() - 0.5) * 14.0,
                5.8,
                ph.playerPos.z - 15.0
              );
              audio.playJump();
            } else if (bs.state === 'PRE_ATTACK') {
              bs.stateTimer = 55;
              bs.flashTimer = 55;
              audio.playHit();
            }
          }

          // Move smoothly towards targetPos (Lerp)
          if (bs.state !== 'PRE_ATTACK') {
            bossSprite.scale.set(4.5, 4.5, 1.0);
            bs.pos.lerp(bs.targetPos, 0.05);
          } else {
            // Pulsate scale to signify attack prep
            const pulsate = 4.5 + Math.sin(time * 0.03) * 0.8;
            bossSprite.scale.set(pulsate, pulsate, 1.0);
            bs.pos.y += Math.sin(time * 0.01) * 0.015;
          }

          bossSprite.position.copy(bs.pos);

          // Handle ATTACK transition
          if (bs.state === 'PRE_ATTACK' && bs.stateTimer === 1) {
            bs.state = 'ATTACK';
            bs.stateTimer = 30;

            const fireballCount = 3;
            for (let i = 0; i < fireballCount; i++) {
              const targetX = ph.playerPos.x + (Math.random() - 0.5) * 6.5;
              const targetZ = ph.playerPos.z + (Math.random() - 0.5) * 6.5;
              const targetPos = new THREE.Vector3(targetX, 0.2, targetZ);

              const fbGeo = new THREE.SphereGeometry(0.35, 12, 12);
              const fbMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
              const fbMesh = new THREE.Mesh(fbGeo, fbMat);
              fbMesh.position.copy(bs.pos);
              scene.add(fbMesh);

              const reticleGeo = new THREE.RingGeometry(0.1, 0.7, 16);
              const reticleMat = new THREE.MeshBasicMaterial({ 
                color: 0xef4444, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.85 
              });
              const reticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
              reticleMesh.rotation.x = -Math.PI / 2;
              reticleMesh.position.copy(targetPos);
              reticleMesh.position.y = 0.05;
              scene.add(reticleMesh);

              audio.playJump();

              bossFireballsList.current.push({
                mesh: fbMesh,
                startPos: bs.pos.clone(),
                targetPos: targetPos,
                progress: 0,
                speed: 0.018 + Math.random() * 0.006,
                height: 5.5 + Math.random() * 3.5,
                reticleMesh: reticleMesh,
                id: Date.now() + Math.random(),
              });
            }
          }
        }
      }

      // 3. FIREBALLS PHYSICS AND COLLISION
      bossFireballsList.current = bossFireballsList.current.filter(fb => {
        fb.progress += fb.speed;

        const currentX = THREE.MathUtils.lerp(fb.startPos.x, fb.targetPos.x, fb.progress);
        const currentZ = THREE.MathUtils.lerp(fb.startPos.z, fb.targetPos.z, fb.progress);
        const currentY = fb.startPos.y + (fb.targetPos.y - fb.startPos.y) * fb.progress + Math.sin(fb.progress * Math.PI) * fb.height;

        fb.mesh.position.set(currentX, currentY, currentZ);

        const reticleScale = 1.0 + Math.sin(time * 0.02) * 0.25;
        fb.reticleMesh.scale.set(reticleScale, reticleScale, 1.0);

        const distToPlayer = fb.mesh.position.distanceTo(ph.playerPos);
        if (distToPlayer <= 1.2 && ph.invulnerableTimer <= 0 && gamePlayState === 'PLAYING') {
          ph.lives--;
          setLives(ph.lives);
          ph.invulnerableTimer = 90;
          setIsInvulnerable(true);
          audio.playHit();
          spawnExplosion(ph.playerPos, 0xef4444, 25);

          if (ph.lives <= 0) {
            setGamePlayState('OVER');
            audio.playGameOver();
          }
        }

        if (fb.progress >= 1.0) {
          spawnExplosion(fb.targetPos, 0xf97316, 20);
          audio.playAttack();

          const distToPlayerGround = fb.targetPos.distanceTo(ph.playerPos);
          if (distToPlayerGround <= 2.2 && ph.invulnerableTimer <= 0 && gamePlayState === 'PLAYING') {
            ph.lives--;
            setLives(ph.lives);
            ph.invulnerableTimer = 90;
            setIsInvulnerable(true);
            audio.playHit();
            spawnExplosion(ph.playerPos, 0xef4444, 25);

            if (ph.lives <= 0) {
              setGamePlayState('OVER');
              audio.playGameOver();
            }
          }

          scene.remove(fb.mesh);
          scene.remove(fb.reticleMesh);
          return false;
        }

        return true;
      });

      // 4. PORTAL ROTATION & HIGHLIGHT
      const portalState = portalStateRef.current;
      if (portalState.active && portalState.mesh) {
        portalState.animTimer += 0.04;
        portalState.mesh.rotation.z += 0.035;
        
        const portalPulse = 1.0 + Math.sin(portalState.animTimer) * 0.08;
        portalState.mesh.scale.set(portalPulse, portalPulse, portalPulse);

        if (Math.random() < 0.06) {
          const spawnPos = portalState.mesh.position.clone();
          spawnPos.x += (Math.random() - 0.5) * 1.5;
          spawnPos.y += (Math.random() - 0.5) * 1.5;
          spawnExplosion(spawnPos, 0x60a5fa, 2);
        }
      }

      // Goal Reach check: Entering Warp Portal ending!
      if (portalState.active && portalState.mesh && gamePlayState === 'PLAYING') {
        const distToPortal = ph.playerPos.distanceTo(portalState.mesh.position);
        if (distToPortal <= 1.4) {
          setGamePlayState('ENDING');
          audio.playVictory();
        }
      }

      // Smooth camera lerp follow (offset looking down)
      if (camera) {
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, ph.playerPos.x, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, ph.playerPos.z + 5.2, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, ph.playerPos.y + 4.2, 0.08);
        camera.lookAt(ph.playerPos.x, ph.playerPos.y - 0.1, ph.playerPos.z - 0.6);
      }

      renderer.render(scene, camera);
    };

    // Trigger loop
    animFrameId = requestAnimationFrame(animate);

    // Cleanups
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      audio.stopMusic();
    };
  }, [gamePlayState, controls]);

  return (
    <div id="game-canvas-screen" className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* 1. HEADER HUD STATUS BAR */}
      <header className="flex-none p-4 md:px-6 bg-black/85 border-b border-white/10 flex items-center justify-between z-20 gap-4">
        <div className="flex items-center gap-3">
          <img
            id="game-hud-logo"
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
            alt="Logo"
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold uppercase tracking-widest text-red-500">
              Dan Sai Adventure
            </span>
            <span className="text-[9px] text-white/40 tracking-wider">
              PHI TA KHON 3D VIRTUAL WORLD
            </span>
          </div>
        </div>

        {/* Live game states */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Score</div>
            <div className="text-lg font-mono font-black text-amber-500">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Rice 🌾</div>
            <div className="text-lg font-mono font-black text-green-400">{riceCount}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Kills 👹</div>
            <div className="text-lg font-mono font-black text-red-500">
              {defeatedKills}
              {defeatedKills < 10 && <span className="text-xs text-white/40">/10</span>}
            </div>
          </div>
        </div>

        {/* Lives Counter & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, idx) => (
              <Heart 
                key={idx} 
                className={`w-5 h-5 ${idx < lives ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`} 
              />
            ))}
          </div>
          <button
            id="game-exit-btn"
            onClick={() => {
              audio.playMenuClick();
              audio.stopMusic();
              onGoToMenu();
            }}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Menu
          </button>
        </div>
      </header>

      {/* 2. PROGRESS ROAD TOWARDS WAT PON CHAI */}
      <div className="flex-none h-2 bg-zinc-900 relative z-20">
        <div 
          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 transition-all duration-300 relative"
          style={{ width: `${distancePercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-red-600 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            <span className="text-[8px] font-black text-black">🎭</span>
          </div>
        </div>
        <div className="absolute left-4 top-3 text-[9px] text-white/50 font-bold uppercase tracking-wider">
          📍 START
        </div>
        <div className="absolute right-4 top-3 text-[9px] text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1">
          ⛩️ WAT PON CHAI TEMPLE
        </div>
      </div>

      {/* 3. CORE 3D GAMEPLAY VIEWPORT CONTAINER */}
      <main className="flex-1 relative z-10 w-full h-full min-h-0 bg-black">
        
        {/* Boss Health Bar Overlay */}
        {bossActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20">
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.35)] space-y-1.5 animate-pulse text-center">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-400">
                <span>👹 พญาผีตาโขนหลวง (Great Boss)</span>
                <span>HP: {bossHealth} / {bossMaxHealth}</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full border border-red-500/25 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ThreeJS target mount div */}
        <div 
          ref={containerRef} 
          className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden z-10" 
        />

        {/* 4. OVERLAYS / GAME SCREENS */}
        
        {/* State A: Idle screen before startup */}
        {gamePlayState === 'IDLE' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] space-y-6"
            >
              <img
                src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/logo_fj2ctz.png"
                alt="Logo"
                className="h-28 mx-auto drop-shadow-[0_4px_15px_rgba(220,38,38,0.3)]"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-500">
                  READY TO DANCE?
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  ออกเดินทางมุ่งสู่วัดโพนชัย หลบเลี่ยงหินผา 🪨 ใช้ทักษะโจมตีด้วยดาบไม้ ⚔️ และเต้นลายกลองยาวสร้างพายุกระบอกดูดข้าวเหนียว 🌾
                </p>
              </div>

              {/* Controls directory card */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl grid grid-cols-2 gap-4 text-left text-[11px] text-zinc-300 font-mono">
                <div>
                  <span className="text-red-400 font-bold block uppercase mb-1">🎮 Movement</span>
                  WASD / Arrow Keys
                </div>
                <div>
                  <span className="text-amber-400 font-bold block uppercase mb-1">⚔️ ATTACK</span>
                  Press <kbd className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">P Key</kbd>
                </div>
                <div>
                  <span className="text-blue-400 font-bold block uppercase mb-1">🦘 JUMP</span>
                  Press <kbd className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">Spacebar</kbd>
                </div>
                <div>
                  <span className="text-yellow-400 font-bold block uppercase mb-1">💃 SACRED DANCE</span>
                  Press <kbd className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded">O Key</kbd>
                </div>
              </div>

              <button
                id="start-button-game"
                onClick={handleStartGame}
                className="w-full py-4.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-xl text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
              >
                เริ่มออกเดินทาง / Start Game
              </button>
            </motion.div>
          </div>
        )}

        {/* Pause Overlay Screen */}
        {isPaused && gamePlayState === 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-35 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs w-full p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-500 uppercase">
                  PAUSED
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  เกมกำลังหยุดชั่วคราว
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <button
                  id="pause-resume-btn"
                  onClick={() => {
                    audio.playMenuClick();
                    setIsPaused(false);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  เล่นต่อ / Resume [ESC]
                </button>
                <button
                  id="pause-menu-btn"
                  onClick={() => {
                    audio.playMenuClick();
                    audio.stopMusic();
                    onGoToMenu();
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors text-zinc-300"
                >
                  กลับสู่หน้าหลัก / Back to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* State B: Game Over Screen */}
        {gamePlayState === 'OVER' && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md p-8 bg-zinc-950 border border-red-900/30 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.2)] space-y-6"
            >
              <div className="w-16 h-16 bg-red-950/50 border border-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-8 h-8 text-red-500 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight text-red-500 uppercase">
                  GAME OVER
                </h2>
                <p className="text-xs text-zinc-400">
                  หน้ากากผีตาโขนเสียหายจากการชนอุปสรรคและวิญญาณเกเร
                </p>
              </div>

              {/* Stats Review */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Final Score</span>
                  <div className="text-2xl font-black text-amber-500 font-mono mt-0.5">{score}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Rice Collected</span>
                  <div className="text-2xl font-black text-green-400 font-mono mt-0.5">{riceCount} 🌾</div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  id="gameover-restart-btn"
                  onClick={handleStartGame}
                  className="w-full py-3.5 bg-white text-black hover:bg-amber-500 hover:text-black rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
                >
                  เล่นใหม่อีกครั้ง / Play Again
                </button>
                <button
                  id="gameover-menu-btn"
                  onClick={() => {
                    audio.playMenuClick();
                    onGoToMenu();
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                >
                  กลับสู่หน้าหลัก / Back to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* State C: Game Victory Screen */}
        {gamePlayState === 'WIN' && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md p-8 bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-6"
            >
              <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Award className="w-10 h-10 text-amber-500" />
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400 uppercase">
                  VICTORY!
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  ยินดีด้วย! คุณนำขบวนผีตาโขนเข้าสู่ <strong>วัดโพนชัย</strong> ได้สำเร็จลุล่วงอย่างรุ่งโรจน์!
                </p>
              </div>

              {/* Stats Review */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Final Score</span>
                  <div className="text-2xl font-black text-amber-500 font-mono mt-0.5">{score}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Rice Collected</span>
                  <div className="text-2xl font-black text-green-400 font-mono mt-0.5">{riceCount} 🌾</div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  id="victory-restart-btn"
                  onClick={handleStartGame}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
                >
                  เล่นต่ออีกรอบ / Play Again
                </button>
                <button
                  id="victory-menu-btn"
                  onClick={() => {
                    audio.playMenuClick();
                    onGoToMenu();
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                >
                  กลับสู่หน้าหลัก / Back to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* State D: Cinematic Game Ending Screen & RPG Dialogue */}
        {gamePlayState === 'ENDING' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-950 to-black z-30 flex flex-col items-center justify-between p-6 overflow-hidden">
            
            {/* Background ambiance effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Bar Status / Progress Indicator (only during dialogue) */}
            {currentDialogueIndex < ENDING_DIALOGUES.length ? (
              <div className="relative z-10 w-full max-w-2xl flex justify-between items-center px-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">
                    WAT PON CHAI ARRIVAL • บทสนทนาธรรม
                  </span>
                </div>
                <button
                  onClick={() => {
                    audio.playMenuClick();
                    setCurrentDialogueIndex(ENDING_DIALOGUES.length); // skip directly to Finish screen
                  }}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-zinc-400 font-black uppercase tracking-wider transition-all"
                >
                  Skip Dialogue ➔
                </button>
              </div>
            ) : (
              <div className="mt-2" />
            )}

            {/* MIDDLE AREA: Active Characters stage or Finish Stats */}
            {currentDialogueIndex < ENDING_DIALOGUES.length ? (
              <div className="flex-1 w-full max-w-4xl flex items-center justify-center gap-8 md:gap-20 px-4 relative">
                
                {/* Left Side: NPC (ชาวบ้านด่านซ้าย) */}
                <motion.div
                  initial={{ x: -120, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    y: ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC' ? [0, -10, 0] : 0,
                    scale: ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC' ? 1.05 : 0.95
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 100,
                    y: {
                      repeat: ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC' ? Infinity : 0,
                      duration: 0.6,
                      ease: 'easeInOut'
                    }
                  }}
                  className="flex flex-col items-center gap-3 relative z-10"
                >
                  {/* Glowing frame */}
                  <div className={`relative p-2 rounded-2xl border-2 transition-all duration-300 ${
                    ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC' 
                      ? 'bg-green-500/10 border-green-400/60 shadow-[0_0_30px_rgba(34,197,94,0.25)]' 
                      : 'bg-zinc-950/40 border-zinc-800/40 opacity-75'
                  }`}>
                    {/* Animated NPC Sprite from Sprite Sheet */}
                    <div 
                      className="w-32 h-32 md:w-40 md:h-40 bg-no-repeat transition-all duration-100"
                      style={{
                        backgroundImage: `url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png')`,
                        backgroundSize: '200% 200%',
                        backgroundPosition: (() => {
                          const x = (npcFrame % 2) * 100;
                          const y = Math.floor(npcFrame / 2) * 100;
                          return `${x}% ${y}%`;
                        })(),
                        imageRendering: 'pixelated',
                      }}
                    />
                    
                    {/* Speaker active glow aura */}
                    {ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC' && (
                      <div className="absolute -inset-1 border border-green-400 rounded-2xl animate-pulse pointer-events-none" />
                    )}
                  </div>
                  
                  <div className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase transition-colors ${
                    ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    Dan Sai Kid 🌾
                  </div>
                </motion.div>

                {/* VS / Center Divider visual */}
                <div className="hidden md:flex flex-col items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
                  <span className="text-[10px] font-mono tracking-widest my-2">INTERACT</span>
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
                </div>

                {/* Right Side: Player (ผู้กล้าผีตาโขน) */}
                <motion.div
                  initial={{ x: 120, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    y: ENDING_DIALOGUES[currentDialogueIndex].speaker === 'PLAYER' ? [0, -10, 0] : 0,
                    scale: ENDING_DIALOGUES[currentDialogueIndex].speaker === 'PLAYER' ? 1.05 : 0.95
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 100,
                    y: {
                      repeat: ENDING_DIALOGUES[currentDialogueIndex].speaker === 'PLAYER' ? Infinity : 0,
                      duration: 0.6,
                      ease: 'easeInOut'
                    }
                  }}
                  className="flex flex-col items-center gap-3 relative z-10"
                >
                  {/* Glowing frame */}
                  <div className={`relative p-2 rounded-2xl border-2 transition-all duration-300 ${
                    ENDING_DIALOGUES[currentDialogueIndex].speaker === 'PLAYER' 
                      ? 'bg-red-500/10 border-red-400/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]' 
                      : 'bg-zinc-950/40 border-zinc-800/40 opacity-75'
                  }`}>
                    {/* Handcrafted animated representation of player character */}
                    <div 
                      className="w-32 h-32 md:w-40 md:h-40 bg-no-repeat bg-center bg-cover rounded-xl"
                      style={{
                        backgroundImage: `url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/player_tvy8ym.png')`,
                        backgroundSize: '300% 100%',
                        backgroundPosition: '0% 0%',
                        imageRendering: 'pixelated',
                      }}
                    />

                    {/* Speaker active glow aura */}
                    {ENDING_DIALOGUES[currentDialogueIndex].speaker === 'PLAYER' && (
                      <div className="absolute -inset-1 border border-red-400 rounded-2xl animate-pulse pointer-events-none" />
                    )}
                  </div>

                  <div className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase transition-colors ${
                    ENDING_DIALOGUES[currentDialogueIndex].speaker === 'PLAYER'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    You (Hero) 👹
                  </div>
                </motion.div>

              </div>
            ) : (
              /* FINISH DASHBOARD VIEW */
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 w-full max-w-lg flex flex-col justify-center items-center my-4 space-y-6 relative z-10"
              >
                <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>

                <div className="space-y-2 text-center">
                  <h1 className="text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 uppercase filter drop-shadow-sm font-sans">
                    FINISH
                  </h1>
                  <h2 className="text-lg font-black tracking-tight text-white uppercase">
                    จบบริบูรณ์ • THE SACRED VICTORY
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                    วัดโพนชัยสว่างไสวด้วยแสงบุญบารมีอันบริสุทธิ์ ประเพณีผีตาโขนกลับคืนสู่วิถีวัฒนธรรมดั้งเดิมแสนงดงามและสนุกสนานชั่วนิรันดร์
                  </p>
                </div>

                {/* Friendly victory pose avatars standing side-by-side */}
                <div className="flex justify-center items-center gap-8 py-2">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-16 h-16 bg-no-repeat transition-all duration-150 animate-bounce"
                      style={{
                        backgroundImage: `url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png')`,
                        backgroundSize: '200% 200%',
                        backgroundPosition: '0% 0%',
                        imageRendering: 'pixelated',
                      }}
                    />
                    <span className="text-[9px] text-green-400 font-bold uppercase mt-1">Village Kid</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-16 h-16 bg-no-repeat bg-center bg-cover rounded-xl animate-pulse"
                      style={{
                        backgroundImage: `url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/player_tvy8ym.png')`,
                        backgroundSize: '300% 100%',
                        backgroundPosition: '0% 0%',
                        imageRendering: 'pixelated',
                      }}
                    />
                    <span className="text-[9px] text-red-400 font-bold uppercase mt-1">Phi Ta Khon</span>
                  </div>
                </div>

                {/* Stats Review */}
                <div className="w-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Total Score</span>
                    <div className="text-xl font-black text-amber-500 font-mono mt-0.5">{score}</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Rice gathered</span>
                    <div className="text-xl font-black text-green-400 font-mono mt-0.5">{riceCount} 🌾</div>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Boss Defeated</span>
                    <div className="text-xl font-black text-red-500 font-mono mt-0.5">พญาผี 👹</div>
                  </div>
                </div>

                <div className="w-full space-y-2.5">
                  <button
                    id="finish-restart-btn"
                    onClick={handleStartGame}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  >
                    เล่นใหม่อีกรอบ / Play Again
                  </button>
                  <button
                    id="finish-menu-btn"
                    onClick={() => {
                      audio.playMenuClick();
                      onGoToMenu();
                    }}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                  >
                    กลับสู่หน้าหลัก / Back to Title
                  </button>
                </div>
              </motion.div>
            )}

            {/* BOTTOM DIALOGUE BOX (only shown during active dialogues) */}
            {currentDialogueIndex < ENDING_DIALOGUES.length && (
              <motion.div 
                key={currentDialogueIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => {
                  audio.playCollect();
                  setCurrentDialogueIndex(prev => prev + 1);
                }}
                className="w-full max-w-2xl bg-zinc-950/90 border-2 border-amber-500/30 rounded-2xl p-5 md:p-6 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer hover:border-amber-500/50 transition-all flex flex-col justify-between min-h-[160px] relative z-20 select-none"
              >
                {/* Speaker indicator label */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow ${
                    ENDING_DIALOGUES[currentDialogueIndex].speaker === 'NPC'
                      ? 'bg-green-600/25 border border-green-500/40 text-green-300'
                      : 'bg-red-600/25 border border-red-500/40 text-red-300'
                  }`}>
                    💬 {ENDING_DIALOGUES[currentDialogueIndex].name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">
                    {currentDialogueIndex + 1} / {ENDING_DIALOGUES.length}
                  </span>
                </div>

                {/* Speech content */}
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  <p className="text-sm md:text-base text-zinc-100 font-medium leading-relaxed">
                    {ENDING_DIALOGUES[currentDialogueIndex].text}
                  </p>
                  <p className="text-[11px] md:text-xs text-zinc-400 italic font-mono leading-normal">
                    {ENDING_DIALOGUES[currentDialogueIndex].textEn}
                  </p>
                </div>

                {/* Advance Prompt Pulsing hint */}
                <div className="flex justify-end items-center gap-1.5 mt-3 text-[10px] text-amber-400 font-black tracking-widest uppercase animate-pulse">
                  <span>คลิกเพื่อถัดไป / Press Next</span>
                  <span>➔</span>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* 5. LIVE SKILL / COMBAT PANEL OVERLAYS */}
        {gamePlayState === 'PLAYING' && (
          <div className="absolute bottom-6 left-6 z-20 pointer-events-none flex flex-col gap-3 font-mono text-[11px]">
            
            {/* Active Invulnerable flashing widget */}
            {isInvulnerable && (
              <div className="px-3 py-1.5 bg-red-950/90 border border-red-500/50 text-red-400 font-bold rounded flex items-center gap-2 shadow animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>INVULNERABLE SHIELD ACTIVE</span>
              </div>
            )}

            {/* Sacred Dance Magnet Shield */}
            {isDanceActive && (
              <div className="px-3 py-1.5 bg-amber-950/90 border border-amber-500/50 text-amber-400 font-bold rounded flex items-center gap-2 shadow animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>SACRED DANCE MAGNET IN ACTION</span>
              </div>
            )}

            {/* General Keys directory hints on screen */}
            <div className="p-3 bg-black/80 border border-white/10 rounded-xl flex items-center gap-4 text-zinc-400 text-xs">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">W</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">A</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">S</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">D</kbd>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">Space</kbd>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">P</kbd>
                <span>Sword Attack ⚔️</span>
              </div>
              <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">O</kbd>
                <span>Dance magnet 💃</span>
              </div>
            </div>

          </div>
        )}

        {/* 6. SKILL ACTION HOTKEY BUTTONS OVERLAYS */}
        {gamePlayState === 'PLAYING' && (
          <div className="absolute bottom-6 right-6 z-20 flex gap-4">
            
            {/* Sword Attack Trigger */}
            <button
              id="hud-attack-btn"
              onClick={() => {
                if (gamePlayState === 'PLAYING') triggerAttack();
              }}
              className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex flex-col items-center justify-center border-2 border-red-400 shadow-lg pointer-events-auto active:scale-95 transition-transform"
            >
              <Sword className="w-6 h-6 text-white" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white mt-1">
                [P] Attack
              </span>
            </button>

            {/* Dance Skill trigger with visual cooldown loader */}
            <button
              id="hud-dance-btn"
              onClick={() => {
                if (gamePlayState === 'PLAYING') triggerDanceSkill();
              }}
              disabled={danceCooldown > 0}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 shadow-lg pointer-events-auto active:scale-95 transition-transform relative ${
                danceCooldown > 0 
                  ? 'bg-zinc-800 border-zinc-700 cursor-not-allowed opacity-60' 
                  : 'bg-amber-500 hover:bg-amber-400 border-amber-300'
              }`}
            >
              <Sparkles className={`w-6 h-6 ${danceCooldown > 0 ? 'text-zinc-500' : 'text-black'}`} />
              <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${danceCooldown > 0 ? 'text-zinc-500' : 'text-black'}`}>
                {danceCooldown > 0 ? `${danceCooldown}s` : '[O] Dance'}
              </span>
            </button>

          </div>
        )}

      </main>

      {/* 7. BOTTOM STABLE Ribbon status */}
      <footer className="flex-none h-10 bg-white text-black flex items-center px-6 md:px-8 justify-between z-20">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span>Active Viewport: 3D THREE.JS WEBGL RENDERER</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em]">
          © 2026 Dan Sai Chronicles • Loei, Thailand
        </div>
      </footer>
    </div>
  );
}
