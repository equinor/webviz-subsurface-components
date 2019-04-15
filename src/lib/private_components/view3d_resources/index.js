import * as THREE from 'three';
import { Interaction } from 'three.interaction';
import OrbitControlsCreator from 'three-orbit-controls';
import * as DAT from 'dat.gui';
import { createSurfaceMeshes } from './surfaces';
import { createWellbore } from './wellbore';
const OrbitControls = OrbitControlsCreator(THREE);

export default class Scene {
  constructor(canvasId, textId, x, y) {
    this.domElement = canvasId
    this.textElement = textId
    this.center = {
        easting: x,
        northing: y,
    }
    this.welldata = []
    this.render = this.render.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.updateZScale = this.updateZScale.bind(this);
    this.unMount = this.unMount.bind(this);
    this.init();
    this.setupScene();
  }

  init() {

    this.setupUi();
    const width = window.innerWidth*0.9;
    const height = window.innerHeight*0.9;
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.domElement.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100000);
    this.camera.position.y = 1000;
    this.camera.position.x = 0;
    this.camera.position.z = 1000;
    this.interaction = new Interaction(this.renderer, this.scene, this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(0, -3000, 0);
    this.controls.update();
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.directionalLight = new THREE.DirectionalLight(0xffffee);
    this.scene.add(this.ambientLight);
    this.scene.add(this.directionalLight);
  }

  setupUi() {
    this.props = {
      zscale: 1,
      opacity: 1,
      thickness: 2,
      sea: true,
      showNorth: true,
      fences: false,
      labels: true,
    };
    this.gui = new DAT.GUI();
    const zscaleCtrl = this.gui.add(this.props, 'zscale', 1, 5);
    zscaleCtrl.onChange(this.updateZScale);

    const opacityCtrl = this.gui.add(this.props, 'opacity', 0, 1, 0.1);
    opacityCtrl.onChange(value => {
      this.surfaces.forEach(s => {
        const mix = value * s.opacity;
        s.mesh.material.opacity = mix;
        s.mesh.material.transparent = mix < 1;
        s.mesh.material.depthWrite = mix === 1;
      });
    });

    const thicknessCtrl = this.gui.add(this.props, 'thickness', 1, 15, 1);
    thicknessCtrl.onChange(value => {
      this.wellObjs.remove(this.wellbores);
      this.wellbores = this.createWellbores(value, this.props.stratcolumn);
      this.wellObjs.add(this.wellbores);
    });
    const northToggle = this.gui.add(this.props, 'showNorth', false);
    northToggle.onChange(on => this.northCone.visible = on);
    this.gui.close();
  }

  createWellbores(size, stratColumnEnabled) {
    const wellbores = new THREE.Object3D();
    this.welldata.forEach(wellPath => {
      const wellbore = createWellbore(
          wellPath, this.props.thickness, this.center, stratColumnEnabled);
          wellbore.mesh.name = ('well-'+wellPath.name)
      wellbores.add(wellbore.mesh);
    });
    return wellbores;
  }

  loadWells(data) {
      this.welldata = data;
      this.wellObjs.remove(this.wellbores);
      this.wellbores = this.createWellbores(
          this.props.thickness, this.props.stratcolumn);
      this.wellObjs.add(this.wellbores);
  }

  loadSurfaces(data) {
      this.scene.remove(this.surfaceObjs);
      this.surfaceObjs.remove.apply(this.surfaceObjs, this.surfaceObjs.children);
      this.surfaces = createSurfaceMeshes(data);
      this.surfaces.forEach(s => {
          this.surfaceObjs.add(s.mesh)
      });
      this.scene.add(this.surfaceObjs);
  }

  northPointer() {
    const { scene } = this;
    const geometry = new THREE.ConeGeometry( 5, 40, 32 );
    const material = new THREE.MeshLambertMaterial( {color: 0xcc0000} );
    const cone = new THREE.Mesh( geometry, material );
    cone.translateY(1000);
    cone.rotateX(-Math.PI / 2);;
    cone.visible = this.props.showNorth;
    scene.add(cone);
    this.northCone = cone;
  }

  mouseOverText() {
      this.surfaceObjs.on('mousemove', (ev) => {
          let y = ev.intersects[0].point.y
          let name = ev.intersects[0].object.name
          y = y/this.surfaceObjs.scale.y
          this.textElement.innerHTML = name+', '+y
      })
  }

  setupScene() {
    const { scene } = this;
    this.northPointer();
    this.surfaceObjs = new THREE.Object3D();
    this.surfaceObjs.name = 'surfaces';
    scene.add(this.surfaceObjs)
    this.mouseOverText();
    this.wellObjs = new THREE.Object3D();
    scene.add(this.wellObjs);
  }

  onWindowResize(){
    const { camera, renderer } = this;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateZScale(value) {
    this.wellObjs.scale.set(1, value, 1);
    this.surfaceObjs.scale.set(1, value, 1);
  }

  render() {
    this.frame = requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  }

  unMount() {
      console.log('unmounting');
      cancelAnimationFrame(this.frame);
      this.ambientLight = null;
      this.directionalLight = null;
      this.camera = null;
      this.controls = null;
      this.renderer = null;
      this.scene = null;
      this.gui.destroy();
  }
}
