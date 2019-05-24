var SERVER_URL = "http://api.mtit.net:3000/";
var IMAGE_URL = SERVER_URL+"video/";
const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF"); //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412'); //十六位十六进制数作为密钥偏移量

/**
 * 解密方法
 * @param {String} word 待解密的内容
 */
var Decrypt = function(word) {
	let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
	let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	let decrypt = CryptoJS.AES.decrypt(srcs, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
	return decryptedStr.toString();
}

/**
 * 加密方法
 * @param {String} word 待加密的内容
 */
var Encrypt = function(word) {
	let srcs = CryptoJS.enc.Utf8.parse(word);
	let encrypted = CryptoJS.AES.encrypt(srcs, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	return encrypted.ciphertext.toString().toUpperCase();
}

var doLogin = function() {
	var usermail = document.getElementById('usermail').value;
	var password = document.getElementById('password').value;
	var captcha = document.getElementById('captcha').value;
	if (usermail == "" || password == "" || captcha == "") {
		mui.alert('请填写完整的登录信息');
		return;
	}
	password = CryptoJS.MD5(password).toString();
	plus.nativeUI.showWaiting("登录中...");
	mui.ajax(SERVER_URL + "User/Login", {
		data: {
			usermail: usermail,
			password: password,
			captcha: captcha
		},
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			plus.nativeUI.closeWaiting();
			data = JSON.parse(Decrypt(data))
			if (data.code == 0) {
				mui.alert("登陆失败，" + data.msg);
			} else {
				mui.alert(data.msg,function(){
					plus.webview.currentWebview().close();
				});
			}
		},
		error: function(xhr, type, errorThrown) {
			plus.nativeUI.closeWaiting();
			if (type == "timeout") {
				mui.alert('网络连接超时！');
			} else {
				mui.alert('网络错误。类型:' + type);
			}
		}
	});
}

var goReg = function() {
	mui.openWindow({
		url: "Register.html",
		id: "Register"
	});
}
var Close = function() {
	mui.back();
}
var doReg = function() {

	var usermail = document.getElementById('usermail').value;
	var nickname = document.getElementById('nickname').value;
	var password = document.getElementById('password').value;
	var passwordconfirm = document.getElementById('passwordconfirm').value;
	var captcha = document.getElementById('captcha').value;
	//检查两次密码输入是否一致
	if (password != passwordconfirm) {
		mui.alert('两次密码不一致', function() {
			document.getElementById('password').focus();
		});
		return;
	}
	password = CryptoJS.MD5(password).toString();
	plus.nativeUI.showWaiting("注册中...");
	mui.ajax(SERVER_URL + "User/Register", {
		data: {
			usermail: usermail,
			nickname: nickname,
			password: password,
			captcha: captcha
		},
		type: 'post',
		timeout: 5000,
		success: function(data) {
			plus.nativeUI.closeWaiting();
			data = JSON.parse(Decrypt(data))
			if (data.code == 0) {
				mui.alert("注册失败，" + data.msg);
			} else {
				mui.alert("注册成功，" + data.msg);
			}
		},
		error: function(xhr, type, errorThrown) {
			plus.nativeUI.closeWaiting();
			if (type == "timeout") {
				mui.alert('网络连接超时！');
			} else {
				mui.alert('网络错误。类型:' + type);
			}
		}
	});
}

var UpVideo = function(){
	if(sessionStorage.getItem('userid')==""){
		mui.openWindow({
			url:"html/Login.html",
			id:"Login"
		});
		return;
	}
	plus.gallery.pick(function(path) {
		plus.nativeUI.showWaiting('视频上传中...');
		var task = plus.uploader.createUpload(SERVER_URL+"Upload", {
				method: "POST",
				blocksize: 204800,
				priority: 100
			},
			function(t, status) {
				plus.nativeUI.closeWaiting();
				if (status == 200) {
					var data = t.responseText;
					data = JSON.parse(Decrypt(data));
					mui.openWindow({
						url: "html/Upload.html",
						id: "Upload",
						extras: {
							Video_Hash: data.hash
						},
						waiting: {
							autoShow: true,
							title: '正在加载...',
						}
					});
				} else {
					alert("Upload failed: " + status);
				}
			}
		);
		task.addFile(path, {key: "video"});
		//task.addEventListener( "statechanged", onStateChanged, false );
		task.start();
	}, function(e) {
		console.log("取消上传");
	}, {
		filter: "video"
	});
}

var Watch = function(id) {
				mui.openWindow({
					url: "Watch.html",
					id: "Watch",
					extras: {
						Video_Hash: id
					},
					waiting: {
						autoShow: true,
						title: '正在加载...',
					}
				})
			}