// constants
const CUBE_FACES = {
    right: 0,
    left: 1,
    top: 2,
    bot: 3,
    front: 4,
    back: 5
};

const GAP_SIZE = 0.1;
const GAP_COLOR = 0x0;

// global vars
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var controls;

var cubes = [];

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

setup();
function setup() {
    camera.position.set(0, 0, 5);
    controls = new THREE.OrbitControls(camera); //FIXME: debug only: Requires OBJLoader.js

    createRubixCube();
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // if (cubes) {
    //     cubes.forEach(cube => {
    //         cube.rotation.x += 0.01;
    //         cube.rotation.y += 0.01;
    //     });
    // }


    renderer.render(scene, camera);
};

function createRubixCube() {
    cubes = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                var geometry = new THREE.BoxGeometry();
                var materials = [
                    i == 2 ? newFaceMaterial(0x009b48) : newFaceMaterial(GAP_COLOR),  //right
                    i == 0 ? newFaceMaterial(0xffffff) : newFaceMaterial(GAP_COLOR),  //left 
                    j == 2 ? newFaceMaterial(0xb71234) : newFaceMaterial(GAP_COLOR),  //top
                    j == 0 ? newFaceMaterial(0xffd500) : newFaceMaterial(GAP_COLOR),  //bot
                    k == 2 ? newFaceMaterial(0x0046ad) : newFaceMaterial(GAP_COLOR),  //front
                    k == 0 ? newFaceMaterial(0xff5800) : newFaceMaterial(GAP_COLOR)   //back
                ];

                cube = new THREE.Mesh(geometry, materials);
                scene.add(cube);

                //i = left->right (x)
                //j = bot->top (y)
                //k = back->front (z)
                var x = i, y = j, z = k;
                cube.position.set(x + GAP_SIZE * i, y + GAP_SIZE * j, z + GAP_SIZE * k);
                cubes.push(cube);
            }
        }
    }

}

function newFaceMaterial(faceColor) {
    return new THREE.MeshBasicMaterial({color:faceColor, side: THREE.DoubleSide});
}

function toggleWireframes() {
    cubes.forEach(cube => {
        cube.material.wireframe = !cube.material.wireframe;
    });
}

//Keyboard controls
document.onkeyup = function (eventArgs) {
    if (eventArgs.keyCode == 32)
        toggleWireframes();
}