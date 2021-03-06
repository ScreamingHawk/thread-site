ajax_url = 'https://kmu43f0xqb.execute-api.us-east-1.amazonaws.com/prod/posts/';
ajax_posts_url = 'posts/';

posting_delay = 10;
button_delay = 3;
auto_refresh_delay = 30000;
bulk_load_amount = 5;

postIds = [];
highest_id = null;
lowest_id = null;

function getLatestPost(){
	loading();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200) {
				var resp = JSON.parse(xmlhttp.responseText);
				console.log('Latest post: '+resp.postId);
				for (var i = 0; i < bulk_load_amount; i++){
					getPost(resp.postId - i);
				}
			} else if (xmlhttp.status == 400) {
				//TODO alert('There was an error 400');
			} else {
				//TODO alert('something else other than 200 was returned');
			}
		}
	};
	xmlhttp.open("GET", ajax_url, true);
	xmlhttp.send();
}

function getPost(postId, jump){
	console.log('Checking: '+postId);
	if (!postId || postId < 1 || postIds.indexOf(postId) > -1){
		// Too low or already loaded
		return;
	}
	loading();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200) {
				console.log('Latest post: '+xmlhttp.responseText)
				addPost(JSON.parse(xmlhttp.responseText), jump);
			} else if (xmlhttp.status == 400) {
				console.log('There was an error 400');
				//TODO alert('There was an error 400');
			} else {
				console.log('something else other than 200 was returned');
				//TODO alert('something else other than 200 was returned');
			}
			unloading();
		}
	};
	xmlhttp.open("GET", ajax_posts_url + postId + '.json', true);
	xmlhttp.send();
}

function addPost(postObj, jump){
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
			var m = postText.match(re)
			var i = -1;
			if (m != null){
				i = postText.indexOf(m[0]);
			}
			while (i != -1){
				var temp;
				var s;
				if (i != 0){
					// Text
					temp = postText.split('');
					s = temp.splice(0, i).join('');
					postText = temp.join('');
					postTextP.appendChild(document.createTextNode(s));
				}
				// Post reference
				var el = document.createElement('a');
				temp = postText.split('');
				s = temp.splice(0, postText.match(re)[0].length).join('');
				postText = temp.join('');
				el.innerText = s;
				var elPostId = s.slice(2, s.length);
				el.href = '#post'+elPostId;
				el.onclick = function(){
					// Download post if not on page
					getPost(this.href.split('#post')[1], true);
					return true;
				}
				postTextP.appendChild(el);
				m = postText.match(re)
				i = -1;
				if (m != null){
					i = postText.indexOf(m[0]);
				}
			}
			if (postText.length > 0){
				postTextP.appendChild(document.createTextNode(postText));
			}
			linkifyElement(postTextP, {
				ignoreTags: ['script', 'a'],
				nl2br: true
			});
			post.appendChild(postTextP);
		}
		// Add post
		var before = 0;
		for (var i = 0; i < postIds.length; i++){
			if (postIds[i] > before && postObj.postId > postIds[i]){
				before = postIds[i];
			}
		}
		var postContainer = document.getElementById('postcontainer');
		if (before <= 0){
			postContainer.appendChild(post);
		} else {
			postContainer.insertBefore(post, document.getElementById('post'+before));
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
	if (jump){
		window.location.hash = '#post'+postObj.postId;
	}
}

function imageError(){
	this.onerror = null;
	this.src = 'img/broken.jpg';
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
					console.log('There was an error 400');
					//TODO alert('There was an error 400');
				} else {
					console.log('something else other than 200 was returned');
					//TODO alert('something else other than 200 was returned');
				}
				impatientClick();
			}
			buttonTimedDisable(makePostButton, 'Post', posting_delay);
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
		getLatestPost();
	} else {
		getPost(highest_id+1);
	}
	buttonTimedDisable(impatient, 'Impatient', button_delay);
}

// Load older posts
function ancientClick(){
	var ancient = document.getElementById('ancient');
	ancient.disabled = true;
	for (var i = 1; i <= bulk_load_amount; i++){
		getPost(lowest_id-i);
	}
	buttonTimedDisable(ancient, 'Ancient', button_delay);
}

function buttonTimedDisable(butt, initText, seconds, repeat){
	butt.disabled = true;
	if (repeat == true){
		//butt.innerText = initText;
	}
	if (seconds <= 0){
		butt.disabled = false;
	} else {
		//butt.innerText += ' '+seconds+'...';
		setTimeout(function(){
			buttonTimedDisable(butt, initText, seconds-1, true);
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
	if (postImgSrc == ''){
		previewImg.className = 'hidden';
	} else {
		previewImg.className = 'preview';
		previewImg.src = postImgSrc;
		previewImg.onerror = imageError;
	}
}

/* Themes */
var themes = ['', 'Native', 'Amber', 'Cyaneila'];

function initThemes(){
	var themeSelect = document.getElementById('themeSelect');
	for (var i = 0; i < themes.length; i++){
		var opt = document.createElement('option');
		opt.innerText = themes[i];
		opt.value = themes[i];
		themeSelect.appendChild(opt);
	}
	// Randomly pick a theme on load
	themeSelect.selectedIndex = Math.floor(Math.random() * themes.length);
	toggleTheme();
}

function toggleTheme(){
	var themeSelect = document.getElementById('themeSelect');
	var theme = themeSelect.options[themeSelect.selectedIndex].value;
	document.documentElement.className = theme;
	document.getElementById('themeCss').href = 'css/' + theme.toLowerCase() + '.css';
}

/* Init */
function init(){
	// Set up themes
	initThemes();
	document.getElementById('themeSelect').onchange = toggleTheme;
	// Set up buttons
	document.getElementById('impatient').onclick = impatientClick;
	document.getElementById('ancient').onclick = ancientClick;
	document.getElementById('makePost').onclick = makePost;
	document.getElementById('postImg').onchange = previewImage;
	document.getElementById('postImg').onpaste = function(){
		setTimeout(previewImage, 5);
	};

	// Initial load
	impatientClick();
	// Resolve hash
	var hash = window.location.hash.split('post');
	if (hash.length > 0){
		getPost(hash[1]);
	}
	// Auto refresh
	setInterval(impatientClick, auto_refresh_delay);
}
init();

/* Ads */
function adBlockDetected() {
	document.getElementById('adBlockPlea').className = '';
}

if (typeof blockAdBlock === 'undefined') {
	adBlockDetected();
} else {
	blockAdBlock.onDetected(adBlockDetected);
}
