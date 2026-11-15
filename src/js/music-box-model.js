import * as THREE from '../../assets/vendor/three/three.module.js';

const smooth = value => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

// All pieces share one local coordinate system. The case stays still while its
// back hinge opens and the separate porcelain figurine turns on the spindle.
export function createMusicBox() {
  const group = new THREE.Group();
  group.name = 'Repetto miniature music box';
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const material = (color, roughness, metalness = 0, extra = {}) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    materials.add(value);
    return value;
  };
  const cream = material('#eee6d8', .23, .045);
  const lining = material('#dcb4ad', .92);
  const liningLight = material('#e8c6bf', .95);
  const gold = material('#bba581', .31, .72);
  const paleGold = material('#d7c7a8', .28, .54);
  const porcelain = material('#f7ede1', .27, .025);
  const satin = material('#d7a9a5', .46, .015);
  const pointe = material('#be8d91', .49);
  const hair = material('#9d8571', .49);

  function mesh(geometry, surface, parent = group, name = '') {
    geometries.add(geometry);
    const value = new THREE.Mesh(geometry, surface);
    value.name = name;
    value.castShadow = true;
    value.receiveShadow = true;
    parent.add(value);
    return value;
  }

  function rectangle(width, depth, radius) {
    const x = -width / 2;
    const y = -depth / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + depth - radius);
    shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
    shape.lineTo(x + radius, y + depth);
    shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }

  function slab(width, depth, height, radius, surface, y, parent = group, bevel = .015, hole = 0) {
    const shape = rectangle(width, depth, radius);
    if (hole) shape.holes.push(rectangle(width - hole * 2, depth - hole * 2, Math.max(.015, radius - hole)));
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      steps: 1,
      bevelEnabled: bevel > 0,
      bevelSegments: 2,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 7,
    });
    geometry.rotateX(-Math.PI / 2);
    const value = mesh(geometry, surface, parent);
    value.position.y = y;
    return value;
  }

  function ellipsoid(position, scale, surface, parent, name = '') {
    const value = mesh(new THREE.SphereGeometry(1, 20, 12), surface, parent, name);
    value.position.set(...position);
    value.scale.set(...scale);
    return value;
  }

  function tube(points, radiusStart, radiusEnd, surface, parent, segments = 22, radial = 7) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const positions = [];
    const indices = [];
    const reference = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const normal = new THREE.Vector3().crossVectors(tangent, reference).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, t);
      for (let j = 0; j <= radial; j++) {
        const angle = j / radial * Math.PI * 2;
        const vertex = point.clone().addScaledVector(normal, Math.cos(angle) * radius).addScaledVector(binormal, Math.sin(angle) * radius);
        positions.push(vertex.x, vertex.y, vertex.z);
        if (i < segments && j < radial) {
          const a = i * (radial + 1) + j;
          const b = a + radial + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return mesh(geometry, surface, parent);
  }

  // A gently rounded lacquer shell, an actual inset cavity and the narrow warm
  // metal line catch light independently rather than reading as one solid cube.
  slab(1.85, 1.5, .12, .145, cream, .105);
  slab(1.85, 1.5, .385, .145, cream, .225, group, .015, .085);
  slab(1.67, 1.32, .04, .073, liningLight, .385, group, .004);
  slab(1.67, 1.32, .16, .073, lining, .425, group, .004, .025);
  slab(1.85, 1.5, .012, .145, paleGold, .606, group, .003, .025);
  slab(1.80, 1.45, .018, .125, cream, .618, group, .003, .028);
  for (const x of [-.66, .66]) {
    for (const z of [-.51, .51]) ellipsoid([x, .077, z], [.06, .035, .06], gold, group, 'Small brass foot');
  }

  const frontClasp = ellipsoid([0, .573, .769], [.036, .024, .015], paleGold, group, 'Rounded front clasp');
  frontClasp.rotation.z = .12;

  const lid = new THREE.Group();
  lid.name = 'Opening lid';
  lid.position.set(0, .645, -.70);
  group.add(lid);
  const top = slab(1.85, 1.5, .085, .145, cream, 0, lid);
  top.position.z = .70;
  const lip = slab(1.77, 1.42, .012, .11, paleGold, -.015, lid, .003, .022);
  lip.position.z = .70;
  const liningFrame = slab(1.68, 1.33, .012, .085, lining, -.028, lid, .002, .048);
  liningFrame.position.z = .70;

  const mirrorCanvas = document.createElement('canvas');
  mirrorCanvas.width = 256;
  mirrorCanvas.height = 256;
  const mirrorContext = mirrorCanvas.getContext('2d');
  const mirrorGradient = mirrorContext.createLinearGradient(0, 240, 256, 20);
  mirrorGradient.addColorStop(0, '#adb8b4');
  mirrorGradient.addColorStop(.39, '#d5dcd5');
  mirrorGradient.addColorStop(.46, '#e5e7de');
  mirrorGradient.addColorStop(.56, '#c3cec7');
  mirrorGradient.addColorStop(1, '#c4cdc6');
  mirrorContext.fillStyle = mirrorGradient;
  mirrorContext.fillRect(0, 0, 256, 256);
  const mirrorTexture = new THREE.CanvasTexture(mirrorCanvas);
  mirrorTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(mirrorTexture);
  const mirrorSurface = material('#ffffff', .25, .22, { map: mirrorTexture });
  const mirrorGeometry = new THREE.ShapeGeometry(rectangle(1.53, 1.18, .055), 8);
  mirrorGeometry.rotateX(Math.PI / 2);
  const mirror = mesh(mirrorGeometry, mirrorSurface, lid, 'Muted silver mirror');
  mirror.position.set(0, -.043, .70);
  mirror.castShadow = false;
  mirror.receiveShadow = false;

  for (const x of [-.57, .57]) {
    const hinge = mesh(new THREE.CylinderGeometry(.027, .027, .27, 14), gold, group, 'Fine brass hinge');
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(x, .64, -.70);
  }

  const spindle = mesh(new THREE.CylinderGeometry(.021, .021, .065, 14), gold, group, 'Music mechanism spindle');
  spindle.position.set(0, .452, .06);
  const plinth = mesh(new THREE.CylinderGeometry(.155, .16, .045, 36), porcelain, group, 'Porcelain turntable');
  plinth.position.set(0, .489, .06);
  const plinthTrim = mesh(new THREE.TorusGeometry(.153, .006, 5, 40), paleGold, group);
  plinthTrim.rotation.x = Math.PI / 2;
  plinthTrim.position.set(0, .51, .06);

  const dancer = new THREE.Group();
  dancer.name = 'Turning porcelain ballerina';
  dancer.position.set(0, .513, .06);
  group.add(dancer);

  // An en-pointe support and a softly bent second leg retain a readable ballet
  // pose in profile as the figure turns, even at the small final display size.
  tube([[-.035, .58, 0], [-.043, .38, .009], [-.03, .19, .014], [-.035, .078, .025]], .039, .019, porcelain, dancer);
  tube([[.045, .58, 0], [.16, .44, .024], [.205, .365, .025], [.115, .31, .045], [.015, .305, .055]], .038, .016, porcelain, dancer);
  const supportingShoe = ellipsoid([-.037, .056, .023], [.026, .057, .031], pointe, dancer, 'Supporting pointe shoe');
  supportingShoe.rotation.x = -.10;
  const raisedShoe = ellipsoid([.012, .302, .061], [.025, .045, .024], pointe, dancer, 'Raised pointe shoe');
  raisedShoe.rotation.z = -1.13;
  tube([[-.053, .13, .027], [-.016, .159, .032], [-.049, .181, .014]], .004, .004, satin, dancer, 12, 5);
  tube([[-.014, .12, .008], [-.055, .15, .005], [-.02, .178, .01]], .004, .004, satin, dancer, 12, 5);

  const torsoPoints = [
    [.052, .565], [.079, .60], [.061, .65], [.054, .69],
    [.080, .75], [.105, .805], [.10, .835], [.038, .852],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  mesh(new THREE.LatheGeometry(torsoPoints, 28), porcelain, dancer, 'Porcelain torso');
  const bodicePoints = [
    [.079, .602], [.063, .65], [.057, .69], [.083, .75], [.099, .791],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  mesh(new THREE.LatheGeometry(bodicePoints, 28), satin, dancer, 'Blush satin bodice');
  tube([[0, .845, 0], [0, .88, -.002], [0, .916, -.003]], .029, .026, porcelain, dancer, 8, 10);
  ellipsoid([0, .978, 0], [.065, .083, .060], porcelain, dancer, 'Porcelain face');
  ellipsoid([0, .976, .059], [.012, .018, .014], porcelain, dancer, 'Delicate nose');
  const hairCap = mesh(new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, Math.PI * .53), hair, dancer, 'Swept hair');
  hairCap.scale.set(.066, .084, .062);
  hairCap.position.set(0, .982, -.007);
  ellipsoid([0, 1.018, -.066], [.034, .032, .029], hair, dancer, 'Small ballet bun');
  const bunRibbon = mesh(new THREE.TorusGeometry(.031, .004, 5, 22), satin, dancer, 'Bun ribbon');
  bunRibbon.position.set(0, 1.018, -.071);

  const leftArm = [[-.10, .817, 0], [-.189, .894, -.003], [-.221, 1.033, -.004], [-.164, 1.151, .008], [-.049, 1.202, .02]];
  const rightArm = [[.10, .817, 0], [.188, .905, 0], [.217, 1.043, .001], [.157, 1.159, .014], [.041, 1.202, .02]];
  tube(leftArm, .024, .012, porcelain, dancer, 30, 8);
  tube(rightArm, .024, .012, porcelain, dancer, 30, 8);
  ellipsoid([-.036, 1.204, .021], [.019, .011, .014], porcelain, dancer, 'Left hand');
  ellipsoid([.027, 1.204, .021], [.019, .011, .014], porcelain, dancer, 'Right hand');
  tube([[-.072, .767, .052], [-.088, .808, .028], [-.093, .828, -.005]], .006, .006, satin, dancer, 12, 5);
  tube([[.072, .767, .052], [.088, .808, .028], [.093, .828, -.005]], .006, .006, satin, dancer, 12, 5);

  for (let layer = 0; layer < 4; layer++) {
    const positions = [];
    const indices = [];
    const around = 72;
    const bands = 10;
    for (let band = 0; band <= bands; band++) {
      const t = band / bands;
      for (let i = 0; i <= around; i++) {
        const angle = i / around * Math.PI * 2;
        const ruffle = Math.sin(angle * 12 + layer * .5) * .012 * t * t;
        const radius = .061 + (.25 - layer * .012) * Math.pow(t, .68) + ruffle;
        const y = .625 - (.168 + layer * .013) * t + Math.sin(angle * 6 + layer * .4) * .012 * t * t;
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        if (band < bands && i < around) {
          const a = band * (around + 1) + i;
          const b = a + around + 1;
          indices.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const tulle = material(layer % 2 ? '#e8c6bf' : '#efd7ce', .88, 0, {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: layer === 3 ? .95 : .64,
      depthWrite: layer === 3,
    });
    mesh(geometry, tulle, dancer, `Scalloped tulle layer ${layer + 1}`);
  }
  const waistband = mesh(new THREE.TorusGeometry(.063, .007, 5, 32), satin, dancer, 'Satin waistband');
  waistband.rotation.x = Math.PI / 2;
  waistband.position.y = .627;

  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 1024;
  labelCanvas.height = 256;
  const labelContext = labelCanvas.getContext('2d');
  labelContext.fillStyle = '#5269ad';
  labelContext.font = '400 112px "Cormorant Garamond", Georgia, serif';
  labelContext.textAlign = 'center';
  labelContext.textBaseline = 'middle';
  const letters = 'REPETTO';
  const spacing = 104;
  for (let i = 0; i < letters.length; i++) labelContext.fillText(letters[i], 512 + (i - 3) * spacing, 130);
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(labelTexture);
  const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false });
  materials.add(labelMaterial);
  const label = mesh(new THREE.PlaneGeometry(.58, .145), labelMaterial, group, 'Repetto blue signature');
  label.position.set(0, .365, .768);
  label.castShadow = false;
  label.receiveShadow = false;

  function update(progress, elapsedSeconds) {
    const elapsed = Math.max(0, elapsedSeconds);
    const opening = 1 - Math.pow(1 - THREE.MathUtils.clamp(elapsed / .82, 0, 1), 3);
    lid.rotation.x = -1.79 * opening;
    const lift = smooth((elapsed - .12) / .48);
    dancer.visible = lift > .01;
    dancer.scale.setScalar(.48 + .52 * lift);
    dancer.position.y = .38 + .133 * lift;
    dancer.rotation.y = -.3 + Math.max(0, elapsed - .22) * 1.63;
    group.rotation.y = -.035;
    return progress >= 1;
  }

  update(0, 0);
  return {
    group,
    lid,
    dancer,
    update,
    dispose() {
      for (const value of geometries) value.dispose();
      for (const value of materials) value.dispose();
      for (const value of textures) value.dispose();
    },
  };
}
