console.log("SocioSphere Loaded");

const ADMIN_EMAIL = "[admin@sociosphere.com](mailto:admin@sociosphere.com)";

document.addEventListener("DOMContentLoaded", () => {

initializeDarkMode();
initializeLoginSystem();
initializeReportForm();
initializeCommunityFeed();
initializeMyIssues();
initializeProfile();
initializeAdminDashboard();
initializeAutoCategory();

});

/* ================= AUTO CATEGORY ================= */

function detectCategory(text){

text=text.toLowerCase();

if(text.includes("road")||text.includes("pothole")) return "Road";
if(text.includes("water")||text.includes("pipe")||text.includes("leak")) return "Water";
if(text.includes("electric")||text.includes("power")) return "Electricity";
if(text.includes("garbage")||text.includes("trash")) return "Garbage";

return "Road";

}

function initializeAutoCategory(){

const issueInput=document.getElementById("issueText");
const categorySelect=document.getElementById("category");

if(!issueInput||!categorySelect) return;

issueInput.addEventListener("input",()=>{

const predicted=detectCategory(issueInput.value);
categorySelect.value=predicted;

});

}

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

/* ================= LOGIN POPUP ================= */

function openLogin(){
let overlay=document.getElementById("loginOverlay");
if(overlay) overlay.style.display="flex";
}

function closeLogin(){
let overlay=document.getElementById("loginOverlay");
if(overlay) overlay.style.display="none";
}

function logout(){
localStorage.removeItem("loggedIn");
location.reload();
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

const imageInput=document.getElementById("imageInput");
const file=imageInput.files[0];

const reader=new FileReader();

reader.onload=function(e){

const imageData=e.target.result;

issues.push({

text:description,
location:location,
category:category,
priority:"low",
date:new Date().toLocaleString(),
user:localStorage.getItem("loggedIn"),
image:imageData,
support:0,
comments:[],
status:"Submitted"

});

localStorage.setItem("issues",JSON.stringify(issues));

alert("Issue submitted successfully!");
window.location="community.html";

};

if(file){
reader.readAsDataURL(file);
}else{
reader.onload({target:{result:null}});
}

});

}

/* ================= COMMUNITY FEED ================= */

function initializeCommunityFeed(){

const feed=document.getElementById("publicIssueFeed");

if(!feed) return;

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

feed.innerHTML="";

issues.reverse().forEach(issue=>{

feed.innerHTML+=`

<div class="issue-card">

<div style="display:flex;justify-content:space-between">

<strong>${issue.user}</strong> <span>📍 ${issue.location}</span>

</div>

<p>${issue.text}</p>

${issue.image?`<img src="${issue.image}" class="issue-image">`:""}

<div class="map-icon" onclick="openMap('${issue.location}')">
🗺 View Location
</div>

<p>Status: ${issue.status}</p>

<p>Category: ${issue.category}</p>
<p>Priority: ${issue.priority}</p>

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

</div>

`;

});

}

/* ================= MY ISSUES ================= */

function initializeMyIssues(){

const list=document.getElementById("issuesList");

if(!list) return;

let logged=localStorage.getItem("loggedIn");

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

let myIssues=issues.filter(i=>i.user===logged);

list.innerHTML="";

myIssues.reverse().forEach(issue=>{

list.innerHTML+=`

<div class="issue-card">

<h4>${issue.text}</h4>

<p>📍 ${issue.location}</p>

${issue.image?`<img src="${issue.image}" class="issue-image">`:""}

<p>Status: ${issue.status}</p>

</div>

`;

});

}

/* ================= PROFILE PAGE ================= */

function initializeProfile(){

if(!window.location.pathname.includes("profile.html")) return;

let logged=localStorage.getItem("loggedIn");

let users=JSON.parse(localStorage.getItem("users")||"{}");

let user=users[logged];

if(!user) return;

document.getElementById("profileName").innerText="Name: "+user.name;

document.getElementById("profileEmail").innerText="Email: "+user.email;

document.getElementById("profileCircle").innerText=
user.name.charAt(0).toUpperCase();

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

let myIssues=issues.filter(i=>i.user===logged);

document.getElementById("profileIssues").innerText=
"Reported Issues: "+myIssues.length;

}

/* ================= SUPPORT ================= */

function supportIssue(date){

let issues=JSON.parse(localStorage.getItem("issues")||"[]");

let issue=issues.find(i=>i.date===date);

issue.support=(issue.support||0)+1;

localStorage.setItem("issues",JSON.stringify(issues));

location.reload();

}

/* ================= SHARE ================= */

function shareIssue(){

navigator.clipboard.writeText(window.location.href);
alert("Post link copied!");

}

/* ================= MAP ================= */

function openMap(location){

let url="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(location);

window.open(url,"_blank");

}
