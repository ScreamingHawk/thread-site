ajax_url = 'https://kmu43f0xqb.execute-api.us-east-1.amazonaws.com/prod/posts/';

if (window.location.protocol == 'file:'){
	// Testing mode
	ajax_url = 'http://localhost:3001/';
}

posting_delay = 10000;
button_delay = 3000;
auto_refresh_delay = 30000;

highest_id = null;
lowest_id = null;

function getPosts(){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		handleGetPosts(xmlhttp, false);
	};
	xmlhttp.open("GET", ajax_url, true);
	xmlhttp.send();
}

function getExactPost(postId){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		handleGetPosts(xmlhttp, false);
	};
	xmlhttp.open("GET", ajax_url + postId, true);
	xmlhttp.send();
}

function getNewerPosts(){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		handleGetPosts(xmlhttp, false);
	};
	xmlhttp.open("GET", ajax_url + highest_id + '/up', true);
	xmlhttp.send();
}

function getOlderPosts(){
	if (lowest_id > 1){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			handleGetPosts(xmlhttp, true);
		};
		xmlhttp.open("GET", ajax_url + lowest_id + '/down', true);
		xmlhttp.send();
	}
}

function handleGetPosts(xmlhttp, reverse){
	if (xmlhttp.readyState == XMLHttpRequest.DONE) {
		if (xmlhttp.status == 200) {
			var resp = JSON.parse(xmlhttp.responseText);
			if (reverse !== 'undefined' && reverse){
				reverse(resp);
			}
			for (var i = 0; i < resp.length; i++){
				post = resp[i];
				if (highest_id == null || post.postId > highest_id){
					highest_id = post.postId;
				}
				if (lowest_id == null || post.postId < lowest_id){
					lowest_id = post.postId;
				}
				addPost(post);
			}
		} else if (xmlhttp.status == 400) {
			//TODO alert('There was an error 400');
		} else {
			//TODO alert('something else other than 200 was returned');
		}
	}
}

function addPost(postObj){
	// Check post not already exists
	var exist = document.getElementById('post'+postObj.postId);
	if (exist === null){
		// Create post
		var post = document.createElement('div');
		post.className = 'panel transparent';
		post.id = 'post'+postObj.postId;
		// Top info
		var postTop = document.createElement('div');
		post.appendChild(postTop);
		// Post postId
		if (postObj.postId){
			var postId = document.createElement('a');
			postId.href = '#';
			postId.innerText = '>>' + postObj.postId;
			postId.onclick = function(){
				quote(postObj.postId);
			};
			postTop.appendChild(postId);
		}
		// Date
		if (postObj.time){
			t = new Date(postObj.time);
			var postTime = document.createElement('span');
			postTime.innerText = t.toLocaleString();
			postTime.className = 'right';
			postTop.appendChild(postTime);
		}
		// Image
		if (postObj.img){
			var postImg = document.createElement('img');
			postImg.src = postObj.img;
			postImg.onerror = imageError;
			post.appendChild(postImg);
		}
		// Text
		if (postObj.msg){
			var postText = document.createTextNode(postObj.msg);
			
			post.appendChild(postText);
		}
		// Add post
		var postContainer = document.getElementById('postcontainer');
		postContainer.insertBefore(post, postContainer.firstChild);
		// Transition
		setTimeout(function(){
			post.className = 'panel';
			// Auto-scroll to prevent jumping if not at top
			if (window.scrollY != 0){
				window.scrollTo(window.scrollX, window.scrollY + post.scrollHeight);
			}
		}, 50);
	}
}

function imageError(){
	this.onerror = null;
	this.src = 'img/broken.png';
}

// Quote a post
function quote(postId){
	var postMsg = document.getElementById('postMsg');
	pos = postMsg.selectionStart;
	postMsg.value = postMsg.value.substr(0, pos) + '>>' + postId + '\n' + postMsg.value.substr(pos);
	postMsg.focus();
}

function makePost(){
	var makePostButton = document.getElementById('makePost');
	makePostButton.disabled = true;
	
	var post = {};
	var postMsg = document.getElementById('postMsg');
	post.msg = postMsg.value;
	postMsg.value = '';
	var postImg = document.getElementById('postImg');
	post.img = postImg.value;
	postImg.value = '';
	
	if (post.msg != '' || post.img != ''){
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				if (xmlhttp.status == 200) {
					// Success
				} else if (xmlhttp.status == 400) {
					//TODO alert('There was an error 400');
				} else {
					//TODO alert('something else other than 200 was returned');
				}
				impatientClick();
			}
			setTimeout(function(){
				makePostButton.disabled = false;
			}, posting_delay);
		};

		xmlhttp.open("POST", ajax_url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(post));
	}
}

// Load newer posts
function impatientClick(){
	var impatient = document.getElementById('impatient');
	impatient.disabled = true;
	if (highest_id == null){
		getPosts();
	} else {
		getNewerPosts();
	}
	setTimeout(function(){
		impatient.disabled = false;
	}, button_delay);
}

// Load older posts
function ancientClick(){
	var ancient = document.getElementById('ancient');
	ancient.disabled = true;
	getOlderPosts();
	setTimeout(function(){
		ancient.disabled = false;
	}, button_delay);
}

// Preview post images
function previewImage(){
	var postImgSrc = document.getElementById('postImg').value;
	var previewImg = document.getElementById('postImgPreview');
	if (postImgSrc == ''){
		previewImg.className = 'hidden';
	} else {
		previewImg.className = 'preview';
		previewImg.src = postImgSrc;
		previewImg.onerror = imageError;
	}
}

function init(){
	// Set up buttons
	document.getElementById('toggleTheme').onclick = toggleTheme;
	document.getElementById('impatient').onclick = impatientClick;
	document.getElementById('ancient').onclick = ancientClick;
	document.getElementById('makePost').onclick = makePost;
	document.getElementById('postImg').onchange = previewImage;
	
	impatientClick();
	setInterval(impatientClick, auto_refresh_delay);
}
init();

/* Themes */
var currentTheme = 0;
var themes = ['native', 'amber'];

function toggleTheme(){
	currentTheme++;
	// Intentional out of bounds to include no theme
	if (currentTheme > themes.length){
		currentTheme = 0;
	}
	document.documentElement.className = themes[currentTheme];
}

/* Ads */
function adBlockDetected() {
	document.getElementById('adBlockPlea').className = '';
}

if (typeof blockAdBlock === 'undefined') {
	adBlockDetected();
} else {
	blockAdBlock.onDetected(adBlockDetected);
}