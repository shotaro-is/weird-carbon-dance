import * as THREE from "https://cdn.skypack.dev/three@0.137";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";
import { RGBELoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader";
import { GLTFLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(10, innerWidth / innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.dampingFactor = 0.05;
controls.enableDamping = true;
controls.enableZoom = false;
controls.enableRotate = false;
controls.maxAzimuthAngle = Math.PI / 6;
controls.minAzimuthAngle = - Math.PI / 6;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 2;



// Adjust camera to ensure the cube is visible
camera.position.set(0, 0, 150);
camera.lookAt(0, 0, 0)
controls.update();

// Light 
const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

(async function () {
    console.log("start")
    let pmrem = new THREE.PMREMGenerator(renderer);
    let envmapTexture = await new RGBELoader()
      .setDataType(THREE.FloatType)
      .loadAsync("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/empty_warehouse_01_1k.hdr");

    let envMap = pmrem.fromEquirectangular(envmapTexture).texture;


    // Texture
    let textures = {
      mountain: await new THREE.TextureLoader().loadAsync('./mountain_1920x1080.jpg'),
    }

    console.log('texture added')

    let background = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80*1080/1920),
      new THREE.MeshBasicMaterial({map : textures.mountain})
    )

    background.position.set(0, 0, -20);
    scene.add(background)

    // elements
    let element_5 = ( await new GLTFLoader().loadAsync('./element_5_nc.glb')).scene.children[0];
    let element_6 = ( await new GLTFLoader().loadAsync('./element_6_nc.glb')).scene.children[0];

    console.log('ufo added')

    let elementMaterial = new THREE.MeshPhysicalMaterial({
      // envMap,
      // envMapIntensity: 1,
      roughness: 0.2,
      transmission: 1,
      thickness: 0.1,
      // refractionRatio: 0.98,
      // ior: 2.33
    });

    element_5.traverse((o) => {
      if (o.isMesh) o.material = elementMaterial;
    })

    element_6.traverse((o) =>{
      if (o.isMesh) o.material = elementMaterial;
    })

    element_5.scale.set(100 , 100, 100);
    element_5.position.set(12, 0, 2);
    element_5.rotation.set(Math.PI / 2,0,0);
    element_5.updateMatrixWorld();

    element_6.scale.set(200 , 100, 200);
    element_6.position.set(-12, 0, 0);
    element_6.rotation.set(Math.PI / 2,0,0);
    element_6.updateMatrixWorld();

    // scene.add(element_5)
    scene.add(element_6)
   
    // Animation
    let clock = new THREE.Clock();
    let time = 0

    renderer.setAnimationLoop(() => {
      let delta = clock.getDelta();
      time += delta*1
      element_5.position.set(15*Math.sin(time*1), 15*Math.cos(time*1.5),)
      element_6.position.set(-15*Math.sin(time*1), -15*Math.cos(time*1.5))
      // element_5.rotateOnAxis(new THREE.Vector3(0, 0, 1), delta*0.3);
      element_5.rotateOnAxis(new THREE.Vector3(0, 1, 0), delta*0.3);
      element_6.rotateOnAxis(new THREE.Vector3(0, 0, 1), delta*0.3);



      
      controls.update();
      renderer.render(scene, camera);

      // renderer.autoClear = false;
      // renderer.render(planeScene, planeCamera)
      // renderer.autoClear = true;
    });
})();
