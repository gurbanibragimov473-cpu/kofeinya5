(function runSplash() {
  const DRAW_MS = 2800;
  const FLASH_MS = 1000;
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
  const inkCanvas = document.getElementById('splashInk');
  const fxCanvas = document.getElementById('splashCanvas');
  const inkContext = inkCanvas.getContext('2d');
  const fxContext = fxCanvas.getContext('2d');
  const track = splash.querySelector('.splash-track');
  const fill = document.getElementById('splashFill');
  const cup = document.getElementById('splashCup');
  const statusText = document.getElementById('splashText');
  const percentText = document.getElementById('splashPercent');

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const pixelRatio = isTouchDevice ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
  const [boxX, boxY, boxSize] = LOGO.vb;
  const ringRadius = (boxSize - 14) / 2;

  logo.setAttribute('viewBox', LOGO.vb.join(' '));
  logo.innerHTML =
    `<circle class="splash-disc" cx="${boxX + boxSize / 2}" cy="${boxY + boxSize / 2}" r="${ringRadius * 1.02}"/>` +
    `<path class="splash-ink" d="${LOGO.d}"/>`;

  const segments = [];
  let totalLength = 0;
  LOGO.d.split('M').slice(1).forEach((part) => {
    const points = part.replace('Z', '').split('L').map((pair) => pair.split(' ').map(Number));
    points.forEach((from, index) => {
      const to = points[(index + 1) % points.length];
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      if (length === 0) return;
      segments.push({ from, to, start: totalLength, length, isContourStart: index === 0 });
      totalLength += length;
    });
  });

  const sparks = [];
  const trail = [];
  let geometry = null;
  let trackWidth = 0;
  let segmentIndex = 0;
  let lastPoint = null;
  let lastPercent = -1;
  let startTime = null;
  let lastFrame = 0;
  let colored = false;
  let zooming = false;
  let finished = false;

  function resizeCanvases() {
    [inkCanvas, fxCanvas].forEach((canvas) => {
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
    });
    inkContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    fxContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function measure() {
    const rect = logoWrap.getBoundingClientRect();
    const scale = rect.width / boxSize;
    geometry = {
      left: rect.left,
      top: rect.top,
      scale,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      radius: ringRadius * scale
    };
    trackWidth = track.getBoundingClientRect().width;
  }

  const toScreen = (point) => [
    geometry.left + (point[0] - boxX) * geometry.scale,
    geometry.top + (point[1] - boxY) * geometry.scale
  ];

  const easeInOut = (value) => (value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2);

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

  function drawGlow(x, y, radius, bright) {
    const gradient = fxContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.22, bright ? 'rgba(200,225,255,.85)' : 'rgba(255,238,170,.8)');
    gradient.addColorStop(0.55, 'rgba(255,170,70,.35)');
    gradient.addColorStop(1, 'rgba(255,120,20,0)');
    fxContext.fillStyle = gradient;
    fxContext.beginPath();
    fxContext.arc(x, y, radius, 0, Math.PI * 2);
    fxContext.fill();
  }

  function drawPencil(elapsed) {
    const target = Math.min(1, elapsed / DRAW_MS) * totalLength;
    const pending = [];
    while (segmentIndex < segments.length && segments[segmentIndex].start + segments[segmentIndex].length <= target) {
      pending.push(segments[segmentIndex]);
      segmentIndex += 1;
    }

    if (pending.length) {
      [[0, 0, 'rgba(244,238,224,.95)', 1.3], [0.7, 0.5, 'rgba(244,238,224,.4)', 0.7]].forEach(([offsetX, offsetY, color, width]) => {
        inkContext.strokeStyle = color;
        inkContext.lineWidth = width;
        inkContext.lineJoin = 'round';
        inkContext.beginPath();
        let cursor = null;
        pending.forEach((segment) => {
          const [fromX, fromY] = toScreen(segment.from);
          const [toX, toY] = toScreen(segment.to);
          if (segment.isContourStart || cursor === null) inkContext.moveTo(fromX + offsetX, fromY + offsetY);
          inkContext.lineTo(toX + offsetX, toY + offsetY);
          cursor = [toX, toY];
        });
        inkContext.stroke();
      });
    }

    const current = segments[Math.min(segmentIndex, segments.length - 1)];
    const ratio = Math.min(1, Math.max(0, (target - current.start) / current.length));
    return toScreen([
      current.from[0] + (current.to[0] - current.from[0]) * ratio,
      current.from[1] + (current.to[1] - current.from[1]) * ratio
    ]);
  }

  function weldAt(tip, deltaSeconds, now) {
    trail.push({ x: tip[0], y: tip[1], time: now });
    drawGlow(tip[0], tip[1], 26 * (0.85 + Math.random() * 0.3), true);
    drawGlow(tip[0], tip[1], 8, true);
    const count = Math.round(deltaSeconds * 220);
    for (let index = 0; index < count; index += 1) {
      emitSpark(tip[0], tip[1], Math.random() * Math.PI * 2, 60 + Math.random() * 300, 300 + Math.random() * 500, 0.7 + Math.random() * 1.4);
    }
  }

  function drawWeldTrail(now) {
    while (trail.length && now - trail[0].time > 340) trail.shift();
    fxContext.lineCap = 'round';
    for (let index = 1; index < trail.length; index += 1) {
      const from = trail[index - 1];
      const to = trail[index];
      if (Math.hypot(to.x - from.x, to.y - from.y) > 30) continue;
      const heat = Math.max(0, 1 - (now - to.time) / 340);
      fxContext.strokeStyle = `rgba(255,${150 + heat * 100 | 0},${40 + heat * 170 | 0},${heat})`;
      fxContext.lineWidth = 1.2 + heat * 3.2;
      fxContext.beginPath();
      fxContext.moveTo(from.x, from.y);
      fxContext.lineTo(to.x, to.y);
      fxContext.stroke();
    }
  }

  function drawFlashRing(elapsed) {
    const progress = elapsed / FLASH_MS;
    const sweep = easeInOut(progress) * Math.PI;
    const shockAlpha = Math.max(0, 1 - elapsed / 380);
    fxContext.lineCap = 'round';

    if (shockAlpha > 0) {
      fxContext.strokeStyle = `rgba(255,236,170,${shockAlpha})`;
      fxContext.lineWidth = 6;
      fxContext.beginPath();
      fxContext.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, Math.PI * 2);
      fxContext.stroke();
    }

    [1, -1].forEach((direction) => {
      const head = -Math.PI / 2 + direction * sweep;
      for (let step = 0; step < 16; step += 1) {
        const tailAngle = head - direction * step * 0.07;
        fxContext.strokeStyle = `rgba(255,232,150,${Math.pow(1 - step / 16, 2)})`;
        fxContext.lineWidth = 7 * (1 - step / 26);
        fxContext.beginPath();
        fxContext.arc(geometry.centerX, geometry.centerY, geometry.radius, tailAngle - direction * 0.08, tailAngle, direction < 0);
        fxContext.stroke();
      }
      const headX = geometry.centerX + Math.cos(head) * geometry.radius;
      const headY = geometry.centerY + Math.sin(head) * geometry.radius;
      drawGlow(headX, headY, 34, false);
      for (let count = 0; count < 3; count += 1) {
        emitSpark(headX, headY, head + (Math.random() - 0.5) * 1.1, 80 + Math.random() * 260, 500 + Math.random() * 600, 0.8 + Math.random() * 1.6);
      }
    });
  }

  function drawSparks(deltaSeconds) {
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
      fxContext.strokeStyle = `rgba(${red | 0},${green | 0},${blue | 0},${1 - progress * progress})`;
      fxContext.lineWidth = spark.size * (1 - progress * 0.5);
      fxContext.beginPath();
      fxContext.moveTo(spark.previousX, spark.previousY);
      fxContext.lineTo(spark.x, spark.y);
      fxContext.stroke();
    }
  }

  function updateProgress(elapsed) {
    const ratio = Math.min(1, elapsed / (DRAW_MS + FLASH_MS));
    const eased = 1 - Math.pow(1 - ratio, 1.8);
    fill.style.transform = `scaleX(${eased})`;
    cup.style.transform = `translate3d(${eased * trackWidth}px, 0, 0) translateX(-50%)`;
    const percent = Math.round(eased * 100);
    if (percent === lastPercent) return;
    lastPercent = percent;
    percentText.textContent = `${percent}%`;
    statusText.textContent = STATUS_STEPS.filter(([threshold]) => percent >= threshold).pop()[1];
  }

  function startZoom() {
    zooming = true;
    fxCanvas.style.display = 'none';
    inkCanvas.style.display = 'none';
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
    window.dispatchEvent(new Event('splash-finished'));
  }

  function frame(now) {
    if (finished || zooming) return;
    if (startTime === null) {
      startTime = now;
      lastFrame = now;
      measure();
    }
    const elapsed = now - startTime;
    const deltaSeconds = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    fxContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    fxContext.globalCompositeOperation = 'lighter';

    if (elapsed < DRAW_MS) {
      weldAt(drawPencil(elapsed), deltaSeconds, now);
    } else if (!colored) {
      colored = true;
      drawPencil(DRAW_MS);
      logo.classList.add('is-colored');
      inkCanvas.classList.add('is-faded');
    }

    const flashElapsed = elapsed - DRAW_MS;
    if (flashElapsed >= 0 && flashElapsed < FLASH_MS) drawFlashRing(flashElapsed);
    drawWeldTrail(now);
    drawSparks(deltaSeconds);
    updateProgress(elapsed);

    if (flashElapsed >= FLASH_MS) {
      startZoom();
      return;
    }
    requestAnimationFrame(frame);
  }

  resizeCanvases();
  window.addEventListener('resize', () => {
    resizeCanvases();
    if (geometry) measure();
  });
  requestAnimationFrame(frame);
  window.setTimeout(finishSplash, 9000);
}());
