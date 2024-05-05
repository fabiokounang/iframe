function getAllUrlParams(url) {
  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  // we'll store the parameters here
  var obj = {};
  // if query string exists
  if (queryString) {
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];
    // split our query string into its component parts
    var arr = queryString.split('&');
    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');
      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
      // (optional) keep case consistent
      // paramName = paramName.toLowerCase();
      // if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {
        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];
        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
}

// QUERY SELECTOR
const btn = document.querySelector(".fade");
const btnGenerate = document.querySelector('#generate');
btnGenerate.style.marginTop = '25px';
const form = document.querySelector('.form');
const wrapperQr = document.querySelector("#container-qr");
const username = document.getElementById('username');
const nominal = document.getElementById('nominal');
const qrContainer = document.querySelector('div#qr');
const canvasButtonContainer = document.querySelector('div#canvascontainer #btn-canvas');
const hint = document.querySelector('#hint');
const containerForm = document.querySelector('#container-form');
const queryParameter = getAllUrlParams();
const tokoData = queryParameter.data ? JSON.parse(atob(queryParameter.data)) : null;
const bonusselect = document.getElementById('bonus');
let bgColor = tokoData.bgcolor;
let borderColor = tokoData.bordercolor;
let fontColor = tokoData.fontcolor;
const min = tokoData.min || 10000;
const max = tokoData.max || 10000000;
let fadeState = true;


function replaceDefaultStyling() {
  const form = document.querySelector("div.form");
  const input = document.querySelector("input");
  const button = document.querySelector("button");
  const label = document.querySelectorAll("label");
  form.style.backgroundColor = bgColor;
  form.style.borderColor = borderColor;
  input.style.color = fontColor;
  label.forEach((el) => {
    el.style.color = fontColor;
  });
  button.style.color = fontColor;
}
replaceDefaultStyling();

async function onGenerateQr() {
  try {
    const regexNumber = new RegExp('^[0-9]+$');

    // Chart google
    const aTag = document.querySelector('div#container-qr #qr a:nth-child(1)');
    const aTag2 = document.querySelector('div#container-qr #qr a:nth-child(2)');
    const btnCloseIn = document.querySelector('div#container-qr #qr button');
    if (aTag) qrContainer.removeChild(aTag);
    if (aTag2) qrContainer.removeChild(aTag2);
    if (btnCloseIn) qrContainer.removeChild(btnCloseIn);

    // Alternatif canvas
    const btnCloseInCanvas = document.querySelector('div#canvascontainer #btn-canvas a');
    const canvasQr = document.querySelector('div#canvascontainer canvas');
    if (btnCloseInCanvas) canvasButtonContainer.innerHTML = '';
    if (canvasQr) {
      canvasQr.width = 0;
      canvasQr.height = 0;
    }

    // validasi
    if (!username.value) {
      alert('User id wajib diisi');
      return;
    }

    if (!nominal.value.trim()) {
      alert('Nominal wajib diisi');
      return;
    }

    if (!regexNumber.test(nominal.value.trim())) {
      alert('Nominal tidak valid (hanya angka)');
      return;
    }

    if (nominal.value.trim() <= 0) {
      alert('Nominal tidak valid');
      return;
    }

    if (nominal.value.trim() < min) {
      alert('Nominal minimal ' + min);
      return;
    }

    if (nominal.value.trim() > max) {
      alert('Nominal maksimal ' + max);
      return;
    }

    btnGenerate.disabled = true;
    btnGenerate.style.opacity = '0.9';
    btnGenerate.style.pointerEvents = 'none';
    btnGenerate.innerText = 'Loading...';

    var bonusvalue = bonusselect.options[bonusselect.selectedIndex].value;

    const reqData = {
      username: username.value.toLowerCase(),
      amount: nominal.value.trim(),
      uuid: tokoData.uuid,
      bonus: bonusvalue
    }
    const response = await fetch('https://qris.otomatis.vip/api/generate', {
      method: 'POST',
      headers: {
        Accept: 'application.json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqData)
    });
    const result = await response.json();

    btnGenerate.disabled = false;
    btnGenerate.style.opacity = '1';
    btnGenerate.style.pointerEvents = 'auto';
    btnGenerate.innerText = 'Tampilkan QR';

    if(result.reload) parent.location.reload();

    if (!result.status) {
      alert(result.error || 'Gagal generate QR, silahkan coba lagi');
      return;
    }

    try {
      const qrData = result.data;
      const canvas = document.getElementById('canvasqr');
      canvas.style.margin = 'auto';
      canvas.style.textAlign = 'center';
      canvas.style.maxWidth = '300px';
      canvas.style.width = '100%';
      const r = new QRious({element: canvas, value: qrData, size: 250});
      const imgUrl = r.toDataURL();
      const aImg = document.createElement('a');
      const aDownload = document.createElement('a');
      aImg.download = "QR";
      aImg.href = imgUrl;
      const divBtnCanvas = document.getElementById('btn-canvas');
      divBtnCanvas.appendChild(aImg);
      const img = document.createElement('img');
      aImg.appendChild(img);
      aDownload.href = await getBase64FromUrl(imgUrl);
      aDownload.download = 'QR';
      aDownload.target = '_blank';
      aDownload.textContent = 'Download QR';
      aDownload.classList.add('download');
      divBtnCanvas.append(aDownload);
    } catch (e) { // chart google api
      const img = document.createElement('img');
      // const url = 'https://chart.googleapis.com';
      const url = 'https://chart.googleapis.com/chart?chs=350x350&chld=Q|0&cht=qr&chl=';
      await fetch(url);
      const imgUrl = url + result.data;
      img.src = imgUrl;
      const aImg = document.createElement('a');
      const aDownload = document.createElement('a');
      const btnClose = document.createElement('button');
      btnClose.style.marginTop = '1rem';
      aImg.download = "QR";
      aImg.href = imgUrl;
      qrContainer.appendChild(aImg);
      aImg.appendChild(img);
      aDownload.href = await getBase64FromUrl(imgUrl.replace('350x350', '350x350'));
      aDownload.download = 'QR';
      aDownload.target = '_blank';
      aDownload.textContent = 'Download QR';
      aDownload.classList.add('download');
      qrContainer.append(aDownload);

      btnClose.textContent = 'Reset QR';
      btnClose.style.height = '35px';
      btnClose.classList.add('submit');
      btnClose.onclick = function (event) {
        containerForm.style.display = 'block';
        qrContainer.removeChild(aImg);
        qrContainer.removeChild(aDownload);
        qrContainer.removeChild(btnClose);
      }

      qrContainer.append(btnClose);
    }
    
    var height = Math.max( body.scrollHeight, body.offsetHeight,  html.clientHeight, html.scrollHeight, html.offsetHeight );
    parent.postMessage('{"height":'+height+'}', "*");
    parent.postMessage("myevent", "*");
    if (window.opener) window.opener.postMessage('{"height":'+height+'}', "*");
  } catch (e) {
    console.log(e)
    alert('Something went wrong ' + e.message);
  }
}

function onCopy() {
  const text = document.getElementById('charge_tx_id').innerText;
  const elem = document.createElement("textarea");
  document.body.appendChild(elem);
  elem.value = text;
  elem.select();
  document.execCommand("copy");
  document.body.removeChild(elem);
  alert('Copied !');
}

async function getBase64FromUrl(url) {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    }
  });
}

function generateQrisAPI() {
  const imgTag = document.querySelector('div#qr img');
  if (imgTag) qrContainer.removeChild(imgTag);
  if (!username.value || !nominal.value.trim()) alert('User ID / Nomor Hp dan nominal tidak valid');
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*&]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

function displayMessage(event) {
  let reqData = null;
  if (typeof event === 'string') {
    reqData = JSON.parse(event);
  } else {
    if (typeof event.data === 'string') {
      reqData = JSON.parse(event.data);
    }
  }
  if(reqData) {
    if (reqData.username) {
      username.value = reqData.username;
      username.style.opacity = '0.5';
      username.style.pointerEvents = 'none';
    }
  
    if (reqData.bgColor) bgColor = reqData.bgColor;
    if (reqData.borderColor) borderColor = reqData.borderColor;
    if (reqData.fontColor) fontColor = reqData.fontColor;
    if (reqData.bonus) {
      document.getElementById('divbonus').style.display='block';
      var bonus = document.getElementById('bonus');
      var newOption = null;
      for (const [key, value] of Object.entries(reqData.bonus)) {
        newOption = new Option(value,key);
        bonus.add(newOption,undefined);
      }
    }
    if (reqData.hasOwnProperty("judul")) {
      if(reqData.judul!='') document.getElementById('judul').innerHTML = reqData.judul;
      else document.getElementById('judul').style.display='none';
    }
    replaceDefaultStyling();
  }
}

function thousandSeparator() {
  if (nominal.value.trim()) hint.textContent = 'Hint ' + addCommas(removeNonNumeric(nominal.value.trim()));
  else hint.textContent = '';
}

const addCommas = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const removeNonNumeric = (num) => num.toString().replace(/[^0-9]/g, "");

if (window.addEventListener) window.addEventListener("message", displayMessage);
else window.attachEvent("onmessage", displayMessage);
if(queryParameter.msg) displayMessage(atob(queryParameter.msg));