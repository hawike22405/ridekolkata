// Dedicated admin tab. Requests use the existing page's in-memory admin token.
const telemetryPanel=document.getElementById('telemetryPanel');
function showRide(result){
  $('rideResult').textContent=JSON.stringify(result.ride??result,null,2);
  if(result.ride?.id)$('rideId').value=result.ride.id;
  if(result.accessToken){$('rideToken').value=result.accessToken;$('tokenExpiry').textContent=`Valid until ${new Date(result.expiresAt).toLocaleString()}. Share privately with this rider only.`;}
}
$('telemetry').onclick=()=>run(async()=>{
  visualMode=false;telemetryMode=true;$('recordPanel').hidden=true;$('visualPanel').hidden=true;telemetryPanel.hidden=false;
  $('rideToken').value='';$('tokenExpiry').textContent='';
  await refreshLive();
});
async function refreshLive(){
  const result=await api('analytics/live?limit=100');
  const count=result.users[0]?.count??0;
  $('liveCount').textContent=`${count} riders with fresh GPS (${result.freshnessSeconds}-second window)`;
  $('liveTimestamp').textContent=`As of ${new Date(result.asOf).toLocaleString()}. Showing up to 100 sessions; refresh to update.`;
  $('liveSessions').textContent=result.sessions.length?JSON.stringify(result.sessions,null,2):'No fresh GPS sessions.';
}
$('refreshLive').onclick=()=>run(refreshLive);
$('startRideForm').onsubmit=e=>{e.preventDefault();run(async()=>{
  const result=await api('rides',{method:'POST',body:JSON.stringify({requestId:$('rideRequest').value,riderRef:$('riderRef').value,routeId:$('routeId').value})});
  showRide(result);status(result.created?'Ride started.':'Existing ride recovered for this request.');
});};
$('newRideRequest').onclick=()=>{$('rideRequest').value=crypto.randomUUID();$('rideToken').value='';$('tokenExpiry').textContent='';};
$('readRide').onclick=()=>run(async()=>showRide(await api(`rides/${encodeURIComponent($('rideId').value)}`)));
$('rotateRide').onclick=()=>run(async()=>{if(!confirm('Replace the rider token? The previous token will stop working.'))return;showRide(await api(`rides/${encodeURIComponent($('rideId').value)}/token`,{method:'POST',body:'{}'}));});
$('finishRide').onclick=()=>run(async()=>{if(!confirm('Finish this ride and stop accepting GPS pings?'))return;showRide(await api(`rides/${encodeURIComponent($('rideId').value)}/finish`,{method:'POST',body:'{}'}));$('rideToken').value='';$('tokenExpiry').textContent='';await refreshLive();});
$('historyForm').onsubmit=e=>{e.preventDefault();run(async()=>{
  const query=new URLSearchParams({from:new Date($('historyFrom').value).toISOString(),to:new Date($('historyTo').value).toISOString()});
  const result=await api(`analytics/rides?${query}`);
  $('historyResult').textContent=result.summary.length?JSON.stringify(result,null,2):'No completed or expired rides started in this range.';
});};
