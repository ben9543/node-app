const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const modalBg = Array.from(document.getElementsByClassName("modal-bg"))[0];
const login = Array.from(document.getElementsByClassName("modal-login"))[0];
const register = Array.from(document.getElementsByClassName("modal-register"))[0];

if(loginBtn) loginBtn.addEventListener("click", ()=>{
    modalBg.style.visibility = "visible";
    login.style.display = "block";
});
if(registerBtn) registerBtn.addEventListener("click", ()=>{
    modalBg.style.visibility = "visible";
    register.style.display = "block";
});
if(modalBg) modalBg.addEventListener("click", (e)=>{
    const target = e.target;
    console.log(target);
    console.log(modalBg.contains(e.target));
    if(target !== login && target !== register){
        modalBg.style.visibility = "hidden";
        login.style.display = "none";
        register.style.display = "none";
    }
});