import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, GROUND_Y } from './constants';

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

export class BackgroundRenderer {
  private clouds: Cloud[] = [
    { x: 120, y: 70, scale: 1.1, speed: 12 },
    { x: 380, y: 110, scale: 0.8, speed: 8 },
    { x: 690, y: 60, scale: 1.3, speed: 15 },
    { x: 920, y: 130, scale: 0.9, speed: 10 },
  ];

  public update(dt: number, scrollSpeed: number) {
    // Cloud drift
    for (const c of this.clouds) {
      c.x -= c.speed * dt + scrollSpeed * 0.05 * dt;
      if (c.x < -150) {
        c.x = VIRTUAL_WIDTH + 80;
        c.y = 50 + Math.random() * 100;
      }
    }
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    scrollOffset: number,
    animTime: number
  ) {
    // 1. SKY GRADIENT (Soft pastel baby blue to warm blush dawn)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    skyGrad.addColorStop(0, '#E8F4FD');
    skyGrad.addColorStop(0.55, '#FBF0F4');
    skyGrad.addColorStop(1, '#FFE9EE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 2. SOFT SUN WITH HEART GLOW
    ctx.save();
    const sunPulse = 1 + Math.sin(animTime * 2) * 0.05;
    ctx.translate(880, 95);
    ctx.scale(sunPulse, sunPulse);
    // Glow
    ctx.fillStyle = 'rgba(255, 235, 170, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();
    // Sun body
    ctx.fillStyle = '#FFF1A8';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F7D66B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cute sun face
    ctx.fillStyle = '#2C1E19';
    ctx.beginPath();
    ctx.arc(-7, -2, 2.2, 0, Math.PI * 2);
    ctx.arc(7, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Sun cheeks
    ctx.fillStyle = 'rgba(255, 140, 160, 0.6)';
    ctx.beginPath();
    ctx.arc(-11, 4, 3, 0, Math.PI * 2);
    ctx.arc(11, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Sun smile
    ctx.strokeStyle = '#2C1E19';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // 3. FLUFFY PASTEL CLOUDS
    for (const c of this.clouds) {
      this.drawCloud(ctx, c.x, c.y, c.scale);
    }

    // 4. DISTANT ROLLING HILLS (Parallax 0.15)
    const hillOffset = (scrollOffset * 0.15) % VIRTUAL_WIDTH;
    ctx.save();
    ctx.fillStyle = '#D6ECBE';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = -100; x <= VIRTUAL_WIDTH + 100; x += 60) {
      const hillY =
        GROUND_Y -
        85 -
        Math.sin((x + hillOffset) * 0.004) * 35 -
        Math.cos((x + hillOffset) * 0.009) * 20;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(VIRTUAL_WIDTH, GROUND_Y);
    ctx.lineTo(0, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#B3DC94';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 5. MIDGROUND BUSHES & TREES (Parallax 0.4)
    const midOffset = (scrollOffset * 0.4) % 400;
    ctx.save();
    ctx.fillStyle = '#94D977';
    for (let bx = -midOffset; bx < VIRTUAL_WIDTH + 200; bx += 220) {
      // Clustered rounded cartoon bush
      ctx.beginPath();
      ctx.arc(bx + 40, GROUND_Y - 26, 28, 0, Math.PI * 2);
      ctx.arc(bx + 70, GROUND_Y - 36, 34, 0, Math.PI * 2);
      ctx.arc(bx + 100, GROUND_Y - 24, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#71BF52';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bush berries / strawberry dots
      ctx.fillStyle = '#FF5277';
      ctx.beginPath();
      ctx.arc(bx + 52, GROUND_Y - 28, 3.5, 0, Math.PI * 2);
      ctx.arc(bx + 85, GROUND_Y - 32, 4, 0, Math.PI * 2);
      ctx.arc(bx + 70, GROUND_Y - 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94D977'; // reset for next
    }
    ctx.restore();

    // 6. FOREGROUND RUNNING PATH & GRASS (Parallax 1.0)
    // Grass top border
    ctx.save();
    ctx.fillStyle = '#7AC85E';
    ctx.fillRect(0, GROUND_Y - 12, VIRTUAL_WIDTH, 14);

    // Warm pastel dirt trail
    ctx.fillStyle = '#F5E6CE';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - GROUND_Y);

    // Ground edge line with rounded cartoon stroke
    ctx.strokeStyle = '#2C1E19';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(VIRTUAL_WIDTH, GROUND_Y);
    ctx.stroke();

    // Grass scalloped fringe on the border
    ctx.fillStyle = '#65B548';
    const fringeStep = 24;
    const fringeShift = scrollOffset % fringeStep;
    for (let fx = -fringeShift; fx < VIRTUAL_WIDTH + fringeStep; fx += fringeStep) {
      ctx.beginPath();
      ctx.arc(fx, GROUND_Y - 1, 6, Math.PI, 0, false);
      ctx.fill();
    }

    // Little pebbles and daisies along the road
    const pathDetailStep = 180;
    const pathShift = scrollOffset % pathDetailStep;
    for (let px = -pathShift; px < VIRTUAL_WIDTH + pathDetailStep; px += pathDetailStep) {
      // Pebble
      ctx.fillStyle = '#DFC7A7';
      ctx.beginPath();
      ctx.ellipse(px + 40, GROUND_Y + 22, 6, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2C1E19';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Wild Daisy flower on the edge
      const flowerSway = Math.sin(animTime * 4 + px) * 0.15;
      ctx.save();
      ctx.translate(px + 120, GROUND_Y - 4);
      ctx.rotate(flowerSway);
      // Petals
      ctx.fillStyle = '#FFFFFF';
      for (let p = 0; p < 5; p++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -6, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Yellow center
      ctx.fillStyle = '#FFD23F';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Lower path earth texture
    ctx.fillStyle = '#E8D4B7';
    ctx.fillRect(0, GROUND_Y + 45, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - (GROUND_Y + 45));
    ctx.strokeStyle = '#D9BE9B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 45);
    ctx.lineTo(VIRTUAL_WIDTH, GROUND_Y + 45);
    ctx.stroke();

    ctx.restore();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-22, 0, 18, 0, Math.PI * 2);
    ctx.arc(0, -12, 24, 0, Math.PI * 2);
    ctx.arc(24, -4, 20, 0, Math.PI * 2);
    ctx.arc(42, 6, 14, 0, Math.PI * 2);
    ctx.arc(10, 10, 18, 0, Math.PI * 2);
    ctx.arc(-14, 10, 16, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // Soft outline
    ctx.strokeStyle = '#E2EDF7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
