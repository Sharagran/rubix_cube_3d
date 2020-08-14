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

    // rotateLeft();
    // rotateBottom();
    // rotateBack();
    // rotateCube();
    rotateXAxis(1);
};

////#region Demo only functions

// left->right (x)  0-8,    9-18,    19-27     | i+x*9 (i=0->9)
// bot->top (y)     0,1,2   9,10,11  18,19,20  | {0,1,2}+y*3 + i*9 (i=0->3)
// back->front (z)  0,9,18  3,12,21  6,15,24   | {0,3,6}+z*3 + i*9 (i=0->3)
function rotateXAxis(x) {
    if(x < 0 || x > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 9; i++) {
        rotateAboutPoint(cubes[i + x*9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(1));
    }
}
function rotateLeft() {
    for (let i = 0; i < 9; i++) {
        rotateAboutPoint(cubes[i], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
    }
}
function rotateBottom() {
    for (let i = 0; i < 3; i++) {
        rotateAboutPoint(cubes[0 + i * 9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
        rotateAboutPoint(cubes[1 + i * 9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
        rotateAboutPoint(cubes[2 + i * 9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
    }
}
function rotateBack() {
    for (let i = 0; i < 3; i++) {
        rotateAboutPoint(cubes[0 + i * 9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
        rotateAboutPoint(cubes[3 + i * 9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
        rotateAboutPoint(cubes[6 + i * 9], new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
    }
}
function rotateCube() {
    for (let i = 0; i < cubes.length; i++) {
        const element = cubes[i];
        rotateAboutPoint(element, new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(1));
    }
}

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
    return new THREE.MeshBasicMaterial({ color: faceColor, side: THREE.DoubleSide });
}

function toggleWireframes() {
    cubes.forEach(cube => {
        cube.material.wireframe = !cube.material.wireframe;
    });
}

/**
 * Rotates an object around a point.
 * source: https://stackoverflow.com/a/42866733/7264288
 * @param {THREE.Object3D} obj object (THREE.Object3D or derived)
 * @param {THREE.Vector3} point point of rotation (THREE.Vector3)
 * @param {THREE.Vector3} axis axis of rotation (normalized THREE.Vector3)
 * @param {number} theta radian value of rotation
 * @param {boolean} pointIsWorld boolean indicating the point is in world coordinates (default = false)
 */
function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

// controls
document.onkeyup = function (eventArgs) {
    if (eventArgs.keyCode == 32)
        toggleWireframes();
}