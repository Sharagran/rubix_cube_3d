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
scene.background = new THREE.Color(0x292a2e);
document.body.appendChild(renderer.domElement);

setup();
function setup() {
    camera.position.set(0, 0, 10);
    controls = new THREE.OrbitControls(camera); //FIXME: debug only: Requires OBJLoader.js
    controls.enablePan = false;

    createRubixCube();
    let center = cubes[13];
    camera.position.set(center.position.x, center.position.y, center.position.z + 10);
    camera.lookAt(center);
    controls.update();

    // helper
    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    //rotateCube();
    // rotateXAxis(0);
    rotateYAxis(0);
};


// left->right (x)  0-8,    9-18,    19-27     | i+x*9 (i=0->9)
// bot->top (y)     0,1,2   9,10,11  18,19,20  | {0,1,2}+y*3 + i*9 (i=0->3)
// back->front (z)  0,9,18  3,12,21  6,15,24   | {0,3,6}+z + i*9 (i=0->3)
function rotateXAxis(x) {
    if (x < 0 || x > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 9; i++) {
        rotateAroundCenter(cubes[i + x * 9], new THREE.Vector3(1, 0, 0).normalize(), THREE.Math.degToRad(1));
    }
}

function rotateYAxis(y) {
    if (y < 0 || y > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 3; i++) {
        rotateAroundCenter(cubes[0 + y * 3 + i * 9], new THREE.Vector3(0, 1, 0).normalize(), THREE.Math.degToRad(1));
        rotateAroundCenter(cubes[1 + y * 3 + i * 9], new THREE.Vector3(0, 1, 0).normalize(), THREE.Math.degToRad(1));
        rotateAroundCenter(cubes[2 + y * 3 + i * 9], new THREE.Vector3(0, 1, 0).normalize(), THREE.Math.degToRad(1));
    }
}

function rotateZAxis(z) {
    if (z < 0 || z > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 3; i++) {
        rotateAroundCenter(cubes[0 + z + i * 9], new THREE.Vector3(0, 0, 1).normalize(), THREE.Math.degToRad(1));
        rotateAroundCenter(cubes[3 + z + i * 9], new THREE.Vector3(0, 0, 1).normalize(), THREE.Math.degToRad(1));
        rotateAroundCenter(cubes[6 + z + i * 9], new THREE.Vector3(0, 0, 1).normalize(), THREE.Math.degToRad(1));
    }
}

function rotateCube() { //FIXME: demo only
    for (let i = 0; i < cubes.length; i++) {
        const element = cubes[i];
        rotateAroundCenter(element, new THREE.Vector3(1, 1, 1).normalize(), THREE.Math.degToRad(1));
    }
}

function rotateSegment(index, axis) {
    switch (axis) {
        case 0:
            rotateXAxis(index);
            break;
        case 1:
            rotateYAxis(index);
            break;
        case 2:
            rotateZAxis(index);
            break;
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
 * Rotates an object around the center.
 * @param {THREE.Object3D} obj object (THREE.Object3D or derived)
 * @param {THREE.Vector3} axis axis of rotation (normalized THREE.Vector3)
 * @param {number} theta radian value of rotation
*/
function rotateAroundCenter(obj, axis, theta) {
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

    return rotateAboutPoint(obj, new THREE.Vector3(1 + GAP_SIZE, 1 + GAP_SIZE, 1 + GAP_SIZE), axis, theta, false);
}

// controls
document.onkeyup = function (eventArgs) {
    if (eventArgs.key == 32)
        toggleWireframes();
}

// Functions per side

function applyToSide(side, f) {
    switch (side) {
        case "front":
            break;
        case "back":
            break;
        case "left":
            break;
        case "right":
            break;
        case "top":
            break;
        case "bot":
            break;
        default:
            throw "Invalid side";
    }

    //X axis
    for (let i = 0; i < 9; i++) {
        cubes[i + x * 9].visible = false;
    }
    //Y axis
    for (let i = 0; i < 3; i++) {
        cubes[0 + y * 3 + i * 9].visible = false;
        cubes[1 + y * 3 + i * 9].visible = false;
        cubes[2 + y * 3 + i * 9].visible = false;
    }
    //Z axis
    for (let i = 0; i < 3; i++) {
        cubes[0 + z + i * 9].visible = false;
        cubes[3 + z + i * 9].visible = false;
        cubes[6 + z + i * 9].visible = false;
    }
}
