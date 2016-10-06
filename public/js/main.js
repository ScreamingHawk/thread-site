ajax_url = 'https://kmu43f0xqb.execute-api.us-east-1.amazonaws.com/prod/posts/';

if (window.location.protocol == 'file:'){
	// Testing mode
	ajax_url = 'http://localhost:3001/';
}

posting_delay = 10;
button_delay = 3;
auto_refresh_delay = 30000;

postIds = [];
highest_id = null;
lowest_id = null;

function getPosts(){
	loading();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		handleGetPosts(xmlhttp, false);
	};
	xmlhttp.open("GET", ajax_url, true);
	xmlhttp.send();
}

function getExactPost(postId){
	loading();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		handleGetPosts(xmlhttp, false);
	};
	xmlhttp.open("GET", ajax_url + postId, true);
	xmlhttp.send();
}

function getNewerPosts(){
	loading();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		handleGetPosts(xmlhttp, false);
	};
	xmlhttp.open("GET", ajax_url + highest_id + '/up', true);
	xmlhttp.send();
}

function getOlderPosts(){
	loading();
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
				addPost(post);
			}
		} else if (xmlhttp.status == 400) {
			//TODO alert('There was an error 400');
		} else {
			//TODO alert('something else other than 200 was returned');
		}
		unloading();
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
		post.appendChild(document.createElement('hr'));
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
			var postTextP = document.createElement('p');
			// Linkify
			var re = />>\d+/g
			postText = postObj.msg;
			var i = postText.indexOf(postText.match(re));
			while (i != -1){
				var temp;
				var s;
				if (i != 0){
					// Splice string
					temp = postText.split('');
					s = temp.splice(0, i).join('');
					postText = temp.join('');
					postTextP.appendChild(document.createTextNode(s));
				}
				var el = document.createElement('a');
				// Splice string
				temp = postText.split('');
				s = temp.splice(0, postText.match(re)[0].length).join('');
				postText = temp.join('');
				el.innerText = s;
				el.href = '#post'+s.slice(2, s.length);
				postTextP.appendChild(el);
				i = postText.indexOf(postText.match(re));
			}
			if (postText.length > 0){
				postTextP.appendChild(document.createTextNode(postText));
			}
			re = /\n/g;
			postTextP.innerHTML = postTextP.innerHTML.replace(re, '<br />');
			post.appendChild(postTextP);
		}
		// Add post
		var postContainer = document.getElementById('postcontainer');
		if (postObj.postId < lowest_id){
			postContainer.appendChild(post);
		} else {
			postContainer.insertBefore(post, postContainer.firstChild);
		}
		// Mark added
		postIds.push(postObj.postId);
		if (highest_id == null || postObj.postId > highest_id){
			highest_id = postObj.postId;
		}
		if (lowest_id == null || postObj.postId < lowest_id){
			lowest_id = postObj.postId;
			if (lowest_id <= 1){
				document.getElementById('ancient').className = 'transparent';
			}
		}
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
	return false;
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
	previewImage();
	
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
			buttonTimedDisable(makePostButton, posting_delay);
		};

		xmlhttp.open("POST", ajax_url, true);
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(post));
	} else {
		makePostButton.disabled = false;
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
	buttonTimedDisable(impatient, button_delay);
}

// Load older posts
function ancientClick(){
	var ancient = document.getElementById('ancient');
	ancient.disabled = true;
	getOlderPosts();
	buttonTimedDisable(ancient, button_delay);
}

function buttonTimedDisable(butt, seconds, repeat){
	butt.disabled = true;
	if (repeat == true){
		//butt.innerText = butt.innerText.slice(0, butt.innerText.lastIndexOf(" "));
	}
	if (seconds <= 0){
		butt.disabled = false;
	} else {
		//butt.innerText += ' '+seconds+'...';
		setTimeout(function(){
			buttonTimedDisable(butt, seconds-1, true);
		}, 1000);
	}
}

function loading(){
	document.getElementById('loading').className = '';
	if (document.getElementById('postcontainer').firstElementChild != null && 
			document.getElementById('ancient').className != 'transparent'){
		document.getElementById('loadingLower').className = '';
	}
}

function unloading(){
	document.getElementById('loading').className = 'transparent';
	document.getElementById('loadingLower').className = 'transparent';
}

// Preview post images
function previewImage(){
	var postImgSrc = document.getElementById('postImg').value;
	var previewImg = document.getElementById('postImgPreview');
	console.log(postImgSrc);
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