import { coordinate, LIMITS, fault } from './contracts.js';
const EARTH_RADIUS_M = 6371008.8;
export function haversineMeters(a, b) {
  coordinate.parse(a);coordinate.parse(b);
  const radians = n => n * Math.PI / 180;
  const dLat = radians(b[1]-a[1]), dLon = radians(b[0]-a[0]);
  const h = Math.sin(dLat/2)**2 + Math.cos(radians(a[1]))*Math.cos(radians(b[1]))*Math.sin(dLon/2)**2;
  return 2*EARTH_RADIUS_M*Math.atan2(Math.sqrt(Math.min(1,Math.max(0,h))),Math.sqrt(Math.max(0,1-h)));
}
export function durationSeconds(start, end) {
  const a = new Date(start).getTime(), b = new Date(end).getTime();
  if (!Number.isFinite(a)||!Number.isFinite(b)||b<a) throw fault(400,'INVALID_TIME','Invalid time interval');
  return (b-a)/1000;
}
export function segment(previous, next) {
  if (!previous) return { distanceMeters:0, observedSeconds:0, gapSeconds:0, speedKmh:null, gapBefore:false };
  const seconds = durationSeconds(previous.capturedAt,next.capturedAt);
  if (seconds*1000<LIMITS.minIntervalMs) throw fault(422,'TIME_ORDER','Pings must have increasing timestamps at least 250 ms apart');
  const distanceMeters = haversineMeters(previous.coordinates,next.coordinates);
  if (distanceMeters/seconds>LIMITS.maxSpeedMps) throw fault(422,'IMPLAUSIBLE_SPEED','Location jump exceeds the supported cycling speed');
  if (seconds*1000>LIMITS.maxGapMs) return { distanceMeters:0,observedSeconds:0,gapSeconds:seconds,speedKmh:null,gapBefore:true };
  return {distanceMeters,observedSeconds:seconds,gapSeconds:0,speedKmh:distanceMeters/seconds*3.6,gapBefore:false};
}
export function rideSummary(ride, now = new Date()) {
  const end = ride.endedAt ?? new Date(Math.min(now.getTime(),new Date(ride.expiresAt).getTime()));
  const seconds = durationSeconds(ride.startedAt,end);
  const overdue = ride.status==='active' && new Date(ride.expiresAt)<=now;
  const fresh = ride.status==='active' && new Date(ride.expiresAt)>now && ride.lastReceivedAt && now-new Date(ride.lastReceivedAt)<=LIMITS.liveWindowMs && now-new Date(ride.lastPoint.capturedAt)<=LIMITS.liveWindowMs;
  return {
    id:String(ride._id),riderRef:ride.riderRef,routeId:String(ride.routeId),routeName:ride.routeName,status:overdue?'expired':ride.status,
    startedAt:ride.startedAt,endedAt:ride.endedAt??(overdue?ride.expiresAt:null),expiresAt:ride.expiresAt,serverTime:now.toISOString(),
    durationSeconds:seconds,sampleCount:ride.sampleCount,lastSequence:ride.lastSequence,
    distanceMeters:ride.sampleCount?ride.distanceMeters:null,observedSeconds:ride.observedSeconds,gapSeconds:ride.gapSeconds,
    averageSpeedKmh:ride.observedSeconds>0?ride.distanceMeters/ride.observedSeconds*3.6:null,
    sessionAverageSpeedKmh:ride.observedSeconds>0&&seconds>0?ride.distanceMeters/seconds*3.6:null,
    currentSpeedKmh:fresh?ride.lastSpeedKmh:null,trackingFresh:Boolean(fresh),
    lastReceivedAt:ride.lastReceivedAt??null,lastPosition:ride.lastPoint?{type:'Point',coordinates:ride.lastPoint.coordinates}:null,
  };
}
