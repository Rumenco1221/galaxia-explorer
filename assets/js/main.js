/* =========================================================
   Galaxia Explorer
   1. Campo de estrellas 3D en canvas con "salto a la luz"
   2. Selector de planetas con ficha de datos
   3. Calculadora de peso según la gravedad de cada planeta
   ========================================================= */

// ---------- 1. Estrellas ----------
const canvas = document.getElementById("estrellas");
const ctx = canvas.getContext("2d");
const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
let estrellas = [];
let velocidad = 1;        // velocidad actual
let velocidadObjetivo = 1; // hacia dónde acelera o frena

function crearEstrella() {
  // x e y van de -1 a 1 alrededor del centro; z es la profundidad
  return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() };
}

function ajustar() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  estrellas = Array.from({ length: 500 }, crearEstrella);
}

function dibujar() {
  // Pintamos un rectángulo semitransparente: así quedan "estelas" al acelerar
  ctx.fillStyle = `rgba(10, 14, 42, ${velocidad > 3 ? 0.25 : 1})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  velocidad += (velocidadObjetivo - velocidad) * 0.05; // suaviza el cambio
  document.getElementById("velocidad").textContent = velocidad.toFixed(1);

  const cx = canvas.width / 2, cy = canvas.height / 2;
  for (const e of estrellas) {
    e.z -= 0.0015 * velocidad;
    if (e.z <= 0.01) Object.assign(e, crearEstrella(), { z: 1 });
    // Proyección en perspectiva: cuanto más cerca (z chico), más lejos del centro
    const px = cx + (e.x / e.z) * cx;
    const py = cy + (e.y / e.z) * cy;
    const r = (1 - e.z) * 2.4;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = e.z < 0.3 ? "#FFE8C2" : "#C9D2FF";
    ctx.fill();
  }
  requestAnimationFrame(dibujar);
}

addEventListener("resize", ajustar);
ajustar();
if (!reducirMovimiento) dibujar();

const warp = document.getElementById("warp");
const acelerar = () => { velocidadObjetivo = 25; warp.classList.add("activo"); };
const frenar = () => { velocidadObjetivo = 1; warp.classList.remove("activo"); };
warp.addEventListener("pointerdown", acelerar);
["pointerup", "pointerleave"].forEach(ev => warp.addEventListener(ev, frenar));
warp.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") acelerar(); });
warp.addEventListener("keyup", frenar);

// ---------- 2. Planetas ----------
const planetas = [
  { nombre: "Mercurio", tam: 26, color: "radial-gradient(circle at 35% 35%, #d8d2c8, #8a8378)", dist: "58 M km", anio: "88 días", lunas: 0, g: 0.38, desc: "El más pequeño y el más cercano al Sol. Sus días son más largos que sus años." },
  { nombre: "Venus", tam: 40, color: "radial-gradient(circle at 35% 35%, #ffe2a8, #d49a3a)", dist: "108 M km", anio: "225 días", lunas: 0, g: 0.91, desc: "El planeta más caliente: su atmósfera atrapa el calor como un invernadero." },
  { nombre: "Tierra", tam: 42, color: "radial-gradient(circle at 35% 35%, #7fd3ff, #1f6fb8 55%, #2e8b57)", dist: "150 M km", anio: "365 días", lunas: 1, g: 1, desc: "Nuestro hogar. El único lugar conocido con vida y agua líquida en la superficie." },
  { nombre: "Marte", tam: 32, color: "radial-gradient(circle at 35% 35%, #ff9b6b, #b8432b)", dist: "228 M km", anio: "687 días", lunas: 2, g: 0.38, desc: "El planeta rojo. Tiene el volcán más alto del sistema solar: el Monte Olimpo." },
  { nombre: "Júpiter", tam: 92, color: "repeating-linear-gradient(170deg, #e8c89a 0 10px, #c48a5a 10px 18px, #f2dcc0 18px 26px)", dist: "778 M km", anio: "12 años", lunas: 95, g: 2.53, desc: "El gigante gaseoso. Su Gran Mancha Roja es una tormenta más grande que la Tierra." },
  { nombre: "Saturno", tam: 80, color: "repeating-linear-gradient(170deg, #f6e2b3 0 9px, #d7b778 9px 16px)", dist: "1.400 M km", anio: "29 años", lunas: 146, g: 1.07, desc: "Famoso por sus anillos de hielo y roca. Es tan liviano que flotaría en agua." },
  { nombre: "Urano", tam: 58, color: "radial-gradient(circle at 35% 35%, #c9fbff, #4fc3d0)", dist: "2.900 M km", anio: "84 años", lunas: 28, g: 0.89, desc: "Gira acostado: su eje está inclinado casi 98 grados." },
  { nombre: "Neptuno", tam: 56, color: "radial-gradient(circle at 35% 35%, #8fa8ff, #2b3fbf)", dist: "4.500 M km", anio: "165 años", lunas: 16, g: 1.14, desc: "El más lejano. Tiene los vientos más rápidos: más de 2.000 km/h." }
];

const orbita = document.getElementById("orbita");
orbita.innerHTML = planetas.map((p, i) =>
  `<button class="planeta" role="option" aria-selected="false" aria-label="${p.nombre}" data-i="${i}" style="--t:${p.tam}px;--fondo:${p.color}"></button>`
).join("");

function mostrarPlaneta(i) {
  const p = planetas[i];
  orbita.querySelectorAll(".planeta").forEach(b => b.setAttribute("aria-selected", b.dataset.i == i));
  const fp = document.getElementById("fichaPlaneta");
  fp.style.background = p.color;
  document.getElementById("fichaNombre").textContent = p.nombre;
  document.getElementById("fichaDesc").textContent = p.desc;
  document.getElementById("fichaDist").textContent = p.dist;
  document.getElementById("fichaAnio").textContent = p.anio;
  document.getElementById("fichaLunas").textContent = p.lunas;
}
orbita.addEventListener("click", e => {
  const b = e.target.closest(".planeta");
  if (b) mostrarPlaneta(b.dataset.i);
});
mostrarPlaneta(2); // empezamos en la Tierra

// ---------- 3. Calculadora de peso ----------
const kg = document.getElementById("kg");
const coloresBorde = ["#9a9488", "#f0b75a", "#2EC4B6", "#e0603e", "#d9a36b", "#e8cf8f", "#6fd6e0", "#5b6fff"];
function calcularPesos() {
  const peso = Number(kg.value);
  document.getElementById("kgValor").textContent = `${peso} kg`;
  document.getElementById("pesos").innerHTML = planetas.map((p, i) =>
    `<li style="--c:${coloresBorde[i]}">${p.nombre}<strong>${(peso * p.g).toFixed(1)} kg</strong></li>`
  ).join("");
}
kg.addEventListener("input", calcularPesos);
calcularPesos();
