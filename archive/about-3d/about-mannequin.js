// An original, volumetric interpretation of the About photograph.
// No reference-site geometry or textures are used. Front is +Z, Y is up.
export function createBalletMannequin(THREE) {
  const group = new THREE.Group();
  group.name = 'Repetto blush ballet dress';
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const TAU = Math.PI * 2;

  function mesh(geometry, material, name, castShadow = true) {
    const item = new THREE.Mesh(geometry, material);
    item.name = name;
    item.castShadow = castShadow;
    item.receiveShadow = true;
    geometries.add(geometry);
    materials.add(material);
    group.add(item);
    return item;
  }

  function fabricTexture(kind) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const pixels = context.createImageData(512, 512);
    let seed = 73421;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let y = 0; y < 512; y += 1) {
      for (let x = 0; x < 512; x += 1) {
        const at = (y * 512 + x) * 4;
        const vertical = Math.sin(x * Math.PI / 3);
        const diagonal = Math.sin((x + y) * Math.PI / 5);
        const grain = random() - .5;
        const value = kind === 'net'
          ? 184 + Math.abs(vertical) * 42 + Math.abs(diagonal) * 18 + grain * 8
          : 219 + vertical * 7 + Math.sin(y * Math.PI / 2) * 4 + grain * 22;
        pixels.data[at] = pixels.data[at + 1] = pixels.data[at + 2] = value;
        pixels.data[at + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(kind === 'net' ? 18 : 10, kind === 'net' ? 5 : 8);
    texture.anisotropy = 4;
    textures.add(texture);
    return texture;
  }

  const weave = fabricTexture('weave');
  const net = fabricTexture('net');
  const ceramic = new THREE.MeshPhysicalMaterial({
    color: '#f4f2ef', roughness: .34, metalness: 0,
    clearcoat: .22, clearcoatRoughness: .42, specularIntensity: .42,
  });
  const neckInterior = new THREE.MeshStandardMaterial({
    color: '#d9d5d0', roughness: .66, metalness: 0, side: THREE.DoubleSide,
  });
  const satin = new THREE.MeshPhysicalMaterial({
    color: '#edc0b2', roughness: .77, metalness: 0,
    sheen: .65, sheenColor: new THREE.Color('#fff2e6'), sheenRoughness: .88,
    specularIntensity: .28, bumpMap: weave, bumpScale: .0028,
  });
  const foldedSatin = satin.clone();
  foldedSatin.color.set('#f0c8ba');
  foldedSatin.roughness = .7;
  const lining = new THREE.MeshPhysicalMaterial({
    color: '#e9bcae', roughness: .92, metalness: 0,
    sheen: .5, sheenColor: new THREE.Color('#fff0df'), sheenRoughness: 1,
    specularIntensity: .18, bumpMap: weave, bumpScale: .0035,
    side: THREE.DoubleSide,
  });

  // Smooth interpolation of a human-shaped, elliptical cross section.
  function profileAt(profile, y) {
    let index = 0;
    while (index < profile.length - 2 && y > profile[index + 1][0]) index += 1;
    const p0 = profile[Math.max(0, index - 1)];
    const p1 = profile[index];
    const p2 = profile[index + 1];
    const p3 = profile[Math.min(profile.length - 1, index + 2)];
    const t = Math.max(0, Math.min(1, (y - p1[0]) / (p2[0] - p1[0])));
    const catmull = (a, b, c, d) => .5 * (
      2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t
      + (-a + 3 * b - 3 * c + d) * t * t * t
    );
    return [catmull(p0[1], p1[1], p2[1], p3[1]), catmull(p0[2], p1[2], p2[2], p3[2])];
  }

  function surface(pointAt, radialSegments = 256, verticalSegments = 80, flip = false, closedProfile = false) {
    const positions = [];
    const uv = [];
    const indices = [];
    for (let row = 0; row <= verticalSegments; row += 1) {
      const t = row / verticalSegments;
      for (let col = 0; col <= radialSegments; col += 1) {
        const u = col / radialSegments;
        const point = pointAt(t, u * TAU);
        positions.push(point[0], point[1], point[2]);
        uv.push(u, 1 - t);
      }
    }
    for (let row = 0; row < verticalSegments; row += 1) {
      for (let col = 0; col < radialSegments; col += 1) {
        const a = row * (radialSegments + 1) + col;
        const b = a + radialSegments + 1;
        if (flip) indices.push(a, b, a + 1, a + 1, b, b + 1);
        else indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    // UV seam vertices share a normal so the turning model never shows a hard seam.
    const normals = geometry.getAttribute('normal');
    for (let row = 0; row <= verticalSegments; row += 1) {
      const first = row * (radialSegments + 1);
      const last = first + radialSegments;
      const normal = new THREE.Vector3().fromBufferAttribute(normals, first)
        .add(new THREE.Vector3().fromBufferAttribute(normals, last)).normalize();
      normals.setXYZ(first, normal.x, normal.y, normal.z);
      normals.setXYZ(last, normal.x, normal.y, normal.z);
    }
    if (closedProfile) {
      for (let col = 0; col <= radialSegments; col += 1) {
        const last = verticalSegments * (radialSegments + 1) + col;
        const normal = new THREE.Vector3().fromBufferAttribute(normals, col)
          .add(new THREE.Vector3().fromBufferAttribute(normals, last)).normalize();
        normals.setXYZ(col, normal.x, normal.y, normal.z);
        normals.setXYZ(last, normal.x, normal.y, normal.z);
      }
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }

  const bodyProfile = [
    [.86, .403, .284], [1.02, .427, .308], [1.22, .469, .337],
    [1.42, .548, .377], [1.63, .644, .398], [1.83, .695, .381],
    [1.98, .697, .353], [2.075, .663, .332], [2.15, .544, .294],
    [2.22, .369, .226], [2.31, .207, .169], [2.4, .179, .145],
    [2.48, .174, .143],
  ];
  mesh(surface((t, angle) => {
    const originalY = .86 + t * 1.62;
    const y = originalY - Math.pow(Math.max(0, (originalY - 2.32) / .16), 2) * Math.cos(angle) * .025;
    const [rx, rz] = profileAt(bodyProfile, originalY);
    const x = Math.sin(angle) * rx;
    const front = Math.max(0, Math.cos(angle));
    const breast = .019 * Math.exp(-Math.pow((Math.abs(x) - .245) / .17, 2) - Math.pow((y - 1.73) / .19, 2));
    const collarboneY = 2.105 + Math.abs(x) * .095;
    const collarbone = .011 * Math.exp(-Math.pow((Math.abs(x) - .265) / .2, 2) - Math.pow((y - collarboneY) / .026, 2));
    const suprasternal = -.014 * Math.exp(-Math.pow(x / .07, 2) - Math.pow((y - 2.219) / .05, 2));
    const sternum = .007 * Math.exp(-Math.pow(x / .13, 2) - Math.pow((y - 2.09) / .18, 2));
    return [x, y, Math.cos(angle) * rz + (breast + collarbone + sternum + suprasternal) * front ** 6];
  }, 224, 100), ceramic, 'Smooth ceramic mannequin');

  // A real opening, rounded rim and inner neck wall, rather than a flat capped cone.
  mesh(surface((t, angle) => {
    const y = 2.477 - t * .135 - Math.cos(angle) * .025 * (1 - t);
    return [Math.sin(angle) * (.157 - t * .002), y, Math.cos(angle) * (.126 - t * .002)];
  }, 160, 10, true), neckInterior, 'Hollow neck interior', false);
  mesh(surface((t, angle) => {
    const profileAngle = t * Math.PI;
    const rx = .1655 + Math.cos(profileAngle) * .0085;
    const rz = .1345 + Math.cos(profileAngle) * .0085;
    return [Math.sin(angle) * rx, 2.48 + Math.sin(profileAngle) * .008 - Math.cos(angle) * .025, Math.cos(angle) * rz];
  }, 160, 12), ceramic, 'Rounded neck lip');
  const innerCapGeometry = new THREE.CircleGeometry(1, 96);
  innerCapGeometry.rotateX(-Math.PI / 2);
  const innerCap = mesh(innerCapGeometry, neckInterior, 'Neck cavity floor', false);
  innerCap.scale.set(.155, 1, .124);
  innerCap.position.y = 2.34;

  const bodiceProfile = [
    [.94, .438, .312], [1.04, .441, .318], [1.23, .483, .346],
    [1.43, .558, .385], [1.64, .653, .405], [1.83, .702, .39],
    [1.95, .711, .363],
  ];
  mesh(surface((t, angle) => {
    const y = .94 + t * 1.01;
    const [rx, rz] = profileAt(bodiceProfile, y);
    const x = Math.sin(angle) * rx;
    const front = Math.max(0, Math.cos(angle));
    const breast = .014 * Math.exp(-Math.pow((Math.abs(x) - .245) / .18, 2) - Math.pow((y - 1.72) / .2, 2));
    return [x, y, Math.cos(angle) * rz + breast * front ** 6];
  }, 224, 72), satin, 'Fitted peach satin bodice');

  const bandProfile = [
    [1.954, .722, .426], [1.967, .729, .433], [1.969, .735, .437],
    [1.957, .739, .440], [1.905, .739, .441], [1.69, .722, .439],
    [1.65, .707, .436], [1.636, .700, .433], [1.634, .695, .429],
    [1.641, .691, .425], [1.667, .690, .422], [1.938, .711, .417],
  ];
  mesh(surface((t, angle) => {
    const value = t * bandProfile.length;
    const index = Math.floor(value) % bandProfile.length;
    const blend = value - Math.floor(value);
    const previous = bandProfile[(index + bandProfile.length - 1) % bandProfile.length];
    const a = bandProfile[index];
    const b = bandProfile[(index + 1) % bandProfile.length];
    const following = bandProfile[(index + 2) % bandProfile.length];
    const interpolate = coordinate => {
      const p = previous[coordinate], q = a[coordinate];
      const r = b[coordinate], s = following[coordinate];
      return .5 * (2 * q + (-p + r) * blend
        + (2 * p - 5 * q + 4 * r - s) * blend ** 2
        + (-p + 3 * q - 3 * r + s) * blend ** 3);
    };
    const y = interpolate(0);
    const rx = interpolate(1);
    const rz = interpolate(2);
    const subtleFold = .0016 * Math.sin(angle * 11) * Math.sin(t * Math.PI);
    return [Math.sin(angle) * (rx + subtleFold), y, Math.cos(angle) * (rz + subtleFold)];
  }, 256, 72, true, true), foldedSatin, 'Rolled off-shoulder fold', false);

  function skirtPoint(t, angle, spread, length, phase) {
    const radius = .427 + (1.187 + spread) * t ** .94 + .052 * Math.sin(t * Math.PI);
    const drift = Math.sin(angle * 4 + phase) * .64 + t * 1.15 + Math.sin(t * 4 + angle * 2) * .25;
    const folds = Math.sin(angle * 31 + drift + phase) * .010
      + Math.sin(angle * 47 - t * 1.38 + phase * 1.4) * .005
      + Math.sin(angle * 11 + phase + t * .9) * .019
      + Math.sin(angle * 6 - t * 1.7 + phase) * .014;
    const gathered = folds * (.06 + .94 * Math.pow(t, .67));
    const hem = t ** 12 * (.025 * Math.sin(angle * 9 + phase) + .012 * Math.sin(angle * 17 - phase));
    const y = .989 - length * t + hem;
    const softAsymmetry = .009 * Math.sin(angle * 3 + t * 2 + phase) * t;
    return [Math.sin(angle) * (radius + gathered), y, Math.cos(angle) * (radius * .735 + gathered + softAsymmetry)];
  }

  mesh(surface((t, angle) => skirtPoint(t, angle, -.035, 3.358, .13), 512, 104, true), lining, 'Pleated inner skirt');

  const layerSettings = [
    { spread: .005, length: 3.436, phase: .7, opacity: .22 },
    { spread: .028, length: 3.458, phase: 1.6, opacity: .18 },
    { spread: .055, length: 3.475, phase: 2.8, opacity: .15 },
    { spread: .082, length: 3.468, phase: 4.1, opacity: .13 },
  ];
  layerSettings.forEach((settings, index) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: index % 2 ? '#f5d1c3' : '#f0c8b9',
      roughness: .93, metalness: 0, transparent: true,
      opacity: settings.opacity, depthWrite: false, side: THREE.DoubleSide,
      alphaMap: net, bumpMap: weave, bumpScale: .002,
      sheen: .8, sheenColor: new THREE.Color('#fff6ed'), sheenRoughness: .95,
      specularIntensity: .16,
    });
    const layer = mesh(surface((t, angle) => skirtPoint(t, angle, settings.spread, settings.length, settings.phase), 512, 104, true), material, `Fine tulle layer ${index + 1}`, false);
    layer.renderOrder = index + 1;
  });

  // The single, understated gathered seam is visible in the source photograph.
  const waistPoints = Array.from({ length: 161 }, (_, i) => {
    const angle = i / 160 * TAU;
    return new THREE.Vector3(Math.sin(angle) * .439, .959, Math.cos(angle) * .316);
  });
  const waistCurve = new THREE.CatmullRomCurve3(waistPoints, true);
  const seamMaterial = new THREE.MeshStandardMaterial({ color: '#deb6a3', roughness: .91 });
  mesh(new THREE.TubeGeometry(waistCurve, 192, .002, 6, true), seamMaterial, 'Waist joining seam', false);

  // A discreet matching back seam makes the reverse a complete garment.
  const seamPoints = Array.from({ length: 30 }, (_, i) => {
    const y = .98 + i / 29 * .64;
    const [, rz] = profileAt(bodiceProfile, y);
    return new THREE.Vector3(0, y, -rz - .0018);
  });
  const backSeam = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints), 64, .0015, 4, false), seamMaterial, 'Subtle matching back seam', false);
  backSeam.receiveShadow = false;

  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3());
  group.userData.dimensions = { width: size.x, height: size.y, depth: size.z, top: bounds.max.y, bottom: bounds.min.y };
  group.userData.front = '+Z';
  group.userData.materials = { ceramic, satin, foldedSatin, lining };
  group.userData.resources = { geometries, materials, textures };
  group.userData.dispose = () => {
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
  };
  return group;
}
