import events from 'events';
import velocity from 'velocity-animate';

/**
 * イベントのオプション出し分け
 */
const enablePassiveEventListeners = () => {
  let result = false;
  const opts =
    Object.defineProperty &&
    Object.defineProperty({}, 'passive', {
      get: () => {
        result = true;
      }
    });

  document.addEventListener('test', () => {}, opts);

  return result;
};

/**
 * translateXの値を取得
 * @param {*} $el
 */
const getTranslateX = $el => {
  const style = $el.style;
  const transforms = style.transform || style.webkitTransform || style.mozTransform;

  const str = String(transforms).split('translateX(')[1];
  let translateX = String(str).split('px)')[0];

  if (translateX === 'undefined') {
    translateX = 0;
  } else {
    translateX = translateX;
  }
  return translateX;
};

export default class CarouselUI extends events {
  /**
   * @param selector
   */
  constructor(selector, options = {}) {
    super();
    this.$el = document.querySelector(selector);
    this.$wrapper = document.querySelector('.carousel__list');
    this.$items = this.$wrapper.querySelectorAll('li');
    this.$itemImages = this.$wrapper.querySelectorAll('.carousel__list_inner');
    this.$firstItem = this.$wrapper.querySelector(`li:first-child`);
    this.$lastItem = this.$wrapper.querySelector(`li:last-child`);

    this.currentIndex = 0;
    this.length = this.$items.length;
    this.unitWidth = 0;
    this.unitHeight = 0;
    this.windowWidth = window.innerWidth;
    this.radius = (780 / 750) * this.windowWidth * 2;
    this.left = (this.unitWidth / 750) * this.windowWidth * this.currentIndex - (this.unitWidth / 750) * this.windowWidth * 3;

    this.duration = options.duration || 300;
    this.easing = options.easing || 'easeOutQuad';

    this.pointX = 0;
    this.startTranslateX = 0;
    this.lastClientX = 0;
    this.lastTranslateX = 0;
    this.velocityX = 0;
    this.positionX = 0;
    this.translateX = 0;

    this.interval = 0;

    this.touched = false;

    this.init();
  }
  init() {
    this.update();
    this.setPosition();
    this.bind();
  }

  /**
   * 更新
   */
  update() {
    this.unitWidth = (191 / 750) * this.windowWidth;
    this.unitHeight = this.$items[0].clientHeight;
    this.pointX = ((this.unitWidth * 0 * 2) / 750) * this.windowWidth;
    this.interval = this.windowWidth / 2 - this.unitWidth;
  }

  /**
   * 初期位置
   */
  setPosition() {
    velocity(
      this.$wrapper,
      {
        translateX: 0
      },
      {
        duration: 0,
        mobileHA: false
      }
    );

    let moveX = 0 - this.unitWidth * 2;
    const translateY = -(this.radius - Math.sqrt(this.radius * this.radius - moveX * moveX));
    [...this.$itemImages].forEach($itemImage => {
      velocity(
        $itemImage,
        {
          translateY: translateY
        },
        {
          duration: 0
        }
      );
    });

    this.updateItem(0);
    this.moveTranslateY(0);
  }

  /**
   * イベント付与
   */
  bind() {
    const options = enablePassiveEventListeners() ? { passive: true } : false;
    window.addEventListener('load', this.update.bind(this), options);
    document.addEventListener('resize', this.update.bind(this), options);
    this.$el.addEventListener('touchstart', this.handleSwipeStart.bind(this), options);
    this.$el.addEventListener('touchmove', this.handleSwipeMove.bind(this), options);
    document.body.addEventListener('touchend', this.handleSwipeEnd.bind(this), options);
  }

  /**
   * スワイプスタート時処理
   * @param {*} event
   */
  handleSwipeStart(event) {
    this.lastClientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    this.startTranslateX = parseFloat(getTranslateX(this.$wrapper).split('px')[0]);
    this.lastTranslateX = this.startTranslateX;
    this.touched = true;
  }

  /**
   * スワイプ中処理
   * @param {*} event
   */
  handleSwipeMove(event) {
    if (this.touched === false) return;

    const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const diffX = clientX - this.lastClientX;

    this.lastTranslateX = this.lastTranslateX + diffX;

    if (diffX >= 0 && this.lastTranslateX >= this.unitWidth * 0.5) {
      this.lastTranslateX = -this.unitWidth * (this.length - 1) - this.lastTranslateX;
    } else if (diffX < 0 && this.lastTranslateX <= -this.unitWidth * (this.length - 0.5)) {
      this.lastTranslateX = this.lastTranslateX + this.unitWidth * this.length;
    }

    this.translateX = this.lastTranslateX;
    velocity(this.$wrapper, 'stop');
    velocity(
      this.$wrapper,
      {
        translateX: this.lastTranslateX
      },
      {
        duration: 0,
        mobileHA: false,
        complete: () => {
          this.updateItem(this.lastTranslateX, 'swipe');
          this.moveTranslateY(this.lastTranslateX);
        }
      }
    );

    // update last clientX
    this.lastClientX = clientX;
    this.velocityX = diffX;
  }

  /**
   * スワイプ終了時処理
   */
  handleSwipeEnd() {
    this.touched = false;
    const index = (Math.round(-this.lastTranslateX / this.unitWidth) + this.length) % this.length;

    if (this.lastTranslateX < -this.unitWidth * (this.length - 1)) {
      this.goTo(8, this.duration);
    } else {
      this.goTo(index, this.duration);
    }
  }

  /**
   * カルーセルの移動
   * @param {*} index
   */
  goTo(index, duration) {
    this.currentIndex = index;

    const positionX = parseFloat(getTranslateX(this.$wrapper).split('px')[0]);

    this.pointX = positionX;

    velocity(
      this.$wrapper,
      {
        tween: [-this.unitWidth * this.currentIndex, positionX]
      },
      {
        easing: this.easing,
        duration: duration,
        mobileHA: false,
        progress: (a, b, c, d, e) => {
          a[0].style.transform = `translateX(${e}px)`;
          a[0].style.webkitTransform = `translateX(${e}px)`;
          this.translateX = e;
          if (e !== null) {
            this.updateItem(e, 'goto');
            this.moveTranslateY(e);
          }
        }
      }
    );
  }

  /**
   * 要素の位置を調節
   */
  updateItem() {
    //先頭に末尾の要素をもってくるかどうか
    if (this.translateX >= -this.unitWidth * 0.5) {
      this.relocateLastItem();
    } else if (this.translateX < -this.unitWidth * 0.5) {
      this.resetLastItem();
    }
    //末尾に先頭の要素をもってくるかどうか
    if (this.translateX <= -this.unitWidth * (this.length - 4.5)) {
      this.relocateFirstItem();
    } else if (this.translateX > -this.unitWidth * (this.length - 4.5)) {
      this.resetFirstItem();
    }

    //先頭にごそっと複数要素を持ってくるかどうか
    if (this.translateX <= -this.unitWidth * (this.length - 3.5)) {
      this.relocateAfterItems();
    } else if (this.translateX > -this.unitWidth * (this.length - 3.5)) {
      this.resetAfterItems();
    }
  }

  //複数要素ごそっと末尾に持っていく
  relocateAfterItems() {
    for (let i = 0; i < 2; i++) {
      velocity(
        this.$items[i + 1],
        {
          translateX: this.unitWidth * this.length
        },
        {
          duration: 0,
          mobileHA: false
        }
      );
    }
  }

  //複数要素を元に戻す
  resetAfterItems() {
    for (let i = 0; i < 2; i++) {
      velocity(
        this.$items[i + 1],
        {
          translateX: 0
        },
        {
          duration: 0,
          mobileHA: false
        }
      );
    }
  }

  //一番後ろの要素を先頭に持ってくる
  relocateLastItem() {
    velocity(
      this.$lastItem,
      {
        translateX: -this.unitWidth * this.length
      },
      {
        duration: 0
      }
    );
  }

  //一番後ろの要素を元の位置に戻す
  resetLastItem() {
    velocity(
      this.$lastItem,
      {
        translateX: 0
      },
      {
        duration: 0
      }
    );
  }

  //一番前の要素を末尾に持っていく
  relocateFirstItem() {
    velocity(
      this.$firstItem,
      {
        translateX: this.unitWidth * this.length
      },
      {
        duration: 0
      }
    );
  }

  //一番前の要素を元の位置に戻す
  resetFirstItem() {
    velocity(
      this.$firstItem,
      {
        translateX: 0
      },
      {
        duration: 0
      }
    );
  }

  /**
   * ボトルのy方向を動かす
   * @param {*} x
   */
  moveTranslateY(x) {
    const currentIndex = Math.abs(Math.floor((-this.unitWidth + this.translateX) / this.unitWidth));

    for (let i = currentIndex - 3; i <= currentIndex + 3; i++) {
      let targetIndex = i;

      if (i > 8) {
        targetIndex = i - 9;
      } else if (i <= -1) {
        targetIndex = i + 9;
      }

      //各要素の中心
      this.positionX = this.unitWidth * (i - 1) + x;

      let moveX = this.positionX;

      const translateY = -(this.radius - Math.sqrt(this.radius * this.radius - moveX * moveX));

      velocity(
        this.$itemImages[targetIndex],
        {
          translateY: translateY
        },
        {
          duration: 0
        }
      );
    }
  }
}
