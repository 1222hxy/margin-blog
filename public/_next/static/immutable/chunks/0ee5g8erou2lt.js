(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,498764,e=>{"use strict";var t=e.i(101372),a=e.i(901962),r=e.i(215453),o=e.i(7284),i=e.i(517172),n=e.i(378939),s=e.i(218547),l=e.i(26992),u=e.i(364250),c=e.i(939951),h=e.i(409703),p=e.i(8864),f=e.i(77994),d=e.i(34155),m=e.i(460590);function g({children:e,isValidProp:r,...o}){r&&(0,d.P)(r);let i=(0,a.useContext)(f.f);(o={...i,...o}).transition=(0,p.f)(o.transition,i.transition),o.isStatic=(0,m.f)(()=>o.isStatic);let n=(0,a.useMemo)(()=>o,[JSON.stringify(o.transition),o.transformPagePoint,o.reducedMotion,o.skipAnimations]);return(0,t.jsx)(f.f.Provider,{value:n,children:e})}var v=e.i(733873),S=e.i(695418),x=e.i(953065),y=e.i(63295),w=h;let P={animated:!0,enabled:!0,ghosts:.1,halo:.12,intensity:.3,secondary:.25,streakLength:1,streaks:.18,verticalStreaks:0},b={distortion:.68,drift:!0,driftStrength:.28,enabled:!0,grain:.031,procedural:.18,texture:.27},M=`
  uniform sampler2D uDirtTexture;
  uniform vec2 uCenter;
  uniform float uAnimated;
  uniform float uAspect;
  uniform float uDirtyGlassEnabled;
  uniform float uDistortion;
  uniform float uDirtTextureAspect;
  uniform vec2 uDirtTextureOffset;
  uniform float uDirtTextureRotation;
  uniform float uFlareEnabled;
  uniform float uCrossFlares;
  uniform float uStarburst;
  uniform float uStarburstScale;
  uniform float uMaxStarburstRadius;
  uniform float uViewportHeight;
  uniform float uGhosts;
  uniform float uGrain;
  uniform float uHalo;
  uniform float uIntensity;
  uniform float uProceduralDirt;
  uniform vec2 uSecondaryCenters[5];
  uniform vec3 uSecondaryColors[5];
  uniform float uRayOscillation[5];
  uniform float uSecondaryScales[5];
  uniform float uSecondaryIntensity;
  uniform float uSecondaryVisibility[5];
  uniform float uStreakLength;
  uniform float uStreaks;
  uniform float uTime;
  uniform float uPulseSpeed;
  uniform float uTextureDirt;
  uniform float uVerticalStreaks;
  uniform float uVisibility;

  float astraHash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float astraNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = astraHash(cell);
    float b = astraHash(cell + vec2(1.0, 0.0));
    float c = astraHash(cell + vec2(0.0, 1.0));
    float d = astraHash(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float astraFbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 4; octave++) {
      value += astraNoise(point) * amplitude;
      point = point * 2.03 + vec2(17.13, 9.71);
      amplitude *= 0.5;
    }

    return value;
  }

  float astraSmudge(vec2 uv, vec2 center, vec2 scale) {
    vec2 point = (uv - center) * scale;
    return exp(-dot(point, point));
  }

  float softDisc(vec2 point, float radius, float softness) {
    return 1.0 - smoothstep(radius - softness, radius + softness, length(point));
  }

  float softRing(vec2 point, float radius, float width) {
    float distanceToRing = abs(length(point) - radius);
    return 1.0 - smoothstep(width, width * 2.0, distanceToRing);
  }

  vec2 aspectCorrect(vec2 point) {
    point.x *= uAspect;
    return point;
  }

  vec2 coverTextureUv(vec2 uv, float viewportAspect, float textureAspect) {
    vec2 centeredUv = uv - 0.5;

    if (viewportAspect > textureAspect) {
      centeredUv.y *= textureAspect / viewportAspect;
    } else {
      centeredUv.x *= viewportAspect / textureAspect;
    }

    return centeredUv + 0.5;
  }

  float secondaryFlare(vec2 center, vec2 uv) {
    vec2 point = aspectCorrect(uv - center);
    float distanceToSource = length(point);
    float core = exp(-distanceToSource * 48.0) * 0.34;
    float halo = exp(-distanceToSource * 17.0) * 0.075;
    float horizontalWindow = 1.0 - smoothstep(
      uStreakLength * 0.72,
      uStreakLength,
      abs(point.x)
    );
    float verticalWindow = 1.0 - smoothstep(
      uStreakLength * 0.72,
      uStreakLength,
      abs(point.y)
    );
    horizontalWindow = mix(horizontalWindow, 1.0, step(0.99, uStreakLength));
    verticalWindow = mix(verticalWindow, 1.0, step(0.99, uStreakLength));
    float horizontalStreak = exp(-abs(point.y) * 360.0)
      * exp(-abs(point.x) * 10.0) * horizontalWindow * 0.42;
    float verticalStreak = exp(-abs(point.x) * 360.0)
      * exp(-abs(point.y) * 10.0) * verticalWindow * 0.42 * uVerticalStreaks;

    return core + halo + (horizontalStreak + verticalStreak) * uCrossFlares;
  }

  vec3 starburstFlare(vec2 center, vec2 uv, vec3 tint, float sourceScale, float oscillation) {
    float rayLength = max(uStreakLength, 0.001);
    float flareScale = max(uStarburstScale, 0.1);
    if (uMaxStarburstRadius > 0.0) {
      flareScale = min(flareScale, uMaxStarburstRadius / max(uViewportHeight * rayLength, 0.001));
    }
    // Only the main star has an enlarged flare source; the stream highlights use scale 1.
    float mainStar = smoothstep(1.0, 2.0, sourceScale);
    oscillation *= 1.0 + 1.4 * mainStar;
    rayLength *= 1.0 + 0.18 * mainStar;
    float desktopScale = 1.0 + 0.12 * mainStar * smoothstep(768.0, 1024.0, uViewportHeight * uAspect);
    vec2 point = aspectCorrect(uv - center) / max(flareScale * sourceScale * desktopScale, 0.001);
    vec2 p = abs(point);
    float radius = length(point);
    // A small white diamond joins four needle-like rays. Widen only at the
    // core, with a pixel-sized floor to keep the rays stable on small screens.
    float diamond = pow(max(1.0 - (p.x + p.y) / 0.008, 0.0), 1.6);
    float core = exp(-dot(point, point) / 0.000012);
    float horizontalWidth = max(0.00055 + 0.0014 * exp(-p.x * 200.0), fwidth(point.y) * 0.65);
    float verticalWidth = max(0.00055 + 0.0014 * exp(-p.y * 200.0), fwidth(point.x) * 0.65);
    float horizontalLength = rayLength * (1.0 + oscillation);
    float verticalLength = rayLength * (1.0 - oscillation);
    float horizontal = exp(-p.y / horizontalWidth) * exp(-p.x / (horizontalLength * 0.28))
      * (1.0 - smoothstep(horizontalLength * 0.45, horizontalLength, p.x));
    float vertical = exp(-p.x / verticalWidth) * exp(-p.y / (verticalLength * 0.28))
      * (1.0 - smoothstep(verticalLength * 0.45, verticalLength, p.y)) * uVerticalStreaks;
    // A shorter, Gaussian-soft diagonal cross sits behind the sharp needles.
    vec2 diagonalPoint = vec2(point.x + point.y, point.y - point.x) * 0.70710678;
    vec2 diagonal = abs(diagonalPoint);
    vec2 diagonalWidth = max(
      vec2(0.0025) + 0.002 * exp(-diagonal * 180.0),
      fwidth(diagonalPoint.yx) * 1.1
    );
    vec2 diagonalLength = rayLength * (1.0 + 0.25 * mainStar)
      * vec2(1.0 + oscillation, 1.0 - oscillation);
    vec2 diagonalRays = exp(-pow(diagonal.yx / diagonalWidth, vec2(2.0)))
      * exp(-diagonal / (diagonalLength * 0.18))
      * (1.0 - smoothstep(diagonalLength * 0.25, diagonalLength * 0.68, diagonal));
    float fineRays = 0.0;
    if (mainStar > 0.0) {
      // Fold the eight octants onto the ray halfway between each pair of spikes.
      vec2 octant = vec2(max(p.x, p.y), min(p.x, p.y));
      float across = dot(octant, vec2(-0.38268343, 0.92387953));
      float width = max(0.0012, max(fwidth(point.x), fwidth(point.y)) * 0.65);
      float reach = rayLength * (1.0 + oscillation);
      fineRays = exp(-across * across / (width * width)) * exp(-radius / (reach * 0.15))
        * (1.0 - smoothstep(reach * 0.24, reach * 0.48, radius)) * mainStar;
    }
    float glow = exp(-radius * 135.0) * 0.65 + exp(-radius * 55.0) * 0.035;
    vec3 rayColor = mix(tint, vec3(1.0), 0.36);
    return vec3(diamond * 7.0 + core * 5.0)
      + rayColor * (horizontal + vertical) * 3.8 * uCrossFlares
      + tint * (diagonalRays.x + diagonalRays.y) * (0.42 + 0.10 * mainStar) * uCrossFlares
      + tint * fineRays * 0.32 * uCrossFlares
      + tint * glow;
  }

  void mainImage(
    const in vec4 inputColor,
    const in vec2 uv,
    out vec4 outputColor
  ) {
    vec3 base = inputColor.rgb;
    vec2 source = aspectCorrect(uv - uCenter);
    float sourceDistance = length(source);
    float pulse = mix(1.0, 0.965 + 0.035 * sin(uTime * uPulseSpeed), uAnimated);

    float core = exp(-sourceDistance * 38.0) * 0.58;
    float halo = exp(-sourceDistance * 11.5) * uHalo;
    halo += softRing(source, 0.105, 0.006) * 0.05 * uHalo;

    float horizontalWindow = 1.0 - smoothstep(
      uStreakLength * 0.72,
      uStreakLength,
      abs(source.x)
    );
    float verticalWindow = 1.0 - smoothstep(
      uStreakLength * 0.72,
      uStreakLength,
      abs(source.y)
    );
    horizontalWindow = mix(horizontalWindow, 1.0, step(0.99, uStreakLength));
    verticalWindow = mix(verticalWindow, 1.0, step(0.99, uStreakLength));
    float horizontalStreak = exp(-abs(source.y) * 310.0)
      * exp(-abs(source.x) * 7.5) * horizontalWindow;
    float softHorizontalStreak = exp(-abs(source.y) * 78.0)
      * exp(-abs(source.x) * 5.2) * horizontalWindow * 0.16;
    float verticalStreak = exp(-abs(source.x) * 310.0)
      * exp(-abs(source.y) * 7.5) * verticalWindow;
    float softVerticalStreak = exp(-abs(source.x) * 78.0)
      * exp(-abs(source.y) * 5.2) * verticalWindow * 0.16;
    float streak = (
      horizontalStreak +
      softHorizontalStreak +
      (verticalStreak + softVerticalStreak) * uVerticalStreaks
    ) * uStreaks * uCrossFlares;

    vec2 opticalAxis = vec2(0.5) - uCenter;
    float centeredSource = 1.0 - smoothstep(0.035, 0.16, length(opticalAxis));
    opticalAxis += vec2(-0.22, 0.09) * centeredSource;
    vec2 ghostA = aspectCorrect(uv - (uCenter + opticalAxis * 0.82));
    vec2 ghostB = aspectCorrect(uv - (uCenter + opticalAxis * 1.38));
    vec2 ghostC = aspectCorrect(uv - (uCenter + opticalAxis * 1.82));
    float ghosts = 0.0;
    ghosts += softDisc(ghostA, 0.016, 0.014) * 0.18;
    ghosts += softRing(ghostB, 0.046, 0.006) * 0.11;
    ghosts += softDisc(ghostC, 0.025, 0.02) * 0.08;
    ghosts *= uGhosts;

    float flare = (core + halo + streak + ghosts) * uIntensity * pulse;
    vec3 secondary = vec3(0.0);
    float secondaryDirtHalo = 0.0;
    for (int i = 0; i < 5; i++) {
      vec3 secondaryLight = uStarburst > 0.5
        ? starburstFlare(uSecondaryCenters[i], uv, uSecondaryColors[i], uSecondaryScales[i], uRayOscillation[i])
        : vec3(0.956) * secondaryFlare(uSecondaryCenters[i], uv);
      secondary += secondaryLight
        * uSecondaryVisibility[i];
      secondaryDirtHalo += exp(
        -length(aspectCorrect(uv - uSecondaryCenters[i])) * 10.0
      ) * uSecondaryVisibility[i];
    }
    secondary *= uIntensity * uSecondaryIntensity;
    vec3 flareColor = (vec3(0.956) * flare * uVisibility + secondary) * uFlareEnabled;

    vec3 opticalColor = base + flareColor;
    if (uDirtyGlassEnabled == 0.0) {
      outputColor = vec4(max(opticalColor, vec3(0.0)), inputColor.a);
      return;
    }

    float luminance = dot(opticalColor, vec3(0.2126, 0.7152, 0.0722));
    float reveal = smoothstep(0.025, 0.72, luminance);
    vec2 glassUv = vec2(uv.x * uAspect, uv.y);

    float broadDirt = astraFbm(glassUv * 2.15 + vec2(1.37, 7.91));
    float fineDirt = astraFbm(glassUv * 8.4 + vec2(12.4, 3.2));
    float smudges = astraSmudge(uv, vec2(0.25, 0.68), vec2(2.1, 5.4));
    smudges += astraSmudge(uv, vec2(0.76, 0.31), vec2(3.6, 2.2)) * 0.8;
    float dirtPattern = clamp(
      (broadDirt - 0.5) * 1.15 +
      (fineDirt - 0.5) * 0.42 +
      smudges * 0.32,
      -0.55,
      0.75
    );
    float proceduralDirt = smoothstep(-0.32, 0.46, dirtPattern);
    vec2 driftingDirtUv = uv - 0.5;
    float dirtRotationCos = cos(uDirtTextureRotation);
    float dirtRotationSin = sin(uDirtTextureRotation);
    driftingDirtUv = mat2(
      dirtRotationCos,
      -dirtRotationSin,
      dirtRotationSin,
      dirtRotationCos
    ) * driftingDirtUv;
    driftingDirtUv += uDirtTextureOffset;
    vec2 dirtTextureUv = clamp(coverTextureUv(
      driftingDirtUv + 0.5,
      uAspect,
      uDirtTextureAspect
    ), vec2(0.001), vec2(0.999));
    vec3 dirtTextureColor = texture2D(uDirtTexture, dirtTextureUv).rgb;
    float dirtTextureLuminance = dot(
      dirtTextureColor,
      vec3(0.2126, 0.7152, 0.0722)
    );
    float photographicDirt = smoothstep(0.1, 0.72, dirtTextureLuminance);
    float textureDirtAmount = uTextureDirt * uDirtyGlassEnabled;
    float proceduralDirtAmount = uProceduralDirt * uDirtyGlassEnabled;
    float dirtMask = clamp(
      photographicDirt * textureDirtAmount +
      proceduralDirt * proceduralDirtAmount,
      0.0,
      1.0
    );
    float dirtVariation = clamp(
      (photographicDirt - 0.4) * textureDirtAmount +
      (proceduralDirt - 0.4) * proceduralDirtAmount,
      -0.7,
      0.9
    );
    float dirtReveal = smoothstep(0.008, 0.2, luminance)
      * (1.0 - smoothstep(0.9, 3.0, luminance) * 0.68);
    float primaryDirtHalo = exp(-sourceDistance * 6.5) * uVisibility;
    float dirtHalo = (
      primaryDirtHalo + secondaryDirtHalo * uSecondaryIntensity
    ) * uIntensity * uFlareEnabled;

    vec2 warpField = vec2(
      astraFbm(glassUv * 3.1 + vec2(3.7, 1.2)),
      astraFbm(glassUv * 3.1 + vec2(9.1, 6.4))
    ) - 0.5;
    vec2 warp = warpField
      * vec2(1.0 / max(uAspect, 0.001), 1.0)
      * uDistortion * 0.004;
    vec3 warpedBase = texture2D(
      inputBuffer,
      clamp(uv + warp, vec2(0.001), vec2(0.999))
    ).rgb;
    opticalColor += (warpedBase - base)
      * reveal * uDirtyGlassEnabled * 0.55;
    opticalColor *= 1.0 + dirtVariation
      * dirtReveal * 0.82;
    opticalColor += vec3(max(dirtVariation, 0.0))
      * dirtReveal
      * (0.022 + min(luminance, 0.8) * 0.055);
    opticalColor += vec3(0.956)
      * dirtHalo
      * dirtMask * 0.14;

    float grain = astraHash(floor(uv * vec2(1536.0, 1024.0)));
    opticalColor += vec3((grain - 0.5) * uGrain)
      * (0.18 + reveal * 0.82) * uDirtyGlassEnabled;

    outputColor = vec4(max(opticalColor, vec3(0.0)), inputColor.a);
  }
`;class A extends w.x{dirtDriftOffset=new S.wq;dirtDriftTarget=new S.wq;dirtDriftRotation=0;projectedPosition=new S.cE;sourceWorldPosition=new S.cE;occlusionRay=new S.zx;occlusionNdc=new S.wq;occlusionHit=new S.cE;occlusionSpheres=[];occluderCount=0;secondaryProjectedPositions=Array.from({length:5},()=>new S.cE);aspect=1;animated=!0;intensity=P.intensity;intensityScale=1;constructor(e,t,a=b){let r;super("AstraLensFlare",M,{blendFunction:w.d.NORMAL,uniforms:new Map([["uAnimated",new S.MY(1)],["uAspect",new S.MY(1)],["uCenter",new S.MY(new S.wq(.5,.5))],["uDirtTexture",new S.MY(t)],["uDirtTextureAspect",new S.MY((r=t.image,!r?.width||!r.height?2/3:r.width/r.height))],["uDirtTextureOffset",new S.MY(new S.wq)],["uDirtTextureRotation",new S.MY(0)],["uDirtyGlassEnabled",new S.MY(+!!a.enabled)],["uDistortion",new S.MY(a.distortion)],["uFlareEnabled",new S.MY(+!!e.enabled)],["uCrossFlares",new S.MY(+(!1!==e.crossFlares))],["uStarburst",new S.MY(+("starburst"===e.profile))],["uStarburstScale",new S.MY(e.secondaryScale??1)],["uMaxStarburstRadius",new S.MY(e.maxStarburstRadius??0)],["uViewportHeight",new S.MY(1)],["uGhosts",new S.MY(e.ghosts)],["uGrain",new S.MY(a.grain)],["uHalo",new S.MY(e.halo)],["uIntensity",new S.MY(e.intensity)],["uProceduralDirt",new S.MY(a.procedural)],["uSecondaryCenters",new S.MY(Array.from({length:5},()=>new S.wq(-2,-2)))],["uSecondaryIntensity",new S.MY(e.secondary)],["uRayOscillation",new S.MY(new Float32Array(5))],["uSecondaryScales",new S.MY(Array.from({length:5},()=>1))],["uSecondaryColors",new S.MY(Array.from({length:5},()=>new S.Es(.956,.956,.956)))],["uSecondaryVisibility",new S.MY(Array.from({length:5},()=>0))],["uStreakLength",new S.MY(e.streakLength)],["uStreaks",new S.MY(e.streaks)],["uTime",new S.MY(0)],["uPulseSpeed",new S.MY(.82)],["uTextureDirt",new S.MY(a.texture)],["uVerticalStreaks",new S.MY(e.verticalStreaks)],["uVisibility",new S.MY(1)]])}),this.setConfig(e),this.setDirtyGlass(a)}setConfig(e){this.animated=e.animated,this.uniform("uAnimated").value=+!!this.animated,this.uniform("uFlareEnabled").value=+!!e.enabled,this.uniform("uCrossFlares").value=+(!1!==e.crossFlares),this.uniform("uStarburst").value=+("starburst"===e.profile),this.uniform("uStarburstScale").value=e.secondaryScale??1,this.uniform("uMaxStarburstRadius").value=e.maxStarburstRadius??0,this.uniform("uGhosts").value=e.ghosts,this.uniform("uHalo").value=e.halo,this.intensity=e.intensity,this.updateIntensity(),this.uniform("uSecondaryIntensity").value=e.secondary,this.uniform("uStreakLength").value=e.streakLength,this.uniform("uStreaks").value=e.streaks,this.uniform("uVerticalStreaks").value=e.verticalStreaks}setIntensityScale(e){this.intensityScale=S.rB.clamp(e,0,1),this.updateIntensity()}setDirtyGlass(e){this.uniform("uDirtyGlassEnabled").value=+!!e.enabled,this.uniform("uDistortion").value=e.distortion,this.uniform("uGrain").value=e.grain,this.uniform("uProceduralDirt").value=e.procedural,this.uniform("uTextureDirt").value=e.texture}updateDirtDrift(e,t,a,r,o,i,n=!1){let s=o.drift&&!i?S.rB.clamp(o.driftStrength,0,1):0;this.dirtDriftTarget.set(-(.032*Math.sin(t+.35*a))*s,.032*Math.sin(e-.2*a)*s);let l=-(.055*Math.sin(a+.5*t))*s,u=i||n?1:1-Math.exp(-4*r);this.dirtDriftOffset.lerp(this.dirtDriftTarget,u),this.dirtDriftRotation=S.rB.lerp(this.dirtDriftRotation,l,u),this.uniform("uDirtTextureOffset").value.copy(this.dirtDriftOffset),this.uniform("uDirtTextureRotation").value=this.dirtDriftRotation}setViewport(e,t){this.aspect=e/Math.max(t,1),this.uniform("uAspect").value=this.aspect,this.uniform("uViewportHeight").value=Math.max(t,1)}updateSources(e,t,a,r,o,i=1,n=[],s=0){for(let e of(a.updateMatrixWorld(),this.occluderCount=0,n)){if(e&&e.visible)e.updateWorldMatrix(!0,!1),e.geometry.boundingSphere||e.geometry.computeBoundingSphere(),e.geometry.boundingSphere&&((this.occlusionSpheres[this.occluderCount]??=new S.L0).copy(e.geometry.boundingSphere).applyMatrix4(e.matrixWorld),this.occluderCount+=1)}e.getWorldPosition(this.sourceWorldPosition),this.projectedPosition.copy(this.sourceWorldPosition).project(a);let l=this.projectedPosition.x,u=this.projectedPosition.y,c=Math.max(Math.abs(l),Math.abs(u)),h=1-S.rB.smoothstep(c,.88,1.08);this.uniform("uCenter").value.set(.5*l+.5,.5*u+.5),this.uniform("uTime").value=o?0:r,this.uniform("uPulseSpeed").value=s>0?Math.max(1,Math.round(.82*s/(2*Math.PI)))*Math.PI*2/s:.82,this.uniform("uAnimated").value=o||!this.animated?0:1,this.uniform("uVisibility").value=h*S.rB.clamp(i,0,1)*this.sourceOcclusionVisibility(this.sourceWorldPosition,this.projectedPosition,a);let p=this.uniform("uSecondaryCenters").value,f=this.uniform("uSecondaryVisibility").value,d=this.uniform("uSecondaryColors").value,m=this.uniform("uRayOscillation").value,g=this.uniform("uSecondaryScales").value;for(let e=0;e<5;e+=1){let i=t[e],n=this.secondaryProjectedPositions[e],s=p[e];if(!s||!n)continue;if(!i){s.set(-2,-2),f[e]=0;continue}m[e]=i.userData.oscillateRays&&!o?.1*Math.sin(r*Math.PI/2):0,i.getWorldPosition(this.sourceWorldPosition);let l=i.userData.astraFlareColor;d[e].set(l instanceof S.Es?l:0xfafafa);let u=i.userData.astraFlareScale;g[e]=void 0===u?1:u*Math.max(1,i.scale.x),n.copy(this.sourceWorldPosition).project(a);let c=Math.max(Math.abs(n.x),Math.abs(n.y)),h=S.rB.clamp(i.scale.x,0,1);s.set(.5*n.x+.5,.5*n.y+.5),f[e]=h*this.sourceOcclusionVisibility(this.sourceWorldPosition,n,a)*(1-S.rB.smoothstep(c,.88,1.08))}}sourceOcclusionVisibility(e,t,a){if(0===this.occluderCount)return 1;this.occlusionNdc.set(t.x,t.y),this.occlusionRay.setFromCamera(this.occlusionNdc,a);let r=this.occlusionRay.ray,o=r.origin.distanceTo(e);for(let e=0;e<this.occluderCount;e+=1){let t=this.occlusionSpheres[e];if(!t)continue;let a=r.intersectSphere(t,this.occlusionHit);if(a&&r.origin.distanceTo(a)<o-1e-4)return 0}return 1}uniform(e){return this.uniforms.get(e)}updateIntensity(){this.uniform("uIntensity").value=this.intensity*this.intensityScale}}let B=[{colors:["#6DCBF4","#7AB1FE","#F87915","#FA994C","#F5F6FB"],id:"astra",label:"Astra"},{colors:["#47E2C2","#6DCBF4","#B06DFF","#E96AC8","#F5F6FB"],id:"aurora",label:"Aurora"},{colors:["#F7CB59","#FA994C","#F67576","#B06DFF","#F5F6FB"],id:"ember",label:"Ember"}],R="astra",C={astra:B[0].colors.map(e=>new S.Es(e)),aurora:B[1].colors.map(e=>new S.Es(e)),ember:B[2].colors.map(e=>new S.Es(e))},D=new Map,F=new S.Es(1,1,1),z=[.08,.58,.22,.68,.44];function E(e,t,a,r,o=R,i){let n=function(e,t,a=R,r){if(!e)return F;let o=function(e,t){if(!t)return C[e]??C[R];let a=t.join(","),r=D.get(a);if(r)return r;let o=t.map(e=>new S.Es(e));return D.set(a,o),o}(a,r);return t<.36?o[0]??F:t<.52?o[1]??F:t<.64?o[2]??F:t<.74?o[3]??F:o[4]??F}(a,r,o,i);e[t]=n.r,e[t+1]=n.g,e[t+2]=n.b}let T="data-astra-path-shape",L=`[${T}]`,O={intensity:.7,levels:5,luminanceSmoothing:.18,luminanceThreshold:.62,mipmapBlur:!0,radius:.72},I={...b,texture:.33},k={density:4,densityFalloff:.22,flowInward:!0,flowSpeed:.8,intensity:1.35,scatter:.4,size:2.05,smallSize:1,largeSize:1,sizeFalloff:.45,twinkleSpeed:.62},H={...P,intensity:.28,secondary:.55,streakLength:.03485,verticalStreaks:1},V=`
  varying float vBrightness;
  varying vec3 vColor;
  varying float vLens;
  varying float vOpacity;
  varying float vRayStrength;

  void main() {
    vec2 point = (gl_PointCoord - vec2(0.5)) * 2.0;
    float distanceToCenter = length(point);
    float disc = 1.0 - smoothstep(0.08, 1.0, distanceToCenter);
    float core = pow(disc, 2.2);
    float horizontalRay = exp(-abs(point.y) * 28.0)
      * (1.0 - smoothstep(0.18, 1.0, abs(point.x)));
    float verticalRay = exp(-abs(point.x) * 28.0)
      * (1.0 - smoothstep(0.18, 1.0, abs(point.y)));
    float rays = max(horizontalRay, verticalRay) * 0.28 * vRayStrength;
    float alpha = max(core, rays) * vOpacity;

    if (alpha <= 0.001) {
      discard;
    }

    float whiteCore = core
      * smoothstep(0.9, 2.8, vBrightness)
      * 0.82;
    float colorEnergy = 1.0
      - min(vColor.r, min(vColor.g, vColor.b));
    vec3 emission = mix(vColor, vec3(1.0), whiteCore)
      * vBrightness
      * (1.0 + colorEnergy * 0.42);
    gl_FragColor = vec4(emission, alpha);
  }
`;var W=e.i(369085);let G={src:e.i(101098).default,width:960,height:1440,blurWidth:5,blurHeight:8,blurDataURL:"data:image/webp;base64,UklGRtoAAABXRUJQVlA4TM4AAAAvBMABAM1VICICHghACgMAAAB9/5oPHzAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAABAMCDwbImyDgAAwAMBRwEAAAA4/98mAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAQLXzQIBpAAAAAM6/Vf8BABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDTpVZkPZdKBrf31ryKn3JHm9f7CQG0mmHLNXfGQKvXwxJnWmZYwEwo5PpAnqQPjySxPjc+SFrYgmOBYmrPHA=="};function j(e,t=1,a=0){let r=Math.min(Math.max((3.3*e-.5)/2.8,0),1);return Math.atan2(t,a)*(r*r*r*(r*(6*r-15)+10)-1)}function Y(e,t,a){let r=Math.min(Math.max((e-t)/(a-t),0),1);return r*r*r*(r*(6*r-15)+10)}function q(e){let t=4.8*Math.min(Math.max(e,0),1),a=Y(t,.45,4.8);return{expansion:a,scatter:Y(t,1.45,4.8),flare:1-Y(t,.45,1.1),bodies:{brightness:.35+.65*a,sunWhiteHeat:1-Y(t,.45,3.6),scale:.035+.965*a,separation:.7,rotation:1-Y(t,1.8,4.8),center:a}}}function _(e,t,a){let r=((e/t+a)%1+1)%1,o=e=>{let t=Math.min(Math.max(e,0),1);return t*t*(3-2*t)};return{age:r,seconds:(r-.5)*t,opacity:o(r/.1)*o((1-r)/.1)}}let X=`
  uniform float uOrbitAge;

  vec2 whirlPosition(vec2 position, float seed, float depth) {
    if (uOrbitAge >= 1.0) return position;
    vec2 scale = vec2(1.0, 0.62);
    vec2 p = position / scale;
    float radius = length(p);
    float lag = 0.10 * seed + 0.05 * depth;
    float t = smoothstep(lag, 0.82 + lag, uOrbitAge);
    float wave = sin(3.14159265 * t);
    float tide = wave * wave;
    // Inner stars move ahead of the outer sky. Each completes its turn with
    // zero angular velocity, directly on its ordinary moving trajectory.
    float current = (1.0 - smoothstep(2.0, 11.0, radius)) * 1.65
      + seed * 0.9 - depth * 0.65;
    float angle = 6.2831853 * t + tide * current;
    float c = cos(angle), s = sin(angle);
    float drift = sin(angle + seed * 6.2831853);
    float gatheredRadius = 2.8 + 0.50 * radius + 2.1 * seed + 0.70 * drift;
    vec2 swept = mat2(c, s, -s, c) * (p / max(radius, 0.001));
    return swept * mix(radius, gatheredRadius, tide) * scale;
  }
`,Z=9.7/325,N=S.rB.degToRad(-52),U={accretionRatio:.42,ambientAmount:.04,ambientSpeed:.55,coreIntensity:1.45,duration:8,exhaleStrength:.42,inwardStrength:1.2,propagationSoftness:.16,settleDuration:1.2,startScale:.58},$={duration:8,growthSpeed:.55,softness:.075,startZoom:4},K={depthDisplacement:.5,followDamping:12,illumination:.55,magnification:.18,rotationLag:.68,radius:156},Q={density:.55,driftSpeed:.2,enabled:!0,intensity:2,reach:.17,spread:.4,tightSpread:.03},J=[{depth:.62,phase:.16,speed:.025,strong:!0},{depth:-.46,phase:.72,speed:-.018,strong:!1},{depth:.78,phase:.38,speed:.021,strong:!0},{depth:-.7,phase:.58,speed:-.016,strong:!1},{depth:.42,phase:.08,speed:.03,strong:!0}],ee=`<svg viewBox="0 0 231 325" xmlns="http://www.w3.org/2000/svg">${["M128.472 2.36011C65.4727 24.3601 10.7725 93.1601 9.97246 162.36C8.97246 248.86 79.4138 262.86 87.9725 262.86C116.973 262.86 135.973 244.36 135.973 221.36C135.973 189.86 102.973 193.86 102.973 209.36","M224.973 31.8602C132.473 3.86011 29.9727 75.8601 29.9727 159.86C29.9727 247.86 98.4726 259.86 126.473 247.86","M126.473 215.359C124.639 222.692 117.073 237.159 101.473 236.359C89.1905 235.729 76.0585 219.995 76.4724 195.859C76.4724 165.859 100.473 142.859 132.473 142.859C171.973 142.859 213.473 171.36 213.473 231.36C213.473 276.36 170.473 328.36 85.9727 316.86","M106.973 237.36C81.9727 240.36 61.4727 222.86 61.4727 184.86C61.4727 153.36 91.9727 123.36 132.473 123.36C172.973 123.36 227.973 149.86 227.973 225.36C227.973 287.36 168.473 322.36 121.473 322.36C53.4727 322.36 10.9727 264.86 2.47266 208.36","M114.973 211.36C114.973 225.86 92.4727 226.86 92.4727 205.36C92.4727 183.86 109.938 175.36 127.973 175.36C146.008 175.36 174.473 195.86 174.473 230.86C174.473 264.36 148.473 281.86 133.973 287.36C119.473 292.86 81.6727 296.56 54.4727 269.36"].map(e=>`<path d="${e}"/>`).join("")}</svg>`;class et extends S.c_{source;depth;rotationDepth;depthPhase;layout;constructor(e,t,a,r,o){super(),this.source=e,this.depth=t,this.rotationDepth=a,this.depthPhase=r,this.layout=o,this.arcLengthDivisions=640}getPoint(e,t=new S.cE){let a=S.rB.clamp(e,0,1),r=this.source.getPointAt(a),o=Math.sin(a*Math.PI),i=Math.sin(a*Math.PI*1.35+this.depthPhase)*this.depth*this.rotationDepth*o;return t.set((r.x-(this.layout?.centerX??114.973))*(this.layout?this.layout.worldHeight/this.layout.height:Z),((this.layout?.centerY??211.36)-r.y)*(this.layout?this.layout.worldHeight/this.layout.height:Z),i)}}function ea({pathLayout:e,backgroundColor:s="#000000",ariaLabel:l,sceneContent:u,sceneOccluders:c,paused:h=!1,trailDispersion:p=0,minimumParticleSize:f=0,accretionExhale:d=U,animationPlaying:m=!0,animationPreset:v="legacy-zoom",animationRestartKey:x=0,bloomIntensity:y=.7,sunBloomIntensity:w=.7,sunSurfaceSpeed:P=1,sunLensFlare:b=!0,className:M="",sceneFrame:A,colorMode:C=!0,colorPalette:D=R,colorPaletteColors:F=function(e){return B.find(t=>t.id===e)?.colors??B[0].colors}(D),dirtyGlass:z=I,faceForward:E=!0,grow:O=$,interaction:V=K,interactionMode:G="rotate",lensFlare:j=H,loop:Y,manualRendering:q=!1,pixelRatio:_,renderDriver:X,orbitalDust:Z=Q,pathShapeScatter:N=1,horizontalRotationOnly:J=!1,rotationDispersion:ee=!1,maxExpansion:et=1.25,rotationDepth:ei=1.4,scrollDisperseDistance:en=800,scrollEffects:es=!1,scrollStarDriftSpeed:el=1,scrollStartOffset:eu=0,scrollTextFadeDistance:ec=200,showCenterCluster:eh=!0,showCelestialBodies:ep=!1,showLabels:ef=!0,stars:ed=k}){let em=(0,i.f)(),eg=(0,r.h)(),ev=eg.getDpr(),eS=(0,a.useRef)(null),ex=(0,a.useRef)(new S.wq),ey=(0,a.useRef)(!1),ew=(0,a.useRef)(null),eP=(0,a.useRef)({pointerId:-1,x:0,y:0}),eb=(0,a.useRef)(null),eM=(0,a.useRef)(null),eA=(0,a.useRef)(0),eB=(0,a.useRef)([]),eR=(0,a.useRef)({centerNdc:new S.wq,id:null,samples:null,sizeNdc:new S.wq,strength:0}),eC=(0,a.useRef)({stroke:null,active:!1,x:0,y:0}),[eD,eF]=(0,a.useState)(!1),ez=function(){let[e,t]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let e=window.matchMedia("(prefers-reduced-motion: reduce)"),a=()=>t(e.matches);return a(),e.addEventListener("change",a),()=>e.removeEventListener("change",a)},[]),e}(),eE=function(e){let[t,r]=(0,a.useState)(!0);return(0,a.useEffect)(()=>{let t=e.current;if(!t)return;let a=new IntersectionObserver(([e])=>r(e.isIntersecting),{rootMargin:"120px"});return a.observe(t),()=>a.disconnect()},[e]),t}(eS),eT=function(){let[e,t]=(0,a.useState)(()=>"u"<typeof document||!document.hidden);return(0,a.useEffect)(()=>{let e=()=>t(!document.hidden);return document.addEventListener("visibilitychange",e),()=>document.removeEventListener("visibilitychange",e)},[]),e}(),eL=!h&&!ez&&eE&&eT,eO=e=>{let t=e.currentTarget.getBoundingClientRect();if("hover-drift"===G){let a=e.clientX-t.left,r=e.clientY-t.top,o=eC.current.stroke,i=S.rB.clamp;eC.current.stroke={x:a,y:r,dx:o?i(o.dx+i(a-o.x,-60,60),-80,80):0,dy:o?i(o.dy+i(r-o.y,-60,60),-80,80):0}}eC.current.active=!0,eC.current.x=(e.clientX-t.left)/Math.max(t.width,1)*2-1,eC.current.y=-(2*((e.clientY-t.top)/Math.max(t.height,1)))+1,ew.current?.()},eI=()=>{eC.current.stroke=null,eC.current.active=!1,ew.current?.()},ek=(e,t)=>{eP.current.pointerId===e&&(eP.current.pointerId=-1,eF(!1),E&&(ex.current.set(0,0),ey.current=!0,ew.current?.()),t.hasPointerCapture(e)&&t.releasePointerCapture(e))};return(0,a.useEffect)(()=>{eP.current.pointerId=-1,ex.current.set(0,0),ey.current=!0,eC.current.stroke=null,eC.current.active=!1,ew.current?.()},[G]),(0,a.useEffect)(()=>{J&&(ex.current.x=0,ew.current?.())},[J]),(0,a.useEffect)(()=>{let e=e=>{if(ez||"rotate"!==G||0!==e.button||-1!==eP.current.pointerId)return;let t=eR.current,a=eB.current.find(e=>e.id===t.id);if(!a||t.strength<=.05)return;let r=a.element.getBoundingClientRect();e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&(eP.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY},ey.current=!1,eF(!0))},t=e=>{if(eP.current.pointerId!==e.pointerId)return;let t=e.clientX-eP.current.x,a=e.clientY-eP.current.y;eP.current.x=e.clientX,eP.current.y=e.clientY,ex.current.y+=.005*t,J||(ex.current.x+=.005*a),ew.current?.()},a=e=>{var t;t=e.pointerId,eP.current.pointerId===t&&(eP.current.pointerId=-1,eF(!1),E&&(ex.current.set(0,0),ey.current=!0,ew.current?.()))};return window.addEventListener("pointerdown",e),window.addEventListener("pointermove",t),window.addEventListener("pointerup",a),window.addEventListener("pointercancel",a),()=>{window.removeEventListener("pointerdown",e),window.removeEventListener("pointermove",t),window.removeEventListener("pointerup",a),window.removeEventListener("pointercancel",a)}},[E,J,G,ez]),(0,a.useEffect)(()=>{let e=0,t=()=>{eB.current=Array.from(document.querySelectorAll(L)).flatMap((e,t)=>{let a=e.querySelector("svg"),r=a?.viewBox.baseVal;if(!a||!r||r.width<=0||r.height<=0)return[];let o=a.getScreenCTM(),i=Array.from(a.querySelectorAll("path")).map(e=>{try{let t=e.getTotalLength(),a=e.getScreenCTM(),r=o&&a?o.inverse().multiply(a):null;return t>0?{length:t,matrix:r,path:e}:null}catch{return null}}).filter(e=>null!==e),n=i.reduce((e,t)=>e+t.length,0);if(n<=0)return[];let s=new Float32Array(4096),l=0,u=0;for(let e=0;e<1024;e+=1){let t=(e+.5)/1024*n;for(;l<i.length-1&&t>u+i[l].length;)u+=i[l].length,l+=1;let a=i[l],o=a.path.getPointAtLength(t-u),c=a.matrix?new DOMPoint(o.x,o.y).matrixTransform(a.matrix):o,h=4*e,p=u/n,f=(u+a.length)/n;s[h]=(c.x-r.x)/r.width-.5,s[h+1]=.5-(c.y-r.y)/r.height,s[h+2]=p,s[h+3]=f}return[{aspectRatio:r.width/r.height,element:e,id:`${e.dataset.astraPathShape||"shape"}-${t}`,samples:s}]})},a=new MutationObserver(()=>{window.cancelAnimationFrame(e),e=window.requestAnimationFrame(t)});return t(),a.observe(document.body,{attributeFilter:[T,"d","viewBox"],attributes:!0,childList:!0,subtree:!0}),()=>{window.cancelAnimationFrame(e),a.disconnect()}},[]),(0,a.useEffect)(()=>{let e=()=>{let e=window.scrollY-Math.max(eu,0),t=es?ez?1:Math.max(e/Math.max(en,1),0):0,a=Math.max(e/Math.max(ec,1),0),r=es?ez?0:1-S.rB.smootherstep(a,0,1):1;(function(e,t,a){if(!a||0===e.length){t.strength=0;return}let r=Math.max(window.innerWidth,1),o=Math.max(window.innerHeight,1),i=null,n=null,s=0;for(let t of e){let e=t.element.getBoundingClientRect(),a=(o-e.top)/Math.max(o+e.height,1),r=S.rB.smootherstep(a,.05,.28)*(1-S.rB.smootherstep(a,.72,.95));r>s&&(i=e,s=r,n=t)}if(!n||!i||s<=0){t.strength=0;return}let l=i.width/Math.max(i.height,1)>n.aspectRatio?i.height*n.aspectRatio:i.width,u=l/n.aspectRatio;t.centerNdc.set((i.left+.5*i.width)/r*2-1,1-(i.top+.5*i.height)/o*2),t.id=n.id,t.samples=n.samples,t.sizeNdc.set(l/r*2,u/o*2),t.strength=s})(eB.current,eR.current,es&&!ez),eA.current=t,eb.current&&(eb.current.style.opacity=String(r)),eM.current&&(eM.current.style.opacity=String(r)),ew.current?.()};if(e(),es&&!ez)return window.addEventListener("resize",e),window.addEventListener("scroll",e,{passive:!0}),()=>{window.removeEventListener("resize",e),window.removeEventListener("scroll",e)}},[ez,en,es,eu,ec]),(0,t.jsxs)("div",{"aria-label":l??("rotate"===G?em.formatMessage({id:"1Ki1Ng",defaultMessage:[{type:0,value:"A draggable luminous spiral made entirely from tapered star particles and dust"}]}):"depth-lens"===G?em.formatMessage({id:"wGgppM",defaultMessage:[{type:0,value:"A luminous particle spiral with a pointer-controlled depth lens"}]}):em.formatMessage({id:"T0Z66A",defaultMessage:[{type:0,value:"A luminous spiral made entirely from tapered star particles and dust"}]})),className:(0,o.q)(W.default.root,M),"data-dragging":eD?"true":void 0,"data-interaction":G,"data-interactive":ez||"none"===G?void 0:"true",onPointerCancel:e=>{eI(),ek(e.pointerId,e.currentTarget)},onPointerDown:e=>{if(!ez&&0===e.button&&-1===eP.current.pointerId){if("depth-lens"===G){eO(e),e.currentTarget.setPointerCapture(e.pointerId);return}"rotate"===G&&(eP.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY},ey.current=!1,e.currentTarget.setPointerCapture(e.pointerId),eF(!0))}},onPointerMove:e=>{if("hover-drift"===G&&(0!==e.buttons||"mouse"!==e.pointerType))return void eI();if(!ez&&("depth-lens"===G||"hover-drift"===G&&"mouse"===e.pointerType))return void eO(e);if(ez||eP.current.pointerId!==e.pointerId)return;let t=e.clientX-eP.current.x,a=e.clientY-eP.current.y;eP.current.x=e.clientX,eP.current.y=e.clientY,ex.current.y+=.005*t,J||(ex.current.x+=.005*a),ew.current?.()},onPointerLeave:()=>{("depth-lens"===G||"hover-drift"===G)&&eI()},onPointerUp:e=>{if("depth-lens"===G){"mouse"!==e.pointerType&&eI(),e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId);return}ek(e.pointerId,e.currentTarget)},ref:eS,role:"img",children:[(0,t.jsx)(n.f,{"aria-hidden":"true",camera:{far:40,near:.1,position:[0,1.2,12]},className:W.default.canvas,dpr:void 0===_?ev:Math.min(_,ev[1]),fallback:(0,t.jsx)("p",{className:W.default.fallback,children:em.formatMessage({id:"uhEeJN",defaultMessage:[{type:0,value:"This spiral field needs a browser with WebGL enabled."}]})}),frameloop:q?"never":eL?"always":"demand",gl:{alpha:!1,antialias:eg.getAntialias(!0),powerPreference:"high-performance",preserveDrawingBuffer:q,toneMapping:S.c2,toneMappingExposure:1},onCreated:({gl:e})=>{e.outputColorSpace=S.nj,e.setClearColor(0,1)},orthographic:!0,children:(0,t.jsx)(a.Suspense,{fallback:null,children:(0,t.jsx)(eo,{postprocessing:eg.getPostprocessing(),pathLayout:e,backgroundColor:s,sceneContent:u,sceneOccluders:c,paused:h,trailDispersion:p,minimumParticleSize:f,accretionExhale:d,animationPlaying:m,animationPreset:v,animationRestartKey:x,bloomIntensity:y,sunBloomIntensity:w,sunSurfaceSpeed:P,sunLensFlare:b,sceneFrame:A,colorMode:C,colorPalette:D,colorPaletteColors:F,dirtyGlass:z,grow:O,interaction:V,interactionMode:G,lensFlare:j,loop:Y,orbitalDust:Z,pathShapeFrameRef:eR,pathShapeScatter:N,horizontalRotationOnly:J,rotationDispersion:ee,maxExpansion:et,pointerStateRef:eC,reducedMotion:ez,renderDriver:X,requestRenderRef:ew,returningToFaceRef:ey,rotationDepth:ei,scrollEffects:es,scrollProgressRef:eA,scrollStarDriftSpeed:el,showCenterCluster:eh,showCelestialBodies:ep,stars:ed,targetSpinRef:ex})})}),ef?(0,t.jsxs)(g,{reducedMotion:"user",children:[(0,t.jsx)(er,{animationPlaying:m,animationRestartKey:x,className:W.default.labelLeft,direction:-1,elementRef:eb,reducedMotion:ez,text:"GPT"}),(0,t.jsx)(er,{animationPlaying:m,animationRestartKey:x,className:W.default.labelRight,direction:1,elementRef:eM,reducedMotion:ez,text:"Astra"})]}):null]})}function er({animationPlaying:e,animationRestartKey:a,className:r,direction:i,elementRef:n,reducedMotion:s,text:l}){let u=Array.from(l);return(0,t.jsx)("span",{"aria-hidden":"true",className:(0,o.q)(W.default.label,r),ref:n,children:u.map((r,o)=>{let n=-1===i?u.length-1-o:o;return(0,t.jsx)(v.f.span,{animate:{opacity:1,x:0},className:W.default.labelLetter,initial:!!e&&{opacity:0,x:s?0:44*i},transition:s?{duration:.18,ease:"easeOut"}:{bounce:.06,delay:1+.05*n,duration:1,type:"spring"},children:r},`${a}-${e}-${r}-${o}`)})})}function eo({postprocessing:e,pathLayout:r,backgroundColor:o,sceneContent:i,sceneOccluders:n,paused:l,trailDispersion:c,minimumParticleSize:h,accretionExhale:p,animationPlaying:f,animationPreset:d,animationRestartKey:m,bloomIntensity:g,sunBloomIntensity:v,sunSurfaceSpeed:x,sunLensFlare:w,sceneFrame:P,colorMode:b,colorPalette:M,colorPaletteColors:A,dirtyGlass:B,grow:R,interaction:C,interactionMode:D,lensFlare:F,loop:T,orbitalDust:L,pathShapeFrameRef:O,pathShapeScatter:I,horizontalRotationOnly:k,rotationDispersion:H,maxExpansion:V,pointerStateRef:W,reducedMotion:G,renderDriver:Y,requestRenderRef:X,returningToFaceRef:Z,rotationDepth:Q,scrollEffects:ea,scrollProgressRef:er,scrollStarDriftSpeed:es,showCenterCluster:eu,showCelestialBodies:ed,stars:eM,targetSpinRef:eA}){let{camera:eB,gl:eR,invalidate:eC,size:eD}=(0,u.f)(),eF=Math.max(P?.height??eD.height,1),ez=r?r.worldHeight*Math.max(1,r.width/r.height/(eD.width/eF)):eD.width/eF<.72?12.7:10.9,eE=r?.cameraCenterY??1.2,eT=ez*eD.height/eF,eL=(0,a.useRef)(null),eO=(0,a.useRef)(null),eI=(0,a.useRef)(null),ek=(0,a.useRef)(null),eH=(0,a.useRef)(null),eV=(0,a.useRef)(null),eW=(0,a.useRef)(q(0).bodies),eG=(0,a.useRef)(0),ej=(0,a.useRef)(0),eY=(0,a.useRef)(0),eq=(0,a.useRef)(0),e_=(0,a.useRef)(null),eX=(0,a.useRef)(0),eZ=(0,a.useRef)("converge-tilt"===d?.14:1),eN=(0,a.useRef)(1),eU=(0,a.useRef)(0),e$=(0,a.useMemo)(()=>new S.cE,[]),eK=(0,a.useMemo)(()=>new S.cE,[]),eQ=(0,a.useMemo)(()=>new S.as,[]),eJ=(0,a.useRef)(new S.wq),e0=(0,a.useRef)(0),e1=(0,a.useRef)(0),e2=(0,a.useRef)(new S.wq),e5=(0,a.useRef)(0),e3=(0,a.useMemo)(()=>new S.cE,[]),e4=(0,a.useMemo)(()=>new S.cE,[]),e8=(0,a.useMemo)(()=>new S.cE,[]),e6=(0,a.useMemo)(()=>new S.cE,[]),e7=(0,a.useMemo)(()=>new S.FS,[]),e9=(0,a.useMemo)(()=>new S.cE,[]),te=(0,a.useMemo)(()=>new S.cE,[]),tt=(0,a.useMemo)(()=>new S.wq,[]),ta=(0,a.useMemo)(()=>new S.wq,[]),tr=(0,a.useMemo)(()=>new S.wq,[]),to=(0,a.useMemo)(()=>{let e;return(e=new S.U7(new Float32Array(4096),1024,1,S.W1,S.h5)).magFilter=S.VV,e.minFilter=S.VV,e.generateMipmaps=!1,e.needsUpdate=!0,e.wrapS=S.Jr,e.wrapT=S.Jr,e},[]),ti=(0,a.useMemo)(()=>{if("u"<typeof DOMParser)return[];let e=r?`<svg viewBox="0 0 ${r.width} ${r.height}" xmlns="http://www.w3.org/2000/svg">${r.paths.map(e=>`<path d="${e.d}"/>`).join("")}</svg>`:ee;return new y.f().parse(e).paths.map(e=>e.subPaths[0]).filter(e=>void 0!==e)},[r]),tn=(0,a.useMemo)(()=>(function(e,t,a,r,o,i,n,s,l){let u=new S.C9,c=[],h=[],p=[],f=[],d=null;if(e.forEach((e,s)=>{let d=l?.paths[s]??J[s];if(!d)return;let m=new et(e,d.depth,S.rB.clamp(t,0,2),.82*s,l),g=eP(m,d.speed,r.flowInward),v=eP(m,d.speed,!1),x=function(e,t,a,r,o,i,n,s,l){let u=t.strong?220:170,c=Math.max(8,Math.round(u*S.rB.clamp(o.density,.25,4))),h=c+Math.round(u*(t.followupDensity??0)),p=new Float32Array(3*h),f=new Float32Array(h),d=new Float32Array(h),m=new Float32Array(3*h),g=new Float32Array(h),v=new Float32Array(h),x=new Float32Array(h),y=new Float32Array(h),w=new Float32Array(h),P=new Float32Array(h),b=new Float32Array(h),M=ep(0x243f6a88^(r+1)*0x9e3779b9),A=ep(0xa4093822^(r+1)*0x299f31d0),B=new S.cE,R=new S.cE,C=new S.cE,D=new S.cE,F=S.rB.clamp(o.densityFalloff,0,1),T=S.rB.clamp(o.scatter,0,.45),L=function(e){let t=new Float32Array(2048),a=new S.cE;for(let r=0;r<512;r+=1){e.getPointAt(r/511,a);let o=4*r;t[o]=a.x,t[o+1]=a.y,t[o+2]=a.z,t[o+3]=1}let r=new S.U7(t,512,1,S.W1,S.h5);return r.generateMipmaps=!1,r.magFilter=S.r8,r.minFilter=S.r8,r.needsUpdate=!0,r.wrapS=S.Jr,r.wrapT=S.Jr,r}(e),O=-1/0,I=0,k=0,H=.5,V=0;for(let a=0;a<h;a+=1){let r=M(),l=ew(r,F),u=eS(l,t.fadeEnd);e.getPointAt(l,B),e.getTangentAt(l,R).normalize(),C.set(-R.y,R.x,0).normalize();let h=T*(a>=c?1.9:1)*S.rB.lerp(.3,1,u)*(.22+.78*M()),v=(M()+M()-1)*h,z=(M()+M()-1)*h*.65,L=S.rB.lerp((t.strong?.085:.055)*.22,t.strong?.085:.055,u),W=M()<L,G=W&&t.followupDensity?S.rB.clamp(v,-.09,.09):v;B.addScaledVector(C,G),B.z+=z;let j=(W?.85+1.25*M():.12+.68*Math.pow(M(),2.4))*S.rB.clamp(o.size,.25,3),Y=(W?2+1.5*M():.56+.78*M())*(t.strong?1:.82),q=3*a;p[q]=B.x,p[q+1]=B.y,p[q+2]=B.z,f[a]=G,d[a]=Y,E(m,q,i,A(),n,s),g[a]=z,x[a]=.82+.16*M(),y[a]=r,w[a]=j,P[a]=M()*Math.PI*2,b[a]=.65+.7*M(),a<c&&j>O&&(O=j,I=G,k=z,H=r,V=a,D.copy(B))}let W=(t.strong?2.2:2.05)*S.rB.clamp(o.size,.25,3);w[V]=Math.max(w[V],W),d[V]=Math.max(d[V],t.strong?3.35:2.85),v[V]=1;let G=t.depth*S.rB.clamp(l,0,2),j=.82*r,Y=Math.fround(function(e,t){return(e%t+t)%t}((y[V]??0)*.754877666+(P[V]??0)*.159154943+(w[V]??0)*.117,1)),q=ef(y[V]??0,P[V]??0,127.1,311.7),_=ef(P[V]??0,w[V]??0,269.5,183.3),X=ef(y[V]??0,d[V]??0,419.2,371.9),Z=Math.fround((q+_-1)*.12),N=Math.fround((X-.5)*.22);E(m,3*V,i,z[r]??.08,n,s);let U=new S.ld;U.setAttribute("position",new S.f5(p,3)),U.setAttribute("orbitProgress",new S.f5(y,1)),U.setAttribute("starAcrossOffset",new S.f5(f,1)),U.setAttribute("starDepthOffset",new S.f5(g,1)),U.setAttribute("starHero",new S.f5(v,1)),U.setAttribute("starBrightness",new S.f5(d,1)),U.setAttribute("starColor",new S.f5(m,3)),U.setAttribute("starOpacity",new S.f5(x,1)),U.setAttribute("starScale",new S.f5(w,1)),U.setAttribute("twinklePhase",new S.f5(P,1)),U.setAttribute("twinkleRate",new S.f5(b,1));let $=em(o,L,a,G,j,.5,{acrossScatter:Z,depthScatter:N,seed:Y});$.uniforms.uInitialCount.value=c,$.uniforms.uEndFade.value=+(!1!==t.fadeEnd);let K=new S.sy(U,$);return K.frustumCulled=!1,K.renderOrder=40+r,{flareAcrossOffset:I,flareDepthOffset:k,flarePosition:D,flareProgress:H,flareLoopPhase:(P[V]??0)/(2*Math.PI),flareShapeAcrossScatter:Z,flareShapeDepthScatter:N,flareShapeSeed:Y,geometry:U,material:$,pathShapeDepth:G,pathShapeDepthPhase:j,pathTexture:L,points:K}}(m,d,g,s,r,o,i,l?.paths[s]?.colors??n,t),y=a.enabled?function(e,t,a,r,o,i,n){let s=Math.max(1,Math.round((t.strong?150:90)*S.rB.clamp(o.density,.1,4))),l=new Float32Array(3*s),u=new Float32Array(s),c=new Float32Array(3*s),h=new Float32Array(3*s),p=new Float32Array(s),f=new Float32Array(s),d=new Float32Array(s),m=ep(0x9e3779b9^(r+1)*0x85ebca6b),g=new S.cE,v=new S.cE,x=new S.cE,y=S.rB.clamp(o.spread,0,.65),w=Math.min(S.rB.clamp(o.tightSpread,0,.3),y),P=S.rB.clamp(i,0,1),b=S.rB.clamp(n,0,1);for(let a=0;a<s;a+=1){let r=(a+.92*m())/s,o=(m()+m()+m())/3,i=m()<P?o:r,n=eS(i,t.fadeEnd),M=S.rB.lerp(1,.18+.82*Math.pow(n,.68),b);e.getPointAt(i,g),e.getTangentAt(i,v).normalize(),x.set(-v.y,v.x,0).normalize();let A=.68>m(),B=(A?w:y)*M,R=(m()+m()-1)*B,C=(m()+m()-1)*B*.7;g.addScaledVector(x,R),g.z+=C;let D=3*a;h[D]=x.x*R,h[D+1]=x.y*R,h[D+2]=C,l[D]=g.x,l[D+1]=g.y,l[D+2]=g.z,p[a]=i,u[a]=m(),c[D]=v.x,c[D+1]=v.y,c[D+2]=v.z,d[a]=m()*(A?1:.72)*M,f[a]=function(e,t=!0){return S.rB.smoothstep(e,0,.07)*(t?1-S.rB.smoothstep(e,.84,1):1)}(i,t.fadeEnd)*(A?1:.72)*(.38+.58*m())*S.rB.lerp(1,.3+.7*n,b)}let M=new S.ld;M.setAttribute("position",new S.f5(l,3)),M.setAttribute("driftPhase",new S.f5(u,1)),M.setAttribute("trailOffset",new S.f5(h,3)),M.setAttribute("driftTangent",new S.f5(c,3)),M.setAttribute("orbitProgress",new S.f5(p,1)),M.setAttribute("particleOpacity",new S.f5(f,1)),M.setAttribute("particleScale",new S.f5(d,1));let A=new S.Zg({blending:S.tq,depthTest:!1,depthWrite:!1,fragmentShader:eh,toneMapped:!1,transparent:!0,uniforms:{uOrbitAge:{value:1},uGuide:{value:new S.$i},uTrailDispersion:{value:0},uEndWidth:{value:1},uMinPointSize:{value:0},uAccretionRatio:{value:U.accretionRatio},uAmbientPulse:{value:1},uCoreIntensity:{value:U.coreIntensity},uDirection:{value:a<0?-1:1},uDriftDistance:{value:.16},uFadeProgress:{value:1},uDriftSpeed:{value:S.rB.clamp(o.driftSpeed,0,1.5)},uExhaleStrength:{value:U.exhaleStrength},uFormationEnabled:{value:0},uFormationProgress:{value:1},uGrowthEnabled:{value:0},uGrowthProgress:{value:1},uGrowthRadius:{value:8.2},uGrowthSoftness:{value:$.softness},uHeadProgress:{value:t.phase},uInwardStrength:{value:U.inwardStrength},uIntensity:{value:S.rB.clamp(o.intensity,0,3)},uLightReach:{value:S.rB.clamp(o.reach,.02,.4)*(t.strong?1.15:1)},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uStarBrightness:{value:t.strong?1:.62},uStarVisibility:{value:1},uLensActive:{value:0},uLensDepth:{value:K.depthDisplacement},uLensIllumination:{value:K.illumination},uLensMagnification:{value:K.magnification},uLensPointer:{value:new S.wq},uLensRadius:{value:.2},uPropagationSoftness:{value:U.propagationSoftness},uZoomRevealExpansion:{value:0},uZoomReveal:{value:0},uScatterSize:{value:new S.wq(12,12)},uScrollScatter:{value:0},uRotationScatter:{value:0},uMaxExpansion:{value:1.25},uSettleRatio:{value:.15},uTrailEnabled:{value:1},uTrailLength:{value:.18},uTime:{value:0}},vertexShader:ec}),B=new S.sy(M,A);return B.frustumCulled=!1,B.renderOrder=70+r,{geometry:M,material:A,points:B}}(m,d,g,s,a,r.densityFalloff,r.sizeFalloff):null,w=new S.C9,P=null,b=d.endWidth??1;x.material.uniforms.uEndWidth.value=b,w.add(x.points),y&&(y.material.uniforms.uEndWidth.value=b,w.add(y.points),c.push(y.geometry,y.material)),(P=new S.t).userData.astraFlareColor=new S.Es(l?.paths[s]?.colors?.[0]??"#fafafa"),P.position.copy(x.flarePosition);let M=ew(x.flareProgress,r.densityFalloff);P.scale.setScalar(ex(M,d.fadeEnd)*ey(M,r.sizeFalloff,d.fadeEnd)),w.add(P),f.push(P),u.add(w),h.push({group:w,lag:.18+.17*s,spin:new S.wq}),p.push({hoverLayers:l?[ev(x.points,r.densityFalloff,x.pathTexture),...y?[ev(y.points,r.densityFalloff)]:[]]:void 0,curve:m,fadeEnd:!1!==d.fadeEnd,dustMaterial:y?.material??null,flareAcrossOffset:x.flareAcrossOffset,flareDepthOffset:x.flareDepthOffset,flareProgress:x.flareProgress,flareLoopPhase:x.flareLoopPhase,flareShapeAcrossScatter:x.flareShapeAcrossScatter,flareShapeDepthScatter:x.flareShapeDepthScatter,flareShapeSeed:x.flareShapeSeed,flareSource:P,isCore:!1,outwardSpeed:v,phase:d.phase,motionOffset:0,speed:g,starMaterial:x.material,strong:d.strong,pathShapeDepth:x.pathShapeDepth,pathShapeDepthPhase:x.pathShapeDepthPhase,pathShapeTravel:0,travel:d.phase}),c.push(x.geometry,x.material,x.pathTexture)}),s){let e=function(e,t,a,r,o){let i=Math.max(18,Math.round(24*S.rB.clamp(e.density,.25,4))),n=new Float32Array(3*i),s=new Float32Array(i),l=new Float32Array(3*i),u=new Float32Array(i),c=new Float32Array(i),h=new Float32Array(i),p=new Float32Array(i),f=new Float32Array(i),d=ep(0xb7e15162),m=ep(0xc0ac29b7),g=0,v=-1/0;for(let t=0;t<i;t+=1){let i=.42*Math.pow(d(),2.4),u=d()*Math.PI*2,x=3*t;n[x]=Math.cos(u)*i,n[x+1]=Math.sin(u)*i*.72,n[x+2]=(d()-.5)*.16;let y=1-i/.42;s[t]=1.2+2.8*y+.6*d(),E(l,x,a,y>.74?.99:m(),r,o),c[t]=.62+.38*y,h[t]=(.28+1.45*y+.45*d())*S.rB.clamp(e.size,.25,3)*.8;let w=s[t]*h[t];w>v&&(g=t,v=w),p[t]=d()*Math.PI*2,f[t]=.55+.45*d()}u[g]=1;let x=new S.ld;x.setAttribute("position",new S.f5(n,3)),x.setAttribute("orbitProgress",new S.f5(new Float32Array(i),1)),x.setAttribute("starAcrossOffset",new S.f5(new Float32Array(i),1)),x.setAttribute("starDepthOffset",new S.f5(new Float32Array(i),1)),x.setAttribute("starHero",new S.f5(u,1)),x.setAttribute("starBrightness",new S.f5(s,1)),x.setAttribute("starColor",new S.f5(l,3)),x.setAttribute("starOpacity",new S.f5(c,1)),x.setAttribute("starScale",new S.f5(h,1)),x.setAttribute("twinklePhase",new S.f5(p,1)),x.setAttribute("twinkleRate",new S.f5(f,1));let y=em({...e,intensity:1.22*e.intensity},null,0,.18,2.4,.5),w=new S.sy(x,y);return w.frustumCulled=!1,w.renderOrder=100,t.push(x,y),{material:y,points:w}}(r,c,o,i,n);u.add(e.points),d=e.points,p.push({curve:null,fadeEnd:!0,dustMaterial:null,flareAcrossOffset:0,flareDepthOffset:0,flareProgress:0,flareLoopPhase:0,flareShapeAcrossScatter:0,flareShapeDepthScatter:0,flareShapeSeed:0,flareSource:null,isCore:!0,outwardSpeed:0,phase:0,motionOffset:0,speed:0,starMaterial:e.material,strong:!0,pathShapeDepth:.18,pathShapeDepthPhase:2.4,pathShapeTravel:0,travel:0})}let m=new S.t;m.position.set(0,0,.08),u.add(m);let g=[];if(l?.flareAnchors)for(let e of l.flareAnchors){let t=new S.t;t.userData.astraFlareColor=new S.Es(e.color??"#fafafa"),t.userData.astraFlareScale=e.scale??1,t.userData.oscillateRays=!0;let a=l.worldHeight/l.height;t.position.set((e.x-l.centerX)*a,(l.centerY-e.y)*a,.5),u.add(t),t.userData.restPosition=t.position.clone(),g.push(t),f.push(t)}return{coreCluster:d,coreSource:m,disposables:c,group:u,orbits:h,pathLayers:p,fixedFlareSources:g,secondarySources:f}})(ti,Q,L,eM,b,M,A,eu,r),[b,M,A,L,r,Q,eu,ti,eM]),ts=(0,a.useRef)(tn);return(0,a.useEffect)(()=>{tn.group.traverse(e=>{if(e instanceof S.sy)for(let t of Array.isArray(e.material)?e.material:[e.material])t.depthTest=ed||!!n?.length,t instanceof S.Zg&&t.uniforms.uCrossFlares&&(t.uniforms.uCrossFlares.value=+(!1!==F.crossFlares))}),eC()},[tn,ed,n,F.crossFlares,eC]),(0,a.useEffect)(()=>(X.current=eC,()=>{X.current=null}),[eC,X]),(0,a.useEffect)(()=>()=>{to.dispose()},[to]),(0,a.useEffect)(()=>{let e="accretion-exhale"===d?S.rB.clamp(p.duration,1,30):"grow"===d?S.rB.clamp(R.duration,1,30):"converge-tilt"===d?4:"eclipse"===d?3.3:"zoom-reveal"===d?4.8:10,t="grow"===d?e/S.rB.clamp(R.growthSpeed,.2,2):e;for(let a of(e1.current=f&&"none"!==d?0:e,e0.current=f&&"grow"===d?0:t,"zoom-reveal"===d&&(ej.current=0,eY.current=0),ts.current.pathLayers))a.motionOffset=0,a.travel=a.phase;eC()},[p.duration,f,d,m,R.duration,R.growthSpeed,eC]),(0,a.useEffect)(()=>(ts.current=tn,()=>{tn.disposables.forEach(e=>e.dispose())}),[tn]),(0,a.useEffect)(()=>{eC()},[g,v,x,w,p,f,d,b,M,A,B,R,C,D,eC,F,L,l,c,h,G,k,H,V,eu,eM]),(0,s.f)((e,t)=>{var a,o,i,n,s,u,m,g;let v,x=G&&!T?.ignoreReducedMotion,y=T?Math.max(T.duration,1/60):0,w=eR.getPixelRatio()*eD.height/720,b=r?eR.getPixelRatio()*Math.min(eD.width/r.width,eF/r.height):null,M=eL.current,A=eO.current,B=eI.current,F=ek.current;if(!M||!A||!B||!F)return;let z=T||l?0:Math.min(t,.05);T?eG.current=x?0:(o=T.time.current,(o%(i=y)+i)%i):x||(eG.current+=z);let E="accretion-exhale"===d?S.rB.clamp(p.duration,1,30):"grow"===d?S.rB.clamp(R.duration,1,30):"converge-tilt"===d?4:"eclipse"===d?3.3:"zoom-reveal"===d?4.8:10;!x&&f&&"none"!==d&&(e1.current=Math.min(e1.current+z,E+1.2*("zoom-reveal"===d)));let Y=E/S.rB.clamp(R.growthSpeed,.2,2);!x&&f&&"grow"===d&&(e0.current=Math.min(e0.current+z,Y));let X=x||!f||"none"===d?1:S.rB.clamp(e1.current/E,0,1),U="zoom-reveal"===d?q(X):null;U&&(eW.current=U.bodies);let $=U?Math.PI-Math.atan2(2*(a=eD.width,a*eT/Math.max(eD.height,1)*(a<640?.4:.32))*U.bodies.separation,2):0,K=$*(U?.bodies.rotation??0);B.rotation.y=K,B.position.set(-.2*Math.sin(K),0,.2*(1-Math.cos(K))),F.rotation.y=-$,F.position.set(.2*Math.sin($),0,.2*(1-Math.cos($)));let Q="legacy-zoom"===d?(n=X)>=1?1:1-2**(-10*n):1,J="converge-tilt"===d?S.rB.lerp(.9,0,eb(X)):0,ee="converge-tilt"===d?eb(S.rB.clamp(X/.88,0,1)):1,et="converge-tilt"===d?S.rB.lerp(.9,0,ee):0,eo="converge-tilt"===d?S.rB.smootherstep(J,0,.5):0,ei="converge-tilt"===d?S.rB.smootherstep(X,0,.5):1,eu="converge-tilt"===d?S.rB.smootherstep(et,0,.75):0,ec="converge-tilt"===d?1-S.rB.smootherstep(et,.75,1):0,eh="converge-tilt"===d?S.rB.lerp(.14,1,ei):1,ep=U?U.flare:"converge-tilt"===d?S.rB.smootherstep(X,.375,.5):1,ef="converge-tilt"===d?S.rB.lerp(1,.45,eo):1,em="accretion-exhale"===d?S.rB.smootherstep(X,0,1):1,ev="grow"===d?S.rB.smootherstep(X,0,1):1,eS="grow"===d?x||!f?1:S.rB.smootherstep(S.rB.clamp(e0.current/Y,0,1),0,1):1,eP="grow"===d?S.rB.smootherstep(eS,.72,1):1,eC=ea?Math.max(er.current,0):0,ti=x?eC:S.rB.damp(eq.current,eC,5.5,z);eq.current=ti;let tn=S.rB.clamp(ti,0,1),tl=S.rB.smootherstep(tn,0,.5),tu=S.rB.smootherstep(tn,0,.75),tc=1-S.rB.smootherstep(tn,.75,1),th=S.rB.smootherstep(tn,.5,1),tp="converge-tilt"===d?S.rB.smootherstep(J,.5,1):0,tf=Math.max(th,tp,U?.scatter??0),td=1-Math.max(th,tp);eZ.current=eh,eN.current=ep,eU.current=tf;let tm=Math.min(ea?S.rB.lerp(1,.45,tl):1,ef);if("legacy-zoom"===d)M.scale.setScalar(S.rB.lerp(2.35,1,Q)),M.rotation.set(S.rB.lerp(S.rB.degToRad(-42),0,Q),S.rB.lerp(Math.PI,0,Q),S.rB.lerp(S.rB.degToRad(5),0,Q));else if("eclipse"===d){let e=eV.current?.parent?.position,t=eH.current?.parent?.position,a=e&&t?j(X,e.x-t.x,e.z-t.z):j(X);M.scale.setScalar(1),M.rotation.set(0,a,0)}else if("converge-tilt"===d)M.scale.setScalar(1),M.rotation.set(N*eu*ec,0,0);else if("accretion-exhale"===d){let e=S.rB.smootherstep(em,S.rB.clamp(p.accretionRatio,.12,.72),1);M.scale.setScalar(S.rB.lerp(S.rB.clamp(p.startScale,.3,1.25),1,e)),M.rotation.set(0,0,0)}else M.scale.setScalar(1),M.rotation.set(0,0,0);if(M.scale.setScalar(S.rB.lerp(M.scale.x,1,th)),M.rotation.x=S.rB.lerp(M.rotation.x,0,tl)+N*tu*tc,M.rotation.y=S.rB.lerp(M.rotation.y,0,tl),M.rotation.z=S.rB.lerp(M.rotation.z,0,tl),x)A.rotation.set(0,0,0);else{let e=1-Math.exp(-(Z.current?5.5:14)*z),t="rotate"!==D||k?0:eA.current.x*td,a="rotate"===D?eA.current.y*td:0;A.rotation.x=S.rB.lerp(A.rotation.x,t,e),A.rotation.y=S.rB.lerp(A.rotation.y,a,e)}A.getWorldQuaternion(eQ),e$.set(0,0,1).applyQuaternion(eQ),eB.getWorldDirection(eK);let tg=!H||x||U?0:(v=Math.min(Math.max((.97-Math.abs(e$.dot(eK)))/.72,0),1))*v*v*(v*(6*v-15)+10);eU.current=Math.max(tf,tg);let tv=W.current,tS=!x&&"depth-lens"===D,tx=1-Math.exp(-S.rB.clamp(C.followDamping,1,30)*z);e2.current.x=S.rB.lerp(e2.current.x,tv.x,tx),e2.current.y=S.rB.lerp(e2.current.y,tv.y,tx),e5.current=S.rB.lerp(e5.current,tS&&tv.active?1:0,tx);let ty=eD.width/Math.max(eD.height,1),tw=eT*ty,tP=O.current;tP.id&&tP.samples&&tP.id!==e_.current&&(to.image.data.set(tP.samples),to.needsUpdate=!0,e_.current=tP.id),eX.current=x?0:S.rB.damp(eX.current,tP.strength,7,z);let tb=eX.current;if(x)eJ.current.set(0,0);else{let e=S.rB.smootherstep(tb,.05,.4),t=1-Math.exp(-(Z.current?5.5:14)*z),a="rotate"===D?eA.current.x*e:0,r="rotate"===D?eA.current.y*e:0;eJ.current.x=S.rB.lerp(eJ.current.x,a,t),eJ.current.y=S.rB.lerp(eJ.current.y,r,t)}ta.set(tP.centerNdc.x*tw*.5,tP.centerNdc.y*eT*.5),tr.set(tP.sizeNdc.x*tw*.5,tP.sizeNdc.y*eT*.5);let tM=Math.min(.5*Math.min(676,Math.max(eD.width-48,0))+48,.36*eD.width)/Math.max(eD.width,1)*tw,tA="grow"===d?S.rB.smootherstep(ev,0,1):1,tB="grow"===d?S.rB.lerp(0,eE,tA):eE,tR=S.rB.lerp(tB,0,tl)+(P?(P.centerY-eD.height/2)*ez/eF:0),tC=Math.max(12,Math.min(1.12*tw*.34,1.12*ez*.4)*S.rB.clamp(V,.25,3.5)+2,ed?.4*tw+.3*eT:12);eB.position.set(0,tR,tC),eB.far=Math.max(40,2*tC+eT),eB.lookAt(0,tR,0);let tD="grow"===d?S.rB.lerp(S.rB.clamp(R.startZoom,1,8),1,tA):1;eB.zoom=eD.height/eT*S.rB.lerp(tD,1,th),eB.updateProjectionMatrix();let tF="legacy-zoom"===d?S.rB.lerp(8,1,Q):"accretion-exhale"===d?S.rB.lerp(Math.max(1,4*p.inwardStrength),1,em):1,tz=S.rB.clamp(p.settleDuration/E,.03,.4),tE="accretion-exhale"===d&&em>=.999&&!x?1+Math.sin(eG.current*S.rB.clamp(p.ambientSpeed,0,3)*Math.PI*2)*S.rB.clamp(p.ambientAmount,0,.16):1,tT=2*S.rB.clamp(C.radius,32,360)/Math.max(eD.height,1),tL=ts.current;if(tL.coreCluster){let e=.36*S.rB.clamp(eM.flowSpeed,0,3)*(U?.2:1),t="grow"!==d&&eM.flowInward?1:-1,a=(ea?S.rB.lerp(1,.08,tl):1)*td*(U?S.rB.smootherstep(e1.current-E,0,1.2):1);if(x)ej.current=0,eY.current=0;else if(T)ej.current=0,eY.current=0;else{ej.current=(s=ej.current+z*e*t*a+Math.PI,(s%(u=2*Math.PI)+u)%u-Math.PI);let r=ea?S.rB.lerp(ej.current,0,tl):ej.current,o=1-Math.exp(-(ea?S.rB.lerp(14,3.5,tl):14)*z),i=Math.atan2(Math.sin(r-eY.current),Math.cos(r-eY.current));eY.current=(m=eY.current+i*o+Math.PI,(m%(g=2*Math.PI)+g)%g-Math.PI)}tL.coreCluster.rotation.set(x||T?0:.08*Math.sin(.22*eG.current)*a,x||T?0:.14*Math.cos(.28*eG.current)*a,eY.current)}let tO=S.rB.clamp(C.rotationLag,0,1),tI=Z.current?5.5:14;for(let e of tL.orbits){if(x)e.spin.set(0,0);else{let t=1-Math.exp(-(tI/(1+e.lag*tO*2.5))*z),a="rotate"===D?eA.current.x*td:0,r="rotate"===D?eA.current.y*td:0;e.spin.x=S.rB.lerp(e.spin.x,a,t),e.spin.y=S.rB.lerp(e.spin.y,r,t)}let t=0,a=0;if("legacy-zoom"===d){let r=Math.pow(Q,1+.9*e.lag),o=Q-r;t=S.rB.degToRad(-42*o),a=Math.PI*o}e.group.rotation.set(t+e.spin.x-A.rotation.x,a+e.spin.y-A.rotation.y,0)}let tk=0;if(r?.scrollTravelSeconds&&!x&&!l&&!T){let e=S.rB.clamp(window.scrollY/Math.max(window.innerHeight,1),0,1);tk=r.scrollTravelSeconds*e*(2-e)}let tH=r?.guides,tV=x||T?1:r?.orbitAge?.current??1,tW=1-S.rB.smoothstep(tV,0,.03)+S.rB.smoothstep(tV,.97,1),tG=eD.height/eT,tj=(e,t)=>{if(e.tip.equals(e.previousTip))return null;let{x:a,y:r}=t.getPointAt(1,te);return{x:eD.width/2+(a+e.tip.x)*tG,y:eD.height/2-(r+e.tip.y)*tG,dx:(e.tip.x-e.previousTip.x)*tG,dy:(e.previousTip.y-e.tip.y)*tG}},tY=tL.pathLayers[0]?.curve,tq=tL.pathLayers[2]?.curve,t_=tH&&tY?tj(tH.gold,tY):null,tX=tH&&tq?tj(tH.blue,tq):null,tZ=r?.intro?.current;for(let e of tL.fixedFlareSources){if(r?.guides){let t=r.guides.blue.tip;e.position.copy(e.userData.restPosition),e.position.x+=t.x,e.position.y+=t.y}e.scale.setScalar(tZ?tZ.blueStarReveal??0:1)}for(let[e,t]of tL.pathLayers.entries()){let a=t.starMaterial.uniforms,o=r?.guides?.[e<2?"gold":"blue"];if(o&&(a.uOrbitAge.value=tV,t.dustMaterial&&(t.dustMaterial.uniforms.uOrbitAge.value=tV),a.uFreeFlow.value=x||T?0:1,a.uGuide.value.set(o.tip.x,o.tip.y,o.bend.x,o.bend.y),t.dustMaterial?.uniforms.uGuide.value.copy(a.uGuide.value)),tZ){a.uFollowupReveal.value=S.rB.clamp((tZ.elapsed-1.77-2.6)/2.6,0,1);let t=r?.paths[e]?.endWidth;if(void 0!==t){let e=S.rB.smoothstep(a.uFollowupReveal.value,0,1);a.uEndWidth.value=S.rB.lerp(t,.55,e)}let o=e<2?.6:1.77;a.uFadeProgress.value=S.rB.clamp((tZ.elapsed-o)/2.6,0,1)}let i=U?0:"grow"===d?t.outwardSpeed:t.speed,n=t.isCore?.022:Math.abs(i),s=S.rB.smootherstep(tb,.08,.5),l=T?_(eG.current,y,t.phase):null,u=T?_(eG.current,y,t.flareLoopPhase):null;if(T)t.pathShapeTravel=0,t.motionOffset=0,t.travel=((t.phase+(l?.seconds??0)*Math.abs(i))%1+1)%1;else if(!x)if(t.pathShapeTravel=((t.pathShapeTravel+z*n*(eM.flowInward?1:-1)*S.rB.clamp(eM.flowSpeed,0,3)*s)%1+1)%1,"grow"===d&&0!==i){let e=Math.abs(i)*S.rB.clamp(eM.flowSpeed,0,3)*eP;t.motionOffset=((t.motionOffset+z*e*Math.sign(i)*td)%1+1)%1,t.travel=((t.phase+t.motionOffset)%1+1)%1}else t.motionOffset+=z*i*S.rB.clamp(eM.flowSpeed,0,3)*td,o||(t.motionOffset=(t.motionOffset%1+1)%1),t.travel=((t.travel+z*tF*Math.abs(i)*td)%1+1)%1;let f=tk*i*S.rB.clamp(eM.flowSpeed,0,3),m=t.motionOffset+f;if("hover-drift"===D&&!x)for(let r of t.hoverLayers??[])r(eB,eD.width,eD.height,m,c,a.uEndWidth.value,z,tV<1?null:tv.stroke,o,tV<1?null:e<2?tX:t_);let g=x?t.phase:((t.travel+Math.abs(f))%1+1)%1,v=i<0?1-g:g;if(t.starMaterial.uniforms.uLoopDuration.value=x?0:y,t.starMaterial.uniforms.uTrailDispersion.value=c,t.starMaterial.uniforms.uMinPointSize.value=h*eR.getPixelRatio(),t.starMaterial.uniforms.uLoopCoreSpeed.value=T&&t.isCore?.36*S.rB.clamp(eM.flowSpeed,0,3)*(eM.flowInward?1:-1):0,T?t.starMaterial.uniforms.uPixelRatio.value=w:null!==b&&(t.starMaterial.uniforms.uPixelRatio.value=b),t.starMaterial.uniforms.uTime.value=x?0:"grow"===d?t.motionOffset:eG.current,t.starMaterial.uniforms.uPathSpeed.value="grow"===d&&0!==i?1:i,t.starMaterial.uniforms.uPathOffset.value=x?0:m,t.starMaterial.uniforms.uPathShapeCenter.value.copy(ta),t.starMaterial.uniforms.uPathShapeProgress.value=tb,t.starMaterial.uniforms.uPathShapeMotion.value=t.pathShapeTravel,t.starMaterial.uniforms.uPathShapeRotation.value.copy(eJ.current),t.starMaterial.uniforms.uPathShapeScatter.value=S.rB.clamp(I,0,3),t.starMaterial.uniforms.uPathShapeSize.value.copy(tr),t.starMaterial.uniforms.uPathShapeTexture.value=to,t.starMaterial.uniforms.uGrowthDirection.value=i<0?-1:1,t.starMaterial.uniforms.uFlowSpeed.value="grow"===d&&0!==i?td:S.rB.clamp(eM.flowSpeed,0,3)*td,t.starMaterial.uniforms.uTwinkleSpeed.value=x?0:S.rB.clamp(eM.twinkleSpeed,0,2)*td,t.starMaterial.uniforms.uIntensity.value=S.rB.clamp(eM.intensity*(t.isCore?1.22:1),.1,3)*eh,t.starMaterial.uniforms.uZoomRevealExpansion.value=U?.expansion??0,t.starMaterial.uniforms.uZoomReveal.value=+!!U,t.starMaterial.uniforms.uScrollScatter.value=tf,t.starMaterial.uniforms.uRotationScatter.value=tg,t.starMaterial.uniforms.uMaxExpansion.value=S.rB.clamp(V,.25,3.5),t.starMaterial.uniforms.uScrollDrift.value=x?0:ti*S.rB.clamp(es,0,3),t.starMaterial.uniforms.uScrollSizeScale.value=tm,t.starMaterial.uniforms.uTextClearance.value=U?0:tM,t.starMaterial.uniforms.uScatterSize.value.set(eT*ty*1.12,1.12*ez),en(t.starMaterial,"accretion-exhale"===d,em,"grow"===d&&!t.isCore,eS,R.softness,tE,tz,p,e5.current,e2.current,tT,C),t.curve&&t.flareSource){let e=ew(((t.flareProgress+(x?0:u?u.seconds*i*S.rB.clamp(eM.flowSpeed,0,3):m))%1+1)%1,eM.densityFalloff),r="grow"===d?function(e,t,a){let r=(a>0?e:1-e)*.24,o=S.rB.clamp((t-r)/Math.max(1-r,1e-4),0,1),i=S.rB.smoothstep(o,0,1);return S.rB.lerp(a>0?0:1,e,i)}(e,eS,i<0?-1:1):e;if(t.curve.getPointAt(r,t.flareSource.position),o){let e=r*r*r,a=3*r*r*(1-r);t.flareSource.position.x+=e*o.tip.x+a*o.bend.x,t.flareSource.position.y+=e*o.tip.y+a*o.bend.y}t.curve.getTangentAt(r,e4).normalize(),e3.set(-e4.y,e4.x,0).normalize();let n=el(r,c,a.uEndWidth.value);t.flareSource.position.addScaledVector(e3,t.flareAcrossOffset*n),t.flareSource.position.z+=t.flareDepthOffset*n;let s=ex(r,t.fadeEnd)*ey(r,eM.sizeFalloff,t.fadeEnd)*("accretion-exhale"===d?S.rB.smootherstep(em,S.rB.clamp(p.accretionRatio,.12,.72),1):1)*("grow"===d?function(e,t,a){let r=(a>0?e:1-e)*.24;return S.rB.smoothstep(t,r,r+.025)}(e,eS,i<0?-1:1):1)*td*tm*(1-tg)*(x?1:u?.opacity??1),l=0;if(tP.samples&&tb>.001){let e=1/1023;!function(e,t,a){let r=Math.max(Math.floor(e.length/4),1),o=4*Math.min(Math.floor(S.rB.clamp(t,0,.999999)*r),r-1);a.set(e[o+2]??0,e[o+3]??1)}(tP.samples,t.flareShapeSeed,tt);let a=tt.x,r=tt.y,o=Math.max(r-a,e),i=ew(S.rB.clamp((t.flareShapeSeed-a)/o,0,1)+t.pathShapeTravel/o,eM.densityFalloff),n=S.rB.lerp(a,r,i);eg(tP.samples,n,te),eg(tP.samples,Math.max(n-e,a),e6),eg(tP.samples,Math.min(n+e,r),e8),e4.set((e8.x-e6.x)*tr.x,(e8.y-e6.y)*tr.y,0).normalize(),e3.set(-e4.y,e4.x,0).normalize();let s=Math.sin(i*Math.PI),u=Math.sin(i*Math.PI*1.35+t.pathShapeDepthPhase)*t.pathShapeDepth*s,c=S.rB.clamp(I,0,3);e9.set(te.x*tr.x,te.y*tr.y,(u+.75*t.flareDepthOffset+t.flareShapeDepthScatter)*c).addScaledVector(e3,(1.1*t.flareAcrossOffset+t.flareShapeAcrossScatter)*c),e7.set(eJ.current.x,eJ.current.y,0,"YXZ"),e9.applyEuler(e7),te.set(ta.x+e9.x,ta.y+e9.y,e9.z),t.flareSource.position.lerp(te,tb);let h=S.rB.smoothstep(e9.z,-1.15,1.15);l=S.rB.lerp(.72,1,h)*ex(i)*ey(i,eM.sizeFalloff)}let h=.54*(i>0?t.flareProgress:1-t.flareProgress)+.2*t.flareLoopPhase,f=S.rB.smoothstep(a.uFadeProgress.value,h,h+.26);t.flareSource.scale.setScalar(S.rB.lerp(s,l,tb)*S.rB.clamp(eM.largeSize??1,.25,3)*f*tW)}if(t.dustMaterial){t.dustMaterial.uniforms.uEndWidth.value=a.uEndWidth.value,t.dustMaterial.uniforms.uFadeProgress.value=a.uFadeProgress.value,t.dustMaterial.uniforms.uTrailDispersion.value=c,t.dustMaterial.uniforms.uMinPointSize.value=h*eR.getPixelRatio();let e=S.rB.clamp(L.driftSpeed,0,1.5),r=T&&e>0?Math.ceil(e*y)/y:e;t.dustMaterial.uniforms.uDriftSpeed.value=x||U?0:r*td,t.dustMaterial.uniforms.uDriftDistance.value=.16*(T&&r>0?e/r:1),T?t.dustMaterial.uniforms.uPixelRatio.value=w:null!==b&&(t.dustMaterial.uniforms.uPixelRatio.value=b),t.dustMaterial.uniforms.uZoomRevealExpansion.value=U?.expansion??0,t.dustMaterial.uniforms.uZoomReveal.value=+!!U,t.dustMaterial.uniforms.uScrollScatter.value=tf,t.dustMaterial.uniforms.uRotationScatter.value=tg,t.dustMaterial.uniforms.uMaxExpansion.value=S.rB.clamp(V,.25,3.5),t.dustMaterial.uniforms.uStarVisibility.value=td*(x?1:l?.opacity??1),t.dustMaterial.uniforms.uTrailEnabled.value=td,t.dustMaterial.uniforms.uScatterSize.value.set(eT*ty*1.12,1.12*ez),t.dustMaterial.uniforms.uHeadProgress.value=v,t.dustMaterial.uniforms.uDirection.value=i<0?-1:1,t.dustMaterial.uniforms.uIntensity.value=S.rB.clamp(L.intensity*eh,0,3),t.dustMaterial.uniforms.uLightReach.value=S.rB.clamp(L.reach,.02,.4)*(t.strong?1.15:1),t.dustMaterial.uniforms.uTime.value=x?0:eG.current,en(t.dustMaterial,"accretion-exhale"===d,em,"grow"===d,eS,R.softness,tE,tz,p,e5.current,e2.current,tT,C)}}tv.stroke&&(tv.stroke.dx=tv.stroke.dy=0)},T?-1:0),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("color",{args:[o],attach:"background"}),(0,t.jsx)("group",{ref:eL,children:(0,t.jsx)("group",{ref:eO,children:(0,t.jsx)("group",{ref:eI,children:(0,t.jsxs)("group",{ref:ek,children:[(0,t.jsx)("primitive",{dispose:null,object:tn.group}),i]})})})}),"none"!==e&&(0,t.jsx)(ei,{fullEffects:"full"===e,animationRootRef:eL,sceneOccluders:n,bloomIntensity:g,sunBloomIntensity:v,sunSurfaceRef:eH,moonSurfaceRef:eV,showCelestialBodies:ed,coreSource:tn.coreSource,dirtyGlass:B,elapsedRef:eG,introBrightnessRef:eZ,introLensFlareIntensityRef:eN,lensFlare:F,loop:T,pathShapeProgressRef:eX,reducedMotion:G,renderDriver:Y,scrollEffects:ea,scrollOffsetRef:eq,sceneScatterProgressRef:eU,secondarySources:tn.secondarySources,showCenterCluster:eu,spinRootRef:eO})]})}function ei({fullEffects:e,animationRootRef:r,sceneOccluders:o,bloomIntensity:i,sunBloomIntensity:n,sunSurfaceRef:p,moonSurfaceRef:f,showCelestialBodies:d,coreSource:m,dirtyGlass:g,elapsedRef:v,introBrightnessRef:x,introLensFlareIntensityRef:y,lensFlare:w,loop:P,pathShapeProgressRef:b,reducedMotion:M,renderDriver:B,scrollEffects:R,scrollOffsetRef:C,sceneScatterProgressRef:D,secondarySources:F,showCenterCluster:z,spinRootRef:E}){let{camera:T,size:L}=(0,u.f)(),k=(0,l.f)(S.H5,G.src),V=(0,a.useMemo)(()=>new A(H,k,I),[k]);return(0,a.useEffect)(()=>{V.setConfig(w)},[w,V]),(0,a.useEffect)(()=>{V.setDirtyGlass(g)},[g,V]),(0,a.useEffect)(()=>{V.setViewport(L.width,L.height)},[V,L.height,L.width]),(0,a.useEffect)(()=>()=>{V.dispose()},[V]),(0,s.f)((e,t)=>{let a=M&&!P?.ignoreReducedMotion,i=R?S.rB.smootherstep(S.rB.clamp(C.current,0,1),0,.5):0,n=R?S.rB.smootherstep(S.rB.clamp(C.current,0,1),.5,1):0;V.setIntensityScale(Math.max((1-i)*(1-D.current)*y.current,b.current)),V.updateSources(m,F,T,a?0:v.current,a,z?(1-Math.max(n,D.current))*y.current:0,[...d?[p.current,f.current]:[],...o?.map(e=>e.current)??[]],P?.duration);let s=r.current,l=E.current;V.updateDirtDrift((s?.rotation.x??0)+(l?.rotation.x??0),(s?.rotation.y??0)+(l?.rotation.y??0),(s?.rotation.z??0)+(l?.rotation.z??0),Math.min(t,.05),g,a,!!P)}),(0,t.jsxs)(c.g,{frameBufferType:S.HN,multisampling:2*!!e,children:[(0,t.jsx)(c.w,{...O,levels:e?O.levels:3,intensity:i}),(0,t.jsx)("primitive",{dispose:null,object:V}),(0,t.jsx)(c.z,{mode:h.F.ACES_FILMIC})]})}function en(e,t,a,r,o,i,n,s,l,u,c,h,p){let f=e.uniforms;f.uAccretionRatio.value=S.rB.clamp(l.accretionRatio,.12,.72),f.uAmbientPulse.value=n,f.uCoreIntensity.value=S.rB.clamp(l.coreIntensity,.5,3),f.uExhaleStrength.value=S.rB.clamp(l.exhaleStrength,0,1.5),f.uFormationEnabled.value=+!!t,f.uFormationProgress.value=a,f.uGrowthEnabled.value=+!!r,f.uGrowthProgress.value=o,f.uGrowthSoftness.value=S.rB.clamp(i,.005,.3),f.uInwardStrength.value=S.rB.clamp(l.inwardStrength,0,3),f.uPropagationSoftness.value=S.rB.clamp(l.propagationSoftness,0,.6),f.uSettleRatio.value=s,f.uLensActive.value=u,f.uLensDepth.value=S.rB.clamp(p.depthDisplacement,-1.5,1.5),f.uLensIllumination.value=S.rB.clamp(p.illumination,0,2),f.uLensMagnification.value=S.rB.clamp(p.magnification,-.3,.8),f.uLensPointer.value.copy(c),f.uLensRadius.value=h}let es=`
  vec3 zoomRevealPosition(
    vec3 start, vec3 target, float sphereRadius, float expansion
  ) {
    vec3 center = vec3(0.0, 1.2, 0.0);
    vec3 from = start - center;
    vec3 to = target - center;
    float startRadius = length(from.xy);
    float startAngle = startRadius > 0.0001 ? atan(from.y, from.x) : 0.0;
    float endAngle = length(to.xy) > 0.0001 ? atan(to.y, to.x) : startAngle;
    float angleDelta = atan(sin(endAngle - startAngle), cos(endAngle - startAngle)) * 0.1;
    float angle = startAngle + angleDelta;
    // The destination must lie beyond the tangent at the starting point:
    // dot(from.xy, destination.xy - from.xy) >= 0 prevents any inward travel.
    float endRadius = max(startRadius / cos(angleDelta), length(to.xy));
    float depthLimit = sqrt(max(sphereRadius * sphereRadius - endRadius * endRadius, 0.0));
    vec3 destination = center + vec3(
      vec2(cos(angle), sin(angle)) * endRadius,
      clamp(to.z, -depthLimit, depthLimit)
    );
    return mix(start, destination, expansion);
  }
`;function el(e,t,a){return S.rB.lerp(1,a,S.rB.smoothstep(e,.94,1))*(1+18*S.rB.clamp(t,0,1)*Math.pow(1-S.rB.clamp(e,0,1),1.35))}let eu=`
  ${X}
  uniform vec4 uGuide;
  // Cubic Bezier displacement, anchored upstream with a trailing control point.
  vec2 streamOffset(float t) {
    return t * t * (t * uGuide.xy + 3.0 * (1.0 - t) * uGuide.zw);
  }
  uniform float uTrailDispersion;
  uniform float uEndWidth;
  uniform float uMinPointSize;
  float trailSpreadScale(float progress) {
    float taper = mix(1.0, uEndWidth, smoothstep(0.94, 1.0, progress));
    return taper * (1.0 + clamp(uTrailDispersion, 0.0, 1.0) * 18.0
      * pow(1.0 - clamp(progress, 0.0, 1.0), 1.35));
  }
`,ec=`
  ${es}
  ${eu}
  attribute float driftPhase;
  attribute vec3 driftTangent;
  attribute vec3 trailOffset;
  attribute float orbitProgress;
  attribute float particleOpacity;
  attribute float particleScale;

  uniform float uDirection;
  uniform float uDriftDistance;
  uniform float uFadeProgress;
  uniform float uDriftSpeed;
  uniform float uAccretionRatio;
  uniform float uAmbientPulse;
  uniform float uCoreIntensity;
  uniform float uExhaleStrength;
  uniform float uFormationEnabled;
  uniform float uFormationProgress;
  uniform float uGrowthEnabled;
  uniform float uGrowthProgress;
  uniform float uGrowthRadius;
  uniform float uGrowthSoftness;
  uniform float uHeadProgress;
  uniform float uInwardStrength;
  uniform float uIntensity;
  uniform float uLightReach;
  uniform float uPixelRatio;
  uniform float uStarBrightness;
  uniform float uStarVisibility;
  uniform float uTrailEnabled;
  uniform float uTrailLength;
  uniform float uTime;
  uniform float uPropagationSoftness;
  uniform float uSettleRatio;
  uniform float uLensActive;
  uniform float uLensDepth;
  uniform float uLensIllumination;
  uniform float uLensMagnification;
  uniform vec2 uLensPointer;
  attribute vec2 hoverOffset;
  uniform float uLensRadius;
  uniform float uZoomRevealExpansion;
  uniform float uZoomReveal;
  uniform vec2 uScatterSize;
  uniform float uScrollScatter;
  uniform float uRotationScatter;
  uniform float uMaxExpansion;

  varying float vBrightness;
  varying float vLens;
  varying float vOpacity;

  void main() {
    float distanceToStar = abs(orbitProgress - uHeadProgress);
    float illumination = 1.0 - smoothstep(
      uLightReach * 0.08,
      uLightReach,
      distanceToStar
    );
    illumination *= illumination * uStarVisibility;

    float distanceBehind = uDirection > 0.0
      ? uHeadProgress - orbitProgress
      : orbitProgress - uHeadProgress;
    if (distanceBehind < 0.0) {
      distanceBehind += 1.0;
    }

    float trailIllumination = 1.0 - smoothstep(
      0.0,
      max(uTrailLength, 0.0001),
      distanceBehind
    );
    trailIllumination *= trailIllumination
      * uTrailEnabled
      * uStarVisibility;
    illumination = max(illumination, trailIllumination * 0.68);

    vBrightness = uIntensity * (
      0.16 + illumination * uStarBrightness * 3.6
    );
    vOpacity = particleOpacity * (0.22 + illumination * 0.78);
    float distanceFromSource = uDirection > 0.0 ? orbitProgress : 1.0 - orbitProgress;
    float fadeStart = 0.54 * distanceFromSource + 0.2 * fract(driftPhase);
    vOpacity *= smoothstep(fadeStart, fadeStart + 0.26, uFadeProgress);
    float driftActive = step(0.0001, uDriftSpeed);
    float driftCycle = fract(driftPhase + uTime * uDriftSpeed);
    float driftFade = smoothstep(0.0, 0.1, driftCycle)
      * (1.0 - smoothstep(0.9, 1.0, driftCycle));
    vOpacity *= mix(1.0, driftFade, driftActive);
    vec3 basePosition = position + trailOffset * (trailSpreadScale(orbitProgress) - 1.0) + driftTangent
      * (driftCycle - 0.5)
      * uDriftDistance
      * uDirection
      * driftActive;
    basePosition.xy += streamOffset(orbitProgress);
    float strain = min(length(uGuide.xy - uGuide.zw), 4.0);
    basePosition.xy += trailOffset.xy * strain * sin(orbitProgress * 3.14159265);
    float radialDistance = length(basePosition.xy);
    float localProgress = clamp(
      uFormationProgress
        - radialDistance * uPropagationSoftness * 0.018,
      0.0,
      1.0
    );
    float accretionEnd = clamp(uAccretionRatio, 0.12, 0.72);
    float settleStart = max(accretionEnd + 0.08, 1.0 - uSettleRatio);
    float inward = smoothstep(0.0, accretionEnd, localProgress);
    float exhale = smoothstep(accretionEnd, settleStart, localProgress);
    vec2 radialDirection = basePosition.xy / max(radialDistance, 0.0001);
    vec3 farPosition = basePosition;
    farPosition.xy += radialDirection * uInwardStrength * (2.0 + radialDistance * 0.28);
    farPosition.z += uInwardStrength * 0.8;
    vec3 condensedPosition = vec3(
      basePosition.xy * 0.045,
      basePosition.z * 0.12
    );
    vec3 formedPosition = mix(farPosition, condensedPosition, inward);
    formedPosition = mix(formedPosition, basePosition, exhale);
    formedPosition.xy += radialDirection
      * sin(exhale * 3.14159265359)
      * (1.0 - exhale)
      * uExhaleStrength;
    float formationVisibility = mix(0.08, 0.56, inward);
    formationVisibility = mix(formationVisibility, 1.0, exhale);
    float coreBurst = exp(-pow((localProgress - accretionEnd) * 11.0, 2.0));
    vBrightness *= mix(
      1.0,
      uAmbientPulse + coreBurst * (uCoreIntensity - 1.0),
      uFormationEnabled
    );
    vOpacity *= mix(1.0, formationVisibility, uFormationEnabled);
    vec3 animatedPosition = mix(basePosition, formedPosition, uFormationEnabled);
    float scatterX = fract(sin(
      dot(vec2(orbitProgress, driftPhase), vec2(127.1, 311.7))
    ) * 43758.5453);
    float scatterY = fract(sin(
      dot(vec2(driftPhase, particleScale), vec2(269.5, 183.3))
    ) * 43758.5453);
    float scatterZ = fract(sin(
      dot(vec2(orbitProgress, particleOpacity), vec2(419.2, 371.9))
    ) * 43758.5453);
    vec3 scatteredPosition = vec3(
      (scatterX - 0.5) * uScatterSize.x,
      (scatterY - 0.5) * uScatterSize.y,
      (scatterZ - 0.5) * 0.5
    );
    scatteredPosition.y -= (1.0 - uZoomReveal) * sin(uScrollScatter * 3.14159265359)
      * (0.7 + scatterZ * 1.4);
    // Uniform directions and cube-root radii fill a sphere instead of a box.
    float scatterAzimuth = scatterX * 6.28318530718;
    float scatterHeight = scatterY * 2.0 - 1.0;
    float scatterRing = sqrt(max(0.0, 1.0 - scatterHeight * scatterHeight));
    float sphereRadius = min(uScatterSize.x * 0.34, uScatterSize.y * 0.4) * uMaxExpansion;
    float scatterRadius = pow(scatterZ, 1.0 / 3.0) * sphereRadius;
    vec3 rotationScatterPosition = vec3(
      cos(scatterAzimuth) * scatterRing,
      scatterHeight,
      sin(scatterAzimuth) * scatterRing
    ) * scatterRadius + vec3(0.0, 1.2, 0.0);
    // Zoom Reveal grows directly into the sphere, with no inward settling phase.
    vec3 revealPosition = zoomRevealPosition(
      animatedPosition, rotationScatterPosition, sphereRadius,
      uZoomRevealExpansion
    );
    animatedPosition = mix(
      mix(animatedPosition, scatteredPosition, uScrollScatter),
      revealPosition,
      uZoomReveal
    );
    // Break up the 6 while keeping the dispersed stars close to its original volume.
    animatedPosition = mix(animatedPosition, rotationScatterPosition, uRotationScatter * 0.7);
    float growthVisibility = (
      1.0 - smoothstep(
        uGrowthProgress,
        uGrowthProgress + max(uGrowthSoftness, 0.001),
        radialDistance / max(uGrowthRadius, 0.001)
      )
    ) * smoothstep(0.0, 0.025, uGrowthProgress);
    vOpacity *= mix(1.0, growthVisibility, uGrowthEnabled);
    gl_PointSize = uPixelRatio * (
      1.0 + particleScale * 1.35 + illumination * 1.25
    ) * mix(1.0, 1.0 + coreBurst * 0.35, uFormationEnabled)
      * mix(1.0, 0.3 + growthVisibility * 0.7, uGrowthEnabled);

    animatedPosition.xy = whirlPosition(animatedPosition.xy, fract(driftPhase), 0.85);
    vec4 viewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    vec4 clipPosition = projectionMatrix * viewPosition;
    vec2 ndc = clipPosition.xy / max(clipPosition.w, 0.0001);
    float lensDistance = length(ndc - uLensPointer);
    vLens = (1.0 - smoothstep(0.0, uLensRadius, lensDistance)) * uLensActive;
    viewPosition.z += vLens * uLensDepth;
    clipPosition = projectionMatrix * viewPosition;
    clipPosition.xy = uLensPointer * clipPosition.w
      + (clipPosition.xy - uLensPointer * clipPosition.w)
      * (1.0 + vLens * uLensMagnification);
    vBrightness *= 1.0 + vLens * uLensIllumination;
    gl_PointSize *= 1.0 + vLens * uLensMagnification * 0.7;
    // Keep a stable sampling footprint, reducing opacity instead of dropping
    // tiny particles below a pixel as they travel across the screen.
    vOpacity *= min(1.0, gl_PointSize / max(uMinPointSize, 0.001));
    gl_PointSize = max(gl_PointSize, uMinPointSize);
    clipPosition.xy += clipPosition.w * hoverOffset;
    gl_Position = clipPosition;
  }
`,eh=`
  varying float vBrightness;
  varying float vLens;
  varying float vOpacity;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float disc = 1.0 - smoothstep(0.22, 1.0, distanceToCenter);
    float alpha = pow(disc, 1.5) * vOpacity;

    if (alpha <= 0.001) {
      discard;
    }

    gl_FragColor = vec4(vec3(vBrightness), alpha);
  }
`;function ep(e){let t=e>>>0;return()=>{let e=t+=0x6d2b79f5;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/0x100000000}}function ef(e,t,a,r){let o=43758.5453*Math.sin(e*a+t*r);return o-Math.floor(o)}let ed=`
  ${eu}
  ${es}
  attribute float orbitProgress;
  attribute float starAcrossOffset;
  attribute float starBrightness;
  attribute vec3 starColor;
  attribute float starDepthOffset;
  attribute float starHero;
  attribute float starOpacity;
  attribute float starScale;
  attribute float twinklePhase;
  attribute float twinkleRate;

  uniform float uIntensity;
  uniform float uAccretionRatio;
  uniform float uAmbientPulse;
  uniform float uCoreIntensity;
  uniform float uDensityFalloff;
  uniform float uFlowSpeed;
  uniform float uExhaleStrength;
  uniform float uFormationEnabled;
  uniform float uFormationProgress;
  uniform float uGrowthEnabled;
  uniform float uGrowthDirection;
  uniform float uGrowthProgress;
  uniform float uGrowthRadius;
  uniform float uGrowthSoftness;
  uniform float uInwardStrength;
  uniform float uLensActive;
  uniform float uLensDepth;
  uniform float uLensIllumination;
  uniform float uLensMagnification;
  uniform vec2 uLensPointer;
  attribute vec2 hoverOffset;
  uniform float uLensRadius;
  uniform vec2 uPathShapeCenter;
  uniform float uPathShapeBrightRetention;
  uniform float uPathShapeDepth;
  uniform float uPathShapeDepthPhase;
  uniform float uPathShapeMotion;
  uniform float uPathShapeProgress;
  uniform vec2 uPathShapeRotation;
  uniform float uPathShapeScatter;
  uniform float uPathShapeSampleCount;
  uniform vec2 uPathShapeSize;
  uniform vec2 uPathShapeTrackedScatter;
  uniform float uPathShapeTrackedSeed;
  uniform float uPathShapeTrackingEnabled;
  uniform sampler2D uPathShapeTexture;
  uniform float uZoomRevealExpansion;
  uniform float uZoomReveal;
  uniform vec2 uScatterSize;
  uniform float uScrollDrift;
  uniform float uScrollScatter;
  uniform float uRotationScatter;
  uniform float uMaxExpansion;
  uniform float uScrollSizeScale;
  uniform float uTextClearance;
  uniform float uPathMotion;
  uniform float uPathOffset;
  uniform float uFreeFlow;
  uniform float uPathSampleCount;
  uniform float uPathSpeed;
  uniform float uPixelRatio;
  uniform float uSizeFalloff;
  uniform float uInitialCount;
  uniform float uFollowupReveal;
  uniform float uFadeProgress;
  uniform float uEndFade;
  uniform float uSmallStarSize;
  uniform float uLargeStarSize;
  uniform float uCrossFlares;
  uniform float uPropagationSoftness;
  uniform float uSettleRatio;
  uniform float uTime;
  uniform float uLoopDuration;
  uniform float uLoopCoreSpeed;
  uniform float uTwinkleSpeed;
  uniform sampler2D uPathTexture;

  varying float vBrightness;
  varying vec3 vColor;
  varying float vLens;
  varying float vOpacity;
  varying float vRayStrength;

  vec3 samplePath(float progress) {
    float scaledProgress = clamp(progress, 0.0, 1.0)
      * (uPathSampleCount - 1.0);
    float lowerIndex = floor(scaledProgress);
    float upperIndex = min(lowerIndex + 1.0, uPathSampleCount - 1.0);
    float blend = fract(scaledProgress);
    vec3 lowerPoint = texture2D(
      uPathTexture,
      vec2((lowerIndex + 0.5) / uPathSampleCount, 0.5)
    ).xyz;
    vec3 upperPoint = texture2D(
      uPathTexture,
      vec2((upperIndex + 0.5) / uPathSampleCount, 0.5)
    ).xyz;
    return mix(lowerPoint, upperPoint, blend);
  }

  vec4 samplePathShape(float progress) {
    float scaledProgress = clamp(progress, 0.0, 1.0)
      * (uPathShapeSampleCount - 1.0);
    float lowerIndex = floor(scaledProgress);
    float upperIndex = min(lowerIndex + 1.0, uPathShapeSampleCount - 1.0);
    float blend = fract(scaledProgress);
    vec4 lowerPoint = texture2D(
      uPathShapeTexture,
      vec2((lowerIndex + 0.5) / uPathShapeSampleCount, 0.5)
    );
    vec4 upperPoint = texture2D(
      uPathShapeTexture,
      vec2((upperIndex + 0.5) / uPathShapeSampleCount, 0.5)
    );
    return mix(lowerPoint, upperPoint, blend);
  }

  vec2 samplePathShapeRange(float progress) {
    float sampleIndex = min(
      floor(clamp(progress, 0.0, 0.999999) * uPathShapeSampleCount),
      uPathShapeSampleCount - 1.0
    );
    return texture2D(
      uPathShapeTexture,
      vec2((sampleIndex + 0.5) / uPathShapeSampleCount, 0.5)
    ).zw;
  }

  void main() {
    float loopSeconds = 0.0;
    float loopOpacity = 1.0;
    float loopEnabled = step(0.0001, uLoopDuration);
    if (loopEnabled > 0.5) {
      float age = fract(twinklePhase / 6.28318530718 + uTime / uLoopDuration);
      loopSeconds = (age - 0.5) * uLoopDuration;
      loopOpacity = smoothstep(0.0, 0.10, age)
        * (1.0 - smoothstep(0.90, 1.0, age));
      // Keep the core's brightest anchor steady as its surrounding stars recycle.
      if (uPathMotion < 0.5 && starHero > 0.5) {
        loopSeconds = 0.0;
        loopOpacity = 1.0;
      }
    }
    float pathOffset = loopEnabled > 0.5
      ? loopSeconds * uPathSpeed * uFlowSpeed
      : uPathOffset;
    // Nearer, brighter stars cruise faster. Keep the tracked flare on its CPU path.
    float layer = clamp(starScale * 0.34 + starDepthOffset * 0.8, 0.0, 1.0);
    float mobility = uFreeFlow * (1.0 - starHero);
    float cruise = mix(1.0, 0.42 + 1.65 * layer, mobility);
    float pathPhase = fract(orbitProgress + pathOffset * cruise);
    float targetProgress = pathPhase + uDensityFalloff
      * sin(pathPhase * 6.28318530718)
      / 6.28318530718;
    float outwardTarget = uGrowthDirection > 0.0
      ? targetProgress
      : 1.0 - targetProgress;
    float growthBirth = outwardTarget * 0.24;
    float growthLocal = clamp(
      (uGrowthProgress - growthBirth) / max(1.0 - growthBirth, 0.0001),
      0.0,
      1.0
    );
    float growthTravel = growthLocal * growthLocal * (3.0 - 2.0 * growthLocal);
    float growthStart = uGrowthDirection > 0.0 ? 0.0 : 1.0;
    float emittedProgress = mix(growthStart, targetProgress, growthTravel);
    float progress = mix(targetProgress, emittedProgress, uGrowthEnabled);
    float growthVisibility = smoothstep(
      growthBirth,
      growthBirth + 0.025,
      uGrowthProgress
    );
    float middleWeight = sin(clamp(progress, 0.0, 1.0) * 3.14159265359);
    middleWeight = mix(middleWeight, 1.0, smoothstep(0.5, 1.0, progress) * (1.0 - uEndFade));
    float sizeEnvelope = mix(
      1.0,
      0.14 + 0.86 * pow(max(middleWeight, 0.0), 0.68),
      uSizeFalloff
    );
    float endpointVisibility = smoothstep(0.0, 0.055, progress)
      * (1.0 - smoothstep(0.945, 1.0, progress) * uEndFade);
    vec3 animatedPosition = position;

    if (uPathMotion > 0.5) {
      float tangentStep = 1.0 / max(uPathSampleCount - 1.0, 1.0);
      vec3 pathPosition = samplePath(progress);
      pathPosition.xy += streamOffset(progress);
      // Broad, slow currents share a rhythm; each star has its own depth and phase.
      float belly = sin(progress * 3.14159265);
      float strain = min(length(uGuide.xy - uGuide.zw), 4.0);
      float drift = mobility * (0.18 + layer * 0.38 + strain * 0.35) * belly;
      float wave = uTime * (0.28 + layer * 0.31) + twinklePhase;
      pathPosition.xy += drift * vec2(sin(wave + pathPosition.y), cos(wave * 0.73 + pathPosition.x * 0.6));
      pathPosition.z += drift * sin(wave * 0.57);
      vec3 before = samplePath(max(progress - tangentStep, 0.0));
      vec3 after = samplePath(min(progress + tangentStep, 1.0));
      vec3 tangent = normalize(after - before);
      vec3 across = normalize(vec3(-tangent.y, tangent.x, 0.0));
      float spread = trailSpreadScale(progress);
      animatedPosition = pathPosition
        + across * starAcrossOffset * spread * mix(1.0, growthTravel, uGrowthEnabled)
        + vec3(
          0.0,
          0.0,
          starDepthOffset * spread * mix(1.0, growthTravel, uGrowthEnabled)
        );
    } else {
      sizeEnvelope = 1.0;
      endpointVisibility = 1.0;
      if (loopEnabled > 0.5) {
        float angle = loopSeconds * uLoopCoreSpeed;
        float cosAngle = cos(angle);
        float sinAngle = sin(angle);
        animatedPosition.xy = vec2(
          animatedPosition.x * cosAngle - animatedPosition.y * sinAngle,
          animatedPosition.x * sinAngle + animatedPosition.y * cosAngle
        );
      }
    }

    float radialDistance = length(animatedPosition.xy);
    float localProgress = clamp(
      uFormationProgress
        - radialDistance * uPropagationSoftness * 0.018,
      0.0,
      1.0
    );
    float accretionEnd = clamp(uAccretionRatio, 0.12, 0.72);
    float settleStart = max(accretionEnd + 0.08, 1.0 - uSettleRatio);
    float inward = smoothstep(0.0, accretionEnd, localProgress);
    float exhale = smoothstep(accretionEnd, settleStart, localProgress);
    vec2 radialDirection = animatedPosition.xy / max(radialDistance, 0.0001);
    vec3 farPosition = animatedPosition;
    farPosition.xy += radialDirection * uInwardStrength * (2.0 + radialDistance * 0.28);
    farPosition.z += uInwardStrength * 0.8;
    vec3 condensedPosition = vec3(
      animatedPosition.xy * 0.045,
      animatedPosition.z * 0.12
    );
    vec3 formedPosition = mix(farPosition, condensedPosition, inward);
    formedPosition = mix(formedPosition, animatedPosition, exhale);
    formedPosition.xy += radialDirection
      * sin(exhale * 3.14159265359)
      * (1.0 - exhale)
      * uExhaleStrength;
    float formationVisibility = mix(0.06, 0.58, inward);
    formationVisibility = mix(formationVisibility, 1.0, exhale);
    float coreBurst = exp(-pow((localProgress - accretionEnd) * 11.0, 2.0));
    animatedPosition = mix(animatedPosition, formedPosition, uFormationEnabled);
    float scatterX = fract(sin(
      dot(vec2(orbitProgress, twinklePhase), vec2(127.1, 311.7))
    ) * 43758.5453);
    float scatterY = fract(sin(
      dot(vec2(twinklePhase, starScale), vec2(269.5, 183.3))
    ) * 43758.5453);
    float scatterZ = fract(sin(
      dot(vec2(orbitProgress, starBrightness), vec2(419.2, 371.9))
    ) * 43758.5453);
    float clearanceSeed = fract(sin(
      dot(vec2(starOpacity, twinkleRate), vec2(157.3, 283.9))
    ) * 43758.5453);
    float keepInCenter = step(0.72, clearanceSeed);
    float scatterSide = scatterX < 0.5 ? -1.0 : 1.0;
    float outerProgress = fract(scatterX * 2.0);
    float outerX = scatterSide * mix(
      uTextClearance,
      uScatterSize.x * 0.5,
      outerProgress
    );
    vec3 scatteredPosition = vec3(
      mix(outerX, (scatterX - 0.5) * uScatterSize.x, keepInCenter),
      (scatterY - 0.5) * uScatterSize.y,
      (scatterZ - 0.5) * 0.5
    );
    float scrollDrift = uScrollDrift * mix(0.035, 0.09, scatterZ);
    scatteredPosition.y = mod(
      scatteredPosition.y + scrollDrift + uScatterSize.y * 0.5,
      uScatterSize.y
    ) - uScatterSize.y * 0.5;
    scatteredPosition.y -= (1.0 - uZoomReveal) * sin(uScrollScatter * 3.14159265359)
      * (0.8 + scatterZ * 1.6);
    // Uniform directions and cube-root radii fill a sphere instead of a box.
    float scatterAzimuth = scatterX * 6.28318530718;
    float scatterHeight = scatterY * 2.0 - 1.0;
    float scatterRing = sqrt(max(0.0, 1.0 - scatterHeight * scatterHeight));
    float sphereRadius = min(uScatterSize.x * 0.34, uScatterSize.y * 0.4) * uMaxExpansion;
    float scatterRadius = pow(scatterZ, 1.0 / 3.0) * sphereRadius;
    vec3 rotationScatterPosition = vec3(
      cos(scatterAzimuth) * scatterRing,
      scatterHeight,
      sin(scatterAzimuth) * scatterRing
    ) * scatterRadius + vec3(0.0, 1.2, 0.0);
    // Zoom Reveal grows directly into the sphere, with no inward settling phase.
    vec3 revealPosition = zoomRevealPosition(
      animatedPosition, rotationScatterPosition, sphereRadius,
      uZoomRevealExpansion
    );
    animatedPosition = mix(
      mix(animatedPosition, scatteredPosition, uScrollScatter),
      revealPosition,
      uZoomReveal
    );
    // Break up the 6 while keeping the dispersed stars close to its original volume.
    animatedPosition = mix(animatedPosition, rotationScatterPosition, uRotationScatter * 0.7);
    float pathShapeDepthCue = 1.0;
    float pathShapeOpacityCue = 1.0;
    float pathShapeBrightKeep = 1.0;
    float shapeBaseSeed = fract(
      orbitProgress * 0.754877666
      + twinklePhase * 0.159154943
      + starScale * 0.117
    );
    float pathShapeTrackingWeight = starHero * uPathShapeTrackingEnabled;
    shapeBaseSeed = mix(
      shapeBaseSeed,
      uPathShapeTrackedSeed,
      pathShapeTrackingWeight
    );
    vec2 shapeRange = samplePathShapeRange(shapeBaseSeed);
    float shapeRangeSpan = max(
      shapeRange.y - shapeRange.x,
      1.0 / uPathShapeSampleCount
    );
    float shapeLocalSeed = clamp(
      (shapeBaseSeed - shapeRange.x) / shapeRangeSpan,
      0.0,
      1.0
    );
    float shapeLocalPhase = fract(
      shapeLocalSeed + uPathShapeMotion / shapeRangeSpan
    );
    float shapeLocalProgress = shapeLocalPhase + uDensityFalloff
      * sin(shapeLocalPhase * 6.28318530718)
      / 6.28318530718;
    float shapeSeed = mix(
      shapeRange.x,
      shapeRange.y,
      shapeLocalProgress
    );
    float shapeStep = 1.0 / max(uPathShapeSampleCount - 1.0, 1.0);
    vec3 pathShapePosition = samplePathShape(shapeSeed).xyz;
    vec2 pathShapeBefore = samplePathShape(
      max(shapeSeed - shapeStep, shapeRange.x)
    ).xy * uPathShapeSize;
    vec2 pathShapeAfter = samplePathShape(
      min(shapeSeed + shapeStep, shapeRange.y)
    ).xy * uPathShapeSize;
    vec2 pathShapeTangent = normalize(
      pathShapeAfter - pathShapeBefore + vec2(0.0001, 0.0)
    );
    vec2 pathShapeAcross = vec2(
      -pathShapeTangent.y,
      pathShapeTangent.x
    );
    float pathShapeRandomAcrossScatter = mix(
      (scatterX + scatterY - 1.0) * 0.12,
      uPathShapeTrackedScatter.x,
      pathShapeTrackingWeight
    );
    float pathShapeScatter = (
      starAcrossOffset * 1.1
      + pathShapeRandomAcrossScatter
    ) * uPathShapeScatter;
    float pathShapeDepthEnvelope = sin(
      shapeLocalProgress * 3.14159265359
    );
    float pathShapeContourDepth = sin(
      shapeLocalProgress * 3.14159265359 * 1.35
        + uPathShapeDepthPhase
    ) * uPathShapeDepth * pathShapeDepthEnvelope;
    float pathShapeRandomDepthScatter = mix(
      (scatterZ - 0.5) * 0.22,
      uPathShapeTrackedScatter.y,
      pathShapeTrackingWeight
    );
    vec3 pathShapeOffset = vec3(
      pathShapePosition.xy * uPathShapeSize
        + pathShapeAcross * pathShapeScatter,
      pathShapeContourDepth
      + starDepthOffset * 0.75
      + pathShapeRandomDepthScatter
    );
    pathShapeOffset.z *= uPathShapeScatter;
    float pathShapeCosX = cos(uPathShapeRotation.x);
    float pathShapeSinX = sin(uPathShapeRotation.x);
    pathShapeOffset = vec3(
      pathShapeOffset.x,
      pathShapeOffset.y * pathShapeCosX
        - pathShapeOffset.z * pathShapeSinX,
      pathShapeOffset.y * pathShapeSinX
        + pathShapeOffset.z * pathShapeCosX
    );
    float pathShapeCosY = cos(uPathShapeRotation.y);
    float pathShapeSinY = sin(uPathShapeRotation.y);
    pathShapeOffset = vec3(
      pathShapeOffset.x * pathShapeCosY
        + pathShapeOffset.z * pathShapeSinY,
      pathShapeOffset.y,
      -pathShapeOffset.x * pathShapeSinY
        + pathShapeOffset.z * pathShapeCosY
    );
    pathShapePosition = vec3(uPathShapeCenter, 0.0) + pathShapeOffset;
    float pathShapeFrontness = smoothstep(-1.15, 1.15, pathShapeOffset.z);
    pathShapeDepthCue = mix(0.78, 1.18, pathShapeFrontness);
    pathShapeOpacityCue = mix(0.72, 1.0, pathShapeFrontness);
    float pathShapeMiddleWeight = sin(
      clamp(shapeLocalProgress, 0.0, 1.0) * 3.14159265359
    );
    float pathShapeSizeEnvelope = mix(
      1.0,
      0.14 + 0.86 * pow(max(pathShapeMiddleWeight, 0.0), 0.68),
      uSizeFalloff
    );
    float pathShapeEndpointVisibility = smoothstep(
      0.0,
      0.055,
      shapeLocalProgress
    ) * (1.0 - smoothstep(0.945, 1.0, shapeLocalProgress));
    float pathShapeBrightSeed = fract(sin(
      dot(vec2(orbitProgress, twinklePhase), vec2(193.7, 417.2))
    ) * 43758.5453);
    pathShapeBrightKeep = max(
      starHero,
      step(1.0 - uPathShapeBrightRetention, pathShapeBrightSeed)
    );
    animatedPosition = mix(
      animatedPosition,
      pathShapePosition,
      uPathShapeProgress
    );
    endpointVisibility = mix(endpointVisibility, 1.0, max(uScrollScatter, uRotationScatter));
    sizeEnvelope = mix(sizeEnvelope, 1.0, max(uScrollScatter, uRotationScatter));
    endpointVisibility = mix(
      endpointVisibility,
      pathShapeEndpointVisibility,
      uPathShapeProgress
    );
    sizeEnvelope = mix(
      sizeEnvelope,
      pathShapeSizeEnvelope,
      uPathShapeProgress
    );

    float twinkleTime = loopEnabled > 0.5 ? loopSeconds : uTime;
    float twinkle = 0.86 + 0.14 * sin(
      twinklePhase + twinkleTime * uTwinkleSpeed * twinkleRate
    );
    float brightStarWeight = smoothstep(1.35, 1.65, starBrightness);
    float pathShapeSuppressedBright = uPathShapeProgress
      * brightStarWeight
      * (1.0 - pathShapeBrightKeep);
    vBrightness = uIntensity * starBrightness * twinkle
      * mix(
        1.0,
        uAmbientPulse + coreBurst * (uCoreIntensity - 1.0),
        uFormationEnabled
      )
      * mix(1.0, pathShapeDepthCue, uPathShapeProgress)
      * mix(1.0, 0.42, pathShapeSuppressedBright);
    vColor = starColor;
    float distanceFromSource = uPathSpeed > 0.0 ? orbitProgress : 1.0 - orbitProgress;
    float fadeStart = 0.54 * distanceFromSource + 0.2 * fract(twinklePhase / 6.28318530718);
    float followupOpacity = float(gl_VertexID) < uInitialCount ? 1.0
      : smoothstep(0.2 * fract(twinklePhase / 6.28318530718),
                   0.8 + 0.2 * fract(twinklePhase / 6.28318530718), uFollowupReveal);
    vOpacity = followupOpacity * starOpacity * smoothstep(fadeStart, fadeStart + 0.26, uFadeProgress)
      * loopOpacity
      * endpointVisibility
      * (0.92 + twinkle * 0.08)
      * mix(1.0, formationVisibility, uFormationEnabled);
    vOpacity *= mix(1.0, growthVisibility, uGrowthEnabled);
    vOpacity *= mix(1.0, pathShapeOpacityCue, uPathShapeProgress);
    vRayStrength = uCrossFlares * smoothstep(1.45, 2.8, starBrightness)
      * mix(1.0, pathShapeBrightKeep, uPathShapeProgress);
    float scrollSizeScale = mix(
      uScrollSizeScale,
      1.0,
      uPathShapeProgress * brightStarWeight * pathShapeBrightKeep
    );
    gl_PointSize = uPixelRatio
      * (0.35 + starScale * sizeEnvelope * endpointVisibility * 3.8
        * mix(uSmallStarSize, uLargeStarSize, brightStarWeight))
      * (0.97 + twinkle * 0.03)
      * mix(1.0, 1.0 + coreBurst * 0.42, uFormationEnabled)
      * mix(1.0, 0.3 + growthVisibility * 0.7, uGrowthEnabled)
      * scrollSizeScale
      * mix(1.0, pathShapeDepthCue, uPathShapeProgress);
    animatedPosition.xy = whirlPosition(animatedPosition.xy, fract(twinklePhase), 1.0 - layer);
    vec4 viewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    vec4 clipPosition = projectionMatrix * viewPosition;
    vec2 ndc = clipPosition.xy / max(clipPosition.w, 0.0001);
    float lensDistance = length(ndc - uLensPointer);
    vLens = (1.0 - smoothstep(0.0, uLensRadius, lensDistance)) * uLensActive;
    viewPosition.z += vLens * uLensDepth;
    clipPosition = projectionMatrix * viewPosition;
    clipPosition.xy = uLensPointer * clipPosition.w
      + (clipPosition.xy - uLensPointer * clipPosition.w)
      * (1.0 + vLens * uLensMagnification);
    vBrightness *= 1.0 + vLens * uLensIllumination;
    gl_PointSize *= 1.0 + vLens * uLensMagnification * 0.7;
    vOpacity *= min(1.0, gl_PointSize / max(uMinPointSize, 0.001));
    gl_PointSize = max(gl_PointSize, uMinPointSize);
    clipPosition.xy += clipPosition.w * hoverOffset;
    gl_Position = clipPosition;
  }
`;function em(e,t=null,a=0,r=.18,o=0,i=.5,n){return new S.Zg({blending:S.tq,depthTest:!1,depthWrite:!1,fragmentShader:V,toneMapped:!1,transparent:!0,uniforms:{uCrossFlares:{value:1},uInitialCount:{value:1e9},uFollowupReveal:{value:1},uFadeProgress:{value:1},uEndFade:{value:1},uOrbitAge:{value:1},uGuide:{value:new S.$i},uTrailDispersion:{value:0},uEndWidth:{value:1},uMinPointSize:{value:0},uAccretionRatio:{value:U.accretionRatio},uAmbientPulse:{value:1},uCoreIntensity:{value:U.coreIntensity},uDensityFalloff:{value:S.rB.clamp(e.densityFalloff,0,.98)},uFlowSpeed:{value:S.rB.clamp(e.flowSpeed,0,3)},uExhaleStrength:{value:U.exhaleStrength},uFormationEnabled:{value:0},uFormationProgress:{value:1},uGrowthEnabled:{value:0},uGrowthDirection:{value:1},uGrowthProgress:{value:1},uGrowthRadius:{value:8.2},uGrowthSoftness:{value:$.softness},uInwardStrength:{value:U.inwardStrength},uIntensity:{value:S.rB.clamp(e.intensity,.1,3)},uPathMotion:{value:+!!t},uPathOffset:{value:0},uFreeFlow:{value:0},uPathSampleCount:{value:512},uPathSpeed:{value:a},uPathTexture:{value:t},uPathShapeCenter:{value:new S.wq},uPathShapeBrightRetention:{value:S.rB.clamp(i,0,1)},uPathShapeDepth:{value:S.rB.clamp(r,-1.8,1.8)},uPathShapeDepthPhase:{value:o},uPathShapeMotion:{value:0},uPathShapeProgress:{value:0},uPathShapeRotation:{value:new S.wq},uPathShapeScatter:{value:1},uPathShapeSampleCount:{value:1024},uPathShapeSize:{value:new S.wq},uPathShapeTrackedScatter:{value:new S.wq(n?.acrossScatter??0,n?.depthScatter??0)},uPathShapeTrackedSeed:{value:n?.seed??0},uPathShapeTrackingEnabled:{value:+!!n},uPathShapeTexture:{value:null},uLensActive:{value:0},uLensDepth:{value:K.depthDisplacement},uLensIllumination:{value:K.illumination},uLensMagnification:{value:K.magnification},uLensPointer:{value:new S.wq},uLensRadius:{value:.2},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uSizeFalloff:{value:S.rB.clamp(e.sizeFalloff,0,1)},uSmallStarSize:{value:S.rB.clamp(e.smallSize??1,.25,3)},uLargeStarSize:{value:S.rB.clamp(e.largeSize??1,.25,3)},uPropagationSoftness:{value:U.propagationSoftness},uZoomRevealExpansion:{value:0},uZoomReveal:{value:0},uScatterSize:{value:new S.wq(12,12)},uScrollDrift:{value:0},uScrollScatter:{value:0},uRotationScatter:{value:0},uMaxExpansion:{value:1.25},uScrollSizeScale:{value:1},uTextClearance:{value:3},uSettleRatio:{value:.15},uTime:{value:0},uLoopDuration:{value:0},uLoopCoreSpeed:{value:0},uTwinkleSpeed:{value:S.rB.clamp(e.twinkleSpeed,0,2)}},vertexShader:ed})}function eg(e,t,a){let r=Math.max(Math.floor(e.length/4),1),o=S.rB.clamp(t,0,1)*(r-1),i=Math.floor(o),n=Math.min(i+1,r-1),s=o-i,l=4*i,u=4*n;return a.set(S.rB.lerp(e[l]??0,e[u]??0,s),S.rB.lerp(e[l+1]??0,e[u+1]??0,s),S.rB.lerp(e[l+2]??0,e[u+2]??0,s))}function ev(e,t,a){let r=e.geometry,o=r.getAttribute("position"),i=r.getAttribute("orbitProgress"),n=r.getAttribute(a?"starScale":"particleScale"),s=r.getAttribute("starDepthOffset"),l=r.getAttribute("starHero"),u=r.getAttribute("starAcrossOffset"),c=r.getAttribute("trailOffset"),h=a?.image.data,p=new S.f5(new Float32Array(2*o.count),2);p.setUsage(S.DT),r.setAttribute("hoverOffset",p);let f=Array.from({length:o.count},()=>({x:0,y:0,vx:0,vy:0})),d=new S.cE,m={x:0,y:0,scale:1},g=!1;return(a,r,v,y,w,P,b,M,A,B)=>{let R=M&&(M.dx||M.dy)?M:null;if(R||B||g){for(let[M,C]of(g=!1,f.entries())){if(R||B){let p=i.getX(M);if(d.fromBufferAttribute(o,M),h){let e=S.rB.clamp(.34*n.getX(M)+.8*s.getX(M),0,1),a=A&&!l.getX(M)?.42+1.65*e:1,r=(p=ew(i.getX(M)+y*a,t))*(h.length/4-1),o=4*Math.min(Math.floor(r),h.length/4-2),c=r-o/4,f=h[o]??0,m=h[o+1]??0,g=(h[o+4]??f)-f,v=(h[o+5]??m)-m,x=u.getX(M)*el(p,w,P)/(Math.hypot(g,v)||1);d.x=f+g*c-v*x,d.y=m+v*c+g*x}else if(c){let e=el(i.getX(M),w,P)-1;d.x+=c.getX(M)*e,d.y+=c.getY(M)*e}if(A){let e=p**3,t=3*p**2*(1-p);d.x+=A.tip.x*e+A.bend.x*t,d.y+=A.tip.y*e+A.bend.y*t}d.applyMatrix4(e.matrixWorld).project(a),m.x=(d.x+1)*r/2,m.y=(1-d.y)*v/2,m.scale=A?.38/Math.sqrt(Math.max(.3,n.getX(M))):.05*S.rB.clamp(n.getX(M),.5,2)}if((0,x.f)(C,2*n.getX(M),b,m,R),B){let e=Math.hypot(B.dx,B.dy),t=m.x+C.x-B.x,a=m.y+C.y-B.y,o=S.rB.clamp(-(t*B.dx+a*B.dy)/Math.max(e*e,.001),0,1),i=t+o*B.dx,n=a+o*B.dy,s=Math.hypot(i,n),l=.23*Math.min(r,v),u=13*Math.min(e,.5*l)*m.scale*Math.max(0,1-s/l)**2;C.vx+=u*(i/Math.max(s,1)+.6*B.dx/Math.max(e,1)),C.vy+=u*(n/Math.max(s,1)+.6*B.dy/Math.max(e,1))}Math.abs(C.x)+Math.abs(C.y)+Math.abs(C.vx)+Math.abs(C.vy)<.015?C.x=C.y=C.vx=C.vy=0:g=!0,p.setXY(M,2*C.x/r,-2*C.y/v)}p.needsUpdate=!0}}}function eS(e,t=!0){let a=Math.sin(S.rB.clamp(e,0,1)*Math.PI);return t?a:S.rB.lerp(a,1,S.rB.smoothstep(e,.5,1))}function ex(e,t=!0){return S.rB.smoothstep(e,0,.055)*(t?1-S.rB.smoothstep(e,.945,1):1)}function ey(e,t,a=!0){return S.rB.lerp(1,.14+.86*Math.pow(eS(e,a),.68),S.rB.clamp(t,0,1))}function ew(e,t){let a=(e%1+1)%1;return a+S.rB.clamp(t,0,.98)*Math.sin(a*Math.PI*2)/(2*Math.PI)}function eP(e,t,a){let r=e.getPointAt(0).lengthSq(),o=e.getPointAt(1).lengthSq()<r;return Math.abs(t)*((a?o:!o)?1:-1)}function eb(e){if(e<=.85)return e**3;let t=(e-.85)/(1-.85),a=t**2,r=t**3;return(2*r-3*a+1)*.6141249999999999+2.1674999999999995*(1-.85)*(r-2*a+t)+(-2*r+3*a)}function eM(e,t,a=0){return[10.9/764*(e-679),10.9/764*(382-t),a]}let eA="#FFC77D",eB="#94CCF4",eR=[[-110,420],[80,191],[303,78],[523,98]],eC=[[1468,350],[1273,557],[1050,690],[830,666]];function eD(e){let[t,...a]=e;return`M ${t.join(" ")} C ${a.map(e=>e.join(" ")).join(" ")}`}function eF(){return{held:!1,target:new S.wq,tip:new S.wq,previousTip:new S.wq,tipVelocity:new S.wq,bend:new S.wq,bendVelocity:new S.wq}}function ez(e,t,a=!e.held){if(e.previousTip.copy(e.tip),e.tip.distanceToSquared(e.target)+e.bend.distanceToSquared(e.target)+e.tipVelocity.lengthSq()+e.bendVelocity.lengthSq()<1e-7){let t=!e.tip.equals(e.target)||!e.bend.equals(e.target);return e.tip.copy(e.target),e.bend.copy(e.target),e.tipVelocity.set(0,0),e.bendVelocity.set(0,0),t}let r=Math.min(t,.05),o=Math.max(1,Math.ceil(120*r)),i=r/o*(a?.18:1),n=a?225:420;for(let t=0;t<o;t++)for(let t of["x","y"])e.tipVelocity[t]+=((e.target[t]-e.tip[t])*n-30*e.tipVelocity[t])*i,e.tip[t]+=e.tipVelocity[t]*i,e.bendVelocity[t]+=((e.tip[t]-e.bend[t])*80-10*e.bendVelocity[t])*i,e.bend[t]+=e.bendVelocity[t]*i;return!0}let eE=eM(859,251),eT=eM(472,530),eL=`
  varying vec3 vNormal;
  varying vec3 vLocalNormal;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vLocalNormal = normal;
    gl_Position = projectionMatrix * viewPosition;
  }
`,eO=`
  vec3 sunRim(vec3 color, float radius, float bloomScale) {
    float edge = radius - 1.0;
    float rim = exp(-pow(edge / 0.045, 2.0))
      + exp(-pow(edge / 0.11, 2.0)) * 0.22;
    vec3 warmGold = vec3(color.r, max(color.g, color.r * 0.7), color.b);
    return mix(warmGold, vec3(1.0), 0.12) * rim * 1.25 * bloomScale;
  }
`,eI=`
  uniform float uRevealBrightness;
  uniform float uWhiteHeat;
  varying vec3 vNormal;
  varying vec3 vLocalNormal;
  uniform vec3 uColor;
  uniform float uBloomScale;
  uniform vec3 uSurfaceDrift;
  ${eO}

  float solarHash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float solarNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(solarHash(cell), solarHash(cell + vec3(1, 0, 0)), f.x),
          mix(solarHash(cell + vec3(0, 1, 0)), solarHash(cell + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(solarHash(cell + vec3(0, 0, 1)), solarHash(cell + vec3(1, 0, 1)), f.x),
          mix(solarHash(cell + vec3(0, 1, 1)), solarHash(cell + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    float facing = max(normal.z, 0.0);
    vec3 surface = normalize(vLocalNormal);
    // Visible convection at hero scale, with continuous rather than random motion.
    vec3 drift = uSurfaceDrift;
    float broad = solarNoise(surface * 5.0 + vec3(7.1, 2.8, 4.3) + drift);
    vec3 warped = surface * 15.0 + broad * 2.2 + drift.yzx * 2.0;
    float cells = solarNoise(warped);
    // Fade the finest detail when it becomes smaller than a screen pixel.
    float detailVisibility = 1.0 - smoothstep(0.5, 1.5, length(fwidth(surface * 42.0)));
    float grain = mix(0.5, solarNoise(surface * 42.0 + drift.zxy * 4.0), detailVisibility);
    float heat = smoothstep(0.15, 0.85, broad * 0.45 + cells * 0.4 + grain * 0.15);
    // At full-disk scale, granulation contributes only subtle contrast.
    heat = mix(0.5, heat, 0.18);
    float colorEnergy = 1.0 - min(uColor.r, min(uColor.g, uColor.b));
    // Map temperature to orange, gold, then yellow, without adding white.
    // Keep the blue channel low so HDR bloom cannot bleach the hot patches.
    vec3 deepOrange = uColor * vec3(1.0, mix(1.0, 0.62, colorEnergy), 1.0);
    vec3 gold = vec3(uColor.r, max(uColor.g, uColor.r * 0.48), uColor.b);
    vec3 hotYellow = vec3(uColor.r, max(uColor.g, uColor.r * 0.92), uColor.b);
    vec3 surfaceColor = mix(deepOrange, gold, smoothstep(0.12, 0.58, heat));
    surfaceColor = mix(surfaceColor, hotYellow, smoothstep(0.5, 0.88, heat));
    float roundness = mix(0.5, 1.0, sqrt(facing))
      * (0.9 + 0.1 * dot(normal, normalize(vec3(-0.4, 0.5, 1.0))));
    vec3 emission = surfaceColor
      * mix(1.1, 2.2, heat) * roundness * (1.0 + colorEnergy * 0.15);
    // Feather the outer ~8% into the optical halo's color at the limb.
    // Keep the sphere opaque so it still occludes stars and masks bloom.
    vec3 limbGlow = uColor * (0.28 + 0.055) * 4.0 * uBloomScale;
    emission = mix(limbGlow, emission, smoothstep(0.0, 0.4, facing));
    emission += sunRim(uColor, sqrt(max(1.0 - facing * facing, 0.0)), uBloomScale);
    // Fade a white-hot surface into the live texture without a second mesh or
    // changing opacity/depth, so the sun continues to hide the moon and stars.
    vec3 whiteHot = vec3(2.2) * mix(0.65, 1.0, sqrt(facing))
      + sunRim(vec3(1.0), sqrt(max(1.0 - facing * facing, 0.0)), uBloomScale);
    emission = mix(emission, whiteHot, uWhiteHeat);
    emission *= mix(0.78, 1.0, smoothstep(0.0, 0.75, facing));
    // Brighten the textured surface itself; keep depth and opacity stable.
    gl_FragColor = vec4(emission * uRevealBrightness, 1.0);
  }
`,ek=`
  varying vec2 vPoint;
  void main() {
    vPoint = (uv - 0.5) * 14.0;
    vec4 viewCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec2 scale = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    viewCenter.xy += position.xy * scale;
    gl_Position = projectionMatrix * viewCenter;
  }
`,eH=`
  uniform float uRevealBrightness;
  uniform float uWhiteHeat;
  varying vec2 vPoint;
  uniform vec3 uColor;
  uniform float uFlareIntensity;
  uniform float uBloomScale;
  ${eO}
  void main() {
    float radius = length(vPoint);
    float outside = max(radius - 1.0, 0.0);
    // A tight rim plus a much fainter, long tail; no visible halo boundary.
    float halo = exp(-outside * 4.8) * 0.28
      + exp(-outside * 1.15) * 0.055;
    halo *= 1.0 - smoothstep(4.5, 7.0, radius);
    vec2 p = abs(vPoint);
    // Shorter rays retain their narrow cores, with soft light around each axis.
    float horizontal = exp(-p.y * 95.0) * exp(-p.x * 0.85)
      + exp(-p.y * 12.0) * exp(-p.x * 1.0) * 0.24
      + exp(-p.y * 4.0) * exp(-p.x * 1.2) * 0.045;
    float vertical = exp(-p.x * 95.0) * exp(-p.y * 0.85)
      + exp(-p.x * 12.0) * exp(-p.y * 1.0) * 0.24
      + exp(-p.x * 4.0) * exp(-p.y * 1.2) * 0.045;
    float fade = 1.0 - smoothstep(2.8, 4.2, max(p.x, p.y));
    float rays = (horizontal + vertical) * fade * uFlareIntensity;
    // The halo cools from white to the normal palette along with the surface.
    vec3 glowColor = mix(uColor, vec3(1.0), uWhiteHeat);
    vec3 light = glowColor * halo * 4.0 * uBloomScale
      + sunRim(glowColor, radius, uBloomScale)
      + mix(glowColor, vec3(1.0), 0.2) * rays * 2.6;
    gl_FragColor = vec4(light * uRevealBrightness, 1.0);
  }
`;function eV({radius:e=1,color:r="#F87915",playing:o=!0,reducedMotion:i=!1,bloomIntensity:n=.35,surfaceSpeed:l=4,flareIntensity:u=0,surfaceRef:c,revealRef:h,loop:p}){let f=(0,a.useRef)(0),d=(0,a.useRef)(null),m=(0,a.useRef)(null),g=(0,a.useMemo)(()=>({uRevealBrightness:{value:1},uWhiteHeat:{value:0},uColor:{value:new S.Es(r)},uSurfaceDrift:{value:new S.cE},uBloomScale:{value:n/.7},uFlareIntensity:{value:u}}),[r,n,u]);return(0,s.f)((e,t)=>{for(let e of(p||!o||i||(f.current+=Math.min(t,.05)*S.rB.clamp(l,0,4)),[d.current,m.current])){if(!e)continue;e.uniforms.uWhiteHeat.value=h?.current.sunWhiteHeat??0,e.uniforms.uRevealBrightness.value=e===m.current?h?.current.halo??1:h?.current.surface??1;let t=e.uniforms.uSurfaceDrift.value;p?t.set(...function(e,t,a){let r=Number.isFinite(t)?Math.max(2,Math.min(120,t)):8,o=(e%r+r)%r/r*Math.PI*2,i=r*Math.max(0,Math.min(4,a))/(2*Math.PI),n=Math.sin(o)*i,s=(1-Math.cos(o))*i;return[.12*n+.082319*s,.072*n-.137199*s,-.096*n]}(p.time.current,p.duration,l)):t.set(.12,.072,-.096).multiplyScalar(i?0:f.current)}}),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("mesh",{name:"sun-surface",ref:c,children:[(0,t.jsx)("sphereGeometry",{args:[e,64,48]}),(0,t.jsx)("shaderMaterial",{ref:d,vertexShader:eL,fragmentShader:eI,uniforms:g,toneMapped:!1})]}),(0,t.jsxs)("mesh",{name:"sun-corona-and-flare",renderOrder:110,frustumCulled:!1,children:[(0,t.jsx)("planeGeometry",{args:[14*e,14*e]}),(0,t.jsx)("shaderMaterial",{ref:m,vertexShader:ek,fragmentShader:eH,uniforms:g,blending:S.UM,blendSrc:S.tx,blendDst:S.Vt,blendSrcAlpha:S.DB,blendDstAlpha:S.Vt,transparent:!0,depthWrite:!1,toneMapped:!1})]})]})}function eW(e){return e.map(([e,t])=>{let[a,r]=eM(e,t);return new S.wq(a,r)})}let eG=`
  ${X}
  uniform float uRestCount;
  uniform vec2 uGoldTail[4];
  uniform vec2 uBlueTail[4];

  vec2 tailPosition(float t, bool gold) {
    vec2 a = gold ? uGoldTail[0] : uBlueTail[0];
    vec2 b = gold ? uGoldTail[1] : uBlueTail[1];
    vec2 c = gold ? uGoldTail[2] : uBlueTail[2];
    vec2 d = gold ? uGoldTail[3] : uBlueTail[3];
    float k = 1.0 - t;
    return k*k*k*a + 3.0*k*t*(k*b + t*c) + t*t*t*d;
  }

  attribute float starSize;
  attribute float brightness;
  uniform float uGlint;
  uniform vec2 uBlueTip;
  uniform float uSpread;
  uniform vec3 uHover;
  uniform float uAspect;
  uniform float uScale;
  uniform float uMaxFlareSize;
  varying float vBrightness;
  varying vec3 vColor;
  varying float vLens;
  varying float vOpacity;
  varying float vRayStrength;
  void main() {
    vBrightness = brightness * mix(1.0, uGlint, step(20.0, starSize));
    vColor = color;
    vLens = 0.0;
    vOpacity = 0.8;
    vRayStrength = step(20.0, starSize);
    vec3 skyPosition = position;
    if (vRayStrength > 0.5) skyPosition.xy += uBlueTip;
    if (vRayStrength < 0.5) skyPosition.xy *= 1.0 + uSpread * (0.05 + brightness * 0.08);
    float glow = 0.0;
    if (vRayStrength < 0.5 && uOrbitAge < 1.0) {
      float seed = fract(brightness * 23.7);
      vec2 whirl = whirlPosition(skyPosition.xy, seed, 1.0 - brightness);
      // Keep the ambient sky steady while the stream particles circle the title.
      skyPosition.xy = mix(skyPosition.xy, whirl, float(gl_VertexID) < uRestCount ? 0.10 : 1.0);
      if (float(gl_VertexID) >= uRestCount) {
        float delay = 0.23 * fract(position.z * 37.2);
        float age = max(0.0, uOrbitAge - delay);
        // Stagger the return, leaving time to coast along the tail before fading.
        float returnDelay = fract(position.z * 13.7);
        float settle = smoothstep(0.49 + 0.13 * returnDelay, 0.90 + 0.10 * returnDelay, uOrbitAge);
        float travel = smoothstep(0.0, 0.27, age) * (1.0 - settle);
        float inWhirl = smoothstep(0.08, 0.35, age) * (1.0 - smoothstep(0.0, 0.86, settle));
        float tailT = 0.14 + seed * 0.20 + travel * 0.52;
        bool gold = color.r > color.b;
        vec2 tail = tailPosition(tailT, gold);
        vec2 tangent = normalize(tailPosition(tailT + 0.01, gold) - tail);
        tail += vec2(-tangent.y, tangent.x) * (returnDelay - 0.5) * 0.9 * settle;
        skyPosition.xy = mix(tail, skyPosition.xy, inWhirl);
        vOpacity *= smoothstep(0.0, 0.045, age) * (1.0 - smoothstep(0.46, 1.0, settle));
      }
      glow = smoothstep(0.02, 0.27, uOrbitAge) * (1.0 - smoothstep(0.55, 0.98, uOrbitAge));
      vBrightness *= 1.0 + glow * 1.9;
    }
    if (float(gl_VertexID) >= uRestCount) {
      float radius = length(skyPosition.xy / vec2(1.0, 0.62));
      vOpacity *= smoothstep(0.02, 0.27, uOrbitAge) * (1.0 - smoothstep(7.0, 17.0, radius));
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(skyPosition, 1.0);
    if (vRayStrength < 0.5) {
      vec2 aspect = vec2(uAspect, 1.0);
      vec2 away = (gl_Position.xy / gl_Position.w - uHover.xy) * aspect;
      float distanceToPointer = length(away);
      float influence = 1.0 - smoothstep(0.0, 0.30, distanceToPointer);
      gl_Position.xy += gl_Position.w * away / max(distanceToPointer, 0.045)
        / aspect * influence * uHover.z * 0.045;
    }
    gl_PointSize = max(1.0, starSize * uScale * (1.0 + 0.55 * glow));
    if (vRayStrength > 0.5) gl_PointSize = min(gl_PointSize, uMaxFlareSize);
  }
`;function ej({hover:e,x:r,y:o,radius:i,color:n,intro:l,start:u,star:c=!1}){let h=(0,a.useRef)(null),p=(0,a.useRef)(null),f=(0,a.useRef)(new S.cE),d=(0,a.useMemo)(()=>({uBodyHover:{value:new S.cE},uTint:{value:new S.Es(n)}}),[n]);return(0,s.f)(({camera:t,size:a},r)=>{if(!h.current||!p.current)return;let o=h.current.uniforms.uBodyHover.value,{elapsed:n}=l.current,s=S.rB.smootherstep(n,u,u+1.05),c=1-Math.exp(-14*r),d=0;if(e.current.active){let r=p.current.getWorldPosition(f.current).project(t),n=2*i*t.zoom,s=(e.current.x-r.x)*a.width/n,l=(e.current.y-r.y)*a.height/n;(d=1-S.rB.smoothstep(Math.hypot(s,l),.35,1))>0&&(o.x=S.rB.lerp(o.x,s,c),o.y=S.rB.lerp(o.y,l,c))}o.z=S.rB.lerp(o.z,d*s,c)}),(0,t.jsxs)("mesh",{ref:p,position:eM(r,o,1.1),renderOrder:111,children:[(0,t.jsx)("planeGeometry",{args:[2*i,2*i]}),(0,t.jsx)("shaderMaterial",{ref:h,uniforms:d,transparent:!0,depthWrite:!1,depthTest:!1,blending:S.tq,vertexShader:`
        varying vec2 vPoint;
        void main() {
          vPoint = uv * 2.0 - 1.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        varying vec2 vPoint;
        uniform vec3 uBodyHover;
        uniform vec3 uTint;
        void main() {
          ${c?`
            vec2 p = abs(vPoint);
            float along = max(p.x, p.y);
            float across = min(p.x, p.y);
            float taper = 1.0 - smoothstep(0.0, 0.94, along);
            float width = max(0.012 + 0.05 * taper, fwidth(across) * 0.65);
            float ray = exp(-across / width) * taper;
            vec2 direction = vPoint / max(length(vPoint), 0.001);
            float facing = clamp(dot(direction, uBodyHover.xy) * 1.6, -1.0, 1.0);
            float light = ray * (0.40 + 0.23 * facing);
          `:`
            vec2 offset = vPoint - uBodyHover.xy * 0.55;
            float light = 0.28 * exp(-7.0 * dot(offset, offset)) * (1.0 - smoothstep(0.7, 1.0, length(vPoint)));
          `}
          gl_FragColor = vec4(uTint, light * uBodyHover.z);
        }
      `})]})}function eY({guides:e,orbitAge:r,handles:o,hover:i,intro:n,onReady:l,onStarsRevealed:c,warmColor:h,coolColor:p,sunSurfaceRef:f}){let d=(0,a.useRef)(null),m=(0,a.useRef)(null),g=(0,a.useRef)({age:1,meeting:new S.wq}),v=(0,a.useRef)(null),x=(0,a.useRef)(0),y=(0,a.useRef)(!1),w=(0,u.f)(e=>Math.min(e.size.width,1358*e.size.height/764)),P=(0,u.f)(e=>e.size.width/Math.max(1,e.size.height)),b=(0,u.f)(e=>e.viewport.dpr),M=(0,a.useRef)(null),A=(0,a.useRef)({sunWhiteHeat:.12,halo:1,surface:1}),B=(0,a.useMemo)(()=>{let e=6281,t=()=>(e=Math.imul(e,1664525)+0x3c6ef35f>>>0)/0x100000000,a=[],r=[],o=[],i=[],n=new S.Es(p),s=Math.max(1358,764*P),l=Math.max(764,1358/P),u=Math.min(1200,Math.ceil(180*s*l/1037512));for(let e=0;e<u;e++){let e=679+(t()-.5)*s,u=382+(t()-.5)*l;a.push(...eM(e,u,-2)),r.push(n.r,n.g,n.b),o.push(1.6+3.4*t()),i.push(.35+.65*t())}a.push(...eM(472,530,.5)),r.push(n.r,n.g,n.b),o.push(28),i.push(3.8);let c=o.length,f=new S.Es(h);for(let e=0;e<1920;e++){let e=2*t()*Math.PI,s=1.6+4.8*Math.sqrt(-2*Math.log(1-t()));a.push(s*Math.cos(e),.62*s*Math.sin(e),-2+t());let l=.5>t()?n:f;r.push(l.r,l.g,l.b),o.push(2+3*t()),i.push(.4+.6*t())}return{restCount:c,positions:new Float32Array(a),colors:new Float32Array(r),sizes:new Float32Array(o),brightness:new Float32Array(i)}},[P,p,h]),R=(0,a.useMemo)(()=>({uGlint:{value:1},uSpread:{value:0},uOrbitAge:{value:1},uRestCount:{value:B.restCount},uGoldTail:{value:eW(eR)},uBlueTail:{value:eW(eC)},uBlueTip:{value:e.blue.tip},uHover:{value:new S.cE},uAspect:{value:P},uScale:{value:w/1358*b},uMaxFlareSize:{value:28*b}}),[w,b,P,e,B]);return(0,s.f)((t,a)=>{let s=764*w/14802.2;for(let t of(r.current=function(e,t,a){let{gold:r,blue:o}=t;if(e.age>=1){ez(r,a),ez(o,a);let t=eE[0]+r.tip.x,i=eE[1]+r.tip.y,n=eT[0]+o.tip.x,s=eT[1]+o.tip.y,l=t-n,u=i-s,c=r.tip.x-r.previousTip.x,h=r.tip.y-r.previousTip.y,p=o.tip.x-o.previousTip.x,f=o.tip.y-o.previousTip.y,d=c-p,m=h-f,g=S.rB.clamp((l*d+u*m)/Math.max(d*d+m*m,1e-9),0,1);if(Math.hypot(l-g*d,u-g*m)>=.52)return 1;for(let a of(e.meeting.set((t+n-g*(c+p))/2,(i+s-g*(h+f))/2),e.age=0,[r,o]))a.held||(a.tipVelocity.multiplyScalar(.18),a.bendVelocity.multiplyScalar(.18)),a.held=!1;return e.age}let i=S.rB.lerp(8.4,15,S.rB.smootherstep(e.age,.45,.72));e.age=Math.min(1,e.age+a/i);let n=1-S.rB.smootherstep(e.age,.55,1);for(let r of["gold","blue"]){let o=t[r],i="gold"===r?eE:eT;o.target.set((e.meeting.x-i[0])*n,(e.meeting.y-i[1])*n),ez(o,a,!1)}return e.age}(g.current,e,Math.min(a,.05)),["gold","blue"])){let a=e[t];if(a.tip.equals(a.previousTip))continue;let r="gold"===t?d.current:m.current;r?.position.set(a.tip.x,a.tip.y,0),o.current?.style.setProperty(`--${t}-x`,`${a.tip.x*s}px`),o.current?.style.setProperty(`--${t}-y`,`${-a.tip.y*s}px`)}v.current?.setDrawRange(0,r.current<1?B.sizes.length:B.restCount),x.current<2&&2==++x.current&&l();let u=n.current;u.elapsed+=25/12*Math.min(a,.1);let h=u.elapsed,p=S.rB.smootherstep(h,.6,1.65);if(A.current.surface=p,A.current.halo=p,u.blueStarReveal=S.rB.smootherstep(h-1.77,0,1.05),M.current){let e=M.current.uniforms;e.uOrbitAge.value=r.current,e.uGlint.value=u.blueStarReveal;let t=S.rB.clamp(window.scrollY/Math.max(window.innerHeight,1),0,1);e.uSpread.value=t*(2-t);let o=i.current,n=e.uHover.value;n.set(o.x,o.y,S.rB.damp(n.z,+!!o.active,14,a))}!y.current&&h>=4.37&&(y.current=!0,c())},-1),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("points",{frustumCulled:!1,children:[(0,t.jsxs)("bufferGeometry",{ref:v,children:[(0,t.jsx)("bufferAttribute",{attach:"attributes-position",args:[B.positions,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-color",args:[B.colors,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-starSize",args:[B.sizes,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-brightness",args:[B.brightness,1]})]}),(0,t.jsx)("shaderMaterial",{ref:M,vertexShader:eG,fragmentShader:V,uniforms:R,vertexColors:!0,transparent:!0,depthWrite:!1,blending:S.tq,toneMapped:!1})]}),(0,t.jsxs)("group",{ref:d,children:[(0,t.jsx)(ej,{hover:i,x:859,y:251,radius:.86,color:h,intro:n,start:.6}),(0,t.jsx)("group",{position:eM(859,251,.6),children:(0,t.jsx)(eV,{radius:26*10.9/764,color:h,playing:!1,bloomIntensity:.5,revealRef:A,surfaceRef:f})})]}),(0,t.jsx)("group",{ref:m,children:(0,t.jsx)(ej,{hover:i,star:!0,x:472,y:530,radius:.56,color:p,intro:n,start:1.77})})]})}var eq=e.i(40414);let e_={...Q,density:1.2,spread:.3,intensity:1.4},eX={...I,enabled:!1},eZ={...H,profile:"starburst",secondaryScale:.55,maxStarburstRadius:28,intensity:.4,secondary:.7,streakLength:.095},eN={...k,density:3.4,size:1.65,flowSpeed:.55,flowInward:!1,scatter:.36,densityFalloff:.08,sizeFalloff:.12,twinkleSpeed:.45};e.s(["AstraSolHero",0,function({intro:e}){let[r,o]=(0,a.useState)(!1),[i,n]=(0,a.useState)(!1),s=(0,a.useCallback)(()=>o(!0),[]),l=(0,a.useRef)(null),u=(0,a.useMemo)(()=>[l],[]),c=(0,a.useMemo)(()=>({gold:eF(),blue:eF()}),[]),h=(0,a.useRef)(1),p=(0,a.useRef)(null),f=(0,a.useRef)(null),d=(0,a.useRef)({x:0,y:0,active:!1}),m=(0,a.useMemo)(()=>{let t,a;return{...(t=[eA,"#FFE5BD","#E8AC62","#FFF2D9","#FFFAF0"],a=[eB,"#D7EDFF","#639EC4","#B8E0FA","#F2FAFF"],{width:1358,height:764,worldHeight:10.9,centerX:679,centerY:382,cameraCenterY:0,scrollTravelSeconds:12,flareAnchors:[{x:472,y:530,color:eB,scale:2.5}],paths:[{d:`${eD(eR)} C 682 103 800 166 859 251`,depth:.22,phase:.16,speed:.025,strong:!0,colors:t,fadeEnd:!1},{d:"M -96 430 C 91 202 311 90 530 110 C 688 115 806 178 859 251",depth:-.16,phase:.72,speed:-.018,strong:!1,colors:t,fadeEnd:!1},{d:`${eD(eC)} C 670 662 544 619 472 530`,depth:.24,phase:.38,speed:.021,strong:!0,colors:a,fadeEnd:!1,endWidth:.22,followupDensity:.6},{d:"M 1454 340 C 1262 546 1042 678 823 654 C 664 650 538 607 472 530",depth:-.18,phase:.58,speed:-.016,strong:!1,colors:a,fadeEnd:!1,endWidth:.22,followupDensity:.6}]}),intro:e,guides:c,orbitAge:h}},[e,c]);function g(e,t){if(!e.isPrimary||0!==e.button||h.current<1||p.current)return;let a=c[t],r=f.current?.getBoundingClientRect();if(!r?.height)return;let o=10.9/r.height;p.current={id:e.pointerId,color:t,x:e.clientX-a.tip.x/o,y:e.clientY+a.tip.y/o},a.tipVelocity.multiplyScalar(.18),a.bendVelocity.multiplyScalar(.18),a.held=!0,a.target.copy(a.tip),e.currentTarget.setPointerCapture(e.pointerId),d.current.active=!1}function v(e){if(e.pointerId!==p.current?.id)return;let t=c[p.current.color];t.held&&(t.held=!1,t.target.set(0,0)),p.current=null}return(0,t.jsxs)("div",{className:eq.default.hero,"data-ready":r,"data-stars-revealed":i,onPointerMove:function(e){let t=e.currentTarget.getBoundingClientRect(),a=p.current;if(!a){d.current={x:(e.clientX-t.left)/t.width*2-1,y:1-(e.clientY-t.top)/t.height*2,active:"mouse"===e.pointerType&&!e.buttons};return}if(e.pointerId!==a.id||!c[a.color].held)return;let r=f.current?.getBoundingClientRect();if(!r?.height)return;let o=10.9/r.height,i=Math.min(t.right,Math.max(t.left,e.clientX)),n=Math.min(t.bottom,Math.max(t.top,e.clientY));c[a.color].target.set((i-a.x)*o,(a.y-n)*o)},onPointerUp:v,onPointerCancel:v,onLostPointerCapture:v,onPointerLeave:()=>{d.current.active=!1},children:[(0,t.jsx)(ea,{className:eq.default.field,ariaLabel:"Astra Sol: a golden star stream ending in a sun, opposite an icy blue star stream.",pathLayout:m,backgroundColor:"#03101A",animationPreset:"none",trailDispersion:.56,minimumParticleSize:2,interactionMode:"hover-drift",showLabels:!1,showCenterCluster:!1,stars:eN,orbitalDust:e_,dirtyGlass:eX,lensFlare:eZ,bloomIntensity:.4,sceneContent:(0,t.jsx)(eY,{intro:e,hover:d,guides:c,orbitAge:h,handles:f,onReady:s,onStarsRevealed:()=>n(!0),warmColor:eA,coolColor:eB,sunSurfaceRef:l}),sceneOccluders:u}),(0,t.jsxs)("div",{className:eq.default.handles,ref:f,"data-ready":i,children:[(0,t.jsx)("span",{className:eq.default.sunHandle,onPointerDown:e=>g(e,"gold")}),(0,t.jsx)("span",{className:eq.default.starHandle,onPointerDown:e=>g(e,"blue")})]})]})}],498764)},254900,function(e){e.n(e.i(498764))},40414,e=>{e.v({field:"ATS_Ya_field",handles:"ATS_Ya_handles",hero:"ATS_Ya_hero",starHandle:"ATS_Ya_starHandle",sunHandle:"ATS_Ya_sunHandle"})},369085,e=>{e.v({canvas:"_1ZO7QW_canvas",fallback:"_1ZO7QW_fallback",label:"_1ZO7QW_label",labelLeft:"_1ZO7QW_labelLeft",labelLetter:"_1ZO7QW_labelLetter",labelRight:"_1ZO7QW_labelRight",root:"_1ZO7QW_root"})},101098,e=>{e.q("/_next/static/immutable/media/lens-dirt.404zfi-ylzle-.webp")}]);