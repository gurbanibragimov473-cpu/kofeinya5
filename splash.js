(function runSplash() {
  const DRAW_MS = 1900;
  const FLASH_MS = 1100;
  const ZOOM_MS = 1250;
  const STATUS_STEPS = [
    [0, 'Загружаем меню и атмосферу...'],
    [35, 'Обжариваем зёрна...'],
    [70, 'Готовим десерты...'],
    [92, 'Добро пожаловать']
  ];

  const splash = document.getElementById('splash');
  const logoWrap = document.getElementById('splashLogoWrap');
  const logo = document.getElementById('splashLogo');
  const canvas = document.getElementById('splashCanvas');
  const context = canvas.getContext('2d');
  const fill = document.getElementById('splashFill');
  const cup = document.getElementById('splashCup');
  const statusText = document.getElementById('splashText');
  const percentText = document.getElementById('splashPercent');

  const [boxX, boxY, boxSize] = LOGO.vb;
  const centerX = boxX + boxSize / 2;
  const centerY = boxY + boxSize / 2;
  const ringRadius = (boxSize - 14) / 2;
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);

  logo.setAttribute('viewBox', LOGO.vb.join(' '));
  logo.innerHTML =
    `<circle class="splash-disc" cx="${centerX}" cy="${centerY}" r="${ringRadius * 1.02}"/>` +
    `<path class="splash-ink" d="${LOGO.d}"/>` +
    `<path class="splash-pencil splash-pencil-soft" pathLength="1" d="${LOGO.d}"/>` +
    `<path class="splash-pencil" pathLength="1" d="${LOGO.d}"/>`;

  const pencilStrokes = Array.from(logo.querySelectorAll('.splash-pencil'));
  const sparks = [];
  let startTime = null;
  let lastFrame = 0;
  let colored = false;
  let zooming = false;
  let finished = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function easeInOut(value) {
    return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
  }

  function emitSpark(x, y, angle, speed, life, size) {
    sparks.push({
      x, y, previousX: x, previousY: y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      age: 0, life, size
    });
  }

  function sparkColor(progress) {
    if (progress < 0.2) return [255, 255, 236];
    if (progress < 0.55) return [255, 214 - (progress - 0.2) * 120, 140 - (progress - 0.2) * 200];
    return [255 - (progress - 0.55) * 200, 150 - (progress - 0.55) * 230, 50];
  }

  function drawGlow(x, y, radius, alpha) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,245,${alpha})`);
    gradient.addColorStop(0.3, `rgba(255,224,140,${alpha * 0.75})`);
    gradient.addColorStop(1, 'rgba(255,140,30,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function drawFlashRing(elapsed) {
    const rect = logoWrap.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const radius = (rect.width / boxSize) * ringRadius;
    const progress = elapsed / FLASH_MS;
    const sweep = easeInOut(progress) * Math.PI;
    const shockAlpha = Math.max(0, 1 - elapsed / 380);

    context.lineCap = 'round';
    if (shockAlpha > 0) {
      context.strokeStyle = `rgba(255,236,170,${shockAlpha})`;
      context.lineWidth = 6;
      context.beginPath();
      context.arc(originX, originY, radius, 0, Math.PI * 2);
      context.stroke();
    }

    [1, -1].forEach((direction) => {
      const head = -Math.PI / 2 + direction * sweep;
      for (let step = 0; step < 26; step += 1) {
        const tailAngle = head - direction * step * 0.05;
        const alpha = Math.pow(1 - step / 26, 2);
        context.strokeStyle = `rgba(255,232,150,${alpha})`;
        context.lineWidth = 7 * (1 - step / 40);
        context.beginPath();
        context.arc(originX, originY, radius, tailAngle - direction * 0.055, tailAngle, direction < 0);
        context.stroke();
      }
      const headX = originX + Math.cos(head) * radius;
      const headY = originY + Math.sin(head) * radius;
      drawGlow(headX, headY, 34, 1);
      for (let count = 0; count < 5; count += 1) {
        const outward = head + (Math.random() - 0.5) * 1.1;
        emitSpark(headX, headY, outward, 80 + Math.random() * 260, 500 + Math.random() * 700, 0.8 + Math.random() * 1.6);
      }
    });
  }

  function drawSparks(deltaSeconds) {
    context.globalCompositeOperation = 'lighter';
    for (let index = sparks.length - 1; index >= 0; index -= 1) {
      const spark = sparks[index];
      spark.age += deltaSeconds * 1000;
      if (spark.age >= spark.life) {
        sparks.splice(index, 1);
        continue;
      }
      const progress = spark.age / spark.life;
      const drag = Math.pow(0.3, deltaSeconds);
      spark.previousX = spark.x;
      spark.previousY = spark.y;
      spark.velocityX *= drag;
      spark.velocityY = spark.velocityY * drag + 240 * deltaSeconds;
      spark.x += spark.velocityX * deltaSeconds;
      spark.y += spark.velocityY * deltaSeconds;
      const [red, green, blue] = sparkColor(progress);
      context.strokeStyle = `rgba(${red | 0},${green | 0},${blue | 0},${1 - progress * progress})`;
      context.lineWidth = spark.size * (1 - progress * 0.5);
      context.beginPath();
      context.moveTo(spark.previousX, spark.previousY);
      context.lineTo(spark.x, spark.y);
      context.stroke();
    }
  }

  function updateProgress(elapsed) {
    const total = DRAW_MS + FLASH_MS;
    const ratio = Math.min(1, elapsed / total);
    const percent = (1 - Math.pow(1 - ratio, 1.8)) * 100;
    fill.style.width = `${percent}%`;
    cup.style.left = `${percent}%`;
    percentText.textContent = `${Math.floor(percent)}%`;
    const step = STATUS_STEPS.filter(([threshold]) => percent >= threshold).pop();
    statusText.textContent = step[1];
  }

  function startZoom() {
    zooming = true;
    logoWrap.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(2.6)', opacity: 1, offset: 0.35 },
        { transform: 'scale(14)', opacity: 1, offset: 0.7 },
        { transform: 'scale(70)', opacity: 0 }
      ],
      { duration: ZOOM_MS, easing: 'cubic-bezier(.7,0,1,.55)', fill: 'forwards' }
    );
    splash.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }],
      { duration: ZOOM_MS, easing: 'ease-in', fill: 'forwards' }
    ).onfinish = finishSplash;
  }

  function finishSplash() {
    if (finished) return;
    finished = true;
    document.body.classList.remove('is-loading');
    splash.remove();
  }

  function frame(now) {
    if (finished) return;
    if (startTime === null) {
      startTime = now;
      lastFrame = now;
    }
    const elapsed = now - startTime;
    const deltaSeconds = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = 'source-over';

    if (elapsed < DRAW_MS) {
      const drawn = Math.pow(elapsed / DRAW_MS, 0.85);
      pencilStrokes[0].style.strokeDashoffset = 1 - Math.max(0, drawn - 0.03);
      pencilStrokes[1].style.strokeDashoffset = 1 - drawn;
    } else if (!colored) {
      colored = true;
      pencilStrokes.forEach((stroke) => { stroke.style.strokeDashoffset = 0; });
      logo.classList.add('is-colored');
    }

    const flashElapsed = elapsed - DRAW_MS;
    if (flashElapsed >= 0 && flashElapsed < FLASH_MS) {
      context.globalCompositeOperation = 'lighter';
      drawFlashRing(flashElapsed);
    }
    drawSparks(deltaSeconds);
    updateProgress(elapsed);

    if (flashElapsed >= FLASH_MS && !zooming) startZoom();
    requestAnimationFrame(frame);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(frame);
  window.setTimeout(finishSplash, 9000);
}());
