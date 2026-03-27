console.log("SocioSphere Final Loaded");

/* ================= MAIN LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {

initializeDarkMode();
initializeLoginSystem();
initializeReportForm();
initializeCommunityFeed();
initializeMyIssues();
initializeProfile();
initializeAutoCategory();
initializeLocationAutocomplete();
addAdminAccess(); // ✅ ADDED

});

/* ================= DARK MODE ================= */

function initializeDarkMode(){

if(localStorage.getItem("darkMode")==="enabled"){
document.body.classList.add("dark");
}

document.querySelectorAll(".dark-toggle").forEach(btn=>{
btn.addEventListener("click",()=>{
document.body.classList.toggle("dark");

localStorage.setItem(
"darkMode",
document.body.classList.contains("dark")?"enabled":"disabled"
);
});
});

}

/* ================= LOGIN ================= */

function initializeLoginSystem(){

const loginBtn=document.getElementById("loginSubmit");

if(loginBtn){

loginBtn.addEventListener("click",()=>{

const name=document.getElementById("loginName")?.value.trim();
const email=document.getElementById("loginEmail")?.value.trim();
const pass=document.getElementById("loginPassword")?.value.trim();

if(!name||!email||!pass){
alert("Please fill all details");
return;
}

let users=JSON.parse(localStorage.getItem("users")||"{}");

/* ✅ ADMIN BYPASS LOGIN */
if(email === "admin@sociosphere.com"){
localStorage.setItem("loggedIn", email);
localStorage.setItem("role","admin");
alert("Admin login successful!");
window.location = "admin.html";
return;
}
/* ====================== */

if(!users[email]){
users[email]={name,email,password:pass};
alert("Account created!");
}else{
if(users[email].password!==pass){
alert("Incorrect password");
return;
}
alert("Login successful!");
}

localStorage.setItem("users",JSON.stringify(users));
localStorage.setItem("loggedIn",email);
localStorage.setItem("role","user");

closeLogin();
location.reload();

});

}

showProfileIcon();

}

/* ================= PROFILE ICON ================= */

function showProfileIcon(){

let logged=localStorage.getItem("loggedIn");
if(!logged) return;

let users=JSON.parse(localStorage.getItem("users")||"{}");
let name=users[logged]?.name||"U";

document.querySelectorAll(".login-btn").forEach(btn=>{
btn.outerHTML=`
<div class="profile-icon" onclick="window.location='profile.html'">
${name.charAt(0).toUpperCase()}
</div>
<button class="logout-btn" onclick="logout()">Logout</button>
`;
});

}

function logout(){
localStorage.removeItem("loggedIn");
localStorage.removeItem("role");
location.reload();
}

function openLogin(){
let overlay=document.getElementById("loginOverlay");
if(overlay) overlay.style.display="flex";
}

function closeLogin(){
let overlay=document.getElementById("loginOverlay");
if(overlay) overlay.style.display="none";
}

/* ================= ADMIN NAV BUTTON ================= */

function addAdminAccess(){

let role = localStorage.getItem("role");

if(role === "admin"){

document.querySelectorAll(".nav-menu").forEach(menu=>{

if(menu.innerHTML.includes("ADMIN")) return;

let li = document.createElement("li");
li.innerHTML = `<a href="admin.html">ADMIN</a>`;
menu.appendChild(li);

});

}

}

/* ================= AUTO CATEGORY ================= */

function detectCategory(text){

text=text.toLowerCase();

if(text.includes("road")||text.includes("pothole")) return "Road";
if(text.includes("water")||text.includes("pipe")||text.includes("leak")) return "Water";
if(text.includes("electric")||text.includes("power")||text.includes("street light")) return "Electricity";
if(text.includes("garbage")||text.includes("trash")||text.includes("waste")) return "Garbage";
if(text.includes("traffic")) return "Traffic";
if(text.includes("drain")) return "Drainage";
if(text.includes("bus")||text.includes("transport")) return "Public Transport";
if(text.includes("noise")) return "Noise Pollution";
if(text.includes("air")||text.includes("pollution")) return "Air Pollution";
if(text.includes("construction")) return "Illegal Construction";
if(text.includes("animal")||text.includes("dog")) return "Animal Issue";
if(text.includes("health")||text.includes("hospital")) return "Health & Sanitation";

return "Other";
}

function initializeAutoCategory(){

const issueInput=document.getElementById("issueText");
const categorySelect=document.getElementById("category");

if(!issueInput||!categorySelect) return;

issueInput.addEventListener("input",()=>{
categorySelect.value=detectCategory(issueInput.value);
});

}

/* ================= LIVE LOCATION ================= */

function getLiveLocation(){

if(!navigator.geolocation){
alert("Geolocation not supported");
return;
}

navigator.geolocation.getCurrentPosition(

async (position)=>{

let lat = position.coords.latitude;
let lon = position.coords.longitude;

try{
let res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
let data = await res.json();
document.getElementById("location").value = data.display_name;
}catch{
document.getElementById("location").value = `${lat}, ${lon}`;
}

},
()=>{ alert("Allow location access"); }

);

}

/* ================= REPORT ISSUE ================= */

function initializeReportForm(){

const form=document.getElementById("reportForm");
if(!form) return;

form.addEventListener("submit",(e)=>{

e.preventDefault();

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

const description=document.getElementById("issueText").value;
const location=document.getElementById("location").value;
const category=document.getElementById("category").value;

const file=document.getElementById("imageInput").files[0];
const reader=new FileReader();

reader.onload=function(e){

issues.push({
text:description,
location,
category,
date:new Date().toISOString(),
user:localStorage.getItem("loggedIn"),
image:e.target.result,
support:0,
comments:[],
status:"pending"
});

localStorage.setItem("issues",JSON.stringify(issues));

alert("Issue submitted!");
window.location="community.html";

};

if(file) reader.readAsDataURL(file);
else reader.onload({target:{result:null}});

});

}

/* ================= COMMUNITY FEED ================= */

function initializeCommunityFeed(){

const feed=document.getElementById("communityFeed") || document.getElementById("publicIssueFeed");
if(!feed) return;

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

feed.innerHTML="";

issues.reverse().forEach(issue=>{

feed.innerHTML+=`

<div class="issue-card">

<div style="display:flex;justify-content:space-between">

<strong>${issue.user}</strong>

<span style="cursor:pointer;color:blue;text-decoration:underline;"
onclick="openMap('${issue.location}')">
📍 ${issue.location}
</span>

</div>

<p>${issue.text}</p>

${issue.image && issue.image !== "" ? 
`<img src="${issue.image}" style="width:100%;max-height:250px;border-radius:10px;margin-top:10px;">` : ""}

<p>Status: ${issue.status}</p>
<p>Category: ${issue.category}</p>

<div class="post-actions">

<button onclick="supportIssue('${issue.date}')">
👍 Support (${issue.support||0})
</button>

<button onclick="toggleComment('${issue.date}')">
💬 Comment
</button>

<button onclick="shareIssue()">
🔁 Share
</button>

</div>

<div id="comment-${issue.date}" style="display:none;margin-top:10px;">

<input id="input-${issue.date}" placeholder="Write comment..." style="width:70%">

<button onclick="postComment('${issue.date}')">Post</button>

<div>
${(issue.comments||[]).map(c=>`
<p><strong>${c.user}</strong>: ${c.text}</p>
`).join("")}
</div>

</div>

</div>

`;

});

}

/* ================= ADMIN STATUS UPDATE ================= */

function changeStatus(index, newStatus){

let issues = JSON.parse(localStorage.getItem("issues") || "[]");

if(issues[index]){
issues[index].status = newStatus;
localStorage.setItem("issues", JSON.stringify(issues));
alert("Status updated");
location.reload();
}

}

/* ================= SUPPORT ================= */

function supportIssue(date){

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

let issue=issues.find(i=>i.date===date);

if(issue){
issue.support=(issue.support||0)+1;
localStorage.setItem("issues",JSON.stringify(issues));
location.reload();
}

}

/* ================= COMMENTS ================= */

function toggleComment(date){
let box=document.getElementById("comment-"+date);
box.style.display = box.style.display==="none"?"block":"none";
}

function postComment(date){

let input=document.getElementById("input-"+date);
let text=input.value.trim();
if(!text) return;

let issues=JSON.parse(localStorage.getItem("issues")||"[]");
let issue=issues.find(i=>i.date===date);

issue.comments.push({
user:localStorage.getItem("loggedIn"),
text
});

localStorage.setItem("issues",JSON.stringify(issues));
location.reload();

}

/* ================= SHARE ================= */

function shareIssue(){
navigator.clipboard.writeText(window.location.href);
alert("Link copied!");
}

/* ================= MAP ================= */

function openMap(location){
window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`);
}

/* ================= MY ISSUES ================= */

function initializeMyIssues(){

const list=document.getElementById("issuesList");
if(!list) return;

let user=localStorage.getItem("loggedIn");
let issues=JSON.parse(localStorage.getItem("issues")||"[]");

list.innerHTML="";

issues.filter(i=>i.user===user).reverse().forEach(issue=>{

list.innerHTML+=`
<div class="issue-card">
<h4>${issue.text}</h4>
<p>📍 ${issue.location}</p>

${issue.image && issue.image !== "" ? 
`<img src="${issue.image}" style="width:100%;max-height:250px;border-radius:10px;margin-top:10px;">` : ""}

<p>Status: ${issue.status}</p>
</div>
`;

});

}

/* ================= PROFILE ================= */

function initializeProfile(){

if(!window.location.pathname.includes("profile.html")) return;

let logged=localStorage.getItem("loggedIn");
let users=JSON.parse(localStorage.getItem("users")||"{}");

let user=users[logged];
if(!user) return;

document.getElementById("profileName").innerText=user.name;
document.getElementById("profileEmail").innerText=user.email;

}

/* ================= LOCATION AUTOCOMPLETE ================= */

function initializeLocationAutocomplete(){

const input=document.getElementById("location");
const box=document.getElementById("locationSuggestions");

if(!input||!box) return;

input.addEventListener("input",async ()=>{

let q=input.value.trim();
if(q.length<3){
box.innerHTML="";
return;
}

let res=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
let data=await res.json();

box.innerHTML="";

data.slice(0,5).forEach(p=>{
let div=document.createElement("div");
div.innerText=p.display_name;

div.onclick=()=>{
input.value=p.display_name;
box.innerHTML="";
};

box.appendChild(div);
});

});

}