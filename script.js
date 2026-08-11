function toggleDarkMode() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")){
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

//Load theme on page load
window.onload = function (){
    if(localStorage.setItem("theme") === "dark"){
        this.document.body.classList.add("dark");
    }
};

function addComment(){
    let name = document.getElementById("name").value;
    let comment = document.getElementById("comment").value;

    if (name === "" || comment === ""){
        alert("Please fill all fields");
        return;
    }

    let commentBox = document.createElement("div");
    commentBox.innerHTML = '<strong>${name}</strong><p>${comment}</p><hr>';

    document.getElementById("comment").appendChild(commentBox);

    document.getElementById("name").value = "";
    document.getElementById("comment").value = "";
}

function filterPosts(category) {
    let posts = document.querySelecterAll(".post");

    posts.forEach(post => {
        if (category === "all"){
            post.style.display = "block";
        } else if (post.classList.contains(category)){
            post.style.display = "block";
        } else {
            post.style.display = "none";
        }
    });
}

function revealPosts(){
    let posts = document.querySelectorAll(".post");

    posts.forEach(post =>{
        let windowHeight = window.innerHeight;
        let postTop = post.getBoundingClientRect().top;

        if (postTop < windowHeight - 100){
            post.classList.add("show");
        }
    });
}

window.addEventListener("scroll", revealPosts);
window.addEventListener("load", revealPosts);

function searchPosts(){
    let input = document.getElementById("searchInput").value.toLowerCase();
    let posts = document.querySelectorAll(".post");

    posts.forEach(post => {
        let text = post.innerText.toLowerCase();
        post.style.display = text.includes(input) ? "block" : "none";
    });
}

function validateForm(){
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let message = document.getElementById("message").value.trim();

    if (name === ""){
        alert("Please enter your name");
        return false;
    }

    if (email === ""){
        alert("Please enter your email");
        return false;
    }

    if (!email.includes("@")){
        alert("Please enter a valid email");
        return false;
    }

    if (message === ""){
        alert("Please enter your message");
        return false;
    }

    alert("Message sent successfully!");
    return true;
}