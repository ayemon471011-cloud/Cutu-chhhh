import { Obstacle, ObstacleType, Rect } from '../types/game';
import { GROUND_Y } from './constants';

function applyStroke(ctx: CanvasRenderingContext2D, color = '#2C1E19', width = 2.5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, animTime: number) {
  ctx.save();
  ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);

  // Soft shadow on ground if on ground or low flying
  if (!obs.isOverhead) {
    const distToGround = Math.max(0, (GROUND_Y - (obs.y + obs.height)));
    const shadowAlpha = Math.max(0.08, 0.28 - distToGround * 0.001);
    const shadowW = obs.width * 0.45;

    ctx.save();
    ctx.translate(0, (obs.height / 2) + distToGround);
    ctx.fillStyle = `rgba(80, 60, 50, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowW, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Apply rotation
  ctx.rotate(obs.rotation);

  switch (obs.type) {
    case 'carrot_ground':
      drawCarrot(ctx, false, animTime);
      break;

    case 'carrot_flying':
      drawCarrot(ctx, true, animTime);
      break;

    case 'pumpkin_roll':
      drawPumpkin(ctx, animTime);
      break;

    case 'broccoli_bounce':
      drawBroccoli(ctx, obs.bounceOffset);
      break;

    case 'tomato_spin':
      drawTomato(ctx);
      break;

    case 'cucumber_ground':
      drawCucumber(ctx, false);
      break;

    case 'cucumber_flying':
      drawCucumber(ctx, true);
      break;

    case 'eggplant_ground':
      drawEggplant(ctx);
      break;

    case 'overhead_basket':
      drawOverheadBasket(ctx, animTime);
      break;
  }

  ctx.restore();
}

function drawCarrot(ctx: CanvasRenderingContext2D, isFlying: boolean, animTime: number) {
  // Leaf top
  ctx.save();
  ctx.translate(0, -18);
  if (isFlying) {
    // Spinning leaf propeller!
    const propSpin = animTime * 20;
    ctx.rotate(propSpin);
    ctx.fillStyle = '#65B849';
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, -9, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      applyStroke(ctx, '#2C1E19', 2);
      ctx.stroke();
    }
  } else {
    // Bushy cartoon leaves
    ctx.fillStyle = '#65B849';
    [-8, 0, 8].forEach((lx, i) => {
      ctx.beginPath();
      ctx.ellipse(lx, -6 + Math.abs(lx) * 0.4, 4, 9, (i - 1) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      applyStroke(ctx, '#2C1E19', 2);
      ctx.stroke();
    });
  }
  ctx.restore();

  // Orange carrot body
  ctx.fillStyle = '#FF7A29';
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.quadraticCurveTo(0, -16, 14, -14);
  ctx.quadraticCurveTo(12, 6, 2, 22);
  ctx.quadraticCurveTo(0, 24, -2, 22);
  ctx.quadraticCurveTo(-12, 6, -14, -14);
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();

  // Carrot texture ridges
  applyStroke(ctx, '#E65D15', 2);
  [-6, 2, 10].forEach((ry) => {
    ctx.beginPath();
    ctx.moveTo(-8, ry);
    ctx.lineTo(2, ry - 1);
    ctx.moveTo(3, ry + 2);
    ctx.lineTo(8, ry + 1);
    ctx.stroke();
  });

  // Cute face on vegetable!
  drawCuteVeggieFace(ctx, 0, -2);
}

function drawPumpkin(ctx: CanvasRenderingContext2D, animTime: number) {
  // Stem
  ctx.save();
  ctx.fillStyle = '#5A8F35';
  ctx.beginPath();
  ctx.moveTo(-3, -20);
  ctx.quadraticCurveTo(4, -26, 6, -28);
  ctx.lineTo(8, -26);
  ctx.quadraticCurveTo(2, -22, 3, -19);
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2);
  ctx.stroke();
  ctx.restore();

  // Pumpkin lobes
  ctx.fillStyle = '#FFA126';
  // Left lobe
  ctx.beginPath();
  ctx.ellipse(-14, 0, 12, 19, -0.15, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.4);
  ctx.stroke();

  // Right lobe
  ctx.beginPath();
  ctx.ellipse(14, 0, 12, 19, 0.15, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.4);
  ctx.stroke();

  // Center lobe
  ctx.fillStyle = '#FFB23E';
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 20.5, 0, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();

  drawCuteVeggieFace(ctx, 0, 1);
}

function drawBroccoli(ctx: CanvasRenderingContext2D, bounceOffset: number) {
  // Stem
  ctx.fillStyle = '#9BD473';
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(8, 6);
  ctx.lineTo(11, 22);
  ctx.lineTo(-11, 22);
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.5);
  ctx.stroke();

  // Fluffy broccoli florets (cloud-like clustered circles)
  ctx.fillStyle = '#429E3A';
  const florets = [
    { x: -14, y: -4, r: 12 },
    { x: 14, y: -4, r: 12 },
    { x: -10, y: -16, r: 13 },
    { x: 10, y: -16, r: 13 },
    { x: 0, y: -20, r: 14 },
    { x: 0, y: -8, r: 13 },
  ];

  florets.forEach((f) => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Outlines for florets
  applyStroke(ctx, '#2C1E19', 2.6);
  ctx.beginPath();
  ctx.arc(-14, -4, 12, Math.PI * 0.8, Math.PI * 1.8);
  ctx.arc(-10, -16, 13, Math.PI * 1.1, Math.PI * 1.8);
  ctx.arc(0, -20, 14, Math.PI * 1.2, Math.PI * 1.9);
  ctx.arc(10, -16, 13, Math.PI * 1.3, Math.PI * 2.1);
  ctx.arc(14, -4, 12, Math.PI * 1.4, Math.PI * 2.3);
  ctx.stroke();

  drawCuteVeggieFace(ctx, 0, -4);
}

function drawTomato(ctx: CanvasRenderingContext2D) {
  // Tomato Body
  ctx.fillStyle = '#FF4545';
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Green stem star on top
  ctx.fillStyle = '#65B849';
  ctx.save();
  ctx.translate(0, -17);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  [-12, -6, 0, 6, 12].forEach((sx) => {
    ctx.lineTo(sx, -4 + (Math.abs(sx) % 3));
    ctx.lineTo(sx * 0.5, 3);
  });
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2);
  ctx.stroke();
  ctx.restore();

  drawCuteVeggieFace(ctx, 0, 3);
}

function drawCucumber(ctx: CanvasRenderingContext2D, isFlying: boolean) {
  ctx.save();
  ctx.rotate(isFlying ? 0.08 : -0.15);

  ctx.fillStyle = '#55A844';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.6);
  ctx.stroke();

  // Dots / bumps
  ctx.fillStyle = '#7AC96B';
  [-16, -6, 4, 14].forEach((bx) => {
    ctx.beginPath();
    ctx.arc(bx, -4, 2, 0, Math.PI * 2);
    ctx.arc(bx + 3, 5, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  drawCuteVeggieFace(ctx, 0, 0);
  ctx.restore();
}

function drawEggplant(ctx: CanvasRenderingContext2D) {
  // Deep purple pear-shaped body
  ctx.fillStyle = '#7C3A8A';
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.quadraticCurveTo(-18, 4, -18, 14);
  ctx.quadraticCurveTo(-18, 26, 0, 26);
  ctx.quadraticCurveTo(18, 26, 18, 14);
  ctx.quadraticCurveTo(18, 4, 10, -16);
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Green calyx/cap
  ctx.fillStyle = '#5A9E38';
  ctx.save();
  ctx.translate(0, -18);
  ctx.beginPath();
  ctx.moveTo(-12, 4);
  ctx.lineTo(-6, 12);
  ctx.lineTo(0, 6);
  ctx.lineTo(6, 12);
  ctx.lineTo(12, 4);
  ctx.lineTo(3, -6);
  ctx.lineTo(-3, -6);
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2);
  ctx.stroke();
  ctx.restore();

  drawCuteVeggieFace(ctx, 0, 8);
}

function drawOverheadBasket(ctx: CanvasRenderingContext2D, animTime: number) {
  // Hanging rope/vine coming down from the sky
  ctx.save();
  applyStroke(ctx, '#70543E', 2.5);
  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(0, -16);
  ctx.stroke();

  // Little green leaves along the rope
  ctx.fillStyle = '#6FB84D';
  ctx.beginPath();
  ctx.ellipse(-6, -40, 5, 2.5, -0.4, 0, Math.PI * 2);
  ctx.ellipse(6, -28, 5, 2.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 1.8);
  ctx.stroke();

  // Woven basket base
  ctx.fillStyle = '#CCA166';
  ctx.beginPath();
  ctx.moveTo(-24, -12);
  ctx.lineTo(24, -12);
  ctx.lineTo(18, 16);
  ctx.lineTo(-18, 16);
  ctx.closePath();
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2.8);
  ctx.stroke();

  // Basket weave lines
  applyStroke(ctx, '#AA7D44', 2);
  [-4, 4].forEach((wy) => {
    ctx.beginPath();
    ctx.moveTo(-20, wy);
    ctx.lineTo(20, wy);
    ctx.stroke();
  });

  // Vegetables overflowing from the basket!
  // Red tomato
  ctx.fillStyle = '#FF4D4D';
  ctx.beginPath();
  ctx.arc(-11, -15, 9, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2);
  ctx.stroke();

  // Orange carrot top
  ctx.fillStyle = '#FF832E';
  ctx.beginPath();
  ctx.arc(8, -17, 8, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 2);
  ctx.stroke();

  // Green leaves peeking out
  ctx.fillStyle = '#65B849';
  ctx.beginPath();
  ctx.ellipse(10, -26, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  applyStroke(ctx, '#2C1E19', 1.8);
  ctx.stroke();

  ctx.restore();
}

function drawCuteVeggieFace(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Cute tiny dot eyes
  ctx.fillStyle = '#2C1E19';
  ctx.beginPath();
  ctx.arc(cx - 5.5, cy, 1.8, 0, Math.PI * 2);
  ctx.arc(cx + 5.5, cy, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Tiny blush dots
  ctx.fillStyle = 'rgba(255, 120, 140, 0.65)';
  ctx.beginPath();
  ctx.arc(cx - 8.5, cy + 3.2, 2.4, 0, Math.PI * 2);
  ctx.arc(cx + 8.5, cy + 3.2, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Cute tiny smiling mouth
  applyStroke(ctx, '#2C1E19', 1.6);
  ctx.beginPath();
  ctx.arc(cx, cy + 1.5, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

/**
 * Returns fair, forgiving collision hitbox for an obstacle
 * Hitbox is slightly smaller than visual bounds so near misses feel awesome and fair!
 */
export function getObstacleHitbox(obs: Obstacle): Rect {
  const paddingX = obs.width * 0.18;
  const paddingY = obs.height * 0.18;

  return {
    x: obs.x + paddingX,
    y: obs.y + paddingY,
    width: obs.width - paddingX * 2,
    height: obs.height - paddingY * 2,
  };
}

/**
 * Checks AABB collision between two rectangles
 */
export function checkCollision(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}
