const { Engine, Runner, Bodies, Composite, Body } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Kotak Pembatas Layar
    const w = window.innerWidth;
    const h = window.innerHeight;
    const wallOptions = { isStatic: true, restitution: 0.6 };

    const ground = Bodies.rectangle(w / 2, h + 30, w, 60, wallOptions);
    const leftWall = Bodies.rectangle(-30, h / 2, 60, h, wallOptions);
    const rightWall = Bodies.rectangle(w + 30, h / 2, 60, h, wallOptions);
    const ceiling = Bodies.rectangle(w / 2, -30, w, 60, wallOptions);

    Composite.add(world, [ground, leftWall, rightWall, ceiling]);

    // Ambil Semua Elemen
    const elements = document.querySelectorAll('.falling-item');
    const physicsBodies = [];

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const x = Math.random() * (w - 120) + 60;
      const y = Math.random() * 200 + 50;
      const textLength = el.innerText.trim().length;

      // Pengaturan Default Fisika
      let options = {
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.01
      };

      let massMultiplier = 1;

      // --- LOGIKA KARAKTERISTIK 4 ELEMEN ---
      if (el.classList.contains('water-item')) {
        // AIR: Licin & Kenyally Memantul
        options.restitution = 0.85;
        options.friction = 0.005;
        massMultiplier = 1.0; 
      } 
      else if (el.classList.contains('air-item')) {
        // UDARA: Sangat Ringan & Hambatan Udara Tinggi (Melayang)
        options.restitution = 0.3;
        options.frictionAir = 0.08; // Melayang turun lambat
        massMultiplier = 0.2;       // Sangat ringan!
      } 
      else if (el.classList.contains('fire-item')) {
        // API: Liar & Enerjik
        options.restitution = 0.7;
        options.frictionAir = 0.02;
        massMultiplier = 0.6;
      } 
      else if (el.classList.contains('earth-item')) {
        // TANAH: Sangat Heavy/Berat, Tidak Memantul, Gesekan Tinggi
        options.restitution = 0.05; // Hampir tak memantul
        options.friction = 0.8;    // Sangat kesat/serat
        massMultiplier = 3.0;       // Ekstra Berat!
      }

      // Buat Bodi Fisika
      const body = Bodies.rectangle(x, y, rect.width, rect.height, options);

      // Hitung Massa Akhir: (Massa Dasar Elemen) x (Pengali Jumlah Huruf)
      const letterWeight = 1 + (textLength * 0.1);
      Body.setMass(body, body.mass * massMultiplier * letterWeight);

      physicsBodies.push({ el, body, isFire: el.classList.contains('fire-item') });
      Composite.add(world, body);
    });

    // Render loop
    (function update() {
      physicsBodies.forEach(({ el, body, isFire }) => {
        const { x, y } = body.position;
        const angle = body.angle;
        
        // EFEK KHUSUS API: Selalu bergetar/goyang sendiri (Sparks)
        if (isFire && Math.random() < 0.3) {
          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.002 * body.mass,
            y: (Math.random() - 0.7) * 0.003 * body.mass // Cenderung terdorong sedikit ke atas
          });
        }

        el.style.transform = `translate(${x - el.offsetWidth / 2}px, ${y - el.offsetHeight / 2}px) rotate(${angle}rad)`;
      });
      requestAnimationFrame(update);
    })();

    // Sensor & Shake Detection
    let lastX = 0, lastY = 0, lastZ = 0;
    const shakeThreshold = 15;

    function initSensors() {
      window.addEventListener('deviceorientation', (event) => {
        engine.gravity.x = event.gamma / 20;
        engine.gravity.y = event.beta / 20;
      });

      window.addEventListener('devicemotion', (event) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const deltaX = Math.abs(acc.x - lastX);
        const deltaY = Math.abs(acc.y - lastY);
        const deltaZ = Math.abs(acc.z - lastZ);

        if (deltaX + deltaY + deltaZ > shakeThreshold) {
          physicsBodies.forEach(({ body }) => {
            const forceX = (Math.random() - 0.5) * 0.15 * body.mass;
            const forceY = (Math.random() - 0.5) * 0.15 * body.mass;
            Body.applyForce(body, body.position, { x: forceX, y: forceY });
          });
        }

        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
      });

      document.getElementById('btn-permission').style.display = 'none';
    }

    document.getElementById('btn-permission').addEventListener('click', () => {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(response => {
          if (response === 'granted') initSensors();
        });
      } else {
        initSensors();
      }
    });