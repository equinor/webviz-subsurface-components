import * as THREE from 'three';
import * as d3 from 'd3';
import seismscale from './seism-scale';
let i = 999;

class SurfaceMesh {
  constructor (surface, colorscale, opacity = 1, visible = false, colordata = null, shiny = true) {
    this.colorscale = colorscale;
    this.opacity = opacity;
    this.data = surface.z
    this.name = surface.name
    this.size = surface.size
    this.colordata = colordata || surface.z
    this.opacity = opacity
    this.visible = visible
    this.shiny = shiny
    this.build();
  }

  build() {
    const { data, size, name, visible, colordata, shiny, colorscale, opacity } = this;
    const options = {
      side: THREE.DoubleSide,
      vertexColors: THREE.VertexColors,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity === 1,
    };
    const material = shiny ?
      new THREE.MeshPhongMaterial(options) :
      new THREE.MeshLambertMaterial(options);

    const segments = Math.sqrt(data.length) - 1;
    const geometry = new THREE.PlaneBufferGeometry(size.x, size.y, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    // geometry.rotateY(Math.PI);

    const colors = [];
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < data.length; i += 1) {
      vertices[i * 3 + 1] = -data[i];
      const clr = new THREE.Color(colorscale(colordata[i]));

      colors[i * 3] = clr.r;
      colors[i * 3 + 1] = clr.g;
      colors[i * 3 + 2] = clr.b;
    }
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    var mesh = new THREE.Mesh(
      geometry,
      material,
    );
    var wireframe = new THREE.LineSegments( geometry, material );
    mesh.add( wireframe );
    mesh.name = name;

    mesh.geometry.computeVertexNormals();
    mesh.renderOrder = i--;
    mesh.visible = visible;
    this.mesh = mesh;
    this.geometry = geometry;
  }
}

export function createSurfaceMeshes(surfaceData) {
  const rainbowScale = d3.scaleSequential()
    .interpolator(d3.interpolateHslLong('#f00', '#4B0082')).clamp(true);

  const rainbowScaleRev = d3.scaleSequential()
    .interpolator(d3.interpolateHslLong('#4B0082', '#f00')).clamp(true);

    const surfaceMeshes = surfaceData.map( d =>
        // console.log(Math.min(d.z), Math.max(d.z))
      new SurfaceMesh(d,rainbowScale.domain([Math.min(...d.z),Math.max(...d.z)]), 1, true)
    )
return surfaceMeshes
}
