import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Cursor
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)
})

// Texture Loader
const textureLoader = new THREE.TextureLoader()

const earthMap = textureLoader.load('textures/earthmap1k.jpg')
const bumpMap = textureLoader.load('textures/earthbump.jpg')

// Scene
const scene = new THREE.Scene()

// Material

const material = new THREE.PointsMaterial({
    size: 0.005
})


// Camera Distance?

const cameraDistance = 4;

// Object

const particlesGeometry = new THREE.BufferGeometry;
const particlesCnt = 5000;

const posArray = new Float32Array(particlesCnt * 3);

for(let i = 0; i < particlesCnt * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 30
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

const particlesMesh = new THREE.Points(particlesGeometry, material)

const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshBasicMaterial({
        map: earthMap
    })
)

const mesh2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshBasicMaterial({
        map: earthMap
    })
)

mesh2.position.set(2, 2, 2)

scene.add(mesh, mesh2, particlesMesh)


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// const aspectRatio = sizes.width / sizes.height
// const camera = new THREE.OrthographicCamera(- 1 * aspectRatio, 1 * aspectRatio, 1, - 1, 0.1, 100)
camera.position.z = 3
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Trying

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick() {

}

function focusOnPlanet(selectedPlanet) {
    const targetPosition = selectedPlanet.position.clone();

    // Calculate direction from camera to the selected planet
    const direction = new THREE.Vector3().subVectors(targetPosition, camera.position).normalize();

    // Set camera position to be slightly behind the selected planet
    const distance = cameraDistance;
    const newPosition = targetPosition.clone().add(direction.multiplyScalar(-distance));

    // Set the camera position and lookAt target
    camera.position.copy(newPosition);
    camera.lookAt(targetPosition);
}


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([mesh, mesh2]);

    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object;

        focusOnPlanet(selectedPlanet)
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()