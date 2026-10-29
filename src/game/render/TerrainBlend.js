// Three.js r186 MeshStandardMaterial hooks, checked against installed shader chunks.
// Geometry, not a shader displacement, remains the source of the Rapier terrain.
export function applyTerrainBlend(material, layers) {
 const names = ['rock','gravel','cracked'];
 material.onBeforeCompile = shader => {
 const declarations = ['varying vec3 auroraPosition;', 'varying vec3 auroraNormal;'];
 for (const name of names) {
 const maps = layers[name], prefix = `aurora_${name}`;
 shader.uniforms[`${prefix}Color`] = { value: maps.color };
 shader.uniforms[`${prefix}Normal`] = { value: maps.normal };
 shader.uniforms[`${prefix}Rough`] = { value: maps.arm || maps.roughness };
 shader.uniforms[`${prefix}Scale`] = { value: { x: 1 / maps.tileMeters[0], y: 1 / maps.tileMeters[1] } };
 declarations.push(`uniform sampler2D ${prefix}Color; uniform sampler2D ${prefix}Normal; uniform sampler2D ${prefix}Rough; uniform vec2 ${prefix}Scale;`);
 }
 shader.vertexShader = 'varying vec3 auroraPosition; varying vec3 auroraNormal;\n' + shader.vertexShader;
 shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nauroraPosition = (modelMatrix * vec4(position, 1.0)).xyz; auroraNormal = normalize(mat3(modelMatrix) * normal);');
 shader.fragmentShader = declarations.join('\n') + '\n' + shader.fragmentShader;
 const weights = `\n float az = auroraPosition.z;\n float at = max(0.0, -az - 240.0);\n float ax = sin(at / 390.0) * 24.0 * min(at / 300.0, 1.0);\n float ad = abs(auroraPosition.x - ax);\n if (az < -650.0 && az > -1750.0) ad = min(ad, abs(auroraPosition.x - ax - sin(clamp((-az - 650.0)/1100.0,0.0,1.0)*3.14159265)*350.0));\n float an = clamp(.5 + .26*sin(auroraPosition.x*.047 + sin(az*.031)) + .24*sin(az*.019 + auroraPosition.x*.023),0.0,1.0);\n float ar = clamp(smoothstep(.07,.36,1.0-normalize(auroraNormal).y) + smoothstep(4.0,12.0,auroraPosition.y - sin(az/180.0)*1.3)*.4,0.0,.92);\n float ag = (1.0-smoothstep(8.0,23.0,ad))*(1.0-ar)*.88;\n float ac = smoothstep(.35,.8,an)*(1.0-ar)*(1.0-ag)*.75;\n vec2 auv = auroraPosition.xz;\n `;
 const color = names.map((name, i) => `diffuseColor.rgb = mix(diffuseColor.rgb, texture2D(aurora_${name}Color, auv*aurora_${name}Scale).rgb, ${['ar','ag','ac'][i]});`).join('\n');
 shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' + weights + color);
 const roughness = names.map((name,i) => `roughnessFactor = mix(roughnessFactor, texture2D(aurora_${name}Rough, auv*aurora_${name}Scale).g, ${['ar','ag','ac'][i]});`).join('\n');
 shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n' + roughness);
 const normal = names.map((name,i) => `auroraMapN = normalize(mix(auroraMapN, texture2D(aurora_${name}Normal, auv*aurora_${name}Scale).xyz*2.0-1.0, ${['ar','ag','ac'][i]}));`).join('\n');
 shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `\n #ifdef USE_NORMALMAP_TANGENTSPACE\n vec3 auroraMapN = texture2D(normalMap, vNormalMapUv).xyz*2.0-1.0;\n ${normal}\n auroraMapN.xy *= normalScale;\n normal = normalize(tbn * auroraMapN);\n #else\n #include <normal_fragment_maps>\n #endif\n `);
 };
 material.customProgramCacheKey = () => 'aurora-terrain-blend-r186-v1';
 material.userData.terrainBlend = true; material.needsUpdate = true;
}