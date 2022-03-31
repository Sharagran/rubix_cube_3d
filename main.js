


// constants
/**
 * @deprecated unused
 */
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

// cubes[x][y][z] cubes[red][green][blue]
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
    let center = cubes[1][1][1];
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
    // rotateYAxis(0);
    // rotateZAxis(0);
};


// left->right (x)  0-8,    9-18,    19-27     | i+x*9 (i=0->9)
// bot->top (y)     0,1,2   9,10,11  18,19,20  | {0,1,2}+y*3 + i*9 (i=0->3)
// back->front (z)  0,9,18  3,12,21  6,15,24   | {0,3,6}+z + i*9 (i=0->3)
function rotateXAxis(x, deg = 1) {
    if (x < 0 || x > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            rotateAroundCenter(cubes[x][i][j], new THREE.Vector3(1, 0, 0).normalize(), THREE.Math.degToRad(deg));
        }
    }
}

function rotateYAxis(y, deg = 1) {
    if (y < 0 || y > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            rotateAroundCenter(cubes[i][y][j], new THREE.Vector3(0, 1, 0).normalize(), THREE.Math.degToRad(deg));
        }
    }
}

function rotateZAxis(z, deg = 1) {
    if (z < 0 || z > 2) {
        throw "Fehler";
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            rotateAroundCenter(cubes[i][j][z], new THREE.Vector3(0, 0, 1).normalize(), THREE.Math.degToRad(deg));
        }
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
    xCubes = [];

    for (let x = 0; x < 3; x++) {
        var yCubes = [];
        for (let y = 0; y < 3; y++) {
            var zCubes = [];
            for (let z = 0; z < 3; z++) {
                var geometry = new THREE.BoxGeometry();
                var materials = [
                    x == 2 ? newFaceMaterial(0x009b48) : newFaceMaterial(GAP_COLOR),  //right
                    x == 0 ? newFaceMaterial(0xffffff) : newFaceMaterial(GAP_COLOR),  //left 
                    y == 2 ? newFaceMaterial(0xb71234) : newFaceMaterial(GAP_COLOR),  //top
                    y == 0 ? newFaceMaterial(0xffd500) : newFaceMaterial(GAP_COLOR),  //bot
                    z == 2 ? newFaceMaterial(0x0046ad) : newFaceMaterial(GAP_COLOR),  //front
                    z == 0 ? newFaceMaterial(0xff5800) : newFaceMaterial(GAP_COLOR)   //back
                ];

                cube = new THREE.Mesh(geometry, materials);
                scene.add(cube);

                // left->right (x)
                // bot->top (y)
                // back->front (z)
                cube.position.set(x + GAP_SIZE * x, y + GAP_SIZE * y, z + GAP_SIZE * z);
                zCubes.push(cube);
            }
            yCubes.push(zCubes);
        }
        xCubes.push(yCubes);
    }
    cubes = xCubes;
}

function newFaceMaterial(faceColor) {
    return new THREE.MeshBasicMaterial({ color: faceColor, side: THREE.DoubleSide });
}

function toggleWireframes() {
    cubes.forEach(cubesY => {
        cubesY.forEach(cubesZ => {
            cubesZ.forEach(cube => {
                cube.material.forEach(material => {
                    material.wireframe = !material.wireframe;
                });
            });
        });
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
    if (eventArgs.code == "Space") {
        toggleWireframes();
    }
}

var mouseGrab;
document.onmousedown = function (eventArgs) {
    eventArgs.preventDefault();
    
    mouseGrab = getGrabPoint(eventArgs);
    console.log(mouseGrab);
}

document.onmouseup = function (eventArgs) {
    var mouse3D = new THREE.Vector3((eventArgs.clientX / window.innerWidth) * 2 - 1, -(eventArgs.clientY / window.innerHeight) * 2 + 1, 0.5);
    // get mouse movement and new pos since onmousedown
    // https://stackoverflow.com/questions/27486949/three-js-change-vector-length-by-absolute-value
    var movementVector = new THREE.Vector3().subVectors(mouse3D, mouseGrab.point)
    console.log(movementVector);
    console.log(getRotationDirection(movementVector));
}

function getGrabPoint(eventArgs) {
    var mouse3D = new THREE.Vector3((eventArgs.clientX / window.innerWidth) * 2 - 1, -(eventArgs.clientY / window.innerHeight) * 2 + 1, 0.5);

    let allCubes = [...cubes[0][0], ...cubes[0][1], ...cubes[0][2], ...cubes[1][0], ...cubes[1][1], ...cubes[1][2], ...cubes[2][0], ...cubes[2][1], ...cubes[2][2]];

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    var intersectingCubes = raycaster.intersectObjects(allCubes);

    var mouseGrab = intersectingCubes.reduce((max, cube) => cube.distance > max.distance ? cube : max, { distance: -1 });

    return mouseGrab;
}

// FIXME: totally not working
// aktuell werden achsen überprüft, also an welche achse wird die mouse bewegt
// wichtig ist jedoch screen positioning da blickrichtung auf dem cube egal ist
// (maus movement nach rechts wäre +x aus einer perspektive und -x aus der Perspektive gegenüber)
// was ist wenn man von oben auf den cube guckt? erkenne um welche achse gedreht werden muss anhand des vectors & direction durch mouse on screen movement
function getRotationDirection(vector) {
    // X
    if (vector.x >= vector.y && vector.x >= vector.z ) {
        if (vector.x >= 0) {
            return "right"
        } else {
            return "left"
        }
    }

    // Y
    if (vector.y >= vector.x && vector.y >= vector.z ) {
        if (vector.y >= 0) {
            return "up"
        } else {
            return "down"
        }
    }

    // Z
    if (vector.z >= vector.x && vector.z >= vector.y ) {
        if (vector.z >= 0) {
            return "+z"
        } else {
            return "-z"
        }
    }
}

// Functions per side

function applyToSide(side, f) {
    switch (side) {
        case "front":
            x = 0;
        case "back":
            break;
        case "left":
        case "right":
            break;
        case "top":
        case "bot":
            break;
        default:
            throw "Invalid side";
    }

    for (let i = 0; i < 0; i++) {
        for (let j = 0; j < 0; j++) {
            cubes[x][y][z].visible = false;
        }
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
