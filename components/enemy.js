
AFRAME.registerComponent('enemy', {
  schema: {

    type: { default: 1 }
  },

  init: function () {
    var el = this.el;
    var explosionScale;

    this.hidingPos = 0;
    this.timeout = null;
    this.tweenAppear = null;
    this.tweenDisappear = null;
    this.vulnerable = false;      // Cannot be shoot when it's hiding.

    this.explosion = document.getElementById(`${this.el.id}expl`).object3D;
    this.explosion.visible = false;
    explosionScale = this.data.type * 2.2;
    this.explosion.scale.set(explosionScale, explosionScale, explosionScale);

    el.addEventListener('run', this.run.bind(this));
    el.addEventListener('stop', this.stop.bind(this));
    el.addEventListener('hit', this.die.bind(this));
  },


  run: function () {
    var lift;

    if (this.tweenAppear === null) {

      this.hidingPos = this.el.object3D.position.y;

      lift = this.data.type * 1.2;
      this.tweenAppear = new TWEEN.Tween(this.el.object3D.position)
        .to({ y: this.hidingPos + lift }, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .onComplete(this.endAppear.bind(this));

      this.tweenDisappear = new TWEEN.Tween(this.el.object3D.position)
        .to({ y: this.hidingPos }, 200)
        .delay(1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(this.endDisappear.bind(this));
    }

    document.getElementById('startMessage').object3D.visible = false;
    this.appear();
  },


  appear: function () {
    this.tweenAppear.start();
    this.el.querySelector('[sound]').components.sound.playSound();
  },

  endAppear: function () {
    this.vulnerable = true;

    this.tweenDisappear.start();
  },


  endDisappear: function () {
    this.vulnerable = false;

    this.timeout = setTimeout(this.appear.bind(this),
      1000 + Math.floor(Math.random() * 3000));
  },


  stop: function () {
    this.tweenAppear.stop();
    this.tweenDisappear.stop();
    clearTimeout(this.timeout);
    this.vulnerable = false;
  },


  die: function (evt) {
    var el = this.el;

    if (!this.vulnerable) { return; }

    this.stop();


    el.object3D.visible = false;
    el.object3D.position.y = this.hidingPos;


    document.getElementById('commonExplosion').components.sound.playSound();


    this.explosion.position.copy(this.el.components.target.lastBulletHit.position);
    this.explosion.lookAt(0, 1.6, 0);
    this.explosion.visible = true;

    setTimeout(() => {
      this.explosion.visible = false;
      this.el.object3D.visible = true;

      setTimeout(this.appear.bind(this),
        2000 + Math.floor(Math.random() * 3000));
    }, 300);
  }
});
