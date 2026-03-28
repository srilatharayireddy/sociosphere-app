console.log("SocioSphere Final Loaded");

/* ================= MAIN LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {

initializeDarkMode();
initializeLoginSystem();
initializeReportForm();
initializeCommunityFeed();
initializeMyIssues();   // ✅ FIXED
initializeProfile();    // ✅ FIXED
initializeAutoCategory();
initializeLocationAutocomplete();
addAdminAccess();

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

/* ADMIN LOGIN */
if(email === "admin@sociosphere.com"){
localStorage.setItem("loggedIn", email);
localStorage.setItem("role","admin");
alert("Admin login successful!");
window.location = "admin.html";
return;
}

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

/* ================= ADMIN NAV ================= */

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
volunteers:[],
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

${issue.image ? `<img src="${issue.image}" style="width:100%;max-height:250px;border-radius:10px;margin-top:10px;">` : ""}

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

<button onclick="openVolunteerForm('${issue.date}')">
🤝 Volunteer (${issue.volunteers ? issue.volunteers.length : 0})
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

/* ================= ✅ FIXED MY ISSUES ================= */

function initializeMyIssues(){

const box = document.getElementById("issuesList");
if(!box) return;

let issues = JSON.parse(localStorage.getItem("issues") || "[]");
let loggedUser = localStorage.getItem("loggedIn");

box.innerHTML = "";

let myIssues = issues.filter(issue => issue.user === loggedUser);

if(myIssues.length === 0){
box.innerHTML = "<p>No issues reported yet.</p>";
return;
}

myIssues.forEach(issue => {

box.innerHTML += `
<div class="issue-card">

<p><strong>${issue.text}</strong></p>

<p>📍 ${issue.location}</p>
<p>Status: ${issue.status}</p>
<p>Category: ${issue.category}</p>

${issue.image ? `<img src="${issue.image}" style="width:100%;max-height:200px;border-radius:10px;margin-top:10px;">` : ""}

</div>
`;

});

}

/* ================= ✅ FIXED PROFILE ================= */

function initializeProfile(){

let nameEl = document.getElementById("profileName");
let emailEl = document.getElementById("profileEmail");
let phoneEl = document.getElementById("profilePhone");
let issuesEl = document.getElementById("profileIssues");

if(!nameEl) return;

let users = JSON.parse(localStorage.getItem("users") || "{}");
let issues = JSON.parse(localStorage.getItem("issues") || "[]");

let logged = localStorage.getItem("loggedIn");

if(!logged || !users[logged]) return;

let user = users[logged];

nameEl.textContent = "Name: " + (user.name || "N/A");
emailEl.textContent = "Email: " + (user.email || "N/A");
phoneEl.textContent = "Phone: " + (user.phone || "N/A");

let count = issues.filter(i => i.user === logged).length;
issuesEl.textContent = "Reported Issues: " + count;

}

/* ================= OTHER FUNCTIONS ================= */

function openVolunteerForm(date){

let name = prompt("Enter your name:");
let phone = prompt("Enter your mobile number:");
let message = prompt("How will you help?");

if(!name || !phone){
alert("Details required");
return;
}

let issues = JSON.parse(localStorage.getItem("issues") || "[]");
let issue = issues.find(i => i.date === date);

if(!issue.volunteers){
issue.volunteers = [];
}

issue.volunteers.push({
name,
phone,
message
});

localStorage.setItem("issues", JSON.stringify(issues));

alert("You joined as volunteer!");
location.reload();

}

function changeStatus(index, newStatus){
let issues = JSON.parse(localStorage.getItem("issues") || "[]");
issues[index].status = newStatus;
localStorage.setItem("issues", JSON.stringify(issues));
location.reload();
}

function supportIssue(date){
let issues=JSON.parse(localStorage.getItem("issues")||"[]");
let issue=issues.find(i=>i.date===date);
if(issue){
issue.support=(issue.support||0)+1;
localStorage.setItem("issues",JSON.stringify(issues));
location.reload();
}
}

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

function shareIssue(){
navigator.clipboard.writeText(window.location.href);
alert("Link copied!");
}

function openMap(location){
window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`);
}