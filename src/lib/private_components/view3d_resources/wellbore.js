import * as THREE from 'three';

class Wellbore{
    constructor (points, thickness, textureName) {
        this.points = points;
        this.thickness = thickness;
        this.textureName = textureName;
        this.build();
      }

    build() {
        const curve = new THREE.CatmullRomCurve3(
            this.points,
            false,
        );

        const wellboreTube = new THREE.TubeBufferGeometry(curve, 512, this.thickness, 18, false);

        let material;

        if(this.textureName){
            const texture = new THREE.TextureLoader().load(this.textureName);
            material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                map: texture
            });
        }
        else{
            material = new THREE.MeshPhongMaterial({
                color: 0x707070,
                side: THREE.DoubleSide,
                shininess: 70,
            });
        }



        this.mesh = new THREE.Mesh(wellboreTube, material);
    }

}

export function getWellborePoints(wellPath, center) {
    // const selectedWell = welldata.filter(d => d.wellboreGuid == wellboreGuid)[0];
    const refEasting = center.easting;
    const refNorthing = center.northing;

    const data = wellPath.positionLog;
    const points = data.map(d => new THREE.Vector3(
        d[0] - refEasting,
        -d[2],
        -(d[1] - refNorthing),
    ));

    return points;
}


export function createWellbore(wellPath, thickness, center, stratColumnEnabled) {
    const points = getWellborePoints(wellPath, center);

    const wellbore = new Wellbore(points, thickness, (stratColumnEnabled && wellboreGuid == '0')?'stratcoloumn_16_2_E_4.png':undefined);
    return wellbore;
}
