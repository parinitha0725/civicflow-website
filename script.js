const KEY = "civicflow-reports-v1";
const seed = [
  {id:"CF-1024",description:"Water is collecting near the bus stop after rain. The roadside drain seems blocked.",category:"Waterlogging / drainage",location:"Main bus stop",area:"Central Ward",priority:"High",reason:"Waterlogging can disrupt movement; drainage blockage is mentioned.",summary:"Waterlogging near the main bus stop, possibly caused by a blocked drain.",status:"In progress",created:Date.now()-86400000},
  {id:"CF-1023",description:"Street light has not been working for three nights near the community park.",category:"Streetlight",location:"Community park",area:"North Ward",priority:"Medium",reason:"A dark public area may create a safety concern, especially at night.",summary:"Non-working streetlight near the community park.",status:"Under review",created:Date.now()-172800000},
  {id:"CF-1022",description:"Garbage bins are overflowing near the market entrance.",category:"Waste management",location:"Market entrance",area:"Central Ward",priority:"Medium",reason:"Overflowing waste can affect public hygiene and the surrounding area.",summary:"Overflowing garbage bins near the market entrance.",status:"Submitted",created:Date.now()-259200000}
];
let reports = JSON.parse(localStorage.getItem(KEY) || "null") || seed;
const $ = id => document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(reports));render();}
function analyze(description, category, area, location){
  const text=description.toLowerCase();
  const urgentWords=["accident","injury","fire","electric shock","open manhole","danger","collapsed","flood","sewage"];
  const mediumWords=["blocked","overflow","broken","not working","leak","waterlogging","dark"];
  const urgent=urgentWords.some(w=>text.includes(w));
  const medium=mediumWords.some(w=>text.includes(w));
  let priority=urgent?"High":medium?"Medium":"Low";
  if(["Public safety"].includes(category)) priority="High";
  const reasons={High:"Potential immediate safety risk or a public-safety category was identified.",Medium:"The description indicates disruption, damage, blockage or a service issue.",Low:"No strong urgent-risk keywords were detected; routine review is suggested."};
  const duplicate=reports.find(r=>r.description.toLowerCase().split(/\W+/).filter(w=>w.length>4).some(w=>text.includes(w)) && r.area===area);
  const summary=description.trim().replace(/\s+/g," ").slice(0,115)+(description.length>115?"…":"");
  return {priority,reason:reasons[priority],summary,duplicate:duplicate?duplicate.id:null};
}
function render(){
  $("totalCount").textContent=reports.length;
  $("highCount").textContent=reports.filter(r=>r.priority==="High"&&r.status!=="Resolved").length;
  $("progressCount").textContent=reports.filter(r=>r.status==="In progress").length;
  $("resolvedCount").textContent=reports.filter(r=>r.status==="Resolved").length;
  const counts={};reports.forEach(r=>counts[r.area]=(counts[r.area]||0)+1);
  const hot=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  $("hotspotArea").textContent=hot&&hot[1]>1?hot[0]:"No strong hotspot yet";
  $("hotspotText").textContent=hot&&hot[1]>1?`${hot[1]} reports are associated with this area. Review them together to identify a recurring issue.`:"Reports are grouped by area. A hotspot appears when multiple reports share an area.";
  const urgent=reports.filter(r=>r.priority==="High"&&r.status!=="Resolved").sort((a,b)=>b.created-a.created)[0];
  $("briefTitle").textContent=urgent?`Review ${urgent.id} first`:"No urgent action pending";
  $("briefText").textContent=urgent?`${urgent.summary} Suggested next step: verify the location, assign the responsible team and update the status.`:"No unresolved high-priority reports are currently flagged by this demo.";
  const filter=$("statusFilter").value;
  const visible=reports.filter(r=>filter==="All"||r.status===filter).sort((a,b)=>b.created-a.created);
  $("reportsBody").innerHTML=visible.length?visible.map(r=>`<tr><td><strong>${r.id}</strong><span class="subline">${escapeHTML(r.category)}</span></td><td>${escapeHTML(r.location)}<span class="subline">${escapeHTML(r.area)}</span></td><td><span class="priority ${r.priority}">${r.priority}</span></td><td><span class="status ${r.status.replaceAll(" ","-")}">${r.status}</span></td><td class="reason">${escapeHTML(r.reason)}${r.duplicate?`<span class="subline">Possible duplicate of ${r.duplicate}</span>`:""}</td><td><select class="update-select" data-id="${r.id}">${["Submitted","Under review","In progress","Resolved"].map(s=>`<option ${r.status===s?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join(""):`<tr><td colspan="6" class="empty">No reports match this filter.</td></tr>`;
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("reportForm").addEventListener("submit",e=>{
  e.preventDefault();
  const description=$("description").value.trim(),category=$("category").value,location=$("location").value.trim(),area=$("area").value;
  const ai=analyze(description,category,area,location);
  const id="CF-"+String(Math.max(1024,...reports.map(r=>Number(r.id.split("-")[1])||0))+1);
  reports.push({id,description,category,location,area,...ai,status:"Submitted",created:Date.now()});
  save();e.target.reset();
  $("toast").textContent=ai.duplicate?`Report submitted. Possible duplicate of ${ai.duplicate} — linked for review.`:`Report ${id} submitted. AI demo priority: ${ai.priority}.`;
  $("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),3500);
  location.hash="#track";
});
$("reportsBody").addEventListener("change",e=>{
  if(!e.target.matches(".update-select"))return;
  const report=reports.find(r=>r.id===e.target.dataset.id);if(report){report.status=e.target.value;save();$("toast").textContent=`${report.id} updated to ${report.status}.`;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2500);}
});
$("statusFilter").addEventListener("change",render);
render();