import { Particle } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId = 1;

  public clear() {
    this.particles = [];
  }

  public addDust(x: number, y: number, count = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: this.nextId++,
        type: 'dust',
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 6,
        vx: -60 - Math.random() * 80,
        vy: -15 - Math.random() * 30,
        size: 7 + Math.random() * 6,
        alpha: 0.75,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        color: 'rgba(235, 215, 205, 0.8)',
      });
    }
  }

  public addHeart(x: number, y: number, count = 1, spread = 30) {
    const heartColors = ['#FF4D79', '#FF6B93', '#FF85A2', '#FF2D55', '#FF9EAA'];
    for (let i = 0; i < count; i++) {
      const color = heartColors[Math.floor(Math.random() * heartColors.length)];
      this.particles.push({
        id: this.nextId++,
        type: 'heart',
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 100,
        vy: -70 - Math.random() * 120,
        size: 14 + Math.random() * 12,
        alpha: 1,
        life: 0.8 + Math.random() * 0.7,
        maxLife: 1.5,
        color,
        rotation: (Math.random() - 0.5) * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 2,
        scale: 0.4,
      });
    }
  }

  public addKissText(x: number, y: number, text: string) {
    this.particles.push({
      id: this.nextId++,
      type: 'kiss_text',
      x,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: -55 - Math.random() * 40,
      size: 20,
      alpha: 1,
      life: 1.2,
      maxLife: 1.2,
      text,
      color: '#FF2E63',
      scale: 0.5,
    });
  }

  public addStars(x: number, y: number, count = 5) {
    const starColors = ['#FFD13B', '#FFA834', '#FFE873', '#FF6584'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 70 + Math.random() * 90;
      this.particles.push({
        id: this.nextId++,
        type: 'star',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 10 + Math.random() * 6,
        alpha: 1,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }
  }

  public addSparkle(x: number, y: number, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: this.nextId++,
        type: 'sparkle',
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 40,
        vy: -30 - Math.random() * 50,
        size: 7 + Math.random() * 6,
        alpha: 1,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        color: '#FFF275',
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed * dt;
      }

      // Fade out and scale
      const progress = 1 - p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      if (p.type === 'heart' || p.type === 'kiss_text') {
        p.scale = Math.min(1.2, 0.4 + progress * 0.9);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);

      if (p.type === 'dust') {
        ctx.fillStyle = p.color || 'rgba(230, 210, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (1 + (1 - p.alpha) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heart') {
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        const s = (p.scale || 1) * (p.size / 16);
        ctx.scale(s, s);
        ctx.fillStyle = p.color || '#FF4D79';
        ctx.beginPath();
        // SVG heart path
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(0, -3, -12, -7, -12, 2);
        ctx.bezierCurveTo(-12, 9, 0, 16, 0, 19);
        ctx.bezierCurveTo(0, 16, 12, 9, 12, 2);
        ctx.bezierCurveTo(12, -7, 0, -3, 0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2C1E19';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else if (p.type === 'star') {
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color || '#FFD13B';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const rOuter = p.size;
          const rInner = p.size * 0.45;
          const a1 = (i * Math.PI * 2) / 5;
          const a2 = a1 + Math.PI / 5;
          if (i === 0) {
            ctx.moveTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
          } else {
            ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
          }
          ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2C1E19';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (p.type === 'kiss_text' && p.text) {
        const s = p.scale || 1;
        ctx.scale(s, s);
        ctx.font = 'bold 20px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color || '#FF2E63';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeText(p.text, 0, 0);
        ctx.fillText(p.text, 0, 0);
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color || '#FFF275';
        ctx.beginPath();
        // 4-point sparkle star
        const r = p.size;
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
