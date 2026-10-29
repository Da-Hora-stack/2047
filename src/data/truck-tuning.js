// Unidades SI: kg, m, s, N, Nm; rotação em RPM. Ajustes autorais, sem copiar um veículo comercial.
export const TRUCK_TUNING=Object.freeze({
 chassisMass:8800,seedMass:2200,wheelRadius:.61,wheelbase:4.675,track:2.4,
 engine:{idleRpm:650,redlineRpm:2400,launchRpm:1050,throttleSeconds:.13,rpmSeconds:.18,
  torqueCurve:[[0,0],[550,650],[650,950],[900,1380],[1100,1560],[1400,1600],[1700,1440],[2000,1150],[2250,800],[2400,0]],
  idleLitersPerSecond:.00065,kgPerKwh:.245,dieselKgPerLiter:.835},
 transmission:{ratios:[8.1,6.1,4.6,3.45,2.6,1.95,1.46,1.1],reverseRatio:8.4,finalDrive:4.1,efficiency:.88,
  shiftSeconds:.38,dwellSeconds:.85,reverseDelay:.65,safeDirectionSpeed:.25,upshiftRpm:2050,downshiftRpm:1000,maxAxleTorque:14000},
 dynamics:{maxSpeed:25,maxReverseSpeed:3,airDensity:1.225,dragArea:6.5,drivenWeight:.62,engineBrakeNm:240,
  serviceBrakeForce:52000,parkingBrakeForce:60000,parkingFrontAssist:30000,brakeSeconds:.13},
 steering:{maxAngle:.62,rate:1.65,returnRate:2.1,lateralAcceleration:2.5,steeringWheelRatio:18},
 suspension:{restLength:.52,travel:.32,stiffness:34,compression:4.8,relaxation:5.8,maxForce:55000},
 surfaces:{
  asfalto:{rolling:.012,grip:1},asfalto_danificado:{rolling:.022,grip:.91},cascalho:{rolling:.038,grip:.72},
  terra:{rolling:.032,grip:.8},areia:{rolling:.09,grip:.55},sal:{rolling:.026,grip:.7},lama:{rolling:.085,grip:.45},
  rocha:{rolling:.045,grip:.6},vidro:{rolling:.02,grip:.52},agua:{rolling:.12,grip:.38},
 },
});
export const DRIVING_COPY={rpm:'RPM',gear:'MARCHA',neutral:'N',reverse:'R',drive:'D',automatic:'AUTOMÁTICO',parking:'ESTACIONAMENTO',
 shift:'TROCANDO',mass:'MASSA TOTAL',torque:'TORQUE',engineBrake:'FREIO MOTOR',kilograms:'kg',newtonMeters:'Nm',
 distance:'Distância da câmera externa',steering:'Resposta da direção',cabMotion:'Movimento da cabine',driving:'Condução e câmera',
 title:'Reformulação · condução',phase:'REFORMULAÇÃO / FASE 01',
 help:'S freia; parado, mantenha S para engatar R. Em ré, W freia antes de voltar a D. Espaço mantém o Titã parado.',
 instrumentSpeed:'km/h',instrumentRpm:'RPM × 100',instrumentFuel:'DIESEL',instrumentTemp:'°C',
};
