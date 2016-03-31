'use strict';

var renderer = PIXI.autoDetectRenderer(
                   512,
                   384,
                   {view:document.getElementById("game-canvas")}
                 );

init();
mainGameLoop();

var graphics;
var stage;

function init() {
    stage = new PIXI.Container();
    stage.interactive = true;

    graphics = new PIXI.Graphics();
    stage.addChild(graphics);
}

function mainGameLoop() {
    render();
    requestAnimationFrame(mainGameLoop);
}

function render() {
    // draw a rectangle
    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(50, 250, 100, 100);

    renderer.render(stage);
}