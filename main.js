import * as THREE from "three";

let songList = [];
let currentSongIndex = 0;
let loop = false;
let isPlaying = false;
let lyricIndex = 0;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const floorGeo = new THREE.PlaneGeometry(30, 30, 60, 60);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x00f2ff, wireframe: true, transparent: true, opacity: 0.3 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3;
scene.add(floor);

const pGeo = new THREE.BufferGeometry();
const pCount = 2000;
const pArr = new Float32Array(pCount * 3);
for (let i = 0; i < pArr.length; i++) pArr[i] = (Math.random() - 0.5) * 40;
pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.02, color: 0xffffff }));
scene.add(particles);

const light = new THREE.PointLight(0xff007a, 100);
light.position.set(0, 5, 0);
scene.add(light);

const audio = new Audio();

const lyrics = [
  { time: 0, text: "Welcome to the 3D Experience" },
  { time: 5, text: "Sound Shapes Space" },
  { time: 10, text: "Particles Follow Rhythm" },
  { time: 16, text: "You Are Inside the Music" }
];

const lyricEl = document.getElementById("lyrics");
const trackName = document.getElementById("track-name");
const status = document.getElementById("status");
const timeEl = document.getElementById("time");
const bar = document.getElementById("bar");
const loopBtn = document.getElementById("loop");

fetch("/songs")
  .then(res => res.json())
  .then(songs => {
    songList = songs;
    status.innerText = "Songs Loaded";
    const list = document.getElementById("songList");
    songs.forEach((song, index) => {
      const btn = document.createElement("button");
      btn.textContent = song;
      btn.onclick = () => playSong(index);
      list.appendChild(btn);
    });
  });

function playSong(index) {
  currentSongIndex = index;
  audio.src = `songs/${songList[index]}`;
  audio.play();
  isPlaying = true;
  lyricIndex = 0;
  trackName.innerText = songList[index];
  lyricEl.innerText = lyrics[0].text;
}

document.getElementById("play").onclick = () => {
  if (!audio.src) return;
  isPlaying ? audio.pause() : audio.play();
  isPlaying = !isPlaying;
};

loopBtn.onclick = () => {
  loop = !loop;
  audio.loop = loop;
  loopBtn.innerText = `LOOP: ${loop ? "ON" : "OFF"}`;
};

audio.ontimeupdate = () => {
  if (!audio.duration) return;
  const m = Math.floor(audio.currentTime / 60);
  const s = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
  const tm = Math.floor(audio.duration / 60);
  const ts = Math.floor(audio.duration % 60).toString().padStart(2, "0");
  timeEl.innerText = `${m}:${s} / ${tm}:${ts}`;
  bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
};

audio.onended = () => {
  if (loop) return;
  if (currentSongIndex + 1 < songList.length) playSong(currentSongIndex + 1);
};

function animate(time) {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.001;
  floor.rotation.z += 0.001;

  const verts = floor.geometry.attributes.position.array;
  for (let i = 0; i < verts.length; i += 3) {
    verts[i + 2] = Math.sin(verts[i] + time * 0.002) * Math.cos(verts[i + 1] + time * 0.002) * 0.5;
  }
  floor.geometry.attributes.position.needsUpdate = true;

  if (!audio.paused && lyricIndex < lyrics.length - 1 && audio.currentTime >= lyrics[lyricIndex + 1].time) {
    lyricIndex++;
    lyricEl.innerText = lyrics[lyricIndex].text;
    camera.position.z = 7.5;
  }

  camera.position.z += (8 - camera.position.z) * 0.05;
  renderer.render(scene, camera);
}

animate(0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
