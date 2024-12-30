let sprites = {
  player1: {
    idle: { img: null, width: 1729 / 17, height: 151, frames: 17 },
    walk: { img: null, width: 3145 / 18, height: 151, frames: 18 },
    jump: { img: null, width: 2620 / 15, height: 183, frames: 15 },
  },
  player2: {
    idle: { img: null, width: 710 / 11, height: 151, frames: 11 },
    walk: { img: null, width: 835 / 15, height: 151, frames: 15 },
    jump: { img: null, width: 955 / 10, height: 151, frames: 10 },
  },
};

let player1, player2;
let bullets1 = []; // 子弹数组：player1的
let bullets2 = []; // 子弹数组：player2的
let gravity = 0.8;
let player1Health = 100;
let player2Health = 100;
let backgroundImg;
let backgroundX = 0;

function preload() {
  // 载入角色图片
  sprites.player1.idle.img = loadImage("p1i.png");
  sprites.player1.walk.img = loadImage("p1w.png");
  sprites.player1.jump.img = loadImage("p1j.png");

  sprites.player2.idle.img = loadImage("p2i.png");
  sprites.player2.walk.img = loadImage("p2w.png");
  sprites.player2.jump.img = loadImage("p2j.png");

  // 载入背景图
  backgroundImg = loadImage("background.jpg"); // 替换为您的背景图路径
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 初始化角色
  player1 = {
    x: 200,
    y: height - 200,
    currentAction: "idle",
    currentFrame: 0,
    lastFrameUpdate: 0,
    frameDelay: 100,
    xSpeed: 0,
    ySpeed: 0,
    onGround: true,
    health: player1Health,
  };

  player2 = {
    x: 600,
    y: height - 200,
    currentAction: "idle",
    currentFrame: 0,
    lastFrameUpdate: 0,
    frameDelay: 100,
    xSpeed: 0,
    ySpeed: 0,
    onGround: true,
    health: player2Health,
  };
}

function draw() {
  // 背景根据角色的位置来移动
  let backgroundScrollSpeed = 0.5; // 背景滚动的速度
  backgroundX = -player1.x * backgroundScrollSpeed; // 背景位置随角色1移动
  
  // 绘制背景
  background(220);
  image(backgroundImg, backgroundX, 0, backgroundImg.width, height);
  
  // 更新与绘制角色
  updateAndDrawCharacter(player1, sprites.player1);
  updateAndDrawCharacter(player2, sprites.player2);

  // 更新并绘制子弹
  updateAndDrawBullets(bullets1, player2);
  updateAndDrawBullets(bullets2, player1);

  // 绘制生命条
  drawHealthBar(player1, 50, 50, color(255, 0, 0));
  drawHealthBar(player2, width - 250, 50, color(0, 0, 255));
}

function updateAndDrawCharacter(player, spriteData) {
  let currentSprite = spriteData[player.currentAction];

  // 更新动画帧
  if (millis() - player.lastFrameUpdate > player.frameDelay) {
    player.currentFrame = (player.currentFrame + 1) % currentSprite.frames;
    player.lastFrameUpdate = millis();
  }

  // 处理角色的重力
  if (!player.onGround) {
    player.ySpeed += gravity;
  }

  // 更新角色的Y轴位置
  player.y += player.ySpeed;
  if (player.y >= height - 150) { // 碰到地面
    player.y = height - 150;
    player.ySpeed = 0;
    player.onGround = true;

    // 跳跃完成后，恢复待机状态
    if (player.currentAction === "jump") {
      player.currentAction = "idle";
    }
  }

  // 更新角色X轴位置
  player.x += player.xSpeed;

  // 计算当前帧的切片位置
  let sx = player.currentFrame * currentSprite.width;

  // 绘制当前帧
  image(
    currentSprite.img,
    player.x,
    player.y - currentSprite.height, // 修正角色贴图的高度
    currentSprite.width,
    currentSprite.height,
    sx,
    0,
    currentSprite.width,
    currentSprite.height
  );
}

function updateAndDrawBullets(bulletArray, targetPlayer) {
  for (let i = bulletArray.length - 1; i >= 0; i--) {
    let bullet = bulletArray[i];

    // 更新子弹位置
    bullet.x += bullet.speed;

    // 检测子弹与目标玩家的碰撞
    if (bullet.x > targetPlayer.x && bullet.x < targetPlayer.x + 50 && bullet.y > targetPlayer.y - 150 && bullet.y < targetPlayer.y) {
      targetPlayer.health -= 10; // 碰到玩家减少生命值
      bulletArray.splice(i, 1); // 子弹击中后消失
    }

    // 如果子弹超出屏幕，移除子弹
    if (bullet.x < 0 || bullet.x > width) {
      bulletArray.splice(i, 1);
    }

    // 绘制子弹
    ellipse(bullet.x, bullet.y, 10, 10);
  }
}

// 绘制生命条
function drawHealthBar(player, x, y, color) {
  fill(200);
  rect(x, y, 200, 20); // 绘制背景

  fill(color);
  let healthWidth = map(player.health, 0, 100, 0, 200); // 计算健康条宽度
  rect(x, y, healthWidth, 20); // 绘制生命条
}

function keyPressed() {
  // 玩家1的控制
  if (key === "w" || key === "W") {
    if (player1.onGround) {
      player1.ySpeed = -15; // 跳跃的速度
      player1.onGround = false;
      player1.currentAction = "jump";
      player1.currentFrame = 0;
    }
  } else if (key === "a" || key === "A") {
    player1.xSpeed = -5; // 左移
    player1.currentAction = "walk";
    player1.currentFrame = 0;
  } else if (key === "d" || key === "D") {
    player1.xSpeed = 5; // 右移
    player1.currentAction = "walk";
    player1.currentFrame = 0;
  } else if (key === "f" || key === "F") {
    // 发射子弹
    bullets1.push({
      x: player1.x + 50, // 发射位置
      y: player1.y - 50,
      speed: 10, // 子弹速度
    });
  }

  // 玩家2的控制
  if (keyCode === UP_ARROW) {
    if (player2.onGround) {
      player2.ySpeed = -15; // 跳跃的速度
      player2.onGround = false;
      player2.currentAction = "jump";
      player2.currentFrame = 0;
    }
  } else if (keyCode === LEFT_ARROW) {
    player2.xSpeed = -5; // 左移
    player2.currentAction = "walk";
    player2.currentFrame = 0;
  } else if (keyCode === RIGHT_ARROW) {
    player2.xSpeed = 5; // 右移
    player2.currentAction = "walk";
    player2.currentFrame = 0;
  } else if (keyCode === 32) { // 空白键发射子弹
    bullets2.push({
      x: player2.x + 50, // 发射位置
      y: player2.y - 50,
      speed: -10, // 子弹速度，负值表示向左发射
    });
  }
}

function keyReleased() {
  // 玩家1的控制
  if (key === "a" || key === "A" || key === "d" || key === "D") {
    player1.xSpeed = 0;
    player1.currentAction = "idle";
  }

  // 玩家2的控制
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player2.xSpeed = 0;
    player2.currentAction = "idle";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
