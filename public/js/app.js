window.onload = function(){

}

function readSingleFile() {
	var image = document.querySelector('img');
  	var file  = document.querySelector('input[type=file]').files[0];
	// console.log(file.size);
	var reader = new FileReader();
	reader.onload = function() {
		if (file.size < 100000) {
			image.src = reader.result;
		} else {
			alert ("File size > 100Kb");
		}
	};
	reader.readAsDataURL(file);
}

function showAddPersonPop() {
	var personmodal = document.getElementById('personpopup');
	document.forms.addperson.reset();
	document.querySelector('img').src = "images/no_ava.png"
	personmodal.style.display = "block";
	var personPopCloseBtn = personmodal.getElementsByClassName("close")[0];
	personPopCloseBtn.onclick = function() {
		personmodal.style.display = "none";
	}
}

function showAddGroupPop() {
	var groupmodal = document.getElementById('grouppopup');
	document.forms.addgroup.reset();
	groupmodal.style.display = "block";
	var groupPopCloseBtn = groupmodal.getElementsByClassName("close")[0];
	groupPopCloseBtn.onclick = function() {
		groupmodal.style.display = "none";
	}
}

function addPerson(){
	var formData = new FormData(document.forms.addperson);
	for (var pair of formData.entries()){
		console.log(pair[0]+ ', '+ pair[1]);
	}
	console.log('ava:' + formData.get('ava'));
	var reqDataObj = {
		method: "POST",
		uri: "/user/add",
		/*objData: {name: formData.get('name'),
			secondname: formData.get('secondname'),
			age:        formData.get('age'),
			gender:     formData.get('gender'),
			groupid:    formData.get('groupid'),
			email:      formData.get('email'),
			login:      formData.get('login'),
			pwd:        formData.get('pwd'),
			roles:      formData.get('roles')
		},*/
		objData: formData,
		action: "Add"
	};
	sendFormData(reqDataObj, function(res){
	    document.getElementById('personpopup').style.display = "none";
		// console.log("res: " + res);
		addRow('userTable', res);
	});
}


function showUpdatePersonPop(updateBtn) {
	var personUpdatemodal = document.getElementById('personupdatepopup');
	document.forms.addperson.reset();
	personUpdatemodal.style.display = "block";
	var personPopCloseBtn = personUpdatemodal.getElementsByClassName("close")[0];
	personPopCloseBtn.onclick = function() {
		personUpdatemodal.style.display = "none";
	}
	var userId = updateBtn.dataset.userid;
	console.log(updateBtn.dataset);
	var personRow = document.getElementById(userId);
	personUpdatemodal.querySelector('input[name="userid"]').value = userId;
	personUpdatemodal.querySelector('input[name="name"]').value = JSON.parse(personRow.dataset.userdata).name;
	personUpdatemodal.querySelector('input[name="secondname"]').value = JSON.parse(personRow.dataset.userdata).secondname;
	personUpdatemodal.querySelector('input[name="age"]').value = JSON.parse(personRow.dataset.userdata).age;
	personUpdatemodal.querySelector('select[name="gender"]').value = JSON.parse(personRow.dataset.userdata).gender;
	groups.forEach(function(group){
		if (group.id == JSON.parse(personRow.dataset.userdata).groupid) {
			personUpdatemodal.querySelector('select[name="groupid"]').value = group.id;
		}
	});
	personUpdatemodal.querySelector('input[name="email"]').value = JSON.parse(personRow.dataset.userdata).email;
	personUpdatemodal.querySelector('input[name="login"]').value = JSON.parse(personRow.dataset.userdata).login;
	// personUpdatemodal.querySelector('input[name="pwd"]').value = JSON.parse(personRow.dataset.userdata).pwd;
	personUpdatemodal.querySelector('select[name="roles"]').value = JSON.parse(personRow.dataset.userdata).role;
}


function updatePerson(){
	var personUpdatemodal = document.getElementById('personupdatepopup');
	personUpdatemodal.querySelector('select[name="groupid"]').disabled = false;

	var formData = new FormData(document.forms.updateperson);
	var userId = formData.get('userid');
	// console.log(userId);
	var reqDataObj = {
		method: "PUT",
		uri: "/update/" + userId,
		objData: {name: formData.get('name'),
			secondname: formData.get('secondname'),
			age: formData.get('age'),
			gender: formData.get('gender'),
			groupid: formData.get('groupid'),
			email: formData.get('email'),
			login: formData.get('login'),
			// pwd: formData.get('pwd'),
			role: formData.get('roles')
		},
		action: "Update"
	};
	sendAjax(reqDataObj, function(res){
		document.getElementById('personupdatepopup').style.display = "none";
		// console.log(res);
		var personRow = document.getElementById(res.id);
		personRow.childNodes[1].innerHTML = res.name;
		personRow.childNodes[2].innerHTML = res.secondname;
		personRow.childNodes[3].innerHTML = res.age;
		var genderClass;
		if (res.gender == 'male') {
			res.gender = "&#xf183;";
			genderClass = "male";
		} else if (res.gender == 'female') {
			res.gender = "&#xf182;";
			genderClass = "female";
		} else {
			res.gender = "-";
		}
		genderClass += " customfont";
		personRow.childNodes[4].innerHTML = res.gender;
		personRow.childNodes[4].className = genderClass;
		personRow.childNodes[5].innerHTML = res.groupid;
		personRow.childNodes[6].innerHTML = res.email.substr(0, res.email.indexOf("@")+1);
		personRow.childNodes[6].title = res.email;
		personRow.childNodes[7].innerHTML = res.login;
		// personRow.childNodes[8].innerHTML = res.pwd;
		personRow.childNodes[8].innerHTML = res.role;
		personRow.childNodes[9].innerHTML = formatDate(res.created);
		personRow.childNodes[10].innerHTML = res.active;
	});
	// href='/update/#{item._id}?_method=PUT'
}


function deletePerson(rowId){
	var reqDataObj = {
		method: "DELETE",
		uri: "/delete/" + rowId,
		action: "Delete"
	};
	sendAjax(reqDataObj, function(res){
		deleteRow(rowId);
		// console.log(res);
	});
}


function addGroup(){
	var formData = new FormData(document.forms.addgroup);
	var reqDataObj = {
		method: "POST",
		uri: "/addgroup",
		objData: {
			name: formData.get('groupname')
		},
		action: "Add"
	};
	sendAjax(reqDataObj, function(res){
	    document.getElementById('grouppopup').style.display = "none";
	    // add created option to select group dropdown on User pop up
	    var select = document.getElementById("groupselect");
	    var option = document.createElement('option');
	    option.value = res.id;
	    option.innerHTML = res.name;
	    select.appendChild(option);
		// console.log("res: " + res);
	});
}


function sendFormData(reqDataObj, callback) {
	$.ajax({
		type: reqDataObj.method,
		url: reqDataObj.uri,
		data: (reqDataObj.objData) || null,
		processData: false, //prevent jQuery from automatically transforming the data into a query
		contentType: false,
		success: function(res) {
			callback (res);
			$.notify(reqDataObj.action + " success", {
				className: 'success',
  				globalPosition: 'top center'});
		},
		error: function(res) {
			console.log(res);
			$.notify(reqDataObj.action  + " error: " + JSON.parse(res).message, {
				className: "warn",
  				globalPosition: 'top center'});
		}
	});
}


function sendAjax(reqDataObj, callback) {
	console.log(reqDataObj.objData);
	$.ajax({
		type: reqDataObj.method,
		url: reqDataObj.uri,
		data: (reqDataObj.objData) || null,
		success: function(res) {
			callback (res);
			$.notify(reqDataObj.action + " success", {
				className: 'success',
  				globalPosition: 'top center'});
		},
		error: function(res) {
			console.log(res);
			$.notify(reqDataObj.action  + " error: " + JSON.parse(res).message, {
				className: "warn",
  				globalPosition: 'top center'});
		}
	});
}


function addRow(tableName, res) {
	var userTable = document.getElementById(tableName);
	var len = userTable.rows.length;
	var row = userTable.insertRow(len);
	row.insertCell(0).innerHTML = len;
	row.insertCell(1).innerHTML = res.name;
	row.insertCell(2).innerHTML = res.secondname;
	row.insertCell(3).innerHTML = res.age;
	// console.log(res.gender);
	if (res.gender == 'empty') res.gender = "-";
	row.insertCell(4).innerHTML = res.gender;
	row.insertCell(5).innerHTML = res.groupid;
	row.insertCell(6).innerHTML = res.email.substr(0, res.email.indexOf("@")+1);
	// row.insertCell(6).title = res.email;
	row.insertCell(7).innerHTML = res.login;
	row.insertCell(8).innerHTML = res.role;
	row.insertCell(9).innerHTML = res.created;
	row.insertCell(10).innerHTML = res.active;
	var updateBtn = '<button class="customfont" onclick="showUpdatePersonPop(this)" data-userid=' +res.id+ ' style="color: orange"> &#xe804; </button>';
	row.insertCell(11).innerHTML = updateBtn;
}


function deleteRow(rowid) {
    var row = document.getElementById(rowid);
    row.parentNode.removeChild(row);
}


function getPersonMarks(userId) {
	var reqDataObj = {
		method: "GET",
		uri: "/marks/user/" + userId,
		action: "Get"
	};
	sendAjax(reqDataObj, function(res) {
		// add row
		var userTable = document.getElementById("marksTable");
		var row = userTable.insertRow(1);
		row.insertCell(0).innerHTML = 1;
		row.insertCell(1).innerHTML = res.id;
		row.insertCell(2).innerHTML = res.name;
		row.insertCell(3).innerHTML = res.secondname;
		row.insertCell(4).innerHTML = res.group;
		row.insertCell(5).innerHTML = res.hw1;
		row.insertCell(6).innerHTML = res.hw2;
		row.insertCell(7).innerHTML = res.cw1;
		row.insertCell(8).innerHTML = res.cw2;
		row.insertCell(9).innerHTML = "no access";
		// console.log(res);
	});
}


function getGroupMarks() {
	var groupSelect = document.getElementsByName("groupid")[2];
	var value = groupSelect.value;
	var reqDataObj = {
		method: "GET",
		uri: "/marks/group/" + value,
		action: "Get"
	};
	sendAjax(reqDataObj, function(res) {
		// add row
		var userTable = document.getElementById("marksTable");
		var rowCount = userTable.rows.length;
		for (var i = rowCount; i > 1; i--) {
			userTable.deleteRow(i - 1);
		}
		for (var i = 0; i < res.length; i++) {
			var row = userTable.insertRow(i + 1);
			// console.log(res[i].userid);
			// if (res[i].id != null) row.id = res[i].userid;
			row.insertCell(0).innerHTML = i + 1;
			row.insertCell(1).innerHTML = res[i].id;
			row.insertCell(2).innerHTML = res[i].name;
			row.insertCell(3).innerHTML = res[i].secondname;
			row.insertCell(4).innerHTML = res[i].group;
			if (res[i].hw1 == null) res[i].hw1=0
			row.insertCell(5).innerHTML = '<div style="border: 1px solid #0B4C5F" contenteditable="true">'+ res[i].hw1 +'</div>';
			if (res[i].hw2 == null) res[i].hw2=0
			row.insertCell(6).innerHTML = '<div style="border: 1px solid #0B4C5F" contenteditable="true">'+ res[i].hw2 +'</div>';
			if (res[i].cw1 == null) res[i].cw1=0
			row.insertCell(7).innerHTML = '<div>'+ res[i].cw1 +'</div>';
			if (res[i].cw2 == null) res[i].cw2=0
			row.insertCell(8).innerHTML = '<div>'+ res[i].cw2 +'</div>';
			var updateBtn = '<button class="customfont" onclick="updateMarks(this)" data-userid= ' +res[i].userid + ' data-markid=' +res[i].id + ' style="color: green;"> &#xf14a;</button>';
			row.insertCell(9).innerHTML = updateBtn;
		}
	});
}


function updateMarks(updBtn){
	var row = updBtn.parentNode.parentNode;
	var markId = updBtn.dataset.markid;
	var userId = updBtn.dataset.userid;
	var hw1 = row.childNodes[5].textContent;
	var hw2 = row.childNodes[6].textContent;
	var cw1 = row.childNodes[7].textContent;
	var cw2 = row.childNodes[8].textContent;
	var uri = null;
	var method = null;
	var action = null;
	if (markId > 0) {
		uri = "/mark/" + markId;
		method = "PUT";
		action = "Update";
	} else {
		uri = "/mark";
		method = "POST";
		action = "Add";
	}
	var reqDataObj = {
		method: method,
		uri: uri,
		objData: {
			userid: userId,
			hw1: hw1,
			hw2: hw2,
			cw1: cw1,
			cw2: cw2
		},
		action: action
	};
	sendAjax(reqDataObj, function(res) {
		console.log(res);
	});
}

function formatDate(date) {
	var date = new Date(date)
    return ("0" + date.getDate()).slice(-2) + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" + date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
}