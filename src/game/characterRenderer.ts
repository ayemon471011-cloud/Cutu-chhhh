import { RunnerAction, ChaserAction } from '../types/game';

interface DrawRunnerOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  action: RunnerAction;
  animTime: number;
  isInvulnerable?: boolean;
  blushIntensity?: number; // 0 to 1, increases during kiss
}

interface DrawChaserOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  action: ChaserAction;
  animTime: number;
  kissProgress?: number; // 0 to 1 for kiss sequence animation
}

// Helper for drawing cute rounded cartoon strokes
function applyCartoonStroke(ctx: CanvasRenderingContext2D, color = '#2C1E19', width = 3) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

/**
 * Draws the Yellow Runner Character (Duck onesie teddy bear)
 */
export function drawRunner({
  ctx,
  x,
  y,
  action,
  animTime,
  isInvulnerable = false,
  blushIntensity = 0,
}: DrawRunnerOptions) {
  // Invulnerability flashing effect (grace period after hit)
  if (isInvulnerable && Math.floor(animTime * 20) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  // Soft ground shadow (fades when jumping)
  const isJumping = action === 'JUMP' || action === 'FALL';
  const shadowScale = isJumping ? 0.7 : 1;
  const shadowAlpha = isJumping ? 0.18 : 0.28;

  ctx.save();
  ctx.fillStyle = `rgba(100, 70, 60, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 48, 38 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Animation parameters
  let bounceY = 0;
  let bodyAngle = 0;
  let legLeftAngle = 0;
  let legRightAngle = 0;
  let wingAngle = 0;
  let tailWiggle = 0;

  if (action === 'RUN') {
    const runFreq = 14;
    bounceY = Math.abs(Math.sin(animTime * runFreq)) * -7;
    bodyAngle = 0.08 + Math.sin(animTime * runFreq) * 0.04;
    legLeftAngle = Math.sin(animTime * runFreq) * 0.6;
    legRightAngle = -Math.sin(animTime * runFreq) * 0.6;
    wingAngle = -0.2 + Math.sin(animTime * runFreq) * 0.35;
    tailWiggle = Math.sin(animTime * runFreq * 1.5) * 0.15;
  } else if (action === 'SLIDE') {
    bounceY = 16;
    bodyAngle = 0.22;
    wingAngle = -0.6;
    legLeftAngle = 0.8;
    legRightAngle = 0.7;
  } else if (action === 'JUMP') {
    bounceY = -4;
    bodyAngle = -0.06;
    wingAngle = 0.5;
    legLeftAngle = -0.3;
    legRightAngle = 0.2;
  } else if (action === 'FALL') {
    bounceY = 0;
    bodyAngle = 0.06;
    wingAngle = 0.3;
    legLeftAngle = 0.2;
    legRightAngle = -0.2;
  } else if (action === 'HIT') {
    bounceY = Math.sin(animTime * 25) * 4;
    bodyAngle = -0.22;
    wingAngle = 0.6;
    legLeftAngle = 0.4;
    legRightAngle = -0.4;
  } else if (action === 'CAPTURED') {
    bounceY = Math.sin(animTime * 4) * 2;
    bodyAngle = -0.05;
    wingAngle = 0.1;
  } else {
    // IDLE
    bounceY = Math.sin(animTime * 3) * 3;
    tailWiggle = Math.sin(animTime * 3) * 0.08;
  }

  ctx.translate(0, bounceY);
  ctx.rotate(bodyAngle);

  // 1. LEGS / FEET (Teddy bear feet: #A86E4F)
  const drawFoot = (isLeft: boolean, angle: number) => {
    ctx.save();
    const footX = isLeft ? -12 : 12;
    const footY = 36;
    ctx.translate(footX, footY);
    ctx.rotate(angle);

    ctx.fillStyle = '#A56C4C';
    ctx.beginPath();
    ctx.ellipse(0, 5, 8, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    ctx.stroke();
    ctx.restore();
  };

  // Draw back foot first, then body, then front foot
  drawFoot(true, legLeftAngle);

  // 2. DUCK TAIL (left side / back)
  ctx.save();
  ctx.translate(-30, 16);
  ctx.rotate(tailWiggle);
  ctx.fillStyle = '#FFE153';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, -6, -18, -14); // upturned tail feather tip
  ctx.quadraticCurveTo(-8, -10, 0, -6);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  // 3. MAIN DUCK BODY & HOOD (Sunny pastel yellow #FFE153, chubby rounded shape)
  ctx.save();
  ctx.fillStyle = '#FFE153';
  ctx.beginPath();
  // Chubby rounded body path
  ctx.ellipse(0, 8, 36, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.2);
  ctx.stroke();

  // Subtle warm shadow on lower body
  ctx.fillStyle = 'rgba(235, 185, 30, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. TOP DUCK COMB / TUFT (3 orange rounded crest puffs on top #FFA734)
  ctx.save();
  ctx.translate(4, -34);
  ctx.fillStyle = '#FFA734';
  // Central puff
  ctx.beginPath();
  ctx.ellipse(0, -4, 6.5, 8.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  // Left puff
  ctx.beginPath();
  ctx.ellipse(-6, -2, 5, 6.5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  // Right puff
  ctx.beginPath();
  ctx.ellipse(6, -2, 5, 6.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  // 5. BEAR EARS PEEKING THROUGH HOOD SLITS
  // In the reference image, the bear has two brown ears peeking out on top of the face cut-out
  const drawEar = (earX: number, earY: number) => {
    ctx.save();
    ctx.translate(earX, earY);
    ctx.fillStyle = '#A56C4C';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    ctx.stroke();
    // Inner ear shade
    ctx.fillStyle = '#8B5637';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawEar(-16, -15);
  drawEar(16, -15);

  // 6. FACE CUT-OUT (Round warm caramel brown bear face #C99373)
  ctx.save();
  ctx.fillStyle = '#C99373';
  ctx.beginPath();
  ctx.ellipse(2, 4, 25, 23, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // 7. ROSY CHEEKS
  const blushColor = blushIntensity > 0
    ? `rgba(255, 100, 120, ${0.45 + blushIntensity * 0.45})`
    : 'rgba(255, 160, 140, 0.7)';
  const blushRadius = 5.5 + blushIntensity * 2.5;

  ctx.fillStyle = blushColor;
  ctx.beginPath();
  ctx.ellipse(-13, 10, blushRadius, blushRadius * 0.75, 0, 0, Math.PI * 2);
  ctx.ellipse(17, 10, blushRadius, blushRadius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Extra shy blush lines during kiss capture
  if (blushIntensity > 0.3) {
    applyCartoonStroke(ctx, '#E83E63', 1.5);
    // 3 small angled hatch lines on each cheek
    [-15, -13, -11].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(lx - 2, 7);
      ctx.lineTo(lx + 2, 12);
      ctx.stroke();
    });
    [15, 17, 19].forEach((lx) => {
      ctx.beginPath();
      ctx.moveTo(lx - 2, 7);
      ctx.lineTo(lx + 2, 12);
      ctx.stroke();
    });
  }

  // 8. EYES & EYEBROWS
  if (action === 'CAPTURED' || blushIntensity > 0.4) {
    // Shy happy / overwhelmed closed eyes (> < or curved happy arcs)
    applyCartoonStroke(ctx, '#2C1E19', 2.8);
    // Left eye curve
    ctx.beginPath();
    ctx.arc(-8, 3, 5, Math.PI * 0.9, Math.PI * 1.9, false);
    ctx.stroke();
    // Right eye curve
    ctx.beginPath();
    ctx.arc(12, 3, 5, Math.PI * 0.9, Math.PI * 1.9, false);
    ctx.stroke();

    // Cute bashful eyebrows
    ctx.beginPath();
    ctx.moveTo(-13, -8);
    ctx.quadraticCurveTo(-8, -12, -4, -8);
    ctx.moveTo(8, -8);
    ctx.quadraticCurveTo(12, -12, 16, -8);
    ctx.stroke();

    // Shy cute small 'w' mouth
    ctx.beginPath();
    ctx.moveTo(-3, 11);
    ctx.quadraticCurveTo(0, 14, 2, 11);
    ctx.quadraticCurveTo(4, 14, 7, 11);
    ctx.stroke();
  } else if (action === 'HIT') {
    // Dizzy / shocked eyes (spiral or X eyes)
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    // Left eye X
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-5, 6);
    ctx.moveTo(-5, 0);
    ctx.lineTo(-11, 6);
    // Right eye X
    ctx.moveTo(9, 0);
    ctx.lineTo(15, 6);
    ctx.moveTo(15, 0);
    ctx.lineTo(9, 6);
    ctx.stroke();

    // Shocked round 'O' mouth
    ctx.fillStyle = '#2C1E19';
    ctx.beginPath();
    ctx.ellipse(2, 12, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // NORMAL / RUNNING / JUMPING: Worried cute expression from reference!
    // Eyes: round glossy black beads with white sparkle
    const drawEye = (ex: number, ey: number) => {
      ctx.fillStyle = '#2C1E19';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 3.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex - 1.2, ey - 1.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEye(-7, 4);
    drawEye(13, 4);

    // Worried curved downwards eyebrows from reference (anxious cute runaway)
    applyCartoonStroke(ctx, '#2C1E19', 2.2);
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.quadraticCurveTo(-7, -8, -3, -4); // Left brow
    ctx.moveTo(9, -4);
    ctx.quadraticCurveTo(13, -8, 18, -5); // Right brow
    ctx.stroke();

    // Cute small '3' mouth (teddy bear snout)
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.quadraticCurveTo(3, 11.5, 5, 9);
    ctx.quadraticCurveTo(7, 11.5, 10, 9);
    ctx.stroke();
  }

  // 9. SWEAT DROPLETS (Flying off head when desperately running)
  if (action === 'RUN' || action === 'SLIDE') {
    const sweatPhase = (animTime * 6) % 1;
    ctx.save();
    ctx.fillStyle = '#7AC9ED';
    ctx.strokeStyle = '#2C1E19';
    ctx.lineWidth = 1.2;

    const drawSweat = (sx: number, sy: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy - size);
      ctx.quadraticCurveTo(sx + size, sy, sx, sy + size);
      ctx.quadraticCurveTo(sx - size, sy, sx, sy - size);
      ctx.fill();
      ctx.stroke();
    };

    drawSweat(27 + sweatPhase * 8, -4 - sweatPhase * 5, 3.2);
    drawSweat(31 + sweatPhase * 6, 8 - sweatPhase * 4, 2.5);
    ctx.restore();
  }

  ctx.restore(); // restore face

  // 10. DUCK WING (Flapping on side)
  ctx.save();
  ctx.translate(6, 12);
  ctx.rotate(wingAngle);
  ctx.fillStyle = '#FFE153';
  ctx.beginPath();
  // Cute 'C' shaped duck wing
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(16, 2, 14, 16);
  ctx.quadraticCurveTo(4, 18, 0, 8);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  // Front foot
  drawFoot(false, legRightAngle);

  ctx.restore();
}

/**
 * Draws the White Chaser Character (White Cutu with brown bear hood & forehead ornament)
 */
export function drawChaser({
  ctx,
  x,
  y,
  action,
  animTime,
  kissProgress = 0,
}: DrawChaserOptions) {
  ctx.save();
  ctx.translate(x, y);

  // Soft ground shadow
  const isJumping = action === 'JUMP';
  const shadowScale = isJumping ? 0.75 : 1;
  const shadowAlpha = isJumping ? 0.2 : 0.3;

  ctx.save();
  ctx.fillStyle = `rgba(100, 70, 60, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 48, 42 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Animation parameters
  let bounceY = 0;
  let bodyAngle = 0;
  let legLeftAngle = 0;
  let legRightAngle = 0;
  let armAngle = 0;

  if (action === 'RUN') {
    const runFreq = 14;
    bounceY = Math.abs(Math.sin(animTime * runFreq + 0.5)) * -7;
    bodyAngle = 0.12 + Math.sin(animTime * runFreq) * 0.04;
    legLeftAngle = Math.sin(animTime * runFreq + Math.PI) * 0.65;
    legRightAngle = -Math.sin(animTime * runFreq + Math.PI) * 0.65;
    armAngle = Math.sin(animTime * runFreq) * 0.4;
  } else if (action === 'KISS' || action === 'CATCH') {
    // Leaning in affectionately toward the yellow cutu!
    bounceY = Math.sin(animTime * 12) * 2.5; // gentle rhythmic smooch bobbing
    bodyAngle = 0.14 + Math.sin(animTime * 12) * 0.05;
    armAngle = 0.5; // embracing arms
  } else {
    // IDLE
    bounceY = Math.sin(animTime * 3) * 3;
    bodyAngle = 0.02;
  }

  ctx.translate(0, bounceY);
  ctx.rotate(bodyAngle);

  // 1. LEGS / BOOTS (Dark chocolate little boots #5A3832)
  const drawFoot = (isLeft: boolean, angle: number) => {
    ctx.save();
    const footX = isLeft ? -14 : 14;
    const footY = 38;
    ctx.translate(footX, footY);
    ctx.rotate(angle);

    ctx.fillStyle = '#5A3832';
    ctx.beginPath();
    ctx.ellipse(0, 4, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    ctx.stroke();
    ctx.restore();
  };

  drawFoot(true, legLeftAngle);

  // 2. WHITE DRESS / BODY TUNIC (#FFFFFF with warm chocolate outline)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Cute flared tunic dress
  ctx.moveTo(-16, 10);
  ctx.quadraticCurveTo(-26, 36, -22, 40);
  ctx.lineTo(24, 40);
  ctx.quadraticCurveTo(28, 36, 18, 10);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.0);
  ctx.stroke();
  ctx.restore();

  // 3. BROWN BEAR-LIKE HOOD & EARS (#9E6760)
  ctx.save();
  ctx.fillStyle = '#9E6760';

  // Bear Ears on top of hood
  const drawHoodEar = (earX: number, earY: number) => {
    ctx.save();
    ctx.translate(earX, earY);
    ctx.fillStyle = '#9E6760';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.8);
    ctx.stroke();
    // Inner ear shade
    ctx.fillStyle = '#834F49';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawHoodEar(-22, -26);
  drawHoodEar(18, -26);

  // Main Hood dome covering head and sides
  ctx.beginPath();
  ctx.ellipse(0, -6, 37, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.2);
  ctx.stroke();
  ctx.restore();

  // 4. WHITE FACE CUT-OUT (#FFFFFF)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Friendly rounded face window with cute scalloped cheeks
  ctx.ellipse(0, 2, 28, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // 5. FOREHEAD GOLD ORNAMENT (#FFD23F)
  // Yellow diamond/shield crest on forehead from reference image
  ctx.save();
  ctx.translate(-1, -19);
  ctx.fillStyle = '#FFD23F';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.quadraticCurveTo(8, -6, 9, 0);
  ctx.quadraticCurveTo(0, 7, 0, 8);
  ctx.quadraticCurveTo(0, 7, -9, 0);
  ctx.quadraticCurveTo(-8, -6, 0, -8);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.4);
  ctx.stroke();
  // Small center shine
  ctx.fillStyle = '#FFF5A5';
  ctx.beginPath();
  ctx.arc(0, -1, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. BROWN NECK RIBBON / COLLAR (#5A3832)
  ctx.save();
  ctx.translate(0, 25);
  ctx.fillStyle = '#5A3832';
  // Collar knot
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.2);
  ctx.stroke();
  // Collar ribbons
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.lineTo(-7, 10);
  ctx.moveTo(3, 2);
  ctx.lineTo(7, 10);
  ctx.stroke();
  ctx.restore();

  // 7. ROSY BLUSH CHEEKS (#FFAAA6)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 170, 166, 0.85)';
  ctx.beginPath();
  ctx.ellipse(-16, 7, 6.5, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(16, 7, 6.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 8. EYES & EXPRESSION
  if (action === 'KISS') {
    // Affectionate happy kissing face!
    applyCartoonStroke(ctx, '#2C1E19', 2.8);
    // Closed happy crescent eyes (^ ^)
    ctx.beginPath();
    ctx.arc(-8, 1, 5, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, 1, 5, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.stroke();

    // Cute raised happy brows
    ctx.beginPath();
    ctx.moveTo(-13, -7);
    ctx.quadraticCurveTo(-8, -11, -3, -7);
    ctx.moveTo(5, -7);
    ctx.quadraticCurveTo(10, -11, 15, -7);
    ctx.stroke();

    // Pouting / smooching kiss lips pointing forward!
    const smoochOffset = Math.sin(animTime * 12) * 3;
    ctx.fillStyle = '#FF5277';
    ctx.beginPath();
    ctx.ellipse(12 + smoochOffset, 7, 5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.2);
    ctx.stroke();
  } else {
    // DETERMINED ADORABLE CHASER FACE from reference image!
    // Eyes: round dark cartoon dots with shiny reflection
    const drawChaserEye = (ex: number, ey: number) => {
      ctx.fillStyle = '#2C1E19';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 3.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex + 1.2, ey - 1.2, 1.4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawChaserEye(-8, 2);
    drawChaserEye(10, 2);

    // Determined inward slanting eyebrows from reference (\ /)
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(-4, -8); // Left brow angling down towards center
    ctx.moveTo(16, -4);
    ctx.lineTo(6, -8); // Right brow angling down towards center
    ctx.stroke();

    // Open happy smiling mouth with cute tongue inside! (#E05A6F)
    ctx.save();
    ctx.fillStyle = '#E05A6F';
    ctx.beginPath();
    ctx.ellipse(1, 9, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.2);
    ctx.stroke();

    // Little pink tongue
    ctx.fillStyle = '#FFAAA6';
    ctx.beginPath();
    ctx.ellipse(1, 11, 3.2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore(); // face restore

  // 9. WINGS / ARMS (White scalloped wings pumping or embracing)
  ctx.save();
  ctx.translate(14, 16);
  ctx.rotate(armAngle);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Scalloped wing with feathered edge
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(18, 2, 22, 10);
  // Scallops
  ctx.quadraticCurveTo(24, 16, 18, 18);
  ctx.quadraticCurveTo(12, 20, 6, 14);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Subtle wing feather crease lines
  applyCartoonStroke(ctx, '#2C1E19', 1.8);
  ctx.beginPath();
  ctx.moveTo(12, 8);
  ctx.lineTo(18, 14);
  ctx.stroke();
  ctx.restore();

  // Back arm / wing
  ctx.save();
  ctx.translate(-14, 16);
  ctx.rotate(-armAngle * 0.8);
  ctx.fillStyle = '#F2F2F2';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, 2, -18, 10);
  ctx.quadraticCurveTo(-18, 16, -12, 16);
  ctx.quadraticCurveTo(-6, 16, 0, 10);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  // Front foot
  drawFoot(false, legRightAngle);

  ctx.restore();
}

/**
 * Draws the Iconic Caught & Spanking Animation from beat.webp!
 * White Cutu (Bubu) sits on Brown Bear's (Dudu) back and playfully spanks its bum ("打屁屁")
 */
export function drawCaughtBeatAnimation({
  ctx,
  x,
  y,
  animTime,
  beatTimer,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  animTime: number;
  beatTimer: number;
}) {
  ctx.save();
  ctx.translate(x, y);

  // Spank cycle frequency (~4.8 pats per second)
  const spankFreq = 15;
  const spankCycle = (beatTimer * spankFreq) % (Math.PI * 2);

  // Arm position: swings up (-0.85 rad) and whips down (+0.6 rad)
  const armSwing = Math.sin(spankCycle);
  const isImpact = armSwing > 0.45; // Contact frame with bum
  const buttSquash = isImpact ? 8.5 : Math.max(0, -armSwing) * 3;
  const bodySquishX = isImpact ? 1.06 : 1.0;

  // 1. SOFT GROUND SHADOW
  ctx.save();
  ctx.fillStyle = 'rgba(90, 65, 55, 0.28)';
  ctx.beginPath();
  ctx.ellipse(4, 38, 75 * bodySquishX, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. THE CHINESE TEXT "打屁屁" (VERTICAL ON THE LEFT FROM beat.webp)
  ctx.save();
  const textBounce = Math.sin(spankCycle) * 2.5;
  ctx.translate(-95, -12 + textBounce);

  ctx.font = '900 28px "Fredoka", "Nunito", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = ['打', '屁', '屁'];
  const charSpacing = 32;

  chars.forEach((ch, idx) => {
    const cy = idx * charSpacing;
    const charAngle = idx === 0 ? -0.06 : idx === 1 ? 0.04 : -0.04;

    ctx.save();
    ctx.translate(0, cy);
    ctx.rotate(charAngle);

    // Thick white bubble outline
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 9;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(ch, 0, 0);

    // Dark crisp text fill from image
    ctx.fillStyle = '#2C1E19';
    ctx.fillText(ch, 0, 0);

    ctx.restore();
  });
  ctx.restore();

  // 3. THE BROWN BEAR (Dudu - Lying flat on tummy)
  ctx.save();
  ctx.translate(6, 4);

  // Bear back foot flopped on floor
  ctx.save();
  ctx.translate(-50, 26);
  ctx.fillStyle = '#A56C4C';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 6.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  // Bear little tail at rear left
  ctx.save();
  ctx.translate(-54, 8 - buttSquash * 0.4);
  ctx.fillStyle = '#A56C4C';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  // Main Brown Bear Body (Lying horizontally, bum on left, head on right)
  ctx.save();
  ctx.fillStyle = '#C28B6A';

  // Body path with dynamic butt squashing
  ctx.beginPath();
  // Start from back rear / buttock
  const buttTopY = 2 + buttSquash;
  ctx.moveTo(-50, 16);
  ctx.quadraticCurveTo(-52, buttTopY, -34, buttTopY - 2); // rounded buttock
  ctx.quadraticCurveTo(-14, buttTopY + 2, 8, 8); // back where white cutu sits
  ctx.quadraticCurveTo(28, 6, 48, 12); // neck/shoulder
  // Right side of face / cheek resting on floor
  ctx.quadraticCurveTo(66, 16, 62, 30);
  ctx.quadraticCurveTo(52, 38, 20, 36); // front underbelly
  ctx.quadraticCurveTo(-20, 36, -46, 32); // rear belly
  ctx.quadraticCurveTo(-54, 28, -50, 16);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.2);
  ctx.stroke();

  // Subtle warm shadow under belly
  ctx.fillStyle = 'rgba(140, 85, 55, 0.2)';
  ctx.beginPath();
  ctx.ellipse(2, 32, 42, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front paw tucked under head/chin
  ctx.save();
  ctx.translate(44, 30);
  ctx.fillStyle = '#A56C4C';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 6.5, 0.15, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();
  ctx.restore();

  // Brown Bear Ears
  // Left ear (peeking top)
  ctx.save();
  ctx.translate(28, 4);
  ctx.fillStyle = '#8C5535';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 7.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();
  ctx.fillStyle = '#683921';
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.5, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right ear (prominent top ear)
  ctx.save();
  ctx.translate(48, 2);
  ctx.fillStyle = '#8C5535';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 8, 0.25, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.fillStyle = '#683921';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4.5, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Chubby peach cheeks resting on floor
  ctx.save();
  ctx.fillStyle = '#FFA680';
  ctx.beginPath();
  ctx.ellipse(36, 26, 7.5, 5.5, 0, 0, Math.PI * 2);
  ctx.ellipse(54, 25, 6.5, 5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cute squished eyes (> < from beat.webp!)
  ctx.save();
  applyCartoonStroke(ctx, '#2C1E19', 2.6);

  // Left eye (>)
  ctx.beginPath();
  ctx.moveTo(33, 17);
  ctx.lineTo(39, 20);
  ctx.lineTo(33, 23);
  ctx.stroke();

  // Right eye (<)
  ctx.beginPath();
  ctx.moveTo(53, 17);
  ctx.lineTo(47, 20);
  ctx.lineTo(53, 23);
  ctx.stroke();

  // Cute bear snout & mouth (tiny nose dot and 'w' mouth)
  ctx.beginPath();
  ctx.moveTo(40, 24);
  ctx.quadraticCurveTo(42.5, 26, 44, 24.5);
  ctx.quadraticCurveTo(45.5, 26, 47, 24);
  ctx.stroke();

  // Worried curved sweat drop marks above brows from beat.webp
  applyCartoonStroke(ctx, '#2C1E19', 2.0);
  ctx.beginPath();
  ctx.moveTo(35, 11);
  ctx.quadraticCurveTo(37, 8, 39, 10);
  ctx.moveTo(48, 10);
  ctx.quadraticCurveTo(50, 7, 52, 9);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end Brown Bear

  // 4. THE WHITE CUTU (Bubu - Sitting on Bear's back)
  ctx.save();
  const bubuBob = isImpact ? 2 : -Math.max(0, -armSwing) * 2;
  ctx.translate(-8, -26 + bubuBob);

  // White Cutu Body / Dress
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 16, 24, 18, 0.05, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  // Left Paw resting on brown bear's back for support (from beat.webp!)
  ctx.save();
  ctx.translate(16, 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.5, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();
  // Crease on paw
  applyCartoonStroke(ctx, '#2C1E19', 1.8);
  ctx.beginPath();
  ctx.moveTo(-2, 2);
  ctx.lineTo(3, 4);
  ctx.stroke();
  ctx.restore();

  // White Cutu Ears (Panda / Bear black/brown ears from beat.webp)
  // Left ear
  ctx.save();
  ctx.translate(-18, -22);
  ctx.fillStyle = '#2B211E';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  // Right ear
  ctx.save();
  ctx.translate(18, -22);
  ctx.fillStyle = '#2B211E';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.5, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  // White Cutu Round Head
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, -2, 28, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.2);
  ctx.stroke();

  // Forehead Gold Ornament (Preserving character emblem)
  ctx.save();
  ctx.translate(0, -18);
  ctx.fillStyle = '#FFD23F';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(6, -4, 7, 0);
  ctx.quadraticCurveTo(0, 6, 0, 7);
  ctx.quadraticCurveTo(0, 6, -7, 0);
  ctx.quadraticCurveTo(-6, -4, 0, -6);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.2);
  ctx.stroke();
  ctx.restore();

  // Rosy Pink Cheeks
  ctx.fillStyle = '#FFAAA6';
  ctx.beginPath();
  ctx.ellipse(-15, 4, 6.5, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(15, 4, 6.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Determined Angled Eyebrows (\ / from beat.webp!)
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.beginPath();
  ctx.moveTo(-13, -6);
  ctx.lineTo(-4, -10); // slant inward down
  ctx.moveTo(13, -6);
  ctx.lineTo(4, -10); // slant inward down
  ctx.stroke();

  // Black Dot Eyes with Highlights
  const drawBubuEye = (ex: number, ey: number) => {
    ctx.fillStyle = '#2C1E19';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.8, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1, ey - 1.2, 1.3, 0, Math.PI * 2);
    ctx.fill();
  };
  drawBubuEye(-8, 0);
  drawBubuEye(8, 0);

  // Cute Small 'w' / '3' Mouth
  applyCartoonStroke(ctx, '#2C1E19', 2.2);
  ctx.beginPath();
  ctx.moveTo(-3, 6);
  ctx.quadraticCurveTo(-0.5, 8.5, 1, 6.5);
  ctx.quadraticCurveTo(2.5, 8.5, 5, 6);
  ctx.stroke();

  // Dark Ribbon Collar / Tie under chin
  ctx.fillStyle = '#2B211E';
  ctx.beginPath();
  ctx.ellipse(0, 16, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. THE SPANKING RIGHT ARM (Animated swinging down onto the bum!)
  ctx.save();
  ctx.translate(-14, 12); // right shoulder anchor

  // Calculate arm angle: swings up high, then snaps down onto butt!
  const armAngle = isImpact ? 0.72 : -0.75 + Math.sin(spankCycle) * 0.45;
  ctx.rotate(armAngle);

  // Arm swing speed motion arcs when whipping down
  if (armSwing > 0.1 && armSwing < 0.6) {
    ctx.save();
    applyCartoonStroke(ctx, 'rgba(200, 190, 180, 0.6)', 2);
    ctx.beginPath();
    ctx.arc(-14, -6, 22, -0.6, 0.4, false);
    ctx.stroke();
    ctx.restore();
  }

  // White arm paw
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-12, 6, -16, 18);
  ctx.quadraticCurveTo(-14, 24, -4, 22);
  ctx.quadraticCurveTo(4, 16, 2, 4);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Paw pads / fingers
  applyCartoonStroke(ctx, '#2C1E19', 1.8);
  ctx.beginPath();
  ctx.moveTo(-12, 18);
  ctx.lineTo(-7, 21);
  ctx.stroke();

  ctx.restore(); // end spanking arm

  ctx.restore(); // end White Cutu

  // 6. IMPACT STARBURST & SHOCKWAVE ON THE BUTT (When isImpact is true!)
  if (isImpact) {
    ctx.save();
    ctx.translate(-26, 8); // contact point on bear's butt

    // Bright cartoon impact star
    ctx.fillStyle = '#FFD23F';
    ctx.beginPath();
    const numPoints = 8;
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? 16 : 7;
      const angle = (i * Math.PI) / numPoints;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.0);
    ctx.stroke();

    // Inner bright white flash
    ctx.fillStyle = '#FFF8BA';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Motion shockwave tick lines around impact
    applyCartoonStroke(ctx, '#2C1E19', 2.2);
    [
      { x1: -18, y1: -10, x2: -24, y2: -14 },
      { x1: -8, y1: -20, x2: -12, y2: -28 },
      { x1: -20, y1: 8, x2: -27, y2: 12 },
    ].forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the Original Signature Romantic Kiss Animation!
 * Perfectly placed and aligned so White Cutu hugs Yellow Cutu and kisses its rosy cheek!
 */
export function drawOriginalKissAnimation({
  ctx,
  x,
  y,
  animTime,
  kissTimer,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  animTime: number;
  kissTimer: number;
}) {
  ctx.save();
  ctx.translate(x, y);

  // Soft combined ground shadow
  ctx.save();
  ctx.fillStyle = 'rgba(100, 70, 60, 0.28)';
  ctx.beginPath();
  ctx.ellipse(-2, 48, 62, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Gentle rhythmic smooch & breathing bounce
  const kissBounce = Math.sin(animTime * 10) * 2;
  const smoochLeaning = Math.sin(animTime * 10) * 3.5;
  const blushIntensity = Math.min(1, kissTimer / 1.2);

  // 1. YELLOW RUNNER (Duck onesie teddy bear) placed on the right side (x: +10)
  ctx.save();
  ctx.translate(12, kissBounce);

  // Back foot
  ctx.save();
  ctx.translate(14, 38);
  ctx.fillStyle = '#A56C4C';
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  // Duck Tail at back
  ctx.save();
  ctx.translate(28, 14);
  ctx.rotate(0.2);
  ctx.fillStyle = '#FFE153';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(12, -4, 16, -12);
  ctx.quadraticCurveTo(8, -8, 0, -4);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  // Yellow Duck Body
  ctx.fillStyle = '#FFE153';
  ctx.beginPath();
  ctx.ellipse(0, 8, 35, 38, 0.05, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.0);
  ctx.stroke();

  // Duck top crest tuft
  ctx.save();
  ctx.translate(4, -34);
  ctx.fillStyle = '#FFA734';
  ctx.beginPath();
  ctx.ellipse(0, -4, 6, 8, 0.1, 0, Math.PI * 2);
  ctx.ellipse(-6, -2, 5, 6, -0.3, 0, Math.PI * 2);
  ctx.ellipse(6, -2, 5, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  // Bear ears through hood
  [-15, 15].forEach((ex) => {
    ctx.save();
    ctx.translate(ex, -15);
    ctx.fillStyle = '#A56C4C';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    ctx.stroke();
    ctx.restore();
  });

  // Face window (Caramel Brown Bear)
  ctx.save();
  ctx.fillStyle = '#C99373';
  ctx.beginPath();
  ctx.ellipse(0, 4, 24, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Glowing rosy cheeks
  const cheekRadius = 6.5 + blushIntensity * 2;
  ctx.fillStyle = `rgba(255, 95, 125, ${0.65 + blushIntensity * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(-14, 10, cheekRadius, cheekRadius * 0.75, 0, 0, Math.PI * 2);
  ctx.ellipse(15, 10, cheekRadius, cheekRadius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shy blush hatch lines
  applyCartoonStroke(ctx, '#E83E63', 1.5);
  [-16, -14, -12].forEach((lx) => {
    ctx.beginPath();
    ctx.moveTo(lx - 2, 7);
    ctx.lineTo(lx + 2, 12);
    ctx.stroke();
  });
  [13, 15, 17].forEach((lx) => {
    ctx.beginPath();
    ctx.moveTo(lx - 2, 7);
    ctx.lineTo(lx + 2, 12);
    ctx.stroke();
  });

  // Shy, happy bashful crescent eyes (^ ^)
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.beginPath();
  ctx.arc(-8, 3, 5, Math.PI * 1.05, Math.PI * 1.95, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(12, 3, 5, Math.PI * 1.05, Math.PI * 1.95, false);
  ctx.stroke();

  // Shy cute bashful brows
  ctx.beginPath();
  ctx.moveTo(-13, -7);
  ctx.quadraticCurveTo(-8, -11, -4, -7);
  ctx.moveTo(8, -7);
  ctx.quadraticCurveTo(12, -11, 16, -7);
  ctx.stroke();

  // Bashful cute wavy 'w' smile
  ctx.beginPath();
  ctx.moveTo(-3, 11);
  ctx.quadraticCurveTo(0, 14, 2, 11);
  ctx.quadraticCurveTo(4, 14, 7, 11);
  ctx.stroke();

  ctx.restore(); // face end

  // Yellow Duck wing resting shyly on tummy
  ctx.save();
  ctx.translate(8, 14);
  ctx.fillStyle = '#FFE153';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, 2, 12, 15);
  ctx.quadraticCurveTo(4, 16, 0, 6);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();
  ctx.restore();

  // Front foot
  ctx.save();
  ctx.translate(-6, 38);
  ctx.fillStyle = '#A56C4C';
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // Yellow Runner end

  // 2. WHITE CHASER (White cutu in brown hood) placed snugly at (x: -16)
  // Perfectly positioned so its puckered kiss lips touch Yellow Cutu's cheek!
  ctx.save();
  ctx.translate(-18 + smoochLeaning * 0.4, kissBounce);

  // Little brown boots
  [-12, 10].forEach((bx) => {
    ctx.save();
    ctx.translate(bx, 38);
    ctx.fillStyle = '#5A3832';
    ctx.beginPath();
    ctx.ellipse(0, 4, 8.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.5);
    ctx.stroke();
    ctx.restore();
  });

  // White Dress / Body
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.quadraticCurveTo(-24, 36, -20, 40);
  ctx.lineTo(20, 40);
  ctx.quadraticCurveTo(24, 36, 16, 10);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.0);
  ctx.stroke();
  ctx.restore();

  // Brown Bear Hood & Ears
  ctx.save();
  ctx.fillStyle = '#9E6760';
  // Hood Ears
  [-20, 18].forEach((hx) => {
    ctx.save();
    ctx.translate(hx, -26);
    ctx.fillStyle = '#9E6760';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    applyCartoonStroke(ctx, '#2C1E19', 2.6);
    ctx.stroke();
    ctx.fillStyle = '#834F49';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Hood dome
  ctx.beginPath();
  ctx.ellipse(0, -6, 36, 33, 0.08, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 3.2);
  ctx.stroke();
  ctx.restore();

  // White Face cut-out
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 2, 27, 23, 0.08, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Gold Forehead Ornament
  ctx.save();
  ctx.translate(0, -18);
  ctx.fillStyle = '#FFD23F';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.quadraticCurveTo(7, -5, 8, 0);
  ctx.quadraticCurveTo(0, 6, 0, 7);
  ctx.quadraticCurveTo(0, 6, -8, 0);
  ctx.quadraticCurveTo(-7, -5, 0, -7);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.2);
  ctx.stroke();
  ctx.restore();

  // Dark ribbon tie under chin
  ctx.fillStyle = '#5A3832';
  ctx.beginPath();
  ctx.arc(0, 25, 4, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(255, 170, 166, 0.85)';
  ctx.beginPath();
  ctx.ellipse(-14, 7, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(14, 7, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Happy kissing crescent eyes (^ ^)
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.beginPath();
  ctx.arc(-8, 1, 5, Math.PI * 1.05, Math.PI * 1.95, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(10, 1, 5, Math.PI * 1.05, Math.PI * 1.95, false);
  ctx.stroke();

  // Cute happy raised brows
  ctx.beginPath();
  ctx.moveTo(-13, -7);
  ctx.quadraticCurveTo(-8, -11, -3, -7);
  ctx.moveTo(5, -7);
  ctx.quadraticCurveTo(10, -11, 15, -7);
  ctx.stroke();

  // Cute puckered kiss lips leaning right onto Yellow Cutu's cheek!
  ctx.fillStyle = '#FF4D79';
  ctx.beginPath();
  ctx.ellipse(17 + smoochLeaning, 8, 5.5, 4, 0.15, 0, Math.PI * 2);
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.2);
  ctx.stroke();

  ctx.restore(); // face end

  // White Embracing Wings/Arms wrapped around Yellow Cutu in a snug hug!
  // Front wing reaching around Yellow Cutu's body
  ctx.save();
  ctx.translate(8, 14);
  ctx.rotate(0.25 + smoochLeaning * 0.05);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(24, 2, 32, 10);
  ctx.quadraticCurveTo(34, 18, 26, 20);
  ctx.quadraticCurveTo(16, 22, 6, 12);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // White Chaser end

  // 3. BURSTING HEART PARTICLES & SPARKLES AT THE CHEEK CONTACT POINT!
  const kissPointX = 4 + smoochLeaning;
  const kissPointY = 6;
  const heartScale = 0.8 + Math.sin(animTime * 12) * 0.25;

  ctx.save();
  ctx.translate(kissPointX, kissPointY - 18);
  ctx.scale(heartScale, heartScale);
  ctx.fillStyle = '#FF2E63';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(0, -3, -10, -7, -10, 1);
  ctx.bezierCurveTo(-10, 8, 0, 14, 0, 17);
  ctx.bezierCurveTo(0, 14, 10, 8, 10, 1);
  ctx.bezierCurveTo(10, -7, 0, -3, 0, 4);
  ctx.closePath();
  ctx.fill();
  applyCartoonStroke(ctx, '#2C1E19', 1.8);
  ctx.stroke();
  ctx.restore();

  // Sparkles around the kiss
  ctx.fillStyle = '#FFE259';
  [
    { sx: -10, sy: -22, r: 3 },
    { sx: 18, sy: -26, r: 3.5 },
    { sx: 26, sy: -8, r: 2.5 },
  ].forEach((sp) => {
    ctx.beginPath();
    ctx.arc(sp.sx, sp.sy, sp.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}


